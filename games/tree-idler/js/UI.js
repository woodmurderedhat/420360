/**
 * @classdesc Manages the user interface and player interactions, including DOM updates and event handling.
 * UI.js - Manages the user interface and player interactions
 */
import eventBus from "./EventBus.js";

export default class UI {
    constructor(game) {
        this.game = game;
        
        // Cache DOM elements
        this.sunlightElement = document.getElementById('sunlight');
        this.waterElement = document.getElementById('water');
        this.growthStageElement = document.getElementById('growthStage');
        this.upgradesListElement = document.getElementById('upgradesList');
        this.growButtonElement = document.getElementById('growButton');
        this.growthCostElement = document.getElementById('growthCost');
        
        // Debounced update
        this.update = this.debounce(this.update.bind(this), 50);

        // Initialize event listeners
        this.initEventListeners();

        // Auto-harvest threshold slider
        const slider = document.getElementById("autoHarvestThresholdSlider");
        const valueLabel = document.getElementById("autoHarvestThresholdValue");
        if (slider && valueLabel) {
            slider.addEventListener("input", () => {
                const percent = Math.round(slider.value * 100);
                valueLabel.textContent = percent + "%";
                eventBus.emit("setAutoHarvestThreshold", parseFloat(slider.value));
            });
        }
    }

    /**
     * Debounce function to limit how often a function can fire.
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Grow button
        this.growButtonElement.addEventListener('click', () => {
            this.game.growTree();
        });

        // Event delegation for upgrades
        this.upgradesListElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-button')) {
                const upgradeId = e.target.getAttribute('data-upgrade-id');
                if (upgradeId) {
                    const success = this.game.applyUpgrade(upgradeId);
                    const feedback = e.target.parentElement.querySelector('.upgrade-feedback');
                    if (feedback) {
                        feedback.style.display = 'block';
                        if (success) {
                            feedback.textContent = 'Upgrade purchased!';
                            feedback.style.color = '#2e7d32';
                        } else {
                            feedback.textContent = 'Not enough resources!';
                            feedback.style.color = '#d32f2f';
                        }
                        setTimeout(() => { feedback.style.display = 'none'; }, 1200);
                    }
                }
            }
        });
    }

    /**
     * Update the UI with current game state
     */
    update() {
        const { resources, tree, upgrades } = this.game;
        
        // Update resource displays with tooltips and formatting
        this.sunlightElement.textContent = Math.floor(resources.sunlight).toLocaleString();
        this.sunlightElement.title = `Sunlight: ${Math.floor(resources.sunlight).toLocaleString()} (+${resources.sunlightPerSecond.toFixed(1)}/s)`;
        this.waterElement.textContent = Math.floor(resources.water).toLocaleString();
        this.waterElement.title = `Water: ${Math.floor(resources.water).toLocaleString()} (+${resources.waterPerSecond.toFixed(1)}/s)`;
        this.growthStageElement.textContent = tree.growthStage;
        this.growthStageElement.title = `Current Growth Stage: ${tree.growthStage}`;
        
        // Update growth button and cost
        this.updateGrowthButton();
        
        // Update upgrades list
        this.updateUpgradesList();

        // Update fruit bonuses panel
        this.updateFruitBonuses();
    }

    /**
     * Update the growth button state and cost display
     */
    updateGrowthButton() {
        const { tree, resources } = this.game;
        const nextStage = tree.getNextStageProperties();
        
        if (nextStage) {
            const cost = tree.getGrowthCost();
            this.growthCostElement.textContent = `Cost: ${cost.sunlight.toLocaleString()} Sunlight, ${cost.water.toLocaleString()} Water`;
            this.growthCostElement.title = `Grow to stage ${tree.growthStage + 1}`;
            
            // Enable/disable button based on resources
            const canAfford = resources.hasEnoughResources(cost.sunlight, cost.water);
            this.growButtonElement.disabled = !canAfford;
        } else {
            // Max growth reached
            this.growButtonElement.disabled = true;
            this.growthCostElement.textContent = 'Maximum growth reached!';
            this.growthCostElement.title = 'You have reached the final growth stage.';
        }
    }

    /**
     * Update the upgrades list
     */
    updateUpgradesList() {
        const availableUpgrades = this.game.upgrades.getAvailableUpgrades();
        const { resources } = this.game;
        
        // Clear current list
        this.upgradesListElement.innerHTML = '';
        
        // Add each upgrade
        availableUpgrades.forEach(upgrade => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            
            const canAfford = resources.hasEnoughResources(upgrade.cost.sunlight, upgrade.cost.water);
            
            // Dynamic description
            let description = upgrade.description;
            if (typeof upgrade.dynamicDescription === 'function') {
                description = upgrade.dynamicDescription();
            }

            upgradeElement.innerHTML = `
                <div class="title" title="${upgrade.name}">${upgrade.name}</div>
                <div class="description" title="${description}">${description}</div>
                <div class="cost" title="Cost: ${upgrade.cost.sunlight.toLocaleString()} Sunlight, ${upgrade.cost.water.toLocaleString()} Water">
                    Cost: ${upgrade.cost.sunlight.toLocaleString()} Sunlight, ${upgrade.cost.water.toLocaleString()} Water
                </div>
                <button class="upgrade-button" data-upgrade-id="${upgrade.id}" ${canAfford ? '' : 'disabled'} title="Purchase this upgrade">
                    Purchase
                </button>
                <div class="upgrade-feedback" style="color:#2e7d32;font-size:0.9em;display:none;"></div>
            `;
            
            this.upgradesListElement.appendChild(upgradeElement);
        });
    }

    /**
     * Update the fruit bonuses panel
     */
    updateFruitBonuses() {
        const fruitBonuses = document.getElementById('fruitBonuses');
        const { upgrades, fruits } = this.game;
        if (!fruitBonuses) return;
        if (!fruits.enabled) {
            fruitBonuses.innerHTML = '<span style="color:#888">Fruits are locked. Reach growth stage 3 to unlock.</span>';
            return;
        }
        const u = upgrades.fruitUpgrades;
        fruitBonuses.innerHTML = `
            <div title="Each level increases fruit growth speed by 15%">🍏 Growth Rate: <b>${u.growthRate}</b> / 10</div>
            <div title="Each level increases fruit value by 20%">🍊 Value Bonus: <b>${u.value}</b> / 10</div>
            <div title="Each level increases max fruits by 1">🍒 Max Fruits: <b>${3 + u.maxFruits}</b></div>
            <div title="Automatically harvests ripe fruits every 10s">⚡ Auto-Harvest: <b style="color:${u.autoHarvest ? '#2e7d32' : '#d32f2f'}">${u.autoHarvest ? 'ON' : 'OFF'}</b></div>
        `;
    }

    /**
     * Show a notification for offline progress
     * @param {Object} progress - Offline progress data
     */
    showOfflineProgress(progress) {
        const hours = Math.floor(progress.timeProcessed / 3600);
        const minutes = Math.floor((progress.timeProcessed % 3600) / 60);
        const seconds = Math.floor(progress.timeProcessed % 60);
        
        const timeString = hours > 0 
            ? `${hours}h ${minutes}m ${seconds}s` 
            : minutes > 0 
                ? `${minutes}m ${seconds}s` 
                : `${seconds}s`;
        
        const notification = document.createElement('div');
        notification.className = 'offline-progress';
        notification.innerHTML = `
            <h3>Welcome Back!</h3>
            <p>You were away for ${timeString}</p>
            <p>You gained:</p>
            <ul>
                <li>${Math.floor(progress.sunlightGained)} Sunlight</li>
                <li>${Math.floor(progress.waterGained)} Water</li>
            </ul>
            <button id="closeNotification">OK</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button handler
        document.getElementById('closeNotification').addEventListener('click', () => {
            notification.remove();
        });
    }
}
