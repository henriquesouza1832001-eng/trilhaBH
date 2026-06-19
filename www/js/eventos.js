const EVENTO_CORES = {
  show:       { bg: '#1B3A5E', accent: '#4A90D9' },
  samba:      { bg: '#1A3D2B', accent: '#2D6E4E' },
  happy_hour: { bg: '#3D1F0F', accent: '#E8650A' },
  degustacao: { bg: '#3D2800', accent: '#F5A623' },
  festival:   { bg: '#3D0F0F', accent: '#C0392B' },
  outro:      { bg: '#2A2520', accent: '#9B9B9B' },
};

const EVENTO_SUBFILTROS = [
  { id: 'todos',      label: 'Todos',              icon: '<i class="ph ph-calendar"></i>' },
  { id: 'show',       label: 'Música ao Vivo',     icon: '<i class="ph ph-guitar"></i>' },
  { id: 'samba',      label: 'Samba',              icon: '<i class="ph ph-music-notes"></i>' },
  { id: 'happy_hour', label: 'Happy Hour',         icon: '<i class="ph-fill ph-beer-bottle"></i>' },
  { id: 'degustacao', label: 'Degustação',         icon: '<i class="ph ph-wine"></i>' },
  { id: 'festival',   label: 'Festival',           icon: '<i class="ph ph-confetti"></i>' },
  { id: 'pet',        label: 'Pet Friendly',       icon: '<i class="ph ph-paw-print"></i>' },
];

let _eventosFiltroAtivo = 'todos';
let _eventosBusca = '';
let _eventosCache = null;
let _eventosCacheTs = 0;
const EVENTOS_CACHE_TTL = 2 * 60 * 1000;

window.carregarEventos = async function() {
  const agora = Date.now();
  if (_eventosCache && agora - _eventosCacheTs < EVENTOS_CACHE_TTL) {
    return _eventosCache;
  }
  const snap = await db.collection('eventos')
    .where('ativo', '==', true)
    .orderBy('data', 'asc')
    .limit(50)
    .get();
  const todos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(ev => ev.data?.seconds * 1000 >= Date.now());

  // ordenar por distância se tiver localização
  if (window._posUsuario) {
    todos.sort((a, b) => {
      const dA = a.lat && a.lng
        ? haversine(window._posUsuario.lat, window._posUsuario.lng, a.lat, a.lng)
        : 999;
      const dB = b.lat && b.lng
        ? haversine(window._posUsuario.lat, window._posUsuario.lng, b.lat, b.lng)
        : 999;
      return dA - dB;
    });
  }

  _eventosCache = todos;
  _eventosCacheTs = agora;
  return todos;
};

window.renderCardEvento = function(ev) {
  const cores = EVENTO_CORES[ev.tipo] || EVENTO_CORES.outro;
  const cfg = TIPO_EVENTO[ev.tipo] || TIPO_EVENTO.outro;
  const data = new Date(ev.data?.seconds * 1000);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const interessado = ev.interessados?.includes(usuarioAtual?.uid);

  let distHtml = '';
  if (window._posUsuario && ev.lat && ev.lng) {
    const dist = haversine(window._posUsuario.lat, window._posUsuario.lng, ev.lat, ev.lng);
    const distStr = dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km';
    distHtml = `<span class="evento-distancia"><i class="ph ph-navigation-arrow"></i> ${distStr}</span>`;
  }

  const vibesHtml = [
    ev.petFriendly ? `<span class="evento-vibe-tag"><i class="ph ph-paw-print"></i> Pet Friendly</span>` : '',
    ev.tipo === 'show' || ev.tipo === 'samba' ? `<span class="evento-vibe-tag"><i class="ph ph-music-notes"></i> Música ao Vivo</span>` : '',
  ].filter(Boolean).join('');

  const linkHtml = ev.linkExterno ? `
    <a href="${ev.linkExterno}" target="_blank" class="evento-link-externo" onclick="event.stopPropagation()">
      <i class="ph ph-arrow-square-out"></i> Ver mais
    </a>` : '';

  const fotoHtml = ev.fotoUrl ? `
    <div class="evento-card-foto-wrap">
      <img src="${sanitizeHtml(ev.fotoUrl)}" alt="${sanitizeHtml(ev.titulo)}"/>
      <div class="evento-card-foto-overlay"></div>
    </div>` : '';

  return `
  <div class="evento-card" style="
    background: linear-gradient(135deg, ${sanitizeHtml(cores.bg)} 0%, ${sanitizeHtml(cores.bg)}CC 100%);
    border: 1px solid ${sanitizeHtml(cores.accent)}33;
  " onclick="window.abrirBottomSheet('${ev.barId}')">
    ${fotoHtml}
    <div class="evento-card-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="
          display:inline-flex;align-items:center;gap:5px;
          background:${sanitizeHtml(cores.accent)}22;color:${sanitizeHtml(cores.accent)};
          font-size:0.68rem;font-weight:800;padding:4px 10px;
          border-radius:20px;border:1px solid ${sanitizeHtml(cores.accent)}44;
          text-transform:uppercase;letter-spacing:0.5px
        ">${cfg.icon} ${cfg.label}</div>
        <div style="
          background:rgba(0,0,0,0.3);color:white;
          font-size:0.72rem;font-weight:800;
          padding:4px 10px;border-radius:20px;
          font-family:'Bebas Neue',cursive;letter-spacing:1px
        ">${sanitizeHtml(dia)} · ${sanitizeHtml(ev.hora)}</div>
      </div>

      <div style="
        font-family:'Bebas Neue',cursive;font-size:1.3rem;
        color:white;letter-spacing:0.5px;line-height:1.1;margin-bottom:4px
      ">${sanitizeHtml(ev.titulo)}</div>

      <div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-bottom:4px">
        <i class="ph ph-beer-bottle"></i> ${sanitizeHtml(ev.barNome)}
      </div>

      ${sanitizeHtml(ev.endereco) ? `<div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-bottom:8px">
        <i class="ph ph-map-pin"></i> ${sanitizeHtml(ev.endereco)}
      </div>` : ''}

      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        ${distHtml}
        ${vibesHtml}
      </div>

      ${sanitizeHtml(ev.descricao) ? `<div style="font-size:0.8rem;color:rgba(255,255,255,0.75);
        line-height:1.5;margin-bottom:12px;font-style:italic">${sanitizeHtml(ev.descricao)}</div>` : ''}

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);font-weight:700">
            <i class="ph ph-bell"></i> ${ev.interessados?.length || 0} interessados
          </div>
          ${linkHtml}
        </div>
        <button
          class="btn-interesse ${interessado ? 'marcado' : ''}"
          onclick="event.stopPropagation();window.toggleInteresseEvento('${ev.id}', this)"
          style="
            background:${interessado ? sanitizeHtml(cores.accent) : 'transparent'};
            color:${interessado ? 'white' : sanitizeHtml(cores.accent)};
            border-color:${sanitizeHtml(cores.accent)};
          ">
          <i class="ph${interessado ? '-fill' : ''} ph-bell"></i>
          ${interessado ? 'Notificar' : 'Interesse'}
        </button>
      </div>
    </div>
  </div>`;
};

window.toggleInteresseEvento = async function(eventoId, btnEl) {
  if (!usuarioAtual) return;
  const ref = db.collection('eventos').doc(eventoId);
  const doc = await ref.get();
  const interessados = doc.data()?.interessados || [];
  const jatem = interessados.includes(usuarioAtual.uid);
  const tipo = doc.data()?.tipo;
  const cores = EVENTO_CORES[tipo] || EVENTO_CORES.outro;

  await ref.update({
    interessados: jatem
      ? firebase.firestore.FieldValue.arrayRemove(usuarioAtual.uid)
      : firebase.firestore.FieldValue.arrayUnion(usuarioAtual.uid)
  });

  // salvar no localStorage para notificações
  const key = 'eventos_interesse_' + usuarioAtual.uid;
  let lista = JSON.parse(localStorage.getItem(key) || '[]');
  if (jatem) {
    lista = lista.filter(id => id !== eventoId);
  } else {
    lista.push(eventoId);
  }
  localStorage.setItem(key, JSON.stringify(lista));

  const novoInteressado = !jatem;
  const novoTotal = (interessados.length) + (jatem ? -1 : 1);

  if (btnEl) {
    btnEl.className = `btn-interesse ${novoInteressado ? 'marcado' : ''}`;
    btnEl.style.background = novoInteressado ? cores.accent : 'transparent';
    btnEl.style.color = novoInteressado ? 'white' : cores.accent;
    btnEl.style.borderColor = cores.accent;
    btnEl.innerHTML = `<i class="ph${novoInteressado ? '-fill' : ''} ph-bell"></i> ${novoInteressado ? 'Notificar' : 'Interesse'}`;
  }

  const card = btnEl?.closest('.evento-card');
  const countEl = card?.querySelector('.ph-bell')?.closest('div');
  if (countEl) countEl.innerHTML = `<i class="ph ph-bell"></i> ${novoTotal} interessados`;

  _eventosCache = null; // invalida cache

  mostrarNotif(jatem
    ? 'Interesse removido'
    : '<i class="ph-fill ph-bell"></i> Você será notificado!');
};

window.abrirSheetEventos = async function() {
  const sheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('sheetOverlay');

  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div style="padding:0 20px 24px;background:#1C0A03;min-height:60vh">
      <div class="eventos-sheet-header">
        <div class="eventos-sheet-titulo">
          <i class="ph ph-calendar"></i> Eventos em BH
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button onclick="window._atualizarEventosSheet()" style="
            background:none;border:none;color:var(--laranja);
            font-size:1.1rem;cursor:pointer;padding:4px
          "><i class="ph ph-arrows-clockwise"></i></button>
          <button onclick="window.fecharBottomSheet()" style="
            background:none;border:none;color:rgba(255,255,255,0.5);
            font-size:1.4rem;cursor:pointer
          "><i class="ph ph-x"></i></button>
        </div>
      </div>

      <div class="eventos-busca">
        <i class="ph ph-magnifying-glass" style="color:rgba(255,255,255,0.4)"></i>
        <input type="text" placeholder="buscar evento ou bar..."
          oninput="window._filtrarEventosSheet(this.value)"
          id="eventosBuscaInput"/>
      </div>

      <div class="eventos-subfiltros" id="eventosSubfiltros">
  ${EVENTO_SUBFILTROS.map(f => {
    const cores = {
      todos:      '#E8650A',
      show:       '#4A90D9',
      samba:      '#2D6E4E',
      happy_hour: '#E8650A',
      degustacao: '#F5A623',
      festival:   '#C0392B',
      pet:        '#2D8A4E',
    };
    const cor = cores[f.id] || '#9B9B9B';
    return `<button class="eventos-subfiltro-btn ${f.id === 'todos' ? 'ativo' : ''}"
      onclick="window._setFiltroEvento('${f.id}')"
      data-cor="${cor}"
      style="${f.id === 'todos' ? `background:${cor};border-color:${cor};color:white` : `border-color:${cor};color:${cor}`}">
      ${f.icon} ${f.label}
    </button>`;
  }).join('')}
</div>

      <div id="eventosLista">
        <div class="eventos-empty">
          <i class="ph ph-spinner"></i>
          <p>Carregando eventos...</p>
        </div>
      </div>
    </div>`;

  overlay.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';

  // swipe para fechar
  let startY = 0;
  sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 80) window.fecharBottomSheet();
    else sheet.style.transform = '';
  });

  await window._renderEventosLista();
};

window._renderEventosLista = async function() {
  const lista = document.getElementById('eventosLista');
  if (!lista) return;

  lista.innerHTML = `<div class="eventos-empty"><i class="ph ph-spinner"></i><p>Carregando...</p></div>`;

  try {
    let eventos = await window.carregarEventos();

    // filtro por tipo
    if (_eventosFiltroAtivo === 'pet') {
      eventos = eventos.filter(ev => ev.petFriendly);
    } else if (_eventosFiltroAtivo !== 'todos') {
      eventos = eventos.filter(ev => ev.tipo === _eventosFiltroAtivo);
    }

    // filtro por busca
    if (_eventosBusca) {
      const b = _eventosBusca.toLowerCase();
      eventos = eventos.filter(ev =>
        ev.titulo?.toLowerCase().includes(b) ||
        ev.barNome?.toLowerCase().includes(b) ||
        ev.endereco?.toLowerCase().includes(b)
      );
    }

    if (!eventos.length) {
      lista.innerHTML = `
        <div class="eventos-empty">
          <i class="ph ph-calendar-x"></i>
          <p>Nenhum evento encontrado</p>
        </div>`;
      return;
    }

    lista.innerHTML = eventos.map(e => window.renderCardEvento(e)).join('');
  } catch (e) {
    lista.innerHTML = `
      <div class="eventos-empty">
        <i class="ph-fill ph-warning"></i>
        <p>Erro ao carregar eventos</p>
      </div>`;
  }
};

window._setFiltroEvento = function(filtro) {
  _eventosFiltroAtivo = filtro;
  document.querySelectorAll('.eventos-subfiltro-btn').forEach(btn => {
    const cor = btn.dataset.cor || '#E8650A';
    const ativo = btn.getAttribute('onclick')?.includes(`'${filtro}'`);
    btn.classList.toggle('ativo', ativo);
    if (ativo) {
      btn.style.background = cor;
      btn.style.borderColor = cor;
      btn.style.color = 'white';
    } else {
      btn.style.background = 'transparent';
      btn.style.borderColor = cor;
      btn.style.color = cor;
    }
  });
  window._renderEventosLista();
};

window._filtrarEventosSheet = function(val) {
  _eventosBusca = val.trim();
  clearTimeout(window._debounceEventos);
  window._debounceEventos = setTimeout(() => window._renderEventosLista(), 300);
};

window._atualizarEventosSheet = function() {
  _eventosCache = null;
  _eventosCacheTs = 0;
  mostrarNotif('<i class="ph ph-arrows-clockwise"></i> Atualizando eventos...', 'info');
  window._renderEventosLista();
};

// Notificações de eventos próximos
window.verificarNotificacoesEventos = async function() {
  if (!usuarioAtual) return;
  const key = 'eventos_interesse_' + usuarioAtual.uid;
  const lista = JSON.parse(localStorage.getItem(key) || '[]');
  if (!lista.length) return;

  const agora = Date.now();
  const duasHoras = 2 * 60 * 60 * 1000;

  for (const eventoId of lista) {
    const doc = await db.collection('eventos').doc(eventoId).get();
    if (!doc.exists) continue;
    const ev = doc.data();
    const tsEvento = ev.data?.seconds * 1000;
    const diff = tsEvento - agora;
    const notifKey = 'ev_notif_' + eventoId;
    if (diff > 0 && diff <= duasHoras && !localStorage.getItem(notifKey)) {
      localStorage.setItem(notifKey, '1');
      mostrarNotif(
        `<i class="ph-fill ph-bell"></i> ${sanitizeHtml(ev.titulo)} começa em breve!`,
        'info'
      );
    }
  }
};
setInterval(() => window.verificarNotificacoesEventos?.(), 30 * 60 * 1000);
// ═══════════════════════════════════════════════════════════════════
// EVENTOS POR TIER — TRILHA BH
// Substitui / complementa eventos.js
// Cole este bloco no FINAL de eventos.js (após a última linha)
// ═══════════════════════════════════════════════════════════════════

// Regras de quem pode criar evento por tier
const EVENTO_TIER_RULES = {
  lendario:  { podeEventoImediato: true,  minVisitas: 0,  label: 'Lendário' },
  famoso:    { podeEventoImediato: true,  minVisitas: 0,  label: 'Famoso'   },
  bairro:    { podeEventoImediato: false, minVisitas: 5,  label: 'De Bairro' },
  escondido: { podeEventoImediato: false, minVisitas: 10, label: 'Escondido' },
};

// Verifica se um bar pode criar evento
window.verificarPermissaoEvento = async function(barId) {
  const bar = BARES.find(b => b.id === barId);
  if (!bar) return { permitido: false, motivo: 'Bar não encontrado' };

  const tier  = bar.tier  || 'bairro';
  const regra = EVENTO_TIER_RULES[tier] || EVENTO_TIER_RULES.bairro;

  if (regra.podeEventoImediato) {
    return { permitido: true, tier, regra };
  }

  // Conta visitas únicas da comunidade ao bar
  const snap = await db.collection('bares_status').doc(barId).get();
  const visitantes = snap.data()?.visitantes?.length || 0;

  if (visitantes >= regra.minVisitas) {
    return { permitido: true, tier, regra, visitantes };
  }

  return {
    permitido:  false,
    tier,
    regra,
    visitantes,
    faltam: regra.minVisitas - visitantes,
    motivo: `Precisa de ${regra.minVisitas} visitas da comunidade (${visitantes} até agora)`,
  };
};

// Painel de criação de evento (para donos de bar / admins)
window.abrirCriarEvento = async function(barId) {
  if (!usuarioAtual) return;

  const permissao = await window.verificarPermissaoEvento(barId);
  const bar       = BARES.find(b => b.id === barId);

  if (!permissao.permitido) {
    // Mostra por que ainda não pode
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" style="text-align:center">
        <div style="font-size:3rem;margin-bottom:8px">🔒</div>
        <div class="modal-titulo">Desbloqueie Eventos</div>
        <p class="modal-desc">
          <strong>${sanitizeHtml(bar?.nome)}</strong> é um bar
          <strong>${sanitizeHtml(EVENTO_TIER_RULES[permissao.tier]?.label)}</strong>.
          Precisa de <strong>${permissao.regra.minVisitas} visitas</strong>
          da comunidade para criar eventos.<br><br>
          <span style="font-family:'Bebas Neue',cursive;font-size:2rem;color:var(--laranja)">
            ${permissao.visitantes}/${permissao.regra.minVisitas}
          </span>
          <br>
          <span style="font-size:0.8rem;color:var(--cinza)">
            visitantes confirmados
          </span>
        </p>
        <!-- Barra de progresso -->
        <div style="background:var(--border);border-radius:8px;height:8px;margin-bottom:20px;overflow:hidden">
          <div style="height:100%;background:var(--laranja);border-radius:8px;
                      width:${Math.round((permissao.visitantes / permissao.regra.minVisitas) * 100)}%">
          </div>
        </div>
        <button onclick="this.closest('.modal-overlay').remove()" class="btn-login">
          Entendido
        </button>
      </div>`;
    document.body.appendChild(overlay); return;
  }

  // Pode criar! Abre formulário
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.alignItems = 'flex-start';
  overlay.style.paddingTop = '16px';
  overlay.innerHTML = `
    <div class="modal-box" style="text-align:left;max-height:90vh;overflow-y:auto">
      <div class="modal-titulo"><i class="ph ph-calendar-plus"></i> Criar Evento</div>
      <p style="font-size:0.82rem;color:var(--cinza);margin-bottom:14px">
        <i class="ph-fill ph-beer-bottle"></i> ${sanitizeHtml(bar?.nome)}
        · Tier: <strong style="color:var(--laranja)">${sanitizeHtml(EVENTO_TIER_RULES[permissao.tier]?.label)}</strong>
      </p>

      <!-- Tipo -->
      <div style="margin-bottom:12px">
        <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:6px">
          Tipo de evento
        </label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${Object.entries(TIPO_EVENTO).map(([id, cfg]) => `
            <label style="display:flex;align-items:center;gap:6px;padding:8px 12px;
                          border-radius:10px;border:1.5px solid var(--border);
                          cursor:pointer;font-size:0.8rem;font-weight:700;color:var(--marrom);
                          background:var(--creme)">
              <input type="radio" name="evTipo" value="${id}" style="accent-color:var(--laranja)"/>
              ${cfg.icon} ${cfg.label}
            </label>`).join('')}
        </div>
      </div>

      <!-- Título -->
      <div style="margin-bottom:10px">
        <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:4px">Título *</label>
        <input id="evTitulo" type="text" maxlength="60" placeholder="Ex: Samba do Quintal"
          style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);
                 font-family:'Nunito',sans-serif;font-size:0.88rem;box-sizing:border-box"/>
      </div>

      <!-- Data + Hora (lado a lado) -->
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <div style="flex:1">
          <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:4px">Data *</label>
          <input id="evData" type="date"
            min="${new Date().toISOString().split('T')[0]}"
            style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);
                   font-family:'Nunito',sans-serif;font-size:0.88rem;box-sizing:border-box"/>
        </div>
        <div style="flex:1">
          <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:4px">Hora *</label>
          <input id="evHora" type="time"
            style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);
                   font-family:'Nunito',sans-serif;font-size:0.88rem;box-sizing:border-box"/>
        </div>
      </div>

      <!-- Descrição -->
      <div style="margin-bottom:10px">
        <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:4px">Descrição</label>
        <textarea id="evDesc" rows="2" maxlength="200"
          placeholder="Conte mais sobre o evento..."
          style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);
                 font-family:'Nunito',sans-serif;font-size:0.85rem;resize:none;box-sizing:border-box">
        </textarea>
      </div>

      <!-- Link externo -->
      <div style="margin-bottom:10px">
        <label style="font-size:0.78rem;font-weight:800;color:var(--marrom);display:block;margin-bottom:4px">
          Link externo (opcional)
        </label>
        <input id="evLink" type="url" placeholder="https://..."
          style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);
                 font-family:'Nunito',sans-serif;font-size:0.85rem;box-sizing:border-box"/>
      </div>

      <!-- Pet friendly -->
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:16px;cursor:pointer">
        <input type="checkbox" id="evPet" style="accent-color:var(--laranja);width:16px;height:16px"/>
        <span style="font-size:0.85rem;font-weight:700;color:var(--marrom)">
          <i class="ph ph-paw-print" style="color:var(--laranja)"></i> Pet Friendly
        </span>
      </label>

      <button onclick="window._salvarEvento('${barId}')" class="btn-login" style="margin-bottom:10px">
        <i class="ph ph-calendar-check"></i> Publicar Evento
      </button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
};

window._salvarEvento = async function(barId) {
  const tipo     = document.querySelector('input[name="evTipo"]:checked')?.value;
  const titulo   = document.getElementById('evTitulo')?.value.trim();
  const dataStr  = document.getElementById('evData')?.value;
  const hora     = document.getElementById('evHora')?.value;
  const desc     = filtrarTexto(document.getElementById('evDesc')?.value.trim()   || '');
  const link     = document.getElementById('evLink')?.value.trim()    || '';
  const petFriendly = document.getElementById('evPet')?.checked || false;

  if (!tipo || !titulo || !dataStr || !hora) {
    mostrarNotif('Preencha tipo, título, data e hora', 'erro'); return;
  }

  const bar = BARES.find(b => b.id === barId);
  const dataTs = new Date(dataStr + 'T' + hora).getTime();

  if (dataTs < Date.now()) {
    mostrarNotif('Escolha uma data futura', 'erro'); return;
  }

  try {
    await db.collection('eventos').add({
      barId,
      barNome:      bar?.nome || '',
      endereco:     bar?.end  || '',
      lat:          bar?.lat  || null,
      lng:          bar?.lng  || null,
      tipo,
      titulo:       filtrarTexto(titulo),
      descricao:    desc,
      data:         { seconds: Math.floor(dataTs / 1000) },
      hora,
      linkExterno:  link,
      petFriendly,
      ativo:        true,
      interessados: [],
      criadoPor:    usuarioAtual.uid,
      criadoEm:     Date.now(),
      tier:         bar?.tier || 'bairro',
    });

    _eventosCache    = null; 
    _eventosCacheTs  = 0;

    document.querySelector('.modal-overlay')?.remove();
    mostrarNotif('<i class="ph-fill ph-calendar-check"></i> Evento publicado!');
    if (document.getElementById('eventosLista')) {
      window._renderEventosLista();
    }
  } catch (e) {
    mostrarNotif('Erro ao salvar evento', 'erro');
  }
};
window.ordenarEventosPorTier = function(eventos) {
  const ORDEM_TIER = { lendario: 0, famoso: 1, bairro: 2, escondido: 3 };
  return [...eventos].sort((a, b) => {
    const ta = ORDEM_TIER[a.tier] ?? 2;
    const tb = ORDEM_TIER[b.tier] ?? 2;
    if (ta !== tb) return ta - tb;
    return (a.data?.seconds || 0) - (b.data?.seconds || 0);
  });
};
const _carregarEventosOriginal = window.carregarEventos;
window.carregarEventos = async function() {
  const eventos = await _carregarEventosOriginal();
  return window.ordenarEventosPorTier(eventos);
};