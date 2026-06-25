const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrar() {
  // Ler o arquivo JSON
  const raw = fs.readFileSync('./www/js/bares_grid.json', 'utf-8');
  const bares = JSON.parse(raw);

  console.log(`Total de bares: ${bares.length}`);

  // Mapear campos
  const baresFormatados = bares.map(b => ({
    id:          b.id,
    nome:        b.nome,
    endereco:    b.end || null,
    bairro:      b.bairro || null,
    regiao:      b.regiao || null,
    lat:         b.lat || null,
    lng:         b.lng || null,
    horario:     b.horario || null,
    telefone:    b.telefone || null,
    instagram:   b.instagram || null,
    promocao:    b.promocao || null,
    prato:       b.prato || null,
    link:        b.link || null,
    descricao:   b.descricao || null,
    tier:        b.tier || null,
    xp:          b.xp || 0,
    avaliacoes:  b.avaliacoes || 0,
    rating:      b.rating || null,
    verificado:  b.verificado || false,
    tags:        b.tags || [],
    ativo:       true,
  }));

  // Inserir em lotes de 100
  const LOTE = 100;
  let inseridos = 0;

  for (let i = 0; i < baresFormatados.length; i += LOTE) {
    const lote = baresFormatados.slice(i, i + LOTE);

    const { error } = await supabase
      .from('bares')
      .upsert(lote, { onConflict: 'id' });

    if (error) {
      console.error(`Erro no lote ${i / LOTE + 1}:`, error.message);
    } else {
      inseridos += lote.length;
      console.log(`Inseridos: ${inseridos}/${baresFormatados.length}`);
    }
  }

  console.log('Migração concluída.');
}

migrar();