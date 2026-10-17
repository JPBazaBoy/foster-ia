---
titulo: Apresentação para cliente
resumo: Skill que gera uma apresentação no padrão Foster com a carteira, os vencimentos e os próximos passos do cliente.
situacao: rascunho
plataformas: [claude-desktop, chatgpt-codex, claude-code]
fontes: [atlas, whatsapp, email]
atualizado: 2026-10-16
versao: "0.1"
destaque: true
ordem: 1
requer: [apps/fostermcp]
ferramentas: [get_workspace_overview, get_sync_status, search_clients, get_client_profile, get_client_portfolio, get_client_maturities]
palavras: [apresentação, slides, powerpoint, pptx, revisão de carteira, reunião]
---

## O que faz

Gera uma apresentação de revisão de carteira com os dados do FosterMCP: capa, resumo, carteira por classe, vencimentos dos próximos 30 dias, pontos de atenção, próximos passos e fontes. No Claude Desktop, sai um arquivo .pptx para abrir no PowerPoint.

## Exemplo de resultado

```resultado
tipo: slide
titulo: REVISÃO DE CARTEIRA · CLIENTE 900001
```

![Apresentação gerada pela skill para o cliente fictício 900001](/imagens/skills/apresentacao-exemplo.png)

## Onde funciona

No Claude Desktop, com a execução de código ligada (é ela que cria o arquivo), no Claude Code e na aba Codex do ChatGPT. Depende do FosterMCP com o Atlas conectado.

## Instalação

O arquivo da skill se chama `{{item.zipNome}}` e a pasta dentro dele, `{{item.pasta}}`.

<!-- incluir: instalar-skill -->

## Como usar

```prompt
Monte a apresentação de revisão de carteira do cliente [código] para a reunião de [data].
```

Revise todos os números antes de apresentar. A apresentação é um ponto de partida, não um material aprovado pelo compliance.

## Problemas comuns

### O assistente não cria o arquivo

No Claude Desktop, ligue **Execução de código e criação de arquivos** em **Configurações › Capacidades**. Sem ela, a skill entrega o texto de cada slide.

### Os números não batem com o Atlas

Os dados podem estar desatualizados. No FosterMCP, clique em **Atualizar Atlas** e peça a apresentação de novo.
