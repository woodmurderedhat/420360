// This file manages the overall game state. It handles the spawning of new pieces, collision detection, and scoring. It also manages the game over state and restarts the game.

const canvas = document.getElementById('tetris');
const context = canvas ? canvas.getContext('2d') : null;

if (!canvas) {
    console.error("Canvas element not found!");
    alert("Error: Canvas element is missing. Please check the HTML structure.");
}

if (!context) {
    console.error("Failed to get 2D rendering context!");
    alert("Error: Unable to initialize the game. Please try reloading the page.");
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

// Add a "hold" feature to save a piece for later use
let heldPiece = null;
let canHold = true;

function holdPiece() {
    if (!canHold) return;
    if (heldPiece) {
        const temp = heldPiece;
        heldPiece = piece;
        piece = temp;
        piece.position = { x: 3, y: 0 }; // Reset position
    } else {
        heldPiece = piece;
        spawnPiece();
    }
    canHold = false; // Prevent holding multiple times in a row
    updateHoldUI();
}

function updateHoldUI() {
    const holdContainer = document.getElementById('hold-container');
    if (!holdContainer) {
        console.warn("Hold container not found.");
        return;
    }
    holdContainer.innerHTML = '';
    if (heldPiece) {
        heldPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const block = document.createElement('div');
                    block.style.gridRowStart = y + 1;
                    block.style.gridColumnStart = x + 1;
                    block.className = 'block';
                    block.style.backgroundColor = '#ff5722'; // Example color
                    holdContainer.appendChild(block);
                }
            });
        });
    }
}

// Add a "ghost piece" to show where the current piece will land
function drawGhostPiece(context) {
    const ghostPiece = new Piece(piece.type);
    ghostPiece.shape = piece.shape;
    ghostPiece.position = { ...piece.position };

    while (ghostPiece.canMoveDown(board)) {
        ghostPiece.moveDown();
    }

    ghostPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Semi-transparent color
                context.fillRect((ghostPiece.position.x + x) * 30, (ghostPiece.position.y + y) * 30, 30, 30);
            }
        });
    });
}

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
        gameInfoElement.setAttribute('aria-live', 'polite'); // Announce updates for screen readers
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

// Improved game initialization
function initializeGame() {
    score = 0;
    level = 1;
    linesClearedThisLevel = 0;
    dropInterval = 500;
    gameOver = false;
    combo = 0;
    board.reset();
    initializeTarotDeck();
    playerHand = [];
    spawnPiece();
    updateScore();
    updateLevel();
    updateGameInfo('Game Initialized');
    updateTarotUI();
    lastTime = performance.now();
}

// Enhanced game start logic
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name to start the game.');
            return;
        }
        document.body.classList.add('game-started');
        leaderboard.displayScores();
        initializeGame();
        requestAnimationFrame(update);
    });
} else {
    console.warn("Start game button not found.");
}

// Improved game over handling
function handleGameOver() {
    gameOver = true;
    updateGameInfo('Game Over');
    const playerName = playerNameInput.value.trim() || 'Player';
    leaderboard.addScore(playerName, score);
    leaderboard.displayScores();
    alert(`Game Over! ${playerName}, your score: ${score}`);
}

// Optimized piece spawning
function spawnPiece() {
    piece = new Piece();
    piece.position = { x: 3, y: 0 };
    addTarotCardToHand();

    if (board.collides(piece) || board.isBoardFull()) {
        handleGameOver();
    }
    canHold = true;
}

let coyoteTime = 300; // 300ms coyote time
let coyoteTimerActive = false;

// Enhanced update loop
function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    if (deltaTime > dropInterval) {
        if (piece.canMoveDown(board)) {
            piece.moveDown();
        } else {
            board.mergePiece(piece);
            const linesCleared = clearLines();
            if (linesCleared > 0) {
                score += calculateScore(linesCleared);
                updateScore();
            }
            spawnPiece();
        }
        lastTime = time;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    drawGhostPiece(context);
    piece.draw(context);

    requestAnimationFrame(update);
}

function calculateScore(linesCleared) {
    if (!piece) {
        console.warn("Piece is undefined when calculating score.");
        return 0;
    }
    const pieceScore = piece.getScoreValue(); // Get the unique score value of the current piece
    return linesCleared * pieceScore;
}

let tarotDeck = [];
let playerHand = [];

// Adjusted tarot card effects to ensure they are balanced, avoiding game-ending or overly punishing effects
const tarotEffects = {
    "The Fool": {
        effect: () => {
            setGameSpeed(1000);
            setTimeout(() => setGameSpeed(500), 10000); // Reset speed after 10 seconds
            updateGameInfo('The Fool slows time, giving you a moment to breathe.');
        },
        description: "Slows down the game speed for 10 seconds."
    },
    "The Magician": {
        effect: () => {
            score *= 2;
            updateScore();
            updateGameInfo('The Magician doubles your score with a wave of magic!');
        },
        description: "Doubles your current score."
    },
    "The High Priestess": {
        effect: () => {
            setGameSpeed(dropInterval * 1.5);
            setTimeout(() => setGameSpeed(500), 15000); // Reset speed after 15 seconds
            updateGameInfo('The High Priestess calms the chaos, slowing the game slightly.');
        },
        description: "Slightly slows the game speed for 15 seconds."
    },
    "The Empress": {
        effect: () => {
            score += 500;
            updateScore();
            updateGameInfo('The Empress blesses you with 500 bonus points!');
        },
        description: "Adds 500 bonus points to your score."
    },
    "The Emperor": {
        effect: () => {
            if (gameOver) {
                console.warn('The Emperor card effect skipped because the game is over.');
                return;
            }
            const newPieceType = Piece.getRandomType(); // Get a random piece type
            piece = new Piece(newPieceType); // Replace the current piece with a new one
            piece.position = { x: 3, y: 0 }; // Reset position of the new piece
            updateGameInfo('The Emperor changes your current piece to a new one!');
        },
        description: "Changes your current piece to a different one."
    },
    "The Hierophant": {
        effect: () => {
            board.reset();
            updateGameInfo('The Hierophant clears the board, offering a fresh start.');
        },
        description: "Clears the entire board."
    },
    "The Lovers": {
        effect: () => {
            score += 300;
            updateScore();
            updateGameInfo('The Lovers bring harmony, adding 300 bonus points.');
        },
        description: "Adds 300 bonus points."
    },
    "The Chariot": {
        effect: () => {
            setGameSpeed(300);
            setTimeout(() => setGameSpeed(500), 10000); // Reset speed after 10 seconds
            updateGameInfo('The Chariot accelerates the game, testing your reflexes!');
        },
        description: "Speeds up the game for 10 seconds."
    },
    "Strength": {
        effect: () => {
            coyoteTime = 2000;
            setTimeout(() => coyoteTime = 300, 15000); // Reset coyote time after 15 seconds
            updateGameInfo('Strength extends your coyote time, giving you more control.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Hermit": {
        effect: () => {
            setGameSpeed(2000);
            setTimeout(() => setGameSpeed(500), 15000); // Reset speed after 15 seconds
            updateGameInfo('The Hermit slows the game significantly, offering solitude.');
        },
        description: "Slows the game speed significantly for 15 seconds."
    },
    "Wheel of Fortune": {
        effect: () => {
            score = Math.floor(score * 1.5);
            updateScore();
            updateGameInfo('The Wheel of Fortune spins, increasing your score by 50%!');
        },
        description: "Increases score by 50%."
    },
    "Justice": {
        effect: () => {
            score += 1000;
            updateScore();
            updateGameInfo('Justice rewards you with 1000 bonus points!');
        },
        description: "Adds 1000 bonus points to your score."
    },
    "The Hanged Man": {
        effect: () => {
            dropInterval *= 2;
            setTimeout(() => setGameSpeed(500), 10000); // Reset speed after 10 seconds
            updateGameInfo('The Hanged Man slows the game drastically, testing your patience.');
        },
        description: "Drastically slows the game for 10 seconds."
    },
    "Death": {
        effect: () => {
            board.clearRandomRow();
            score = Math.max(0, score - 100); // Prevent negative score
            updateScore();
            updateGameInfo('Death clears a random row but takes 100 points.');
        },
        description: "Clears a random row and reduces your score slightly."
    },
    "Temperance": {
        effect: () => {
            setGameSpeed(750);
            updateGameInfo('Temperance balances the game speed, bringing harmony.');
        },
        description: "Balances the game speed."
    },
    "The Devil": {
        effect: () => {
            if (gameOver) {
                console.warn('The Devil card effect skipped because the game is over.');
                return;
            }
            const rowsToMoveUp = Math.floor(Math.random() * 3) + 1; // Randomly choose between 1 and 3 rows
            board.moveRowsUp(rowsToMoveUp);
            updateGameInfo(`The Devil moves all rows up by ${rowsToMoveUp} row(s), creating chaos!`);
        },
        description: "Moves all rows up by 1 to 3 rows."
    },
    "The Tower": {
        effect: () => {
            board.clearTopRows(2);
            updateGameInfo('The Tower collapses, clearing the top rows!');
        },
        description: "Clears the top two rows."
    },
    "The Star": {
        effect: () => {
            coyoteTime = 1500;
            setTimeout(() => coyoteTime = 300, 15000); // Reset coyote time after 15 seconds
            updateGameInfo('The Star shines brightly, extending your coyote time.');
        },
        description: "Extends coyote time for delayed piece locking."
    },
    "The Moon": {
        effect: () => {
            dropInterval /= 2;
            setTimeout(() => setGameSpeed(500), 10000); // Reset speed after 10 seconds
            updateGameInfo('The Moon quickens the pace, challenging your skills!');
        },
        description: "Speeds up the game for 10 seconds."
    },
    "The Sun": {
        effect: () => {
            score += 500;
            updateScore();
            updateGameInfo('The Sun shines brightly, adding 500 bonus points!');
        },
        description: "Adds 500 bonus points to your score."
    },
    "Judgement": {
        effect: () => {
            board.clearBottomRows(2);
            updateGameInfo('Judgement clears the bottom rows, giving you space.');
        },
        description: "Clears the bottom two rows."
    },
    "The World": {
        effect: () => {
            spawnPiece();
            updateGameInfo('The World brings a new piece into play!');
        },
        description: "Spawns a new piece immediately."
    }
};

// Safeguard against recursion or game-breaking behavior in tarot card effects
Object.keys(tarotEffects).forEach(card => {
    const originalEffect = tarotEffects[card].effect;
    tarotEffects[card].effect = () => {
        if (gameOver) {
            console.warn(`Effect for card "${card}" skipped because the game is over.`);
            return;
        }
        try {
            originalEffect();
        } catch (error) {
            console.error(`Error executing effect for card "${card}":`, error);
        }
    };
});

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
        // Mystical activation effect
        const tarotContainer = document.getElementById('tarot-container');
        if (tarotContainer && tarotContainer.children[cardIndex]) {
            const cardElem = tarotContainer.children[cardIndex];
            cardElem.classList.add('activated');
            setTimeout(() => {
                cardElem.classList.remove('activated');
            }, 700);
        }
        // Optional: Board glow effect
        const boardEffects = document.getElementById('board-effects');
        if (boardEffects) {
            boardEffects.style.boxShadow = '0 0 3rem 1.5rem #ffaa00, 0 0 6rem 2rem #6e44ff';
            boardEffects.style.transition = 'box-shadow 0.7s cubic-bezier(.4,2,.6,1)';
            setTimeout(() => {
                boardEffects.style.boxShadow = '';
            }, 700);
        }
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

// Update the tarot card UI dynamically
function updateTarotUI() {
    const tarotContainer = document.getElementById('tarot-container');
    if (!tarotContainer) {
        console.warn("Tarot container not found.");
        return;
    }

    tarotContainer.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'tarot-card';

        const titleElement = document.createElement('div');
        titleElement.className = 'title';
        titleElement.textContent = card;

        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'description';
        descriptionElement.textContent = tarotEffects[card]?.description || 'No description available';

        cardElement.appendChild(titleElement);
        cardElement.appendChild(descriptionElement);

        cardElement.addEventListener('click', () => {
            playTarotCard(index);
        });

        tarotContainer.appendChild(cardElement);
    });

    // Tarot cards are always visible (no .game-started dependency)
    tarotContainer.style.display = playerHand.length > 0 ? 'flex' : 'none';
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
    // Shuffle the deck before drawing a card to ensure randomness
    tarotDeck = tarotDeck.sort(() => Math.random() - 0.5);
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

// Add event listener for fullscreen toggle
const fullscreenButton = document.getElementById('fullscreen-button');
if (fullscreenButton) {
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
            });
        }
    });
} else {
    console.warn("Fullscreen button not found.");
}

// Add event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft': // Move left
        case 'a':
        case 'A':
            if (piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight': // Move right
        case 'd':
        case 'D':
            if (piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown': // Move down
        case 's':
        case 'S':
            if (piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'ArrowUp': // Rotate
        case 'w':
        case 'W':
            piece.rotate(board);
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            break;
        case 'Shift': // Hold piece
            holdPiece();
            break;
        case '1': // Play tarot card 1
        case '2': // Play tarot card 2
        case '3': // Play tarot card 3
        case '4': // Play tarot card 4
        case '5': // Play tarot card 5
        case '6': // Play tarot card 6
            const cardIndex = parseInt(event.key, 10) - 1;
            playTarotCard(cardIndex);
            break;
        default:
            break;
    }

    // Redraw the game board and piece after any movement
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    drawGhostPiece(context);
    piece.draw(context);
});

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});
