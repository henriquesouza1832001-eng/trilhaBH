function renderRoteiro() {
  const cont = document.getElementById('page-roteiros');
  if (!cont) return;

  const regioes = ['SUL','CENTRO','LESTE','NORDESTE','NOROESTE','NORTE','OESTE'];
  const boresIds = new Set(Object.keys(visitas));

  cont.innerHTML = `
    <!-- Header -->
    <div style="padding:16px 16px 0">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.6rem;
                  color:var(--marrom);letter-spacing:1px;margin-bottom:4px">
        <i class="ph ph-map-trifold"></i> Roteiros por Região
      </div>
      <div style="font-size:0.8rem;color:var(--cinza);margin-bottom:16px">
        Complete cada região para ganhar emblemas exclusivos
      </div>
    </div>

    <!-- Cards de região -->
    <div style="padding:0 16px 100px;display:flex;flex-direction:column;gap:12px">
      ${regioes.map(regiao => {
        const baresRegiao = BARES.filter(b => b.regiao === regiao);
        const visitadosRegiao = baresRegiao.filter(b => boresIds.has(b.id));
        const total = baresRegiao.length;
        const feitos = visitadosRegiao.length;
        const pct = total ? Math.round((feitos / total) * 100) : 0;
        const concluida = feitos === total;
        const emblema = EMBLEMAS_REGIAO.find(e => e.regiao === regiao);

        const aberta = window._regiaoRoteiroAberta === regiao;

        return `
        <div style="background:white;border-radius:16px;
                    box-shadow:0 2px 12px rgba(60,20,0,0.08);overflow:hidden">

          <!-- Header da região -->
          <div style="padding:14px 16px;cursor:pointer;
                      display:flex;align-items:center;gap:12px"
            onclick="window._regiaoRoteiroAberta=
              (window._regiaoRoteiroAberta==='${regiao}'?null:'${regiao}');
              renderRoteiro()">

            <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;
                        background:${concluida?'var(--verde)':'var(--laranja)'};
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.2rem;color:white">
              ${emblema?.icon || '<i class="ph ph-map-pin"></i>'}
            </div>

            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;justify-content:space-between;
                          margin-bottom:4px">
                <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;
                            color:var(--marrom);letter-spacing:0.5px">
                  ${regiao}
                  ${concluida
                    ? '<i class="ph-fill ph-check-circle" style="color:var(--verde);font-size:0.9rem"></i>'
                    : ''}
                </div>
                <div style="font-size:0.72rem;font-weight:800;
                            color:${concluida?'var(--verde)':'var(--laranja)'}">
                  ${feitos}/${total}
                </div>
              </div>
              <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;
                            background:${concluida?'var(--verde)':'var(--laranja)'};
                            border-radius:4px;transition:width 0.5s cubic-bezier(0.16,1,0.3,1)">
                </div>
              </div>
              <div style="font-size:0.68rem;color:var(--cinza);margin-top:4px;font-weight:600">
                ${emblema?.nome || ''} · ${pct}% completo
              </div>
            </div>

            <i class="ph ph-caret-${aberta?'up':'down'}"
               style="color:var(--cinza);font-size:1rem;flex-shrink:0"></i>
          </div>

          <!-- Lista de bares da região (expansível) -->
          ${aberta ? `
          <div style="border-top:1px solid var(--border)">
            ${baresRegiao.map(b => {
              const v = visitas[b.id];
              const visitado = !!v;
              return `
              <div style="display:flex;align-items:center;gap:12px;
                          padding:10px 16px;border-bottom:1px solid var(--border);
                          cursor:pointer;transition:background 0.15s"
                onclick="window.abrirBottomSheet('${b.id}')">

                <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;
                            background:${visitado?'var(--verde)':'#f5f0eb'};
                            display:flex;align-items:center;justify-content:center">
                  <i class="ph-fill ${visitado?'ph-check-circle':'ph-beer-bottle'}"
                     style="color:${visitado?'white':'var(--laranja)'};font-size:1rem"></i>
                </div>

                <div style="flex:1;min-width:0">
                  <div style="font-weight:800;font-size:0.85rem;color:var(--marrom);
                              white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${sanitizeHtml(b.nome)}
                  </div>
                  <div style="font-size:0.7rem;color:var(--cinza);margin-top:1px">
                    ${sanitizeHtml(b.descricao||'')}
                    ${v?.nota
                      ? `· <i class="ph-fill ph-star" style="color:var(--laranja)"></i> ${v.nota}/10`
                      : ''}
                  </div>
                </div>

                ${visitado && v?.fotoUrl ? `
                <div style="width:40px;height:40px;border-radius:8px;
                            overflow:hidden;flex-shrink:0">
                  <img src="${v.fotoUrl}"
                    style="width:100%;height:100%;object-fit:cover"/>
                </div>` : `
                <i class="ph ph-caret-right"
                   style="color:var(--cinza);font-size:0.9rem;flex-shrink:0"></i>`}
              </div>`;
            }).join('')}

            <!-- Botão rolar no mapa -->
            <div style="padding:12px 16px">
              <button onclick="
                window._filtroMapa='Todos';
                window._buscaMapa='${regioes.find(r=>r===regiao)||''}';
                window.irPara('mapa')"
                style="width:100%;padding:10px;border-radius:10px;
                       border:1.5px solid var(--marrom);background:transparent;
                       color:var(--marrom);font-size:0.82rem;font-weight:800;
                       cursor:pointer;font-family:'Nunito',sans-serif;
                       display:flex;align-items:center;justify-content:center;gap:6px">
                <i class="ph ph-map-trifold"></i> Ver no mapa
              </button>
            </div>
          </div>` : ''}
        </div>`;
      }).join('')}

      <!-- Card missão geral -->
      <div style="background:var(--marrom);border-radius:16px;
                  padding:20px;text-align:center;margin-top:4px">
        <div style="font-size:2rem;margin-bottom:8px">
          <i class="ph-fill ph-trophy" style="color:var(--laranja)"></i>
        </div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.3rem;
                    color:white;letter-spacing:1px;margin-bottom:4px">
          Trilha Completa
        </div>
        <div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-bottom:12px">
          Visite todos os ${BARES.length} bares e ganhe o emblema
          "Patrimônio Histórico"
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.15);
                    border-radius:4px;overflow:hidden;margin-bottom:8px">
          <div style="height:100%;
                      width:${BARES.length?Math.round((boresIds.size/BARES.length)*100):0}%;
                      background:var(--laranja);border-radius:4px;
                      transition:width 0.6s cubic-bezier(0.16,1,0.3,1)">
          </div>
        </div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--laranja)">
          ${boresIds.size}/${BARES.length} ·
          ${BARES.length?Math.round((boresIds.size/BARES.length)*100):0}%
        </div>
      </div>
    </div>`;}
window.enviarSugestao=async function(){
  const barId=document.getElementById('sugestaoBarId').value;
  const comentario=document.getElementById('sugestaoComentario').value.trim();
  if(!barId){mostrarNotif('Escolha um bar');return;}
  if(!comentario){mostrarNotif('Adicione um comentário');return;}
  const bar=BARES.find(b=>b.id===barId);
  const nome=usuarioAtual.displayName||'Anônimo';
  await db.collection('grupos').doc(grupoAtual).collection('sugestoes').add({
    barId,barNome:bar.nome,comentario,
    uid:usuarioAtual.uid,nome,
    status:'pendente',ts:Date.now()
  });
  cacheRoteiro=null;
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Sugestão enviada!');
  renderRoteiro();
};

window.aprovarSugestao=async function(sugestaoId,barId){
  const diasSnap=await db.collection('grupos').doc(grupoAtual).collection('roteiro').orderBy('ordem').get();
  const dias=[];
  diasSnap.forEach(d=>dias.push({id:d.id,...d.data()}));

  if(!dias.length){mostrarNotif('Crie um dia no roteiro primeiro');return;}

  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML=`
    <div style="background:var(--creme);border-radius:20px;padding:24px 16px;width:100%;max-width:400px;position:relative">
      <button onclick="this.closest('div[style*=z-index]').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--cinza)">✕</button>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--marrom);margin-bottom:16px">📅 Adicionar ao dia</div>
      <p style="font-size:0.82rem;color:var(--cinza);margin-bottom:12px">Escolha em qual dia adicionar este bar:</p>
      ${dias.map(d=>`
        <button onclick="window.confirmarAprovacao('${sugestaoId}','${barId}','${d.id}')" style="width:100%;padding:10px;border-radius:10px;background:white;border:2px solid var(--laranja);color:var(--marrom);font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:8px;text-align:left">
          📅 ${d.titulo} <span style="font-size:0.75rem;color:var(--cinza)">(${(d.bares||[]).length} bares)</span>
        </button>`).join('')}
    </div>`;
  document.body.appendChild(overlay);
};

window.confirmarAprovacao=async function(sugestaoId,barId,diaId){
  const diaDoc=await db.collection('grupos').doc(grupoAtual).collection('roteiro').doc(diaId).get();
  const baresAtuais=diaDoc.data()?.bares||[];
  if(!baresAtuais.includes(barId)){
    await db.collection('grupos').doc(grupoAtual).collection('roteiro').doc(diaId).update({
      bares:firebase.firestore.FieldValue.arrayUnion(barId)
    });
  }
  await db.collection('grupos').doc(grupoAtual).collection('sugestoes').doc(sugestaoId).update({status:'aprovado'});
  document.querySelectorAll('div[style*="z-index:300"]').forEach(e=>e.remove());
  cacheRoteiro=null;
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Bar adicionado ao roteiro!');
  renderRoteiro();
};

window.recusarSugestao=async function(sugestaoId){
  await db.collection('grupos').doc(grupoAtual).collection('sugestoes').doc(sugestaoId).update({status:'recusado'});
  cacheRoteiro=null;
  mostrarNotif('<i class="ph-fill ph-x-circle"></i> Sugestão recusada');
  renderRoteiro();
};

window.abrirEditarRoteiro=async function(){
  const diasSnap=await db.collection('grupos').doc(grupoAtual).collection('roteiro').orderBy('ordem').get();
  const dias=[];
  diasSnap.forEach(d=>dias.push({id:d.id,...d.data()}));

  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML=`
    <div style="background:var(--creme);border-radius:20px;padding:24px 16px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;position:relative">
      <button onclick="document.querySelectorAll('div[style*=z-index]').forEach(e=>e.remove())" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--cinza)">✕</button>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.3rem;color:var(--marrom);letter-spacing:1px;margin-bottom:16px">✏️ Editar Roteiro</div>
      <div id="editarDias">
        ${dias.map((dia)=>`
          <div class="dia-editor" data-id="${dia.id}" style="background:white;border-radius:10px;padding:12px;margin-bottom:10px;box-shadow:var(--shadow)">
            <input type="text" value="${dia.titulo||''}" placeholder="Ex: Dom 26/04" id="titulodia-${dia.id}" style="width:100%;padding:7px 10px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom);margin-bottom:8px"/>
            <input type="text" placeholder="<i class="ph ph-magnifying-glass"></i> Buscar bar..." oninput="window.filtrarBaresEditor('${dia.id}',this.value)" style="width:100%;padding:7px 10px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.82rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom);margin-bottom:6px"/>
            <div id="baresdia-${dia.id}" style="max-height:180px;overflow-y:auto;border:1.5px solid #e0d0c0;border-radius:8px;padding:8px;margin-bottom:8px">
              ${BARES.map(b=>`<label style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0e0d0;font-size:0.78rem;font-family:'Nunito',sans-serif;color:var(--marrom);cursor:pointer">
                <input type="checkbox" value="${b.id}" ${(dia.bares||[]).includes(b.id)?'checked':''} style="width:16px;height:16px;accent-color:var(--laranja);flex-shrink:0"/>
                ${sanitizeHtml(b.nome)} <span style="font-size:0.65rem;color:var(--cinza);margin-left:auto">${sanitizeHtml(b.regiao)}</span>
              </label>`).join('')}
            </div>
            <div style="font-size:0.75rem;color:var(--cinza);margin-bottom:6px;font-weight:700"><i class="ph ph-clipboard-text"></i> Ordem dos bares selecionados:</div>
            <div id="ordem-${dia.id}" style="min-height:40px;border:1.5px dashed #e0d0c0;border-radius:8px;padding:6px;font-size:0.78rem;color:var(--marrom)">
              ${(dia.bares||[]).map((barId,i)=>{const b=BARES.find(x=>x.id===barId);return b?`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 6px;background:#f9f0e8;border-radius:6px;margin-bottom:4px"><span>${i+1}. ${sanitizeHtml(b.nome)}</span><div style="display:flex;gap:4px"><button onclick="window.moverBar('${dia.id}',${i},-1)" style="background:none;border:none;cursor:pointer;font-size:0.8rem">⬆️</button><button onclick="window.moverBar('${dia.id}',${i},1)" style="background:none;border:none;cursor:pointer;font-size:0.8rem">⬇️</button></div></div>`:''}).join('')}
            </div>
            <button onclick="window.removerDiaEditor('${dia.id}',this)" style="margin-top:8px;padding:5px 12px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-trash"></i> Remover dia</button>
          </div>`).join('')}
      </div>
      <button onclick="window.adicionarDiaEditor()" style="width:100%;padding:9px;border-radius:10px;background:#f0e0d0;color:var(--marrom);border:none;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px"><i class="ph ph-plus"></i> Adicionar dia</button>
      <button onclick="window.salvarRoteiro()" style="width:100%;padding:10px;border-radius:10px;background:var(--marrom);color:white;border:none;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">💾 Salvar roteiro</button>
    </div>`;
  document.body.appendChild(overlay);

  window._ordemBares={};
  dias.forEach(dia=>{window._ordemBares[dia.id]=[...(dia.bares||[])];});

  document.querySelectorAll('[id^="baresdia-"]').forEach(container=>{
    const diaId=container.id.replace('baresdia-','');
    container.querySelectorAll('input[type=checkbox]').forEach(cb=>{
      cb.addEventListener('change',()=>window.atualizarOrdem(diaId));
    });
  });
};

window.filtrarBaresEditor=function(diaId,busca){
  const container=document.getElementById('baresdia-'+diaId);
  const labels=container.querySelectorAll('label');
  labels.forEach(label=>{
    const texto=label.textContent.toLowerCase();
    label.style.display=!busca||texto.includes(busca.toLowerCase())?'flex':'none';
  });
};

window.atualizarOrdem=function(diaId){
  if(!window._ordemBares)window._ordemBares={};
  const container=document.getElementById('baresdia-'+diaId);
  const checados=Array.from(container.querySelectorAll('input[type=checkbox]:checked')).map(c=>c.value);
  const atual=window._ordemBares[diaId]||[];
  const novos=checados.filter(id=>!atual.includes(id));
  const removidos=new Set(atual.filter(id=>!checados.includes(id)));
  window._ordemBares[diaId]=[...atual.filter(id=>!removidos.has(id)),...novos];
  renderizarOrdem(diaId);
};

window.moverBar=function(diaId,idx,dir){
  const arr=window._ordemBares[diaId]||[];
  const novoIdx=idx+dir;
  if(novoIdx<0||novoIdx>=arr.length)return;
  [arr[idx],arr[novoIdx]]=[arr[novoIdx],arr[idx]];
  window._ordemBares[diaId]=arr;
  renderizarOrdem(diaId);
};

function renderizarOrdem(diaId){
  const cont=document.getElementById('ordem-'+diaId);
  if(!cont)return;
  const arr=window._ordemBares[diaId]||[];
  cont.innerHTML=arr.map((barId,i)=>{
    const b=BARES.find(x=>x.id===barId);
    return b?`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 6px;background:#f9f0e8;border-radius:6px;margin-bottom:4px"><span>${i+1}. ${sanitizeHtml(b.nome)}</span><div style="display:flex;gap:4px"><button onclick="window.moverBar('${diaId}',${i},-1)" style="background:none;border:none;cursor:pointer;font-size:0.8rem">⬆️</button><button onclick="window.moverBar('${diaId}',${i},1)" style="background:none;border:none;cursor:pointer;font-size:0.8rem">⬇️</button></div></div>`:'';
  }).join('');
}

window.removerDiaEditor=async function(diaId,btn){
  if(diaId&&!diaId.startsWith('novo-')){
    await db.collection('grupos').doc(grupoAtual).collection('roteiro').doc(diaId).delete();
  }
  btn.closest('.dia-editor').remove();
  if(window._ordemBares)delete window._ordemBares[diaId];
};

window.adicionarDiaEditor=function(){
  const cont=document.getElementById('editarDias');
  const tempId='novo-'+Date.now();
  if(!window._ordemBares)window._ordemBares={};
  window._ordemBares[tempId]=[];
  const div=document.createElement('div');
  div.className='dia-editor';
  div.setAttribute('data-id',tempId);
  div.style.cssText='background:white;border-radius:10px;padding:12px;margin-bottom:10px;box-shadow:var(--shadow)';
  div.innerHTML=`
    <input type="text" placeholder="Ex: Dom 26/04" id="titulodia-${tempId}" style="width:100%;padding:7px 10px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom);margin-bottom:8px"/>
    <input type="text" placeholder="<i class="ph ph-magnifying-glass"></i> Buscar bar..." oninput="window.filtrarBaresEditor('${tempId}',this.value)" style="width:100%;padding:7px 10px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.82rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom);margin-bottom:6px"/>
    <div id="baresdia-${tempId}" style="max-height:180px;overflow-y:auto;border:1.5px solid #e0d0c0;border-radius:8px;padding:8px;margin-bottom:8px">
      ${BARES.map(b=>`<label style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0e0d0;font-size:0.78rem;font-family:'Nunito',sans-serif;color:var(--marrom);cursor:pointer">
        <input type="checkbox" value="${b.id}" style="width:16px;height:16px;accent-color:var(--laranja);flex-shrink:0"/>
        ${sanitizeHtml(b.nome)} <span style="font-size:0.65rem;color:var(--cinza);margin-left:auto">${sanitizeHtml(b.regiao)}</span>
      </label>`).join('')}
    </div>
    <div style="font-size:0.75rem;color:var(--cinza);margin-bottom:6px;font-weight:700"><i class="ph ph-clipboard-text"></i> Ordem dos bares selecionados:</div>
    <div id="ordem-${tempId}" style="min-height:40px;border:1.5px dashed #e0d0c0;border-radius:8px;padding:6px;font-size:0.78rem;color:var(--marrom)"></div>
    <button onclick="window.removerDiaEditor('${tempId}',this)" style="margin-top:8px;padding:5px 12px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-trash"></i> Remover dia</button>`;
  cont.appendChild(div);
  div.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change',()=>window.atualizarOrdem(tempId));
  });
};

window.removerDia=async function(diaId,btn){
  await db.collection('grupos').doc(grupoAtual).collection('roteiro').doc(diaId).delete();
  btn.closest('div[style]').remove();
};

window.salvarRoteiro=async function(){
  const cont=document.getElementById('editarDias');
  const divsDia=cont.querySelectorAll('.dia-editor');
  let ordem=1;
  const diasExistentes=await db.collection('grupos').doc(grupoAtual).collection('roteiro').get();
  for(const doc of diasExistentes.docs)await doc.ref.delete();
  for(const div of divsDia){
    const diaId=div.getAttribute('data-id');
    const tituloEl=document.getElementById('titulodia-'+diaId);
    if(!tituloEl)continue;
    const titulo=tituloEl.value.trim();
    if(!titulo)continue;
    const bares=window._ordemBares?.[diaId]||Array.from(div.querySelectorAll('input[type=checkbox]:checked')).map(c=>c.value);
    await db.collection('grupos').doc(grupoAtual).collection('roteiro').add({titulo,bares,ordem});
    ordem++;
  }
  document.querySelectorAll('div[style*="z-index"]').forEach(e=>e.remove());
  cacheRoteiro=null;
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Roteiro salvo!');
  renderRoteiro();
};
