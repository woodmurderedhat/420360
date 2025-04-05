// This file manages the overall game state. It handles the spawning of new pieces, collision detection, and scoring. It also manages the game over state and restarts the game.

const canvas = document.getElementById('tetris');
const context = canvas ? canvas.getContext('2d') : null;

if (!canvas) {
    console.error("Canvas element not found!");
}

if (!context) {
    console.error("Failed to get 2D rendering context!");
}

const board = new Board();
let piece;
let score = 0;
let gameOver = false;
let lastTime = 0;
let dropInterval = 500; // Default speed (milliseconds)
let level = 1;
let linesClearedThisLevel = 0;
const linesToLevelUp = 10;
let combo = 0;

const playerNameInput = document.getElementById('player-name');
const scoreElement = document.getElementById('score');
const gameInfoElement = document.getElementById('game-info');
const startGameButton = document.getElementById('start-game-button');
const levelElement = document.getElementById('level');

// Function to set the game speed
function setGameSpeed(speed) {
    dropInterval = speed;
}

// Update the score display
function updateScore() {
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    } else {
        console.warn("Score element not found.");
    }
}

// Update game info
function updateGameInfo(info) {
    if (gameInfoElement) {
        gameInfoElement.textContent = `Game Info: ${info}`;
    } else {
        console.warn("Game info element not found.");
    }
}

// Function to update the level display
function updateLevel() {
    if (levelElement) {
        levelElement.textContent = `Level: ${level}`;
    } else {
        console.warn("Level element not found.");
    }
}

// Initialize the level display
updateLevel();

if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name to start the game.');
            return;
        }
        leaderboard.displayScores(); // Ensure leaderboard is updated before starting
        startGame();
    });
} else {
    console.warn("Start game button not found.");
}

function startGame() {
    score = 0;
    level = 1;
    linesClearedThisLevel = 0;
    dropInterval = 500;
    updateLevel();
    gameOver = false;
    board.reset();
    initializeTarotDeck(); // Reinitialize the tarot deck at the start of the game
    playerHand = []; // Clear the player's hand
    spawnPiece();
    updateScore();
    updateGameInfo('Game Started');
    updateTarotUI(); // Draw tarot cards at the start of the game
    lastTime = performance.now(); // Ensure lastTime is initialized correctly
    requestAnimationFrame(update); // Start the game loop
}

function calculateScore(linesCleared) {
    if (!piece) {
        console.warn("Piece is undefined when calculating score.");
        return 0;
    }
    const pieceScore = piece.getScoreValue(); // Get the unique score value of the current piece
    return linesCleared * pieceScore;
}

function spawnPiece() {
    piece = new Piece();
    piece.position = {x: 3, y: 0}; // Reset position when spawning
    addTarotCardToHand(); // Draw a new tarot card when a piece spawns

    if (board.collides(piece) || board.isBoardFull()) {
        gameOver = true;
        updateGameInfo('Game Over');
        const playerName = playerNameInput.value.trim() || 'Player';
        leaderboard.addScore(playerName, score); // Add score to leaderboard
        leaderboard.displayScores(); // Update leaderboard display
        alert(`Game Over! ${playerName}, your score: ${score}`); // Fixed syntax error
    }
}

let coyoteTime = 300; // 300ms coyote time
let coyoteTimerActive = false;

function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    if (deltaTime > dropInterval) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        board.draw(context);
        piece.draw(context);

        if (piece.canMoveDown(board)) {
            piece.moveDown();
            coyoteTimerActive = false;
        } else if (!coyoteTimerActive) {
            coyoteTimerActive = true;
            setTimeout(() => {
                if (!piece.canMoveDown(board)) {
                    board.mergePiece(piece);
                    const linesCleared = clearLines();
                    if (linesCleared > 0) {
                        score += calculateScore(linesCleared);
                        updateScore();
                    }
                    spawnPiece();
                }
                coyoteTimerActive = false; // Reset coyoteTimerActive after the timer expires
            }, coyoteTime);
        }

        lastTime = time;
    } else {
        // Ensure the piece is drawn even if it's not time to move down
        context.clearRect(0, 0, canvas.width, canvas.height);
        board.draw(context);
        piece.draw(context);
    }

    requestAnimationFrame(update);
}

// Example: Change speed dynamically
setGameSpeed(1000); // Slower speed (1 second per drop)

document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
        case 'a': // Added 'a' for left movement
            if (piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight':
        case 'd': // Added 'd' for right movement
            if (piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown':
        case 's': // Added 's' for down movement
            if (piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'ArrowUp':
        case 'w': // Added 'w' for rotation
            piece.rotate(board);
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            break;
    }

    updateScore();
});

let tarotDeck = [];
let playerHand = [];

// Expanded tarot card effects with more creative and negative effects
const tarotEffects = {
    // Major Arcana
    "The Fool": { effect: () => { setGameSpeed(1000); updateGameInfo('Speed slowed!'); }, description: "Slows down the game speed." },
    "The Magician": { effect: () => { score *= 2; updateScore(); updateGameInfo('Score doubled!'); }, description: "Doubles your current score." },
    "The High Priestess": { effect: () => { dropInterval *= 1.5; updateGameInfo('Game slowed slightly!'); }, description: "Slightly slows the game." },
    "The Empress": { effect: () => { score += 300; updateScore(); updateGameInfo('Bonus score added!'); }, description: "Adds 300 bonus points to your score." },
    "The Emperor": { 
        effect: () => { 
            spawnPiece(); // Spawn the first piece immediately
            setTimeout(() => {
                if (!gameOver) {
                    spawnPiece(); // Queue the second piece to spawn after a delay
                    updateGameInfo('Second piece spawned!');
                }
            }, 500); // Delay for 500ms to avoid overlapping logic
        }, 
        description: "Spawns two pieces at once." 
    },
    "The Hierophant": { effect: () => { board.reset(); updateGameInfo('Board cleared!'); }, description: "Clears the entire board." },
    "The Lovers": { effect: () => { score += 200; updateScore(); updateGameInfo('Harmony bonus added!'); }, description: "Adds 200 bonus points." },
    "The Chariot": { effect: () => { setGameSpeed(500); updateGameInfo('Speed increased!'); }, description: "Speeds up the game." },
    "Strength": { effect: () => { coyoteTime = 1500; updateGameInfo('Coyote time extended!'); }, description: "Extends coyote time for delayed piece locking." },
    "The Hermit": { effect: () => { setGameSpeed(2000); updateGameInfo('Game slowed significantly!'); }, description: "Slows the game speed significantly." },
    "Wheel of Fortune": { effect: () => { score *= 1.5; updateScore(); updateGameInfo('Score increased by 50%!'); }, description: "Increases score by 50%." },
    "Justice": { effect: () => { score += 1000; updateScore(); updateGameInfo('Massive bonus score!'); }, description: "Adds 1000 bonus points to your score." },
    "The Hanged Man": { effect: () => { dropInterval *= 2; updateGameInfo('Game slowed drastically!'); }, description: "Drastically slows the game." },
    "Death": { effect: () => { board.reset(); score = 0; updateScore(); updateGameInfo('Board reset and score cleared!'); }, description: "Resets the board and clears your score." },
    "Temperance": { effect: () => { dropInterval = 750; updateGameInfo('Game speed balanced!'); }, description: "Balances the game speed." },
    "The Devil": { effect: () => {
            safeBoardCall('replaceRandomPieces');
            updateGameInfo('Random pieces replaced!');
        }, description: "Replaces random pieces on the board." },
    "The Tower": { effect: () => { board.reset(); updateGameInfo('Board cleared!'); }, description: "Clears the entire board." },
    "The Star": { effect: () => { coyoteTime = 1000; updateGameInfo('Coyote time extended!'); }, description: "Extends coyote time for delayed piece locking." },
    "The Moon": { effect: () => { dropInterval /= 2; updateGameInfo('Speed increased!'); }, description: "Speeds up the game." },
    "The Sun": { effect: () => { score += 500; updateScore(); updateGameInfo('Bonus score added!'); }, description: "Adds 500 bonus points to your score." },
    "Judgement": { effect: () => {
            safeBoardCall('clearBottomRows', 2);
            updateGameInfo('Bottom rows cleared!');
        }, description: "Clears the bottom two rows." },
    "The World": { effect: () => { spawnPiece(); updateGameInfo('New piece spawned!'); }, description: "Spawns a new piece immediately." },

    // Minor Arcana (Example: Wands, Cups, Swords, Pentacles)
    "Ace of Wands": { effect: () => { score += 100; updateScore(); updateGameInfo('Small bonus score added!'); }, description: "Adds 100 bonus points." },
    "Two of Wands": { effect: () => { spawnPiece(); updateGameInfo('New piece spawned!'); }, description: "Spawns a new piece." },
    "Three of Wands": { effect: () => {
            safeBoardCall('clearRandomRow');
            updateGameInfo('Random row cleared!');
        }, description: "Clears a random row." },
    "Four of Wands": { effect: () => { score += 400; updateScore(); updateGameInfo('Celebration bonus added!'); }, description: "Adds 400 bonus points." },

    // Negative and Random Effects
    "Five of Swords": { effect: () => {
            safeBoardCall('addGarbageRow');
            updateGameInfo('Garbage row added!');
        }, description: "Adds a garbage row to the board." },
    "Seven of Cups": { effect: () => { shufflePlayerHand(); updateGameInfo('Your hand was shuffled!'); }, description: "Shuffles your tarot hand." },
    "Ten of Pentacles": { effect: () => { dropInterval /= 1.5; updateGameInfo('Game speed increased!'); }, description: "Speeds up the game significantly." },
    "Nine of Swords": { effect: () => { randomActivateCard(); updateGameInfo('A random card activated!'); }, description: "Randomly activates a card in your hand." },
    "The Moon (Reversed)": { effect: () => { score -= 200; updateScore(); updateGameInfo('Score reduced!'); }, description: "Reduces your score by 200 points." },
    "The Tower (Reversed)": { effect: () => {
            safeBoardCall('addGarbageRow');
            updateGameInfo('Chaos! Garbage row added!');
        }, description: "Adds a garbage row to the board." },
    "The Devil (Reversed)": { effect: () => { dropInterval /= 2; updateGameInfo('Game speed doubled!'); }, description: "Doubles the game speed." },
    "The Hanged Man (Reversed)": { effect: () => { freezePiece(); updateGameInfo('Your piece is frozen!'); }, description: "Freezes your current piece for a few seconds." }
};

// Initialize tarot deck with all Major and Minor Arcana
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
    for (let row = 0; row < this.rows; row++) {
        if (!this.grid[row]) {
            console.warn(`Row ${row} is undefined in replaceRandomPieces.`);
            continue;
        }
        for (let col = 0; col < this.columns; col++) {
            if (Math.random() < 0.1) { // 10% chance to replace a piece
                this.grid[row][col] = Math.floor(Math.random() * 7) + 1; // Random piece type
            }
        }
    }
};

Board.prototype.clearBottomRows = function(count) {
    if (!this.grid) {
        console.warn("Grid is undefined in clearBottomRows.");
        return;
    }
    for (let i = 0; i < count; i++) {
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
    const randomRow = Math.floor(Math.random() * this.rows);
    if (this.grid[randomRow]) {
        this.grid[randomRow] = Array(this.columns).fill(0);
    } else {
        console.warn(`Row ${randomRow} is undefined in clearRandomRow.`);
    }
};

Board.prototype.addGarbageRow = function() {
    if (!this.grid) {
        console.warn("Grid is undefined in addGarbageRow.");
        return;
    }
    this.grid.shift(); // Remove the top row
    this.grid.push(Array(this.columns).fill(1)); // Add a garbage row at the bottom
};

// Helper function to safely execute board methods
function safeBoardCall(methodName, ...args) {
    if (typeof board[methodName] === 'function') {
        board[methodName](...args);
    } else {
        console.warn(`board.${methodName} is not a function.`);
    }
}

function addTarotCardToHand() {
    const newCard = drawTarotCard();
    if (playerHand.length < 6) {
        playerHand.push(newCard);
        updateTarotUI(); // Update the UI after adding a card
    } else {
        // Automatically play the oldest card if the hand is full
        updateGameInfo('Warning: Your hand is being played.');
        playTarotCard(0); // Play the first card in the hand
        playerHand.push(newCard); // Add the new card to the hand
        updateTarotUI(); // Update the UI after playing and adding a card
    }
}

// Play a tarot card
function playTarotCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= playerHand.length) {
        console.warn(`Invalid card index: ${cardIndex}`);
        return;
    }

    const card = playerHand[cardIndex];
    if (card && tarotEffects[card]) {
        try {
            tarotEffects[card].effect(); // Execute the card's effect
        } catch (error) {
            console.error(`Error executing effect for card "${card}":`, error);
        }
        playerHand.splice(cardIndex, 1); // Remove the card from the hand
        updateTarotUI();
    } else {
        console.warn(`Card "${card}" has no defined effect.`);
    }
}

// Update the tarot card UI
function updateTarotUI() {
    const tarotContainer = document.getElementById('tarot-container');
    if (!tarotContainer) {
        console.warn("Tarot container not found.");
        return;
    }

    tarotContainer.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('button');
        cardElement.textContent = card;
        cardElement.className = 'tarot-card';
        cardElement.title = tarotEffects[card]?.description || 'No description available';

        // Highlight potentially bad cards in red
        if (isPotentiallyBadCard(card)) {
            cardElement.style.color = 'red';
        }

        cardElement.addEventListener('click', () => {
            playTarotCard(index);
        });
        tarotContainer.appendChild(cardElement);
    });
}

// Helper function to check if a card is potentially bad
function isPotentiallyBadCard(card) {
    const badCardIdentifiers = ["Reversed", "Swords", "Devil", "Hanged Man", "Tower", "Five"];
    return badCardIdentifiers.some(identifier => card.includes(identifier));
}

// Modify clearLines to redraw tarot cards when a line is cleared
function clearLines() {
    const linesToClear = board.checkFullLines();
    if (!Array.isArray(linesToClear)) {
        console.error("checkFullLines did not return an array:", linesToClear);
        return 0;
    }

    const numLinesCleared = linesToClear.length;
    if (numLinesCleared > 0) {
        combo++; // Increase combo counter
        score += combo * 50; // Add combo bonus to score
        updateScore();
    } else {
        combo = 0; // Reset combo if no lines are cleared
    }
    
    for (let line of linesToClear) {
        if (line >= 0 && line < board.grid.length) {
            board.grid.splice(line, 1);
            board.grid.unshift(Array(board.columns).fill(0));
        } else {
            console.warn(`Line index out of bounds: ${line}`);
        }
    }

    linesClearedThisLevel += numLinesCleared;
    if (linesClearedThisLevel >= linesToLevelUp) {
        increaseLevel();
    }

    updateTarotUI(); // Ensure tarot UI is updated after clearing lines
    return numLinesCleared;
}

// Function to increase the game level
function increaseLevel() {
    level++;
    updateLevel();
    linesClearedThisLevel = 0;
    // Increase game speed (reduce drop interval)
    dropInterval = Math.max(100, dropInterval - 50);
    updateGameInfo(`Level Up! New level: ${level}`);
}

// Helper functions for new effects
function shufflePlayerHand() {
    playerHand = playerHand.sort(() => Math.random() - 0.5);
    updateTarotUI();
}

function randomActivateCard() {
    if (playerHand.length > 0) {
        const randomIndex = Math.floor(Math.random() * playerHand.length);
        playTarotCard(randomIndex);
    }
}

function freezePiece() {
    const originalDropInterval = dropInterval;
    dropInterval = Infinity; // Temporarily stop the piece from dropping
    setTimeout(() => {
        dropInterval = originalDropInterval; // Restore the original drop interval
    }, 3000); // Freeze for 3 seconds
}

function drawTarotCard() {
    if (tarotDeck.length === 0) {
        console.warn("Tarot deck is empty. Reinitializing deck.");
        initializeTarotDeck(); // Reinitialize the tarot deck
    }
    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    return tarotDeck.splice(randomIndex, 1)[0]; // Remove and return a random card
}

initializeTarotDeck();

// Mobile controls
const moveLeftButton = document.getElementById('move-left');
const rotateButton = document.getElementById('rotate');
const moveRightButton = document.getElementById('move-right');
const moveDownButton = document.getElementById('move-down');

if (moveLeftButton) {
    moveLeftButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveLeft(board)) {
            piece.moveLeft();
            updateScore();
        }
    });
}

if (rotateButton) {
    rotateButton.addEventListener('click', () => {
        if (!gameOver) {
            piece.rotate(board);
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            updateScore();
        }
    });
}

if (moveRightButton) {
    moveRightButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveRight(board)) {
            piece.moveRight();
            updateScore();
        }
    });
}

if (moveDownButton) {
    moveDownButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveDown(board)) {
            piece.moveDown();
            updateScore();
        }
    });
}