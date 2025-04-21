export class ResourcePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        /* Add your styles here */
      </style>
      <div>
        <!-- Add your HTML content here -->
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
    this.shadowRoot.innerHTML = `
      <style>
        .panel { padding: 8px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
        .cb .panel { background: #f5f5f5; color: #222; border: 2px dashed #0077cc; }
      </style>
      <div class="panel" aria-label="Resource panel">
        <div><span class="icon">☀️</span> Sunlight: <span class="sunlight">0</span></div>
        <div><span class="icon">💧</span> Water: <span class="water">0</span></div>
      </div>
    `;
  }

  disconnectedCallback() {
    // Called when the element is removed from the DOM
  }
}