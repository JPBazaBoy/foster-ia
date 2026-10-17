### Claude Desktop

1. **No FosterMCP, abra Seus agentes.** Escolha **Claude Desktop** e clique em **Configurar neste computador**.
2. **Feche o Claude por completo.** Fechar a janela não basta. No Windows, clique com o botão direito no ícone do Claude, perto do relógio, e escolha **Sair**. No Mac, use **Claude › Sair**. Depois abra o Claude de novo.
3. **Confira a conexão.** Em **Configurações › Desenvolvedor**, o **fostermcp** aparece em execução.

   ![Claude Desktop em Configurações › Desenvolvedor, com o fostermcp em execução](/imagens/fostermcp/claude-fostermcp.png)

4. **Faça a pergunta de teste.** Numa conversa nova, cole a pergunta abaixo. Se o Claude responder com a data da última atualização, está tudo certo.

   ```prompt
   Usando o FosterMCP, quando foi a última atualização do Atlas?
   ```

### ChatGPT (aba Codex)

O FosterMCP chega ao ChatGPT pela aba **Codex** do app para computador. Projetos, GPTs e o ChatGPT no navegador não acessam o FosterMCP.

1. **No FosterMCP, abra Seus agentes.** Escolha **Codex** e clique em **Configurar neste computador**. O FosterMCP guarda uma cópia da configuração anterior.
2. **Feche o app do ChatGPT por completo.** No Windows, também pelo ícone perto do relógio, se houver. Depois abra de novo.
3. **Faça a pergunta de teste na aba Codex.**

   ```prompt
   Usando o FosterMCP, quando foi a última atualização do Atlas?
   ```

### Cursor

O Cursor não tem configuração automática: você copia um trecho no FosterMCP e cola no Cursor.

1. **No FosterMCP, copie a configuração.** Em **Seus agentes**, escolha **Outro agente**, clique em **Gerar configuração** e depois em **Copiar configuração**.
2. **Cole no Cursor.** Abra **Cursor Settings**, procure a parte de **MCP** e clique em **New MCP Server**. No arquivo `mcp.json` que abrir, cole o bloco `"fostermcp"` dentro de `"mcpServers"`, sem apagar outros servidores, e salve.
3. **Reinicie o Cursor.** O **fostermcp** aparece ativo na lista de MCPs.

> [!NOTE]
> O Cursor ainda não foi testado no piloto. Não compartilhe a configuração copiada: ela aponta para a sua instalação.

### Claude Code

1. **No FosterMCP, abra Seus agentes.** Escolha **Claude Code** e clique em **Configurar neste computador**.
2. **Reinicie o Claude Code.** Feche e abra de novo.
3. **Confira a conexão.** Digite `/mcp`: o **fostermcp** aparece conectado.
