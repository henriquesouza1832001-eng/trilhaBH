const APP_VERSION = '1.0.1.7';
const _vKey = 'app_version';
if (localStorage.getItem(_vKey) !== APP_VERSION) {
  const keysParaManter = [
  'anon_id', 'modo_boemia', 'modo_boemia_manual',
  'boemia_ligar', 'boemia_desligar',
  'tutorial_trilhabh', 'novidades_trilhabh',
  'avatar_', 'tag_role_', 'emblemas_notif',
  'favoritos_', 'likes_'
];
Object.keys(localStorage)
  .filter(k => !keysParaManter.some(m => k.startsWith(m)))
  .forEach(k => localStorage.removeItem(k));
  localStorage.setItem(_vKey, APP_VERSION);
}
window.APP = {
  usuario: null, visitas: {}, extras: [], favoritos: [], gruposAtual: [],
  grupoAtual: null, grupoSelecionado: null, feedCache: null, rankingCache: null,
  posUsuario: null, vistaProximos: 'lista', feedFiltro: 'global', feedEventos: [],
  mapaLeaflet: null, mapasDia: {}, watchId: null, marcadorUsuario: null,
  historico: {}, notaDesc: {}, fotosVisita: {}, salvandoNota: null,
  cacheTimer: null, cacheGlobalTimer: null, dadosJaCarregados: false,
  regiaoDescobrir: 'TODOS', ordenacaoDescobrir: 'padrao', buscaDescobrir: '',
  abaPerfilAtiva: 'visitados', perfilAdminCache: null, commMap: {}, descMap: {},
  cacheVisitasGrupo: null, cacheVisitasGrupoTs: 0, cacheAmigos: {},
  cacheAmigosTs: {}, rankingAtivo: 0, vistaGlobal: true, paginaAnterior: null,
  modalQueue: [], modalAberto: false,
};

const REGIOES_COUNT = {
  SUL: 10, CENTRO: 7, LESTE: 16, NORDESTE: 9,
  NOROESTE: 17, NORTE: 39, OESTE: 30
};

const REACOES = ['<i class="ph-fill ph-beer-bottle"></i>', '<i class="ph-fill ph-fire"></i>', '<i class="ph-fill ph-heart"></i>', '<i class="ph ph-smiley-x-eyes"></i>'];

const CACHE_TTL         = 2 * 60 * 1000;
const VISITAS_GRUPO_TTL =  3 * 60 * 1000;
const AMIGOS_TTL        =  5 * 60 * 1000;
const FEED_TTL          = 30 * 1000;
const RANKING_TTL       =  5 * 60 * 1000;

const XP = { visita: 10, foto: 5, comentario: 3, evento: 15, streak: 20 };

const PALAVRAS_PROIBIDAS = [
  'fdp','filho da puta','filhodaputa','vai se foder','vsf',
  'vai tomar no cu','vtnc','arrombado','arrombada','cuzao','cuzão',
  'desgraça','desgraçado','babaca','otario','otária','otário',
  'imbecil','cretino','cretina','puta que pariu','viado','viadinho',
  'sapatão','vagabunda','vadia','piranha','rapariga','vou te matar',
  'retardado','retardada','mongoloide','fuck you','motherfucker',
  'son of a bitch','asshole','f*ck','fdp1','vtnc1','4rrombado',
];
const REGEXES_PROIBIDAS = PALAVRAS_PROIBIDAS.map(p=>new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'));

const EMBLEMAS_QUANTIDADE = [
  { min: 1,   icon: '<i class="ph-fill ph-beer-bottle"></i>', nome: 'Primeiro Gole',        cor:'#E8650A', fundo:'#3D1F0F', desc: 'Início da trilha. O primeiro bar nunca esquece.' },
  { min: 10,   icon: '<i class="ph-fill ph-cheese"></i>',      nome: 'Explorador de Estufa', cor:'#FFC107', fundo:'#FFF8E1', desc: 'Já sabe onde a cerveja vem trincando.' },
  { min: 20,  icon: '<i class="ph-fill ph-cooking-pot"></i>', nome: 'Torresmo na Mesa',     cor:'#4CAF50', fundo:'#E8F5E9', desc: 'Pegando experiência pelos botecos de BH.' },
  { min: 40,  icon: '<i class="ph-fill ph-fork-knife"></i>',  nome: 'Frango com Quiabo',    cor:'#2196F3', fundo:'#E3F2FD', desc: 'Raiz de respeito. Valoriza a tradição mineira.' },
  { min: 60,  icon: '<i class="ph-fill ph-bowl-food"></i>',   nome: 'Tutu Bem Servido',     cor:'#9C27B0', fundo:'#F3E5F5', desc: 'Veterano dos bares. Conhece os cantos da cidade.' },
  { min: 100,  icon: '<i class="ph ph-storefront"></i>',       nome: 'Clássico do Mercado',  cor:'#FF9800', fundo:'#FFF3E0', desc: 'Referência entre amigos. Sempre indica um bom buteco.' },
  { min: 125,  icon: '<i class="ph ph-buildings"></i>',        nome: 'Noite na Savassi',     cor:'#607D8B', fundo:'#CFD8DC', desc: 'Presença garantida nas mesas. Faz parte da cena boêmia.' },
  { min: 200, icon: '<i class="ph-fill ph-crown"></i>',       nome: 'Prefeito da Boemia',   cor:'#FFD700', fundo:'#FFF8E1', desc: 'Cem locais na conta. Você transita em todos.' },
  { min: 350, icon: '<i class="ph-fill ph-trophy"></i>',      nome: 'Lenda do Balcão',      cor:'#4CAF50', fundo:'#E8F5E9', desc: 'Os garçons de BH já te cumprimentam pelo nome.' },
  { min: 1000, icon: '<i class="ph ph-map-trifold"></i>',      nome: 'Patrimônio Histórico', cor:'#9C27B0', fundo:'#F3E5F5', desc: 'Se tem comida boa em BH, você já pisou lá.' },
];

const EMBLEMAS_REGIAO = [
  { regiao: 'SUL',      icon: '<i class="ph ph-mountains"></i>',          nome: 'Sentinela das Alturas',    cor:'#607D8B', fundo:'#CFD8DC', desc: 'SUL · Domina os bares entre ladeiras e mirantes.' },
  { regiao: 'CENTRO',   icon: '<i class="ph ph-traffic-signal"></i>',     nome: 'Sobrevivente da Sete',     cor:'#FF9800', fundo:'#FFF3E0', desc: 'CENTRO · Sabe onde tomar a melhor no coração da cidade.' },
  { regiao: 'LESTE',    icon: '<i class="ph ph-music-notes"></i>',        nome: 'Voz de Santa Tereza',      cor:'#2196F3', fundo:'#E3F2FD', desc: 'LESTE · Boêmio de essência, vive entre música e cerveja.' },
  { regiao: 'NORDESTE', icon: '<i class="ph-fill ph-beer-bottle"></i>',   nome: 'Filho da Esquina Antiga',  cor:'#E8650A', fundo:'#3D1F0F', desc: 'NORDESTE · Raiz. Botecos de bairro com tira-gosto farto.' },
  { regiao: 'NOROESTE', icon: '<i class="ph-fill ph-cooking-pot"></i>',   nome: 'Guardião do Tropeiro',     cor:'#4CAF50', fundo:'#E8F5E9', desc: 'NOROESTE · Tradição pura. Frequenta os bares clássicos.' },
  { regiao: 'NORTE',    icon: '<i class="ph ph-stadium"></i>',            nome: 'Estrategista da Pampulha', cor:'#FFC107', fundo:'#FFF8E1', desc: 'NORTE · Brinda com vista, domina os bares da Lagoa.' },
  { regiao: 'OESTE',    icon: '<i class="ph ph-arrow-fat-left"></i>',     nome: 'Guardião da Última Esquina', cor:'#9C27B0', fundo:'#F3E5F5', desc: 'OESTE · Botecos que não aparecem no mapa mas vivem cheios.' },
  { regiao: 'TODAS',    icon: '<i class="ph ph-compass"></i>',            nome: 'Mapeador de BH',           cor:'#9C27B0', fundo:'#F3E5F5', desc: 'Todas as regiões · Zerou o mapa. De ponta a ponta.' },
];

const RANKING_CONFIGS = [
  { id: 'visitados',  label: '<i class="ph-fill ph-trophy"></i> Visitados',            desc: 'Mais bares na conta' },
  { id: 'media',      label: '<i class="ph-fill ph-star"></i> Nota Média',             desc: 'Avaliadores mais ativos' },
  { id: 'km',         label: '<i class="ph ph-car"></i> Km Rodados',                  desc: 'Quem mais rodou' },
  { id: 'explorador', label: '<i class="ph ph-compass"></i> Explorador',              desc: 'Mais regiões visitadas' },
  { id: 'fiel',       label: '<i class="ph ph-target"></i> Conclusão',                desc: '% da Trilha completada' },
  { id: 'exigente',   label: '<i class="ph ph-magnifying-glass"></i> Exigente',       desc: 'Críticos mais severos' },
  { id: 'gastao',     label: '<i class="ph ph-money"></i> Gastão',                    desc: 'Quem mais investiu' },
  { id: 'regioes',    label: '<i class="ph ph-map-trifold"></i> Dominadores',         desc: 'Regiões completas' },
];

const AVATARES_EMOJI = [
  'ph-beer-bottle','ph-wine','ph-cooking-pot','ph-guitar','ph-tree-evergreen',
  'ph-paw-print','ph-crown','ph-cowboy-hat','ph-mountains',
  'ph-bank','ph-palette','ph-waves','ph-church','ph-stadium',
  'ph-map-trifold','ph-bowl-food','ph-fork-knife','ph-coffee','ph-music-notes','ph-medal'
];

const VIBES = [
  { id:'samba',         label:'Samba',           icon:'ph-music-notes'      },
  { id:'pagode',        label:'Pagode',           icon:'ph-music-notes'      },
  { id:'rock',          label:'Rock',             icon:'ph-guitar'           },
  { id:'sertanejo',     label:'Sertanejo',        icon:'ph-cowboy-hat'       },
  { id:'forro',         label:'Forró',            icon:'ph-music-notes'      },
  { id:'musica-ao-vivo',label:'Música ao Vivo',   icon:'ph-microphone-stage' },
  { id:'externo',       label:'Área Externa',     icon:'ph-tree'             },
  { id:'vista',         label:'Com Vista',        icon:'ph-mountains'        },
  { id:'coberto',       label:'Cobertura',        icon:'ph-umbrella'         },
  { id:'sinuca',        label:'Sinuca',           icon:'ph-billiards'        },
  { id:'jogos',         label:'Jogos de Bar',     icon:'ph-game-controller'  },
  { id:'sofisticado',   label:'Sofisticado',      icon:'ph-martini'          },
  { id:'romantico',     label:'Romântico',        icon:'ph-heart'            },
  { id:'petfriendly',   label:'Pet Friendly',     icon:'ph-paw-print'        },
  { id:'lgbtq',         label:'LGBTQ+',           icon:'ph-rainbow'          },
  { id:'criancas',      label:'Família',          icon:'ph-baby'             },
  { id:'feminino',      label:'Empreend. Fem.',   icon:'ph-gender-female'    },
  { id:'acessivel',     label:'Acessível',        icon:'ph-wheelchair'       },
  { id:'esportes',      label:'Esportes',         icon:'ph-trophy'           },
  { id:'happy-hour',    label:'Happy Hour',       icon:'ph-beer-mug'         },
  { id:'entrega',       label:'Delivery',         icon:'ph-motorcycle'       },
  { id:'reserva',       label:'Aceita Reserva',   icon:'ph-calendar-check'   },
  { id:'wifi',          label:'Wi-Fi',            icon:'ph-wifi-high'        },
  { id:'vegano',        label:'Vegano',           icon:'ph-leaf'             },
  { id:'vinho',         label:'Carta de Vinhos',  icon:'ph-wine'             },
];
const TAG_ROLES = [
  { id:'curador',    label:'Curador Oficial',  icon:'ph-seal-check', cor:'#E8650A' },
  { id:'embaixador', label:'Embaixador',        icon:'ph-star',       cor:'#185FA5' },
  { id:'mestre',     label:'Mestre Cervejeiro', icon:'ph-crown',      cor:'#FFD700' },
  { id:'fundador',   label:'Fundador',          icon:'ph-medal',      cor:'#7F77DD' },
];
const TIPO_EVENTO = {
  show:       { icon: '<i class="ph ph-guitar"></i>',              label: 'Show ao Vivo' },
  samba:      { icon: '<i class="ph ph-music-notes"></i>',         label: 'Samba de Esquina' },
  happy_hour: { icon: '<i class="ph-fill ph-beer-bottle"></i>',    label: 'Happy Hour' },
  degustacao: { icon: '<i class="ph ph-wine"></i>',                label: 'Degustação' },
  festival:   { icon: '<i class="ph ph-confetti"></i>',            label: 'Festival' },
  outro:      { icon: '<i class="ph ph-calendar"></i>',            label: 'Evento' },
};
// ═══════════════════════════════════════════════════════════════════
// SISTEMA DE XP — TRILHA BH
// Cole este bloco no FINAL de config.js (após a última linha)
// ═══════════════════════════════════════════════════════════════════

// XP base por tier do bar
const XP_TIER = {
  lendario:  15,
  famoso:    10,
  bairro:    15,
  escondido: 25,
};

// XP bônus
const XP_BONUS = {
  foto:        5,   // enviou selfie/foto
  comentario:  3,   // deixou comentário
  streak:     20,   // visitou pelo menos 1 bar em 3 semanas seguidas
  repetida:    3,   // visita repetida no mesmo bar (mesmo mês)
  evento:     15,   // confirmou presença em evento
};


function calcularXpVisita(barId, tier, temFoto, temComentario) {
  if(!usuarioAtual?.uid) return {total:0, xpBase:0, xpFoto:0, xpComentario:0, visitasNoMes:0};
  const mesAtual = new Date().toISOString().slice(0, 7); // "2026-04"
  const chave = `xp_visitas_${usuarioAtual?.uid}_${barId}_${mesAtual}`;
  const visitasNoMes = parseInt(localStorage.getItem(chave) || '0');

  const xpBase = visitasNoMes === 0
    ? (XP_TIER[tier] || XP.visita)   
    : XP_BONUS.repetida;             

  const xpFoto       = temFoto ? XP_BONUS.foto : 0;
  const xpComentario = temComentario ? XP_BONUS.comentario : 0;
  const total        = xpBase + xpFoto + xpComentario;

  // registra visita no mês
  localStorage.setItem(chave, String(visitasNoMes + 1));

  return { total, xpBase, xpFoto, xpComentario, visitasNoMes };
}

// Calcula streak semanal (quantas semanas seguidas com visita)
function calcularStreak() {
  if(!visitas) return 0;
  const agora = Date.now();
  const semana = 7 * 24 * 60 * 60 * 1000;
  const visitsTs = Object.values(visitas)
    .map(v => v.ts)
    .filter(Boolean)
    .sort((a, b) => b - a);

  if (!visitsTs.length) return 0;

  let streak = 1;
  let semanaRef = agora;

  for (let i = 0; i < visitsTs.length; i++) {
    const ts = visitsTs[i];
    if (semanaRef - ts <= semana) continue;       // mesma semana
    if (semanaRef - ts <= semana * 2) { streak++; semanaRef -= semana; } // semana anterior
    else break; // quebrou
  }
  return streak;
}

// Exibe toast de XP ganho (estilo Gymrats)
function mostrarXpGanho(xpInfo, barNome) {
  const streakAtual = calcularStreak();
  const ganhouStreakBonus = streakAtual >= 3 &&
    localStorage.getItem('streak_bonus_semana_' + new Date().toISOString().slice(0, 10)) !== '1';

  if (ganhouStreakBonus) {
    localStorage.setItem('streak_bonus_semana_' + new Date().toISOString().slice(0, 10), '1');
    xpInfo.total += XP_BONUS.streak;
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:var(--marrom);color:white;
    padding:14px 22px;border-radius:18px;
    font-family:'Nunito',sans-serif;font-weight:800;
    z-index:3000;box-shadow:0 6px 24px rgba(0,0,0,0.35);
    animation:slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
    min-width:240px;text-align:center;
  `;

  const linhas = [`<div style="font-size:1.6rem;font-family:'Bebas Neue',cursive;color:var(--laranja)">+${xpInfo.total} XP</div>`];
  linhas.push(`<div style="font-size:0.78rem;opacity:0.8;margin-bottom:4px">${sanitizeHtml(barNome)}</div>`);

  const detalhes = [];
  if (xpInfo.visitasNoMes > 0) detalhes.push(`<i class="ph ph-repeat"></i> visita repetida`);
  if (xpInfo.xpFoto)       detalhes.push(`<i class="ph ph-camera"></i> +${xpInfo.xpFoto} foto`);
  if (xpInfo.xpComentario) detalhes.push(`<i class="ph ph-chat-text"></i> +${xpInfo.xpComentario} avaliação`);
  if (ganhouStreakBonus)    detalhes.push(`<i class="ph-fill ph-fire"></i> +${XP_BONUS.streak} streak ${streakAtual} semanas!`);

  if (detalhes.length) {
    linhas.push(`<div style="font-size:0.72rem;color:rgba(255,255,255,0.7);margin-top:4px">${detalhes.join(' · ')}</div>`);
  }

  overlay.innerHTML = linhas.join('');
  document.body.appendChild(overlay);
  navigator.vibrate?.([20,10,20,10,60]); 
  setTimeout(() => overlay.remove(), 3500);

  const keyXp = 'xp_'+usuarioAtual?.uid;
const xpSalvo = JSON.parse(localStorage.getItem(keyXp)||'{}');
const xpAtual = xpSalvo.total||0, xpMes = xpSalvo.mes||0, xpAno = xpSalvo.ano||0;
localStorage.setItem(keyXp, JSON.stringify({total:xpAtual+xpInfo.total, mes:xpMes+xpInfo.total, ano:xpAno+xpInfo.total}));
  const xpData = {
    xpTotal: xpAtual + xpInfo.total,
    xpMes:   xpMes   + xpInfo.total,
    xpAno:   xpAno   + xpInfo.total,
    mesRef:  new Date().toISOString().slice(0, 7),
    anoRef:  new Date().getFullYear(),
    ts:      Date.now(),
  };
  if(!usuarioAtual?.uid) return;
  db.collection('xp').doc(usuarioAtual?.uid).set(xpData, { merge: true }).catch(() => {});
}

window.calcularXpVisita  = calcularXpVisita;
window.calcularStreak    = calcularStreak;
window.mostrarXpGanho    = mostrarXpGanho;
window._desafioAtual = null;

window.carregarDesafioMensal = async function() {
  const mesAtual = new Date().toISOString().slice(0, 7); // "2026-05"
  try {
    const snap = await db.collection('desafios')
      .where('mes', '==', mesAtual)
      .where('ativo', '==', true)
      .limit(1)
      .get();
    if (snap.empty) { window._desafioAtual = null; return null; }
    window._desafioAtual = { id: snap.docs[0].id, ...snap.docs[0].data() };
    return window._desafioAtual;
  } catch(e) { return null; }
};
window.verificarDesafioCompleto = function(desafio) {
  if (!desafio || !usuarioAtual) return { progresso: 0, completo: false };
  let bares = BARES;
  if (desafio.regiao && desafio.regiao !== 'TODAS')
    bares = bares.filter(b => b.regiao === desafio.regiao);
  if (desafio.tipo)
    bares = bares.filter(b => (b.tipo || []).includes(desafio.tipo));
  const visitados = bares.filter(b => visitas[b.id]).length;
  return {
    progresso: visitados,
    meta: desafio.meta || bares.length,
    completo: visitados >= (desafio.meta || bares.length),
  };
};

window.salvarDesafioCompleto = async function(desafioId) {
  const chave = `desafio_concluido_${usuarioAtual?.uid}_${desafioId}`;
  if (localStorage.getItem(chave)) return; 
  localStorage.setItem(chave, '1');
  mostrarNotif('<i class="ph-fill ph-confetti"></i> Desafio do mês concluído! Emblema desbloqueado!');
  lancarConfete();
  await db.collection('desafios_completos').add({
    uid: usuarioAtual.uid,
    nome: usuarioAtual.displayName,
    desafioId,
    ts: Date.now(),
  }).catch(() => {});
};
const TRILHAS = [
  {
    id: 'cdb',
    icon: 'ph-star',
    nome: 'Tira-Gosto de Ouro',
    desc: 'O campeonato que parou BH — os bares mais disputados da cidade',
    cor: '#2D6A2D',
    filtro: b => !!b.cdb,
  },
  {
    id: 'clube-da-esquina',
    icon: 'ph-music-notes',
    nome: 'A Esquina que Canta',
    desc: 'Samba, pagode e música ao vivo na área externa — a alma de BH de noite',
    cor: '#7F3FBF',
    filtro: b => (b.vibes||[]).some(v => ['samba','pagode','musica-ao-vivo'].includes(v))
               && (b.vibes||[]).includes('externo'),
  },
  {
    id: 'madrugada',
    icon: 'ph-moon',
    nome: 'Rota da Madrugada',
    desc: 'Pra quem começa quando os outros vão dormir — BH nunca para',
    cor: '#1A237E',
    filtro: b => ['1h','2h','3h'].some(h => (b.horario||'').includes(h)),
  },
  {
    id: 'sinuca',
    icon: 'ph-sun',
    nome: 'Mesa de Sinuca',
    desc: 'A cultura que a Savassi esqueceu mas o bairro guardou',
    cor: '#1B5E20',
    filtro: b => (b.vibes||[]).includes('sinuca') || (b.tipo||[]).includes('Sinuca'),
  },
  {
    id: 'domingo',
    icon: 'ph-sun',
    nome: 'Domingo é Sagrado',
    desc: 'Porque o mineiro não desperdiça um bom domingo sem boteco',
    cor: '#E65100',
    filtro: b => (b.horario||'').includes('Dom')
               && (b.vibes||[]).some(v => ['samba','pagode','externo'].includes(v)),
  },
  {
    id: 'bh-profunda',
    icon: 'ph-map-pin',
    nome: 'BH que Poucos Veem',
    desc: 'Oeste e Nordeste — o boteco raiz longe do roteiro turístico',
    cor: '#4E342E',
    filtro: b => ['OESTE','NORDESTE'].includes(b.regiao) && !b.cdb,
  },
  {
    id: 'petfriendly',
    icon: 'ph-paw-print',
    nome: 'Leva o Dog',
    desc: 'Porque seu melhor amigo também merece uma boa cerveja do lado',
    cor: '#00695C',
    filtro: b => (b.vibes||[]).includes('petfriendly'),
  },
  {
    id: 'vista',
    icon: 'ph-mountains',
    nome: 'Vista de BH',
    desc: 'Rooftops e mirantes — a cidade mais linda vista de cima com copo na mão',
    cor: '#185FA5',
    filtro: b => (b.vibes||[]).includes('vista'),
  },
  {
    id: 'feito-por-elas',
    icon: 'ph-gender-female',
    nome: 'Feito por Elas',
    desc: 'Bares fundados e gerenciados por mulheres empreendedoras de BH',
    cor: '#AD1457',
    filtro: b => (b.vibes||[]).includes('feminino'),
  },
  {
    id: 'craft',
    icon: 'ph-beer-bottle',
    nome: 'Rota Craft',
    desc: 'Cervejarias artesanais e carta de vinhos — o lado sofisticado de BH',
    cor: '#F57F17',
    filtro: b => (b.tipo||[]).includes('Cervejaria')
               && (b.vibes||[]).some(v => ['sofisticado','vinho','coberto'].includes(v)),
  },
];
window.TRILHAS = TRILHAS;
window.carregarBarSemana = async function() {
  const agora = new Date();
  const domingo = new Date(agora);
  domingo.setDate(agora.getDate() - agora.getDay());
  domingo.setHours(0, 0, 0, 0);
  const tsInicio = domingo.getTime();

  try {
    const snap = await db.collection('bar_semana')
      .where('tsInicio', '==', tsInicio)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch(e) { return null; }
};

window.mostrarResumoSemanal = function() {
  if (!usuarioAtual || usuarioAtual.anonimo) return;
  const chave = `resumo_semana_${usuarioAtual.uid}_${new Date().toISOString().slice(0, 10).slice(0, 8)}`; 
  if (localStorage.getItem(chave)) return;
  localStorage.setItem(chave, '1');

  const SEMANA = 7 * 24 * 60 * 60 * 1000;
  const agora = Date.now();
  const visitasRecentes = Object.values(visitas).filter(v => v.ts && agora - v.ts < SEMANA);
  if (!visitasRecentes.length) return; 

  const xpData = JSON.parse(localStorage.getItem('xp_' + usuarioAtual.uid) || '{}');
  const totalVisitados = Object.keys(visitas).length;

  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div style="background:white;border-radius:24px;padding:28px 24px;
                max-width:340px;width:90%;text-align:center">
      <div style="font-size:0.65rem;font-weight:900;letter-spacing:2px;
                  color:var(--laranja);text-transform:uppercase;margin-bottom:6px">
        <i class="ph-fill ph-calendar-check"></i> Sua semana em BH
      </div>
      <div style="font-family:'Bebas Neue',cursive;font-size:2rem;
                  color:var(--marrom);line-height:1;margin-bottom:20px">
        Você arrasou!
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
        <div style="background:var(--creme);border-radius:12px;padding:12px 8px">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--laranja)">
            ${visitasRecentes.length}
          </div>
          <div style="font-size:0.65rem;font-weight:700;color:var(--cinza);
                      text-transform:uppercase">Bares</div>
        </div>
        <div style="background:var(--creme);border-radius:12px;padding:12px 8px">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--laranja)">
            ${xpData.mes || 0}
          </div>
          <div style="font-size:0.65rem;font-weight:700;color:var(--cinza);
                      text-transform:uppercase">XP mês</div>
        </div>
        <div style="background:var(--creme);border-radius:12px;padding:12px 8px">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--laranja)">
            ${totalVisitados}
          </div>
          <div style="font-size:0.65rem;font-weight:700;color:var(--cinza);
                      text-transform:uppercase">Total</div>
        </div>
      </div>

      <div style="font-size:0.82rem;color:var(--cinza);margin-bottom:20px;line-height:1.5">
        Você já visitou <strong style="color:var(--marrom)">${totalVisitados}</strong> de
        <strong style="color:var(--marrom)">${BARES.length}</strong> bares da Trilha BH.
        Continue assim!
      </div>

      <button onclick="this.closest('.modal-overlay').remove()"
        style="width:100%;padding:12px;border-radius:12px;background:var(--marrom);
               color:white;border:none;font-size:0.9rem;font-weight:800;
               cursor:pointer;font-family:'Nunito',sans-serif">
        <i class="ph ph-beer-bottle"></i> Bora pro próximo!
      </button>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
};
window.abrirDesafioGrupo = function(grupoId) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-box" style="text-align:left">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.4rem;
                  color:var(--marrom);margin-bottom:4px">
        <i class="ph ph-users-three"></i> Novo Desafio de Grupo
      </div>
      <div style="font-size:0.78rem;color:var(--cinza);margin-bottom:16px">
        O grupo vê o ranking do desafio em tempo real.
      </div>

      <label style="font-size:0.75rem;font-weight:800;color:var(--cinza);
                    display:block;margin-bottom:4px;text-transform:uppercase">Título</label>
      <input id="desafioGrupoTitulo" type="text" placeholder="Ex: Quem visita mais em maio?"
        style="width:100%;padding:10px 12px;border:1.5px solid var(--border);
               border-radius:10px;font-size:0.85rem;font-family:'Nunito',sans-serif;
               outline:none;color:var(--marrom);margin-bottom:10px;box-sizing:border-box"/>

      <label style="font-size:0.75rem;font-weight:800;color:var(--cinza);
                    display:block;margin-bottom:4px;text-transform:uppercase">Encerra em</label>
      <input id="desafioGrupoFim" type="date"
        min="${new Date().toISOString().slice(0,10)}"
        style="width:100%;padding:10px 12px;border:1.5px solid var(--border);
               border-radius:10px;font-size:0.85rem;font-family:'Nunito',sans-serif;
               outline:none;color:var(--marrom);margin-bottom:16px;box-sizing:border-box"/>

      <div id="msgDesafioGrupo" style="font-size:0.75rem;color:#cc0000;
                                        min-height:16px;margin-bottom:10px"></div>

      <button id="btnCriarDesafioGrupo"
        style="width:100%;padding:12px;border-radius:12px;background:var(--marrom);
               color:white;border:none;font-size:0.9rem;font-weight:800;
               cursor:pointer;font-family:'Nunito',sans-serif;margin-bottom:10px">
        <i class="ph ph-flag"></i> Criar desafio
      </button>
      <button onclick="this.closest('.modal-overlay').remove()" class="btn-cadastro">
        Cancelar
      </button>
    </div>`;

  ov.querySelector('#btnCriarDesafioGrupo').onclick = async () => {
    const titulo = document.getElementById('desafioGrupoTitulo').value.trim();
    const fimStr = document.getElementById('desafioGrupoFim').value;
    const msg = document.getElementById('msgDesafioGrupo');
    if (!titulo) { msg.textContent = 'Informe o título do desafio.'; return; }
    if (!fimStr) { msg.textContent = 'Informe a data de encerramento.'; return; }
    const tsFim = new Date(fimStr + 'T23:59:59').getTime();
    if (tsFim <= Date.now()) { msg.textContent = 'A data deve ser no futuro.'; return; }

    await db.collection('grupos').doc(grupoId).collection('desafios').add({
      titulo,
      tsFim,
      criadoPor: usuarioAtual.uid,
      criadoEm: Date.now(),
      ativo: true,
    });
    ov.remove();
    mostrarNotif('<i class="ph-fill ph-flag"></i> Desafio criado! O grupo foi notificado.');
  };

  document.body.appendChild(ov);
};

// Renderiza ranking do desafio ativo do grupo
window.renderDesafioGrupoAtivo = async function(grupoId, membros, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const snap = await db.collection('grupos').doc(grupoId).collection('desafios')
    .where('ativo', '==', true)
    .orderBy('criadoEm', 'desc')
    .limit(1)
    .get();

  if (snap.empty) { el.innerHTML = ''; return; }
  const desafio = { id: snap.docs[0].id, ...snap.docs[0].data() };

  if (Date.now() > desafio.tsFim) { el.innerHTML = ''; return; }

  // Calcula pontuação de cada membro (visitas desde a criação do desafio)
  const pontos = await Promise.all(membros.map(async uid => {
    const vSnap = await db.collection('users').doc(uid).collection('visits').get();
    const count = vSnap.docs.filter(d => {
      const ts = d.data().ts || 0;
      return ts >= desafio.criadoEm;
    }).length;
    return { uid, count };
  }));
  pontos.sort((a, b) => b.count - a.count);

  const diasRestantes = Math.max(0, Math.ceil((desafio.tsFim - Date.now()) / 86400000));

  el.innerHTML = `
    <div style="background:white;border-radius:14px;padding:14px;
                box-shadow:var(--shadow);margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:0.62rem;font-weight:900;letter-spacing:1px;
                      color:var(--laranja);text-transform:uppercase">
            <i class="ph-fill ph-flag"></i> Desafio do grupo
          </div>
          <div style="font-weight:800;font-size:0.9rem;color:var(--marrom)">
            ${sanitizeHtml(desafio.titulo)}
          </div>
        </div>
        <div style="font-size:0.7rem;color:var(--cinza);font-weight:700;text-align:right">
          ${diasRestantes}d<br>restantes
        </div>
      </div>
      ${pontos.slice(0, 5).map((p, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;
                    border-bottom:1px solid var(--border);
                    ${p.uid === usuarioAtual?.uid ? 'background:#FFF8F0;margin:0 -14px;padding:6px 14px;' : ''}">
          <span style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--cinza);
                        width:20px">${i + 1}º</span>
          <span style="flex:1;font-size:0.85rem;font-weight:800;color:var(--marrom)">
            ${p.uid === usuarioAtual?.uid ? 'Você' : 'Membro'}
            ${p.uid === usuarioAtual?.uid ? '<span style="font-size:0.62rem;background:var(--laranja);color:white;padding:1px 6px;border-radius:10px;margin-left:4px">você</span>' : ''}
          </span>
          <span style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:var(--laranja)">
            ${p.count} bar${p.count !== 1 ? 'es' : ''}
          </span>
        </div>`).join('')}
    </div>`;
};
// ── Progresso Coletivo do Grupo ──────────────────────────────────────────
window.renderProgressoColetivo = async function(grupoId, membros, containerId) {
  const el = document.getElementById(containerId);
  if (!el || !membros.length) return;

  // Coleta todas as visitas dos membros
  const todasVisitas = new Set();
  await Promise.all(membros.map(async uid => {
    const snap = await db.collection('users').doc(uid).collection('visits').get();
    snap.forEach(d => todasVisitas.add(d.id));
  }));

  // Progresso por região
  const regioes = Object.keys(REGIOES_COUNT);
  const progressoRegioes = regioes.map(reg => {
    const baresRegiao = BARES.filter(b => b.regiao === reg);
    const visitados = baresRegiao.filter(b => todasVisitas.has(b.id)).length;
    return { reg, visitados, total: baresRegiao.length,
             pct: Math.round((visitados / baresRegiao.length) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  const totalGrupo = todasVisitas.size;
  const pctGeral = Math.round((totalGrupo / BARES.length) * 100);

  el.innerHTML = `
    <div style="background:white;border-radius:14px;padding:14px;box-shadow:var(--shadow)">
      <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);
                  letter-spacing:1px;margin-bottom:12px">
        <i class="ph ph-users-three"></i> Conquistas do Grupo
      </div>
      <div style="background:var(--creme);border-radius:10px;padding:10px 12px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:0.75rem;font-weight:800;color:var(--cinza)">
            Trilha geral (juntos)
          </span>
          <span style="font-size:0.75rem;font-weight:900;color:var(--laranja)">${pctGeral}%</span>
        </div>
        <div style="height:6px;background:#e0d0c0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pctGeral}%;background:var(--laranja);border-radius:4px"></div>
        </div>
        <div style="font-size:0.68rem;color:var(--cinza);margin-top:4px">
          ${totalGrupo} de ${BARES.length} bares descobertos pelo grupo
        </div>
      </div>
      ${progressoRegioes.map(r => `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:0.72rem;font-weight:800;color:var(--marrom)">${r.reg}</span>
            <span style="font-size:0.72rem;color:var(--cinza)">${r.visitados}/${r.total}</span>
          </div>
          <div style="height:4px;background:#eee;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${r.pct}%;
                        background:${r.pct === 100 ? '#2D6A2D' : 'var(--laranja)'};
                        border-radius:4px"></div>
          </div>
        </div>`).join('')}
    </div>`;
};