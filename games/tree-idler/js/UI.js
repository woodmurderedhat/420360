/**
 * UI.js - Manages the user interface and player interactions
 */
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
        
        // Initialize event listeners
        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Grow button
        this.growButtonElement.addEventListener('click', () => {
            this.game.growTree();
        });
    }

    /**
     * Update the UI with current game state
     */
    update() {
        const { resources, tree, upgrades } = this.game;
        
        // Update resource displays
        this.sunlightElement.textContent = Math.floor(resources.sunlight).toLocaleString();
        this.waterElement.textContent = Math.floor(resources.water).toLocaleString();
        this.growthStageElement.textContent = tree.growthStage;
        
        // Update production rates
        this.sunlightElement.title = `+${resources.sunlightPerSecond.toFixed(1)}/s`;
        this.waterElement.title = `+${resources.waterPerSecond.toFixed(1)}/s`;
        
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
            this.growthCostElement.textContent = `Cost: ${cost.sunlight} Sunlight, ${cost.water} Water`;
            
            // Enable/disable button based on resources
            const canAfford = resources.hasEnoughResources(cost.sunlight, cost.water);
            this.growButtonElement.disabled = !canAfford;
        } else {
            // Max growth reached
            this.growButtonElement.disabled = true;
            this.growthCostElement.textContent = 'Maximum growth reached!';
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
            
            upgradeElement.innerHTML = `
                <div class="title">${upgrade.name}</div>
                <div class="description">${upgrade.description}</div>
                <div class="cost">Cost: ${upgrade.cost.sunlight} Sunlight, ${upgrade.cost.water} Water</div>
                <button class="upgrade-button" data-upgrade-id="${upgrade.id}" ${canAfford ? '' : 'disabled'}>
                    Purchase
                </button>
                <div class="upgrade-feedback" style="color:#2e7d32;font-size:0.9em;display:none;"></div>
            `;
            
            // Add click handler
            const button = upgradeElement.querySelector('button');
            const feedback = upgradeElement.querySelector('.upgrade-feedback');
            button.addEventListener('click', () => {
                const success = this.game.applyUpgrade(upgrade.id);
                feedback.style.display = 'block';
                if (success) {
                    feedback.textContent = 'Upgrade purchased!';
                    feedback.style.color = '#2e7d32';
                } else {
                    feedback.textContent = 'Not enough resources!';
                    feedback.style.color = '#d32f2f';
                }
                setTimeout(() => { feedback.style.display = 'none'; }, 1200);
            });
            
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
