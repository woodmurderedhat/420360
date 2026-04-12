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

// Preview queue for next pieces
let nextQueue = [];

// Hold queue for held pieces (max 3)
let heldPieces = [];

// Currency - use TarotTetris.gold for persistence
let money = TarotTetris.gold || 0;

// UI element references
const playerNameInput = document.getElementById('player-name');
const scoreElement = document.getElementById('score');
const gameInfoElement = document.getElementById('game-info');
const restartGameButton = document.getElementById('restart-game');
const levelElement = document.getElementById('level');
const goldElement = document.getElementById('gold');

// Hold feature
let canHold = true;

// Initialize level display
TarotTetris.updateLevel(levelElement);

// --- Preview Queue Initialization ---
function initializePreviewQueue() {
    nextQueue = [];
    for (let i = 0; i < 3; i++) {
        nextQueue.push(new TarotTetris.Piece());
    }
    updateNextUI();
}

// --- Update Next UI ---
function updateNextUI() {
    if (typeof TarotTetris.updateNextUI === "function") {
        TarotTetris.updateNextUI(nextQueue);
    }
}

// Improved game initialization with modern UI
function initializeGame() {
    // Always reset unlocked tetriminoes to default at the start of a new game
    // Special tetriminoes are now only available through the shop
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

    // Load upgrade levels from localStorage
    try {
        const savedUpgrades = localStorage.getItem('tarotTetrisUpgrades');
        if (savedUpgrades) {
            const upgrades = JSON.parse(savedUpgrades);

            // Apply upgrade effects
            window.comboMultiplierLevel = upgrades.combo_bonus || 0;
            window.tarotChanceLevel = upgrades.tarot_chance || 0;
            window.ghostPieceLevel = upgrades.ghost_piece || 0;
            window.coyoteTimeLevel = upgrades.coyote_time || 0;

            // Update coyote time based on upgrade level
            coyoteTime = getCoyoteTime();

        }
    } catch (e) {
        console.error('Error loading upgrade levels:', e);
    }

    // Reset hold pieces
    heldPieces = [];
    window.heldPieces = heldPieces;
    canHold = true;
    if (typeof TarotTetris.updateHoldUI === 'function') {
        TarotTetris.updateHoldUI(heldPieces);
    }

    initializePreviewQueue();
    spawnPiece();
    TarotTetris.updateScore(scoreElement);
    TarotTetris.updateLevel(levelElement);
    TarotTetris.updateGold(goldElement);
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

    // Emit game initialized event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.GAME_INITIALIZED, {
            score: TarotTetris.score,
            level: TarotTetris.level,
            gold: TarotTetris.gold
        });
    }
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

// Hard drop function for mobile controls and keyboard
function hardDropPiece() {
    if (typeof gameOver !== 'undefined' && gameOver) return;
    if (typeof gamePaused !== 'undefined' && gamePaused) return;
    if (typeof piece === 'undefined' || !piece) return;

    // Use the ghost piece system to determine the landing position
    if (TarotTetris.getLandingPosition && typeof TarotTetris.getLandingPosition === 'function') {
        // Get the landing position from the ghost piece system
        const landingY = TarotTetris.getLandingPosition(piece, board);

        // Move the piece directly to the landing position
        if (landingY > piece.position.y) {
            piece.position.y = landingY;
        } else {
            // Fallback to the old method if ghost piece calculation fails
            while (piece.canMoveDown(board)) {
                piece.moveDown();
            }
        }
    } else {
        // Fallback to the old method if ghost piece system is not available
        while (piece.canMoveDown(board)) {
            piece.moveDown();
        }
    }

    // Lock the piece in place
    board.mergePiece(piece);

    // Emit piece drop event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_DROPPED, {
            piece: piece
        });
    }

    // Check for T-spin before clearing lines
    let tSpinBonus = 0;
    if (typeof lastMoveWasRotation !== 'undefined' && lastMoveWasRotation &&
        typeof tSpinDetected !== 'undefined' && tSpinDetected &&
        piece.type === 'T' && TarotTetris.tSpin) {

        // Clear lines and update score
        const linesCleared = clearLines();

        // Calculate T-spin bonus if applicable
        if (tSpinDetected.isTSpin && typeof TarotTetris.tSpin.calculateTSpinBonus === 'function') {
            tSpinBonus = TarotTetris.tSpin.calculateTSpinBonus(tSpinDetected, linesCleared);

            // Add T-spin bonus to score
            if (tSpinBonus > 0) {
                TarotTetris.score += tSpinBonus;

                // Show T-spin message
                const tSpinType = tSpinDetected.isMini ? 'Mini T-Spin' : 'T-Spin';
                const lineText = linesCleared > 0 ? ` ${linesCleared}` : '';
                TarotTetris.updateGameInfo(gameInfoElement, `${tSpinType}${lineText}! +${tSpinBonus} points`);
            }
        }

        if (linesCleared > 0) {
            // Add normal line clear score
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
    } else {
        // Normal line clear (no T-spin)
        const linesCleared = clearLines();
        if (linesCleared > 0) {
            // Score is already calculated and added in clearLines()
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
    }

    // Reset T-spin detection for next piece
    if (typeof lastMoveWasRotation !== 'undefined') {
        lastMoveWasRotation = false;
    }
    if (typeof tSpinDetected !== 'undefined') {
        tSpinDetected = null;
    }

    // Spawn a new piece
    spawnPiece();
}

// Initialize game on first load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound system
    if (TarotTetris.sound && typeof TarotTetris.sound.initialize === 'function') {
        TarotTetris.sound.initialize();
    }

    // Initialize shop system to load game upgrades
    if (TarotTetris.shop && typeof TarotTetris.shop.init === 'function') {
        TarotTetris.shop.init();
    }

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

    // Emit game started event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.GAME_STARTED, {
            playerName: playerNameInput.value.trim() || 'Player',
            score: TarotTetris.score,
            level: TarotTetris.level
        });
    }
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
    } else {
        console.error('Leaderboard functionality not available');
    }

    // Show game over overlay instead of alert
    if (typeof showGameOverOverlay === 'function') {
        showGameOverOverlay(playerName, TarotTetris.score, TarotTetris.level);
    } else {
        alert(`Game Over! ${playerName}, your score: ${TarotTetris.score}`);
    }

    // Emit game over event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.GAME_OVER, {
            playerName: playerName,
            score: TarotTetris.score,
            level: TarotTetris.level,
            gold: TarotTetris.gold
        });
    }
}

// Optimized piece spawning
function spawnPiece() {
    // If queue is empty (first game), initialize it
    if (!nextQueue || nextQueue.length < 1) {
        initializePreviewQueue();
    }
    // Take the first piece from the queue
    piece = nextQueue.shift();
    piece.position = { x: 3, y: 0 };

    // Add a new random piece to the queue
    nextQueue.push(new TarotTetris.Piece());

    // Update preview UI
    updateNextUI();

    // Tarot cards are now drawn when lines are cleared, not when pieces spawn

    if (board.collides(piece) || board.isBoardFull()) {
        handleGameOver();
        return; // Exit early if game over
    }
    canHold = true;
    window.heldPieces = heldPieces;

    // Make the hold piece function available globally
    window.holdPiece = function(state) {
        // For compatibility, delegate to TarotTetris.holdPiece
        state = state || {
            heldPieces: heldPieces,
            piece: piece,
            canHold: canHold,
            spawnPiece: spawnPiece,
            updateHoldUI: function() {
                if (typeof TarotTetris.updateHoldUI === 'function') {
                    TarotTetris.updateHoldUI(heldPieces);
                }
            }
        };
        TarotTetris.holdPiece(state);
        heldPieces = state.heldPieces;
        piece = state.piece;
        canHold = state.canHold;
        window.heldPieces = heldPieces;
        window.piece = piece;
        window.canHold = canHold;
    };

    // Emit piece spawned event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_SPAWNED, {
            piece: piece,
            nextQueue: nextQueue
        });
    }
}

// Note: hardDropPiece is already defined above

// Base coyote time with upgrade level applied
function getCoyoteTime() {
    // Get coyote time upgrade level (0-3)
    const coyoteTimeLevel = window.coyoteTimeLevel || 0;
    // Base coyote time: 300ms, +100ms per level
    return 300 + (coyoteTimeLevel * 100);
}

let coyoteTime = getCoyoteTime(); // Initialize coyote time
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

            // Check for T-spin before clearing lines
            let tSpinBonus = 0;
            if (typeof lastMoveWasRotation !== 'undefined' && lastMoveWasRotation &&
                typeof tSpinDetected !== 'undefined' && tSpinDetected &&
                piece.type === 'T' && TarotTetris.tSpin) {

                // Clear lines and update score
                const linesCleared = clearLines();

                // Calculate T-spin bonus if applicable
                if (tSpinDetected.isTSpin && typeof TarotTetris.tSpin.calculateTSpinBonus === 'function') {
                    tSpinBonus = TarotTetris.tSpin.calculateTSpinBonus(tSpinDetected, linesCleared);

                    // Add T-spin bonus to score
                    if (tSpinBonus > 0) {
                        TarotTetris.score += tSpinBonus;

                        // Show T-spin message
                        const tSpinType = tSpinDetected.isMini ? 'Mini T-Spin' : 'T-Spin';
                        const lineText = linesCleared > 0 ? ` ${linesCleared}` : '';
                        TarotTetris.updateGameInfo(gameInfoElement, `${tSpinType}${lineText}! +${tSpinBonus} points`);
                    }
                }

                if (linesCleared > 0) {
                    // Score is already calculated and added in clearLines()
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
            } else {
                // Normal line clear (no T-spin)
                const linesCleared = clearLines();
                if (linesCleared > 0) {
                    // Score is already calculated and added in clearLines()
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
            }

            // Reset T-spin detection for next piece
            if (typeof lastMoveWasRotation !== 'undefined') {
                lastMoveWasRotation = false;
            }
            if (typeof tSpinDetected !== 'undefined') {
                tSpinDetected = null;
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
    // Use the enhanced board.clearLines() that returns line scores
    const result = board.clearLines();
    if (!result || typeof result !== 'object') {
        console.error("board.clearLines did not return a valid result:", result);
        return 0;
    }

    const numLinesCleared = result.count;
    const lineScores = result.lineScores || [];

    if (numLinesCleared > 0) {
        TarotTetris.combo++; // Increase combo counter

        // Calculate total score from the line scores
        let totalScore = 0;
        lineScores.forEach(lineScore => {
            totalScore += lineScore;
        });

        // Apply combo multiplier if combo is active
        if (TarotTetris.combo > 1) {
            // Get combo multiplier level from upgrades (0-5)
            const comboUpgradeLevel = window.comboMultiplierLevel || 0;

            // Base multiplier: 1.1x at combo 2, increasing by 0.1 per combo
            // Upgrade adds 0.05 per level to the multiplier growth rate
            const baseGrowthRate = 0.1;
            const upgradeBonus = comboUpgradeLevel * 0.05;
            const growthRate = baseGrowthRate + upgradeBonus;

            // Calculate multiplier with a higher cap based on upgrade level
            const maxMultiplier = 2 + (comboUpgradeLevel * 0.2); // Max 3x at upgrade level 5
            const comboMultiplier = Math.min(maxMultiplier, 1 + (TarotTetris.combo - 1) * growthRate);

            totalScore = Math.floor(totalScore * comboMultiplier);

            // Show combo multiplier if it's significant
            if (TarotTetris.combo >= 3) {
                const comboText = document.getElementById('combo-text');
                if (comboText) {
                    comboText.textContent = `${TarotTetris.combo}x Combo! (${comboMultiplier.toFixed(1)}x)`;
                    comboText.style.display = 'block';
                    comboText.classList.add('pulse');
                    setTimeout(() => {
                        comboText.classList.remove('pulse');
                        if (TarotTetris.combo < 3) {
                            comboText.style.display = 'none';
                        }
                    }, 1000);
                }
            }
        }

        // Apply level multiplier
        const levelMultiplier = 1 + (TarotTetris.level - 1) * 0.1; // 10% increase per level
        totalScore = Math.floor(totalScore * levelMultiplier);

        // Add to player's score
        TarotTetris.score += totalScore;

        // Update UI
        if (typeof TarotTetris.updateScore === 'function') {
            TarotTetris.updateScore(scoreElement);
        }
        if (typeof TarotTetris.updateGold === 'function') {
            TarotTetris.updateGold(goldElement);
        }

        // Show score earned message
        TarotTetris.updateGameInfo(gameInfoElement, `Earned ${totalScore} points!`);

        // Add highlight animation to score display
        if (scoreElement) {
            scoreElement.classList.add('highlight');
            setTimeout(() => scoreElement.classList.remove('highlight'), 500);
        }

        // Emit lines cleared event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit(TarotTetris.EVENTS.LINES_CLEARED, {
                linesCleared: numLinesCleared,
                combo: TarotTetris.combo,
                scoreEarned: totalScore,
                score: TarotTetris.score
            });
        }

        // Add tarot card to hand when lines are cleared
        if (typeof addTarotCardToHand === 'function') {
            addTarotCardToHand();
        }
    } else {
        TarotTetris.combo = 0; // Reset combo if no lines are cleared
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

    // Award gold based on level (20 gold at level 2, 30 at level 3, etc.)
    const goldAwarded = TarotTetris.level * 10;
    TarotTetris.addGold(goldAwarded);

    // Update gold display
    if (typeof TarotTetris.updateGold === 'function' && goldElement) {
        TarotTetris.updateGold(goldElement);

        // Add highlight animation to gold display
        goldElement.classList.add('highlight');
        setTimeout(() => goldElement.classList.remove('highlight'), 500);
    }

    TarotTetris.updateGameInfo(gameInfoElement, `Level Up! New level: ${TarotTetris.level} - Earned ${goldAwarded} gold!`);

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

    // Emit level up event
    if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
        TarotTetris.events.emit(TarotTetris.EVENTS.LEVEL_UP, {
            level: TarotTetris.level,
            goldAwarded: goldAwarded,
            dropInterval: TarotTetris.dropInterval,
            linesToLevelUp: TarotTetris.linesToLevelUp
        });
    }
}

// This function is deprecated and no longer used in the game
// Score is now calculated in clearLines() based on tetromino pieces in each line
// This function is kept only for reference and backward compatibility
function calculateScore(_linesCleared) {
    console.error("calculateScore is deprecated and should not be called. Score is now calculated in clearLines() based on tetromino pieces in each line.");
    return 0; // Return 0 to prevent any score calculation from this function
}

// Upgrade function for held pieces
window.upgradeHeldPiece = function(idx) {
    if (!heldPieces[idx]) return;
    // Simple upgrade: increase scoreValue by 50, cost is 100 gold
    const upgradeCost = 100;
    if (TarotTetris.spendGold(upgradeCost)) {
        const oldValue = heldPieces[idx].scoreValue || 0;
        const upgradeAmount = 50;
        heldPieces[idx].scoreValue = oldValue + upgradeAmount;
        money = TarotTetris.gold;

        // Update UI
        if (typeof TarotTetris.updateGold === 'function') {
            TarotTetris.updateGold(goldElement);
        }

        // Optionally, show feedback
        if (typeof updateGameInfo === 'function') {
            updateGameInfo(`Upgraded held piece #${idx + 1}!`);
        }

        // Emit held piece upgraded event
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit(TarotTetris.EVENTS.TETRIMINO_UPGRADED, {
                type: heldPieces[idx].type,
                oldScore: oldValue,
                newScore: oldValue + upgradeAmount,
                cost: upgradeCost,
                isHeldPiece: true,
                heldIndex: idx
            });
        }
    } else {
        if (typeof updateGameInfo === 'function') {
            updateGameInfo('Not enough gold to upgrade!');
        }
    }
};

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
