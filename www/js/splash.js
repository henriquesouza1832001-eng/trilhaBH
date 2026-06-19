document.addEventListener('DOMContentLoaded', function () {

  const elCena  = document.getElementById('splashCena');
  const elFrase = document.getElementById('splashFrase');
  const elBarra = document.getElementById('splashBarra');
  if (!elCena || !elFrase || !elBarra) return;

  // Keyframes de fade
  if (!document.getElementById('_splashStyle')) {
    const s = document.createElement('style');
    s.id = '_splashStyle';
    s.textContent = `
      @keyframes splashFloat  { from{transform:translateY(0);opacity:.3} to{transform:translateY(-24px);opacity:.8} }
      @keyframes splashFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes splashFadeOut{ from{opacity:1} to{opacity:0} }
      @keyframes splashFrase  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    `;
    document.head.appendChild(s);
  }

  // Partículas de fundo
  const partDiv = document.getElementById('splashParticulas');
  if (partDiv) {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      const sz = 3 + Math.random() * 5;
      p.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;
        background:rgba(232,101,10,${.12+Math.random()*.2});
        left:${Math.random()*100}%;top:${Math.random()*100}%;
        animation:splashFloat ${4+Math.random()*5}s ease-in-out ${Math.random()*3}s infinite alternate`;
      partDiv.appendChild(p);
    }
  }

  // ── Utilitários Canvas ─────────────────────────────────────────
  function criarCanvas() {
    const c = document.createElement('canvas');
    c.width  = 220;
    c.height = 180;
    c.style.cssText = 'width:220px;height:180px;display:block;margin:0 auto';
    return c;
  }

  // Cores base
  const COR  = { laranja:'#E8650A', marrom:'#5C2E00', creme:'#F5A623', branco:'rgba(255,255,255,', cinza:'#888' };

  // ── CENA 1: Cerveja enchendo ───────────────────────────────────
  function cenaVerveja() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,220,180);
      const prog = Math.min(t/120, 1); // 0→1 em 2s
      // copo (trapézio)
      ctx.beginPath(); ctx.moveTo(65,35); ctx.lineTo(75,150); ctx.lineTo(145,150); ctx.lineTo(155,35);
      ctx.strokeStyle = COR.laranja; ctx.lineWidth = 3; ctx.stroke();
      // alça
      ctx.beginPath(); ctx.arc(162,95,22,Math.PI*.35,Math.PI*.65,false);
      ctx.strokeStyle = COR.laranja; ctx.lineWidth=3; ctx.stroke();
      // clip region para cerveja
      ctx.save();
      ctx.beginPath(); ctx.moveTo(67,37); ctx.lineTo(76,148); ctx.lineTo(144,148); ctx.lineTo(153,37); ctx.closePath();
      ctx.clip();
      // cerveja
      const cervejaY = 148 - (111 * prog);
      ctx.fillStyle = `rgba(245,166,35,${.85+Math.sin(t*.08)*.05})`;
      ctx.fillRect(67, cervejaY, 86, 148-cervejaY);
      // bolhas
      if (prog > 0.3) {
        [[-12,20],[5,35],[18,15],[-5,48],[12,60]].forEach(([dx,dy],i)=>{
          const by = cervejaY + dy + Math.sin(t*.06+i)*4;
          if(by < 148) {
            ctx.beginPath(); ctx.arc(110+dx, by, 2.5, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,255,255,${.3+Math.sin(t*.1+i)*.15})`; ctx.fill();
          }
        });
      }
      // espuma
      if (prog > 0.85) {
        const espAlpha = (prog-.85)/.15;
        const ondas = Math.sin(t*.05)*3;
        ctx.beginPath(); ctx.ellipse(110, cervejaY, 40+ondas, 10, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${espAlpha*.9})`; ctx.fill();
        ctx.beginPath(); ctx.ellipse(95, cervejaY-3, 12, 7, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${espAlpha*.7})`; ctx.fill();
        ctx.beginPath(); ctx.ellipse(125, cervejaY-2, 10, 6, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${espAlpha*.6})`; ctx.fill();
      }
      ctx.restore();
      // label
      ctx.fillStyle = COR.laranja; ctx.font = 'bold 11px Bebas Neue, cursive';
      ctx.textAlign = 'center'; ctx.letterSpacing = '2px';
      ctx.fillText('LAGOINHA', 110, 170);
      t++; if(t > 9999) t = 120;
      c._raf = requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── CENA 2: Engarrafamento ─────────────────────────────────────
  function cenaTransito() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    function desenhaCarro(x, y, cor, w=48, h=26) {
      // carroceria
      ctx.fillStyle = cor; ctx.beginPath();
      ctx.roundRect(x, y, w, h, 5); ctx.fill();
      // teto
      ctx.fillStyle = shadeColor(cor, -20);
      ctx.beginPath(); ctx.roundRect(x+4, y-14, w-10, 16, 4); ctx.fill();
      // janelas
      ctx.fillStyle = 'rgba(135,206,235,.65)';
      ctx.beginPath(); ctx.roundRect(x+6, y-12, 13, 10, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x+22, y-12, 13, 10, 2); ctx.fill();
      // rodas
      [[6,h],[w-6,h]].forEach(([rx,ry])=>{
        ctx.beginPath(); ctx.arc(x+rx, y+ry, 7, 0, Math.PI*2);
        ctx.fillStyle = '#1a1a1a'; ctx.fill();
        ctx.beginPath(); ctx.arc(x+rx, y+ry, 3.5, 0, Math.PI*2);
        ctx.fillStyle = '#555'; ctx.fill();
      });
    }
    function shadeColor(hex, pct) {
      const n = parseInt(hex.slice(1),16);
      const r = Math.min(255,Math.max(0,((n>>16)&0xff)+pct));
      const g = Math.min(255,Math.max(0,((n>>8)&0xff)+pct));
      const b = Math.min(255,Math.max(0,(n&0xff)+pct));
      return `rgb(${r},${g},${b})`;
    }
    function draw() {
      ctx.clearRect(0,0,220,180);
      // asfalto
      ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.roundRect(0,108,220,42,4); ctx.fill();
      // faixas
      ctx.fillStyle = 'rgba(245,166,35,.6)';
      [18,68,118,168].forEach(x=>{ ctx.beginPath(); ctx.roundRect(x,126,26,5,2); ctx.fill(); });
      // carro laranja (oscila)
      const ox = Math.sin(t*.04)*3;
      desenhaCarro(30+ox, 84, '#E8650A');
      // farol traseiro vermelho
      ctx.fillStyle = `rgba(255,50,50,${.7+Math.sin(t*.15)*.3})`;
      ctx.beginPath(); ctx.roundRect(30+ox, 90, 5, 8, 1); ctx.fill();
      // carro cinza
      desenhaCarro(96, 85, '#888', 46, 25);
      // carro marrom
      desenhaCarro(156, 86, '#5C3A1E', 44, 24);
      // semáforo
      ctx.fillStyle='#555'; ctx.beginPath(); ctx.roundRect(6,48,6,65,2); ctx.fill();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.roundRect(2,44,14,32,3); ctx.fill();
      const semAlpha = Math.sin(t*.08)>.2?1:.3;
      ctx.beginPath(); ctx.arc(9,52,4.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,60,60,${semAlpha})`; ctx.fill();
      ctx.beginPath(); ctx.arc(9,63,4.5,0,Math.PI*2); ctx.fillStyle='#555'; ctx.fill();
      ctx.beginPath(); ctx.arc(9,74,4.5,0,Math.PI*2); ctx.fillStyle='#555'; ctx.fill();
      // label
      ctx.fillStyle=COR.laranja; ctx.font='bold 11px Bebas Neue,cursive';
      ctx.textAlign='center'; ctx.fillText('AFONSO PENA',110,170);
      t++; c._raf = requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── CENA 3: Torresmo fritando ──────────────────────────────────
  function cenaTorresmo() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,220,180);
      // frigideira
      ctx.fillStyle='#3A2800'; ctx.beginPath(); ctx.ellipse(110,142,72,13,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5C3A1E'; ctx.beginPath(); ctx.roundRect(38,126,144,18,6); ctx.fill();
      // cabo
      ctx.fillStyle='#3A2800'; ctx.beginPath(); ctx.roundRect(170,129,46,10,5); ctx.fill();
      // gordura fervendo
      ctx.fillStyle=`rgba(200,127,0,.${65+Math.floor(Math.sin(t*.1)*10)})`;
      ctx.beginPath(); ctx.ellipse(110,130,62,7,0,0,Math.PI*2); ctx.fill();
      // bolhas de gordura
      [[80,128,3],[110,124,4],[140,128,3],[93,132,2],[126,131,2.5]].forEach(([x,y,r],i)=>{
        const by = y + Math.sin(t*.08+i)*3;
        ctx.beginPath(); ctx.arc(x, by, r, 0, Math.PI*2);
        ctx.fillStyle=`rgba(255,200,100,${.5+Math.sin(t*.1+i)*.2})`; ctx.fill();
      });
      // torresmo com balanço
      ctx.save();
      ctx.translate(110,95);
      ctx.rotate(Math.sin(t*.04)*.06);
      ctx.fillStyle='#8B4513';
      ctx.beginPath(); ctx.ellipse(0,0,36,32,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#A0522D';
      ctx.beginPath(); ctx.ellipse(0,-3,30,26,0,0,Math.PI*2); ctx.fill();
      // textura
      ctx.strokeStyle='#6B3410'; ctx.lineWidth=1.5; ctx.lineCap='round';
      [[-15,-8,15,-8],[-18,4,16,4],[-10,15,12,15]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(0,y1-5,x2,y2-(y2-y1)); ctx.stroke();
      });
      ctx.restore();
      // vapor
      [[100,118,0],[115,114,.5],[128,118,1]].forEach(([x,y,delay],i)=>{
        const vt = (t*.02+delay)%1;
        ctx.strokeStyle=`rgba(255,255,255,${Math.sin(vt*Math.PI)*.4})`;
        ctx.lineWidth=2.5; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(x, y-vt*30);
        ctx.quadraticCurveTo(x+Math.sin(vt*6)*6, y-vt*20, x+Math.sin(vt*4)*4, y-vt*30);
        ctx.stroke();
      });
      ctx.fillStyle=COR.laranja; ctx.font='bold 11px Bebas Neue,cursive';
      ctx.textAlign='center'; ctx.fillText('PETISCO DE BH',110,172);
      t++; c._raf=requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── CENA 4: Pão de queijo ──────────────────────────────────────
  function cenaPaoQueijo() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,220,180);
      // forno
      ctx.fillStyle='#5C3A1E'; ctx.beginPath(); ctx.roundRect(28,88,164,72,10); ctx.fill();
      ctx.fillStyle='#3A1800'; ctx.beginPath(); ctx.roundRect(36,96,148,56,8); ctx.fill();
      ctx.fillStyle='#1A0800'; ctx.beginPath(); ctx.roundRect(48,100,124,48,6); ctx.fill();
      // brilho interno (pulsa)
      const glow = .06+Math.sin(t*.08)*.04;
      ctx.fillStyle=`rgba(232,101,10,${glow})`;
      ctx.beginPath(); ctx.roundRect(48,100,124,48,6); ctx.fill();
      // resistência do forno
      ctx.strokeStyle=`rgba(255,100,0,${.4+Math.sin(t*.06)*.3})`;
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(54,140); ctx.lineTo(166,140); ctx.stroke();
      // 3 pães de queijo
      [[78,126,0],[114,128,.4],[152,126,.8]].forEach(([x,y,delay],i)=>{
        const incha = Math.sin(t*.06+delay)*2.5;
        const rx = 18+incha*.5, ry = 13+incha*.4;
        // sombra
        ctx.fillStyle='rgba(0,0,0,.25)';
        ctx.beginPath(); ctx.ellipse(x+2,y+3,rx,ry*.6,0,0,Math.PI*2); ctx.fill();
        // corpo
        ctx.fillStyle='#D4A017';
        ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#E8B820';
        ctx.beginPath(); ctx.ellipse(x,y-2,rx*.9,ry*.85,0,0,Math.PI*2); ctx.fill();
        // rachadura típica
        ctx.strokeStyle='rgba(180,130,0,.5)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(x-rx*.5,y-2); ctx.quadraticCurveTo(x,y-ry*.8,x+rx*.5,y-2); ctx.stroke();
      });
      // maçaneta
      ctx.fillStyle='#888'; ctx.beginPath(); ctx.roundRect(92,138,36,7,3); ctx.fill();
      // vapor
      [[74,88,.2],[110,85,.7],[146,88,1.2]].forEach(([x,y,delay])=>{
        const vt=((t*.018)+delay)%1;
        ctx.strokeStyle=`rgba(255,255,255,${Math.sin(vt*Math.PI)*.35})`;
        ctx.lineWidth=2.5; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(x,y-vt*26);
        ctx.quadraticCurveTo(x+Math.sin(vt*5)*5,y-vt*16,x,y-vt*26);
        ctx.stroke();
      });
      ctx.fillStyle=COR.laranja; ctx.font='bold 11px Bebas Neue,cursive';
      ctx.textAlign='center'; ctx.fillText('MINEIRIDADE',110,172);
      t++; c._raf=requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── CENA 5: Cafezinho ──────────────────────────────────────────
  function cenaCafe() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    // gotinhas caindo
    const gotas = [{x:105,y:50,delay:0},{x:116,y:50,delay:40},{x:109,y:50,delay:80}];
    function draw() {
      ctx.clearRect(0,0,220,180);
      // pires
      ctx.fillStyle='#6B4423'; ctx.beginPath(); ctx.ellipse(110,156,50,8,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5C3A1E'; ctx.beginPath(); ctx.ellipse(110,154,48,7,0,0,Math.PI*2); ctx.fill();
      // corpo da xícara (trapézio arredondado)
      ctx.fillStyle='#3A1800';
      ctx.beginPath(); ctx.moveTo(70,108); ctx.lineTo(80,154); ctx.lineTo(140,154); ctx.lineTo(150,108);
      ctx.quadraticCurveTo(150,104,110,102); ctx.quadraticCurveTo(70,104,70,108); ctx.fill();
      // café dentro
      ctx.fillStyle='#1A0800'; ctx.beginPath(); ctx.ellipse(110,110,36,9,0,0,Math.PI*2); ctx.fill();
      // reflexo
      ctx.fillStyle='rgba(255,255,255,.04)';
      ctx.save(); ctx.translate(100,109); ctx.rotate(-.15);
      ctx.beginPath(); ctx.ellipse(0,0,12,3,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      // alça
      ctx.strokeStyle='#5C3A1E'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(152,131,22,Math.PI*.3,Math.PI*.7); ctx.stroke();
      // colher
      ctx.strokeStyle='#CCC'; ctx.lineWidth=3; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(132,100); ctx.lineTo(120,150); ctx.stroke();
      ctx.fillStyle='#DDD'; ctx.save(); ctx.translate(132,98); ctx.rotate(-.35);
      ctx.beginPath(); ctx.ellipse(0,0,8,5,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      // gotas caindo
      gotas.forEach(g=>{
        const vt=((t+g.delay)*.022)%1;
        const gy=g.y+vt*52; const alpha=Math.sin(vt*Math.PI);
        ctx.fillStyle=`rgba(26,8,0,${alpha*.8})`;
        ctx.beginPath(); ctx.arc(g.x,gy,2.5+vt*1.5,0,Math.PI*2); ctx.fill();
      });
      // vapor
      [[88,105,.0],[108,102,.5],[124,105,1.0]].forEach(([x,y,delay])=>{
        const vt=((t*.02)+delay)%1;
        ctx.strokeStyle=`rgba(255,255,255,${Math.sin(vt*Math.PI)*.45})`;
        ctx.lineWidth=2.5; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(x,y-vt*28);
        ctx.quadraticCurveTo(x+Math.sin(vt*5)*7,y-vt*18,x+Math.cos(vt*3)*4,y-vt*28);
        ctx.stroke();
      });
      ctx.fillStyle=COR.laranja; ctx.font='bold 11px Bebas Neue,cursive';
      ctx.textAlign='center'; ctx.fillText('CAFÉ MINEIRO',110,175);
      t++; c._raf=requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── CENA 6: Placa de boteco ────────────────────────────────────
  function cenaBoteco() {
    const c = criarCanvas(); const ctx = c.getContext('2d');
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,220,180);
      // poste vertical
      ctx.fillStyle='#888'; ctx.beginPath(); ctx.roundRect(107,18,6,96,2); ctx.fill();
      // braço horizontal
      ctx.fillStyle='#888'; ctx.beginPath(); ctx.roundRect(107,18,60,6,2); ctx.fill();
      // correntes
      ctx.strokeStyle='#AAA'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(116,24); ctx.lineTo(74,50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(162,24); ctx.lineTo(150,50); ctx.stroke();
      // placa com pêndulo
      const angulo = Math.sin(t*.03)*.08;
      ctx.save();
      ctx.translate(112,24); ctx.rotate(angulo); ctx.translate(-112,-24);
      // sombra da placa
      ctx.fillStyle='rgba(0,0,0,.3)';
      ctx.beginPath(); ctx.roundRect(68,52,96,64,8); ctx.fill();
      // placa fundo
      ctx.fillStyle='#3D1F0F'; ctx.beginPath(); ctx.roundRect(64,48,96,64,8); ctx.fill();
      ctx.fillStyle='#5C2E00'; ctx.beginPath(); ctx.roundRect(67,51,90,58,6); ctx.fill();
      // borda pontilhada
      ctx.strokeStyle=COR.laranja; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.roundRect(70,54,84,52,5); ctx.stroke(); ctx.setLineDash([]);
      // estrela
      ctx.fillStyle='#F5A623'; ctx.font='11px sans-serif';
      ctx.textAlign='center'; ctx.fillText('★',112,70);
      // nome
      ctx.fillStyle=COR.laranja; ctx.font='bold 16px Bebas Neue,cursive';
      ctx.letterSpacing='2px'; ctx.fillText('TRILHA BH',112,88); ctx.letterSpacing='0px';
      // subtexto
      ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font='700 8px Nunito,sans-serif';
      ctx.fillText('TOUR GASTRONÔMICO',112,100);
      // garrafa
      ctx.font='13px sans-serif'; ctx.fillText('🍺',112,116);
      ctx.restore();
      // balcão
      ctx.fillStyle='#6B4423'; ctx.beginPath(); ctx.roundRect(18,142,184,6,3); ctx.fill();
      ctx.fillStyle='#5C3A1E'; ctx.beginPath(); ctx.roundRect(18,145,184,22,4); ctx.fill();
      // copos no balcão
      [[46,130],[164,128]].forEach(([x,y])=>{
        ctx.fillStyle='rgba(245,166,35,.65)';
        ctx.beginPath(); ctx.moveTo(x-10,y); ctx.lineTo(x-7,142); ctx.lineTo(x+7,142); ctx.lineTo(x+10,y); ctx.fill();
        ctx.fillStyle='rgba(245,200,66,.4)';
        ctx.beginPath(); ctx.ellipse(x,y,10,3,0,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle=COR.laranja; ctx.font='bold 11px Bebas Neue,cursive';
      ctx.textAlign='center'; ctx.fillText('BOTECO DE BH',110,172);
      t++; c._raf=requestAnimationFrame(draw);
    }
    draw(); return c;
  }

  // ── Engine de cenas ────────────────────────────────────────────
  const CENAS = [
    { fn: cenaVerveja,   frase: 'Enchendo o copo na Lagoinha...' },
    { fn: cenaTransito,  frase: 'Desviando do trânsito da Afonso Pena...' },
    { fn: cenaTorresmo,  frase: 'Fritando um torresmo crocante...' },
    { fn: cenaPaoQueijo, frase: 'Saindo o pão de queijo quentinho...' },
    { fn: cenaCafe,      frase: 'Preparando o cafezinho da hora...' },
    { fn: cenaBoteco,    frase: 'Encontrando o boteco perfeito...' },
  ];

  let cenaAtual = Math.floor(Math.random() * CENAS.length);
  let canvasAtivo = null;
  let progresso   = 0;

  function pararCanvas() {
    if (canvasAtivo?._raf) cancelAnimationFrame(canvasAtivo._raf);
    canvasAtivo = null;
  }

  function mostrarCena(idx, animar) {
    pararCanvas();
    const c = CENAS[idx];
    elFrase.textContent = c.frase;
    // fade out
    elCena.style.animation  = 'none';
    elFrase.style.animation = 'none';
    void elCena.offsetWidth;
    if (animar) {
      elCena.style.animation  = 'splashFadeIn .45s cubic-bezier(0.22,1,0.36,1) both';
      elFrase.style.animation = 'splashFrase .45s cubic-bezier(0.22,1,0.36,1) .12s both';
    }
    elCena.innerHTML = '';
    canvasAtivo = c.fn();
    elCena.appendChild(canvasAtivo);
  }

  function avancar() {
    // fade out rápido
    elCena.style.animation  = 'splashFadeOut .3s ease both';
    elFrase.style.animation = 'splashFadeOut .2s ease both';
    setTimeout(() => {
      cenaAtual = (cenaAtual + 1) % CENAS.length;
      mostrarCena(cenaAtual, true);
    }, 320);
  }

  mostrarCena(cenaAtual, true);
  const intervalo  = setInterval(avancar, 2800);

 const barraTimer = setInterval(() => {
    progresso = Math.min(progresso + Math.random() * 1.2 + 0.3, 88);
    elBarra.style.width = progresso + '%';
  }, 160);

  // Para tudo quando o splash sumir
  new MutationObserver((_, obs) => {
    if (!document.getElementById('splashApp')) {
      clearInterval(intervalo); clearInterval(barraTimer);
      pararCanvas(); obs.disconnect();
    }
  }).observe(document.body, { childList: true });

  // Chamado pelo auth.js quando login resolve
window._splashCompleto = function () {
    clearInterval(barraTimer);
    elBarra.style.transition = 'none';
    elBarra.style.width = progresso + '%';
    requestAnimationFrame(() => {
      elBarra.style.transition = 'width 0.6s ease';
      elBarra.style.width = '100%';
    });
  };
});