/**
 * Fruits.js - Manages fruit production and harvesting
 */
export default class Fruits {
    constructor() {
        this.enabled = false;
        this.fruits = [];
        this.maxFruits = 3;
        this.fruitGrowthRate = 0.1; // Base growth rate per second
        this.nextFruitId = 1;
    }

    /**
     * Update fruits growth and generation
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @param {boolean} fruitsEnabled - Whether fruits are enabled by tree growth stage
     * @param {number} growthStage - Current tree growth stage
     */
    update(deltaTime, fruitsEnabled, growthStage) {
        this.enabled = fruitsEnabled;
        
        if (!this.enabled) {
            return;
        }

        // Grow existing fruits
        this.fruits.forEach(fruit => {
            if (fruit.growth < 1) {
                fruit.growth += this.fruitGrowthRate * deltaTime * (growthStage / 5);
                if (fruit.growth > 1) {
                    fruit.growth = 1; // Cap at 100%
                }
            }
        });

        // Try to spawn new fruits if there's room
        if (this.fruits.length < this.maxFruits) {
            // Chance increases with growth stage
            const spawnChance = 0.01 * growthStage * deltaTime;
            if (Math.random() < spawnChance) {
                this.spawnFruit();
            }
        }
    }

    /**
     * Spawn a new fruit
     */
    spawnFruit() {
        if (this.fruits.length < this.maxFruits) {
            // Random position on the tree
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.3 + Math.random() * 0.4; // 30-70% from center
            
            this.fruits.push({
                id: this.nextFruitId++,
                growth: 0,
                position: { angle, distance },
                value: {
                    sunlight: 10 + Math.floor(Math.random() * 10),
                    water: 10 + Math.floor(Math.random() * 10)
                }
            });
        }
    }

    /**
     * Harvest a fruit by ID
     * @param {number} fruitId - ID of the fruit to harvest
     * @returns {Object|null} - Harvested fruit value or null if not found/not ready
     */
    harvestFruit(fruitId) {
        const fruitIndex = this.fruits.findIndex(f => f.id === fruitId);
        
        if (fruitIndex === -1) {
            return null;
        }
        
        const fruit = this.fruits[fruitIndex];
        
        // Only harvest fully grown fruits
        if (fruit.growth >= 1) {
            const value = { ...fruit.value };
            this.fruits.splice(fruitIndex, 1);
            return value;
        }
        
        return null;
    }

    /**
     * Get harvestable fruits
     * @returns {Array} - Array of fully grown fruits
     */
    getHarvestableFruits() {
        return this.fruits.filter(fruit => fruit.growth >= 1);
    }

    /**
     * Get current state for saving
     * @returns {Object} - Current fruits state
     */
    getState() {
        return {
            enabled: this.enabled,
            fruits: this.fruits,
            maxFruits: this.maxFruits,
            fruitGrowthRate: this.fruitGrowthRate,
            nextFruitId: this.nextFruitId
        };
    }

    /**
     * Load fruits state
     * @param {Object} state - Fruits state to load
     */
    loadState(state) {
        if (state) {
            this.enabled = state.enabled || false;
            this.fruits = state.fruits || [];
            this.maxFruits = state.maxFruits || 3;
            this.fruitGrowthRate = state.fruitGrowthRate || 0.1;
            this.nextFruitId = state.nextFruitId || 1;
        }
    }
}
