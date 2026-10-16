---
titulo: Aportes e resgates do mês
resumo: Mostra quem aportou e quem resgatou no mês, para você saber para quem ligar primeiro.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 7
requer: [apps/fostermcp]
ferramentas: [get_client_flows]
palavras: [captação, aporte, resgate, mês, meus números]
---

## O que faz

Separa os aportes e os resgates do mês, do maior para o menor, e destaca os maiores resgates.

## Prompt

Use o fostermcp para listar os clientes com aportes e resgates no [mês atual ou mês anterior], com o get_client_flows (direction both).
Separe aportes e resgates, do maior para o menor, com o valor líquido de cada cliente. Destaque os 5 maiores resgates para eu ligar primeiro e informe a data dos dados.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado e atualizado no mês.

## Como usar

<!-- incluir: usar-prompt -->
