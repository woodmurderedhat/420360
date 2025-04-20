/**
 * Upgrades.js - Manages available upgrades
 */
export default class Upgrades {
    constructor(leaves, roots, tree) {
        this.leaves = leaves;
        this.roots = roots;
        this.tree = tree;
    }

    /**
     * Get all available upgrades
     * @returns {Array} - Array of upgrade objects
     */
    getAvailableUpgrades() {
        const upgrades = [];
        
        // Add leaf upgrades
        for (let i = 0; i < this.leaves.slots.length; i++) {
            const leaf = this.leaves.slots[i];
            const cost = this.leaves.getUpgradeCost(leaf.level);
            
            upgrades.push({
                id: `leaf_${i}`,
                type: 'leaf',
                slotIndex: i,
                name: `Upgrade Leaf ${i + 1}`,
                description: `Increase efficiency of Leaf ${i + 1} from ${(leaf.efficiency).toFixed(1)}x to ${(leaf.efficiency + 0.2).toFixed(1)}x`,
                cost: cost,
                currentLevel: leaf.level
            });
        }
        
        // Add root upgrades
        for (let i = 0; i < this.roots.slots.length; i++) {
            const root = this.roots.slots[i];
            const cost = this.roots.getUpgradeCost(root.level);
            
            upgrades.push({
                id: `root_${i}`,
                type: 'root',
                slotIndex: i,
                name: `Upgrade Root ${i + 1}`,
                description: `Increase efficiency of Root ${i + 1} from ${(root.efficiency).toFixed(1)}x to ${(root.efficiency + 0.2).toFixed(1)}x`,
                cost: cost,
                currentLevel: root.level
            });
        }
        
        // Add "add leaf" upgrade if slots available
        if (this.leaves.slots.length < this.leaves.maxSlots) {
            upgrades.push({
                id: 'add_leaf',
                type: 'add_leaf',
                name: 'Add Leaf',
                description: `Add a new leaf (${this.leaves.slots.length + 1}/${this.leaves.maxSlots})`,
                cost: { sunlight: 15 * (this.leaves.slots.length + 1), water: 5 * (this.leaves.slots.length + 1) }
            });
        }
        
        // Add "add root" upgrade if slots available
        if (this.roots.slots.length < this.roots.maxSlots) {
            upgrades.push({
                id: 'add_root',
                type: 'add_root',
                name: 'Add Root',
                description: `Add a new root (${this.roots.slots.length + 1}/${this.roots.maxSlots})`,
                cost: { sunlight: 5 * (this.roots.slots.length + 1), water: 15 * (this.roots.slots.length + 1) }
            });
        }
        
        return upgrades;
    }

    /**
     * Apply an upgrade
     * @param {string} upgradeId - ID of the upgrade to apply
     * @param {Resources} resources - Resources object to check and spend from
     * @returns {boolean} - Whether upgrade was successfully applied
     */
    applyUpgrade(upgradeId, resources) {
        const upgrades = this.getAvailableUpgrades();
        const upgrade = upgrades.find(u => u.id === upgradeId);
        
        if (!upgrade) {
            return false;
        }
        
        switch (upgrade.type) {
            case 'leaf':
                return this.leaves.upgradeLeaf(upgrade.slotIndex, resources);
                
            case 'root':
                return this.roots.upgradeRoot(upgrade.slotIndex, resources);
                
            case 'add_leaf':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    return this.leaves.addLeaf();
                }
                return false;
                
            case 'add_root':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    return this.roots.addRoot();
                }
                return false;
                
            default:
                return false;
        }
    }
}
