import {TYPES, PLATFORMS, ACCORDION_SECTIONS, HIDDEN_SECTIONS} from './taxonomy.js';
import {escapeHtml as esc, createIdSet, createRenderer} from './markdown.js';
import {icon} from './icons.js';
import {formatSize, formatDate, formatDay} from './feed.js';

const normalize = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
const NAV = [['catalogo', 'catalogo/', 'Catálogo'], ['fostermcp', null, 'FosterMCP'], ['prompts', 'prompts/', 'Prompts'], ['tutoriais', 'tutoriais/', 'Tutoriais'], ['ajuda', 'ajuda/', 'Ajuda']];

// Monta todas as páginas em memória: {files: Map(caminho → conteúdo), pendingImages}.
export function renderSite(site, {imageExists, assets}) {
  const {config, feed} = site;
  const base = config.base;
  const href = path => base + String(path).replace(/^\//, '');
  const pendingImages = [];
  const files = new Map();
  const appUrl = config.fostermcp.pagina;
  const nav = NAV.map(([key, path, label]) => [key, path ?? appUrl, label]);
  const newPage = () => { const nextId = createIdSet(); return {nextId, md: createRenderer({base, imageExists, pendingImages, nextId})}; };
  const platformLabels = keys => keys.map(key => PLATFORMS[key].label);
  const contact = config.contato.link ? `<a href="${esc(config.contato.link)}">${esc(config.contato.texto)}</a>` : esc(config.contato.texto);

  function layout({title, description, current = null, body, path}) {
    const fullTitle = title ? `${title} · ${config.nome}` : `${config.nome}: ${config.descricao}`;
    const links = nav.map(([key, path, label]) => `<li><a href="${href(path)}"${key === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
    const search = id => `<form class="busca-topo" action="${href('catalogo/')}" method="get" role="search">` +
      `<label class="visualmente-oculto" for="${id}">Buscar na central</label>` +
      `<input id="${id}" name="q" type="search" placeholder="Buscar" autocomplete="off">` +
      `<button type="submit" class="botao-icone" aria-label="Buscar">${icon('search')}</button></form>`;
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
<meta name="referrer" content="no-referrer">
${config.indexar ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<meta name="color-scheme" content="light dark">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || config.descricao)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(config.nome)}">
<meta property="og:title" content="${esc(title || config.nome)}">
<meta property="og:description" content="${esc(description || config.descricao)}">
<meta property="og:url" content="${esc(new URL(path, config.endereco).href)}">
<link rel="icon" href="${href('favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${href(`assets/site.css?v=${assets.version}`)}">
<script src="${href(`assets/tema.js?v=${assets.version}`)}"></script>
<script src="${href(`assets/site.js?v=${assets.version}`)}" defer></script>
${site.dev ? `<script src="${href('assets/recarregar.js')}" defer></script>\n` : ''}</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="container topo-linha">
    <a class="marca" href="${href('')}"><span class="marca-simbolo" aria-hidden="true">${esc(config.marca.sigla)}</span><span class="marca-nome">${esc(config.nome)}</span></a>
    <nav class="navegacao" aria-label="Principal"><ul>${links}</ul></nav>
    ${search('busca-topo')}
    <button type="button" class="botao-icone botao-tema" data-tema hidden aria-label="Usar tema escuro">${icon('moon')}${icon('sun')}</button>
    <details class="menu-celular">
      <summary class="botao-icone" aria-label="Abrir o menu">${icon('menu')}</summary>
      <div class="menu-celular-painel"><nav aria-label="Menu"><ul>${links}</ul></nav>${search('busca-menu')}</div>
    </details>
  </div>
</header>
<main id="conteudo" tabindex="-1">
${body}
</main>
<footer class="rodape">
  <div class="container rodape-grade">
    <div class="rodape-sobre">
      <p class="marca marca-rodape"><span class="marca-simbolo" aria-hidden="true">${esc(config.marca.sigla)}</span><span class="marca-nome">${esc(config.nome)}</span></p>
      <p>${esc(config.aviso)}</p>
    </div>
    <nav aria-label="Rodapé"><ul class="rodape-links">
      <li><a href="${href('catalogo/')}">Catálogo</a></li>
      <li><a href="${href(appUrl)}">FosterMCP</a></li>
      <li><a href="${href('ajuda/#como-pedir-ajuda')}">Como pedir ajuda</a></li>
      <li><a href="${href('ajuda/#privacidade')}">Privacidade</a></li>
    </ul></nav>
    <p class="rodape-nota">Grátis, sem login e sem rastreadores. Atualizado em ${formatDate(site.builtAt)}.</p>
  </div>
</footer>
</body>
</html>
`;
  }

  // ---------- peças comuns ----------
  const chips = keys => `<ul class="chips" aria-label="Funciona com">${platformLabels(keys).map(label => `<li>${esc(label)}</li>`).join('')}</ul>`;
  const badge = type => `<span class="selo selo-${type}">${icon(type)}${TYPES[type].label}</span>`;
  const draftBadge = item => item.meta.status === 'rascunho' ? '<span class="selo selo-rascunho">Rascunho</span>' : '';
  const card = (item, level = 3) => {
    const {meta} = item;
    const terms = normalize([meta.titulo, meta.resumo, TYPES[item.type].label, TYPES[item.type].plural, ...platformLabels(meta.plataformas), ...(meta.palavras || []), ...(meta.ferramentas || [])].join(' '));
    return `<li class="cartao" data-tipo="${item.type}" data-plataformas="${meta.plataformas.join(' ')}" data-busca="${esc(terms)}">
  <div class="cartao-topo">${badge(item.type)}${draftBadge(item)}</div>
  <h${level} class="cartao-titulo"><a class="cartao-link" href="${href(item.url)}">${esc(meta.titulo)}</a></h${level}>
  <p class="cartao-resumo">${esc(meta.resumo)}</p>
  <p class="cartao-plataformas"><span class="visualmente-oculto">Funciona com: </span>${esc(platformLabels(meta.plataformas).join(' · '))}</p>
</li>`;
  };
  const cards = (list, level, extra = '') => `<ul class="cartoes${extra}">${list.map(item => card(item, level)).join('\n')}</ul>`;
  const copyButton = (target, label, extra = '') => `<button type="button" class="botao${extra}" data-copiar="${target}">${icon('copy')}<span>${label}</span></button>`;
  const markPlaceholders = text => esc(text).replace(/\[([^\]\n]{1,80})\]/g, '<mark>[$1]</mark>');
  const draftNotice = item => item.meta.status === 'rascunho'
    ? '<div class="aviso aviso-atencao faixa-rascunho"><p class="aviso-titulo">Rascunho para revisão</p><p>Este conteúdo ainda não foi revisado. Confira cada passo antes de usar com clientes.</p></div>' : '';

  const appItem = site.items.find(item => item.url === appUrl);
  function downloadBox({compact = false} = {}) {
    const {data, example} = feed, files = config.fostermcp.arquivos;
    const notes = data.notes.length ? `<details class="detalhes"><summary>Novidades da versão ${esc(data.version)}</summary><ul>${data.notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul></details>` : '';
    const check = `<details class="detalhes"><summary>Conferir o arquivo baixado (SHA-256)</summary>
  <p>Opcional. Compare o código abaixo com o do arquivo baixado.</p>
  <p class="rotulo-pequeno">Windows: no PowerShell, <code>Get-FileHash .\\${esc(files.windows)}</code></p><code class="hash">${esc(data.windows.sha256)}</code>
  <p class="rotulo-pequeno">Mac: no Terminal, <code>shasum -a 256 ${esc(files.mac)}</code></p><code class="hash">${esc(data.mac.sha256)}</code>
</details>`;
    return `<div class="caixa-download" id="baixar">
  <p class="caixa-titulo">Baixar o FosterMCP <span class="versao">${esc(data.version)}</span></p>
  ${example ? '<p class="etiqueta-exemplo">Prévia com dados de exemplo: versão, data e tamanho reais entram na publicação.</p>' : ''}
  <a class="botao botao-grande" href="${esc(config.latestDownload(files.windows))}">${icon('download')}<span>Baixar para Windows</span></a>
  <p class="detalhe-download">Windows 10 ou 11, 64 bits · ${formatSize(data.windows.sizeBytes)}</p>
  <a class="link-mac" href="${esc(config.latestDownload(files.mac))}">${icon('laptop')}<span>Baixar para Mac</span></a>
  <p class="detalhe-download">Mac com chip Apple (M1 ou mais novo) · ${formatSize(data.mac.sizeBytes)}</p>
  <p class="detalhe-download">Versão ${esc(data.version)}, publicada em ${formatDate(data.publishedAt)}. Grátis e sem login.</p>
  ${compact ? '' : notes + check}
</div>`;
  }

  // Seções do Markdown: abas (### de plataforma ou sistema), perguntas (FAQ) ou texto corrido.
  function sections(list, {md, nextId}) {
    const visible = list.filter(section => !HIDDEN_SECTIONS.has(section.key));
    const ids = visible.map(section => nextId(section.title));
    const html = visible.map((section, index) => {
      const id = ids[index];
      let inner;
      if (ACCORDION_SECTIONS.has(section.key)) {
        inner = md.tokens(section.intro) + section.subsections.map(sub => {
          const subId = nextId(sub.title);
          return `<details class="pergunta" id="${subId}"><summary>${md.inline(sub.title)}</summary><div class="pergunta-corpo">${md.tokens(sub.tokens)}</div></details>`;
        }).join('\n');
      } else if (section.tabs?.panels.length > 1) {
        const group = section.tabs.group, key = `${id}-aba`;
        const buttons = section.tabs.panels.map((panel, i) => `<button type="button" role="tab" id="${key}-${panel.tab.key}" aria-controls="${key}-${panel.tab.key}-painel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-aba="${panel.tab.key}">${esc(panel.tab.label)}</button>`).join('');
        const panels = section.tabs.panels.map(panel => `<section class="aba-painel" role="tabpanel" id="${key}-${panel.tab.key}-painel" aria-labelledby="${key}-${panel.tab.key}" data-aba="${panel.tab.key}" tabindex="0">
<h3 class="aba-titulo">${esc(panel.tab.label)}</h3>
${md.tokens(panel.tokens)}</section>`).join('\n');
        inner = `${md.tokens(section.intro)}<div class="abas" data-grupo="${group}"><div class="abas-lista" role="tablist" aria-label="${esc(section.title)}" hidden>${buttons}</div>${panels}</div>`;
      } else if (section.tabs?.panels.length === 1) {
        const [panel] = section.tabs.panels;
        inner = `${md.tokens(section.intro)}<h3 id="${nextId(panel.tab.label)}">${esc(panel.tab.label)}</h3>${md.tokens(panel.tokens)}`;
      } else inner = md.tokens(section.tokens);
      return `<section class="secao-texto" aria-labelledby="${id}">\n<h2 id="${id}">${md.inline(section.title)}</h2>\n${inner}</section>`;
    }).join('\n');
    // Fechado no celular para não empurrar o texto; o site.js abre em telas largas.
    const toc = visible.length > 2 ? `<nav class="sumario-nav" aria-label="Nesta página"><details class="sumario" data-sumario><summary>Nesta página</summary><ol>${visible.map((section, i) => `<li><a href="#${ids[i]}">${md.inline(section.title)}</a></li>`).join('')}</ol></details></nav>` : '';
    return {html, toc};
  }

  // ---------- item ----------
  function itemAction(item) {
    if (item.type === 'app') return item.meta.download ? downloadBox() : '';
    const has = platform => item.meta.plataformas.includes(platform);
    const list = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names.at(-1)}` : names[0];
    if (item.type === 'skill') {
      const zipTargets = [['claude-desktop', 'no Claude Desktop'], ['claude-code', 'no Claude Code'], ['chatgpt-codex', 'no Codex']].filter(([key]) => has(key)).map(([, label]) => label);
      return `<div class="caixa-acao">
  <a class="botao botao-grande" href="${href(`${item.url}${item.slug}.zip`)}" download>${icon('download')}<span>Baixar a skill (.zip)</span></a>
  ${has('chatgpt') ? copyButton('instrucoes-skill', 'Copiar as instruções', ' botao-secundario') : ''}
  <p class="detalhe-download">${zipTargets.length ? `Use o .zip ${list(zipTargets)}.` : ''}${has('chatgpt') ? ' As instruções copiadas servem para colar no ChatGPT.' : ''}</p>
  ${has('chatgpt') ? `<template id="instrucoes-skill">${esc(item.skill.body)}</template>` : ''}
</div>`;
    }
    if (item.type === 'agente') {
      const file = has('chatgpt-codex') || has('claude-code');
      const pasteTargets = [['claude-desktop', 'num Projeto do Claude'], ['chatgpt', 'num Projeto ou GPT do ChatGPT']].filter(([key]) => has(key)).map(([, label]) => label);
      return `<div class="caixa-acao">
  ${copyButton('instrucoes-agente', 'Copiar as instruções', ' botao-grande')}
  ${file ? `<a class="botao botao-secundario" href="${href(`${item.url}AGENTS.md`)}" download>${icon('download')}<span>Baixar AGENTS.md</span></a>` : ''}
  <p class="detalhe-download">${pasteTargets.length ? `Cole as instruções ${list(pasteTargets)}.` : ''}${file ? ' Use o arquivo AGENTS.md no Codex (ou como CLAUDE.md no Claude Code).' : ''}</p>
</div>`;
    }
    if (item.type === 'prompt') return `<div class="caixa-acao">${copyButton('texto-prompt', 'Copiar o prompt', ' botao-grande')}<p class="detalhe-download">Troque o que está entre [colchetes] antes de enviar.</p></div>`;
    if (item.type === 'conector' && item.meta.app) {
      const app = site.items.find(other => other.id === item.meta.app);
      return `<div class="caixa-acao"><p class="caixa-titulo">Vem dentro do app ${esc(app.meta.titulo)}</p><a class="botao botao-grande" href="${href(`${app.url}#baixar`)}">${icon('download')}<span>Baixar o ${esc(app.meta.titulo)}</span></a><p class="detalhe-download">Instale o app e conecte ao seu assistente pelas instruções abaixo.</p></div>`;
    }
    return '';
  }

  function renderItem(item) {
    const ctx = newPage(), {meta} = item, type = TYPES[item.type];
    const body = sections(item.sections, ctx);
    const version = item.type === 'app' && item.meta.download && feed ? feed.data.version : meta.versao;
    const intro = ctx.md.tokens(item.intro);
    let extra = '';
    if (item.type === 'prompt') extra = `<section class="caixa-prompt" aria-labelledby="titulo-prompt">
  <div class="caixa-prompt-topo"><h2 id="titulo-prompt">O prompt</h2>${copyButton('texto-prompt', 'Copiar', ' botao-pequeno')}</div>
  <pre class="prompt" id="texto-prompt">${markPlaceholders(item.prompt)}</pre>
</section>`;
    if (item.type === 'agente') extra = `<details class="caixa-arquivo"><summary>Ver as instruções completas</summary><pre class="prompt" id="instrucoes-agente">${esc(item.instructions)}</pre></details>`;
    if (item.type === 'skill') extra = `<details class="caixa-arquivo"><summary>Ver o arquivo SKILL.md</summary><pre class="prompt">${esc(item.skill.source.trim())}</pre></details>`;
    const action = itemAction(item);
    const requires = (meta.requer || []).map(ref => site.items.find(other => other.id === ref)).filter(Boolean);
    const html = `<div class="container item">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><a href="${href(`${item.folder}/`)}">${type.plural}</a></li><li><span aria-current="page">${esc(meta.titulo)}</span></li></ol></nav>
  <header class="item-cabecalho${action ? ' com-acao' : ''}">
    <div class="item-titulos">
      <div class="cartao-topo">${badge(item.type)}${draftBadge(item)}</div>
      <h1>${esc(meta.titulo)}</h1>
      <p class="lead">${esc(meta.resumo)}</p>
      <div class="item-meta">${chips(meta.plataformas)}<p class="item-datas">${version ? `Versão ${esc(version)} · ` : ''}Atualizado em ${formatDay(meta.atualizado)}</p></div>
      ${requires.length ? `<p class="item-requer">Precisa de: ${requires.map(other => `<a href="${href(other.url)}">${esc(other.meta.titulo)}</a>`).join(', ')}</p>` : ''}
    </div>
    ${action ? `<aside class="item-acao" aria-label="${item.type === 'app' ? 'Download' : 'Ação principal'}">${action}</aside>` : ''}
  </header>
  ${draftNotice(item)}
  ${extra}
  <div class="item-corpo${body.toc ? ' com-sumario' : ''}">
    ${body.toc}
    <article class="texto">${intro}${body.html}</article>
  </div>
  <p class="item-rodape">Encontrou um erro ou tem uma sugestão? ${contact}</p>
</div>`;
    files.set(`${item.url}index.html`, layout({title: meta.titulo, description: meta.resumo, current: item.url === appUrl ? 'fostermcp' : ['prompt', 'tutorial'].includes(item.type) ? type.folder : null, body: html, path: item.url}));
  }

  // ---------- páginas de tipo ----------
  function renderType(typeKey) {
    const type = TYPES[typeKey], ctx = newPage(), list = site.items.filter(item => item.type === typeKey);
    const intro = site.intros[type.folder];
    let listing;
    if (typeKey === 'prompt') listing = `<ul class="biblioteca">${list.map((item, i) => `<li class="prompt-cartao">
  <div class="cartao-topo">${badge('prompt')}${draftBadge(item)}</div>
  <h2 class="cartao-titulo"><a href="${href(item.url)}">${esc(item.meta.titulo)}</a></h2>
  <p class="cartao-resumo">${esc(item.meta.resumo)}</p>
  <pre class="prompt" id="prompt-${i + 1}">${markPlaceholders(item.prompt)}</pre>
  <div class="prompt-acoes">${copyButton(`prompt-${i + 1}`, 'Copiar o prompt', ' botao-pequeno')}<a class="link-seta" href="${href(item.url)}">Como usar ${icon('arrow')}</a></div>
  ${item.meta.ferramentas ? `<p class="ferramentas">Ferramentas: ${item.meta.ferramentas.map(name => `<code>${esc(name)}</code>`).join(' ')}</p>` : ''}
</li>`).join('\n')}</ul>`;
    else listing = list.length ? cards(list, 2) : '<p class="vazio">Ainda não há itens deste tipo. Em breve.</p>';
    if (typeKey === 'conector') listing += `<div class="em-breve"><p class="caixa-titulo">Próximos conectores</p><p>Este espaço recebe os próximos conectores (MCPs) testados com os assessores. Quer sugerir um? ${contact}</p></div>`;
    const html = `<div class="container pagina-tipo">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><span aria-current="page">${type.plural}</span></li></ol></nav>
  <header class="pagina-cabecalho"><p class="sobretitulo">${icon(typeKey)} ${list.length} ${list.length === 1 ? 'item' : 'itens'}</p><h1>${type.plural}</h1><p class="lead">${esc(intro.resumo)}</p></header>
  <div class="texto texto-intro">${ctx.md.source(intro.body)}</div>
  ${listing}
</div>`;
    files.set(`${type.folder}/index.html`, layout({title: type.plural, description: intro.resumo, current: ['prompt', 'tutorial'].includes(typeKey) ? type.folder : null, body: html, path: `${type.folder}/`}));
  }

  // ---------- catálogo ----------
  function renderCatalog() {
    const radios = (name, options) => options.map(([value, label], i) => `<label class="filtro"><input type="radio" name="${name}" value="${value}"${i === 0 ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
    const html = `<div class="container pagina-catalogo">
  <header class="pagina-cabecalho"><h1>Catálogo</h1><p class="lead">Tudo o que a central oferece. Filtre pelo tipo e pelo assistente que você usa, ou busque por uma palavra.</p></header>
  <form class="filtros" data-filtros hidden>
    <div class="campo-busca"><label for="busca">Buscar</label><input id="busca" name="q" type="search" placeholder="Ex.: vencimentos, WhatsApp, briefing" autocomplete="off"></div>
    <fieldset><legend>Tipo</legend><div class="filtro-grupo">${radios('tipo', [['', 'Todos'], ...Object.entries(TYPES).map(([key, type]) => [key, type.plural])])}</div></fieldset>
    <fieldset><legend>Funciona com</legend><div class="filtro-grupo">${radios('plataforma', [['', 'Todos'], ...Object.entries(PLATFORMS).map(([key, platform]) => [key, platform.label])])}</div></fieldset>
  </form>
  <p class="contagem" data-contagem aria-live="polite">${site.items.length} itens</p>
  ${cards(site.items, 2)}
  <div class="vazio" data-vazio hidden><p>Nada encontrado com esses filtros.</p><button type="button" class="botao botao-secundario" data-limpar>Limpar filtros</button></div>
</div>`;
    files.set('catalogo/index.html', layout({title: 'Catálogo', description: 'Apps, conectores, skills, agentes, prompts e tutoriais de IA para assessores.', current: 'catalogo', body: html, path: 'catalogo/'}));
  }

  // ---------- início ----------
  function renderHome() {
    const {home} = site, ctx = newPage();
    const highlights = site.items.filter(item => item.meta.destaque);
    const [choose, install, connect] = home.passos;
    const question = 'pergunta-inicial';
    const html = `<section class="heroi">
  <div class="container heroi-grade">
    <div class="heroi-texto">
      <p class="sobretitulo">${esc(home.sobretitulo)}</p>
      <h1>${esc(home.titulo)}</h1>
      <p class="lead">${esc(home.subtitulo)}</p>
      <div class="acoes"><a class="botao botao-grande" href="#comece">Comece aqui ${icon('arrow')}</a><a class="botao botao-secundario botao-grande" href="${href('catalogo/')}">Ver o catálogo</a></div>
    </div>
    <div class="heroi-ilustracao" aria-hidden="true">
      <div class="balao balao-usuario">Prepare a minha reunião de amanhã com o cliente 900001.</div>
      <div class="balao balao-agente"><span class="balao-ferramenta">${icon('conector')} fostermcp · get_client_briefing</span><span class="linha"></span><span class="linha curta"></span><span class="linha"></span></div>
      <div class="balao balao-agente"><strong>Briefing pronto:</strong> carteira, vencimentos dos próximos 30 dias e as últimas conversas, com fonte e data de cada dado.</div>
    </div>
  </div>
</section>
<section class="secao" aria-labelledby="sobre">
  <div class="container">
    <h2 id="sobre">${esc(home.sobre.titulo)}</h2>
    <div class="texto texto-largo">${ctx.md.source(home.sobre.texto)}</div>
    <ul class="pontos">${home.sobre.pontos.map(point => `<li><span class="ponto-icone">${icon(point.icone)}</span><h3>${esc(point.titulo)}</h3><p>${ctx.md.inline(point.texto)}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="secao secao-destacada" aria-labelledby="comece">
  <div class="container">
    <h2 id="comece">Comece aqui</h2>
    <p class="lead">Três passos, uns 20 minutos, do download à primeira pergunta.</p>
    <ol class="passos">
      <li class="passo">
        <h3>${esc(choose.titulo)}</h3>
        <div class="texto">${ctx.md.source(choose.texto)}</div>
        <div class="escolha" role="group" aria-label="Qual assistente você usa?" data-escolha hidden>
          <button type="button" class="botao botao-secundario" data-assistente="claude" aria-pressed="false">Uso o Claude</button>
          <button type="button" class="botao botao-secundario" data-assistente="chatgpt" aria-pressed="false">Uso o ChatGPT</button>
        </div>
        <div class="escolha-painel" data-para-assistente="claude"><p class="rotulo-pequeno">Claude</p>${ctx.md.source(choose.claude)}</div>
        <div class="escolha-painel" data-para-assistente="chatgpt"><p class="rotulo-pequeno">ChatGPT</p>${ctx.md.source(choose.chatgpt)}</div>
      </li>
      <li class="passo">
        <h3>${esc(install.titulo)}</h3>
        <div class="texto">${ctx.md.source(install.texto)}</div>
        ${downloadBox({compact: true})}
      </li>
      <li class="passo">
        <h3>${esc(connect.titulo)}</h3>
        <div class="texto">${ctx.md.source(connect.texto)}</div>
        <div class="pergunta-pronta"><p class="rotulo-pequeno">Primeira pergunta</p><p id="${question}">${esc(connect.pergunta)}</p>${copyButton(question, 'Copiar', ' botao-pequeno')}</div>
        <a class="link-seta" href="${href(connect.link)}">Passo a passo completo ${icon('arrow')}</a>
      </li>
    </ol>
  </div>
</section>
${highlights.length ? `<section class="secao" aria-labelledby="destaques"><div class="container"><h2 id="destaques">Destaques</h2>${cards(highlights, 3, ' cartoes-destaque')}</div></section>` : ''}
<section class="secao" aria-labelledby="tipos">
  <div class="container">
    <h2 id="tipos">Explore por tipo</h2>
    <ul class="tipos">${Object.entries(TYPES).map(([key, type]) => {
      const count = site.items.filter(item => item.type === key).length;
      return `<li class="tipo tipo-${key}"><span class="tipo-icone">${icon(key)}</span><h3><a href="${href(`${type.folder}/`)}">${type.plural}</a></h3><p>${esc(site.intros[type.folder].resumo)}</p><p class="tipo-contagem">${count ? `${count} ${count === 1 ? 'item' : 'itens'}` : 'Em breve'}</p></li>`;
    }).join('')}</ul>
  </div>
</section>
<section class="secao" aria-labelledby="novidades">
  <div class="container">
    <h2 id="novidades">Novidades</h2>
    <ol class="novidades">${site.news.map(entry => `<li><time datetime="${entry.data}">${formatDay(entry.data)}</time><h3>${entry.link ? `<a href="${href(entry.link)}">${esc(entry.titulo)}</a>` : esc(entry.titulo)}</h3><p>${ctx.md.inline(entry.texto)}</p></li>`).join('')}</ol>
  </div>
</section>`;
    files.set('index.html', layout({title: null, description: config.descricao, body: html, path: ''}));
  }

  // ---------- páginas de conteúdo (Ajuda) ----------
  function renderPage(page) {
    const ctx = newPage(), body = sections(page.sections, ctx);
    const html = `<div class="container item">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><span aria-current="page">${esc(page.meta.titulo)}</span></li></ol></nav>
  <header class="pagina-cabecalho"><h1>${esc(page.meta.titulo)}</h1><p class="lead">${esc(page.meta.resumo)}</p></header>
  <div class="item-corpo${body.toc ? ' com-sumario' : ''}">${body.toc}<article class="texto">${ctx.md.tokens(page.intro)}${body.html}</article></div>
</div>`;
    files.set(`${page.url}index.html`, layout({title: page.meta.titulo, description: page.meta.resumo, current: NAV.some(([key]) => key === page.slug) ? page.slug : null, body: html, path: page.url}));
  }

  renderHome();
  renderCatalog();
  for (const type of Object.keys(TYPES)) renderType(type);
  for (const item of site.items) renderItem(item);
  for (const page of site.pages) renderPage(page);
  files.set('404.html', layout({title: 'Página não encontrada', body: `<div class="container pagina-404"><h1>Página não encontrada</h1><p class="lead">O endereço mudou ou foi digitado com algum erro.</p><div class="acoes"><a class="botao" href="${href('')}">Ir para o início</a><a class="botao botao-secundario" href="${href('catalogo/')}">Ver o catálogo</a></div></div>`, path: '404.html'}));
  // Endereço curto para compartilhar: …/fostermcp/ leva à página do app.
  if (appItem) files.set(`${config.fostermcp.feed.split('/')[0]}/index.html`, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${href(appUrl)}"><meta name="robots" content="noindex"><link rel="canonical" href="${esc(new URL(appUrl, config.endereco).href)}"><title>FosterMCP</title></head><body><p><a href="${href(appUrl)}">Abrir a página do FosterMCP</a></p></body></html>\n`);
  return {files, pendingImages};
}
