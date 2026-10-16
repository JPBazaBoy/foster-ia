// Tipos do catálogo, plataformas e seções conhecidas. A ordem dos objetos é a ordem dos filtros e das abas.
export const TYPES = {
  app: {folder: 'apps', label: 'App', plural: 'Apps'},
  conector: {folder: 'conectores', label: 'Conector', plural: 'Conectores'},
  skill: {folder: 'skills', label: 'Skill', plural: 'Skills'},
  agente: {folder: 'agentes', label: 'Agente', plural: 'Agentes'},
  prompt: {folder: 'prompts', label: 'Prompt', plural: 'Prompts'},
  tutorial: {folder: 'tutoriais', label: 'Tutorial', plural: 'Tutoriais'},
};
export const TYPE_BY_FOLDER = Object.fromEntries(Object.entries(TYPES).map(([type, {folder}]) => [folder, type]));

// "Funciona com". ChatGPT aparece duas vezes porque o FosterMCP só chega ao ChatGPT pela aba Codex;
// Projetos e GPTs recebem apenas instruções coladas.
export const PLATFORMS = {
  'claude-desktop': {label: 'Claude Desktop', family: 'claude', aliases: ['projeto do claude', 'claude projetos']},
  'chatgpt-codex': {label: 'ChatGPT · aba Codex', family: 'chatgpt', aliases: ['codex', 'chatgpt codex', 'aba codex']},
  chatgpt: {label: 'ChatGPT · Projetos e GPTs', family: 'chatgpt', aliases: ['chatgpt', 'chatgpt projetos', 'projeto ou gpt do chatgpt', 'chatgpt projetos e gpts']},
  'claude-code': {label: 'Claude Code', family: 'claude', aliases: []},
  cursor: {label: 'Cursor', family: 'cursor', aliases: []},
};
// Abas de sistema operacional (instalação de apps).
export const SYSTEMS = {
  windows: {label: 'Windows', aliases: []},
  mac: {label: 'Mac', aliases: ['macos', 'mac os']},
};

export const normalizeKey = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const TAB_KEYS = new Map();
for (const [group, entries] of [['plataforma', PLATFORMS], ['sistema', SYSTEMS]])
  for (const [key, {label, aliases}] of Object.entries(entries))
    for (const name of [key, label, ...aliases]) TAB_KEYS.set(normalizeKey(name), {group, key, label});
// "### ChatGPT (aba Codex)" → {group:'plataforma', key:'chatgpt-codex', label:'ChatGPT · aba Codex'}; null se não for aba.
export const tabFor = title => TAB_KEYS.get(normalizeKey(title)) || null;

// Seções obrigatórias por tipo, com o título como o autor escreve no Markdown (## Título).
export const REQUIRED_SECTIONS = {
  app: ['O que faz', 'Para quem', 'Exemplos de uso', 'Requisitos', 'Como instalar', 'Privacidade'],
  conector: ['O que faz', 'Para quem', 'Requisitos', 'Como instalar', 'Privacidade'],
  skill: ['O que faz', 'Para quem', 'Exemplos de uso', 'Requisitos', 'Como instalar', 'Privacidade'],
  agente: ['O que faz', 'Para quem', 'Exemplos de uso', 'Requisitos', 'Como instalar', 'Privacidade'],
  prompt: ['O que faz', 'Prompt', 'Requisitos', 'Como usar'],
  tutorial: [],
};
// Seções cujas subseções (###) viram perguntas que abrem e fecham.
export const ACCORDION_SECTIONS = new Set(['Perguntas frequentes', 'Problemas comuns'].map(normalizeKey));
// Seções que não aparecem no corpo da página porque o modelo as mostra em outro lugar.
export const HIDDEN_SECTIONS = new Set(['Prompt'].map(normalizeKey));
