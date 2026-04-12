/**
 * Taskbar & Start Menu Module
 * 
 * Modular Win98/XP-style taskbar for the 420360 homepage.
 * To add new items: append to MENU_ITEMS or TRAY_ITEMS arrays.
 * 
 * Start Menu groups:
 *   'nav'    – primary content actions (rendered as ctrl-btn)
 *   'meta'   – site utilities (rendered as ctrl-btn)
 *   'social' – external links (rendered as plain anchor links)
 * 
 * Tray items:
 *   'toggle' – interactive ctrl-btn with optional dynamic status span
 */

/* ============================================================
   MENU ITEMS CONFIG
   Add new navigation items here — one object per entry.
   ============================================================ */
const MENU_ITEMS = [
  // --- Primary Navigation ---
  { group: 'nav', id: 'about-control',    label: 'ABOUT',    icon: '(i)',   shortcut: 'A' },
  { group: 'nav', id: 'apply-control',    label: 'APPLY',    icon: '[+]',   shortcut: null },
  { group: 'nav', id: 'games-control',    label: 'GAMES',    icon: '>_<',   shortcut: 'G' },
  { group: 'nav', id: 'esoteric-control', label: 'ESOTERIC', icon: '*_*',   shortcut: 'E' },
  { group: 'nav', id: 'reviews-control',  label: 'REVIEWS',  icon: '[>]',   shortcut: 'R' },
  { group: 'nav', id: 'commune-control',  label: 'COMMUNE',  icon: '@_@',   shortcut: 'N' },
  // --- Meta / Utilities ---
  { group: 'meta', id: 'issue-report',    label: 'ISSUES',   icon: '[!]',   shortcut: 'I' },
  { group: 'meta', id: 'legal-control',   label: 'LEGAL',    icon: '[=]',   shortcut: null, href: '/legal.html' },
  // --- Social Links (rendered as <a> elements) ---
  { group: 'social', id: 'social-yt',    label: 'YOUTUBE',  icon: '(>)',   href: 'https://www.youtube.com/@woodenhat',    external: true },
  { group: 'social', id: 'social-gh',    label: 'GITHUB',   icon: '[#]',   href: 'https://github.com/woodmurderedhat',    external: true },
  { group: 'social', id: 'social-blog',  label: 'BLOG',     icon: '[~]',   href: 'https://blog.420360.xyz',               external: true },
  { group: 'social', id: 'social-art',   label: 'ART',      icon: '[*]',   href: '/cartoons/' },
];

/* ============================================================
   TRAY ITEMS CONFIG
   Add new tray items here — statusId links to a <span> whose
   text content is updated dynamically by other modules.
   ============================================================ */
const TRAY_ITEMS = [
  { id: 'popup-control',  icon: '[P]', statusId: null,          title: 'Toggle Popups (P)',       ariaLabel: 'Pause/resume popup spawning' },
  { id: 'chill-control',  icon: '~_~', statusId: null,          title: 'Chill Mode (C)',           ariaLabel: 'Toggle chill mode' },
  { id: 'sfx-control',    icon: '(S)', statusId: 'sfx-status',  title: 'Toggle sound effects (S)', ariaLabel: 'Toggle sound effects' },
  { id: 'music-control',  icon: '[#]', statusId: 'music-status',title: 'Toggle music (M)',         ariaLabel: 'Toggle music' },
];

/* ============================================================
   GROUP METADATA
   Labels shown as dividers in the start menu.
   ============================================================ */
const GROUP_LABELS = {
  nav:    'NAVIGATE',
  meta:   'SYSTEM',
  social: 'CONNECT',
};

/* ============================================================
   HELPERS
   ============================================================ */
function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, c => m[c]);
}

function createCtrlBtn({ id, label, icon, title, ariaLabel, statusId }) {
  const btn = document.createElement('div');
  btn.id = id;
  btn.className = 'ctrl-btn';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  if (title)     btn.setAttribute('title', title);
  if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);

  if (statusId) {
    const lbl = document.createElement('span');
    lbl.id = statusId;
    lbl.className = 'ctrl-btn-label';
    lbl.textContent = label;
    btn.appendChild(lbl);
  } else {
    const lbl = document.createElement('span');
    lbl.className = 'ctrl-btn-label';
    lbl.textContent = label;
    btn.appendChild(lbl);
  }

  const icn = document.createElement('span');
  icn.className = 'ctrl-btn-icon';
  icn.setAttribute('aria-hidden', 'true');
  icn.textContent = icon;
  btn.appendChild(icn);

  return btn;
}

/* ============================================================
   MOON PHASE CALCULATOR
   Algorithm: count days since a known new moon, mod against
   the synodic period (29.53059 days). Returns 0–29 day age.
   ============================================================ */
const MOON_PHASES = [
  { name: 'New Moon',        glyph: '(  )',   range: [0,     3.69] },
  { name: 'Waxing Crescent', glyph: '(> )',   range: [3.69,  7.38] },
  { name: 'First Quarter',   glyph: '(>> )',  range: [7.38,  11.07] },
  { name: 'Waxing Gibbous',  glyph: '(>>>)',  range: [11.07, 14.77] },
  { name: 'Full Moon',       glyph: '(@@)',   range: [14.77, 18.45] },
  { name: 'Waning Gibbous',  glyph: '(<<<)',  range: [18.45, 22.15] },
  { name: 'Last Quarter',    glyph: '( <<)',  range: [22.15, 25.84] },
  { name: 'Waning Crescent', glyph: '( < )',  range: [25.84, 29.54] },
];

// Visual bar: 16-char wide ASCII moon bar, filled by illumination %
function moonBar(illumination) {
  const filled = Math.round(illumination * 14);
  return '[' + '#'.repeat(filled) + '-'.repeat(14 - filled) + ']';
}

function getMoonData(date = new Date()) {
  // Known new moon: 2000-01-06 18:14 UTC (J2000 epoch ref)
  const knownNewMoonMs = Date.UTC(2000, 0, 6, 18, 14, 0);
  const SYNODIC = 29.53059 * 24 * 60 * 60 * 1000; // ms
  const age = ((date.getTime() - knownNewMoonMs) % SYNODIC + SYNODIC) % SYNODIC;
  const ageDays = age / (24 * 60 * 60 * 1000);
  const phase = MOON_PHASES.find(p => ageDays >= p.range[0] && ageDays < p.range[1])
    || MOON_PHASES[0];
  // Illumination: simple sinusoidal approximation
  const illum = (1 - Math.cos((ageDays / 29.53059) * 2 * Math.PI)) / 2;
  return { phase: phase.name, glyph: phase.glyph, illum, ageDays };
}

/* ============================================================
   DAILY TAROT CARD
   Seeded by date — same card all day, cycles through deck.
   ============================================================ */
const TAROT_DECK = [
  { num: '0',    name: 'The Fool',           keyword: 'New beginnings',    upright: 'Leap into the unknown. Something fresh is calling.',         rev: 'Recklessness. Look before you leap today.' },
  { num: 'I',    name: 'The Magician',       keyword: 'Willpower',         upright: 'You have the tools. Use them.',                               rev: 'Trickery. Someone (or you) may be bluffing.' },
  { num: 'II',   name: 'The High Priestess', keyword: 'Intuition',         upright: 'Be still. The answer is already inside you.',                 rev: 'Secrets withheld. Trust your gut more.' },
  { num: 'III',  name: 'The Empress',        keyword: 'Abundance',         upright: 'Fertile ground. Create, nurture, grow.',                      rev: 'Smothering. Let things breathe.' },
  { num: 'IV',   name: 'The Emperor',        keyword: 'Structure',         upright: 'Build the foundation. Order serves you now.',                 rev: 'Tyranny or chaos — choose neither.' },
  { num: 'V',    name: 'The Hierophant',     keyword: 'Tradition',         upright: 'Seek a mentor. Wisdom lives in established paths.',            rev: 'Break the rules. Convention may be the cage.' },
  { num: 'VI',   name: 'The Lovers',         keyword: 'Choice',            upright: 'A meaningful decision. Follow your values.',                  rev: 'Misalignment. What do you actually want?' },
  { num: 'VII',  name: 'The Chariot',        keyword: 'Determination',     upright: 'Drive forward. Focus wins the day.',                          rev: 'Spinning wheels. Re-align your direction.' },
  { num: 'VIII', name: 'Strength',           keyword: 'Courage',           upright: 'Gentle power over fear. The beast bows to kindness.',         rev: 'Self-doubt gnaws. Reclaim your spine.' },
  { num: 'IX',   name: 'The Hermit',         keyword: 'Solitude',          upright: 'Withdraw and listen. Your inner lantern knows the way.',       rev: 'Isolation as avoidance. Reconnect.' },
  { num: 'X',    name: 'Wheel of Fortune',   keyword: 'Cycles',            upright: 'The wheel turns. Good luck rides in with change.',            rev: 'Resistance to change keeps you stuck.' },
  { num: 'XI',   name: 'Justice',            keyword: 'Truth',             upright: 'Cause and effect. Be honest. Be fair.',                       rev: 'A bias is clouding your judgment.' },
  { num: 'XII',  name: 'The Hanged Man',     keyword: 'Surrender',         upright: 'Pause willingly. A different angle reveals everything.',       rev: 'Stalling. The delay is no longer useful.' },
  { num: 'XIII', name: 'Death',              keyword: 'Transformation',    upright: 'An ending clears the way. Let it go.',                        rev: 'Clinging to the old form. Release is growth.' },
  { num: 'XIV',  name: 'Temperance',         keyword: 'Balance',           upright: 'Mix it slowly. The blend is the medicine.',                   rev: 'Excess in one direction. Find the middle.' },
  { num: 'XV',   name: 'The Devil',          keyword: 'Shadow',            upright: 'Stare at what binds you. The chain is shorter than you think.',rev: 'The chains are already loose. Walk away.' },
  { num: 'XVI',  name: 'The Tower',          keyword: 'Disruption',        upright: 'Something shatters to let light in. Trust the rubble.',       rev: 'Disaster narrowly averted — or postponed.' },
  { num: 'XVII', name: 'The Star',           keyword: 'Hope',              upright: 'Calm after the storm. Healing is real.',                      rev: 'Despair whispers. Counter it with small acts.' },
  { num: 'XVIII',name: 'The Moon',           keyword: 'Illusion',          upright: 'Things are not what they seem. Sit with the uncertainty.',    rev: 'A confusion is clearing. Trust returns.' },
  { num: 'XIX',  name: 'The Sun',            keyword: 'Clarity',           upright: 'Full brightness. Joy, vitality, success.',                    rev: 'A cloud dims the vision. It will pass.' },
  { num: 'XX',   name: 'Judgement',          keyword: 'Reckoning',         upright: 'The call has come. Rise and answer it.',                      rev: 'Self-judgment runs too deep. Forgive yourself.' },
  { num: 'XXI',  name: 'The World',          keyword: 'Completion',        upright: 'A cycle closes in triumph. Celebrate.',                       rev: 'Almost there — tie the last loose end.' },
];

function getDailyTarot(date = new Date()) {
  // Seed = YYYYMMDD integer — deterministic per calendar day
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  // Simple hash to spread across deck evenly
  const idx = Math.abs((seed * 2654435761) >>> 0) % TAROT_DECK.length;
  // Reversed if seed digit sum is odd
  const digitSum = String(seed).split('').reduce((a, c) => a + +c, 0);
  const reversed = (digitSum % 2 === 1);
  return { card: TAROT_DECK[idx], reversed };
}

/* ============================================================
   ASCII MOON GLYPH (2-line art)
   ============================================================ */
function moonAsciiArt(ageDays) {
  const norm = ageDays / 29.53059; // 0..1
  // 5-line × 7-char ASCII moon phases. * = illuminated, space = dark.
  const phases = [
    // New Moon
    ['  ___  ', ' /   \\ ', '|     |', ' \\   / ', '  ---  '],
    // Waxing Crescent (right sliver)
    ['  ___  ', ' /  *\\ ', '|   **|', ' \\  */ ', '  ---  '],
    // First Quarter (right half)
    ['  ___  ', ' / **\\ ', '|  ***|', ' \\ **/ ', '  ---  '],
    // Waxing Gibbous (mostly lit, left edge dark)
    ['  ___  ', ' /***\\ ', '| ****|', ' \\***/ ', '  ---  '],
    // Full Moon
    ['  ___  ', ' /***\\ ', '|*****|', ' \\***/ ', '  ---  '],
    // Waning Gibbous (mostly lit, right edge dark)
    ['  ___  ', ' /***\\ ', '|**** |', ' \\***/ ', '  ---  '],
    // Last Quarter (left half)
    ['  ___  ', ' /** \\ ', '|***  |', ' \\** / ', '  ---  '],
    // Waning Crescent (left sliver)
    ['  ___  ', ' /*  \\ ', '|**   |', ' \\*  / ', '  ---  '],
  ];
  const i = Math.floor(norm * 8) % 8;
  return phases[i];
}

/* ============================================================
   CLOCK WIDGET
   ============================================================ */
function buildClockWidget() {
  const widget = document.createElement('div');
  widget.id = 'clock-widget';
  widget.hidden = true;
  widget.setAttribute('role', 'dialog');
  widget.setAttribute('aria-label', 'Moon & Tarot widget');

  function render() {
    const now   = new Date();
    const moon  = getMoonData(now);
    const { card, reversed } = getDailyTarot(now);
    const art   = moonAsciiArt(moon.ageDays);
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const pct   = Math.round(moon.illum * 100);

    widget.innerHTML = `
      <div id="cw-header">
        <span id="cw-title">// ORACLE //</span>
        <button id="cw-close" aria-label="Close widget" type="button">[-]</button>
      </div>
      <div id="cw-date">${dateStr}</div>

      <div id="cw-section-moon">
        <div class="cw-section-label">-- MOON --</div>
        <pre class="cw-moon-art">${art.join('\n')}</pre>
        <div class="cw-moon-phase">${moon.phase}</div>
        <div class="cw-moon-bar">${moonBar(moon.illum)}</div>
        <div class="cw-moon-pct">${pct}% illuminated &bull; day ${Math.floor(moon.ageDays)}</div>
      </div>

      <div id="cw-divider">-----------------------</div>

      <div id="cw-section-tarot">
        <div class="cw-section-label">-- DAILY CARD --</div>
        <div class="cw-card-header">
          <span class="cw-card-num">[${card.num}]</span>
          <span class="cw-card-name">${card.name}${reversed ? ' (R)' : ''}</span>
        </div>
        <div class="cw-card-keyword">&lt;${card.keyword}&gt;</div>
        <div class="cw-card-reading">${reversed ? card.rev : card.upright}</div>
      </div>
    `;
  }

  return { el: widget, render };
}

/* ============================================================
   CLOCK
   ============================================================ */
function startClock(el) {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 10000);
}

/* ============================================================
   BUILD & MOUNT
   ============================================================ */
export function createTaskbar() {
  const taskbarEl   = document.getElementById('taskbar');
  const startMenuEl = document.getElementById('start-menu');

  if (!taskbarEl || !startMenuEl) {
    console.warn('[taskbar] #taskbar or #start-menu not found in DOM.');
    return { getControlButtons: () => [] };
  }

  // ---- Build Taskbar ----
  const startBtn = document.createElement('button');
  startBtn.id = 'start-btn';
  startBtn.type = 'button';
  startBtn.setAttribute('aria-haspopup', 'true');
  startBtn.setAttribute('aria-expanded', 'false');
  startBtn.setAttribute('aria-controls', 'start-menu');
  startBtn.setAttribute('aria-label', 'Open start menu');
  startBtn.innerHTML = '<span class="start-btn-icon">&gt;&gt;</span><span class="start-btn-label">START</span>';

  const tray = document.createElement('div');
  tray.id = 'taskbar-tray';
  tray.setAttribute('aria-label', 'System tray');

  TRAY_ITEMS.forEach(item => {
    const label = item.statusId
      ? (item.id === 'sfx-control'   ? 'SFX: OFF'
       : item.id === 'music-control' ? 'MUSIC: OFF'
       : item.label ?? '')
      : (item.id === 'popup-control' ? 'POPUPS: ON'
       : item.id === 'chill-control'  ? 'CHILL'
       : '');
    const btn = createCtrlBtn({ ...item, label });
    tray.appendChild(btn);
  });

  const clock = document.createElement('div');
  clock.id = 'taskbar-clock';
  clock.setAttribute('role', 'button');
  clock.setAttribute('tabindex', '0');
  clock.setAttribute('aria-label', 'Current time — click for moon & tarot widget');
  clock.setAttribute('title', 'Moon phase & daily tarot');
  startClock(clock);

  // ---- Clock Widget ----
  const { el: widgetEl, render: renderWidget } = buildClockWidget();
  // closeWidget needs to be accessible inside buildClockWidget — hoist via closure trick
  function closeWidget() {
    widgetEl.hidden = true;
    clock.classList.remove('widget-open');
    clock.setAttribute('aria-expanded', 'false');
  }
  // Patch the close button handler from within build scope
  // (render() re-attaches it each time, so we pass closeWidget via re-render)
  function openWidget() {
    renderWidget();
    widgetEl.hidden = false;
    clock.classList.add('widget-open');
    clock.setAttribute('aria-expanded', 'true');
    widgetEl.querySelector('#cw-close').addEventListener('click', e => {
      e.stopPropagation();
      closeWidget();
    });
  }

  clock.addEventListener('click', e => {
    e.stopPropagation();
    if (!widgetEl.hidden) {
      closeWidget();
    } else {
      closeMenu(); // close start menu if open
      openWidget();
    }
  });
  clock.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clock.click(); }
    if (e.key === 'Escape') closeWidget();
  });

  document.addEventListener('click', e => {
    if (!widgetEl.hidden && !widgetEl.contains(e.target) && e.target !== clock && !clock.contains(e.target)) {
      closeWidget();
    }
  });

  taskbarEl.appendChild(startBtn);
  taskbarEl.appendChild(tray);
  taskbarEl.appendChild(clock);
  taskbarEl.appendChild(widgetEl);

  // ---- Build Start Menu ----
  const sidebar = document.createElement('div');
  sidebar.id = 'start-menu-sidebar';
  sidebar.setAttribute('aria-hidden', 'true');
  sidebar.innerHTML = '<span class="start-menu-brand">420360</span>';

  const itemsContainer = document.createElement('div');
  itemsContainer.id = 'start-menu-items';
  itemsContainer.setAttribute('role', 'menu');

  const groups = ['nav', 'meta', 'social'];
  groups.forEach((group, gi) => {
    const groupItems = MENU_ITEMS.filter(i => i.group === group);
    if (!groupItems.length) return;

    if (gi > 0) {
      const sep = document.createElement('div');
      sep.className = 'start-menu-separator';
      sep.setAttribute('role', 'separator');
      itemsContainer.appendChild(sep);
    }

    const groupLabel = document.createElement('div');
    groupLabel.className = 'start-menu-group-label';
    groupLabel.textContent = GROUP_LABELS[group] ?? group.toUpperCase();
    itemsContainer.appendChild(groupLabel);

    groupItems.forEach(item => {
      if (item.group === 'social') {
        // Render as anchor
        const link = document.createElement('a');
        link.id = item.id;
        link.className = 'start-menu-item start-menu-link';
        link.href = escapeHtml(item.href ?? '#');
        link.setAttribute('role', 'menuitem');
        if (item.external) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.innerHTML = `
          <span class="start-menu-item-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
          <span class="start-menu-item-label">${escapeHtml(item.label)}</span>
        `;
        link.addEventListener('click', () => closeMenu());
        itemsContainer.appendChild(link);
      } else {
        // Render as interactive ctrl-btn
        const btn = document.createElement('div');
        btn.id = item.id;
        btn.className = 'ctrl-btn start-menu-item';
        btn.setAttribute('role', 'menuitem');
        btn.setAttribute('tabindex', '0');
        if (item.label) btn.setAttribute('aria-label', item.label);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'start-menu-item-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = item.icon;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'ctrl-btn-label start-menu-item-label';
        labelSpan.textContent = item.label;

        btn.appendChild(iconSpan);
        btn.appendChild(labelSpan);

        if (item.shortcut) {
          const badge = document.createElement('span');
          badge.className = 'start-menu-shortcut';
          badge.setAttribute('aria-label', `keyboard shortcut ${item.shortcut}`);
          badge.textContent = item.shortcut;
          btn.appendChild(badge);
        }

        // Close menu on activation; actual action wired by interaction-system.js
        btn.addEventListener('click', () => closeMenu());
        btn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') closeMenu();
        });

        itemsContainer.appendChild(btn);
      }
    });
  });

  startMenuEl.appendChild(sidebar);
  startMenuEl.appendChild(itemsContainer);

  // ---- Start Menu Open / Close ----
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    startMenuEl.hidden = false;
    startBtn.setAttribute('aria-expanded', 'true');
    startBtn.classList.add('active');
    startMenuEl.querySelector('[role="menuitem"]')?.focus();
  }

  function closeMenu() {
    menuOpen = false;
    startMenuEl.hidden = true;
    startBtn.setAttribute('aria-expanded', 'false');
    startBtn.classList.remove('active');
  }

  function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
  }

  startBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  startBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Close on click outside
  document.addEventListener('click', e => {
    if (!menuOpen) return;
    if (startMenuEl.contains(e.target) || e.target === startBtn || startBtn.contains(e.target)) return;
    closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // ---- Public API ----
  function getControlButtons() {
    return document.querySelectorAll('#taskbar .ctrl-btn, #start-menu .ctrl-btn');
  }

  return { getControlButtons, openMenu, closeMenu };
}
