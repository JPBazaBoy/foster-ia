import {mkdir, rm, writeFile, readFile, cp} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, dirname, resolve, basename} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {loadSite} from './catalog.js';
import {checkFeed} from './feed.js';
import {renderSite} from './templates.js';
import {createZip} from './zip.js';

export const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const EXAMPLE_FEED = 'conteudo/exemplo-version.json';

export class BuildError extends Error {
  constructor(problems) { super(`${problems.length} problema(s) no site`); this.problems = problems; }
}

// O version.json real fica em public/ e é gerado por scripts/site-release.js. Sem ele, a prévia usa o exemplo
// (marcado na página); a publicação (--publicar) exige o arquivo real.
export async function loadFeed(root, config, {publish = false} = {}) {
  const real = join(root, 'public', config.fostermcp.feed);
  const path = existsSync(real) ? real : publish ? null : join(root, EXAMPLE_FEED);
  if (!path) throw new BuildError([`public/${config.fostermcp.feed}: falta o arquivo de versões. Gere com node scripts/site-release.js antes de publicar.`]);
  let data;
  try { data = JSON.parse(await readFile(path, 'utf8')); } catch (error) { throw new BuildError([`${basename(path)}: JSON inválido (${error.message}).`]); }
  // O exemplo acompanha os endereços de config.js, para a prévia continuar valendo se eles mudarem.
  if (path !== real && data && typeof data === 'object') {
    data.downloadPage = config.downloadPage;
    for (const system of ['windows', 'mac']) if (data[system]) data[system].url = config.versionDownload(data.version, config.fostermcp.arquivos[system]);
  }
  const problems = checkFeed(data, {feedUrl: config.feedUrl, downloadPage: config.downloadPage, versionDownload: config.versionDownload, files: config.fostermcp.arquivos});
  if (problems.length) throw new BuildError(problems.map(problem => `${path === real ? `public/${config.fostermcp.feed}` : EXAMPLE_FEED}: ${problem}`));
  return {data, example: path !== real};
}

// Cor do texto sobre a cor da marca, pelo contraste (WCAG) com branco e com quase preto.
function textOn(hex) {
  const channel = value => { const c = parseInt(value, 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = [1, 3, 5].map(i => channel(hex.slice(i, i + 2)));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (1.05 / (luminance + 0.05)) >= ((luminance + 0.05) / 0.0544) ? '#ffffff' : '#0b0e15';
}

async function buildAssets(root, config, dev) {
  const brand = `:root{--marca:${config.marca.cor};--marca-texto:${textOn(config.marca.cor)};--marca-escuro:${config.marca.corTemaEscuro};--marca-escuro-texto:${textOn(config.marca.corTemaEscuro)}}\n`;
  const files = new Map([
    ['assets/site.css', brand + await readFile(join(root, 'assets/site.css'), 'utf8')],
    ['assets/site.js', await readFile(join(root, 'assets/site.js'), 'utf8')],
    ['assets/tema.js', await readFile(join(root, 'assets/tema.js'), 'utf8')],
    ['favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${config.marca.cor}"/><path d="M32 12l4.8 12.4L49 29l-12.2 4.6L32 46l-4.8-12.4L15 29l12.2-4.6L32 12Z" fill="${textOn(config.marca.cor)}"/></svg>\n`],
  ]);
  if (dev) files.set('assets/recarregar.js', "new EventSource('/__recarregar').addEventListener('mudou', () => location.reload());\n");
  const version = createHash('sha256').update([...files.values()].join('')).digest('hex').slice(0, 10);
  return {files, version};
}

export async function build({root = SITE_ROOT, out = join(root, '_site'), publish = false, dev = false, now = new Date()} = {}) {
  const site = await loadSite(root);
  if (site.problems.length) throw new BuildError(site.problems.map(problem => `${problem.file}: ${problem.message}`));
  site.feed = await loadFeed(root, site.config, {publish});
  site.dev = dev;
  site.builtAt = now;
  const assets = await buildAssets(root, site.config, dev);
  const imageExists = href => existsSync(join(root, 'public', decodeURIComponent(href.slice(1))));
  const {files, pendingImages} = renderSite(site, {imageExists, assets});
  for (const [path, content] of assets.files) files.set(path, content);
  for (const item of site.items) {
    if (item.type === 'skill') files.set(`${item.url}${item.slug}.zip`, createZip(item.skill.files, {date: new Date(`${item.meta.atualizado}T12:00:00Z`)}));
    if (item.type === 'agente') files.set(`${item.url}AGENTS.md`, `${item.instructions}\n`);
  }
  files.set('.nojekyll', '');
  await rm(out, {recursive: true, force: true});
  await mkdir(out, {recursive: true});
  if (existsSync(join(root, 'public'))) await cp(join(root, 'public'), out, {recursive: true, filter: source => !basename(source).startsWith('.') || source === join(root, 'public')});
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), {recursive: true});
    await writeFile(join(out, path), content);
  }
  const unique = [...new Map(pendingImages.map(image => [image.path, image])).values()];
  return {out, pages: [...files.keys()].filter(path => path.endsWith('.html')).length, pendingImages: unique, example: site.feed.example,
    drafts: site.items.filter(item => item.meta.status === 'rascunho').map(item => item.id), config: site.config};
}

export function report(result, log = console.log) {
  log(`Site gerado em ${result.out}: ${result.pages} páginas.`);
  if (result.example) log('Aviso: sem public/fostermcp/version.json; a página de download usa dados de exemplo.');
  if (result.drafts.length) log(`Rascunhos (aparecem com a faixa "Rascunho para revisão"): ${result.drafts.join(', ')}.`);
  if (result.pendingImages.length) log(`Prints pendentes (${result.pendingImages.length}):\n${result.pendingImages.map(image => `  - site/public/${image.path}: ${image.alt}`).join('\n')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    report(await build({publish: process.argv.includes('--publicar')}));
  } catch (error) {
    if (!(error instanceof BuildError)) throw error;
    console.error(`O site não foi gerado. Corrija:\n${error.problems.map(problem => `  - ${problem}`).join('\n')}`);
    process.exitCode = 1;
  }
}
