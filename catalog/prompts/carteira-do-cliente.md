---
titulo: Carteira do cliente
resumo: Mostra a carteira de um cliente por classe de ativo, os maiores ativos e os pontos de atenção.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 5
requer: [apps/fostermcp]
ferramentas: [search_clients, get_client_portfolio]
palavras: [carteira, posição, classe de ativo, concentração, liquidez]
---

## O que faz

Monta a carteira completa de um cliente, por classe de ativo e com os maiores ativos, e aponta concentração, liquidez e vencimentos próximos.

## Prompt

Use o fostermcp para mostrar a carteira do cliente [nome ou código do cliente]. Encontre o cliente com search_clients (se houver mais de um com esse nome, pergunte qual é) e use o get_client_portfolio, seguindo a paginação até o fim.
Monte uma tabela por classe de ativo com o valor e o percentual do total e, depois, os 10 maiores ativos. Destaque ativos com mais de [20]% da carteira, a liquidez e os vencimentos próximos. Informe a data dos dados e não recomende produtos.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado.

## Como usar

<!-- incluir: usar-prompt -->
