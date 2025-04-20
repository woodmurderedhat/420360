/**
 * Upgrades.js - Manages available upgrades
 */
export default class Upgrades {
    constructor(leaves, roots, tree, fruits) {
        this.leaves = leaves;
        this.roots = roots;
        this.tree = tree;
        this.fruits = fruits;

        // Fruit upgrade levels
        this.fruitUpgrades = {
            growthRate: 0,
            value: 0,
            maxFruits: 0,
            autoHarvest: false
        };
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
                description: `Increase efficiency of Leaf ${i + 1} from ${(leaf.efficiency).toFixed(1)}x to ${(leaf.efficiency + 0.3).toFixed(1)}x`,
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
                description: `Increase efficiency of Root ${i + 1} from ${(root.efficiency).toFixed(1)}x to ${(root.efficiency + 0.3).toFixed(1)}x`,
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
                cost: { sunlight: 20 * Math.pow(2, this.leaves.slots.length), water: 10 * Math.pow(2, this.leaves.slots.length) }
            });
        }

        // Add "add root" upgrade if slots available
        if (this.roots.slots.length < this.roots.maxSlots) {
            upgrades.push({
                id: 'add_root',
                type: 'add_root',
                name: 'Add Root',
                description: `Add a new root (${this.roots.slots.length + 1}/${this.roots.maxSlots})`,
                cost: { sunlight: 10 * Math.pow(2, this.roots.slots.length), water: 20 * Math.pow(2, this.roots.slots.length) }
            });
        }

        // Add fruit upgrades if fruits are enabled
        if (this.fruits && this.fruits.enabled) {
            // Fruit growth rate upgrade
            if (this.fruitUpgrades.growthRate < 10) { // Max 10 levels
                const level = this.fruitUpgrades.growthRate + 1;
                const baseCost = 100 * Math.pow(2, level - 1);
                upgrades.push({
                    id: 'fruit_growth_rate',
                    type: 'fruit_growth_rate',
                    name: 'Faster Fruit Growth',
                    description: `Increase fruit growth rate by 15% (Level ${level}/10)` + (level === 10 ? ' (MAX)' : ''),
                    cost: { sunlight: baseCost, water: baseCost },
                    currentLevel: this.fruitUpgrades.growthRate
                });
            }

            // Fruit value upgrade
            if (this.fruitUpgrades.value < 10) { // Max 10 levels
                const level = this.fruitUpgrades.value + 1;
                const baseCost = 150 * Math.pow(2, level - 1);
                upgrades.push({
                    id: 'fruit_value',
                    type: 'fruit_value',
                    name: 'Juicier Fruits',
                    description: `Increase resources gained from fruits by 20% (Level ${level}/10)` + (level === 10 ? ' (MAX)' : ''),
                    cost: { sunlight: baseCost, water: baseCost },
                    currentLevel: this.fruitUpgrades.value
                });
            }

            // Max fruits upgrade
            if (this.fruitUpgrades.maxFruits < 5) { // Max 5 levels (from 3 to 8 max fruits)
                const level = this.fruitUpgrades.maxFruits + 1;
                const baseCost = 200 * Math.pow(2, level - 1);
                upgrades.push({
                    id: 'fruit_max',
                    type: 'fruit_max',
                    name: 'More Fruits',
                    description: `Increase maximum number of fruits by 1 (Level ${level}/5)` + (level === 5 ? ' (MAX)' : ''),
                    cost: { sunlight: baseCost, water: baseCost },
                    currentLevel: this.fruitUpgrades.maxFruits
                });
            }

            // New: Auto-harvest fruits upgrade
            if (!this.fruitUpgrades.autoHarvest) {
                upgrades.push({
                    id: 'fruit_auto_harvest',
                    type: 'fruit_auto_harvest',
                    name: 'Auto-Harvest Fruits',
                    description: 'Automatically harvest ripe fruits every 10 seconds.',
                    cost: { sunlight: 1000, water: 1000 },
                    currentLevel: 0
                });
            }
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

            case 'fruit_growth_rate':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    this.fruitUpgrades.growthRate++;
                    // Increase growth rate by 15% per level
                    this.fruits.fruitGrowthRate = 0.1 * (1 + 0.15 * this.fruitUpgrades.growthRate);
                    return true;
                }
                return false;

            case 'fruit_value':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    this.fruitUpgrades.value++;
                    // Effect is applied when fruits are harvested in Fruits.js
                    return true;
                }
                return false;

            case 'fruit_max':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    this.fruitUpgrades.maxFruits++;
                    this.fruits.maxFruits = 3 + this.fruitUpgrades.maxFruits;
                    return true;
                }
                return false;

            case 'fruit_auto_harvest':
                if (resources.spendResources(upgrade.cost.sunlight, upgrade.cost.water)) {
                    this.fruitUpgrades.autoHarvest = true;
                    this.fruits.enableAutoHarvest();
                    return true;
                }
                return false;

            default:
                return false;
        }
    }
}
