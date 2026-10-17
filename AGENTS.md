# Instruções para agentes

Este repositório é a Central de IA dos assessores: um site estático gerado a partir de arquivos Markdown e YAML e publicado no GitHub Pages a cada envio para a `main`. Quem pede mudanças normalmente não programa: entenda o pedido em português simples, mexa só no conteúdo necessário e explique o que mudou.

## Como trabalhar

1. Leia o pedido e localize os arquivos: itens em `catalog/<tipo>/`, textos gerais em `conteudo/`, prints em `public/imagens/`.
2. Para criar um item, **copie o `_modelo` do tipo** e preencha. Não invente campos nem seções.
3. Rode `npm test` (e `npm ci` antes, na primeira vez). Corrija tudo o que ele apontar; as mensagens dizem o arquivo e o que mudar.
4. Se quiser ver a página, `npm run dev` e <http://localhost:8080/foster-ia/>.
5. Mostre a quem pediu um resumo curto do que mudou. Faça commit com mensagem em português ("Prompts: aniversários do mês") e envie para a `main` só quando a pessoa pedir; se ela preferir revisão, abra um pull request.

## Regras que não mudam

- **Repositório público.** Nunca grave dado real de cliente, nome de pessoa, telefone, e-mail, número de conta, patrimônio real, senha ou token, nem em prints, exemplos ou mensagens de commit. Exemplos usam dados fictícios, marcados como fictícios, com clientes de código 900001, 900014 etc.
- **Honestidade de plataforma.** `plataformas` lista só onde o item funciona hoje. Gemini e Grok entram apenas em `plataformas_em_breve` (aparecem como "em breve"). Itens para GrokBot e Hermes Agent são `situacao: em-breve` e `avancado: true`. A integração com o WhatsApp não é oficial: não diga o contrário.
- **FosterMCP só chega ao ChatGPT pela aba Codex** (`chatgpt-codex`). `chatgpt` (Projetos e GPTs) serve para instruções coladas, nunca para consultar dados do FosterMCP.
- **Prévia.** Não troque `previa` nem `indexar` em `config.js`, não crie releases e não publique instaladores sem pedido explícito do responsável pela central.
- **Endereços fixos.** Não mude `repositorio`, `endereco` nem `fostermcp.feed`/`fostermcp.arquivos` em `config.js`: o app FosterMCP lê `public/fostermcp/version.json` pelo endereço raw do repositório. Esse arquivo só é gerado por `npm run release`; não edite à mão.
- **Não apague itens.** Para tirar de uso, arquive (`situacao: arquivado`). Os links antigos continuam funcionando.
- **Gerador.** Mudanças em `generator/`, `assets/` e `test/` só quando o pedido for técnico. Pedidos de conteúdo se resolvem em `catalog/`, `conteudo/` e `public/`.

## Regras de texto

- A primeira frase do `resumo` diz o que o item é: "Prompt que…", "Skill que…", "Aplicativo que…", "Modelo de agente que…".
- Segunda pessoa, direto, frases curtas: "Clique em **Atualizar Atlas**." Nomes de botões e menus em negrito, exatamente como aparecem na tela.
- Sem propaganda nem superlativos ("revolucionário", "incrível", "poderoso", "transforme"). Diga o que faz e o limite.
- Português do Brasil com acentos. Datas como 16/10/2026 no texto e `AAAA-MM-DD` nos campos.
- Prompts: um pedido curto e direto, até 600 caracteres, com `[colchetes]` no que a pessoa troca.
- Dados de exemplo sempre fictícios e marcados ("Exemplo com dados fictícios"). Valores redondos e plausíveis.

## Tipos e modelos

| Tipo | Onde | Modelo | Seções obrigatórias (`##`) |
| --- | --- | --- | --- |
| Aplicativo | `catalog/apps/<nome>.md` | `catalog/apps/_modelo.md` | O que é, O que dá para fazer, Antes de começar, Instalação (abas Windows e Mac), Conectar ao seu assistente (uma aba por plataforma), Problemas comuns |
| Conector | `catalog/conectores/<nome>.md` | `catalog/conectores/_modelo.md` | O que é, O que dá para fazer, Antes de começar, Instalação (uma aba por plataforma), Problemas comuns |
| Skill | `catalog/skills/<nome>/pagina.md` e `SKILL.md` | `catalog/skills/_modelo/` | O que faz, Exemplo de resultado, Onde funciona, Instalação (uma aba por plataforma), Como usar, Problemas comuns |
| Modelo de agente | `catalog/agentes/<nome>/pagina.md` e `instrucoes.md` | `catalog/agentes/_modelo/` | Para que serve, O que precisa, Passo a passo (uma aba por plataforma) |
| Prompt | `catalog/prompts/<nome>.md` | `catalog/prompts/_modelo.md` | Prompt, Quando usar |
| Tutorial | `catalog/tutoriais/<nome>.md` | `catalog/tutoriais/_modelo.md` | livres |

- O nome do arquivo ou da pasta usa **letras minúsculas sem acento, números e hífens** e vira o endereço: `catalog/prompts/aniversarios-do-mes.md` → `/prompts/aniversarios-do-mes/`. A referência a um item é `pasta/nome`, como `prompts/aniversarios-do-mes` ou `apps/fostermcp`.
- Arquivos e pastas que começam com `_` não entram no site.
- Itens `em-breve` só precisam da primeira seção, e skills e agentes em breve podem ficar sem `SKILL.md` ou `instrucoes.md`.
- **Skill:** o `name` do `SKILL.md` é igual ao nome da pasta (sem "claude" nem "anthropic") e a `description` diz o que a skill faz e quando usar, em até 500 caracteres. A pasta, menos `pagina.md`, vira `<nome>.zip` com a pasta na raiz.
- **Modelo de agente:** `instrucoes.md` tem até 8000 caracteres e vira o `AGENTS.md` para baixar. Agentes autônomos levam `avancado: true`.
- Seções extras são livres (por exemplo, Atualizar, Privacidade, Perguntas frequentes).

## Cabeçalho (front matter)

| Campo | Obrigatório | Formato |
| --- | --- | --- |
| `titulo` | sim | Até 80 caracteres. |
| `resumo` | sim | Até 220 caracteres; a primeira frase diz o que o item é. |
| `situacao` | sim | `disponivel`, `em-teste`, `em-breve`, `defasado` ou `arquivado` (veja abaixo). Item novo começa em `em-teste`. |
| `plataformas` | sim | Lista com `claude-desktop`, `chatgpt-codex`, `chatgpt`, `cursor`, `claude-code`, `grokbot`, `hermes` (e `gemini`, `grok` só em `plataformas_em_breve`). Em itens em breve, são as previstas. |
| `atualizado` | sim | `AAAA-MM-DD` da última revisão. Atualize sempre que mexer no conteúdo. |
| `plataformas_em_breve` | não | Plataformas que ainda não funcionam, como `[gemini, grok]`. Não pode repetir as de `plataformas`. |
| `revisar_ate` | não | `AAAA-MM-DD`. Depois dessa data o item mostra sozinho "Pode estar desatualizado". |
| `substituido_por` | não | `pasta/nome` do item que vale no lugar. Só com `defasado` ou `arquivado`; não pode apontar para item arquivado nem para si mesmo. |
| `avancado` | não | `true` para itens que exigem configuração técnica (selo e aviso "Avançado"). |
| `destaque` | não | `true` coloca o item na página inicial. |
| `versao` | não | Entre aspas: `"1.0"`. |
| `ordem` | não | Número inteiro; menor aparece primeiro dentro do tipo. |
| `requer` | não | Itens necessários, como `[apps/fostermcp]`. |
| `ferramentas` | não | Ferramentas do FosterMCP usadas, como `[search_clients, get_client_maturities]`. |
| `fontes` | prompts | `atlas`, `whatsapp`, `email`. Obrigatório em prompts; aceito em skills e agentes. É o filtro da lista de prompts. |
| `palavras` | não | Palavras extras para a busca. |
| `usos`, `compatibilidade` | apps e conectores | 1 a 4 frases curtas para o cartão; sistemas e custo, como `"Windows 10 e 11 · gratuito"`. |
| `download` | apps | `fostermcp` mostra o quadro de download, que usa o `version.json`. |
| `app` | conectores | App que traz o conector, como `apps/fostermcp`. |
| `assunto`, `tempo` | tutoriais | Assunto curto (Instalação, Atlas…) e tempo como `"8 min"`. |

Valores com vírgula ou dois-pontos vão entre aspas: `texto: "R$ 2,48 mi"`.

## Ciclo de vida

| `situacao` | Nas listas e na busca | Na página |
| --- | --- | --- |
| `em-teste` | Sim, com selo "Em teste" | Aviso para conferir antes de usar com clientes |
| `disponivel` | Sim ("Disponível" só em apps, skills e agentes) | — |
| `em-breve` | Sim, com selo "Em breve" | Aviso; sem download nem instruções para copiar |
| `defasado` | Sim, com selo "Defasado" | Aviso "Defasado" e, com `substituido_por`, o link "Use no lugar" |
| `arquivado` | **Não** | Continua no ar com aviso "Arquivado" e o link do substituto, se houver |

Pedidos comuns:

- **"Marque X como defasado":** `situacao: defasado`, `substituido_por` se a pessoa indicar o substituto, `atualizado` com a data de hoje.
- **"Arquive Y":** `situacao: arquivado` (e `substituido_por`, se houver). Antes, procure outros itens que apontem para Y em `substituido_por` e avise a pessoa.
- **"Revise Z" ou "marque revisão":** confira o conteúdo, troque `atualizado` para hoje e, se pedirem prazo, `revisar_ate`.
- **"Volte Y":** `situacao: disponivel` (ou `em-teste`) e remova `substituido_por`.

## Seções, abas e blocos

- Cada `## Título` vira uma seção, com o índice "Nesta página" ao lado.
- Subtítulos `###` com nome de plataforma (Claude Desktop, ChatGPT (aba Codex), ChatGPT (Projetos e GPTs), Cursor, Claude Code, GrokBot, Hermes Agent), de sistema (Windows, Mac) ou de fonte (Atlas, WhatsApp, E-mail) viram **abas**. Cada plataforma de `plataformas` precisa da sua aba nas seções com abas; as de `plataformas_em_breve` aparecem ao lado, tracejadas.
- Listas numeradas viram o passo a passo em linha do tempo. Cada passo começa com o título em negrito: `1. **Baixe o instalador.** Clique em…`.
- Em "Problemas comuns" e "Perguntas frequentes", cada `###` é uma pergunta com a resposta embaixo.
- Avisos: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` ou `> [!CAUTION]` na primeira linha, seguido do texto com `> ` no começo.
- Links internos começam com `/`: `[FosterMCP](/apps/fostermcp/)`, `[problemas comuns](/apps/fostermcp/#problemas-comuns)`. O site acrescenta o `/foster-ia/` sozinho.
- Imagens: `![O que aparece](/imagens/pasta/arquivo.png)`, com o arquivo em `public/imagens/pasta/`. Enquanto o arquivo não existe, aparece uma vaga "Print a ser incluído" e o build lista o que falta.
- Trechos repetidos: `<!-- incluir: nome -->`, com os arquivos de `conteudo/trechos/` (por exemplo `instalar-windows`, `usar-prompt`, `pedir-ajuda`). Mude o trecho, não as cópias.
- Variáveis: `{{site.nome}}`, `{{site.contato}}`, `{{site.aviso}}`, `{{site.repositorio}}`, `{{item.titulo}}`, `{{item.pasta}}`, `{{item.zipNome}}`, `{{item.zip}}`.

Blocos visuais são YAML dentro de três crases com o nome do bloco:

| Bloco | Mostra | Formato |
| --- | --- | --- |
| ` ```fluxo ` | O diagrama "como funciona" em uma linha | lista de 2 a 4 caixas com `rotulo`, `texto`, `nota` e `destaque: true` |
| ` ```exemplos ` | Perguntas e respostas de exemplo, com fonte e data | lista de 1 a 6 com `fonte`, `pergunta`, `resposta` (ou `linhas`: pares `[rótulo, valor]`), `ferramenta` e `citacao` |
| ` ```requisitos ` | A lista "Antes de começar" | lista com `texto`, `nota` e `opcional: true` |
| ` ```resultado ` | A prévia "Exemplo de resultado" de uma skill | `tipo: memo` com `titulo` e 2 a 6 `linhas`, ou `tipo: slide` com `titulo` |
| ` ```smartscreen ` | A réplica do aviso do Windows | `arquivo:` nome do instalador e `legenda` |
| ` ```prompt ` | Caixa de pergunta com o botão Copiar | só o texto |

Os cartões da página inicial usam o primeiro `exemplos` com `linhas` e o primeiro `resultado` de cada item.

## Outros arquivos de conteúdo

- `conteudo/novidades.yml`: lista com `data` (`AAAA-MM-DD`), `texto` (até 300 caracteres) e `link` opcional começando com `/`. A mais nova aparece primeiro.
- `conteudo/inicio.yml`: título, texto e o quadro "Primeira vez aqui?" com exatamente 3 passos (`texto` e `tempo`).
- `conteudo/tipos/<area>.md`: a frase de cada categoria (`resumo`) e um texto opcional.
- `conteudo/paginas/`: páginas avulsas, como a Ajuda.
- `config.js`: nome, assinatura, cores, endereços, contato, aviso e as chaves `previa` e `indexar`. Só mexa com pedido explícito.
