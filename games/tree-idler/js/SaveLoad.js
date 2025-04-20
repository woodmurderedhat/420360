import LZString from "https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js";

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
        // Backup previous save
        const prevSave = localStorage.getItem(this.saveKey);
        if (prevSave) {
            localStorage.setItem(this.saveKey + "_backup", prevSave);
        }
        // Compress and save
        const compressed = LZString.compressToUTF16(JSON.stringify(saveData));
        localStorage.setItem(this.saveKey, compressed);
        this.lastSaveTime = Date.now();
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - Loaded game state or null if no save exists
     */
    loadGame() {
        const compressed = localStorage.getItem(this.saveKey);
        if (!compressed) return null;
        try {
            const json = LZString.decompressFromUTF16(compressed);
            const saveData = JSON.parse(json);
            // Data validation
            if (!saveData || typeof saveData !== "object") return null;
            if (!saveData.resources || !saveData.tree || !saveData.leaves || !saveData.roots || !saveData.fruits) return null;
            // Validate resource numbers
            ["sunlight", "water"].forEach(key => {
                if (typeof saveData.resources[key] !== "number" || saveData.resources[key] < 0) saveData.resources[key] = 0;
            });
            return saveData;
        } catch (error) {
            console.error("Error loading save data:", error);
            // Try backup
            const backup = localStorage.getItem(this.saveKey + "_backup");
            if (backup) {
                try {
                    const json = LZString.decompressFromUTF16(backup);
                    const saveData = JSON.parse(json);
                    return saveData;
                } catch (e) {
                    return null;
                }
            }
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
