### Claude Desktop

1. Clique em **Baixar a skill (.zip)**. Não descompacte o arquivo.
2. No Claude, abra **Configurações › Capacidades** e ligue **Execução de código e criação de arquivos**, se ainda não estiver ligada.
3. Abra **Personalizar › Skills** (em inglês, *Customize › Skills*). Em versões anteriores do app, as skills ficam em **Configurações › Capacidades › Skills**.
4. Clique em **+**, escolha a opção de enviar uma skill (*Upload skill*) e selecione o arquivo .zip.
5. Confira que a skill aparece ligada na lista. Ela vale para as conversas novas.

> [!NOTE]
> **Depende do plano.** As skills aparecem nos planos do Claude que oferecem o recurso; em planos Team e Enterprise, o administrador da organização precisa liberar. Se a opção não aparecer, o seu plano ou a sua organização ainda não liberou.

### ChatGPT · aba Codex

1. Clique em **Baixar a skill (.zip)** e descompacte o arquivo. Sai uma pasta com o nome da skill.
2. Mova essa pasta para a pasta de skills do Codex:
   - **Windows:** `C:\Users\<seu usuário>\.codex\skills\`
   - **Mac:** `~/.codex/skills/` (no Finder, use **Ir › Ir para a Pasta** e cole o caminho)

   Crie a pasta `skills` se ela não existir. No fim, o arquivo `SKILL.md` deve ficar em `.codex/skills/<nome da skill>/SKILL.md`.
3. Feche o app do ChatGPT por completo e abra de novo. O Codex usa a skill sozinho quando o pedido combina com ela.

### Claude Code

1. Clique em **Baixar a skill (.zip)** e descompacte o arquivo. Sai uma pasta com o nome da skill.
2. Mova essa pasta para a pasta de skills do Claude Code:
   - **Windows:** `C:\Users\<seu usuário>\.claude\skills\`
   - **Mac:** `~/.claude/skills/`

   Crie a pasta `skills` se ela não existir. No fim, o arquivo `SKILL.md` deve ficar em `.claude/skills/<nome da skill>/SKILL.md`.
3. Feche o Claude Code e abra de novo.

### ChatGPT · Projetos e GPTs

O ChatGPT não instala skills, mas aceita as mesmas instruções coladas:

1. Clique em **Copiar as instruções**.
2. **Num Projeto:** abra o projeto, clique no menu **⋯** ao lado do nome e escolha **Instruções**. Cole e salve.
3. **Num GPT personalizado:** em **GPTs › Criar › Configurar**, cole no campo **Instruções** e salve como **Somente eu**. Criar GPTs pode depender do seu plano.
