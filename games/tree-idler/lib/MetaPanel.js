import { emit } from './EventBus.js';

// Define costs for legacy upgrades (can be moved to config later)
const LEGACY_UPGRADE_COSTS = {
    seedVault: 1,
    deepRoots: 1,
    sunCrystal: 1,
};

export class MetaPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .panel {
          padding: 16px;
          background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
          border-radius: 16px;
          box-shadow: 0 4px 16px #0002;
          font-family: 'Quicksand', Arial, sans-serif;
          color: #205522;
          border: 2px solid #4db6ac;
          position: relative;
          overflow: hidden;
          min-width: 220px; /* Ensure enough width */
        }
        .panel::before {
          content: '';
          position: absolute;
          right: -30px; bottom: -30px;
          width: 90px; height: 90px;
          background: url('data:image/svg+xml;utf8,<svg width=\'90\' height=\'90\' xmlns=\'http://www.w3.org/2000/svg\'><ellipse cx=\'45\' cy=\'45\' rx=\'40\' ry=\'20\' fill=\'%234db6ac\' fill-opacity=\'0.13\'/></svg>') no-repeat;
          z-index: 0;
        }
        .label {
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .prestige {
          color: #388e3c;
          font-weight: bold;
        }
        .legacy {
          color: #00796b;
          font-weight: bold;
        }
        .upgrades {
          color: #558b2f;
        }
        .meta-item, .upgrade-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          position: relative; /* For icon positioning */
          z-index: 1; /* Above pseudo-element */
        }
        .upgrade-item button {
          padding: 4px 8px;
          font-size: 0.9em;
          cursor: pointer;
          background-color: #80cbc4; /* Teal background */
          border: 1px solid #26a69a;
          color: #004d40; /* Dark teal text */
          border-radius: 4px;
          transition: background-color 0.2s;
          margin-left: 10px; /* Space from label */
        }
        .upgrade-item button:hover:not(:disabled) {
          background-color: #4db6ac;
        }
        .upgrade-item button:disabled {
          background-color: #b2dfdb; /* Lighter teal */
          cursor: not-allowed;
          opacity: 0.7;
        }
        .upgrade-item .cost {
          font-size: 0.8em;
          margin-left: 4px;
          color: #00796b;
        }
        .purchased {
          font-style: italic;
          color: #004d40;
        }
      </style>
      <div class="panel panel-content" aria-label="Meta Progress">
        <div class="meta-item">
          <span class="label">Prestige Level:</span>
          <span class="value prestige">0</span>
        </div>
        <div class="meta-item">
          <span class="label">Legacy Points (LP):</span>
          <span class="value legacy">0</span>
        </div>
        <hr>
        <div class="upgrade-item">
          <span class="label">Seed Vault:</span>
          <button id="buy-seedVault" data-upgrade="seedVault">
            Buy <span class="cost">(${LEGACY_UPGRADE_COSTS.seedVault} LP)</span>
          </button>
          <span class="purchased" style="display: none;">Purchased</span>
        </div>
        <div class="upgrade-item">
          <span class="label">Deep Roots:</span>
          <button id="buy-deepRoots" data-upgrade="deepRoots">
            Buy <span class="cost">(${LEGACY_UPGRADE_COSTS.deepRoots} LP)</span>
          </button>
          <span class="purchased" style="display: none;">Purchased</span>
        </div>
        <div class="upgrade-item">
          <span class="label">Sun Crystal:</span>
          <button id="buy-sunCrystal" data-upgrade="sunCrystal">
            Buy <span class="cost">(${LEGACY_UPGRADE_COSTS.sunCrystal} LP)</span>
          </button>
          <span class="purchased" style="display: none;">Purchased</span>
        </div>
      </div>
    `;

    // Add event listeners
    this.shadowRoot.querySelectorAll('button[data-upgrade]').forEach(button => {
      button.addEventListener('click', (e) => {
        const upgradeType = e.target.closest('button').dataset.upgrade;
        const cost = LEGACY_UPGRADE_COSTS[upgradeType];
        if (upgradeType && cost !== undefined) {
          emit('spendLegacyPoints', { type: upgradeType, cost: cost });
        }
      });
    });
  }

  // Central update method called by UI.js
  update(state) {
    if (!state) return; // Guard against missing state

    const prestigeLevel = state.prestigeLevel || 0;
    const legacyPoints = state.legacyPoints || 0;
    const legacyUpgrades = state.legacyUpgrades || {};

    // Update displays
    this.shadowRoot.querySelector('.prestige').textContent = prestigeLevel;
    this.shadowRoot.querySelector('.legacy').textContent = legacyPoints;

    // Update legacy upgrade buttons
    for (const type in LEGACY_UPGRADE_COSTS) {
      const button = this.shadowRoot.getElementById(`buy-${type}`);
      const purchasedIndicator = button.nextElementSibling; // The "Purchased" span
      const cost = LEGACY_UPGRADE_COSTS[type];
      const isPurchased = legacyUpgrades[type];

      if (isPurchased) {
        button.style.display = 'none'; // Hide button
        purchasedIndicator.style.display = 'inline'; // Show "Purchased"
      } else {
        button.style.display = 'inline-block'; // Show button
        purchasedIndicator.style.display = 'none'; // Hide "Purchased"
        button.disabled = legacyPoints < cost;
      }
    }
  }

  connectedCallback() {
    // Initial render or update could happen here if needed
  }

  disconnectedCallback() {
    // Cleanup if necessary
  }
}

// Ensure the custom element is defined
if (!customElements.get('meta-panel')) {
  customElements.define('meta-panel', MetaPanel);
}