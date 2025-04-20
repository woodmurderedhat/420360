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
            `;
            
            // Add click handler
            const button = upgradeElement.querySelector('button');
            button.addEventListener('click', () => {
                this.game.applyUpgrade(upgrade.id);
            });
            
            this.upgradesListElement.appendChild(upgradeElement);
        });
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
