/**
 * Fruits.js - Manages fruit production and harvesting
 * @classdesc Manages fruit production and harvesting, including spawning, growth, and harvesting logic for different fruit types.
 */
import Config from "./Config.js";
import Cost from "./Cost.js";
import eventBus from "./EventBus.js";

export default class Fruits {
    constructor() {
        this.enabled = false;
        this.fruits = [];
        this.maxFruits = 3;
        this.fruitGrowthRate = 0.1; // Base growth rate per second
        this.nextFruitId = 1;
        this.autoHarvest = false;
        this.autoHarvestTimer = 0;
        this.fruitTypes = Config.FRUIT_TYPES;
        this.autoHarvestThreshold = 1; // Default: harvest when fully ripe
        eventBus.on('setAutoHarvestThreshold', (threshold) => {
            if (typeof threshold === 'number' && threshold >= 0 && threshold <= 1) {
                this.autoHarvestThreshold = threshold;
            }
        });
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

        // Auto-harvest logic with threshold
        if (this.autoHarvest) {
            this.autoHarvestTimer += deltaTime;
            if (this.autoHarvestTimer >= 10) {
                this.autoHarvestTimer = 0;
                this.harvestAllRipeFruits(this.autoHarvestThreshold);
            }
        }
    }

    /**
     * Spawn a new fruit
     */
    spawnFruit() {
        if (this.fruits.length < this.maxFruits) {
            // Pick a random fruit type from config
            const fruitType = this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)];
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.3 + Math.random() * 0.4;

            this.fruits.push({
                id: this.nextFruitId++,
                growth: 0,
                position: { angle, distance },
                value: {
                    sunlight: fruitType.value,
                    water: fruitType.value
                },
                type: fruitType.name
            });
        }
    }

    /**
     * Harvest a fruit by ID
     * @param {number} fruitId - ID of the fruit to harvest
     * @param {number} valueMultiplier - Multiplier for fruit value from upgrades
     * @returns {Object|null} - Harvested fruit value or null if not found/not ready
     */
    harvestFruit(fruitId, valueMultiplier = 0) {
        const fruitIndex = this.fruits.findIndex(f => f.id === fruitId);

        if (fruitIndex === -1) {
            return null;
        }

        const fruit = this.fruits[fruitIndex];

        // Only harvest fully grown fruits
        if (fruit.growth >= 1) {
            // Apply value multiplier from upgrades (25% per level)
            const multiplier = 1 + (valueMultiplier * 0.25);
            const value = {
                sunlight: Math.floor(fruit.value.sunlight * multiplier),
                water: Math.floor(fruit.value.water * multiplier)
            };

            this.fruits.splice(fruitIndex, 1);
            return value;
        }

        return null;
    }

    /**
     * Enable auto-harvest for fruits
     */
    enableAutoHarvest() {
        this.autoHarvest = true;
    }

    /**
     * Harvest all ripe fruits (for auto-harvest)
     * @param {number} threshold - Minimum growth (0-1) to harvest
     * @param {number} valueMultiplier
     * @returns {{sunlight:number,water:number}}
     */
    harvestAllRipeFruits(threshold = 1, valueMultiplier = 0) {
        let totalSunlight = 0;
        let totalWater = 0;
        // Copy array to avoid mutation issues
        const ripeFruits = this.fruits.filter(fruit => fruit.growth >= threshold);
        ripeFruits.forEach(fruit => {
            const multiplier = 1 + (valueMultiplier * 0.2);
            totalSunlight += Math.floor(fruit.value.sunlight * multiplier);
            totalWater += Math.floor(fruit.value.water * multiplier);
            // Remove fruit
            const idx = this.fruits.findIndex(f => f.id === fruit.id);
            if (idx !== -1) this.fruits.splice(idx, 1);
        });
        return { sunlight: totalSunlight, water: totalWater };
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
            nextFruitId: this.nextFruitId,
            autoHarvest: this.autoHarvest,
            autoHarvestTimer: this.autoHarvestTimer
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
            this.autoHarvest = state.autoHarvest || false;
            this.autoHarvestTimer = state.autoHarvestTimer || 0;
        }
    }
}
