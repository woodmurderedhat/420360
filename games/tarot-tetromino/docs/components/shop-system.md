# Shop System

The Shop System provides an in-game economy where players can spend gold to purchase upgrades and special items. It enhances the gameplay experience by offering permanent improvements and unlockable content.

## File: `src/shop.js`

## Core Responsibilities

- Manage the in-game currency (gold)
- Define purchasable upgrades and items
- Handle purchase transactions
- Persist upgrade levels between game sessions
- Update the UI to reflect available and purchased items

## Implementation

The Shop System is implemented as part of the `TarotTetris` namespace:

```javascript
// Initialize the TarotTetris namespace if it doesn't exist
window.TarotTetris = window.TarotTetris || {};

// Shop system implementation
TarotTetris.shop = {
    // Shop configuration
    config: {
        // Upgrade categories
        categories: [
            {
                id: 'gameplay',
                name: 'Gameplay Upgrades',
                description: 'Enhance your gameplay experience'
            },
            {
                id: 'special',
                name: 'Special Unlocks',
                description: 'Unlock special tetromino shapes'
            }
        ],
        
        // Upgradable items
        items: [
            {
                id: 'combo_bonus',
                name: 'Combo Multiplier',
                description: 'Increases points earned from combos',
                category: 'gameplay',
                cost: [100, 250, 500, 1000],
                maxLevel: 4,
                effect: function(level) {
                    // Apply combo multiplier effect
                    window.comboMultiplierLevel = level;
                }
            },
            {
                id: 'tarot_chance',
                name: 'Tarot Chance',
                description: 'Increases chance of drawing tarot cards',
                category: 'gameplay',
                cost: [150, 300, 600, 1200],
                maxLevel: 4,
                effect: function(level) {
                    // Apply tarot chance effect
                    window.tarotChanceLevel = level;
                }
            },
            {
                id: 'ghost_piece',
                name: 'Ghost Piece',
                description: 'Enhances ghost piece visibility',
                category: 'gameplay',
                cost: [200, 400, 800],
                maxLevel: 3,
                effect: function(level) {
                    // Apply ghost piece effect
                    window.ghostPieceLevel = level;
                }
            },
            {
                id: 'coyote_time',
                name: 'Coyote Time',
                description: 'Extends the window for moving landed pieces',
                category: 'gameplay',
                cost: [300, 600, 1200],
                maxLevel: 3,
                effect: function(level) {
                    // Apply coyote time effect
                    window.coyoteTimeLevel = level;
                    coyoteTime = getCoyoteTime();
                }
            },
            // Special tetromino unlocks
            {
                id: 'unlock_plus',
                name: 'Plus Shape',
                description: 'Unlock the Plus tetromino shape',
                category: 'special',
                cost: [500],
                maxLevel: 1,
                effect: function(level) {
                    // Unlock the Plus shape
                    if (level > 0 && window.unlockedTetrominoes.indexOf('Plus') === -1) {
                        window.unlockedTetrominoes.push('Plus');
                    }
                }
            },
            // More items...
        ]
    },
    
    // Initialize the shop
    init: function() {
        // Load saved upgrades from localStorage
        this.loadUpgrades();
        
        // Initialize the shop UI
        this.initUI();
    },
    
    // Load saved upgrades
    loadUpgrades: function() {
        try {
            const savedUpgrades = localStorage.getItem('tarotTetrisUpgrades');
            if (savedUpgrades) {
                const upgrades = JSON.parse(savedUpgrades);
                
                // Apply upgrade effects
                this.config.items.forEach(item => {
                    const level = upgrades[item.id] || 0;
                    if (level > 0 && typeof item.effect === 'function') {
                        item.effect(level);
                    }
                });
                
                console.log('Loaded upgrade levels:', upgrades);
            }
        } catch (e) {
            console.error('Error loading upgrade levels:', e);
        }
    },
    
    // Save upgrades to localStorage
    saveUpgrades: function() {
        try {
            const upgrades = {};
            
            // Collect current upgrade levels
            this.config.items.forEach(item => {
                upgrades[item.id] = this.getUpgradeLevel(item.id);
            });
            
            // Save to localStorage
            localStorage.setItem('tarotTetrisUpgrades', JSON.stringify(upgrades));
            console.log('Saved upgrade levels:', upgrades);
        } catch (e) {
            console.error('Error saving upgrade levels:', e);
        }
    },
    
    // Get the current level of an upgrade
    getUpgradeLevel: function(itemId) {
        // Check if the upgrade exists in localStorage
        try {
            const savedUpgrades = localStorage.getItem('tarotTetrisUpgrades');
            if (savedUpgrades) {
                const upgrades = JSON.parse(savedUpgrades);
                return upgrades[itemId] || 0;
            }
        } catch (e) {
            console.error('Error getting upgrade level:', e);
        }
        
        return 0;
    },
    
    // Check if the player can afford an item
    canAfford: function(itemId) {
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) return false;
        
        const currentLevel = this.getUpgradeLevel(itemId);
        if (currentLevel >= item.maxLevel) return false;
        
        const cost = item.cost[currentLevel];
        return TarotTetris.gold >= cost;
    },
    
    // Purchase an item
    purchase: function(itemId) {
        // Find the item
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return false;
        }
        
        // Check if the item can be upgraded
        const currentLevel = this.getUpgradeLevel(itemId);
        if (currentLevel >= item.maxLevel) {
            console.log('Item already at max level:', itemId);
            return false;
        }
        
        // Check if the player can afford the item
        const cost = item.cost[currentLevel];
        if (TarotTetris.gold < cost) {
            console.log('Not enough gold to purchase:', itemId);
            return false;
        }
        
        // Deduct the cost
        TarotTetris.gold -= cost;
        TarotTetris.updateGold(document.getElementById('gold'));
        
        // Increase the upgrade level
        const newLevel = currentLevel + 1;
        
        // Apply the effect
        if (typeof item.effect === 'function') {
            item.effect(newLevel);
        }
        
        // Save the upgrade
        const savedUpgrades = localStorage.getItem('tarotTetrisUpgrades');
        const upgrades = savedUpgrades ? JSON.parse(savedUpgrades) : {};
        upgrades[itemId] = newLevel;
        localStorage.setItem('tarotTetrisUpgrades', JSON.stringify(upgrades));
        
        // Update the UI
        this.updateItemUI(itemId);
        
        // Emit purchase event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit(TarotTetris.EVENTS.SHOP_ITEM_PURCHASED, {
                itemId: itemId,
                level: newLevel,
                cost: cost
            });
        }
        
        console.log('Purchased:', itemId, 'New level:', newLevel);
        return true;
    },
    
    // Initialize the shop UI
    initUI: function() {
        const shopContainer = document.getElementById('shop-container');
        if (!shopContainer) return;
        
        // Clear existing content
        shopContainer.innerHTML = '';
        
        // Create category sections
        this.config.categories.forEach(category => {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'shop-category';
            categorySection.setAttribute('data-category', category.id);
            
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);
            
            // Create category description
            const categoryDesc = document.createElement('p');
            categoryDesc.textContent = category.description;
            categorySection.appendChild(categoryDesc);
            
            // Create items container
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'shop-items';
            
            // Add items for this category
            this.config.items.filter(item => item.category === category.id).forEach(item => {
                const itemElement = this.createItemElement(item);
                itemsContainer.appendChild(itemElement);
            });
            
            categorySection.appendChild(itemsContainer);
            shopContainer.appendChild(categorySection);
        });
        
        // Add event listeners
        const purchaseButtons = shopContainer.querySelectorAll('.shop-item-purchase');
        purchaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.getAttribute('data-item-id');
                this.purchase(itemId);
            });
        });
    },
    
    // Create an item element for the shop UI
    createItemElement: function(item) {
        const currentLevel = this.getUpgradeLevel(item.id);
        const nextLevel = currentLevel + 1;
        const isMaxLevel = currentLevel >= item.maxLevel;
        const cost = isMaxLevel ? null : item.cost[currentLevel];
        const canAfford = TarotTetris.gold >= (cost || 0);
        
        // Create item container
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.setAttribute('data-item-id', item.id);
        
        // Create item header
        const itemHeader = document.createElement('div');
        itemHeader.className = 'shop-item-header';
        
        const itemName = document.createElement('h4');
        itemName.textContent = item.name;
        itemHeader.appendChild(itemName);
        
        const itemLevel = document.createElement('span');
        itemLevel.className = 'shop-item-level';
        itemLevel.textContent = `Level: ${currentLevel}/${item.maxLevel}`;
        itemHeader.appendChild(itemLevel);
        
        itemElement.appendChild(itemHeader);
        
        // Create item description
        const itemDesc = document.createElement('p');
        itemDesc.className = 'shop-item-description';
        itemDesc.textContent = item.description;
        itemElement.appendChild(itemDesc);
        
        // Create purchase button
        const purchaseButton = document.createElement('button');
        purchaseButton.className = 'shop-item-purchase';
        purchaseButton.setAttribute('data-item-id', item.id);
        
        if (isMaxLevel) {
            purchaseButton.textContent = 'Maxed Out';
            purchaseButton.disabled = true;
            purchaseButton.classList.add('maxed');
        } else {
            purchaseButton.textContent = `Upgrade (${cost} Gold)`;
            purchaseButton.disabled = !canAfford;
            if (!canAfford) {
                purchaseButton.classList.add('cannot-afford');
            }
        }
        
        itemElement.appendChild(purchaseButton);
        
        return itemElement;
    },
    
    // Update a specific item in the UI
    updateItemUI: function(itemId) {
        const itemElement = document.querySelector(`.shop-item[data-item-id="${itemId}"]`);
        if (!itemElement) return;
        
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) return;
        
        const currentLevel = this.getUpgradeLevel(itemId);
        const isMaxLevel = currentLevel >= item.maxLevel;
        const cost = isMaxLevel ? null : item.cost[currentLevel];
        const canAfford = TarotTetris.gold >= (cost || 0);
        
        // Update level display
        const levelElement = itemElement.querySelector('.shop-item-level');
        if (levelElement) {
            levelElement.textContent = `Level: ${currentLevel}/${item.maxLevel}`;
        }
        
        // Update purchase button
        const purchaseButton = itemElement.querySelector('.shop-item-purchase');
        if (purchaseButton) {
            if (isMaxLevel) {
                purchaseButton.textContent = 'Maxed Out';
                purchaseButton.disabled = true;
                purchaseButton.classList.add('maxed');
                purchaseButton.classList.remove('cannot-afford');
            } else {
                purchaseButton.textContent = `Upgrade (${cost} Gold)`;
                purchaseButton.disabled = !canAfford;
                purchaseButton.classList.remove('maxed');
                
                if (canAfford) {
                    purchaseButton.classList.remove('cannot-afford');
                } else {
                    purchaseButton.classList.add('cannot-afford');
                }
            }
        }
    },
    
    // Update all items in the UI
    updateAllItemsUI: function() {
        this.config.items.forEach(item => {
            this.updateItemUI(item.id);
        });
    },
    
    // Show the shop overlay
    show: function() {
        const shopOverlay = document.getElementById('shop-overlay');
        if (shopOverlay) {
            // Update all items before showing
            this.updateAllItemsUI();
            shopOverlay.classList.add('active');
        }
    },
    
    // Hide the shop overlay
    hide: function() {
        const shopOverlay = document.getElementById('shop-overlay');
        if (shopOverlay) {
            shopOverlay.classList.remove('active');
        }
    }
};
```

## Key Functions

### Initialization

```javascript
TarotTetris.shop.init()
```

Initializes the shop system by loading saved upgrades from localStorage and setting up the UI.

### Purchase

```javascript
TarotTetris.shop.purchase(itemId)
```

Handles the purchase of an item:
- Checks if the player can afford the item
- Deducts the cost from the player's gold
- Applies the item's effect
- Saves the upgrade to localStorage
- Updates the UI
- Emits a purchase event

### Upgrade Level Management

```javascript
TarotTetris.shop.getUpgradeLevel(itemId)
```

Gets the current level of an upgrade from localStorage.

```javascript
TarotTetris.shop.saveUpgrades()
```

Saves all current upgrade levels to localStorage.

### UI Management

```javascript
TarotTetris.shop.initUI()
```

Initializes the shop UI by creating category sections and item elements.

```javascript
TarotTetris.shop.updateItemUI(itemId)
```

Updates a specific item in the UI to reflect its current level and cost.

```javascript
TarotTetris.shop.show()
```

Shows the shop overlay.

```javascript
TarotTetris.shop.hide()
```

Hides the shop overlay.

## Shop Items

The shop system defines several categories of items:

### Gameplay Upgrades

- **Combo Multiplier**: Increases points earned from combos
- **Tarot Chance**: Increases chance of drawing tarot cards
- **Ghost Piece**: Enhances ghost piece visibility
- **Coyote Time**: Extends the window for moving landed pieces

### Special Unlocks

- **Plus Shape**: Unlocks the Plus tetromino shape
- **Cross Shape**: Unlocks the Cross tetromino shape
- **U Shape**: Unlocks the U tetromino shape
- **H Shape**: Unlocks the H tetromino shape

## Integration with Other Systems

### Gold System

The shop system interacts with the gold system:
- Checks if the player has enough gold to purchase items
- Deducts gold when items are purchased
- Updates the gold display

```javascript
// Deduct gold on purchase
TarotTetris.gold -= cost;
TarotTetris.updateGold(document.getElementById('gold'));
```

### Event System

The shop system emits events when items are purchased:

```javascript
// Emit purchase event
if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
    TarotTetris.events.emit(TarotTetris.EVENTS.SHOP_ITEM_PURCHASED, {
        itemId: itemId,
        level: newLevel,
        cost: cost
    });
}
```

### Persistence

The shop system uses localStorage to persist upgrade levels between game sessions:

```javascript
// Save upgrades to localStorage
localStorage.setItem('tarotTetrisUpgrades', JSON.stringify(upgrades));

// Load upgrades from localStorage
const savedUpgrades = localStorage.getItem('tarotTetrisUpgrades');
```

## Extending the Shop System

### Adding New Items

To add a new item to the shop:

```javascript
// Add a new item to the config
TarotTetris.shop.config.items.push({
    id: 'new_item',
    name: 'New Item',
    description: 'Description of what this item does',
    category: 'gameplay',
    cost: [200, 400, 800],
    maxLevel: 3,
    effect: function(level) {
        // Implement the item's effect
        window.newItemLevel = level;
        
        // Apply the effect based on level
        switch (level) {
            case 1:
                // Level 1 effect
                break;
            case 2:
                // Level 2 effect
                break;
            case 3:
                // Level 3 effect
                break;
        }
    }
});
```

### Adding a New Category

To add a new category to the shop:

```javascript
// Add a new category to the config
TarotTetris.shop.config.categories.push({
    id: 'new_category',
    name: 'New Category',
    description: 'Description of this category'
});

// Add items to the new category
TarotTetris.shop.config.items.push({
    id: 'new_category_item',
    name: 'New Category Item',
    description: 'Description of what this item does',
    category: 'new_category',
    cost: [300, 600, 900],
    maxLevel: 3,
    effect: function(level) {
        // Implement the item's effect
    }
});
```

### Adding Limited-Time Items

To add limited-time items to the shop:

```javascript
// Add a method to check if an item is available
TarotTetris.shop.isItemAvailable = function(itemId) {
    const item = this.config.items.find(i => i.id === itemId);
    if (!item) return false;
    
    // Check if the item has availability dates
    if (item.availableFrom && item.availableTo) {
        const now = new Date();
        const fromDate = new Date(item.availableFrom);
        const toDate = new Date(item.availableTo);
        
        return now >= fromDate && now <= toDate;
    }
    
    // If no availability dates, the item is always available
    return true;
};

// Add a limited-time item
TarotTetris.shop.config.items.push({
    id: 'limited_item',
    name: 'Limited Time Item',
    description: 'Available for a limited time only!',
    category: 'special',
    cost: [500],
    maxLevel: 1,
    availableFrom: '2023-12-01T00:00:00Z',
    availableTo: '2023-12-31T23:59:59Z',
    effect: function(level) {
        // Implement the item's effect
    }
});

// Modify the createItemElement method to check availability
const originalCreateItemElement = TarotTetris.shop.createItemElement;
TarotTetris.shop.createItemElement = function(item) {
    // Check if the item is available
    if (!this.isItemAvailable(item.id)) {
        // Create a "not available" element
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item unavailable';
        itemElement.setAttribute('data-item-id', item.id);
        
        const itemName = document.createElement('h4');
        itemName.textContent = item.name;
        itemElement.appendChild(itemName);
        
        const itemDesc = document.createElement('p');
        itemDesc.textContent = 'This item is not currently available.';
        itemElement.appendChild(itemDesc);
        
        return itemElement;
    }
    
    // If available, use the original method
    return originalCreateItemElement.call(this, item);
};
```

## Example: Adding a Currency Conversion System

```javascript
// Add a currency conversion system to the shop
TarotTetris.shop.currencyConversion = {
    // Conversion rates
    rates: {
        score_to_gold: 0.01, // 1 gold per 100 score
        gold_to_score: 50    // 50 score per 1 gold
    },
    
    // Convert score to gold
    convertScoreToGold: function(score) {
        const gold = Math.floor(score * this.rates.score_to_gold);
        
        // Deduct score
        TarotTetris.score -= score;
        TarotTetris.updateScore(document.getElementById('score'));
        
        // Add gold
        TarotTetris.gold += gold;
        TarotTetris.updateGold(document.getElementById('gold'));
        
        // Emit conversion event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit('currency:converted', {
                from: 'score',
                to: 'gold',
                amountFrom: score,
                amountTo: gold,
                rate: this.rates.score_to_gold
            });
        }
        
        return gold;
    },
    
    // Convert gold to score
    convertGoldToScore: function(gold) {
        const score = Math.floor(gold * this.rates.gold_to_score);
        
        // Deduct gold
        TarotTetris.gold -= gold;
        TarotTetris.updateGold(document.getElementById('gold'));
        
        // Add score
        TarotTetris.score += score;
        TarotTetris.updateScore(document.getElementById('score'));
        
        // Emit conversion event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit('currency:converted', {
                from: 'gold',
                to: 'score',
                amountFrom: gold,
                amountTo: score,
                rate: this.rates.gold_to_score
            });
        }
        
        return score;
    },
    
    // Initialize the conversion UI
    initUI: function() {
        const shopContainer = document.getElementById('shop-container');
        if (!shopContainer) return;
        
        // Create conversion section
        const conversionSection = document.createElement('div');
        conversionSection.className = 'shop-category';
        conversionSection.setAttribute('data-category', 'conversion');
        
        // Create section header
        const sectionHeader = document.createElement('h3');
        sectionHeader.textContent = 'Currency Conversion';
        conversionSection.appendChild(sectionHeader);
        
        // Create section description
        const sectionDesc = document.createElement('p');
        sectionDesc.textContent = 'Convert between score and gold';
        conversionSection.appendChild(sectionDesc);
        
        // Create conversion controls
        const conversionControls = document.createElement('div');
        conversionControls.className = 'conversion-controls';
        
        // Score to Gold conversion
        const scoreToGoldDiv = document.createElement('div');
        scoreToGoldDiv.className = 'conversion-option';
        
        const scoreToGoldLabel = document.createElement('label');
        scoreToGoldLabel.textContent = 'Convert Score to Gold:';
        scoreToGoldDiv.appendChild(scoreToGoldLabel);
        
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.min = '100';
        scoreInput.step = '100';
        scoreInput.value = '100';
        scoreToGoldDiv.appendChild(scoreInput);
        
        const scoreToGoldButton = document.createElement('button');
        scoreToGoldButton.textContent = 'Convert';
        scoreToGoldButton.addEventListener('click', () => {
            const score = parseInt(scoreInput.value, 10);
            if (isNaN(score) || score < 100) return;
            
            if (TarotTetris.score < score) {
                alert('Not enough score to convert!');
                return;
            }
            
            const gold = this.convertScoreToGold(score);
            alert(`Converted ${score} score to ${gold} gold!`);
        });
        scoreToGoldDiv.appendChild(scoreToGoldButton);
        
        conversionControls.appendChild(scoreToGoldDiv);
        
        // Gold to Score conversion
        const goldToScoreDiv = document.createElement('div');
        goldToScoreDiv.className = 'conversion-option';
        
        const goldToScoreLabel = document.createElement('label');
        goldToScoreLabel.textContent = 'Convert Gold to Score:';
        goldToScoreDiv.appendChild(goldToScoreLabel);
        
        const goldInput = document.createElement('input');
        goldInput.type = 'number';
        goldInput.min = '1';
        goldInput.step = '1';
        goldInput.value = '1';
        goldToScoreDiv.appendChild(goldInput);
        
        const goldToScoreButton = document.createElement('button');
        goldToScoreButton.textContent = 'Convert';
        goldToScoreButton.addEventListener('click', () => {
            const gold = parseInt(goldInput.value, 10);
            if (isNaN(gold) || gold < 1) return;
            
            if (TarotTetris.gold < gold) {
                alert('Not enough gold to convert!');
                return;
            }
            
            const score = this.convertGoldToScore(gold);
            alert(`Converted ${gold} gold to ${score} score!`);
        });
        goldToScoreDiv.appendChild(goldToScoreButton);
        
        conversionControls.appendChild(goldToScoreDiv);
        
        conversionSection.appendChild(conversionControls);
        shopContainer.appendChild(conversionSection);
    }
};

// Initialize the currency conversion system
document.addEventListener('DOMContentLoaded', function() {
    if (TarotTetris.shop && TarotTetris.shop.currencyConversion) {
        TarotTetris.shop.currencyConversion.initUI();
    }
});
```
