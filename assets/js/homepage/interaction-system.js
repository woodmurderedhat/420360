export function createInteractionSystem({
  state,
  config,
  openAbout,
  openGamesIndex,
  openBoardIndex,
  openEsotericHub,
  openMovieReviews,
  openDaughtersIndex,
  openOracle,
  openIssues,
  toggleVideoWindow,
  toggleCommunePanel,
  isCommuneAvailable,
  toggleChillMode,
  togglePopupPause,
  closeOverlay,
  openGameOverlay,
  openContentOverlay,
  startIntervals,
  stopIntervals,
  hasOpenOverlay,
  spawnPopup,
  startButtonChaos,
  stopButtonChaos,
  triggerControlChaosPulse
}) {
  function bindActivatable(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;

    const activate = event => {
      if (el.getAttribute('aria-disabled') === 'true' || el.disabled) return;
      event?.stopPropagation?.();
      handler();
    };

    el.addEventListener('click', activate);
    el.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(event);
      }
    });
  }

  function renderHeroActions() {
    const container = document.querySelector('.hero-actions');
    if (!container) return;

    const actions = [
      { id: 'hero-about-action', label: 'ABOUT', shortcut: 'A', emote: '(i_i)' },
      { id: 'hero-games-action', label: 'GAMES', shortcut: 'G', emote: '(^_^)' },
      { id: 'hero-board-action', label: 'BOARD', shortcut: 'B', emote: '[#_#]' },
      { id: 'hero-reviews-action', label: 'REVIEWS', shortcut: 'R', emote: '(>_<)' },
      { id: 'hero-oracle-action', label: 'ORACLE', shortcut: 'O', emote: '(?_?)' },
      { id: 'hero-commune-action', label: 'COMMUNE', shortcut: 'N', emote: '(@_@)' }
    ];

    container.innerHTML = actions.map(action => `
      <button id="${action.id}" class="hero-action-link" type="button" aria-label="${action.label} shortcut ${action.shortcut}">
        <span class="hero-action-icon" aria-hidden="true">${action.emote}</span>
        <span class="hero-action-copy">${action.label}</span>
        <span class="hero-action-key" aria-hidden="true">${action.shortcut}</span>
      </button>
    `).join('');
  }

  function setInteractiveDisabledState(id, disabled, title) {
    const el = document.getElementById(id);
    if (!el) return;

    if (title) el.setAttribute('title', title);
    else el.removeAttribute('title');

    el.classList.toggle('control-disabled', disabled);
    el.setAttribute('aria-disabled', disabled ? 'true' : 'false');

    if ('disabled' in el) {
      el.disabled = disabled;
    }

    if (disabled) {
      if (el.hasAttribute('tabindex')) {
        el.dataset.restoreTabindex = el.getAttribute('tabindex');
        el.setAttribute('tabindex', '-1');
      }
    } else if (Object.prototype.hasOwnProperty.call(el.dataset, 'restoreTabindex')) {
      el.setAttribute('tabindex', el.dataset.restoreTabindex);
      delete el.dataset.restoreTabindex;
    }
  }

  function setInteractiveLabel(id, label) {
    const el = document.getElementById(id);
    if (!el) return;

    const controlLabel = el.querySelector('.ctrl-btn-label');
    if (controlLabel) controlLabel.textContent = label;

    const heroLabel = el.querySelector('.hero-action-copy');
    if (heroLabel) heroLabel.textContent = label;
  }

  function syncCommuneAvailability(status = 'loading') {
    const isReady = status === 'ready';
    const label = isReady ? 'COMMUNE' : status === 'unavailable' ? 'COMMUNE: OFF' : 'COMMUNE ...';
    const title = isReady
      ? 'Open commune panel (N)'
      : status === 'unavailable'
        ? 'Commune is unavailable right now'
        : 'Commune is connecting...';

    ['commune-control', 'hero-commune-action'].forEach(id => {
      setInteractiveLabel(id, label);
      setInteractiveDisabledState(id, !isReady, title);
    });
  }

  function openCommune() {
    if (typeof isCommuneAvailable === 'function' && !isCommuneAvailable()) return;
    toggleCommunePanel?.();
  }

  function setupEventHandlers() {
    syncCommuneAvailability(
      typeof isCommuneAvailable === 'function' && isCommuneAvailable() ? 'ready' : 'loading'
    );

    window.addEventListener('homepage:addons-status', event => {
      syncCommuneAvailability(event?.detail?.status || 'loading');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopIntervals();
      else if (state.mouseActive) startIntervals();
    });

    window.addEventListener('pagehide', () => stopIntervals());
    window.addEventListener('pageshow', () => {
      if (!document.hidden && state.mouseActive) startIntervals();
    });

    let lastMorphX = null;
    let lastMorphY = null;
    let lastMorphTime = 0;
    let lastScrollRevealTime = 0;
    const glitchPresets = ['cinematic', 'chaotic', 'subtle', 'mobileSafe'];
    let glitchPresetIndex = 0;

    const applyGlitchPreset = (nextIndex) => {
      glitchPresetIndex = (nextIndex + glitchPresets.length) % glitchPresets.length;
      window.glitchEngine?.setPreset?.(glitchPresets[glitchPresetIndex]);
    };

    document.addEventListener('pointermove', (e) => {
      const animationsAllowed = !state.reducedMotion;

      if (animationsAllowed && !state.mouseActive) {
        state.mouseActive = true;
        if (!document.hidden && !hasOpenOverlay()) {
          startIntervals();
        }
      }

      if (animationsAllowed) {
        if (state.mouseIdleTimeoutId) clearTimeout(state.mouseIdleTimeoutId);
        state.mouseIdleTimeoutId = setTimeout(() => {
          state.mouseActive = false;
          state.mouseIdleTimeoutId = null;
          stopIntervals();
        }, config.MOUSE_IDLE_TIMEOUT);
      }

      const now = Date.now();
      if (now - lastMorphTime < config.POINTER_REVEAL_MIN_INTERVAL) return;
      if (lastMorphX !== null) {
        const dx = e.clientX - lastMorphX;
        const dy = e.clientY - lastMorphY;
        if (Math.sqrt(dx * dx + dy * dy) < config.POINTER_REVEAL_MIN_DISTANCE) return;
      }
      lastMorphX = e.clientX;
      lastMorphY = e.clientY;
      lastMorphTime = now;
    });

    window.addEventListener('scroll', () => {
      lastScrollRevealTime = Date.now();
    }, { passive: true });

    let lastWheelGlitchAt = 0;
    window.addEventListener('wheel', (ev) => {
      const now = Date.now();
      if (now - lastWheelGlitchAt < 90) return;

      if (ev.shiftKey) {
        applyGlitchPreset(glitchPresetIndex + (ev.deltaY < 0 ? -1 : 1));
        lastWheelGlitchAt = now;
        return;
      }

      if (ev.deltaY < 0) {
        window.glitchEngine?.triggerScrollUp?.();
        lastWheelGlitchAt = now;
        return;
      }
      if (ev.deltaY > 0) {
        window.glitchEngine?.triggerScrollDown?.();
        lastWheelGlitchAt = now;
      }
    }, { passive: true });

    let lastClick = 0;
    document.addEventListener('click', (ev) => {
      const now = Date.now();

      const isPrimaryClick = ev.button === 0 || ev.button === undefined;
      const hasModifier = ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey;
      if (isPrimaryClick && !hasModifier) {
        window.glitchEngine?.triggerClickTear?.();
      }

      if (ev.target.closest('.integrated-overlay')) return;
      if (ev.target.closest('.ctrl-btn')) return;
      if (ev.target.closest('.hero-action-link')) return;
      if (ev.target.closest('.floating-window')) return;
      if (now - lastClick > 120) {
        spawnPopup();
        lastClick = now;
      }
    });

    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'a': openAbout(); break;
        case 'g': openGamesIndex(); break;
        case 'b': openBoardIndex(); break;
        case 'e': openEsotericHub(); break;
        case 'r': openMovieReviews(); break;
        case 'd': openDaughtersIndex(); break;
        case 'o': openOracle(); break;
        case 'i': openIssues(); break;
        case 'v': toggleVideoWindow(); break;
        case 'n': openCommune(); break;
        case 'c': toggleChillMode(); break;
        case 'p': togglePopupPause(); break;
        case 'x': triggerControlChaosPulse(); break;
        case '[': applyGlitchPreset(glitchPresetIndex - 1); break;
        case ']': applyGlitchPreset(glitchPresetIndex + 1); break;
        case '1': window.glitchEngine?.setQualityTier?.('low'); break;
        case '2': window.glitchEngine?.setQualityTier?.('balanced'); break;
        case '3': window.glitchEngine?.setQualityTier?.('high'); break;
        case 'escape':
          document.querySelectorAll('.integrated-overlay:not(.hidden)').forEach(el => closeOverlay(el.id));
          break;
      }
    });

    document.addEventListener('click', (e) => {
      const a = e.target.closest('.popup a');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      if (!href) return;

      if (href === '__INTERNAL_ORACLE__') {
        e.preventDefault();
        openOracle();
        return;
      }

      const OVERLAY_BLOCKLIST = [/youtube\.com/i, /youtu\.be/i, /discord\.gg/i, /giphy\.com/i, /redbubble\.com/i];
      if (OVERLAY_BLOCKLIST.some(r => r.test(href))) {
        a.setAttribute('target', '_blank');
        return;
      }

      e.preventDefault();
      let label = 'LINK';
      const popup = a.closest('.popup');
      if (popup) {
        const span = popup.querySelector('.titlebar span');
        if (span) label = span.textContent.trim();
      }

      if (/420360\.xyz\/games\//.test(href) || /^games\//.test(href) || /\/games\//.test(href)) {
        openGameOverlay(label + ' • 420360', href);
      } else {
        openContentOverlay(label + ' • EXT', href);
      }
    });

    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'open-game' && data.url) {
          const label = (data.label || 'GAME') + ' • 420360';
          openGameOverlay(label, data.url);
        }
        if (data.type === 'close-overlay' && data.id) {
          closeOverlay(data.id);
        }
        if (data.type === 'story-visit' && data.story) {
          ['keepersOfTheFlamGamification', 'daughtersGame', 'goldenDawnGamification'].forEach(name => {
            if (window[name]?.trackPageVisit) {
              try { window[name].trackPageVisit(data.story); } catch (err) {}
            }
          });
        }
      } catch (err) {}
    });
  }

  function setupControlButtons() {
    renderHeroActions();

    const openApplyForm = () => {
      window.open('https://forms.gle/Tv4JTcSPm2yUBrWv7', '_blank', 'noopener');
    };

    bindActivatable('about-control', openAbout);
    bindActivatable('hero-about-action', openAbout);
    bindActivatable('apply-control', openApplyForm);
    bindActivatable('games-control', openGamesIndex);
    bindActivatable('hero-games-action', openGamesIndex);
    bindActivatable('board-control', openBoardIndex);
    bindActivatable('hero-board-action', openBoardIndex);
    bindActivatable('esoteric-control', openEsotericHub);
    bindActivatable('reviews-control', openMovieReviews);
    bindActivatable('hero-reviews-action', openMovieReviews);
    bindActivatable('oracle-control', openOracle);
    bindActivatable('hero-oracle-action', openOracle);
    bindActivatable('issue-report', openIssues);

    const legalBtn = document.getElementById('legal-control');
    if (legalBtn) {
      legalBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = '/legal.html';
        }
      });
    }

    document.querySelectorAll('#taskbar .ctrl-btn, #start-menu .ctrl-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => startButtonChaos(btn));
      btn.addEventListener('mouseleave', () => stopButtonChaos(btn));
    });

    const chillBtn = document.getElementById('chill-control');
    if (chillBtn) {
      chillBtn.addEventListener('click', e => { e.stopPropagation(); toggleChillMode(); });
      chillBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleChillMode(); }
      });
    }

    const popupBtn = document.getElementById('popup-control');
    if (popupBtn) {
      popupBtn.addEventListener('click', e => { e.stopPropagation(); togglePopupPause(); });
      popupBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePopupPause(); }
      });
    }

    const videoBtn = document.getElementById('video-control');
    if (videoBtn) bindActivatable('video-control', toggleVideoWindow);

    const communeBtn = document.getElementById('commune-control');
    if (communeBtn) bindActivatable('commune-control', openCommune);
    bindActivatable('hero-commune-action', openCommune);

    syncCommuneAvailability(
      typeof isCommuneAvailable === 'function' && isCommuneAvailable() ? 'ready' : 'loading'
    );
  }

  return {
    setupEventHandlers,
    setupControlButtons
  };
}
