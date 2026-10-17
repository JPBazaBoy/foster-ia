import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, realpathSync, rmSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {checkFeed} from '../generator/feed.js';
import {loadConfig} from '../generator/site-config.js';
import {SITE_ROOT} from '../generator/build.js';

// Instaladores sintéticos numa pasta temporária: o script nunca toca em public/ nem em release-publicar/ nestes testes.
const dir = realpathSync(mkdtempSync(join(tmpdir(), 'central-ia-release-')));
after(() => rmSync(dir, {recursive: true, force: true}));
const {config} = await loadConfig(SITE_ROOT);
const options = {feedUrl: config.feedUrl, downloadPage: config.downloadPage, versionDownload: config.versionDownload, files: config.fostermcp.arquivos};
const exe = join(dir, 'FosterMCP Setup 9.8.7.exe'), dmg = join(dir, 'FosterMCP-9.8.7-arm64.dmg');
writeFileSync(exe, Buffer.from('instalador windows sintético'));
writeFileSync(dmg, Buffer.alloc(70000, 7));
const run = args => spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/site-release.js', import.meta.url)), ...args], {encoding: 'utf8'});
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
// No repositório privado, o resultado também passa pelo leitor do próprio app.
const appUpdates = join(SITE_ROOT, '..', 'src', 'updates.js');
const parseUpdateFeed = existsSync(appUpdates) ? (await import(pathToFileURL(appUpdates).href)).parseUpdateFeed : null;

test('npm run release grava um version.json no contrato do app, com hashes, tamanhos e cópias com nome fixo', () => {
  const json = join(dir, 'version.json'), out = join(dir, 'publicar');
  const result = run(['--windows', exe, '--mac', dmg, '--json', json, '--saida', out, '--data', '2026-10-16T12:00:00Z', '--nota', 'Primeira nota.', '--nota', 'Segunda nota.']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Nada foi publicado/);
  assert.match(result.stdout, /gh release create v9\.8\.7/);
  const feed = JSON.parse(readFileSync(json, 'utf8'));
  assert.deepEqual(checkFeed(feed, options), []);
  if (parseUpdateFeed) assert.equal(parseUpdateFeed(feed, config.feedUrl).version, '9.8.7');
  assert.equal(feed.version, '9.8.7', 'a versão vem do nome do instalador');
  assert.equal(feed.publishedAt, '2026-10-16T12:00:00.000Z');
  assert.equal(feed.downloadPage, `https://github.com/${config.repositorio}/releases/latest`);
  assert.deepEqual(feed.notes, ['Primeira nota.', 'Segunda nota.']);
  for (const [system, path] of [['windows', exe], ['mac', dmg]]) {
    const name = config.fostermcp.arquivos[system];
    assert.equal(feed[system].url, `https://github.com/${config.repositorio}/releases/download/v9.8.7/${name}`);
    assert.equal(feed[system].sha256, sha(path));
    assert.equal(feed[system].sizeBytes, readFileSync(path).length);
    assert.equal(sha(join(out, name)), sha(path));
  }
  // Sem --nota, a mesma versão mantém as notas já escritas.
  assert.equal(run(['--windows', exe, '--mac', dmg, '--json', json, '--saida', out]).status, 0);
  assert.deepEqual(JSON.parse(readFileSync(json, 'utf8')).notes, ['Primeira nota.', 'Segunda nota.']);
});

test('npm run release recusa outra versão, arquivo ausente, data inválida e nota vazia, sem gravar nada', () => {
  const old = join(dir, 'FosterMCP Setup 0.0.1.exe');
  writeFileSync(old, 'antigo');
  const json = join(dir, 'recusado.json');
  for (const args of [
    ['--windows', old, '--mac', dmg],
    ['--windows', exe, '--mac', dmg, '--versao', '9.8.8'],
    ['--windows', exe, '--mac', dmg, '--versao', 'v9'],
    ['--windows', join(dir, 'nao-existe.exe'), '--mac', dmg],
    ['--windows', exe, '--mac', exe],
    ['--windows', exe],
    ['--windows', exe, '--mac', dmg, '--data', 'ontem'],
    ['--windows', exe, '--mac', dmg, '--nota', '  '],
  ]) {
    const result = run([...args, '--json', json, '--saida', join(dir, 'recusado')]);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.ok(result.stderr.trim(), args.join(' '));
  }
  assert.equal(existsSync(json), false);
});
