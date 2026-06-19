window.atualizarCacheGlobal=async function(){
  try{
    const tsKey='_cacheGlobalUltimaSync_'+(usuarioAtual?.uid||'');
    const ultima=parseInt(localStorage.getItem(tsKey)||'0');
    if(Date.now()-ultima < 5*60*1000) return;
    localStorage.setItem(tsKey, String(Date.now()));
    const vSnap={forEach:cb=>Object.entries(visitas).forEach(([id,data])=>cb({id,data:()=>data}))};
const eSnap={forEach:cb=>extras.forEach(e=>cb({data:()=>e}))};
const s=calcularStats(vSnap,eSnap);
    const userDoc=await db.collection('users').doc(usuarioAtual.uid).get();
    const info=userDoc.data()||{};
    const nome=info.nome||usuarioAtual.displayName||usuarioAtual.uid.slice(0,8);
    const avatar=info.avatarUrl||info.avatarFoto||info.avatar||localStorage.getItem('avatar_'+usuarioAtual.uid)||'<i class="ph-fill ph-beer-bottle"></i>';
    const regioesCompletas=Object.keys(REGIOES_COUNT).filter(r=>BARES.filter(b=>b.regiao===r).every(b=>s.boresVisitadosIds.has(b.id))).length;
    const mediaNum=s.media==='-'?0:parseFloat(s.media);
    const notas=Object.values(visitas).map(v=>v.nota).filter(n=>n>0);
const notaMin=notas.length?Math.min(...notas):0;
const dadosRanking={nome,avatar,totalVisitas:s.totalVisitas,media:s.media,mediaNum,notaMin,km:s.km,totalGasto:s.totalGasto,regioes:s.regioesVisitadas.size,fiel:Math.round((s.visitas/(BARES.length || 127))*100),regioesComp:regioesCompletas,primeiro:s.primeiro,uid:usuarioAtual.uid,ts:Date.now()};
    const cachedRanking=lerCache('ranking_proprio_'+usuarioAtual.uid);
    const mudou=!cachedRanking||cachedRanking.totalVisitas!==dadosRanking.totalVisitas||cachedRanking.media!==dadosRanking.media||cachedRanking.km!==dadosRanking.km;
    if(mudou){
      await db.collection('ranking').doc(usuarioAtual.uid).set(dadosRanking);
      salvarCache('ranking_proprio_'+usuarioAtual.uid,dadosRanking);

      const feedSnap = await db.collection('ranking').doc('feed').get();
const feedAtual = feedSnap.exists ? (feedSnap.data().eventos || []) : [];
const feedSemUsuario = feedAtual.filter(e => e.uid !== usuarioAtual.uid);

     const eventosVisita=[];
      for(const [barId,vData] of Object.entries(visitas)){
        const bar=BARES.find(b=>b.id===barId);if(!bar)continue;
        const desc=window._descMap?.[barId]?.texto||'';
        const evento={
  uid:usuarioAtual.uid,nome,avatar,
  tipo:(vData.comentario||vData.nota)?'visita_com_comentario':'visita',
  bar:bar.nome,
  barId:barId,
  nota:vData.nota||0,
  comentario:vData.comentario||'',
  foto:vData.foto||null,
  desc,
  km:vData.km||0,
  ts:vData.ts||Date.now()
};
        eventosVisita.push(evento);
      }

    const conquistados=calcularEmblemas(s.visitas,s.boresVisitadosIds);
const emblemaNofeed=feedAtual.filter(e=>e.tipo==='emblema'&&e.uid===usuarioAtual.uid).map(e=>e.emblema);
const eventosEmblemas=[];
      conquistados.forEach(nomeEmblema=>{
        if(!emblemaNofeed.includes(nomeEmblema)){
          const emb=[...EMBLEMAS_QUANTIDADE,...EMBLEMAS_REGIAO].find(e=>e.nome===nomeEmblema);
          if(emb)eventosEmblemas.push({uid:usuarioAtual.uid,nome,avatar,tipo:'emblema',emblema:nomeEmblema,icon:emb.icon,ts:Date.now()});
        }
      });

      const outrosEventos=feedAtual.filter(e=>e.uid!==usuarioAtual.uid);
eventosVisita.sort((a,b)=>b.ts-a.ts);
const meusEmblemasJaNoFeed=feedAtual.filter(e=>e.tipo==='emblema'&&e.uid===usuarioAtual.uid);
const meusAmstelJaNoFeed=feedAtual.filter(e=>e.tipo==='amstel'&&e.uid===usuarioAtual.uid);
const minhasFotosJaNoFeed=feedAtual.filter(e=>e.tipo==='foto_visita'&&e.uid===usuarioAtual.uid);

const emblemaNomesNovos=new Set(eventosEmblemas.map(e=>e.emblema));
const emblemasAntigos=meusEmblemasJaNoFeed.filter(e=>!emblemaNomesNovos.has(e.emblema));
for(const ev of eventosEmblemas){
        const feedRefCheck = await db.collection('ranking').doc('feed').get();
const feedAtualCheck = feedRefCheck.exists ? (feedRefCheck.data().eventos || []) : [];
const naoExiste = !feedAtualCheck.some(e => e.uid === usuarioAtual.uid && e.tipo === 'emblema' && e.emblema === ev.emblema);
        if(naoExiste){
  feedAtualCheck.unshift({...ev,fotoUrl:'',foto:''});
  await db.collection('ranking').doc('feed').set({eventos:feedAtualCheck.slice(0,200),atualizado:Date.now()});
}
      }
      for(const ev of eventosVisita.slice(0,1)){
        const feedRef2 = await db.collection('ranking').doc('feed').get();
const feedAtual2 = feedRef2.exists ? (feedRef2.data().eventos||[]) : [];
const semEsteUsuario = feedAtual2.filter(e => !(e.uid===usuarioAtual.uid && e.barId===ev.barId && e.tipo!=='emblema'));
semEsteUsuario.unshift({...ev,fotoUrl:ev.foto||'',foto:''});
await db.collection('ranking').doc('feed').set({eventos:semEsteUsuario.slice(0,200),atualizado:Date.now()});
      }
    }
    cacheGrupoRanking={};
  }catch(e){console.log('Erro ao atualizar cache:',e);}
};
async function renderBaresComDados(){
  const commCached=lerCache('commMap');
  const descCached=lerCache('descMap');
  if(commCached&&descCached){
    window._commMap=commCached;
    window._descMap=descCached;
    renderBares();
    setTimeout(()=>buscarDadosBares(),2000);
    return;
  }
  await buscarDadosBares();
}

async function buscarDadosBares(){
  const [descSnap, commSnap] = await Promise.all([
    db.collection('descricoes').get(),
    db.collection('comentarios').doc('resumo').get()
  ]);
  const descMap={};
  descSnap.forEach(d=>{descMap[d.id]=d.data();});
  const commMap=commSnap.exists?commSnap.data():{};
  BARES.forEach(b=>{if(!commMap[b.id])commMap[b.id]=[];});
  window._descMap=descMap;
  window._commMap=commMap;
  salvarCache('commMap',commMap);
  salvarCache('descMap',descMap);
  renderBares();
}
async function _salvarDadosVisita(id,prefixo){
  const nota=visitas[id]?.nota||0;
  if(nota===0){mostrarNotif('<i class="ph-fill ph-star"></i> Dê pelo menos nota 1 para salvar!');return false;}
  const km=parseFloat(document.getElementById('km-'+prefixo+id)?.value)||0;
  const comentario=filtrarTexto(document.getElementById('comment-'+prefixo+id)?.value||'');
  const valor=parseFloat(document.getElementById('valor-'+prefixo+id)?.value)||0;
  const d={visitado:true,nota,km,valor,comentario,ts:visitas[id]?.ts||Date.now()};
  await db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(id).set(d);
  if(comentario){
  await db.collection('comentarios').doc(id).collection('posts').add({uid:usuarioAtual.uid,nome:usuarioAtual.displayName||'Anônimo',texto:comentario,nota,ts:Date.now()});
const resumoRef=db.collection('comentarios').doc('resumo');
  const postsAtualizados=await db.collection('comentarios').doc(id)
    .collection('posts').orderBy('ts','desc').limit(10).get();
  const resumoSnap=await resumoRef.get();
  const resumoAtual=resumoSnap.exists?resumoSnap.data():{};
  resumoAtual[id]=postsAtualizados.docs.map(d=>({...d.data(),docId:d.id}));
  await resumoRef.set(resumoAtual);
  localStorage.removeItem('commMap');
}
  visitas[id]=d;
  salvarCache('visitas_'+usuarioAtual.uid,visitas);
  return d;
}
async function verificarUltrapassagem(){
  try{
    if(!cacheRanking?.dados?.length) return;
const todos=cacheRanking.dados;

    const rankings={
      visitados:{key:'ultima_pos_visitados_'+usuarioAtual.uid,lista:[...todos].filter(d=>d.totalVisitas>0).sort((a,b)=>b.totalVisitas-a.totalVisitas),label:'bares visitados'},
      km:{key:'ultima_pos_km_'+usuarioAtual.uid,lista:[...todos].sort((a,b)=>b.km-a.km),label:'km rodados'},
      media:{key:'ultima_pos_media_'+usuarioAtual.uid,lista:[...todos].filter(d=>d.mediaNum>0).sort((a,b)=>b.mediaNum-a.mediaNum),label:'nota média'},
    };

    for(const [tipo,cfg] of Object.entries(rankings)){
      const minhaPos=cfg.lista.findIndex(d=>d.uid===usuarioAtual.uid);
      if(minhaPos===-1)continue;
      const posAnterior=parseInt(localStorage.getItem(cfg.key)||'999');
      localStorage.setItem(cfg.key,String(minhaPos+1));
      if(posAnterior===999||minhaPos>=posAnterior)continue;
      const quemUltrapassei=cfg.lista[minhaPos+1];
      if(!quemUltrapassei||quemUltrapassei.uid===usuarioAtual.uid)continue;
      const ov=document.createElement('div');
      ov.className='modal-overlay';
      ov.innerHTML=`
        <div class="modal-box" style="text-align:center">
          <div style="font-size:3rem;margin-bottom:8px">🚀</div>
          <div class="modal-titulo" style="color:var(--laranja)">Você subiu no ranking!</div>
          <p class="modal-desc">
            Você ultrapassou <strong>${sanitizeHtml(quemUltrapassei.nome)}</strong> no ranking de <strong>${sanitizeHtml(cfg.label)}</strong>!<br><br>
            <span style="font-family:'Bebas Neue',cursive;font-size:2.5rem;color:var(--laranja)">${minhaPos+1}º lugar</span><br><br>
            <span style="font-size:0.78rem;color:var(--cinza)">Continue assim! <i class="ph-fill ph-beer-bottle"></i></span>
          </p>
          <button onclick="this.closest('.modal-overlay').remove();window.irPara('feed')" class="btn-login" style="margin-bottom:10px"><i class="ph-fill ph-trophy"></i> Ver ranking</button>
          <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Fechar</button>
        </div>`;
      document.body.appendChild(ov);
      break;
    }
  }catch(e){}
}
window.salvarNota=async function(id){
  if(!usuarioAtual)return;
  if(window._salvandoNota===id)return;
  window._salvandoNota=id;
  setTimeout(()=>{window._salvandoNota=null;},3000);
  const btnSalvar=document.querySelector(`#nota-${id} .btn-salvar-nota`);
  const txtOriginal=btnSalvar?.textContent||'💾 Salvar avaliação';
  if(btnSalvar){btnSalvar.innerHTML='<i class="ph ph-spinner"></i> Salvando...';btnSalvar.disabled=true;}

  const d=await _salvarDadosVisita(id,'');
  if(!d){
    if(btnSalvar){btnSalvar.innerHTML=txtOriginal;btnSalvar.disabled=false;}
    window._salvandoNota=null;
    return;
  }

if(window._fotosVisita?.[id]){
    const fotoRaw=window._fotosVisita[id];
    const blob = await fileParaBlob(fotoRaw, 1200, 0.78);
    if(blob){
      const url=await uploadFotoStorage(blob,`fotos/visitas/${usuarioAtual.uid}/${id}_${Date.now()}.jpg`);
      d.fotoUrl=url;
      d.foto='';
    }
    await db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(id).set(d);
    const bar=BARES.find(b=>b.id===id);
    if(bar){
      const ov=document.createElement('div');
      ov.className='modal-overlay';
      ov.innerHTML=`
        <div class="modal-box" style="text-align:center">
          <div style="font-size:2rem;margin-bottom:8px"><i class="ph ph-camera"></i></div>
          <div class="modal-titulo">Compartilhar no feed?</div>
          <p class="modal-desc">Sua foto do <strong>${sanitizeHtml(bar.nome)}</strong> pode aparecer no feed para seus amigos verem.</p>
          <img src="${d.fotoUrl||''}" style="width:100%;max-height:160px;object-fit:cover;border-radius:10px;margin-bottom:16px"/>
          <button onclick="window.compartilharFotoFeed('${id}');window._fotosVisita&&delete window._fotosVisita['${id}'];this.closest('.modal-overlay').remove()" class="btn-login" style="margin-bottom:10px">📤 Compartilhar no feed</button>
          <button onclick="window._fotosVisita&&delete window._fotosVisita['${id}'];this.closest('.modal-overlay').remove()" class="btn-cadastro">Só salvar, sem compartilhar</button>
        </div>`;
      document.body.appendChild(ov);
    }
  }
  const _bar = BARES.find(b => b.id === id);
const _xpInfo = window.calcularXpVisita(
  id,
  _bar?.tier || 'bairro',
  !!(window._fotosVisita?.[id]),
  !!d.comentario
);
window.mostrarXpGanho(_xpInfo, sanitizeHtml(_bar?.nome) || id);
  mostrarNotif('💾 Avaliação salva!');
  navigator.vibrate?.([10,5,20,5,40]); 
 renderBares();
if(document.querySelector('.page.active')?.id==='page-perfil')renderPerfil();
  const paginaAtivaNota=document.querySelector('.page.active')?.id;
  if(paginaAtivaNota==='page-proximos')renderProximos();
  if(btnSalvar){
    btnSalvar.innerHTML='<i class="ph-fill ph-check-circle"></i> Salvo!';
    btnSalvar.style.background='var(--verde)';
    btnSalvar.disabled=false;
    setTimeout(()=>{btnSalvar.innerHTML=txtOriginal;btnSalvar.style.background='';},3000);
  }
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
  verificarUltrapassagem();
};
window.toggleVisita=async function(id){
  if(!usuarioAtual)return;
  const ref=db.collection('users').doc(usuarioAtual.uid).collection('visits').doc(id);
  if(visitas[id]){await ref.delete();delete visitas[id];mostrarNotif('Visita removida');}
  else{
  const d={visitado:true,ts:Date.now()};
  await ref.set(d);
  visitas[id]=d;
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Visita registrada!');
  navigator.vibrate?.([15,8,30]);
  const _barTv=BARES.find(b=>b.id===id);
  const _xpTv=window.calcularXpVisita(id,_barTv?.tier||'bairro',false,false);
  window.mostrarXpGanho(_xpTv,_barTv?.nome||id);
}
  const cardAberto2=cardAberto;
renderBares();
if(document.querySelector('.page.active')?.id==='page-perfil')renderPerfil();
const paginaAtiva=document.querySelector('.page.active')?.id;
if(paginaAtiva==='page-mapa')renderProximos();
if(cardAberto2){
  const info=document.getElementById('info-'+cardAberto2);
  if(info)info.style.display='block';
  cardAberto=cardAberto2;
}
  clearTimeout(window._cacheTimer);
window._cacheTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
delete _cacheAmigos[id];
_cacheVisitasGrupo=null;
const paginaAtivaToggle=document.querySelector('.page.active')?.id;
if(paginaAtivaToggle==='page-roteiro')renderRoteiro();
};
function renderBares(){
  if(!document.getElementById('contadorBares')) return;
  const descMap=window._descMap||{};
  const commMap=window._commMap||{};
  const filtrados=BARES.filter(b=>{
    const mR=regiaoFiltro==='TODOS'||b.regiao===regiaoFiltro;
    const desc=descMap[b.id]?.texto||'';
    const mB=!buscaTexto||b.nome.toLowerCase().includes(buscaTexto)||(b.descricao||'').toLowerCase().includes(buscaTexto)||b.end.toLowerCase().includes(buscaTexto)||desc.toLowerCase().includes(buscaTexto);
    const mV=filtroVisita==='todos'||(filtroVisita==='sim'&&!!visitas[b.id])||(filtroVisita==='nao'&&!visitas[b.id]);
    return mR&&mB&&mV;
  });
  document.getElementById('contadorBares').textContent=`${filtrados.length} bar${filtrados.length!==1?'es':''} encontrado${filtrados.length!==1?'s':''}`;
  const lista=document.getElementById('listaBares');
  if(!filtrados.length){lista.innerHTML='<div class="empty"><div class="empty-icon"><i class="ph ph-magnifying-glass"></i></div><p>Nenhum bar encontrado</p></div>';return;}
  lista.innerHTML = filtrados.map(b => {
    const v = visitas[b.id]; const visitado = !!v; const nota = v?.nota || 0;
    return `<div class="bar-card ${visitado?'visitado':''}" id="card-${b.id}" onclick="window.abrirBottomSheet('${b.id}')" style="cursor:pointer; transition: transform 0.2s;">
      <div class="bar-header" style="padding-bottom:14px;">
        <div style="min-width:0;flex:1">
          <div class="bar-nome" style="font-family:'Bebas Neue',cursive; font-size:1.3rem; letter-spacing:1px;">${visitado?'<i class="ph-fill ph-check-circle"></i> ':''}${sanitizeHtml(b.nome)}</div>
          <div style="font-size:0.75rem;color:var(--laranja);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700;">🍽 ${sanitizeHtml(b.descricao||'')}</div>
          ${nota?`<div style="font-size:0.75rem;margin-top:4px; font-weight:800;">${'<i class="ph-fill ph-star"></i>'.repeat(nota)} ${nota}/10${v?.km?' · '+v.km+'km':''}</div>`:''}
        </div>
        <div style="display:flex; gap:4px; align-items:flex-start; flex-wrap:wrap; justify-content:flex-end; max-width:80px;">
          <span class="bar-regiao-badge"><i class="ph ph-map-pin"></i> ${b.regiao}</span>
          ${b.descricao?.includes('Sugerido') ? `<span class="tag-vibe" style="background:#f0ffe0; color:var(--verde)"><i class="ph ph-users"></i> Comunidade</span>` : ''}
        </div>
      </div>
      <div id="amigos-bar-bares-${b.id}" style="padding: 0 14px 10px;"></div>
    </div>`;
  }).join('');
  filtrados.slice(0,20).forEach(b=>{
  if(typeof renderAmigosNoBar==='function')
    renderAmigosNoBar(b.id,'amigos-bar-bares-'+b.id);
});
}
function calcularStats(vSnap,eSnap){
  let tv=0,tn=0,tk=0,cn=0,primeiro=Infinity;
  const diasSet=new Set(),regioesVisitadas=new Set(),boresVisitadosIds=new Set();
  vSnap.forEach(v=>{
    const d=v.data();tv++;
    if(d.nota){tn+=d.nota;cn++;}
    if(d.km)tk+=d.km;
    if(d.ts){if(d.ts<primeiro)primeiro=d.ts;diasSet.add(new Date(d.ts).toDateString());}
    const bar=BARES.find(b=>b.id===v.id);
    if(bar)regioesVisitadas.add(bar.regiao);
    boresVisitadosIds.add(v.id);
  });
  let te=0;
  eSnap.forEach(v=>{const d=v.data();te++;if(d.nota){tn+=d.nota;cn++;}});
  let totalGasto=0;
vSnap.forEach(v=>{totalGasto+=(v.data().gasto||v.data().valor||0);});
eSnap.forEach(()=>{totalGasto+=40;});
  const totalDias=diasSet.size||1;
  return{visitas:tv,extras:te,totalVisitas:tv+te,media:cn?(tn/cn).toFixed(1):'-',km:tk,totalGasto,mediaDia:(totalGasto/totalDias).toFixed(0),diasAtivos:totalDias,regioesVisitadas,boresVisitadosIds,primeiro:primeiro===Infinity?null:primeiro};
}

function renderRankingTabs(){
  const tabsEl=document.getElementById('rankingTabs');
  if(!tabsEl)return;
  tabsEl.innerHTML=RANKING_CONFIGS.map((r,i)=>`<button class="ranking-tab ${i===rankingAtivo?'active':''}" onclick="window.setRanking(${i})">${r.label}</button>`).join('');
}
window.setRanking=function(i){rankingAtivo=i;renderRankingTabs();renderRankingAtivo();};
window.setVistaGlobal=function(global){
  vistaGlobal=global;
  document.getElementById('btnGlobal').className=global?'ativo':'inativo';
  document.getElementById('btnGrupo').className=global?'inativo':'ativo';
  renderRankingAtivo();
};
let cacheRanking=null,cacheFeed=null,cacheGrupoRanking={},cacheRoteiro=null,cacheRoteiroTs=0;
async function getRankingDados(){
  if(!vistaGlobal&&grupoAtual){
    if(cacheGrupoRanking[grupoAtual]&&(Date.now()-cacheGrupoRanking[grupoAtual].ts)<60000)return cacheGrupoRanking[grupoAtual].dados;
    const grupoDoc=await db.collection('grupos').doc(grupoAtual).get();
    const membros=grupoDoc.data()?.membros||[];
    const lotes=[];
    for(let i=0;i<membros.length;i+=10)lotes.push(membros.slice(i,i+10));
    const dados=[];
    const snaps=await Promise.all(
  lotes.map(lote=>db.collection('ranking').where(
    firebase.firestore.FieldPath.documentId(),'in',lote).get())
);
snaps.forEach(snap=>snap.docs.forEach(d=>dados.push(d.data())));
    cacheGrupoRanking[grupoAtual]={dados,ts:Date.now()};
    return dados;
  }
  if(cacheRanking&&(Date.now()-cacheRanking.ts)<300000)return cacheRanking.dados;
  const snap=await db.collection('ranking').orderBy('totalVisitas','desc').limit(100).get();
  const dados=snap.docs.map(d=>d.data()).filter(d=>d.totalVisitas>0);
  cacheRanking={dados,ts:Date.now()};
  return dados;
}
async function renderRankingAtivo(){
  const cont=document.getElementById('rankingConteudo');
  cont.innerHTML='<div class="empty"><div class="empty-icon"><i class="ph ph-spinner"></i></div><p>Carregando...</p></div>';
  const cfg=RANKING_CONFIGS[rankingAtivo];
  try{
    const dados=await getRankingDados();
    let ordenados=[];
    if(cfg.id==='visitados')ordenados=[...dados].sort((a,b)=>b.totalVisitas-a.totalVisitas);
    else if(cfg.id==='media')ordenados=[...dados].filter(d=>d.mediaNum>0).sort((a,b)=>b.mediaNum-a.mediaNum);
    else if(cfg.id==='km')ordenados=[...dados].sort((a,b)=>b.km-a.km);
    else if(cfg.id==='explorador')ordenados=[...dados].sort((a,b)=>b.regioes-a.regioes);
    else if(cfg.id==='fiel')ordenados=[...dados].sort((a,b)=>b.fiel-a.fiel);
    else if(cfg.id==='exigente')ordenados=[...dados].filter(d=>d.notaMin>0).sort((a,b)=>a.notaMin-b.notaMin);
    else if(cfg.id==='gastao')ordenados=[...dados].sort((a,b)=>b.totalGasto-a.totalGasto);
    else if(cfg.id==='madrugador')ordenados=[...dados].filter(d=>d.primeiro).sort((a,b)=>a.primeiro-b.primeiro);
    else if(cfg.id==='regioes')ordenados=[...dados].sort((a,b)=>b.regioesComp-a.regioesComp);
    window._rankingTodos=[...ordenados];
  
    const getValor=d=>{
      if(cfg.id==='visitados')return d.totalVisitas+' bares';
      if(cfg.id==='media')return d.media+' pts';
      if(cfg.id==='km')return d.km+'km';
      if(cfg.id==='explorador')return d.regioes+' regiões';
      if(cfg.id==='fiel')return d.fiel+'%';
      if(cfg.id==='exigente')return(d.notaMin||'-')+' pts (min)';
      if(cfg.id==='gastao')return 'R$'+d.totalGasto;
      if(cfg.id==='madrugador')return d.primeiro?new Date(d.primeiro).toLocaleDateString('pt-BR'):'';
      if(cfg.id==='regioes')return d.regioesComp+' regiões';
    };
    cont.innerHTML=`<div class="section-title">${cfg.label}</div><div class="section-desc">${cfg.desc}</div>
      ${ordenados.length?`<div id="rankingItems">${ordenados.slice(0,10).map((d,i)=>`
        <div class="ranking-item" onclick="window.abrirPerfil('${d.uid}')" style="cursor:pointer">
  <div class="rank-pos ${i===0?'ouro':i===1?'prata':i===2?'bronze':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'º'}</div>
  <div style="width:32px;height:32px;border-radius:50%;background:var(--laranja);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:1.1rem">${d.avatar&&(d.avatar.startsWith('data:')||d.avatar.startsWith('https://'))?`<img src="${sanitizeHtml(d.avatar)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>`:sanitizeHtml(d.avatar)||'<i class="ph-fill ph-beer-bottle"></i>'}</div>
  <div class="rank-info"><div class="rank-nome">${sanitizeHtml(d.nome)}</div><div class="rank-detalhe">${sanitizeHtml(cfg.desc)}</div></div>
  <div class="rank-valor">${getValor(d)}</div>
</div>`).join('')}</div>${ordenados.length>10?`<button onclick="window.expandirRanking()" id="btnVerMais" style="width:100%;margin-top:10px;padding:10px;border-radius:10px;border:2px solid var(--marrom);background:transparent;color:var(--marrom);font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Ver todos (${ordenados.length})</button>`:''}
<button onclick="window.compartilharRanking()" style="width:100%;margin-top:10px;padding:10px;border-radius:10px;border:2px solid #25D366;background:transparent;color:#25D366;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">📤 Compartilhar no WhatsApp</button>
`:`<div class="empty"><div class="empty-icon">😶</div><p>Sem dados ainda</p>${!vistaGlobal?'<p style="font-size:0.78rem;color:var(--cinza);margin-top:8px">Os membros do grupo precisam registrar visitas para aparecer aqui</p>':''}</div>`}`;
  }catch(e){cont.innerHTML='<div class="empty"><div class="empty-icon"><i class="ph-fill ph-warning"></i></div><p>Erro ao carregar ranking</p></div>';}
}
window._rankingTodos=[];
window.expandirRanking=function(){
  const cont=document.getElementById('rankingItems');
  const cfg=RANKING_CONFIGS[rankingAtivo];
  const getValor=d=>{
    if(cfg.id==='visitados')return d.totalVisitas+' bares';
    if(cfg.id==='media')return d.media+' pts';
    if(cfg.id==='km')return d.km+'km';
    if(cfg.id==='explorador')return d.regioes+' regiões';
    if(cfg.id==='fiel')return d.fiel+'%';
    if(cfg.id==='exigente')return(d.notaMin||'-')+' pts (min)';
    if(cfg.id==='gastao')return 'R$'+d.totalGasto;
    if(cfg.id==='madrugador')return d.primeiro?new Date(d.primeiro).toLocaleDateString('pt-BR'):'';
    if(cfg.id==='regioes')return d.regioesComp+' regiões';
  };
  cont.innerHTML=window._rankingTodos.map((d,i)=>`
    <div class="ranking-item" onclick="window.abrirPerfil('${d.uid}')" style="cursor:pointer">
      <div class="rank-pos ${i===0?'ouro':i===1?'prata':i===2?'bronze':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'º'}</div>
      <div style="width:32px;height:32px;border-radius:50%;background:var(--laranja);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:1.1rem">${d.avatar&&(d.avatar.startsWith('data:')||d.avatar.startsWith('https://'))?`<img src="${sanitizeHtml(d.avatar)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>`:sanitizeHtml(d.avatar)||'<i class="ph-fill ph-beer-bottle"></i>'}</div>
      <div class="rank-info"><div class="rank-nome">${sanitizeHtml(d.nome)}</div><div class="rank-detalhe">${sanitizeHtml(cfg.desc)}</div></div>
      <div class="rank-valor">${getValor(d)}</div>
    </div>`).join('');
  document.getElementById('btnVerMais')?.remove();
};
window.compartilharRanking=async function(){
  const cfg=RANKING_CONFIGS[rankingAtivo];
  const dados=await getRankingDados();
  let ordenados=[];
  if(cfg.id==='visitados')ordenados=[...dados].sort((a,b)=>b.totalVisitas-a.totalVisitas);
  else if(cfg.id==='media')ordenados=[...dados].filter(d=>d.mediaNum>0).sort((a,b)=>b.mediaNum-a.mediaNum);
  else if(cfg.id==='km')ordenados=[...dados].sort((a,b)=>b.km-a.km);
  const top5=ordenados.slice(0,5);
  const emojis=['🥇','🥈','🥉','4️⃣','5️⃣'];
  const getValor=d=>{
    if(cfg.id==='visitados')return d.totalVisitas+' bares';
    if(cfg.id==='media')return d.media+'/10';
    if(cfg.id==='km')return d.km+'km';
    return d.totalVisitas+' bares';
  };
  const meuPlacar=ordenados.findIndex(d=>d.uid===usuarioAtual.uid);
  const linhas=top5.map((d,i)=>`${emojis[i]} ${sanitizeHtml(d.nome)} — ${getValor(d)}`).join('\n');
  const texto=`<i class="ph-fill ph-beer-bottle"></i> *Rota di Buteco BH 2026*\n<i class="ph-fill ph-trophy"></i> *${sanitizeHtml(cfg.label)}*\n\n${linhas}\n\n${meuPlacar>=0?`Minha posição: ${meuPlacar+1}º lugar\n`:''}Acesse: https://rotadibuteco.web.app`;
  window.open('https://wa.me/?text='+encodeURIComponent(texto),'_blank');
};

