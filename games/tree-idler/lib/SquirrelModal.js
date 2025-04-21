export class SquirrelModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .modal { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; padding: 16px; position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; }
        .modal button { margin-top: 12px; }
      </style>
      <div class="modal" aria-label="Squirrel Ambush">
        <div>🐿️ A squirrel is trying to steal your fruit! Tap to scare it away!</div>
        <button id="scare">Scare Squirrel</button>
      </div>
    `;
  }

  connectedCallback() {
    this.shadowRoot.getElementById('scare').addEventListener('click', this._scareHandler);
  }

  disconnectedCallback() {
    this.shadowRoot.getElementById('scare').removeEventListener('click', this._scareHandler);
  }

  _scareHandler = () => {
    this.remove();
    window.dispatchEvent(new CustomEvent('squirrelScared'));
  }
}

customElements.define('squirrel-modal', SquirrelModal);