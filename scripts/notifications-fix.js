(() => {
  function getMobileNavHeight() {
    const candidates = [
      '.mobile-bottom-nav',
      '#studioMobileNav',
      '#careerMobileNav',
      '#socialMobileNav',
      '#financeMobileNav',
      '.app-footer',
      'footer'
    ];
    let h = 0;
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) {
        const r = el.getBoundingClientRect();
        h = Math.max(h, r.height || 0);
      }
    }
    // fallback razoável
    if (!h) h = 88;
    document.documentElement.style.setProperty('--mobile-nav-h', `${Math.round(h)}px`);
    return h;
  }

  function applyFeedPadding() {
    const h = getMobileNavHeight();
    const extra = 12;
    const targets = document.querySelectorAll('#notificationFeedContent, #panel-notifications .news-feed-content, #panel-notifications .notification-list');
    targets.forEach(t => {
      t.style.paddingBottom = `calc(${h}px + ${extra}px + env(safe-area-inset-bottom, 0px))`;
    });
    ensureScrollSpacer(h + extra);
  }

  function ensureScrollable() {
    if (!isNotificationsOpen()) return;
    const doc = document.documentElement;
    const body = document.body;
    const pageScrollable = (doc.scrollHeight - window.innerHeight) > 4 || (body.scrollHeight - window.innerHeight) > 4;
    const panel = document.querySelector('#panel-notifications');
    if (!panel) return;

    // Fallback: se a página não conseguir rolar (comum em celulares pequenos), faz o painel rolar internamente
    if (!pageScrollable && window.innerWidth <= 640) {
      panel.classList.add('notif-fallback-scroll');
    } else {
      panel.classList.remove('notif-fallback-scroll');
    }
  }

  function ensureScrollSpacer(px) {
    // Garante um espaçador invisível após a lista para permitir scroll até acima do menu
    const container = document.querySelector('#notificationFeedContent') || document.querySelector('#panel-notifications .news-feed-content') || document.querySelector('#panel-notifications .notification-list') || document.querySelector('#panel-notifications');
    if (!container) return;
    let spacer = document.getElementById('notif-scroll-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'notif-scroll-spacer';
      container.appendChild(spacer);
    }
    const minH = Math.max(0, Math.round(px || 96));
    spacer.style.height = `${minH}px`;
  }

  function isNotificationsOpen() {
    const panel = document.querySelector('#panel-notifications');
    return panel && (panel.offsetParent !== null);
  }

  const ro = new ResizeObserver(() => {
    if (isNotificationsOpen()) {
      applyFeedPadding();
      ensureScrollable();
    }
  });
  const nav = document.querySelector('.mobile-bottom-nav') || document.querySelector('footer');
  if (nav) ro.observe(nav);

  window.addEventListener('resize', () => { if (isNotificationsOpen()) { applyFeedPadding(); ensureScrollable(); } });
  window.addEventListener('orientationchange', () => { if (isNotificationsOpen()) { applyFeedPadding(); ensureScrollable(); } });

  if (window.visualViewport) {
    visualViewport.addEventListener('resize', () => {
      if (isNotificationsOpen()) { applyFeedPadding(); ensureScrollable(); }
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('#notificationsTabBtn, [data-tab="notifications"], [data-open="notifications"]');
    if (t) setTimeout(() => { applyFeedPadding(); ensureScrollable(); }, 0);
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { applyFeedPadding(); ensureScrollable(); }, 0);
    setTimeout(() => { applyFeedPadding(); ensureScrollable(); }, 300);
  });

  window.__notifFix = { getMobileNavHeight, applyFeedPadding, ensureScrollable, ensureScrollSpacer };
})();
