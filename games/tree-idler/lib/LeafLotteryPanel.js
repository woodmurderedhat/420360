export class LeafLotteryPanel extends HTMLElement {
  updateCooldown() {
    // Example: show cooldown timer (dummy for now)
    this.shadowRoot.querySelector('.cooldown').textContent = 'Cooldown active';
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .panel { padding: 8px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
      </style>
      <div class="panel" aria-label="Leaf Lottery panel">
        <div class="cooldown">Ready</div>
        <button>Draw Gold Leaf</button>
      </div>
    `;
  }
}