import {pathToFileURL} from 'node:url';
import {join} from 'node:path';

const HEX = /^#[0-9a-f]{6}$/i;
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
export const COLOR_KEYS = ['noite', 'marinho', 'azul', 'creme', 'dourado', 'douradoDetalhe', 'douradoTexto', 'fundo', 'borda'];

// Confere site/config.js e devolve a configuração com os campos derivados (base, urls). Erros em português.
export function checkConfig(config) {
  const problems = [];
  const bad = (field, message) => problems.push({file: 'config.js', message: `${field}: ${message}`});
  const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if (!config || typeof config !== 'object') return {problems: [{file: 'config.js', message: 'O arquivo precisa exportar um objeto (export default {...}).'}]};
  if (!text(config.nome, 40)) bad('nome', 'texto de até 40 caracteres.');
  if (!text(config.descricao, 200)) bad('descricao', 'texto de até 200 caracteres.');
  if (!text(config.assinatura?.nome, 20) || (config.assinatura?.complemento !== '' && !text(config.assinatura?.complemento, 20)))
    bad('assinatura', 'nome e complemento, cada um com até 20 caracteres (complemento pode ficar vazio).');
  for (const key of COLOR_KEYS) if (!HEX.test(config.cores?.[key] ?? '')) bad(`cores.${key}`, 'cor no formato #RRGGBB.');
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(config.repositorio ?? '')) bad('repositorio', 'use dono/nome, por exemplo JPBazaBoy/foster-ia.');
  let address = null;
  try { address = new URL(config.endereco); } catch { /* tratado abaixo */ }
  if (!address || address.protocol !== 'https:' || address.search || address.hash || address.username || address.password || !address.pathname.endsWith('/'))
    bad('endereco', 'endereço https terminado em /, sem ? nem #.');
  if (typeof config.previa !== 'boolean') bad('previa', 'true durante a prévia, false no lançamento.');
  if (typeof config.indexar !== 'boolean') bad('indexar', 'true ou false.');
  if (!text(config.contato?.nome, 120)) bad('contato.nome', 'texto de até 120 caracteres, como "o responsável pela central".');
  if (config.contato?.link && !/^(https:\/\/|mailto:)/.test(config.contato.link)) bad('contato.link', 'vazio, https://… ou mailto:….');
  if (!text(config.aviso, 400)) bad('aviso', 'texto de até 400 caracteres.');
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
    // O app lê o version.json no endereço raw do repositório, que não muda se o site ganhar domínio próprio
    // (o app recusa redirecionamentos). Ele só aceita links no host do arquivo ou em github.com: por isso a
    // página de download do version.json é a da última release, e não a página do site.
    feedUrl: `https://raw.githubusercontent.com/${config.repositorio}/main/public/${app.feed}`,
    downloadPage: `https://github.com/${config.repositorio}/releases/latest`,
    noindex: config.previa || !config.indexar,
    // Os botões do site sempre levam ao instalador mais recente; o version.json aponta o arquivo exato da versão.
    latestDownload: name => `https://github.com/${config.repositorio}/releases/latest/download/${name}`,
    versionDownload: (version, name) => `https://github.com/${config.repositorio}/releases/download/v${version}/${name}`,
  }};
}

export async function loadConfig(root) {
  const module = await import(`${pathToFileURL(join(root, 'config.js')).href}?t=${Date.now()}`);
  return checkConfig(module.default);
}
