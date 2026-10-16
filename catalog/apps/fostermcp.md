---
titulo: FosterMCP
resumo: Leva os seus dados do Atlas, do WhatsApp e do e-mail para o Claude ou o ChatGPT, direto do seu computador.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
destaque: true
ordem: 1
download: fostermcp
palavras: [atlas, whatsapp, e-mail, agenda, outlook, carteira, vencimentos, clientes, mcp, instalar, windows, mac, atualizar, diagnóstico]
---

## O que faz

O FosterMCP é um app gratuito para Windows e Mac que dá ao seu assistente de IA acesso aos **seus** dados de trabalho, sem copiar e colar:

- **Atlas:** clientes, carteiras, vencimentos, movimentações, receita e índices, com a data de cada atualização.
- **WhatsApp:** só as conversas que você escolher, para perguntar, por exemplo, "o que conversei com fulano?".
- **E-mail e agenda (Microsoft 365):** leitura de e-mails e, se você permitir, criação de rascunhos e de eventos. O FosterMCP **nunca envia** e-mails: você revisa e envia pelo Outlook.

Cada fonte é independente: dá para usar só o Atlas, só o WhatsApp ou qualquer combinação. Tudo roda no seu computador.

## Para quem

Assessores de investimentos que usam o Claude ou o ChatGPT e querem que o assistente responda com os próprios dados: carteira, vencimentos, conversas e agenda. Não precisa saber programar.

## Exemplos de uso

- *"Prepare um briefing da minha reunião de amanhã com o cliente 900001."*
- *"Quais clientes têm vencimentos nesta semana? Agrupe por dia."*
- *"O que conversei com a Maria no WhatsApp nos últimos 30 dias? Liste as pendências."*
- *"Quem da minha base tem o ativo X?"*
- *"Crie um rascunho de e-mail de follow-up da reunião de hoje com o João."* O rascunho fica no Outlook para você revisar e enviar.

Mais ideias na [biblioteca de prompts](/prompts/).

## Requisitos

- **Windows 10 ou 11 (64 bits)** ou **Mac com chip Apple** (M1 ou mais novo).
- Um assistente: **Claude Desktop** ou o **app do ChatGPT com a aba Codex**. Claude Code e Cursor também funcionam.
- **Atlas:** o seu acesso de sempre, com a conta Microsoft e a verificação em duas etapas.
- **WhatsApp:** o seu celular com o WhatsApp, para conectar uma vez.
- **E-mail:** depende da TI. Ela precisa ter registrado o aplicativo do escritório na Microsoft; sem isso, o e-mail fica de fora e o resto funciona.
- Computador ligado e com internet enquanto você usa. Para o WhatsApp continuar recebendo mensagens, deixe o FosterMCP aberto (pode ficar só no ícone perto do relógio).

## Como instalar

### Windows

<!-- incluir: instalar-windows -->

### Mac

<!-- incluir: instalar-mac -->

## Primeiro uso

Na primeira vez, o FosterMCP abre um assistente de 3 etapas. Leva uns 5 minutos.

1. **Onde seus dados vão ficar:** **Neste computador** já vem marcado. Em **Pasta exclusiva para os seus dados**, clique em **Escolher pasta** e crie uma pasta **nova e vazia**, por exemplo `Documentos\Base FosterMCP`. Evite OneDrive, pasta de rede e pendrive. A pasta não muda depois, a não ser por backup e restauração.
2. **Comece com o que precisa:** marque Atlas, WhatsApp, e-mail ou só alguns deles. Dá para habilitar os outros depois.
3. Confira e clique em **Criar meu espaço**.

Em seguida, conecte cada fonte em **Conexões**.

### Atlas

1. Em **Conexões › Atlas**, clique em **Entrar pela janela do navegador**.
2. Entre com a sua conta Microsoft e conclua a verificação, como o número no Microsoft Authenticator.
3. Clique em **Atualizar Atlas**. O cartão mostra a etapa em andamento e, no fim, o selo **Atualizado**.

Clique em **Atualizar Atlas** sempre que quiser dados novos. Depois de 24 horas, o selo muda para **Desatualizado**. Se a sessão expirar, entre de novo pela janela do navegador.

![Cartão do Atlas em Conexões, com os botões Entrar pela janela do navegador e Atualizar Atlas e o selo Atualizado](/imagens/fostermcp/atlas.png)

### WhatsApp

<!-- incluir: whatsapp-aviso -->

1. Em **Conexões › WhatsApp**, clique em **Habilitar WhatsApp**, leia o aviso e marque **Entendi as limitações**.
2. **Antes de conectar, escolha os contatos.** No cartão do WhatsApp, digite o número de cada contato que você quer guardar, com +55 e DDD, e clique em **Adicionar**. Só as conversas escolhidas são guardadas.
3. Clique em **Parear com QR code** (na versão 0.3.2, o botão se chama **Parear WhatsApp**). No celular, abra o WhatsApp › **Aparelhos conectados** › **Conectar aparelho** e leia o QR code que aparece no FosterMCP.
4. **Prefere um código?** A partir da versão 0.4.0, abra **Prefere digitar um código no celular?**, informe o **seu** número com +55 e DDD e clique em **Gerar código**. No celular, em **Aparelhos conectados › Conectar aparelho**, toque em **Conectar com número de telefone** e digite o código de 8 caracteres.
5. Em até 1 minuto, o cartão mostra **Atualizado**, e o FosterMCP aparece no celular em **Aparelhos conectados**.

![Cartão do WhatsApp em Conexões, com o QR code para conectar o celular](/imagens/fostermcp/whatsapp-pareamento.png)

Para continuar recebendo mensagens, deixe o FosterMCP aberto. Fechar a janela no **X** não encerra o app: ele continua no ícone perto do relógio (no Mac, na barra de menus). Para ele abrir sozinho quando você liga o computador, clique com o botão direito no ícone e marque **Abrir ao entrar no computador**.

![Menu do ícone do FosterMCP perto do relógio, com Abrir FosterMCP, Abrir ao entrar no computador e Encerrar FosterMCP](/imagens/fostermcp/bandeja.png)

Escolha os contatos antes de conectar: uma conversa escolhida depois pode não trazer as mensagens antigas.

### E-mail e agenda

O e-mail depende da TI do escritório, que registra o aplicativo na Microsoft. Se os campos já vierem preenchidos, a TI já fez a parte dela.

1. Em **Conexões › E-mail**, confira o seu e-mail e os dois identificadores da Microsoft (do diretório e do aplicativo). Se estiverem vazios, peça à TI. Eles não são senhas.
2. Se quiser que o assistente crie rascunhos e eventos, marque **Permitir que o agente crie rascunhos e eventos na agenda**.
3. Clique em **Salvar e entrar com Microsoft** e conclua o login.

O FosterMCP só lê os e-mails na hora da pergunta e não guarda nada. Mesmo com os rascunhos ligados, ele **nunca envia**, não move e não apaga e-mails, e não altera nem exclui eventos. Antes de criar um rascunho ou um evento, o assistente precisa da sua autorização.

## Como conectar ao seu assistente

<!-- incluir: conectar-fostermcp -->

## Como atualizar

1. Quando sair uma versão nova, ela aparece nesta página e nas Novidades do início. O FosterMCP também pode mostrar um aviso com o botão **Baixar**, que só abre esta página: nada é baixado sozinho.
2. Feche o FosterMCP por completo: clique com o botão direito no ícone perto do relógio e escolha **Encerrar FosterMCP**.
3. Baixe a versão nova e instale por cima. No Windows, rode o instalador; no Mac, arraste para **Aplicativos** e escolha **Substituir**.
4. Abra o FosterMCP. Seus dados, suas conexões e a configuração dos assistentes continuam.

> [!NOTE]
> O aviso do Windows pode aparecer de novo. No Mac, pode ser preciso repetir o **Abrir Mesmo Assim**; se o Mac pedir acesso às **Chaves**, digite a senha do Mac e clique em **Permitir Sempre**.

## Como pedir ajuda

<!-- incluir: pedir-ajuda -->

## Novidades

### Versão 0.3.2

- O WhatsApp volta a mostrar o QR code para conectar.
- O app de Mac abre pelo **Abrir Mesmo Assim**; antes, o Mac dizia que ele estava danificado.
- Atlas mais simples: **Entrar pela janela do navegador** e **Atualizar Atlas**, com o selo Atualizado ou Desatualizado.
- **Ajuda › Copiar diagnóstico**, e a versão aparece no título da janela, na barra lateral e na Ajuda.

### Versão 0.3.1

- O Claude Desktop volta a receber respostas do FosterMCP no Windows.

### Versão 0.3.0

- Configuração guiada do Claude Desktop.
- E-mail com rascunhos e agenda, sem envio.

## Perguntas frequentes

### É grátis?

Sim. O FosterMCP e a central são gratuitos e não pedem login. O assistente (Claude ou ChatGPT) segue o plano que você já tem.

### Meus dados vão para algum servidor do escritório?

Não. Cada assessor tem a própria instalação, no próprio computador. Não existe base compartilhada nem servidor central.

### O FosterMCP manda mensagens ou e-mails por mim?

Não. No WhatsApp, ele só lê as conversas que você escolher. No e-mail, no máximo cria rascunhos, se você permitir: quem envia é você, pelo Outlook.

### Preciso deixar o computador ligado?

Para consultar, sim. Para o WhatsApp continuar recebendo mensagens, deixe o FosterMCP aberto, mesmo que só no ícone perto do relógio. Desligar ou suspender o computador pausa a captura; o que já foi salvo continua lá.

### Por que o Windows mostra um aviso?

Porque o instalador ainda não tem assinatura digital, que é paga. O aviso é esperado: veja [como passar por ele](#como-instalar). Se o antivírus bloquear, não insista e [peça ajuda](/ajuda/#como-pedir-ajuda).

### O FosterMCP acessa o Hub XP?

Não. O FosterMCP não se conecta ao Hub XP.

### Como faço backup?

Em **Backup**, clique em **Criar backup agora** e guarde a cópia fora do computador, como num HD externo. O backup não leva senhas: depois de restaurar, você conecta as contas de novo.

### Como desinstalo?

No Windows, em **Configurações › Aplicativos › FosterMCP › Desinstalar**. No Mac, arraste o FosterMCP de **Aplicativos** para o Lixo. A desinstalação mantém a sua pasta de dados; apague-a só se tiver certeza.

## Problemas comuns

### O assistente não encontra o FosterMCP

Confira se você fechou o assistente **por completo** depois de configurar, pelo ícone perto do relógio e não só pela janela. No Claude Desktop, veja **Configurações › Desenvolvedor**. Se o **fostermcp** aparecer com erro, abra o FosterMCP › **Seus agentes** e clique em **Configurar neste computador** de novo.

### O app do ChatGPT não abre depois de configurar o Codex

Feche o ChatGPT. Abra o arquivo `C:\Users\<seu usuário>\.codex\config.toml` no Bloco de Notas e apague o bloco entre `# BEGIN FosterMCP managed` e `# END FosterMCP managed`, incluindo essas duas linhas. Outra saída é restaurar a cópia `config.toml.fostermcp-backup-…` da mesma pasta. Depois, [peça ajuda](/ajuda/#como-pedir-ajuda) com o diagnóstico.

### "O Windows não conseguiu proteger a pasta individual"

A pasta escolhida não aceita a proteção do Windows, o que acontece em pasta de rede e em pendrive. Escolha uma pasta nova no próprio computador, fora do OneDrive.

### O WhatsApp não mostra o QR code

Confira se você escolheu pelo menos um contato antes de conectar e se o computador está com internet. Se aparecer um erro, use **Ajuda › Copiar diagnóstico** e [peça ajuda](/ajuda/#como-pedir-ajuda).

### O Atlas aparece como Desatualizado

Clique em **Atualizar Atlas**. Se pedir login, use **Entrar pela janela do navegador** e conclua a verificação.

### O Windows bloqueou o instalador sem "Executar assim mesmo"

No Windows 11, o **Controle Inteligente de Aplicativos** bloqueia programas sem assinatura e não oferece essa opção. Não desative a proteção por conta própria: fale com a TI ou [peça ajuda](/ajuda/#como-pedir-ajuda).

## Privacidade

<!-- incluir: privacidade-fostermcp -->
