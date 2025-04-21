export class SquirrelModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .modal {
          background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
          border-radius: 18px;
          box-shadow: 0 6px 24px #0003;
          padding: 28px 32px 20px 32px;
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          font-family: 'Quicksand', Arial, sans-serif;
          color: #205522;
          border: 2px solid #66bb6a;
          min-width: 320px;
          text-align: center;
        }
        .modal::before {
          content: '';
          position: absolute;
          left: -30px; top: -30px;
          width: 90px; height: 90px;
          background: url('data:image/svg+xml;utf8,<svg width=\'90\' height=\'90\' xmlns=\'http://www.w3.org/2000/svg\'><ellipse cx=\'45\' cy=\'45\' rx=\'40\' ry=\'20\' fill=\'%2366bb6a\' fill-opacity=\'0.13\'/></svg>') no-repeat;
          z-index: 0;
        }
        .modal button {
          margin-top: 18px;
          background: linear-gradient(90deg, #a5d6a7 0%, #388e3c 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 1.1em;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px #0001;
          transition: background 0.2s, transform 0.2s;
        }
        .modal button:hover {
          background: linear-gradient(90deg, #66bb6a 0%, #388e3c 100%);
          transform: scale(1.05);
        }
        .emoji {
          font-size: 2.2em;
          display: block;
          margin-bottom: 10px;
        }
      </style>
      <div class="modal" aria-label="Squirrel Ambush">
        <div class="emoji" aria-label="Squirrel">🐿️</div>
        <div>A squirrel is trying to steal your fruit! Tap to scare it away!</div>
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