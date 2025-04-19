// Tarot logic for Tarot Tetromino
// This file defines the tarot deck, player hand, tarot card effects, and related functions.
// All functions and variables are global for compatibility with plain <script> loading.

var tarotDeck = [];
var playerHand = [];

// Track previous values for time-based effects
var previousDropInterval = null;
var previousCoyoteTime = null;

/**
 * Advanced Tetrimino Effects for Tarot Cards
 * Each effect is a modular function, time-based where needed.
 */

// --- Advanced Effect Implementations ---

// Morph: Randomly changes the active piece's shape at intervals for a duration.
function morphEffect(duration = 5000, interval = 500) {
    if (!piece) return;
    let morphing = true;
    // Store original type for potential restoration
    const morphInterval = setInterval(() => {
        if (!morphing || gameOver) return;
        const newType = TarotTetris.Piece.getRandomType();
        piece.shape = (new TarotTetris.Piece(newType)).shape;
        piece.typeIndex = ['I','O','T','S','Z','J','L'].indexOf(newType);
    }, interval);
    setTimeout(() => {
        morphing = false;
        clearInterval(morphInterval);
        // Optionally restore original type (not required)
    }, duration);
    window.updateGameInfo('Morph: Your piece is shifting shapes!');
}

// Spin: Rotates the piece randomly at intervals for a duration.
function spinEffect(duration = 5000, interval = 300) {
    if (!piece) return;
    let spinning = true;
    const spinInterval = setInterval(() => {
        if (!spinning || gameOver) return;
        const direction = Math.random() < 0.5 ? 1 : 3; // 1 = 90deg, 3 = -90deg
        for (let i = 0; i < direction; i++) piece.rotate(board);
    }, interval);
    setTimeout(() => {
        spinning = false;
        clearInterval(spinInterval);
    }, duration);
    window.updateGameInfo('Spin: Your piece is spinning out of control!');
}

// Drift: Moves the piece randomly at intervals for a duration.
function driftEffect(duration = 5000, interval = 400) {
    if (!piece) return;
    let drifting = true;
    const driftInterval = setInterval(() => {
        if (!drifting || gameOver) return;
        const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const dy = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const newPos = { x: piece.position.x + dx, y: piece.position.y + dy };
        // Check bounds and collision
        const testPiece = new TarotTetris.Piece();
        testPiece.shape = piece.shape.map(row => row.slice());
        testPiece.position = { ...newPos };
        testPiece.typeIndex = piece.typeIndex;
        if (!board.collides(testPiece)) {
            piece.position = newPos;
        }
    }, interval);
    setTimeout(() => {
        drifting = false;
        clearInterval(driftInterval);
    }, duration);
    window.updateGameInfo('Drift: Your piece is drifting unpredictably!');
}

// Fragment: Temporarily splits the piece into blocks with jitter, then reforms.
function fragmentEffect(duration = 2000) {
    if (!piece) return;
    let originalPos = { ...piece.position };
    let originalShape = piece.shape.map(row => row.slice());
    let jitter = true;
    const jitterInterval = setInterval(() => {
        if (!jitter || gameOver) return;
        // Apply random pixel offset to each block (visual only)
        // This requires a change in the draw function to check a global flag
        window.__fragmentJitter = true;
    }, 50);
    setTimeout(() => {
        jitter = false;
        clearInterval(jitterInterval);
        window.__fragmentJitter = false;
        piece.position = originalPos;
        piece.shape = originalShape;
    }, duration);
    window.updateGameInfo('Fragment: Your piece is breaking apart!');
}

// Phase: Allows the piece to pass through blocks for a duration.
function phaseEffect(duration = 4000) {
    window.__phaseActive = true;
    setTimeout(() => {
        window.__phaseActive = false;
    }, duration);
    window.updateGameInfo('Phase: Your piece can pass through blocks!');
}

// Echo: Creates a shadow clone that follows the piece with a delay.
function echoEffect(duration = 5000, delay = 4) {
    if (!piece) return;
    window.__echoTrail = [];
    window.__echoActive = true;
    const echoInterval = setInterval(() => {
        if (!window.__echoActive || gameOver) return;
        window.__echoTrail.push({
            shape: piece.shape.map(row => row.slice()),
            position: { ...piece.position },
            typeIndex: piece.typeIndex
        });
        if (window.__echoTrail.length > delay) window.__echoTrail.shift();
    }, 50);
    setTimeout(() => {
        window.__echoActive = false;
        window.__echoTrail = [];
        clearInterval(echoInterval);
    }, duration);
    updateGameInfo('Echo: A shadow follows your piece!');
}

// Time Warp: Randomly changes the fall speed of the piece for a duration.
function timeWarpEffect(duration = 5000, min = 100, max = 1200) {
    if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
    let warping = true;
    const warpInterval = setInterval(() => {
        if (!warping || gameOver) return;
        TarotTetris.setGameSpeed(Math.floor(Math.random() * (max - min + 1)) + min);
    }, 400);
    setTimeout(() => {
        warping = false;
        clearInterval(warpInterval);
        TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
        previousDropInterval = null;
    }, duration);
    updateGameInfo('Time Warp: Gravity is fluctuating!');
}

// Mirror: Flips the board visuals horizontally for a duration.
function mirrorEffect(duration = 4000) {
    window.__mirrorActive = true;
    setTimeout(() => {
        window.__mirrorActive = false;
    }, duration);
    updateGameInfo('Mirror: The board is flipped!');
}

// Weight: Increases gravity for the current piece for a duration.
function weightEffect(duration = 4000, heavy = true) {
    if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
    TarotTetris.setGameSpeed(heavy ? 100 : 1200);
    setTimeout(function() {
        TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
        previousDropInterval = null;
    }, duration);
    updateGameInfo(heavy ? 'Weight: Your piece is heavy and falls fast!' : 'Weight: Your piece is light and floats!');
}

// Teleport: Randomly moves the piece to a new column at intervals for a duration.
function teleportEffect(duration = 4000, interval = 800) {
    if (!piece) return;
    let teleporting = true;
    const teleportInterval = setInterval(() => {
        if (!teleporting || gameOver) return;
        const newX = Math.floor(Math.random() * (board.columns - piece.shape[0].length + 1));
        piece.position.x = newX;
    }, interval);
    setTimeout(() => {
        teleporting = false;
        clearInterval(teleportInterval);
    }, duration);
    updateGameInfo('Teleport: Your piece is jumping around!');
}

// Special tetriminoes are now available only through the shop

// Add Minor Arcana effects to tarotEffects
// Each unlocks a special tetromino shape for the rest of the game
var tarotEffects = {
    "The Fool": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(1000);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 10000);
            updateGameInfo('The Fool slows time, giving you a moment to breathe.');
            // Visual: CRT scanlines + blue glow
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('scanlines', 3000, { color: '#6e44ff' });
                addTarotVisualEffect('neon-glow', 3000, { color: '#6e44ff' });
            }
        },
        description: "Slows down the game speed for 10 seconds."
    },
    "The Magician": {
        effect: function() {
            TarotTetris.score *= 2;
            updateScore();
            updateGameInfo('The Magician doubles your score with a wave of magic!');
            // Visual: Neon rainbow border + particle burst
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('neon-glow', 3000, { color: '#ffdd57' });
                addTarotVisualEffect('particle-burst', 3000, { color: '#ffdd57' });
            }
        },
        description: "Doubles your current score."
    },
    "The High Priestess": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(TarotTetris.dropInterval / 2);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 10000);
            updateGameInfo('The High Priestess speeds up time, testing your reflexes.');
            // Visual effects here
        },
        description: "Speeds up the game for 10 seconds."
    },
    "The Empress": {
        effect: function() {
            TarotTetris.score += 500;
            updateScore();
            updateGameInfo('The Empress blesses you with 500 bonus points!');
            // Visual: Gold coin burst
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('particle-burst', 3000, { color: '#ffaa00' });
                addTarotVisualEffect('flash', 4000, { color: '#ffaa00' });
            }
        },
        description: "Adds 500 bonus points to your score."
    },
    "The Emperor": {
        effect: function() {
            if (gameOver) {
                console.warn('The Emperor card effect skipped because the game is over.');
                return;
            }
            var newPieceType = TarotTetris.Piece.getRandomType();
            piece = new TarotTetris.Piece(newPieceType);
            piece.position = { x: 3, y: 0 };
            updateGameInfo('The Emperor changes your current piece to a new one!');
        },
        description: "Changes your current piece to a different one."
    },
    "The Hierophant": {
        effect: function() {
            board.reset();
            updateGameInfo('The Hierophant clears the board, offering a fresh start.');
        },
        description: "Clears the entire board."
    },
    "The Lovers": {
        effect: function() {
            TarotTetris.score += 300;
            updateScore();
            updateGameInfo('The Lovers bring harmony, adding 300 bonus points.');
        },
        description: "Adds 300 bonus points."
    },
    "The Chariot": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(TarotTetris.dropInterval / 3);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 5000);
            updateGameInfo('The Chariot races forward, greatly increasing speed for 5 seconds!');
            // Visual effects here
        },
        description: "Greatly increases game speed for 5 seconds."
    },
    "Strength": {
        effect: function() {
            if (previousCoyoteTime === null) previousCoyoteTime = coyoteTime;
            coyoteTime = 2000;
            setTimeout(function() {
                coyoteTime = previousCoyoteTime !== null ? previousCoyoteTime : 300;
                previousCoyoteTime = null;
            }, 15000);
            updateGameInfo('Strength extends your coyote time, giving you more control.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Hermit": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(2000);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 15000);
            updateGameInfo('The Hermit slows the game significantly, offering solitude.');
        },
        description: "Slows the game speed significantly for 15 seconds."
    },
    "Wheel of Fortune": {
        effect: function() {
            TarotTetris.score = Math.floor(TarotTetris.score * 1.5);
            updateScore();
            updateGameInfo('The Wheel of Fortune spins, increasing your score by 50%!');
        },
        description: "Increases score by 50%."
    },
    "Justice": {
        effect: function() {
            TarotTetris.score += 1000;
            updateScore();
            updateGameInfo('Justice rewards you with 1000 bonus points!');
        },
        description: "Adds 1000 bonus points to your score."
    },
    "The Hanged Man": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(TarotTetris.dropInterval * 2);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 10000);
            updateGameInfo('The Hanged Man slows the game drastically, testing your patience.');
        },
        description: "Drastically slows the game for 10 seconds."
    },
    "Death": {
        effect: function() {
            board.clearRandomRow();
            TarotTetris.score = Math.max(0, TarotTetris.score - 100);
            updateScore();
            updateGameInfo('Death clears a random row but takes 100 points.');
        },
        description: "Clears a random row and reduces your score slightly."
    },
    "Temperance": {
        effect: function() {
            TarotTetris.setGameSpeed(750);
            updateGameInfo('Temperance balances the game speed, bringing harmony.');
        },
        description: "Balances the game speed."
    },
    "The Devil": {
        effect: function() {
            if (gameOver) {
                console.warn('The Devil card effect skipped because the game is over.');
                return;
            }
            var rowsToMoveUp = Math.floor(Math.random() * 3) + 1;
            board.moveRowsUp(rowsToMoveUp);
            updateGameInfo('The Devil moves all rows up by ' + rowsToMoveUp + ' row(s), creating chaos!');
        },
        description: "Moves all rows up by 1 to 3 rows."
    },

    "The Devil Reversed": {
        effect: function() {
            if (gameOver) {
                console.warn('The Devil Reversed card effect skipped because the game is over.');
                return;
            }
            var rowsToAdd = Math.floor(Math.random() * 3) + 1;
            for (var i = 0; i < rowsToAdd; i++) {
                board.addRandomGarbageRow();
            }
            updateGameInfo('The Devil Reversed adds ' + rowsToAdd + ' random garbage row(s) at the bottom!');
        },
        description: "Adds 1 to 3 random garbage rows at the bottom of the board."
    },
    "The Tower": {
        effect: function() {
            board.clearTopRows(2);
            updateGameInfo('The Tower collapses, clearing the top rows!');
        },
        description: "Clears the top two rows."
    },
    "The Star": {
        effect: function() {
            if (previousCoyoteTime === null) previousCoyoteTime = coyoteTime;
            coyoteTime = 1500;
            setTimeout(function() {
                coyoteTime = previousCoyoteTime !== null ? previousCoyoteTime : 300;
                previousCoyoteTime = null;
            }, 15000);
            updateGameInfo('The Star shines brightly, extending your coyote time.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Moon": {
        effect: function() {
            if (previousDropInterval === null) previousDropInterval = TarotTetris.dropInterval;
            TarotTetris.setGameSpeed(TarotTetris.dropInterval * 0.5);
            setTimeout(function() {
                TarotTetris.setGameSpeed(previousDropInterval !== null ? previousDropInterval : 500);
                previousDropInterval = null;
            }, 10000);
            updateGameInfo('The Moon slows time, giving you a moment to breathe.');
        },
        description: "Slows down the game speed for 10 seconds."
    },
    "The Sun": {
        effect: function() {
            TarotTetris.score += 500;
            updateScore();
            updateGameInfo('The Sun shines brightly, adding 500 bonus points!');
        },
        description: "Adds 500 bonus points to your score."
    },
    "Judgement": {
        effect: function() {
            board.clearBottomRows(2);
            updateGameInfo('Judgement clears the bottom rows, giving you space.');
        },
        description: "Clears the bottom two rows."
    },
    "The World": {
        effect: function() {
            // Add a flag to prevent recursive spawning
            if (window.__preventRecursiveSpawn) return;

            window.__preventRecursiveSpawn = true;
            spawnPiece();
            setTimeout(function() {
                window.__preventRecursiveSpawn = false;
            }, 100);
            updateGameInfo('The World brings a new piece into play!');
        },
        description: "Spawns a new piece immediately."
    },

    // --- Advanced Tarot Cards (with thematic names) ---

    "Wheel of Fortune Reversed": {
        effect: function() {
            morphEffect();
            // Visual: Glitch + RGB split
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('flash', 4000, { color: '#6e44ff' });
                addTarotVisualEffect('scanlines', 3000, { color: '#6e44ff' });
            }
        },
        description: "Fate is fickle: The active piece morphs into random shapes for a short time."
    },
    "The Hanged Man Reversed": {
        effect: function() {
            spinEffect();
            // Visual: Spiral background + motion blur
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('screen-shake', 2000, { color: '#ffeb3b' });
                addTarotVisualEffect('neon-glow', 3000, { color: '#ffeb3b' });
            }
        },
        description: "Perspective shifts: The active piece spins randomly for a short time."
    },
    "The Star Reversed": {
        effect: function() { driftEffect(); },
        description: "Lost in the void: The active piece drifts unpredictably for a short time."
    },
    "The Tower Reversed": {
        effect: function() {
            fragmentEffect();
            // Visual: Piece shatters, pixel dust
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('particle-burst', 3000, { color: '#fff' });
                addTarotVisualEffect('flash', 4000, { color: '#fff' });
            }
        },
        description: "Collapse averted: The active piece breaks into fragments, then reforms."
    },
    "The Moon Reversed": {
        effect: function() {
            phaseEffect();
            // Visual: Blue ghost glow
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('neon-glow', 3000, { color: '#00bcd4' });
            }
        },
        description: "Illusions fade: The active piece can pass through blocks for a short time."
    },
    "The High Priestess Reversed": {
        effect: function() {
            echoEffect();
            // Visual: Afterimage trail
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('scanlines', 3000, { color: '#fff' });
            }
        },
        description: "Hidden knowledge: A shadow follows the active piece, trailing its movements."
    },
    "Temperance Reversed": {
        effect: function() {
            timeWarpEffect();
            // Visual: Wavy time distortion
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('flash', 4000, { color: '#9c27b0' });
                addTarotVisualEffect('scanlines', 3000, { color: '#9c27b0' });
            }
        },
        description: "Time unbalanced: The fall speed of the active piece fluctuates wildly."
    },
    "Justice Reversed": {
        effect: function() {
            mirrorEffect();
            // Visual: Mirror ripple
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('flash', 4000, { color: '#fff' });
            }
        },
        description: "Reflected fate: The board visuals are flipped horizontally for a short time."
    },
    "Strength Reversed": {
        effect: function() {
            weightEffect();
            // Visual: Heavy impact, screen shake
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('screen-shake', 2000, { color: '#ffaa00' });
            }
        },
        description: "Gravity shifts: The active piece becomes heavy and falls rapidly."
    },
    "The Fool Reversed": {
        effect: function() {
            teleportEffect();
            // Visual: Pixel dissolve + reappear
            if (typeof addTarotVisualEffect === "function") {
                addTarotVisualEffect('flash', 4000, { color: '#6e44ff' });
            }
        },
        description: "Wild leap: The active piece teleports to random columns for a short time."
    }
};

// Minor Arcana unlock effects have been removed - special tetriminoes are now only available through the shop

// Safeguard against recursion or game-breaking behavior in tarot card effects
Object.keys(tarotEffects).forEach(function(card) {
    var originalEffect = tarotEffects[card].effect;
    tarotEffects[card].effect = function() {
        if (gameOver) {
            console.warn('Effect for card "' + card + '" skipped because the game is over.');
            return;
        }
        try {
            originalEffect();
        } catch (error) {
            console.error('Error executing effect for card "' + card + '":', error);
        }
    };
});

/**
 * Initialize tarot deck with all Major Arcana and advanced effects.
 */
function initializeTarotDeck() {
    tarotDeck = Object.keys(tarotEffects);
    console.info("Tarot deck initialized with all available cards (Minor Arcana unlocks removed).");
}

// Add helper methods for new effects
TarotTetris.Board.prototype.replaceRandomPieces = function() {
    if (!this.grid) {
        console.warn("Grid is undefined in replaceRandomPieces.");
        return;
    }
    for (var row = 0; row < this.rows; row++) {
        if (!this.grid[row]) {
            console.warn("Row " + row + " is undefined in replaceRandomPieces.");
            continue;
        }
        for (var col = 0; col < this.columns; col++) {
            if (Math.random() < 0.1) {
                this.grid[row][col] = Math.floor(Math.random() * 7) + 1;
            }
        }
    }
};

TarotTetris.Board.prototype.clearBottomRows = function(count) {
    if (!this.grid) {
        console.warn("Grid is undefined in clearBottomRows.");
        return;
    }
    for (var i = 0; i < count; i++) {
        if (this.grid.length > 0) {
            this.grid.pop();
            this.grid.unshift(Array(this.columns).fill(0));
        } else {
            console.warn("Grid is empty, cannot clear bottom rows.");
            break;
        }
    }
};

TarotTetris.Board.prototype.clearRandomRow = function() {
    if (!this.grid) {
        console.warn("Grid is undefined in clearRandomRow.");
        return;
    }
    var randomRow = Math.floor(Math.random() * this.rows);
    if (this.grid[randomRow]) {
        this.grid[randomRow] = Array(this.columns).fill(0);
    } else {
        console.warn("Row " + randomRow + " is undefined in clearRandomRow.");
    }
};

TarotTetris.Board.prototype.addGarbageRow = function() {
    if (!this.grid) {
        console.warn("Grid is undefined in addGarbageRow.");
        return;
    }
    this.grid.shift();
    this.grid.push(Array(this.columns).fill(1));
};

// Helper function to safely execute board methods
function safeBoardCall(methodName) {
    if (typeof board[methodName] === 'function') {
        board[methodName].apply(board, Array.prototype.slice.call(arguments, 1));
    } else {
        console.warn('board.' + methodName + ' is not a function.');
    }
}

function addTarotCardToHand() {
    // Prevent recursive calls if we're already in the process of adding a card
    if (window.__addingTarotCard) return;

    // Get tarot chance upgrade level (0-3)
    const tarotChanceLevel = window.tarotChanceLevel || 0;

    // Base chance to draw a card: 100%
    // With upgrades, we can draw multiple cards
    const numCardsToAdd = 1 + (Math.random() < (tarotChanceLevel * 0.25) ? 1 : 0);

    window.__addingTarotCard = true;

    for (let i = 0; i < numCardsToAdd; i++) {
        var newCard = drawTarotCard();

        if (playerHand.length < 6) {
            playerHand.push(newCard);

            // Emit tarot card added event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.TAROT_CARD_ADDED, {
                    card: newCard,
                    description: tarotEffects[newCard] ? tarotEffects[newCard].description : '',
                    handSize: playerHand.length,
                    fromUpgrade: i > 0
                });
            }
        } else {
            updateGameInfo('Warning: Your hand is being played.');
            playTarotCard(0);
            playerHand.push(newCard);

            // Emit tarot card added event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.TAROT_CARD_ADDED, {
                    card: newCard,
                    description: tarotEffects[newCard] ? tarotEffects[newCard].description : '',
                    handSize: playerHand.length,
                    autoPlayed: true,
                    fromUpgrade: i > 0
                });
            }
        }
    }

    // Update UI after all cards have been added
    updateTarotUI();

    // If we got a bonus card from the upgrade, show a message
    if (numCardsToAdd > 1) {
        updateGameInfo(`Tarot Frequency upgrade gave you ${numCardsToAdd} cards!`);
    }

    window.__addingTarotCard = false;
}

// Play a tarot card with enhanced visual feedback
function playTarotCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= playerHand.length) {
        console.warn("Invalid card index: " + cardIndex);
        return;
    }

    var card = playerHand[cardIndex];
    if (card && tarotEffects[card]) {
        // Find the card element
        var tarotContainer = document.getElementById('tarot-container');
        var cardElements = tarotContainer ? tarotContainer.querySelectorAll('.tarot-card') : [];
        var cardElem = cardElements[cardIndex];

        if (cardElem) {
            // Create a clone for the animation
            var cardClone = cardElem.cloneNode(true);
            cardClone.style.position = 'fixed';
            cardClone.style.zIndex = '2000';

            // Get the position of the original card
            var rect = cardElem.getBoundingClientRect();
            cardClone.style.top = rect.top + 'px';
            cardClone.style.left = rect.left + 'px';
            cardClone.style.width = rect.width + 'px';
            cardClone.style.height = rect.height + 'px';

            // Add to body for animation
            document.body.appendChild(cardClone);

            // Add activated class for glow effect
            cardElem.classList.add('activated');
            cardClone.classList.add('activated');

            // Animate the clone to the center of the board
            var boardRect = document.getElementById('tetris').getBoundingClientRect();
            var boardCenterX = boardRect.left + boardRect.width / 2 - rect.width / 2;
            var boardCenterY = boardRect.top + boardRect.height / 2 - rect.height / 2;

            // Set transition and move
            cardClone.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            setTimeout(function() {
                cardClone.style.transform = 'translate(' + (boardCenterX - rect.left) + 'px, ' + (boardCenterY - rect.top) + 'px) scale(1.2)';
                cardClone.style.opacity = '0.9';
            }, 10);

            // Remove clone after animation
            setTimeout(function() {
                cardClone.style.opacity = '0';
                cardClone.style.transform += ' scale(0.5)';
            }, 1500);

            setTimeout(function() {
                if (cardClone.parentNode) {
                    cardClone.parentNode.removeChild(cardClone);
                }
                cardElem.classList.remove('activated');
            }, 2500);
        }

        // Add board effects
        var boardEffects = document.getElementById('board-effects');
        if (boardEffects) {
            boardEffects.style.boxShadow = '0 0 3rem 1.5rem #ffaa00, 0 0 6rem 2rem #6e44ff';
            boardEffects.style.transition = 'box-shadow 0.7s cubic-bezier(.4,2,.6,1)';

            // Create a flash effect
            var flashEffect = document.createElement('div');
            flashEffect.className = 'flash-effect';
            boardEffects.appendChild(flashEffect);

            setTimeout(function() {
                boardEffects.style.boxShadow = '';
                if (flashEffect.parentNode) {
                    flashEffect.parentNode.removeChild(flashEffect);
                }
            }, 3500);
        }

        // Show card name in game info
        updateGameInfo('Activating: ' + card);

        // Execute card effect
        try {
            tarotEffects[card].effect();

            // Emit tarot card played event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.TAROT_CARD_PLAYED, {
                    card: card,
                    cardIndex: cardIndex,
                    description: tarotEffects[card].description,
                    remainingCards: playerHand.length - 1
                });
            }
        } catch (error) {
            console.error('Error executing effect for card "' + card + '":', error);
        }

        // Remove card from hand and update UI
        playerHand.splice(cardIndex, 1);
        updateTarotUI();

        // Update objectives panel if it exists
        if (typeof updateObjectivesPanel === 'function') {
            updateObjectivesPanel();
        }
    } else {
        console.warn('Card "' + card + '" has no defined effect.');
    }
}

// Update the tarot card UI dynamically with modern enhancements
function updateTarotUI() {
    var tarotContainer = document.getElementById('tarot-container');
    if (!tarotContainer) {
        console.warn("Tarot container not found.");
        return;
    }

    // Add header if it doesn't exist
    if (!document.querySelector('.tarot-dock-header')) {
        var headerElement = document.createElement('div');
        headerElement.className = 'tarot-dock-header';
        headerElement.innerHTML = `
            <h3>Tarot Cards</h3>
            <button class="tarot-dock-toggle" aria-label="Close Tarot Dock">×</button>
        `;
        tarotContainer.appendChild(headerElement);

        // Add event listener to toggle button
        var toggleButton = headerElement.querySelector('.tarot-dock-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                var tarotDock = document.getElementById('tarot-dock');
                if (tarotDock) {
                    tarotDock.classList.add('hidden');
                }
            });
        }

        // Add floating toggle button for mobile
        if (!document.querySelector('.tarot-toggle-btn')) {
            var toggleBtn = document.createElement('button');
            toggleBtn.className = 'tarot-toggle-btn';
            toggleBtn.setAttribute('aria-label', 'Toggle Tarot Cards');
            toggleBtn.innerHTML = '<span class="icon">🃏</span>';
            document.body.appendChild(toggleBtn);

            // Add event listener to floating toggle button
            toggleBtn.addEventListener('click', function() {
                var tarotDock = document.getElementById('tarot-dock');
                if (tarotDock) {
                    tarotDock.classList.toggle('hidden');
                }
            });
        }

        // Add counter element
        var counterElement = document.createElement('div');
        counterElement.className = 'tarot-counter';
        counterElement.innerHTML = `
            <span>Cards in Hand: <span id="card-count">0</span></span>
            <span>Deck: <span id="deck-count">0</span></span>
        `;
        tarotContainer.appendChild(counterElement);
    }

    // Update counter
    var cardCountElement = document.getElementById('card-count');
    var deckCountElement = document.getElementById('deck-count');
    if (cardCountElement) cardCountElement.textContent = playerHand.length;
    if (deckCountElement) deckCountElement.textContent = tarotDeck.length;

    // Remove existing cards
    var existingCards = tarotContainer.querySelectorAll('.tarot-card');
    existingCards.forEach(function(card) {
        tarotContainer.removeChild(card);
    });

    // Add cards
    playerHand.forEach(function(card, index) {
        var cardElement = document.createElement('div');
        cardElement.className = 'tarot-card';

        // Add card type class
        if (card.indexOf('Reversed') !== -1) {
            cardElement.classList.add('reversed');
        } else {
            cardElement.classList.add('major-arcana');
        }

        var titleElement = document.createElement('div');
        titleElement.className = 'title';
        titleElement.textContent = card;

        var descriptionElement = document.createElement('div');
        descriptionElement.className = 'description';
        descriptionElement.textContent = tarotEffects[card] && tarotEffects[card].description ? tarotEffects[card].description : 'No description available';

        // Add tooltip for more information
        var tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip';
        tooltipElement.textContent = 'Click to activate this card\'s effect';

        cardElement.appendChild(titleElement);
        cardElement.appendChild(descriptionElement);
        cardElement.appendChild(tooltipElement);

        cardElement.addEventListener('click', function() {
            playTarotCard(index);
        });

        tarotContainer.appendChild(cardElement);
    });

    // Show/hide tarot dock based on card count
    var tarotDock = document.getElementById('tarot-dock');
    if (tarotDock) {
        if (playerHand.length > 0) {
            tarotDock.classList.remove('hidden');
        } else {
            tarotDock.classList.add('hidden');
        }
    }
}

// Helper function to check if a card is potentially bad
function isPotentiallyBadCard(card) {
    var badCardIdentifiers = ["Reversed", "Swords", "Devil", "Hanged Man", "Tower", "Five"];
    return badCardIdentifiers.some(function(identifier) { return card.indexOf(identifier) !== -1; });
}

function shufflePlayerHand() {
    playerHand = playerHand.sort(function() { return Math.random() - 0.5; });
    updateTarotUI();
}

function randomActivateCard() {
    if (playerHand.length > 0) {
        var randomIndex = Math.floor(Math.random() * playerHand.length);
        playTarotCard(randomIndex);
    }
}

function freezePiece() {
    var originalDropInterval = dropInterval;
    dropInterval = Infinity;
    setTimeout(function() {
        dropInterval = originalDropInterval;
    }, 3000);
}

function drawTarotCard() {
    if (tarotDeck.length === 0) {
        console.warn("Tarot deck is empty. Reinitializing deck.");
        initializeTarotDeck();
    }

    // Create a copy of the deck before sorting to avoid modifying the original
    var deckCopy = [...tarotDeck];
    deckCopy.sort(function() { return Math.random() - 0.5; });

    var randomIndex = Math.floor(Math.random() * tarotDeck.length);
    var card = tarotDeck.splice(randomIndex, 1)[0];

    // If we're down to 25% of cards, reinitialize the deck
    if (tarotDeck.length < Object.keys(tarotEffects).length * 0.25) {
        console.info("Tarot deck running low. Reinitializing.");
        initializeTarotDeck();
        // Remove the card we just drew to prevent duplicates
        tarotDeck = tarotDeck.filter(c => c !== card);
    }

    return card;
}

// Initialize tarot deck on load
initializeTarotDeck();
