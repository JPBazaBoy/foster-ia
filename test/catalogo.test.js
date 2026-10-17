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
// items: publicados; drafts: rascunhos, que ficam fora do site.
const all = [...site.items, ...site.drafts];
const byId = id => all.find(item => item.id === id);
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
  for (const type of ['app', 'skill', 'agente', 'prompt', 'tutorial']) assert.ok(all.some(item => item.type === type), `há ao menos um item do tipo ${type}`);
  // Itens não são apagados (arquivam-se): a conta só cresce.
  assert.ok(all.filter(item => item.type === 'prompt').length >= 10, 'algum prompt foi apagado');
  assert.ok(all.every(item => item.meta.plataformas.every(platform => Object.hasOwn(PLATFORMS, platform))));
});

test('honestidade de plataforma: Gemini e Grok só aparecem como "em breve"', () => {
  const app = byId('apps/fostermcp');
  assert.deepEqual(app.meta.plataformas, ['claude-desktop', 'chatgpt-codex', 'cursor', 'claude-code']);
  assert.deepEqual(app.meta.plataformas_em_breve, ['gemini', 'grok']);
  // Vale também para os rascunhos: o cabeçalho deles é conferido e um dia eles saem do rascunho.
  for (const item of all) assert.ok(!item.meta.plataformas.some(platform => ['gemini', 'grok'].includes(platform)), item.id);
  // Itens que dependem do FosterMCP não oferecem Projetos e GPTs do ChatGPT como lugar para consultar dados.
  for (const item of all.filter(candidate => candidate.type === 'prompt')) assert.ok(!item.meta.plataformas.includes('chatgpt'), item.id);
});

test('GrokBot e Hermes ainda não funcionam: itens para eles são avançados e não aparecem como prontos', () => {
  const agents = all.filter(item => item.meta.plataformas.some(platform => ['grokbot', 'hermes'].includes(platform)));
  assert.ok(agents.length >= 2);
  for (const item of agents) {
    assert.equal(item.meta.avancado, true, item.id);
    assert.ok(['rascunho', 'em-breve', 'defasado', 'arquivado'].includes(item.meta.situacao), `${item.id}: ${item.meta.situacao}`);
  }
});

test('rascunho fica fora do site: só o cabeçalho é conferido, e o conteúdo pode estar pela metade', async () => {
  const half = `---
titulo: Skill pela metade
resumo: Skill que ainda está sendo escrita.
situacao: rascunho
plataformas: [claude-desktop]
atualizado: 2026-10-16
---

## O que faz

<!-- incluir: nao-existe -->

\`\`\`resultado
tipo: memo
\`\`\`
`;
  const {problems, items, drafts} = await loadSite(siteCopy({'catalog/skills/pela-metade/pagina.md': half}));
  assert.deepEqual(problems, [], 'sem SKILL.md, sem as outras seções, com trecho inexistente e bloco incompleto: nada é cobrado');
  assert.ok(drafts.some(item => item.id === 'skills/pela-metade'));
  assert.ok(!items.some(item => item.id === 'skills/pela-metade'));
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
  for (const item of all) {
    for (const name of item.meta.ferramentas || []) cited.add(name);
    const extra = item.dir ? ['SKILL.md', 'instrucoes.md'].map(name => join(item.dir, name)).filter(existsSync) : [];
    for (const path of [join(SITE_ROOT, item.file), ...extra]) for (const name of readFileSync(path, 'utf8').match(pattern) || []) cited.add(name);
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
  // Skill e agente publicados a partir dos modelos (os do repositório estão em rascunho e não são conferidos).
  const modelo = path => readFileSync(join(SITE_ROOT, 'catalog', path), 'utf8');
  const skill = modelo('skills/_modelo/SKILL.md'), skillPage = {'catalog/skills/nome-da-skill/pagina.md': modelo('skills/_modelo/pagina.md')};
  const agentPage = {'catalog/agentes/agente-teste/pagina.md': modelo('agentes/_modelo/pagina.md')};
  const app = modelo('apps/fostermcp.md'), config = readFileSync(join(SITE_ROOT, 'config.js'), 'utf8');
  const DRAFT = {'catalog/prompts/guardado.md': PROMPT.replace('titulo: Teste', 'titulo: Guardado').replace('em-teste', 'rascunho')};
  const cases = [
    [{'catalog/prompts/teste.md': PROMPT.replace('titulo: Teste\n', '')}, /teste\.md: Falta o campo "titulo"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('fontes: [atlas]\n', '')}, /Falta o campo "fontes"/],
    [{'catalog/prompts/teste.md': PROMPT.replace('[claude-desktop]', '[claude-web]')}, /plataformas: lista com/],
    [{'catalog/prompts/teste.md': PROMPT.replace('em-teste', 'publicado')}, /situacao: rascunho, em-breve, em-teste, disponivel, em-revisao, defasado, arquivado/],
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
    [{...skillPage, 'catalog/skills/nome-da-skill/SKILL.md': skill.replace('name: nome-da-skill', 'name: outro-nome')}, /name deve ser igual ao nome da pasta/],
    [{...skillPage, 'catalog/skills/nome-da-skill/SKILL.md': skill.replace(/^description: .*$/m, `description: ${'x'.repeat(501)}`)}, /description: de 1 a 500 caracteres/],
    [skillPage, /nome-da-skill\/pagina\.md: A pasta da skill precisa do arquivo SKILL\.md/],
    [agentPage, /agente-teste\/pagina\.md: A pasta do agente precisa do arquivo instrucoes\.md/],
    [{'catalog/prompts/teste.txt': 'x'}, /Só arquivos \.md ou pastas/],
    [{'config.js': "export default {nome: 'Central', endereco: 'http://exemplo.com'};"}, /config\.js: /],
    [{'config.js': config.replace(/downloads: (true|false)/, "downloads: 'sim'")}, /config\.js: downloads: true liga os botões/],
    [{'conteudo/tipos/skills.md': `---\nresumo: Frase.\nvazio: ${'x'.repeat(161)}\n---\n`}, /tipos\/skills\.md: vazio: uma frase de até 160 caracteres/],
    // Rascunho: o cabeçalho é conferido; e nada publicado pode apontar para ele, porque ele não vira página.
    [{'catalog/prompts/guardado.md': DRAFT['catalog/prompts/guardado.md'].replace('2026-10-16', '2026-02-30')}, /guardado\.md: atualizado: data no formato AAAA-MM-DD/],
    [{...DRAFT, 'catalog/prompts/teste.md': PROMPT.replace('Em testes.', 'Veja [o outro](/prompts/guardado/#quando-usar).')}, /teste\.md: O link \/prompts\/guardado\/#quando-usar leva a "Guardado" \(prompts\/guardado\), que está em rascunho e não entra no site/],
    [{...DRAFT, 'conteudo/novidades.yml': '- data: 2026-10-16\n  texto: Prompt novo.\n  link: /prompts/guardado/\n'}, /novidades\.yml: O link \/prompts\/guardado\/ leva a "Guardado"/],
    [{...DRAFT, 'conteudo/paginas/ajuda.md': '---\ntitulo: Ajuda\nresumo: Ajuda.\n---\n\nVeja o [prompt](/prompts/guardado).\n'}, /ajuda\.md: O link \/prompts\/guardado leva a "Guardado"/],
    [{...DRAFT, 'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: defasado\nsubstituido_por: prompts/guardado')}, /substituido_por: "prompts\/guardado" está em rascunho/],
    [{...DRAFT, 'catalog/prompts/teste.md': PROMPT.replace('situacao: em-teste', 'situacao: em-teste\nrequer: [prompts/guardado]')}, /requer: "prompts\/guardado" está em rascunho/],
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
  // As chaves de config.js que ligam e desligam partes do site, e a frase das listas vazias.
  const readme = readFileSync(join(SITE_ROOT, 'README.md'), 'utf8');
  for (const name of ['previa', 'downloads', 'indexar']) {
    assert.ok(agents.includes(`\`${name}\``), `AGENTS.md não cita \`${name}\``);
    assert.ok(readme.includes(`\`${name}`), `README.md não explica \`${name}\``);
  }
  assert.ok(agents.includes('`vazio`'), 'AGENTS.md não cita `vazio`');
});
