---
titulo: Resumo semanal de vencimentos
resumo: Skill que, toda segunda, lista o que vence na semana e sugere quem contatar primeiro.
situacao: rascunho
plataformas: [claude-desktop, chatgpt-codex]
fontes: [atlas]
atualizado: 2026-10-16
destaque: true
ordem: 3
requer: [apps/fostermcp]
palavras: [vencimentos, semana, segunda-feira, resumo, agenda]
---

## O que faz

Toda segunda-feira, monta a lista do que vence na semana na sua base, agrupada por dia, e sugere a ordem de contato: primeiro os maiores valores e quem não falou com você há mais tempo.

## Exemplo de resultado

```resultado
tipo: memo
titulo: Vencimentos · semana 42
linhas:
  - [18/10 · CDB, R$ 310 mil]
  - [19/10 · LCA, R$ 520 mil]
  - [20/10 · Debênture, R$ 400 mil]
  - [Total, "R$ 1,23 mi"]
```

## Onde funciona

Vai depender das tarefas agendadas do assistente, para rodar sozinha toda segunda. Enquanto isso, use o prompt [Vencimentos da semana](/prompts/vencimentos-da-semana/).
