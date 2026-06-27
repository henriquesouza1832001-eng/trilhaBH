const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

async function getBares(env) {
  const cached = await env.KV.get('bares_cache', { type: 'json' });
  if (cached) return json(cached);

  let todos = [];
  let offset = 0;
  const limite = 1000;

  while (true) {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/bares?ativo=eq.true&select=*&order=nome.asc&limit=${limite}&offset=${offset}`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) break;

    const lote = await res.json();
    todos = todos.concat(lote);

    if (lote.length < limite) break;
    offset += limite;
  }

  if (!todos.length) return json({ erro: 'Erro ao buscar bares' }, 500);

  await env.KV.put('bares_cache', JSON.stringify(todos), { expirationTtl: 600 });

  return json(todos);
}

async function postCheckin(request, env) {
  const body = await request.json();
  if (!body.barId || !body.userId) {
    return json({ erro: 'barId e userId são obrigatórios' }, 400);
  }
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/checkins`,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: body.userId,
        bar_id:  body.barId,
        nota:    body.nota || null,
        km:      body.km || null,
        gasto:   body.gasto || null,
        comentario: body.comentario || null,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    return json({ erro: err.message || 'Erro ao registrar checkin' }, 500);
  }
  await env.KV.delete('bares_cache');
  return json({ sucesso: true });
}

async function postAvaliacao(request, env) {
  const body = await request.json();
  if (!body.barId || !body.userId) {
    return json({ erro: 'barId e userId são obrigatórios' }, 400);
  }
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/avaliacoes`,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        user_id:      body.userId,
        bar_id:       body.barId,
        gelada:       body.gelada || null,
        atendimento:  body.atendimento || null,
        higiene:      body.higiene || null,
        texto_livre:  body.texto_livre || null,
      }),
    }
  );
  if (!res.ok) return json({ erro: 'Erro ao salvar avaliação' }, 500);
  return json({ sucesso: true });
}
async function getRanking(request, env) {
  const url = new URL(request.url);
  const categoria = url.searchParams.get('c') || 'checkins';
  const views = {
    checkins:    'ranking_checkins',
    gelada:      'ranking_gelada',
    atendimento: 'ranking_atendimento',
    higiene:     'ranking_higiene',
  };
  const view = views[categoria];
  if (!view) return json({ erro: 'Categoria inválida' }, 400);
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/${view}?select=*&limit=50`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  if (!res.ok) return json({ erro: 'Erro ao buscar ranking' }, 500);
  return json(await res.json());
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === 'OPTIONS') return handleOptions();
    if (path === '/ping') return json({ ok: true });
    if (path === '/bares'    && method === 'GET')  return getBares(env);
    if (path === '/checkin'  && method === 'POST') return postCheckin(request, env);
    if (path === '/avaliacao'&& method === 'POST') return postAvaliacao(request, env);
    if (path === '/ranking'  && method === 'GET')  return getRanking(request, env);

    return json({ erro: 'Rota não encontrada' }, 404);
  },
};