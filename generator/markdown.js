import {Marked, Lexer} from 'marked';
import {parse as parseYaml} from 'yaml';
import {normalizeKey} from './taxonomy.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const esc = escapeHtml;

// Âncoras legíveis em português: "Problemas comuns" → "problemas-comuns".
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

// Trechos compartilhados (<!-- incluir: nome -->) e variáveis ({{site.nome}}, {{item.zipNome}}) antes do Markdown.
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
  return {intro, sections, tokens};
}

// ---------- componentes (blocos ```nome com YAML) ----------
const str = max => value => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const pairs = (min, max) => value => Array.isArray(value) && value.length >= min && value.length <= max &&
  value.every(row => Array.isArray(row) && row.length === 2 && row.every(str(80)));
const shape = (fields, value) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).every(key => Object.hasOwn(fields, key)) &&
  Object.entries(fields).every(([key, [required, check]]) => value[key] === undefined ? !required : check(value[key]));
const bool = value => typeof value === 'boolean';
const SPECS = {
  fluxo: {hint: 'lista de 2 a 4 caixas com rotulo, texto, nota (opcional) e destaque: true (opcional)',
    check: data => Array.isArray(data) && data.length >= 2 && data.length <= 4 && data.every(node => shape({rotulo: [true, str(40)], texto: [true, str(80)], nota: [false, str(80)], destaque: [false, bool]}, node))},
  exemplos: {hint: 'lista de 1 a 6 exemplos com fonte, pergunta, citacao e resposta ou linhas (pares de texto)',
    check: data => Array.isArray(data) && data.length >= 1 && data.length <= 6 && data.every(example =>
      shape({fonte: [true, str(40)], pergunta: [true, str(200)], resposta: [false, str(400)], linhas: [false, pairs(1, 8)], ferramenta: [false, str(60)], citacao: [true, str(120)]}, example) &&
      (example.resposta || example.linhas))},
  requisitos: {hint: 'lista de itens com texto, nota (opcional) e opcional: true (opcional)',
    check: data => Array.isArray(data) && data.length >= 1 && data.length <= 12 && data.every(item => shape({texto: [true, str(120)], nota: [false, str(120)], opcional: [false, bool]}, item))},
  resultado: {hint: 'tipo (memo ou slide), titulo e, no memo, linhas com 2 a 6 pares de texto',
    check: data => shape({tipo: [true, value => ['memo', 'slide'].includes(value)], titulo: [true, str(60)], linhas: [false, pairs(2, 6)]}, data) && (data.tipo === 'slide' || data.linhas)},
  smartscreen: {hint: 'arquivo (nome do instalador) e legenda (opcional)',
    check: data => shape({arquivo: [true, str(80)], legenda: [false, str(160)]}, data)},
  prompt: {hint: 'o texto do prompt, sem cabeçalho', yaml: false, check: data => str(2000)(data)},
};
export const COMPONENTS = Object.keys(SPECS);

// Lê o conteúdo de um bloco. Devolve {data} ou {error} com a explicação para quem escreve.
export function parseComponent(lang, text) {
  const spec = SPECS[lang];
  let data = text.trim();
  if (spec.yaml !== false) {
    try { data = parseYaml(text); } catch (error) { return {error: `bloco ${lang}: erro de digitação (${error.message.split('\n')[0]}).`}; }
  }
  return spec.check(data) ? {data} : {error: `bloco ${lang}: ${spec.hint}.`};
}

// Percorre todos os tokens, inclusive dentro de listas e citações.
export function walkTokens(tokens, visit) {
  for (const token of tokens || []) {
    visit(token);
    if (token.tokens) walkTokens(token.tokens, visit);
    if (token.items) for (const item of token.items) walkTokens(item.tokens, visit);
  }
}

const ALERTS = {NOTE: 'nota', TIP: 'dica', IMPORTANT: 'importante', WARNING: 'atencao', CAUTION: 'cuidado'};

// Prévia de resultado de uma skill (memo ou slide), também usada nos cartões.
export function renderResult(data) {
  if (data.tipo === 'slide') return `<div class="resultado resultado-slide" aria-hidden="true"><p class="resultado-faixa">${esc(data.titulo)}</p>` +
    '<div class="resultado-corpo"><svg viewBox="0 0 70 70" class="rosca"><circle class="r1" cx="35" cy="35" r="24" stroke-dasharray="90 61"/>' +
    '<circle class="r2" cx="35" cy="35" r="24" stroke-dasharray="38 113" stroke-dashoffset="-90"/><circle class="r3" cx="35" cy="35" r="24" stroke-dasharray="23 128" stroke-dashoffset="-128"/></svg>' +
    '<div class="resultado-linhas"><span></span><span></span><span></span><span></span></div></div></div>';
  return `<div class="resultado resultado-memo"><p class="resultado-titulo">${esc(data.titulo)}</p><dl>${data.linhas.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></div>`;
}

// Renderizador do site. base prefixa links que começam com "/"; imageExists diz se o print já está em public/.
export function createRenderer({base, imageExists, pendingImages, nextId}) {
  const marked = new Marked({gfm: true});
  const local = href => typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
  const resolve = href => local(href) ? base + href.slice(1) : href;
  let codeCount = 0, listDepth = 0, plainLists = false;
  const inline = text => marked.parseInline(text);
  const components = {
    fluxo: nodes => `<ol class="fluxo" aria-label="Como funciona">${nodes.map((node, i) => `${i ? '<li class="fluxo-seta" aria-hidden="true"></li>' : ''}<li class="fluxo-no${node.destaque ? ' fluxo-destaque' : ''}"><span class="fluxo-rotulo">${esc(node.rotulo)}</span><span class="fluxo-texto">${esc(node.texto)}</span>${node.nota ? `<span class="fluxo-nota">${esc(node.nota)}</span>` : ''}</li>`).join('')}</ol>\n`,
    exemplos: list => `<div class="exemplos">${list.map(example => `<div class="exemplo"><span class="exemplo-fonte">${esc(example.fonte)}</span><p class="exemplo-pergunta">${esc(example.pergunta)}</p>` +
      // Na página vale a resposta em texto; as linhas (tabela) servem ao cartão da página inicial.
      `${example.ferramenta ? `<span class="exemplo-ferramenta">${esc(example.ferramenta)}</span>` : ''}${example.resposta ? `<p class="exemplo-resposta">${inline(example.resposta)}</p>` :
        `<dl class="exemplo-linhas">${example.linhas.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`}` +
      `<p class="exemplo-citacao">${esc(example.citacao)}</p></div>`).join('')}</div><p class="nota-ficticio">Exemplos com dados fictícios.</p>\n`,
    requisitos: list => `<ul class="requisitos">${list.map(item => `<li class="${item.opcional ? 'opcional' : 'necessario'}"><span class="req-texto">${inline(item.texto)}${item.opcional ? '<span class="visualmente-oculto"> (opcional)</span>' : ''}</span>${item.nota || item.opcional ? `<span class="req-nota">${esc([item.opcional && !/^opcional/i.test(item.nota || '') ? 'Opcional' : '', item.nota].filter(Boolean).join(' · '))}</span>` : ''}</li>`).join('')}</ul>\n`,
    resultado: data => `<figure class="resultado-quadro"><figcaption class="rotulo">Exemplo de resultado · dados fictícios</figcaption>${renderResult(data)}</figure>\n`,
    smartscreen: data => `<figure class="tela"><div class="smartscreen" role="img" aria-label="Réplica do aviso do Windows com o botão Executar assim mesmo em destaque">` +
      '<p class="smartscreen-titulo">O Windows protegeu o computador</p><p>O Microsoft Defender SmartScreen impediu que um aplicativo não reconhecido fosse iniciado.</p>' +
      `<p class="smartscreen-meta">Aplicativo: ${esc(data.arquivo)}<br>Fornecedor: Fornecedor desconhecido</p><div class="smartscreen-botoes"><span class="destaque">Executar assim mesmo</span><span>Não executar</span></div></div>` +
      `<figcaption>${esc(data.legenda || 'Réplica do aviso. Depois de clicar em “Mais informações”, aparece o botão destacado.')}</figcaption></figure>\n`,
    prompt: text => { const id = `prompt-${++codeCount}`; return `<div class="caixa-prompt"><q id="${id}">${esc(text)}</q><button type="button" class="botao botao-linha botao-pequeno" data-copiar="${id}">Copiar</button></div>\n`; },
  };
  marked.use({renderer: {
    heading({tokens, depth}) {
      const html = this.parser.parseInline(tokens);
      const id = nextId(this.parser.parseInline(tokens, this.parser.textRenderer));
      return `<h${depth} id="${id}">${html}</h${depth}>\n`;
    },
    link({href, title, tokens}) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      return `<a href="${esc(resolve(href))}"${title ? ` title="${esc(title)}"` : ''}${external ? ' rel="noopener"' : ''}>${text}</a>`;
    },
    image({href, title, text}) {
      const alt = text || '';
      if (local(href) && !imageExists(href)) {
        pendingImages.push({path: href.slice(1), alt});
        return `<figure class="tela"><div class="tela-vaga">Imagem: ${esc(alt)}</div><figcaption>Print a ser incluído · <code>site/public/${esc(href.slice(1))}</code></figcaption></figure>`;
      }
      return `<figure class="tela"><img src="${esc(resolve(href))}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(title || alt)}</figcaption></figure>`;
    },
    code({text, lang}) {
      if (Object.hasOwn(components, lang)) {
        const {data, error} = parseComponent(lang, text);
        if (error) throw new Error(error);
        return components[lang](data);
      }
      const id = `codigo-${++codeCount}`;
      return `<div class="codigo"><pre id="${id}"><code>${esc(text)}</code></pre>` +
        `<button type="button" class="botao-copiar" data-copiar="${id}">Copiar</button></div>\n`;
    },
    blockquote({tokens}) {
      const body = this.parser.parse(tokens);
      const alert = body.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);
      if (!alert) return `<blockquote>\n${body}</blockquote>\n`;
      const rest = body.slice(alert[0].length).replace(/^<\/p>\s*/, '');
      return `<div class="aviso aviso-${ALERTS[alert[1]]}">${rest.startsWith('<') ? '' : '<p>'}${rest}</div>\n`;
    },
    // Listas numeradas viram o passo a passo em linha do tempo; "**Título.** texto" vira o título do passo.
    list(token) {
      if (!token.ordered || listDepth > 0 || plainLists) return false;
      listDepth++;
      const items = token.items.map(item => {
        const [first, ...rest] = item.tokens;
        const parts = first && ['text', 'paragraph'].includes(first.type) ? first.tokens || [] : [];
        if (parts[0]?.type !== 'strong') return `<li class="passo"><div class="passo-corpo">${this.parser.parse(item.tokens)}</div></li>`;
        const after = this.parser.parseInline(parts.slice(1)).trim();
        // O ponto final do título ("**Baixe o instalador.**") ajuda a ler o Markdown, mas sai na tela.
        return `<li class="passo"><div class="passo-corpo"><p class="passo-titulo">${this.parser.parseInline(parts[0].tokens).replace(/\.\s*$/, '')}</p>` +
          `${after ? `<p>${after}</p>` : ''}${this.parser.parse(rest)}</div></li>`;
      });
      listDepth--;
      return `<ol class="passos">${items.join('')}</ol>\n`;
    },
  }});
  // Tabelas largas rolam sozinhas no celular; figuras não ficam dentro de <p>.
  const finish = html => html.replace(/<p>\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/g, '$1')
    .replace(/<table>/g, '<div class="tabela"><table>').replace(/<\/table>/g, '</table></div>');
  return {
    tokens: (tokens, {plain = false} = {}) => { plainLists = plain; try { return finish(marked.parser(tokens)); } finally { plainLists = false; } },
    source: source => finish(marked.parse(source)),
    inline,
  };
}
