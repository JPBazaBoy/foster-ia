---
# Página da skill no site. A pasta inteira (menos este arquivo) vira o .zip para download.
titulo: Nome da skill
resumo: Skill que [faz o quê]. A primeira frase diz o que ela é.
situacao: em-teste # rascunho (fora do site), em-breve, em-teste, disponivel, em-revisao, defasado ou arquivado
plataformas: [claude-desktop, chatgpt-codex, claude-code, chatgpt]
fontes: [atlas]
atualizado: 2026-10-16
# revisar_ate: 2027-04-16 (opcional: depois desta data o item mostra "Pode estar desatualizado")
# substituido_por: tipo/nome (opcional, só com defasado ou arquivado: o item que vale no lugar)
versao: "0.1"
palavras: [palavras, para, a busca]
---

## O que faz

O que muda nas respostas com a skill instalada.

## Exemplo de resultado

```resultado
tipo: memo
titulo: Título do resultado
linhas:
  - [Rótulo, Valor fictício]
  - [Outro rótulo, Outro valor]
```

## Onde funciona

Em quais assistentes e planos ela funciona.

## Instalação

O arquivo da skill se chama `{{item.zipNome}}` e a pasta dentro dele, `{{item.pasta}}`.

<!-- incluir: instalar-skill -->

## Como usar

```prompt
Pedido de exemplo para usar a skill.
```

## Problemas comuns

### Um problema

O que fazer.
