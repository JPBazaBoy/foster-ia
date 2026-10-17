// Comportamentos da página. Tudo funciona sem este arquivo; ele só acrescenta abas, filtros, cópia e atalhos.
// A aba escolhida fica neste navegador; nada é enviado a lugar nenhum.
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* sem armazenamento: só não lembra */ } };
const normalize = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

let announcer;
function announce(message) {
  if (!announcer) {
    announcer = document.createElement('p');
    announcer.className = 'visualmente-oculto';
    announcer.setAttribute('role', 'status');
    document.body.append(announcer);
  }
  announcer.textContent = '';
  setTimeout(() => { announcer.textContent = message; }, 50);
}

// Abas: o mesmo assistente (ou sistema) fica escolhido em todas as abas da página e nas próximas visitas.
const REMEMBER = {plataforma: 'central.plataforma', sistema: 'central.sistema'};
function selectTab(box, key) {
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const target = tabs.find(tab => tab.dataset.aba === key) || tabs[0];
  for (const tab of tabs) {
    const on = tab === target;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  }
  for (const panel of box.querySelectorAll('[role="tabpanel"]')) panel.hidden = panel.dataset.aba !== target.dataset.aba;
}
function chooseTab(group, key, origin) {
  for (const box of document.querySelectorAll(`.abas[data-grupo="${group}"]`))
    if (box === origin || box.querySelector(`[role="tab"][data-aba="${key}"]`)) selectTab(box, key);
  if (REMEMBER[group]) write(REMEMBER[group], key);
}
function initTabs() {
  const isMac = /Mac/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
  const initial = {plataforma: read(REMEMBER.plataforma), sistema: read(REMEMBER.sistema) || (isMac ? 'mac' : 'windows')};
  for (const box of document.querySelectorAll('.abas')) {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    box.querySelector('.abas-barra').hidden = false;
    box.classList.add('ativas');
    box.addEventListener('click', event => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) chooseTab(box.dataset.grupo, tab.dataset.aba, box);
    });
    box.addEventListener('keydown', event => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      const next = {ArrowRight: tabs[(index + 1) % tabs.length], ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1]}[event.key];
      if (!next) return;
      event.preventDefault();
      chooseTab(box.dataset.grupo, next.dataset.aba, box);
      next.focus();
    });
    selectTab(box, initial[box.dataset.grupo]);
  }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* tenta o modo antigo */ }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.className = 'copia-temporaria';
  document.body.append(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  area.remove();
  return ok;
}
function initCopy() {
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copiar]');
    if (!button) return;
    const source = document.getElementById(button.dataset.copiar);
    if (!source) return;
    const text = (source.tagName === 'TEMPLATE' ? source.content.textContent : source.textContent).trim();
    const original = button.textContent;
    if (await copyText(text)) {
      button.textContent = 'Copiado';
      button.classList.add('copiado');
      announce('Copiado para a área de transferência.');
    } else {
      if (source.tagName !== 'TEMPLATE') getSelection().selectAllChildren(source);
      button.textContent = 'Selecione e copie';
      announce('Não foi possível copiar sozinho. O texto está selecionado: use Ctrl+C ou Cmd+C.');
    }
    setTimeout(() => { button.textContent = original; button.classList.remove('copiado'); }, 2500);
  });
}

// Lista filtrável: texto livre e um grupo de opções (plataforma, fonte, assunto ou área).
const MATCH = {
  plataformas: (item, value) => item.dataset.plataformas.split(' ').includes(value),
  fontes: (item, value) => item.dataset.fontes.split(' ').includes(value),
  assunto: (item, value) => item.dataset.assunto === value,
  area: (item, value) => item.dataset.area === value,
};
function initFilters() {
  const form = document.querySelector('[data-filtros]');
  if (!form) return;
  const items = [...document.querySelectorAll('[data-lista] [data-item], [data-lista][data-item]')];
  const count = document.querySelector('[data-contagem]');
  const empty = document.querySelector('[data-vazio]');
  const group = [...form.querySelectorAll('input[type="radio"]')][0]?.name;
  const params = new URLSearchParams(location.search);
  form.elements.q.value = params.get('q') || '';
  if (group) {
    const option = [...form.elements[group]].find(input => input.value === params.get(group));
    if (option) option.checked = true;
  }
  const apply = () => {
    const words = normalize(form.elements.q.value).split(' ').filter(Boolean);
    const choice = group ? form.elements[group].value : '';
    let shown = 0;
    for (const item of items) {
      const ok = (!choice || MATCH[group](item, choice)) && words.every(word => item.dataset.busca.includes(word));
      item.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = shown === 1 ? '1 item' : `${shown} itens`;
    empty.hidden = shown > 0;
    const next = new URLSearchParams();
    if (form.elements.q.value.trim()) next.set('q', form.elements.q.value.trim());
    if (choice) next.set(group, choice);
    const query = next.toString();
    history.replaceState(null, '', query ? `?${query}` : location.pathname);
  };
  form.addEventListener('input', apply);
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  document.querySelector('[data-limpar]')?.addEventListener('click', () => { form.reset(); apply(); form.elements.q.focus(); });
  form.hidden = false;
  apply();
}

// "/" leva à busca do cabeçalho, como indica o atalho ao lado dela.
function initShortcut() {
  const input = document.querySelector('[data-atalho]');
  if (!input) return;
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!input.offsetParent) return;
    event.preventDefault();
    input.focus();
  });
}

// "Nesta página": marca a seção que está na tela.
function initSummary() {
  const links = [...document.querySelectorAll('.sumario a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map(link => [decodeURIComponent(link.hash.slice(1)), link]));
  const visible = new Set();
  const mark = () => {
    const first = [...byId.keys()].find(id => visible.has(id));
    if (!first) return;
    for (const [id, link] of byId) link.setAttribute('aria-current', String(id === first));
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const id = entry.target.querySelector('h2')?.id;
      if (entry.isIntersecting) visible.add(id); else visible.delete(id);
    }
    mark();
  }, {rootMargin: '0px 0px -55% 0px'});
  for (const id of byId.keys()) {
    const section = document.getElementById(id)?.closest('section');
    if (section) observer.observe(section);
  }
}

// Selo e aviso "Pode estar desatualizado": aparecem sozinhos depois da data de revisar_ate.
function initReview() {
  const today = new Date().toLocaleDateString('en-CA');
  for (const element of document.querySelectorAll('[data-revisar-ate][hidden]')) if (element.dataset.revisarAte < today) element.hidden = false;
}

function initMenu() {
  const menu = document.querySelector('.menu-celular');
  if (!menu) return;
  menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
}

initTabs();
initCopy();
initFilters();
initShortcut();
initSummary();
initReview();
initMenu();
