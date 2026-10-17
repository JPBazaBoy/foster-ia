---
name: apresentacao-cliente
description: Monta uma apresentação de revisão de carteira para um cliente, com dados do FosterMCP (Atlas e, se houver, WhatsApp e e-mail). Use quando o assessor pedir uma apresentação, slides ou material de reunião sobre um cliente.
---

# Apresentação para cliente

Rascunho em teste. Use as ferramentas do servidor `fostermcp` e responda em português do Brasil.

## Antes de montar

1. Chame `get_workspace_overview` e `get_sync_status`. Anote de quando são os dados do Atlas.
2. Ache o cliente com `search_clients`. Se houver mais de um com o mesmo nome, pergunte qual é.
3. Busque `get_client_profile`, `get_client_portfolio` (siga a paginação) e `get_client_maturities` com `period: "30d"`.
4. Se o WhatsApp ou o e-mail estiverem habilitados e o assessor quiser, resuma os últimos contatos (`search_people` e `get_whatsapp_person_messages`; `search_foster_emails`).

## Estrutura dos slides

1. **Capa:** "Revisão de carteira", código ou nome do cliente, data da reunião.
2. **Resumo:** patrimônio total e as três principais mensagens da reunião.
3. **Carteira por classe:** gráfico de rosca e tabela com valor e percentual de cada classe.
4. **Vencimentos e eventos dos próximos 30 dias:** tabela com data, ativo e valor.
5. **Pontos de atenção:** concentração, liquidez, recursos a vencer sem destino.
6. **Próximos passos:** sugestões para conversar, marcadas como sugestões.
7. **Fontes:** fonte e data de cada dado, e a frase "Material preliminar, revise antes de apresentar".

## Visual

Fundo branco, títulos em azul-marinho `#182949`, destaques em dourado `#D59A3B`, fonte Manrope ou Arial. Um assunto por slide, números grandes e pouco texto.

## Regras

- Gere um arquivo .pptx quando conseguir criar arquivos. Se não conseguir, entregue o texto de cada slide.
- Não invente números. Valores em reais e em dólares ficam separados.
- Não inclua dados pessoais de contato (e-mail, telefone, nascimento).
- Não recomende produtos sem o assessor pedir; lembre de conferir o perfil de investidor.
- Material para cliente: o assessor revisa todos os números e segue as regras de compliance antes de apresentar ou enviar.
