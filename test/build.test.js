import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {build, BuildError, SITE_ROOT} from '../generator/build.js';
import {loadConfig} from '../generator/site-config.js';
import {siteCopy, cleanCopies, allFiles, htmlFiles, readZip, read} from './helpers.js';

after(cleanCopies);
const NOW = new Date('2026-10-16T15:00:00Z');

const prompt = (titulo, situacao, extra = '') => `---
titulo: ${titulo}
resumo: Prompt sintético para testar o ciclo de vida.
situacao: ${situacao}
plataformas: [claude-desktop]
fontes: [atlas]
atualizado: 2026-10-01
${extra}
---

## Prompt

Usando o FosterMCP, faça um teste.

## Quando usar

Em testes.
`;
const modelo = path => read(join(SITE_ROOT, 'catalog', path));
// O conteúdo real está quase todo em rascunho. Estes itens sintéticos publicam um de cada tipo e situação, para
// conferir cartões, listas, selos, avisos e arquivos para baixar.
const FIXTURES = {
  'catalog/skills/nome-da-skill/pagina.md': modelo('skills/_modelo/pagina.md'),
  'catalog/skills/nome-da-skill/SKILL.md': modelo('skills/_modelo/SKILL.md'),
  'catalog/agentes/agente-teste/pagina.md': modelo('agentes/_modelo/pagina.md'),
  'catalog/agentes/agente-teste/instrucoes.md': modelo('agentes/_modelo/instrucoes.md'),
  'catalog/agentes/agente-em-breve/pagina.md': `---
titulo: Agente em breve
resumo: Modelo de agente sintético que ainda não funciona.
situacao: em-breve
avancado: true
plataformas: [grokbot]
atualizado: 2026-10-01
---

## Para que serve

Teste.
`,
  'catalog/prompts/teste-novo.md': prompt('Prompt novo', 'em-teste'),
  'catalog/prompts/teste-defasado.md': prompt('Prompt defasado', 'defasado', 'substituido_por: prompts/teste-novo'),
  'catalog/prompts/teste-arquivado.md': prompt('Prompt arquivado', 'arquivado'),
  'catalog/prompts/teste-vencido.md': prompt('Prompt vencido', 'disponivel', 'revisar_ate: 2026-10-01'),
  'catalog/prompts/teste-em-dia.md': prompt('Prompt em dia', 'disponivel', 'revisar_ate: 2027-01-01'),
  'catalog/prompts/teste-revisao.md': prompt('Prompt em revisão', 'em-revisao'),
  'catalog/prompts/teste-rascunho.md': prompt('Prompt rascunho sintético', 'rascunho'),
  // Guia do quadro "Primeira vez aqui?" em revisão.
  'catalog/tutoriais/guia-teste.md': `---
titulo: Guia de teste
resumo: Tutorial sintético em revisão.
situacao: em-revisao
plataformas: [claude-desktop]
assunto: Começo
tempo: 5 min
atualizado: 2026-10-01
---

## Passo a passo

1. **Abra o assistente.** Teste.
`,
  'conteudo/inicio.yml': read(join(SITE_ROOT, 'conteudo/inicio.yml')).replace(/^  link: .*$/m, '  link: /tutoriais/guia-teste/'),
};

async function generate(files = {}, settings = {}) {
  const root = siteCopy(files, settings);
  const out = join(root, '_site');
  const result = await build({root, out, now: NOW});
  const pages = htmlFiles(out);
  const html = Object.fromEntries(pages.map(page => [page, read(join(out, page))]));
  const ids = Object.fromEntries(Object.entries(html).map(([page, text]) => [page, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]))]));
  return {root, out, result, pages, html, ids};
}
// real: o conteúdo do repositório como está. completo: o mesmo, mais os itens sintéticos. vazio: sem nenhuma skill,
// agente ou prompt. Os testes do gerador usam completo e vazio, para não quebrar quando o conteúdo mudar.
const real = await generate();
const completo = await generate(FIXTURES);
const vazio = await generate({
  'catalog/skills': null, 'catalog/agentes': null, 'catalog/prompts': null,
  'catalog/tutoriais/guia-pronto.md': FIXTURES['catalog/tutoriais/guia-teste.md'].replace('situacao: em-revisao', 'situacao: disponivel').replace('Guia de teste', 'Guia pronto'),
  'conteudo/inicio.yml': read(join(SITE_ROOT, 'conteudo/inicio.yml')).replace(/^  link: .*$/m, '  link: /tutoriais/guia-pronto/'),
});
const {base} = real.result.config;

const feedFor = config => ({
  version: '9.8.7', publishedAt: '2026-11-02T13:00:00.000Z', downloadPage: config.downloadPage,
  windows: {url: config.versionDownload('9.8.7', config.fostermcp.arquivos.windows), sha256: createHash('sha256').update('w').digest('hex'), sizeBytes: 52428800},
  mac: {url: config.versionDownload('9.8.7', config.fostermcp.arquivos.mac), sha256: createHash('sha256').update('m').digest('hex'), sizeBytes: 73400320},
  notes: ['Novidade sintética.'],
});
const writeFeed = async root => {
  const {config} = await loadConfig(root);
  mkdirSync(dirname(join(root, 'public', config.fostermcp.feed)), {recursive: true});
  writeFileSync(join(root, 'public', config.fostermcp.feed), `${JSON.stringify(feedFor(config), null, 2)}\n`);
  return config;
};
// Arquivos de texto gerados (HTML, CSS, JS, txt...), para procurar rastros de rascunhos.
const textFiles = out => allFiles(out).filter(path => !/\.(woff2|png|jpe?g|webp|zip)$/.test(path)).map(path => [path, read(join(out, path))]);

test('gera início, busca, categorias, itens, ajuda e 404, com endereços curtos para o app e os conectores', () => {
  const {pages, html, out} = real;
  for (const page of ['index.html', '404.html', 'catalogo/index.html', 'ajuda/index.html', 'apps/index.html', 'skills/index.html', 'agentes/index.html', 'prompts/index.html',
    'tutoriais/index.html', 'apps/fostermcp/index.html'])
    assert.ok(pages.includes(page), page);
  assert.ok(existsSync(join(out, '.nojekyll')));
  assert.match(html['fostermcp/index.html'], new RegExp(`url=${base}apps/fostermcp/`), 'endereço curto leva à página do app');
  assert.match(html['conectores/index.html'], new RegExp(`url=${base}apps/`), '/conectores/ leva a Apps e conectores');
  // O relatório do build separa as situações.
  const {result} = completo;
  assert.ok(result.soon.includes('agentes/agente-em-breve'));
  assert.ok(result.testing.includes('prompts/teste-novo'));
  assert.ok(result.reviewing.includes('prompts/teste-revisao'));
  assert.ok(result.drafts.includes('prompts/teste-rascunho'));
});

test('rascunho não entra no site: sem página, sem listas, sem busca e sem arquivo para baixar', () => {
  // Conteúdo real: nenhum dos rascunhos deixa endereço em qualquer arquivo gerado.
  const files = textFiles(real.out);
  for (const id of real.result.drafts) {
    assert.equal(existsSync(join(real.out, id)), false, `${id}: pasta gerada`);
    for (const [path, text] of files) assert.ok(!text.includes(`${base}${id}/`), `${path} cita ${id}`);
  }
  // Itens sintéticos: o rascunho some, e o título dele também; os outros itens aparecem.
  assert.equal(existsSync(join(completo.out, 'prompts/teste-rascunho')), false);
  for (const [path, text] of textFiles(completo.out)) assert.doesNotMatch(text, /Prompt rascunho sintético|teste-rascunho/, path);
  assert.match(completo.html['prompts/index.html'], /Prompt novo/);
  assert.deepEqual(completo.result.drafts.filter(id => id.startsWith('prompts/teste')), ['prompts/teste-rascunho']);
});

test('tipos sem item publicado mostram só a frase de "em breve", na página e na Início', () => {
  const {html} = vazio;
  assert.match(html['skills/index.html'], /<p class="vazio">Em breve\. As primeiras skills estão sendo preparadas\.<\/p>/);
  for (const area of ['skills', 'agentes', 'prompts']) {
    assert.match(html[`${area}/index.html`], /<p class="vazio">Em breve\. [^<]+ sendo preparad[ao]s\.<\/p>/, area);
    assert.doesNotMatch(html[`${area}/index.html`], /data-filtros|data-lista|data-vazio/, `${area}: sem filtros, contagem nem lista`);
    // Na Início a seção continua, com a mesma frase e sem "Ver todos".
    const section = html['index.html'].match(new RegExp(`<section class="categoria" aria-labelledby="${area}">[\\s\\S]*?</section>`))[0];
    assert.match(section, /<p class="vazio">Em breve\. /, area);
    assert.doesNotMatch(section, /ver-todos/, area);
  }
  // Com itens publicados, as listas voltam, sem a frase.
  for (const page of ['tutoriais/index.html', 'apps/index.html']) {
    assert.match(html[page], /data-lista/, page);
    assert.doesNotMatch(html[page], /<p class="vazio">/, page);
  }
  for (const area of ['skills', 'agentes', 'prompts']) {
    assert.match(completo.html[`${area}/index.html`], /data-lista/, area);
    assert.doesNotMatch(completo.html[`${area}/index.html`], /<p class="vazio">/, area);
  }
  // A Início conta os prompts da lista (sem arquivados nem rascunhos).
  const listed = completo.html['prompts/index.html'].match(/<li class="linha-prompt"/g).length;
  assert.match(completo.html['index.html'], new RegExp(`<a class="ver-todos" href="[^"]*prompts/">Ver todos \\(${listed}\\)`));
});

test('em revisão: selo nas listas, na página e no quadro "Primeira vez aqui?", com aviso no topo', () => {
  const {html} = completo;
  const revisao = '<span class="selo selo-revisao">Em revisão</span>';
  for (const page of ['tutoriais/index.html', 'catalogo/index.html', 'tutoriais/guia-teste/index.html', 'prompts/teste-revisao/index.html']) assert.ok(html[page].includes(revisao), page);
  assert.match(html['tutoriais/guia-teste/index.html'], /<p class="aviso aviso-situacao">Em revisão: este material está sendo conferido e pode mudar\.<\/p>/);
  assert.match(html['index.html'], new RegExp(`<p class="primeira-vez-acao"><a class="botao botao-escuro botao-pequeno" href="${base}tutoriais/guia-teste/">Abrir o guia completo</a>${revisao}</p>`));
  // Prompt em revisão mostra o selo, que prompts disponíveis não têm.
  assert.match(html['prompts/index.html'], new RegExp(`Prompt em revisão</a>${revisao}`));
  assert.doesNotMatch(html['prompts/index.html'], /Prompt em dia<\/a><span class="selo selo-ok">/);
  // Guia disponível: o botão fica sozinho, sem selo.
  assert.match(vazio.html['index.html'], new RegExp(`href="${base}tutoriais/guia-pronto/">Abrir o guia completo</a></p>`));
});

test('modo prévia com downloads desligados: faixa em todas as páginas, noindex, robots.txt fechado e nenhum link de instalador', () => {
  for (const {html, out} of [real, completo]) {
    for (const [page, text] of Object.entries(html)) {
      if (!text.includes('<main')) continue;
      assert.match(text, /<p class="faixa-previa"><span class="container">Prévia em teste — conteúdo em construção<\/span><\/p>/, page);
      assert.match(text, /<meta name="robots" content="noindex, nofollow">/, page);
      assert.doesNotMatch(text, /\/releases\//, `${page}: link para instalador que ainda não existe`);
    }
    assert.equal(read(join(out, 'robots.txt')), 'User-agent: *\nDisallow: /\n');
    assert.equal(existsSync(join(out, 'fostermcp/version.json')), false);
  }
  const {html} = real;
  for (const page of ['index.html', 'apps/index.html', 'apps/fostermcp/index.html'])
    assert.match(html[page], /<span class="botao botao-desativado" aria-disabled="true">Download liberado após a validação<\/span>/, page);
  assert.match(html['apps/fostermcp/index.html'], /Os instaladores ainda não estão publicados\./);
  assert.doesNotMatch(html['apps/fostermcp/index.html'], /Versão \d/, 'sem versão inventada sem o version.json');
});

test('ciclo de vida: defasado com substituto, arquivado fora das listas e da busca, revisão vencida', () => {
  const {html} = completo;
  const lists = ['index.html', 'prompts/index.html', 'catalogo/index.html'].map(page => html[page]).join('\n');
  // Defasado continua nas listas, com selo, aviso e link para o substituto.
  assert.match(html['prompts/index.html'], /Prompt defasado/);
  assert.match(html['prompts/teste-defasado/index.html'], /<span class="selo selo-defasado">Defasado<\/span>/);
  assert.match(html['prompts/teste-defasado/index.html'], new RegExp(`<p class="aviso aviso-defasado">Defasado: [^<]+ Use no lugar: <a href="${base}prompts/teste-novo/">Prompt novo</a>\\.</p>`));
  // Arquivado sai das listas e da busca, mas a página continua no ar com o aviso.
  assert.doesNotMatch(lists, /Prompt arquivado|teste-arquivado/);
  assert.match(html['prompts/teste-arquivado/index.html'], /<span class="selo selo-arquivado">Arquivado<\/span>/);
  assert.match(html['prompts/teste-arquivado/index.html'], /<p class="aviso aviso-arquivado">Arquivado: /);
  // Revisão vencida: selo e aviso já visíveis no build. No prazo: escondidos, e o navegador revela na data.
  assert.match(html['prompts/teste-vencido/index.html'], /<span class="selo selo-revisar" data-revisar-ate="2026-10-01">Pode estar desatualizado<\/span>/);
  assert.match(html['prompts/teste-vencido/index.html'], /<p class="aviso aviso-revisar" data-revisar-ate="2026-10-01">Pode estar desatualizado: a revisão deste material estava marcada para 01\/10\/2026\.<\/p>/);
  assert.match(html['prompts/index.html'], /<span class="selo selo-revisar" data-revisar-ate="2026-10-01">Pode estar desatualizado/);
  assert.match(html['prompts/teste-em-dia/index.html'], /<span class="selo selo-revisar" data-revisar-ate="2027-01-01" hidden>/);
  assert.match(html['prompts/teste-em-dia/index.html'], /<p class="aviso aviso-revisar" data-revisar-ate="2027-01-01" hidden>/);
  assert.match(read(join(completo.out, 'assets/site.js')), /data-revisar-ate/, 'o navegador revela o selo quando a data passa');
});

test('segue o formato do portal: cabeçalho com assinatura e navegação, selos, abas com "em breve" e passo a passo', () => {
  const app = real.html['apps/fostermcp/index.html'];
  assert.match(app, /<span class="assinatura-nome">FOSTER<\/span>.*<span class="assinatura-complemento">PARTNERS<\/span>.*<span class="produto">Central de IA<\/span>/s);
  for (const label of ['Início', 'Apps e conectores', 'Skills', 'Agentes', 'Prompts', 'Tutoriais', 'Ajuda']) assert.match(app, new RegExp(`<a href="[^"]*"[^>]*>${label}</a>`), label);
  assert.match(app, /<span class="selo selo-ok">Disponível<\/span>/);
  assert.match(app, /<span class="aba-em-breve">Gemini · em breve<\/span><span class="aba-em-breve">Grok · em breve<\/span>/);
  assert.match(app, /<ol class="passos">/);
  assert.match(app, /class="smartscreen"/);
  assert.match(app, /<nav class="sumario" aria-label="Nesta página">/);
  assert.match(real.html['index.html'], /Primeira vez aqui\? Siga esta ordem/);
  assert.match(real.html['index.html'], /Exemplo de uso com dados fictícios/);
  // Agentes em breve e avançados mostram os dois selos, inclusive nas listas, e não oferecem instruções para copiar.
  const {html} = completo;
  for (const page of ['agentes/agente-em-breve/index.html', 'agentes/index.html', 'index.html']) assert.match(html[page], /<span class="selo selo-breve">Em breve<\/span><span class="selo selo-avancado">Avançado<\/span>/, page);
  assert.match(html['agentes/agente-em-breve/index.html'], /Onde vai funcionar/);
  assert.match(html['agentes/agente-em-breve/index.html'], /Ainda não disponível/);
  assert.doesNotMatch(html['agentes/agente-em-breve/index.html'], /Copiar as instruções/);
  assert.match(html['index.html'], /<span class="rotulo">Exemplo de resultado<\/span><div class="resultado resultado-memo">/, 'cartão de skill na Início');
  assert.match(html['prompts/index.html'], /<legend>Fonte<\/legend>/);
});

test('todo link interno aponta para uma página ou arquivo que existe, inclusive as âncoras', () => {
  const broken = [];
  // A cópia vazio fica de fora: ela tira pastas inteiras, e links do conteúdo para elas quebrariam só ali.
  for (const {html, ids, out} of [real, completo]) for (const [page, text] of Object.entries(html)) {
    for (const [, attribute, value] of text.matchAll(/\s(href|src|action)="([^"]*)"/g)) {
      const url = value.replaceAll('&amp;', '&');
      if (/^(https:\/\/|mailto:)/.test(url)) continue;
      if (/^http:/.test(url)) { broken.push(`${page}: link sem https ${url}`); continue; }
      if (url.startsWith('#')) { if (url.length > 1 && !ids[page].has(decodeURIComponent(url.slice(1)))) broken.push(`${page}: âncora ${url}`); continue; }
      if (!url.startsWith(base)) { broken.push(`${page}: link fora da base ${url}`); continue; }
      const [path, hash] = url.slice(base.length).split('?')[0].split('#');
      const target = path === '' || path.endsWith('/') ? `${path}index.html` : path;
      if (!existsSync(join(out, decodeURIComponent(target)))) { broken.push(`${page}: ${attribute}=${url}`); continue; }
      if (hash && target.endsWith('.html') && !ids[target]?.has(decodeURIComponent(hash))) broken.push(`${page}: âncora ${url}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('sem rastreadores nem recursos de fora: scripts, estilos, fontes e imagens são do próprio site', () => {
  for (const {html} of [real, completo]) for (const [page, text] of Object.entries(html)) {
    assert.doesNotMatch(text, /<script(?![^>]*\ssrc=)[^>]*>/, `${page}: script embutido violaria a CSP`);
    assert.doesNotMatch(text, /\sstyle="/, `${page}: estilo embutido violaria a CSP`);
    assert.doesNotMatch(text, /<(?:script|img)[^>]*\ssrc="https?:/, `${page}: recurso externo`);
    assert.doesNotMatch(text, /<link(?![^>]*rel="canonical")[^>]*href="https?:/, `${page}: folha de estilo, fonte ou ícone externo`);
    if (!text.includes('<main')) continue;
    assert.match(text, /<meta http-equiv="Content-Security-Policy" content="default-src 'self';/, page);
  }
  const css = read(join(real.out, 'assets/site.css'));
  assert.doesNotMatch(css, /url\(\s*['"]?(https?:)?\/\//, 'o CSS não busca nada fora do site');
  assert.match(css, /^:root\{--noite:#171E2D;--marinho:#182949;/, 'as cores oficiais vêm de config.js');
  for (const font of ['manrope.woff2', 'cormorant-garamond-500.woff2', 'OFL-manrope.txt', 'OFL-cormorant-garamond.txt']) assert.ok(existsSync(join(real.out, 'assets/fontes', font)), font);
  assert.doesNotMatch(read(join(real.out, 'assets/site.js')), /fetch\(|XMLHttpRequest|sendBeacon|navigator\.geolocation/);
});

test('acessibilidade básica: idioma, um h1, sem saltos de título, ids únicos, textos alternativos e rótulos', () => {
  for (const {html} of [real, completo, vazio]) for (const [page, text] of Object.entries(html)) {
    assert.match(text, /<html lang="pt-BR">/, page);
    if (!text.includes('<main')) continue;
    assert.equal(text.match(/<h1[\s>]/g)?.length, 1, `${page}: um h1`);
    let previous = 1;
    for (const [, level] of text.matchAll(/<h([1-6])[\s>]/g)) {
      assert.ok(Number(level) <= previous + 1, `${page}: título h${level} depois de h${previous}`);
      previous = Number(level);
    }
    const all = [...text.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(all).size, all.length, `${page}: ids repetidos ${all.filter((id, i) => all.indexOf(id) !== i)}`);
    for (const [img] of text.matchAll(/<img[^>]*>/g)) assert.match(img, /\salt="[^"]+"/, `${page}: ${img}`);
    for (const [, attributes, inner] of text.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g))
      assert.ok(/aria-label="[^"]+"/.test(attributes) || inner.replace(/<[^>]+>/g, '').trim(), `${page}: botão sem nome`);
    for (const [, id] of text.matchAll(/<input[^>]*\sid="([^"]+)"[^>]*>/g)) assert.match(text, new RegExp(`<label[^>]*for="${id}"`), `${page}: campo ${id} sem rótulo`);
  }
});

test('cada skill com SKILL.md vira um .zip com a pasta na raiz; os agentes viram AGENTS.md; rascunhos e itens em breve não', () => {
  const {out, root} = completo;
  const entries = readZip(readFileSync(join(out, 'skills/nome-da-skill/nome-da-skill.zip')));
  assert.deepEqual(entries.map(entry => entry.name), ['nome-da-skill/', 'nome-da-skill/SKILL.md'], 'o .zip leva só o SKILL.md, sem a página do site');
  assert.equal(entries[1].data.toString('utf8'), read(join(root, 'catalog/skills/nome-da-skill/SKILL.md')));
  assert.equal(read(join(out, 'agentes/agente-teste/AGENTS.md')), `${read(join(root, 'catalog/agentes/agente-teste/instrucoes.md')).trim()}\n`);
  assert.equal(existsSync(join(out, 'agentes/agente-em-breve/AGENTS.md')), false, 'agente em breve não tem instruções para baixar');
  // Rascunhos não geram arquivo para baixar.
  for (const id of real.result.drafts) assert.ok(!allFiles(real.out).some(path => path.startsWith(`${id}/`)), id);
});

test('downloads: true liga os botões com versão, data e tamanhos; a prévia continua com faixa e noindex', async () => {
  const copy = siteCopy({}, {downloads: true});
  await assert.rejects(build({root: copy, out: join(copy, '_downloads')}), error => error instanceof BuildError && /npm run release antes de trocar downloads para true/.test(error.problems.join()));
  const config = await writeFeed(copy);
  const built = await build({root: copy, out: join(copy, '_downloads')});
  assert.equal(built.feed.version, '9.8.7');
  const page = read(join(copy, '_downloads/apps/fostermcp/index.html'));
  for (const name of Object.values(config.fostermcp.arquivos)) {
    assert.equal(config.latestDownload(name), `https://github.com/${config.repositorio}/releases/latest/download/${name}`);
    assert.ok(page.includes(`href="${config.latestDownload(name)}"`), `${name}: botão leva ao instalador mais recente`);
    assert.ok(read(join(copy, '_downloads/index.html')).includes(`href="${config.latestDownload(name)}"`), `${name}: botão no cartão da Início`);
  }
  assert.match(page, /Baixar para Windows · 50 MB/);
  assert.match(page, /Baixar para Mac · 70 MB/);
  assert.match(page, /Versão 9\.8\.7 · 02\/11\/2026/);
  assert.match(page, /Novidade sintética\./);
  assert.doesNotMatch(page, /Download liberado após a validação/);
  assert.match(page, /<p class="faixa-previa">/, 'a prévia continua');
  assert.match(page, /<meta name="robots" content="noindex, nofollow">/);
  assert.equal(read(join(copy, '_downloads', config.fostermcp.feed)), read(join(copy, 'public', config.fostermcp.feed)));
});

test('fora da prévia (previa: false) some a faixa; indexar decide o noindex e downloads continua valendo sozinho', async () => {
  const copy = siteCopy({}, {previa: false});
  await build({root: copy, out: join(copy, '_lancamento')});
  const page = read(join(copy, '_lancamento/apps/fostermcp/index.html'));
  assert.doesNotMatch(page, /faixa-previa/);
  assert.match(page, /Download liberado após a validação/, 'sem downloads: true, nenhum botão de instalador');
  assert.match(page, /<meta name="robots" content="noindex, nofollow">/, 'com indexar: false os buscadores continuam avisados');
  // indexar: true (fora da prévia) libera os buscadores.
  const open = siteCopy({}, {previa: false, indexar: true});
  await build({root: open, out: join(open, '_site')});
  assert.doesNotMatch(read(join(open, '_site/index.html')), /name="robots"/);
  assert.equal(read(join(open, '_site/robots.txt')), 'User-agent: *\nAllow: /\n');
});
