import { emit } from './EventBus.js'; // Import emit

export class ResourcePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .panel {
          padding: 16px;
          background: linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%);
          border-radius: 16px;
          box-shadow: 0 4px 16px #0002;
          font-family: 'Quicksand', Arial, sans-serif;
          color: #205522;
          border: 2px solid #66bb6a;
          position: relative;
          overflow: hidden;
          min-width: 200px; /* Ensure minimum width */
        }
        .panel::before {
          content: '';
          position: absolute;
          left: -40px; top: -40px;
          width: 120px; height: 120px;
          background: url('data:image/svg+xml;utf8,<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="60" rx="50" ry="30" fill="%2366bb6a" fill-opacity="0.15"/></svg>') no-repeat;
          z-index: 0;
        }
        .icon {
          font-size: 1.5em;
          vertical-align: middle;
          margin-right: 0.3em;
          animation: sway 2.5s infinite ease-in-out alternate;
        }
        @keyframes sway {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
        .label {
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .cb .panel {
          background: #e0f7fa;
          color: #004d40;
          border: 2px dashed #0077cc;
        }
        .resource-item, .upgrade-item {
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
          background-color: #81c784;
          border: 1px solid #4caf50;
          color: #1b5e20;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .upgrade-item button:hover {
          background-color: #66bb6a;
        }
        .upgrade-item button:disabled {
          background-color: #c8e6c9;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .toggle-button {
          padding: 4px 8px;
          font-size: 0.9em;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
          width: 100%; /* Make toggle fill width */
          margin-top: 5px;
        }
        .toggle-button.enabled {
          background-color: #ffb74d; /* Orange when enabled */
          border: 1px solid #fb8c00;
          color: #8d24aa;
        }
        .toggle-button.disabled {
          background-color: #e0e0e0; /* Grey when disabled */
          border: 1px solid #9e9e9e;
          color: #424242;
        }
        .fruit-icon {
          font-size: 1.5em;
          vertical-align: middle;
          margin-right: 0.3em;
        }
      </style>
      <div class="panel panel-content" aria-label="Resource panel">
        <div class="resource-item">
          <span><span class="icon" aria-label="Sunlight">☀️</span> <span class="label">Sunlight:</span></span>
          <span class="value sunlight">0</span>
        </div>
        <div class="resource-item">
          <span><span class="icon" aria-label="Water">💧</span> <span class="label">Water:</span></span>
          <span class="value water">0</span>
        </div>
        <div class="resource-item" id="fruit-display" style="display: none;"> <!-- Hide initially -->
          <span><span class="fruit-icon" aria-label="Fruits">🍎</span> <span class="label">Fruits:</span></span>
          <span class="value fruits">0</span>
        </div>
        <hr>
        <div class="upgrade-item">
          <span class="label">Leaf Eff. (L):</span>
          <button id="upgrade-leaf" data-upgrade="leafEfficiency">Upgrade</button>
        </div>
        <div class="upgrade-item">
          <span class="label">Root Eff. (R):</span>
          <button id="upgrade-root" data-upgrade="rootEfficiency">Upgrade</button>
        </div>
        <div class="upgrade-item" id="fruit-upgrades" style="display: none;"> <!-- Hide initially -->
          <span class="label">Fruit Value (F):</span>
          <button id="upgrade-fruit-value" data-upgrade="fruitValue">Upgrade</button>
        </div>
        <div class="upgrade-item" id="fruit-speed-upgrade" style="display: none;"> <!-- Hide initially -->
          <span class="label">Fruit Speed:</span>
          <button id="upgrade-fruit-speed" data-upgrade="fruitSpeed">Upgrade</button>
        </div>
        <div id="auto-harvest-toggle" style="display: none;"> <!-- Hide initially -->
          <button id="toggle-harvest" class="toggle-button disabled">Auto-Harvest: OFF</button>
        </div>
      </div>
    `;

    // Add event listeners
    this.shadowRoot.querySelectorAll('button[data-upgrade]').forEach(button => {
      button.addEventListener('click', (e) => {
        const upgradeType = e.target.dataset.upgrade;
        emit('upgradeRequest', { type: upgradeType });
      });
    });

    this.shadowRoot.getElementById('toggle-harvest').addEventListener('click', () => {
      emit('toggleAutoHarvest');
    });
  }

  update(state) {
    if (!state) return; // Guard against missing state

    const upgrades = state.upgrades || {};
    const resources = { 
      sunlight: state.sunlight || 0,
      water: state.water || 0,
      fruits: state.fruits || 0
    };
    const tree = state.tree || {};

    // Update resource displays
    this.shadowRoot.querySelector('.sunlight').textContent = Math.floor(resources.sunlight).toLocaleString();
    this.shadowRoot.querySelector('.water').textContent = Math.floor(resources.water).toLocaleString();
    this.shadowRoot.querySelector('.fruits').textContent = Math.floor(resources.fruits).toLocaleString();

    // Show/Hide fruit related UI based on tree stage (e.g., stage 3+)
    const showFruits = tree.growthStage >= 3;
    this.shadowRoot.getElementById('fruit-display').style.display = showFruits ? 'flex' : 'none';
    this.shadowRoot.getElementById('fruit-upgrades').style.display = showFruits ? 'flex' : 'none';
    this.shadowRoot.getElementById('fruit-speed-upgrade').style.display = showFruits ? 'flex' : 'none';
    this.shadowRoot.getElementById('auto-harvest-toggle').style.display = showFruits ? 'block' : 'none'; // block for button

    // Update Auto-Harvest toggle button
    const harvestButton = this.shadowRoot.getElementById('toggle-harvest');
    const autoHarvestEnabled = upgrades.autoHarvest || false;
    harvestButton.textContent = `Auto-Harvest: ${autoHarvestEnabled ? 'ON' : 'OFF'}`;
    harvestButton.classList.toggle('enabled', autoHarvestEnabled);
    harvestButton.classList.toggle('disabled', !autoHarvestEnabled);
  }

  connectedCallback() {
    // Initial render or update could happen here if needed
  }

  disconnectedCallback() {
    // Cleanup if necessary (event listeners on shadow DOM are usually GC'd)
  }
}