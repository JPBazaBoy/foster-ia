// Contrato do version.json lido pelo app FosterMCP (src/updates.js: parseUpdateFeed). As regras são repetidas aqui
// porque o repositório público do site não tem o código do app; no repositório privado, um teste compara os dois.
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
export const isSemver = value => typeof value === 'string' && value.length <= 64 && SEMVER.test(value);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);

export function checkFeed(raw, {feedUrl, downloadPage, versionDownload, files}) {
  const problems = [];
  const bad = message => problems.push(message);
  const hosts = new Set([new URL(feedUrl).hostname, 'github.com']);
  const link = (value, field) => {
    let url = null;
    try { url = new URL(value); } catch { /* tratado abaixo */ }
    if (typeof value !== 'string' || value.length > 2048 || !url || url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || !hosts.has(url.hostname))
      bad(`${field}: link https sem porta, ? ou #, em ${[...hosts].join(' ou ')}.`);
  };
  if (!plain(raw)) return ['O arquivo precisa ser um objeto JSON.'];
  const allowed = ['version', 'publishedAt', 'downloadPage', 'windows', 'mac', 'notes'];
  for (const key of Object.keys(raw)) if (!allowed.includes(key)) bad(`campo desconhecido: ${key}.`);
  if (!isSemver(raw.version)) bad('version: versão no formato 1.2.3.');
  if (typeof raw.publishedAt !== 'string' || raw.publishedAt.length > 40 || !Number.isFinite(Date.parse(raw.publishedAt))) bad('publishedAt: data ISO, como 2026-10-16T12:00:00.000Z.');
  link(raw.downloadPage, 'downloadPage');
  if (raw.downloadPage !== downloadPage) bad(`downloadPage: deve ser ${downloadPage}.`);
  for (const system of ['windows', 'mac']) {
    const file = raw[system];
    if (!plain(file)) { bad(`${system}: objeto com url, sha256 e sizeBytes.`); continue; }
    link(file.url, `${system}.url`);
    if (isSemver(raw.version) && file.url !== versionDownload(raw.version, files[system])) bad(`${system}.url: deve ser ${versionDownload(raw.version, files[system])}.`);
    if (typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)) bad(`${system}.sha256: 64 caracteres hexadecimais minúsculos.`);
    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes < 1 || file.sizeBytes > 4e9) bad(`${system}.sizeBytes: tamanho em bytes, entre 1 e 4 GB.`);
  }
  if (!Array.isArray(raw.notes) || raw.notes.length > 20 || raw.notes.some(note => typeof note !== 'string' || !note.trim() || note.length > 500))
    bad('notes: lista de até 20 textos com até 500 caracteres.');
  return problems;
}

// Tamanho como o Windows mostra (1 MB = 1024 × 1024 bytes), com vírgula decimal.
export const formatSize = bytes => `${new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 1, minimumFractionDigits: 1}).format(bytes / 1048576)} MB`;
export const formatDate = value => new Intl.DateTimeFormat('pt-BR', {dateStyle: 'long', timeZone: 'America/Sao_Paulo'}).format(new Date(value));
// Datas do catálogo (AAAA-MM-DD) ao meio-dia UTC, para não mudar de dia com o fuso.
export const formatDay = day => formatDate(`${day}T12:00:00Z`);
