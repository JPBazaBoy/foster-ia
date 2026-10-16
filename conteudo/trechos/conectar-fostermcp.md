### Claude Desktop

1. Instale o [Claude Desktop](https://claude.ai/download) e entre com a sua conta do Claude.
2. No FosterMCP, abra **Seus agentes**, escolha a aba **Claude Desktop**, clique em **Configurar neste computador** e confirme.
3. Feche o Claude Desktop **por completo**. Fechar só a janela não basta:
   - **Windows:** clique com o botão direito no ícone do Claude perto do relógio (talvez escondido na setinha **^**) e escolha **Sair**.
   - **Mac:** no menu **Claude**, escolha **Sair** (ou aperte ⌘Q).
4. Abra o Claude Desktop de novo. Em **Configurações › Desenvolvedor**, o **fostermcp** deve aparecer em execução.
5. Numa conversa nova, peça: *"Use o fostermcp para me dizer quais fontes estão disponíveis e se os dados estão atualizados."*

![Claude Desktop em Configurações › Desenvolvedor, com o fostermcp em execução](/imagens/fostermcp/claude-fostermcp.png)

### ChatGPT · aba Codex

O FosterMCP chega ao ChatGPT pela aba **Codex** do app do ChatGPT para computador. Projetos, GPTs e o ChatGPT no navegador não acessam o FosterMCP.

1. Instale o app do ChatGPT para computador, entre com a sua conta e confira que a aba **Codex** aparece. Ela depende do seu plano.
2. No FosterMCP, abra **Seus agentes**, escolha a aba **Codex**, clique em **Configurar neste computador** e confirme. O FosterMCP guarda uma cópia da configuração anterior do Codex.
3. Feche o app do ChatGPT por completo (no Windows, também pelo ícone perto do relógio, se houver) e abra de novo.
4. Na aba **Codex**, pergunte: *"Quais ferramentas do fostermcp você tem?"* Depois: *"Use o fostermcp para me dizer quais fontes estão disponíveis e se os dados estão atualizados."*

### Claude Code

1. No FosterMCP, abra **Seus agentes**, escolha a aba **Claude Code**, clique em **Configurar neste computador** e confirme.
2. Feche o Claude Code e abra de novo.
3. Digite `/mcp`: o **fostermcp** deve aparecer conectado.

### Cursor

O Cursor não tem configuração automática: você copia um trecho no FosterMCP e cola no Cursor.

1. No FosterMCP, abra **Seus agentes**, escolha a aba **Outro agente**, clique em **Gerar configuração** e depois em **Copiar configuração**.
2. No Cursor, abra **Cursor Settings** e procure a parte de **MCP** (conforme a versão, **Tools & MCP** ou **MCP**). Clique em **New MCP Server** (ou **Add new global MCP server**). Abre o arquivo `mcp.json`.
3. Cole o bloco `"fostermcp"` dentro de `"mcpServers"`, sem apagar outros servidores, e salve.
4. Feche e abra o Cursor. O **fostermcp** deve aparecer ativo na lista.

> [!NOTE]
> O Cursor ainda não foi testado no piloto. Se não funcionar, [peça ajuda](/ajuda/#como-pedir-ajuda). Não compartilhe a configuração copiada: ela aponta para a sua instalação.
