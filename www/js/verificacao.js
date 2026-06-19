window.reportarBar = function(barId) {
  const bar = BARES.find(b => b.id === barId);
  if (!bar) return;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:3000';
  ov.innerHTML = `
    <div style="background:white;border-radius:16px;padding:24px;max-width:340px;width:90%;font-family:'Nunito',sans-serif">
      <div style="font-family:'Bebas Neue',cursive;font-size:1.3rem;color:var(--marrom);margin-bottom:4px">
        <i class="ph ph-warning-circle"></i> Reportar problema
      </div>
      <div style="font-size:0.82rem;color:var(--cinza);margin-bottom:16px">${sanitizeHtml(bar.nome)}</div>

      <div style="font-size:0.75rem;font-weight:800;color:var(--cinza);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Tipo do problema</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px" id="tiposReporte">
        ${[
          ['horario',    'ph-clock',         'Horário incorreto'],
          ['fechado',    'ph-door',          'Bar fechado permanentemente'],
          ['endereco',   'ph-map-pin',       'Endereço errado'],
          ['nao_e_bar',  'ph-x-circle',      'Não é um bar'],
          ['duplicado',  'ph-copy',          'Duplicado no app'],
          ['outro',      'ph-chat-centered', 'Outro problema'],
        ].map(([val, icon, label]) => `
          <label style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;
                        border:1.5px solid var(--border);cursor:pointer;transition:.15s"
                 onclick="document.querySelectorAll('#tiposReporte label').forEach(l=>l.style.borderColor='var(--border)');
                          this.style.borderColor='var(--laranja)';
                          document.getElementById('tipoReporteVal').value='${val}'">
            <i class="ph ${icon}" style="font-size:1.1rem;color:var(--laranja)"></i>
            <span style="font-size:0.85rem;font-weight:700;color:var(--marrom)">${label}</span>
          </label>`).join('')}
      </div>
      <input type="hidden" id="tipoReporteVal" value=""/>

      <div style="font-size:0.75rem;font-weight:800;color:var(--cinza);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Detalhes (opcional)</div>
      <textarea id="descReporte" rows="3" maxlength="300" placeholder="Descreva o problema com mais detalhes..." oninput="document.getElementById('contadorDesc').textContent=this.value.length+'/300'"
        style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;
               font-size:0.85rem;font-family:'Nunito',sans-serif;outline:none;resize:none;
               color:var(--marrom);background:var(--surface);box-sizing:border-box;margin-bottom:6px"></textarea> <div id="contadorDesc" style="font-size:0.7rem;color:var(--cinza);text-align:right;margin-bottom:6px">0/300</div>
      <div id="msgReporte" style="font-size:0.75rem;color:#cc0000;min-height:16px;margin-bottom:10px"></div>

      <div style="display:flex;gap:8px">
        <button onclick="this.closest('.modal-overlay').remove()"
          style="flex:1;padding:10px;border-radius:10px;border:1.5px solid var(--border);
                 background:transparent;cursor:pointer;font-size:0.85rem;font-weight:700;
                 font-family:'Nunito',sans-serif;color:var(--cinza)">Cancelar</button>
        <button id="btnConfReporte"
          style="flex:2;padding:10px;border-radius:10px;background:var(--laranja);color:white;
                 border:none;cursor:pointer;font-weight:800;font-size:0.85rem;
                 font-family:'Nunito',sans-serif">Enviar reporte</button>
      </div>
    </div>`;

  ov.querySelector('#btnConfReporte').onclick = async () => {
    const tipo = document.getElementById('tipoReporteVal').value;
    const desc = filtrarTexto(document.getElementById('descReporte').value.trim());
    const msgEl = document.getElementById('msgReporte');

    if (!tipo) {
      msgEl.textContent = 'Selecione o tipo do problema.';
      return;
    }

    const btn = ov.querySelector('#btnConfReporte');
    btn.innerHTML = '<i class="ph ph-spinner"></i> Enviando...';
    btn.disabled = true;

    try {
      await db.collection('reportes').add({
        barId,
        barNome: bar.nome,
        tipo,
        descricao: desc,
        uid: usuarioAtual?.uid || 'anonimo',
        nomeUser: usuarioAtual?.displayName || 'Anônimo',
        ts: Date.now(),
        status: 'pendente',
      });
      window.mostrarNotif('<i class="ph ph-check-circle"></i> Reporte enviado, obrigado!');
setTimeout(()=>ov.remove(), 1500);
    } catch(e) {
      btn.innerHTML = 'Enviar reporte';
      btn.disabled = false;
      msgEl.textContent = 'Erro ao enviar. Tente novamente.';
    }
  };

  document.body.appendChild(ov);
};