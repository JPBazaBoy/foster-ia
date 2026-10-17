---
titulo: FosterMCP
resumo: Aplicativo que conecta o seu assistente de IA ao Atlas, ao WhatsApp e ao e-mail. Os dados ficam no seu computador.
situacao: disponivel
plataformas: [claude-desktop, chatgpt-codex, cursor, claude-code]
plataformas_em_breve: [gemini, grok]
compatibilidade: Windows 10 e 11 · Mac com chip Apple (M1 ou mais novo) · gratuito
usos:
  - Ver os vencimentos da semana de todos os clientes
  - Preparar o briefing de um cliente antes da reunião
  - Resumir o que um cliente falou no WhatsApp
atualizado: 2026-10-16
destaque: true
ordem: 1
download: fostermcp
palavras: [atlas, whatsapp, e-mail, agenda, outlook, carteira, vencimentos, clientes, mcp, conector, instalar, windows, mac, atualizar, diagnóstico]
---

## O que é

O FosterMCP guarda no seu computador os dados das fontes que você escolher e responde às perguntas do seu assistente. O assistente não acessa o Atlas, o WhatsApp ou o e-mail diretamente: ele pergunta ao FosterMCP, que devolve só o necessário, com a fonte e a data de cada dado.

```fluxo
- rotulo: Suas fontes
  texto: Atlas · WhatsApp · E-mail
- rotulo: No seu computador
  texto: FosterMCP
  nota: A base fica aqui
  destaque: true
- rotulo: Seu assistente
  texto: Claude · ChatGPT · Cursor
```

## O que dá para fazer

Exemplos de perguntas e do tipo de resposta que você recebe.

```exemplos
- fonte: Atlas
  pergunta: Quais clientes têm vencimentos nesta semana?
  ferramenta: FosterMCP · vencimentos
  resposta: "**3 clientes** somam **R$ 1,23 mi** até sexta: 900001 (CDB, 18/10), 900014 (LCA, 19/10) e 900027 (debênture, 20/10)."
  linhas:
    - [Cliente 900001 · CDB, R$ 310 mil · 18/10]
    - [Cliente 900014 · LCA, R$ 520 mil · 19/10]
    - [Cliente 900027 · Debênture, R$ 400 mil · 20/10]
  citacao: "Fonte: Atlas · atualizado em 16/10, 13:25"
- fonte: WhatsApp
  pergunta: O que o cliente 900014 me pediu esta semana?
  resposta: "Na terça, pediu uma simulação de previdência e perguntou sobre o **vencimento da LCA**. Ainda **sem resposta**."
  citacao: "WhatsApp · 14/10, 18:02"
- fonte: Atlas + E-mail
  pergunta: Escreva um rascunho de e-mail sobre o vencimento da debênture do 900027.
  resposta: "Rascunho criado no seu Outlook com as datas e os valores. **Nada é enviado**: você revisa e envia."
  citacao: "Atlas · 16/10 · Outlook (rascunhos)"
```

## Antes de começar

```requisitos
- texto: Windows 10 ou 11, ou Mac com chip Apple (M1 ou mais novo)
- texto: Claude Desktop ou o app do ChatGPT instalado
  nota: Use o assistente que você já tem
- texto: Seu login do Atlas
  nota: O mesmo que você usa no navegador
- texto: Celular por perto, se for conectar o WhatsApp
  opcional: true
- texto: Liberação da TI, se for conectar o e-mail
  nota: Peça à TI os dois identificadores do aplicativo
  opcional: true
```

## Instalação

Cerca de 10 minutos. Escolha o seu sistema.

### Windows

<!-- incluir: instalar-windows -->

### Mac

<!-- incluir: instalar-mac -->

## Conectar ao seu assistente

O FosterMCP faz a configuração por você. Escolha o seu assistente.

<!-- incluir: conectar-assistente -->

## Conectar suas fontes

Conecte só o que você vai usar. Cada fonte funciona sem as outras.

### Atlas

<!-- incluir: conectar-atlas -->

### WhatsApp

<!-- incluir: conectar-whatsapp -->

### E-mail

<!-- incluir: conectar-email -->

## Atualizar

Quando sair uma versão nova, ela aparece nesta página e nas Novidades do início.

1. **Feche o FosterMCP por completo.** Clique com o botão direito no ícone perto do relógio e escolha **Encerrar FosterMCP**.
2. **Baixe a versão nova.** Use os botões do topo desta página.
3. **Instale por cima.** No Windows, rode o instalador. No Mac, arraste para **Aplicativos** e escolha **Substituir**.
4. **Abra o FosterMCP.** Seus dados, suas conexões e a configuração dos assistentes continuam.

> [!NOTE]
> O aviso do Windows pode aparecer de novo. No Mac, pode ser preciso repetir o **Abrir Mesmo Assim** e, se o Mac pedir acesso às **Chaves**, digitar a senha e clicar em **Permitir Sempre**.

## Problemas comuns

### O assistente mostra "Server disconnected" ou não encontra o FosterMCP

Atualize para a versão mais recente do FosterMCP, saia do assistente pelo ícone perto do relógio e abra de novo. Se continuar, use **Ajuda › Copiar diagnóstico** no FosterMCP e envie para {{site.contato}}.

### O Windows bloqueou e não mostra "Executar assim mesmo"

Alguns Windows 11 têm o **Controle Inteligente de Aplicativos** ligado, que bloqueia apps sem assinatura. Fale com {{site.contato}} antes de mudar qualquer configuração de segurança.

### O antivírus bloqueou o instalador

Não desative o antivírus. Envie um print do aviso para {{site.contato}}.

### O Atlas pede login de novo

A sessão do Atlas expirou. Clique em **Entrar pela janela do navegador**, faça o login e depois em **Atualizar Atlas**.

### As mensagens novas do WhatsApp não aparecem

O FosterMCP precisa estar aberto, mesmo só no ícone perto do relógio, para guardar mensagens novas. Marque **Abrir ao entrar no computador** no menu desse ícone.

### O app do ChatGPT não abre depois de configurar o Codex

Feche o ChatGPT. Abra `C:\Users\<seu usuário>\.codex\config.toml` no Bloco de Notas e apague o bloco entre `# BEGIN FosterMCP managed` e `# END FosterMCP managed`, incluindo essas linhas. Outra saída é restaurar a cópia `config.toml.fostermcp-backup-…` da mesma pasta.

### Aparece "O Windows não conseguiu proteger a pasta individual"

A pasta escolhida está na rede ou num pendrive. Escolha uma pasta nova no próprio computador, fora do OneDrive.

## Privacidade

<!-- incluir: privacidade-fostermcp -->
- **O que o FosterMCP não faz:** não envia e-mails nem mensagens e não se conecta ao Hub XP.
