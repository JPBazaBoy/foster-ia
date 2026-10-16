---
titulo: O que conversei com uma pessoa
resumo: Resume as conversas de WhatsApp com alguém num período, com pedidos, promessas e pendências.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 4
requer: [apps/fostermcp]
ferramentas: [search_people, get_whatsapp_person_messages, get_whatsapp_message_content]
palavras: [whatsapp, conversa, histórico, pendências, cliente]
---

## O que faz

Lê as conversas com uma pessoa no período que você escolher e resume por data: o que ela pediu, o que você prometeu e o que ficou pendente.

## Prompt

Use o fostermcp para resumir o que conversei com [nome da pessoa] no WhatsApp nos últimos [30] dias.
1. Encontre a pessoa com search_people. Se houver mais de uma com esse nome, pare e me pergunte qual é.
2. Leia as mensagens do período com get_whatsapp_person_messages, em ordem, seguindo a paginação.
Entregue um resumo por data com: o que a pessoa pediu, o que eu prometi, o que está pendente e a data da última mensagem. Em grupos, diga quem escreveu cada mensagem.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o WhatsApp habilitado e a conversa dessa pessoa escolhida.

## Como usar

<!-- incluir: usar-prompt -->
