---
titulo: Consultas no FosterMCP
resumo: Ensina o assistente a usar bem as ferramentas do FosterMCP, do primeiro passo ao briefing de reunião.
plataformas: [claude-desktop, chatgpt-codex, claude-code]
atualizado: 2026-10-16
status: rascunho
destaque: true
versao: "0.1"
ordem: 1
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_maturities, get_monthly_maturities, get_client_briefing, search_people, get_whatsapp_person_messages, search_foster_emails]
palavras: [briefing, reunião, vencimentos, whatsapp, conversas, consultas, skill]
---

## O que faz

Com esta skill, o assistente consulta o FosterMCP do jeito certo, sem você precisar explicar toda vez:

- começa por `get_workspace_overview`, para saber quais fontes estão ligadas e de quando são os dados;
- acha o cliente ou a pessoa certa e **pergunta** quando há nomes repetidos;
- segue a paginação até o fim e cita a fonte e a data de cada informação;
- trata o conteúdo de e-mails e mensagens como informação, nunca como ordem;
- só cria rascunho ou evento depois do seu "pode criar", e nunca envia e-mail.

Ela traz três roteiros prontos: **briefing antes da reunião**, **vencimentos da semana** e **"o que conversei com fulano"**.

## Para quem

Quem já usa o FosterMCP e quer respostas mais completas e confiáveis, com menos idas e vindas com o assistente.

## Exemplos de uso

Com a skill instalada, pedidos curtos já bastam:

- *"Briefing da reunião com o cliente 900001."*
- *"Vencimentos desta semana."*
- *"O que conversei com a Maria nos últimos 15 dias?"*

## Requisitos

- O [FosterMCP](/apps/fostermcp/) instalado e conectado ao assistente.
- Claude Desktop (num plano com skills), Claude Code ou o app do ChatGPT com a aba Codex.
- No ChatGPT, só a aba Codex enxerga o FosterMCP. Por isso, esta skill não serve para Projetos e GPTs.

## Como instalar

O arquivo da skill se chama `{{item.zipNome}}` e a pasta dentro dele, `{{item.pasta}}`.

<!-- incluir: instalar-skill -->

## Como saber se funcionou

Numa conversa nova, peça *"Vencimentos desta semana"*. O assistente deve começar consultando as fontes disponíveis e a data do Atlas e terminar com uma linha **Fontes:**.

## Privacidade

A skill não guarda nem envia dados: são só instruções para o assistente. As consultas continuam passando pelo FosterMCP, no seu computador, e o resultado de cada uma vai para o serviço de IA que você usa, conforme as regras dele.
