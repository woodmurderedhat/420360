/**
 * Game.js - Main game controller
 */
import Resources from './Resources.js';
import Tree from './Tree.js';
import Leaves from './Leaves.js';
import Roots from './Roots.js';
import Fruits from './Fruits.js';
import Upgrades from './Upgrades.js';
import Renderer from './Renderer.js';
import UI from './UI.js';
import SaveLoad from './SaveLoad.js';

class Game {
    constructor() {
        // Initialize game components
        this.resources = new Resources();
        this.tree = new Tree();
        this.leaves = new Leaves();
        this.roots = new Roots();
        this.fruits = new Fruits();
        this.upgrades = new Upgrades(this.leaves, this.roots, this.tree, this.fruits);
        this.renderer = new Renderer('treeCanvas');
        this.saveLoad = new SaveLoad();

        // Initialize UI after other components
        this.ui = new UI(this);

        // Game loop variables
        this.lastUpdateTime = Date.now();
        this.running = false;

        // Set up fruit click handler
        this.renderer.onFruitClick(this.harvestFruit.bind(this));

        // Load saved game or start new game
        this.loadGame();

        // Start game loop
        this.start();
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.lastUpdateTime = Date.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.running) return;

        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        // Update game state
        this.update(deltaTime);

        // Render game
        this.render();

        // Save game periodically (every 30 seconds)
        if (currentTime - this.saveLoad.lastSaveTime > 30000) {
            this.saveGame();
        }

        // Continue loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update tree properties based on growth stage
        const treeProperties = this.tree.getCurrentStageProperties();

        // Update leaf and root slots
        this.leaves.updateMaxSlots(treeProperties.leafSlots);
        this.roots.updateMaxSlots(treeProperties.rootSlots);

        // Calculate production rates
        const sunlightRate = this.leaves.calculateSunlightProduction(treeProperties.leafEfficiency);
        const waterRate = this.roots.calculateWaterProduction(treeProperties.rootEfficiency);

        // Update resources with production rates
        this.resources.updateProductionRates(sunlightRate, waterRate);
        this.resources.update(deltaTime);

        // Update fruits
        this.fruits.update(deltaTime, this.tree.areFruitsEnabled(), this.tree.growthStage);

        // Update UI
        this.ui.update();
    }

    /**
     * Render the game
     */
    render() {
        this.renderer.render({
            tree: this.tree,
            leaves: this.leaves,
            roots: this.roots,
            fruits: this.fruits
        });
    }

    /**
     * Attempt to grow the tree
     * @returns {boolean} - Whether growth was successful
     */
    growTree() {
        const success = this.tree.grow(this.resources);

        if (success) {
            // Update UI
            this.ui.update();
        }

        return success;
    }

    /**
     * Apply an upgrade
     * @param {string} upgradeId - ID of the upgrade to apply
     * @returns {boolean} - Whether upgrade was successfully applied
     */
    applyUpgrade(upgradeId) {
        const success = this.upgrades.applyUpgrade(upgradeId, this.resources);

        if (success) {
            // Update UI
            this.ui.update();
        }

        return success;
    }

    /**
     * Harvest a fruit
     * @param {number} fruitId - ID of the fruit to harvest
     */
    harvestFruit(fruitId) {
        // Pass the fruit value upgrade level to apply the bonus
        const fruitValue = this.fruits.harvestFruit(fruitId, this.upgrades.fruitUpgrades.value);

        if (fruitValue) {
            this.resources.addResources(fruitValue.sunlight, fruitValue.water);
            this.ui.update();
        }
    }

    /**
     * Save the current game state
     */
    saveGame() {
        this.saveLoad.saveGame({
            resources: this.resources,
            tree: this.tree,
            leaves: this.leaves,
            roots: this.roots,
            fruits: this.fruits,
            fruitUpgrades: this.upgrades.fruitUpgrades
        });
    }

    /**
     * Load a saved game or initialize a new game
     */
    loadGame() {
        const savedGame = this.saveLoad.loadGame();

        if (savedGame) {
            // Load saved state into components
            this.resources.loadState(savedGame.resources);
            this.tree.loadState(savedGame.tree);
            this.leaves.loadState(savedGame.leaves);
            this.roots.loadState(savedGame.roots);
            this.fruits.loadState(savedGame.fruits);

            // Load fruit upgrade levels if they exist
            if (savedGame.fruitUpgrades) {
                this.upgrades.fruitUpgrades = savedGame.fruitUpgrades;
            }

            // Calculate offline progress
            const timeSinceLastSave = this.saveLoad.getTimeSinceLastSave();

            if (timeSinceLastSave > 60) { // Only show if more than 1 minute has passed
                const offlineProgress = this.resources.calculateOfflineProgress(timeSinceLastSave);
                this.ui.showOfflineProgress(offlineProgress);
            }
        }

        // Update UI with loaded or new game state
        this.ui.update();
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.saveLoad.resetGame();
        window.location.reload();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

export default Game;
