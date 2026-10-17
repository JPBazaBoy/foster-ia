---
titulo: Briefing de reunião
resumo: Skill que resume a situação do cliente em uma página, com carteira, vencimentos, últimas conversas e pendências.
situacao: rascunho
plataformas: [claude-desktop, chatgpt-codex, claude-code]
fontes: [atlas, whatsapp, email]
atualizado: 2026-10-16
versao: "0.1"
destaque: true
ordem: 2
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_maturities, get_client_briefing, search_people, get_whatsapp_person_messages, search_foster_emails, get_foster_email]
palavras: [briefing, reunião, cliente, resumo, pendências, pauta]
---

## O que faz

Antes de uma reunião, junta o que importa sobre o cliente em uma página: resumo, carteira, vencimentos dos próximos 30 dias, últimos contatos, pendências, pontos de atenção e pauta sugerida, cada parte com a fonte e a data.

## Exemplo de resultado

```resultado
tipo: memo
titulo: Briefing · Cliente 900001
linhas:
  - [Patrimônio total, "R$ 2,48 mi"]
  - [Vence em 30 dias, R$ 310 mil]
  - [Última conversa, há 6 dias]
  - [Pendências, 1 pergunta]
```

## Onde funciona

No Claude Desktop (nos planos com skills), no Claude Code e na aba Codex do ChatGPT. O briefing fica mais completo com o WhatsApp e o e-mail conectados ao FosterMCP.

## Instalação

O arquivo da skill se chama `{{item.zipNome}}` e a pasta dentro dele, `{{item.pasta}}`.

<!-- incluir: instalar-skill -->

## Como usar

```prompt
Prepare o briefing da minha reunião de amanhã com o cliente [código].
```

Para usar sem instalar nada, veja o modelo de agente [Assistente de pré-reunião](/agentes/assistente-pre-reuniao/).

## Problemas comuns

### O briefing vem sem as conversas

Confira se o WhatsApp está conectado no FosterMCP e se a conversa desse cliente está entre as escolhidas.

### O assistente escolheu o cliente errado

Use o código do cliente no pedido. Com nomes repetidos, a skill deve perguntar qual é; se não perguntar, avise {{site.contato}}.
