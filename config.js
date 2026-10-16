// Configuração única da central. Nome, marca, endereços e contato ficam só aqui.
// PROVISÓRIO: nome, marca, contato, aviso institucional e endereços aguardam a decisão do responsável.
export default {
  // Nome e marca. A sigla aparece no quadradinho do logo; nada de logotipo de terceiros.
  nome: 'Central de IA',
  descricao: 'Apps, conectores, skills, agentes, prompts e tutoriais de IA para o dia a dia do assessor de investimentos.',
  marca: {
    sigla: 'IA',
    cor: '#4f46e5', // cor principal no tema claro
    corTemaEscuro: '#8b93ff', // a mesma cor, mais clara, para o tema escuro
  },

  // Repositório público (dono/nome) com o site e os instaladores, e o endereço do GitHub Pages.
  // O caminho do endereço (/foster-ia/) vira a base de todos os links do site.
  repositorio: 'JPBazaBoy/foster-ia',
  endereco: 'https://jpbazaboy.github.io/foster-ia/',

  // false pede aos buscadores (Google etc.) que não listem o site. O site continua aberto a quem tiver o link.
  indexar: false,

  // Para onde o assessor manda dúvidas e o diagnóstico. link pode ser https://… ou mailto:…, ou ficar vazio.
  contato: {
    texto: 'Fale com o responsável pela Central de IA (contato a definir).',
    link: '',
  },

  // Texto institucional do rodapé e da Ajuda (texto provisório, a confirmar).
  aviso: 'A Central de IA é uma iniciativa interna, feita por assessores para assessores, para facilitar o uso de IA no dia a dia. As ferramentas daqui não substituem os sistemas, as políticas e as orientações de compliance da empresa. (Texto provisório, a confirmar.)',

  // FosterMCP: nomes fixos dos instaladores no GitHub Releases, caminho do version.json lido pelo app
  // (nunca mude depois de publicado: as instalações consultam este endereço) e página de download.
  fostermcp: {
    arquivos: {windows: 'FosterMCP-Windows.exe', mac: 'FosterMCP-Mac.dmg'},
    feed: 'fostermcp/version.json',
    pagina: 'apps/fostermcp/',
  },
};
