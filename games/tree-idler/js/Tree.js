/**
 * Tree.js - Manages the tree's growth stages and properties
 */
export default class Tree {
    constructor() {
        this.growthStage = 1;
        this.maxGrowthStage = 10;
        
        // Define growth costs and benefits for each stage
        this.growthStages = [
            // Stage 1 (starting stage)
            {
                leafSlots: 1,
                rootSlots: 1,
                fruitEnabled: false,
                branchDepth: 1,
                leafEfficiency: 1,
                rootEfficiency: 1,
                growthCost: { sunlight: 0, water: 0 } // No cost for initial stage
            },
            // Stage 2
            {
                leafSlots: 2,
                rootSlots: 2,
                fruitEnabled: false,
                branchDepth: 2,
                leafEfficiency: 1.1,
                rootEfficiency: 1.1,
                growthCost: { sunlight: 10, water: 10 }
            },
            // Stage 3
            {
                leafSlots: 3,
                rootSlots: 3,
                fruitEnabled: true, // Fruits unlock at stage 3
                branchDepth: 3,
                leafEfficiency: 1.2,
                rootEfficiency: 1.2,
                growthCost: { sunlight: 25, water: 25 }
            },
            // Stage 4
            {
                leafSlots: 4,
                rootSlots: 4,
                fruitEnabled: true,
                branchDepth: 3,
                leafEfficiency: 1.3,
                rootEfficiency: 1.3,
                growthCost: { sunlight: 50, water: 50 }
            },
            // Stage 5
            {
                leafSlots: 5,
                rootSlots: 5,
                fruitEnabled: true,
                branchDepth: 4,
                leafEfficiency: 1.4,
                rootEfficiency: 1.4,
                growthCost: { sunlight: 100, water: 100 }
            },
            // Stage 6
            {
                leafSlots: 6,
                rootSlots: 6,
                fruitEnabled: true,
                branchDepth: 4,
                leafEfficiency: 1.5,
                rootEfficiency: 1.5,
                growthCost: { sunlight: 200, water: 200 }
            },
            // Stage 7
            {
                leafSlots: 7,
                rootSlots: 7,
                fruitEnabled: true,
                branchDepth: 5,
                leafEfficiency: 1.6,
                rootEfficiency: 1.6,
                growthCost: { sunlight: 400, water: 400 }
            },
            // Stage 8
            {
                leafSlots: 8,
                rootSlots: 8,
                fruitEnabled: true,
                branchDepth: 5,
                leafEfficiency: 1.7,
                rootEfficiency: 1.7,
                growthCost: { sunlight: 800, water: 800 }
            },
            // Stage 9
            {
                leafSlots: 9,
                rootSlots: 9,
                fruitEnabled: true,
                branchDepth: 6,
                leafEfficiency: 1.8,
                rootEfficiency: 1.8,
                growthCost: { sunlight: 1600, water: 1600 }
            },
            // Stage 10 (final stage)
            {
                leafSlots: 10,
                rootSlots: 10,
                fruitEnabled: true,
                branchDepth: 6,
                leafEfficiency: 2.0,
                rootEfficiency: 2.0,
                growthCost: { sunlight: 3200, water: 3200 }
            }
        ];
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
