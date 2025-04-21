export class MetaPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Initial render
    this.shadowRoot.innerHTML = `
      <style>
        .panel { padding: 8px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
      </style>
      <div class="panel" aria-label="Meta Progress">
        <div>Prestige Level: <span class="prestige">0</span></div>
        <div>Legacy Points: <span class="legacy">0</span></div>
        <div>Evergreen Upgrades: <span class="upgrades">None</span></div>
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