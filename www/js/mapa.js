function renderProximos() {
  const cont = document.getElementById('page-mapa');
  if (!cont) return;

  cont.innerHTML = `
    <!-- Header mapa -->
    <div style="position:sticky;top:0;z-index:50;background:var(--surface);
                border-bottom:1px solid var(--border);padding:10px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-family:'Bebas Neue',cursive;font-size:1.1rem;
                     color:var(--marrom);letter-spacing:1px">
          <i class="ph ph-map-trifold"></i> Mapa da Trilha
        </span>
        <div style="display:flex;gap:8px">
          <button onclick="window._vistaProximos='mapa';renderProximos()"
            style="padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:800;
                   font-family:'Nunito',sans-serif;cursor:pointer;border:1.5px solid var(--border);
                   background:${(window._vistaProximos||'lista')==='mapa'?'var(--marrom)':'white'};
                   color:${(window._vistaProximos||'lista')==='mapa'?'white':'var(--marrom)'}">
            <i class="ph ph-map-trifold"></i> Mapa
          </button>
          <button onclick="window._vistaProximos='lista';renderProximos()"
            style="padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:800;
                   font-family:'Nunito',sans-serif;cursor:pointer;border:1.5px solid var(--border);
                   background:${(window._vistaProximos||'lista')==='lista'?'var(--marrom)':'white'};
                   color:${(window._vistaProximos||'lista')==='lista'?'white':'var(--marrom)'}">
            <i class="ph ph-list"></i> Lista
          </button>
        </div>
      </div>

      <!-- Busca -->
      <div style="position:relative">
        <i class="ph ph-magnifying-glass" style="position:absolute;left:12px;top:50%;
           transform:translateY(-50%);color:var(--cinza);font-size:1rem;pointer-events:none"></i>
        <input type="search" placeholder="Buscar bairro ou bar..."
          style="width:100%;padding:10px 14px 10px 36px;border-radius:14px;
                 border:1.5px solid var(--border);background:white;
                 font-size:max(16px,0.88rem);font-family:'Nunito',sans-serif;
                 color:var(--text);box-sizing:border-box"
          oninput="window._buscaMapa=this.value;_renderConteudoMapa()"/>
      </div>
    </div>

    <!-- Filtros proximidade -->
     <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 16px 4px;-webkit-overflow-scrolling:touch;position:sticky;top:0;z-index:10;background:var(--surface);flex-shrink:0">
      ${['Todos','Não visitados','Visitados','Próximos'].map(f => `
        <button onclick="window._filtroMapa='${f}';_renderConteudoMapa();
                         document.querySelectorAll('.filtro-mapa-btn').forEach(b=>b.classList.remove('ativo'));
                         this.classList.add('ativo')"
          class="filtro-btn filtro-mapa-btn ${(window._filtroMapa||'Todos')===f?'ativo':''}"
          style="white-space:nowrap">
          ${f}
        </button>`).join('')}
    </div>

    <!-- Conteúdo dinâmico -->
    <div id="mapaConteudo" style="flex:1"></div>
  `;

  _renderConteudoMapa();
}

function _renderConteudoMapa() {
  if (!window._posUsuario) {
  try {
    const cached = JSON.parse(localStorage.getItem('_posUsuario') || 'null');
    if (cached?.lat) window._posUsuario = cached;
  } catch(e) {}
}
  const cont = document.getElementById('mapaConteudo');
  if (!cont) return;

  const vista = window._vistaProximos || 'lista';
  const busca = (window._buscaMapa || '').toLowerCase().trim();
  const filtro = window._filtroMapa || 'Todos';

  let bares = [...BARES];

  if (busca) {
    bares = bares.filter(b =>
      b.nome.toLowerCase().includes(busca) ||
      b.regiao?.toLowerCase().includes(busca) ||
      b.end?.toLowerCase().includes(busca)
    );
  }

  if (filtro === 'Não visitados') bares = bares.filter(b => !visitas[b.id]);
  if (filtro === 'Visitados') bares = bares.filter(b => !!visitas[b.id]);
  if (filtro === 'Próximos' && window._posUsuario) {
    bares = bares
      .filter(b => b.lat && b.lng)
      .sort((a, b2) =>
        haversine(window._posUsuario.lat, window._posUsuario.lng, a.lat, a.lng) -
        haversine(window._posUsuario.lat, window._posUsuario.lng, b2.lat, b2.lng)
      )
      .slice(0, 20);
  }

  if (vista === 'mapa') {
    cont.innerHTML = `<div id="leafletMap" style="height:calc(100vh - 200px);width:100%"></div>`;
    setTimeout(() => _iniciarMapa(bares), 100);
    return;
  }

  // Vista lista
  if (!bares.length) {
    cont.innerHTML = `
      <div class="empty">
        <div class="empty-icon"><i class="ph ph-map-trifold"></i></div>
        <p>Nenhum bar encontrado</p>
      </div>`;
    return;
  }

  cont.innerHTML = `
    <div style="padding:8px 16px 100px">
      ${bares.map(b => {
        const v = visitas[b.id];
        const visitado = !!v;
        let distHtml = '';
        if (window._posUsuario && b.lat && b.lng) {
          const dist = haversine(window._posUsuario.lat, window._posUsuario.lng, b.lat, b.lng);
          const distStr = dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km';
          distHtml = `<span style="font-size:0.68rem;color:var(--cinza);font-weight:700;
                               display:flex;align-items:center;gap:3px">
                        <i class="ph ph-navigation-arrow"></i> ${sanitizeHtml(distStr)}
                      </span>`;
        }
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sanitizeHtml(b.nome)+' '+sanitizeHtml(b.end))}`;

        return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;
                    border-bottom:1px solid var(--border);cursor:pointer"
          onclick="window.abrirBottomSheet('${b.id}')">
          <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;
                      background:${visitado?'var(--verde)':'var(--laranja-claro)'};
                      display:flex;align-items:center;justify-content:center">
            <i class="ph-fill ${visitado?'ph-check-circle':'ph-map-pin'}"
               style="color:${visitado?'white':'var(--laranja)'};font-size:1.3rem"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${sanitizeHtml(b.nome)}
            </div>
            <div style="font-size:0.72rem;color:var(--cinza);margin-top:2px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${sanitizeHtml(b.regiao)} · ${sanitizeHtml(b.end) || ''}
            </div>
            ${distHtml}
          </div>
          <a href="${mapsUrl}" target="_blank"
            onclick="event.stopPropagation()"
            style="width:36px;height:36px;border-radius:10px;background:var(--marrom);
                   color:white;display:flex;align-items:center;justify-content:center;
                   text-decoration:none;flex-shrink:0;font-size:0.9rem">
            <i class="ph ph-navigation-arrow"></i>
          </a>
        </div>`;
      }).join('')}
    </div>`;
  if (!window._posUsuario) {
    navigator.geolocation?.getCurrentPosition(pos => {
      window._posUsuario = { lat: pos.coords.latitude, lng: pos.coords.longitude };
localStorage.setItem('_posUsuario', JSON.stringify(window._posUsuario));
      _renderConteudoMapa();
    }, () => {});
  }
}

function _iniciarMapa(bares) {
  if (!window.L) {
    document.getElementById('mapaConteudo').innerHTML = `
      <div class="empty">
        <div class="empty-icon"><i class="ph ph-map-trifold"></i></div>
        <p>Mapa não disponível offline</p>
      </div>`;
    return;
  }

  if (window.mapaLeaflet) {
    window.mapaLeaflet.remove();
    window.mapaLeaflet = null;
  }

  const centro = window._posUsuario
    ? [window._posUsuario.lat, window._posUsuario.lng]
    : [-19.9167, -43.9345];

  const mapa = L.map('leafletMap', { zoomControl: true }).setView(centro, 13);
  window.mapaLeaflet = mapa;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  if (window._posUsuario) {
    L.circleMarker(centro, {
      radius: 8, fillColor: '#1B5E9B', color: 'white',
      weight: 2, fillOpacity: 1
    }).addTo(mapa).bindPopup('Você está aqui');
  }
const cluster = L.markerClusterGroup({ maxClusterRadius: 60, disableClusteringAtZoom: 16 });
  bares.forEach(b => {
    if (!b.lat || !b.lng) return;
    const visitado = !!visitas[b.id];
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:${visitado ? '#2D8A4E' : '#E8650A'};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:0.9rem;color:white">
        <i class="ph-fill ${visitado ? 'ph-check-circle' : 'ph-beer-bottle'}"></i>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([b.lat, b.lng], { icon })
      .addTo(cluster)
      .bindPopup(`
        <div style="font-family:'Nunito',sans-serif;min-width:160px">
          <div style="font-weight:800;font-size:0.9rem;color:#3D1F0F;margin-bottom:4px">
            ${sanitizeHtml(b.nome)}
          </div>
          <div style="font-size:0.75rem;color:#888;margin-bottom:8px">
            ${sanitizeHtml(b.regiao)}
          </div>
          <button onclick="window.abrirBottomSheet('${b.id}')"
            style="width:100%;padding:7px;border-radius:8px;background:#E8650A;
                   color:white;border:none;font-size:0.78rem;font-weight:800;
                   cursor:pointer;font-family:'Nunito',sans-serif">
            Ver bar
          </button>
        </div>`)
      .on('click', function() { this.openPopup(); });
  });
mapa.addLayer(cluster);
}
function _renderListaProximos(lat,lng){
  const cont=document.getElementById('proximosConteudo');
  const cardAberto2=cardAberto;
  const baresComDist = BARES
    .filter(b=>b.lat&&b.lng)
    .map(b=>({...b,dist:haversine(lat,lng,b.lat,b.lng)}))
    .sort((a,b)=>a.dist-b.dist);

  window._baresComDistCache=baresComDist;
cont.innerHTML=`
  <div style="display:flex;align-items:center;gap:8px;background:#f5f0e8;border-radius:20px;padding:8px 14px;margin-bottom:14px">
    <i class="ph ph-magnifying-glass" style="color:var(--cinza)"></i>
    <input id="buscaMapa" type="text" placeholder="filtrar bares próximos..."
      style="background:none;border:none;outline:none;font-size:0.85rem;font-family:'Nunito',sans-serif;color:var(--marrom);width:100%"
      oninput="window.filtrarMapa(this.value)"/>
  </div>
  <div id="listaMapa">
    <div style="font-size:0.78rem;color:var(--cinza);margin-bottom:14px;font-weight:700;text-transform:uppercase">
      <i class="ph ph-list-numbers"></i> ${baresComDist.length} bares na sua área
    </div>
    ${baresComDist.map(b=>{
      const distStr=b.dist<1?Math.round(b.dist*1000)+'m':b.dist.toFixed(1)+'km';
      return window.gerarCardBar(b,!!visitas[b.id],visitas[b.id]?.nota||0,favoritos.includes(b.id),'prox',distStr);
    }).join('')}
  </div>`;

  baresComDist.slice(0,20).forEach(b => renderAmigosNoBar(b.id, 'amigos-bar-prox-'+b.id));

  if(cardAberto2){
    const info=document.getElementById('info-prox-'+cardAberto2.replace('prox-',''));
    if(info)info.style.display='block';
  }
}
window.abrirAvaliacaoObrigatoriaProximo=function(barId){
  const notaSection=document.getElementById('nota-prox-'+barId);
  if(notaSection)notaSection.classList.add('open');
  const info=document.getElementById('info-prox-'+barId);
  if(info)info.style.display='block';
  mostrarNotif('<i class="ph-fill ph-star"></i> Dê uma nota para registrar sua visita!','info');
  setTimeout(()=>notaSection?.scrollIntoView({behavior:'smooth',block:'center'}),100);
};

window.setNotaProximo=function(id,n){
  if(!visitas[id])visitas[id]={visitado:true,ts:Date.now()};
  visitas[id].nota=n;
  document.querySelectorAll(`#stars-prox-${id} .estrela`).forEach((el,i)=>el.classList.toggle('on',i<n));
};

window.setNotaExtraProximo=function(barId,n){
  if(!window._notaExtra)window._notaExtra={};
  window._notaExtra['prox-'+barId]=n;
  document.querySelectorAll(`#stars-extra-prox-${barId} .estrela`).forEach((el,i)=>el.classList.toggle('on',i<n));
};

window.toggleVisitaProximo=async function(id){
  if(!usuarioAtual)return;
  const ref=db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(id);
  if(visitas[id]){await ref.delete();delete visitas[id];mostrarNotif('Visita removida');}
  else{const d={visitado:true,ts:Date.now()};await ref.set(d);visitas[id]=d;mostrarNotif('<i class="ph-fill ph-check-circle"></i> Visita registrada!');const barStories=BARES.find(b=>b.id===id);}
  renderBares();renderPerfil();if(_posUsuario)_renderListaProximos(_posUsuario.lat,_posUsuario.lng);
if(_vistaProximos==='mapa'&&_posUsuario)if(_posUsuario)_renderMapaLeaflet(_posUsuario.lat,_posUsuario.lng);
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
  delete _cacheAmigos[id];
  _cacheVisitasGrupo=null;
  const paginaAtivaToggle=document.querySelector('.page.active')?.id;
if(paginaAtivaToggle==='page-roteiro')renderRoteiro();
};
function _renderMapaLeaflet(lat,lng){
  const container=document.getElementById('mapaLeaflet');
  if(!container)return;
  if(_mapaLeaflet){
    _mapaLeaflet.remove();
    _mapaLeaflet=null;
  }
  container.innerHTML='';
  setTimeout(()=>{
    _mapaLeaflet=L.map('mapaLeaflet').setView([lat,lng],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© OpenStreetMap',maxZoom:19
    }).addTo(_mapaLeaflet);
    const iconUsuario=L.divIcon({
      html:'<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize:[16,16],iconAnchor:[8,8],className:''
    });
    _marcadorUsuario=L.marker([lat,lng],{icon:iconUsuario}).addTo(_mapaLeaflet).bindPopup('<i class="ph ph-map-pin"></i> Você está aqui');
if(_watchId)navigator.geolocation.clearWatch(_watchId);
_watchId=navigator.geolocation.watchPosition(pos=>{
  const novaLat=pos.coords.latitude;
  const novaLng=pos.coords.longitude;
  _posUsuario={lat:novaLat,lng:novaLng};
  if(_marcadorUsuario)_marcadorUsuario.setLatLng([novaLat,novaLng]);
},()=>{},{enableHighAccuracy:true,maximumAge:5000});
    const baresComDist=BARES
  .filter(b=>b.lat&&b.lng)
  .map(b=>({...b,dist:haversine(lat,lng,b.lat,b.lng)}))
  .sort((a,b)=>a.dist-b.dist);
  const cluster2 = L.markerClusterGroup({ maxClusterRadius: 60, disableClusteringAtZoom: 16 });
baresComDist.forEach(b=>{
      const visitado=!!visitas[b.id];
      const nota=visitas[b.id]?.nota||0;
      const cor=visitado?'#2D6A2D':'#E8650A';
      const icone=L.divIcon({
        html:`<div style="width:14px;height:14px;background:${cor};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize:[14,14],iconAnchor:[7,7],className:''
      });
      const distStr=b.dist<1?Math.round(b.dist*1000)+'m':b.dist.toFixed(1)+'km';
      const popup=`
        <div style="font-family:'Nunito',sans-serif;min-width:160px">
          <div style="font-weight:800;font-size:0.9rem;color:#5C2E00;margin-bottom:2px">${sanitizeHtml(b.nome)}</div>
          <div style="font-size:0.75rem;color:#E8650A;margin-bottom:2px">📍 ${sanitizeHtml(b.regiao)}</div>
          <div style="font-size:0.72rem;color:#888;margin-bottom:6px"><i class="ph ph-map-pin"></i> ${sanitizeHtml(distStr)} · ${sanitizeHtml(b.regiao)}</div>
          ${visitado?`<div style="font-size:0.75rem;color:#2D6A2D;font-weight:700"><i class="ph-fill ph-check-circle"></i> Visitado${nota?' · '+'<i class="ph-fill ph-star"></i>'.repeat(nota)+' '+nota+'/10':''}</div>`:'<div style="font-size:0.75rem;color:#E8650A;font-weight:700"><i class="ph-fill ph-beer-bottle"></i> Não visitado ainda</div>'}
        </div>`;
      L.marker([b.lat,b.lng],{icon:icone}).addTo(cluster2).bindPopup(popup);
    });
    _mapaLeaflet.invalidateSize();
    const legenda=L.control({position:'bottomright'});
legenda.onAdd=function(){
  const div=L.DomUtil.create('div');
  div.style.cssText='background:white;padding:8px 10px;border-radius:10px;font-family:Nunito,sans-serif;font-size:0.72rem;box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:none';
  div.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:10px;height:10px;background:#2D6A2D;border-radius:50%"></div> Visitado</div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:10px;height:10px;background:#E8650A;border-radius:50%"></div> Não visitado</div><div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;background:#4285f4;border-radius:50%"></div> Você</div>';
  return div;
};
_mapaLeaflet.addLayer(cluster2);
legenda.addTo(_mapaLeaflet);
  },100);
}
window.setVistaProximos=function(vista){
  _vistaProximos=vista;
  document.getElementById('btnVistaLista').className=vista==='lista'?'ativo':'inativo';
  document.getElementById('btnVistaMapa').className=vista==='mapa'?'ativo':'inativo';
  if(vista==='lista'&&_watchId){navigator.geolocation.clearWatch(_watchId);_watchId=null;}
  document.getElementById('proximosConteudo')?.style && (document.getElementById('proximosConteudo').style.display=vista==='lista'?'block':'none');
  document.getElementById('mapaLeaflet')?.style && (document.getElementById('mapaLeaflet').style.display=vista==='mapa'?'block':'none');
  if(vista==='mapa'){
    if(!_posUsuario){
      mostrarNotif('<i class="ph ph-map-pin"></i> Obtendo localização...','info');
      navigator.geolocation.getCurrentPosition(pos=>{
        _posUsuario={lat:pos.coords.latitude,lng:pos.coords.longitude};
        if(_posUsuario)_renderMapaLeaflet(_posUsuario.lat,_posUsuario.lng);
      },()=>mostrarNotif('Não foi possível obter localização','erro'),{enableHighAccuracy:true,timeout:10000});
    }else{
      if(_posUsuario)_renderMapaLeaflet(_posUsuario.lat,_posUsuario.lng);
    }
  }
};
async function renderAmigosNoBar(barId,containerId){
  const amigos=await getAmigosNoBarCached(barId);
  const el=document.getElementById(containerId);
  if(!el||!amigos.length)return;
  el.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:6px;padding:6px 0;border-top:1px solid #f5ece0;margin-top:4px">
    ${amigos.map(a=>`<div style="display:flex;align-items:center;gap:4px;background:#f0fff4;border-radius:20px;padding:3px 8px;font-size:0.72rem;font-weight:700;color:#2D6A2D">
      <span>${a.avatar.startsWith('data:')?'👤':a.avatar}</span>
      <span>${a.nome.split(' ')[0]}</span>
      ${a.nota?`<span style="color:var(--laranja)">·${'<i class="ph-fill ph-star"></i>'.repeat(a.nota)}${a.nota}</span>`:''}
    </div>`).join('')}
  </div>`;
}
async function getAmigosNoBar(barId){
  if(!grupoAtual)return[];
  try{
    const agora=Date.now();
    if(!_cacheVisitasGrupo||agora-_cacheVisitasGrupoTs>_VISITAS_GRUPO_TTL){
      const grupoDoc=await db.collection('grupos').doc(grupoAtual).get();
      const membros=(grupoDoc.data()?.membros||[]).filter(uid=>uid!==usuarioAtual.uid);
      const rankDoc=await db.collection('ranking').doc('global').get();
      const dados=rankDoc.exists?rankDoc.data():{};
      const mapa={};
      await Promise.all(membros.map(async uid=>{
        const d=dados[uid];if(!d)return;
        const vSnap=await db.collection('users').doc(uid).collection('visits').get();
        mapa[uid]={nome:d.nome,avatar:d.avatar||'<i class="ph-fill ph-beer-bottle"></i>',visitas:{}};
        vSnap.forEach(v=>{mapa[uid].visitas[v.id]={nota:v.data()?.nota||0};});
      }));
      _cacheVisitasGrupo=mapa;
      _cacheVisitasGrupoTs=agora;
    }
    const amigos=[];
    for(const [uid,info] of Object.entries(_cacheVisitasGrupo)){
      if(info.visitas[barId]!==undefined){
        amigos.push({nome:info.nome,avatar:info.avatar,nota:info.visitas[barId].nota});
      }
    }
    return amigos;
  }catch(e){return[];}
}

const _cacheAmigos={};
const _cacheAmigosTs={};
const _AMIGOS_TTL=5*60*1000;

async function getAmigosNoBarCached(barId){
  const agora=Date.now();
  if(_cacheAmigos[barId]&&(agora-(_cacheAmigosTs[barId]||0))<_AMIGOS_TTL){
    return _cacheAmigos[barId];
  }
  const resultado=await getAmigosNoBar(barId);
  _cacheAmigos[barId]=resultado;
  _cacheAmigosTs[barId]=agora;
  return resultado;
}
window.salvarNotaProximo=async function(id){
  if(!usuarioAtual)return;
  if(window._salvandoNota===id)return;
  window._salvandoNota=id;
  setTimeout(()=>{window._salvandoNota=null;},3000);
  const btnSalvar=document.querySelector(`#nota-prox-${id} .btn-salvar-nota`);
  const txtOriginal=btnSalvar?.textContent||'💾 Salvar avaliação';
  if(btnSalvar){btnSalvar.textContent='<i class="ph ph-spinner"></i> Salvando...';btnSalvar.disabled=true;}

  const d=await _salvarDadosVisita(id,'prox-');
  if(!d){
    if(btnSalvar){btnSalvar.textContent=txtOriginal;btnSalvar.disabled=false;}
    window._salvandoNota=null;
    return;
  }

  mostrarNotif('💾 Avaliação salva!');
  renderBares();
  renderPerfil();
  if(_posUsuario)_renderListaProximos(_posUsuario.lat,_posUsuario.lng);
  if(_vistaProximos==='mapa'&&_posUsuario)if(_posUsuario)_renderMapaLeaflet(_posUsuario.lat,_posUsuario.lng);
  if(btnSalvar){
    btnSalvar.textContent='<i class="ph-fill ph-check-circle"></i> Salvo!';
    btnSalvar.style.background='var(--verde)';
    btnSalvar.disabled=false;
    setTimeout(()=>{btnSalvar.textContent=txtOriginal;btnSalvar.style.background='';},3000);
  }
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
  verificarUltrapassagem();
};

window.salvarVisitaExtraProximo=async function(barId){
  if(!usuarioAtual)return;
  const nota=window._notaExtra?.['prox-'+barId]||0;
const comentario=filtrarTexto(document.getElementById('comment-extra-prox-'+barId)?.value||'');
  const d={nota,comentario,ts:Date.now()};
  await db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(barId).collection('historico').add(d);
  if(comentario){
    await db.collection('comentarios').doc(barId).collection('posts').add({uid:usuarioAtual.uid,nome:usuarioAtual.displayName||'Anônimo',texto:comentario,nota,ts:Date.now()});
  }
  if(!window._historico)window._historico={};
  if(!window._historico[barId])window._historico[barId]=[];
  window._historico[barId].unshift(d);
  if(window._notaExtra)window._notaExtra['prox-'+barId]=0;
  document.getElementById('comment-extra-prox-'+barId).value='';
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Visita extra registrada!');
  const barExtra=BARES.find(b=>b.id===barId);
  if(barExtra&&usuarioAtual){
    const nomeU=usuarioAtual.displayName||'Anônimo';
    const avatarU=localStorage.getItem('avatar_'+usuarioAtual.uid)||'<i class="ph-fill ph-beer-bottle"></i>';
    const feedDoc2=await db.collection('ranking').doc('feed').get();
    const feedAtual2=feedDoc2.exists?(feedDoc2.data().eventos||[]):[];
    const visitasAnteriores=feedAtual2.filter(e=>e.uid===usuarioAtual.uid&&e.barId===barId&&e.tipo!=='emblema').length;
    feedAtual2.unshift({
      uid:usuarioAtual.uid,nome:nomeU,avatar:avatarU,
      tipo:'visita_com_comentario',
      bar:barExtra.nome,barId,
      nota,comentario,
      visita_extra:true,
      numero_visita:visitasAnteriores+1,
      ts:Date.now()
    });
    await db.collection('ranking').doc('feed').set({eventos:feedAtual2.slice(0,200),atualizado:Date.now()});
    cacheFeed=null;
  }
  renderBares();
  if(_posUsuario)_renderListaProximos(_posUsuario.lat,_posUsuario.lng);
};

window.toggleCardProximo=function(header){
  const info=header.parentElement.querySelector('.bar-info');
  const isOpen=info.style.display!=='none';
  info.style.opacity='0';
  info.style.display=isOpen?'none':'block';
  if(!isOpen)setTimeout(()=>{info.style.opacity='1';},10);
};
window.filtrarMapa=function(txt){
  const busca=txt.toLowerCase().trim();
  const lista=document.getElementById('listaMapa');
  if(!lista)return;
  const bares=window._baresComDistCache||[];
  const filtrados=busca?bares.filter(b=>b.nome.toLowerCase().includes(busca)||(b.descricao||'').toLowerCase().includes(busca)):bares;
  lista.innerHTML=`<div style="font-size:0.78rem;color:var(--cinza);margin-bottom:14px;font-weight:700;text-transform:uppercase"><i class="ph ph-list-numbers"></i> ${filtrados.length} bares</div>`
    +filtrados.map(b=>{
      const distStr=b.dist<1?Math.round(b.dist*1000)+'m':b.dist.toFixed(1)+'km';
      return window.gerarCardBar(b,!!visitas[b.id],visitas[b.id]?.nota||0,favoritos.includes(b.id),'prox',distStr);
    }).join('');
};