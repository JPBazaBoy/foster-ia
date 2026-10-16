import {Marked, Lexer} from 'marked';
import {normalizeKey} from './taxonomy.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

// Âncoras legíveis em português: "Perguntas frequentes" → "perguntas-frequentes".
export function slugify(text) {
  return String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'secao';
}

// Uma página = um conjunto de ids. Repetições ganham sufixo (-2, -3), como no GitHub.
export function createIdSet() {
  const used = new Set();
  return text => {
    const base = slugify(text);
    let id = base, n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };
}

const INCLUDE = /^<!--\s*incluir:\s*([a-z0-9-]+)\s*-->[ \t]*$/gm;
const VARIABLE = /\{\{\s*(site|item)\.([a-zA-Z]+)\s*\}\}/g;

// Trechos compartilhados (<!-- incluir: nome -->) e variáveis ({{site.nome}}, {{item.zip}}) antes do Markdown.
export function expandSource(source, {snippets, variables, file, problems}) {
  const expand = (text, depth, chain) => text.replace(INCLUDE, (_, name) => {
    if (!snippets.has(name)) { problems.push({file, message: `O trecho "${name}" não existe em conteudo/trechos/.`}); return ''; }
    if (depth >= 3 || chain.includes(name)) { problems.push({file, message: `O trecho "${name}" inclui a si mesmo ou passa de 3 níveis.`}); return ''; }
    return expand(snippets.get(name), depth + 1, [...chain, name]);
  });
  return expand(source, 0, []).replace(VARIABLE, (match, scope, key) => {
    const value = variables[scope]?.[key];
    if (value === undefined || value === null) { problems.push({file, message: `A variável ${match} não existe.`}); return match; }
    return String(value);
  });
}

// Divide em introdução, seções (##) e subseções (###), preservando o texto original de cada parte.
export function splitSections(source) {
  const tokens = new Lexer({gfm: true}).lex(source);
  const links = tokens.links;
  const list = items => Object.assign(items, {links});
  const intro = list([]), sections = [];
  let section = null, sub = null;
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 2) {
      section = {title: token.text, key: normalizeKey(token.text), tokens: list([]), intro: list([]), subsections: []};
      sub = null;
      sections.push(section);
    } else if (token.type === 'heading' && token.depth === 3 && section) {
      sub = {title: token.text, tokens: list([])};
      section.subsections.push(sub);
      section.tokens.push(token);
    } else if (section) {
      section.tokens.push(token);
      (sub ? sub.tokens : section.intro).push(token);
    } else intro.push(token);
  }
  const raw = items => items.map(token => token.raw).join('').trim();
  for (const s of sections) { s.raw = raw(s.tokens); for (const x of s.subsections) x.raw = raw(x.tokens); }
  return {intro, sections, raw};
}

const ALERTS = {NOTE: ['nota', 'Observação'], TIP: ['dica', 'Dica'], IMPORTANT: ['importante', 'Importante'], WARNING: ['atencao', 'Atenção'], CAUTION: ['cuidado', 'Cuidado']};

// Renderizador do site. base prefixa links que começam com "/"; images informa se o arquivo existe em public/.
export function createRenderer({base, imageExists, pendingImages, nextId}) {
  const marked = new Marked({gfm: true});
  const local = href => typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
  const resolve = href => local(href) ? base + href.slice(1) : href;
  let codeCount = 0;
  marked.use({renderer: {
    heading({tokens, depth}) {
      const html = this.parser.parseInline(tokens);
      const id = nextId(this.parser.parseInline(tokens, this.parser.textRenderer));
      return `<h${depth} id="${id}">${html}</h${depth}>\n`;
    },
    link({href, title, tokens}) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      return `<a href="${escapeHtml(resolve(href))}"${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' rel="noopener"' : ''}>${text}</a>`;
    },
    image({href, title, text}) {
      const alt = text || '';
      if (local(href) && !imageExists(href)) {
        pendingImages.push({path: href.slice(1), alt});
        return `<figure class="print-pendente" role="img" aria-label="Imagem em preparação: ${escapeHtml(alt)}">` +
          `<span class="print-pendente-rotulo">Print pendente</span><span class="print-pendente-texto">${escapeHtml(alt)}</span>` +
          `<code class="print-pendente-caminho">site/public/${escapeHtml(href.slice(1))}</code></figure>`;
      }
      return `<figure class="figura"><img src="${escapeHtml(resolve(href))}" alt="${escapeHtml(alt)}" loading="lazy">` +
        `${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''}</figure>`;
    },
    code({text}) {
      const id = `codigo-${++codeCount}`;
      return `<div class="codigo"><pre id="${id}"><code>${escapeHtml(text)}</code></pre>` +
        `<button type="button" class="botao-copiar" data-copiar="${id}">Copiar</button></div>\n`;
    },
    blockquote({tokens}) {
      const body = this.parser.parse(tokens);
      const alert = body.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);
      if (!alert) return `<blockquote>\n${body}</blockquote>\n`;
      const [kind, title] = ALERTS[alert[1]];
      const rest = body.slice(alert[0].length).replace(/^<\/p>\s*/, '');
      return `<div class="aviso aviso-${kind}"><p class="aviso-titulo">${title}</p>${rest.startsWith('<') ? '' : '<p>'}${rest}</div>\n`;
    },
  }});
  // Figuras não podem ficar dentro de <p>; tabelas largas rolam sozinhas no celular.
  const finish = html => html.replace(/<p>\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/g, '$1')
    .replace(/<table>/g, '<div class="tabela"><table>').replace(/<\/table>/g, '</table></div>');
  return {
    tokens: tokens => finish(marked.parser(tokens)),
    source: source => finish(marked.parse(source)),
    inline: source => marked.parseInline(source),
  };
}
