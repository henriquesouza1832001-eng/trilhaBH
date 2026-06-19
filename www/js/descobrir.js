window._tipoFiltro = window._tipoFiltro || 'Todos';
window._vibeFiltro = window._vibeFiltro || '';
function renderDescobrir() {
  const cont = document.getElementById('page-descobrir');
  if (!cont) return;
  if (document.getElementById('listaDescobrir')) {
    _atualizarProgressoDescobrir();
    renderListaDescobrir();
    return;
  }
  _montarEstruturaDescobrir(cont);
}

function _atualizarProgressoDescobrir() {
  const totalVisitados = Object.keys(visitas).length;
  const totalBares = BARES.length;
  const pct = totalBares ? Math.round((totalVisitados / totalBares) * 100) : 0;
  const barEl = document.querySelector('#page-descobrir .progresso-barra-fill');
  const textoEl = document.querySelector('#page-descobrir .progresso-texto');
  if (barEl) barEl.style.width = pct + '%';
  if (textoEl) textoEl.textContent = `${totalVisitados}/${totalBares} · ${pct}%`;
}

function _montarEstruturaDescobrir(cont) {
  const totalVisitados = Object.keys(visitas).length;
  const totalBares = BARES.length;
  const pct = totalBares ? Math.round((totalVisitados / totalBares) * 100) : 0;

  cont.innerHTML = `
    <div style="padding:12px 16px 0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);letter-spacing:1px">
          <i class="ph-fill ph-beer-bottle"></i> Trilha BH
        </span>
        <span class="progresso-texto" style="font-size:0.75rem;font-weight:800;color:var(--laranja)">
          ${totalVisitados}/${totalBares} · ${pct}%
        </span>
      </div>
      <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">
        <div class="progresso-barra-fill" style="height:100%;width:${pct}%;background:var(--laranja);border-radius:4px;transition:width 0.5s cubic-bezier(0.16,1,0.3,1)"></div>
      </div>
    </div>
    <div id="barSemanaCard" style="margin:8px 16px 0"></div>
    <div id="desafioMensalCard" style="margin:8px 16px 0"></div>
    <div id="trilhasCarrossel" style="margin-top:12px;margin-bottom:4px"></div>
    <div class="busca-wrap" style="padding:10px 16px 4px">
      <i class="ph ph-magnifying-glass busca-icon"></i>
      <input class="busca-input" type="search" placeholder="Buscar bar, bairro..."
        value="${window._buscaDescobrir || ''}"
        oninput="window._buscaDescobrir=this.value;clearTimeout(window._debounceDesc);window._debounceDesc=setTimeout(renderListaDescobrir,300)"/>
    </div>
    <div class="filtros-regioes" style="position:sticky;top:0;z-index:10;background:var(--surface);">
      ${['TODOS','FAVORITOS','SUL','CENTRO','LESTE','NORDESTE','NOROESTE','NORTE','OESTE'].map(r => `
        <button class="filtro-btn ${(window._regiaoDescobrir||'TODOS')===r?'ativo':''}"
          onclick="window._regiaoDescobrir='${r}';document.querySelectorAll('.filtro-btn').forEach(b=>b.classList.remove('ativo'));this.classList.add('ativo');renderListaDescobrir()">
          ${r==='TODOS'?'<i class="ph ph-list"></i> Todos':r==='FAVORITOS'?'<i class="ph ph-flag"></i> Quero Ir':r}
        </button>`).join('')}
    </div>
     <div style="padding:4px 16px 8px;display:flex;align-items:center;gap:8px">
      <button onclick="window.abrirFiltrosToast()"
        style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;
               border:1.5px solid var(--border);background:var(--surface);
               color:var(--marrom);font-size:0.78rem;font-weight:800;cursor:pointer;
               font-family:'Nunito',sans-serif;position:relative">
        <i class="ph ph-sliders"></i> Filtros
        <span id="badgeFiltros" style="display:none;background:var(--laranja);color:white;
              border-radius:10px;padding:1px 6px;font-size:0.65rem;font-weight:800"></span>
      ${[
  { label:'🎵 Música',    vibes:['musica-ao-vivo','samba','pagode','rock','sertanejo','forro'] },
  { label:'🌿 Ambiente',  vibes:['externo','vista','coberto','sinuca','jogos','sofisticado','romantico'] },
  { label:'👥 Público',   vibes:['petfriendly','lgbtq','criancas','feminino','acessivel'] },
  { label:'🍺 Serviços',  vibes:['esportes','happy-hour','entrega','reserva','wifi','vegano','vinho'] },
].map(grupo => `
  <div style="font-size:0.65rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
              letter-spacing:.5px;margin-bottom:4px;margin-top:8px">${grupo.label}</div>
  <div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px">
    ${grupo.vibes.map(v => `
      <button class="chip-tipo ${(window._vibeFiltro||'')=== v ?'ativo':''}"
        onclick="window._vibeFiltro='${v}';window._tipoFiltro='Todos';
                 window.atualizarBadgeFiltros();renderListaDescobrir()">
        ${VIBES.find(x=>x.id===v)?.label||v}
      </button>`).join('')}
  </div>
`).join('')}

<!-- Botão limpar -->
<button onclick="window._vibeFiltro='';window._tipoFiltro='Todos';
                 window.atualizarBadgeFiltros();renderListaDescobrir()"
  style="margin-top:6px;padding:5px 12px;border-radius:20px;border:1.5px solid var(--border);
         background:transparent;color:var(--cinza);font-size:0.72rem;font-weight:800;
         cursor:pointer;font-family:'Nunito',sans-serif">
  <i class="ph ph-x"></i> Limpar filtros
</button>
    </div>
    <div style="padding:0 16px 8px">
      <button class="btn-eventos-destaque" onclick="window.abrirSheetEventos()" style="width:100%">
        <i class="ph ph-calendar"></i> Eventos
      </button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px 8px">
      <span style="font-size:0.72rem;color:var(--cinza);font-weight:700">
        ${BARES.length} bares · ${totalVisitados} visitados
      </span>
      <select style="font-size:0.75rem;font-family:'Nunito',sans-serif;color:var(--marrom);
               border:1.5px solid var(--border);border-radius:10px;padding:5px 8px;
               background:var(--surface);cursor:pointer"
        onchange="window._ordenacaoDescobrir=this.value;renderListaDescobrir()">
        <option value="padrao" ${(window._ordenacaoDescobrir||'padrao')==='padrao'?'selected':''}>Padrão</option>
        <option value="az" ${window._ordenacaoDescobrir==='az'?'selected':''}>A → Z</option>
        <option value="nao_visitados" ${window._ordenacaoDescobrir==='nao_visitados'?'selected':''}>Não visitados</option>
        <option value="visitados" ${window._ordenacaoDescobrir==='visitados'?'selected':''}>Visitados</option>
        <option value="nota" ${window._ordenacaoDescobrir==='nota'?'selected':''}>Melhor nota</option>
      </select>
    </div>
    <div id="listaDescobrir" style="padding:0 16px 100px"></div>
  `;

  renderListaDescobrir();
  window.carregarDesafioMensal?.().then(d => {
    const el = document.getElementById('desafioMensalCard');
    if (!el || !d) return;
    const { progresso, meta, completo } = window.verificarDesafioCompleto(d);
    const pct = meta ? Math.min(Math.round((progresso / meta) * 100), 100) : 0;
    el.innerHTML = `
      <div style="background:linear-gradient(135deg,#3D1F0F,#6B3A1F);border-radius:14px;
                  padding:14px 16px;color:white;position:relative;overflow:hidden">
        <div style="position:absolute;top:-10px;right:-10px;font-size:4rem;opacity:0.08;font-family:'Bebas Neue',cursive">DESAFIO</div>
        <div style="font-size:0.62rem;font-weight:900;letter-spacing:1.5px;color:var(--laranja);text-transform:uppercase;margin-bottom:4px">
          <i class="ph-fill ph-trophy"></i> Desafio de ${new Date().toLocaleString('pt-BR',{month:'long'})}
        </div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.3rem;letter-spacing:.5px;line-height:1.1;margin-bottom:6px">${sanitizeHtml(d.titulo)}</div>
        <div style="font-size:0.75rem;opacity:0.8;margin-bottom:10px">${sanitizeHtml(d.descricao)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:0.72rem;opacity:0.7">${progresso}/${meta} bares</span>
          <span style="font-size:0.72rem;font-weight:800;color:var(--laranja)">${pct}%</span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--laranja);border-radius:4px;transition:width 0.5s"></div>
        </div>
        ${completo
          ? `<div style="margin-top:10px;font-size:0.8rem;font-weight:800;color:#FFD700;text-align:center"><i class="ph-fill ph-confetti"></i> Desafio concluído!</div>`
          : `<div style="font-size:0.7rem;opacity:0.6;margin-top:8px;text-align:right">+${d.xpBonus||50} XP ao concluir</div>`}
      </div>`;
    if (completo) window.salvarDesafioCompleto?.(d.id);
  });
  window.mostrarBtnEventos?.();
  setTimeout(() => window.renderCarrosselTrilhas?.('trilhasCarrossel'), 50);
}
setTimeout(() => window.renderCarrosselTrilhas?.('trilhasCarrossel'), 50);
window.filtrarDescobrir=function(txt){
  window._buscaDescobrir=txt.toLowerCase().trim();
  clearTimeout(window._debounceDesc);
  window._debounceDesc=setTimeout(()=>renderListaDescobrir(),250);
};
window.setOrdemDescobrir=function(ordem){
  window._ordemDescobrir=ordem;
  ['padrao','nota','regiao'].forEach(o=>{
    const b=document.getElementById('oBtn-'+o);
    if(b){b.style.background=o===ordem?'var(--marrom)':'transparent';b.style.color=o===ordem?'white':'var(--marrom)';}
  });
  renderListaDescobrir();
};
window.setRegiaoDescobrir=function(r){
  window._regiaoDescobrir=r;
  ['TODOS','FAVORITOS','SUL','CENTRO','LESTE','NORDESTE','NOROESTE','NORTE','OESTE'].forEach(reg=>{
    const btn=document.getElementById('dBtn-'+reg);
    if(!btn)return;
    btn.style.background=reg===r?'var(--marrom)':'transparent';
    btn.style.color=reg===r?'white':'var(--marrom)';
  });
  renderListaDescobrir();
};

function _highlight(txt, busca){
  if(!busca||!txt) return sanitizeHtml(txt||'');
  const safe = sanitizeHtml(txt); 
  const re = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');
  return safe.replace(re,'<mark style="background:rgba(232,101,10,0.25);border-radius:3px;padding:0 1px">$1</mark>');
}
function _atualizarEstadoCards() {
  document.querySelectorAll('#listaDescobrir .bar-card').forEach(card => {
    const onclick = card.getAttribute('onclick') || '';
    const match = onclick.match(/abrirBottomSheet\('([^']+)'\)/);
    if (!match) return;
    const barId = match[1];
    const visitado = !!visitas[barId];
    const isFav = favoritos.includes(barId);
    const nota = visitas[barId]?.nota;
    card.style.border = `1px solid rgba(232,101,10,${visitado ? '0.35' : '0.15'})`;
    const nomeEl = card.querySelector('.bar-card-nome');
    if (nomeEl) {
      const nomeBar = BARES.find(b => b.id === barId)?.nome || '';
      nomeEl.innerHTML = `${visitado ? '<i class="ph-fill ph-check-circle" style="color:var(--verde);font-size:0.9rem"></i> ' : ''}${sanitizeHtml(nomeBar)}`;
    }
    const regEl = card.querySelector('.bar-card-tag-reg');
    if (regEl) {
      const bar = BARES.find(b => b.id === barId);
      if (bar) regEl.innerHTML = `<i class="ph ph-map-pin"></i> ${sanitizeHtml(bar.regiao)}${nota ? ` · <i class="ph-fill ph-star" style="color:var(--laranja)"></i> ${nota}/10` : ''}`;
    }
    const btnVisitar = card.querySelector('.bar-card-btn-visitar');
    if (btnVisitar) {
      btnVisitar.className = `bar-card-btn-visitar ${visitado ? 'visitado' : ''}`;
      btnVisitar.setAttribute('onclick', `event.stopPropagation();if(navigator.vibrate)navigator.vibrate(30);${visitado ? `window.toggleVisita('${barId}')` : `window.abrirAvaliacaoDescobrir('${barId}')`}`);
      btnVisitar.innerHTML = `<i class="ph-fill ${visitado ? 'ph-check-circle' : 'ph-navigation-arrow'}"></i> ${visitado ? 'Visitado' : 'Marcar Visita'}`;
    }
    const btnFav = card.querySelector('.bar-card-btn-icon');
    if (btnFav) {
      btnFav.className = `bar-card-btn-icon ${isFav ? 'salvo' : ''}`;
      btnFav.innerHTML = `<i class="${isFav ? 'ph-fill' : 'ph'} ph-flag"></i>`;
    }
  });
}
function renderListaDescobrir() {
  const lista = document.getElementById('listaDescobrir');
  if (!lista) return;
  if (lista.children.length > 0 && !lista.querySelector('.skeleton-card')
    && !window._forcaRerenderDescobrir) {
    _atualizarEstadoCards();
    return;
  }
  window._forcaRerenderDescobrir = false;

  lista.innerHTML = Array(4).fill(0).map(()=>`
    <div class="skeleton-card" style="height:72px;margin-bottom:12px;border-radius:16px"></div>
  `).join('');

requestAnimationFrame(() => {
  let bares = [...BARES];
  const SEIS_MESES = 6 * 30 * 24 * 60 * 60 * 1000;
  bares.forEach(b => {
    b._revisitaSugerida = visitas[b.id]?.ts && (Date.now() - visitas[b.id].ts) > SEIS_MESES;
  });
  if (window._regiaoDescobrir && window._regiaoDescobrir !== 'TODOS') {
    if (window._regiaoDescobrir === 'FAVORITOS') {
      bares = bares.filter(b => favoritos.includes(b.id));
    } else {
      bares = bares.filter(b => b.regiao === window._regiaoDescobrir);
    }
  }
  const busca = (window._buscaDescobrir || '').toLowerCase().trim();
  if (busca) {
    bares = bares.filter(b =>
      b.nome.toLowerCase().includes(busca) ||
      b.regiao?.toLowerCase().includes(busca) ||
      b.end?.toLowerCase().includes(busca) ||
      b.bairro?.toLowerCase().includes(busca)
    );
  }
  if(window._tipoFiltro && window._tipoFiltro !== 'Todos'){
    const f = window._tipoFiltro.toLowerCase();
    bares = bares.filter(b =>
      b.tipo?.some(t => t.toLowerCase() === f) ||
      (f === 'cdb' && b.cdb) ||
      b.vibes?.includes(f)
    );
  }
  if(window._vibeFiltro && window._vibeFiltro !== ''){
    bares = bares.filter(b => b.vibes?.includes(window._vibeFiltro));
  }
  const ord = window._ordenacaoDescobrir || 'padrao';
  if (ord === 'az') bares.sort((a, b) => a.nome.localeCompare(b.nome));
  else if (ord === 'visitados') bares.sort((a, b) => (visitas[b.id] ? 1 : 0) - (visitas[a.id] ? 1 : 0));
  else if (ord === 'nao_visitados') bares.sort((a, b) => (visitas[a.id] ? 1 : 0) - (visitas[b.id] ? 1 : 0));
  else if (ord === 'nota') bares.sort((a, b) => (visitas[b.id]?.nota || 0) - (visitas[a.id]?.nota || 0));

  if (!bares.length) {
    lista.innerHTML = `
      <div class="empty">
        <div class="empty-icon"><i class="ph ph-magnifying-glass"></i></div>
        <p>Nenhum bar encontrado</p>
      </div>`;
    return;
  }

  // Função que gera HTML de um card
  function _cardHtml(b) {
    const v = visitas[b.id];
    const visitado = !!v;
    const isFav = favoritos.includes(b.id);
    const nota = v?.nota;
    return `
      <div class="bar-card" onclick="window.abrirBottomSheet('${b.id}')"
           style="border:1px solid rgba(232,101,10,${visitado?'0.35':'0.15'})">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;padding:14px 14px 0">
          <div style="flex:1;min-width:0">
            <div class="bar-card-nome">
              ${visitado?'<i class="ph-fill ph-check-circle" style="color:var(--verde);font-size:0.9rem"></i> ':''}${sanitizeHtml(b.nome)}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px">
              ${(b.tipo||[]).map(t=>`<span class="bar-card-tag-tipo">${sanitizeHtml(t)}</span>`).join('')}
              ${b.cdb?'<span class="bar-card-tag-cdb">★ CDB</span>':''}
              <span class="bar-card-tag-reg"><i class="ph ph-map-pin"></i> ${sanitizeHtml(b.regiao)}${nota?` · <i class="ph-fill ph-star" style="color:var(--laranja)"></i> ${nota}/10`:''}</span>
            </div>
          </div>
          <button class="bar-card-btn-icon ${isFav?'salvo':''}"
            onclick="event.stopPropagation();window.toggleFavorito('${b.id}')"
            style="margin-top:-2px;flex-shrink:0">
            <i class="${isFav?'ph-fill':'ph'} ph-flag"></i>
          </button>
        </div>
        <div style="height:1px;background:rgba(232,101,10,0.15);margin:0 14px 10px"></div>
        <div class="bar-card-actions">
          <button class="bar-card-btn-visitar ${visitado?'visitado':''}"
            onclick="event.stopPropagation();if(navigator.vibrate)navigator.vibrate(30);${visitado?`window.toggleVisita('${b.id}')`:`window.abrirAvaliacaoDescobrir('${b.id}')`}">
            <i class="ph-fill ${visitado?'ph-check-circle':'ph-navigation-arrow'}"></i>
            ${visitado?'Visitado':'Marcar Visita'}
          </button>
          <button class="bar-card-btn-icon"
            onclick="event.stopPropagation();window.abrirBottomSheet('${b.id}')">
            <i class="ph ph-info"></i>
          </button>
        </div>
      </div>`;
  }

  // Renderiza primeiros 10 imediatamente
  lista.innerHTML = bares.slice(0, 10).map(_cardHtml).join('');

  // Resto em idle para não bloquear a UI
  if (bares.length > 10) {
    let idx = 10;
    function _renderProximo() {
      if (idx >= bares.length) return;
      const frag = document.createDocumentFragment();
      const div = document.createElement('div');
      div.innerHTML = bares.slice(idx, idx + 10).map(_cardHtml).join('');
      while (div.firstChild) frag.appendChild(div.firstChild);
      lista.appendChild(frag);
      idx += 10;
      if (idx < bares.length) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(_renderProximo, { timeout: 300 });
        } else {
          setTimeout(_renderProximo, 50);
        }
      }
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(_renderProximo, { timeout: 300 });
    } else {
      setTimeout(_renderProximo, 50);
    }
  }
});
}
window.setNotaDesc=function(barId,n){
  if(!window._notaDesc)window._notaDesc={};
  window._notaDesc[barId]=n;
  document.querySelectorAll(`#stars-desc-${barId} .estrela`).forEach((el,i)=>el.classList.toggle('on',i<n));
};
window.abrirAvaliacaoDescobrir=function(barId){
  if(!usuarioAtual||usuarioAtual.anonimo){
    if(navigator.vibrate)navigator.vibrate([30,20,30]);
    window.mostrarNotif('<i class="ph ph-user-plus"></i> Crie uma conta para registrar visitas!','info');
    setTimeout(()=>window.abrirLoginModal(), 400);
    return;
  }
  const bar=BARES.find(b=>b.id===barId);
  if(!bar)return;
  const v=visitas[barId];
  const nota=v?.nota||0;
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box" style="text-align:left;max-height:85vh;overflow-y:auto;">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--marrom);line-height:1.1;margin-bottom:4px">${sanitizeHtml(bar.nome)}</div>
      <div style="font-size:0.85rem;color:var(--laranja);margin-bottom:16px;font-weight:800"><i class="ph ph-fork-knife"></i> ${sanitizeHtml(bar.horario||'Horário não informado')}</div>
      <div class="nota-label" style="font-size:0.85rem;font-weight:800;color:var(--cinza);margin-bottom:6px">Sua nota (obrigatório)</div>
      <div class="estrelas" id="stars-desc-${sanitizeHtml(barId)}">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<span class="estrela ${nota>=n?'on':''}" onclick="window.setNotaDesc('${barId}',${n})"><i class="ph-fill ph-star"></i></span>`).join('')}</div>
      <div class="km-input-row" style="margin-top:12px">
        <span style="font-size:0.82rem;color:var(--cinza);font-weight:800">Km percorridos:</span>
        <input class="km-input" type="number" min="0" max="500" step="1" inputmode="decimal" id="km-desc-${sanitizeHtml(barId)}" value="${v?.km||''}" placeholder="0"/>
      </div>
      <div class="km-input-row" style="margin-top:8px">
        <span style="font-size:0.82rem;color:var(--cinza);font-weight:800">
          <i class="ph ph-beer-mug"></i> Gasto (R$):
        </span>
        <input class="km-input" type="number" min="0" max="9999" step="1"
          inputmode="decimal" id="gasto-desc-${sanitizeHtml(barId)}"
          value="${v?.gasto||''}" placeholder="0"/>
      </div>
      <textarea class="nota-comment" id="comment-desc-${sanitizeHtml(barId)}" rows="3" placeholder="Comentário da visita (aparece no feed)..." style="margin-top:12px;font-size:0.9rem;padding:12px"></textarea>
      <div style="margin-top:12px;margin-bottom:16px">
        <input type="file" accept="image/*" id="foto-input-desc-${sanitizeHtml(barId)}" style="display:none" onchange="window.previewFotoVisita('${barId}',this)"/>
        <button onclick="document.getElementById('foto-input-desc-${sanitizeHtml(barId)}').click()" style="width:100%;padding:12px;border-radius:12px;border:2px dashed #d0c0b0;background:#fdf8f3;color:var(--cinza);font-size:0.85rem;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-camera"></i> Adicionar foto ao Feed (opcional)</button>
        <div id="foto-preview-${sanitizeHtml(barId)}" style="display:none;margin-top:8px">
          <img id="foto-img-${sanitizeHtml(barId)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:10px;box-shadow:var(--shadow)"/>
        </div>
      </div>
      <div id="msg-desc-${sanitizeHtml(barId)}" style="font-size:0.8rem;color:#cc0000;min-height:18px;margin-bottom:8px;font-weight:700"></div>
      <button onclick="window.salvarNotaDesc('${barId}',this)" style="width:100%;padding:14px;border-radius:12px;background:var(--marrom);color:white;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px"><i class="ph ph-check-circle"></i> Confirmar Visita</button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
  if(!window._notaDesc)window._notaDesc={};
  window._notaDesc[barId]=nota;
};
window.abrirAvaliacaoObrigatoria=window.abrirAvaliacaoDescobrir;
window.abrirAvaliacaoObrigatoriaProximo=window.abrirAvaliacaoDescobrir;

window.salvarNotaDesc=async function(barId,btnSalvar){
  if(!usuarioAtual||usuarioAtual.anonimo){
    document.querySelector('.modal-overlay')?.remove();
    if(navigator.vibrate)navigator.vibrate([30,20,30]);
    window.mostrarNotif('<i class="ph ph-user-plus"></i> Crie uma conta para registrar visitas!','info');
    setTimeout(()=>window.abrirLoginModal(),400);
    return;
  }
  if(!usuarioAtual)return;
  const nota=window._notaDesc?.[barId]||0;
  const msg=document.getElementById('msg-desc-'+barId);
  if(!nota){msg.innerHTML='<i class="ph-fill ph-star"></i> Dê pelo menos nota 1 para registrar!';return;}
  btnSalvar.innerHTML='<i class="ph ph-spinner"></i> Salvando...';
  btnSalvar.disabled=true;
  const km=parseFloat(document.getElementById('km-desc-'+barId)?.value)||0;
  const gasto=parseFloat(document.getElementById('gasto-desc-'+barId)?.value)||0;
  const comentario=filtrarTexto(document.getElementById('comment-desc-'+barId)?.value||'');
  const d={visitado:true,nota,km,gasto,comentario,ts:visitas[barId]?.ts||Date.now()};
  if(window._fotosVisita?.[barId]){
    const blob=await fileParaBlob(window._fotosVisita[barId],800,0.6);
    if(blob){
      const url=await uploadFotoStorage(blob,`fotos/visitas/${usuarioAtual.uid}/${barId}_${Date.now()}.jpg`);
      d.fotoUrl=url;d.foto='';
    }
  }
  await db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(barId).set(d);
  if(comentario||d.fotoUrl){
    await db.collection('comentarios').doc(barId).collection('posts').add({
      uid:usuarioAtual.uid,nome:usuarioAtual.displayName||'Anônimo',texto:comentario,nota,fotoUrl:d.fotoUrl||'',ts:Date.now()
    });
  }
  visitas[barId]=d;
  salvarCache('visitas_'+usuarioAtual.uid,visitas);
  document.querySelector('.modal-overlay')?.remove();
  lancarConfete();
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Visita registrada com sucesso!');
if(navigator.vibrate)navigator.vibrate([30,20,30]);
setTimeout(()=>window._checarEmblemaNovo(barId),800);
  if(window._fotosVisita)delete window._fotosVisita[barId];
  if(document.getElementById('sheetOverlay'))window.fecharBottomSheet();
  renderDescobrir();
  setTimeout(() => window.renderCarrosselTrilhas?.('trilhasCarrossel'), 300);
  setTimeout(()=>{
  const card=document.querySelector(`[onclick*="${barId}"]`)?.closest('.bar-card');
  if(card){card.classList.add('pulse');setTimeout(()=>card.classList.remove('pulse'),600);}
},100);
  if(document.querySelector('.page.active')?.id==='page-perfil')renderPerfil();
  if(window._vistaProximos==='lista'&&_posUsuario)_renderListaProximos(_posUsuario.lat,_posUsuario.lng);
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
  delete _cacheAmigos[barId];
  _cacheVisitasGrupo=null;
};

window.abrirCadastroBar=function(){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box" style="text-align:left">
      <div style="font-family:'Georgia',serif;font-size:1.3rem;color:var(--marrom);margin-bottom:4px">sugerir um bar</div>
      <div style="font-size:0.78rem;color:var(--cinza);margin-bottom:16px">bares desconhecidos passam por aprovação antes de entrar no mapa</div>
      <div style="margin-bottom:10px"><label style="font-size:0.78rem;font-weight:700;color:var(--cinza);display:block;margin-bottom:4px">nome do bar</label><input id="cadastroNome" type="text" placeholder="ex: Boteco da Dona Neusa" style="width:100%;padding:10px 12px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom)"/></div>
      <div style="margin-bottom:10px"><label style="font-size:0.78rem;font-weight:700;color:var(--cinza);display:block;margin-bottom:4px">bairro / região</label><input id="cadastroBairro" type="text" placeholder="ex: Barreiro, Serra, Floresta..." style="width:100%;padding:10px 12px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom)"/></div>
      <div style="margin-bottom:10px"><label style="font-size:0.78rem;font-weight:700;color:var(--cinza);display:block;margin-bottom:4px">endereço</label><input id="cadastroEndereco" type="text" placeholder="rua, número" style="width:100%;padding:10px 12px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom)"/></div>
      <div style="margin-bottom:16px"><label style="font-size:0.78rem;font-weight:700;color:var(--cinza);display:block;margin-bottom:4px">por que esse bar merece estar aqui?</label><textarea id="cadastroMotivo" rows="3" placeholder="conte o que faz esse bar especial. quanto mais detalhe, maior a chance de aprovação." style="width:100%;padding:10px 12px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;resize:none;outline:none;color:var(--marrom)"></textarea></div>
      <div id="cadastroMsg" style="font-size:0.78rem;color:#cc0000;min-height:18px;margin-bottom:8px"></div>
      <button onclick="window.enviarCadastroBar()" style="width:100%;padding:12px;border-radius:12px;background:var(--marrom);color:white;border:none;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px">enviar sugestão</button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
};

window.enviarCadastroBar=async function(){
  const nome=document.getElementById('cadastroNome')?.value.trim();
  const bairro=document.getElementById('cadastroBairro')?.value.trim();
  const endereco=document.getElementById('cadastroEndereco')?.value.trim();
  const motivo=document.getElementById('cadastroMotivo')?.value.trim();
  const msg=document.getElementById('cadastroMsg');
  if(!nome){msg.textContent='informe o nome do bar.';return;}
  if(!motivo||motivo.length<20){msg.textContent='conte mais sobre o bar (mínimo 20 caracteres).';return;}
  await db.collection('sugestoesBares').add({nome,bairro,endereco,motivo,uid:usuarioAtual.uid,nomeUser:usuarioAtual.displayName||'Anônimo',status:'pendente',tipo:['trilha-bh'],ts:Date.now()});
  document.querySelector('.modal-overlay')?.remove();
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> sugestão enviada! vamos analisar em breve.');
};

window.sortearBar=function(){
  const naoVisitados=BARES.filter(b=>!visitas[b.id]);
  if(!naoVisitados.length){window.mostrarNotif('Você já visitou todos os bares! <i class="ph-fill ph-crown"></i>','info');return;}
  const sorteado=naoVisitados[Math.floor(Math.random()*naoVisitados.length)];
  const btn=document.getElementById('btnRoleta');
  if(btn){btn.style.transform='rotate(360deg) scale(1.1)';setTimeout(()=>btn.style.transform='',500);}
  window.mostrarNotif('<i class="ph ph-dice-three"></i> Sorteando um destino...','info');
  setTimeout(()=>window.abrirBottomSheet(sorteado.id),800);
};

window.gerarCardBar=function(b,visitado,nota,isFav,contexto='descobrir',distStr='',busca=''){
  const checkIcon=visitado?'<i class="ph-fill ph-check-circle" style="color:var(--verde)"></i> ':'';
  const novoHtml = b._isNovo && !visitado
  ? `<span style="background:#E8F5E9;color:#2D6A2D;border:1px solid #2D6A2D;
       border-radius:6px;font-size:0.6rem;font-weight:900;padding:1px 6px;
       vertical-align:middle;margin-left:6px;letter-spacing:.5px">NOVO</span>`
  : '';
  const favIcon=isFav?'<i class="ph-fill ph-flag" style="color:var(--laranja);font-size:1.1rem"></i>':'';
  const distHtml=distStr?`<div style="font-size:0.72rem;margin-top:6px;color:var(--cinza);font-weight:800;display:flex;align-items:center;gap:4px"><i class="ph ph-navigation-arrow"></i> ${distStr}</div>`:'';
  const notaHtml=nota?`<div style="font-size:0.75rem;margin-top:4px;font-weight:800;display:flex;align-items:center;gap:4px;color:var(--laranja)"><i class="ph-fill ph-star"></i> ${nota}/10</div>`:'';
  const revisitaHtml = b._revisitaSugerida
  ? `<div style="font-size:0.68rem;color:#185FA5;font-weight:800;margin-top:4px;
                 display:flex;align-items:center;gap:4px">
       <i class="ph ph-clock-countdown"></i> Faz tempo — vale revisitar!
     </div>`
  : '';
const nomeHL = busca ? _highlight(b.nome, busca) : sanitizeHtml(b.nome);
const pratoHL = busca ? _highlight(b.descricao||'', busca) : sanitizeHtml(b.descricao||'');
  return`
  <div class="bar-card ${visitado?'visitado':''}" id="card-${contexto}-${b.id}" onclick="window.abrirBottomSheet('${b.id}')">
    <div class="bar-header" style="padding-bottom:14px;display:flex;gap:12px">
      <div style="flex:1;min-width:0">
        <div class="bar-nome" style="display:flex;justify-content:space-between;align-items:flex-start">
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${checkIcon}${nomeHL}${novoHtml}</span>
          ${favIcon}
        </div>
        <div style="font-size:0.8rem;color:var(--laranja);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700">
          <i class="ph ph-fork-knife"></i> ${pratoHL}
        </div>
        ${distHtml}${notaHtml}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
      <button onclick="event.stopPropagation();window.toggleFavorito('${b.id}')" style="background:none;border:none;cursor:pointer;padding:2px;font-size:1rem">${isFav?'<i class="ph-fill ph-flag" style="color:var(--laranja)"></i>':'<i class="ph ph-flag" style="color:var(--cinza)"></i>'}</button>
        <span class="bar-regiao-badge"><i class="ph ph-map-pin"></i> ${b.regiao}</span>
      </div>
    </div>
    <div id="amigos-bar-${contexto}-${b.id}" style="padding:0 14px 10px"></div>
  </div>`;
};

(function(){
  let startY=0,puxando=false,ptrel=null;
  const THRESHOLD=65;
  document.addEventListener('touchstart',e=>{
    if(window.scrollY===0)startY=e.touches[0].clientY;
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!startY)return;
    const dy=e.touches[0].clientY-startY;
    if(dy>10&&window.scrollY===0){
      puxando=true;
      const el=document.getElementById('descobrirConteudo');
      if(el)el.style.transform=`translateY(${Math.min(dy*0.4,40)}px)`;
    }
  },{passive:true});
  document.addEventListener('touchend',e=>{
    const dy=e.changedTouches[0].clientY-startY;
    const el=document.getElementById('descobrirConteudo');
    if(el)el.style.transform='';
    if(puxando&&dy>THRESHOLD){
      window.mostrarNotif('<i class="ph ph-arrows-clockwise"></i> Atualizando...','info');
      window._dadosJaCarregados=false;
      renderDescobrir();
      window.renderEventosSection?.('eventosSection');
    }
    startY=0;puxando=false;
  },{passive:true});
})();
window.mostrarBtnEventos = async function() {
  const eventos = await window.carregarEventos().catch(() => []);
  const total = eventos.length;
  const btn = document.getElementById('btnEventosDescobrir');
  if (btn) {
    btn.innerHTML = `
      <i class="ph ph-calendar"></i> Eventos
      ${total > 0 ? `<span class="btn-eventos-badge">${total}</span>` : ''}`;
  }
};
window.toggleFiltrosAvancados = function() {
  window.abrirFiltrosToast();
};
window.pedirLoginParaAvaliar = function() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px"><i class="ph-fill ph-beer-bottle"></i></div>
      <div class="modal-titulo">Salve sua visita!</div>
      <p class="modal-desc">Crie uma conta gratuita para registrar suas visitas, ganhar emblemas e aparecer no ranking.</p>
      <button onclick="this.closest('.modal-overlay').remove();window.abrirLoginModal()"
        style="width:100%;padding:12px;border-radius:12px;background:var(--marrom);color:white;
               border:none;font-size:0.9rem;font-weight:800;cursor:pointer;
               font-family:'Nunito',sans-serif;margin-bottom:10px">
        <i class="ph ph-sign-in"></i> Entrar / Criar conta
      </button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">
        Continuar explorando
      </button>
    </div>`;
  document.body.appendChild(overlay);
};
window.carregarBarSemana?.().then(bs => {
  const el = document.getElementById('barSemanaCard');
  if (!el || !bs) return;
  const bar = BARES.find(b => b.id === bs.barId);
  if (!bar) return;
  const visitado = !!visitas[bar.id];
  const xpBonus = bs.xpBonus || 20;
  const fimSemana = bs.tsInicio + 7 * 24 * 60 * 60 * 1000;
  if (Date.now() > fimSemana) return;

  el.innerHTML = `
    <div style="background:var(--marrom);border-radius:14px;padding:14px 16px;
                position:relative;overflow:hidden;cursor:pointer"
         onclick="window.abrirBottomSheet('${bar.id}')">
      <div style="position:absolute;top:0;right:0;bottom:0;width:40%;
                  background:linear-gradient(90deg,transparent,rgba(255,140,0,0.15))"></div>
      <div style="font-size:0.6rem;font-weight:900;letter-spacing:1.5px;
                  color:var(--laranja);text-transform:uppercase;margin-bottom:2px">
        <i class="ph-fill ph-star"></i> Bar da Semana
      </div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:white;
                  line-height:1;margin-bottom:4px">${sanitizeHtml(bar.nome)}</div>
      <div style="font-size:0.75rem;color:rgba(255,255,255,0.65);margin-bottom:10px;
                  font-style:italic;line-height:1.4">
        ${sanitizeHtml(bs.curiosidade || bar.descricao || '')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:0.7rem;color:rgba(255,255,255,0.5)">
          <i class="ph ph-map-pin"></i> ${bar.regiao}
        </span>
        <span style="background:var(--laranja);color:white;border-radius:20px;
                     font-size:0.7rem;font-weight:800;padding:4px 10px">
          ${visitado
            ? '<i class="ph-fill ph-check-circle"></i> Visitado!'
            : `<i class="ph-fill ph-lightning"></i> +${xpBonus} XP extra`}
        </span>
      </div>
    </div>`;
});
window.carregarDesafioMensal = async function() {
  try {
    const mes = new Date().toISOString().slice(0,7);
    const doc = await db.collection('desafios').doc(mes).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch(e) { return null; }
};

window.verificarDesafioCompleto = function(desafio) {
  if (!desafio?.filtro) return { progresso:0, meta:0, completo:false };
  let baresFiltrados = BARES;
  if (desafio.filtro.regiao)
    baresFiltrados = baresFiltrados.filter(b => b.regiao === desafio.filtro.regiao);
  if (desafio.filtro.tipo)
    baresFiltrados = baresFiltrados.filter(b => b.tipo?.includes(desafio.filtro.tipo));
  if (desafio.filtro.ids)
    baresFiltrados = baresFiltrados.filter(b => desafio.filtro.ids.includes(b.id));
  const meta = desafio.meta || baresFiltrados.length;
  const progresso = baresFiltrados.filter(b => visitas[b.id]).length;
  return { progresso, meta, completo: progresso >= meta };
};
window.abrirFiltrosToast = function() {
  // Remove toast anterior se houver
  document.getElementById('filtrosToast')?.remove();
 
  const toast = document.createElement('div');
  toast.id = 'filtrosToast';
  toast.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;
    background:var(--surface);
    border-radius:24px 24px 0 0;
    box-shadow:0 -4px 32px rgba(0,0,0,0.18);
    z-index:200;
    padding:0 0 calc(env(safe-area-inset-bottom) + 16px);
    transform:translateY(100%);
    transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);
    max-height:80vh;
    overflow-y:auto;
  `;
 
  const vibeAtiva = window._vibeFiltro || '';
  const tipoAtivo = window._tipoFiltro || 'Todos';
 
  const grupos = [
    { label:'Tipo',     icon:'ph-funnel',        itens:[
      {id:'',           label:'Todos',            tipo:'tipo'},
      {id:'Bar',        label:'Bar',              tipo:'tipo'},
      {id:'Petiscaria', label:'Petiscaria',       tipo:'tipo'},
      {id:'Cervejaria', label:'Cervejaria',       tipo:'tipo'},
      {id:'Sinuca',     label:'Sinuca',           tipo:'tipo'},
      {id:'CDB',        label:'★ CDB',            tipo:'tipo'},
    ]},
    { label:'Ambiente', icon:'ph-tree',           itens:[
      {id:'externo',    label:'Área Externa'},
      {id:'vista',      label:'Com Vista'},
      {id:'coberto',    label:'Cobertura'},
      {id:'romantico',  label:'Romântico'},
      {id:'sofisticado',label:'Sofisticado'},
      {id:'jogos',      label:'Jogos de Bar'},
      {id:'sinuca',     label:'Sinuca'},
    ]},
    { label:'Público',  icon:'ph-users-three',    itens:[
      {id:'petfriendly',label:'Pet Friendly'},
      {id:'lgbtq',      label:'LGBTQ+'},
      {id:'criancas',   label:'Família'},
      {id:'feminino',   label:'Feito por Elas'},
      {id:'acessivel',  label:'Acessível'},
    ]},
    { label:'Serviços', icon:'ph-lightning',      itens:[
      {id:'musica-ao-vivo',label:'Música ao Vivo'},
      {id:'esportes',   label:'Esportes'},
      {id:'happy-hour', label:'Happy Hour'},
      {id:'entrega',    label:'Delivery'},
      {id:'reserva',    label:'Aceita Reserva'},
      {id:'wifi',       label:'Wi-Fi'},
      {id:'vegano',     label:'Vegano'},
      {id:'vinho',      label:'Carta de Vinhos'},
    ]},
  ];
 
  function chipClass(item) {
    if (item.tipo === 'tipo') {
      return tipoAtivo === (item.id || 'Todos') ? 'ativo' : '';
    }
    return vibeAtiva === item.id ? 'ativo' : '';
  }
 
  function chipClick(item) {
    if (item.tipo === 'tipo') {
      return `window._tipoFiltro='${item.id||'Todos'}';window._vibeFiltro='';window._forcaRerenderDescobrir=true;window.atualizarBadgeFiltros();renderListaDescobrir();window.fecharFiltrosToast()`;
    }
    return `window._vibeFiltro='${item.id}';window._tipoFiltro='Todos';window._forcaRerenderDescobrir=true;window.atualizarBadgeFiltros();renderListaDescobrir();window.fecharFiltrosToast()`;
  }
 
  toast.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;padding:12px 0 4px">
      <div style="width:36px;height:4px;background:var(--border);border-radius:4px"></div>
    </div>
    <div style="padding:0 20px 4px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--marrom);letter-spacing:1px">
        <i class="ph ph-sliders"></i> Filtros
      </div>
      <button onclick="window._vibeFiltro='';window._tipoFiltro='Todos';window._forcaRerenderDescobrir=true;window.atualizarBadgeFiltros();renderListaDescobrir();window.fecharFiltrosToast()"
        style="background:none;border:none;color:var(--cinza);font-size:0.78rem;font-weight:800;
               cursor:pointer;font-family:'Nunito',sans-serif;padding:4px 8px;
               border-radius:10px;border:1px solid var(--border)">
        <i class="ph ph-x"></i> Limpar
      </button>
    </div>
 
    ${grupos.map(g => `
      <div style="padding:10px 20px 0">
        <div style="font-size:0.62rem;font-weight:900;color:var(--cinza);
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;
                    display:flex;align-items:center;gap:5px">
          <i class="ph ${g.icon}"></i> ${g.label}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;padding-bottom:4px">
          ${g.itens.map(item => `
            <button class="chip-tipo ${chipClass(item)}"
              onclick="${chipClick(item)}"
              style="flex-shrink:0">
              ${item.label}
            </button>`).join('')}
        </div>
      </div>
    `).join('')}
    <div style="height:8px"></div>
  `;
 
  // Overlay escuro atrás
  const overlay = document.createElement('div');
  overlay.id = 'filtrosToastOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199;
    animation:fadeIn 0.2s ease;
  `;
  overlay.onclick = () => window.fecharFiltrosToast();
  document.body.appendChild(overlay);
  document.body.appendChild(toast);
 
  // Anima entrada
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
  });
 
  // Swipe para fechar
  let startY = 0;
  toast.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, {passive:true});
  toast.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - startY > 80) window.fecharFiltrosToast();
  }, {passive:true});
};
 window._forcaRerenderDescobrir = true;
window.fecharFiltrosToast = function() {
  const toast = document.getElementById('filtrosToast');
  const overlay = document.getElementById('filtrosToastOverlay');
  if (toast) {
    toast.style.transform = 'translateY(100%)';
    setTimeout(() => toast.remove(), 350);
  }
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  }
  window._atualizarChipsAtivos?.();
};
window._atualizarChipsAtivos = function() {
  const cont = document.getElementById('filtrosAtivosChips');
  if (!cont) return;
  const chips = [];
  if (window._tipoFiltro && window._tipoFiltro !== 'Todos') {
    chips.push(`
      <span style="display:inline-flex;align-items:center;gap:4px;background:var(--laranja);
                   color:white;border-radius:20px;padding:4px 10px;font-size:0.72rem;
                   font-weight:800;white-space:nowrap;cursor:pointer"
            onclick="window._tipoFiltro='Todos';window.atualizarBadgeFiltros();renderListaDescobrir();window._atualizarChipsAtivos()">
        ${sanitizeHtml(window._tipoFiltro)} <i class="ph ph-x" style="font-size:0.65rem"></i>
      </span>`);
  }
  if (window._vibeFiltro) {
    const label = VIBES.find(v => v.id === window._vibeFiltro)?.label || window._vibeFiltro;
    chips.push(`
      <span style="display:inline-flex;align-items:center;gap:4px;background:var(--marrom);
                   color:white;border-radius:20px;padding:4px 10px;font-size:0.72rem;
                   font-weight:800;white-space:nowrap;cursor:pointer"
            onclick="window._vibeFiltro='';window.atualizarBadgeFiltros();renderListaDescobrir();window._atualizarChipsAtivos()">
        ${sanitizeHtml(label)} <i class="ph ph-x" style="font-size:0.65rem"></i>
      </span>`);
  }
  cont.innerHTML = chips.join('');
};

window.atualizarBadgeFiltros = function() {
  const badge = document.getElementById('badgeFiltros');
  if (!badge) return;
  let ativos = 0;
  if (window._tipoFiltro && window._tipoFiltro !== 'Todos') ativos++;
  if (window._vibeFiltro) ativos++;
  badge.style.display = ativos > 0 ? 'inline' : 'none';
  badge.textContent = ativos;
  window._atualizarChipsAtivos?.();
};