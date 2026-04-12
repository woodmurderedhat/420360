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
  toggleChillMode,
  togglePopupPause,
  closeOverlay,
  openGameOverlay,
  openContentOverlay,
  revealNextProgressiveWord,
  startIntervals,
  stopIntervals,
  hasOpenOverlay,
  spawnPopup,
  startButtonChaos,
  stopButtonChaos,
  triggerControlChaosPulse
}) {
  function setupEventHandlers() {
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
      revealNextProgressiveWord();
      lastMorphX = e.clientX;
      lastMorphY = e.clientY;
      lastMorphTime = now;
    });

    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScrollRevealTime < config.SCROLL_REVEAL_MIN_INTERVAL) return;
      revealNextProgressiveWord();
      lastScrollRevealTime = now;
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
        case 'n': toggleCommunePanel?.(); break;
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
    const aboutBtn = document.getElementById('about-control');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', e => { e.stopPropagation(); openAbout(); });
      aboutBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAbout(); }
      });
    }

    const applyBtn = document.getElementById('apply-control');
    if (applyBtn) {
      const openApplyForm = () => {
        window.open('https://forms.gle/Tv4JTcSPm2yUBrWv7', '_blank', 'noopener');
      };
      applyBtn.addEventListener('click', e => { e.stopPropagation(); openApplyForm(); });
      applyBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openApplyForm(); }
      });
    }

    const gamesBtn = document.getElementById('games-control');
    if (gamesBtn) {
      gamesBtn.addEventListener('click', e => { e.stopPropagation(); openGamesIndex(); });
      gamesBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGamesIndex(); }
      });
    }

    const esotericBtn = document.getElementById('esoteric-control');
    if (esotericBtn) {
      esotericBtn.addEventListener('click', e => { e.stopPropagation(); openEsotericHub(); });
      esotericBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEsotericHub(); }
      });
    }

    const reviewsBtn = document.getElementById('reviews-control');
    if (reviewsBtn) {
      reviewsBtn.addEventListener('click', e => { e.stopPropagation(); openMovieReviews(); });
      reviewsBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMovieReviews(); }
      });
    }

    const issueBtn = document.getElementById('issue-report');
    if (issueBtn) {
      issueBtn.addEventListener('click', e => { e.stopPropagation(); openIssues(); });
    }

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
    if (videoBtn) {
      videoBtn.addEventListener('click', e => { e.stopPropagation(); toggleVideoWindow(); });
      videoBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVideoWindow(); }
      });
    }

    const communeBtn = document.getElementById('commune-control');
    if (communeBtn) {
      communeBtn.addEventListener('click', e => { e.stopPropagation(); toggleCommunePanel?.(); });
      communeBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCommunePanel?.(); }
      });
    }
  }

  return {
    setupEventHandlers,
    setupControlButtons
  };
}
