# Central de IA (site)

Site aberto, gratuito e sem login onde o assessor encontra tudo de IA para o dia a dia: apps, conectores (MCPs), skills, agentes, prompts e tutoriais. O primeiro item é o FosterMCP. O site cresce só com a adição de arquivos em `catalog/`.

> Nome, marca, contato e endereços são **provisórios** e ficam todos em [`config.js`](config.js).

## Ver o site no seu computador

Precisa do Node.js 22.13 ou mais novo. Na pasta do repositório:

```sh
npm --prefix site ci
npm --prefix site run dev
```

Abra <http://localhost:8080/foster-ia/>. A página recarrega sozinha quando você salva um arquivo em `catalog/`, `conteudo/`, `public/` ou `assets/`. Para parar, aperte Ctrl+C. Mudanças em `generator/` pedem parar e rodar de novo.

Antes de enviar qualquer mudança, rode os testes. Eles conferem cada item do catálogo e avisam, em português, o arquivo e o que corrigir:

```sh
npm --prefix site test
```

Para gerar o site final na pasta `site/_site/`: `npm --prefix site run build`.

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
| --- | --- |
| `config.js` | Nome, marca, cores, endereços, contato e aviso institucional. Único lugar para trocar essas coisas. |
| `catalog/` | Os itens do site, uma pasta por tipo: `apps`, `conectores`, `skills`, `agentes`, `prompts`, `tutoriais`. |
| `catalog/<tipo>/_modelo…` | Modelo pronto para copiar. Arquivos e pastas que começam com `_` não entram no site. |
| `conteudo/inicio.yml` | Textos da página inicial (o que é a central e os 3 passos do "Comece aqui"). |
| `conteudo/novidades.yml` | Lista de novidades da página inicial. |
| `conteudo/paginas/` | Páginas avulsas, como a Ajuda. |
| `conteudo/tipos/` | Texto de apresentação de cada tipo (o topo de /skills/, /prompts/ etc.). |
| `conteudo/trechos/` | Trechos repetidos em várias páginas, como "como conectar o FosterMCP". |
| `public/` | Arquivos copiados como estão: prints em `public/imagens/` e o `fostermcp/version.json`. |
| `assets/` | Estilo (CSS) e comportamento (JS) do site. |
| `generator/` | O gerador do site (Node, sem framework). |
| `test/` | Testes do catálogo e do site gerado. |
| `revisao/` | Prints de revisão do site. Não vão para o repositório público. |

## Como adicionar um item

O caminho é sempre o mesmo:

1. Copie o modelo do tipo (`_modelo.md` ou a pasta `_modelo`).
2. Dê um nome ao arquivo ou à pasta com **letras minúsculas sem acento, números e hífens**. Esse nome vira o endereço da página: `catalog/prompts/vencimentos-do-mes.md` vira `/prompts/vencimentos-do-mes/`.
3. Preencha o cabeçalho e o texto. Deixe `status: rascunho` até alguém revisar; o site mostra a faixa "Rascunho para revisão".
4. Veja no `npm --prefix site run dev` e rode `npm --prefix site test`.

### Um prompt

Arquivo em `catalog/prompts/`. O texto que o assessor copia fica logo abaixo de `## Prompt`; use `[colchetes]` no que a pessoa deve trocar. Liste em `ferramentas` as ferramentas do FosterMCP que o prompt usa.

### Um tutorial

Arquivo em `catalog/tutoriais/`. Texto livre em Markdown: `##` para as partes, listas numeradas para os passos, **negrito** para botões e menus.

### Uma skill

Pasta em `catalog/skills/<nome>/` com dois arquivos:

- `SKILL.md`: a skill em si, no padrão de Agent Skills. O `name` do cabeçalho tem de ser **igual ao nome da pasta**, só com minúsculas, números e hífens, sem "claude" nem "anthropic". A `description` diz o que a skill faz e **quando** usar, em até 500 caracteres (o limite do Codex; o Claude aceita 1024).
- `pagina.md`: a página do site.

Na construção, a pasta inteira (menos `pagina.md`) vira `<nome>.zip`, com a pasta na raiz, como o Claude pede. Outros arquivos da pasta (referências, exemplos) vão junto no .zip.

### Um agente

Pasta em `catalog/agentes/<nome>/` com `pagina.md` e `instrucoes.md` (até 8000 caracteres, o limite de instruções de um GPT). O site oferece "Copiar as instruções" e "Baixar AGENTS.md" (o mesmo texto).

### Um conector

Arquivo em `catalog/conectores/`. Se o conector vem dentro de um app do catálogo, use `app: apps/<nome>` no cabeçalho: a página ganha o botão para baixar o app.

### Um app

Arquivo em `catalog/apps/`. "Como instalar" usa as abas `### Windows` e `### Mac`. O quadro de download com versão, data e tamanho só existe para o FosterMCP (`download: fostermcp`); outro app com download próprio pede um ajuste pequeno no gerador.

### Uma novidade

Acrescente em `conteudo/novidades.yml` um bloco com `data`, `titulo`, `texto` e, se quiser, `link` (começando com `/`).

### Um print

Salve a imagem em `public/imagens/…` e use no texto: `![O que aparece na imagem](/imagens/pasta/arquivo.png)`. Enquanto o arquivo não existe, o site mostra um quadro "Print pendente" com o caminho esperado, e o build lista os prints que faltam.

## O cabeçalho de cada item

| Campo | Obrigatório | O que é |
| --- | --- | --- |
| `titulo` | sim | Nome curto, até 80 caracteres. |
| `resumo` | sim | Uma frase, até 200 caracteres. Aparece no cartão e no topo da página. |
| `plataformas` | sim | Onde funciona: `claude-desktop`, `chatgpt-codex` (aba Codex do app do ChatGPT), `chatgpt` (Projetos e GPTs), `claude-code`, `cursor`. |
| `atualizado` | sim | Data da última revisão, `AAAA-MM-DD`. |
| `status` | sim | `rascunho` ou `publicado`. |
| `destaque` | não | `true` coloca o item em Destaques, na página inicial. |
| `versao` | não | Versão do item, entre aspas: `"1.0"`. |
| `ordem` | não | Número para ordenar dentro do tipo (menor primeiro). |
| `requer` | não | Itens necessários, como `[apps/fostermcp]`. |
| `ferramentas` | não | Ferramentas do FosterMCP usadas, como `[search_clients]`. |
| `palavras` | não | Palavras extras para a busca. |
| `download` | só apps | `fostermcp` liga o quadro de download do FosterMCP. |
| `app` | só conectores | App que traz o conector, como `apps/fostermcp`. |

## Seções, abas e avisos

- Cada `## Título` vira uma seção, e o sumário "Nesta página" é montado sozinho. Cada tipo tem seções obrigatórias, que os modelos já trazem (por exemplo: O que faz, Para quem, Requisitos, Como instalar, Privacidade).
- Numa seção, subtítulos `###` com nome de plataforma (Claude Desktop, ChatGPT · aba Codex, ChatGPT · Projetos e GPTs, Claude Code, Cursor) ou de sistema (Windows, Mac) viram **abas**. Cada plataforma de `plataformas` precisa ter a sua aba. O site lembra a última escolha do visitante.
- Em "Perguntas frequentes" e "Problemas comuns", cada `###` vira uma pergunta que abre e fecha.
- Caixas de aviso: uma linha `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` ou `> [!CAUTION]`, seguida do texto com `> ` no começo.
- Links internos começam com `/`, como `[FosterMCP](/apps/fostermcp/)`. O site acrescenta o endereço base sozinho.
- Trechos repetidos ficam em `conteudo/trechos/` e entram com `<!-- incluir: nome-do-trecho -->` numa linha própria.
- Variáveis: `{{site.nome}}`, `{{site.contato}}`, `{{site.aviso}}`, `{{site.endereco}}`, `{{item.titulo}}`, `{{item.zipNome}}`, `{{item.pasta}}`.

## Prints que faltam

O site mostra um quadro "Print pendente" no lugar de cada imagem abaixo. Tire o print, apague o que for pessoal (nome, número, e-mail, dados de cliente) e salve com o nome indicado em `public/imagens/fostermcp/`:

| Arquivo | O que mostrar |
| --- | --- |
| `smartscreen-1.png` | Windows: aviso azul "O Windows protegeu o computador", com o link **Mais informações**. |
| `smartscreen-2.png` | O mesmo aviso depois de clicar em Mais informações, com o botão **Executar assim mesmo**. |
| `mac-abrir-mesmo-assim.png` | Mac: Ajustes do Sistema › Privacidade e Segurança, com **Abrir Mesmo Assim** ao lado do aviso do FosterMCP. |
| `atlas.png` | FosterMCP › Conexões › cartão do Atlas, com **Entrar pela janela do navegador**, **Atualizar Atlas** e o selo Atualizado. |
| `whatsapp-pareamento.png` | Cartão do WhatsApp durante o pareamento, com o QR code desfocado ou coberto. |
| `bandeja.png` | Menu do ícone perto do relógio: Abrir FosterMCP, Abrir ao entrar no computador, Encerrar FosterMCP. |
| `claude-fostermcp.png` | Claude Desktop › Configurações › Desenvolvedor com o **fostermcp** em execução. |

Use PNG ou JPG com até uns 1600 px de largura.

## O version.json do FosterMCP

O app FosterMCP (a partir da versão que tiver `updateFeedUrl` preenchido em `config/foster-defaults.json`) consulta `https://jpbazaboy.github.io/foster-ia/fostermcp/version.json` para avisar de versões novas. **Esse endereço não pode mudar depois de publicado.** O arquivo segue o contrato lido por `src/updates.js`:

```json
{"version": "0.3.2", "publishedAt": "…", "downloadPage": "https://jpbazaboy.github.io/foster-ia/apps/fostermcp/",
 "windows": {"url": "https://github.com/JPBazaBoy/foster-ia/releases/download/v0.3.2/FosterMCP-Windows.exe", "sha256": "…", "sizeBytes": 0},
 "mac": {"url": "…/FosterMCP-Mac.dmg", "sha256": "…", "sizeBytes": 0}, "notes": []}
```

- Quem gera o arquivo é `node scripts/site-release.js`, no repositório do FosterMCP: ele lê a versão do `package.json`, calcula o sha256 e o tamanho dos instaladores, copia-os com os nomes fixos para `release/publicar/` e grava `site/public/fostermcp/version.json`. Não publica nada.
- No `version.json`, os links apontam para o arquivo exato da versão (`releases/download/v<versão>/…`), para combinar com o sha256. Os botões do site usam `releases/latest/download/<nome fixo>`, que sempre leva ao instalador mais recente.
- Enquanto não existe o arquivo real, a prévia usa `conteudo/exemplo-version.json` e mostra a etiqueta "Prévia com dados de exemplo". O build de publicação (`npm run build -- --publicar`) recusa construir sem o arquivo real.

## Como publicar (passo a passo para depois da revisão)

Nada disto foi feito. Siga só depois de revisar o site, os rascunhos e os textos provisórios.

1. **Revise antes:** textos provisórios em `config.js` (nome, contato, aviso institucional), itens com `status: rascunho`, prints, licenças dos componentes do instalador e ausência de dados pessoais ou de clientes nos prints. O README vai junto para o repositório público: ajuste o texto se quiser.
2. **Crie o repositório público** `JPBazaBoy/foster-ia` no GitHub, vazio. Se escolher outro nome, troque `repositorio` e `endereco` em `config.js` antes de tudo.
3. **Copie o site para ele.** Com o repositório público clonado ao lado do FosterMCP (`../foster-ia`):

   ```sh
   rsync -a --delete --exclude .git --exclude node_modules --exclude _site --exclude revisao site/ ../foster-ia/
   ```

   O arquivo `site/.github/workflows/publicar.yml` vira o workflow de publicação do repositório público.
4. **Ligue o GitHub Pages:** no repositório público, **Settings › Pages › Build and deployment › Source: GitHub Actions**.
5. **Gere os instaladores** no FosterMCP: **Actions › Package › Run workflow** com "Gerar também o instalador macOS" marcado, e baixe os artefatos `FosterMCP-windows-2022` e `FosterMCP-macos-14`.
6. **Prepare a versão:**

   ```sh
   node scripts/site-release.js --windows "<pasta>/FosterMCP Setup 0.3.2.exe" --mac "<pasta>/FosterMCP-0.3.2-arm64.dmg" --nota "O que mudou, em uma frase."
   ```

7. **Crie a release** no repositório público com os dois arquivos de `release/publicar/`, usando o comando que o script mostra (`gh release create v0.3.2 … --repo JPBazaBoy/foster-ia`). Confira os dois downloads.
8. **Publique o site:** copie de novo a pasta (passo 3) para levar o `public/fostermcp/version.json`, faça commit e push no repositório público. O workflow testa, constrói e publica. Confira <https://jpbazaboy.github.io/foster-ia/>.
9. **Ligue o aviso de versões no app** numa versão futura: `updateFeedUrl` em `config/foster-defaults.json` com o endereço do `version.json`.

Para cada versão nova do FosterMCP, repita os passos 5 a 8.

## Decisões técnicas

- **Sem framework.** Um gerador próprio em Node (`generator/`) com duas bibliotecas sem dependências, `marked` (Markdown) e `yaml` (cabeçalhos), em versões fixas. Saída estática em `_site/`.
- **Sem rastreadores.** Nada de analytics, cookies, fontes ou scripts de fora. Cada página declara uma política de segurança (CSP) que só permite arquivos do próprio site. Preferências (tema, assistente escolhido, aba) ficam no navegador de quem visita.
- **Sem indexação por enquanto.** `indexar: false` em `config.js` pede aos buscadores que não listem o site; quem tem o link acessa normalmente.
- **Funciona sem JavaScript.** Abas viram seções empilhadas, e o catálogo mostra todos os itens. O JS só acrescenta abas, filtros, busca, cópia e tema.
- **Acessível e responsivo.** Tema claro e escuro, foco visível, navegação por teclado nas abas, rótulos em todos os campos, nenhum conteúdo que dependa só de cor. Os testes conferem títulos, rótulos, textos alternativos e links.
- **CI barato.** Mudanças só em `site/**` não rodam os testes do app (`.github/workflows/validate.yml`). Os testes do site rodam localmente e, no repositório público, no workflow de publicação.
