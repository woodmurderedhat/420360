// Tarot logic for Tarot Tetromino
// This file defines the tarot deck, player hand, tarot card effects, and related functions.
// All functions and variables are global for compatibility with plain <script> loading.

// Tarot deck and player hand
var tarotDeck = [];
var playerHand = [];

// Tarot card effects and descriptions
var tarotEffects = {
    "The Fool": {
        effect: function() {
            setGameSpeed(1000);
            setTimeout(function() { setGameSpeed(500); }, 10000);
            updateGameInfo('The Fool slows time, giving you a moment to breathe.');
        },
        description: "Slows down the game speed for 10 seconds."
    },
    "The Magician": {
        effect: function() {
            score *= 2;
            updateScore();
            updateGameInfo('The Magician doubles your score with a wave of magic!');
        },
        description: "Doubles your current score."
    },
    "The High Priestess": {
        effect: function() {
            setGameSpeed(dropInterval * 1.5);
            setTimeout(function() { setGameSpeed(500); }, 15000);
            updateGameInfo('The High Priestess calms the chaos, slowing the game slightly.');
        },
        description: "Slightly slows the game speed for 15 seconds."
    },
    "The Empress": {
        effect: function() {
            score += 500;
            updateScore();
            updateGameInfo('The Empress blesses you with 500 bonus points!');
        },
        description: "Adds 500 bonus points to your score."
    },
    "The Emperor": {
        effect: function() {
            if (gameOver) {
                console.warn('The Emperor card effect skipped because the game is over.');
                return;
            }
            var newPieceType = Piece.getRandomType();
            piece = new Piece(newPieceType);
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
            score += 300;
            updateScore();
            updateGameInfo('The Lovers bring harmony, adding 300 bonus points.');
        },
        description: "Adds 300 bonus points."
    },
    "The Chariot": {
        effect: function() {
            setGameSpeed(300);
            setTimeout(function() { setGameSpeed(500); }, 10000);
            updateGameInfo('The Chariot accelerates the game, testing your reflexes!');
        },
        description: "Speeds up the game for 10 seconds."
    },
    "Strength": {
        effect: function() {
            coyoteTime = 2000;
            setTimeout(function() { coyoteTime = 300; }, 15000);
            updateGameInfo('Strength extends your coyote time, giving you more control.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Hermit": {
        effect: function() {
            setGameSpeed(2000);
            setTimeout(function() { setGameSpeed(500); }, 15000);
            updateGameInfo('The Hermit slows the game significantly, offering solitude.');
        },
        description: "Slows the game speed significantly for 15 seconds."
    },
    "Wheel of Fortune": {
        effect: function() {
            score = Math.floor(score * 1.5);
            updateScore();
            updateGameInfo('The Wheel of Fortune spins, increasing your score by 50%!');
        },
        description: "Increases score by 50%."
    },
    "Justice": {
        effect: function() {
            score += 1000;
            updateScore();
            updateGameInfo('Justice rewards you with 1000 bonus points!');
        },
        description: "Adds 1000 bonus points to your score."
    },
    "The Hanged Man": {
        effect: function() {
            dropInterval *= 2;
            setTimeout(function() { setGameSpeed(500); }, 10000);
            updateGameInfo('The Hanged Man slows the game drastically, testing your patience.');
        },
        description: "Drastically slows the game for 10 seconds."
    },
    "Death": {
        effect: function() {
            board.clearRandomRow();
            score = Math.max(0, score - 100);
            updateScore();
            updateGameInfo('Death clears a random row but takes 100 points.');
        },
        description: "Clears a random row and reduces your score slightly."
    },
    "Temperance": {
        effect: function() {
            setGameSpeed(750);
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
    "The Tower": {
        effect: function() {
            board.clearTopRows(2);
            updateGameInfo('The Tower collapses, clearing the top rows!');
        },
        description: "Clears the top two rows."
    },
    "The Star": {
        effect: function() {
            coyoteTime = 1500;
            setTimeout(function() { coyoteTime = 300; }, 15000);
            updateGameInfo('The Star shines brightly, extending your coyote time.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Moon": {
        effect: function() {
            dropInterval /= 2;
            setTimeout(function() { setGameSpeed(500); }, 10000);
            updateGameInfo('The Moon quickens the pace, challenging your skills!');
        },
        description: "Speeds up the game for 10 seconds."
    },
    "The Sun": {
        effect: function() {
            score += 500;
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
            spawnPiece();
            updateGameInfo('The World brings a new piece into play!');
        },
        description: "Spawns a new piece immediately."
    }
};

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

// Initialize tarot deck with all Major Arcana
function initializeTarotDeck() {
    tarotDeck = Object.keys(tarotEffects);
    console.info("Tarot deck initialized with all available cards.");
}

// Add helper methods for new effects
Board.prototype.replaceRandomPieces = function() {
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

Board.prototype.clearBottomRows = function(count) {
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

Board.prototype.clearRandomRow = function() {
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

Board.prototype.addGarbageRow = function() {
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
    var newCard = drawTarotCard();
    if (playerHand.length < 6) {
        playerHand.push(newCard);
        updateTarotUI();
    } else {
        updateGameInfo('Warning: Your hand is being played.');
        playTarotCard(0);
        playerHand.push(newCard);
        updateTarotUI();
    }
}

// Play a tarot card
function playTarotCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= playerHand.length) {
        console.warn("Invalid card index: " + cardIndex);
        return;
    }

    var card = playerHand[cardIndex];
    if (card && tarotEffects[card]) {
        var tarotContainer = document.getElementById('tarot-container');
        if (tarotContainer && tarotContainer.children[cardIndex]) {
            var cardElem = tarotContainer.children[cardIndex];
            cardElem.classList.add('activated');
            setTimeout(function() {
                cardElem.classList.remove('activated');
            }, 700);
        }
        var boardEffects = document.getElementById('board-effects');
        if (boardEffects) {
            boardEffects.style.boxShadow = '0 0 3rem 1.5rem #ffaa00, 0 0 6rem 2rem #6e44ff';
            boardEffects.style.transition = 'box-shadow 0.7s cubic-bezier(.4,2,.6,1)';
            setTimeout(function() {
                boardEffects.style.boxShadow = '';
            }, 700);
        }
        try {
            tarotEffects[card].effect();
        } catch (error) {
            console.error('Error executing effect for card "' + card + '":', error);
        }
        playerHand.splice(cardIndex, 1);
        updateTarotUI();
    } else {
        console.warn('Card "' + card + '" has no defined effect.');
    }
}

// Update the tarot card UI dynamically
function updateTarotUI() {
    var tarotContainer = document.getElementById('tarot-container');
    if (!tarotContainer) {
        console.warn("Tarot container not found.");
        return;
    }

    tarotContainer.innerHTML = '';
    playerHand.forEach(function(card, index) {
        var cardElement = document.createElement('div');
        cardElement.className = 'tarot-card';

        var titleElement = document.createElement('div');
        titleElement.className = 'title';
        titleElement.textContent = card;

        var descriptionElement = document.createElement('div');
        descriptionElement.className = 'description';
        descriptionElement.textContent = tarotEffects[card] && tarotEffects[card].description ? tarotEffects[card].description : 'No description available';

        cardElement.appendChild(titleElement);
        cardElement.appendChild(descriptionElement);

        cardElement.addEventListener('click', function() {
            playTarotCard(index);
        });

        tarotContainer.appendChild(cardElement);
    });

    tarotContainer.style.display = playerHand.length > 0 ? 'flex' : 'none';
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
    tarotDeck = tarotDeck.sort(function() { return Math.random() - 0.5; });
    var randomIndex = Math.floor(Math.random() * tarotDeck.length);
    return tarotDeck.splice(randomIndex, 1)[0];
}

// Initialize tarot deck on load
initializeTarotDeck();
