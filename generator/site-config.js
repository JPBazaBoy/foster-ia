import {pathToFileURL} from 'node:url';
import {join} from 'node:path';

const HEX = /^#[0-9a-f]{6}$/i;
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

// Confere site/config.js e devolve a configuração com os campos derivados (base, urls). Erros em português.
export function checkConfig(config) {
  const problems = [];
  const bad = (field, message) => problems.push({file: 'config.js', message: `${field}: ${message}`});
  const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if (!config || typeof config !== 'object') return {problems: [{file: 'config.js', message: 'O arquivo precisa exportar um objeto (export default {...}).'}]};
  if (!text(config.nome, 40)) bad('nome', 'texto de até 40 caracteres.');
  if (!text(config.descricao, 200)) bad('descricao', 'texto de até 200 caracteres.');
  if (!config.marca || !text(config.marca.sigla, 4)) bad('marca.sigla', 'de 1 a 4 caracteres.');
  if (!HEX.test(config.marca?.cor ?? '')) bad('marca.cor', 'cor no formato #RRGGBB.');
  if (!HEX.test(config.marca?.corTemaEscuro ?? '')) bad('marca.corTemaEscuro', 'cor no formato #RRGGBB.');
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(config.repositorio ?? '')) bad('repositorio', 'use dono/nome, por exemplo JPBazaBoy/foster-ia.');
  let address = null;
  try { address = new URL(config.endereco); } catch { /* tratado abaixo */ }
  if (!address || address.protocol !== 'https:' || address.search || address.hash || address.username || address.password || !address.pathname.endsWith('/'))
    bad('endereco', 'endereço https terminado em /, sem ? nem #.');
  if (typeof config.indexar !== 'boolean') bad('indexar', 'true ou false.');
  if (!config.contato || !text(config.contato.texto, 300)) bad('contato.texto', 'texto de até 300 caracteres.');
  if (config.contato?.link && !/^(https:\/\/|mailto:)/.test(config.contato.link)) bad('contato.link', 'vazio, https://… ou mailto:….');
  if (!text(config.aviso, 600)) bad('aviso', 'texto de até 600 caracteres.');
  const app = config.fostermcp;
  if (!app || !FILE_NAME.test(app.arquivos?.windows ?? '') || !FILE_NAME.test(app.arquivos?.mac ?? '')) bad('fostermcp.arquivos', 'nomes fixos dos instaladores, sem espaços.');
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\/version\.json$/.test(app?.feed ?? '')) bad('fostermcp.feed', 'caminho como fostermcp/version.json.');
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\/$/.test(app?.pagina ?? '')) bad('fostermcp.pagina', 'caminho como apps/fostermcp/.');
  if (problems.length) return {problems};
  const site = address.href;
  return {problems, config: {
    ...config,
    endereco: site,
    base: address.pathname,
    feedUrl: new URL(app.feed, site).href,
    downloadPage: new URL(app.pagina, site).href,
    // Os botões do site sempre levam ao instalador mais recente; o version.json aponta o arquivo exato da versão.
    latestDownload: name => `https://github.com/${config.repositorio}/releases/latest/download/${name}`,
    versionDownload: (version, name) => `https://github.com/${config.repositorio}/releases/download/v${version}/${name}`,
  }};
}

export async function loadConfig(root) {
  const module = await import(`${pathToFileURL(join(root, 'config.js')).href}?t=${Date.now()}`);
  return checkConfig(module.default);
}
