export class LeafLotteryPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  updateCooldown() {
    // Example: show cooldown timer (dummy for now)
    this.shadowRoot.querySelector('.cooldown').textContent = 'Cooldown active';
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .panel {
          padding: 16px;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border-radius: 16px;
          box-shadow: 0 4px 16px #0002;
          font-family: 'Quicksand', Arial, sans-serif;
          color: #205522;
          border: 2px solid #81c784;
          position: relative;
          overflow: hidden;
        }
        .panel::before {
          content: '';
          position: absolute;
          left: -30px; top: -30px;
          width: 90px; height: 90px;
          background: url('data:image/svg+xml;utf8,<svg width=\'90\' height=\'90\' xmlns=\'http://www.w3.org/2000/svg\'><ellipse cx=\'45\' cy=\'45\' rx=\'40\' ry=\'20\' fill=\'%2381c784\' fill-opacity=\'0.18\'/></svg>') no-repeat;
          z-index: 0;
        }
        .cooldown {
          font-weight: 600;
          color: #388e3c;
          margin-bottom: 8px;
        }
        button {
          background: linear-gradient(90deg, #a5d6a7 0%, #66bb6a 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 1em;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px #0001;
          transition: background 0.2s, transform 0.2s;
        }
        button:hover {
          background: linear-gradient(90deg, #66bb6a 0%, #388e3c 100%);
          transform: scale(1.05);
        }
      </style>
      <div class="panel" aria-label="Leaf Lottery panel">
        <div class="cooldown">Ready</div>
        <button>Draw Gold Leaf</button>
      </div>
    `;
  }
}