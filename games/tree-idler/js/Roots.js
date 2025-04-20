/**
 * Roots.js - Manages root slots and water production
 */
import Config from "./Config.js";
import Cost from "./Cost.js";

export default class Roots {
    constructor() {
        this.slots = [];
        this.maxSlots = 1;

        // Initialize with one basic root
        this.addRoot();
    }

    /**
     * Add a new root to an available slot
     * @returns {boolean} - Whether root was added successfully
     */
    addRoot() {
        if (this.slots.length < this.maxSlots) {
            this.slots.push({
                level: 1,
                efficiency: 1,
                baseProduction: 1 // Water per second at level 1
            });
            return true;
        }
        return false;
    }

    /**
     * Upgrade a root at the specified slot
     * @param {number} slotIndex - Index of the slot to upgrade
     * @param {Resources} resources - Resources object to check and spend from
     * @returns {boolean} - Whether upgrade was successful
     */
    upgradeRoot(slotIndex, resources) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return false;
        }

        const root = this.slots[slotIndex];
        const upgradeCost = this.getUpgradeCost(root.level);

        if (resources.spendResources(upgradeCost.sunlight, upgradeCost.water)) {
            root.level++;
            root.efficiency = 1 + (root.level - 1) * 0.2; // 20% increase per level
            return true;
        }

        return false;
    }

    /**
     * Calculate upgrade cost for a root
     * @param {number} currentLevel - Current level of the root
     * @returns {Object} - Cost object with sunlight and water properties
     */
    getUpgradeCost(currentLevel) {
        // Use Cost class for upgrade cost
        const baseCost = Config.UPGRADE_COSTS.roots.water;
        const costMultiplier = Config.UPGRADE_MULTIPLIERS.roots;
        const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel - 1));
        return new Cost(Math.floor(cost / 2), cost); // sunlight, water
    }

    /**
     * Update max slots based on tree growth stage
     * @param {number} newMaxSlots - New maximum number of slots
     */
    updateMaxSlots(newMaxSlots) {
        this.maxSlots = newMaxSlots;
    }

    /**
     * Calculate total water production per second
     * @param {number} treeEfficiencyMultiplier - Efficiency multiplier from tree growth
     * @returns {number} - Total water production per second
     */
    calculateWaterProduction(treeEfficiencyMultiplier) {
        return this.slots.reduce((total, root) => {
            return total + (root.baseProduction * root.efficiency * treeEfficiencyMultiplier);
        }, 0);
    }

    /**
     * Get current state for saving
     * @returns {Object} - Current roots state
     */
    getState() {
        return {
            slots: this.slots,
            maxSlots: this.maxSlots
        };
    }

    /**
     * Load roots state
     * @param {Object} state - Roots state to load
     */
    loadState(state) {
        if (state) {
            this.slots = state.slots || [];
            this.maxSlots = state.maxSlots || 1;

            // Ensure at least one root if slots are empty
            if (this.slots.length === 0 && this.maxSlots > 0) {
                this.addRoot();
            }
        }
    }

    /**
     * Reset roots to initial state
     */
    reset() {
        this.slots = [];
        this.maxSlots = 1;
        this.addRoot(); // Start with one basic root
    }
}
