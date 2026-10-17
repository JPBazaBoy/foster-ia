// Tipos do catálogo, seções do site, plataformas e situações. A ordem dos objetos é a ordem na tela.
export const TYPES = {
  app: {folder: 'apps', label: 'Aplicativo', plural: 'Aplicativos', area: 'apps'},
  conector: {folder: 'conectores', label: 'Conector', plural: 'Conectores', area: 'apps'},
  skill: {folder: 'skills', label: 'Skill', plural: 'Skills', area: 'skills'},
  agente: {folder: 'agentes', label: 'Modelo de agente', plural: 'Modelos de agentes', area: 'agentes'},
  prompt: {folder: 'prompts', label: 'Prompt', plural: 'Prompts', area: 'prompts'},
  tutorial: {folder: 'tutoriais', label: 'Tutorial', plural: 'Tutoriais', area: 'tutoriais'},
};
export const TYPE_BY_FOLDER = Object.fromEntries(Object.entries(TYPES).map(([type, {folder}]) => [folder, type]));

// Áreas da navegação. Aplicativos e conectores dividem a mesma página.
export const AREAS = {
  apps: {label: 'Apps e conectores', title: 'Aplicativos e conectores', all: 'Ver todos', types: ['app', 'conector']},
  skills: {label: 'Skills', title: 'Skills', all: 'Ver todas', types: ['skill']},
  agentes: {label: 'Agentes', title: 'Modelos de agentes', all: 'Ver todos', types: ['agente']},
  prompts: {label: 'Prompts', title: 'Prompts', all: 'Ver todos', types: ['prompt']},
  tutoriais: {label: 'Tutoriais', title: 'Tutoriais', all: 'Ver todos', types: ['tutorial']},
};

// "Onde funciona". O FosterMCP só chega ao ChatGPT pela aba Codex; Projetos e GPTs recebem instruções coladas.
// Gemini e Grok exigem conector remoto, que ainda não existe: aparecem só como "em breve".
export const PLATFORMS = {
  'claude-desktop': {label: 'Claude Desktop', aliases: ['projeto do claude']},
  'chatgpt-codex': {label: 'ChatGPT (aba Codex)', aliases: ['codex', 'aba codex', 'chatgpt codex']},
  chatgpt: {label: 'ChatGPT (Projetos e GPTs)', aliases: ['chatgpt', 'projeto ou gpt do chatgpt', 'chatgpt projetos', 'projetos e gpts']},
  cursor: {label: 'Cursor', aliases: []},
  'claude-code': {label: 'Claude Code', aliases: []},
  gemini: {label: 'Gemini', aliases: []},
  grok: {label: 'Grok', aliases: []},
  grokbot: {label: 'GrokBot', aliases: []},
  hermes: {label: 'Hermes Agent', aliases: ['hermes']},
};
export const SYSTEMS = {
  windows: {label: 'Windows', aliases: []},
  mac: {label: 'Mac', aliases: ['macos', 'mac os']},
};
// Fontes de dados do FosterMCP: filtro dos prompts e abas de "Conectar suas fontes".
export const SOURCES = {
  atlas: {label: 'Atlas', aliases: []},
  whatsapp: {label: 'WhatsApp', aliases: []},
  email: {label: 'E-mail', aliases: ['e-mail e agenda', 'email e agenda', 'agenda']},
};
export const STATUS = {
  disponivel: {label: 'Disponível'},
  'em-teste': {label: 'Em teste'},
  'em-breve': {label: 'Em breve'},
};

export const normalizeKey = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const TAB_KEYS = new Map();
for (const [group, entries] of [['plataforma', PLATFORMS], ['sistema', SYSTEMS], ['fonte', SOURCES]])
  for (const [key, {label, aliases}] of Object.entries(entries))
    for (const name of [key, label, ...aliases]) TAB_KEYS.set(normalizeKey(name), {group, key, label});
// "### ChatGPT (aba Codex)" → {group:'plataforma', key:'chatgpt-codex', label:'ChatGPT (aba Codex)'}; null se não for aba.
export const tabFor = title => TAB_KEYS.get(normalizeKey(title)) || null;

// Seções obrigatórias por tipo (## Título no Markdown). Itens "em breve" só precisam da primeira.
export const REQUIRED_SECTIONS = {
  app: ['O que é', 'O que dá para fazer', 'Antes de começar', 'Instalação', 'Conectar ao seu assistente', 'Problemas comuns'],
  conector: ['O que é', 'O que dá para fazer', 'Antes de começar', 'Instalação', 'Problemas comuns'],
  skill: ['O que faz', 'Exemplo de resultado', 'Onde funciona', 'Instalação', 'Como usar', 'Problemas comuns'],
  agente: ['Para que serve', 'O que precisa', 'Passo a passo'],
  prompt: ['Prompt', 'Quando usar'],
  tutorial: [],
};
// Seção que precisa de abas, e de que grupo.
export const TABBED_SECTIONS = {
  app: [['Instalação', 'sistema'], ['Conectar ao seu assistente', 'plataforma']],
  conector: [['Instalação', 'plataforma']],
  skill: [['Instalação', 'plataforma']],
  agente: [['Passo a passo', 'plataforma']],
};
// Seções em que cada ### vira uma pergunta com resposta.
export const FAQ_SECTIONS = new Set(['Problemas comuns', 'Perguntas frequentes'].map(normalizeKey));
// Seções que o modelo mostra em outro lugar da página.
export const HIDDEN_SECTIONS = new Set(['Prompt'].map(normalizeKey));
