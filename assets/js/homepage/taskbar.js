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

import { createOracleApplet } from './oracle-applet.js';

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
  clock.setAttribute('aria-label', 'Current time - click for daily oracle signal');
  clock.setAttribute('aria-expanded', 'false');
  clock.setAttribute('title', 'Daily Oracle Signal');
  startClock(clock);

  const oracleApplet = createOracleApplet({
    onOpen: () => {
      positionOracleWidget();
      clock.classList.add('widget-open');
      clock.setAttribute('aria-expanded', 'true');
    },
    onClose: () => {
      clock.classList.remove('widget-open');
      clock.setAttribute('aria-expanded', 'false');
    }
  });
  const oracleWidget = oracleApplet.widgetEl;

  function positionOracleWidget() {
    const clockRect = clock.getBoundingClientRect();
    oracleWidget.style.right = '0px';
    oracleWidget.style.left = 'auto';
    oracleWidget.style.top = `${Math.round(clockRect.bottom + 12)}px`;
  }

  clock.addEventListener('click', (evt) => {
    evt.stopPropagation();
    oracleApplet.toggleWidget();
  });

  clock.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      oracleApplet.toggleWidget();
    }
    if (evt.key === 'Escape') {
      oracleApplet.closeWidget();
    }
  });

  const microSettingsBtn = document.createElement('button');
  microSettingsBtn.id = 'micro-settings-taskbar-btn';
  microSettingsBtn.type = 'button';
  microSettingsBtn.setAttribute('aria-label', 'Toggle micro settings panel');
  microSettingsBtn.setAttribute('aria-pressed', 'false');
  microSettingsBtn.setAttribute('title', 'Micro settings (^_^)');
  microSettingsBtn.textContent = ':)';

  function syncMicroSettingsButton(open) {
    microSettingsBtn.classList.toggle('active', !!open);
    microSettingsBtn.setAttribute('aria-pressed', open ? 'true' : 'false');
  }

  microSettingsBtn.addEventListener('click', () => {
    oracleApplet.closeWidget();
    if (window.__microSettingsPanel && typeof window.__microSettingsPanel.toggle === 'function') {
      window.__microSettingsPanel.toggle();
      syncMicroSettingsButton(!!window.__microSettingsPanel.isOpen);
      return;
    }
    window.dispatchEvent(new CustomEvent('micro-settings:toggle-request'));
  });

  window.addEventListener('micro-settings:visibility', (evt) => {
    syncMicroSettingsButton(!!evt?.detail?.open);
  });

  window.addEventListener('resize', () => {
    if (oracleApplet.isOpen()) positionOracleWidget();
  });

  taskbarEl.appendChild(startBtn);
  taskbarEl.appendChild(tray);
  taskbarEl.appendChild(clock);
  taskbarEl.appendChild(microSettingsBtn);
  taskbarEl.appendChild(oracleWidget);

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
    if (oracleWidget.contains(e.target) || e.target === clock || clock.contains(e.target)) return;
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
