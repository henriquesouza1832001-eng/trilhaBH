window._criarRipple = function(el, e) {
  const rect   = el.getBoundingClientRect();
  const x      = (e?.clientX ?? rect.left + rect.width  / 2) - rect.left;
  const y      = (e?.clientY ?? rect.top  + rect.height / 2) - rect.top;
  const size   = Math.max(rect.width, rect.height) * 2.2;
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute;
    left:${x - size/2}px; top:${y - size/2}px;
    width:${size}px; height:${size}px;
    border-radius:50%;
    background:rgba(255,255,255,0.28);
    transform:scale(0);
    animation:_rippleAnim 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
    pointer-events:none;
    z-index:9999;
  `;
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 560);
};

// Injeta ripple em todos os botões e cards ao carregar e após renderizações
window._injetarRipples = function() {
  const seletores = [
    '.btn-primary','button.btn-login','.btn-visitar',
    '.btn-salvar-nota','.btn-grupo','.nav-item',
    '.filtro-btn','.filtro-chip','.chip-tipo',
    '.bar-card','.feed-card','.ranking-item','.emblema-card.conquistado'
  ];
  seletores.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.rippleOk) return;
      el.dataset.rippleOk = '1';
      el.addEventListener('pointerdown', e => window._criarRipple(el, e), { passive: true });
    });
  });
};

// Keyframe de ripple — injetado uma vez no head
if (!document.getElementById('_rippleStyle')) {
  const s = document.createElement('style');
  s.id = '_rippleStyle';
  s.textContent = `
    @keyframes _rippleAnim {
      to { transform: scale(1); opacity: 0; }
    }
    @keyframes _cardIn {
      from { opacity:0; transform:translateY(18px) scale(0.97); }
      to   { opacity:1; transform:translateY(0)    scale(1);    }
    }
   @keyframes _pageIn {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes _pageOut {
  from { opacity:1; }
  to   { opacity:0; }
}
  `;
  document.head.appendChild(s);
}

// ─── Animar entrada escalonada dos cards após render ─────────────────────
window._animarCards = function(containerSel) {
  const container = typeof containerSel === 'string'
    ? document.querySelector(containerSel)
    : containerSel;
  if (!container) return;
  const cards = container.querySelectorAll(
    '.bar-card, .feed-card, .ranking-item, .evento-card, .emblema-card'
  );
  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.animation = 'none';
    // força reflow
    void card.offsetWidth;
    card.style.animation = `_cardIn 0.38s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 48, 300)}ms both`;
  });
  setTimeout(() => window._injetarRipples(), 50);
};


window.irPara = function(pagina) {
  window.scrollTo(0, 0);
  const titulos = {
    descobrir: 'Descobrir · Trilha BH',
    mapa:      'Mapa · Trilha BH',
    feed:      'Feed · Trilha BH',
    roteiros:  'Roteiros · Trilha BH',
    perfil:    'Perfil · Trilha BH'
  };
  document.title = titulos[pagina] || 'Trilha BH';
  document.getElementById('perfilPublicoPage')?.style && (document.getElementById('perfilPublicoPage').style.display = 'none');

  const paginaAtiva = document.querySelector('.page.active');
  const paginaEl    = document.getElementById('page-' + pagina);
  if (!paginaEl) return;

  const _ativarPagina = () => {
    // Ativa nav
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(t => {
      if ((t.getAttribute('onclick') || '').includes("'" + pagina + "'"))
        t.classList.add('active');
    });

    const btnRoleta = document.getElementById('btnRoleta');
    if (btnRoleta) btnRoleta.style.display = pagina === 'descobrir' ? 'flex' : 'none';
    paginaEl.style.display   = 'flex';
    paginaEl.style.flexDirection = 'column';
    paginaEl.style.animation = 'none';
paginaEl.style.willChange = 'transform, opacity';
void paginaEl.offsetWidth;
paginaEl.style.animation = '_pageIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both';
    paginaEl.classList.add('active');

   
  const renders = {
  descobrir: () => requestAnimationFrame(() => renderDescobrir()),
  roteiros:  () => requestAnimationFrame(() => renderRoteiro()),
  feed:      () => requestAnimationFrame(() => {
    renderFeed();
    const dot = document.getElementById('feedDot');
    if (dot) dot.style.display = 'none';
  }),
  perfil:    () => requestAnimationFrame(() => renderPerfil()),
  mapa:      () => requestAnimationFrame(() => renderProximos()),
};
if (renders[pagina]) renders[pagina]();
    else setTimeout(() => window._injetarRipples(), 100);
  };

  if (paginaAtiva === paginaEl) {
    _ativarPagina();
    return;
  }

  // Remove active de todas (oculta via CSS .page { display:none })
  document.querySelectorAll('.page').forEach(p => {
    if (p === paginaAtiva) return; // a saída anima abaixo
    p.classList.remove('active');
    p.style.display = '';
    p.style.animation = '';
  });

  if (paginaAtiva) {
   paginaAtiva.style.animation = '_pageOut 0.1s cubic-bezier(0.4,0,1,1) both';
setTimeout(() => {
  paginaAtiva.classList.remove('active');
  paginaAtiva.style.display    = '';
  paginaAtiva.style.animation  = '';
  paginaAtiva.style.willChange = '';
  _ativarPagina();
}, 80);
  } else {
    _ativarPagina();
  }
};

// ─── Perfil público ───────────────────────────────────────────────────────
window.abrirPerfil = async function(uid) {
  if (uid === usuarioAtual.uid) { window.irPara('perfil'); return; }
  window.APP.paginaAnterior = document.querySelector('.page.active')?.id?.replace('page-','') || 'ranking';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const pp = document.getElementById('perfilPublicoPage');
  pp.style.display = 'block';
  pp.style.animation = '_pageIn 0.34s cubic-bezier(0.22,1,0.36,1) both';
  document.getElementById('perfilPublicoConteudo').innerHTML =
    '<div class="empty"><div class="empty-icon"><i class="ph ph-spinner"></i></div><p>Carregando...</p></div>';
  try {
    const rankDoc = await db.collection('ranking').doc(uid).get();
    const dados   = rankDoc.exists ? rankDoc.data() : {};
    const vSnap   = await db.collection('users').doc(uid).collection('visits').get();
    const boresIds = new Set(); vSnap.forEach(v => boresIds.add(v.id));
    const totalVisitas = boresIds.size;
    const nome    = dados.nome   || 'Butequeador';
    const avatar  = dados.avatar || '<i class="ph-fill ph-beer-bottle"></i>';
    const conquistados = calcularEmblemas(totalVisitas, boresIds);
    const avatarHtml = avatar.startsWith('https://') || avatar.startsWith('data:')
      ? `<img src="${avatar}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:block"/>`
      : avatar.startsWith('ph-')
      ? `<i class="ph-fill ${sanitizeHtml(avatar)}" style="font-size:2rem;color:var(--marrom)"></i>`
      : `<span style="font-size:1.8rem">${sanitizeHtml(avatar)}</span>`;
    document.getElementById('perfilPublicoConteudo').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--laranja);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">${avatarHtml}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--marrom)">${sanitizeHtml(nome)}</div>
          <div style="font-size:0.8rem;color:var(--cinza)">${totalVisitas} bares · ${dados.media&&dados.media!=='-'?dados.media+'/10':'sem notas'} · ${dados.km||0}km</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:white;border-radius:10px;padding:10px 8px;text-align:center;box-shadow:var(--shadow)"><div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:var(--laranja)">${totalVisitas}</div><div style="font-size:0.65rem;color:var(--cinza);font-weight:700;text-transform:uppercase">Bares</div></div>
        <div style="background:white;border-radius:10px;padding:10px 8px;text-align:center;box-shadow:var(--shadow)"><div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:var(--laranja)">${dados.media&&dados.media!=='-'?dados.media:'-'}</div><div style="font-size:0.65rem;color:var(--cinza);font-weight:700;text-transform:uppercase">Nota média</div></div>
        <div style="background:white;border-radius:10px;padding:10px 8px;text-align:center;box-shadow:var(--shadow)"><div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:var(--laranja)">${dados.regioes||0}</div><div style="font-size:0.65rem;color:var(--cinza);font-weight:700;text-transform:uppercase">Regiões</div></div>
      </div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);letter-spacing:1px;margin-bottom:10px"><i class="ph-fill ph-beer-bottle"></i> Emblemas de Visitas</div>
      <div class="emblemas-grid">${EMBLEMAS_QUANTIDADE.map(e=>{const c=conquistados.has(e.nome);return`<div class="emblema-card ${c?'conquistado':''}"><div class="emblema-icon">${e.icon}</div><div class="emblema-nome">${sanitizeHtml(e.nome)}</div><div class="emblema-desc">${sanitizeHtml(e.desc)||''}</div></div>`;}).join('')}</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);letter-spacing:1px;margin:16px 0 10px"><i class="ph ph-map-trifold"></i> Emblemas de Regiões</div>
      <div class="emblemas-grid">${EMBLEMAS_REGIAO.map(e=>{const c=conquistados.has(e.nome);return`<div class="emblema-card ${c?'conquistado':''}"><div class="emblema-icon">${e.icon}</div><div class="emblema-nome">${sanitizeHtml(e.nome)}</div><div class="emblema-desc">${sanitizeHtml(e.desc)||''}</div></div>`;}).join('')}</div>`;
    setTimeout(() => window._animarCards('#perfilPublicoConteudo .emblemas-grid'), 80);
  } catch(err) {
    document.getElementById('perfilPublicoConteudo').innerHTML =
      '<div class="empty"><div class="empty-icon"><i class="ph-fill ph-warning"></i></div><p>Erro ao carregar perfil</p></div>';
  }
};

window.fecharPerfilPublico = function() {
  const pp = document.getElementById('perfilPublicoPage');
  pp.style.animation = '_pageOut 0.18s cubic-bezier(0.4,0,1,1) both';
  setTimeout(() => {
    pp.style.display   = 'none';
    pp.style.animation = '';
    window.irPara(window.APP.paginaAnterior || 'descobrir');
  }, 160);
};

// Injeta ripples após qualquer renderização global
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(window._injetarRipples, 800);
});