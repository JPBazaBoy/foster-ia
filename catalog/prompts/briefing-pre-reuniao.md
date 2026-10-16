---
titulo: Briefing antes da reunião
resumo: Junta carteira, vencimentos, conversas e e-mails de um cliente numa página, com pauta sugerida.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 2
requer: [apps/fostermcp]
ferramentas: [search_clients, get_client_profile, get_client_maturities, search_people, get_whatsapp_person_messages, search_foster_emails]
palavras: [reunião, cliente, briefing, pauta, preparação]
---

## O que faz

Prepara a reunião com um cliente: resumo, carteira, vencimentos dos próximos 30 dias, últimos contatos, pendências e pauta. Usa o WhatsApp e o e-mail só se estiverem habilitados.

## Prompt

Use o fostermcp para preparar a minha reunião com o cliente [nome ou código do cliente], marcada para [data].
1. Encontre o cliente com search_clients. Se houver mais de um com esse nome, pare e me pergunte qual é.
2. Traga o perfil (get_client_profile) e os vencimentos e eventos de caixa dos próximos 30 dias (get_client_maturities).
3. Se o WhatsApp estiver habilitado, resuma as conversas dos últimos 30 dias com esse cliente (search_people e get_whatsapp_person_messages).
4. Se o e-mail estiver habilitado, procure os e-mails recentes com o nome dele (search_foster_emails).
Entregue em uma página: resumo em 3 linhas, carteira por classe, vencimentos, últimos contatos, pendências, pontos de atenção e pauta sugerida. Separe fatos (com fonte e data) de sugestões e não invente números.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado. WhatsApp e e-mail são opcionais.

## Como usar

<!-- incluir: usar-prompt -->

## Dica

Para não colar este prompt toda vez, use o agente [Assistente de pré-reunião com cliente](/agentes/assistente-pre-reuniao/).
