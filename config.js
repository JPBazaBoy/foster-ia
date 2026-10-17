// Configuração única da central: nome, assinatura, cores, endereços, contato e avisos ficam só aqui.
// PROVISÓRIO: assinatura, contato, aviso institucional e endereços aguardam a decisão do responsável.
export default {
  // Nome do produto, em dourado no cabeçalho e no título das páginas.
  nome: 'Central de IA',
  descricao: 'Aplicativos, skills, modelos de agentes, prompts e tutoriais de IA para o dia a dia do assessor.',

  // Assinatura do cabeçalho e do rodapé, em texto (sem logotipo oficial).
  assinatura: {nome: 'FOSTER', complemento: 'PARTNERS'},

  // Cores da Foster (CSS do fosterinvestimentos.com.br).
  cores: {
    noite: '#171E2D', // cabeçalho
    marinho: '#182949', // texto e botões escuros
    azul: '#3B4E73',
    creme: '#FEFBF4',
    dourado: '#FCBB5B', // botão de download
    douradoDetalhe: '#D59A3B', // linhas, marcadores e aba ativa
    douradoTexto: '#8A6526', // texto pequeno em dourado
    fundo: '#F5F6F8', // área de leitura
    borda: '#E3E7ED',
  },

  // Repositório público (dono/nome) com o site e os instaladores, e o endereço do GitHub Pages.
  // O caminho do endereço (/foster-ia/) vira a base de todos os links do site.
  repositorio: 'JPBazaBoy/foster-ia',
  endereco: 'https://jpbazaboy.github.io/foster-ia/',

  // Modo prévia: faixa "Prévia em teste" em todas as páginas, pedido para os buscadores não listarem o site
  // e downloads do FosterMCP desligados. Troque para false no lançamento, com a aprovação do responsável.
  previa: true,

  // Fora da prévia: false pede aos buscadores (Google etc.) que não listem o site. Quem tem o link acessa normalmente.
  indexar: false,

  // Para quem o assessor manda o diagnóstico. Aparece em frases como "envie para o responsável pela central".
  // link pode ser https://…, mailto:… ou ficar vazio.
  contato: {nome: 'o responsável pela central', link: ''},

  // Aviso curto do rodapé e da Ajuda (texto provisório, a confirmar).
  aviso: 'Iniciativa interna de assessores; não substitui os sistemas oficiais nem as orientações de compliance. A integração com o WhatsApp não é oficial.',

  // FosterMCP: nomes fixos dos instaladores no GitHub Releases, caminho do version.json dentro de public/
  // (o app lê pelo endereço raw.githubusercontent.com, que não muda com domínio; nunca mude depois de publicado)
  // e página do app no site.
  fostermcp: {
    arquivos: {windows: 'FosterMCP-Windows.exe', mac: 'FosterMCP-Mac.dmg'},
    feed: 'fostermcp/version.json',
    pagina: 'apps/fostermcp/',
  },
};
