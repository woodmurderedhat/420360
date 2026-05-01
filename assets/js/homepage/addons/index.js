/**
 * Addons bootstrapper — wires RTDB, shoutbox, decisions, and panel together.
 * Call initAddons({ blurb }) after homepage bootstrap completes.
 */

import { getDb } from './rtdb.js';
import { initShoutbox } from './shoutbox.js';
import { initDecisions } from './collective-decisions.js';
import { createAddonPanel, togglePanel } from './panel.js';
import { initNewsTicker } from './news-ticker.js';

const FB_VERSION = "12.11.0";
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

export async function initAddons({ blurb }) {
  let panel;

  window._toggleCommunePanel = null;
  window.dispatchEvent(new CustomEvent('homepage:addons-status', {
    detail: { status: 'loading' }
  }));

  try {
    const [db, rtdbModule] = await Promise.all([
      getDb(),
      import(`${FB_BASE}/firebase-database.js`)
    ]);

    panel = createAddonPanel();
    const ticker = initNewsTicker();

    await initShoutbox(db, rtdbModule, msgs => {
      panel.setMessages(msgs);
      ticker.setMessages(msgs);
    });

    await initDecisions(db, rtdbModule, blurb, decision => {
      panel.setDecision(decision);
    });

    window._toggleCommunePanel = togglePanel;
    window.dispatchEvent(new CustomEvent('homepage:addons-status', {
      detail: { status: 'ready' }
    }));

  } catch (err) {
    console.warn('[addons] Failed to initialise:', err);
    window._toggleCommunePanel = null;
    window.dispatchEvent(new CustomEvent('homepage:addons-status', {
      detail: { status: 'unavailable' }
    }));
  }
}
