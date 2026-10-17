---
titulo: FosterMCP no OpenClaw
resumo: Modelo para usar o FosterMCP no OpenClaw, um agente pessoal que roda no seu computador. Exige terminal e arquivos de configuração.
situacao: em-teste
avancado: true
plataformas: [openclaw]
fontes: [atlas, whatsapp, email]
atualizado: 2026-10-16
versao: "0.1"
ordem: 2
requer: [apps/fostermcp]
palavras: [openclaw, agente autônomo, agente pessoal, avançado, mcp, terminal]
---

## Para que serve

O OpenClaw é um agente de código aberto que roda no seu computador e executa tarefas sozinho. Com o FosterMCP, ele passa a consultar o Atlas, o WhatsApp e o e-mail para responder e preparar materiais. Este modelo traz a configuração e as instruções de segurança.

> [!CAUTION]
> Um agente autônomo com acesso aos dados dos clientes exige cuidado. Não ligue o OpenClaw a canais de mensagem (WhatsApp, Telegram e outros) enquanto o FosterMCP estiver conectado: qualquer mensagem recebida poderia pedir dados dos seus clientes. Use só na conversa local, no seu computador.

## O que precisa

```requisitos
- texto: OpenClaw instalado e funcionando
  nota: Siga a documentação oficial em docs.openclaw.ai
- texto: FosterMCP instalado, com as fontes conectadas
- texto: Experiência com terminal e arquivos JSON
  nota: Se não tiver, peça ajuda antes
- texto: E-mail só em leitura no FosterMCP
  nota: Recomendado para agentes autônomos
  opcional: true
```

## Passo a passo

### OpenClaw

1. **Copie a configuração do FosterMCP.** No FosterMCP, abra **Seus agentes**, escolha **Outro agente**, clique em **Gerar configuração** e depois em **Copiar configuração**.
2. **Abra o arquivo do OpenClaw.** Abra `~/.openclaw/openclaw.json` (no Windows, `C:\Users\<seu usuário>\.openclaw\openclaw.json`).
3. **Acrescente o servidor.** Dentro de `"mcp"` › `"servers"`, crie a entrada `"fostermcp"` com o `command`, os `args` e o `env` do trecho copiado, sem apagar o que já existe:

   ```json
   {
     "mcp": {
       "servers": {
         "fostermcp": {
           "command": "<command do trecho copiado>",
           "args": ["<args do trecho copiado>"],
           "env": {"FOSTERMCP_HOME": "<pasta da sua base>"}
         }
       }
     }
   }
   ```

4. **Confira.** Reinicie o OpenClaw e rode `openclaw mcp list`: o **fostermcp** deve aparecer.
5. **Coloque as instruções.** Clique em **Copiar as instruções** (ou **Baixar AGENTS.md**) e cole no arquivo de instruções do workspace do OpenClaw.

> [!NOTE]
> Em teste: o passo a passo segue a documentação do OpenClaw, mas ainda não foi validado com o FosterMCP no piloto. Os nomes de arquivos e comandos podem mudar entre versões.
