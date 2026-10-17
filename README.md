# Central de IA (site)

Portal de consulta, aberto, gratuito e sem login, com o que os assessores usam de IA no dia a dia: aplicativos e conectores (o FosterMCP primeiro), skills, modelos de agentes, prompts e tutoriais. Cada item diz o que é, mostra exemplos de resultado e traz o passo a passo do que clicar. O site cresce só com a adição de arquivos em `catalog/`.

> Nome, assinatura, cores, contato e endereços são **provisórios** e ficam todos em [`config.js`](config.js). A referência visual aprovada (versão C) está em [`design/referencia-c/`](design/referencia-c/).

## Ver o site no seu computador

Precisa do Node.js 22.13 ou mais novo. Na pasta do repositório:

```sh
npm --prefix site ci
npm --prefix site run dev
```

Abra <http://localhost:8080/foster-ia/>. A página recarrega sozinha quando você salva um arquivo em `catalog/`, `conteudo/`, `public/` ou `assets/`. Para parar, aperte Ctrl+C. Mudanças em `generator/` pedem parar e rodar de novo.

Antes de enviar qualquer mudança, rode os testes. Eles conferem cada item e avisam, em português, o arquivo e o que corrigir:

```sh
npm --prefix site test
```

Para gerar o site final em `site/_site/`: `npm --prefix site run build`.

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
| --- | --- |
| `config.js` | Nome, assinatura do cabeçalho, cores da Foster, endereços, contato e aviso. Único lugar para trocar essas coisas. |
| `catalog/` | Os itens, uma pasta por tipo: `apps`, `conectores`, `skills`, `agentes`, `prompts`, `tutoriais`. |
| `catalog/<tipo>/_modelo…` | Modelo pronto para copiar. Arquivos e pastas que começam com `_` não entram no site. |
| `conteudo/inicio.yml` | Textos da página inicial e o quadro "Primeira vez aqui?". |
| `conteudo/novidades.yml` | Novidades da página inicial. |
| `conteudo/tipos/` | A frase de cada categoria (Aplicativos e conectores, Skills, Agentes, Prompts, Tutoriais). |
| `conteudo/paginas/` | Páginas avulsas, como a Ajuda. |
| `conteudo/trechos/` | Trechos repetidos em várias páginas, como a instalação no Windows. |
| `public/` | Arquivos copiados como estão: prints em `public/imagens/` e o `fostermcp/version.json`. |
| `assets/` | Estilo (CSS) e comportamento (JS). As fontes Manrope e Cormorant Garamond vêm do npm (licença OFL) e são servidas pelo próprio site. |
| `generator/` | O gerador do site (Node, sem framework). |
| `test/` | Testes do catálogo e do site gerado. |
| `design/referencia-c/` | Referência visual aprovada. Não entra no site. |
| `revisao/` | Prints de revisão. Não entram no site nem no repositório público. |

## Como adicionar um item

O caminho é sempre o mesmo:

1. Copie o modelo do tipo (`_modelo.md` ou a pasta `_modelo`).
2. Dê um nome ao arquivo ou à pasta com **letras minúsculas sem acento, números e hífens**. O nome vira o endereço: `catalog/prompts/vencimentos-do-mes.md` vira `/prompts/vencimentos-do-mes/`.
3. Preencha o cabeçalho e o texto. A primeira frase do `resumo` diz o que a coisa é. Instruções diretas, na segunda pessoa, sem adjetivo vendedor. Dados de exemplo são sempre fictícios e marcados como fictícios.
4. Comece com `situacao: em-teste`. Troque para `disponivel` quando o item for validado.
5. Veja no `npm --prefix site run dev` e rode `npm --prefix site test`.

**Aplicativo ou conector** (`catalog/apps/` ou `catalog/conectores/`): seções O que é, O que dá para fazer, Antes de começar, Instalação (abas `### Windows` e `### Mac`), Conectar ao seu assistente (uma aba por plataforma) e Problemas comuns. Os dois tipos aparecem juntos em Apps e conectores.

**Skill** (pasta `catalog/skills/<nome>/`): `pagina.md` com O que faz, Exemplo de resultado, Onde funciona, Instalação, Como usar e Problemas comuns, e o `SKILL.md` no padrão Agent Skills. O `name` do `SKILL.md` é **igual ao nome da pasta** (minúsculas, números e hífens, sem "claude" nem "anthropic") e a `description` diz o que a skill faz e **quando** usar, em até 500 caracteres. Na construção, a pasta (menos `pagina.md`) vira `<nome>.zip`, com a pasta na raiz, como o Claude pede. Skill em breve pode ficar sem `SKILL.md`.

**Modelo de agente** (pasta `catalog/agentes/<nome>/`): `pagina.md` com Para que serve, O que precisa e Passo a passo (uma aba por plataforma), e `instrucoes.md` com até 8000 caracteres, que vira o AGENTS.md para baixar. Agentes autônomos levam `avancado: true`. Agente em breve pode ficar sem `instrucoes.md`.

**Prompt** (`catalog/prompts/`): um pedido curto e direto logo abaixo de `## Prompt` (até 600 caracteres; use `[colchetes]` no que a pessoa troca) e a seção Quando usar. Liste em `fontes` o que ele consulta (`atlas`, `whatsapp`, `email`): é o filtro da biblioteca.

**Tutorial** (`catalog/tutoriais/`): texto livre, com `assunto` e `tempo` no cabeçalho. Listas numeradas viram o passo a passo em linha do tempo.

**Novidade:** um bloco a mais em `conteudo/novidades.yml`, com `data`, `texto` e, se quiser, `link` (começando com `/`).

**Print:** salve a imagem em `public/imagens/…` e use `![O que aparece na imagem](/imagens/pasta/arquivo.png)`. Enquanto o arquivo não existe, o site mostra uma vaga com a legenda "Print a ser incluído" e o build lista os prints que faltam.

## O cabeçalho de cada item

| Campo | Obrigatório | O que é |
| --- | --- | --- |
| `titulo` | sim | Nome curto, até 80 caracteres. |
| `resumo` | sim | Até 220 caracteres. A primeira frase diz o que o item é. |
| `situacao` | sim | `disponivel`, `em-teste` ou `em-breve`. Vira o selo Disponível, Em teste ou Em breve. |
| `plataformas` | sim | Onde funciona hoje: `claude-desktop`, `chatgpt-codex` (aba Codex do app do ChatGPT), `chatgpt` (Projetos e GPTs), `cursor`, `claude-code`, `grokbot`, `hermes`. Em itens em breve, são as plataformas previstas (aparecem tracejadas). |
| `atualizado` | sim | Data da última revisão, `AAAA-MM-DD`. |
| `plataformasEmBreve` | não | Plataformas que ainda não funcionam e aparecem tracejadas, como `[gemini, grok]`. Nunca prometa o que não funciona. |
| `avancado` | não | `true` mostra o selo Avançado e o aviso de que exige configuração técnica. |
| `destaque` | não | `true` coloca o item na página inicial. |
| `versao` | não | Versão do item, entre aspas: `"1.0"`. |
| `ordem` | não | Número para ordenar dentro do tipo (menor primeiro). |
| `requer` | não | Itens necessários, como `[apps/fostermcp]`. |
| `ferramentas` | não | Ferramentas do FosterMCP usadas, como `[search_clients]`. |
| `fontes` | prompts | Fontes de dados: `atlas`, `whatsapp`, `email`. Obrigatório nos prompts. |
| `palavras` | não | Palavras extras para a busca. |
| `usos`, `compatibilidade` | apps | Frases de "O que dá para fazer" no cartão e a linha de sistemas e custo. |
| `download` | apps | `fostermcp` liga o quadro de download com o `version.json`. |
| `app` | conectores | App que traz o conector, como `apps/fostermcp`. |
| `assunto`, `tempo` | tutoriais | Assunto curto (Instalação, Atlas…) e tempo, como `"8 min"`. |

## Seções, abas e blocos

- Cada `## Título` vira uma seção, com o índice "Nesta página" ao lado.
- Subtítulos `###` com nome de plataforma (Claude Desktop, ChatGPT (aba Codex), ChatGPT (Projetos e GPTs), Cursor, Claude Code, GrokBot, Hermes Agent), de sistema (Windows, Mac) ou de fonte (Atlas, WhatsApp, E-mail) viram **abas**. Cada plataforma de `plataformas` precisa ter a sua aba; as de `plataformasEmBreve` aparecem ao lado, tracejadas.
- Listas numeradas viram o passo a passo em linha do tempo. Comece cada passo com o título em negrito: `1. **Baixe o instalador.** Clique em…`.
- Em "Problemas comuns" e "Perguntas frequentes", cada `###` é uma pergunta com a resposta embaixo.
- Avisos: uma linha `> [!WARNING]` (ou `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!CAUTION]`) seguida do texto com `> ` no começo.
- Links internos começam com `/`, como `[FosterMCP](/apps/fostermcp/)`. Trechos repetidos entram com `<!-- incluir: nome-do-trecho -->`. Variáveis: `{{site.nome}}`, `{{site.contato}}`, `{{site.aviso}}`, `{{item.zipNome}}`, `{{item.pasta}}`.
- **Blocos visuais** são escritos em YAML dentro de três crases, com o nome do bloco. Valores com vírgula vão entre aspas (`"R$ 1,23 mi"`):

| Bloco | Mostra | Formato |
| --- | --- | --- |
| ` ```fluxo ` | O diagrama "como funciona" em uma linha | lista de 2 a 4 caixas com `rotulo`, `texto`, `nota` e `destaque: true` |
| ` ```exemplos ` | Perguntas e respostas de exemplo, com fonte e data | lista com `fonte`, `pergunta`, `resposta` (ou `linhas`), `ferramenta` e `citacao` |
| ` ```requisitos ` | A lista "Antes de começar", com ✓ e ○ | lista com `texto`, `nota` e `opcional: true` |
| ` ```resultado ` | A prévia "Exemplo de resultado" de uma skill | `tipo: memo` (com `titulo` e `linhas`) ou `tipo: slide` (com `titulo`) |
| ` ```smartscreen ` | A réplica do aviso do Windows com "Executar assim mesmo" em destaque | `arquivo:` nome do instalador |
| ` ```prompt ` | Uma caixa de pergunta com o botão Copiar | o texto da pergunta |

Os cartões da página inicial usam o primeiro `exemplos` (o que tem `linhas`) e o primeiro `resultado` de cada item.

## Prints que faltam

O site mostra uma vaga "Print a ser incluído" no lugar de cada imagem abaixo. Tire o print, apague o que for pessoal (nome, número, e-mail, dados de cliente) e salve com o nome indicado:

| Arquivo em `public/imagens/` | O que mostrar |
| --- | --- |
| `fostermcp/instalador-windows.png` | Tela final do instalador do FosterMCP no Windows. |
| `fostermcp/mac-abrir-mesmo-assim.png` | Mac: Ajustes do Sistema › Privacidade e Segurança, com **Abrir Mesmo Assim** ao lado do aviso do FosterMCP. |
| `fostermcp/atlas.png` | FosterMCP › Conexões › cartão do Atlas, com **Entrar pela janela do navegador**, **Atualizar Atlas** e o selo Atualizado. |
| `fostermcp/whatsapp-pareamento.png` | Cartão do WhatsApp durante o pareamento, com o QR code coberto. |
| `fostermcp/bandeja.png` | Menu do ícone perto do relógio: Abrir FosterMCP, Abrir ao entrar no computador, Encerrar FosterMCP. |
| `fostermcp/claude-fostermcp.png` | Claude Desktop › Configurações › Desenvolvedor com o **fostermcp** em execução. |
| `skills/apresentacao-exemplo.png` | Uma apresentação gerada pela skill Apresentação para cliente, com dados fictícios. |

O aviso do SmartScreen não precisa de print: a página mostra uma réplica dele. Use PNG ou JPG com até uns 1600 px de largura.

## O version.json do FosterMCP

O app FosterMCP (a partir da versão que tiver `updateFeedUrl` preenchido em `config/foster-defaults.json`) consulta `https://jpbazaboy.github.io/foster-ia/fostermcp/version.json` para avisar de versões novas. **Esse endereço não pode mudar depois de publicado.** O arquivo segue o contrato lido por `src/updates.js`:

```json
{"version": "0.4.0", "publishedAt": "…", "downloadPage": "https://jpbazaboy.github.io/foster-ia/apps/fostermcp/",
 "windows": {"url": "https://github.com/JPBazaBoy/foster-ia/releases/download/v0.4.0/FosterMCP-Windows.exe", "sha256": "…", "sizeBytes": 0},
 "mac": {"url": "…/FosterMCP-Mac.dmg", "sha256": "…", "sizeBytes": 0}, "notes": []}
```

- Quem gera o arquivo é `node scripts/site-release.js`, no repositório do FosterMCP: ele lê a versão do `package.json`, calcula o sha256 e o tamanho dos instaladores, copia-os com os nomes fixos para `release/publicar/` e grava `site/public/fostermcp/version.json`. Não publica nada.
- No `version.json`, os links apontam o arquivo exato da versão (`releases/download/v<versão>/…`), para combinar com o sha256. Os botões do site usam `releases/latest/download/<nome fixo>`, que sempre leva ao instalador mais recente.
- Enquanto não existe o arquivo real, a prévia usa `conteudo/exemplo-version.json` e mostra "Prévia: versão, data e tamanhos de exemplo". O build de publicação (`npm run build -- --publicar`) recusa construir sem o arquivo real.

## Como publicar (passo a passo para depois da revisão)

Nada disto foi feito. Siga só depois de revisar o site, os itens em teste e os textos provisórios.

1. **Revise antes:** textos provisórios em `config.js` (assinatura, contato, aviso), itens `em-teste`, prints, licenças dos componentes do instalador e ausência de dados pessoais ou de clientes nos prints. O README vai junto para o repositório público: ajuste o texto se quiser.
2. **Crie o repositório público** `JPBazaBoy/foster-ia` no GitHub, vazio. Se escolher outro nome, troque `repositorio` e `endereco` em `config.js` antes de tudo.
3. **Copie o site para ele.** Com o repositório público clonado ao lado do FosterMCP (`../foster-ia`):

   ```sh
   rsync -a --delete --exclude .git --exclude node_modules --exclude _site --exclude revisao --exclude design site/ ../foster-ia/
   ```

   O arquivo `site/.github/workflows/publicar.yml` vira o workflow de publicação do repositório público.
4. **Ligue o GitHub Pages:** no repositório público, **Settings › Pages › Build and deployment › Source: GitHub Actions**.
5. **Gere os instaladores** no FosterMCP: **Actions › Package › Run workflow** com "Gerar também o instalador macOS" marcado, e baixe os artefatos `FosterMCP-windows-2022` e `FosterMCP-macos-14`.
6. **Prepare a versão:**

   ```sh
   node scripts/site-release.js --windows "<pasta>/FosterMCP Setup 0.4.0.exe" --mac "<pasta>/FosterMCP-0.4.0-arm64.dmg" --nota "O que mudou, em uma frase."
   ```

7. **Crie a release** no repositório público com os dois arquivos de `release/publicar/`, usando o comando que o script mostra (`gh release create v0.4.0 … --repo JPBazaBoy/foster-ia`). Confira os dois downloads.
8. **Publique o site:** copie de novo a pasta (passo 3) para levar o `public/fostermcp/version.json`, faça commit e push no repositório público. O workflow testa, constrói e publica. Confira <https://jpbazaboy.github.io/foster-ia/>.
9. **Ligue o aviso de versões no app** numa versão futura: `updateFeedUrl` em `config/foster-defaults.json` com o endereço do `version.json`.

Para cada versão nova do FosterMCP, repita os passos 5 a 8.

## Decisões técnicas

- **Sem framework.** Um gerador próprio em Node (`generator/`) com `marked` (Markdown), `yaml` (cabeçalhos e blocos) e as fontes do `@fontsource`, em versões fixas e sem dependências transitivas. Saída estática em `_site/`.
- **Sem rastreadores.** Nada de analytics, cookies, Google Fonts ou scripts de fora: as fontes ficam em `assets/fontes/`, com a licença OFL ao lado. Cada página declara uma política de segurança (CSP) que só permite arquivos do próprio site. A aba escolhida (assistente ou sistema) fica no navegador de quem visita.
- **Sem indexação por enquanto.** `indexar: false` em `config.js` pede aos buscadores que não listem o site; quem tem o link acessa normalmente.
- **Funciona sem JavaScript.** Abas viram seções empilhadas e as listas mostram todos os itens. O JS só acrescenta abas, filtros, busca, cópia, o atalho "/" e o índice que acompanha a leitura.
- **Acessível e responsivo.** Tema claro e escuro (segue o sistema), foco visível, navegação por teclado nas abas, rótulos em todos os campos. Os testes conferem títulos, rótulos, textos alternativos e links.
- **CI barato.** Mudanças só em `site/**` não rodam os testes do app (`.github/workflows/validate.yml`). Os testes do site rodam localmente e, no repositório público, no workflow de publicação.
