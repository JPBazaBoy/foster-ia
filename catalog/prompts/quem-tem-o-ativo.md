---
titulo: Quem tem um ativo
resumo: Lista os clientes da sua base que têm um ativo, com o valor de cada um e o total.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 6
requer: [apps/fostermcp]
ferramentas: [get_asset_exposure]
palavras: [ativo, exposição, fundo, título, clientes]
---

## O que faz

Útil quando sai uma notícia sobre um ativo ou um fundo: em segundos você sabe quais clientes têm o ativo e quanto.

## Prompt

Use o fostermcp para listar os clientes da minha base que têm [nome do ativo] (get_asset_exposure).
Mostre uma tabela com o cliente e o valor, do maior para o menor, e o total no fim. Se o nome do ativo combinar com mais de um ativo, mostre os ativos encontrados separados. Informe a data dos dados do Atlas.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado.

## Como usar

<!-- incluir: usar-prompt -->
