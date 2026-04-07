/**
 * 420360 Homepage JavaScript
 * Extracted and improved from index.html
 * 
 * Features:
 * - Popup system with spawn control
 * - Overlay windows for content
 * - Music & SFX system with persistence
 * - Chill mode for reduced animations
 * - Accessibility improvements
 */

import { CONFIG, ICON_DATA, ADS, POPUP_COLOR_SCHEMES } from './homepage/config.js';
import { state } from './homepage/state.js';
import { loadPreference, savePreference } from './homepage/storage.js';
import {
  getRegionMinimumAge,
  loadAgeGateProfile,
  saveAgeGateProfile,
  isAgeGateValid
} from './homepage/age-gate.js';
import { createIntervalManager } from './homepage/interval-manager.js';
import { createMusicSystem, createSfxSystem } from './homepage/audio-system.js';
import { ensureAgeGateAccess } from './homepage/init-flow.js';
import { createPopupSystem } from './homepage/popup-system.js';
import { createTextSystem } from './homepage/text-system.js';

function getThemeSentences() {
  return [
    `420360 is now a cannabis-first arcade dreamspace. Neon smoke drifts through popup windows, cartridges hum in the background, and each click opens a new chill loop between play, art, and curiosity.`,
    `Roll into the glitch: this is where marijuana culture meets 90s browser chaos. Spark up your focus, surf retro controls, and let pixel storms turn into late-night stoner mythology.`,
    `No gatekeeping, no hard sell, just a mellow digital hangout for adults. Browse weird experiments, launch arcade runs, and settle into a paced, low-pressure cannabis vibe.`,
    `Chill mode is a ritual here: breathe, play, and drift. 420360 treats the web like a smoke circle made of code, memory, and bright analog nostalgia.`
  ];
}


/* ============================================
  SENTENCES FOR BLURB (global, loaded via script)
  ============================================ */
// SENTENCES is now loaded globally from sentences.js

/* ============================================
   AD/POPUP DATA
   ============================================ */

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, m => escapeMap[m]);
}


const textSystem = createTextSystem({
  state,
  config: CONFIG,
  getSentencesFallback: () => (
    typeof window !== 'undefined' && Array.isArray(window.SENTENCES)
      ? window.SENTENCES
      : []
  )
});

function randomGlitchString(len) {
  return textSystem.randomGlitchString(len);
}

function setBlurbText(sentence) {
  return textSystem.setBlurbText(sentence);
}

function initializeProgressiveSentence() {
  return textSystem.initializeProgressiveSentence();
}

function applyProgressiveReveal() {
  return textSystem.applyProgressiveReveal();
}

function revealNextProgressiveWord() {
  return textSystem.revealNextProgressiveWord();
}

function glitchRandomWord() {
  return textSystem.glitchRandomWord();
}

function fullGlitch() {
  return textSystem.fullGlitch();
}

function morphToRandomSentence() {
  return textSystem.morphToRandomSentence();
}

// ======== burst control ========


/* ============================================
   POPUP MANAGEMENT SYSTEM
   ============================================ */

const popupSystem = createPopupSystem({
  state,
  config: CONFIG,
  ads: ADS,
  iconData: ICON_DATA,
  popupColorSchemes: POPUP_COLOR_SCHEMES,
  escapeHtml,
  onOpenOracle: openOracle
});

function rectsOverlap(x, y, w, h, el) {
  return popupSystem.rectsOverlap(x, y, w, h, el);
}

function findNonOverlappingPosition() {
  return popupSystem.findNonOverlappingPosition();
}

function removePopupElement(el) {
  return popupSystem.removePopupElement(el);
}

function makePopup(ad) {
  return popupSystem.makePopup(ad);
}

function spawnPopup() {
  return popupSystem.spawnPopup();
}

function randomPopupGlitchOut() {
  return popupSystem.randomPopupGlitchOut();
}

/* ============================================
   OVERLAY SYSTEM
   ============================================ */

/**
 * Make an overlay draggable
 */
function makeDraggableOverlay(el) {
  let isDown = false, ox = 0, oy = 0;
  const header = el.querySelector('header');
  if (!header) return;

  header.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    isDown = true;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
  });

  window.addEventListener('mouseup', () => isDown = false);

  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    el.style.left = (e.clientX - ox) + 'px';
    el.style.top = Math.max(0, e.clientY - oy) + 'px';
    el.style.transform = 'translateX(0)';
  });
}

/**
 * Create an overlay
 */
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

  // Button handlers
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

  // Focus trap
  setupFocusTrap(wrap);
}

/**
 * Setup focus trap for accessibility
 */
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

/**
 * Close all overlays except specified one
 */
function closeAllOverlays(exceptId) {
  document.querySelectorAll('.integrated-overlay:not(.hidden)').forEach(el => {
    if (el.id === exceptId) return;
    el.classList.add('hidden');
    el.classList.remove('closing');
  });
  resumeBackgroundIfNone();
}

/**
 * Show an overlay
 */
function showOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;

  closeAllOverlays(id);
  el.classList.remove('hidden');
  document.body.appendChild(el); // Move to end for stacking

  // Focus the first focusable element
  const firstFocusable = el.querySelector('button');
  if (firstFocusable) firstFocusable.focus();

  pauseBackground();
}

/**
 * Close an overlay with animation
 */
function closeOverlay(id) {
  const el = document.getElementById(id);
  if (!el || el.classList.contains('hidden') || el.classList.contains('closing')) return;

  el.classList.add('closing');
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('closing');
    resumeBackgroundIfNone();
  }, CONFIG.OVERLAY_FADE_DURATION);
}

/**
 * Reload iframe in overlay
 */
function reloadFrame(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const ifr = el.querySelector('iframe');
  if (ifr) ifr.src = ifr.src;
}

// Overlay opener functions
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

/* ============================================
   FLOATING WINDOW SYSTEM
   ============================================ */

function makeDraggableFloatingWindow(el) {
  let isDown = false, ox = 0, oy = 0;
  const header = el.querySelector('header');
  if (!header) return;

  header.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    isDown = true;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
  });

  window.addEventListener('mouseup', () => isDown = false);

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

  // Lazy load the iframe if needed
  if (!state.videoWindowLoaded && el.dataset.lazySrc) {
    const iframe = el.querySelector('iframe');
    if (iframe && iframe.src === 'about:blank') {
      iframe.src = el.dataset.lazySrc;
      state.videoWindowLoaded = true;
    }
  }

  el.classList.remove('hidden');
}

/* ============================================
   INTERVAL MANAGEMENT
   ============================================ */

const intervalManager = createIntervalManager({
  state,
  config: CONFIG,
  spawnPopup,
  glitchRandomWord,
  morphToRandomSentence,
  startColorChaos,
  stopColorChaos
});

function getIntervals() {
  return intervalManager.getIntervals();
}

function startMorphBurst() {
  return intervalManager.startMorphBurst();
}

function doBurstStep(step) {
  return intervalManager.doBurstStep(step);
}

function endMorphBurst() {
  return intervalManager.endMorphBurst();
}

function startIntervals() {
  return intervalManager.startIntervals();
}

function stopIntervals() {
  return intervalManager.stopIntervals();
}

function restartIntervals() {
  return intervalManager.restartIntervals();
}

function pauseBackground() {
  return intervalManager.pauseBackground();
}

function hasOpenOverlay() {
  return document.querySelectorAll('.integrated-overlay:not(.hidden)').length > 0;
}

function resumeBackgroundIfNone() {
  if (!hasOpenOverlay() && !document.hidden && state.mouseActive) startIntervals();
}

/* ============================================
   MUSIC SYSTEM
   ============================================ */

const MusicSystem = createMusicSystem({
  state,
  config: CONFIG,
  loadPreference,
  savePreference
});

/* ============================================
   SFX SYSTEM
   ============================================ */

const SFXSystem = createSfxSystem({
  state,
  config: CONFIG,
  loadPreference,
  savePreference
});

/* ============================================
   CHILL MODE TOGGLE
   ============================================ */

function toggleChillMode() {
  state.chillMode = !state.chillMode;
  savePreference(CONFIG.STORAGE_KEYS.CHILL_MODE, state.chillMode);

  const btn = document.getElementById('chill-control');
  if (btn) {
    btn.classList.toggle('chill-active', state.chillMode);
    const label = btn.querySelector('.ctrl-btn-label');
    if (label) label.textContent = state.chillMode ? 'CHILL: ON' : 'CHILL';
  }

  // Restart intervals with new timing
  restartIntervals();
}

/**
 * Update chill button visibility based on popup state
 */
function updateChillButtonVisibility() {
  const chillBtn = document.getElementById('chill-control');
  if (chillBtn) {
    // Show chill button only when popups are active
    if (state.popupsPaused) {
      chillBtn.style.display = 'none';
    } else {
      chillBtn.style.display = 'flex';
    }
  }
}

/* ============================================
   POPUP PAUSE TOGGLE
   ============================================ */

function togglePopupPause() {
  state.popupsPaused = !state.popupsPaused;
  savePreference(CONFIG.STORAGE_KEYS.POPUPS_PAUSED, state.popupsPaused);

  const btn = document.getElementById('popup-control');
  if (btn) {
    btn.classList.toggle('popups-paused', state.popupsPaused);
    const label = btn.querySelector('.ctrl-btn-label');
    if (label) label.textContent = state.popupsPaused ? 'POPUPS: OFF' : 'POPUPS: ON';
  }

  // Update chill button visibility
  updateChillButtonVisibility();

  // If pausing, stop the popup interval; if resuming, restart
  if (state.popupsPaused) {
    if (state.intervalIds.popup) {
      clearInterval(state.intervalIds.popup);
      state.intervalIds.popup = null;
    }
  } else {
    const intervals = getIntervals();
    if (!state.intervalIds.popup && intervals.popup > 0) {
      state.intervalIds.popup = setInterval(spawnPopup, intervals.popup);
    }
  }
}

/* ============================================
   VIDEO WINDOW TOGGLE
   ============================================ */

function toggleVideoWindow() {
  const el = document.getElementById('videoThreadWindow');
  if (!el) {
    // Create if doesn't exist
    createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);
    showFloatingWindow('videoThreadWindow');
  } else if (el.classList.contains('hidden')) {
    showFloatingWindow('videoThreadWindow');
  } else {
    closeFloatingWindow('videoThreadWindow');
  }
}

/* ============================================
   EVENT HANDLERS
   ============================================ */

function setupEventHandlers() {
  // Visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopIntervals();
    else if (state.mouseActive) startIntervals();
  });

  window.addEventListener('pagehide', () => stopIntervals());
  window.addEventListener('pageshow', () => {
    if (!document.hidden && state.mouseActive) startIntervals();
  });

  // Start/stop animations and reveal words based on movement
  let lastMorphX = null, lastMorphY = null, lastMorphTime = 0;
  let lastScrollRevealTime = 0;
  document.addEventListener('pointermove', (e) => {
    const animationsAllowed = !state.reducedMotion;

    // Activate animations on mouse movement
    if (animationsAllowed && !state.mouseActive) {
      state.mouseActive = true;
      if (!document.hidden && !hasOpenOverlay()) {
        startIntervals();
      }
    }

    // Reset idle timer — stop animations when mouse goes still
    if (animationsAllowed) {
      if (state.mouseIdleTimeoutId) clearTimeout(state.mouseIdleTimeoutId);
      state.mouseIdleTimeoutId = setTimeout(() => {
        state.mouseActive = false;
        state.mouseIdleTimeoutId = null;
        stopIntervals();
      }, CONFIG.MOUSE_IDLE_TIMEOUT);
    }

    // Progressive reveal on pointer movement (throttled by distance + time)
    const now = Date.now();
    if (now - lastMorphTime < CONFIG.POINTER_REVEAL_MIN_INTERVAL) return;
    if (lastMorphX !== null) {
      const dx = e.clientX - lastMorphX;
      const dy = e.clientY - lastMorphY;
      if (Math.sqrt(dx * dx + dy * dy) < CONFIG.POINTER_REVEAL_MIN_DISTANCE) return;
    }
    revealNextProgressiveWord();
    lastMorphX = e.clientX;
    lastMorphY = e.clientY;
    lastMorphTime = now;
  });

  // Reveal words on scroll as well
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollRevealTime < CONFIG.SCROLL_REVEAL_MIN_INTERVAL) return;
    revealNextProgressiveWord();
    lastScrollRevealTime = now;
  }, { passive: true });

  // Directional wheel glitch triggers: up and down map to distinct profiles.
  let lastWheelGlitchAt = 0;
  window.addEventListener('wheel', (ev) => {
    const now = Date.now();
    if (now - lastWheelGlitchAt < 90) return;

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

  // Click to spawn popup
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

  // Keyboard shortcuts
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
      case 'c': toggleChillMode(); break;
      case 'p': togglePopupPause(); break;
      case 'escape':
        document.querySelectorAll('.integrated-overlay:not(.hidden)').forEach(el => closeOverlay(el.id));
        break;
    }
  });

  // Popup link interception
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

    // Blocklist
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

  // PostMessage API
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
        // Forward to gamification systems
        ['keepersOfTheFlamGamification', 'daughtersGame', 'goldenDawnGamification'].forEach(name => {
          if (window[name]?.trackPageVisit) {
            try { window[name].trackPageVisit(data.story); } catch (err) {}
          }
        });
      }
    } catch (err) {}
  });
}

function openIssues() {
  window.open('https://github.com/woodmurderedhat/420360/issues/new/choose', '_blank', 'noopener');
}

function setupControlButtons() {
  // About button
  const aboutBtn = document.getElementById('about-control');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', e => { e.stopPropagation(); openAbout(); });
    aboutBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAbout(); }
    });
  }

  // Games button
  const gamesBtn = document.getElementById('games-control');
  if (gamesBtn) {
    gamesBtn.addEventListener('click', e => { e.stopPropagation(); openGamesIndex(); });
    gamesBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGamesIndex(); }
    });
  }

  // Esoteric button
  const esotericBtn = document.getElementById('esoteric-control');
  if (esotericBtn) {
    esotericBtn.addEventListener('click', e => { e.stopPropagation(); openEsotericHub(); });
    esotericBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEsotericHub(); }
    });
  }

  // Reviews button
  const reviewsBtn = document.getElementById('reviews-control');
  if (reviewsBtn) {
    reviewsBtn.addEventListener('click', e => { e.stopPropagation(); openMovieReviews(); });
    reviewsBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMovieReviews(); }
    });
  }

  // Issue report button
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

  // Add hover chaos handlers to every control button. motion will start
  // on mouseenter and stop/reset on mouseleave.
  document.querySelectorAll('#header-controls .ctrl-btn, #bottom-controls-left .ctrl-btn, #bottom-controls-right .ctrl-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => startButtonChaos(btn));
    btn.addEventListener('mouseleave', () => stopButtonChaos(btn));
  });

  // Chill mode button
  const chillBtn = document.getElementById('chill-control');
  if (chillBtn) {
    chillBtn.addEventListener('click', e => { e.stopPropagation(); toggleChillMode(); });
    chillBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleChillMode(); }
    });
  }

  // Popup pause button
  const popupBtn = document.getElementById('popup-control');
  if (popupBtn) {
    popupBtn.addEventListener('click', e => { e.stopPropagation(); togglePopupPause(); });
    popupBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePopupPause(); }
    });
  }

  // Video window button
  const videoBtn = document.getElementById('video-control');
  if (videoBtn) {
    videoBtn.addEventListener('click', e => { e.stopPropagation(); toggleVideoWindow(); });
    videoBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVideoWindow(); }
    });
  }
}

/* ============================================
   COLOR RANDOMIZATION
   ============================================ */

function randomizeColors() {
  const root = document.documentElement;

  // generate a random base hue and produce other hues by offsets
  const baseHue = Math.floor(Math.random() * 360);
  const randPct = (min, max) => min + Math.random() * (max - min);
  const primary = `hsl(${baseHue}, ${randPct(40,80)}%, ${randPct(30,60)}%)`;
  const secondary = `hsl(${(baseHue + 60) % 360}, ${randPct(40,80)}%, ${randPct(30,60)}%)`;
  const highlight = `hsl(${(baseHue + 120) % 360}, ${randPct(50,100)}%, ${randPct(60,90)}%)`;
  const bgHue = (baseHue + 180 + Math.random() * 60 - 30) % 360;
  const bg = `hsl(${bgHue}, ${randPct(20,40)}%, ${randPct(5,30)}%)`;
  const text = `hsl(${(bgHue + 180) % 360}, ${randPct(20,80)}%, ${randPct(70,95)}%)`;

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--highlight', highlight);
  root.style.setProperty('--bg', bg);
  root.style.setProperty('--text', text);
}

/* ============================================
   LOAD USER PREFERENCES
   ============================================ */

function loadUserPreferences() {
  // Load chill mode
  state.chillMode = loadPreference(CONFIG.STORAGE_KEYS.CHILL_MODE, false);
  const chillBtn = document.getElementById('chill-control');
  if (chillBtn && state.chillMode) {
    chillBtn.classList.add('chill-active');
    const label = chillBtn.querySelector('.ctrl-btn-label');
    if (label) label.textContent = 'CHILL: ON';
  }

  // MIGRATION: Reset popup state to default (off) for all users
  // Remove this block after a few weeks once all users have been migrated
  if (localStorage.getItem(CONFIG.STORAGE_KEYS.POPUPS_PAUSED) === 'false') {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.POPUPS_PAUSED);
  }

  // Load popup pause state (default to true = off)
  state.popupsPaused = loadPreference(CONFIG.STORAGE_KEYS.POPUPS_PAUSED, true);
  const popupBtn = document.getElementById('popup-control');
  if (popupBtn) {
    if (state.popupsPaused) {
      popupBtn.classList.add('popups-paused');
      const label = popupBtn.querySelector('.ctrl-btn-label');
      if (label) label.textContent = 'POPUPS: OFF';
    } else {
      const label = popupBtn.querySelector('.ctrl-btn-label');
      if (label) label.textContent = 'POPUPS: ON';
    }
  }

  // Set initial chill button visibility
  updateChillButtonVisibility();
}

/**
 * Random/chaotic movement for all control buttons (header & bottom)
 *
 * This behavior is optional and normally disabled. The buttons remain
 * static until hovered, relying solely on the CSS :hover transform.
 * The initialization call is commented out above. Keeping the function
 * around makes it easy to re-enable in future if desired.
 */
let controlChaosInterval = null;
function startControlButtonChaos() {
  // Legacy function - randomized transforms on every control button.
  // No longer called automatically; the new hover‑based functions below
  // handle per-button motion. Keeping this around in case the global
  // behaviour is ever desired again.
  if (controlChaosInterval) clearInterval(controlChaosInterval);
  const CHAOS_INTERVAL = 420; // ms, can randomize per button for more chaos
  function randomTransform() {
    if (state.chillMode) {
      // Reset transforms if chill mode is on
      document.querySelectorAll('#header-controls .ctrl-btn, #bottom-controls-left .ctrl-btn, #bottom-controls-right .ctrl-btn').forEach(btn => {
        btn.style.transform = '';
      });
      return;
    }
    document.querySelectorAll('#header-controls .ctrl-btn, #bottom-controls-left .ctrl-btn, #bottom-controls-right .ctrl-btn').forEach(btn => {
      // Random translate (-6px to 6px), rotate (-8deg to 8deg), scale (0.96 to 1.08)
      const tx = (Math.random() - 0.5) * 12;
      const ty = (Math.random() - 0.5) * 12;
      const rot = (Math.random() - 0.5) * 16;
      const scale = 0.96 + Math.random() * 0.12;
      btn.style.transition = 'transform 0.33s cubic-bezier(.7,-0.3,.7,1.7)';
      btn.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`;
    });
  }
  controlChaosInterval = setInterval(randomTransform, CHAOS_INTERVAL);
  // Also run once immediately
  randomTransform();
}

// --- color chaos --------------------------------------------------
let colorChaosInterval = null;
function startColorChaos() {
  if (colorChaosInterval) clearInterval(colorChaosInterval);
  const INTERVAL = 1200; // base interval between changes
  colorChaosInterval = setInterval(() => {
    if (!state.chillMode) randomizeColors();
  }, INTERVAL + Math.random() * 1800); // jitter for unpredictability
}
function stopColorChaos() {
  if (colorChaosInterval) {
    clearInterval(colorChaosInterval);
    colorChaosInterval = null;
  }
}

// Map to keep track of individual button chaos intervals
const chaosIntervals = new WeakMap();

/**
 * Start random motion on a single control button. The interval will be
 * stored in `chaosIntervals` so it can be cleared later.
 */
function startButtonChaos(btn) {
  if (state.chillMode || chaosIntervals.has(btn)) return;
  const CHAOS_INTERVAL = 420;
  function randomTransform() {
    // motion only while hovered; chill mode checked before starting
    const tx = (Math.random() - 0.5) * 12;
    const ty = (Math.random() - 0.5) * 12;
    const rot = (Math.random() - 0.5) * 16;
    const scale = 0.96 + Math.random() * 0.12;
    btn.style.transition = 'transform 0.33s cubic-bezier(.7,-0.3,.7,1.7)';
    btn.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`;
  }
  const interval = setInterval(randomTransform, CHAOS_INTERVAL);
  chaosIntervals.set(btn, interval);
  randomTransform();
}

function stopButtonChaos(btn) {
  const interval = chaosIntervals.get(btn);
  if (interval) {
    clearInterval(interval);
    chaosIntervals.delete(btn);
  }
  btn.style.transform = '';
}

// Reset transforms when chill mode is toggled on, and clear any running
// per-button chaos intervals so they don't restart while chilled.
const origToggleChillMode = typeof toggleChillMode === 'function' ? toggleChillMode : null;
toggleChillMode = function() {
  if (origToggleChillMode) origToggleChillMode.apply(this, arguments);
  if (state.chillMode) {
    document.querySelectorAll('#header-controls .ctrl-btn, #bottom-controls-left .ctrl-btn, #bottom-controls-right .ctrl-btn').forEach(btn => {
      stopButtonChaos(btn);
    });
  }
};

/* ============================================
   INITIALIZATION
   ============================================ */

function init() {
  if (state.initialized) return;

  const gateResult = ensureAgeGateAccess({
    storageKey: CONFIG.STORAGE_KEYS.AGE_GATE_PROFILE,
    loadAgeGateProfile,
    isAgeGateValid,
    getRegionMinimumAge,
    saveAgeGateProfile,
    onAccessGranted: init
  });
  if (gateResult.blocked) return;

  state.initialized = true;

  // Initialize state
  state.sentences = (typeof window !== 'undefined' && Array.isArray(window.SENTENCES) && window.SENTENCES.length)
    ? window.SENTENCES.filter(s => typeof s === 'string' && s.trim())
    : getThemeSentences();
  initializeProgressiveSentence();
  if (!state.currentSentence) {
    state.currentSentence = state.sentences[0];
  }

  // Set initial blurb text
  setBlurbText(state.currentSentence);

  // Load user preferences
  loadUserPreferences();

  // Setup control buttons
  setupControlButtons();

  // Start chaotic header button movement
  // Note: chaotic motion has been disabled so buttons stay static
  // startControlButtonChaos();  // commented out per request, hover still works

  // Setup event handlers
  setupEventHandlers();

  // Initialize music system
  MusicSystem.init();

  // Initialize SFX system
  SFXSystem.init();

  // Create floating video window (lazy - won't load content until shown)
  createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);

  // Randomize colors on load once
  randomizeColors();
  // All other animations start only when the mouse moves
  stopIntervals();

  // Setup random popup glitch-out effect
  setInterval(() => {
    if (Math.random() < 0.5) randomPopupGlitchOut();
  }, 4500 + Math.random() * 6000);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

