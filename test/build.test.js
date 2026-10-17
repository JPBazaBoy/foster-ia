import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {build, BuildError} from '../generator/build.js';
import {loadConfig} from '../generator/site-config.js';
import {siteCopy, cleanCopies, htmlFiles, readZip, read} from './helpers.js';

after(cleanCopies);
const root = siteCopy();
const out = join(root, '_site');
const result = await build({root, out, now: new Date('2026-10-16T15:00:00Z')});
const {base} = result.config;
const pages = htmlFiles(out);
const html = Object.fromEntries(pages.map(page => [page, read(join(out, page))]));
const ids = Object.fromEntries(Object.entries(html).map(([page, text]) => [page, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]))]));

test('gera início, busca, categorias, itens, ajuda e 404, e o version.json de exemplo só na prévia', () => {
  for (const page of ['index.html', '404.html', 'catalogo/index.html', 'ajuda/index.html', 'apps/index.html', 'skills/index.html', 'agentes/index.html', 'prompts/index.html',
    'tutoriais/index.html', 'apps/fostermcp/index.html', 'skills/apresentacao-cliente/index.html', 'skills/resumo-vencimentos/index.html',
    'agentes/fostermcp-grokbot/index.html', 'agentes/fostermcp-hermes/index.html', 'prompts/preparar-reuniao/index.html', 'tutoriais/primeiros-passos/index.html'])
    assert.ok(pages.includes(page), page);
  assert.equal(result.example, true);
  assert.equal(existsSync(join(out, 'fostermcp/version.json')), false, 'o exemplo nunca é publicado como version.json');
  assert.match(html['apps/fostermcp/index.html'], /Prévia: versão, data e tamanhos de exemplo/);
  assert.ok(existsSync(join(out, '.nojekyll')));
  assert.deepEqual(result.soon.sort(), ['agentes/fostermcp-grokbot', 'agentes/fostermcp-hermes', 'skills/resumo-vencimentos']);
});

test('segue o formato do portal: cabeçalho com assinatura e navegação, selos, abas com "em breve" e passo a passo', () => {
  const app = html['apps/fostermcp/index.html'];
  assert.match(app, /<span class="assinatura-nome">FOSTER<\/span>.*<span class="assinatura-complemento">PARTNERS<\/span>.*<span class="produto">Central de IA<\/span>/s);
  for (const label of ['Início', 'Apps e conectores', 'Skills', 'Agentes', 'Prompts', 'Tutoriais', 'Ajuda']) assert.match(app, new RegExp(`<a href="[^"]*"[^>]*>${label}</a>`), label);
  assert.match(app, /<span class="selo selo-ok">Disponível<\/span>/);
  assert.match(app, /<span class="aba-em-breve">Gemini · em breve<\/span><span class="aba-em-breve">Grok · em breve<\/span>/);
  assert.match(app, /<ol class="passos">/);
  assert.match(app, /class="smartscreen"/);
  assert.match(app, /<nav class="sumario" aria-label="Nesta página">/);
  // Agentes em breve e avançados mostram os dois selos, inclusive nas listas, e não oferecem instruções para copiar.
  for (const page of ['agentes/fostermcp-grokbot/index.html', 'agentes/index.html', 'index.html']) assert.match(html[page], /<span class="selo selo-breve">Em breve<\/span><span class="selo selo-avancado">Avançado<\/span>/, page);
  assert.match(html['agentes/fostermcp-grokbot/index.html'], /Onde vai funcionar/);
  assert.match(html['agentes/fostermcp-hermes/index.html'], /Ainda não disponível/);
  assert.doesNotMatch(html['agentes/fostermcp-hermes/index.html'], /Copiar as instruções/);
  assert.match(html['index.html'], /Primeira vez aqui\? Siga esta ordem/);
  assert.match(html['index.html'], /Exemplo de uso com dados fictícios/);
  assert.match(html['prompts/index.html'], /<legend>Fonte<\/legend>/);
});

test('todo link interno aponta para uma página ou arquivo que existe, inclusive as âncoras', () => {
  const broken = [];
  for (const [page, text] of Object.entries(html)) {
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
  for (const [page, text] of Object.entries(html)) {
    assert.doesNotMatch(text, /<script(?![^>]*\ssrc=)[^>]*>/, `${page}: script embutido violaria a CSP`);
    assert.doesNotMatch(text, /\sstyle="/, `${page}: estilo embutido violaria a CSP`);
    assert.doesNotMatch(text, /<(?:script|img)[^>]*\ssrc="https?:/, `${page}: recurso externo`);
    assert.doesNotMatch(text, /<link(?![^>]*rel="canonical")[^>]*href="https?:/, `${page}: folha de estilo, fonte ou ícone externo`);
    if (!text.includes('<main')) continue;
    assert.match(text, /<meta http-equiv="Content-Security-Policy" content="default-src 'self';/, page);
    assert.match(text, /<meta name="robots" content="noindex, nofollow">/, `${page}: indexar: false em config.js`);
  }
  const css = read(join(out, 'assets/site.css'));
  assert.doesNotMatch(css, /url\(\s*['"]?(https?:)?\/\//, 'o CSS não busca nada fora do site');
  assert.match(css, /^:root\{--noite:#171E2D;--marinho:#182949;/, 'as cores oficiais vêm de config.js');
  for (const font of ['manrope.woff2', 'cormorant-garamond-500.woff2', 'OFL-manrope.txt', 'OFL-cormorant-garamond.txt']) assert.ok(existsSync(join(out, 'assets/fontes', font)), font);
  assert.doesNotMatch(read(join(out, 'assets/site.js')), /fetch\(|XMLHttpRequest|sendBeacon|navigator\.geolocation/);
});

test('acessibilidade básica: idioma, um h1, sem saltos de título, ids únicos, textos alternativos e rótulos', () => {
  for (const [page, text] of Object.entries(html)) {
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

test('cada skill com SKILL.md vira um .zip com a pasta na raiz; os agentes viram AGENTS.md', () => {
  for (const slug of ['apresentacao-cliente', 'briefing-reuniao', 'consultas-fostermcp']) {
    const entries = readZip(readFileSync(join(out, `skills/${slug}/${slug}.zip`)));
    assert.deepEqual(entries.map(entry => entry.name), [`${slug}/`, `${slug}/SKILL.md`]);
    assert.equal(entries[1].data.toString('utf8'), read(join(root, `catalog/skills/${slug}/SKILL.md`)));
  }
  assert.equal(existsSync(join(out, 'skills/resumo-vencimentos/resumo-vencimentos.zip')), false, 'skill em breve não tem .zip');
  assert.equal(read(join(out, 'agentes/assistente-pre-reuniao/AGENTS.md')), `${read(join(root, 'catalog/agentes/assistente-pre-reuniao/instrucoes.md')).trim()}\n`);
  for (const slug of ['fostermcp-grokbot', 'fostermcp-hermes']) assert.equal(existsSync(join(out, `agentes/${slug}/AGENTS.md`)), false, slug);
});

test('os botões de download usam o instalador mais recente do repositório público', async () => {
  const {config} = await loadConfig(root);
  const page = html['apps/fostermcp/index.html'];
  for (const name of Object.values(config.fostermcp.arquivos)) assert.ok(page.includes(`href="https://github.com/${config.repositorio}/releases/latest/download/${name}"`), name);
  assert.match(html['fostermcp/index.html'], new RegExp(`url=${base}apps/fostermcp/`), 'endereço curto leva à página do app');
  assert.match(html['conectores/index.html'], new RegExp(`url=${base}apps/`), '/conectores/ leva a Apps e conectores');
});

test('com o version.json real, a página mostra versão, data, tamanhos e novidades dele, e a publicação aceita', async () => {
  const copy = siteCopy();
  const {config} = await loadConfig(copy);
  await assert.rejects(build({root: copy, out: join(copy, '_publicar'), publish: true}), error => error instanceof BuildError && /site-release/.test(error.problems.join()));
  const feed = {
    version: '9.8.7', publishedAt: '2026-11-02T13:00:00.000Z', downloadPage: config.downloadPage,
    windows: {url: config.versionDownload('9.8.7', config.fostermcp.arquivos.windows), sha256: createHash('sha256').update('w').digest('hex'), sizeBytes: 52428800},
    mac: {url: config.versionDownload('9.8.7', config.fostermcp.arquivos.mac), sha256: createHash('sha256').update('m').digest('hex'), sizeBytes: 73400320},
    notes: ['Novidade sintética.'],
  };
  mkdirSync(join(copy, 'public/fostermcp'), {recursive: true});
  writeFileSync(join(copy, 'public', config.fostermcp.feed), `${JSON.stringify(feed, null, 2)}\n`);
  const published = await build({root: copy, out: join(copy, '_publicar'), publish: true});
  assert.equal(published.example, false);
  const page = read(join(copy, '_publicar/apps/fostermcp/index.html'));
  assert.match(page, /Baixar para Windows · 50 MB/);
  assert.match(page, /Baixar para Mac · 70 MB/);
  assert.match(page, /Versão 9\.8\.7 · 02\/11\/2026/);
  assert.match(page, /Novidade sintética\./);
  assert.doesNotMatch(page, /de exemplo/);
  assert.equal(read(join(copy, '_publicar', config.fostermcp.feed)), read(join(copy, 'public', config.fostermcp.feed)));
});
