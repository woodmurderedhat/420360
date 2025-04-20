/**
 * SaveLoad.js - Handles saving and loading game state
 * @classdesc Handles saving and loading game state, including localStorage persistence and offline progress.
 */
export default class SaveLoad {
    constructor() {
        this.saveKey = 'treeIdlerSave';
        this.lastSaveTime = Date.now();
    }

    /**
     * Save game state to localStorage
     * @param {Object} gameState - Current game state
     */
    saveGame(gameState) {
        const saveData = {
            resources: gameState.resources.getState(),
            tree: gameState.tree.getState(),
            leaves: gameState.leaves.getState(),
            roots: gameState.roots.getState(),
            fruits: gameState.fruits.getState(),
            lastSaveTime: Date.now()
        };
        
        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        this.lastSaveTime = Date.now();
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - Loaded game state or null if no save exists
     */
    loadGame() {
        const saveData = localStorage.getItem(this.saveKey);
        
        if (!saveData) {
            return null;
        }
        
        try {
            return JSON.parse(saveData);
        } catch (error) {
            console.error('Error loading save data:', error);
            return null;
        }
    }

    /**
     * Calculate time elapsed since last save
     * @returns {number} - Time elapsed in seconds
     */
    getTimeSinceLastSave() {
        const savedData = this.loadGame();
        
        if (!savedData || !savedData.lastSaveTime) {
            return 0;
        }
        
        const currentTime = Date.now();
        const lastSaveTime = savedData.lastSaveTime;
        
        return (currentTime - lastSaveTime) / 1000; // Convert to seconds
    }

    /**
     * Reset game (clear save data)
     */
    resetGame() {
        localStorage.removeItem(this.saveKey);
    }
}
