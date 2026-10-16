---
titulo: Follow-up por e-mail
resumo: Escreve o e-mail de follow-up de uma reunião e, depois do seu "pode criar", deixa como rascunho no Outlook.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 8
requer: [apps/fostermcp]
ferramentas: [search_foster_emails, create_foster_email_draft]
palavras: [e-mail, rascunho, follow-up, outlook, reunião]
---

## O que faz

Escreve o e-mail de follow-up com o que foi combinado e mostra o texto para você aprovar. Só depois do seu "pode criar", deixa o e-mail como **rascunho** no Outlook. Quem envia é você.

## Prompt

Use o fostermcp para preparar o e-mail de follow-up da minha reunião de hoje com [nome do cliente].
Pontos combinados: [escreva os pontos principais].
1. Escreva o e-mail em tom cordial e objetivo e me mostre o texto antes de criar qualquer coisa.
2. Só depois que eu disser "pode criar", crie o rascunho com create_foster_email_draft para [e-mail do cliente].
Não envie nada: eu reviso e envio pelo Outlook.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o e-mail conectado e a opção **Permitir que o agente crie rascunhos e eventos na agenda** marcada.

## Como usar

<!-- incluir: usar-prompt -->
