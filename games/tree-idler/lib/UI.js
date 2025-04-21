// UI.js
// Web Components for panels, drag/drop, accessibility.
import { on, off } from './EventBus.js';

export const name = 'UI';

let resourcePanel = null;
let treePanel = null;
let toastPanel = null;
let leafLotteryPanel = null;
let leafLotteryCooldown = 0;
let squirrelModal = null;
let squirrelTimeout = null;
let colorBlindMode = false;
let metaPanel = null;
let achievementGarden = null;

function applyColorBlindMode() {
  document.body.classList.toggle('color-blind', colorBlindMode);
  // Update panels if needed
  if (resourcePanel) resourcePanel.setColorBlind(colorBlindMode);
  if (treePanel) treePanel.setColorBlind(colorBlindMode);
}

function makeDraggable(panel, panelName) {
  let offsetX = 0, offsetY = 0, dragging = false;
  const header = document.createElement('div');
  header.style.cursor = 'move';
  header.style.height = '18px';
  header.style.marginBottom = '2px';
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-label', `Drag ${panelName} panel`);
  header.title = `Drag to move ${panelName} panel`;
  header.addEventListener('mousedown', startDrag);
  header.addEventListener('touchstart', startDrag, { passive: false });
  panel.shadowRoot.prepend(header);

  function startDrag(e) {
    dragging = true;
    const evt = e.touches ? e.touches[0] : e;
    offsetX = evt.clientX - panel.offsetLeft;
    offsetY = evt.clientY - panel.offsetTop;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
    e.preventDefault();
  }
  function drag(e) {
    if (!dragging) return;
    const evt = e.touches ? e.touches[0] : e;
    panel.style.position = 'fixed';
    panel.style.left = (evt.clientX - offsetX) + 'px';
    panel.style.top = (evt.clientY - offsetY) + 'px';
  }
  function stopDrag() {
    dragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
    // Persist position
    emit('panelMoved', { name: panelName, left: panel.style.left, top: panel.style.top });
  }
}

function addCollapseButton(panel, panelName) {
  const btn = document.createElement('button');
  btn.textContent = '–';
  btn.setAttribute('aria-label', `Collapse ${panelName} panel`);
  btn.title = `Collapse/expand ${panelName} panel`;
  btn.style.position = 'absolute';
  btn.style.top = '4px';
  btn.style.right = '8px';
  btn.style.zIndex = '10';
  btn.style.background = '#eee';
  btn.style.border = '1px solid #aaa';
  btn.style.borderRadius = '50%';
  btn.style.width = '24px';
  btn.style.height = '24px';
  btn.style.fontWeight = 'bold';
  btn.style.cursor = 'pointer';
  btn.addEventListener('click', () => {
    const content = panel.shadowRoot.querySelector('.panel');
    if (content.style.display === 'none') {
      content.style.display = '';
      btn.textContent = '–';
      emit('panelCollapsed', { name: panelName, collapsed: false });
    } else {
      content.style.display = 'none';
      btn.textContent = '+';
      emit('panelCollapsed', { name: panelName, collapsed: true });
    }
  });
  panel.shadowRoot.appendChild(btn);
}

class ResourcePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { background: #f4ffe6; border-radius: 8px; padding: 1em; font-family: sans-serif; }
        .row { margin: 0.5em 0; display: flex; align-items: center; }
        .leaf {
          display: inline-block;
          animation: sway 2s infinite ease-in-out;
        }
        .root {
          display: inline-block;
          animation: pulse 1.5s infinite alternate;
        }
        @keyframes sway {
          0% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
          100% { transform: rotate(-8deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
      </style>
      <div class="panel">
        <div class="row" title="Total sunlight collected" aria-label="Sunlight">
          <span class="leaf" aria-hidden="true">🌞</span>
          Sunlight: <span id="sunlight">0</span>
        </div>
        <div class="row" title="Total water collected" aria-label="Water">
          <span class="root" aria-hidden="true">💧</span>
          Water: <span id="water">0</span>
        </div>
      </div>
    `;
  }
  setResources({ sunlight, water }) {
    this.shadowRoot.getElementById('sunlight').textContent = sunlight;
    this.shadowRoot.getElementById('water').textContent = water;
  }
  setColorBlind(enabled) {
    this.shadowRoot.host.classList.toggle('cb', enabled);
  }
}

class TreePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { background: #e6f4ff; border-radius: 8px; padding: 1em; font-family: sans-serif; margin-top: 1em; }
        .stage { font-weight: bold; font-size: 1.2em; }
        .slots { margin-top: 0.5em; }
        .growth-ring {
          display: inline-block;
          width: 24px; height: 24px;
          border-radius: 50%;
          border: 3px solid #bfa76f;
          margin-left: 0.5em;
          animation: grow-ring 0.7s cubic-bezier(.68,-0.55,.27,1.55) 1;
        }
        .progress-bar {
          width: 100%;
          height: 18px;
          background: #d0e6ff;
          border-radius: 8px;
          margin: 0.7em 0 0.2em 0;
          overflow: hidden;
          position: relative;
        }
        .progress {
          height: 100%;
          background: linear-gradient(90deg, #7ed957, #4fc3f7);
          border-radius: 8px 0 0 8px;
          transition: width 0.4s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .progress-label {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          font-size: 0.95em;
          color: #222;
          font-weight: bold;
        }
      </style>
      <div class="panel">
        <div class="stage" aria-label="Tree Stage" title="Current tree growth stage">
          🌳 Stage: <span id="stage">1</span>
          <span id="ring" class="growth-ring" style="display:none;"></span>
        </div>
        <div class="progress-bar" title="Progress to next stage">
          <div class="progress" id="progress" style="width:0%"></div>
          <span class="progress-label" id="progressLabel"></span>
        </div>
        <div class="slots">
          🍃 Leaves: <span id="leaves" title="Number of leaves" aria-label="Leaves">1</span> |
          🌱 Roots: <span id="roots" title="Number of roots" aria-label="Roots">1</span> |
          🍎 Fruits: <span id="fruits" title="Number of fruits" aria-label="Fruits">0</span> |
          🐿️ Critters: <span id="critters" title="Number of critters" aria-label="Critters">0</span>
        </div>
        <canvas id="treeCanvas" width="300" height="200" style="margin-top:1em; width:100%; height:auto;"></canvas>
      </div>
    `;
    this.lastStage = 1;
  }
  setTree({ stage, slots, sunlight, water, season }) {
    this.shadowRoot.getElementById('stage').textContent = stage;
    this.shadowRoot.getElementById('leaves').textContent = slots.leaves;
    this.shadowRoot.getElementById('roots').textContent = slots.roots;
    this.shadowRoot.getElementById('fruits').textContent = slots.fruits;
    this.shadowRoot.getElementById('critters').textContent = slots.critters;
    // Animate growth ring if stage increased
    if (stage > this.lastStage) {
      const ring = this.shadowRoot.getElementById('ring');
      ring.style.display = '';
      ring.style.animation = 'none';
      void ring.offsetWidth;
      ring.style.animation = '';
      setTimeout(() => { ring.style.display = 'none'; }, 800);
    }
    this.lastStage = stage;
    // Progress bar logic
    const cost = 100 * Math.pow(2, stage - 1); // Example: exponential cost
    const current = Math.min((sunlight || 0) + (water || 0), cost);
    const percent = Math.round((current / cost) * 100);
    this.shadowRoot.getElementById('progress').style.width = percent + '%';
    this.shadowRoot.getElementById('progressLabel').textContent = `${current} / ${cost}`;

    // Render the tree on the canvas
    const canvas = this.shadowRoot.getElementById('treeCanvas');
    if (canvas) {
      // Trigger tree rendering
      window.dispatchEvent(new CustomEvent('renderTree', {
        detail: {
          canvas,
          state: {
            stage,
            slots,
            visualSeed: Math.random(), // Use a consistent seed for stable rendering
            season: season || 'spring'
          }
        }
      }));
    }
  }
  setColorBlind(enabled) {
    this.shadowRoot.host.classList.toggle('cb', enabled);
  }
}

class ToastPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .toast {
          position: fixed;
          bottom: 2em;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 1em 2em;
          border-radius: 8px;
          font-size: 1.1em;
          opacity: 0.95;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 1000;
          margin-top: 0.5em;
        }
      </style>
      <div id="container"></div>
    `;
  }
  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    this.shadowRoot.getElementById('container').appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

class LeafLotteryPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { background: #fffbe6; border-radius: 8px; padding: 1em; font-family: sans-serif; margin-top: 1em; }
        button { font-size: 1em; padding: 0.5em 1em; border-radius: 6px; border: none; background: #e6e600; color: #333; cursor: pointer; }
        button[disabled] { background: #ccc; color: #888; cursor: not-allowed; }
        .cooldown { color: #888; font-size: 0.9em; margin-top: 0.5em; }
      </style>
      <div class="panel">
        <div><b>🍀 Leaf Lottery</b></div>
        <button id="drawBtn">Draw (50 🌞)</button>
        <div class="cooldown" id="cooldown"></div>
      </div>
    `;
    this.drawBtn = this.shadowRoot.getElementById('drawBtn');
    this.cooldownDiv = this.shadowRoot.getElementById('cooldown');
    this.drawBtn.addEventListener('click', () => this.draw());
    this.updateCooldown();
  }
  updateCooldown() {
    const now = Date.now();
    if (leafLotteryCooldown > now) {
      this.drawBtn.disabled = true;
      const secs = Math.ceil((leafLotteryCooldown - now) / 1000);
      this.cooldownDiv.textContent = `Next draw in ${secs}s`;
    } else {
      this.drawBtn.disabled = false;
      this.cooldownDiv.textContent = '';
    }
  }
  draw() {
    const now = Date.now();
    if (leafLotteryCooldown > now) return;
    window.dispatchEvent(new CustomEvent('leafLotteryDraw'));
    leafLotteryCooldown = now + 3600_000; // 1 hour cooldown
    this.updateCooldown();
    // Start interval to update cooldown display
    const interval = setInterval(() => {
      this.updateCooldown();
      if (Date.now() > leafLotteryCooldown) {
        clearInterval(interval);
        this.updateCooldown();
      }
    }, 1000);
  }
}

class SquirrelModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff8e1;
          border: 2px solid #bfa76f;
          border-radius: 12px;
          padding: 2em 2em 1em 2em;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
          z-index: 2000;
          text-align: center;
        }
        button {
          font-size: 1.2em;
          padding: 0.5em 2em;
          border-radius: 8px;
          border: none;
          background: #e6c200;
          color: #333;
          cursor: pointer;
          margin-top: 1em;
        }
      </style>
      <div class="modal">
        <div style="font-size:2em;">🐿️ Squirrel Ambush!</div>
        <div>A squirrel is trying to steal your fruit!</div>
        <button id="scareBtn">Tap to Scare!</button>
      </div>
    `;
    this.scareBtn = this.shadowRoot.getElementById('scareBtn');
    this.scareBtn.addEventListener('click', () => this.scare());
  }
  scare() {
    this.remove();
    window.dispatchEvent(new CustomEvent('squirrelScared'));
    if (squirrelTimeout) clearTimeout(squirrelTimeout);
  }
}

class ColorBlindToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        button {
          position: fixed;
          top: 1em;
          right: 1em;
          z-index: 2001;
          background: #fff;
          border: 2px solid #333;
          border-radius: 50%;
          width: 40px; height: 40px;
          font-size: 1.3em;
          cursor: pointer;
          outline: none;
        }
        button:focus {
          box-shadow: 0 0 0 3px #00aaff;
        }
      </style>
      <button id="toggle" title="Toggle color-blind mode" aria-label="Toggle color-blind mode" tabindex="0">🎨</button>
    `;
    this.btn = this.shadowRoot.getElementById('toggle');
    this.btn.addEventListener('click', () => {
      colorBlindMode = !colorBlindMode;
      applyColorBlindMode();
    });
  }
}

class MetaPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel { background: #f0e6ff; border-radius: 8px; padding: 1em; font-family: sans-serif; margin-top: 1em; min-width: 220px; }
        .row { margin: 0.5em 0; }
        button { font-size: 1em; padding: 0.4em 1em; border-radius: 6px; border: none; background: #bfa6ff; color: #333; cursor: pointer; }
        button[disabled] { background: #ccc; color: #888; cursor: not-allowed; }
        .upgrade { margin: 0.5em 0; }
      </style>
      <div class="panel">
        <div class="row" title="Prestige Level" aria-label="Prestige Level">🌳 Prestige: <span id="prestige">0</span></div>
        <div class="row" title="Legacy Points" aria-label="Legacy Points">🏆 Legacy: <span id="legacy">0</span></div>
        <div class="row">
          <button id="prestigeBtn" aria-label="Prestige" title="Prestige for permanent bonus">Prestige</button>
        </div>
        <div class="row"><b>Evergreen Upgrades</b></div>
        <div class="upgrade"><button id="seedVaultBtn">Seed Vault (+Start Resources)</button></div>
        <div class="upgrade"><button id="deepRootsBtn">Deep Roots (+Water Bonus)</button></div>
        <div class="upgrade"><button id="sunCrystalBtn">Sun Crystal (+Sunlight Bonus)</button></div>
      </div>
    `;
    this.prestigeSpan = this.shadowRoot.getElementById('prestige');
    this.legacySpan = this.shadowRoot.getElementById('legacy');
    this.prestigeBtn = this.shadowRoot.getElementById('prestigeBtn');
    this.seedVaultBtn = this.shadowRoot.getElementById('seedVaultBtn');
    this.deepRootsBtn = this.shadowRoot.getElementById('deepRootsBtn');
    this.sunCrystalBtn = this.shadowRoot.getElementById('sunCrystalBtn');
    this.prestigeBtn.addEventListener('click', () => this.confirmPrestige());
    this.seedVaultBtn.addEventListener('click', () => this.buyUpgrade('seedVault'));
    this.deepRootsBtn.addEventListener('click', () => this.buyUpgrade('deepRoots'));
    this.sunCrystalBtn.addEventListener('click', () => this.buyUpgrade('sunCrystal'));
    this.state = { prestigeLevel: 0, legacyPoints: 0, upgrades: {} };
  }
  setMeta({ prestigeLevel, legacyPoints, upgrades }) {
    this.state = { prestigeLevel, legacyPoints, upgrades };
    this.prestigeSpan.textContent = prestigeLevel;
    this.legacySpan.textContent = legacyPoints;
    this.seedVaultBtn.disabled = upgrades?.seedVault;
    this.deepRootsBtn.disabled = upgrades?.deepRoots;
    this.sunCrystalBtn.disabled = upgrades?.sunCrystal;
  }
  confirmPrestige() {
    if (confirm('Prestige? This will reset your tree but grant a permanent bonus!')) {
      window.dispatchEvent(new CustomEvent('prestige'));
    }
  }
  buyUpgrade(upgrade) {
    window.dispatchEvent(new CustomEvent('buyEvergreenUpgrade', { detail: { upgrade } }));
  }
}

class AchievementGarden extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .panel {
          background: #e6ffe6;
          border-radius: 8px;
          padding: 1em;
          font-family: sans-serif;
          margin-top: 1em;
          min-width: 300px;
        }
        .title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .garden-container {
          position: relative;
          width: 100%;
          height: 200px;
          background: #8B4513; /* Soil color */
          border-radius: 8px;
          margin-bottom: 1em;
          overflow: hidden;
        }
        .soil-layer {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 40px;
          background: linear-gradient(to bottom, #A0522D, #8B4513);
        }
        .grass-layer {
          position: absolute;
          bottom: 40px;
          width: 100%;
          height: 10px;
          background: #228B22;
        }
        .sky-layer {
          position: absolute;
          top: 0;
          width: 100%;
          height: calc(100% - 50px);
          background: linear-gradient(to bottom, #87CEEB, #E0F7FA);
        }
        .plant {
          position: absolute;
          bottom: 40px; /* Above soil */
          transform: translateX(-50%);
          transition: all 0.5s ease-out;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
        }
        .plant.growing {
          animation: grow 1s ease-out forwards;
        }
        @keyframes grow {
          from { transform: translateX(-50%) scale(0.2); opacity: 0.5; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .plant-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.3em 0.7em;
          border-radius: 4px;
          font-size: 0.8em;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 10;
        }
        .plant:hover .plant-tooltip {
          opacity: 1;
        }
        .grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          margin-top: 1em;
        }
        .achv {
          width: 48px; height: 48px;
          border-radius: 8px;
          background: #fff;
          border: 2px solid #bfa76f;
          display: flex; align-items: center; justify-content: center;
          font-size: 2em;
          opacity: 0.5;
          transition: opacity 0.3s;
          position: relative;
        }
        .achv.unlocked { opacity: 1; border-color: #4caf50; }
        .achv[tabindex="0"]:focus { outline: 3px solid #00aaff; }
        .tooltip {
          display: none;
          position: absolute;
          bottom: 110%; left: 50%; transform: translateX(-50%);
          background: #333; color: #fff; padding: 0.3em 0.7em;
          border-radius: 6px; font-size: 0.9em; white-space: nowrap;
          z-index: 10;
        }
        .achv:hover .tooltip, .achv:focus .tooltip { display: block; }
        .progress-text {
          font-size: 0.9em;
          color: #555;
          margin-top: 0.5em;
          text-align: center;
        }
        .sun {
          position: absolute;
          top: 20px;
          right: 30px;
          width: 40px;
          height: 40px;
          background: #FFD700;
          border-radius: 50%;
          box-shadow: 0 0 20px #FFD700;
        }
        .cloud {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          filter: blur(3px);
        }
        .cloud-1 {
          top: 30px;
          left: 40px;
          width: 60px;
          height: 30px;
        }
        .cloud-2 {
          top: 20px;
          left: 150px;
          width: 80px;
          height: 40px;
        }
      </style>
      <div class="panel">
        <div class="title">
          <span>🏆 Achievement Garden</span>
          <span id="progress-count">0/5</span>
        </div>
        <div class="garden-container" role="img" aria-label="Achievement Garden Visualization">
          <div class="sky-layer">
            <div class="sun" aria-hidden="true"></div>
            <div class="cloud cloud-1" aria-hidden="true"></div>
            <div class="cloud cloud-2" aria-hidden="true"></div>
          </div>
          <div class="grass-layer" aria-hidden="true"></div>
          <div class="soil-layer" aria-hidden="true"></div>
          <div id="plants-container"></div>
        </div>
        <div class="progress-text" id="progress-text" aria-live="polite">Plant achievements to grow your garden!</div>
        <div class="grid" id="grid" role="list" aria-label="Achievement list"></div>
      </div>
    `;
    this.achievements = [
      {
        key: 'firstPrestige',
        icon: '🌳',
        label: 'First Prestige',
        desc: 'Prestige for the first time.',
        plantType: 'tree',
        plantPosition: 20,
        plantHeight: 80,
        plantHtml: `<svg width="40" height="80" viewBox="0 0 40 80">
          <path d="M20,80 L20,40" stroke="#8B4513" stroke-width="5"/>
          <ellipse cx="20" cy="30" rx="15" ry="25" fill="#228B22"/>
        </svg>`
      },
      {
        key: 'sunlight1000',
        icon: '🌞',
        label: 'Sunlight Hoarder',
        desc: 'Collect 1000 sunlight.',
        plantType: 'sunflower',
        plantPosition: 50,
        plantHeight: 70,
        plantHtml: `<svg width="30" height="70" viewBox="0 0 30 70">
          <path d="M15,70 L15,30" stroke="#228B22" stroke-width="3"/>
          <circle cx="15" cy="15" r="15" fill="#FFD700"/>
          <circle cx="15" cy="15" r="8" fill="#8B4513"/>
        </svg>`
      },
      {
        key: 'legendaryStage',
        icon: '👑',
        label: 'Legendary',
        desc: 'Reach Legendary stage.',
        plantType: 'crystal',
        plantPosition: 80,
        plantHeight: 60,
        plantHtml: `<svg width="30" height="60" viewBox="0 0 30 60">
          <path d="M15,60 L15,40" stroke="#8B4513" stroke-width="3"/>
          <polygon points="15,5 5,25 15,40 25,25" fill="#9370DB" stroke="#4B0082" stroke-width="1"/>
        </svg>`
      },
      {
        key: 'fruitMaster',
        icon: '🍎',
        label: 'Fruit Master',
        desc: 'Have 8 fruits at once.',
        plantType: 'fruit-bush',
        plantPosition: 110,
        plantHeight: 50,
        plantHtml: `<svg width="40" height="50" viewBox="0 0 40 50">
          <ellipse cx="20" cy="25" rx="20" ry="20" fill="#228B22"/>
          <circle cx="15" cy="15" r="5" fill="#FF0000"/>
          <circle cx="25" cy="20" r="5" fill="#FF0000"/>
          <circle cx="10" cy="25" r="5" fill="#FF0000"/>
        </svg>`
      },
      {
        key: 'squirrelHero',
        icon: '🐿️',
        label: 'Squirrel Hero',
        desc: 'Scare off 10 squirrels.',
        plantType: 'mushroom',
        plantPosition: 140,
        plantHeight: 40,
        plantHtml: `<svg width="30" height="40" viewBox="0 0 30 40">
          <path d="M15,40 L15,25" stroke="#FFFFFF" stroke-width="3"/>
          <ellipse cx="15" cy="15" rx="15" ry="10" fill="#FF4500"/>
          <circle cx="10" cy="12" r="2" fill="#FFFFFF"/>
          <circle cx="20" cy="12" r="2" fill="#FFFFFF"/>
        </svg>`
      }
    ];
    this.state = {};
    this.render();
  }

  setAchievements(state) {
    const previousState = { ...this.state };
    this.state = state;
    this.render(previousState);
  }

  render(previousState = {}) {
    // Update achievement icons grid
    const grid = this.shadowRoot.getElementById('grid');
    grid.innerHTML = '';

    // Count unlocked achievements
    let unlockedCount = 0;

    for (const achv of this.achievements) {
      const unlocked = !!this.state[achv.key];
      if (unlocked) unlockedCount++;

      const div = document.createElement('div');
      div.className = 'achv' + (unlocked ? ' unlocked' : '');
      div.setAttribute('tabindex', '0');
      div.setAttribute('role', 'listitem');
      div.setAttribute('aria-label', achv.label + (unlocked ? ' (Unlocked)' : ' (Locked)'));
      div.innerHTML = `${achv.icon}<span class="tooltip" role="tooltip">${achv.label}<br>${achv.desc}</span>`;
      grid.appendChild(div);
    }

    // Update progress counter
    const progressCount = this.shadowRoot.getElementById('progress-count');
    progressCount.textContent = `${unlockedCount}/${this.achievements.length}`;

    // Update progress text
    const progressText = this.shadowRoot.getElementById('progress-text');
    if (unlockedCount === 0) {
      progressText.textContent = 'Plant achievements to grow your garden!';
    } else if (unlockedCount < this.achievements.length) {
      progressText.textContent = `Your garden is growing! ${this.achievements.length - unlockedCount} more to complete.`;
    } else {
      progressText.textContent = 'Your achievement garden is flourishing! 🌱✨';
    }

    // Update garden visualization
    const plantsContainer = this.shadowRoot.getElementById('plants-container');

    // First render or complete refresh
    if (!previousState || Object.keys(previousState).length === 0) {
      plantsContainer.innerHTML = '';

      // Add plants for unlocked achievements
      for (const achv of this.achievements) {
        if (this.state[achv.key]) {
          this.addPlant(plantsContainer, achv, false);
        }
      }
    } else {
      // Check for newly unlocked achievements
      for (const achv of this.achievements) {
        const wasUnlocked = !!previousState[achv.key];
        const isUnlocked = !!this.state[achv.key];

        // If newly unlocked, add with animation
        if (!wasUnlocked && isUnlocked) {
          this.addPlant(plantsContainer, achv, true);
        }
      }
    }
  }

  addPlant(container, achievement, animate) {
    const plant = document.createElement('div');
    plant.className = 'plant' + (animate ? ' growing' : '');
    plant.style.left = `${achievement.plantPosition}px`;
    plant.setAttribute('role', 'img');
    plant.setAttribute('aria-label', `${achievement.label} achievement plant`);
    plant.innerHTML = `
      ${achievement.plantHtml}
      <div class="plant-tooltip" aria-hidden="true">${achievement.label}</div>
    `;
    container.appendChild(plant);
  }
}

function updateAchievementGarden(e) {
  if (achievementGarden) achievementGarden.setAchievements(e.detail);
}

function updateMetaPanel(e) {
  if (metaPanel) metaPanel.setMeta(e.detail);
}

// Keyboard hotkeys for upgrades
function handleHotkeys(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'l' || e.key === 'L') {
    window.dispatchEvent(new CustomEvent('upgradeLeaf'));
  } else if (e.key === 'r' || e.key === 'R') {
    window.dispatchEvent(new CustomEvent('upgradeRoot'));
  } else if (e.key === 'f' || e.key === 'F') {
    window.dispatchEvent(new CustomEvent('upgradeFruit'));
  }
}

function updatePanel(e) {
  if (resourcePanel) resourcePanel.setResources(e.detail);
}

function updateTreePanel(e) {
  // e.detail should include sunlight and water for progress bar
  const state = e.detail;
  // Try to get sunlight/water from global state if not present
  let sunlight = state.sunlight;
  let water = state.water;
  if (window.__treeIdlerState) {
    sunlight = window.__treeIdlerState.sunlight;
    water = window.__treeIdlerState.water;
  }
  if (treePanel) treePanel.setTree({ ...state, sunlight, water });
}

function handleNatureGift(e) {
  if (toastPanel) toastPanel.showToast(`🌱 Nature's Gift: ${e.detail.type} (+${e.detail.amount} ${e.detail.bonus})`);
}
function handleSquirrelAmbush() {
  if (squirrelModal) squirrelModal.remove();
  squirrelModal = document.createElement('squirrel-modal');
  document.body.appendChild(squirrelModal);
  // If not tapped in 3 seconds, fruit is lost
  squirrelTimeout = setTimeout(() => {
    if (squirrelModal) squirrelModal.remove();
    squirrelModal = null;
    window.dispatchEvent(new CustomEvent('squirrelMissed'));
  }, 3000);
}
function handleSquirrelScared() {
  // Show bonus toast
  if (toastPanel) toastPanel.showToast('🎉 You scared off the squirrel! Bonus fruit!');
}
function handleSquirrelMissed() {
  if (toastPanel) toastPanel.showToast('😱 The squirrel got away with your fruit!');
}
function handleQuirkEvent(e) {
  if (toastPanel) toastPanel.showToast(`🍀 ${e.detail.type}: ${e.detail.reward} for ${e.detail.duration}s!`);
}
function handlePrestigeAwarded(e) {
  if (toastPanel) toastPanel.showToast(`🌳 Prestige! Level ${e.detail.prestigeLevel}, Legacy Points: ${e.detail.legacyPoints}`);
}
function handleLeafLotteryCooldown(e) {
  leafLotteryCooldown = Date.now() + e.detail.cooldownMs;
  if (leafLotteryPanel) leafLotteryPanel.updateCooldown();
}

function applyLayout(layout) {
  if (layout.Resource && resourcePanel) {
    if (layout.Resource.left) resourcePanel.style.left = layout.Resource.left;
    if (layout.Resource.top) resourcePanel.style.top = layout.Resource.top;
    resourcePanel.style.position = 'fixed';
    if (layout.Resource.collapsed) {
      const content = resourcePanel.shadowRoot.querySelector('.panel');
      if (content) content.style.display = 'none';
      const btn = resourcePanel.shadowRoot.querySelector('button[aria-label^="Collapse"]');
      if (btn) btn.textContent = '+';
    }
  }
  if (layout.Tree && treePanel) {
    if (layout.Tree.left) treePanel.style.left = layout.Tree.left;
    if (layout.Tree.top) treePanel.style.top = layout.Tree.top;
    treePanel.style.position = 'fixed';
    if (layout.Tree.collapsed) {
      const content = treePanel.shadowRoot.querySelector('.panel');
      if (content) content.style.display = 'none';
      const btn = treePanel.shadowRoot.querySelector('button[aria-label^="Collapse"]');
      if (btn) btn.textContent = '+';
    }
  }
}

export function install() {
  if (!customElements.get('resource-panel')) {
    customElements.define('resource-panel', ResourcePanel);
  }
  if (!customElements.get('tree-panel')) {
    customElements.define('tree-panel', TreePanel);
  }
  if (!customElements.get('toast-panel')) {
    customElements.define('toast-panel', ToastPanel);
  }
  if (!customElements.get('leaf-lottery-panel')) {
    customElements.define('leaf-lottery-panel', LeafLotteryPanel);
  }
  if (!customElements.get('squirrel-modal')) {
    customElements.define('squirrel-modal', SquirrelModal);
  }
  if (!customElements.get('color-blind-toggle')) {
    customElements.define('color-blind-toggle', ColorBlindToggle);
  }
  if (!customElements.get('meta-panel')) {
    customElements.define('meta-panel', MetaPanel);
  }
  if (!customElements.get('achievement-garden')) {
    customElements.define('achievement-garden', AchievementGarden);
  }
}

export function activate() {
  if (!resourcePanel) {
    resourcePanel = document.createElement('resource-panel');
    document.body.appendChild(resourcePanel);
    makeDraggable(resourcePanel, 'Resource');
    addCollapseButton(resourcePanel, 'Resource');
  }
  if (!treePanel) {
    treePanel = document.createElement('tree-panel');
    document.body.appendChild(treePanel);
    makeDraggable(treePanel, 'Tree');
    addCollapseButton(treePanel, 'Tree');
  }
  if (!toastPanel) {
    toastPanel = document.createElement('toast-panel');
    document.body.appendChild(toastPanel);
  }
  if (!leafLotteryPanel) {
    leafLotteryPanel = document.createElement('leaf-lottery-panel');
    document.body.appendChild(leafLotteryPanel);
  }
  if (!metaPanel) {
    metaPanel = document.createElement('meta-panel');
    document.body.appendChild(metaPanel);
  }
  if (!achievementGarden) {
    achievementGarden = document.createElement('achievement-garden');
    document.body.appendChild(achievementGarden);
  }
  if (!document.querySelector('color-blind-toggle')) {
    document.body.appendChild(document.createElement('color-blind-toggle'));
  }
  on('resourcesUpdated', updatePanel);
  on('treeInitialized', updateTreePanel);
  on('treeStageAdvanced', updateTreePanel);
  on('natureGift', handleNatureGift);
  on('squirrelAmbush', handleSquirrelAmbush);
  on('squirrelScared', handleSquirrelScared);
  on('squirrelMissed', handleSquirrelMissed);
  on('quirkEvent', handleQuirkEvent);
  on('prestigeAwarded', handlePrestigeAwarded);
  on('leafLotteryCooldown', handleLeafLotteryCooldown);
  on('metaUpdated', updateMetaPanel);
  on('achievementsUpdated', updateAchievementGarden);
  on('layoutRestored', e => applyLayout(e.detail));
  window.addEventListener('keydown', handleHotkeys);
}

export function deactivate() {
  off('resourcesUpdated', updatePanel);
  off('treeInitialized', updateTreePanel);
  off('treeStageAdvanced', updateTreePanel);
  off('natureGift', handleNatureGift);
  off('squirrelAmbush', handleSquirrelAmbush);
  off('squirrelScared', handleSquirrelScared);
  off('squirrelMissed', handleSquirrelMissed);
  off('quirkEvent', handleQuirkEvent);
  off('prestigeAwarded', handlePrestigeAwarded);
  off('leafLotteryCooldown', handleLeafLotteryCooldown);
  off('metaUpdated', updateMetaPanel);
  off('achievementsUpdated', updateAchievementGarden);
  off('layoutRestored', e => applyLayout(e.detail));
  if (resourcePanel && resourcePanel.parentNode) {
    resourcePanel.parentNode.removeChild(resourcePanel);
    resourcePanel = null;
  }
  if (treePanel && treePanel.parentNode) {
    treePanel.parentNode.removeChild(treePanel);
    treePanel = null;
  }
  if (toastPanel && toastPanel.parentNode) {
    toastPanel.parentNode.removeChild(toastPanel);
    toastPanel = null;
  }
  if (leafLotteryPanel && leafLotteryPanel.parentNode) {
    leafLotteryPanel.parentNode.removeChild(leafLotteryPanel);
    leafLotteryPanel = null;
  }
  if (metaPanel && metaPanel.parentNode) {
    metaPanel.parentNode.removeChild(metaPanel);
    metaPanel = null;
  }
  if (achievementGarden && achievementGarden.parentNode) {
    achievementGarden.parentNode.removeChild(achievementGarden);
    achievementGarden = null;
  }
  if (squirrelModal && squirrelModal.parentNode) {
    squirrelModal.parentNode.removeChild(squirrelModal);
    squirrelModal = null;
  }
  window.removeEventListener('keydown', handleHotkeys);
}

// Add color-blind styles globally
if (!document.getElementById('cb-style')) {
  const style = document.createElement('style');
  style.id = 'cb-style';
  style.textContent = `
    body.color-blind .panel, .cb.panel {
      background: #f5f5f5 !important;
      color: #222 !important;
      border: 2px dashed #0077cc !important;
    }
    body.color-blind .leaf, .cb .leaf {
      color: #0077cc !important;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #0077cc);
    }
    body.color-blind .root, .cb .root {
      color: #cc7700 !important;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #cc7700);
    }
    body.color-blind .growth-ring, .cb .growth-ring {
      border-color: #0077cc !important;
    }
    body.color-blind .toast, .cb .toast {
      background: #222 !important;
      color: #fff !important;
      border: 2px solid #0077cc !important;
    }
    body.color-blind .garden-container, .cb .garden-container {
      border: 2px dashed #0077cc !important;
    }
    body.color-blind .soil-layer, .cb .soil-layer {
      background: #555 !important;
    }
    body.color-blind .grass-layer, .cb .grass-layer {
      background: #0077cc !important;
    }
    body.color-blind .sky-layer, .cb .sky-layer {
      background: #f5f5f5 !important;
    }
    body.color-blind .plant svg path, .cb .plant svg path {
      stroke: #000 !important;
    }
    body.color-blind .plant svg ellipse, body.color-blind .plant svg circle, body.color-blind .plant svg polygon,
    .cb .plant svg ellipse, .cb .plant svg circle, .cb .plant svg polygon {
      stroke: #000 !important;
      stroke-width: 1px !important;
    }
    body.color-blind .plant-tooltip, .cb .plant-tooltip {
      background: #000 !important;
      color: #fff !important;
      border: 1px solid #0077cc !important;
    }
    button:focus, [tabindex="0"]:focus {
      outline: 3px solid #00aaff !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}
