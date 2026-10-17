# Como editar a Central de IA

Este guia é para quem cuida do conteúdo da central. Não precisa saber programar.

O site é feito de arquivos de texto. Cada item (um app, uma skill, um prompt, um tutorial) é um arquivo dentro da pasta `catalog/`. Quando uma mudança chega à `main` (o ramo principal do repositório), o site se atualiza sozinho em 1 a 2 minutos. Antes de publicar, o sistema confere tudo: se algo estiver errado, o site continua como estava e a mensagem diz o arquivo e o que corrigir.

Há três jeitos de editar. Escolha o que for mais confortável.

## 1. Pedir a um agente

O jeito mais simples. Abra este repositório num agente de código (Claude Code, Codex ou Cursor) e peça em português. O agente lê o [AGENTS.md](AGENTS.md), que explica as regras do site, e usa os modelos certos.

Exemplos de pedidos:

- "Adicione este prompt: *Quais clientes têm aniversário este mês?* Ele usa o Atlas."
- "Crie um tutorial explicando como conectar o e-mail no FosterMCP, no mesmo formato dos outros."
- "Publique o prompt [nome] como em teste." (tira do rascunho)
- "Tire a skill [nome] do site e deixe como rascunho."
- "Os prints do tutorial Conectar o Atlas entraram: tire o Em revisão."
- "Marque o tutorial [nome] como defasado e indique [outro item] no lugar."
- "Arquive o prompt [nome]."
- "Coloque revisão para daqui a 3 meses em todos os tutoriais de instalação."
- "Troque o texto do resumo do FosterMCP por: …"
- "Use esta imagem como print da tela do Atlas" (anexe a imagem).
- "Acrescente uma novidade na página inicial: …"

Depois, peça ao agente para **rodar os testes e mostrar o que mudou**. Se estiver certo, peça para enviar para a `main` (ou abrir um pull request, se quiser que outra pessoa revise antes).

## 2. Pelo site do GitHub

Você precisa ser colaborador do repositório. Se não for, peça ao responsável pela central.

### Mudar um texto

1. Abra o repositório no GitHub e entre na pasta do item, por exemplo `catalog/prompts/`.
2. Clique no arquivo, por exemplo `vencimentos-da-semana.md`.
3. Clique no lápis (**Edit this file**), no canto direito.
4. Faça a mudança.
5. Clique em **Commit changes…**, escreva em poucas palavras o que mudou, deixe marcado **Commit directly to the main branch** e confirme.
6. Em 1 a 2 minutos o site está atualizado. Para acompanhar, abra a aba **Actions**: bolinha amarela é publicando, ✓ verde é publicado, ✗ vermelho é erro (clique nele para ler o que corrigir).

### Criar um item novo

1. Entre na pasta do tipo, por exemplo `catalog/prompts/`, e abra o `_modelo.md`.
2. Copie todo o texto do modelo (no ícone de copiar, em cima do arquivo).
3. Volte para a pasta e clique em **Add file › Create new file**.
4. Dê o nome do arquivo: **letras minúsculas sem acento, números e hífens**, terminando em `.md`. Por exemplo, `aniversarios-do-mes.md`. O nome vira o endereço da página.
5. Cole o modelo, troque os textos e confirme como no passo 5 acima.

Enquanto o item não estiver pronto para aparecer, troque `situacao: em-teste` por `situacao: rascunho`. Ele fica guardado no repositório e não entra no site. Quando estiver pronto, volte para `em-teste`.

Skills e agentes são pastas, não um arquivo só: crie `catalog/skills/nome-da-skill/pagina.md` e `catalog/skills/nome-da-skill/SKILL.md` (no campo do nome, a barra `/` cria a pasta). Se achar trabalhoso, use o caminho 1.

### Enviar um print

1. **Antes de tudo, apague do print o que for pessoal:** nomes, telefones, e-mails, números de conta e qualquer dado de cliente. O repositório é público.
2. Entre em `public/imagens/` e na pasta do assunto (por exemplo `public/imagens/fostermcp/`).
3. Clique em **Add file › Upload files**, arraste a imagem (PNG ou JPG, até uns 1600 px de largura) e confirme.
4. No texto do item, a imagem entra assim (sem o `public/`):

   ```md
   ![Cartão do Atlas com o botão Atualizar Atlas](/imagens/fostermcp/atlas.png)
   ```

   O texto entre colchetes descreve o que aparece na imagem. Enquanto o arquivo não existe, o site mostra uma vaga "Print a ser incluído" no lugar.

## 3. No seu computador

Para quem quer ver o resultado antes de publicar. Precisa do [Node.js](https://nodejs.org) 22.13 ou mais novo e do Git.

```sh
git clone https://github.com/JPBazaBoy/foster-ia.git
cd foster-ia
npm ci
npm run dev
```

Abra <http://localhost:8080/foster-ia/>. Edite os arquivos em qualquer editor de texto: a página recarrega sozinha ao salvar. Antes de enviar, rode os testes:

```sh
npm test
```

E envie:

```sh
git add -A
git commit -m "O que mudou, em poucas palavras"
git push
```

## A vida de um item

O campo `situacao`, no cabeçalho de cada arquivo, diz em que fase o item está:

| Situação | Quando usar | O que aparece no site |
| --- | --- | --- |
| `rascunho` | Em preparação; ainda não deve aparecer | Nada. O item fica só no repositório: sem página, fora das listas, da busca e da página inicial |
| `em-breve` | Ainda não existe; a página mostra o que vai fazer | Selo "Em breve", sem download |
| `em-teste` | Item novo, ainda sendo validado | Selo "Em teste" e um aviso para conferir antes de usar com clientes |
| `disponivel` | Validado | Selo "Disponível" (em apps, skills e agentes) |
| `em-revisao` | Está sendo conferido e pode mudar, como um tutorial à espera dos prints | Selo "Em revisão" e um aviso no topo da página |
| `defasado` | Pode não valer mais e não está sendo atualizado | Selo e aviso "Defasado". Com `substituido_por`, o aviso indica o item que vale no lugar |
| `arquivado` | Saiu de uso | Some das listas e da busca. A página continua no ar, com aviso, para quem tiver o link |

Sobre o rascunho:

- O sistema só confere o cabeçalho de um rascunho. O texto pode estar pela metade; a conferência completa acontece quando você muda a situação.
- Como o rascunho não tem página, nenhum item publicado pode ter link para ele. Se tiver, o sistema avisa o arquivo e o link.
- Se um tipo ficar sem nenhum item publicado (por exemplo, nenhuma skill), a página dele e a página inicial mostram a frase `vazio` de `conteudo/tipos/`, como "Em breve. As primeiras skills estão sendo preparadas.".

Mais dois campos ajudam a manter tudo em dia:

- `atualizado: 2026-10-16` é a data da última revisão. Troque sempre que mexer no item.
- `revisar_ate: 2027-04-16` é opcional. Depois dessa data, o item mostra sozinho o selo "Pode estar desatualizado", até alguém revisar e trocar a data.

Exemplo de cabeçalho de um item defasado:

```yaml
situacao: defasado
substituido_por: tutoriais/primeiros-passos
atualizado: 2026-11-03
```

**Não apague arquivos de itens:** arquive. Assim os links que as pessoas guardaram continuam funcionando.

## Regras de texto

- A primeira frase do `resumo` diz o que o item é: "Prompt que…", "Skill que…", "Aplicativo que…".
- Fale direto com o assessor: "Clique em…", "Copie…". Frases curtas.
- Sem propaganda: nada de "revolucionário", "incrível" ou "poderoso".
- Exemplos sempre com dados fictícios, e marcados como fictícios. Clientes de exemplo têm códigos como 900001.
- Só diga que funciona onde funciona hoje. Gemini e Grok aparecem apenas como "em breve".
- Nunca coloque dados reais de clientes, nomes, telefones, e-mails ou senhas, nem nos prints.

## Onde fica cada coisa

| O quê | Onde |
| --- | --- |
| Apps, conectores, skills, agentes, prompts e tutoriais | `catalog/<tipo>/`, cada pasta com um `_modelo` para copiar |
| Novidades da página inicial | `conteudo/novidades.yml` |
| Frase de cada categoria e a de "em breve", quando ela está vazia | `conteudo/tipos/` |
| Textos da página inicial e o quadro "Primeira vez aqui?" | `conteudo/inicio.yml` |
| Página de Ajuda | `conteudo/paginas/ajuda.md` |
| Trechos que se repetem em várias páginas | `conteudo/trechos/` |
| Prints | `public/imagens/` |
| Nome, cores, contato, aviso e as chaves da prévia e dos downloads | `config.js` (combine com o responsável antes de mexer) |

Detalhes de todos os campos, seções, abas e blocos visuais estão no [AGENTS.md](AGENTS.md).
