/**
 * Tree.js - Manages the tree's growth stages and properties
 * @classdesc Manages the tree's growth stages and properties, including stage configuration and growth logic.
 */
import Config from "./Config.js";

export default class Tree {
    constructor() {
        this.growthStage = 1;
        this.maxGrowthStage = Config.GROWTH_STAGES.length;
        // Use config for growth stages
        this.growthStages = Config.GROWTH_STAGES.map((stage, i) => ({
            ...stage,
            // Add default values for missing properties for compatibility
            leafSlots: (i + 1),
            rootSlots: (i + 1),
            fruitEnabled: i >= 2, // Enable fruits from stage 3
            branchDepth: Math.min(1 + i, 6),
            leafEfficiency: 1 + i * 0.1,
            rootEfficiency: 1 + i * 0.1,
            growthCost: { sunlight: 10 * Math.pow(2, i), water: 10 * Math.pow(2, i) }
        }));
    }

    /**
     * Get current growth stage properties
     * @returns {Object} - Current stage properties
     */
    getCurrentStageProperties() {
        // Index is growthStage - 1 since array is 0-indexed
        return this.growthStages[this.growthStage - 1];
    }

    /**
     * Get next growth stage properties
     * @returns {Object|null} - Next stage properties or null if at max stage
     */
    getNextStageProperties() {
        if (this.growthStage < this.maxGrowthStage) {
            return this.growthStages[this.growthStage];
        }
        return null;
    }

    /**
     * Get growth cost for next stage
     * @returns {Object|null} - Cost object or null if at max stage
     */
    getGrowthCost() {
        const nextStage = this.getNextStageProperties();
        return nextStage ? nextStage.growthCost : null;
    }

    /**
     * Attempt to grow the tree to the next stage
     * @param {Resources} resources - Resources object to check and spend from
     * @returns {boolean} - Whether growth was successful
     */
    grow(resources) {
        if (this.growthStage >= this.maxGrowthStage) {
            return false;
        }

        const cost = this.getGrowthCost();
        if (resources.spendResources(cost.sunlight, cost.water)) {
            this.growthStage++;
            return true;
        }
        
        return false;
    }

    /**
     * Check if fruits are enabled at current growth stage
     * @returns {boolean} - Whether fruits are enabled
     */
    areFruitsEnabled() {
        return this.getCurrentStageProperties().fruitEnabled;
    }

    /**
     * Get current state for saving
     * @returns {Object} - Current tree state
     */
    getState() {
        return {
            growthStage: this.growthStage
        };
    }

    /**
     * Load tree state
     * @param {Object} state - Tree state to load
     */
    loadState(state) {
        if (state) {
            this.growthStage = state.growthStage || 1;
        }
    }
}
