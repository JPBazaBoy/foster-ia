---
titulo: Vencimentos da semana
resumo: Lista os vencimentos e eventos de caixa da semana, por dia e por cliente, com os maiores valores em destaque.
plataformas: [claude-desktop, chatgpt-codex, claude-code, cursor]
atualizado: 2026-10-16
status: publicado
ordem: 3
requer: [apps/fostermcp]
ferramentas: [get_sync_status, get_client_maturities, get_monthly_maturities]
palavras: [vencimentos, cupons, eventos de caixa, semana, agenda]
---

## O que faz

Mostra o que vence na semana na sua base: agrupa por dia e por cliente, soma por cliente e destaca os maiores valores, para você planejar as ligações.

## Prompt

Use o fostermcp para listar os vencimentos e eventos de caixa da [semana atual ou próxima semana] na minha base. Use o get_client_maturities com period semana_atual (ou proxima_semana) e siga a paginação até o fim.
Agrupe por dia e, dentro de cada dia, por cliente, com o ativo e o valor. No fim, mostre os 5 clientes com maior valor a vencer.
Antes de tudo, diga de quando são os dados do Atlas (get_sync_status) e avise se estiverem desatualizados.

## Requisitos

- [FosterMCP](/apps/fostermcp/) com o Atlas habilitado e atualizado.

## Como usar

<!-- incluir: usar-prompt -->
