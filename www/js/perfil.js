async function renderPerfil() {
  const cont = document.getElementById('page-perfil');
  if (!cont || !usuarioAtual) return;

  const boresIds = new Set(Object.keys(visitas));
  const total = boresIds.size;
  const totalBares = BARES.length;
  const pct = totalBares ? Math.round((total / totalBares) * 100) : 0;
  const notas = Object.values(visitas).map(v => v.nota).filter(Boolean);
  const media = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '-';
  const conquistados = calcularEmblemas(total, boresIds);

  // Sistema de níveis BH
  const NIVEIS_BH = [
    { min:0,   titulo:'Curioso de Buteco',  icon:'🍺', cor:'#888' },
    { min:5,   titulo:'Frequentador',        icon:'🥨', cor:'#C87F00' },
    { min:15,  titulo:'Explorador de BH',    icon:'🗺️', cor:'#E8650A' },
    { min:30,  titulo:'Boêmio Assumido',     icon:'🎸', cor:'#9C27B0' },
    { min:50,  titulo:'Mestre do Petisco',   icon:'🍖', cor:'#2196F3' },
    { min:80,  titulo:'Lenda da Lagoinha',   icon:'👑', cor:'#FFD700' },
    { min:120, titulo:'Patrimônio de BH',    icon:'🏛️', cor:'#E8650A' },
    { min:200, titulo:'Rei da Trilha',       icon:'👑', cor:'#FFD700' },
  ];
  const nivelAtual   = [...NIVEIS_BH].reverse().find(n => total >= n.min) || NIVEIS_BH[0];
  const nivelProximo = NIVEIS_BH.find(n => n.min > total);
  const pctNivel     = nivelProximo
    ? Math.round(((total - nivelAtual.min) / (nivelProximo.min - nivelAtual.min)) * 100)
    : 100;

  const nome = usuarioAtual.displayName || 'Butequeador';
if(!window._perfilInfoCache || Date.now() - (window._perfilInfoCacheTs||0) > 2*60*1000){
  const userDoc = await db.collection('users').doc(usuarioAtual.uid).get();
  window._perfilInfoCache = userDoc.data() || {};
  window._perfilInfoCacheTs = Date.now();
}
const info = window._perfilInfoCache;
  const avatar = info.avatarUrl || info.avatarFoto || info.avatar
    || localStorage.getItem('avatar_' + usuarioAtual.uid)
    || 'ph-beer-bottle';
  if (avatar) localStorage.setItem('avatar_' + usuarioAtual.uid, avatar);

  // Sincroniza tag_role do Firestore
  if (info.tagRole) {
    localStorage.setItem('tag_role_' + usuarioAtual.uid, info.tagRole);
  } else if (info.role) {
    const roleLabel = TAG_ROLES?.find(r => r.id === info.role)?.label || '';
    if (roleLabel) localStorage.setItem('tag_role_' + usuarioAtual.uid, roleLabel);
  }

  const avatarHtml = avatar.startsWith('https://') || avatar.startsWith('data:')
    ? `<img src="${avatar}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;display:block"/>`
    : avatar.startsWith('ph-')
    ? `<i class="ph-fill ${avatar}" style="font-size:2rem;color:var(--marrom)"></i>`
    : `<span style="font-size:2rem">${avatar}</span>`;

  const regioesConcluidas = Object.keys(REGIOES_COUNT).filter(r =>
    BARES.filter(b => b.regiao === r).every(b => boresIds.has(b.id))
  ).length;

  cont.innerHTML = `
    <!-- Header perfil -->
    <div style="background:${localStorage.getItem('fundo_perfil_'+usuarioAtual.uid)||'#3D1F0F'};padding:24px 16px 20px"
   onclick="window.abrirSeletorAvatar?.()">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--laranja);
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;overflow:hidden;cursor:pointer;border:3px solid ${localStorage.getItem('emblema_equipado_'+usuarioAtual.uid)?'#FFD700':'var(--laranja)'}"
   onclick="window.abrirEdicaoAvatar()">
          ${avatarHtml}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.5rem;
                      color:white;letter-spacing:1px;line-height:1">
            ${nome}
          </div>
          <div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-top:4px">
            ${usuarioAtual.email || ''}
            ${info.isAdmin ? `
<div class="tag-admin-badge">
  <i class="ph-fill ph-shield-check"></i> Admin
</div>` : localStorage.getItem('tag_role_'+usuarioAtual.uid) ? `
<div class="tag-role-badge">
  <i class="ph-fill ph-seal-check"></i>
  ${sanitizeHtml(localStorage.getItem('tag_role_'+usuarioAtual.uid))}
</div>` : ''}
          </div>
        </div>
        <button onclick="window._setAbaPerfilAtiva('config')"
          style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.12);
                 border:none;color:white;font-size:1.1rem;cursor:pointer;
                 display:flex;align-items:center;justify-content:center">
          <i class="ph ph-gear"></i>
        </button>
      </div>

      <!-- Progress Trilha -->
      <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);font-weight:700">
            Trilha BH
          </span>
          <span style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--laranja)">
            ${total}/${totalBares} · ${pct}%
          </span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;margin-bottom:12px">
          <div style="height:100%;width:${pct}%;background:var(--laranja);border-radius:4px;
                      transition:width 0.6s cubic-bezier(0.16,1,0.3,1)"></div>
        </div>
        <!-- Barra de nível -->
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span style="font-size:0.7rem;color:rgba(255,255,255,0.8);font-weight:800">
              ${nivelAtual.icon} ${nivelAtual.titulo}
            </span>
            <span style="font-size:0.68rem;color:rgba(255,255,255,0.5)">
              ${nivelProximo ? `${total}/${nivelProximo.min} → ${nivelProximo.icon}` : '👑 Nível máximo!'}
            </span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,0.12);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pctNivel}%;background:${nivelAtual.cor};border-radius:4px;
                        transition:width 0.7s cubic-bezier(0.16,1,0.3,1)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
                background:var(--border);margin-bottom:16px">
      ${[
        { val: total,              label: 'Bares',    icon: 'ph-beer-bottle' },
        { val: media,              label: 'Nota',     icon: 'ph-star' },
        { val: regioesConcluidas,  label: 'Regiões',  icon: 'ph-map-trifold' },
        { val: conquistados.size,  label: 'Emblemas', icon: 'ph-medal' },
      ].map(s => `
        <div style="background:white;padding:14px 8px;text-align:center">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.5rem;color:var(--laranja)">
            ${s.val}
          </div>
          <div style="font-size:0.62rem;color:var(--cinza);font-weight:700;
                      text-transform:uppercase;letter-spacing:0.3px;margin-top:2px">
            <i class="ph-fill ${s.icon}"></i> ${s.label}
          </div>
        </div>`).join('')}
    </div>

    <!-- Abas -->
    <div style="display:flex;border-bottom:1px solid var(--border);
                background:white;position:sticky;top:0;z-index:10">
      ${[
        { id: 'visitados', label: 'Visitados',  icon: 'ph-check-circle' },
        { id: 'favoritos', label: 'Quero Ir',   icon: 'ph-flag' },
        { id: 'emblemas',  label: 'Emblemas',   icon: 'ph-medal' },
        { id: 'grupo',     label: 'Grupo',      icon: 'ph-users-three' },
        { id: 'ranking',   label: 'Ranking',    icon: 'ph-trophy' },
      ].map(a => `
        <button
          class="perfil-aba-btn ${(window.APP?.abaPerfilAtiva||'visitados')===a.id?'ativo':''}"
          onclick="window._setAbaPerfilAtiva('${a.id}')"
          style="flex:1;padding:12px 4px;border:none;background:none;
                 font-size:0.65rem;font-weight:800;font-family:'Nunito',sans-serif;
                 color:${(window.APP?.abaPerfilAtiva||'visitados')===a.id?'var(--laranja)':'var(--cinza)'};
                 border-bottom:2px solid ${(window.APP?.abaPerfilAtiva||'visitados')===a.id?'var(--laranja)':'transparent'};
                 cursor:pointer;display:flex;flex-direction:column;
                 align-items:center;gap:3px;text-transform:uppercase;letter-spacing:0.3px;
                 transition:all 0.15s">
          <i class="ph ${a.icon}" style="font-size:1.1rem"></i>
          ${a.label}
        </button>`).join('')}
    </div>

    <!-- Conteúdo da aba -->
    <div id="perfilAbaConteudo" style="padding:16px 16px 100px">
      ${renderAbaPerfilConteudo((window.APP?.abaPerfilAtiva === 'config' ? 'visitados' : window.APP?.abaPerfilAtiva) || 'visitados', boresIds, conquistados)}
    </div>
  `;

}

window._setAbaPerfilAtiva = function(aba) {
  window.APP = window.APP || {};
  window.APP.abaPerfilAtiva = aba;
  const perfilPage = document.getElementById('page-perfil');
  if (!perfilPage || !perfilPage.classList.contains('active')) {
    window.irPara('perfil');
    return;
  }
  const boresIds = new Set(Object.keys(visitas));
  const conquistados = calcularEmblemas(boresIds.size, boresIds);
  document.querySelectorAll('.perfil-aba-btn').forEach(btn => {
    const isAtivo = btn.getAttribute('onclick')?.includes("'" + aba + "'");
    btn.style.color = isAtivo ? 'var(--laranja)' : 'var(--cinza)';
    btn.style.borderBottomColor = isAtivo ? 'var(--laranja)' : 'transparent';
  });
  const cont = document.getElementById('perfilAbaConteudo');
  if (cont) cont.innerHTML = renderAbaPerfilConteudo(aba, boresIds, conquistados);
};


function renderAbaPerfilConteudo(aba, boresIds, conquistados) {
  if (aba === 'visitados') {
    const barsVisitados = BARES.filter(b => boresIds.has(b.id) && b.nome);
    if (!barsVisitados.length) return `
      <div class="empty">
        <div class="empty-icon"><i class="ph ph-beer-bottle"></i></div>
        <p>Nenhum bar visitado ainda.<br>Comece a trilha!</p>
      </div>`;
    return barsVisitados.map(b => {
      const v = visitas[b.id];
      return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;
                  border-bottom:1px solid var(--border);cursor:pointer"
        onclick="window.abrirBottomSheet('${b.id}')">
        <div style="width:40px;height:40px;border-radius:10px;overflow:hidden;
                    flex-shrink:0;background:var(--laranja-claro)">
          ${v?.fotoUrl
            ? `<img src="${v.fotoUrl}" style="width:100%;height:100%;object-fit:cover"/>`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;
                           justify-content:center">
                <i class="ph-fill ph-beer-bottle" style="color:var(--laranja);font-size:1.2rem"></i>
               </div>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${sanitizeHtml(b.nome)}
          </div>
          <div style="font-size:0.72rem;color:var(--cinza);margin-top:2px">
            ${sanitizeHtml(b.regiao)}
          </div>
        </div>
        ${v?.nota ? `
          <div style="font-size:0.78rem;font-weight:800;color:var(--laranja);flex-shrink:0">
            <i class="ph-fill ph-star"></i> ${v.nota}
          </div>` : ''}
      </div>`;
    }).join('');
  }

  if (aba === 'favoritos') {
    const favs = BARES.filter(b => favoritos.includes(b.id));
    if (!favs.length) return `
      <div class="empty">
        <div class="empty-icon"><i class="ph ph-flag"></i></div>
        <p>Nenhum bar salvo ainda.<br>Toque em <i class="ph-fill ph-flag"></i> para salvar.</p>
      </div>`;
    return favs.map(b => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;
                  border-bottom:1px solid var(--border);cursor:pointer"
        onclick="window.abrirBottomSheet('${b.id}')">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--laranja-claro);
                    display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="ph-fill ph-flag" style="color:var(--marrom);font-size:1.2rem"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${sanitizeHtml(b.nome)}
          </div>
          <div style="font-size:0.72rem;color:var(--cinza);margin-top:2px">
            ${sanitizeHtml(b.regiao)}
          </div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--cinza);flex-shrink:0"></i>
      </div>`).join('');
  }

if (aba === 'emblemas') {
  // Mapa de nível de círculo por índice (1=simples → 10=estrela)
  const RINGS_QTDE  = [1,2,3,4,5,6,7,8,9,10];
  const RINGS_REGIAO= [3,4,5,6,7,8,3,9];

  return `
    <div style="margin-bottom:14px">
      <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);
                  letter-spacing:1px;margin-bottom:10px">
        <i class="ph-fill ph-beer-bottle"></i> Visitas
      </div>
      <div class="emblemas-grid">
        ${EMBLEMAS_QUANTIDADE.map((e, i) => {
          const c = conquistados.has(e.nome);
          const ring = RINGS_QTDE[i] || 1;
          return `
          <div class="emblema-card ${c ? 'conquistado' : ''}">
            <div class="emblema-icon-wrap emblema-ring-${ring}">
              ${e.icon}
            </div>
            <div class="emblema-nome">${e.nome}</div>
            <div class="emblema-desc">${e.desc || ''}</div>
            ${c ? `<button onclick="window.equiparEmblema('${e.nome}')" class="btn-equipar">
              ${localStorage.getItem('emblema_equipado_'+usuarioAtual.uid)===e.nome?'✓ Equipado':'Equipar'}
            </button>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
    <div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);
                  letter-spacing:1px;margin-bottom:10px">
        <i class="ph ph-map-trifold"></i> Regiões
      </div>
      <div class="emblemas-grid">
        ${EMBLEMAS_REGIAO.map((e, i) => {
          const c = conquistados.has(e.nome);
          const ring = RINGS_REGIAO[i] || 3;
          return `
          <div class="emblema-card ${c ? 'conquistado' : ''}">
            <div class="emblema-icon-wrap emblema-ring-${ring}">
              ${e.icon}
            </div>
            <div class="emblema-nome">${e.nome}</div>
            <div class="emblema-desc">${e.desc || ''}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}
if (aba === 'grupo') {
    setTimeout(() => { renderGrupoCard(); renderStatsGrupo(); }, 50);
    return `<div class="grupo-card">
      <div class="section-title"><i class="ph ph-users-three"></i> Meu Grupo</div>
      <div id="grupoConteudo"></div>
    </div>
    <div id="statsGrupo"></div>`;
  }
  if (aba === 'ranking') {
  setTimeout(() => window.renderRankingTemporal('rankingTemporalConteudo'), 100);
  return `<div id="rankingTemporalConteudo" style="padding-bottom:20px">
    <div class="empty"><div class="empty-icon"><i class="ph ph-spinner"></i></div>
    <p>Carregando rankings...</p></div>
  </div>`;
}

  if (aba === 'config') {
    const isDark = document.body.classList.contains('modo-boemia');
    const avatarAtual = localStorage.getItem('avatar_' + (window.usuarioAtual?.uid || '')) || 'ph-beer-bottle';
    setTimeout(() => {
      const el = document.getElementById('avatarOpcoesNew');
      if (!el) return;
      el.innerHTML = AVATARES_PHOSPHOR.map(e => `
        <div class="avatar-op-item ${e === avatarAtual ? 'avatar-selecionado' : ''}"
          data-avatar="${e}" onclick="window.salvarAvatar('${e}')" title="${e.replace('ph-','')}">
          <i class="ph-fill ${e}"></i>
        </div>`).join('');
    }, 50);
    return `
      <div class="perfil-card" style="padding:0;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--border);display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:1.2rem;">
              <i class="ph-fill ph-moon"></i>
            </div>
            <div>
              <div style="font-weight:800;font-size:0.95rem;color:var(--primary);">Modo Boemia</div>
              <div style="font-size:0.75rem;color:var(--cinza);">Tema escuro do app</div>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" ${isDark ? 'checked' : ''} onchange="window.toggleModoBoemia()">
            <span class="slider"></span>
          </label>
        </div>
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);">
  <div style="font-weight:800;font-size:0.95rem;color:var(--primary);margin-bottom:4px;">
    <i class="ph ph-clock"></i> Agendamento automático
  </div>
  <div style="font-size:0.75rem;color:var(--cinza);margin-bottom:12px;">
    Ativa/desativa o Modo Boemia automaticamente (desabilitado se você usar o toggle manual)
  </div>
  <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
    <label style="font-size:0.82rem;font-weight:700;color:var(--primary);flex:1">
      <i class="ph ph-moon"></i> Ligar às
      <input type="time" value="${localStorage.getItem('boemia_ligar')||'18:00'}"
        onchange="localStorage.setItem('boemia_ligar',this.value);localStorage.removeItem('modo_boemia_manual')"
        style="display:block;width:100%;margin-top:4px;padding:6px 10px;border-radius:8px;
               border:1.5px solid var(--border);font-family:'Nunito',sans-serif;font-size:0.85rem"/>
    </label>
    <label style="font-size:0.82rem;font-weight:700;color:var(--primary);flex:1">
      <i class="ph ph-sun"></i> Desligar às
      <input type="time" value="${localStorage.getItem('boemia_desligar')||'06:00'}"
        onchange="localStorage.setItem('boemia_desligar',this.value);localStorage.removeItem('modo_boemia_manual')"
        style="display:block;width:100%;margin-top:4px;padding:6px 10px;border-radius:8px;
               border:1.5px solid var(--border);font-family:'Nunito',sans-serif;font-size:0.85rem"/>
    </label>
  </div>
  <button onclick="window.reativarAgendamento()"
    style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--border);
           background:transparent;color:var(--cinza);font-size:0.78rem;font-weight:700;
           cursor:pointer;font-family:'Nunito',sans-serif">
    <i class="ph ph-arrow-counter-clockwise"></i> Reativar agendamento automático
  </button>
</div>
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);">
          <div style="font-weight:800;font-size:0.95rem;color:var(--primary);margin-bottom:12px;">Personalizar Avatar</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;" id="avatarOpcoesNew"></div>
          <input type="file" accept="image/*" class="foto-upload" id="fotoUploadNew" onchange="window.uploadFoto(this)" style="display:none;"/>
          <button class="btn-outline" onclick="document.getElementById('fotoUploadNew').click()"><i class="ph ph-camera"></i> Enviar Foto Real</button>
        </div>
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);">
          <button class="btn-primary" onclick="window.editarNome()"><i class="ph ph-pencil"></i> Editar Nome</button>
        </div>
        <div style="padding:16px 20px;background:rgba(231,76,60,0.05);">
          <button class="btn-outline btn-danger" onclick="window.excluirConta()" style="margin-bottom:12px"><i class="ph ph-trash"></i> Excluir Minha Conta</button>
          <button class="btn-outline" onclick="window.editarTelefone()"><i class="ph ph-device-mobile"></i> Contato para prêmios</button>
        </div>
      </div>`;
  }

  return '';
}

const AVATARES_PHOSPHOR = [
  'ph-beer-bottle','ph-brandy','ph-coffee','ph-martini','ph-wine',
  'ph-pizza','ph-hamburger','ph-cooking-pot','ph-bowl-food','ph-popcorn',
  'ph-guitar','ph-music-notes','ph-microphone-stage','ph-crown','ph-star',
  'ph-fire','ph-heart','ph-rocket-launch','ph-map-pin','ph-compass',
  'ph-trophy','ph-medal','ph-flag','ph-bicycle','ph-motorcycle',
  'ph-cat','ph-dog','ph-smiley','ph-sunglasses','ph-hat-cowboy'
];

window.abrirEdicaoAvatar=function(){
  window.setAbaPerfil('config');
  setTimeout(()=>{
    const editor=document.getElementById('avatarEditor');
    if(!editor)return;
    const aberto=editor.style.display!=='none';
    editor.style.display=aberto?'none':'block';
    if(!aberto){
      const avatarAtual=localStorage.getItem('avatar_'+usuarioAtual.uid)||'ph-beer-bottle';
      document.getElementById('avatarOpcoes').innerHTML=AVATARES_PHOSPHOR.map(e=>`<span class="avatar-op ${e===avatarAtual?'selecionado':''}" onclick="window.salvarAvatar('${e}')" style="display:inline-flex;align-items:center;justify-content:center"><i class="ph-fill ${e}"></i></span>`).join('');
    }
  },100);
};

window.salvarAvatar = async function(classeIcone) {
  try { localStorage.setItem('avatar_' + usuarioAtual.uid, classeIcone); } catch(e) {}
  await db.collection('users').doc(usuarioAtual.uid).set({ avatar: classeIcone }, { merge: true });
  // Atualiza avatar no perfil (pode não existir se renderPerfil ainda não rodou)
  const _pa = document.getElementById('perfilAvatar');
  if (_pa) _pa.innerHTML = `<i class="ph-fill ${classeIcone}" style="font-size:2rem;color:white"></i>`;
  // Atualiza avatar no header
  const _ha = document.getElementById('headerAvatar');
  if (_ha) _ha.innerHTML = `<i class="ph-fill ${classeIcone}" style="font-size:0.9rem;color:white"></i>`;
  document.querySelectorAll('.avatar-op-item').forEach(el => {
    const isSelected = el.dataset.avatar === classeIcone;
    el.classList.toggle('avatar-selecionado', isSelected);
  });
  window._perfilAdminCache = null;
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Avatar salvo!');
};
window.uploadFoto=function(input){
  const file=input.files[0];if(!file)return;
  if(file.size>2*1024*1024){mostrarNotif('Foto muito grande! Máx 2MB');return;}
  const reader=new FileReader();
  reader.onload=async function(e){
    const blob=await fileParaBlob(e.target.result,200,0.7);
    if(!blob){mostrarNotif('Erro ao processar foto','erro');return;}
    const url=await uploadFotoStorage(blob,`fotos/avatares/${usuarioAtual.uid}.jpg`);
    try{localStorage.setItem('avatar_'+usuarioAtual.uid,url);}catch(e){}
    await db.collection('users').doc(usuarioAtual.uid).set({avatarUrl:url,avatarFoto:''},{merge:true});
    const el=document.getElementById('perfilAvatar');el.innerHTML=`<img src="${url}" class="perfil-avatar-img"/>`;
    window._perfilAdminCache=null;
    document.getElementById('avatarEditor').style.display='none';mostrarNotif('Foto salva!');
    window.atualizarCacheGlobal();
  };
  reader.readAsDataURL(file);
};
async function carregarGrupo(){
  if(!usuarioAtual)return;
  const userDoc=await db.collection('users').doc(usuarioAtual.uid).get();
  const data=userDoc.data()||{};
  gruposAtual=data.grupos||[];
  if(data.grupoId&&!gruposAtual.includes(data.grupoId))gruposAtual=[data.grupoId,...gruposAtual];
  grupoAtual=gruposAtual[0]||null;grupoSelecionado=grupoAtual;
  renderGrupoCard();
}
window.carregarGrupo = carregarGrupo;
async function verificarNovasVisitasGrupo(){
  if(!grupoAtual||!usuarioAtual)return;
  const chave='ultima_check_grupo_'+usuarioAtual.uid;
  const ultimoCheck=parseInt(localStorage.getItem(chave)||'0');
  const agora=Date.now();
  if(agora-ultimoCheck<5*60*1000)return; // só checa a cada 5 min
  localStorage.setItem(chave,String(agora));
  try{
    const feedDoc=await db.collection('ranking').doc('feed').get();
    if(!feedDoc.exists)return;
    const grupoDoc=await db.collection('grupos').doc(grupoAtual).get();
    const membros=new Set(grupoDoc.data()?.membros||[]);
    const eventos=(feedDoc.data().eventos||[])
      .filter(e=>membros.has(e.uid)&&e.uid!==usuarioAtual.uid&&e.ts>ultimoCheck&&e.tipo!=='emblema');
    if(!eventos.length)return;
    const ev=eventos[0];
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--marrom);color:white;padding:10px 16px;border-radius:14px;font-size:0.82rem;font-weight:700;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer;font-family:Nunito,sans-serif;white-space:nowrap';
    ov.innerHTML=`<i class="ph-fill ph-beer-bottle"></i> ${sanitizeHtml(ev.nome)} visitou ${sanitizeHtml(ev.bar)}`;
    ov.onclick=()=>{ov.remove();window.irPara('feed');};
    document.body.appendChild(ov);
    setTimeout(()=>ov.remove(),4000);
  }catch(e){}
}
function renderGrupoCard(){
  const cont=document.getElementById('grupoConteudo');if(!cont)return;let html='';
  if(gruposAtual.length>0){
    html+=`<p style="font-size:0.82rem;color:var(--cinza);margin-bottom:8px">Seus grupos:</p>`;
    html+=gruposAtual.map(g=>`
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--creme);border-radius:10px;padding:10px 14px;margin-bottom:8px;${grupoSelecionado===g?'border:2px solid var(--laranja)':'border:2px solid transparent'}">
        <div>
          <div style="font-family:'Bebas Neue',cursive;font-size:1.3rem;color:var(--laranja);letter-spacing:3px">${g}</div>
          ${grupoSelecionado===g?'<div style="font-size:0.7rem;color:var(--verde);font-weight:700"><i class="ph-fill ph-check-circle"></i> Grupo ativo no ranking</div>':''}
        </div>
        <div style="display:flex;gap:6px">
          ${grupoSelecionado!==g?`<button onclick="window.selecionarGrupo('${g}')" style="padding:5px 10px;border-radius:8px;background:var(--marrom);color:white;border:none;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Ativar</button>`:''}
          ${grupoSelecionado===g?`<button onclick="window.abrirDesafioGrupo('${g}')" style="padding:5px 10px;border-radius:8px;background:var(--laranja);color:white;border:none;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-flag"></i></button>`:''}
          <button onclick="window.copiarCodigoGrupo('${g}')" style="padding:5px 10px;border-radius:8px;background:#f0e0d0;color:var(--marrom);border:none;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-clipboard-text"></i></button>
          <button onclick="window.sairDoGrupoEspecifico('${g}')" style="padding:5px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Sair</button>
        </div>
      </div>`).join('');
  }
  html+=`<div style="margin-top:12px">
    <button class="btn-grupo btn-criar-grupo" style="margin-bottom:8px" onclick="window.criarGrupo()"><i class="ph ph-plus"></i> Criar novo grupo</button>
    <div style="display:flex;gap:8px">
      <input id="codigoEntrar" type="text" placeholder="Código do grupo" style="flex:1;padding:9px 12px;border:1.5px solid #e0d0c0;border-radius:8px;font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;color:var(--marrom);text-transform:uppercase"/>
      <button class="btn-grupo btn-entrar-grupo" style="width:auto;padding:9px 14px" onclick="window.entrarNoGrupo()">Entrar</button>
    </div>
  </div>`;
  cont.innerHTML=html;
}
window.criarGrupo=async function(){
  const codigo=Math.random().toString(36).substring(2,8).toUpperCase();
  gruposAtual=[...gruposAtual,codigo];
  await db.collection('users').doc(usuarioAtual.uid).set({grupos:gruposAtual},{merge:true});
  await db.collection('grupos').doc(codigo).set({criadoPor:usuarioAtual.uid,criadoEm:Date.now(),membros:[usuarioAtual.uid]});
  if(!grupoSelecionado){grupoAtual=codigo;grupoSelecionado=codigo;}
  renderGrupoCard();mostrarNotif('Grupo criado! Código: '+codigo);
};
window.entrarNoGrupo=async function(){
  const codigo=document.getElementById('codigoEntrar').value.trim().toUpperCase();
  if(!codigo||codigo.length<4){mostrarNotif('Código inválido');return;}
  if(gruposAtual.includes(codigo)){mostrarNotif('Você já está neste grupo!');return;}
  const grupoDoc=await db.collection('grupos').doc(codigo).get();
  if(!grupoDoc.exists){mostrarNotif('Grupo não encontrado');return;}
  gruposAtual=[...gruposAtual,codigo];
  await db.collection('users').doc(usuarioAtual.uid).set({grupos:gruposAtual},{merge:true});
  await db.collection('grupos').doc(codigo).update({membros:firebase.firestore.FieldValue.arrayUnion(usuarioAtual.uid)});
  if(!grupoSelecionado){grupoAtual=codigo;grupoSelecionado=codigo;}
  renderGrupoCard();mostrarNotif('Entrou no grupo '+codigo+'!');
};
window.selecionarGrupo=function(codigo){grupoAtual=codigo;grupoSelecionado=codigo;renderGrupoCard();mostrarNotif('Grupo '+codigo+' ativo no ranking!');};
window.copiarCodigoGrupo=function(codigo){navigator.clipboard.writeText(codigo);mostrarNotif('Código '+codigo+' copiado!');};
window.sairDoGrupoEspecifico=async function(codigo){
  if(!confirm('Sair do grupo '+codigo+'?'))return;
  gruposAtual=gruposAtual.filter(g=>g!==codigo);
  await db.collection('users').doc(usuarioAtual.uid).set({grupos:gruposAtual},{merge:true});
  await db.collection('grupos').doc(codigo).update({membros:firebase.firestore.FieldValue.arrayRemove(usuarioAtual.uid)});
  if(grupoSelecionado===codigo){grupoAtual=gruposAtual[0]||null;grupoSelecionado=grupoAtual;}
  renderGrupoCard();mostrarNotif('Saiu do grupo '+codigo);
};
function renderAbaPerfilAtiva(){
  if (!usuarioAtual) return; 
  const aba=window._abaPerfilAtiva||'stats';
  const cont=document.getElementById('abaPerfilConteudo');
  if(!cont)return;
  if(!BARES||!BARES.length)return;
  const vList=Object.values(visitas);
  const totalVisitas=vList.length+extras.length;
  const boresIds=new Set(Object.keys(visitas));
  const conquistados=calcularEmblemas(totalVisitas,boresIds);

  if(aba==='stats'){
    const notas=[...vList.filter(v=>v.nota),...extras.filter(e=>e.nota)];
    const totalGasto=vList.reduce((s,v)=>s+(v.valor||40),0)+(extras.length*40);
    const diasSet=new Set();
    vList.forEach(v=>{if(v.ts)diasSet.add(new Date(v.ts).toDateString());});
    const diasAtivos=diasSet.size||1;

    const hoje=new Date().toDateString();
    const keyD='desafio_'+hoje+'_'+usuarioAtual.uid;
    const cachedD=localStorage.getItem(keyD);
    let barDesafio=null;
    const naoVisitadosD=BARES.filter(b=>!visitas[b.id]);
    if(cachedD){barDesafio=BARES.find(b=>b.id===cachedD);}
    else if(naoVisitadosD.length){
      const seed=hoje.split('').reduce((a,c)=>a+c.charCodeAt(0),0)+(usuarioAtual.uid.slice(0,6).split('').reduce((a,c)=>a+c.charCodeAt(0),0));
      barDesafio=naoVisitadosD[seed%naoVisitadosD.length];
      if(barDesafio)localStorage.setItem(keyD,barDesafio.id);
    }
    const desafioHtml=barDesafio&&!visitas[barDesafio.id]?`
    <div style="background:linear-gradient(135deg,#5C2E00,#E8650A);border-radius:14px;padding:16px;margin-bottom:16px;color:white;cursor:pointer" onclick="window.abrirBottomSheet('${barDesafio.id}')">
      <div style="font-size:0.65rem;font-weight:800;opacity:0.8;letter-spacing:2px;margin-bottom:4px"><i class="ph-fill ph-lightning"></i> DESAFIO DO DIA</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;letter-spacing:1px;margin-bottom:2px">${barDesafio.nome}</div>
      <div style="font-size:0.8rem;opacity:0.9">🍽 ${barDesafio.prato} · <i class="ph ph-map-pin"></i> ${barDesafio.regiao}</div>
    </div>`:'';
    cont.innerHTML=desafioHtml+`<div id="mapaRegioes"></div>`;
    document.getElementById('mapaRegioes').innerHTML=renderMapaRegioes(boresIds);

 } else if(aba==='emblemas'){
    let html='<div class="section-title" style="color:var(--text)"><i class="ph ph-medal"></i> Conquistas de Visitas</div>';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">';
    EMBLEMAS_QUANTIDADE.forEach(e=>{
      const conquistou=conquistados.has(e.nome);
      let barraHtml='';
      if(!conquistou&&e.min){
        const pct=Math.round((Math.min(totalVisitas,e.min)/e.min)*100);
        barraHtml=`<div style="margin-top:8px;background:var(--border);height:5px;border-radius:6px;overflow:hidden">
          <div style="width:${pct}%;background:var(--accent);height:100%;border-radius:6px"></div>
        </div>
        <div style="font-size:0.65rem;color:var(--text-sec);margin-top:4px">${Math.min(totalVisitas,e.min)} / ${e.min}</div>`;
      }
      html+=`<div style="
        background:var(--surface);
        border:1.5px solid ${conquistou?'var(--accent)':'var(--border)'};
        border-radius:var(--radius-card);
        padding:14px 10px;
        text-align:center;
        opacity:${conquistou?'1':'0.6'};
        transition:opacity 0.2s
      ">
        <div style="font-size:2rem;margin-bottom:6px">${e.icon}</div>
        <div style="font-weight:800;font-size:0.82rem;color:var(--text);margin-bottom:3px">${sanitizeHtml(e.nome)}</div>
        <div style="font-size:0.68rem;color:var(--text-sec);line-height:1.5">${sanitizeHtml(e.desc)}</div>
        ${barraHtml}
        ${conquistou?`<button onclick="window.compartilharEmblema('${sanitizeHtml(e.nome)}','${e.icon}')" style="margin-top:10px;padding:4px 12px;border-radius:10px;background:transparent;color:var(--accent);border:1px solid var(--accent);font-size:0.7rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-share-network"></i> Compartilhar</button>`:''}
      </div>`;
    });
    html+='</div>';
    html+='<div class="section-title" style="margin-top:4px;color:var(--text)"><i class="ph ph-map-trifold"></i> Conquistas de Regiões</div>';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    EMBLEMAS_REGIAO.forEach(e=>{
      const conquistou=conquistados.has(e.nome);
      html+=`<div style="
        background:var(--surface);
        border:1.5px solid ${conquistou?'var(--accent)':'var(--border)'};
        border-radius:var(--radius-card);
        padding:14px 10px;
        text-align:center;
        opacity:${conquistou?'1':'0.6'};
        transition:opacity 0.2s
      ">
        <div style="font-size:2rem;margin-bottom:6px">${e.icon}</div>
        <div style="font-weight:800;font-size:0.82rem;color:var(--text);margin-bottom:3px">${sanitizeHtml(e.nome)}</div>
        <div style="font-size:0.68rem;color:var(--text-sec);line-height:1.5">${sanitizeHtml(e.desc)}</div>
      </div>`;
    });
    html+='</div>';
    cont.innerHTML=html;

  } else if(aba==='grupo'){
    cont.innerHTML=`<div class="grupo-card" id="grupoCard"><div class="section-title"><i class="ph ph-users"></i> Meu Grupo</div><div id="grupoConteudo"></div></div><div id="statsGrupo"></div>`;
    renderGrupoCard();
    renderStatsGrupo();

  } else if(aba==='config'){
    const isDark = document.body.classList.contains('modo-boemia');
    cont.innerHTML=`
      <div class="perfil-card" style="padding:0; overflow:hidden;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--border); display:flex; align-items:center; justify-content:center; color:var(--primary); font-size:1.2rem;">
              <i class="ph-fill ph-moon"></i>
            </div>
            <div>
              <div style="font-weight:800; font-size:0.95rem; color:var(--primary);">Modo Boemia</div>
              <div style="font-size:0.75rem; color:var(--text-sec);">Tema escuro do app</div>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" ${isDark ? 'checked' : ''} onchange="window.toggleModoBoemia()">
            <span class="slider"></span>
          </label>
        </div>
        <div style="padding:16px 20px; border-bottom:1px solid var(--border);">
          <div style="font-weight:800; font-size:0.95rem; color:var(--primary); margin-bottom:12px;">Personalizar Avatar</div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;" id="avatarOpcoes"></div>
          <input type="file" accept="image/*" class="foto-upload" id="fotoUpload" onchange="window.uploadFoto(this)" style="display:none;"/>
          <button class="btn-outline" onclick="document.getElementById('fotoUpload').click()"><i class="ph ph-camera"></i> Enviar Foto Real</button>
        </div>
        <div style="padding:16px 20px; border-bottom:1px solid var(--border);">
          <button class="btn-primary" onclick="window.mostrarNotif('Perfil salvo!')"><i class="ph ph-floppy-disk"></i> Salvar Configurações</button>
        </div>
        <div style="padding:16px 20px; background:rgba(231, 76, 60, 0.05);">
          <button class="btn-outline btn-danger" onclick="window.excluirConta()" style="margin-bottom:12px"><i class="ph ph-trash"></i> Excluir Minha Conta</button>
          <button class="btn-outline" onclick="window.editarTelefone()"><i class="ph ph-device-mobile"></i> Contato para prêmios</button>
        </div>

      </div>
    `;
    const avatarAtual=localStorage.getItem('avatar_'+usuarioAtual.uid)||'ph-beer-bottle';
    document.getElementById('avatarOpcoes').innerHTML = AVATARES_PHOSPHOR.map(e => `
      <div 
        class="avatar-op-item ${e === avatarAtual ? 'avatar-selecionado' : ''}"
        data-avatar="${e}"
        onclick="window.salvarAvatar('${e}')"
        title="${e.replace('ph-','')}"
      >
        <i class="ph-fill ${e}"></i>
      </div>`).join('');
  }
}
window.setAbaPerfil=function(aba){
  ['stats','fotos','emblemas','grupo','config'].forEach(a=>{
    const btn=document.getElementById('aba'+a.charAt(0).toUpperCase()+a.slice(1));
    if(btn){btn.style.background=a===aba?'var(--marrom)':'transparent';btn.style.color=a===aba?'white':'var(--marrom)';}
  });
  window._abaPerfilAtiva=aba;
  renderAbaPerfilAtiva();
};
window.editarNome=async function(){
  if(!usuarioAtual)return;
  const userDoc=await db.collection('users').doc(usuarioAtual.uid).get();
  const data=userDoc.data()||{};
  const trocas=data.trocasNome||0;
  if(trocas>=2){mostrarNotif('<i class="ph-fill ph-x-circle"></i> Você já alterou seu nome 2 vezes','erro');return;}

  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box">
      <div class="modal-titulo">✏️ Editar Nome</div>
      <p class="modal-desc">Você pode trocar seu nome <strong>${2-trocas}</strong> vez${2-trocas>1?'es':''} ainda.</p>
      <input class="input-field" id="nomeNovoInput" type="text" placeholder="Seu novo nome" maxlength="30"/>
      <div id="nomeMsg" style="font-size:0.78rem;min-height:18px;margin-bottom:12px;font-weight:700"></div>
      <button onclick="window.confirmarNome()" class="btn-login" style="margin-bottom:10px">💾 Salvar nome</button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById('nomeNovoInput')?.focus(),100);
};

window.confirmarNome=async function(){
  const novoNome=document.getElementById('nomeNovoInput')?.value.trim();
  const msg=document.getElementById('nomeMsg');
  if(!novoNome){msg.style.color='#cc0000';msg.textContent='Digite um nome.';return;}
  if(novoNome.length<2){msg.style.color='#cc0000';msg.textContent='Nome muito curto.';return;}
  if(novoNome.length>30){msg.style.color='#cc0000';msg.textContent='Máximo 30 caracteres.';return;}

  const userDoc=await db.collection('users').doc(usuarioAtual.uid).get();
  const trocas=(userDoc.data()?.trocasNome)||0;

  await usuarioAtual.updateProfile({displayName:novoNome});
  await db.collection('users').doc(usuarioAtual.uid).set({nome:novoNome,trocasNome:trocas+1},{merge:true});

  document.querySelector('.modal-overlay')?.remove();

  document.getElementById('headerNome').textContent=novoNome;
  document.getElementById('perfilNome').innerHTML=novoNome+' <span style="font-size:0.75rem;color:var(--laranja);cursor:pointer;opacity:0.7">✏️</span>';

  const restantes=2-trocas-1;
  mostrarNotif(restantes>0
    ?`<i class="ph-fill ph-check-circle"></i> Nome salvo! Você ainda pode trocar mais ${restantes} vez${restantes>1?'es':''}`
    :`<i class="ph-fill ph-check-circle"></i> Nome salvo! Não é possível trocar mais`,'info');
  window._perfilAdminCache=null;
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
};
window.excluirConta=async function(){
  if(!confirm('Tem certeza? Todos os seus dados serão apagados permanentemente.'))return;
  if(!confirm('Confirma a exclusão definitiva da sua conta?'))return;
  try{
    mostrarNotif('Excluindo dados...');
    const vSnap=await db.collection('users').doc(usuarioAtual.uid).collection('visits').get();
    for(const doc of vSnap.docs)await doc.ref.delete();
    const eSnap=await db.collection('users').doc(usuarioAtual.uid).collection('extras').get();
    for(const doc of eSnap.docs)await doc.ref.delete();
    await db.collection('ranking').doc('global').update({[usuarioAtual.uid]:firebase.firestore.FieldValue.delete()});
    await db.collection('users').doc(usuarioAtual.uid).delete();
    for(const codigo of gruposAtual){await db.collection('grupos').doc(codigo).update({membros:firebase.firestore.FieldValue.arrayRemove(usuarioAtual.uid)});}
    await usuarioAtual.delete();mostrarNotif('Conta excluída.');
  }catch(e){
    if(e.code==='auth/requires-recent-login'){alert('Por segurança, faça logout e login novamente antes de excluir a conta.');}
    else{mostrarNotif('Erro ao excluir: '+e.message);}
  }
};
function renderMapaRegioes(boresIds){
  const regioes={
    NORTE:{x:200,y:30,w:160,h:120,label:'NORTE'},
    NORDESTE:{x:320,y:120,w:120,h:100,label:'NORDESTE'},
    LESTE:{x:280,y:200,w:120,h:100,label:'LESTE'},
    CENTRO:{x:180,y:180,w:110,h:80,label:'CENTRO'},
    SUL:{x:160,y:240,w:120,h:100,label:'SUL'},
    OESTE:{x:40,y:160,w:140,h:120,label:'OESTE'},
    NOROESTE:{x:60,y:60,w:150,h:110,label:'NOROESTE'},
  };
  const cores={completa:'#2D6A2D',parcial:'#E8650A',vazia:'#e0d0c0'};
  const textoCores={completa:'white',parcial:'white',vazia:'#888'};
  let svgRegioes='';
  Object.entries(regioes).forEach(([regiao,r])=>{
    const total=BARES.filter(b=>b.regiao===regiao).length;
    const feitos=BARES.filter(b=>b.regiao===regiao&&boresIds.has(b.id)).length;
    const status=feitos===0?'vazia':feitos===total?'completa':'parcial';
    const pct=total>0?Math.round((feitos/total)*100):0;
    svgRegioes+=`
      <g onclick="window.mostrarNotif('${regiao}: ${feitos}/${total} bares (${pct}%)')" style="cursor:pointer">
        <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="8" fill="${cores[status]}" stroke="white" stroke-width="2"/>
        <text x="${r.x+r.w/2}" y="${r.y+r.h/2-8}" text-anchor="middle" font-family="Bebas Neue,cursive" font-size="13" fill="${textoCores[status]}">${r.label}</text>
        <text x="${r.x+r.w/2}" y="${r.y+r.h/2+10}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="11" font-weight="700" fill="${textoCores[status]}">${feitos}/${total}</text>
        <text x="${r.x+r.w/2}" y="${r.y+r.h/2+24}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" fill="${textoCores[status]}">${pct}%</text>
      </g>`;
  });
  return`<div style="background:white;border-radius:14px;padding:16px;box-shadow:var(--shadow);margin-bottom:16px">
    <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:var(--marrom);letter-spacing:1px;margin-bottom:4px"><i class="ph ph-map-trifold"></i> Mapa de BH</div>
    <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:12px;border-radius:3px;background:#2D6A2D"></div><span style="font-size:0.72rem;color:var(--cinza)">Completa</span></div>
      <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:12px;border-radius:3px;background:#E8650A"></div><span style="font-size:0.72rem;color:var(--cinza)">Em progresso</span></div>
      <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:12px;border-radius:3px;background:#e0d0c0"></div><span style="font-size:0.72rem;color:var(--cinza)">Não iniciada</span></div>
    </div>
    <svg viewBox="0 0 460 360" style="width:100%;border-radius:10px;background:#f5f0e8">${svgRegioes}</svg>
    <div style="font-size:0.72rem;color:var(--cinza);text-align:center;margin-top:8px">Toque em uma região para ver o progresso</div>
  </div>`;
}

async function renderDesafioDia(){
  if(!usuarioAtual)return;
  const hoje=new Date().toDateString();
  const key='desafio_'+hoje+'_'+usuarioAtual.uid;
  const cached=localStorage.getItem(key);
  let barDesafio;
  if(cached){
    barDesafio=BARES.find(b=>b.id===cached);
  }else{
    const naoVisitados=BARES.filter(b=>!visitas[b.id]);
    if(!naoVisitados.length)return;
    const seed=hoje.split('').reduce((a,c)=>a+c.charCodeAt(0),0)+usuarioAtual.uid.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    barDesafio=naoVisitados[seed%naoVisitados.length];
    localStorage.setItem(key,barDesafio.id);
  }
  if(!barDesafio||visitas[barDesafio.id])return;
  const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barDesafio.nome+' '+barDesafio.end)}`;
  const el=document.getElementById('desafioDia');
  if(!el)return;
  el.innerHTML=`
    <div style="background:linear-gradient(135deg,#5C2E00,#E8650A);border-radius:14px;padding:16px;margin-bottom:16px;color:white">
      <div style="font-size:0.72rem;font-weight:700;opacity:0.8;letter-spacing:1px;margin-bottom:4px"><i class="ph-fill ph-lightning"></i> DESAFIO DO DIA</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;letter-spacing:1px;margin-bottom:4px">${barDesafio.nome}</div>
      <div style="font-size:0.82rem;opacity:0.9;margin-bottom:4px">🍽 ${barDesafio.prato}</div>
      <div style="font-size:0.75rem;opacity:0.8;margin-bottom:12px"><i class="ph ph-map-pin"></i> ${barDesafio.regiao} · ${barDesafio.end.split('-')[0].trim()}</div>
      <div style="display:flex;gap:8px">
        <button onclick="window.irPara('bares');setTimeout(()=>{document.getElementById('buscaInput').value='${barDesafio.nome}';window.filtrarBares();},300)" style="flex:1;padding:9px;border-radius:10px;background:white;color:var(--marrom);border:none;font-size:0.82rem;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph-fill ph-beer-bottle"></i> Ver no app</button>
        <a href="${mapsUrl}" target="_blank" style="padding:9px 14px;border-radius:10px;background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.4);font-size:0.82rem;font-weight:700;text-decoration:none;font-family:'Nunito',sans-serif;display:flex;align-items:center"><i class="ph ph-map-trifold"></i></a>
      </div>
    </div>`;
}

let _mapaLeaflet=null;
let _vistaProximos='lista';
let _watchId=null;
let _marcadorUsuario=null;
function renderDownloads(){
  document.getElementById('downloadsConteudo').innerHTML=`
    <div style="background:linear-gradient(135deg,#5C2E00,#E8650A);border-radius:14px;padding:24px 20px;margin-bottom:20px;text-align:center;color:white">
      <div style="font-size:2.5rem;margin-bottom:8px"><i class="ph ph-device-mobile"></i></div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;letter-spacing:2px">Instale o App</div>
      <div style="font-size:0.85rem;opacity:0.9;margin-top:4px">Tenha o Trilha BH sempre na sua tela inicial</div>
    </div>
    <div style="background:white;border-radius:14px;padding:18px;box-shadow:var(--shadow);margin-bottom:14px;border-left:4px solid #3DDC84">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="font-size:2rem">🤖</div>
        <div>
          <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--marrom);letter-spacing:1px">Android</div>
          <div style="background:#3DDC84;color:white;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:10px;display:inline-block"><i class="ph-fill ph-check-circle"></i> DISPONÍVEL AGORA</div>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#444;line-height:1.6;margin-bottom:14px">Baixe o arquivo APK direto no seu celular Android. Não precisa da Play Store.</p>
      <div style="background:#f0fff4;border-radius:10px;padding:12px;margin-bottom:14px">
        <div style="font-size:0.78rem;font-weight:700;color:#2D6A2D;margin-bottom:8px"><i class="ph ph-clipboard-text"></i> Como instalar:</div>
        <div style="font-size:0.78rem;color:#444;line-height:1.8">
          1. Toque em <strong>Baixar APK</strong> abaixo<br>
          2. Abra o arquivo baixado<br>
          3. Se aparecer aviso de segurança, toque em <strong>Instalar mesmo assim</strong><br>
          4. Pronto — o app aparece na sua tela inicial
        </div>
      </div>
      <a href="https://drive.google.com/uc?export=download&id=1ppb02DErANcIEPVOFP1zT5DOHexak8Kp" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:12px;background:#3DDC84;color:white;font-size:0.95rem;font-weight:800;text-decoration:none;font-family:'Nunito',sans-serif;box-sizing:border-box">
        <i class="ph ph-device-mobile"></i> Baixar APK — Android
      </a>
    </div>
    <div style="background:white;border-radius:14px;padding:18px;box-shadow:var(--shadow);margin-bottom:14px;border-left:4px solid #555;opacity:0.9">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="font-size:2rem">🍎</div>
        <div>
          <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--marrom);letter-spacing:1px">iPhone</div>
          <div style="background:#888;color:white;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:10px;display:inline-block">WEB APP PWA</div>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#444;line-height:1.6;margin-bottom:14px">Adicione na tela inicial pelo Safari para ter a experiência completa em tela cheia.</p>
      <div style="background:#f5f5f5;border-radius:10px;padding:12px">
        <div style="font-size:0.78rem;font-weight:700;color:var(--cinza);margin-bottom:8px"><i class="ph ph-clipboard-text"></i> Como instalar no Safari:</div>
        <div style="font-size:0.78rem;color:#444;line-height:1.8">
          1. Toque no ícone de compartilhar <strong>⎙</strong> (quadrado com seta pra cima)<br>
          2. Deslize para baixo e toque em <strong>Adicionar à Tela de Início</strong> <i class="ph ph-plus"></i><br>
          3. Toque em <strong>Adicionar</strong> no canto superior direito<br>
          4. Abra pelo novo ícone na sua tela inicial!
        </div>
      </div>
    </div>`;
}
function renderExtras(){
  const lista=document.getElementById('listaExtras');
  if(!lista)return;
  if(!extras.length){lista.innerHTML='<div class="empty"><div class="empty-icon"><i class="ph ph-plus"></i></div><p>Nenhum bar extra ainda</p></div>';return;}
  lista.innerHTML=extras.slice().reverse().map(e=>`
    <div class="bar-card">
      <div class="bar-header"><div>
        <div class="bar-nome">${e.nome}</div>
        ${e.nota?`<div style="font-size:0.75rem;margin-top:2px">${'<i class="ph-fill ph-star"></i>'.repeat(e.nota)} ${e.nota}/10</div>`:''}
        ${e.ts?`<div style="font-size:0.7rem;color:var(--cinza)">📅 ${new Date(e.ts).toLocaleDateString('pt-BR')}</div>`:''}
      </div><span class="bar-regiao-badge">EXTRA</span></div>
      <div class="bar-info">
        ${e.prato?`<div class="bar-prato">${sanitizeHtml(e.prato)}</div>`:''}
        ${e.comentario?`<div style="font-size:0.82rem;color:#555;font-style:italic;margin-top:4px">${sanitizeHtml(e.comentario)}</div>`:''}
        <button onclick="window.excluirExtra('${e.id}')" style="margin-top:10px;padding:6px 14px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif"><i class="ph ph-trash"></i> Excluir</button>
      </div>
    </div>`).join('');
}
window.adicionarExtra=async function(){
  if(!usuarioAtual)return;
  const nome=document.getElementById('extraNome').value.trim();
  const prato=document.getElementById('extraPrato').value.trim();
  const nota=parseInt(document.getElementById('extraNota').value)||0;
  const comentario=document.getElementById('extraComentario').value.trim();
  if(!nome){mostrarNotif('Informe o nome do bar');return;}
  const d={nome,prato,nota,comentario,ts:Date.now()};
  const ref=await db.collection('users').doc(usuarioAtual.uid).collection('extras').add(d);
  extras.push({id:ref.id,...d});
  ['extraNome','extraPrato','extraNota','extraComentario'].forEach(id=>document.getElementById(id).value='');
  mostrarNotif('<i class="ph-fill ph-check-circle"></i> Bar extra registrado!');renderExtras();renderPerfil();
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
};
window.excluirExtra=async function(id){
  if(!confirm('Excluir este bar extra?'))return;
  await db.collection('users').doc(usuarioAtual.uid).collection('extras').doc(id).delete();
  extras=extras.filter(e=>e.id!==id);
  salvarCache('extras_'+usuarioAtual.uid,extras);
  renderExtras();renderPerfil();
  clearTimeout(window._cacheGlobalTimer);
  window._cacheGlobalTimer=setTimeout(()=>window.atualizarCacheGlobal(),3000);
  mostrarNotif('Extra excluído');
};
window.abrirModalExtras=function(){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.style.alignItems='flex-start';
  overlay.style.paddingTop='20px';
  overlay.innerHTML=`
    <div class="modal-box" style="text-align:left;max-height:85vh;overflow-y:auto">
      <div class="modal-titulo"><i class="ph ph-plus"></i> Bar Extra</div>
      <div class="form-group"><label>Nome do bar</label><input id="extraNome" type="text" placeholder="Ex: Bar do Zé"/></div>
      <div class="form-group"><label>Petisco experimentado</label><input id="extraPrato" type="text" placeholder="Ex: Costelinha caipira"/></div>
      <div class="form-group"><label>Nota (1-10)</label><input id="extraNota" type="number" min="1" max="10" placeholder="8"/></div>
      <div class="form-group"><label>Comentário</label><textarea id="extraComentario" rows="2" placeholder="O que achou?"></textarea></div>
      <button onclick="window.adicionarExtra().then(()=>window.atualizarListaExtrasModal())" style="width:100%;padding:10px;border-radius:10px;background:var(--marrom);color:white;border:none;font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:12px">Registrar</button>
      <div id="listaExtrasModal"></div>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro" style="margin-top:8px">Fechar</button>
    </div>`;
  document.body.appendChild(overlay);
  window.atualizarListaExtrasModal();
};
async function renderStatsGrupo(){
  if(!grupoAtual){document.getElementById('statsGrupo').innerHTML='';return;}
  if(window._cacheStatsGrupo&&window._cacheStatsGrupoId===grupoAtual&&(Date.now()-window._cacheStatsGrupoTs)<120000){
    document.getElementById('statsGrupo').innerHTML=window._cacheStatsGrupo;return;
  }
  const grupoDoc=await db.collection('grupos').doc(grupoAtual).get();
  const membros=grupoDoc.data()?.membros||[];
  const contBares={};let totalVisitas=0,totalGasto=0;
  for(const uid of membros){
    const vSnap=await db.collection('users').doc(uid).collection('visits').get();
    vSnap.forEach(v=>{totalVisitas++;totalGasto+=40;contBares[v.id]=(contBares[v.id]||0)+1;});
  }
  const barMaisVisitado=Object.entries(contBares).sort((a,b)=>b[1]-a[1])[0];
  const barInfo=barMaisVisitado?BARES.find(b=>b.id===barMaisVisitado[0]):null;
  document.getElementById('statsGrupo').innerHTML=`
  <div id="desafioGrupoAtivo" style="margin-bottom:0"></div>
  <div id="progressoColetivoGrupo" style="margin-bottom:12px"></div>
  <div style="background:white;border-radius:14px;padding:16px;box-shadow:var(--shadow);margin-bottom:16px">
    <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:var(--marrom);letter-spacing:1px;margin-bottom:12px">📊 Estatísticas do Grupo</div>
    <div class="gasto-row"><span class="gasto-label">Total de visitas do grupo</span><span class="gasto-valor">${totalVisitas}</span></div>
    <div class="gasto-row"><span class="gasto-label">Total gasto pelo grupo</span><span class="gasto-valor">R$ ${totalGasto}</span></div>
    <div class="gasto-row"><span class="gasto-label">Membros no grupo</span><span class="gasto-valor">${membros.length}</span></div>
    ${barInfo?`<div class="gasto-row"><span class="gasto-label">Bar favorito do grupo</span><span class="gasto-valor" style="font-size:0.85rem;text-align:right;max-width:60%">${barInfo.nome}</span></div>`:''}
    <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);letter-spacing:1px;margin:14px 0 10px"><i class="ph-fill ph-trophy"></i> Ranking do Grupo</div>
    <div id="rankingGrupoLista"><p style="font-size:0.82rem;color:var(--cinza)">Carregando...</p></div>
  </div>`;

  const rankDoc=await db.collection('ranking').doc('global').get();
  const rankDados=rankDoc.exists?rankDoc.data():{};
  const membrosRank=membros.map(uid=>rankDados[uid]).filter(Boolean).sort((a,b)=>(b.totalVisitas||0)-(a.totalVisitas||0));
  const rankEl=document.getElementById('rankingGrupoLista');
  if(rankEl){
    rankEl.innerHTML=membrosRank.length?membrosRank.map((u,i)=>{
      const medalha=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`;
      const av=u.avatar||'ph-beer-bottle';
      const avatarHtml=av.startsWith('https://')||av.startsWith('data:')?`<img src="${av}" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>`
        :av.startsWith('ph-')?`<i class="ph-fill ${av}" style="font-size:1.2rem;color:var(--marrom)"></i>`
        :`<span style="font-size:1.1rem">${av}</span>`;
      return`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:var(--laranja);width:24px;text-align:center;flex-shrink:0">${medalha}</div>
        <div style="width:32px;height:32px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">${avatarHtml}
        <div class="avatar-emblema-badge">
  ${getIconEmblema(localStorage.getItem('emblema_equipado_'+usuarioAtual.uid))||''}
</div></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:0.88rem;color:var(--marrom);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sanitizeHtml(u.nome||'Explorador')}</div>
          <div style="font-size:0.72rem;color:var(--cinza)">${u.totalVisitas||0} bares · ${u.media&&u.media!=='-'?u.media+'/10':'sem notas'}</div>
        </div>
        ${u.uid===usuarioAtual.uid?`<span style="font-size:0.65rem;background:var(--laranja);color:white;padding:2px 8px;border-radius:10px;font-weight:700">você</span>`:''}
      </div>`;
    }).join(''):'<p style="font-size:0.82rem;color:var(--cinza)">Nenhum membro com dados ainda</p>';
  }
    window._cacheStatsGrupo=document.getElementById('statsGrupo').innerHTML;
  window._cacheStatsGrupoId=grupoAtual;
  window._cacheStatsGrupoTs=Date.now();
   window.renderDesafioGrupoAtivo?.(grupoAtual, membros, 'desafioGrupoAtivo');
  window.renderProgressoColetivo?.(grupoAtual, membros, 'progressoColetivoGrupo');
}
window.atualizarListaExtrasModal=function(){
  const lista=document.getElementById('listaExtrasModal');
  if(!lista)return;
  if(!extras.length){lista.innerHTML='<div style="font-size:0.82rem;color:var(--cinza);text-align:center;padding:12px">Nenhum bar extra ainda</div>';return;}
  lista.innerHTML=extras.slice().reverse().map(e=>`
    <div class="bar-card" style="margin-bottom:8px">
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="bar-nome">${sanitizeHtml(e.nome)}</div>
          ${e.nota?`<div style="font-size:0.75rem;margin-top:2px">${'<i class="ph-fill ph-star"></i>'.repeat(e.nota)} ${e.nota}/10</div>`:''}
          ${e.prato?`<div style="font-size:0.8rem;color:var(--laranja);margin-top:2px">🍽 ${sanitizeHtml(e.prato)}</div>`:''}
          ${e.comentario?`<div style="font-size:0.78rem;color:#555;font-style:italic;margin-top:4px">${sanitizeHtml(e.comentario)}</div>`:''}
        </div>
        <button onclick="window.excluirExtra('${e.id}').then(()=>window.atualizarListaExtrasModal())" style="padding:4px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;flex-shrink:0"><i class="ph ph-trash"></i></button>
      </div>
    </div>`).join('');
};
window.editarTelefone=function(){
  const tel=localStorage.getItem('tel_'+usuarioAtual.uid)||'';
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box">
      <div class="modal-titulo"><i class="ph ph-device-mobile"></i> Contato para Prêmios</div>
      <p style="font-size:0.82rem;color:var(--cinza);margin-bottom:16px">Usado para contato caso você ganhe algum prêmio da Trilha BH.</p>
      <input class="input-field" id="telInput" type="tel" placeholder="WhatsApp ou e-mail" value="${tel}"/>
      <button onclick="window.salvarTelefone()" class="btn-login" style="margin-bottom:10px">Salvar</button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro" style="color:var(--marrom);background:transparent;border:1.5px solid var(--border)">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById('telInput')?.focus(),100);
};
window.salvarTelefone=async function(){
  const tel=document.getElementById('telInput')?.value.trim();
  if(!tel){mostrarNotif('Informe um contato','erro');return;}
  localStorage.setItem('tel_'+usuarioAtual.uid,tel);
  await db.collection('users').doc(usuarioAtual.uid).set({contatoPremio:tel},{merge:true});
  document.querySelector('.modal-overlay')?.remove();
  mostrarNotif('<i class="ph ph-device-mobile"></i> Contato salvo!');
  window._perfilAdminCache=null;
  renderPerfil();
};
window.atualizarListaExtrasModal=function(){
  const lista=document.getElementById('listaExtrasModal');
  if(!lista)return;
  if(!extras.length){lista.innerHTML='<div style="font-size:0.82rem;color:var(--cinza);text-align:center;padding:12px">Nenhum bar extra ainda</div>';return;}
  lista.innerHTML=extras.slice().reverse().map(e=>`
    <div class="bar-card" style="margin-bottom:8px">
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="bar-nome">${sanitizeHtml(e.nome)}</div>
          ${e.nota?`<div style="font-size:0.75rem;margin-top:2px">${'<i class="ph-fill ph-star"></i>'.repeat(e.nota)} ${e.nota}/10</div>`:''}
          ${e.prato?`<div style="font-size:0.8rem;color:var(--laranja);margin-top:2px">🍽 ${sanitizeHtml(e.prato)}</div>`:''}
          ${e.comentario?`<div style="font-size:0.78rem;color:#555;font-style:italic;margin-top:4px">${sanitizeHtml(e.comentario)}</div>`:''}
        </div>
        <button onclick="window.excluirExtra('${e.id}')" style="padding:4px 10px;border-radius:8px;background:transparent;color:#cc0000;border:1px solid #cc0000;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;flex-shrink:0"><i class="ph ph-trash"></i></button>
      </div>
    </div>`).join('');
};
window.editarContatoPremio=window.editarTelefone;
window.salvarContatoPremio=window.salvarTelefone;
window.removerContatoPremio=async function(){
  localStorage.removeItem('tel_'+usuarioAtual.uid);
  await db.collection('users').doc(usuarioAtual.uid).set({contatoPremio:''},{merge:true});
  window._perfilAdminCache=null;
  mostrarNotif('Contato removido');
  renderPerfil();
};
window.atualizarExibicaoContato=window.renderPerfil;
window.renderContatoPremio=function(){
  const tel=localStorage.getItem('tel_'+usuarioAtual?.uid)||'';
  const el=document.getElementById('perfilTelefone');
  if(!el)return;
  el.innerHTML=tel
    ?`<i class="ph ph-device-mobile"></i> ${tel} <span style="font-size:0.7rem;color:var(--laranja);cursor:pointer" onclick="window.editarTelefone()"><i class="ph ph-pencil-simple"></i></span>`
    :`<span style="font-size:0.75rem;color:var(--cinza);cursor:pointer" onclick="window.editarTelefone()"><i class="ph ph-plus"></i> Adicionar contato para prêmios</span>`;
};
window.compartilharEmblema=function(nome,icon){
  const txt=`Conquistei o emblema "${icon} ${nome}" no Trilha BH! <i class="ph-fill ph-beer-bottle"></i>\nO tour gastronômico de Belo Horizonte.\ntrilhabh.web.app`;
  if(navigator.share){navigator.share({title:'Trilha BH',text:txt}).catch(()=>{});}
  else{navigator.clipboard.writeText(txt);mostrarNotif('<i class="ph ph-clipboard-text"></i> Texto copiado!');}
};
window.compartilharPerfil=function(){
  const nome=usuarioAtual.displayName||'Explorador';
  const total=Object.keys(visitas).length;
  const txt=`${nome} já visitou ${total} bares no Trilha BH! <i class="ph ph-compass"></i><i class="ph-fill ph-beer-bottle"></i>\ntrilhabh.web.app`;
  if(navigator.share){navigator.share({title:'Trilha BH',text:txt}).catch(()=>{});}
  else{navigator.clipboard.writeText(txt);mostrarNotif('<i class="ph ph-clipboard-text"></i> Copiado!');}
};

window.reativarAgendamento = function() {
  localStorage.removeItem('modo_boemia_manual');
  if (typeof checarModoBoemiaPorHorario === 'function') checarModoBoemiaPorHorario();
  window.mostrarNotif('<i class="ph ph-clock"></i> Agendamento reativado!');
};
window.renderPerfil = renderPerfil;
window.getCorEmblema = function(nome) {
  const e = [...EMBLEMAS_QUANTIDADE, ...EMBLEMAS_REGIAO].find(x => x.nome === nome);
  return e?.cor || 'var(--laranja)';
};
window.getIconEmblema = function(nome) {
  const e = [...EMBLEMAS_QUANTIDADE, ...EMBLEMAS_REGIAO].find(x => x.nome === nome);
  return e?.icon || '';
};
window.equiparEmblema = function(nome) {
  const anterior = localStorage.getItem('emblema_equipado_' + usuarioAtual.uid);
  if (anterior === nome) {
    localStorage.removeItem('emblema_equipado_' + usuarioAtual.uid);
    db.collection('users').doc(usuarioAtual.uid).set({emblemaEquipado: ''}, {merge: true});
    mostrarNotif('Emblema removido');
  } else {
    localStorage.setItem('emblema_equipado_' + usuarioAtual.uid, nome);
    db.collection('users').doc(usuarioAtual.uid).set({emblemaEquipado: nome}, {merge: true});
    mostrarNotif('<i class="ph-fill ph-medal"></i> Emblema equipado!');
  }
  const emb = [...EMBLEMAS_QUANTIDADE, ...EMBLEMAS_REGIAO].find(e => e.nome === nome);
  const icone = emb?.icon || '';
  const avatarEl = document.getElementById('perfilAvatar');
  if (avatarEl && icone) {
    let badge = avatarEl.querySelector('.emblema-badge-avatar');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'emblema-badge-avatar';
      badge.style.cssText = 'position:absolute;bottom:-4px;right:-4px;font-size:1rem;background:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.2)';
      avatarEl.style.position = 'relative';
      avatarEl.appendChild(badge);
    }
    badge.innerHTML = icone;
  }
  document.querySelectorAll('.btn-equipar').forEach(btn => {
    const card = btn.closest('.emblema-card');
    const nomeCard = card?.querySelector('.emblema-nome')?.textContent?.trim();
    btn.textContent = nomeCard === nome && localStorage.getItem('emblema_equipado_' + usuarioAtual.uid) === nome ? '✓ Equipado' : 'Equipar';
  });
};
window.setAbaPerfil = window._setAbaPerfilAtiva;
window.renderExtras = renderExtras;