window.abrirTrilha = function(trilhaId) {
  const trilha = TRILHAS.find(t => t.id === trilhaId);
  if (!trilha) return;

  const bares = BARES.filter(trilha.filtro);
  const visitados = bares.filter(b => visitas[b.id]).length;
  const pct = bares.length ? Math.round((visitados / bares.length) * 100) : 0;
  const completo = visitados === bares.length && bares.length > 0;

  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.style.cssText = 'align-items:flex-end;padding:0';
  ov.innerHTML = `
    <div style="background:var(--surface);border-radius:24px 24px 0 0;
                width:100%;max-height:85vh;overflow-y:auto;padding:0 0 80px">
      <!-- Header colorido -->
      <div style="background:${trilha.cor};padding:24px 20px 20px;position:sticky;top:0;z-index:2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:2rem;margin-bottom:4px"><i class="ph ${trilha.icon}"></i></div>
            <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;
                        color:white;line-height:1">${sanitizeHtml(trilha.nome)}</div>
            <div style="font-size:0.8rem;color:rgba(255,255,255,0.75);margin-top:4px">
              ${sanitizeHtml(trilha.desc)}
            </div>
          </div>
          <button onclick="this.closest('.modal-overlay').remove()"
            style="background:rgba(255,255,255,0.2);border:none;color:white;
                   width:36px;height:36px;border-radius:50%;font-size:1.2rem;
                   cursor:pointer;display:flex;align-items:center;justify-content:center">
            <i class="ph ph-x"></i>
          </button>
        </div>
        <!-- Progresso -->
        <div style="margin-top:14px;background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:700">
              ${visitados}/${bares.length} bares
            </span>
            <span style="font-size:0.72rem;font-weight:900;color:white">${pct}%</span>
          </div>
          <div style="height:5px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:white;border-radius:4px;
                        transition:width 0.5s ease"></div>
          </div>
          ${completo ? `<div style="margin-top:8px;font-size:0.78rem;font-weight:800;
                                    color:#FFD700;text-align:center">
            <i class="ph-fill ph-confetti"></i> Trilha completa! Emblema desbloqueado!
          </div>` : ''}
        </div>
      </div>

      <!-- Lista de bares -->
      <div style="padding:16px">
        ${bares.length === 0
          ? `<div class="empty"><div class="empty-icon"><i class="ph ${trilha.icon}"></i></div>
             <p>Nenhum bar nesta trilha ainda.</p></div>`
          : bares.map(b => {
              const v = visitas[b.id];
              const isFav = favoritos.includes(b.id);
              return `
                <div onclick="this.closest('.modal-overlay').remove();
                              setTimeout(()=>window.abrirBottomSheet('${b.id}'),200)"
                     style="display:flex;align-items:center;gap:12px;padding:12px;
                            background:white;border-radius:12px;margin-bottom:8px;
                            cursor:pointer;box-shadow:var(--shadow);
                            border-left:4px solid ${v ? '#2D6A2D' : trilha.cor}">
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:800;font-size:0.9rem;color:var(--marrom);
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                      ${v ? '<i class="ph-fill ph-check-circle" style="color:var(--verde)"></i> ' : ''}
                      ${sanitizeHtml(b.nome)}
                    </div>
                    <div style="font-size:0.72rem;color:var(--laranja);font-weight:700;margin-top:2px">
                      <i class="ph ph-map-pin"></i> ${b.regiao}
                      ${v?.nota ? ` · <i class="ph-fill ph-star"></i> ${v.nota}/10` : ''}
                    </div>
                  </div>
                  <i class="ph ph-caret-right" style="color:var(--cinza);font-size:1rem"></i>
                </div>`;
            }).join('')
        }
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
};

window.renderCarrosselTrilhas = function(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div style="font-family:'Bebas Neue',cursive;font-size:1rem;color:var(--marrom);
                letter-spacing:1px;margin-bottom:10px;padding:0 16px">
      <i class="ph ph-path"></i> Trilhas Temáticas
    </div>
    <div style="display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;
                padding:0 16px 4px">
      ${TRILHAS.map(t => {
        const bares = BARES.filter(t.filtro);
        const visitados = bares.filter(b => visitas[b.id]).length;
        const pct = bares.length ? Math.round((visitados / bares.length) * 100) : 0;
        return `
          <div onclick="window.abrirTrilha('${t.id}')"
               style="flex-shrink:0;width:130px;background:white;border-radius:14px;
                      padding:12px;cursor:pointer;box-shadow:var(--shadow);
                      border-top:4px solid ${t.cor}">
            <div style="font-size:1.4rem;margin-bottom:6px"><i class="ph ${t.icon}"></i></div>
            <div style="font-size:0.8rem;font-weight:900;color:var(--marrom);
                        line-height:1.2;margin-bottom:6px">${sanitizeHtml(t.nome)}</div>
            <div style="height:3px;background:#eee;border-radius:4px;overflow:hidden;margin-bottom:4px">
              <div style="height:100%;width:${pct}%;background:${t.cor};border-radius:4px"></div>
            </div>
            <div style="font-size:0.65rem;color:var(--cinza);font-weight:700">
              ${visitados}/${bares.length} · ${pct}%
            </div>
          </div>`;
      }).join('')}
    </div>`;
};