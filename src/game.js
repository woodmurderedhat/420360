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
const restartGameButton = document.getElementById('restart-game-button');
const levelElement = document.getElementById('level');

// Hold feature
let heldPiece = null;
let canHold = true;

// Initialize level display
TarotTetris.updateLevel(levelElement);

// Improved game initialization with modern UI
function initializeGame() {
    // Always reset unlocked tetriminoes to default at the start of a new game
    window.unlockedTetrominoes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    TarotTetris.score = 0;
    TarotTetris.level = 1;
    TarotTetris.linesClearedThisLevel = 0;
    TarotTetris.linesToLevelUp = 10;
    TarotTetris.dropInterval = 500;
    gameOver = false;
    TarotTetris.combo = 0;
    board.reset();
    initializeTarotDeck();
    playerHand = [];

    // Reset hold piece
    heldPiece = null;
    canHold = true;
    if (typeof TarotTetris.updateHoldUI === 'function') {
        TarotTetris.updateHoldUI(null);
    }

    spawnPiece();
    TarotTetris.updateScore(scoreElement);
    TarotTetris.updateLevel(levelElement);
    TarotTetris.updateGameInfo(gameInfoElement, 'Game Initialized');
    updateTarotUI();
    lastTime = performance.now();

    // Hide any active overlays
    if (typeof hideAllOverlays === 'function') {
        hideAllOverlays();
    }

    // Initialize or update objectives panel
    if (typeof createObjectivesPanel === 'function') {
        createObjectivesPanel();
    } else if (typeof updateObjectivesPanel === 'function') {
        updateObjectivesPanel();
    }

    // Show game info message
    TarotTetris.updateGameInfo(gameInfoElement, 'Game Started! Clear lines to level up.');
}

// Enhanced game restart logic
if (restartGameButton) {
    restartGameButton.addEventListener('click', () => {
        // Show confirmation dialog
        if (confirm('Are you sure you want to restart the game? Your current progress will be lost.')) {
            // Reset game state
            gameOver = false;

            // Show intro overlay again
            if (typeof showIntroOverlay === 'function') {
                showIntroOverlay();
            } else {
                // Reset game and start animation
                initializeGame();
                // Make sure the game is in started state
                document.body.classList.add('game-started');
                // Start animation loop
                requestAnimationFrame(update);
            }
        }
    });
} else {
    console.warn("Restart game button not found.");
}

// Hard drop function for mobile controls
function hardDropPiece() {
    if (typeof gameOver !== 'undefined' && gameOver) return;
    if (typeof gamePaused !== 'undefined' && gamePaused) return;
    if (typeof piece === 'undefined' || !piece) return;

    // Drop the piece all the way down
    while (piece.canMoveDown(board)) {
        piece.moveDown();
    }

    // Lock the piece in place
    board.mergePiece(piece);

    // Clear lines and update score
    const linesCleared = clearLines();
    if (linesCleared > 0) {
        TarotTetris.score += calculateScore(linesCleared);
        TarotTetris.updateScore(scoreElement);

        // Update objectives panel if it exists
        if (typeof updateObjectivesPanel === 'function') {
            updateObjectivesPanel();
        }

        // Check for level up
        TarotTetris.linesClearedThisLevel += linesCleared;
        if (TarotTetris.linesClearedThisLevel >= TarotTetris.linesToLevelUp) {
            increaseLevel();
        }
    }

    // Spawn a new piece
    spawnPiece();
}

// Initialize game on first load
document.addEventListener('DOMContentLoaded', () => {
    // Show intro overlay on first load
    if (typeof showIntroOverlay === 'function') {
        showIntroOverlay();
    } else {
        // If intro overlay function is not available, prompt for player name
        const playerName = prompt('Enter your name:', 'Player');
        if (playerName && playerNameInput) {
            playerNameInput.value = playerName.trim() || 'Player';
        }
        // Start the game
        initializeGame();
        requestAnimationFrame(update);
    }

    // Display leaderboard
    if (typeof leaderboard !== 'undefined' && typeof leaderboard.displayScores === 'function') {
        leaderboard.displayScores();
    }

    // Initialize touch controls if not already initialized
    if (typeof initTouchControls === 'function') {
        initTouchControls();
    }

    // Create objectives panel if available
    if (typeof createObjectivesPanel === 'function') {
        createObjectivesPanel();
    }
});

// Start game function (called after countdown)
function startGame() {
    document.body.classList.add('game-started');
    // Show tarot sidebar
    const tarotDock = document.getElementById('tarot-dock');
    if (tarotDock) {
        tarotDock.classList.remove('hidden');
    }

    initializeGame();
    requestAnimationFrame(update);
}

// Improved game over handling with modern overlay
function handleGameOver() {
    gameOver = true;
    TarotTetris.updateGameInfo(gameInfoElement, 'Game Over');

    // Hide tarot sidebar
    const tarotDock = document.getElementById('tarot-dock');
    if (tarotDock) {
        tarotDock.classList.add('hidden');
    }

    // Game is over

    // Get player name from the hidden input (set during intro)
    const playerName = playerNameInput.value.trim() || 'Player';

    // Make sure the score is recorded to the leaderboard
    if (typeof leaderboard !== 'undefined' && typeof leaderboard.addScore === 'function') {
        leaderboard.addScore(playerName, TarotTetris.score);
        // Update the displayed leaderboard
        leaderboard.saveScores();
        leaderboard.displayScores();
        console.log(`Score recorded: ${playerName} - ${TarotTetris.score}`);
    } else {
        console.error('Leaderboard functionality not available');
    }

    // Show game over overlay instead of alert
    if (typeof showGameOverOverlay === 'function') {
        showGameOverOverlay(playerName, TarotTetris.score, TarotTetris.level);
    } else {
        alert(`Game Over! ${playerName}, your score: ${TarotTetris.score}`);
    }
}

// Optimized piece spawning
function spawnPiece() {
    piece = new TarotTetris.Piece();
    piece.position = { x: 3, y: 0 };

    // Add tarot card to hand if the function exists
    if (typeof addTarotCardToHand === 'function') {
        addTarotCardToHand();
    }

    if (board.collides(piece) || board.isBoardFull()) {
        handleGameOver();
    }
    canHold = true;

    // Make the hold piece function available globally
    window.holdPiece = function() {
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

        // Update hold UI
        if (typeof TarotTetris.updateHoldUI === 'function') {
            TarotTetris.updateHoldUI(heldPiece);
        }
    };
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

// Enhanced update loop with modern UI updates
function update(time = 0) {
    // Make update function available globally for restart functionality
    window.update = update;
    // Only return if gameOver is true and we're not in the process of restarting
    if (gameOver) return;

    // Skip game logic if paused, but continue animation frame
    if (typeof gamePaused !== 'undefined' && gamePaused) {
        requestAnimationFrame(update);
        return;
    }

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

                // Update objectives panel if it exists
                if (typeof updateObjectivesPanel === 'function') {
                    updateObjectivesPanel();
                }

                // Check for level up
                TarotTetris.linesClearedThisLevel += linesCleared;
                if (TarotTetris.linesClearedThisLevel >= TarotTetris.linesToLevelUp) {
                    increaseLevel();
                }
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
    if (typeof TarotTetris.renderTarotEffects === 'function') {
        TarotTetris.renderTarotEffects(context);
    }

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

    // Increase lines needed for next level up (optional difficulty scaling)
    TarotTetris.linesToLevelUp = Math.min(20, 10 + Math.floor(TarotTetris.level / 2));

    // Increase game speed (reduce drop interval)
    TarotTetris.dropInterval = Math.max(100, TarotTetris.dropInterval - 50);
    TarotTetris.updateGameInfo(gameInfoElement, `Level Up! New level: ${TarotTetris.level}`);

    // Show level up overlay
    if (typeof showLevelUpOverlay === 'function') {
        showLevelUpOverlay(TarotTetris.level);
    }

    // Update objectives panel
    if (typeof updateObjectivesPanel === 'function') {
        updateObjectivesPanel();
    }

    // Add a bonus tarot card as a reward
    if (typeof addTarotCardToHand === 'function') {
        addTarotCardToHand();
    }
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
