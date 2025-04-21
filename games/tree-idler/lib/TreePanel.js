export class TreePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .panel {
          padding: 16px;
          background: linear-gradient(135deg, #e3fcec 0%, #b2dfdb 100%);
          border-radius: 16px;
          box-shadow: 0 4px 16px #0002;
          font-family: 'Quicksand', Arial, sans-serif;
          color: #205522;
          border: 2px solid #26a69a;
          position: relative;
          overflow: hidden;
        }
        .panel::before {
          content: '';
          position: absolute;
          right: -40px; bottom: -40px;
          width: 120px; height: 120px;
          background: url('data:image/svg+xml;utf8,<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="60" rx="50" ry="30" fill="%2326a69a" fill-opacity="0.13"/></svg>') no-repeat;
          z-index: 0;
        }
        .label {
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .stage {
          color: #388e3c;
          font-size: 1.2em;
          font-weight: bold;
        }
        .tree-canvas {
          display: block;
          margin: 16px auto 0 auto;
          background: #e8f5e9;
          border-radius: 12px;
          box-shadow: 0 2px 8px #0001;
          border: 1.5px solid #81c784;
        }
        .cb .panel {
          background: #e0f7fa;
          color: #004d40;
          border: 2px dashed #0077cc;
        }
      </style>
      <div class="panel" aria-label="Tree panel">
        <div><span class="label">Stage:</span> <span class="stage">1</span></div>
        <div><span class="label">Sunlight:</span> <span class="sunlight">0</span></div>
        <div><span class="label">Water:</span> <span class="water">0</span></div>
        <div><span class="label">Weather:</span> <span class="weather"></span></div>
        <canvas class="tree-canvas" width="320" height="320" aria-label="Tree drawing"></canvas>
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
    this.shadowRoot.querySelector('.stage').textContent = state.stage;
    this.shadowRoot.querySelector('.sunlight').textContent = state.sunlight;
    this.shadowRoot.querySelector('.water').textContent = state.water;
    this.shadowRoot.querySelector('.weather').textContent = state.weather || '';
    // Draw the tree
    const canvas = this.shadowRoot.querySelector('.tree-canvas');
    if (canvas && window.TreeGrowthSimulator) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Use the renderTree function from TreeGrowthSimulator
      window.TreeGrowthSimulator.renderTree(ctx, canvas.width, canvas.height, state);
    }
  }

  setColorBlind(enabled) {
    this.shadowRoot.host.classList.toggle('cb', enabled);
  }
}

customElements.define('tree-panel', TreePanel);