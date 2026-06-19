const RANKING_TEMPORAL_CONFIGS = [
  {
    id:      'mes',
    label:   '<i class="ph-fill ph-calendar-check"></i> Mês',
    desc:    'Quem mais pontuou este mês',
    badge:   '<i class="ph-fill ph-medal" style="color:#E8650A"></i>',
    campo:   'xpMes',
    reset:   'mensal',
    cor:     '#E8650A',
  },
  {
    id:      'ano',
    label:   '<i class="ph-fill ph-calendar"></i> Ano',
    desc:    'Quem mais pontuou em 2026',
    badge:   '<i class="ph-fill ph-medal" style="color:#4A90D9"></i>',
    campo:   'xpAno',
    reset:   'anual',
    cor:     '#4A90D9',
  },
  {
    id:      'geral',
    label:   '<i class="ph-fill ph-crown"></i> Hall da Fama',
    desc:    'Os maiores de todos os tempos',
    badge:   '<i class="ph-fill ph-crown" style="color:#FFD700"></i>',
    campo:   'xpTotal',
    reset:   'nunca',
    cor:     '#FFD700',
  },
];

let _rankingTemporalAtivo = 'mes';
let _rankingTemporalCache = {};
let _rankingTemporalCacheTs = {};
const RANKING_TEMPORAL_TTL = 3 * 60 * 1000; 
async function carregarRankingTemporal(periodo) {
  const agora = Date.now();
  const cfg = RANKING_TEMPORAL_CONFIGS.find(r => r.id === periodo);
  if (!cfg) return [];

  if (_rankingTemporalCache[periodo] &&
      agora - (_rankingTemporalCacheTs[periodo] || 0) < RANKING_TEMPORAL_TTL) {
    return _rankingTemporalCache[periodo];
  }
const [snap, rankSnap] = await Promise.all([
  db.collection('xp').orderBy(cfg.campo,'desc').limit(100).get(),
  db.collection('ranking').orderBy('totalVisitas','desc').limit(100).get()
]);
  const dados = snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(d => (d[cfg.campo] || 0) > 0);

  if (periodo === 'mes') {
    const mesAtual = new Date().toISOString().slice(0, 7);
    dados.forEach(d => {
      if (d.mesRef !== mesAtual) d.xpMes = 0;
    });
    dados.sort((a, b) => (b.xpMes || 0) - (a.xpMes || 0));
  }
  if (periodo === 'ano') {
    const anoAtual = new Date().getFullYear();
    dados.forEach(d => {
      if (d.anoRef !== anoAtual) d.xpAno = 0;
    });
    dados.sort((a, b) => (b.xpAno || 0) - (a.xpAno || 0));
  }
  const perfilMap = {};
  rankSnap.docs.forEach(d => { perfilMap[d.id] = d.data(); });

  const resultado = dados.map(d => ({
    ...d,
    nome:   perfilMap[d.uid]?.nome   || 'Explorador',
    avatar: perfilMap[d.uid]?.avatar || 'ph-beer-bottle',
  })).filter(d => (d[cfg.campo] || 0) > 0);

  _rankingTemporalCache[periodo] = resultado;
  _rankingTemporalCacheTs[periodo] = agora;
  return resultado;
}
window.renderRankingTemporal = async function(containerId = 'rankingTemporalConteudo') {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  cont.innerHTML = `
    <!-- Seletor de período -->
    <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none">
      ${RANKING_TEMPORAL_CONFIGS.map(cfg => `
        <button
          class="ranking-temporal-tab"
          data-periodo="${cfg.id}"
          onclick="window._setRankingTemporal('${cfg.id}')"
          style="
            flex-shrink:0;padding:8px 14px;border-radius:20px;
            border:2px solid ${cfg.cor};
            background:${ _rankingTemporalAtivo === cfg.id ? cfg.cor : 'transparent'};
            color:${ _rankingTemporalAtivo === cfg.id ? 'white' : cfg.cor};
            font-size:0.75rem;font-weight:800;cursor:pointer;
            font-family:'Nunito',sans-serif;
            transition:all 0.15s
          ">
          ${cfg.label}
        </button>`).join('')}
    </div>

    <div id="rankingTemporalLista">
      <div class="empty"><div class="empty-icon"><i class="ph ph-spinner"></i></div><p>Carregando...</p></div>
    </div>
  `;

  await window._renderRankingTemporalLista();
};

window._setRankingTemporal = async function(periodo) {
  _rankingTemporalAtivo = periodo;
  document.querySelectorAll('.ranking-temporal-tab').forEach(btn => {
    const cfg = RANKING_TEMPORAL_CONFIGS.find(r => r.id === btn.dataset.periodo);
    const ativo = btn.dataset.periodo === periodo;
    btn.style.background = ativo ? cfg.cor : 'transparent';
    btn.style.color = ativo ? 'white' : cfg.cor;
  });

  await window._renderRankingTemporalLista();
};

window._renderRankingTemporalLista = async function() {
  const lista = document.getElementById('rankingTemporalLista');
  if (!lista) return;

  lista.innerHTML = `<div class="empty"><div class="empty-icon"><i class="ph ph-spinner"></i></div><p>Calculando XP...</p></div>`;

  const cfg = RANKING_TEMPORAL_CONFIGS.find(r => r.id === _rankingTemporalAtivo);
  const dados = await carregarRankingTemporal(_rankingTemporalAtivo);

  if (!dados.length) {
    lista.innerHTML = `<div class="empty"><div class="empty-icon">${cfg.badge}</div><p>Nenhum XP registrado ainda</p></div>`;
    return;
  }
  const minhaPosicao = dados.findIndex(d => d.uid === usuarioAtual?.uid);

  lista.innerHTML = `
    <!-- Descrição do período -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;
                background:var(--creme);border-radius:10px;padding:10px 14px;">
      <div style="font-size:1.5rem">${cfg.badge}</div>
      <div>
        <div style="font-weight:800;font-size:0.88rem;color:var(--marrom)">${cfg.desc}</div>
        ${cfg.reset !== 'nunca' ? `<div style="font-size:0.72rem;color:var(--cinza)">
          Zera ${cfg.reset} · acumula com visitas e fotos
        </div>` : `<div style="font-size:0.72rem;color:var(--cinza)">
          Permanente · nunca zera
        </div>`}
      </div>
    </div>

    <!-- Pódio top 3 -->
    ${dados.length >= 3 ? `
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:20px;justify-content:center">
      ${renderPodioTemporal(dados[1], 1, cfg)}
      ${renderPodioTemporal(dados[0], 0, cfg)}
      ${renderPodioTemporal(dados[2], 2, cfg)}
    </div>` : ''}

    <!-- Lista completa -->
    ${dados.slice(3, 20).map((d, i) => renderItemRankingTemporal(d, i + 3, cfg)).join('')}

    <!-- Minha posição (se não está no top 20) -->
    ${minhaPosicao > 20 ? `
    <div style="margin-top:14px;padding-top:14px;border-top:2px dashed var(--border)">
      <div style="font-size:0.72rem;color:var(--cinza);font-weight:700;margin-bottom:8px;text-align:center">
        Sua posição
      </div>
      ${renderItemRankingTemporal(dados[minhaPosicao], minhaPosicao, cfg)}
    </div>` : ''}
  `;
};

function renderPodioTemporal(d, posicao, cfg) {
  const alturas   = [90, 110, 75];  // 2º, 1º, 3º
  const medalhas  = ['🥈', '🥇', '🥉'];
  const av = d.avatar || 'ph-beer-bottle';
  const avatarHtml = av.startsWith('https://') || av.startsWith('data:')
    ? `<img src="${av}" style="width:40px;height:40px;border-radius:50%;object-fit:cover"/>`
    : av.startsWith('ph-')
    ? `<i class="ph-fill ${av}" style="font-size:1.4rem;color:var(--marrom)"></i>`
    : `<span style="font-size:1.4rem">${av}</span>`;

  const isMe = d.uid === usuarioAtual?.uid;

  return `
    <div style="flex:1;text-align:center;cursor:pointer" onclick="window.abrirPerfil('${d.uid}')">
      <div style="position:relative;display:inline-block;margin-bottom:6px">
        <div style="
          width:48px;height:48px;border-radius:50%;
          background:var(--laranja-claro);
          border:3px solid ${isMe ? cfg.cor : 'white'};
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;margin:0 auto
        ">${avatarHtml}</div>
        <div style="
          position:absolute;bottom:-4px;right:-4px;
          font-size:1rem;line-height:1
        ">${medalhas[posicao]}</div>
      </div>
      <div style="font-size:0.72rem;font-weight:800;color:var(--marrom);
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                  max-width:80px;margin:0 auto">
        ${sanitizeHtml(d.nome)}
      </div>
      <div style="
        font-family:'Bebas Neue',cursive;font-size:1.1rem;color:${cfg.cor};
        margin-top:2px
      ">${d[cfg.campo] || 0} XP</div>
      <div style="
        background:${cfg.cor}22;border-radius:8px;
        height:${alturas[posicao]}px;margin-top:8px
      "></div>
    </div>
  `;
}

function renderItemRankingTemporal(d, posicao, cfg) {
  const isMe = d.uid === usuarioAtual?.uid;
  const av = d.avatar || 'ph-beer-bottle';
  const avatarHtml = av.startsWith('https://') || av.startsWith('data:')
    ? `<img src="${av}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>`
    : av.startsWith('ph-')
    ? `<i class="ph-fill ${av}" style="font-size:1.2rem;color:var(--marrom)"></i>`
    : `<span style="font-size:1.2rem">${av}</span>`;

  return `
    <div style="
      display:flex;align-items:center;gap:10px;padding:10px 0;
      border-bottom:1px solid var(--border);cursor:pointer;
      ${isMe ? `background:${cfg.cor}10;margin:0 -16px;padding:10px 16px;border-radius:8px;` : ''}
    " onclick="window.abrirPerfil('${d.uid}')">
      <div style="
        font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--cinza);
        width:28px;text-align:center;flex-shrink:0
      ">${posicao + 1}º</div>
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:var(--laranja-claro);
        display:flex;align-items:center;justify-content:center;
        flex-shrink:0;overflow:hidden
      ">${avatarHtml}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${sanitizeHtml(d.nome)} ${isMe ? '<span style="font-size:0.65rem;background:var(--laranja);color:white;padding:2px 8px;border-radius:10px">você</span>' : ''}
        </div>
        <div style="font-size:0.7rem;color:var(--cinza);margin-top:1px">
          ${d.totalVisitas || 0} bares visitados
        </div>
      </div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:${cfg.cor};flex-shrink:0">
        ${d[cfg.campo] || 0} XP
      </div>
    </div>
  `;
}
window.carregarRankingTemporal = carregarRankingTemporal;