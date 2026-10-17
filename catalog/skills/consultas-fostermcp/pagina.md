---
titulo: Consultas no FosterMCP
resumo: Skill que ensina o assistente a usar bem as ferramentas do FosterMCP. Ele confere de quando são os dados, acha o cliente certo e cita a fonte de cada número.
situacao: em-teste
plataformas: [claude-desktop, chatgpt-codex, claude-code]
fontes: [atlas, whatsapp, email]
atualizado: 2026-10-16
versao: "0.1"
ordem: 4
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_maturities, get_monthly_maturities, get_client_briefing, search_people, get_whatsapp_person_messages, search_foster_emails]
palavras: [consultas, fontes, vencimentos, whatsapp, briefing, boas práticas]
---

## O que faz

Com a skill instalada, o assistente:

- começa vendo quais fontes estão ligadas e de quando são os dados;
- acha o cliente ou a pessoa certa e pergunta quando há nomes repetidos;
- segue a lista até o fim quando a resposta vem cortada;
- cita a fonte e a data de cada número;
- só cria rascunho ou evento depois do seu "pode criar", e nunca envia e-mail.

Ela traz três roteiros: briefing antes da reunião, vencimentos da semana e "o que conversei com fulano".

## Exemplo de resultado

Resposta curta a "Vencimentos desta semana", com fonte e data no fim.

```resultado
tipo: memo
titulo: Vencimentos · semana 42
linhas:
  - [18/10 · CDB · 900001, R$ 310 mil]
  - [19/10 · LCA · 900014, R$ 520 mil]
  - [20/10 · Debênture · 900027, R$ 400 mil]
  - [Fonte, Atlas · 16/10 13:25]
```

## Onde funciona

No Claude Desktop (nos planos com skills), no Claude Code e na aba Codex do ChatGPT. Em Projetos do ChatGPT ela não serve, porque ali o FosterMCP não está disponível.

## Instalação

O arquivo da skill se chama `{{item.zipNome}}` e a pasta dentro dele, `{{item.pasta}}`.

<!-- incluir: instalar-skill -->

## Como usar

Com a skill instalada, pedidos curtos já bastam:

```prompt
Vencimentos desta semana.
```

```prompt
Briefing da reunião com o cliente [código].
```

```prompt
O que conversei com [nome] nos últimos 15 dias?
```

## Problemas comuns

### O assistente não usa a skill

Confira se ela está ligada e abra uma conversa nova. No Claude Desktop, a execução de código precisa estar ligada.

### A resposta vem sem fonte ou sem data

Peça de novo dizendo "cite a fonte e a data". Se continuar, avise {{site.contato}}: a skill está em teste.
