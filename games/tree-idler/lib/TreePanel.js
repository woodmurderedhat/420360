import { emit } from './EventBus.js';

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
          text-align: center;
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
        .tree-info {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .stage-info, .cost-info {
          background: rgba(255, 255, 255, 0.4);
          padding: 5px 10px;
          border-radius: 8px;
        }
        .tree-canvas {
          display: block;
          margin: 16px auto 0 auto;
          background: #e8f5e9;
          border-radius: 12px;
          box-shadow: 0 2px 8px #0001;
          border: 1.5px solid #81c784;
        }
        .tree-actions button {
          padding: 8px 15px;
          font-size: 1em;
          cursor: pointer;
          background-color: #81c784;
          border: 1px solid #4caf50;
          color: #1b5e20;
          border-radius: 4px;
          transition: background-color 0.2s;
          margin: 5px;
          position: relative;
          z-index: 1;
        }
        .tree-actions button:hover {
          background-color: #66bb6a;
        }
        .tree-actions button:disabled {
          background-color: #c8e6c9;
          cursor: not-allowed;
          opacity: 0.7;
        }
        #prestige-button {
          background-color: #ffb74d;
          border-color: #fb8c00;
          color: #bf360c;
        }
        #prestige-button:hover {
          background-color: #ffa726;
        }
        .cb .panel {
          background: #e0f7fa;
          color: #004d40;
          border: 2px dashed #0077cc;
        }
      </style>
      <div class="panel panel-content" aria-label="Tree panel">
        <div class="tree-info">
          <div class="stage-info"><span class="label">Stage:</span> <span class="stage">1</span></div>
          <div class="cost-info"><span class="label">Next:</span> <span class="next-cost">N/A</span></div>
        </div>
        <canvas class="tree-canvas" width="320" height="320" aria-label="Tree drawing"></canvas>
        <div class="tree-actions">
          <button id="advance-stage">Advance Stage</button>
          <button id="prestige-button" style="display: none;">Prestige</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('advance-stage').addEventListener('click', () => {
      emit('advanceStageRequest');
    });
    this.shadowRoot.getElementById('prestige-button').addEventListener('click', () => {
      emit('prestigeRequest');
    });
  }

  update(state) {
    if (!state || !state.tree) return;

    const treeState = state.tree;
    const currentStage = treeState.growthStage || 1;
    const nextCost = treeState.nextStageCost || { sunlight: 'N/A', water: 'N/A' };
    const canAfford = state.sunlight >= (nextCost.sunlight || Infinity) && state.water >= (nextCost.water || Infinity);
    const isMaxStage = currentStage >= 10;

    this.shadowRoot.querySelector('.stage').textContent = currentStage;
    const costText = isMaxStage ? 'MAX' : `${Math.ceil(nextCost.sunlight || 0)}☀️ / ${Math.ceil(nextCost.water || 0)}💧`;
    this.shadowRoot.querySelector('.next-cost').textContent = costText;

    const advanceButton = this.shadowRoot.getElementById('advance-stage');
    advanceButton.disabled = !canAfford || isMaxStage;
    advanceButton.style.display = isMaxStage ? 'none' : 'inline-block';

    const prestigeButton = this.shadowRoot.getElementById('prestige-button');
    prestigeButton.style.display = isMaxStage ? 'inline-block' : 'none';

    const canvas = this.shadowRoot.querySelector('.tree-canvas');
    if (canvas && window.TreeGrowthSimulator?.renderTree) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderState = {
        stage: currentStage,
        sunlight: state.sunlight || 0,
        season: state.weather?.season || 'spring',
        species: treeState.species || 'Oak',
        visualSeed: treeState.visualSeed || 0.5,
        weather: state.weather?.current || 'clear'
      };

      window.TreeGrowthSimulator.renderTree(ctx, canvas.width, canvas.height, renderState);
    } else if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ccc';
      ctx.textAlign = 'center';
      ctx.fillText('Loading Tree...', canvas.width / 2, canvas.height / 2);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

if (!customElements.get('tree-panel')) {
  customElements.define('tree-panel', TreePanel);
}