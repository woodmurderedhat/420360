export class AchievementGarden extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { padding: 8px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
      </style>
      <div class="panel" aria-label="Achievement Garden">
        <h3>Achievements</h3>
        <ul class="achievements"></ul>
      </div>
    `;
  }

  setAchievements(achievements) {
    // achievements: { firstPrestige, sunlight1000, legendaryStage, ... }
    const ul = this.shadowRoot.querySelector('.achievements');
    if (!ul) return;
    ul.innerHTML = '';
    Object.entries(achievements || {}).forEach(([key, unlocked]) => {
      const li = document.createElement('li');
      li.textContent = `${key}: ${unlocked ? 'Unlocked' : 'Locked'}`;
      li.className = unlocked ? 'unlocked' : 'locked';
      ul.appendChild(li);
    });
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
}

customElements.define('achievement-garden', AchievementGarden);