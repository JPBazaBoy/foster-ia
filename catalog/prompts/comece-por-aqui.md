---
titulo: Comece por aqui
resumo: Mostra o que o FosterMCP tem na sua instalação, se os dados estão atualizados e o que dá para perguntar.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 1
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status]
palavras: [primeira pergunta, teste, fontes, atualizado]
---

## O que faz

É a primeira pergunta para fazer depois de conectar. O assistente lista as fontes habilitadas, diz de quando são os dados e sugere perguntas que fazem sentido para a sua instalação. Não mostra dados de clientes.

## Prompt

Use o fostermcp. Comece pelo get_workspace_overview e me diga, em linguagem simples:
1. Quais fontes estão habilitadas nesta instalação (Atlas, WhatsApp, e-mail).
2. De quando são os dados de cada uma (para o Atlas, use o get_sync_status) e se alguma precisa ser atualizada.
3. Cinco perguntas que eu posso fazer agora, de acordo com essas fontes.
Não mostre dados de clientes nesta resposta.

## Requisitos

- [FosterMCP](/apps/fostermcp/) instalado e conectado ao assistente.

## Como usar

<!-- incluir: usar-prompt -->
