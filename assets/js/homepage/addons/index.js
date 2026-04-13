/**
 * Addons bootstrapper — wires RTDB, shoutbox, decisions, and panel together.
 * Call initAddons({ blurb }) after homepage bootstrap completes.
 */

import { getDb } from './rtdb.js';
import { initShoutbox } from './shoutbox.js';
import { initDecisions } from './collective-decisions.js';
import { createAddonPanel } from './panel.js';
import { initNewsTicker } from './news-ticker.js';

const FB_VERSION = "12.11.0";
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

export async function initAddons({ blurb }) {
  let panel;
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

  } catch (err) {
    console.warn('[addons] Failed to initialise:', err);
  }

  // Expose togglePanel globally so the COMMUNE button can reach it
  // without a circular import chain through interaction-system
  const { togglePanel } = await import('./panel.js');
  window._toggleCommunePanel = togglePanel;
}
