function renderFeed() {
  const cont = document.getElementById('page-feed');
  if (!cont) return;

  cont.innerHTML = `
    <!-- Filtros de feed -->
    <div style="position:sticky;top:0;z-index:50;background:var(--surface);border-bottom:1px solid var(--border)">
      <div style="display:flex;gap:0;overflow-x:auto;scrollbar-width:none">
        ${[
          { id: 'global', label: 'Global',  icon: 'ph-globe' },
          { id: 'amigos', label: 'Amigos',  icon: 'ph-users' },
          { id: 'grupo',  label: 'Grupo',   icon: 'ph-user-circle-gear' },
        ].map(f => `
          <button
            class="feed-tab-btn ${(window.APP?.feedFiltro||'global')===f.id?'ativo':''}"
            onclick="window._setFeedFiltro('${f.id}')"
            style="
              flex:1;padding:13px 8px;border:none;background:none;
              font-size:0.78rem;font-weight:800;font-family:'Nunito',sans-serif;
              color:${(window.APP?.feedFiltro||'global')===f.id?'var(--laranja)':'var(--cinza)'};
              border-bottom:2px solid ${(window.APP?.feedFiltro||'global')===f.id?'var(--laranja)':'transparent'};
              cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
              transition:all 0.15s;white-space:nowrap
            ">
            <i class="ph ${f.icon}"></i> ${f.label}
          </button>`).join('')}
      </div>
    </div>

    <!-- Ranking rápido -->
    <div style="padding:12px 16px 0">
      <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
        <button onclick="window.irPara('perfil');setTimeout(()=>window._setAbaPerfilAtiva?.('ranking'),400)"
          style="flex-shrink:0;padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);
                 background:white;color:var(--marrom);font-size:0.75rem;font-weight:800;
                 cursor:pointer;font-family:'Nunito',sans-serif;display:flex;align-items:center;gap:6px">
          <i class="ph-fill ph-trophy" style="color:var(--laranja)"></i> Ranking
        </button>
        <button onclick="window.abrirSheetEventos()"
          style="flex-shrink:0;padding:8px 16px;border-radius:20px;border:1.5px solid #1B5E9B;
                 background:#1B5E9B;color:white;font-size:0.75rem;font-weight:800;
                 cursor:pointer;font-family:'Nunito',sans-serif;display:flex;align-items:center;gap:6px">
          <i class="ph ph-calendar"></i> Eventos
        </button>
        <button onclick="window.irPara('perfil');setTimeout(()=>window._setAbaPerfilAtiva?.('grupo'),400)"
          style="flex-shrink:0;padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);
                 background:white;color:var(--marrom);font-size:0.75rem;font-weight:800;
                 cursor:pointer;font-family:'Nunito',sans-serif;display:flex;align-items:center;gap:6px">
          <i class="ph ph-user-circle-gear" style="color:var(--laranja)"></i> Grupos
        </button>
      </div>
    </div>
<div id="feedStories" style="display:flex;gap:12px;padding:12px 16px 4px;overflow-x:auto;scrollbar-width:none"></div>
    <!-- Lista feed -->
    <div id="feedLista" style="padding:12px 16px 100px;background:var(--surface);min-height:100%"></div>
  `;
  renderFeedLista(window.APP?.feedFiltro || 'global');
  window.renderStoriesFeed();
}

window._setFeedFiltro = function(f) {
  window.APP = window.APP || {};
  window.APP.feedFiltro = f;
  document.querySelectorAll('.feed-tab-btn').forEach(btn => {
    const ativo = btn.getAttribute('onclick')?.includes(`'${f}'`);
    btn.style.color = ativo ? 'var(--laranja)' : 'var(--cinza)';
    btn.style.borderBottom = ativo ? '2px solid var(--laranja)' : '2px solid transparent';
  });
  renderFeedLista(f);
};
function renderCardFeedHtml(e, reacoesMapa) {
  const eventoId = getEventoId(e);
  const minhasReacoes = JSON.parse(localStorage.getItem('reacoes_' + (usuarioAtual?.uid||'')) || '{}');
  const minhaReacao = minhasReacoes[eventoId] || null;
  const av = e.avatar || 'ph-beer-bottle';

  const avatarHtml = av.startsWith('https://') || av.startsWith('data:')
    ? `<img src="${av}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;display:block"/>`
    : av.startsWith('ph-')
    ? `<i class="ph-fill ${av}" style="font-size:1.5rem;color:var(--marrom)"></i>`
    : `<span style="font-size:1.5rem">${av}</span>`;

  const notaHtml = e.nota ? `
    <div style="display:flex;align-items:center;gap:4px;padding:0 14px 6px">
      <span style="font-size:0.78rem;color:var(--laranja);font-weight:800">
        ${'<i class="ph-fill ph-star"></i>'.repeat(e.nota)} ${e.nota}/10
      </span>
    </div>` : '';

  const comentarioHtml = e.comentario
    ? `<div style="font-size:0.83rem;color:#555;padding:0 14px 10px;
        line-height:1.55;border-left:3px solid var(--laranja);margin:0 14px 10px;
        padding-left:10px;font-style:italic">"${sanitizeHtml(e.comentario)}"</div>`
    : '';

  const fotoHtml = (e.fotoUrl || e.foto)
    ? `<div style="margin:0 0 10px;overflow:hidden;border-radius:0">
        <img src="${e.fotoUrl||e.foto}"
          style="width:100%;max-height:260px;object-fit:cover;display:block;cursor:pointer"
          onclick="window._verFotoFeed('${eventoId}')"/>
       </div>` : '';

  const REACOES_LIST = [
    '<i class="ph-fill ph-beer-bottle"></i>',
    '<i class="ph-fill ph-fire"></i>',
    '<i class="ph-fill ph-heart"></i>',
    '<i class="ph ph-smiley-x-eyes"></i>'
  ];

  const reacoesHtml = `
    <div style="position:relative">
      <button onclick="window.togglePicker('${eventoId}')"
        style="display:flex;align-items:center;gap:5px;background:none;
               border:1.5px solid var(--border);border-radius:20px;
               padding:6px 14px;font-size:0.8rem;font-weight:700;
               color:var(--cinza);cursor:pointer;font-family:'Nunito',sans-serif">
        ${minhaReacao || '<i class="ph ph-smiley"></i>'} Reagir
      </button>
      <div class="reacao-picker" id="picker-${eventoId}">
        ${REACOES_LIST.map(r => `
          <button class="reacao-btn ${minhaReacao===r?'ativo':''}"
            onclick="window.reagir('${eventoId}','${r.replace(/'/g,"\\'")}')">${r}</button>
        `).join('')}
      </div>
    </div>`;

  const comentBtnHtml = e.barId
    ? `<button onclick="window.toggleComentariosFeed('${sanitizeHtml(e.barId)}',this)"
        style="display:flex;align-items:center;gap:5px;background:none;
               border:1.5px solid var(--border);border-radius:20px;
               padding:6px 14px;font-size:0.8rem;font-weight:700;
               color:var(--cinza);cursor:pointer;font-family:'Nunito',sans-serif">
        <i class="ph ph-chat-teardrop-text"></i> <span>0</span>
       </button>` : '';

  return `
  <div class="feed-card" style="
    background:white;border-radius:16px;margin-bottom:12px;
    box-shadow:0 2px 12px rgba(60,20,0,0.08);overflow:hidden;
    animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 10px;cursor:pointer"
      onclick="window.abrirPerfil('${sanitizeHtml(e.uid)}')">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--laranja-claro);
                  display:flex;align-items:center;justify-content:center;
                  flex-shrink:0;overflow:hidden">
        ${avatarHtml}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${sanitizeHtml(e.nome) || 'Anônimo'}
        </div>
        <div style="font-size:0.72rem;color:var(--cinza);margin-top:1px">
          ${sanitizeHtml(e.visita_extra)
            ? `retornou pela ${sanitizeHtml(e.numero_visita||2)}ª vez <i class="ph ph-arrow-counter-clockwise"></i>`
            : `marcou um bar na trilha <i class="ph ph-compass"></i>`}
        </div>
      </div>
      <div style="font-size:0.68rem;color:var(--cinza);font-weight:700;flex-shrink:0">
        ${sanitizeHtml(tempoRelativo(e.ts))}
      </div>
    </div>

    <!-- Bar -->
    <div style="display:flex;align-items:center;gap:8px;padding:0 14px 10px;
                cursor:pointer" onclick="window.abrirBottomSheet('${sanitizeHtml(e.barId)}')">
      <div style="width:32px;height:32px;border-radius:8px;background:var(--laranja);
                  display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="ph-fill ph-beer-bottle" style="color:white;font-size:1rem"></i>
      </div>
      <div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.05rem;
                    color:var(--marrom);letter-spacing:0.3px;line-height:1">
          ${sanitizeHtml(e.bar || '')}
        </div>
        ${e.barId ? `<div style="font-size:0.65rem;color:var(--cinza);font-weight:700">
          toque para ver o bar
        </div>` : ''}
      </div>
    </div>

    ${notaHtml}
    ${comentarioHtml}
    ${fotoHtml}

    <!-- Ações -->
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px 12px;
                border-top:1px solid var(--border)">
      ${reacoesHtml}
      ${comentBtnHtml}
    </div>

    <!-- Comentários -->
    <div id="feed-comm-${sanitizeHtml(e.barId)}" style="display:none;padding:0 14px 12px"></div>
  </div>`;
}
async function renderFeedLista(filtro) {
  const cont = document.getElementById('feedLista');
  if (!cont) return;


  cont.innerHTML = `
    <div class="skeleton-card" style="height:120px;margin-bottom:12px"></div>
    <div class="skeleton-card" style="height:120px;margin-bottom:12px"></div>
    <div class="skeleton-card" style="height:120px;margin-bottom:12px"></div>`;

  try {
    let eventos = [];
    if (filtro === 'global' || !filtro) {
  const [feedDoc, eventosSnap] = await Promise.all([
    db.collection('ranking').doc('feed').get(),
    db.collection('eventos').orderBy('ts','desc').limit(20).get()
  ]);
  const visitas = feedDoc.exists ? (feedDoc.data().eventos || []) : [];
  const evts = eventosSnap.docs.map(d => ({...d.data(), id: d.id, tipo: d.data().tipo || 'evento'}));
  eventos = [...evts, ...visitas].sort((a,b) => (b.ts||0) - (a.ts||0));
}else if (filtro === 'amigos') {
  const feedDoc = await db.collection('ranking').doc('feed').get();
  const todos = feedDoc.exists ? (feedDoc.data().eventos || []) : [];
  const grupoSnap = await db.collection('grupos').where('membros','array-contains',usuarioAtual.uid).limit(1).get();
  const membros = grupoSnap.empty ? [] : (grupoSnap.docs[0].data().membros || []);
  eventos = todos.filter(e => membros.includes(e.uid) && e.uid !== usuarioAtual.uid);
} else if (filtro === 'grupo') {
  const feedDoc = await db.collection('ranking').doc('feed').get();
  const todos = feedDoc.exists ? (feedDoc.data().eventos || []) : [];
  const grupoSnap = await db.collection('grupos').where('membros','array-contains',usuarioAtual.uid).limit(1).get();
  const membros = grupoSnap.empty ? [] : (grupoSnap.docs[0].data().membros || []);
  eventos = todos.filter(e => membros.includes(e.uid));
}

    if (!eventos.length) {
      cont.innerHTML = `
        <div class="empty">
          <div class="empty-icon"><i class="ph ph-beer-bottle"></i></div>
          <p>Nenhuma atividade ainda.<br>Seja o primeiro a marcar um bar!</p>
        </div>`;
      return;
    }

window.feedEventosCache = eventos; 
cont.innerHTML = eventos.map(e => renderCardFeedHtml(e, {})).join('');

  } catch(err) {
    cont.innerHTML = `
      <div class="empty">
        <div class="empty-icon"><i class="ph-fill ph-warning"></i></div>
        <p>Erro ao carregar feed</p>
      </div>`;
  }
}

window.reagir=async function(eventoId,reacao){
  document.getElementById('picker-'+eventoId)?.classList.remove('open');
  const key='reacoes_'+usuarioAtual.uid;
  const minhasReacoes=JSON.parse(localStorage.getItem(key)||'{}');
  const reacaoAnterior=minhasReacoes[eventoId]||null;
  const ref=db.collection('reacoes').doc(eventoId);
  if(reacaoAnterior===reacao){
    delete minhasReacoes[eventoId];
    localStorage.setItem(key,JSON.stringify(minhasReacoes));
    await ref.set({[reacao]:firebase.firestore.FieldValue.increment(-1)},{merge:true});
  }else{
    if(reacaoAnterior)await ref.set({[reacaoAnterior]:firebase.firestore.FieldValue.increment(-1)},{merge:true});
    minhasReacoes[eventoId]=reacao;
    localStorage.setItem(key,JSON.stringify(minhasReacoes));
    await ref.set({[reacao]:firebase.firestore.FieldValue.increment(1)},{merge:true});
  }
  const minhasReacoesAtual=JSON.parse(localStorage.getItem(key)||'{}');
  const minhaReacaoAtual=minhasReacoesAtual[eventoId]||null;
  const refAtual=await db.collection('reacoes').doc(eventoId).get();
  const dadosAtual=refAtual.exists?refAtual.data():{};
  const picker=document.getElementById('picker-'+eventoId);
  if(picker){const btn=picker.previousElementSibling;if(btn)btn.innerHTML=`${minhaReacaoAtual||'👍'} Reagir`;}
  const barraEl=picker?.parentElement?.nextElementSibling;
  if(barraEl&&barraEl.classList.contains('reacoes-bar')){
    const REACOES=['<i class="ph-fill ph-beer-bottle"></i>','<i class="ph-fill ph-fire"></i>','<i class="ph-fill ph-heart"></i>','<i class="ph ph-smiley-x-eyes"></i>'];
    barraEl.innerHTML=REACOES.filter(r=>dadosAtual[r]>0).map(r=>`<button class="reacao-btn ${minhaReacaoAtual===r?'ativo':''}" onclick="window.reagir('${eventoId}','${r}')">${r} <span>${dadosAtual[r]}</span></button>`).join('');
  }
};

window.togglePicker=function(eventoId){
  document.querySelectorAll('.reacao-picker.open').forEach(p=>{if(p.id!=='picker-'+eventoId)p.classList.remove('open');});
  document.getElementById('picker-'+eventoId)?.classList.toggle('open');
};

window.denunciarEvento=async function(eventoId,uid,nome){
  const ov = document.createElement('div');
ov.className = 'modal-overlay';
ov.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:3000';
ov.innerHTML = `<div style="background:white;border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center">
  <p style="font-weight:800;margin-bottom:8px">Denunciar conteúdo?</p>
  <p style="font-size:0.85rem;color:#666;margin-bottom:20px">${sanitizeHtml(nome)}</p>
  <div style="display:flex;gap:10px">
    <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
    <button id="btnConfDenuncia" style="flex:1;padding:10px;border-radius:8px;background:var(--danger,#c00);color:white;border:none;cursor:pointer;font-weight:800">Confirmar</button>
  </div>
</div>`;
ov.querySelector('#btnConfDenuncia').onclick = async () => {
  ov.remove();
  await db.collection('denuncias').add({eventoId, uid, nome: sanitizeHtml(nome), denunciadoPor: usuarioAtual.uid, ts: Date.now()});
  mostrarNotif('<i class="ph-fill ph-flag"></i> Denúncia enviada.');
};
document.body.appendChild(ov);
};
window.enviarComentarioFeed=async function(barId){
  const txt=document.getElementById('feedcomm-txt-'+barId)?.value.trim();
  if(!txt){mostrarNotif('Escreva algo antes de comentar');return;}
  await db.collection('comentarios').doc(barId).collection('posts').add({uid:usuarioAtual.uid,nome:sanitizeHtml(usuarioAtual.displayName)||'Anônimo',texto:sanitizeHtml(txt),nota:0,ts:Date.now()});
  document.getElementById('feedcomm-txt-'+barId).value='';
  mostrarNotif('<i class="ph ph-chat-teardrop-text"></i> Comentário enviado!');
  const btn=document.querySelector(`[onclick="window.toggleComentariosFeed('${barId}',this)"]`);
  window.toggleComentariosFeed(barId,btn);
  setTimeout(()=>window.toggleComentariosFeed(barId,btn),100);
};

window.toggleComentariosFeed=async function(barId,btn){
  const cont=document.getElementById('feed-comm-'+barId);
  if(!cont)return;
  if(cont.style.display!=='none'){cont.style.display='none';if(btn)btn.innerHTML='<i class="ph ph-chat-teardrop-text"></i> <span id="commcount-'+barId+'">0</span>';return;}
  cont.style.display='block';
  if(btn)btn.innerHTML='<i class="ph ph-chat-teardrop-text"></i> Fechar';
  cont.innerHTML='<p style="font-size:0.78rem;color:var(--cinza);padding:4px 0">Carregando...</p>';
  const snap=await db.collection('comentarios').doc(barId).collection('posts').orderBy('ts','desc').limit(5).get();
  if(snap.empty){cont.innerHTML='<p style="font-size:0.78rem;color:var(--cinza);padding:4px 0">Nenhum comentário ainda</p>';return;}
  const posts=snap.docs.map(d=>d.data()).filter(c=>c.texto&&(c.nota===0||!c.nota));
  const countEl=document.getElementById('commcount-'+barId);
  if(countEl)countEl.textContent=posts.length;
  cont.innerHTML=(posts.length?posts.map(c=>`<div style="padding:8px 0;border-bottom:1px solid #f0e0d0"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px"><div><div style="font-size:0.8rem;font-weight:700;color:var(--marrom)">${sanitizeHtml(c.nome)}</div><div style="font-size:0.78rem;color:var(--cinza)">${sanitizeHtml(c.texto)}</div><div style="font-size:0.7rem;color:#bbb">${tempoRelativo(c.ts)}</div></div><button onclick="window.denunciarComentario('${barId}','${c.uid}','${sanitizeHtml(c.nome)}')" style="background:none;border:none;color:#bbb;font-size:0.72rem;cursor:pointer;font-family:'Nunito',sans-serif;padding:2px 6px;flex-shrink:0"><i class="ph-fill ph-flag"></i></button></div></div>`).join(''):'<p style="font-size:0.78rem;color:var(--cinza);padding:4px 0">Nenhum comentário ainda</p>')+`
  <div style="margin-top:10px">
    <textarea id="feedcomm-txt-${barId}" rows="2" placeholder="Escreva um comentário..." style="width:100%;padding:8px 10px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.82rem;font-family:'Nunito',sans-serif;resize:none;outline:none;color:var(--marrom);margin-bottom:6px"></textarea>
    <button onclick="window.enviarComentarioFeed('${barId}')" style="width:100%;padding:8px;border-radius:8px;background:var(--laranja);color:white;border:none;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Comentar</button>
  </div>`;
};
window.denunciarComentario = async function(barId, uid, nome) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:3000';
  ov.innerHTML = `<div style="background:white;border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center">
    <p style="font-weight:800;margin-bottom:8px">Denunciar comentário?</p>
    <p style="font-size:0.85rem;color:#666;margin-bottom:20px">${sanitizeHtml(nome)}</p>
    <div style="display:flex;gap:10px">
      <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
      <button id="btnConfDenunciaComm" style="flex:1;padding:10px;border-radius:8px;background:#c00;color:white;border:none;cursor:pointer;font-weight:800">Confirmar</button>
    </div>
  </div>`;
  ov.querySelector('#btnConfDenunciaComm').onclick = async () => {
    ov.remove();
    await db.collection('denuncias').add({barId, uid, nome: sanitizeHtml(nome), tipo: 'comentario', denunciadoPor: usuarioAtual.uid, ts: Date.now()});
    mostrarNotif('<i class="ph-fill ph-flag"></i> Denúncia enviada.');
  };
  document.body.appendChild(ov);
};
function _renderEventosNaLista(eventos) {
  window._renderEventosNaLista = _renderEventosNaLista;
  const cont = document.getElementById('feedLista');
  if (!cont) return;
  if (!eventos.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon"><i class="ph ph-beer-bottle"></i></div><p>Nenhum resultado encontrado</p></div>`;
    return;
  }
  cont.innerHTML = eventos.map(e => renderCardFeedHtml(e, {})).join('');
}
window.filtrarFeed = function() {
  const busca = document.getElementById('feedBusca')?.value.toLowerCase() || '';
  const filtrados = (window.feedEventosCache || []).filter(e =>
    (e.bar||'').toLowerCase().includes(busca) ||
    (e.nome||'').toLowerCase().includes(busca) ||
    (e.comentario||'').toLowerCase().includes(busca)
  );
  _renderEventosNaLista(filtrados);
};
window.renderStoriesFeed = function() {
  const cont = document.getElementById('feedStories');
  if (!cont) return;
  const eventos = window.feedEventosCache || [];
  const agora = Date.now();
  const vinte4h = 24 * 60 * 60 * 1000;
  const vistos = new Map();
  eventos.filter(e => e.ts && agora - e.ts < vinte4h).forEach(e => {
    if (!vistos.has(e.uid)) vistos.set(e.uid, e);
  });
  if (!vistos.size) { cont.style.display = 'none'; return; }
  cont.style.display = 'flex';
  cont.innerHTML = [...vistos.values()].map(e => {
    const av = e.avatar || 'ph-beer-bottle';
    const avatarHtml = av.startsWith('https://') || av.startsWith('data:')
      ? `<img src="${av}" style="width:48px;height:48px;border-radius:50%;object-fit:cover"/>`
      : av.startsWith('ph-')
      ? `<i class="ph-fill ${av}" style="font-size:1.4rem;color:var(--marrom)"></i>`
      : `<span style="font-size:1.4rem">${av}</span>`;
    return `
      <div style="flex-shrink:0;text-align:center;cursor:pointer"
        onclick="window.abrirPerfil('${sanitizeHtml(e.uid)}')">
        <div style="width:52px;height:52px;border-radius:50%;
                    background:var(--laranja-claro);
                    border:2.5px solid var(--laranja);
                    display:flex;align-items:center;justify-content:center;
                    overflow:hidden;margin:0 auto 4px">
          ${avatarHtml}
        </div>
        <div style="font-size:0.62rem;font-weight:700;color:var(--cinza);
                    max-width:52px;white-space:nowrap;overflow:hidden;
                    text-overflow:ellipsis">
          ${sanitizeHtml(e.nome||'').split(' ')[0]}
        </div>
      </div>`;
  }).join('');
};