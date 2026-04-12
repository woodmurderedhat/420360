/**
 * Addon Panel — floating draggable panel with two tabs:
 *   SHOUTBOX  — real-time anonymous chat w/ vote distortion
 *   VIBE VOTE — collective decision display & voting
 *
 * Self-contained HTML injection. No external dependencies beyond the addon modules.
 */

import { computeVisibility } from './vote-distortion.js';
import { postMessage, voteMessage } from './shoutbox.js';
import { voteDecision, hasVotedDecision } from './collective-decisions.js';

const PANEL_ID = 'commune-panel';
let _uid = null;
let _activeTab = 'shoutbox';
let _messages = [];
let _decision = null;
let _renderInterval = null;

// ---- UID ----------------------------------------------------------------

function getUid() {
  const KEY = '420360_uid';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'u_' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ---- HTML Injection ------------------------------------------------------

function createPanel() {
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.className = 'addon-panel hidden';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Commune panel');
  panel.innerHTML = `
    <header class="addon-panel-header" id="commune-drag-handle">
      <span class="addon-panel-title">◈ COMMUNE</span>
      <button class="addon-panel-close" aria-label="Close commune panel" title="Close">✕</button>
    </header>
    <nav class="addon-panel-tabs" role="tablist">
      <button class="addon-tab active" data-tab="shoutbox" role="tab" aria-selected="true">SHOUTBOX</button>
      <button class="addon-tab" data-tab="vibeVote" role="tab" aria-selected="false">VIBE VOTE</button>
    </nav>
    <div class="addon-panel-body">
      <section id="commune-shoutbox" class="addon-section" aria-label="Shoutbox">
        <div id="commune-messages" class="commune-messages" aria-live="polite" aria-label="Messages"></div>
        <form id="commune-form" class="commune-form" autocomplete="off">
          <input id="commune-input" type="text" maxlength="280" placeholder="say something..." aria-label="Message input" />
          <button type="submit">SEND</button>
        </form>
      </section>
      <section id="commune-vibeVote" class="addon-section hidden" aria-label="Collective vote">
        <div id="commune-decision" class="commune-decision"></div>
      </section>
    </div>
  `;

  document.body.appendChild(panel);

  // Close button
  panel.querySelector('.addon-panel-close').addEventListener('click', () => togglePanel(false));

  // Tab switching
  panel.querySelectorAll('.addon-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeTab = btn.dataset.tab;
      panel.querySelectorAll('.addon-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === _activeTab);
        t.setAttribute('aria-selected', t.dataset.tab === _activeTab ? 'true' : 'false');
      });
      panel.querySelectorAll('.addon-section').forEach(s => {
        s.classList.toggle('hidden', s.id !== `commune-${_activeTab}`);
      });
    });
  });

  // Form submit
  panel.querySelector('#commune-form').addEventListener('submit', async e => {
    e.preventDefault();
    const input = panel.querySelector('#commune-input');
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    try {
      await postMessage(text, _uid);
      input.value = '';
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  makeDraggable(panel, panel.querySelector('#commune-drag-handle'));
}

// ---- Dragging ------------------------------------------------------------

function makeDraggable(el, handle) {
  let isDown = false;
  let ox = 0;
  let oy = 0;

  handle.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON') return;
    isDown = true;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
  });

  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    el.style.left = (e.clientX - ox) + 'px';
    el.style.top = Math.max(0, e.clientY - oy) + 'px';
    el.style.transform = 'none';
  });
}

// ---- Render ---------------------------------------------------------------

function renderMessages() {
  const container = document.getElementById('commune-messages');
  if (!container) return;

  const now = Date.now();
  const uid = _uid;

  container.innerHTML = '';
  if (!_messages.length) {
    container.innerHTML = '<p class="commune-empty">no transmissions yet</p>';
    return;
  }

  _messages.forEach(msg => {
    const vis = computeVisibility(msg.up || 0, msg.dn || 0);
    const minutesAgo = Math.floor((now - msg.ts) / 60000);
    const timeLabel = minutesAgo < 1 ? 'just now' : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;
    const isOwn = msg.uid === uid;

    const card = document.createElement('div');
    card.className = 'commune-msg' + (vis.glitch ? ' commune-msg-glitch' : '') + (vis.boosted ? ' commune-msg-boosted' : '') + (isOwn ? ' commune-msg-own' : '');
    card.style.setProperty('--msg-opacity', String(vis.opacity.toFixed(3)));

    card.innerHTML = `
      <div class="commune-msg-meta">
        <span class="commune-msg-time">${timeLabel}</span>
        <span class="commune-votes">
          <button class="vote-btn vote-up" data-id="${msg.id}" aria-label="Upvote">▲</button>
          <span class="vote-score">${(msg.up || 0) - (msg.dn || 0)}</span>
          <button class="vote-btn vote-dn" data-id="${msg.id}" aria-label="Downvote">▼</button>
        </span>
      </div>
      <p class="commune-msg-text">${msg.text}</p>
    `;

    card.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const dir = btn.classList.contains('vote-up') ? 'up' : 'dn';
        btn.disabled = true;
        await voteMessage(msg.id, dir, _uid);
      });
    });

    container.appendChild(card);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function renderDecision() {
  const container = document.getElementById('commune-decision');
  if (!container) return;

  if (!_decision) {
    container.innerHTML = '<p class="commune-empty">no active vote</p>';
    return;
  }

  const d = _decision;
  const total = (d.votesA || 0) + (d.votesB || 0);
  const pctA = total > 0 ? Math.round(((d.votesA || 0) / total) * 100) : 50;
  const pctB = 100 - pctA;
  const leaderLabel = d.votesB > d.votesA ? `◈ ${d.optB} is shaping the vibes` : `◈ ${d.optA} is shaping the vibes`;

  container.innerHTML = `
    <p class="commune-q">${d.q}</p>
    <div class="commune-decision-bars">
      <div class="commune-bar-row">
        <span class="commune-opt-label">${d.optA}</span>
        <div class="commune-bar-track">
          <div class="commune-bar-fill commune-bar-a" style="width:${pctA}%"></div>
        </div>
        <span class="commune-opt-pct">${pctA}%</span>
        <button class="commune-vote-opt" data-opt="A">VOTE</button>
      </div>
      <div class="commune-bar-row">
        <span class="commune-opt-label">${d.optB}</span>
        <div class="commune-bar-track">
          <div class="commune-bar-fill commune-bar-b" style="width:${pctB}%"></div>
        </div>
        <span class="commune-opt-pct">${pctB}%</span>
        <button class="commune-vote-opt" data-opt="B">VOTE</button>
      </div>
    </div>
    <p class="commune-leader">${leaderLabel}</p>
    <p class="commune-total">${total} total vote${total !== 1 ? 's' : ''}</p>
  `;

  hasVotedDecision(_uid).then(voted => {
    container.querySelectorAll('.commune-vote-opt').forEach(btn => {
      if (voted) {
        btn.disabled = true;
        btn.textContent = 'VOTED';
      } else {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          await voteDecision(btn.dataset.opt, _uid);
          container.querySelectorAll('.commune-vote-opt').forEach(b => {
            b.disabled = true;
            b.textContent = 'VOTED';
          });
        });
      }
    });
  });
}

// ---- Visibility ticker (re-renders message opacities) --------------------

function startRenderTicker() {
  if (_renderInterval) return;
  _renderInterval = setInterval(() => {
    if (_activeTab === 'shoutbox' && !document.getElementById(PANEL_ID)?.classList.contains('hidden')) {
      renderMessages();
    }
  }, 4000);
}

// ---- Public API ----------------------------------------------------------

export function createAddonPanel() {
  _uid = getUid();
  createPanel();
  startRenderTicker();

  return {
    setMessages(msgs) {
      _messages = msgs;
      if (_activeTab === 'shoutbox') renderMessages();
    },
    setDecision(decision) {
      _decision = decision;
      if (_activeTab === 'vibeVote') renderDecision();
    },
    getUid() { return _uid; }
  };
}

export function togglePanel(forceState) {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  const shouldShow = forceState !== undefined ? forceState : isHidden;
  panel.classList.toggle('hidden', !shouldShow);

  if (shouldShow) {
    renderMessages();
    renderDecision();
  }
}
