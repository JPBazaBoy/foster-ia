import {createReadStream, existsSync} from 'node:fs';
import {readFile, writeFile, mkdir, copyFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {basename, dirname, join, resolve, extname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {loadConfig} from '../generator/site-config.js';
import {checkFeed, isSemver} from '../generator/feed.js';

// Prepara uma versão do FosterMCP para o site: calcula sha256 e tamanho dos instaladores, copia-os com os nomes
// fixos de config.js e grava public/fostermcp/version.json no contrato que o app lê. Nada é publicado: o script
// só mostra os próximos passos.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const USAGE = `Uso: npm run release -- --windows <instalador.exe> --mac <instalador.dmg> [--versao 1.2.3] [--nota "texto"]...
       [--data <data ISO>] [--saida <pasta>] [--json <arquivo>]
Sem --versao, a versão vem do nome do instalador do Windows (por exemplo, "FosterMCP Setup 0.4.0.exe").`;
const VERSION_IN_NAME = /(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?=[^0-9]|$)/;

function parseArgs(argv) {
  const args = {notes: []};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i], value = argv[i + 1];
    if (flag === '--ajuda' || flag === '--help') { args.help = true; continue; }
    const key = {'--windows': 'windows', '--mac': 'mac', '--versao': 'version', '--nota': 'note', '--data': 'date', '--saida': 'out', '--json': 'json'}[flag];
    if (!key || value === undefined || value.startsWith('--')) throw new Error(`Opção inválida: ${flag}\n${USAGE}`);
    if (key === 'note' && !value.trim()) throw new Error('--nota precisa de um texto.');
    if (key === 'note') args.notes.push(value.trim()); else args[key] = value;
    i++;
  }
  return args;
}

async function sha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function installer(path, {version, extension, label}) {
  if (!existsSync(path)) throw new Error(`Instalador ${label} não encontrado: ${path}`);
  const info = await stat(path);
  if (!info.isFile() || info.size < 1) throw new Error(`Instalador ${label} vazio ou inválido: ${path}`);
  if (extname(path).toLowerCase() !== extension) throw new Error(`O instalador ${label} deve terminar em ${extension}: ${path}`);
  // O nome gerado pelo electron-builder traz a versão; isso evita publicar um instalador antigo com a versão nova.
  if (!basename(path).includes(version)) throw new Error(`O nome do instalador ${label} não contém a versão ${version}: ${basename(path)}`);
  return {path, sizeBytes: info.size, sha256: await sha256(path)};
}

export async function prepareRelease(argv = process.argv.slice(2), {log = console.log} = {}) {
  const args = parseArgs(argv);
  if (args.help) { log(USAGE); return null; }
  if (!args.windows || !args.mac) throw new Error(`Informe os dois instaladores.\n${USAGE}`);
  const version = args.version ?? basename(args.windows).match(VERSION_IN_NAME)?.[1];
  if (!isSemver(version)) throw new Error(`Versão inválida ou ausente: ${version ?? 'não achei no nome do instalador'}. Use --versao 1.2.3.`);
  const {config, problems} = await loadConfig(root);
  if (problems.length) throw new Error(`config.js com problemas:\n${problems.map(problem => `  - ${problem.message}`).join('\n')}`);
  const names = config.fostermcp.arquivos;
  const publishedAt = args.date ?? new Date().toISOString();
  if (publishedAt.length > 40 || !Number.isFinite(Date.parse(publishedAt))) throw new Error(`Data inválida: ${publishedAt}`);
  const windows = await installer(resolve(args.windows), {version, extension: '.exe', label: 'do Windows'});
  const mac = await installer(resolve(args.mac), {version, extension: '.dmg', label: 'do Mac'});
  const jsonPath = resolve(args.json ?? join(root, 'public', config.fostermcp.feed));
  // Sem --nota, mantém as notas já escritas para a mesma versão.
  let notes = args.notes;
  if (!notes.length && existsSync(jsonPath)) {
    const previous = JSON.parse(await readFile(jsonPath, 'utf8'));
    if (previous.version === version && Array.isArray(previous.notes)) notes = previous.notes;
  }
  const feed = {
    version,
    publishedAt: new Date(Date.parse(publishedAt)).toISOString(),
    downloadPage: config.downloadPage,
    windows: {url: config.versionDownload(version, names.windows), sha256: windows.sha256, sizeBytes: windows.sizeBytes},
    mac: {url: config.versionDownload(version, names.mac), sha256: mac.sha256, sizeBytes: mac.sizeBytes},
    notes,
  };
  // Mesmo contrato que o app aplica ao ler o arquivo (src/updates.js no repositório do FosterMCP).
  const contract = checkFeed(feed, {feedUrl: config.feedUrl, downloadPage: config.downloadPage, versionDownload: config.versionDownload, files: names});
  if (contract.length) throw new Error(`O version.json não seguiria o contrato do app:\n${contract.map(problem => `  - ${problem}`).join('\n')}`);
  const out = resolve(args.out ?? join(root, 'release-publicar'));
  await mkdir(out, {recursive: true});
  await copyFile(windows.path, join(out, names.windows));
  await copyFile(mac.path, join(out, names.mac));
  await mkdir(dirname(jsonPath), {recursive: true});
  await writeFile(jsonPath, `${JSON.stringify(feed, null, 2)}\n`);
  log(`version.json da versão ${version} gravado em ${jsonPath}.`);
  log(`Instaladores com os nomes fixos em ${out}: ${names.windows}, ${names.mac}.`);
  log(`Nada foi publicado. Próximos passos (veja o README):
  1. Crie a release v${version} em ${config.repositorio} com os dois arquivos:
     gh release create v${version} "${join(out, names.windows)}" "${join(out, names.mac)}" --repo ${config.repositorio} --title "FosterMCP ${version}"
  2. Confira os dois downloads.
  3. Só então envie o version.json para a main (o app lê o arquivo de lá). No lançamento, troque previa para false em config.js.`);
  return {feed, jsonPath, out};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await prepareRelease(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
