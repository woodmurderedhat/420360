export function createPopupSystem({
  state,
  config,
  ads,
  iconData,
  popupColorSchemes,
  escapeHtml,
  onOpenOracle
}) {
  function rectsOverlap(x, y, w, h, el) {
    const r = el.getBoundingClientRect();
    return !(x + w < r.left || x > r.right || y + h < r.top || y > r.bottom);
  }

  function findNonOverlappingPosition() {
    const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-w')) || 250;
    const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-h')) || 150;
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);

    for (let i = 0; i < config.NON_OVERLAP_ATTEMPTS; i++) {
      const x = Math.floor(Math.random() * (maxX + 1));
      const y = Math.floor(Math.random() * (maxY + 1));
      let collides = false;

      for (const existing of state.activePopups) {
        if (!existing || !existing.getBoundingClientRect) continue;
        if (rectsOverlap(x, y, w, h, existing)) {
          collides = true;
          break;
        }
      }
      if (!collides) return { x, y };
    }

    return {
      x: Math.floor(Math.random() * (maxX + 1)),
      y: Math.floor(Math.random() * (maxY + 1))
    };
  }

  function removePopupElement(el) {
    if (!el) return;
    const idx = state.activePopups.indexOf(el);
    if (idx !== -1) state.activePopups.splice(idx, 1);
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  function makePopup(ad) {
    const p = document.createElement('div');
    p.className = 'popup';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', `Popup: ${ad.label}`);

    const rotation = (Math.random() * 12 - 6).toFixed(2) + 'deg';
    const scale = (1 + (Math.random() * 0.08 - 0.04)).toFixed(3);
    p.style.setProperty('--rotation', rotation);
    p.style.transform = `scale(${scale}) rotate(${rotation})`;

    const selectedScheme = popupColorSchemes[Math.floor(Math.random() * popupColorSchemes.length)];
    p.style.setProperty('--bg', selectedScheme.bg);
    p.style.setProperty('--primary', selectedScheme.primary);
    p.style.setProperty('--secondary', selectedScheme.secondary);
    p.style.setProperty('--highlight', selectedScheme.highlight);

    const pos = findNonOverlappingPosition();
    p.style.left = pos.x + 'px';
    p.style.top = pos.y + 'px';

    p.innerHTML = `
      <div class="titlebar" role="presentation">
        <div class="left">
          <img src="${iconData}" alt="" aria-hidden="true">
          <span>${escapeHtml(ad.label)}</span>
        </div>
        <div class="close" role="button" aria-label="Close popup" tabindex="0">×</div>
      </div>
      <div class="content">
        <a href="${escapeHtml(ad.href)}" target="_blank" rel="noopener noreferrer" data-ad-link>
          <img src="${escapeHtml(ad.gif)}" alt="${escapeHtml(ad.label)} animation" loading="lazy">
        </a>
      </div>
    `;

    const closeBtn = p.querySelector('.close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removePopupElement(p);
    });
    closeBtn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        removePopupElement(p);
      }
    });

    document.body.appendChild(p);

    const link = p.querySelector('[data-ad-link]');
    if (ad.href === '__INTERNAL_ORACLE__' && link) {
      link.removeAttribute('target');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onOpenOracle();
      });
    }

    state.activePopups.push(p);
    setTimeout(() => removePopupElement(p), config.POPUP_LIFETIME_MS);

    while (state.activePopups.length > config.MAX_POPUPS) {
      const old = state.activePopups.shift();
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }

    return p;
  }

  function spawnPopup() {
    if (state.popupsPaused) return null;
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const p = makePopup(ad);
    if (window.playAdSfx) window.playAdSfx();
    return p;
  }

  function randomPopupGlitchOut() {
    if (!state.activePopups.length) return;
    const popup = state.activePopups[Math.floor(Math.random() * state.activePopups.length)];
    if (!popup) return;

    const effects = [
      { cls: 'glitch-out', dur: 400 },
      { cls: 'glitch-fade', dur: 500 },
      { cls: 'glitch-slide', dur: 420 },
      { cls: 'glitch-scale', dur: 350 }
    ];

    if (effects.some(e => popup.classList.contains(e.cls))) return;

    const effect = effects[Math.floor(Math.random() * effects.length)];
    popup.classList.add(effect.cls);
    setTimeout(() => removePopupElement(popup), effect.dur);
  }

  return {
    rectsOverlap,
    findNonOverlappingPosition,
    removePopupElement,
    makePopup,
    spawnPopup,
    randomPopupGlitchOut
  };
}
