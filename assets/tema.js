// Aplica o tema escolhido antes de desenhar a página, para não piscar. Sem escolha, segue o sistema.
try {
  const tema = localStorage.getItem('central.tema');
  if (tema === 'claro' || tema === 'escuro') document.documentElement.dataset.theme = tema === 'claro' ? 'light' : 'dark';
} catch { /* armazenamento bloqueado: segue o sistema */ }
document.documentElement.classList.add('js');
