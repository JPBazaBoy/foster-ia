import {mkdtempSync, realpathSync, rmSync, cpSync, writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {inflateRawSync, crc32} from 'node:zlib';
import {SITE_ROOT} from '../generator/build.js';

const copies = [];
// Cópia do conteúdo do site numa pasta temporária, sem version.json. files troca ou cria arquivos
// ({caminho: texto | null}); settings troca chaves true/false de config.js (padrão: prévia ligada e downloads
// desligados, porque a cópia não leva o version.json).
export function siteCopy(files = {}, settings = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'central-ia-site-')));
  copies.push(root);
  for (const name of ['config.js', 'conteudo', 'catalog', 'public', 'assets'].filter(name => existsSync(join(SITE_ROOT, name))))
    cpSync(join(SITE_ROOT, name), join(root, name), {recursive: true, filter: source => !source.endsWith('version.json')});
  let config = readFileSync(join(root, 'config.js'), 'utf8');
  for (const [key, value] of Object.entries({previa: true, downloads: false, ...settings})) {
    const pattern = new RegExp(`^(\\s*${key}:\\s*)(true|false)`, 'm');
    if (!pattern.test(config)) throw new Error(`config.js sem a chave ${key}`);
    config = config.replace(pattern, `$1${value}`);
  }
  writeFileSync(join(root, 'config.js'), config);
  for (const [path, content] of Object.entries(files)) {
    if (content === null) { rmSync(join(root, path), {recursive: true, force: true}); continue; }
    mkdirSync(dirname(join(root, path)), {recursive: true});
    writeFileSync(join(root, path), content);
  }
  return root;
}
export const cleanCopies = () => { for (const root of copies.splice(0)) rmSync(root, {recursive: true, force: true}); };

// Todos os arquivos de uma pasta, com o caminho relativo (por exemplo, skills/nome/index.html).
export function allFiles(dir, prefix = '') {
  const found = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...allFiles(join(dir, entry.name), path));
    else found.push(path);
  }
  return found;
}
export const htmlFiles = dir => allFiles(dir).filter(path => path.endsWith('.html'));

// Leitor mínimo de ZIP (diretório central) para conferir o que o gerador escreveu.
export function readZip(buffer) {
  const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('diretório central inválido');
    const method = buffer.readUInt16LE(offset + 10), crc = buffer.readUInt32LE(offset + 16), size = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28), extra = buffer.readUInt16LE(offset + 30), comment = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42), name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const raw = buffer.subarray(start, start + size);
    const data = method === 8 ? inflateRawSync(raw) : Buffer.from(raw);
    if (crc32(data) !== crc) throw new Error(`CRC inválido em ${name}`);
    entries.push({name, data, method, flags: buffer.readUInt16LE(offset + 8)});
    offset += 46 + nameLength + extra + comment;
  }
  return entries;
}

export const read = path => readFileSync(path, 'utf8');
