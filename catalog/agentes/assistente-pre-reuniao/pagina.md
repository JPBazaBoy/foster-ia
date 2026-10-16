---
titulo: Assistente de pré-reunião com cliente
resumo: Modelo de instruções que prepara um briefing de uma página antes de cada reunião, com carteira, vencimentos, conversas e pauta.
plataformas: [claude-desktop, chatgpt-codex, chatgpt, claude-code]
atualizado: 2026-10-16
status: rascunho
destaque: true
versao: "0.1"
ordem: 1
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_maturities, get_client_briefing, search_people, get_whatsapp_person_messages, search_foster_emails, get_foster_email, list_foster_events, create_foster_email_draft]
palavras: [reunião, briefing, pauta, cliente, preparação, agente, projeto]
---

## O que faz

Transforma o assistente num ajudante de preparação de reuniões. Você diz o cliente e, se quiser, a data e o objetivo; ele consulta o FosterMCP e entrega um briefing de uma página:

1. resumo do cliente em 3 linhas;
2. carteira por classe de ativo, com a data dos dados;
3. vencimentos e eventos de caixa dos próximos 30 dias;
4. últimos contatos por WhatsApp e e-mail;
5. pendências e promessas;
6. pontos de atenção;
7. pauta sugerida;
8. fontes de cada informação.

## Para quem

Assessores que querem chegar a cada reunião com o histórico do cliente em mãos, sem abrir o Atlas, o WhatsApp e o Outlook um por um.

## Exemplos de uso

Dentro do projeto (ou da pasta) do agente:

- *"Reunião amanhã às 10h com o cliente 900001, para falar dos vencimentos."*
- *"Prepare a reunião com a Maria Souza."* Se houver duas Marias Souza, ele pergunta qual é.
- *"Agora escreva o e-mail de follow-up com o que combinamos."* Ele mostra o texto e só cria o rascunho depois do seu "pode criar".

## Requisitos

- O [FosterMCP](/apps/fostermcp/) conectado ao assistente, com o Atlas habilitado. WhatsApp e e-mail deixam o briefing mais completo.
- Para consultar os dados: Claude Desktop, a aba Codex do app do ChatGPT ou Claude Code.
- Em Projetos e GPTs do ChatGPT, o agente funciona só com o que você escrever, sem consultar os dados.

## Como instalar

<!-- incluir: usar-agente -->

## Privacidade

O modelo é só um texto de instruções: ele não guarda nem envia dados. As consultas passam pelo FosterMCP, no seu computador, e o resultado vai para o serviço de IA que você usa, conforme as regras dele. Num Projeto ou GPT sem o FosterMCP, tudo o que você colar vai para o ChatGPT: siga as regras da empresa sobre dados de clientes.
