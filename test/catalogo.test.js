import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync, cpSync} from 'node:fs';
import {join} from 'node:path';
import {loadSite} from '../generator/catalog.js';
import {SITE_ROOT} from '../generator/build.js';
import {TYPES, PLATFORMS} from '../generator/taxonomy.js';
import {siteCopy, cleanCopies} from './helpers.js';

after(cleanCopies);
const site = await loadSite(SITE_ROOT);
const problemsIn = async files => (await loadSite(siteCopy(files))).problems.map(problem => `${problem.file}: ${problem.message}`);
const PROMPT = `---
titulo: Teste
resumo: Prompt de teste.
plataformas: [claude-desktop]
atualizado: 2026-10-16
status: rascunho
---

## O que faz

Testa.

## Prompt

Use o fostermcp.

## Requisitos

- Nada.

## Como usar

Cole.
`;

test('o catálogo real está válido: cabeçalhos, seções, abas, skills, agentes e referências', () => {
  assert.deepEqual(site.problems, []);
  assert.ok(site.items.length >= 19);
  for (const type of Object.keys(TYPES)) assert.ok(site.items.some(item => item.type === type), `há ao menos um item do tipo ${type}`);
  assert.equal(site.items.filter(item => item.type === 'prompt').length, 10);
  assert.ok(site.items.every(item => item.meta.plataformas.every(platform => Object.hasOwn(PLATFORMS, platform))));
});

test('a skill e o agente de exemplo continuam marcados como rascunho para revisão', () => {
  const skill = site.items.find(item => item.id === 'skills/consultas-fostermcp');
  const agent = site.items.find(item => item.id === 'agentes/assistente-pre-reuniao');
  assert.equal(skill.meta.status, 'rascunho');
  assert.equal(agent.meta.status, 'rascunho');
  assert.equal(skill.skill.name, 'consultas-fostermcp');
  assert.match(skill.skill.body, /get_workspace_overview/);
  assert.deepEqual(skill.skill.files.map(file => file.name), ['consultas-fostermcp/SKILL.md'], 'o .zip leva só o SKILL.md, sem a página do site');
  assert.ok(agent.instructions.length > 500);
});

test('o FosterMCP tem as seções pedidas: download, instalação por sistema, primeiro uso, conexão, atualização, ajuda e privacidade', () => {
  const app = site.items.find(item => item.id === 'apps/fostermcp');
  const titles = app.sections.map(section => section.title);
  for (const title of ['Como instalar', 'Primeiro uso', 'Como conectar ao seu assistente', 'Como atualizar', 'Como pedir ajuda', 'Perguntas frequentes', 'Problemas comuns', 'Privacidade'])
    assert.ok(titles.includes(title), title);
  assert.deepEqual(app.sections.find(section => section.title === 'Como instalar').tabs.panels.map(panel => panel.tab.key), ['windows', 'mac']);
  assert.deepEqual(app.sections.find(section => section.title === 'Como conectar ao seu assistente').tabs.panels.map(panel => panel.tab.key), ['claude-desktop', 'chatgpt-codex', 'claude-code', 'cursor']);
  const text = app.sections.map(section => section.raw).join('\n');
  for (const phrase of ['Mais informações', 'Executar assim mesmo', 'Abrir Mesmo Assim', 'Entrar pela janela do navegador', 'Atualizar Atlas', 'Aparelhos conectados', 'Abrir ao entrar no computador', 'Encerrar FosterMCP', 'Copiar diagnóstico'])
    assert.ok(text.includes(phrase), phrase);
});

// No repositório privado, as ferramentas citadas no conteúdo precisam existir no catálogo real do app.
const appCatalog = join(SITE_ROOT, '..', 'src', 'catalog.js');
test('as ferramentas citadas existem no FosterMCP', {skip: !existsSync(appCatalog) && 'código do app ausente (repositório público)'}, () => {
  const source = ['catalog.js', 'whatsapp-read.js'].map(name => readFileSync(join(SITE_ROOT, '..', 'src', name), 'utf8')).join('\n');
  const known = new Set(source.match(/'([a-z]+_[a-z_]+)'/g).map(name => name.slice(1, -1)));
  const pattern = /\b(?:get|list|search|query|consolidate|resolve|create|update)_[a-z_]+\b/g;
  const cited = new Set();
  for (const item of site.items) {
    for (const name of item.meta.ferramentas || []) cited.add(name);
    const files = [readFileSync(join(SITE_ROOT, item.file), 'utf8'), item.skill?.source || '', item.instructions || ''];
    for (const text of files) for (const name of text.match(pattern) || []) cited.add(name);
  }
  const missing = [...cited].filter(name => !known.has(name));
  assert.deepEqual(missing, [], `ferramentas que não existem em src/catalog.js: ${missing.join(', ')}`);
});

test('os modelos (_modelo) viram itens válidos quando copiados', async () => {
  for (const {folder} of Object.values(TYPES)) {
    const entry = readdirSync(join(SITE_ROOT, 'catalog', folder)).find(name => name.startsWith('_modelo'));
    assert.ok(entry, `há um modelo em catalog/${folder}`);
    const root = siteCopy();
    // A pasta da skill de modelo precisa ter o mesmo nome que o "name" do SKILL.md.
    const target = folder === 'skills' ? 'nome-da-skill' : entry.endsWith('.md') ? 'modelo-teste.md' : 'modelo-teste';
    cpSync(join(SITE_ROOT, 'catalog', folder, entry), join(root, 'catalog', folder, target), {recursive: true});
    const {problems, items} = await loadSite(root);
    assert.deepEqual(problems.map(problem => `${problem.file}: ${problem.message}`), [], folder);
    assert.ok(items.some(item => item.folder === folder && item.slug === target.replace(/\.md$/, '')), folder);
  }
});

test('erros comuns de quem escreve viram mensagens claras, com o arquivo', async () => {
  const cases = [
    [{'catalog/prompts/teste.md': PROMPT.replace('titulo: Teste\n', '')}, /teste\.md: Falta o campo "titulo"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('[claude-desktop]', '[claude-web]')}, /plataformas: lista com/],
    [{'catalog/prompts/teste.md': PROMPT.replace('status: rascunho', 'status: rascunho\ntitlo: x')}, /Campo desconhecido "titlo"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('2026-10-16', '2026-02-30')}, /atualizado: data no formato AAAA-MM-DD/],
    [{'catalog/prompts/Teste Ação.md': PROMPT}, /letras minúsculas sem acento/],
    [{'catalog/prompts/teste.md': PROMPT.replace('## Prompt\n\nUse o fostermcp.\n', '')}, /Falta a seção "## Prompt"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Cole.', '<!-- incluir: nao-existe -->')}, /O trecho "nao-existe" não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Testa.', 'Testa {{site.inexistente}}.')}, /A variável \{\{site\.inexistente\}\} não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('status: rascunho', 'status: rascunho\nrequer: [apps/nao-existe]')}, /requer: "apps\/nao-existe" não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Cole.', '### Claude Desktop\n\nCole.\n\n### Outro jeito\n\nCole.')}, /"### Outro jeito" não é nome de aba/],
    [{'catalog/prompts/teste.md': PROMPT.replace('[claude-desktop]', '[claude-desktop, cursor]').replace('Cole.', '### Claude Desktop\n\nCole.')}, /A plataforma Cursor está em plataformas, mas não tem aba/],
    [{'catalog/skills/consultas-fostermcp/SKILL.md': readFileSync(join(SITE_ROOT, 'catalog/skills/consultas-fostermcp/SKILL.md'), 'utf8').replace('name: consultas-fostermcp', 'name: outro-nome')}, /name deve ser igual ao nome da pasta/],
    [{'catalog/skills/consultas-fostermcp/SKILL.md': readFileSync(join(SITE_ROOT, 'catalog/skills/consultas-fostermcp/SKILL.md'), 'utf8').replace(/^description: .*$/m, `description: ${'x'.repeat(501)}`)}, /description: de 1 a 500 caracteres/],
    [{'catalog/agentes/assistente-pre-reuniao/instrucoes.md': null}, /precisa do arquivo instrucoes\.md/],
    [{'catalog/prompts/teste.txt': 'x'}, /Só arquivos \.md ou pastas/],
    [{'config.js': "export default {nome: 'Central', endereco: 'http://exemplo.com'};"}, /config\.js: /],
  ];
  for (const [files, expected] of cases) {
    const problems = await problemsIn(files);
    assert.ok(problems.some(problem => expected.test(problem)), `${expected}\n${problems.join('\n')}`);
  }
});
