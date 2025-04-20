/**
 * Leaves.js - Manages leaf slots and sunlight production
 */
export default class Leaves {
    constructor() {
        this.slots = [];
        this.maxSlots = 1;
        
        // Initialize with one basic leaf
        this.addLeaf();
    }

    /**
     * Add a new leaf to an available slot
     * @returns {boolean} - Whether leaf was added successfully
     */
    addLeaf() {
        if (this.slots.length < this.maxSlots) {
            this.slots.push({
                level: 1,
                efficiency: 1,
                baseProduction: 1 // Sunlight per second at level 1
            });
            return true;
        }
        return false;
    }

    /**
     * Upgrade a leaf at the specified slot
     * @param {number} slotIndex - Index of the slot to upgrade
     * @param {Resources} resources - Resources object to check and spend from
     * @returns {boolean} - Whether upgrade was successful
     */
    upgradeLeaf(slotIndex, resources) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return false;
        }

        const leaf = this.slots[slotIndex];
        const upgradeCost = this.getUpgradeCost(leaf.level);
        
        if (resources.spendResources(upgradeCost.sunlight, upgradeCost.water)) {
            leaf.level++;
            leaf.efficiency = 1 + (leaf.level - 1) * 0.2; // 20% increase per level
            return true;
        }
        
        return false;
    }

    /**
     * Calculate upgrade cost for a leaf
     * @param {number} currentLevel - Current level of the leaf
     * @returns {Object} - Cost object with sunlight and water properties
     */
    getUpgradeCost(currentLevel) {
        // Exponential cost increase
        const baseCost = 5;
        const costMultiplier = 1.5;
        const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel - 1));
        
        return {
            sunlight: cost,
            water: Math.floor(cost / 2) // Water cost is half of sunlight cost
        };
    }

    /**
     * Update max slots based on tree growth stage
     * @param {number} newMaxSlots - New maximum number of slots
     */
    updateMaxSlots(newMaxSlots) {
        this.maxSlots = newMaxSlots;
    }

    /**
     * Calculate total sunlight production per second
     * @param {number} treeEfficiencyMultiplier - Efficiency multiplier from tree growth
     * @returns {number} - Total sunlight production per second
     */
    calculateSunlightProduction(treeEfficiencyMultiplier) {
        return this.slots.reduce((total, leaf) => {
            return total + (leaf.baseProduction * leaf.efficiency * treeEfficiencyMultiplier);
        }, 0);
    }

    /**
     * Get current state for saving
     * @returns {Object} - Current leaves state
     */
    getState() {
        return {
            slots: this.slots,
            maxSlots: this.maxSlots
        };
    }

    /**
     * Load leaves state
     * @param {Object} state - Leaves state to load
     */
    loadState(state) {
        if (state) {
            this.slots = state.slots || [];
            this.maxSlots = state.maxSlots || 1;
            
            // Ensure at least one leaf if slots are empty
            if (this.slots.length === 0 && this.maxSlots > 0) {
                this.addLeaf();
            }
        }
    }
}
