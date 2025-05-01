import { emit, on, off } from './EventBus.js'; // Correctly import functions
import { formatTime } from './ui-helpers.js'; // Assuming a helper for time formatting

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
        display: block;
        background-color: #f1f8e9; /* Light green background */
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-top: 10px;
        color: #33691e; /* Dark green text */
    }
    h3 {
        margin-top: 0;
        color: #558b2f; /* Slightly darker green for heading */
        text-align: center;
        font-size: 1.1em;
    }
    button {
        display: block;
        width: 100%;
        padding: 10px;
        background-color: #8bc34a; /* Vibrant green */
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1em;
        cursor: pointer;
        transition: background-color 0.2s ease;
        margin-bottom: 10px;
    }
    button:disabled {
        background-color: #c5e1a5; /* Lighter green when disabled */
        cursor: not-allowed;
    }
    button:not(:disabled):hover {
        background-color: #7cb342; /* Darker green on hover */
    }
    .status, .result, .active-buffs {
        font-size: 0.9em;
        margin-top: 8px;
        text-align: center;
    }
    .active-buffs ul {
        list-style: none;
        padding: 0;
        margin: 5px 0 0 0;
    }
     .active-buffs li {
        background-color: #e8f5e9;
        padding: 3px 6px;
        border-radius: 4px;
        margin-bottom: 3px;
        font-size: 0.85em;
    }
</style>
<div>
    <h3>Leaf Lottery</h3>
    <button id="lottery-button">Try Your Luck! (Cost: 50☀️)</button>
    <div id="status" class="status"></div>
    <div id="result" class="result"></div>
    <div id="active-buffs" class="active-buffs"><h4>Active Buffs:</h4></div>
</div>
`;

class LeafLotteryPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.lotteryButton = this.shadowRoot.getElementById('lottery-button');
        this.statusElement = this.shadowRoot.getElementById('status');
        this.resultElement = this.shadowRoot.getElementById('result');
        this.activeBuffsElement = this.shadowRoot.getElementById('active-buffs');

        this.cooldownEnds = 0;
        this.lastResult = null;
        this.currentSunlight = 0; // Store current sunlight locally for button state
    }

    connectedCallback() {
        this.lotteryButton.addEventListener('click', () => {
            emit('tryLottery'); // Use imported emit directly
        });

        on('lotteryStateUpdated', this.updateLotteryState); // Use imported on directly
        on('buffsUpdated', this.updateActiveBuffs); // Use imported on directly
        on('resourcesUpdated', this.handleResourceUpdate); // Use imported on directly
    }

    disconnectedCallback() {
        off('lotteryStateUpdated', this.updateLotteryState); // Use imported off directly
        off('buffsUpdated', this.updateActiveBuffs); // Use imported off directly
        off('resourcesUpdated', this.handleResourceUpdate); // Use imported off directly
    }

    handleResourceUpdate = (state) => {
        if (state && state.sunlight !== undefined) {
            this.currentSunlight = state.sunlight;
            this.updateButtonState();
        }
    }

    updateLotteryState = ({ available, cooldownEnds, lastResult }) => {
        this.cooldownEnds = cooldownEnds;
        if (lastResult) {
            this.lastResult = lastResult;
            this.resultElement.textContent = `Last Draw: ${this.lastResult}`;
        } else {
            this.resultElement.textContent = '';
        }
        this.updateStatus();
        this.updateButtonState();
    }

    updateActiveBuffs = (activeBuffsList) => {
        const buffsListElement = this.activeBuffsElement;
        while (buffsListElement.firstChild && buffsListElement.firstChild.nodeName !== 'H4') {
            buffsListElement.removeChild(buffsListElement.firstChild);
        }
        const existingUl = buffsListElement.querySelector('ul');
        if (existingUl) existingUl.remove();

        if (activeBuffsList && activeBuffsList.length > 0) {
            const ul = document.createElement('ul');
            activeBuffsList.forEach(buff => {
                const li = document.createElement('li');
                li.textContent = `${buff.description || buff.id} (${formatTime(buff.remaining)})`;
                ul.appendChild(li);
            });
            buffsListElement.appendChild(ul);
            buffsListElement.style.display = 'block';
        } else {
            buffsListElement.style.display = 'none';
        }
    }

    updateStatus() {
        const now = Date.now();
        if (this.cooldownEnds > now) {
            const remaining = this.cooldownEnds - now;
            this.statusElement.textContent = `Ready in: ${formatTime(remaining)}`;
        }
    }

    updateButtonState() {
        const now = Date.now();
        const cooldownOver = this.cooldownEnds <= now;
        const canAfford = this.currentSunlight >= 50;

        this.lotteryButton.disabled = !(cooldownOver && canAfford);

        if (!cooldownOver) {
            this.updateStatus();
        } else if (!canAfford) {
            this.statusElement.textContent = 'Need 50☀️';
        } else {
            this.statusElement.textContent = 'Ready!';
        }
    }

    update(state) {
        if (!state) return;
        if (state.sunlight !== undefined) {
            this.currentSunlight = state.sunlight;
        }
        if (state.leafLottery?.lastLotteryTime) {
            this.cooldownEnds = state.leafLottery.lastLotteryTime + 300000; // Assuming 5 min cooldown
        }
        if (state.activeBuffs) {
            const now = Date.now();
            const buffsForUI = [];
            for (const type in state.activeBuffs) {
                const buff = state.activeBuffs[type];
                const remaining = Math.max(0, buff.endTime - now);
                if (remaining > 0) {
                    buffsForUI.push({ id: type, description: buff.description || type, remaining: remaining });
                }
            }
            this.updateActiveBuffs(buffsForUI);
        }

        this.updateStatus();
        this.updateButtonState();
    }
}

customElements.define('leaf-lottery-panel', LeafLotteryPanel);