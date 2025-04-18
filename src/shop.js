/**
 * Shop system for Tarot Tetris.
 * Allows players to spend gold to upgrade tetriminos and unlock new ones.
 */

(function(exports) {
    // Shop state
    const shopState = {
        isOpen: false,
        selectedTab: 'tetriminos',
        selectedSubTab: 'standard',
        selectedItem: null
    };

    // Tetrimino upgrade costs (base cost + level * multiplier)
    const UPGRADE_BASE_COST = 30;
    const UPGRADE_LEVEL_MULTIPLIER = 15;

    // Unlock costs for special tetriminos
    const UNLOCK_COSTS = {
        'SIGIL': 60,     // Ace of Wands
        'HEX': 100,      // Two of Cups
        'YOD': 80,       // Three of Swords
        'CROSS': 120,    // Four of Pentacles
        'KEY': 110,      // Five of Wands
        'EYE': 140,      // Six of Cups
        'SERPENT': 160,  // Seven of Swords
        'TREE': 150,     // Eight of Pentacles
        'RUNE': 90,      // Nine of Wands
        'ANKH': 180      // Ten of Cups
    };

    // Track tetrimino upgrade levels
    let tetriminoLevels = {};

    // Initialize or load tetrimino levels from localStorage
    function initTetriminoLevels() {
        try {
            const savedLevels = localStorage.getItem('tarotTetrisUpgradeLevels');
            if (savedLevels) {
                tetriminoLevels = JSON.parse(savedLevels);
            } else {
                // Initialize with level 1 for standard tetriminos
                ['I', 'O', 'T', 'S', 'Z', 'J', 'L'].forEach(type => {
                    tetriminoLevels[type] = 1;
                });
                saveTetriminoLevels();
            }
        } catch (e) {
            console.error('Error loading tetrimino levels:', e);
            // Initialize with defaults
            ['I', 'O', 'T', 'S', 'Z', 'J', 'L'].forEach(type => {
                tetriminoLevels[type] = 1;
            });
        }
    }

    // Save tetrimino levels to localStorage
    function saveTetriminoLevels() {
        try {
            localStorage.setItem('tarotTetrisUpgradeLevels', JSON.stringify(tetriminoLevels));
        } catch (e) {
            console.error('Error saving tetrimino levels:', e);
        }
    }

    // Get the upgrade cost for a tetrimino
    function getUpgradeCost(type) {
        const level = tetriminoLevels[type] || 1;
        return UPGRADE_BASE_COST + (level * UPGRADE_LEVEL_MULTIPLIER);
    }

    // Upgrade a tetrimino
    function upgradeTetrimino(type) {
        const cost = getUpgradeCost(type);

        if (TarotTetris.spendGold(cost)) {
            // Increase level
            const oldLevel = tetriminoLevels[type] || 1;
            const newLevel = oldLevel + 1;
            tetriminoLevels[type] = newLevel;

            // Increase score value in the tetrimino definition
            const oldScore = TarotTetris.ALL_TETROMINOES[type] ? TarotTetris.ALL_TETROMINOES[type].score : 0;
            const scoreIncrease = 2;

            if (TarotTetris.ALL_TETROMINOES[type]) {
                TarotTetris.ALL_TETROMINOES[type].score += scoreIncrease;
            }

            // Save changes
            saveTetriminoLevels();

            // Update UI
            updateShopUI();

            // Update gold display
            const goldElement = document.getElementById('gold');
            if (goldElement && typeof TarotTetris.updateGold === 'function') {
                TarotTetris.updateGold(goldElement);
            }

            // Emit tetrimino upgraded event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.TETRIMINO_UPGRADED, {
                    type: type,
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    oldScore: oldScore,
                    newScore: oldScore + scoreIncrease,
                    cost: cost
                });
            }

            return true;
        }

        return false;
    }

    // Unlock a special tetrimino
    function unlockTetrimino(type) {
        if (!UNLOCK_COSTS[type]) return false;

        const cost = UNLOCK_COSTS[type];

        if (TarotTetris.spendGold(cost)) {
            // Add to unlocked tetriminos
            if (!window.unlockedTetrominoes.includes(type)) {
                window.unlockedTetrominoes.push(type);
            }

            // Initialize level
            tetriminoLevels[type] = 1;
            saveTetriminoLevels();

            // Update UI
            updateShopUI();

            // Update gold display
            const goldElement = document.getElementById('gold');
            if (goldElement && typeof TarotTetris.updateGold === 'function') {
                TarotTetris.updateGold(goldElement);
            }

            // Emit tetrimino unlocked event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.TETRIMINO_UNLOCKED, {
                    type: type,
                    cost: cost,
                    baseScore: TarotTetris.ALL_TETROMINOES[type] ? TarotTetris.ALL_TETROMINOES[type].score : 0,
                    shape: TarotTetris.ALL_TETROMINOES[type] ? TarotTetris.ALL_TETROMINOES[type].shape : null
                });
            }

            return true;
        }

        return false;
    }

    // Create the shop UI
    function createShopUI() {
        const shopContainer = document.createElement('div');
        shopContainer.id = 'shop-container';
        shopContainer.className = 'shop-container';

        // Create main tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'shop-tabs';

        const tetriminosTab = document.createElement('button');
        tetriminosTab.className = 'shop-tab active';
        tetriminosTab.textContent = 'Tetriminos';
        tetriminosTab.addEventListener('click', () => switchTab('tetriminos'));

        const upgradesTab = document.createElement('button');
        upgradesTab.className = 'shop-tab';
        upgradesTab.textContent = 'Upgrades';
        upgradesTab.addEventListener('click', () => switchTab('upgrades'));

        tabsContainer.appendChild(tetriminosTab);
        tabsContainer.appendChild(upgradesTab);

        // Create sub-tabs container (initially hidden)
        const subTabsContainer = document.createElement('div');
        subTabsContainer.className = 'shop-subtabs';
        subTabsContainer.id = 'shop-subtabs';

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'shop-content';
        contentContainer.id = 'shop-content';

        shopContainer.appendChild(tabsContainer);
        shopContainer.appendChild(subTabsContainer);
        shopContainer.appendChild(contentContainer);

        return shopContainer;
    }

    // Switch between shop tabs
    function switchTab(tabName) {
        shopState.selectedTab = tabName;

        // Reset sub-tab when changing main tab
        if (tabName === 'tetriminos') {
            shopState.selectedSubTab = 'standard';
        } else {
            shopState.selectedSubTab = null;
        }

        // Update tab UI
        const tabs = document.querySelectorAll('.shop-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase() === tabName) {
                tab.classList.add('active');
            }
        });

        // Update content
        updateShopUI();
    }

    // Switch between shop sub-tabs
    function switchSubTab(subTabName) {
        shopState.selectedSubTab = subTabName;

        // Update sub-tab UI
        const subTabs = document.querySelectorAll('.shop-subtab');
        subTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-subtab') === subTabName) {
                tab.classList.add('active');
            }
        });

        // Update content
        updateShopUI();
    }

    // Update the shop UI based on current state
    function updateShopUI() {
        const contentContainer = document.getElementById('shop-content');
        const subTabsContainer = document.getElementById('shop-subtabs');
        if (!contentContainer || !subTabsContainer) return;

        contentContainer.innerHTML = '';
        subTabsContainer.innerHTML = '';

        if (shopState.selectedTab === 'tetriminos') {
            // Create sub-tabs for tetriminos
            const standardTab = document.createElement('button');
            standardTab.className = 'shop-subtab' + (shopState.selectedSubTab === 'standard' ? ' active' : '');
            standardTab.textContent = 'Standard';
            standardTab.setAttribute('data-subtab', 'standard');
            standardTab.addEventListener('click', () => switchSubTab('standard'));

            const specialTab = document.createElement('button');
            specialTab.className = 'shop-subtab' + (shopState.selectedSubTab === 'special' ? ' active' : '');
            specialTab.textContent = 'Special';
            specialTab.setAttribute('data-subtab', 'special');
            specialTab.addEventListener('click', () => switchSubTab('special'));

            subTabsContainer.appendChild(standardTab);
            subTabsContainer.appendChild(specialTab);
            subTabsContainer.style.display = 'flex';

            if (shopState.selectedSubTab === 'standard') {
                // Show standard tetriminos for upgrade
                const standardContainer = document.createElement('div');
                standardContainer.className = 'shop-section';
                standardContainer.innerHTML = '<h3>Upgrade Standard Tetriminos</h3>';

                const tetriminoGrid = document.createElement('div');
                tetriminoGrid.className = 'tetrimino-grid';

                // Filter for standard tetriminos (I, O, T, S, Z, J, L)
                const standardTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
                window.unlockedTetrominoes.forEach(type => {
                    if (standardTypes.includes(type)) {
                        const tetriminoItem = createTetriminoItem(type, true);
                        tetriminoGrid.appendChild(tetriminoItem);
                    }
                });

                standardContainer.appendChild(tetriminoGrid);
                contentContainer.appendChild(standardContainer);
            } else if (shopState.selectedSubTab === 'special') {
                // Show unlocked special tetriminos
                const unlockedSpecialContainer = document.createElement('div');
                unlockedSpecialContainer.className = 'shop-section';
                unlockedSpecialContainer.innerHTML = '<h3>Your Special Tetriminos</h3>';

                const unlockedGrid = document.createElement('div');
                unlockedGrid.className = 'tetrimino-grid';

                // Filter for special tetriminos that are unlocked
                const standardTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
                const unlockedSpecial = window.unlockedTetrominoes.filter(type => !standardTypes.includes(type));

                if (unlockedSpecial.length > 0) {
                    unlockedSpecial.forEach(type => {
                        const tetriminoItem = createTetriminoItem(type, true);
                        unlockedGrid.appendChild(tetriminoItem);
                    });
                    unlockedSpecialContainer.appendChild(unlockedGrid);
                } else {
                    unlockedSpecialContainer.innerHTML += '<p>You haven\'t unlocked any special tetriminos yet.</p>';
                }

                contentContainer.appendChild(unlockedSpecialContainer);

                // Show locked special tetriminos for purchase
                const lockedContainer = document.createElement('div');
                lockedContainer.className = 'shop-section special-tetriminos';
                lockedContainer.innerHTML = '<h3>Unlock Special Tetriminos</h3><p class="shop-info">Special tetriminos are exclusively available through the shop! Unlock them to gain an advantage in the game.</p>';

                const lockedGrid = document.createElement('div');
                lockedGrid.className = 'tetrimino-grid';

                Object.keys(UNLOCK_COSTS).forEach(type => {
                    if (!window.unlockedTetrominoes.includes(type)) {
                        const tetriminoItem = createTetriminoItem(type, false);
                        tetriminoItem.classList.add('special-tetrimino');
                        lockedGrid.appendChild(tetriminoItem);
                    }
                });

                lockedContainer.appendChild(lockedGrid);
                contentContainer.appendChild(lockedContainer);
            }
        } else if (shopState.selectedTab === 'upgrades') {
            // Hide sub-tabs for upgrades tab
            subTabsContainer.style.display = 'none';

            // Show game upgrades
            const upgradesContainer = document.createElement('div');
            upgradesContainer.className = 'shop-section';
            upgradesContainer.innerHTML = '<h3>Game Upgrades</h3><p>Coming soon!</p>';
            contentContainer.appendChild(upgradesContainer);
        }
    }

    // Create a tetrimino item for the shop
    function createTetriminoItem(type, isUnlocked) {
        const item = document.createElement('div');
        item.className = 'tetrimino-item';
        if (!isUnlocked) item.classList.add('locked');

        // Create tetrimino preview
        const preview = document.createElement('div');
        preview.className = 'tetrimino-preview';

        // Get tetrimino shape and render it
        const tetrimino = TarotTetris.ALL_TETROMINOES[type];
        if (tetrimino && tetrimino.shape) {
            const grid = document.createElement('div');
            grid.className = 'mini-grid';

            tetrimino.shape.forEach(row => {
                row.forEach(cell => {
                    const cellElem = document.createElement('div');
                    cellElem.className = cell ? 'mini-cell filled' : 'mini-cell';
                    grid.appendChild(cellElem);
                });
            });

            preview.appendChild(grid);
        }

        // Create info section
        const info = document.createElement('div');
        info.className = 'tetrimino-info';

        const name = document.createElement('div');
        name.className = 'tetrimino-name';
        name.textContent = type;

        const stats = document.createElement('div');
        stats.className = 'tetrimino-stats';

        if (isUnlocked) {
            const level = tetriminoLevels[type] || 1;
            const scoreValue = tetrimino ? tetrimino.score : 0;

            stats.innerHTML = `
                <div>Level: ${level}</div>
                <div>Score: ${scoreValue}</div>
            `;

            const upgradeCost = getUpgradeCost(type);
            const upgradeBtn = document.createElement('button');
            upgradeBtn.className = 'shop-btn upgrade-btn';
            upgradeBtn.textContent = `Upgrade (${upgradeCost} Gold)`;
            upgradeBtn.addEventListener('click', () => {
                if (upgradeTetrimino(type)) {
                    // Success feedback
                    upgradeBtn.classList.add('success');
                    setTimeout(() => upgradeBtn.classList.remove('success'), 500);
                } else {
                    // Failure feedback
                    upgradeBtn.classList.add('error');
                    setTimeout(() => upgradeBtn.classList.remove('error'), 500);
                }
            });

            info.appendChild(name);
            info.appendChild(stats);
            info.appendChild(upgradeBtn);
        } else {
            const cost = UNLOCK_COSTS[type];
            const scoreValue = tetrimino ? tetrimino.score : 0;

            stats.innerHTML = `
                <div>Base Score: ${scoreValue}</div>
                <div>Cost: ${cost} Gold</div>
            `;

            const unlockBtn = document.createElement('button');
            unlockBtn.className = 'shop-btn unlock-btn';
            if (Object.keys(UNLOCK_COSTS).includes(type)) {
                unlockBtn.classList.add('special-unlock-btn');
            }
            unlockBtn.textContent = `Unlock (${cost} Gold)`;
            unlockBtn.addEventListener('click', () => {
                if (unlockTetrimino(type)) {
                    // Success feedback
                    item.classList.add('unlocking');
                    setTimeout(() => {
                        updateShopUI(); // Refresh the entire shop UI
                    }, 500);
                } else {
                    // Failure feedback
                    unlockBtn.classList.add('error');
                    setTimeout(() => unlockBtn.classList.remove('error'), 500);
                }
            });

            info.appendChild(name);
            info.appendChild(stats);
            info.appendChild(unlockBtn);
        }

        item.appendChild(preview);
        item.appendChild(info);

        return item;
    }

    // Initialize the shop
    function initShop() {
        initTetriminoLevels();

        // Export functions to global scope
        window.openShop = openShop;
        window.closeShop = closeShop;
        window.upgradeTetrimino = upgradeTetrimino;
        window.unlockTetrimino = unlockTetrimino;
    }

    // Open the shop
    function openShop() {
        shopState.isOpen = true;
        updateShopUI();

        // Show notification about special tetriminoes if it's the first time opening the shop
        if (!localStorage.getItem('specialTetriminoesNotified')) {
            const notification = document.createElement('div');
            notification.className = 'shop-notification';
            notification.innerHTML = `
                <h3>Special Tetriminoes Update</h3>
                <p>Special tetriminoes are now exclusively available through the shop!</p>
                <p>Unlock them with gold to gain an advantage in the game.</p>
                <button class="shop-btn" id="notification-close">Got it!</button>
            `;
            document.body.appendChild(notification);

            // Add event listener to close button
            document.getElementById('notification-close').addEventListener('click', () => {
                notification.classList.add('closing');
                setTimeout(() => {
                    notification.remove();
                }, 500);
                localStorage.setItem('specialTetriminoesNotified', 'true');
            });
        }

        // Emit shop opened event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit(TarotTetris.EVENTS.SHOP_OPENED, {
                gold: TarotTetris.gold,
                unlockedTetrominoes: window.unlockedTetrominoes || [],
                tetriminoLevels: tetriminoLevels
            });
        }
    }

    // Close the shop
    function closeShop() {
        shopState.isOpen = false;

        // Emit shop closed event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit(TarotTetris.EVENTS.SHOP_CLOSED, {
                gold: TarotTetris.gold
            });
        }
    }

    // Export functions to TarotTetris namespace
    exports.shop = {
        init: initShop,
        open: openShop,
        close: closeShop,
        upgrade: upgradeTetrimino,
        unlock: unlockTetrimino,
        createShopUI: createShopUI,
        updateShopUI: updateShopUI
    };

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShop);
    } else {
        initShop();
    }

})(window.TarotTetris = window.TarotTetris || {});
