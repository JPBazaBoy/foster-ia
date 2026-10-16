import {readdir, readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {parse as parseYaml} from 'yaml';
import {TYPES, PLATFORMS, REQUIRED_SECTIONS, ACCORDION_SECTIONS, normalizeKey, tabFor} from './taxonomy.js';
import {expandSource, splitSections} from './markdown.js';
import {loadConfig} from './site-config.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REF = /^[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONT = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const realDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const text = max => value => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const list = check => value => Array.isArray(value) && value.length > 0 && value.every(check) && new Set(value).size === value.length;

// Campos do cabeçalho de cada item. A mensagem diz ao autor o que escrever.
const FIELDS = {
  titulo: {required: true, check: text(80), hint: 'texto de até 80 caracteres'},
  resumo: {required: true, check: text(200), hint: 'uma frase de até 200 caracteres'},
  plataformas: {required: true, check: list(value => Object.hasOwn(PLATFORMS, value)), hint: `lista com ${Object.keys(PLATFORMS).join(', ')}`},
  atualizado: {required: true, check: realDay, hint: 'data no formato AAAA-MM-DD'},
  status: {required: true, check: value => ['publicado', 'rascunho'].includes(value), hint: 'publicado ou rascunho'},
  destaque: {check: value => typeof value === 'boolean', hint: 'true ou false'},
  versao: {check: text(20), hint: 'texto curto, como 1.0'},
  palavras: {check: list(text(40)), hint: 'lista de palavras para a busca'},
  ferramentas: {check: list(value => /^[a-z][a-z0-9_]*$/.test(value)), hint: 'lista de nomes de ferramentas, como search_clients'},
  requer: {check: list(value => REF.test(value)), hint: 'lista como apps/fostermcp'},
  ordem: {check: Number.isInteger, hint: 'número inteiro'},
  download: {types: ['app'], check: value => SLUG.test(value), hint: 'pasta do version.json em public/, como fostermcp'},
  app: {types: ['conector'], check: value => REF.test(value), hint: 'app que traz o conector, como apps/fostermcp'},
};

export function parseFrontMatter(source, file, problems) {
  const match = source.match(FRONT);
  if (!match) { problems.push({file, message: 'Falta o cabeçalho no início do arquivo, entre duas linhas com ---.'}); return {data: {}, body: source}; }
  let data = {};
  try { data = parseYaml(match[1]) ?? {}; } catch (error) { problems.push({file, message: `Cabeçalho com erro de digitação: ${error.message.split('\n')[0]}`}); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) { problems.push({file, message: 'O cabeçalho precisa ter linhas campo: valor.'}); data = {}; }
  return {data, body: source.slice(match[0].length)};
}

async function filesIn(dir) {
  const found = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await filesIn(path));
    else if (entry.isFile()) found.push(path);
  }
  return found.sort();
}
const posix = path => path.split(sep).join('/');

function checkSkill(item, source, problems) {
  const file = `${item.file.replace(/pagina\.md$/, '')}SKILL.md`;
  const {data, body} = parseFrontMatter(source, file, problems);
  const allowed = ['name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility'];
  for (const key of Object.keys(data)) if (!allowed.includes(key)) problems.push({file, message: `Campo "${key}" não faz parte do padrão de skills (${allowed.join(', ')}).`});
  if (typeof data.name !== 'string' || !SLUG.test(data.name) || data.name.length > 64)
    problems.push({file, message: 'name: até 64 letras minúsculas sem acento, números e hífens.'});
  else if (data.name !== item.slug) problems.push({file, message: `name deve ser igual ao nome da pasta (${item.slug}); o Claude recusa a skill quando eles diferem.`});
  else if (/anthropic|claude/.test(data.name)) problems.push({file, message: 'name não pode conter "anthropic" nem "claude" (palavras reservadas).'});
  // Claude aceita até 1024 caracteres e o Codex até 500: o menor limite vale para as duas.
  if (!text(500)(data.description)) problems.push({file, message: 'description: de 1 a 500 caracteres, dizendo o que a skill faz e quando usar.'});
  if (/[<>]/.test(`${data.name}${data.description}`)) problems.push({file, message: 'name e description não podem ter < nem >.'});
  if (!body.trim()) problems.push({file, message: 'O SKILL.md precisa de instruções depois do cabeçalho.'});
  return {name: data.name, description: data.description, body: body.trim(), source};
}

// Marca as seções cujas subseções (###) são abas e devolve as plataformas que ganharam aba.
// platforms: plataformas do item (abas de outras plataformas, vindas de trechos, são omitidas); null = todas.
function findTabs(sections, platforms, file, problems) {
  const covered = new Set();
  for (const section of sections) {
    const tabs = section.subsections.map(sub => tabFor(sub.title));
    section.tabs = null;
    if (ACCORDION_SECTIONS.has(section.key) || !tabs.some(Boolean)) continue;
    if (!tabs.every(Boolean)) {
      const odd = section.subsections.filter((_, i) => !tabs[i]).map(sub => `"### ${sub.title}"`).join(', ');
      problems.push({file, message: `Na seção "## ${section.title}", ${odd} não é nome de aba. Use os nomes de plataforma (${Object.values(PLATFORMS).map(p => p.label).join(', ')}) ou Windows e Mac, ou escreva o texto antes da primeira aba.`});
      continue;
    }
    if (new Set(tabs.map(tab => tab.group)).size > 1) { problems.push({file, message: `Na seção "## ${section.title}", não misture abas de plataforma com Windows e Mac.`}); continue; }
    // Trechos compartilhados trazem todas as plataformas; cada item mostra só as suas.
    const group = tabs[0].group;
    const keep = section.subsections.map((sub, i) => ({...sub, tab: tabs[i]})).filter(sub => group !== 'plataforma' || !platforms || platforms.includes(sub.tab.key));
    if (new Set(keep.map(sub => sub.tab.key)).size !== keep.length) problems.push({file, message: `Na seção "## ${section.title}", há abas repetidas.`});
    section.tabs = {group, panels: keep};
    if (group === 'plataforma') for (const sub of keep) covered.add(sub.tab.key);
  }
  return covered;
}

function checkSections(item, problems) {
  const {file, type, sections} = item;
  const seen = new Set();
  for (const section of sections) {
    if (seen.has(section.key)) problems.push({file, message: `A seção "## ${section.title}" aparece duas vezes.`});
    seen.add(section.key);
  }
  for (const title of REQUIRED_SECTIONS[type]) if (!seen.has(normalizeKey(title))) problems.push({file, message: `Falta a seção "## ${title}".`});
  if (!sections.length && !item.intro.length) problems.push({file, message: 'A página está vazia.'});
  const covered = findTabs(sections, item.meta.plataformas || [], file, problems);
  const platformTabs = sections.some(section => section.tabs?.group === 'plataforma');
  const install = sections.find(section => section.key === normalizeKey('Como instalar'));
  if (install && ['skill', 'agente', 'conector'].includes(type) && install.tabs?.group !== 'plataforma')
    problems.push({file, message: '"## Como instalar" precisa de uma aba (###) para cada plataforma.'});
  if (install && type === 'app' && install.tabs?.group !== 'sistema') problems.push({file, message: '"## Como instalar" de um app precisa das abas ### Windows e ### Mac.'});
  if (platformTabs) for (const platform of item.meta.plataformas || [])
    if (!covered.has(platform)) problems.push({file, message: `A plataforma ${PLATFORMS[platform]?.label ?? platform} está em plataformas, mas não tem aba de instruções.`});
}

// Lê config, conteúdo e catálogo e confere tudo. Nada é escrito; problems vazio = pronto para construir.
export async function loadSite(root) {
  const problems = [];
  const {config, problems: configProblems} = await loadConfig(root);
  problems.push(...configProblems);
  if (!config) return {problems};
  const read = path => readFile(join(root, path), 'utf8');
  const readYaml = async (path, check) => {
    if (!existsSync(join(root, path))) { problems.push({file: path, message: 'Arquivo obrigatório não encontrado.'}); return null; }
    try { const data = parseYaml(await read(path)); return check(data) ? data : (problems.push({file: path, message: 'Formato inesperado; compare com o README.'}), null); }
    catch (error) { problems.push({file: path, message: `Erro de digitação: ${error.message.split('\n')[0]}`}); return null; }
  };

  const snippets = new Map();
  for (const path of existsSync(join(root, 'conteudo/trechos')) ? await filesIn(join(root, 'conteudo/trechos')) : [])
    if (path.endsWith('.md')) snippets.set(path.slice(path.lastIndexOf(sep) + 1, -3), await readFile(path, 'utf8'));
  const siteVariables = {nome: config.nome, endereco: config.endereco, repositorio: config.repositorio, base: config.base,
    contato: config.contato.link ? `[${config.contato.texto}](${config.contato.link})` : config.contato.texto, aviso: config.aviso};
  const expand = (source, file, item = {}) => expandSource(source, {snippets, variables: {site: siteVariables, item}, file, problems});

  const home = await readYaml('conteudo/inicio.yml', data => data && text(120)(data.titulo) && text(300)(data.subtitulo) && Array.isArray(data.sobre?.pontos) && Array.isArray(data.passos) && data.passos.length === 3);
  const news = await readYaml('conteudo/novidades.yml', data => Array.isArray(data) && data.every(entry => realDay(entry?.data) && text(100)(entry.titulo) && text(400)(entry.texto) && (entry.link === undefined || (typeof entry.link === 'string' && entry.link.startsWith('/')))));
  if (news) news.sort((a, b) => b.data.localeCompare(a.data));

  const intros = {};
  for (const {folder, plural} of Object.values(TYPES)) {
    const path = `conteudo/tipos/${folder}.md`;
    if (!existsSync(join(root, path))) { problems.push({file: path, message: `Falta o texto de apresentação de ${plural}.`}); continue; }
    const {data, body} = parseFrontMatter(await read(path), path, problems);
    if (!text(160)(data.resumo)) problems.push({file: path, message: 'O cabeçalho precisa de resumo: uma frase de até 160 caracteres.'});
    intros[folder] = {resumo: data.resumo, body: expand(body, path)};
  }

  const pages = [];
  for (const path of existsSync(join(root, 'conteudo/paginas')) ? await filesIn(join(root, 'conteudo/paginas')) : []) {
    if (!path.endsWith('.md')) continue;
    const file = posix(relative(root, path)), slug = path.slice(path.lastIndexOf(sep) + 1, -3);
    const {data, body} = parseFrontMatter(await readFile(path, 'utf8'), file, problems);
    if (!text(80)(data.titulo) || !text(200)(data.resumo)) problems.push({file, message: 'O cabeçalho precisa de titulo e resumo.'});
    if (!SLUG.test(slug) || Object.values(TYPES).some(type => type.folder === slug) || ['catalogo', 'assets'].includes(slug)) problems.push({file, message: 'Nome de arquivo inválido ou reservado.'});
    const page = {slug, file, meta: data, url: `${slug}/`, ...splitSections(expand(body, file))};
    findTabs(page.sections, null, file, problems);
    pages.push(page);
  }

  const items = [];
  for (const [type, {folder}] of Object.entries(TYPES)) {
    const dir = join(root, 'catalog', folder);
    if (!existsSync(dir)) continue;
    for (const entry of (await readdir(dir, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      const isFolder = entry.isDirectory();
      const slug = isFolder ? entry.name : entry.name.replace(/\.md$/, '');
      const file = `catalog/${folder}/${isFolder ? `${slug}/pagina.md` : entry.name}`;
      if (!isFolder && !entry.name.endsWith('.md')) { problems.push({file, message: 'Só arquivos .md ou pastas ficam aqui.'}); continue; }
      if (!SLUG.test(slug)) { problems.push({file, message: 'Use no nome só letras minúsculas sem acento, números e hífens (por exemplo, briefing-de-cliente).'}); continue; }
      if (items.some(item => item.type === type && item.slug === slug)) { problems.push({file, message: 'Já existe um item com esse nome.'}); continue; }
      if (['skill', 'agente'].includes(type) && !isFolder) { problems.push({file, message: `Cada ${TYPES[type].label.toLowerCase()} é uma pasta com pagina.md.`}); continue; }
      if (!existsSync(join(root, file))) { problems.push({file, message: 'Falta o arquivo pagina.md na pasta.'}); continue; }
      const {data: meta, body} = parseFrontMatter(await read(file), file, problems);
      for (const [key, value] of Object.entries(meta)) {
        const field = FIELDS[key];
        if (!field) problems.push({file, message: `Campo desconhecido "${key}". Campos aceitos: ${Object.keys(FIELDS).join(', ')}.`});
        else if (field.types && !field.types.includes(type)) problems.push({file, message: `O campo "${key}" só vale para ${field.types.join(', ')}.`});
        else if (!field.check(value)) problems.push({file, message: `${key}: ${field.hint}.`});
      }
      for (const [key, field] of Object.entries(FIELDS)) if (field.required && meta[key] === undefined) problems.push({file, message: `Falta o campo "${key}" (${field.hint}).`});
      const item = {type, folder, slug, id: `${folder}/${slug}`, url: `${folder}/${slug}/`, file, meta, dir: isFolder ? join(dir, slug) : null};
      const itemVariables = {titulo: meta.titulo, slug, url: `/${item.url}`, pasta: slug, zip: `/${item.url}${slug}.zip`, zipNome: `${slug}.zip`};
      if (type === 'skill') {
        const skillFile = join(item.dir, 'SKILL.md');
        if (!existsSync(skillFile)) problems.push({file, message: 'A pasta da skill precisa do arquivo SKILL.md.'});
        else {
          item.skill = checkSkill(item, await readFile(skillFile, 'utf8'), problems);
          // O .zip leva a pasta inteira, menos a página do site.
          item.skill.files = [];
          for (const path of await filesIn(item.dir)) {
            const name = posix(relative(item.dir, path));
            if (name !== 'pagina.md') item.skill.files.push({name: `${slug}/${name}`, data: await readFile(path)});
          }
        }
      }
      if (type === 'agente') {
        const instructions = join(item.dir, 'instrucoes.md');
        if (!existsSync(instructions)) problems.push({file, message: 'A pasta do agente precisa do arquivo instrucoes.md.'});
        else {
          item.instructions = (await readFile(instructions, 'utf8')).trim();
          // Instruções de GPT personalizado aceitam até 8000 caracteres.
          if (!item.instructions || item.instructions.length > 8000) problems.push({file: `catalog/${folder}/${slug}/instrucoes.md`, message: 'As instruções precisam ter de 1 a 8000 caracteres.'});
        }
      }
      Object.assign(item, splitSections(expand(body, file, itemVariables)));
      if (type === 'prompt') {
        item.prompt = item.sections.find(section => section.key === normalizeKey('Prompt'))?.raw || '';
        if (!item.prompt) problems.push({file, message: 'Escreva o texto do prompt logo abaixo de "## Prompt".'});
      }
      checkSections(item, problems);
      items.push(item);
    }
  }
  const byId = new Map(items.map(item => [item.id, item]));
  for (const item of items) {
    for (const ref of item.meta.requer || []) if (!byId.has(ref)) problems.push({file: item.file, message: `requer: "${ref}" não existe no catálogo.`});
    if (item.meta.app && byId.get(item.meta.app)?.type !== 'app') problems.push({file: item.file, message: `app: "${item.meta.app}" não é um app do catálogo.`});
    if (item.type === 'app' && item.meta.download && item.meta.download !== config.fostermcp.feed.split('/')[0])
      problems.push({file: item.file, message: `download: só existe o version.json de ${config.fostermcp.feed}.`});
  }
  // Catálogo na ordem dos tipos (apps primeiro); dentro do tipo, pelo campo ordem e depois pelo título.
  const typeOrder = Object.keys(TYPES);
  items.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || (a.meta.ordem ?? 100) - (b.meta.ordem ?? 100) ||
    String(a.meta.titulo).localeCompare(String(b.meta.titulo), 'pt-BR'));
  return {config, home, news, intros, pages, items, problems};
}
