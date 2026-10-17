import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync, cpSync} from 'node:fs';
import {join} from 'node:path';
import {loadSite, FIELDS} from '../generator/catalog.js';
import {SITE_ROOT} from '../generator/build.js';
import {TYPES, PLATFORMS, STATUS} from '../generator/taxonomy.js';
import {siteCopy, cleanCopies} from './helpers.js';

after(cleanCopies);
const site = await loadSite(SITE_ROOT);
const byId = id => site.items.find(item => item.id === id);
const problemsIn = async files => (await loadSite(siteCopy(files))).problems.map(problem => `${problem.file}: ${problem.message}`);
const PROMPT = `---
titulo: Teste
resumo: Prompt de teste.
situacao: em-teste
plataformas: [claude-desktop]
fontes: [atlas]
atualizado: 2026-10-16
---

## Prompt

Usando o FosterMCP, faça um teste.

## Quando usar

Em testes.
`;

test('o catálogo real está válido: cabeçalhos, seções, abas, blocos, skills, agentes e referências', () => {
  assert.deepEqual(site.problems, []);
  for (const type of ['app', 'skill', 'agente', 'prompt', 'tutorial']) assert.ok(site.items.some(item => item.type === type), `há ao menos um item do tipo ${type}`);
  assert.equal(site.items.filter(item => item.type === 'prompt').length, 10);
  assert.ok(site.items.every(item => item.meta.plataformas.every(platform => Object.hasOwn(PLATFORMS, platform))));
});

test('honestidade de plataforma: Gemini e Grok só aparecem como "em breve"', () => {
  const app = byId('apps/fostermcp');
  assert.deepEqual(app.meta.plataformas, ['claude-desktop', 'chatgpt-codex', 'cursor', 'claude-code']);
  assert.deepEqual(app.meta.plataformas_em_breve, ['gemini', 'grok']);
  for (const item of site.items) assert.ok(!item.meta.plataformas.some(platform => ['gemini', 'grok'].includes(platform)), item.id);
  // Itens que dependem do FosterMCP não oferecem Projetos e GPTs do ChatGPT como lugar para consultar dados.
  for (const item of site.items.filter(candidate => candidate.type === 'prompt')) assert.ok(!item.meta.plataformas.includes('chatgpt'), item.id);
});

test('os itens de exemplo têm a situação combinada: em teste, em breve e avançado', () => {
  const expected = {
    'skills/consultas-fostermcp': ['em-teste'], 'skills/apresentacao-cliente': ['em-teste'], 'skills/briefing-reuniao': ['em-teste'], 'skills/resumo-vencimentos': ['em-breve'],
    'agentes/assistente-pre-reuniao': ['em-teste'], 'agentes/fostermcp-grokbot': ['em-breve', true], 'agentes/fostermcp-hermes': ['em-breve', true],
  };
  for (const [id, [status, advanced = undefined]] of Object.entries(expected)) {
    assert.equal(byId(id)?.meta.situacao, status, id);
    assert.equal(byId(id).meta.avancado, advanced, id);
  }
  const skill = byId('skills/apresentacao-cliente');
  assert.equal(skill.skill.name, 'apresentacao-cliente');
  assert.deepEqual(skill.skill.files.map(file => file.name), ['apresentacao-cliente/SKILL.md'], 'o .zip leva só o SKILL.md, sem a página do site');
  assert.equal(byId('skills/resumo-vencimentos').skill, undefined, 'item em breve não tem arquivo para baixar');
  assert.ok(byId('agentes/assistente-pre-reuniao').instructions.length > 500);
  for (const id of ['skills/apresentacao-cliente', 'skills/briefing-reuniao', 'skills/consultas-fostermcp', 'skills/resumo-vencimentos']) assert.ok(byId(id).blocks.resultado, `${id}: exemplo de resultado`);
});

test('o FosterMCP segue o modelo de app: o que é, exemplos, antes de começar, instalação, conexões, atualizar e problemas', () => {
  const app = byId('apps/fostermcp');
  const titles = app.sections.map(section => section.title);
  assert.deepEqual(titles, ['O que é', 'O que dá para fazer', 'Antes de começar', 'Instalação', 'Conectar ao seu assistente', 'Conectar suas fontes', 'Atualizar', 'Problemas comuns', 'Privacidade']);
  const tabs = title => app.sections.find(section => section.title === title).tabs.panels.map(panel => panel.tab.key);
  assert.deepEqual(tabs('Instalação'), ['windows', 'mac']);
  assert.deepEqual(tabs('Conectar ao seu assistente'), ['claude-desktop', 'chatgpt-codex', 'cursor', 'claude-code']);
  assert.deepEqual(tabs('Conectar suas fontes'), ['atlas', 'whatsapp', 'email']);
  assert.equal(app.blocks.fluxo.length, 3);
  assert.equal(app.blocks.exemplos.length, 3);
  assert.ok(app.blocks.smartscreen, 'réplica do SmartScreen');
  const text = app.sections.map(section => section.raw).join('\n');
  for (const phrase of ['Mais informações', 'Executar assim mesmo', 'Abrir Mesmo Assim', 'Entrar pela janela do navegador', 'Atualizar Atlas', 'Aparelhos conectados', 'Abrir ao entrar no computador', 'Encerrar FosterMCP', 'Copiar diagnóstico', 'Configurar neste computador'])
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
    for (const text of [readFileSync(join(SITE_ROOT, item.file), 'utf8'), item.skill?.source || '', item.instructions || '']) for (const name of text.match(pattern) || []) cited.add(name);
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
  const skill = readFileSync(join(SITE_ROOT, 'catalog/skills/briefing-reuniao/SKILL.md'), 'utf8');
  const app = readFileSync(join(SITE_ROOT, 'catalog/apps/fostermcp.md'), 'utf8');
  const cases = [
    [{'catalog/prompts/teste.md': PROMPT.replace('titulo: Teste\n', '')}, /teste\.md: Falta o campo "titulo"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('fontes: [atlas]\n', '')}, /Falta o campo "fontes"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('[claude-desktop]', '[claude-web]')}, /plataformas: lista com/],
    [{'catalog/prompts/teste.md': PROMPT.replace('em-teste', 'publicado')}, /situacao: disponivel, em-teste, em-breve/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\ntitlo: x')}, /Campo desconhecido "titlo"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('2026-10-16', '2026-02-30')}, /atualizado: data no formato AAAA-MM-DD/],
    [{'catalog/prompts/Teste Ação.md': PROMPT}, /letras minúsculas sem acento/],
    [{'catalog/prompts/teste.md': PROMPT.replace('## Prompt\n\nUsando o FosterMCP, faça um teste.\n', '')}, /Falta a seção "## Prompt"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Em testes.', '<!-- incluir: nao-existe -->')}, /O trecho "nao-existe" não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Em testes.', 'Teste {{site.inexistente}}.')}, /A variável \{\{site\.inexistente\}\} não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\nrequer: [apps/nao-existe]')}, /requer: "apps\/nao-existe" não existe/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Em testes.', '### Claude Desktop\n\nCole.\n\n### Outro jeito\n\nCole.')}, /"### Outro jeito" não é nome de aba/],
    [{'catalog/prompts/teste.md': PROMPT.replace('[claude-desktop]', '[claude-desktop, cursor]').replace('Em testes.', '### Claude Desktop\n\nCole.')}, /A plataforma Cursor está em plataformas, mas não tem aba/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\nplataformas_em_breve: [claude-desktop]')}, /não pode estar em plataformas e em plataformas_em_breve/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\nsubstituido_por: prompts/preparar-reuniao')}, /substituido_por só vale para itens com situacao defasado ou arquivado/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: defasado\nsubstituido_por: prompts/nao-existe')}, /substituido_por: "prompts\/nao-existe" não existe no catálogo/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: defasado\nsubstituido_por: prompts/teste')}, /substituido_por não pode apontar para o próprio item/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: defasado\nsubstituido_por: prompts/velho'), 'catalog/prompts/velho.md': PROMPT.replace('em-teste', 'arquivado')}, /"prompts\/velho" está arquivado/],
    [{'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\nrevisar_ate: 2027-02-30')}, /revisar_ate: data da próxima revisão/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Em testes.', '```exemplos\n- fonte: Atlas\n  pergunta: Sem resposta?\n```')}, /bloco exemplos: lista de 1 a 6 exemplos/],
    [{'catalog/prompts/teste.md': PROMPT.replace('Em testes.', '```resultado\ntipo: memo\ntitulo: X\nlinhas:\n  - [Total, R$ 1,23 mi]\n```')}, /bloco resultado: tipo \(memo ou slide\)/],
    [{'catalog/apps/fostermcp.md': app.replace('### Mac\n', '### Linux\n')}, /"### Linux" não é nome de aba/],
    [{'catalog/skills/briefing-reuniao/SKILL.md': skill.replace('name: briefing-reuniao', 'name: outro-nome')}, /name deve ser igual ao nome da pasta/],
    [{'catalog/skills/briefing-reuniao/SKILL.md': skill.replace(/^description: .*$/m, `description: ${'x'.repeat(501)}`)}, /description: de 1 a 500 caracteres/],
    [{'catalog/skills/briefing-reuniao/SKILL.md': null}, /precisa do arquivo SKILL\.md/],
    [{'catalog/agentes/assistente-pre-reuniao/instrucoes.md': null}, /precisa do arquivo instrucoes\.md/],
    [{'catalog/prompts/teste.txt': 'x'}, /Só arquivos \.md ou pastas/],
    [{'config.js': "export default {nome: 'Central', endereco: 'http://exemplo.com'};"}, /config\.js: /],
  ];
  for (const [files, expected] of cases) {
    const problems = await problemsIn(files);
    assert.ok(problems.some(problem => expected.test(problem)), `${expected}\n${problems.join('\n')}`);
  }
});

test('os guias acompanham o código: o AGENTS.md documenta todos os campos, situações e plataformas', () => {
  const agents = readFileSync(join(SITE_ROOT, 'AGENTS.md'), 'utf8');
  for (const name of [...Object.keys(FIELDS), ...Object.keys(STATUS), ...Object.keys(PLATFORMS)]) assert.ok(agents.includes(`\`${name}\``), `AGENTS.md não cita \`${name}\``);
  for (const {folder} of Object.values(TYPES)) assert.ok(agents.includes(`catalog/${folder}/_modelo`), `AGENTS.md não aponta o modelo de ${folder}`);
  assert.match(readFileSync(join(SITE_ROOT, 'CLAUDE.md'), 'utf8'), /^@AGENTS\.md$/m, 'CLAUDE.md importa o AGENTS.md');
  const guide = readFileSync(join(SITE_ROOT, 'COMO-EDITAR.md'), 'utf8');
  for (const name of Object.keys(STATUS)) assert.ok(guide.includes(`\`${name}\``), `COMO-EDITAR.md não explica \`${name}\``);
});
