const firebaseConfig = {
  apiKey: "AIzaSyAWPK7cNYuMtQlhZsnaNcJI_H6NgMsvUEg",
  authDomain: "trilhabh.firebaseapp.com",
  projectId: "trilhabh",
  storageBucket: "trilhabh.firebasestorage.app",
  messagingSenderId: "859459933920",
  appId: "1:859459933920:web:12a961f4e1f9b5e5852285"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

const authTimeout = setTimeout(() => iniciarModoAnonimo(), 5000);
window.fazerLogin=async function(){
  const btn=document.getElementById('btnLogin');
if(btn){btn.innerHTML='<i class="ph ph-spinner"></i> Entrando...';btn.disabled=true;}
  const email=document.getElementById('emailInput').value.trim();
  const senha=document.getElementById('senhaInput').value;
  const msg=document.getElementById('loginMsg');
  const loginTimeout=setTimeout(()=>{
    if(btn){btn.innerHTML='entrar';btn.disabled=false;}
    msg.textContent='Tempo esgotado. Verifique sua conexão.';
  },10000);
  if(!email||!senha){msg.textContent='Preencha email e senha.';return;}
  try{
    if(modoLogin){await auth.signInWithEmailAndPassword(email,senha);
      clearTimeout(loginTimeout);
    }
    else{
       clearTimeout(loginTimeout)
      const nome=document.getElementById('nomeInput').value.trim();
const senha2=document.getElementById('senha2Input').value;
if(!nome){msg.textContent='Informe seu nome.';return;}
if(nome.length<2){msg.textContent='Nome muito curto.';return;}
if(senha!==senha2){msg.textContent='As senhas não coincidem.';return;}
const cred=await auth.createUserWithEmailAndPassword(email,senha);
await cred.user.updateProfile({displayName:nome});
await db.collection('users').doc(cred.user.uid).set({nome,email,criadoEm:Date.now()});
    }
    msg.textContent='';
  }catch(e){
    clearTimeout(loginTimeout);
    const erros={'auth/user-not-found':'Usuário não encontrado.','auth/wrong-password':'Senha incorreta.','auth/email-already-in-use':'Email já cadastrado.','auth/weak-password':'Senha fraca (mín. 6 chars).','auth/invalid-email':'Email inválido.'};
    msg.textContent=erros[e.code]||e.message;
    document.getElementById('btnReset')?.style && (document.getElementById('btnReset').style.display='block');
    if(btn){btn.innerHTML=modoLogin?'entrar':'cadastrar';btn.disabled=false;}
  }
};

window.fazerLogout=async function(){
  if(typeof auth==='undefined'){iniciarModoAnonimo();return;}
  await auth.signOut();
};

let modoLogin=true;
window.toggleCadastro=function(){
  modoLogin=!modoLogin;
  if(document.getElementById('loginTitle')) if(document.getElementById('loginTitle')) if(document.getElementById('loginTitle')) if(document.getElementById('loginTitle')) if(document.getElementById('loginTitle')) document.getElementById('loginTitle').textContent=modoLogin?'Entrar':'Criar conta';
  document.getElementById('nomeInput')?.style && (document.getElementById('nomeInput').style.display=modoLogin?'none':'block');
  document.getElementById('senha2Input')?.style && (document.getElementById('senha2Input').style.display=modoLogin?'none':'block');
  if(document.getElementById('btnLogin')) document.getElementById('btnLogin').textContent=modoLogin?'Entrar':'Cadastrar';
  if(document.getElementById('btnCadastro')) document.getElementById('btnCadastro').textContent=modoLogin?'Criar conta':'Já tenho conta';
  document.getElementById('avisoLgpd')?.style && (document.getElementById('avisoLgpd').style.display=modoLogin?'none':'block');
  document.getElementById('btnReset')?.style && (document.getElementById('btnReset').style.display=modoLogin?'block':'none');

};

function getAnonId() {
  let id = localStorage.getItem('anon_id');
  if (!id) {
    id = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    localStorage.setItem('anon_id', id);
  }
  return id;
}
window.abrirLoginModal = function(motivo) {
  if(!modoLogin) window.toggleCadastro();
  const ls = document.getElementById('loginScreen');
  if (ls) {
    ls.removeAttribute('style');
    ls.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;flex-direction:column;align-items:center;justify-content:center;background:var(--marrom-escuro,#1C0A03)';
  }
  const _faixaId = 'loginMotivoBanner';
  const _faixaExist = document.getElementById(_faixaId);
  if(_faixaExist) _faixaExist.remove();
  const _faixa = document.createElement('div');
  _faixa.id = _faixaId;
  _faixa.style.cssText = `
    position:fixed;top:0;left:0;right:0;z-index:10000;
    background:var(--laranja);color:white;
    padding:12px 20px;text-align:center;
    font-family:'Nunito',sans-serif;font-weight:800;font-size:0.85rem;
    display:flex;align-items:center;justify-content:center;gap:8px;
    animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1)
  `;
  _faixa.innerHTML = `
    <i class="ph-fill ph-beer-bottle"></i>
    Grátis e rápido — salve sua trilha e apareça no ranking!
  `;
  document.body.appendChild(_faixa);
  window._authJaProcessado = false;
  document.getElementById('headerDropdown')?.classList.remove('open');
  document.body.style.overflow = '';
};
function iniciarModoAnonimo() {
  usuarioAtual = { uid: getAnonId(), displayName: null, email: null, anonimo: true };
  window._authJaProcessado = true;
  clearTimeout(authTimeout);
  document.getElementById('loginScreen')?.style && (document.getElementById('loginScreen').style.display = 'none');
  document.getElementById('app')?.style && (document.getElementById('app').style.cssText = 'display:flex;flex-direction:column;');
  const splash = document.getElementById('splashApp');
  if (splash) { window._splashCompleto?.(); splash.style.opacity = '0'; setTimeout(() => splash.remove(), 500); }
  if(document.getElementById('headerNome')) document.getElementById('headerNome').textContent = '';
  const dropdown = document.getElementById('headerDropdown');
if (dropdown) {
  dropdown.innerHTML = `
    <button class="header-dropdown-item" onclick="window.abrirLoginModal()" 
      style="color:var(--laranja);font-weight:800">
      <i class="ph ph-user-plus"></i> Criar conta
    </button>`;
}
  visitas = {}; extras = []; favoritos = []; meusLikes = {};
  BARES = window.BARES_ESTATICO || [];
  carregarEstabelecimentos().then(() => renderDescobrir());
  const _convKey = 'conv_modal_visto_' + getAnonId();
if (!localStorage.getItem(_convKey)) {
  setTimeout(() => {
    if (usuarioAtual?.anonimo) {
      localStorage.setItem(_convKey, '1');
      const ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.innerHTML = `
        <div class="modal-box" style="text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px"><i class="ph-fill ph-beer-bottle"></i></div>
          <div class="modal-titulo">Salve sua Trilha!</div>
          <p class="modal-desc">Você já está explorando BH — mas seus dados somem se fechar o app.<br><br>
            Crie uma conta <strong>grátis em 30 segundos</strong> e ganhe:<br><br>
            <span style="font-size:0.85rem;line-height:2">
              🏆 Acesso ao ranking<br>
              🎖️ Emblemas e conquistas<br>
              ☁️ Dados salvos em qualquer device<br>
              👥 Grupo com amigos
            </span>
          </p>
          <button onclick="this.closest('.modal-overlay').remove();window.abrirLoginModal()"
            style="width:100%;padding:12px;border-radius:12px;background:var(--laranja);color:white;
                   border:none;font-size:0.9rem;font-weight:800;cursor:pointer;
                   font-family:'Nunito',sans-serif;margin-bottom:10px">
            <i class="ph ph-user-plus"></i> Criar conta grátis
          </button>
          <button onclick="this.closest('.modal-overlay').remove()"
            class="btn-cadastro">Continuar explorando</button>
        </div>`;
      document.body.appendChild(ov);
    }
  }, 5 * 60 * 1000);
}
  registrarAcesso('anonimo');
}
async function registrarAcesso(tipo, uid) {
  if (typeof db === 'undefined') return;
  try {
    const agora = Date.now();
    const hoje = new Date().toISOString().slice(0,10);
    if (tipo === 'anonimo') {
      const anonId = getAnonId();
      const ultimo = parseInt(localStorage.getItem('anon_ultimo_acesso') || '0');
      if (agora - ultimo < 60 * 60 * 1000) return; // 1x por hora
      localStorage.setItem('anon_ultimo_acesso', agora);
      await db.collection('analytics').doc('anonimos').collection('registros').add({
        anonId, ts: agora, dia: hoje, ua: navigator.userAgent.slice(0,100)
      });
    } else {
      const docRef = db.collection('analytics').doc('usuarios').collection('acessos').doc(uid);
      const snap = await docRef.get();
      if (!snap.exists) {
        await docRef.set({ uid, primeiroAcesso: agora, ultimoAcesso: agora, totalAcessos: 1 });
        await db.collection('users').doc(uid).set({ primeiroAcesso: agora }, { merge: true });
      } else {
        await docRef.update({ ultimoAcesso: agora, totalAcessos: (snap.data().totalAcessos || 0) + 1 });
      }
    }
  } catch(e) {}
}
window.abrirResetSenha=function(){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`
    <div class="modal-box">
      <div class="modal-titulo"><i class="ph-fill ph-beer-bottle"></i> Recuperar Acesso</div>
      <p class="modal-desc">Digite seu e-mail cadastrado e enviaremos um link para você criar uma nova senha.</p>
      <input class="input-field" id="resetEmail" type="email" placeholder="seu@email.com"/>
      <div id="resetMsg" style="font-size:0.78rem;min-height:18px;margin-bottom:12px;font-weight:700"></div>
      <button onclick="window.enviarResetSenha()" class="btn-login" style="margin-bottom:10px">📨 Enviar link</button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById('resetEmail')?.focus(),100);
};

window.enviarResetSenha=async function(){
  const email=document.getElementById('resetEmail')?.value.trim();
  const msg=document.getElementById('resetMsg');
  if(!email){msg.style.color='#cc0000';msg.textContent='Informe seu e-mail.';return;}
  try{
    await auth.sendPasswordResetEmail(email);
    document.querySelector('.modal-box').innerHTML=`
      <div style="font-size:3.5rem;margin-bottom:12px">📨</div>
      <div class="modal-titulo">E-mail enviado!</div>
      <p class="modal-desc">Enviamos um link de redefinição para<br><strong>${sanitizeHtml(email)}</strong><br><br>Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.</p>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-login">Entendi</button>`;
  }catch(e){
    const erros={
      'auth/user-not-found':'E-mail não encontrado.',
      'auth/invalid-email':'E-mail inválido.',
      'auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos.'
    };
    msg.style.color='#cc0000';
    msg.textContent=erros[e.code]||'Erro ao enviar. Tente novamente.';
  }
};
auth.onAuthStateChanged(async user=>{
  if(window._authJaProcessado&&user)return;
  if(!user){
    window._authJaProcessado=false;
    iniciarModoAnonimo();
  }
  window._authJaProcessado=true;
  clearTimeout(authTimeout);
  if(user){
    usuarioAtual=user;
    registrarAcesso('logado', user.uid);
    document.getElementById('loginScreen')?.style && (document.getElementById('loginScreen').style.display='none');
    document.getElementById('loginMotivoBanner')?.remove();
   const userDoc=await db.collection('users').doc(user.uid).get();
const info=userDoc.data()||{};
const adminDoc = await db.collection('admins').doc(user.uid).get();
const isAdmin = adminDoc.exists && adminDoc.data()?.admin === true;
window._isAdmin = isAdmin;

if (isAdmin) {
  document.getElementById('btnAdmin')?.style && (document.getElementById('btnAdmin').style.display = 'block');
  const elNome = document.getElementById('headerNome');
if (elNome) elNome.style.color = '#FFD700';
}
const isMod = info.role === 'moderador' || info.tagRole === 'Moderador';
window._isModerador = isMod;
if (isMod && !isAdmin) {
  const dd = document.getElementById('headerDropdown');
  const btnMod = document.createElement('button');
  btnMod.className = 'header-dropdown-item';
  btnMod.style.cssText = 'background:#E8F5E9;color:#2D6E4E';
  btnMod.innerHTML = '<i class="ph-fill ph-shield"></i> Moderador';
  btnMod.onclick = () => window.abrirPainelModerador();
  dd.insertBefore(btnMod, dd.firstChild);
}
if(userDoc.exists&&userDoc.data()?.banido){
      await auth.signOut();
      if(document.getElementById('loginMsg')) document.getElementById('loginMsg').textContent='<i class="ph-fill ph-x-circle"></i> Conta suspensa. Entre em contato com o administrador.';
      return;
    }
    const appEl = document.getElementById('app');
appEl.style.cssText = 'display:flex;flex-direction:column;';
    const splash=document.getElementById('splashApp');
if(splash){window._splashCompleto?.();splash.style.opacity='0';setTimeout(()=>splash.remove(),500);}
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
if(!isIOS && 'Notification' in window && Notification.permission !== 'denied'){
  try {
    const messaging = firebase.messaging();
    messaging.getToken({ vapidKey: 'BOUUnnaFfoLKuyUPwKE24OxhTLjIiGnqI9s-AsxVlIIUVz1LhfTJeleLCtAKyGx09UZbA_lO17TbQI5nIpLorUo'}).then(token => {
      if(token) db.collection('users').doc(user.uid).set({ pushToken: token }, { merge: true });
    }).catch(() => {});
  } catch(e) {}
}
    if(document.getElementById('headerNome')) document.getElementById('headerNome').textContent=user.displayName||user.email.split('@')[0];
    const _avatarSalvo = localStorage.getItem('avatar_' + user.uid) || 'ph-beer-bottle';
    const _ha = document.getElementById('headerAvatar');
    if (_ha) {
      if (_avatarSalvo.startsWith('https://') || _avatarSalvo.startsWith('data:')) {
        _ha.innerHTML = '<img src="' + _avatarSalvo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block"/>';
      } else {
        _ha.innerHTML = '<i class="ph-fill ' + _avatarSalvo + '" style="font-size:0.9rem;color:white"></i>';
      }
    }
    // Fechar dropdown do header ao clicar fora
    document.addEventListener('click', function(e) {
      const dd = document.getElementById('headerDropdown');
      const btn = document.getElementById('headerUserBtn');
      if (dd && !dd.contains(e.target) && btn && !btn.contains(e.target)) {
        dd.classList.remove('open');
      }
    });
    const likesKey='likes_'+user.uid;
    try{meusLikes=JSON.parse(localStorage.getItem(likesKey)||'{}');}catch(e){meusLikes={};}
    try{favoritos=JSON.parse(localStorage.getItem('favoritos_'+user.uid)||'[]');}catch(e){favoritos=[];}
    


   const tutKey='tutorial_trilhabh_v1_'+user.uid;
    if(!localStorage.getItem(tutKey)){
      try{localStorage.setItem(tutKey,'1');}catch(e){}
const SLIDES=[
  {icon:'<i class="ph ph-compass"></i>',title:'Bem-vindo ao Trilha BH!',desc:'Um tour gastronômico colaborativo por Belo Horizonte. Tutorial rápido antes de começar.',items:[]},
  {icon:'<i class="ph ph-compass"></i>',title:'Descobrir',desc:'Sua tela principal. Explore bares por região sem precisar digitar nada.',items:['Filtra por região da cidade','Vê o prato de cada bar antes de abrir','Toca em marcar visita para avaliar','Os não visitados aparecem primeiro']},
  {icon:'<i class="ph ph-map-pin"></i>',title:'Mapa',desc:'Todos os bares ordenados por distância da sua localização.',items:['Lista ordenada por distância','Mapa com todos os bares — verde visitado, laranja não visitado','Vê quais amigos do grupo já foram em cada bar','Sua localização atualiza enquanto o mapa está aberto']},
  {icon:'📰',title:'Feed',desc:'O que a galera está descobrindo pelos botecos de BH.',items:['Reage com <i class="ph-fill ph-beer-bottle"></i> <i class="ph-fill ph-fire"></i> 😍 🤢 nos posts','Vê as fotos das visitas','Filtra entre feed geral ou só do seu grupo','Comenta e denuncia se precisar']},
  {icon:'<i class="ph ph-map-trifold"></i>',title:'Roteiros',desc:'Organize a rota dos bares com seu grupo.',items:['Mapa interativo com a ordem dos bares do dia','Botão pra abrir a rota completa no Google Maps','Barra de progresso mostrando o quanto já visitaram','Sugere bares pro organizador aprovar']},
  {icon:'👤',title:'Perfil',desc:'Seu cantinho no app.',items:['Toca na foto para trocar o avatar ou enviar uma foto sua','Stats com gastos e mapa de regiões de BH','Emblemas pra colecionar por visitas e regiões','Grupo — gerencie e veja estatísticas','Sugere um bar desconhecido pelo botão no perfil']},
];
      let atual=0;
      const ov=document.createElement('div');
      ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
      function renderSlide(){
        const s=SLIDES[atual];
        const progresso=SLIDES.map((_,i)=>`<div style="height:4px;flex:1;border-radius:4px;background:${i<=atual?'#E8650A':'#e0d0c0'}"></div>`).join('');
        ov.innerHTML=`
          <div style="background:white;border-radius:20px;padding:28px 24px;width:100%;max-width:380px;font-family:'Nunito',sans-serif">
            <div style="display:flex;gap:5px;margin-bottom:20px">${progresso}</div>
            <div style="font-size:2.5rem;margin-bottom:12px;text-align:center">${s.icon}</div>
            <div style="font-family:'Bebas Neue',cursive;font-size:1.5rem;color:#5C2E00;letter-spacing:1px;margin-bottom:8px;text-align:center">${s.title}</div>
            <div style="font-size:0.85rem;color:#6B6B6B;margin-bottom:${s.items.length?'16px':'0'};text-align:center;line-height:1.6">${s.desc}</div>
            ${s.items.map(item=>`<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px"><span style="color:#E8650A;font-size:1rem;flex-shrink:0">✓</span><span style="font-size:0.82rem;color:#444;line-height:1.5">${item}</span></div>`).join('')}
            <div style="display:flex;gap:10px;margin-top:20px">
              ${atual>0?`<button onclick="window._tutNav(-1)" style="flex:1;padding:10px;border-radius:10px;border:2px solid #e0d0c0;background:transparent;color:#6B6B6B;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Voltar</button>`:''}
              <button onclick="window._tutNav(1)" style="flex:2;padding:10px;border-radius:10px;border:none;background:#E8650A;color:white;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">${atual===SLIDES.length-1?'Começar! <i class="ph-fill ph-beer-bottle"></i>':'Próximo'}</button>
            </div>
            <div style="text-align:center;margin-top:12px">
              <button onclick="document.body.removeChild(document.getElementById('tutorialOverlay'))" style="background:none;border:none;color:#bbb;font-size:0.75rem;cursor:pointer;font-family:'Nunito',sans-serif">Pular tutorial</button>
            </div>
          </div>`;
        ov.id='tutorialOverlay';
      }
      window._tutNav=function(dir){
        atual+=dir;
        if(atual>=SLIDES.length){document.body.removeChild(ov);return;}
        if(atual<0)atual=0;
        renderSlide();
      };
      renderSlide();
      document.body.appendChild(ov);
    }

const novKey='novidades_trilhabh_v1_'+user.uid;
if(localStorage.getItem(tutKey)&&!localStorage.getItem(novKey)){
  localStorage.setItem(novKey,'1');
  const NOVIDADES=[
  {icon:'<i class="ph ph-compass"></i>',title:'Trilha BH chegou!',desc:'O app ganhou uma identidade nova. Agora é o Trilha BH — tour gastronômico colaborativo de Belo Horizonte.'},
  {icon:'<i class="ph ph-map-trifold"></i>',title:'Nova aba Descobrir',desc:'Sua tela principal agora é o Descobrir. Bares por região, com prato e descrição visíveis sem precisar abrir o card.'},
  {icon:'<i class="ph ph-plus"></i>',title:'Sugira um bar',desc:'Conhece um boteco escondido que ninguém conhece? Vai em Perfil e toca em sugerir um bar desconhecido. Passa por aprovação antes de entrar no mapa.'},
  {icon:'<i class="ph ph-map-pin"></i>',title:'Mapa mais completo',desc:'A aba Próximos virou Mapa. Lista por distância e mapa visual, tudo no mesmo lugar.'},
];
  let novAtual=0;
  const ovNov=document.createElement('div');
  ovNov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  function renderNovidade(){
    const n=NOVIDADES[novAtual];
    const progresso=NOVIDADES.map((_,i)=>`<div style="height:4px;flex:1;border-radius:4px;background:${i<=novAtual?'#E8650A':'#e0d0c0'}"></div>`).join('');
    ovNov.innerHTML=`
      <div style="background:white;border-radius:20px;padding:28px 24px;width:100%;max-width:380px;font-family:'Nunito',sans-serif">
        <div style="display:flex;gap:5px;margin-bottom:20px">${progresso}</div>
        <div style="font-size:0.72rem;font-weight:700;color:var(--laranja);letter-spacing:2px;margin-bottom:8px;text-transform:uppercase">🆕 Novidades · ${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'short',year:'numeric'})}</div>
        <div style="font-size:2.5rem;margin-bottom:12px;text-align:center">${n.icon}</div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.5rem;color:#5C2E00;letter-spacing:1px;margin-bottom:12px;text-align:center">${n.title}</div>
        <div style="font-size:0.85rem;color:#6B6B6B;text-align:center;line-height:1.7;margin-bottom:24px">${n.desc}</div>
        <div style="display:flex;gap:10px;margin-top:4px">
          ${novAtual>0?`<button onclick="window._novNav(-1)" style="flex:1;padding:10px;border-radius:10px;border:2px solid #e0d0c0;background:transparent;color:#6B6B6B;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">Voltar</button>`:''}
          <button onclick="window._novNav(1)" style="flex:2;padding:10px;border-radius:10px;border:none;background:#E8650A;color:white;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">${novAtual===NOVIDADES.length-1?'<i class="ph-fill ph-beer-bottle"></i> Bora explorar!':'Próximo'}</button>
        </div>
        <div style="text-align:center;margin-top:12px">
          <button onclick="document.getElementById('novidadesOverlay').remove()" style="background:none;border:none;color:#bbb;font-size:0.75rem;cursor:pointer;font-family:'Nunito',sans-serif">Pular</button>
        </div>
      </div>`;
    ovNov.id='novidadesOverlay';
  }
  window._novNav=function(dir){
    novAtual+=dir;
    if(novAtual>=NOVIDADES.length){ovNov.remove();return;}
    if(novAtual<0)novAtual=0;
    renderNovidade();
  };
  renderNovidade();
  setTimeout(()=>document.body.appendChild(ovNov),4000);
}
    
     carregarDados().then(()=>{
  if(!BARES.length) BARES.push(...(window.BARES_ESTATICO||[]));
  renderDescobrir();
  setTimeout(() => window.mostrarResumoSemanal?.(), 2500);
});
}
});
 let _unsubVisitas = null;
let _unsubFeed = null;

function _ligarListeners() {
  if(_unsubVisitas) return;

 let _visitasCarregado = false;

_unsubVisitas = db.collection('users').doc(usuarioAtual.uid).collection('visits')
  .onSnapshot({ includeMetadataChanges: false }, snap => {
    // Ignora dados vindos do cache do Firestore
    if (snap.metadata.fromCache) return;

    const novasVisitas = {};
    snap.forEach(doc => { novasVisitas[doc.id] = doc.data(); });

    // Primeiro disparo — só carrega, não re-renderiza
    if (!_visitasCarregado) {
      _visitasCarregado = true;
      visitas = novasVisitas;
      salvarCache('visitas_' + usuarioAtual.uid, visitas);
      return;
    }

    // Verifica se mudou de verdade
    const novoHash = Object.keys(novasVisitas).sort().map(k =>
      k + (novasVisitas[k].nota||'') + (novasVisitas[k].ts||'')
    ).join('|');
    if (novoHash === window._visitasHash) return;
    window._visitasHash = novoHash;

    visitas = novasVisitas;
    salvarCache('visitas_' + usuarioAtual.uid, visitas);

    // Atualiza badge
    const totalBares = (window.BARES_ESTATICO||BARES).length || 127;
    const pct = Math.round((Object.keys(visitas).length / totalBares) * 100);
    const hp = document.getElementById('headerProgresso');
    const hpct = document.getElementById('headerPct');
    if(hp && hpct && pct > 0){ hp.style.display='block'; hpct.textContent=pct+'%'; }

    // Re-renderiza com debounce longo
    clearTimeout(window._renderDebounce);
    window._renderDebounce = setTimeout(() => {
      const pAtiva = document.querySelector('.page.active')?.id;
      if(pAtiva === 'page-descobrir') _atualizarEstadoCards();
      if(pAtiva === 'page-perfil')    renderPerfil();
      if(pAtiva === 'page-mapa')      renderProximos();
    }, 1000);
  });
}
async function carregarDados(){
  if(!usuarioAtual)return;
  await carregarEstabelecimentos();
  const apkKey='apk_notif_visto_'+usuarioAtual.uid;
if(!localStorage.getItem(apkKey)){
  localStorage.setItem(apkKey,'1');
  enqueueModal(fechar=>{
    const ov=document.createElement('div');
    ov.className='modal-overlay';
    ov.innerHTML=`
      <div class="modal-box" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:8px"><i class="ph ph-device-mobile"></i></div>
        <div class="modal-titulo">App disponível!</div>
        <p class="modal-desc">
          O <strong>Trilha BH</strong> agora tem app para celular!<br><br>
          <span style="font-size:1.1rem">🤖 Android</span><br>
          <span style="font-size:0.82rem;color:var(--cinza)">Baixe o APK e instale direto no seu celular</span><br><br>
          <span style="font-size:1.1rem">🍎 iPhone</span><br>
          <span style="font-size:0.82rem;color:var(--cinza)">Em breve! Por enquanto use pelo Safari e adicione na tela inicial para ter a mesma experiência</span>
        </p>
        <a href="https://drive.google.com/uc?export=download&id=1ppb02DErANcIEPVOFP1zT5DOHexak8Kp" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:12px;background:#3DDC84;color:white;font-size:0.88rem;font-weight:800;text-decoration:none;font-family:'Nunito',sans-serif;margin-bottom:10px;box-sizing:border-box">
          <i class="ph ph-device-mobile"></i> Baixar para Android
        </a>
        <a href="https://wa.me/5531988924409?text=Quero%20instalar%20o%20Trilha%20BH%20no%20iPhone!" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:12px;background:#25D366;color:white;font-size:0.88rem;font-weight:800;text-decoration:none;font-family:'Nunito',sans-serif;margin-bottom:10px;box-sizing:border-box">
          <i class="ph ph-device-mobile"></i> Avisar quando sair pro iPhone
        </a>
        <button onclick="modalFechou(this.closest('.modal-overlay'))" class="btn-cadastro">Fechar</button>
      </div>`;
    document.body.appendChild(ov);
  },3000);
}
const isIphone=/iPhone|iPad|iPod/i.test(navigator.userAgent);
const iosPwaKey='ios_pwa_visto_'+usuarioAtual.uid;
const isStandalone=window.navigator.standalone;
if(isIphone&&!isStandalone&&!localStorage.getItem(iosPwaKey)){
  localStorage.setItem(iosPwaKey,'1');
  enqueueModal(fechar=>{
    const ov=document.createElement('div');
    ov.className='modal-overlay';
    ov.innerHTML=`
      <div class="modal-box" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:8px">🍎</div>
        <div class="modal-titulo">Instale no iPhone!</div>
        <p class="modal-desc" style="line-height:1.8">
          Adicione o app na sua tela inicial para usar sem barra do navegador:<br><br>
          1. Toque em <strong>⎙ Compartilhar</strong> no Safari<br>
          2. Toque em <strong>Adicionar à Tela de Início</strong><br>
          3. Toque em <strong>Adicionar</strong><br><br>
          <span style="font-size:0.78rem;color:var(--cinza)">Só funciona pelo Safari — não pelo Chrome</span>
        </p>
        <button onclick="modalFechou(this.closest('.modal-overlay'))" class="btn-login">Entendi!</button>
      </div>`;
    document.body.appendChild(ov);
  },3500);
}
  const cachedExtras = lerCache('extras_' + usuarioAtual.uid);
if(cachedExtras){ extras = cachedExtras; if(typeof renderExtras==='function') renderExtras(); }
else {
  const snapE = await db.collection('users').doc(usuarioAtual.uid).collection('extras').get();
  extras = []; snapE.forEach(doc => { extras.push({id:doc.id,...doc.data()}); });
  salvarCache('extras_' + usuarioAtual.uid, extras);
}
  await renderBaresComDados();
  await carregarGrupo();
  window.atualizarCacheGlobal();
   setInterval(verificarNovasVisitasGrupo, 5*60*1000);
  verificarNovasVisitasGrupo();
function _desligarListeners() {
  _unsubVisitas?.(); _unsubVisitas = null;
  _unsubFeed?.();    _unsubFeed = null;
}

document.addEventListener('visibilitychange', () => {
  if(document.hidden) _desligarListeners();
  else _ligarListeners();
});

_ligarListeners();
setTimeout(() => { window._listenerPronto = true; }, 2000);
}

async function buscarDadosFirebase(){
  const [snap,snapE]=await Promise.all([
    db.collection('users').doc(usuarioAtual.uid).collection('visits').get(),
    db.collection('users').doc(usuarioAtual.uid).collection('extras').get()
  ]);
  visitas={};snap.forEach(doc=>{visitas[doc.id]=doc.data();});
  salvarCache('visitas_'+usuarioAtual.uid,visitas);
  extras=[];snapE.forEach(doc=>{extras.push({id:doc.id,...doc.data()});});
  salvarCache('extras_'+usuarioAtual.uid,extras);
  renderBares();renderExtras();
  const totalBares=(window.BARES_ESTATICO||BARES).length||127;
const pctGeral=Math.round((Object.keys(visitas).length/totalBares)*100);
const hp=document.getElementById('headerProgresso');
const hpct=document.getElementById('headerPct');
if(hp&&hpct&&pctGeral>0){hp.style.display='block';hpct.textContent=pctGeral+'%';}
const faltamB=(window.BARES_ESTATICO||BARES).filter(b=>!visitas[b.id]).length;
const nb=document.getElementById('navBadgeDescobrir');
if(nb&&faltamB>0){nb.textContent=faltamB;nb.style.display='block';}
}
async function carregarEstabelecimentos(){
  const chave='estab_cdb_2026_v1';
  const cached=lerCache(chave);
  if(cached&&cached.length){BARES=cached;return;}
  try{
    const snap=await db.collection('estabelecimentos')
      .where('tipo','array-contains','trilha-bh')
      .where('aprovado','==',true)
      .get();
    if(snap.docs.length>0){
      BARES=snap.docs.map(d=>d.data());
      salvarCache(chave,BARES);
    }else{
      BARES=window.BARES_ESTATICO||[];
    }
  }catch(e){
    BARES=window.BARES_ESTATICO||[];
  }
}
async function atualizarDadosBackground(){setTimeout(async()=>{await buscarDadosFirebase();},2000);}