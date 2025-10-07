/**
 * Dev Tools – utilitários leves para validar salvamento e integridade
 * Ative com ?dev=1 na URL. Abre um painel mínimo e hotkeys.
 */
(function () {
  try {
    const url = new URL(window.location.href);
    const dev = url.searchParams.get('dev');
    if (dev !== '1') return; // só ativa quando solicitado

    const dm = window.dataManager || window.game?.systems?.dataManager;
    if (!dm) {
      console.warn('[DevTools] DataManager não encontrado. Aguarde o jogo iniciar.');
    }

    // UI básica
    const panel = document.createElement('div');
    panel.id = 'devToolsPanel';
    panel.style.cssText = [
      'position:fixed', 'bottom:12px', 'right:12px', 'z-index:99999',
      'background:rgba(0,0,0,0.8)', 'color:#fff', 'font:12px/1.4 system-ui,Segoe UI,Arial',
      'padding:10px', 'border:1px solid rgba(255,255,255,0.2)', 'border-radius:8px',
      'backdrop-filter:blur(4px)', 'max-width:320px'
    ].join(';');
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
        <strong>Dev Tools</strong>
        <span style="opacity:.7">(?dev=1)</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        <button data-action="rollover" style="padding:6px 8px;">Rollover semana</button>
        <button data-action="train" style="padding:6px 8px;">Treinar skill</button>
        <button data-action="save" style="padding:6px 8px;">Salvar agora</button>
        <button data-action="journal" style="padding:6px 8px;">Ver journal</button>
        <button data-action="verify" style="padding:6px 8px;">Verificar checksums</button>
        <button data-action="stage" style="padding:6px 8px;">Simular staging</button>
      </div>
      <div style="margin-top:6px;opacity:.8;">Hotkeys: J=Journal, V=Verify, R=Rollover, T=Train, S=Save</div>
    `;
    document.body.appendChild(panel);

    function notify(msg) {
      try { console.log('[DevTools]', msg); } catch(_) {}
    }

    panel.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const game = window.game;
      const dataManager = window.dataManager || game?.systems?.dataManager;
      try {
        switch (action) {
          case 'rollover': {
            const res = dataManager?.weeklyRollover?.();
            notify(`weeklyRollover => ${JSON.stringify(res)}`);
            break;
          }
          case 'train': {
            const r = dataManager?.trainSkill?.('vocals');
            notify(`trainSkill('vocals') => ${JSON.stringify(r)}`);
            break;
          }
          case 'save': {
            await game?.saveGame?.();
            notify('saveGame disparado');
            break;
          }
          case 'journal': {
            const list = JSON.parse(localStorage.getItem('risingstar_journal') || '[]');
            console.table(list);
            alert(`Journal entries: ${list.length} (ver console)`);
            break;
          }
          case 'verify': {
            const problems = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (!key || key.endsWith('__meta') || key.endsWith('__staging')) continue;
              const meta = localStorage.getItem(`${key}__meta`);
              if (!meta) continue; // só valida onde há meta
              try {
                const dataStr = localStorage.getItem(key) || '';
                const metaObj = JSON.parse(meta);
                const sum = (dataManager?.computeChecksum?.(dataStr)) || '';
                if (metaObj.checksum && sum && metaObj.checksum !== sum) {
                  problems.push({ key, expected: metaObj.checksum, got: sum });
                }
              } catch (_) { /* ignore */ }
            }
            if (problems.length) {
              console.warn('[DevTools] Checksum mismatches:', problems);
              alert(`Checksums com problema: ${problems.length} (ver console)`);
            } else {
              alert('Checksums OK');
            }
            break;
          }
          case 'stage': {
            // escreve staging órfão para validar recuperação no próximo init
            const k = 'risingstar_dev_staging_test';
            localStorage.setItem(`${k}__staging`, JSON.stringify({ hello: 'world', t: Date.now() }));
            alert('Criado staging órfão (risingstar_dev_staging_test__staging). Recarregue a página para testar recuperação.');
            break;
          }
        }
      } catch (err) {
        console.error('[DevTools] Erro:', err);
        alert(`Erro: ${err?.message}`);
      }
    });

    window.addEventListener('keydown', async (e) => {
      const k = e.key?.toLowerCase?.();
      if (k === 'j') panel.querySelector('[data-action="journal"]').click();
      if (k === 'v') panel.querySelector('[data-action="verify"]').click();
      if (k === 'r') panel.querySelector('[data-action="rollover"]').click();
      if (k === 't') panel.querySelector('[data-action="train"]').click();
      if (k === 's') panel.querySelector('[data-action="save"]').click();
    });

    console.log('%cDevTools ON', 'color:#0f0');
  } catch (e) {
    console.warn('[DevTools] falhou ao iniciar:', e);
  }
})();
