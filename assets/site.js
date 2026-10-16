// Comportamentos da página. Tudo funciona sem este arquivo; ele só acrescenta abas, filtros, cópia e tema.
// Preferências (tema, assistente, aba) ficam neste navegador; nada é enviado a lugar nenhum.
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

function initTheme() {
  const button = document.querySelector('[data-tema]');
  if (!button) return;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const current = () => document.documentElement.dataset.theme || (dark.matches ? 'dark' : 'light');
  const label = () => {
    const isDark = current() === 'dark';
    button.setAttribute('aria-label', isDark ? 'Usar tema claro' : 'Usar tema escuro');
    button.dataset.atual = isDark ? 'escuro' : 'claro';
  };
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    write('central.tema', next === 'dark' ? 'escuro' : 'claro');
    label();
  });
  dark.addEventListener('change', label);
  button.hidden = false;
  label();
}

// Abas: o mesmo assistente (ou sistema) fica escolhido em todas as abas da página e nas próximas visitas.
const PREFERENCE = {plataforma: 'central.plataforma', sistema: 'central.sistema'};
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
  write(PREFERENCE[group], key);
}
function initTabs() {
  const isMac = /Mac/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
  const initial = {plataforma: read(PREFERENCE.plataforma), sistema: read(PREFERENCE.sistema) || (isMac ? 'mac' : 'windows')};
  for (const box of document.querySelectorAll('.abas')) {
    const list = box.querySelector('[role="tablist"]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    list.hidden = false;
    box.classList.add('abas-ativas');
    list.addEventListener('click', event => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) chooseTab(box.dataset.grupo, tab.dataset.aba, box);
    });
    list.addEventListener('keydown', event => {
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
    const label = button.querySelector('span') || button;
    const original = label.textContent;
    if (await copyText(text)) {
      label.textContent = 'Copiado!';
      button.classList.add('copiado');
      announce('Copiado para a área de transferência.');
    } else {
      if (source.tagName !== 'TEMPLATE') getSelection().selectAllChildren(source);
      label.textContent = 'Selecione e copie';
      announce('Não foi possível copiar sozinho. O texto está selecionado: use Ctrl+C ou Cmd+C.');
    }
    setTimeout(() => { label.textContent = original; button.classList.remove('copiado'); }, 2500);
  });
}

function initCatalog() {
  const form = document.querySelector('[data-filtros]');
  if (!form) return;
  const cards = [...document.querySelectorAll('.pagina-catalogo .cartao')];
  const count = document.querySelector('[data-contagem]');
  const empty = document.querySelector('[data-vazio]');
  const params = new URLSearchParams(location.search);
  form.elements.q.value = params.get('q') || '';
  for (const name of ['tipo', 'plataforma']) {
    const option = [...form.elements[name]].find(input => input.value === params.get(name));
    if (option) option.checked = true;
  }
  const apply = () => {
    const words = normalize(form.elements.q.value).split(' ').filter(Boolean);
    const type = form.elements.tipo.value, platform = form.elements.plataforma.value;
    let shown = 0;
    for (const card of cards) {
      const ok = (!type || card.dataset.tipo === type) && (!platform || card.dataset.plataformas.split(' ').includes(platform)) &&
        words.every(word => card.dataset.busca.includes(word));
      card.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = shown === 1 ? '1 item' : `${shown} itens`;
    empty.hidden = shown > 0;
    const next = new URLSearchParams();
    if (form.elements.q.value.trim()) next.set('q', form.elements.q.value.trim());
    if (type) next.set('tipo', type);
    if (platform) next.set('plataforma', platform);
    const query = next.toString();
    history.replaceState(null, '', query ? `?${query}` : location.pathname);
  };
  form.addEventListener('input', apply);
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  document.querySelector('[data-limpar]')?.addEventListener('click', () => { form.reset(); apply(); form.elements.q.focus(); });
  form.hidden = false;
  apply();
}

// Início: "Uso o Claude" ou "Uso o ChatGPT" mostra o caminho certo e já escolhe as abas desse assistente.
function initChoice() {
  const box = document.querySelector('[data-escolha]');
  if (!box) return;
  const panels = document.querySelectorAll('[data-para-assistente]');
  const show = (who, remember) => {
    for (const button of box.querySelectorAll('[data-assistente]')) button.setAttribute('aria-pressed', String(button.dataset.assistente === who));
    for (const panel of panels) panel.hidden = Boolean(who) && panel.dataset.paraAssistente !== who;
    if (remember) {
      write('central.assistente', who);
      write(PREFERENCE.plataforma, who === 'claude' ? 'claude-desktop' : 'chatgpt-codex');
    }
  };
  box.addEventListener('click', event => {
    const button = event.target.closest('[data-assistente]');
    if (button) show(button.dataset.assistente, true);
  });
  box.hidden = false;
  const saved = read('central.assistente');
  show(saved === 'claude' || saved === 'chatgpt' ? saved : null, false);
}

function initSummary() {
  const summary = document.querySelector('[data-sumario]');
  if (summary && matchMedia('(min-width: 1000px)').matches) summary.open = true;
}

function initMenu() {
  const menu = document.querySelector('.menu-celular');
  if (!menu) return;
  menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
}

initTheme();
initTabs();
initCopy();
initCatalog();
initChoice();
initSummary();
initMenu();
