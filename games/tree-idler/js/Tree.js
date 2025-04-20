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

        // Prestige multipliers
        this.prestigeLevel = 0;
        this.prestigeMultiplier = 1;
    }

    /**
     * Get current growth stage properties
     * @returns {Object} - Current stage properties
     */
    getCurrentStageProperties() {
        // For stages beyond the predefined ones, generate properties dynamically
        let properties;

        if (this.growthStage <= this.maxGrowthStage) {
            // Index is growthStage - 1 since array is 0-indexed
            properties = {...this.growthStages[this.growthStage - 1]};
        } else {
            // For infinite stages, extend from the last predefined stage with increasing values
            const lastStage = this.growthStages[this.maxGrowthStage - 1];
            const stagesBeyond = this.growthStage - this.maxGrowthStage;

            // Calculate scaling factors for infinite progression
            const leafSlots = Math.min(lastStage.leafSlots + Math.floor(stagesBeyond / 2), 20); // Cap at 20
            const rootSlots = Math.min(lastStage.rootSlots + Math.floor(stagesBeyond / 2), 20); // Cap at 20
            const efficiencyBonus = 0.05 * stagesBeyond; // +5% per stage beyond max

            properties = {
                name: `Legendary Tree (Level ${stagesBeyond + 1})`,
                multiplier: lastStage.multiplier + (0.1 * stagesBeyond),
                leafSlots: leafSlots,
                rootSlots: rootSlots,
                fruitEnabled: true,
                branchDepth: 6, // Cap at 6 for rendering purposes
                leafEfficiency: lastStage.leafEfficiency + efficiencyBonus,
                rootEfficiency: lastStage.rootEfficiency + efficiencyBonus,
                growthCost: {
                    sunlight: lastStage.growthCost.sunlight * Math.pow(1.5, stagesBeyond),
                    water: lastStage.growthCost.water * Math.pow(1.5, stagesBeyond)
                }
            };
        }

        // Apply prestige multiplier to efficiency values
        properties.leafEfficiency *= this.prestigeMultiplier;
        properties.rootEfficiency *= this.prestigeMultiplier;

        return properties;
    }

    /**
     * Get next growth stage properties
     * @returns {Object} - Next stage properties (always available with infinite progression)
     */
    getNextStageProperties() {
        let properties;

        if (this.growthStage < this.maxGrowthStage) {
            properties = {...this.growthStages[this.growthStage]};
        } else {
            // For infinite stages, calculate the next stage properties
            const currentStage = this.getCurrentStageProperties();
            const stagesBeyond = this.growthStage - this.maxGrowthStage + 1;

            // Calculate scaling factors for next stage
            const leafSlots = Math.min(currentStage.leafSlots + (stagesBeyond % 2 === 0 ? 1 : 0), 20);
            const rootSlots = Math.min(currentStage.rootSlots + (stagesBeyond % 2 === 1 ? 1 : 0), 20);

            // Calculate base efficiency without prestige multiplier
            const baseLeafEfficiency = (currentStage.leafEfficiency / this.prestigeMultiplier) + 0.05;
            const baseRootEfficiency = (currentStage.rootEfficiency / this.prestigeMultiplier) + 0.05;

            properties = {
                name: `Legendary Tree (Level ${stagesBeyond + 1})`,
                multiplier: currentStage.multiplier + 0.1,
                leafSlots: leafSlots,
                rootSlots: rootSlots,
                fruitEnabled: true,
                branchDepth: 6,
                leafEfficiency: baseLeafEfficiency * this.prestigeMultiplier,
                rootEfficiency: baseRootEfficiency * this.prestigeMultiplier,
                growthCost: {
                    sunlight: currentStage.growthCost.sunlight * 1.5,
                    water: currentStage.growthCost.water * 1.5
                }
            };
        }

        // Apply prestige multiplier to efficiency values if not already applied
        if (this.growthStage < this.maxGrowthStage) {
            properties.leafEfficiency *= this.prestigeMultiplier;
            properties.rootEfficiency *= this.prestigeMultiplier;
        }

        return properties;
    }

    /**
     * Get growth cost for next stage
     * @returns {Object} - Cost object (always available with infinite progression)
     */
    getGrowthCost() {
        const nextStage = this.getNextStageProperties();
        return nextStage.growthCost;
    }

    /**
     * Attempt to grow the tree to the next stage
     * @param {Resources} resources - Resources object to check and spend from
     * @returns {boolean} - Whether growth was successful
     */
    grow(resources) {
        // With infinite progression, we can always grow to the next stage
        const cost = this.getGrowthCost();

        // Apply prestige multiplier to resource costs if applicable
        const adjustedCost = {
            sunlight: cost.sunlight,
            water: cost.water
        };

        if (resources.spendResources(adjustedCost.sunlight, adjustedCost.water)) {
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
            growthStage: this.growthStage,
            prestigeLevel: this.prestigeLevel,
            prestigeMultiplier: this.prestigeMultiplier
        };
    }

    /**
     * Load tree state
     * @param {Object} state - Tree state to load
     */
    loadState(state) {
        if (state) {
            this.growthStage = state.growthStage || 1;
            this.prestigeLevel = state.prestigeLevel || 0;
            this.prestigeMultiplier = state.prestigeMultiplier || 1;
        }
    }

    /**
     * Perform a prestige reset
     * @returns {Object} - Prestige rewards
     */
    prestige() {
        // Calculate prestige rewards based on current progress
        // Higher growth stages provide better rewards
        let prestigeGain = 0;

        if (this.growthStage <= 10) {
            // Basic formula for early stages
            prestigeGain = Math.max(1, Math.floor(this.growthStage / 3));
        } else {
            // Better rewards for legendary stages
            const legendaryLevels = this.growthStage - 10;
            prestigeGain = 3 + Math.floor(Math.sqrt(legendaryLevels));
        }

        // Store current prestige level and multiplier
        this.prestigeLevel += prestigeGain;
        this.prestigeMultiplier = 1 + (this.prestigeLevel * 0.1); // +10% per prestige level

        // Reset growth stage
        this.growthStage = 1;

        return {
            prestigeLevel: this.prestigeLevel,
            prestigeMultiplier: this.prestigeMultiplier,
            prestigeGain: prestigeGain,
            productionBonus: (this.prestigeMultiplier - 1) * 100 // Percentage increase
        };
    }
}
