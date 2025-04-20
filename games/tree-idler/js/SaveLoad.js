// Import LZString from local file
import "./lz-string.min.js";

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
        // Compress and save with fallback
        try {
            const compressed = LZString.compressToUTF16(JSON.stringify(saveData));
            localStorage.setItem(this.saveKey, compressed);
        } catch (e) {
            console.warn("Compression failed, saving uncompressed data", e);
            // Fallback to uncompressed storage
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        }
        this.lastSaveTime = Date.now();
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - Loaded game state or null if no save exists
     */
    loadGame() {
        const savedData = localStorage.getItem(this.saveKey);
        if (!savedData) return null;

        try {
            // Try to decompress first (assuming it's compressed)
            let saveData;
            try {
                const json = LZString.decompressFromUTF16(savedData);
                saveData = JSON.parse(json);
            } catch (compressionError) {
                // If decompression fails, try parsing directly (might be uncompressed)
                console.warn("Decompression failed, trying to parse as uncompressed JSON", compressionError);
                saveData = JSON.parse(savedData);
            }

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
                    // Try to decompress backup first
                    let backupData;
                    try {
                        const json = LZString.decompressFromUTF16(backup);
                        backupData = JSON.parse(json);
                    } catch (compressionError) {
                        // If decompression fails, try parsing directly
                        backupData = JSON.parse(backup);
                    }
                    return backupData;
                } catch (e) {
                    console.error("Error loading backup save data:", e);
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
