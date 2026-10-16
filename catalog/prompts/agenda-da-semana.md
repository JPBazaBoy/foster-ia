---
titulo: Agenda da semana com clientes
resumo: Lê a sua agenda da semana e traz, para cada reunião com cliente, o essencial para se preparar.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 9
requer: [apps/fostermcp]
ferramentas: [list_foster_events, search_clients, get_client_profile, get_client_maturities]
palavras: [agenda, reuniões, semana, outlook, preparação]
---

## O que faz

Percorre as reuniões da semana na sua agenda do Outlook e, para cada uma com cliente, traz patrimônio, vencimentos próximos e o que preparar.

## Prompt

Use o fostermcp para ver a minha agenda de [segunda a sexta desta semana] com o list_foster_events.
Para cada reunião com cliente, encontre o cliente na base do Atlas (search_clients; se houver dúvida sobre quem é, pergunte) e traga em 2 linhas: patrimônio e vencimentos dos próximos 30 dias (get_client_profile e get_client_maturities). Se não achar o cliente, diga.
No fim, liste o que eu preciso preparar para cada reunião.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado e o e-mail conectado com a opção de rascunhos e agenda.

## Como usar

<!-- incluir: usar-prompt -->
