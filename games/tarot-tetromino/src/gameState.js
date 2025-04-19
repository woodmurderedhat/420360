/**
 * Game State and UI Helpers for Tarot Tetris.
 * Attaches state variables and helper functions for score, level, combo, gold, and UI updates to window.TarotTetris.
 */
(function(exports) {
    exports.score = 0;
    exports.level = 1;
    exports.combo = 0;
    exports.dropInterval = 500;
    exports.linesClearedThisLevel = 0;
    exports.linesToLevelUp = 10;

    // Load gold from localStorage or initialize to 0
    try {
        exports.gold = parseInt(localStorage.getItem('tarotTetrisGold')) || 0;
    } catch (e) {
        exports.gold = 0;
        console.error('Error loading gold from localStorage:', e);
    }

    exports.setGameSpeed = function(speed) {
        exports.dropInterval = speed;
    };

    exports.updateScore = function(scoreElement) {
        if (scoreElement) {
            scoreElement.textContent = `Score: ${exports.score}`;
        } else {
            console.warn("Score element not found.");
        }
    };

    exports.updateGameInfo = function(gameInfoElement, info) {
        if (gameInfoElement) {
            gameInfoElement.textContent = `Game Info: ${info}`;
            gameInfoElement.setAttribute('aria-live', 'polite'); // Announce updates for screen readers
        } else {
            console.warn("Game info element not found.");
        }
    };

    exports.updateLevel = function(levelElement) {
        if (levelElement) {
            levelElement.textContent = `Level: ${exports.level}`;
        } else {
            console.warn("Level element not found.");
        }
    };

    // Add gold update function
    exports.updateGold = function(goldElement) {
        if (goldElement) {
            goldElement.textContent = `Gold: ${exports.gold}`;
            // Save gold to localStorage for persistence
            try {
                localStorage.setItem('tarotTetrisGold', exports.gold.toString());
            } catch (e) {
                console.error('Error saving gold to localStorage:', e);
            }
        } else {
            console.warn("Gold element not found.");
        }
    };

    // Add gold to player's total
    exports.addGold = function(amount) {
        exports.gold += amount;
        // Save gold to localStorage for persistence
        try {
            localStorage.setItem('tarotTetrisGold', exports.gold.toString());
        } catch (e) {
            console.error('Error saving gold to localStorage:', e);
        }
        return exports.gold;
    };

    // Spend gold (returns true if successful, false if not enough gold)
    exports.spendGold = function(amount) {
        if (exports.gold >= amount) {
            exports.gold -= amount;
            // Save gold to localStorage for persistence
            try {
                localStorage.setItem('tarotTetrisGold', exports.gold.toString());
            } catch (e) {
                console.error('Error saving gold to localStorage:', e);
            }
            return true;
        }
        return false;
    };

    // Convert score to gold at a specified exchange rate
    // NOTE: This function is kept for compatibility but is no longer used in the main game flow.
    // Gold is now only earned through leveling up.
    exports.convertScoreToGold = function(amount, exchangeRate = 10) {
        // Check if player has enough score
        if (exports.score >= amount) {
            // Calculate gold to award (default: 1 gold per 10 score)
            const goldAwarded = Math.floor(amount / exchangeRate);

            // Deduct score
            exports.score -= amount;

            // Add gold
            exports.gold += goldAwarded;

            // Save gold to localStorage for persistence
            try {
                localStorage.setItem('tarotTetrisGold', exports.gold.toString());
            } catch (e) {
                console.error('Error saving gold to localStorage:', e);
            }

            return {
                success: true,
                goldAwarded: goldAwarded,
                remainingScore: exports.score,
                newGoldTotal: exports.gold
            };
        }

        return {
            success: false,
            goldAwarded: 0,
            remainingScore: exports.score,
            newGoldTotal: exports.gold
        };
    };
})(window.TarotTetris = window.TarotTetris || {});

// Global updateGameInfo for tarot.js and other scripts
window.updateGameInfo = function(message) {
    var infoElem = document.getElementById('game-info');
    if (infoElem) {
        infoElem.textContent = message;
        infoElem.classList.add('highlight');
        setTimeout(() => infoElem.classList.remove('highlight'), 500);
    } else {
        console.warn("Game info element not found.");
    }
};

// Global updateScore for tarot.js and other scripts
window.updateScore = function() {
    var scoreElem = document.getElementById('score');
    if (scoreElem) {
        scoreElem.textContent = "Score: " + (window.TarotTetris && window.TarotTetris.score !== undefined ? window.TarotTetris.score : 0);
        scoreElem.classList.add('highlight');
        setTimeout(() => scoreElem.classList.remove('highlight'), 500);
    } else {
        console.warn("Score element not found.");
    }
};

// Global updateGold for other scripts
window.updateGold = function() {
    var goldElem = document.getElementById('gold');
    if (goldElem) {
        goldElem.textContent = "Gold: " + (window.TarotTetris && window.TarotTetris.gold !== undefined ? window.TarotTetris.gold : 0);
        goldElem.classList.add('highlight');
        setTimeout(() => goldElem.classList.remove('highlight'), 500);
    } else {
        console.warn("Gold element not found.");
    }
};
