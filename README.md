# Central de IA dos assessores

Site de consulta, aberto e sem login, com o que os assessores usam de IA no dia a dia: aplicativos e conectores (o FosterMCP primeiro), skills, modelos de agentes, prompts e tutoriais. Cada item diz o que é, mostra um exemplo com dados fictícios e traz o passo a passo do que clicar.

**Endereço:** <https://jpbazaboy.github.io/foster-ia/> (prévia em teste).

| Quero… | Leia |
| --- | --- |
| Mudar ou acrescentar conteúdo, sem programar | [COMO-EDITAR.md](COMO-EDITAR.md) |
| Pedir a um agente (Claude, Codex, Cursor) que mexa no site | [AGENTS.md](AGENTS.md): regras e modelo de conteúdo que o agente segue |
| Entender a parte técnica, publicar uma versão do FosterMCP ou sair da prévia | Este arquivo |

## Rodar no seu computador

Precisa do Node.js 22.13 ou mais novo.

```sh
npm ci
npm run dev
```

Abra <http://localhost:8080/foster-ia/>. A página recarrega sozinha quando você salva um arquivo em `catalog/`, `conteudo/`, `public/` ou `assets/`. Mudanças em `generator/` pedem parar (Ctrl+C) e rodar de novo.

| Comando | O que faz |
| --- | --- |
| `npm test` | Confere cada item e o site gerado. Os erros dizem, em português, o arquivo e o que corrigir. |
| `npm run build` | Gera o site em `_site/`. |
| `npm run release -- …` | Prepara o `version.json` de uma versão nova do FosterMCP (veja abaixo). |

## Publicação

Todo envio para a `main` publica o site sozinho, em 1 a 2 minutos: o workflow [`pages.yml`](.github/workflows/pages.yml) roda `npm ci`, `npm test` e `npm run build` e entrega a pasta `_site/` ao GitHub Pages. Se um teste falhar, nada é publicado e o site continua na versão anterior; a mensagem de erro aparece na aba **Actions**. Pull requests rodam só os testes.

O repositório é público: é o que permite usar o GitHub Pages sem plano pago. Por isso, **nada de dado de cliente, nome, telefone, e-mail ou senha** em nenhum arquivo, nem nos prints.

## Modo prévia

`previa: true` em [`config.js`](config.js) liga, de uma vez:

- a faixa "Prévia em teste — conteúdo em construção" no topo de todas as páginas;
- `<meta name="robots" content="noindex, nofollow">` em todas as páginas e um `robots.txt` com `Disallow: /`. Num endereço `usuario.github.io/projeto` os buscadores só leem o `robots.txt` da raiz do domínio; quem segura a indexação é a meta `noindex`. O `robots.txt` passa a valer se o site ganhar domínio próprio;
- os botões de download do FosterMCP desligados, com o texto "Download liberado após a validação". Nenhum link leva a um instalador que ainda não existe.

Fora da prévia, `indexar: false` continua pedindo aos buscadores que não listem o site.

## O version.json do FosterMCP

O app avisa de versões novas lendo um `version.json`. O endereço que vai no app é o do arquivo bruto no repositório, que não muda se o site trocar de domínio:

```
https://raw.githubusercontent.com/JPBazaBoy/foster-ia/main/public/fostermcp/version.json
```

- No repositório do FosterMCP, esse endereço vai em `updateFeedUrl`, no `config/foster-defaults.json`, numa versão futura do app. **Depois de publicado, o caminho não muda mais** (o app recusa redirecionamentos).
- O app só aceita links no host do próprio arquivo ou em `github.com`. Por isso a `downloadPage` do `version.json` é `https://github.com/JPBazaBoy/foster-ia/releases/latest`, e não a página do site.
- No `version.json`, cada instalador aponta o arquivo exato da versão (`releases/download/v<versão>/<nome fixo>`), para combinar com o sha256. Os botões do site usam `releases/latest/download/<nome fixo>`, que sempre leva ao mais recente.
- Os nomes fixos (`FosterMCP-Windows.exe` e `FosterMCP-Mac.dmg`) e o caminho do arquivo ficam em `config.js`.
- Na prévia o arquivo é opcional. Fora dela (`previa: false`), o build exige o arquivo e confere o contrato.

### Publicar uma versão do FosterMCP

1. No repositório do FosterMCP, gere os instaladores (**Actions › Package › Run workflow**, com o instalador macOS marcado) e baixe os dois.
2. Aqui, prepare a versão. A versão vem do nome do instalador do Windows (ou use `--versao 1.2.3`):

   ```sh
   npm run release -- --windows "FosterMCP Setup 0.4.0.exe" --mac "FosterMCP-0.4.0-arm64.dmg" --nota "O que mudou, em uma frase."
   ```

   O script calcula sha256 e tamanho, grava `public/fostermcp/version.json`, copia os instaladores com os nomes fixos para `release-publicar/` (fora do git) e mostra o comando da release. Ele não publica nada.
3. Crie a release no GitHub com os dois arquivos de `release-publicar/` (o comando `gh release create …` que o script mostrou) e confira os dois downloads.
4. Só então faça commit do `version.json` e envie para a `main`. A partir daí, quem tem o app configurado recebe o aviso.

### Sair da prévia (lançamento)

Só com a aprovação do responsável pela central, depois de revisar textos provisórios em `config.js`, itens `em-teste`, prints, licenças do instalador e ausência de dados pessoais:

1. Publique a primeira versão do FosterMCP (passos acima).
2. Troque `previa: true` por `previa: false` em `config.js`, rode `npm test` e envie para a `main`.

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
| --- | --- |
| `config.js` | Nome, assinatura, cores, endereços, contato, aviso e a chave `previa`. Único lugar para essas coisas. |
| `catalog/` | Os itens, uma pasta por tipo: `apps`, `conectores`, `skills`, `agentes`, `prompts`, `tutoriais`. Cada pasta tem um `_modelo` para copiar. |
| `conteudo/` | Página inicial (`inicio.yml`), novidades (`novidades.yml`), frase de cada categoria (`tipos/`), páginas avulsas como a Ajuda (`paginas/`) e trechos repetidos (`trechos/`). |
| `public/` | Arquivos copiados como estão: prints em `public/imagens/` e o `fostermcp/version.json`. |
| `assets/` | Estilo (CSS) e comportamento (JS). As fontes Manrope e Cormorant Garamond vêm do npm (licença OFL) e são servidas pelo próprio site. |
| `generator/` | O gerador do site (Node, sem framework). |
| `scripts/site-release.js` | Prepara o `version.json` de uma versão do FosterMCP. |
| `test/` | Testes do catálogo, do site gerado, do `version.json` e do script de release. |
| `design/referencia-c/` | Referência visual aprovada (versão C). Não entra no site. |

## Decisões técnicas

- **Sem framework.** Um gerador próprio em Node com `marked` (Markdown), `yaml` (cabeçalhos e blocos) e as fontes do `@fontsource`, em versões fixas. Saída estática em `_site/`.
- **Sem rastreadores.** Nada de analytics, cookies, Google Fonts ou scripts de fora. Cada página declara uma política de segurança (CSP) que só permite arquivos do próprio site. A aba escolhida (assistente ou sistema) fica só no navegador de quem visita.
- **Funciona sem JavaScript.** Abas viram seções empilhadas e as listas mostram tudo. O JS acrescenta abas, filtros, busca, cópia, o atalho "/", o índice que acompanha a leitura e o selo "Pode estar desatualizado" no dia certo.
- **Acessível e responsivo.** Tema claro e escuro (segue o sistema), foco visível, teclado nas abas, rótulos em todos os campos. Os testes conferem títulos, rótulos, textos alternativos e links.
- **Conteúdo validado.** Campo errado, seção faltando, aba sem plataforma, link quebrado ou bloco mal escrito param o build com a mensagem do que corrigir.
