---
titulo: Assistente de pré-reunião
resumo: Modelo de agente que prepara cada reunião com o cliente. Você diz o cliente e ele entrega um briefing de uma página, com carteira, vencimentos, conversas e pauta.
situacao: rascunho
plataformas: [claude-desktop, chatgpt, chatgpt-codex, claude-code]
fontes: [atlas, whatsapp, email]
atualizado: 2026-10-16
versao: "0.1"
destaque: true
ordem: 1
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_maturities, get_client_briefing, search_people, get_whatsapp_person_messages, search_foster_emails, get_foster_email, list_foster_events, create_foster_email_draft]
palavras: [reunião, briefing, pauta, cliente, preparação, projeto]
---

## Para que serve

Para ter um assistente fixo de preparação de reuniões. Dentro do projeto, basta dizer o cliente e, se quiser, a data e o objetivo. Ele consulta o FosterMCP e entrega:

- resumo do cliente em 3 linhas;
- carteira por classe, com a data dos dados;
- vencimentos e eventos dos próximos 30 dias;
- últimos contatos por WhatsApp e e-mail;
- pendências, pontos de atenção e pauta sugerida;
- fontes de cada informação.

Depois da reunião, ele escreve o e-mail de follow-up e só cria o rascunho com o seu "pode criar".

## O que precisa

```requisitos
- texto: FosterMCP conectado ao assistente, com o Atlas
  nota: WhatsApp e e-mail deixam o briefing mais completo
- texto: Claude Desktop, a aba Codex do ChatGPT ou o Claude Code
  nota: Para consultar os seus dados
- texto: Projetos e GPTs do ChatGPT
  nota: Funcionam sem o FosterMCP, só com o que você escrever
  opcional: true
```

## Passo a passo

<!-- incluir: usar-agente -->

## Exemplos de pedido

```prompt
Reunião amanhã às 10h com o cliente [código], para falar dos vencimentos.
```

```prompt
Agora escreva o e-mail de follow-up com o que combinamos.
```
