---
titulo: Assunto no WhatsApp
resumo: Procura um assunto nas conversas de WhatsApp e mostra quem falou dele, quando e o que ficou pendente.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 10
requer: [apps/fostermcp]
ferramentas: [search_whatsapp_fts]
palavras: [whatsapp, busca, assunto, interesse, previdência]
---

## O que faz

Busca um assunto nas conversas escolhidas no FosterMCP, como "previdência" ou "imóvel", e resume quem demonstrou interesse.

## Prompt

Use o fostermcp para procurar no WhatsApp as mensagens sobre [assunto] nos últimos [60] dias, com o search_whatsapp_fts.
Liste por conversa: quem falou, a data e um trecho curto. Depois, resuma quem demonstrou interesse e o que ficou pendente. Lembre que a busca cobre só as conversas escolhidas no FosterMCP.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o WhatsApp habilitado.

## Como usar

<!-- incluir: usar-prompt -->
