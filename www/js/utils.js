function filtrarTexto(txt){
  if(!txt)return txt;
  let r=txt;
  REGEXES_PROIBIDAS.forEach(re=>{
    re.lastIndex=0;
    r=r.replace(re,m=>'*'.repeat(m.length));
});
  return r;
}

function tempoRelativo(ts){
  const d=Date.now()-ts,m=Math.floor(d/60000),h=Math.floor(d/3600000),dia=Math.floor(d/86400000);
  if(m<1)return'agora mesmo';if(m<60)return`há ${m} min`;if(h<24)return`há ${h}h`;return`há ${dia} dia${dia>1?'s':''}`;
}

function haversine(lat1,lng1,lat2,lng2){
  const R=6371,dL=(lat2-lat1)*Math.PI/180,dG=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function salvarCache(k,d){try{localStorage.setItem(k,JSON.stringify({d,ts:Date.now()}));}catch(e){}}
function lerCache(k){try{const i=JSON.parse(localStorage.getItem(k));if(i&&Date.now()-i.ts<CACHE_TTL)return i.d;}catch(e){}return null;}

function mostrarNotif(msg,tipo='sucesso'){
  const n=document.getElementById('notif');
  n.innerHTML=`<i class="ph-fill ${tipo==='erro'?'ph-warning-circle':'ph-check-circle'}"></i> ${msg}`;
  n.style.background=tipo==='erro'?'var(--danger)':'var(--primary)';
  n.classList.add('show');
  clearTimeout(window._notifTimer);
  window._notifTimer=setTimeout(()=>n.classList.remove('show'),2500);
}
window.mostrarNotif=mostrarNotif;

function lancarConfete(){
  for(let i=0;i<20;i++){
    const c=document.createElement('div');
    c.className='confetti';
    c.style.left=Math.random()*100+'vw';
    c.style.animationDelay=Math.random()+'s';
    c.style.background=['#E8650A','#3D1F0F','#2D6A2D','#FFD700'][Math.floor(Math.random()*4)];
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3500);
  }
}

async function fileParaBlob(dataUrl,maxWidth,qualidade){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      let w=img.width,h=img.height;
      if(w>maxWidth){h=Math.round(h*maxWidth/w);w=maxWidth;}
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      canvas.toBlob(b=>resolve(b),'image/jpeg',qualidade);
    };
    img.onerror=()=>resolve(null);
    img.src=dataUrl;
  });
}

async function uploadFotoStorage(blob,path){
  const ref=storage.ref(path);
  const snap=await ref.put(blob);
  return snap.ref.getDownloadURL();
}

function calcularEmblemas(numVisitas,boresIds){
  const c=new Set();
  EMBLEMAS_QUANTIDADE.forEach(e=>{if(numVisitas>=e.min)c.add(e.nome);});
  let rc=0;
  Object.keys(REGIOES_COUNT).forEach(r=>{
    if(BARES.filter(b=>b.regiao===r).every(b=>boresIds.has(b.id))){
      const e=EMBLEMAS_REGIAO.find(x=>x.regiao===r);if(e)c.add(e.nome);rc++;
    }
  });
  if(rc===7){const e=EMBLEMAS_REGIAO.find(x=>x.regiao==='TODAS');if(e)c.add(e.nome);}
  return c;
}

const _modalQueue=[];
let _modalAberto=false;
function enqueueModal(fn,delay){setTimeout(()=>{_modalQueue.push(fn);_processQueue();},delay||0);}
function _processQueue(){if(_modalAberto||!_modalQueue.length)return;_modalAberto=true;_modalQueue.shift()(()=>{_modalAberto=false;_processQueue();});}
function modalFechou(overlay){if(overlay)overlay.remove();_modalAberto=false;_processQueue();}
window.modalFechou=modalFechou;

window.addEventListener('scroll',()=>{
  const btn=document.getElementById('btnTopo');
  if(!btn)return;
  btn.classList.toggle('visivel',window.scrollY>300);
});

document.addEventListener('click',e=>{
  if(!e.target.closest('.reacao-picker')&&!e.target.closest('[onclick*="togglePicker"]'))
    document.querySelectorAll('.reacao-picker.open').forEach(p=>p.classList.remove('open'));
});
window.verFotoVisita=function(barId){
  const v=visitas[barId];
  if(!v?.fotoUrl&&!v?.foto)return;
  const bar=BARES.find(b=>b.id===barId);
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px';
  const fotoSrc = v.fotoUrl||v.foto;
  if(!fotoSrc.startsWith('https://firebasestorage.googleapis.com'))return;
  ov.innerHTML=`
    <div style="position:relative;width:100%;max-width:500px">
      <img src="${v.fotoUrl||v.foto}" style="width:100%;border-radius:10px;object-fit:contain;max-height:70vh"/>
      <div style="color:white;text-align:center;margin-top:12px">
        <div style="font-weight:800;font-size:1rem">${bar?.nome||''}</div>
        ${v.nota?`<div style="font-size:0.85rem;opacity:0.8;margin-top:4px">${'<i class="ph-fill ph-star"></i>'.repeat(v.nota)} ${v.nota}/10</div>`:''}
        ${v.comentario?`<div style="font-size:0.82rem;opacity:0.7;margin-top:4px;font-style:italic">"${sanitizeHtml(v.comentario)}"</div>`:''}
      </div>
      <button onclick="this.closest('div[style*=z-index]').remove()" style="position:absolute;top:-12px;right:-12px;width:36px;height:36px;border-radius:50%;background:white;border:none;font-size:1.2rem;cursor:pointer;font-weight:700">✕</button>
    </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
};

window.previewFotoVisita=function(barId,input){
  const file=input.files[0];if(!file)return;
if(!['image/jpeg','image/png','image/webp'].includes(file.type)){mostrarNotif('Formato inválido. Use JPG, PNG ou WEBP','erro');return;}
if(file.size>10*1024*1024){mostrarNotif('Foto muito grande! Máx 10MB','erro');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    if(!window._fotosVisita)window._fotosVisita={};
    window._fotosVisita[barId]=e.target.result;
    const preview=document.getElementById('foto-preview-'+barId);
    const img=document.getElementById('foto-img-'+barId);
    if(preview&&img){img.src=e.target.result;preview.style.display='block';}
  };
  reader.readAsDataURL(file);
};

window.compartilharFotoFeed=async function(barId){
  const v=visitas[barId];
  if(!v?.fotoUrl&&!v?.foto)return;
  const bar=BARES.find(b=>b.id===barId);
  if(!bar)return;
  const nome=usuarioAtual.displayName||'Anônimo';
  const avatar=localStorage.getItem('avatar_'+usuarioAtual.uid)||'<i class="ph-fill ph-beer-bottle"></i>';
  const feedDoc=await db.collection('ranking').doc('feed').get();
  const feedAtual=feedDoc.exists?(feedDoc.data().eventos||[]):[];
  const evento={
    uid:usuarioAtual.uid,nome,avatar,
    tipo:'foto_visita',
    bar:bar.nome,barId,
    nota:v.nota||0,
    comentario:v.comentario||'',
    fotoUrl:v.fotoUrl||'',
    foto:'',
    ts:Date.now()
  };
  feedAtual.unshift(evento);
  await db.collection('ranking').doc('feed').set({eventos:feedAtual.slice(0,200),atualizado:Date.now()});
  if(typeof cacheFeed!=='undefined')cacheFeed=null;
  mostrarNotif('<i class="ph ph-camera"></i> Foto compartilhada no feed!');
};

window._verFotoFeed=function(eventoId){
  const img=document.querySelector(`[onclick="window._verFotoFeed('${eventoId}')"]`);
  if(!img)return;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;cursor:pointer';
  ov.innerHTML=`
    <button onclick="document.getElementById('fotoFeedOv').remove()" style="position:fixed;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:white;border:none;font-size:1.4rem;cursor:pointer;font-weight:700;z-index:2001;box-shadow:0 2px 8px rgba(0,0,0,0.4)">✕</button>
    <img src="${img.src}" style="max-width:100%;max-height:90vh;border-radius:10px;object-fit:contain"/>`;
  ov.id='fotoFeedOv';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
};

function getEventoId(e){
  if(e.id)return e.id;
  return(e.uid||'')+'_'+(e.barId||e.bar||'')+'_'+(e.tipo||'visita');
}
window.getEventoId=getEventoId;
window._emblemasJaNotificados = window._emblemasJaNotificados || new Set(JSON.parse(localStorage.getItem('emblemas_notif')||'[]'));

window._checarEmblemaNovo=function(barId){
  if(!usuarioAtual||usuarioAtual.uid==='teste123')return;
  const boresIds=new Set(Object.keys(visitas));
  const total=boresIds.size;
  const conquistados=calcularEmblemas(total,boresIds);
  const novos=[...conquistados].filter(n=>!window._emblemasJaNotificados.has(n));
  if(!novos.length)return;
  novos.forEach(n=>window._emblemasJaNotificados.add(n));
  try{localStorage.setItem('emblemas_notif',JSON.stringify([...window._emblemasJaNotificados]));}catch(e){}
  const nomeEmblema=novos[0];
  const emb=[...EMBLEMAS_QUANTIDADE,...EMBLEMAS_REGIAO].find(e=>e.nome===nomeEmblema);
  if(!emb)return;
  const ov=document.createElement('div');
  ov.className='emblema-overlay';
  ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:5000;display:flex;align-items:center;justify-content:center;padding:24px;animation:fadeIn 0.3s';
  ov.dataset.embNome=emb.nome;
  ov.dataset.embIcon=emb.icon;
  ov.innerHTML=`
    <div style="background:white;border-radius:24px;padding:32px 24px;text-align:center;max-width:320px;width:100%;animation:slideUp 0.35s cubic-bezier(0.16,1,0.3,1)">
      <div style="font-size:0.75rem;font-weight:800;color:var(--laranja);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px"><i class="ph-fill ph-confetti"></i> Emblema Conquistado!</div>
      <div style="font-size:4rem;margin-bottom:12px;animation:pulseFab 1s ease-in-out 2">${emb.icon}</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--marrom);letter-spacing:1px;margin-bottom:6px">${emb.nome}</div>
      <div style="font-size:0.85rem;color:var(--cinza);line-height:1.6;margin-bottom:24px">${emb.desc}</div>
      <button onclick="const o=this.closest('.emblema-overlay');window.compartilharEmblema(o.dataset.embNome,o.dataset.embIcon);o.remove()" style="width:100%;padding:12px;border-radius:14px;background:var(--laranja);color:white;border:none;font-size:0.9rem;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px"><i class="ph ph-share-network"></i> Compartilhar conquista</button>
      <button onclick="this.closest('.emblema-overlay').remove()" style="width:100%;padding:10px;border-radius:14px;background:transparent;color:var(--cinza);border:1px solid var(--border);font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Fechar</button>
    </div>`;
  document.body.appendChild(ov);
  if(navigator.vibrate)navigator.vibrate([50,30,50,30,100]);
  lancarConfete();
};
function sanitizeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
window.sanitizeHtml = sanitizeHtml;