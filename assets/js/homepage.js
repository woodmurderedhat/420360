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

/* ============================================
   CONFIGURATION
   Named constants replacing magic numbers
   ============================================ */
const CONFIG = {
  // Popup settings
  POPUP_INTERVAL_MS: 1000,
  POPUP_INTERVAL_CHILL: 4000,
  POPUP_INTERVAL_REDUCED: 8000,
  POPUP_LIFETIME_MS: 9500,
  MAX_POPUPS: 200,
  NON_OVERLAP_ATTEMPTS: 30,
  
  // Animation intervals
  GLITCH_INTERVAL_DEFAULT: 200,
  GLITCH_INTERVAL_CHILL: 800,
  GLITCH_INTERVAL_REDUCED: 1500,
  
  MORPH_INTERVAL_DEFAULT: 2500,
  MORPH_INTERVAL_CHILL: 5000,
  MORPH_INTERVAL_REDUCED: 10000,
  
  // Timing durations (ms)
  OVERLAY_FADE_DURATION: 190,
  GLITCH_WORD_MIN_DURATION: 120,
  GLITCH_WORD_MAX_DURATION: 420,
  MUSIC_FADE_DURATION: 1800,
  SFX_MIN_INTERVAL: 90,
  
  // Audio settings
  MUSIC_TARGET_VOLUME: 0.65,
  SFX_BASE_VOLUME: 0.55,
  
  // LocalStorage keys
  STORAGE_KEYS: {
    MUSIC_ENABLED: 'musicEnabled',
    SFX_ENABLED: 'sfxEnabled',
    CHILL_MODE: 'chillMode',
    POPUPS_PAUSED: 'popupsPaused'
  }
};

/* ============================================
   STATE MANAGEMENT
   ============================================ */
const state = {
  // User preferences (loaded from localStorage)
  musicEnabled: false,
  sfxEnabled: false,
  chillMode: false,
  popupsPaused: false,
  
  // Runtime state
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
  intervalIds: {
    popup: null,
    glitch: null,
    morph: null
  },
  activePopups: [],
  currentSentence: '',
  videoWindowLoaded: false
};

/* ============================================
   SENTENCES FOR BLURB
   ============================================ */
const SENTENCES = [
  "Welcome to the future of the internet ",
  "Surf the web like it's 1996 ",
  "Pixels were our stars in the night sky ",
  "Error 404: meaning not found ",
  "The modem's hum was a lullaby for the lost ",
  "Reality pixelated in low-res confusion ",
  "The cursor blinks, waiting for meaning ",
  "Lost in the metadata of my own mind ",
  "The blue screen of existential dread ",
  "Loading life in 8-bit resolution ",
  "Dial-up dreams in a broadband world ",
  "My heart beats in ASCII code ",
  "Pop-ups were portals to the unknown ",
  "Neon hyperlinks light the way home ",
  "Buffering thoughts in a digital haze ",
  "Chatrooms echo with forgotten voices ",
  "The web was wild, untamed, infinite ",
  "Caffeine and code at 3AM ",
  "My soul uploads at 56k speeds ",
  "Lost packets, lost memories ",
  "The homepage is where the heart is ",
  "Right-click to save nostalgia ",
  "Pop culture in pop-up windows ",
  "The night glows with CRT static ",
  "We surfed the chaos, byte by byte ",
  "404: Sleep not found ",
  "My dreams are animated GIFs ",
  "The internet never forgets a meme ",
  "Reality checks in Comic Sans ",
  "I left my heart in a guestbook "
];

/* ============================================
   AD/POPUP DATA
   ============================================ */
const ICON_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALklEQVQoka3OMQ0AAAzDsPnfpM1Yip5JRGCBqgMFBQUFBQUFBQUFBQUFBSUlG8mG6tD3oxAAAAAElFTkSuQmCC";

const ADS = [
  { label: "SHOP • REDBUBBLE", href: "https://www.redbubble.com/shop/ap/174665816?asc=u", gif: "https://media.giphy.com/media/R7roNpEGCKqzjs1kkO/giphy.gif" },
  { label: "NOCTIS REVERIE", href: "https://420360.xyz/games/noctis-reverie/index.html", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "247420", href: "https://discord.gg/an-entrypoint-367741339393327104", gif: "https://media.giphy.com/media/DfqSbJVYLHmO8QFn1R/giphy.gif" },
  { label: "GIPHY", href: "https://giphy.com/woodmurderedhat", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "WOODMURDEREDHAT", href: "https://woodmurderedhat.com/social", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@woodenhat", gif: "https://media.giphy.com/media/JeEjGpM2TVZGaM5BuE/giphy.gif" },
  { label: "FRIDAY", href: "#", gif: "https://media.giphy.com/media/3PLAXg1osLVVttjRTN/giphy.gif" },
  { label: "SATURDAY", href: "#", gif: "https://media.giphy.com/media/WveGOgFwcI6uTn2khE/giphy.gif" },
  { label: "PEARL WHAT?", href: "https://www.youtube.com/watch?v=DXS6NbEAkLM", gif: "https://media.giphy.com/media/eYDnuFt0MckAb3xdSH/giphy.gif" },
  { label: "ZEF SHELLED#", href: "#", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "MOAN-AH", href: "https://www.youtube.com/watch?v=wo5QBEux8nk", gif: "https://media.giphy.com/media/DfqSbJVYLHmO8QFn1R/giphy.gif" },
  { label: "WEDNESDAY", href: "#", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "WAR ART", href: "#", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" },
  { label: "ZEF DEMONS", href: "#", gif: "https://media.giphy.com/media/JeEjGpM2TVZGaM5BuE/giphy.gif" },
  { label: "SCHIZODIO", href: "https://schizodio.xyz/brobaker", gif: "https://media.giphy.com/media/8Javw7WzqetpyiT3ls/giphy.gif" },
  { label: "SHADOW PROTOCOL", href: "https://420360.xyz/null-vesper/shadow-protocol/", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "TIM ORACLE", href: "__INTERNAL_ORACLE__", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "DAUGHTERS OF ZION", href: "https://420360.xyz/esoteric/daughters-of-zion/index.html", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" }
];

// Preload GIFs
ADS.forEach(a => { const i = new Image(); i.src = a.gif; });

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

/**
 * Load preference from localStorage with fallback
 */
function loadPreference(key, defaultValue = false) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Save preference to localStorage
 */
function savePreference(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.warn('Failed to save preference:', key);
  }
}

/**
 * Generate random glitch string
 */
function randomGlitchString(len) {
  const chars = "!@#$%^&*()_+=-[]{};:<>,.?/|~420360";
  return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

/**
 * Get current interval values based on mode
 */
function getIntervals() {
  if (state.reducedMotion) {
    return {
      popup: CONFIG.POPUP_INTERVAL_REDUCED,
      glitch: CONFIG.GLITCH_INTERVAL_REDUCED,
      morph: CONFIG.MORPH_INTERVAL_REDUCED
    };
  }
  if (state.chillMode) {
    return {
      popup: CONFIG.POPUP_INTERVAL_CHILL,
      glitch: CONFIG.GLITCH_INTERVAL_CHILL,
      morph: CONFIG.MORPH_INTERVAL_CHILL
    };
  }
  return {
    popup: CONFIG.POPUP_INTERVAL_MS,
    glitch: CONFIG.GLITCH_INTERVAL_DEFAULT,
    morph: CONFIG.MORPH_INTERVAL_DEFAULT
  };
}

/* ============================================
   BLURB / TEXT SYSTEM
   ============================================ */

/**
 * Set the blurb text with word spans
 */
function setBlurbText(sentence) {
  const blurbEl = document.getElementById('blurb');
  if (!blurbEl) return;

  blurbEl.innerHTML = "";
  const words = sentence.trim().split(" ").filter(Boolean);
  words.forEach(w => {
    const s = document.createElement('span');
    s.textContent = w;
    blurbEl.appendChild(s);
  });
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '_';
  cursor.setAttribute('aria-hidden', 'true');
  blurbEl.appendChild(cursor);
}

/**
 * Glitch a random word in the blurb
 */
function glitchRandomWord() {
  const blurbEl = document.getElementById('blurb');
  if (!blurbEl) return;

  const spans = blurbEl.querySelectorAll('span:not(.cursor)');
  if (!spans.length) return;

  // Rare chance for whole-blurb glitch
  if (Math.random() < 0.02) fullGlitch();

  const idx = Math.floor(Math.random() * spans.length);
  const span = spans[idx];
  if (!span || span.classList.contains('glitch')) return;

  const original = span.textContent;
  span.textContent = randomGlitchString(Math.max(1, original.length));
  span.classList.add('glitch');

  const duration = CONFIG.GLITCH_WORD_MIN_DURATION + Math.random() * (CONFIG.GLITCH_WORD_MAX_DURATION - CONFIG.GLITCH_WORD_MIN_DURATION);
  setTimeout(() => {
    span.textContent = original;
    span.classList.remove('glitch');
  }, duration);
}

/**
 * Full blurb glitch effect
 */
function fullGlitch() {
  const blurbEl = document.getElementById('blurb');
  if (!blurbEl) return;
  blurbEl.classList.add('glitch-effect');
  setTimeout(() => blurbEl.classList.remove('glitch-effect'), 300);
}

/**
 * Morph to a random sentence
 */
function morphToRandomSentence() {
  const blurbEl = document.getElementById('blurb');
  if (!blurbEl) return;

  const currentTrimmed = state.currentSentence.trim();
  const uniqueSentences = SENTENCES.filter(s => s.trim() !== currentTrimmed);
  if (uniqueSentences.length === 0) return;

  const nextSentence = uniqueSentences[Math.floor(Math.random() * uniqueSentences.length)];
  const currentWords = state.currentSentence.trim().split(" ");
  const targetWords = nextSentence.trim().split(" ");
  const maxLength = Math.max(currentWords.length, targetWords.length);

  let spans = blurbEl.querySelectorAll('span:not(.cursor)');

  // Add spans if needed
  while (spans.length < maxLength) {
    const span = document.createElement('span');
    span.style.marginRight = "6px";
    blurbEl.insertBefore(span, blurbEl.querySelector('.cursor'));
    spans = blurbEl.querySelectorAll('span:not(.cursor)');
  }

  // Remove extra spans if target sentence shorter
  if (spans.length > maxLength) {
    for (let i = spans.length - 1; i >= maxLength; i--) {
      spans[i].remove();
    }
    spans = blurbEl.querySelectorAll('span:not(.cursor)');
  }

  const changeOrder = Array.from({ length: maxLength }, (_, i) => i);
  changeOrder.sort(() => Math.random() - 0.5);

  let step = 0;
  function changeNextWord() {
    if (step >= changeOrder.length) {
      state.currentSentence = nextSentence;
      return;
    }
    const idx = changeOrder[step];
    const newWord = targetWords[idx] || "";
    spans[idx].textContent = newWord;
    step++;
    setTimeout(changeNextWord, 150);
  }
  changeNextWord();
}

/* ============================================
   POPUP MANAGEMENT SYSTEM
   ============================================ */

/**
 * Check if two rectangles overlap
 */
function rectsOverlap(x, y, w, h, el) {
  const r = el.getBoundingClientRect();
  return !(x + w < r.left || x > r.right || y + h < r.top || y > r.bottom);
}

/**
 * Find non-overlapping position for a new popup
 */
function findNonOverlappingPosition() {
  const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-w')) || 250;
  const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-h')) || 150;
  const maxX = Math.max(0, window.innerWidth - w);
  const maxY = Math.max(0, window.innerHeight - h);

  for (let i = 0; i < CONFIG.NON_OVERLAP_ATTEMPTS; i++) {
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

  // Give up, return random position
  return {
    x: Math.floor(Math.random() * (maxX + 1)),
    y: Math.floor(Math.random() * (maxY + 1))
  };
}

/**
 * Remove popup element safely
 */
function removePopupElement(el) {
  if (!el) return;
  const idx = state.activePopups.indexOf(el);
  if (idx !== -1) state.activePopups.splice(idx, 1);
  if (el.parentNode) el.parentNode.removeChild(el);
}

/**
 * Color schemes for popups
 */
const POPUP_COLOR_SCHEMES = [
  { bg: '#2a1a1a', primary: '#cc3333', secondary: '#8b2635', highlight: '#ff6666' }, // Red
  { bg: '#2a2a1a', primary: '#cccc33', secondary: '#8b8b35', highlight: '#ffff66' }, // Yellow
  { bg: '#1a2a1a', primary: '#4a8c3a', secondary: '#7b5e8b', highlight: '#8fbc8f' }, // Green
  { bg: '#1a1a1a', primary: '#666666', secondary: '#444444', highlight: '#cccccc' }  // Black
];

/**
 * Create and append a popup element
 */
function makePopup(ad) {
  const p = document.createElement('div');
  p.className = 'popup';
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-label', `Popup: ${ad.label}`);

  // Random rotation and scale
  const rotation = (Math.random() * 12 - 6).toFixed(2) + 'deg';
  const scale = (1 + (Math.random() * 0.08 - 0.04)).toFixed(3);
  p.style.setProperty('--rotation', rotation);
  p.style.transform = `scale(${scale}) rotate(${rotation})`;

  // Random color scheme
  const selectedScheme = POPUP_COLOR_SCHEMES[Math.floor(Math.random() * POPUP_COLOR_SCHEMES.length)];
  p.style.setProperty('--bg', selectedScheme.bg);
  p.style.setProperty('--primary', selectedScheme.primary);
  p.style.setProperty('--secondary', selectedScheme.secondary);
  p.style.setProperty('--highlight', selectedScheme.highlight);

  // Position
  const pos = findNonOverlappingPosition();
  p.style.left = pos.x + 'px';
  p.style.top = pos.y + 'px';

  // Content
  p.innerHTML = `
    <div class="titlebar" role="presentation">
      <div class="left">
        <img src="${ICON_DATA}" alt="" aria-hidden="true">
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

  // Close handlers
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

  // Internal oracle override
  const link = p.querySelector('[data-ad-link]');
  if (ad.href === '__INTERNAL_ORACLE__' && link) {
    link.removeAttribute('target');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openOracle();
    });
  }

  state.activePopups.push(p);

  // Schedule lifetime removal
  setTimeout(() => removePopupElement(p), CONFIG.POPUP_LIFETIME_MS);

  // Enforce MAX_POPUPS
  while (state.activePopups.length > CONFIG.MAX_POPUPS) {
    const old = state.activePopups.shift();
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  return p;
}

/**
 * Spawn a random popup
 */
function spawnPopup() {
  if (state.popupsPaused) return null;
  const ad = ADS[Math.floor(Math.random() * ADS.length)];
  const p = makePopup(ad);
  if (window.playAdSfx) window.playAdSfx();
  return p;
}

/**
 * Random popup glitch-out effect
 */
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

function startIntervals() {
  const intervals = getIntervals();

  if (!state.intervalIds.popup && intervals.popup > 0 && !state.popupsPaused) {
    state.intervalIds.popup = setInterval(spawnPopup, intervals.popup);
  }

  if (!state.intervalIds.glitch && intervals.glitch > 0) {
    state.intervalIds.glitch = setInterval(glitchRandomWord, intervals.glitch);
  }

  if (!state.intervalIds.morph && intervals.morph > 0) {
    state.intervalIds.morph = setInterval(morphToRandomSentence, intervals.morph);
  }

  document.documentElement.classList.remove('paused');
}

function stopIntervals() {
  if (state.intervalIds.popup) {
    clearInterval(state.intervalIds.popup);
    state.intervalIds.popup = null;
  }
  if (state.intervalIds.glitch) {
    clearInterval(state.intervalIds.glitch);
    state.intervalIds.glitch = null;
  }
  if (state.intervalIds.morph) {
    clearInterval(state.intervalIds.morph);
    state.intervalIds.morph = null;
  }
  document.documentElement.classList.add('paused');
}

function restartIntervals() {
  stopIntervals();
  if (!document.hidden) {
    startIntervals();
  }
}

function pauseBackground() {
  stopIntervals();
}

function resumeBackgroundIfNone() {
  const anyOpen = document.querySelectorAll('.integrated-overlay:not(.hidden)').length > 0;
  if (!anyOpen && !document.hidden) startIntervals();
}

/* ============================================
   MUSIC SYSTEM
   ============================================ */

const MusicSystem = {
  audio: null,
  ctrl: null,
  status: null,
  attempting: false,
  ready: false,

  init() {
    this.audio = document.getElementById('bgMusic');
    this.ctrl = document.getElementById('music-control');
    this.status = document.getElementById('music-status');

    if (!this.audio || !this.ctrl) return;

    // Load saved preference
    state.musicEnabled = loadPreference(CONFIG.STORAGE_KEYS.MUSIC_ENABLED, false);

    this.setupEventListeners();
    this.normalizeAudioSource();
    this.updateUI();

    // Periodic glitch effect on button
    setInterval(() => {
      if (Math.random() < 0.33) this.glitchButton();
    }, 2400);
  },

  setupEventListeners() {
    // Control click
    this.ctrl.addEventListener('click', e => {
      e.stopPropagation();
      this.toggle();
    });

    this.ctrl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Keyboard shortcut
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') this.toggle();
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!this.audio.paused) this.audio._wasPlaying = true;
        this.audio.pause();
      } else if (this.audio._wasPlaying && state.musicEnabled) {
        this.audio.play().catch(() => {});
      }
      if (!document.hidden) this.audio._wasPlaying = false;
      this.updateUI();
    });

    // First gesture to enable autoplay
    const firstGesture = () => {
      if (state.musicEnabled && this.audio.paused) this.play();
      window.removeEventListener('click', firstGesture);
      window.removeEventListener('keydown', firstGesture);
    };
    window.addEventListener('click', firstGesture);
    window.addEventListener('keydown', firstGesture);

    // Audio ready
    this.audio.addEventListener('canplaythrough', () => {
      this.ready = true;
      if (state.musicEnabled) this.play();
    }, { once: true });

    this.audio.addEventListener('error', () => {
      setTimeout(() => {
        if (!this.ready) {
          try { this.audio.load(); } catch (e) {}
        }
      }, 1800);
    });

    // Fallback attempt
    setTimeout(() => {
      if (state.musicEnabled && !this.ready && this.audio.paused) this.play();
    }, 2500);
  },

  normalizeAudioSource() {
    if (!this.audio.getAttribute('data-src-set')) {
      const srcTag = this.audio.querySelector('source');
      if (srcTag) {
        const raw = srcTag.getAttribute('src');
        if (raw) this.audio.src = encodeURI(raw);
        this.audio.setAttribute('data-src-set', '1');
      }
    }
    try { this.audio.load(); } catch (e) {}
  },

  updateUI() {
    if (!this.status) return;
    const on = !this.audio.paused && !this.audio.ended;
    this.status.textContent = 'MUSIC: ' + (on ? 'ON' : 'OFF');
    this.ctrl.setAttribute('aria-pressed', String(on));
  },

  fadeTo(targetVol, ms = 1200) {
    const steps = 30;
    const start = this.audio.volume;
    const delta = targetVol - start;
    let i = 0;

    clearInterval(this.audio._fadeInt);
    this.audio._fadeInt = setInterval(() => {
      i++;
      this.audio.volume = Math.min(1, Math.max(0, start + delta * (i / steps)));
      if (i >= steps) clearInterval(this.audio._fadeInt);
    }, ms / steps);
  },

  async play() {
    if (this.attempting) return;
    this.attempting = true;

    try {
      this.audio.volume = 0;
      await this.audio.play();
      this.fadeTo(CONFIG.MUSIC_TARGET_VOLUME, CONFIG.MUSIC_FADE_DURATION);
      state.musicEnabled = true;
    } catch (err) {
      // Autoplay blocked
    } finally {
      this.attempting = false;
      this.updateUI();
    }
  },

  stop() {
    this.audio.pause();
    this.updateUI();
  },

  toggle() {
    if (this.audio.paused) {
      state.musicEnabled = true;
      this.play();
      savePreference(CONFIG.STORAGE_KEYS.MUSIC_ENABLED, true);
    } else {
      state.musicEnabled = false;
      this.stop();
      savePreference(CONFIG.STORAGE_KEYS.MUSIC_ENABLED, false);
    }
  },

  glitchButton() {
    if (this.ctrl.classList.contains('glitching')) return;
    this.ctrl.classList.add('glitching');
    setTimeout(() => this.ctrl.classList.remove('glitching'), 260);
  }
};

/* ============================================
   SFX SYSTEM
   ============================================ */

const SFXSystem = {
  ctrl: null,
  status: null,
  lastPlay: 0,
  pool: [],

  SFX_FILES: [
    'BreakBeat_Slice01.wav', 'BreakBeat_Slice02.wav', 'BreakBeat_Slice03.wav', 'BreakBeat_Slice04.wav',
    'Clap02.wav', 'Clap03.wav', 'Clap04.wav', 'Clap05.wav', 'Clap06.wav'
  ],

  init() {
    this.ctrl = document.getElementById('sfx-control');
    this.status = document.getElementById('sfx-status');

    if (!this.ctrl) return;

    // Load saved preference
    state.sfxEnabled = loadPreference(CONFIG.STORAGE_KEYS.SFX_ENABLED, false);

    // Preload audio
    this.pool = this.SFX_FILES.map(f => {
      const a = new Audio('assets/sounds/' + f);
      a.preload = 'auto';
      return a;
    });

    this.setupEventListeners();
    this.updateUI();

    // Expose globally for popup system
    window.playAdSfx = () => this.play();
  },

  setupEventListeners() {
    this.ctrl.addEventListener('click', e => {
      e.stopPropagation();
      this.toggle();
    });

    this.ctrl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 's' || e.key === 'S') this.toggle();
    });

    // Prime audio on first interaction
    const prime = () => {
      this.pool.forEach(a => {
        try {
          a.muted = true;
          a.play().then(() => {
            a.pause();
            a.currentTime = 0;
            a.muted = false;
          }).catch(() => {});
        } catch (e) {}
      });
      window.removeEventListener('click', prime);
      window.removeEventListener('keydown', prime);
    };
    window.addEventListener('click', prime);
    window.addEventListener('keydown', prime);
  },

  updateUI() {
    if (!this.status) return;
    this.status.textContent = 'SFX: ' + (state.sfxEnabled ? 'ON' : 'OFF');
    this.ctrl.setAttribute('aria-pressed', String(state.sfxEnabled));
  },

  play() {
    if (!state.sfxEnabled) return;

    const now = Date.now();
    if (now - this.lastPlay < CONFIG.SFX_MIN_INTERVAL) return;
    this.lastPlay = now;

    const base = this.pool[Math.floor(Math.random() * this.pool.length)];
    try {
      const inst = base.cloneNode();
      inst.volume = CONFIG.SFX_BASE_VOLUME * (0.85 + Math.random() * 0.3);
      inst.playbackRate = 0.95 + Math.random() * 0.1;
      inst.play().catch(() => {});
    } catch (e) {}
  },

  toggle() {
    state.sfxEnabled = !state.sfxEnabled;
    this.updateUI();
    savePreference(CONFIG.STORAGE_KEYS.SFX_ENABLED, state.sfxEnabled);
  }
};

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
    if (label) label.textContent = state.popupsPaused ? 'POPUPS: OFF' : 'POPUPS';
  }

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
    else startIntervals();
  });

  window.addEventListener('pagehide', () => stopIntervals());
  window.addEventListener('pageshow', () => {
    if (!document.hidden) startIntervals();
  });

  // Click to spawn popup
  let lastClick = 0;
  document.addEventListener('click', (ev) => {
    const now = Date.now();
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

  // Issue report button
  const issueBtn = document.getElementById('issue-report');
  if (issueBtn) {
    issueBtn.addEventListener('click', e => { e.stopPropagation(); openIssues(); });
    issueBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIssues(); }
    });
  }

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
  const weedColorVariants = [
    { primary: '#4a8c3a', secondary: '#7b5e8b', highlight: '#8fbc8f' }, // default
    { primary: '#3e7b2e', secondary: '#6b4d7b', highlight: '#7daf7d' }, // darker green
    { primary: '#569946', secondary: '#8b6b9b', highlight: '#9bcf9b' }, // lighter green
    { primary: '#2d5a2d', secondary: '#5e3a6e', highlight: '#6d8e6d' }, // forest
    { primary: '#4d7a3d', secondary: '#7a5a8a', highlight: '#8aaa8a' }  // earthy
  ];

  // 30% chance to use alternate colors
  if (Math.random() < 0.3) {
    const variant = weedColorVariants[Math.floor(Math.random() * weedColorVariants.length)];
    const root = document.documentElement;
    root.style.setProperty('--primary', variant.primary);
    root.style.setProperty('--secondary', variant.secondary);
    root.style.setProperty('--highlight', variant.highlight);
  }
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

  // Load popup pause state
  state.popupsPaused = loadPreference(CONFIG.STORAGE_KEYS.POPUPS_PAUSED, false);
  const popupBtn = document.getElementById('popup-control');
  if (popupBtn && state.popupsPaused) {
    popupBtn.classList.add('popups-paused');
    const label = popupBtn.querySelector('.ctrl-btn-label');
    if (label) label.textContent = 'POPUPS: OFF';
  }
}

/* ============================================
   INITIALIZATION
   ============================================ */

function init() {
  // Initialize state
  state.currentSentence = SENTENCES[0];

  // Set initial blurb text
  setBlurbText(state.currentSentence);

  // Load user preferences
  loadUserPreferences();

  // Setup control buttons
  setupControlButtons();

  // Setup event handlers
  setupEventHandlers();

  // Initialize music system
  MusicSystem.init();

  // Initialize SFX system
  SFXSystem.init();

  // Create floating video window (lazy - won't load content until shown)
  createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);

  // Randomize colors on load
  randomizeColors();

  // Start intervals if page is visible
  if (!document.hidden) startIntervals();

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

