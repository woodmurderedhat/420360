export class TreePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { padding: 8px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
        .cb .panel { background: #f5f5f5; color: #222; border: 2px dashed #0077cc; }
      </style>
      <div class="panel" aria-label="Tree panel">
        <div>Stage: <span class="stage">1</span></div>
        <div>Sunlight: <span class="sunlight">0</span></div>
        <div>Water: <span class="water">0</span></div>
        <div>Weather: <span class="weather"></span></div>
      </div>
    `;
  }

  connectedCallback() {
    // No-op; initial render in constructor
  }

  disconnectedCallback() {
    // No-op
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // No-op
  }

  setTree(state) {
    // Example: { stage, sunlight, water, weather }
    this.shadowRoot.querySelector('.stage').textContent = state.stage;
    this.shadowRoot.querySelector('.sunlight').textContent = state.sunlight;
    this.shadowRoot.querySelector('.water').textContent = state.water;
    this.shadowRoot.querySelector('.weather').textContent = state.weather || '';
  }

  setColorBlind(enabled) {
    this.shadowRoot.host.classList.toggle('cb', enabled);
  }
}

customElements.define('tree-panel', TreePanel);