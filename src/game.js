/**
 * This file manages the overall game state. It handles the spawning of new pieces, collision detection, and scoring.
 * It also manages the game over state and restarts the game.
 *
 * Tarot Visual Effect Manager: Arcade-inspired visual effects for tarot cards.
 */

// Canvas and context setup
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

// Game state variables
const board = new TarotTetris.Board();
let piece;
let gameOver = false;
let lastTime = 0;

// UI element references
const playerNameInput = document.getElementById('player-name');
const scoreElement = document.getElementById('score');
const gameInfoElement = document.getElementById('game-info');
const startGameButton = document.getElementById('start-game-button');
const levelElement = document.getElementById('level');

// Hold feature
let heldPiece = null;
let canHold = true;

// Initialize level display
TarotTetris.updateLevel(levelElement);

// Improved game initialization
function initializeGame() {
    // Always reset unlocked tetriminoes to default at the start of a new game
    window.unlockedTetrominoes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    TarotTetris.score = 0;
    TarotTetris.level = 1;
    TarotTetris.linesClearedThisLevel = 0;
    TarotTetris.dropInterval = 500;
    gameOver = false;
    TarotTetris.combo = 0;
    board.reset();
    initializeTarotDeck();
    playerHand = [];
    spawnPiece();
    TarotTetris.updateScore(scoreElement);
    TarotTetris.updateLevel(levelElement);
    TarotTetris.updateGameInfo(gameInfoElement, 'Game Initialized');
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
        // Show tarot sidebar
        const tarotDock = document.getElementById('tarot-dock');
        if (tarotDock) {
            tarotDock.classList.remove('hidden');
        }
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
    TarotTetris.updateGameInfo(gameInfoElement, 'Game Over');
    // Hide tarot sidebar
    const tarotDock = document.getElementById('tarot-dock');
    if (tarotDock) {
        tarotDock.classList.add('hidden');
    }
    const playerName = playerNameInput.value.trim() || 'Player';
    leaderboard.addScore(playerName, TarotTetris.score);
    leaderboard.displayScores();
    alert(`Game Over! ${playerName}, your score: ${TarotTetris.score}`);
}

// Optimized piece spawning
function spawnPiece() {
    piece = new TarotTetris.Piece();
    piece.position = { x: 3, y: 0 };
    addTarotCardToHand();

    if (board.collides(piece) || board.isBoardFull()) {
        handleGameOver();
    }
    canHold = true;
}

/**
 * Instantly drops the current piece to the bottom, merges it, clears lines, updates score, and spawns a new piece.
 */
function hardDropPiece() {
    if (gameOver || !piece) return;
    let dropDistance = 0;
    while (piece.canMoveDown(board)) {
        piece.moveDown();
        dropDistance++;
    }
    board.mergePiece(piece);
    const linesCleared = clearLines();
    if (linesCleared > 0) {
        TarotTetris.score += calculateScore(linesCleared);
        TarotTetris.updateScore(scoreElement);
    }
    spawnPiece();
    // Optionally, you could add a score bonus for hard drop distance:
    // TarotTetris.score += dropDistance * 2;
    // TarotTetris.updateScore(scoreElement);
}

let coyoteTime = 300; // 300ms coyote time
let coyoteTimerActive = false;

// Enhanced update loop
function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    if (deltaTime > TarotTetris.dropInterval) {
        if (piece.canMoveDown(board)) {
            piece.moveDown();
        } else {
            board.mergePiece(piece);
            const linesCleared = clearLines();
            if (linesCleared > 0) {
                TarotTetris.score += calculateScore(linesCleared);
                TarotTetris.updateScore(scoreElement);
            }
            spawnPiece();
        }
        lastTime = time;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    TarotTetris.drawGhostPiece(context, piece, board);

    // Render echo trail if echo effect is active
    if (window.__echoActive && window.__echoTrail && window.__echoTrail.length > 0) {
        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63'];

        // Draw each echo in the trail with increasing transparency
        window.__echoTrail.forEach((echo, index) => {
            const alpha = 0.2 + (index / window.__echoTrail.length) * 0.3; // Fade from 0.2 to 0.5 alpha
            const color = colors[echo.typeIndex % colors.length];

            // Draw the echo shape
            echo.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        context.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0'); // Add alpha to hex color
                        context.fillRect((echo.position.x + x) * 30, (echo.position.y + y) * 30, 30, 30);
                    }
                });
            });
        });
    }

    if (piece) {
        piece.draw(context);
    }

    // --- Render tarot visual effects overlay ---
    TarotTetris.renderTarotEffects(context);

    requestAnimationFrame(update);
}

// Restore clearLines and increaseLevel (needed for game logic)
function clearLines() {
    const linesToClear = board.checkFullLines();
    if (!Array.isArray(linesToClear)) {
        console.error("checkFullLines did not return an array:", linesToClear);
        return 0;
    }

    const numLinesCleared = linesToClear.length;
    if (numLinesCleared > 0) {
        TarotTetris.combo++; // Increase combo counter
        TarotTetris.score += TarotTetris.combo * 50; // Add combo bonus to score
        TarotTetris.updateScore(scoreElement);
    } else {
        TarotTetris.combo = 0; // Reset combo if no lines are cleared
    }

    for (let line of linesToClear) {
        if (line >= 0 && line < board.grid.length) {
            board.grid.splice(line, 1);
            board.grid.unshift(Array(board.columns).fill(0));
        } else {
            console.warn(`Line index out of bounds: ${line}`);
        }
    }

    TarotTetris.linesClearedThisLevel += numLinesCleared;
    if (TarotTetris.linesClearedThisLevel >= TarotTetris.linesToLevelUp) {
        increaseLevel();
    }

    updateTarotUI(); // Ensure tarot UI is updated after clearing lines
    return numLinesCleared;
}

function increaseLevel() {
    TarotTetris.level++;
    TarotTetris.updateLevel(levelElement);
    TarotTetris.linesClearedThisLevel = 0;
    // Increase game speed (reduce drop interval)
    TarotTetris.dropInterval = Math.max(100, TarotTetris.dropInterval - 50);
    TarotTetris.updateGameInfo(gameInfoElement, `Level Up! New level: ${TarotTetris.level}`);
}

function calculateScore(linesCleared) {
    if (!piece) {
        console.warn("Piece is undefined when calculating score.");
        return 0;
    }
    const pieceScore = piece.getScoreValue(); // Get the unique score value of the current piece
    return linesCleared * pieceScore;
}

// Dynamically adjust canvas size based on screen size
function resizeCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) {
        const width = Math.min(window.innerWidth * 0.8, 300);
        const height = width * 2; // Maintain 1:2 aspect ratio
        canvas.width = width;
        canvas.height = height;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

/* Arcade Ad System is now modularized in src/arcadeads.js */

/* Initialize Arcade Ad System */
initArcadeAds({
    awardScoreBonus: function(bonus) {
        TarotTetris.score += bonus;
    },
    updateScore: function() {
        TarotTetris.updateScore(scoreElement);
    },
    getAddTarotCardToHand: function() {
        return typeof window.addTarotCardToHand === "function" ? window.addTarotCardToHand : null;
    }
});
