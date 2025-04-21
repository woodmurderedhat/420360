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
      </style>
      <div class="panel" aria-label="Resource panel">
        <div><span class="icon" aria-label="Sunlight">☀️</span> <span class="label">Sunlight:</span> <span class="sunlight">0</span></div>
        <div><span class="icon" aria-label="Water">💧</span> <span class="label">Water:</span> <span class="water">0</span></div>
      </div>
    `;
  }

  setResources(resources) {
    // Example: { sunlight: 123, water: 456 }
    this.shadowRoot.querySelector('.sunlight').textContent = resources.sunlight;
    this.shadowRoot.querySelector('.water').textContent = resources.water;
  }

  setColorBlind(enabled) {
    this.shadowRoot.host.classList.toggle('cb', enabled);
  }

  connectedCallback() {
    // Render panel UI
  }

  disconnectedCallback() {
    // Called when the element is removed from the DOM
  }
}