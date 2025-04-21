export class AchievementGarden extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .panel {
          padding: 18px 20px 16px 20px;
          background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
          border-radius: 18px;
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
          background: url('data:image/svg+xml;utf8,<svg width=\'90\' height=\'90\' xmlns=\'http://www.w3.org/2000/svg\'><ellipse cx=\'45\' cy=\'45\' rx=\'40\' ry=\'20\' fill=\'%2381c784\' fill-opacity=\'0.13\'/></svg>') no-repeat;
          z-index: 0;
        }
        h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.3em;
          color: #388e3c;
          letter-spacing: 0.04em;
        }
        ul.achievements {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li.unlocked {
          background: linear-gradient(90deg, #a5d6a7 0%, #66bb6a 100%);
          color: #fff;
          border-radius: 8px;
          margin-bottom: 7px;
          padding: 7px 14px 7px 32px;
          position: relative;
          font-weight: 600;
        }
        li.unlocked::before {
          content: '🌱';
          position: absolute;
          left: 8px;
          top: 6px;
          font-size: 1.1em;
        }
        li.locked {
          background: #e0e0e0;
          color: #888;
          border-radius: 8px;
          margin-bottom: 7px;
          padding: 7px 14px 7px 32px;
          position: relative;
          font-weight: 500;
        }
        li.locked::before {
          content: '🌑';
          position: absolute;
          left: 8px;
          top: 6px;
          font-size: 1.1em;
        }
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