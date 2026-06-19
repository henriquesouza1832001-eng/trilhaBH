window.abrirAdmin=async function(){
  document.getElementById('headerDropdown')?.classList.remove('open');
  const adminDoc=await db.collection('admins').doc(usuarioAtual.uid).get();
if(!adminDoc.exists||adminDoc.data()?.admin!==true)return;
document.getElementById('modalAdmin')?.remove();
  const overlay=document.createElement('div');
 overlay.className='modal-overlay';
overlay.id='modalAdmin';
overlay.style.zIndex='9999';
overlay.innerHTML=`
    <div class="modal-box" style="max-width:500px;max-height:80vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph-fill ph-shield"></i> Painel Admin</div>
      <button onclick="window.verSugestoesBaresAdmin()" style="width:100%;padding:9px;border-radius:10px;background:var(--laranja);color:white;border:none;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px"><i class="ph ph-compass"></i> Avaliar Novos Bares</button>
      <button onclick="window.verDenuncias()" style="width:100%;padding:9px;border-radius:10px;background:#cc0000;color:white;border:none;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px"><i class="ph-fill ph-flag"></i> Ver denúncias</button>
      <button onclick="window.abrirClassificadorBares()" 
  style="width:100%;padding:9px;border-radius:10px;background:#5C3D1E;
         color:white;border:none;font-size:0.85rem;font-weight:700;
         cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px">
  <i class="ph ph-tag"></i> Classificar Bares
</button>
      <button onclick="window.abrirFormEvento()" style="width:100%;padding:9px;border-radius:10px;background:#1B5E9B;color:white;border:none;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px">
  <i class="ph ph-calendar-plus"></i> Criar Evento
</button>
<button onclick="window.abrirDistribuirTags()"
  style="width:100%;padding:9px;border-radius:10px;background:#2D6E4E;
         color:white;border:none;font-size:0.85rem;font-weight:700;
         cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px">
  <i class="ph-fill ph-seal-check"></i> Distribuir Tags
</button>
<button onclick="window.classificarBaresAutomaticamente()"
  style="width:100%;padding:9px;border-radius:10px;background:#6B3A8C;
         color:white;border:none;font-size:0.85rem;font-weight:700;
         cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px">
  <i class="ph ph-robot"></i> Classificar Bares com IA
</button>
<button onclick="window.renderAnalyticsAdmin()" 
  style="width:100%;padding:9px;border-radius:10px;background:#1B3A5E;color:white;
         border:none;font-size:0.85rem;font-weight:700;cursor:pointer;
         font-family:'Nunito',sans-serif;margin-bottom:8px">
  <i class="ph ph-chart-bar"></i> Analytics
</button>
<div id="adminConteudo"><p style="color:var(--cinza);font-size:0.82rem">Carregando usuários...</p></div>

<div style="margin-top:24px;padding:16px;background:white;border-radius:14px">
  <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:var(--marrom);margin-bottom:12px">
    <i class="ph-fill ph-seal-check"></i> Atribuir Tag Especial
  </div>
  <input id="adminTagUid" type="text" placeholder="UID do usuário"
    style="width:100%;padding:9px 12px;border:1.5px solid #e0d0c0;border-radius:8px;
           font-size:0.85rem;font-family:'Nunito',sans-serif;margin-bottom:8px;box-sizing:border-box"/>
  <select id="adminTagRole"
    style="width:100%;padding:9px 12px;border:1.5px solid #e0d0c0;border-radius:8px;
           font-size:0.85rem;font-family:'Nunito',sans-serif;margin-bottom:8px">
    <option value="">Remover tag</option>
    <option value="Curador Oficial">Curador Oficial</option>
    <option value="Embaixador">Embaixador</option>
    <option value="Mestre Cervejeiro">Mestre Cervejeiro</option>
    <option value="Fundador">Fundador</option>
  </select>
  <button onclick="window.adminAtribuirTag()"
    style="width:100%;padding:10px;border-radius:10px;background:var(--marrom);
           color:white;border:none;font-size:0.88rem;font-weight:700;cursor:pointer;
           font-family:'Nunito',sans-serif">
    Salvar Tag
  </button>
  <div id="adminTagMsg" style="font-size:0.78rem;margin-top:8px"></div>
</div>

<button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro" style="margin-top:8px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);

  const rankSnap=await db.collection('ranking').orderBy('totalVisitas','desc').limit(100).get();
const dados=rankSnap.docs.map(d=>d.data()).filter(d=>d&&d.uid&&d.nome);
  const usersSnap=await db.collection('users').get();
const usersMap={};
usersSnap.forEach(d=>{usersMap[d.id]=d.data();});

document.getElementById('adminConteudo').innerHTML=dados.map(u=>{
  const info=usersMap[u.uid]||{};
  const contato=info.contatoPremio||'';
  return`<div style="padding:10px 0;border-bottom:1px solid #f0e0d0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div>
        <div style="font-weight:800;font-size:0.88rem;color:var(--marrom)">${sanitizeHtml(u.avatar)||'<i class="ph-fill ph-beer-bottle"></i>'} ${sanitizeHtml(u.nome)}</div>
        <div style="font-size:0.72rem;color:var(--cinza)">${u.totalVisitas||0} bares · ${u.uid}</div>
        ${contato?`<div style="font-size:0.78rem;color:var(--verde);font-weight:700;margin-top:2px"><i class="ph ph-device-mobile"></i> ${sanitizeHtml(contato)}</div>`:'<div style="font-size:0.72rem;color:#bbb">sem contato cadastrado</div>'}
      </div>
      <button onclick="window.banirUsuario('${u.uid}','${sanitizeHtml(u.nome.replace(/'/g,"\\'"))}')" style="padding:5px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-prohibit"></i> Banir</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
  <button onclick="window.verComentariosAdmin('${u.uid}','${sanitizeHtml(u.nome)}')" style="padding:4px 10px;border-radius:8px;background:#f0e0d0;color:var(--marrom);border:none;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-chat-teardrop-text"></i> Comentários</button>
  <button onclick="window.resetarRankingUsuario('${u.uid}','${sanitizeHtml(u.nome)}')" style="padding:4px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-trash"></i> Reset ranking</button>
</div>
<div id="comms-${u.uid}" style="display:none;margin-top:8px"></div>
  </div>`;
}).join('');
};
window.banirUsuario=async function(uid,nome){
  const ov=document.createElement('div');
ov.className='modal-overlay';
ov.innerHTML=`<div style="background:white;border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center">
  <p style="font-weight:800;margin-bottom:8px">Banir ${sanitizeHtml(nome)}?</p>
  <p style="font-size:0.85rem;color:#666;margin-bottom:20px">Isso vai apagar todos os dados dele.</p>
  <div style="display:flex;gap:10px">
    <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
    <button id="btnConfBan" style="flex:1;padding:10px;border-radius:8px;background:#c00;color:white;border:none;cursor:pointer;font-weight:800">Banir</button>
  </div>
</div>`;
ov.querySelector('#btnConfBan').onclick = async () => {
  ov.remove();
  try {
    await db.collection('users').doc(uid).set({banido:true, banitoEm:Date.now()}, {merge:true});
    mostrarNotif(`<i class="ph ph-prohibit"></i> ${sanitizeHtml(nome)} banido!`, 'erro');
    document.querySelector('.modal-overlay')?.remove();
  } catch(e) { mostrarNotif('Erro ao banir', 'erro'); }
};
document.body.appendChild(ov);
return;
};

window.verComentariosAdmin=async function(uid,nome){
  const cont=document.getElementById('comms-'+uid);
  if(cont.style.display!=='none'){cont.style.display='none';return;}
  cont.style.display='block';
  cont.innerHTML='<p style="font-size:0.75rem;color:var(--cinza)">Carregando...</p>';

  try{
    const comentarios=[];
    const resumoSnap=await db.collection('comentarios').doc('resumo').get();
    if(resumoSnap.exists){
      const resumo=resumoSnap.data();
      for(const [barId,posts] of Object.entries(resumo)){
        const bar=BARES.find(b=>b.id===barId);
        if(!bar)continue;
        const doUsuario=(posts||[]).filter(p=>p.uid===uid&&p.texto);
        doUsuario.forEach(p=>comentarios.push({id:p.docId,barId,barNome:bar.nome,...p}));
      }
    }
    if(!comentarios.length){cont.innerHTML='<p style="font-size:0.75rem;color:var(--cinza)">Nenhum comentário</p>';return;}
    cont.innerHTML=comentarios.map(c=>`
      <div style="padding:6px 0;border-bottom:1px solid #f8f0e8;display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div>
          <div style="font-size:0.72rem;font-weight:700;color:var(--laranja)">${sanitizeHtml(c.barNome)}</div>
          <div style="font-size:0.75rem;color:var(--marrom)">${sanitizeHtml(c.texto)||'(sem texto)'}</div>
        </div>
        <button onclick="window.apagarComentarioAdmin('${c.barId}','${c.id}','${uid}')" style="flex-shrink:0;padding:3px 8px;border-radius:6px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-trash"></i></button>
      </div>`).join('');
  }catch(e){
    cont.innerHTML='<p style="font-size:0.75rem;color:var(--cinza)">Erro ao carregar comentários</p>';
  }
};

window.apagarComentarioAdmin = async function(barId, postId, uid) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:4000';
  ov.innerHTML = `<div style="background:white;border-radius:16px;padding:24px;max-width:300px;width:90%;text-align:center">
    <p style="font-weight:800;margin-bottom:16px">Apagar comentário?</p>
    <div style="display:flex;gap:10px">
      <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
      <button id="btnConfApagar" style="flex:1;padding:10px;border-radius:8px;background:#c00;color:white;border:none;cursor:pointer;font-weight:800">Apagar</button>
    </div>
  </div>`;
  ov.querySelector('#btnConfApagar').onclick = async () => {
    ov.remove();
    await db.collection('comentarios').doc(barId).collection('posts').doc(postId).delete();
    const resumoRef = db.collection('comentarios').doc('resumo');
    const resumoSnap = await resumoRef.get();
    if (resumoSnap.exists) {
      const resumo = resumoSnap.data();
      if (resumo[barId]) {
        resumo[barId] = resumo[barId].filter(c => c.docId !== postId);
        await resumoRef.set(resumo);
      }
    }
    localStorage.removeItem('commMap');
    const feedDoc = await db.collection('ranking').doc('feed').get();
    if (feedDoc.exists) {
      const eventos = feedDoc.data().eventos || [];
      const novos = eventos.map(e => {
        if (e.barId === barId && e.uid === uid) return {...e, comentario: ''};
        return e;
      });
      await db.collection('ranking').doc('feed').set({eventos: novos, atualizado: Date.now()});
    }
    cacheFeed = null;
    mostrarNotif('<i class="ph ph-trash"></i> Comentário apagado!', 'erro');
    window.verComentariosAdmin(uid, '');
  };
  document.body.appendChild(ov);
};


let _posUsuario=null;
window.resetarRankingUsuario=async function(uid,nome){
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  ov.style.cssText='display:flex;align-items:center;justify-content:center;z-index:4000';
  ov.innerHTML=`<div style="background:white;border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center">
    <p style="font-weight:800;margin-bottom:8px">Resetar ranking de ${sanitizeHtml(nome)}?</p>
    <p style="font-size:0.82rem;color:#666;margin-bottom:12px">Digite <strong>RESETAR</strong> para confirmar.</p>
    <input id="inputConfReset" style="width:100%;padding:10px;border:1.5px solid #ccc;border-radius:8px;font-family:'Nunito',sans-serif;font-size:0.9rem;box-sizing:border-box;margin-bottom:14px" placeholder="RESETAR"/>
    <div style="display:flex;gap:10px">
      <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
      <button id="btnConfReset" style="flex:1;padding:10px;border-radius:8px;background:#c00;color:white;border:none;cursor:pointer;font-weight:800">Resetar</button>
    </div>
  </div>`;
  ov.querySelector('#btnConfReset').onclick=async()=>{
    const digitado=ov.querySelector('#inputConfReset').value;
    if(digitado!=='RESETAR'){mostrarNotif('Confirmação incorreta','erro');return;}
    ov.remove();
    try {
  await db.collection('ranking').doc(uid).delete();
  mostrarNotif(`<i class="ph ph-trash"></i> Ranking de ${sanitizeHtml(nome)} resetado!`, 'erro');
  document.querySelector('.modal-overlay')?.remove();
} catch(e) { mostrarNotif('Erro ao resetar', 'erro'); }
  };
  document.body.appendChild(ov);
};
window.verDenuncias=async function(){
  document.querySelector('.modal-overlay')?.remove();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box" style="max-width:500px;max-height:85vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph-fill ph-flag"></i> Denúncias</div>
      <div id="denunciasLista"><p style="color:var(--cinza)">Carregando...</p></div>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro" style="margin-top:12px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
  const snap=await db.collection('denuncias').orderBy('ts','desc').limit(50).get();
  const lista=document.getElementById('denunciasLista');
  if(snap.empty){lista.innerHTML='<p style="color:var(--cinza)">Nenhuma denúncia!</p>';return;}
  lista.innerHTML=snap.docs.map(doc=>{
    const d=doc.data();
    return`<div style="padding:10px 0;border-bottom:1px solid #f0e0d0">
      <div style="font-weight:800;font-size:0.88rem;color:var(--marrom)">${sanitizeHtml(d.nome)}</div>
      <div style="font-size:0.72rem;color:var(--cinza);margin-bottom:6px">${new Date(d.ts).toLocaleString('pt-BR')}</div>
      <div style="display:flex;gap:6px">
        <button onclick="window.banirUsuario('${d.uid}','${sanitizeHtml(d.nome)}')" style="padding:5px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-prohibit"></i> Banir</button>
        <button onclick="db.collection('denuncias').doc('${doc.id}').delete();this.closest('div[style*=padding]').remove();mostrarNotif('Denúncia arquivada')" style="padding:5px 10px;border-radius:8px;background:#f0e0d0;color:var(--marrom);border:none;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph-fill ph-check-circle"></i> Arquivar</button>
      </div>
    </div>`;
  }).join('');
};
window.verSugestoesBaresAdmin = async function(){
  document.querySelector('.modal-overlay')?.remove();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box" style="max-width:500px;max-height:85vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph ph-compass"></i> Aprovar Bares</div>
      <div id="sugestoesBaresLista"><p style="color:var(--cinza)">Carregando...</p></div>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro" style="margin-top:12px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);

  const snap=await db.collection('sugestoesBares').where('status','==','pendente').orderBy('ts','desc').get();
  const lista=document.getElementById('sugestoesBaresLista');
  
  if(snap.empty){lista.innerHTML='<p style="color:var(--cinza)">Nenhuma sugestão pendente.</p>';return;}
  
  lista.innerHTML=snap.docs.map(doc=>{
    const d=doc.data();
    return `<div style="padding:12px;border:1.5px solid #e0d0c0;border-radius:10px;margin-bottom:10px;background:#fdf8f3" id="sugestao-${sanitizeHtml(doc.id)}">
      <div style="font-weight:800;font-size:1rem;color:var(--marrom);margin-bottom:4px">${sanitizeHtml(d.nome)}</div>
      <div style="font-size:0.75rem;color:var(--laranja);font-weight:700;margin-bottom:4px">Bairro: ${sanitizeHtml(d.bairro)}</div>
      <div style="font-size:0.75rem;color:var(--cinza);margin-bottom:8px"><i class="ph ph-map-pin"></i> ${sanitizeHtml(d.endereco)}</div>
      <div style="font-size:0.8rem;color:#444;font-style:italic;margin-bottom:10px;background:white;padding:8px;border-radius:6px">"${sanitizeHtml(d.motivo)}"<br><span style="font-size:0.65rem;color:#888;display:block;margin-top:4px">— Sugerido por ${sanitizeHtml(d.nomeUser)}</span></div>
      
      <div style="display:flex;flex-direction:column;gap:6px">
        <input type="text" id="prato-${sanitizeHtml(doc.id)}" placeholder="Prato principal / Petisco (Obrigatório)" style="width:100%;padding:8px;border:1px solid #e0d0c0;border-radius:6px;font-size:0.8rem;font-family:'Nunito',sans-serif" />
        <select id="regiao-${sanitizeHtml(doc.id)}" style="width:100%;padding:8px;border:1px solid #e0d0c0;border-radius:6px;font-size:0.8rem;font-family:'Nunito',sans-serif">
          <option value="CENTRO">CENTRO</option><option value="SUL">SUL</option><option value="LESTE">LESTE</option>
          <option value="OESTE">OESTE</option><option value="NORTE">NORTE</option><option value="NORDESTE">NORDESTE</option><option value="NOROESTE">NOROESTE</option>
        </select>
        <div style="display:flex;gap:6px">
          <input type="number" id="lat-${sanitizeHtml(doc.id)}" placeholder="Latitude (ex: -19.923)" step="0.000001" style="flex:1;padding:8px;border:1px solid #e0d0c0;border-radius:6px;font-size:0.8rem;font-family:'Nunito',sans-serif" />
          <input type="number" id="lng-${sanitizeHtml(doc.id)}" placeholder="Longitude (ex: -43.938)" step="0.000001" style="flex:1;padding:8px;border:1px solid #e0d0c0;border-radius:6px;font-size:0.8rem;font-family:'Nunito',sans-serif" />
        </div>
        <a href="https://www.google.com.br/maps/search/${encodeURIComponent(d.nome + ' ' + d.endereco)}" target="_blank" style="font-size:0.7rem;color:var(--laranja);text-decoration:none;font-weight:700;"><i class="ph ph-map-trifold"></i> Buscar coordenadas no Google Maps (Clique com botão direito no pino)</a>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px">
        <button onclick="window.aprovarBarAdmin('${doc.id}', '${sanitizeHtml(d.nome)}', '${sanitizeHtml(d.endereco)}')" style="flex:1;padding:8px;border-radius:8px;background:var(--verde);color:white;border:none;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph-fill ph-check-circle"></i> Aprovar Bar</button>
        <button onclick="window.recusarBarAdmin('${doc.id}')" style="padding:8px 12px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph-fill ph-x-circle"></i></button>
      </div>
    </div>`;
  }).join('');
};

window.aprovarBarAdmin = async function(docId, nome, endereco) {
  const prato = document.getElementById(`prato-${docId}`).value.trim();
  const regiao = document.getElementById(`regiao-${docId}`).value;
  const lat = parseFloat(document.getElementById(`lat-${docId}`).value);
  const lng = parseFloat(document.getElementById(`lng-${docId}`).value);
  
  if(!prato) { window.mostrarNotif('Digite o prato/petisco antes de aprovar', 'erro'); return; }
  if(isNaN(lat) || isNaN(lng)) { window.mostrarNotif('Insira Latitude e Longitude válidas', 'erro'); return; }
  
  try {
  
    await db.collection('sugestoesBares').doc(docId).update({ status: 'aprovado' });
   await db.collection('estabelecimentos').doc(docId).set({
      id: docId,
      nome: nome,
      end: endereco,
      regiao: regiao,
      prato: prato,
      tipo: ['trilha-bh'],
      aprovado: true,
      lat: lat,
      lng: lng,
      descricao: "Sugerido pela comunidade da Trilha BH."
    });
    document.getElementById(`sugestao-${docId}`).remove();
    window.mostrarNotif('<i class="ph-fill ph-check-circle"></i> Bar aprovado e adicionado à plataforma!');
    
    localStorage.removeItem('estab_cdb_2026_v1');
    setTimeout(() => { location.reload(); }, 2000);

  } catch(e) {
    window.mostrarNotif('Erro ao aprovar', 'erro');
  }
};

window.recusarBarAdmin=async function(docId){
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  ov.style.cssText='display:flex;align-items:center;justify-content:center;z-index:4000';
  ov.innerHTML=`<div style="background:white;border-radius:16px;padding:24px;max-width:300px;width:90%;text-align:center">
    <p style="font-weight:800;margin-bottom:16px">Recusar esta sugestão?</p>
    <div style="display:flex;gap:10px">
      <button onclick="this.closest('.modal-overlay').remove()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;background:transparent;cursor:pointer">Cancelar</button>
      <button id="btnConfRecusar" style="flex:1;padding:10px;border-radius:8px;background:#c00;color:white;border:none;cursor:pointer;font-weight:800">Recusar</button>
    </div>
  </div>`;
  ov.querySelector('#btnConfRecusar').onclick=async()=>{
    ov.remove();
    await db.collection('sugestoesBares').doc(docId).update({status:'recusado'});
    document.getElementById(`sugestao-${docId}`)?.remove();
    window.mostrarNotif('<i class="ph-fill ph-x-circle"></i> Sugestão recusada');
  };
  document.body.appendChild(ov);
};
window.abrirFormEvento = function() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-height:90vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph ph-calendar-plus"></i> Novo Evento</div>

      <div class="form-group">
        <label>Tipo</label>
        <select id="evTipo" style="width:100%;padding:10px;border:1.5px solid var(--border);
          border-radius:10px;font-family:'Nunito',sans-serif;background:var(--surface);color:var(--text)">
          <option value="show">🎸 Show ao Vivo</option>
          <option value="samba">🎵 Samba de Esquina</option>
          <option value="happy_hour">🍺 Happy Hour</option>
          <option value="degustacao">🍷 Degustação</option>
          <option value="festival">🎉 Festival</option>
          <option value="outro">📅 Outro</option>
        </select>
      </div>

      <div class="form-group">
        <label>Bar (ID exato do Firestore)</label>
        <input id="evBarId" type="text" class="input-field" placeholder="ex: bar_123" style="margin:0"/>
      </div>

      <div class="form-group">
        <label>Nome do Bar</label>
        <input id="evBarNome" type="text" class="input-field" placeholder="ex: Bar do Zé" style="margin:0"/>
      </div>

      <div class="form-group">
        <label>Título do Evento</label>
        <input id="evTitulo" type="text" class="input-field" placeholder="ex: Samba na Varanda" style="margin:0"/>
      </div>

      <div class="form-group">
        <label>Descrição</label>
        <textarea id="evDesc" class="nota-comment" rows="2"
          placeholder="Detalhes do evento..."></textarea>
      </div>

      <div class="form-group" style="display:flex;gap:10px">
        <div style="flex:1">
          <label>Data</label>
          <input id="evData" type="date" class="input-field" style="margin:0"/>
        </div>
        <div style="flex:1">
          <label>Hora</label>
          <input id="evHora" type="time" class="input-field" style="margin:0"/>
        </div>
      </div>

      <div class="form-group">
        <label>Endereço do Evento</label>
        <input id="evEndereco" type="text" class="input-field"
          placeholder="ex: Rua Sapucaí, 123 - Floresta" style="margin:0"/>
      </div>

      <div class="form-group">
        <label>Link Externo (Instagram, WhatsApp, site...)</label>
        <input id="evLink" type="url" class="input-field"
          placeholder="https://instagram.com/..." style="margin:0"/>
      </div>

      <div class="form-group">
        <label>Foto do Evento</label>
        <div class="evento-foto-tabs">
          <button class="evento-foto-tab ativo" id="tabUrl"
            onclick="window._evFotoTab('url')">
            <i class="ph ph-link"></i> URL
          </button>
          <button class="evento-foto-tab" id="tabUpload"
            onclick="window._evFotoTab('upload')">
            <i class="ph ph-upload-simple"></i> Upload
          </button>
        </div>
        <div id="evFotoUrlWrap">
          <input id="evFotoUrl" type="url" class="input-field"
            placeholder="https://..." style="margin:0"
            oninput="window._evPreviewUrl(this.value)"/>
        </div>
        <div id="evFotoUploadWrap" style="display:none">
          <input id="evFotoUpload" type="file" accept="image/*"
            style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:10px;font-family:'Nunito',sans-serif"
            onchange="window._evPreviewUpload(this)"/>
        </div>
        <img id="evFotoPreview" class="evento-foto-preview"/>
      </div>

      <div class="form-group" style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="evPetFriendly" style="width:18px;height:18px;accent-color:var(--laranja)"/>
        <label for="evPetFriendly" style="margin:0;cursor:pointer">
          <i class="ph ph-paw-print"></i> Pet Friendly
        </label>
      </div>

      <div id="evMsg" style="font-size:0.78rem;color:var(--danger);min-height:18px;margin-bottom:8px"></div>

      <button onclick="window.salvarEvento()" class="btn-primary" style="margin-bottom:10px">
        <i class="ph ph-check-circle"></i> Salvar Evento
      </button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-outline">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
};

window._evFotoTab = function(tab) {
  document.getElementById('tabUrl').classList.toggle('ativo', tab === 'url');
  document.getElementById('tabUpload').classList.toggle('ativo', tab === 'upload');
  document.getElementById('evFotoUrlWrap')?.style && (document.getElementById('evFotoUrlWrap').style.display = tab === 'url' ? 'block' : 'none');
  document.getElementById('evFotoUploadWrap')?.style && (document.getElementById('evFotoUploadWrap').style.display = tab === 'upload' ? 'block' : 'none');
};

window._evPreviewUrl = function(url) {
  const prev = document.getElementById('evFotoPreview');
  if (url && (url.startsWith('http'))) {
    prev.src = url;
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
  }
};

window._evPreviewUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('evFotoPreview');
    prev.src = e.target.result;
    prev.style.display = 'block';
    window._evFotoBase64 = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.salvarEvento = async function() {
  const tipo     = document.getElementById('evTipo').value;
  const barId    = document.getElementById('evBarId').value.trim();
  const barNome  = document.getElementById('evBarNome').value.trim();
  const titulo   = document.getElementById('evTitulo').value.trim();
  const desc     = document.getElementById('evDesc').value.trim();
  const data     = document.getElementById('evData').value;
  const hora     = document.getElementById('evHora').value;
  const endereco = document.getElementById('evEndereco').value.trim();
  const link     = document.getElementById('evLink').value.trim();
  const pet      = document.getElementById('evPetFriendly').checked;
  const msg      = document.getElementById('evMsg');

  if (!titulo || !data || !hora) {
    msg.textContent = 'Preencha título, data e hora.'; return;
  }

  // foto — prioriza upload, depois URL
  let fotoUrl = document.getElementById('evFotoUrl').value.trim();
  if (window._evFotoBase64) {
    // se tiver firebase storage real, faria upload aqui
    // no mock, usa o base64 direto
    fotoUrl = window._evFotoBase64;
    window._evFotoBase64 = null;
  }

  await db.collection('eventos').add({
    tipo, barId, barNome, titulo,
    descricao: desc,
    data: new Date(data + 'T' + hora),
    hora, endereco,
    linkExterno: link,
    fotoUrl,
    petFriendly: pet,
    criadoPor: usuarioAtual.uid,
    interessados: [],
    ativo: true,
    ts: Date.now()
  });

  _eventosCache = null;
  document.querySelector('.modal-overlay')?.remove();
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Evento criado!');
};
window.adminAtribuirTag = async function() {
  const uid = document.getElementById('adminTagUid')?.value.trim();
  const role = document.getElementById('adminTagRole')?.value;
  const msg = document.getElementById('adminTagMsg');
  if (!uid) { msg.style.color='#cc0000'; msg.textContent='Informe o UID.'; return; }
  await db.collection('users').doc(uid).set({ tagRole: role || null }, { merge: true });
  msg.style.color = 'var(--verde)';
  msg.textContent = role ? `Tag "${role}" atribuída!` : 'Tag removida.';
};
window.abrirClassificadorBares = function() {
  document.querySelector('.modal-overlay')?.remove();
  const naoClassificados = BARES.filter(b =>
    !b.vibes?.length || b.vibes.length === 0
  );
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:500px;max-height:85vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph ph-tag"></i> Classificar Bares</div>
      <div style="font-size:0.78rem;color:var(--cinza);margin-bottom:12px">
        ${naoClassificados.length} bares sem vibe classificada
      </div>
      <input id="classificBusca" type="search" placeholder="Buscar bar..."
        style="width:100%;padding:9px 12px;border:1.5px solid #e0d0c0;border-radius:8px;
               font-size:0.85rem;font-family:'Nunito',sans-serif;margin-bottom:12px;box-sizing:border-box"
        oninput="window._filtrarClassific(this.value)"/>
      <div id="classificLista"></div>
      <button onclick="this.closest('.modal-overlay').remove()" 
        class="btn-cadastro" style="margin-top:12px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
  window._classificBares = BARES;
  window._renderClassific(BARES.slice(0, 30));
};

window._filtrarClassific = function(busca) {
  const filtrados = window._classificBares.filter(b =>
    b.nome.toLowerCase().includes(busca.toLowerCase())
  );
  window._renderClassific(filtrados.slice(0, 30));
};

window._renderClassific = function(lista) {
  const cont = document.getElementById('classificLista');
  if (!cont) return;
  cont.innerHTML = lista.map(b => {
    const tipoAtual = (b.tipo || ['bar']).join(',');
    const vibesAtuais = b.vibes || [];
    return `
    <div style="padding:12px;border:1px solid #e0d0c0;border-radius:10px;margin-bottom:8px;background:#fdf8f3">
      <div style="font-weight:800;font-size:0.9rem;color:var(--marrom);margin-bottom:8px">
        ${sanitizeHtml(b.nome)}
        <span style="font-size:0.65rem;color:var(--cinza);font-weight:400"> · ${b.regiao}</span>
      </div>

      <div style="font-size:0.72rem;font-weight:700;color:var(--cinza);margin-bottom:4px">TIPO</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
        ${['bar','petiscaria','cervejaria','sinuca'].map(t => `
          <button onclick="window._toggleTipo('${b.id}','${t}',this)"
            style="padding:4px 10px;border-radius:16px;font-size:0.72rem;font-weight:700;
                   cursor:pointer;font-family:'Nunito',sans-serif;border:1.5px solid var(--laranja);
                   background:${(b.tipo||[]).includes(t)?'var(--laranja)':'transparent'};
                   color:${(b.tipo||[]).includes(t)?'white':'var(--laranja)'}">
            ${t}
          </button>`).join('')}
      </div>

      <div style="font-size:0.72rem;font-weight:700;color:var(--cinza);margin-bottom:4px">AMBIENTE</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
        ${VIBES.map(v => `
          <button onclick="window._toggleVibe('${b.id}','${v.id}',this)"
            style="padding:4px 10px;border-radius:16px;font-size:0.72rem;font-weight:700;
                   cursor:pointer;font-family:'Nunito',sans-serif;border:1.5px solid #1B5E9B;
                   background:${vibesAtuais.includes(v.id)?'#1B5E9B':'transparent'};
                   color:${vibesAtuais.includes(v.id)?'white':'#1B5E9B'}">
            ${v.label}
          </button>`).join('')}
      </div>

      <div style="display:flex;align-items:center;gap:8px">
        <label style="font-size:0.72rem;font-weight:700;color:#F9A825;cursor:pointer;
                      display:flex;align-items:center;gap:4px">
          <input type="checkbox" ${b.cdb?'checked':''} 
            onchange="window._toggleCdb('${b.id}',this.checked)"
            style="accent-color:#F9A825"/>
          ★ Comida di Buteco
        </label>
        <div id="salvo-${b.id}" style="font-size:0.7rem;color:var(--verde);display:none">
          ✓ salvo
        </div>
      </div>
    </div>`;
  }).join('');
};

window._toggleTipo = function(barId, tipo, btn) {
  const b = BARES.find(x => x.id === barId);
  if (!b) return;
  if (!b.tipo) b.tipo = ['bar'];
  const idx = b.tipo.indexOf(tipo);
  if (idx > -1) b.tipo.splice(idx, 1);
  else b.tipo.push(tipo);
  if (!b.tipo.length) b.tipo = ['bar'];
  btn.style.background = b.tipo.includes(tipo) ? 'var(--laranja)' : 'transparent';
  btn.style.color = b.tipo.includes(tipo) ? 'white' : 'var(--laranja)';
  window._salvarClassific(barId);
};

window._toggleVibe = function(barId, vibe, btn) {
  const b = BARES.find(x => x.id === barId);
  if (!b) return;
  if (!b.vibes) b.vibes = [];
  const idx = b.vibes.indexOf(vibe);
  if (idx > -1) b.vibes.splice(idx, 1);
  else b.vibes.push(vibe);
  btn.style.background = b.vibes.includes(vibe) ? '#1B5E9B' : 'transparent';
  btn.style.color = b.vibes.includes(vibe) ? 'white' : '#1B5E9B';
  window._salvarClassific(barId);
};

window._toggleCdb = function(barId, valor) {
  const b = BARES.find(x => x.id === barId);
  if (!b) return;
  b.cdb = valor;
  window._salvarClassific(barId);
};

window._salvarClassific = async function(barId) {
  const b = BARES.find(x => x.id === barId);
  if (!b) return;
  await db.collection('classificacoes').doc(barId).set({
    tipo: b.tipo || ['bar'],
    vibes: b.vibes || [],
    cdb: b.cdb || false,
    ts: Date.now()
  }, { merge: true });
  const el = document.getElementById('salvo-' + barId);
  if (el) { el.style.display = 'inline'; setTimeout(() => el.style.display = 'none', 2000); }
};
window.renderAnalyticsAdmin = async function() {
  const cont = document.getElementById('adminConteudo'); // ajuste o id se diferente
  cont.innerHTML = '<div style="text-align:center;padding:40px"><i class="ph ph-spinner"></i> Carregando...</div>';

  const [snapAnon, snapUsers] = await Promise.all([
    db.collection('analytics').doc('anonimos').collection('registros')
      .orderBy('ts', 'desc').limit(500).get(),
    db.collection('analytics').doc('usuarios').collection('acessos')
      .orderBy('ultimoAcesso', 'desc').get()
  ]);

  // Anônimos por dia
  const porDia = {};
  snapAnon.forEach(d => {
    const dia = d.data().dia || '?';
    porDia[dia] = (porDia[dia] || 0) + 1;
  });
  const diasOrdenados = Object.keys(porDia).sort().reverse().slice(0, 14);

  // Usuários logados
  const totalUsers = snapUsers.size;
  const agora = Date.now();
  const ativos7d = snapUsers.docs.filter(d => agora - (d.data().ultimoAcesso || 0) < 7*24*60*60*1000).length;
  const ativos30d = snapUsers.docs.filter(d => agora - (d.data().ultimoAcesso || 0) < 30*24*60*60*1000).length;
  const novos7d = snapUsers.docs.filter(d => agora - (d.data().primeiroAcesso || 0) < 7*24*60*60*1000).length;

  // Anônimos únicos totais
  const anonIds = new Set(snapAnon.docs.map(d => d.data().anonId));

  cont.innerHTML = `
    <div style="padding:16px">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:var(--marrom);margin-bottom:16px">
        <i class="ph ph-chart-bar"></i> Analytics
      </div>

      <!-- Cards resumo -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${totalUsers}</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Usuários cadastrados</div>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${anonIds.size}</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Anônimos únicos</div>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${ativos7d}</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Ativos 7 dias</div>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${ativos30d}</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Ativos 30 dias</div>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${novos7d}</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Novos 7 dias</div>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:1.8rem;font-weight:800;color:var(--laranja)">${totalUsers > 0 ? Math.round((ativos30d/totalUsers)*100) : 0}%</div>
          <div style="font-size:0.72rem;color:var(--cinza);font-weight:700">Retenção 30d</div>
        </div>
      </div>

      <!-- Anônimos por dia -->
      <div style="font-size:0.78rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
                  letter-spacing:.5px;margin-bottom:8px">Acessos anônimos — últimos 14 dias</div>
      ${diasOrdenados.map(dia => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:0.72rem;color:var(--cinza);width:80px;flex-shrink:0">${dia}</span>
          <div style="flex:1;height:18px;background:var(--border);border-radius:6px;overflow:hidden">
            <div style="height:100%;width:${Math.min((porDia[dia]/Math.max(...Object.values(porDia)))*100,100)}%;
                        background:var(--laranja);border-radius:6px"></div>
          </div>
          <span style="font-size:0.72rem;font-weight:800;color:var(--marrom);width:24px;text-align:right">${porDia[dia]}</span>
        </div>`).join('')}

      <!-- Últimos usuários -->
      <div style="font-size:0.78rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
                  letter-spacing:.5px;margin:16px 0 8px">Últimos usuários ativos</div>
      ${snapUsers.docs.slice(0,10).map(d => {
        const u = d.data();
        const diasSem = Math.floor((agora - (u.ultimoAcesso||0)) / (24*60*60*1000));
        return `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:0.82rem;color:var(--marrom);font-weight:700">${u.uid?.slice(0,12)}...</span>
          <div style="text-align:right">
            <div style="font-size:0.7rem;color:var(--cinza)">${diasSem === 0 ? 'hoje' : diasSem + 'd atrás'}</div>
            <div style="font-size:0.65rem;color:var(--cinza)">${u.totalAcessos || 1} acessos</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
};
// ── Painel Moderador ──────────────────────────────────────────
window.abrirPainelModerador = function() {
  document.getElementById('headerDropdown')?.classList.remove('open');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modalModerador';
  overlay.style.zIndex = '9999';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:500px;max-height:85vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph-fill ph-shield" style="color:var(--verde)"></i> Painel Moderador</div>
      <p style="font-size:0.78rem;color:var(--cinza);margin-bottom:16px">
        Você tem permissões de moderação. Use com responsabilidade.
      </p>
      <button onclick="window.verSugestoesBaresAdmin()"
        class="mod-panel-btn" style="background:var(--laranja);color:white">
        <i class="ph ph-compass"></i> Avaliar Novos Bares
      </button>
      <button onclick="window.abrirFormEvento()"
        class="mod-panel-btn" style="background:#1B5E9B;color:white">
        <i class="ph ph-calendar-plus"></i> Criar Evento
      </button>
      <button onclick="window.abrirDistribuirTags()"
        class="mod-panel-btn" style="background:var(--marrom);color:white">
        <i class="ph-fill ph-seal-check"></i> Distribuir Tags
      </button>
      <button onclick="this.closest('.modal-overlay').remove()"
        class="btn-cadastro" style="margin-top:8px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
};

// ── UI de distribuição de tags (admin + moderador) ────────────
window.abrirDistribuirTags = function() {
  document.querySelector('.modal-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:500px;max-height:85vh;overflow-y:auto;text-align:left">
      <div class="modal-titulo"><i class="ph-fill ph-seal-check"></i> Distribuir Tags</div>

      <!-- Busca por nome ou email -->
      <div style="margin-bottom:12px">
        <div style="font-size:0.75rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
                    letter-spacing:.5px;margin-bottom:6px">Buscar usuário</div>
        <div style="display:flex;gap:8px">
          <input id="tagBuscaInput" type="text" placeholder="Nome ou e-mail..."
            style="flex:1;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;
                   font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;
                   color:var(--text);background:var(--surface)"/>
          <button onclick="window._buscarUsuarioTag()"
            style="padding:9px 14px;border-radius:8px;background:var(--marrom);color:white;
                   border:none;font-size:0.85rem;font-weight:700;cursor:pointer;
                   font-family:'Nunito',sans-serif">
            <i class="ph ph-magnifying-glass"></i>
          </button>
        </div>
        <div id="tagBuscaResultado" style="margin-top:8px"></div>
      </div>

      <!-- Ou por UID direto -->
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
        <div style="font-size:0.75rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
                    letter-spacing:.5px;margin-bottom:6px">Ou insira o UID diretamente</div>
        <input id="tagUidDireto" type="text" placeholder="UID do usuário"
          style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;
                 font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;
                 color:var(--text);background:var(--surface);box-sizing:border-box;margin-bottom:8px"/>
      </div>

      <!-- Seletor de tag -->
      <div style="font-size:0.75rem;font-weight:800;color:var(--cinza);text-transform:uppercase;
                  letter-spacing:.5px;margin-bottom:6px">Tag a atribuir</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px" id="tagOpcoesBtns">
        ${[
          { val: '',              label: '✕ Remover tag',      cor: '#888',    bg: '#f5f5f5' },
          { val: 'Fundador',      label: '👑 Fundador',         cor: '#3D1F0F', bg: '#FFD700' },
          { val: 'Curador Oficial', label: '🔍 Curador',        cor: 'white',   bg: '#1B5E9B' },
          { val: 'Embaixador',    label: '🌟 Embaixador',       cor: 'white',   bg: '#E8650A' },
          { val: 'Mestre Cervejeiro', label: '🍺 Mestre Cerv.', cor: 'white',   bg: '#5C2E00' },
          { val: 'Moderador',     label: '🛡️ Moderador',        cor: 'white',   bg: '#2D6E4E' },
        ].map(t => `
          <button onclick="window._selecionarTag('${t.val}', this)"
            data-tag="${t.val}"
            style="padding:8px;border-radius:8px;border:2px solid transparent;
                   background:${t.bg};color:${t.cor};font-size:0.78rem;font-weight:700;
                   cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.15s">
            ${t.label}
          </button>`).join('')}
      </div>

      <div id="tagSelecionada" style="font-size:0.78rem;color:var(--cinza);margin-bottom:12px;
                                       min-height:18px;font-style:italic">
        Nenhuma tag selecionada
      </div>

      <button onclick="window._confirmarTag()"
        style="width:100%;padding:10px;border-radius:10px;background:var(--marrom);
               color:white;border:none;font-size:0.88rem;font-weight:800;cursor:pointer;
               font-family:'Nunito',sans-serif;margin-bottom:10px">
        <i class="ph ph-check-circle"></i> Salvar Tag
      </button>
      <div id="tagMsgFinal" style="font-size:0.78rem;min-height:18px;margin-bottom:8px;
                                    font-weight:700;text-align:center"></div>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
  window._tagSelecionadaVal = null;
};

window._selecionarTag = function(val, btn) {
  window._tagSelecionadaVal = val;
  document.querySelectorAll('#tagOpcoesBtns button').forEach(b => {
    b.style.border = '2px solid transparent';
    b.style.opacity = '0.7';
  });
  btn.style.border = '2px solid white';
  btn.style.opacity = '1';
  btn.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.15)';
  const label = btn.textContent.trim();
  document.getElementById('tagSelecionada')?.textContent &&
(document.getElementById('tagSelecionada').textContent =
    val ? `Tag selecionada: ${label}` : 'Vai remover a tag do usuário');
  document.getElementById('tagSelecionada')?.style && (document.getElementById('tagSelecionada').style.color = val ? 'var(--verde)' : 'var(--danger)');
};

window._buscarUsuarioTag = async function() {
  const busca = document.getElementById('tagBuscaInput')?.value.trim().toLowerCase();
  const res   = document.getElementById('tagBuscaResultado');
  if (!busca || busca.length < 3) { res.innerHTML = '<p style="font-size:0.78rem;color:var(--cinza)">Mínimo 3 caracteres</p>'; return; }
  res.innerHTML = '<p style="font-size:0.78rem;color:var(--cinza)">Buscando...</p>';
  try {
    const snap = await db.collection('ranking').orderBy('totalVisitas','desc').limit(200).get();
    const matches = snap.docs
      .map(d => d.data())
      .filter(u => u.nome?.toLowerCase().includes(busca) || u.email?.toLowerCase().includes(busca))
      .slice(0, 5);
    if (!matches.length) { res.innerHTML = '<p style="font-size:0.78rem;color:var(--cinza)">Nenhum usuário encontrado</p>'; return; }
    res.innerHTML = matches.map(u => `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:8px 10px;border:1px solid var(--border);border-radius:8px;
                  margin-bottom:6px;cursor:pointer;background:var(--surface)"
           onclick="document.getElementById('tagUidDireto').value='${u.uid}';
                    window.mostrarNotif('UID copiado para o campo acima')">
        <div>
          <div style="font-weight:800;font-size:0.85rem;color:var(--marrom)">${sanitizeHtml(u.nome||'Sem nome')}</div>
          <div style="font-size:0.68rem;color:var(--cinza)">${u.uid.slice(0,16)}... · ${u.totalVisitas||0} bares</div>
        </div>
        <i class="ph ph-arrow-up-left" style="color:var(--cinza)"></i>
      </div>`).join('');
  } catch(e) {
    res.innerHTML = '<p style="font-size:0.78rem;color:var(--danger)">Erro na busca</p>';
  }
};

window._confirmarTag = async function() {
  const uid = document.getElementById('tagUidDireto')?.value.trim();
  const msg = document.getElementById('tagMsgFinal');
  if (!uid) { msg.style.color='var(--danger)'; msg.textContent='Informe o UID do usuário.'; return; }
  if (window._tagSelecionadaVal === null) { msg.style.color='var(--danger)'; msg.textContent='Selecione uma tag primeiro.'; return; }

  // Moderador só pode atribuir certas tags
  const tagsPermitidas = window._isAdmin
    ? ['', 'Fundador', 'Curador Oficial', 'Embaixador', 'Mestre Cervejeiro', 'Moderador']
    : ['', 'Curador Oficial', 'Embaixador'];

  if (!tagsPermitidas.includes(window._tagSelecionadaVal)) {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'Você não tem permissão para atribuir esta tag.';
    return;
  }

  try {
    const updates = { tagRole: window._tagSelecionadaVal || null };
    // Se for Moderador, também salva o role
    if (window._tagSelecionadaVal === 'Moderador') updates.role = 'moderador';
    else if (!window._tagSelecionadaVal) updates.role = null;

    await db.collection('users').doc(uid).set(updates, { merge: true });
    msg.style.color = 'var(--verde)';
    msg.textContent = window._tagSelecionadaVal
      ? `✓ Tag "${window._tagSelecionadaVal}" atribuída com sucesso!`
      : '✓ Tag removida com sucesso!';
    // Limpa campos
    if(document.getElementById('tagSelecionada')) document.getElementById('tagSelecionada').textContent = 'Nenhuma tag selecionada';
    window._tagSelecionadaVal = null;
    document.querySelectorAll('#tagOpcoesBtns button').forEach(b => {
      b.style.border = '2px solid transparent';
      b.style.opacity = '0.7';
      b.style.boxShadow = 'none';
    });
    document.getElementById('tagSelecionada').textContent = 'Nenhuma tag selecionada';
    document.getElementById('tagSelecionada')?.style && (document.getElementById('tagSelecionada').style.color = 'var(--cinza)');
  } catch(e) {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'Erro ao salvar. Tente novamente.';
  }
};
window.classificarBaresAutomaticamente = async function() {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-box" style="text-align:center">
      <div style="font-size:2rem;margin-bottom:12px">🤖</div>
      <div class="modal-titulo">Classificar Bares com IA</div>
      <p class="modal-desc">O Claude vai analisar os comentários de cada bar e sugerir as classificações automaticamente.</p>
      <div id="classifLog" style="max-height:200px;overflow-y:auto;text-align:left;
        background:var(--creme);border-radius:10px;padding:10px;font-size:0.75rem;
        font-family:monospace;margin-bottom:16px;display:none"></div>
      <div id="classifProgress" style="margin-bottom:16px;display:none">
        <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">
          <div id="classifBarra" style="height:100%;width:0%;background:var(--laranja);
            border-radius:4px;transition:width 0.3s"></div>
        </div>
        <div id="classifTexto" style="font-size:0.75rem;color:var(--cinza);margin-top:6px;text-align:center"></div>
      </div>
      <button id="btnIniciarClassif" onclick="window._iniciarClassificacao()"
        style="width:100%;padding:12px;border-radius:12px;background:var(--laranja);
               color:white;border:none;font-size:0.9rem;font-weight:800;
               cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px">
        <i class="ph ph-robot"></i> Iniciar Classificação
      </button>
      <button onclick="this.closest('.modal-overlay').remove()"
        class="btn-cadastro">Fechar</button>
    </div>`;
  document.body.appendChild(ov);
};
window._iniciarClassificacao = async function() {
  const log = document.getElementById('classifLog');
  const progress = document.getElementById('classifProgress');
  const barra = document.getElementById('classifBarra');
  const texto = document.getElementById('classifTexto');
  const btn = document.getElementById('btnIniciarClassif');

  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> Classificando...';
  log.style.display = 'block';
  progress.style.display = 'block';

  const TAGS_VIBE = ['samba','pagode','rock','sertanejo','forro','musica-ao-vivo','externo','vista','coberto','sinuca','jogos','sofisticado','romantico','petfriendly','lgbtq','criancas','feminino','acessivel','esportes','happy-hour','entrega','reserva','wifi','vegano','vinho'];
  const TAGS_TIPO = ['Bar','Petiscaria','Cervejaria','Sinuca','Restaurante'];

  // Processa todos ou só os sem classificação
  const bares = BARES.filter(b => !b.vibes || b.vibes.length === 0);
  let processados = 0;
  let erros = 0;

  const _log = msg => {
    log.innerHTML += `<div>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  };

  _log(`📋 ${bares.length} bares para classificar`);
  _log(`⚡ Processando em lotes de 5 simultaneamente...`);

  // Classifica um bar individual
  async function _classificarBar(bar) {
    try {
      // Busca comentários e descrição em paralelo
      const [commSnap, descSnap] = await Promise.all([
        db.collection('comentarios').doc(bar.id).collection('posts')
          .orderBy('ts','desc').limit(5).get(),
        db.collection('descricoes').doc(bar.id).get()
      ]);

      const comentarios = commSnap.docs.map(d => d.data().texto).filter(Boolean);
      const descricao = descSnap.exists ? descSnap.data().texto : '';

      const contexto = [
        `Nome: ${bar.nome}`,
        `Prato: ${bar.prato || ''}`,
        `Endereço: ${bar.end || ''}`,
        `Região: ${bar.regiao || ''}`,
        descricao ? `Desc: ${descricao}` : '',
        comentarios.length ? `Comentários: ${comentarios.slice(0,3).join(' | ')}` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `Bar de BH. Classifique retornando APENAS JSON sem texto extra.

${contexto}

Vibes possíveis: ${TAGS_VIBE.join(',')}
Tipos possíveis: ${TAGS_TIPO.join(',')}

JSON: {"vibes":[],"tipo":[]}`
          }]
        })
      });

      const data = await response.json();
      const txt = data.content?.[0]?.text || '{}';
      const classificacao = JSON.parse(txt.replace(/```json|```/g,'').trim());

      const update = {};
      if (classificacao.vibes?.length) update.vibes = classificacao.vibes;
      if (classificacao.tipo?.length) update.tipo = classificacao.tipo;

      if (Object.keys(update).length) {
        await db.collection('estabelecimentos').doc(bar.id).set(update, { merge: true });
        return { ok: true, bar: bar.nome, ...classificacao };
      }
      return { ok: true, bar: bar.nome, vibes: [], tipo: [] };

    } catch(e) {
      return { ok: false, bar: bar.nome, erro: e.message };
    }
  }

  // Processa em lotes paralelos de 5
  const LOTE = 5;
  for (let i = 0; i < bares.length; i += LOTE) {
    const lote = bares.slice(i, i + LOTE);

    const resultados = await Promise.all(lote.map(_classificarBar));

    resultados.forEach(r => {
      if (r.ok) {
        processados++;
        if (r.vibes?.length || r.tipo?.length) {
          _log(`✅ ${r.bar} → ${[...(r.tipo||[]), ...(r.vibes||[])].join(', ')}`);
        } else {
          _log(`➖ ${r.bar} → sem tags identificadas`);
        }
      } else {
        erros++;
        _log(`❌ ${r.bar} → ${r.erro}`);
      }
    });

    const pct = Math.round(((i + lote.length) / bares.length) * 100);
    barra.style.width = pct + '%';
    texto.textContent = `${processados}/${bares.length} processados · ${erros} erros`;

    // Pausa entre lotes para respeitar rate limit
    if (i + LOTE < bares.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  _log(`🎉 Concluído! ${processados} classificados, ${erros} erros.`);
  btn.innerHTML = '✅ Concluído!';
  btn.style.background = 'var(--verde)';
  btn.disabled = false;

  // Limpa cache
  localStorage.removeItem('estab_cdb_2026_v1');
};