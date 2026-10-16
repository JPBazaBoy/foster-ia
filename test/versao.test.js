import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkFeed} from '../generator/feed.js';
import {loadConfig} from '../generator/site-config.js';
import {SITE_ROOT, EXAMPLE_FEED, loadFeed, BuildError} from '../generator/build.js';

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

test('o endereço do version.json fica no mesmo host da página de download, como o app exige', () => {
  assert.equal(config.feedUrl, `${config.endereco}${config.fostermcp.feed}`);
  assert.equal(new URL(config.feedUrl).host, new URL(config.downloadPage).host);
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

test('o exemplo da prévia segue o contrato e a publicação exige o arquivo real', async () => {
  const example = await loadFeed(SITE_ROOT, config, {publish: false}).catch(error => error);
  if (!existsSync(REAL)) {
    assert.equal(example.example, true);
    await assert.rejects(loadFeed(SITE_ROOT, config, {publish: true}), error => error instanceof BuildError && /site-release/.test(error.problems[0]));
  }
  const raw = JSON.parse(readFileSync(join(SITE_ROOT, EXAMPLE_FEED), 'utf8'));
  assert.equal(raw.windows.sha256, '0'.repeat(64), 'o exemplo não pode parecer um arquivo real');
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
