---
titulo: Conector FosterMCP
resumo: O conector (MCP) que vem dentro do app FosterMCP e dá ao assistente as ferramentas do Atlas, do WhatsApp e do e-mail.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 1
app: apps/fostermcp
requer: [apps/fostermcp]
palavras: [mcp, ferramentas, atlas, whatsapp, e-mail, agenda, conectar]
---

## O que faz

O conector é a parte do FosterMCP que conversa com o assistente. Quando você pergunta algo, o assistente escolhe uma **ferramenta** do conector, o FosterMCP consulta a sua base e devolve só o resultado.

O assistente só vê as ferramentas das fontes que você habilitou. Se o WhatsApp estiver desligado, por exemplo, as ferramentas de WhatsApp nem aparecem.

| Fonte | O que dá para perguntar | Algumas ferramentas |
| --- | --- | --- |
| Início | O que está disponível e se os dados estão atualizados | `get_workspace_overview`, `get_sync_status` |
| Atlas | Clientes, carteira, vencimentos, aportes e resgates, receita, índices | `search_clients`, `get_client_profile`, `get_client_portfolio`, `get_client_maturities`, `get_monthly_maturities`, `get_asset_exposure`, `get_client_flows` |
| WhatsApp | Conversas com uma pessoa, busca por assunto, histórico de uma conversa | `search_people`, `get_whatsapp_person_messages`, `search_whatsapp_fts`, `list_whatsapp_chats`, `get_whatsapp_chat_timeline` |
| Atlas e WhatsApp | Briefing de cliente juntando carteira e conversas | `get_client_briefing` |
| E-mail e agenda | Ler e buscar e-mails, ver a agenda, criar rascunhos e eventos | `list_foster_emails`, `search_foster_emails`, `get_foster_email`, `list_foster_events`, `create_foster_email_draft`, `create_foster_event` |

## Para quem

Quem já instalou o app FosterMCP e quer ligar o conector a mais de um assistente, ou entender o que o assistente consegue fazer com ele.

## Requisitos

- O app [FosterMCP](/apps/fostermcp/) instalado, com pelo menos uma fonte conectada.
- Um destes assistentes no mesmo computador: Claude Desktop, app do ChatGPT com a aba Codex, Claude Code ou Cursor.

## Como instalar

O conector já vem no app. Basta ligar o assistente a ele:

<!-- incluir: conectar-fostermcp -->

## Segurança das ações

- O conector **lê** dados. As únicas escritas possíveis são criar e editar **rascunhos** de e-mail e criar **eventos** na agenda, e só se você ligou essa opção no FosterMCP.
- Antes de qualquer escrita, o assistente precisa mostrar o conteúdo e receber o seu "pode criar". Evento com convidados envia convites na hora, e o assistente precisa avisar isso também.
- O conector **nunca envia** e-mails nem mensagens, não move nem apaga nada.
- O conteúdo de e-mails e mensagens é tratado como informação, nunca como ordem para o assistente.

## Privacidade

<!-- incluir: privacidade-fostermcp -->
