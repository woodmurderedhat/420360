export class MetaPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Initial render
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
      </style>
      <div class="panel" aria-label="Meta Progress">
        <div><span class="label">Prestige Level:</span> <span class="prestige">0</span></div>
        <div><span class="label">Legacy Points:</span> <span class="legacy">0</span></div>
        <div><span class="label">Evergreen Upgrades:</span> <span class="upgrades">None</span></div>
      </div>
    `;
  }

  setMeta(meta) {
    // Example: { prestigeLevel, legacyPoints, upgrades }
    const prestige = this.shadowRoot.querySelector('.prestige');
    const legacy = this.shadowRoot.querySelector('.legacy');
    const upgrades = this.shadowRoot.querySelector('.upgrades');
    if (prestige) prestige.textContent = meta.prestigeLevel;
    if (legacy) legacy.textContent = meta.legacyPoints;
    if (upgrades) upgrades.textContent = Object.keys(meta.upgrades || {}).filter(k => meta.upgrades[k]).join(', ') || 'None';
  }

  connectedCallback() {
    // Already rendered in constructor, but could re-render if needed
  }

  disconnectedCallback() {
    // No-op for now
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // No-op for now
  }
}

customElements.define('meta-panel', MetaPanel);