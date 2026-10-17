import {TYPES, AREAS, PLATFORMS, SOURCES, STATUS, FAQ_SECTIONS, HIDDEN_SECTIONS} from './taxonomy.js';
import {escapeHtml as esc, createIdSet, createRenderer, renderResult} from './markdown.js';
import {icon} from './icons.js';
import {formatSize, formatDate, formatDay} from './feed.js';

const normalize = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
const joinNames = (names, word = 'e') => names.length > 1 ? `${names.slice(0, -1).join(', ')} ${word} ${names.at(-1)}` : names[0] || '';

// Monta todas as páginas em memória: {files: Map(caminho → conteúdo), pendingImages}.
export function renderSite(site, {imageExists, assets}) {
  const {config, feed} = site;
  const base = config.base;
  const href = path => base + String(path).replace(/^\//, '');
  const pendingImages = [];
  const files = new Map();
  const appUrl = config.fostermcp.pagina;
  const newPage = () => { const nextId = createIdSet(); return {nextId, md: createRenderer({base, imageExists, pendingImages, nextId})}; };
  const contact = config.contato.link ? `<a href="${esc(config.contato.link)}">${esc(config.contato.nome)}</a>` : esc(config.contato.nome);
  const itemsOf = area => site.items.filter(item => AREAS[area].types.includes(item.type));
  const areaOf = item => TYPES[item.type].area;
  const nav = [['inicio', '', 'Início'], ...Object.entries(AREAS).map(([key, area]) => [key, `${key}/`, area.label]), ['ajuda', 'ajuda/', 'Ajuda']];
  const signature = extra => `<span class="assinatura${extra}"><span class="assinatura-nome">${esc(config.assinatura.nome)}</span>` +
    `${config.assinatura.complemento ? `<span class="assinatura-barra" aria-hidden="true"></span><span class="assinatura-complemento">${esc(config.assinatura.complemento)}</span>` : ''}</span>`;

  function layout({title, description, current = null, body, path}) {
    const fullTitle = title ? `${title} · ${config.nome}` : config.nome;
    const links = nav.map(([key, path, label]) => `<li><a href="${href(path)}"${key === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
    const search = (id, extra = '') => `<form class="busca${extra}" action="${href('catalogo/')}" method="get" role="search">` +
      `<label class="visualmente-oculto" for="${id}">Buscar na central</label>${icon('search')}` +
      `<input id="${id}" name="q" type="search" placeholder="Buscar na central" autocomplete="off"${extra ? '' : ' data-atalho'}>${extra ? '' : '<kbd aria-hidden="true">/</kbd>'}</form>`;
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
<meta name="referrer" content="no-referrer">
${config.indexar ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${config.cores.noite}">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || config.descricao)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(config.nome)}">
<meta property="og:title" content="${esc(title || config.nome)}">
<meta property="og:description" content="${esc(description || config.descricao)}">
<meta property="og:url" content="${esc(new URL(path, config.endereco).href)}">
<link rel="icon" href="${href('favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${href('assets/fontes/manrope.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${href(`assets/site.css?v=${assets.version}`)}">
<script src="${href(`assets/site.js?v=${assets.version}`)}" defer></script>
${site.dev ? `<script src="${href('assets/recarregar.js')}" defer></script>\n` : ''}</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="container topo-linha">
    <a class="marca" href="${href('')}" aria-label="${esc(config.nome)}, início">${signature('')}<span class="produto">${esc(config.nome)}</span></a>
    <nav class="navegacao" aria-label="Principal"><ul>${links}</ul></nav>
    ${search('busca-topo')}
    <details class="menu-celular">
      <summary aria-label="Abrir o menu">${icon('menu')}</summary>
      <div class="menu-celular-painel"><nav aria-label="Menu"><ul>${links}</ul></nav>${search('busca-menu', ' busca-menu')}</div>
    </details>
  </div>
</header>
<main id="conteudo" tabindex="-1">
${body}
</main>
<footer class="rodape">
  <div class="container rodape-linha">
    <p><a class="rodape-ajuda" href="${href('ajuda/')}">Precisa de ajuda?</a> No FosterMCP, abra Ajuda → Copiar diagnóstico e envie para ${contact}. ${esc(config.aviso)}</p>
    ${signature(' assinatura-rodape')}
  </div>
</footer>
</body>
</html>
`;
  }

  // ---------- peças comuns ----------
  const badge = (kind, label) => `<span class="selo selo-${kind}">${label}</span>`;
  const STATUS_KIND = {disponivel: 'ok', 'em-teste': 'teste', 'em-breve': 'breve'};
  // Tutoriais e prompts disponíveis não precisam de selo: só software (app, skill, agente) mostra "Disponível".
  const badges = item => (['tutorial', 'prompt'].includes(item.type) && item.meta.situacao === 'disponivel' ? '' : badge(STATUS_KIND[item.meta.situacao], STATUS[item.meta.situacao].label)) +
    (item.meta.avancado ? badge('avancado', 'Avançado') : '');
  // Nas listas cabe um selo só: em breve vale mais que avançado, que vale mais que a situação.
  const oneBadge = item => item.meta.situacao === 'em-breve' ? badge('breve', 'Em breve') : item.meta.avancado ? badge('avancado', 'Avançado') : badge(STATUS_KIND[item.meta.situacao], STATUS[item.meta.situacao].label);
  const platformNames = item => item.meta.plataformas.map(key => PLATFORMS[key].label);
  const families = item => [...new Set(item.meta.plataformas.map(key => PLATFORMS[key].label.replace(/ (Desktop|Code|\(.*\))$/, '')))];
  const firstSentence = text => text.match(/^.*?[.!?](?=\s|$)/)?.[0] || text;
  const chips = item => `<ul class="plataformas">${item.meta.plataformas.map(key => `<li>${esc(PLATFORMS[key].label)}</li>`).join('')}` +
    `${(item.meta.plataformasEmBreve || []).map(key => `<li class="em-breve">${esc(PLATFORMS[key].label)} · em breve</li>`).join('')}</ul>`;
  const sourceNames = item => (item.meta.fontes || []).map(key => SOURCES[key].label).join(' + ');
  const filterData = item => {
    const terms = normalize([item.meta.titulo, item.meta.resumo, TYPES[item.type].label, ...platformNames(item), sourceNames(item), item.meta.assunto, item.prompt,
      ...(item.meta.palavras || []), ...(item.meta.ferramentas || [])].filter(Boolean).join(' '));
    return ` data-item data-tipo="${item.type}" data-area="${areaOf(item)}" data-plataformas="${item.meta.plataformas.join(' ')}" data-fontes="${(item.meta.fontes || []).join(' ')}"` +
      ` data-assunto="${esc(normalize(item.meta.assunto || ''))}" data-busca="${esc(terms)}"`;
  };
  const versionLine = item => {
    if (item.type === 'app' && item.meta.download && feed) return `Versão ${esc(feed.data.version)} · ${formatDate(feed.data.publishedAt)}`;
    return `${item.meta.versao ? `Versão ${esc(item.meta.versao)} · ` : ''}${formatDay(item.meta.atualizado)}`;
  };
  const copyButton = (target, label, kind = 'botao-linha botao-pequeno') => `<button type="button" class="botao ${kind}" data-copiar="${target}">${label}</button>`;
  const allLink = (area, count) => `<a class="ver-todos" href="${href(`${area}/`)}">${AREAS[area].all}${count ? ` (${count})` : ''} ${icon('arrow')}</a>`;

  // Exemplo de conversa do cartão de app: o primeiro exemplo com linhas (ou o primeiro de todos).
  function conversation(item) {
    const examples = item.blocks.exemplos || [];
    const example = examples.find(candidate => candidate.linhas) || examples[0];
    if (!example) return '';
    return `<div class="app-exemplo"><div class="conversa"><p class="conversa-pergunta">${esc(example.pergunta)}</p>` +
      `${example.ferramenta ? `<span class="conversa-ferramenta">${esc(example.ferramenta)}</span>` : ''}` +
      `${example.linhas ? `<dl class="conversa-linhas">${example.linhas.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>` : `<p class="conversa-resposta">${esc(example.resposta.replace(/\*\*/g, ''))}</p>`}` +
      `<p class="conversa-fonte">${esc(example.citacao)}</p></div><p class="conversa-legenda">Exemplo de uso com dados fictícios</p></div>`;
  }

  function appCard(item, level) {
    const download = item.type === 'app' && item.meta.download && feed;
    const installers = config.fostermcp.arquivos;
    return `<article class="app-cartao"${filterData(item)}>
  <div class="app-info">
    <div class="app-nome"><h${level} class="app-titulo"><a href="${href(item.url)}">${esc(item.meta.titulo)}</a></h${level}>${badges(item)}<span class="meta">${versionLine(item)}</span></div>
    <p class="app-lead">${esc(item.meta.resumo)}</p>
    ${item.meta.usos ? `<p class="rotulo">O que dá para fazer</p><ul class="usos">${item.meta.usos.map(use => `<li>${esc(use)}</li>`).join('')}</ul>` : ''}
    <p class="rotulo">Onde funciona</p>${chips(item)}
    <div class="acoes"><a class="botao botao-escuro" href="${href(item.url)}">Ver passo a passo</a>${download ? `<a class="botao botao-ouro" href="${esc(config.latestDownload(installers.windows))}">Baixar para Windows</a><a class="botao botao-linha" href="${esc(config.latestDownload(installers.mac))}" aria-label="Baixar para Mac">Mac</a>` : ''}</div>
  </div>
  ${conversation(item)}
</article>`;
  }

  const skillCard = (item, level) => `<li class="cartao"${filterData(item)}>
  <div class="cartao-exemplo"><span class="rotulo">Exemplo de resultado</span>${item.blocks.resultado ? renderResult(item.blocks.resultado) : '<div class="resultado resultado-vazio" aria-hidden="true"></div>'}</div>
  <div class="cartao-corpo"><h${level} class="cartao-titulo"><a class="cartao-link" href="${href(item.url)}">${esc(item.meta.titulo)}</a></h${level}><p>${esc(item.meta.resumo)}</p>
  <div class="cartao-pe">${oneBadge(item)}<span class="botao botao-linha botao-pequeno" aria-hidden="true">Ver ${TYPES[item.type].label.toLowerCase()}</span></div></div>
</li>`;
  const row = (item, level, {type = false} = {}) => `<li class="linha"${filterData(item)}>
  <div><h${level} class="linha-titulo"><a href="${href(item.url)}">${esc(item.meta.titulo)}</a></h${level}><p>${type ? `${TYPES[item.type].label} · ` : ''}${esc(joinNames(families(item), 'ou'))} · ${esc(firstSentence(item.meta.resumo))}</p></div>
  ${oneBadge(item)}
</li>`;
  const promptRow = (item, id, {title = false} = {}) => `<li class="linha-prompt"${filterData(item)}>
  <div class="linha-prompt-texto">${title ? `<a class="linha-prompt-titulo" href="${href(item.url)}">${esc(item.meta.titulo)}</a>` : ''}<q id="${id}">${esc(item.prompt)}</q></div>
  <span class="fonte-tag">${esc(sourceNames(item))}</span>
  ${copyButton(id, 'Copiar')}
</li>`;
  const tutorialRow = (item, level) => `<li class="linha-tutorial"${filterData(item)}>
  <h${level} class="linha-titulo"><a href="${href(item.url)}">${esc(item.meta.titulo)}</a></h${level}>
  <span class="assunto">${esc(item.meta.assunto)}</span><span class="tempo">${esc(item.meta.tempo)}</span>
</li>`;
  const listFor = (area, items, level) => {
    if (area === 'skills') return `<ul class="grade-cartoes" data-lista>${items.map(item => skillCard(item, level)).join('\n')}</ul>`;
    if (area === 'prompts') return `<ul class="lista" data-lista>${items.map((item, i) => promptRow(item, `prompt-${i + 1}`, {title: level === 2})).join('\n')}</ul>`;
    if (area === 'tutoriais') return `<ul class="lista" data-lista>${items.map(item => tutorialRow(item, level)).join('\n')}</ul>`;
    return `<ul class="lista" data-lista>${items.map(item => row(item, level)).join('\n')}</ul>`;
  };

  // ---------- início ----------
  function renderHome() {
    const {home} = site, ctx = newPage();
    // Destaques primeiro; se faltar, completa com os demais na ordem do catálogo.
    const pick = (area, count) => { const list = itemsOf(area); return [...list.filter(item => item.meta.destaque), ...list.filter(item => !item.meta.destaque)].slice(0, count); };
    const head = (area, count) => `<div class="categoria-topo"><h2 id="${area}">${AREAS[area].title}</h2>${allLink(area, count)}</div><p class="categoria-desc">${esc(site.intros[area].resumo)}</p>`;
    const html = `<div class="container">
<section class="intro">
  <div>
    <h1>${esc(home.titulo)}</h1>
    <p class="intro-texto">${esc(home.texto)}</p>
    <form class="busca-grande" action="${href('catalogo/')}" method="get" role="search">
      <label class="visualmente-oculto" for="busca-inicio">Buscar na central</label>${icon('search')}
      <input id="busca-inicio" name="q" type="search" placeholder="${esc(home.busca)}" autocomplete="off">
    </form>
  </div>
  <aside class="primeira-vez" aria-labelledby="primeira-vez">
    <h2 id="primeira-vez">${esc(home.primeiraVez.titulo)}</h2>
    <ol>${home.primeiraVez.passos.map(step => `<li><span>${ctx.md.inline(step.texto)}</span><span class="tempo">${esc(step.tempo)}</span></li>`).join('')}</ol>
    <a class="botao botao-escuro botao-pequeno" href="${href(home.primeiraVez.link)}">${esc(home.primeiraVez.botao)}</a>
  </aside>
</section>
<section class="categoria" aria-labelledby="apps">${head('apps', 0)}${pick('apps', 2).map(item => appCard(item, 3)).join('\n')}</section>
<section class="categoria" aria-labelledby="skills">${head('skills', 0)}${listFor('skills', pick('skills', 3), 3)}</section>
<div class="duas-colunas">
  <section class="categoria" aria-labelledby="agentes">${head('agentes', 0)}${listFor('agentes', pick('agentes', 3), 3)}</section>
  <section class="categoria" aria-labelledby="novidades"><div class="categoria-topo"><h2 id="novidades">Novidades</h2></div><p class="categoria-desc">O que mudou recentemente.</p>
    <ul class="novidades">${site.news.slice(0, 4).map(entry => `<li><time datetime="${entry.data}">${formatDay(entry.data)}</time>${entry.link ? `<a href="${href(entry.link)}">${ctx.md.inline(entry.texto)}</a>` : ctx.md.inline(entry.texto)}</li>`).join('')}</ul></section>
</div>
<section class="categoria" aria-labelledby="prompts">${head('prompts', itemsOf('prompts').length)}${listFor('prompts', pick('prompts', 4), 3)}</section>
<section class="categoria" aria-labelledby="tutoriais">${head('tutoriais', 0)}${listFor('tutoriais', pick('tutoriais', 5), 3)}</section>
</div>`;
    files.set('index.html', layout({title: null, description: config.descricao, current: 'inicio', body: html, path: ''}));
  }

  // ---------- filtros (lista filtrável) ----------
  function filters(id, {field, legend, options}) {
    const radios = options.map(([value, label], i) => `<label class="filtro"><input type="radio" name="${field}" value="${esc(value)}"${i === 0 ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
    return `<form class="filtros" data-filtros hidden>
  <div class="filtros-busca">${icon('search')}<label class="visualmente-oculto" for="${id}">Filtrar esta lista</label><input id="${id}" name="q" type="search" placeholder="Filtrar esta lista" autocomplete="off"></div>
  ${options.length > 2 ? `<fieldset><legend>${legend}</legend><div class="filtro-grupo">${radios}</div></fieldset>` : ''}
</form>
<p class="contagem" data-contagem aria-live="polite"></p>`;
  }
  const emptyState = '<div class="vazio" data-vazio hidden><p>Nada encontrado com esses filtros.</p><button type="button" class="botao botao-linha botao-pequeno" data-limpar>Limpar filtros</button></div>';
  const platformOptions = items => [['', 'Todos'], ...Object.keys(PLATFORMS).filter(key => items.some(item => item.meta.plataformas.includes(key))).map(key => [key, PLATFORMS[key].label])];

  // ---------- páginas de categoria ----------
  function renderArea(area) {
    const ctx = newPage(), items = itemsOf(area), intro = site.intros[area];
    let content;
    if (area === 'apps') {
      const apps = items.filter(item => item.type === 'app'), connectors = items.filter(item => item.type === 'conector');
      content = `${filters('filtro-apps', {field: 'plataformas', legend: 'Funciona com', options: platformOptions(items)})}
<div class="pilha" data-lista>${apps.map(item => appCard(item, 2)).join('\n')}</div>
${connectors.length ? `<h2 class="subtitulo-lista">Conectores</h2><ul class="lista" data-lista>${connectors.map(item => row(item, 3)).join('\n')}</ul>` : ''}
<div class="proximos"><p><strong>Próximos conectores.</strong> Gemini e Grok só aceitam conectores pela internet, que o FosterMCP ainda não tem. Quando houver um novo conector testado, ele aparece aqui.</p></div>`;
    } else if (area === 'prompts') content = `${filters('filtro-prompts', {field: 'fontes', legend: 'Fonte', options: [['', 'Todas'], ...Object.entries(SOURCES).map(([key, {label}]) => [key, label])]})}${listFor(area, items, 2)}`;
    else if (area === 'tutoriais') {
      const subjects = [...new Set(items.map(item => item.meta.assunto))];
      content = `${filters('filtro-tutoriais', {field: 'assunto', legend: 'Assunto', options: [['', 'Todos'], ...subjects.map(subject => [normalize(subject), subject])]})}${listFor(area, items, 2)}`;
    } else content = `${filters(`filtro-${area}`, {field: 'plataformas', legend: 'Funciona com', options: platformOptions(items)})}${items.length ? listFor(area, items, 2) : '<p class="vazio">Ainda não há itens aqui.</p>'}`;
    const html = `<div class="container pagina">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><span aria-current="page">${AREAS[area].title}</span></li></ol></nav>
  <header class="pagina-topo"><h1>${AREAS[area].title}</h1><p class="lead">${esc(intro.resumo)}</p>${intro.body.trim() ? `<div class="texto pagina-intro">${ctx.md.source(intro.body)}</div>` : ''}</header>
  ${content}
  ${emptyState}
</div>`;
    files.set(`${area}/index.html`, layout({title: AREAS[area].title, description: intro.resumo, current: area, body: html, path: `${area}/`}));
  }

  // ---------- busca ----------
  function renderSearch() {
    const options = [['', 'Tudo'], ...Object.entries(AREAS).map(([key, area]) => [key, area.label])];
    const radios = options.map(([value, label], i) => `<label class="filtro"><input type="radio" name="area" value="${value}"${i === 0 ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
    const html = `<div class="container pagina">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><span aria-current="page">Buscar</span></li></ol></nav>
  <header class="pagina-topo"><h1>Buscar na central</h1><p class="lead">Digite uma palavra, como vencimentos, apresentação ou WhatsApp.</p></header>
  <form class="filtros" data-filtros hidden>
    <div class="filtros-busca">${icon('search')}<label class="visualmente-oculto" for="busca">Buscar</label><input id="busca" name="q" type="search" placeholder="Buscar na central" autocomplete="off"></div>
    <fieldset><legend>Onde procurar</legend><div class="filtro-grupo">${radios}</div></fieldset>
  </form>
  <p class="contagem" data-contagem aria-live="polite"></p>
  <ul class="lista" data-lista>${site.items.map(item => row(item, 2, {type: true})).join('\n')}</ul>
  ${emptyState}
</div>`;
    files.set('catalogo/index.html', layout({title: 'Buscar', description: 'Busca em todos os itens da central.', current: null, body: html, path: 'catalogo/'}));
  }

  // ---------- seções do Markdown ----------
  function sections(list, {md, nextId}, item = null) {
    const visible = list.filter(section => !HIDDEN_SECTIONS.has(section.key));
    const ids = visible.map(section => nextId(section.title));
    const html = visible.map((section, index) => {
      const id = ids[index];
      let inner;
      if (FAQ_SECTIONS.has(section.key)) {
        inner = md.tokens(section.intro) + `<div class="faq">${section.subsections.map(sub => `<div class="faq-item"><h3 id="${nextId(sub.title)}">${md.inline(sub.title)}</h3>${md.tokens(sub.tokens, {plain: true})}</div>`).join('')}</div>`;
      } else if (section.tabs?.panels.length > 1) {
        const group = section.tabs.group, key = `${id}-aba`;
        const buttons = section.tabs.panels.map((panel, i) => `<button type="button" role="tab" id="${key}-${panel.tab.key}" aria-controls="${key}-${panel.tab.key}-painel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-aba="${panel.tab.key}">${esc(panel.tab.label)}</button>`).join('');
        const soon = group === 'plataforma' && item ? (item.meta.plataformasEmBreve || []).map(platform => `<span class="aba-em-breve">${esc(PLATFORMS[platform].label)} · em breve</span>`).join('') : '';
        const panels = section.tabs.panels.map(panel => `<section class="aba-painel" role="tabpanel" id="${key}-${panel.tab.key}-painel" aria-labelledby="${key}-${panel.tab.key}" data-aba="${panel.tab.key}" tabindex="0">
<h3 class="aba-titulo">${esc(panel.tab.label)}</h3>
${md.tokens(panel.tokens)}</section>`).join('\n');
        inner = `${md.tokens(section.intro)}<div class="abas" data-grupo="${group}"><div class="abas-barra" hidden><div class="abas-lista" role="tablist" aria-label="${esc(section.title)}">${buttons}</div>${soon}</div>${panels}</div>`;
      } else if (section.tabs?.panels.length === 1) {
        const [panel] = section.tabs.panels;
        inner = `${md.tokens(section.intro)}<h3 id="${nextId(panel.tab.label)}">${esc(panel.tab.label)}</h3>${md.tokens(panel.tokens)}`;
      } else inner = md.tokens(section.tokens);
      return `<section class="secao" aria-labelledby="${id}">\n<h2 id="${id}">${md.inline(section.title)}</h2>\n${inner}</section>`;
    }).join('\n');
    const toc = visible.length > 2 ? `<nav class="sumario" aria-label="Nesta página"><p class="sumario-titulo">Nesta página</p><ol>${visible.map((section, i) => `<li><a href="#${ids[i]}">${md.inline(section.title)}</a></li>`).join('')}</ol></nav>` : '';
    return {html, toc};
  }

  // ---------- item ----------
  function itemActions(item) {
    const has = platform => item.meta.plataformas.includes(platform);
    if (item.meta.situacao === 'em-breve') return '<p class="acoes-nota">Ainda não disponível. Esta página mostra o que o item vai fazer.</p>';
    if (item.type === 'app' && item.meta.download && feed) {
      const {data, example} = feed, installers = config.fostermcp.arquivos;
      const update = item.sections.some(section => section.title === 'Atualizar');
      return `<div class="baixar" id="baixar">
  <a class="botao botao-ouro" href="${esc(config.latestDownload(installers.windows))}">Baixar para Windows · ${formatSize(data.windows.sizeBytes)}</a>
  <a class="botao botao-linha" href="${esc(config.latestDownload(installers.mac))}">Baixar para Mac · ${formatSize(data.mac.sizeBytes)}</a>
  ${update ? '<p class="acoes-nota">Já tem instalado? <a href="#atualizar">Veja como atualizar</a></p>' : ''}
  ${example ? '<p class="acoes-nota previa">Prévia: versão, data e tamanhos de exemplo.</p>' : ''}
  ${data.notes.length ? `<details class="conferir"><summary>O que mudou na versão ${esc(data.version)}</summary><ul>${data.notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul></details>` : ''}
  <details class="conferir"><summary>Conferir o arquivo (SHA-256)</summary>
    <p>Windows (PowerShell): <code>Get-FileHash .\\${esc(installers.windows)}</code></p><code class="hash">${esc(data.windows.sha256)}</code>
    <p>Mac (Terminal): <code>shasum -a 256 ${esc(installers.mac)}</code></p><code class="hash">${esc(data.mac.sha256)}</code>
  </details>
</div>`;
    }
    if (item.type === 'skill' && item.skill) {
      const targets = [['claude-desktop', 'no Claude Desktop'], ['claude-code', 'no Claude Code'], ['chatgpt-codex', 'no Codex']].filter(([key]) => has(key)).map(([, label]) => label);
      return `<div class="baixar">
  <a class="botao botao-ouro" href="${href(`${item.url}${item.slug}.zip`)}" download>Baixar a skill (.zip)</a>
  ${has('chatgpt') ? copyButton('instrucoes-skill', 'Copiar as instruções', 'botao-linha') : ''}
  <p class="acoes-nota">${targets.length ? `O .zip serve ${joinNames(targets)}.` : ''}${has('chatgpt') ? ' As instruções copiadas servem para o ChatGPT.' : ''}</p>
  ${has('chatgpt') ? `<template id="instrucoes-skill">${esc(item.skill.body)}</template>` : ''}
</div>`;
    }
    if (item.type === 'agente' && item.instructions) {
      const file = ['chatgpt-codex', 'claude-code', 'openclaw', 'hermes'].some(has);
      return `<div class="baixar">
  ${copyButton('instrucoes-agente', 'Copiar as instruções', 'botao-escuro')}
  ${file ? `<a class="botao botao-linha" href="${href(`${item.url}AGENTS.md`)}" download>Baixar AGENTS.md</a>` : ''}
</div>`;
    }
    if (item.type === 'prompt') return `<div class="baixar">${copyButton('texto-prompt', 'Copiar o prompt', 'botao-escuro')}</div>`;
    if (item.type === 'conector' && item.meta.app) {
      const app = site.items.find(other => other.id === item.meta.app);
      return `<div class="baixar"><a class="botao botao-ouro" href="${href(`${app.url}#baixar`)}">Baixar o ${esc(app.meta.titulo)}</a><p class="acoes-nota">O conector vem dentro do app.</p></div>`;
    }
    return '';
  }

  const NOTICES = {
    'em-teste': 'Em teste: ainda está sendo validado no piloto. Confira os resultados antes de usar com clientes.',
    'em-breve': 'Em breve: ainda não está disponível. Esta página mostra o que ele vai fazer e o que será preciso.',
  };

  function renderItem(item) {
    const ctx = newPage(), {meta} = item, area = areaOf(item);
    const body = sections(item.sections, ctx, item);
    const metaLine = [versionLine(item), item.type === 'app' && meta.compatibilidade ? esc(meta.compatibilidade) : '', item.type === 'tutorial' ? `${esc(meta.assunto)} · ${esc(meta.tempo)}` : ''].filter(Boolean).join(' · ');
    const notices = [NOTICES[meta.situacao] && ['situacao', NOTICES[meta.situacao]], meta.avancado && ['avancado', 'Avançado: exige instalar programas e editar arquivos de configuração. Se não tiver experiência, peça ajuda antes.']].filter(Boolean);
    let extra = '';
    if (item.type === 'prompt') extra = `<section class="secao" aria-labelledby="o-prompt"><h2 id="o-prompt">O prompt</h2><div class="caixa-prompt caixa-prompt-grande"><q id="texto-prompt">${esc(item.prompt)}</q>${copyButton('texto-prompt', 'Copiar')}</div><p class="nota">Troque o que está entre [colchetes] antes de enviar.</p></section>`;
    if (item.type === 'agente' && item.instructions) extra = `<details class="arquivo"><summary>Ver as instruções completas</summary><pre id="instrucoes-agente">${esc(item.instructions)}</pre></details>`;
    if (item.type === 'skill' && item.skill) extra = `<details class="arquivo"><summary>Ver o arquivo SKILL.md</summary><pre>${esc(item.skill.source.trim())}</pre></details>`;
    const actions = itemActions(item);
    const html = `<div class="container pagina">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><a href="${href(`${area}/`)}">${AREAS[area].label}</a></li><li><span aria-current="page">${esc(meta.titulo)}</span></li></ol></nav>
  <header class="item-topo${actions ? ' com-acoes' : ''}">
    <div>
      <div class="item-titulo"><h1>${esc(meta.titulo)}</h1>${badges(item)}</div>
      <p class="lead">${esc(meta.resumo)}</p>
      <p class="item-meta">${metaLine}</p>
      ${['tutorial', 'prompt'].includes(item.type) ? '' : `<div class="item-onde"><span class="rotulo">Onde funciona</span>${chips(item)}</div>`}
    </div>
    ${actions ? `<div class="item-acoes">${actions}</div>` : ''}
  </header>
  ${notices.map(([kind, text]) => `<p class="aviso aviso-${kind}">${esc(text)}</p>`).join('')}
  <div class="item-corpo${body.toc ? ' com-sumario' : ''}">
    ${body.toc}
    <article class="texto">${ctx.md.tokens(item.intro)}${item.type === 'prompt' ? extra : ''}${body.html}${item.type === 'prompt' ? '' : extra}</article>
  </div>
</div>`;
    files.set(`${item.url}index.html`, layout({title: meta.titulo, description: meta.resumo, current: area, body: html, path: item.url}));
  }

  // ---------- páginas de conteúdo (Ajuda) ----------
  function renderPage(page) {
    const ctx = newPage(), body = sections(page.sections, ctx);
    const html = `<div class="container pagina">
  <nav class="trilha" aria-label="Você está em"><ol><li><a href="${href('')}">Início</a></li><li><span aria-current="page">${esc(page.meta.titulo)}</span></li></ol></nav>
  <header class="pagina-topo"><h1>${esc(page.meta.titulo)}</h1><p class="lead">${esc(page.meta.resumo)}</p></header>
  <div class="item-corpo${body.toc ? ' com-sumario' : ''}">${body.toc}<article class="texto">${ctx.md.tokens(page.intro)}${body.html}</article></div>
</div>`;
    files.set(`${page.url}index.html`, layout({title: page.meta.titulo, description: page.meta.resumo, current: nav.some(([key]) => key === page.slug) ? page.slug : null, body: html, path: page.url}));
  }

  const redirect = (from, to, title) => files.set(`${from}index.html`, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${href(to)}"><meta name="robots" content="noindex"><link rel="canonical" href="${esc(new URL(to, config.endereco).href)}"><title>${esc(title)}</title></head><body><p><a href="${href(to)}">${esc(title)}</a></p></body></html>\n`);

  renderHome();
  renderSearch();
  for (const area of Object.keys(AREAS)) renderArea(area);
  for (const item of site.items) renderItem(item);
  for (const page of site.pages) renderPage(page);
  files.set('404.html', layout({title: 'Página não encontrada', body: `<div class="container pagina pagina-404"><h1>Página não encontrada</h1><p class="lead">O endereço mudou ou foi digitado com algum erro.</p><div class="acoes"><a class="botao botao-escuro" href="${href('')}">Ir para o início</a><a class="botao botao-linha" href="${href('catalogo/')}">Buscar na central</a></div></div>`, path: '404.html'}));
  // Endereços curtos: …/fostermcp/ leva à página do app; …/conectores/ leva a Apps e conectores.
  if (site.items.some(item => item.url === appUrl)) redirect(`${config.fostermcp.feed.split('/')[0]}/`, appUrl, 'Abrir a página do FosterMCP');
  redirect('conectores/', 'apps/', 'Abrir Aplicativos e conectores');
  return {files, pendingImages};
}
