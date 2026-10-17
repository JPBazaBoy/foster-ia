import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkFeed} from '../generator/feed.js';
import {loadConfig} from '../generator/site-config.js';
import {SITE_ROOT, loadFeed, BuildError} from '../generator/build.js';
import {siteCopy, cleanCopies} from './helpers.js';

after(cleanCopies);
const {config} = await loadConfig(SITE_ROOT);
const options = {feedUrl: config.feedUrl, downloadPage: config.downloadPage, versionDownload: config.versionDownload, files: config.fostermcp.arquivos};
const valid = () => ({
  version: '1.2.3',
  publishedAt: '2026-10-16T12:00:00.000Z',
  downloadPage: config.downloadPage,
  windows: {url: config.versionDownload('1.2.3', config.fostermcp.arquivos.windows), sha256: 'a'.repeat(64), sizeBytes: 1000},
  mac: {url: config.versionDownload('1.2.3', config.fostermcp.arquivos.mac), sha256: 'b'.repeat(64), sizeBytes: 2000},
  notes: ['Nota.'],
});
const REAL = join(SITE_ROOT, 'public', config.fostermcp.feed);
// No repositório privado, o contrato também é conferido pelo próprio leitor do app.
const appUpdates = join(SITE_ROOT, '..', 'src', 'updates.js');
const parseUpdateFeed = existsSync(appUpdates) ? (await import(pathToFileURL(appUpdates).href)).parseUpdateFeed : null;

test('o app lê o version.json pelo endereço raw do repositório e só aceita links ali ou em github.com', () => {
  // Endereço que não depende do domínio do site: é o que vai no updateFeedUrl do app.
  assert.equal(config.feedUrl, `https://raw.githubusercontent.com/${config.repositorio}/main/public/${config.fostermcp.feed}`);
  assert.equal(new URL(config.downloadPage).host, 'github.com');
  assert.equal(new URL(config.versionDownload('1.2.3', config.fostermcp.arquivos.windows)).host, 'github.com');
  assert.deepEqual(checkFeed(valid(), options), []);
});

test('o contrato recusa campos fora do padrão, links de outros hosts e valores inválidos', () => {
  const cases = {
    'versão sem semver': feed => { feed.version = 'v1.2'; },
    'data inválida': feed => { feed.publishedAt = 'amanhã'; },
    'link com ?': feed => { feed.downloadPage += '?x=1'; },
    'página de outro host': feed => { feed.downloadPage = 'https://exemplo.com/apps/fostermcp/'; },
    'instalador fora do GitHub': feed => { feed.windows.url = 'https://exemplo.com/FosterMCP-Windows.exe'; },
    'instalador de outra versão': feed => { feed.mac.url = config.versionDownload('1.2.2', config.fostermcp.arquivos.mac); },
    'sha256 curto': feed => { feed.windows.sha256 = 'abc'; },
    'tamanho zero': feed => { feed.mac.sizeBytes = 0; },
    'nota longa': feed => { feed.notes = ['x'.repeat(501)]; },
    'campo desconhecido': feed => { feed.extra = true; },
    'sem mac': feed => { delete feed.mac; },
  };
  for (const [name, change] of Object.entries(cases)) {
    const feed = valid();
    change(feed);
    assert.ok(checkFeed(feed, options).length > 0, name);
  }
});

test('na prévia o version.json é opcional; fora dela o build exige o arquivo e confere o contrato', async () => {
  const root = siteCopy();
  assert.equal(await loadFeed(root, {...config, previa: true}), null);
  await assert.rejects(loadFeed(root, {...config, previa: false}), error => error instanceof BuildError && /npm run release/.test(error.problems[0]));
  mkdirSync(join(root, 'public/fostermcp'), {recursive: true});
  writeFileSync(join(root, 'public', config.fostermcp.feed), JSON.stringify({...valid(), version: 'v1'}));
  await assert.rejects(loadFeed(root, {...config, previa: true}), error => error instanceof BuildError && /version: versão no formato/.test(error.problems.join()), 'um arquivo presente sempre é conferido');
});

test('o version.json publicado (quando existe) segue o contrato do site e o do app', {skip: !existsSync(REAL) && 'ainda não há version.json real'}, () => {
  const raw = JSON.parse(readFileSync(REAL, 'utf8'));
  assert.deepEqual(checkFeed(raw, options), []);
  assert.notEqual(raw.windows.sha256, '0'.repeat(64));
  if (parseUpdateFeed) assert.doesNotThrow(() => parseUpdateFeed(raw, config.feedUrl));
});

test('o leitor do app aceita o contrato que o site valida', {skip: !parseUpdateFeed && 'código do app ausente (repositório público)'}, () => {
  const parsed = parseUpdateFeed(valid(), config.feedUrl);
  assert.equal(parsed.version, '1.2.3');
  assert.equal(parsed.downloadPage, config.downloadPage);
});
