import {createServer} from 'node:http';
import {watch, existsSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import {join, extname, resolve, sep} from 'node:path';
import {build, report, BuildError, SITE_ROOT} from './build.js';

// Prévia local: gera o site em _site/, serve no mesmo caminho base do GitHub Pages e recarrega o navegador
// quando um arquivo do conteúdo muda. Mudanças em generator/ pedem reiniciar este comando.
const out = join(SITE_ROOT, '_site');
const TYPES = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.zip': 'application/zip', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8'};
const clients = new Set();
let base = '/';

async function rebuild() {
  try {
    const result = await build({dev: true, out});
    base = result.config.base;
    report(result);
    for (const client of clients) client.write('event: mudou\ndata: 1\n\n');
  } catch (error) {
    if (!(error instanceof BuildError)) { console.error(error); return; }
    console.error(`Erros no conteúdo (a prévia mostra a última versão boa):\n${error.problems.map(problem => `  - ${problem}`).join('\n')}`);
  }
}

async function send(res, path, status = 200) {
  const body = await readFile(path);
  res.writeHead(status, {'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store'});
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__recarregar') {
    res.writeHead(200, {'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive'});
    res.write(': ok\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (!url.pathname.startsWith(base)) { res.writeHead(302, {location: base}); res.end(); return; }
  let path = resolve(out, `.${decodeURIComponent(url.pathname.slice(base.length - 1))}`);
  if (path !== out && !path.startsWith(out + sep)) { res.writeHead(403); res.end(); return; }
  try {
    if ((await stat(path)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, {location: `${url.pathname}/`}); res.end(); return; }
      path = join(path, 'index.html');
    }
    await send(res, path);
  } catch {
    await send(res, join(out, '404.html'), 404).catch(() => { res.writeHead(404); res.end(); });
  }
});

await rebuild();
let timer = null;
for (const dir of ['catalog', 'conteudo', 'public', 'assets']) {
  if (existsSync(join(SITE_ROOT, dir))) watch(join(SITE_ROOT, dir), {recursive: true}, () => { clearTimeout(timer); timer = setTimeout(rebuild, 150); });
}
watch(join(SITE_ROOT, 'config.js'), () => { clearTimeout(timer); timer = setTimeout(rebuild, 150); });
const port = Number(process.env.PORT) || 8080;
server.listen(port, '127.0.0.1', () => console.log(`Prévia em http://localhost:${port}${base} (Ctrl+C para parar).`));
