export function createOverlaySystem({
  config,
  state,
  escapeHtml,
  pauseBackground,
  startIntervals
}) {
  function hasOpenOverlay() {
    return document.querySelectorAll('.integrated-overlay:not(.hidden)').length > 0;
  }

  function resumeBackgroundIfNone() {
    if (!hasOpenOverlay() && !document.hidden && state.mouseActive) startIntervals();
  }

  function makeDraggableOverlay(el) {
    let isDown = false;
    let ox = 0;
    let oy = 0;
    const header = el.querySelector('header');
    if (!header) return;

    header.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      isDown = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
    });

    window.addEventListener('mousemove', e => {
      if (!isDown) return;
      el.style.left = (e.clientX - ox) + 'px';
      el.style.top = Math.max(0, e.clientY - oy) + 'px';
      el.style.transform = 'translateX(0)';
    });
  }

  function setupFocusTrap(overlay) {
    const focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const trapElement = overlay.querySelector('.overlay-focus-trap');

    if (trapElement) {
      trapElement.addEventListener('focus', () => {
        firstFocusable?.focus();
      });
    }

    overlay.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    });
  }

  function closeAllOverlays(exceptId) {
    document.querySelectorAll('.integrated-overlay:not(.hidden)').forEach(el => {
      if (el.id === exceptId) return;
      el.classList.add('hidden');
      el.classList.remove('closing');
    });
    resumeBackgroundIfNone();
  }

  function showOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;

    closeAllOverlays(id);
    el.classList.remove('hidden');
    document.body.appendChild(el);

    const firstFocusable = el.querySelector('button');
    if (firstFocusable) firstFocusable.focus();

    pauseBackground();
  }

  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (!el || el.classList.contains('hidden') || el.classList.contains('closing')) return;

    el.classList.add('closing');
    setTimeout(() => {
      el.classList.add('hidden');
      el.classList.remove('closing');
      resumeBackgroundIfNone();
    }, config.OVERLAY_FADE_DURATION);
  }

  function reloadFrame(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const ifr = el.querySelector('iframe');
    if (ifr) ifr.src = ifr.src;
  }

  function createOverlay(id, label, src) {
    if (document.getElementById(id)) return;

    const wrap = document.createElement('div');
    wrap.id = id;
    wrap.className = 'integrated-overlay hidden';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', label);
    wrap.setAttribute('aria-modal', 'true');

    wrap.innerHTML = `
      <header>
        <span>${escapeHtml(label)}</span>
        <div style="display:flex;gap:6px;">
          <button data-act="external" title="Open in new tab" aria-label="Open in new tab">↗</button>
          <button data-act="reload" title="Reload" aria-label="Reload content">⟳</button>
          <button data-act="close" title="Close" aria-label="Close overlay">✕</button>
        </div>
      </header>
      <iframe src="${escapeHtml(src)}" loading="lazy" title="${escapeHtml(label)}"></iframe>
      <div class="overlay-focus-trap" tabindex="0" aria-hidden="true"></div>
    `;

    document.body.appendChild(wrap);
    makeDraggableOverlay(wrap);

    wrap.querySelector('[data-act="reload"]').addEventListener('click', e => {
      e.stopPropagation();
      reloadFrame(id);
    });

    wrap.querySelector('[data-act="close"]').addEventListener('click', e => {
      e.stopPropagation();
      closeOverlay(id);
    });

    wrap.querySelector('[data-act="external"]').addEventListener('click', e => {
      e.stopPropagation();
      const ifr = wrap.querySelector('iframe');
      if (ifr) window.open(ifr.src, '_blank', 'noopener');
    });

    setupFocusTrap(wrap);
  }

  function openAbout() {
    createOverlay('aboutOverlay', 'ABOUT • 420360', 'about/index.html');
    showOverlay('aboutOverlay');
  }

  function openOracle() {
    createOverlay('oracleOverlay', 'TIM • DIALOGUE ORACLE', 'games/tim-the-dialogue-oracle/index.html');
    showOverlay('oracleOverlay');
  }

  function openGamesIndex() {
    createOverlay('gamesIndexOverlay', 'GAMES • 420360', 'games/index.html');
    showOverlay('gamesIndexOverlay');
  }

  function openBoardIndex() {
    createOverlay('boardIndexOverlay', 'BOARD • 420360', 'board/index.html');
    showOverlay('boardIndexOverlay');
  }

  function openEsotericHub() {
    createOverlay('esotericHubOverlay', 'ESOTERIC HUB • 420360', 'esoteric/index.html');
    showOverlay('esotericHubOverlay');
  }

  function openMovieReviews() {
    createOverlay('movieReviewsOverlay', 'MOVIE REVIEWS • 420360', 'movie-reviews/index.html');
    showOverlay('movieReviewsOverlay');
  }

  function openDaughtersIndex() {
    openEsotericHub();
  }

  function openGameOverlay(label, url) {
    const rel = url.replace(/^https?:\/\/420360\.xyz\//, '');
    let el = document.getElementById('gameOverlay');

    if (!el) {
      createOverlay('gameOverlay', label, rel);
      el = document.getElementById('gameOverlay');
    } else {
      const headerSpan = el.querySelector('header span');
      if (headerSpan) headerSpan.textContent = label.toUpperCase();
      const iframe = el.querySelector('iframe');
      if (iframe) iframe.src = rel;
    }
    showOverlay('gameOverlay');
  }

  function openContentOverlay(label, url) {
    const elId = 'contentOverlay';
    let el = document.getElementById(elId);

    if (!el) {
      createOverlay(elId, label, url);
      el = document.getElementById(elId);
    } else {
      const headerSpan = el.querySelector('header span');
      if (headerSpan) headerSpan.textContent = label.toUpperCase();
      const iframe = el.querySelector('iframe');
      if (iframe) iframe.src = url;
    }
    showOverlay(elId);
  }

  function makeDraggableFloatingWindow(el) {
    let isDown = false;
    let ox = 0;
    let oy = 0;
    const header = el.querySelector('header');
    if (!header) return;

    header.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      isDown = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
    });

    window.addEventListener('mousemove', e => {
      if (!isDown) return;
      const newLeft = e.clientX - ox;
      const newTop = e.clientY - oy;
      const maxLeft = window.innerWidth - el.offsetWidth;
      const maxTop = window.innerHeight - el.offsetHeight;
      el.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
      el.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
      el.style.transform = 'none';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    });
  }

  function createFloatingWindow(id, label, src, loadImmediately = false) {
    if (document.getElementById(id)) return;

    const wrap = document.createElement('div');
    wrap.id = id;
    wrap.className = 'floating-window' + (loadImmediately ? '' : ' hidden');

    const iframeSrc = loadImmediately ? src : 'about:blank';
    wrap.dataset.lazySrc = src;

    wrap.innerHTML = `
      <header>
        <span>${escapeHtml(label)}</span>
        <div style="display:flex;gap:3px;">
          <button data-act="minimize" title="Minimize" aria-label="Minimize window">_</button>
          <button data-act="external" title="Open in new tab" aria-label="Open in new tab">↗</button>
          <button data-act="close" title="Close" aria-label="Close window">✕</button>
        </div>
      </header>
      <iframe src="${iframeSrc}" loading="lazy" title="${escapeHtml(label)}"></iframe>
    `;

    document.body.appendChild(wrap);
    makeDraggableFloatingWindow(wrap);

    wrap.querySelector('[data-act="minimize"]').addEventListener('click', e => {
      e.stopPropagation();
      toggleMinimizeFloatingWindow(id);
    });

    wrap.querySelector('[data-act="close"]').addEventListener('click', e => {
      e.stopPropagation();
      closeFloatingWindow(id);
    });

    wrap.querySelector('[data-act="external"]').addEventListener('click', e => {
      e.stopPropagation();
      const ifr = wrap.querySelector('iframe');
      if (ifr && ifr.src !== 'about:blank') {
        window.open(ifr.src, '_blank', 'noopener');
      } else if (wrap.dataset.lazySrc) {
        window.open(wrap.dataset.lazySrc, '_blank', 'noopener');
      }
    });
  }

  function toggleMinimizeFloatingWindow(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('minimized');
    const btn = el.querySelector('[data-act="minimize"]');
    if (btn) btn.textContent = el.classList.contains('minimized') ? '□' : '_';
  }

  function closeFloatingWindow(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
  }

  function showFloatingWindow(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (!state.videoWindowLoaded && el.dataset.lazySrc) {
      const iframe = el.querySelector('iframe');
      if (iframe && iframe.src === 'about:blank') {
        iframe.src = el.dataset.lazySrc;
        state.videoWindowLoaded = true;
      }
    }

    el.classList.remove('hidden');
  }

  return {
    hasOpenOverlay,
    resumeBackgroundIfNone,
    makeDraggableOverlay,
    createOverlay,
    setupFocusTrap,
    closeAllOverlays,
    showOverlay,
    closeOverlay,
    reloadFrame,
    openAbout,
    openOracle,
    openGamesIndex,
    openBoardIndex,
    openEsotericHub,
    openMovieReviews,
    openDaughtersIndex,
    openGameOverlay,
    openContentOverlay,
    makeDraggableFloatingWindow,
    createFloatingWindow,
    toggleMinimizeFloatingWindow,
    closeFloatingWindow,
    showFloatingWindow
  };
}
