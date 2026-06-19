window.abrirBottomSheet=function(id){
  const b=BARES.find(x=>x.id===id);
  if(!b)return;
  const v=visitas[id];
  const visitado=!!v;
  const nota=v?.nota||0;
  const isFav=favoritos.includes(b.id);
  const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.nome+' '+b.end)}`;
  let historicoHtml='';
if(visitado){
  const fotoHtml=(v.fotoUrl||v.foto)?`
    <div style="margin-bottom:8px;border-radius:10px;overflow:hidden;cursor:pointer" onclick="window.verFotoVisita('${id}')">
      <img src="${v.fotoUrl||v.foto}" style="width:100%;max-height:180px;object-fit:cover;display:block"/>
      <div style="background:rgba(0,0,0,0.04);padding:6px 10px;font-size:0.72rem;color:var(--cinza);font-weight:700"><i class="ph ph-camera"></i> foto da visita · toque para ampliar</div>
    </div>`:'';
  const comentHtml=v.comentario?`<div style="background:#F4F6F8;padding:10px 12px;border-radius:8px;margin-bottom:8px;border-left:3px solid var(--marrom)"><div style="font-size:0.72rem;font-weight:800;color:var(--cinza);margin-bottom:4px"><i class="ph ph-chat-teardrop-text"></i> Avaliação:</div><div style="font-size:0.85rem;color:var(--marrom);font-style:italic">"${sanitizeHtml(v.comentario)}"</div></div>`:'';
  const notaHtml=v.nota?`<div style="font-size:0.8rem;color:var(--laranja);font-weight:800;margin-bottom:8px">${'<i class="ph-fill ph-star"></i>'.repeat(v.nota)} ${v.nota}/10</div>`:'';
  historicoHtml=fotoHtml+notaHtml+comentHtml;
}
  let tagsHtml=`<span class="tag-vibe"><i class="ph ph-map-pin"></i> ${b.regiao}</span>`;
  (b.tipo||[]).forEach(t=>tagsHtml+=`<span class="tag-vibe">${t}</span>`);
if(b.cdb) tagsHtml+=`<span class="tag-vibe" style="background:#FFF8E1;color:#F9A825;border:1px solid #F9A825">★ Comida di Buteco</span>`;
  if(b.descricao?.includes('Sugerido'))tagsHtml+=`<span class="tag-vibe" style="background:#E8F5E9;color:var(--verde)"><i class="ph ph-users"></i> Sugestão da Comunidade</span>`;
  const sheet=document.getElementById('bottomSheet');
  sheet.innerHTML=`
    <div class="sheet-handle"></div>
    <div style="padding:0 24px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--marrom);line-height:1.1;max-width:80%">
          ${visitado?'<i class="ph-fill ph-check-circle" style="color:var(--verde)"></i> ':''}${sanitizeHtml(b.nome)}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-favorito ${isFav?'salvo':''}" onclick="window.toggleFavorito('${b.id}')">
            <i class="${isFav?'ph-fill':'ph'} ph-flag"></i>
          </button>
          <button onclick="window.fecharBottomSheet()" style="background:none;border:none;font-size:1.4rem;color:var(--cinza);cursor:pointer"><i class="ph ph-x"></i></button>
        </div>
      </div>
      <div class="tags-row" style="margin-bottom:16px">${tagsHtml}</div>
      ${b.descricao?`<div style="font-size:0.85rem;color:#555;line-height:1.6;font-style:italic;margin-bottom:16px;border-left:3px solid var(--laranja);padding-left:10px">${sanitizeHtml(b.descricao)}</div>`:''}
      ${historicoHtml}
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn-visitar ${visitado?'visitado-btn':''}" style="flex:2;font-size:0.9rem;padding:12px;font-weight:800;border-radius:8px" onclick="window.fecharBottomSheet();setTimeout(()=>${visitado?`window.toggleVisita('${b.id}')`:`window.abrirAvaliacaoDescobrir('${b.id}')`},300)">
          ${visitado?'<i class="ph-fill ph-check-circle"></i> Visitado':'<i class="ph-fill ph-navigation-arrow"></i> Marcar Visita'}
        </button>
        <a href="${mapsUrl}" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:8px;background:var(--marrom);color:white;font-size:0.9rem;font-weight:800;text-decoration:none">
          <i class="ph ph-map-trifold"></i> Rota
        </a>
      </div>
      <div style="font-size:0.82rem;color:var(--cinza);margin-bottom:8px"><i class="ph ph-clock"></i> ${sanitizeHtml(b.horario)||'Horário não informado'}</div>
      <div style="font-size:0.82rem;color:var(--cinza);margin-bottom:8px"><i class="ph ph-map-pin"></i> ${sanitizeHtml(b.end)}</div>
      <button onclick="window.reportarBar('${b.id}')"
  style="width:100%;margin-top:12px;padding:10px;border-radius:8px;
         border:1px solid #cc6600;background:transparent;color:#cc6600;
         font-size:0.78rem;font-weight:700;cursor:pointer;
         font-family:'Nunito',sans-serif;
         display:flex;align-items:center;justify-content:center;gap:6px">
  <i class="ph ph-warning-circle"></i> Reportar problema neste bar
</button>
    </div>`;
  document.getElementById('sheetOverlay').classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow='hidden';
let _startY=0, _lastY=0, _lastT=0, _velY=0;
const _sheet=document.getElementById('bottomSheet');

_sheet.addEventListener('touchstart',e=>{
  _startY=_lastY=e.touches[0].clientY;
  _lastT=Date.now();
  _velY=0;
  _sheet.style.transition='none'; 
  navigator.vibrate?.(6); 
},{passive:true});

_sheet.addEventListener('touchmove',e=>{
  const y=e.touches[0].clientY;
  const now=Date.now();
  const dt=now-_lastT||1;
  _velY=(_velY*0.6)+((y-_lastY)/dt*0.4)*1000; 
  _lastY=y; _lastT=now;
  const dy=y-_startY;
  if(dy>0) _sheet.style.transform=`translateX(-50%) translateY(${dy}px)`;
},{passive:true});

_sheet.addEventListener('touchend',e=>{
  const dy=e.changedTouches[0].clientY-_startY;
  _sheet.style.transition='transform 0.38s cubic-bezier(0.22,1,0.36,1)';
  if(dy>120||_velY>600){
    navigator.vibrate?.([10,5,20]);
    window.fecharBottomSheet();
  } else {
    _sheet.style.transform='translateX(-50%) translateY(0)';
    if(dy>40) navigator.vibrate?.(8); 
  }
});
};

window.fecharBottomSheet=function(){
  const ov=document.getElementById('sheetOverlay');
  const bs=document.getElementById('bottomSheet');
  if(ov)ov.classList.remove('open');
  if(bs){bs.classList.remove('open');bs.style.transform='';}
  document.body.style.overflow='';
};

window.toggleFavorito=function(barId){
  if(!usuarioAtual)return;
  const _jaFav = favoritos.includes(barId);
navigator.vibrate?.(_jaFav ? [5,5,10] : 15);
  const idx=favoritos.indexOf(barId);
  if(idx>-1){favoritos.splice(idx,1);window.mostrarNotif('Removido da lista Quero Ir');}
  else{favoritos.push(barId);window.mostrarNotif('<i class="ph-fill ph-flag"></i> Salvo na lista Quero Ir!');}
  localStorage.setItem('favoritos_'+usuarioAtual.uid,JSON.stringify(favoritos));
  db.collection('users').doc(usuarioAtual.uid).set({favoritos},{merge:true});
  if(document.getElementById('sheetOverlay')?.classList.contains('open'))window.abrirBottomSheet(barId);
  if(window._regiaoDescobrir)renderListaDescobrir();
};

window.abrirAvaliacaoObrigatoria=function(barId){
  if(visitas[barId]){
    const info=document.getElementById('info-'+barId);
    if(info)info.style.display=info.style.display==='none'?'block':'none';
    cardAberto=barId;return;
  }
  const notaSection=document.getElementById('nota-'+barId);
  if(notaSection)notaSection.classList.add('open');
  const info=document.getElementById('info-'+barId);
  if(info)info.style.display='block';
  cardAberto=barId;
  mostrarNotif('<i class="ph-fill ph-star"></i> Dê uma nota para registrar sua visita!','info');
  setTimeout(()=>notaSection?.scrollIntoView({behavior:'smooth',block:'center'}),100);
};