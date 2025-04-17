/**
 * Handles all controls and input for the game (keyboard, mobile, fullscreen, scroll prevention).
 * This file is safe for file:// loading (no import/export).
 */

// --- Game control state variables ---
let hardDropLocked = false;
let gamePaused = false;

// Pause/resume game function
function togglePause() {
    if (typeof gameOver !== "undefined" && gameOver) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        // Show pause overlay if available
        if (typeof showPauseOverlay === "function") {
            showPauseOverlay();
        }
    } else {
        // Hide pause overlay if available
        if (typeof hideOverlay === "function") {
            const pauseOverlay = document.getElementById('game-pause-overlay');
            if (pauseOverlay) {
                hideOverlay(pauseOverlay);
            }
        }
    }

    return gamePaused;
}

// Resume game function
function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        return true;
    }
    return false;
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (typeof gameOver !== "undefined" && gameOver) return;

    // Hard drop: Shift + ArrowDown
    if (event.key === 'ArrowDown' && event.shiftKey) {
        if (!hardDropLocked && typeof hardDropPiece === "function") {
            hardDropPiece();
            hardDropLocked = true;
        }
        // Prevent soft drop if Shift is held
        return;
    }

    switch (event.key) {
        case 'ArrowLeft': // Move left
        case 'a':
        case 'A':
            if (typeof piece !== "undefined" && piece.canMoveLeft && piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight': // Move right
        case 'd':
        case 'D':
            if (typeof piece !== "undefined" && piece.canMoveRight && piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown': // Soft drop (only if Shift is not held)
            if (!event.shiftKey && typeof piece !== "undefined" && piece.canMoveDown && piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 's':
        case 'S':
            if (typeof piece !== "undefined" && piece.canMoveDown && piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'ArrowUp': // Rotate
        case 'w':
        case 'W':
            if (typeof piece !== "undefined" && piece.rotate) {
                piece.rotate(board);
                if (board.collides(piece) && piece.undoRotate) {
                    piece.undoRotate();
                }
            }
            break;
        case 'Shift': // Hold piece (only if not combined with ArrowDown)
            if (event.key === 'Shift' && !event.getModifierState('ArrowDown') && typeof TarotTetris.holdPiece === "function") {
                // Create state object for holdPiece
                const holdState = {
                    heldPiece: window.heldPiece,
                    piece: window.piece,
                    canHold: window.canHold,
                    spawnPiece: window.spawnPiece,
                    updateHoldUI: function() {
                        if (typeof TarotTetris.updateHoldUI === "function") {
                            TarotTetris.updateHoldUI(window.heldPiece);
                        }
                    }
                };
                TarotTetris.holdPiece(holdState);
                // Update global variables
                window.heldPiece = holdState.heldPiece;
                window.piece = holdState.piece;
                window.canHold = holdState.canHold;
            }
            break;
        case '1': case '2': case '3': case '4': case '5': case '6':
            if (typeof playTarotCard === "function") {
                const cardIndex = parseInt(event.key, 10) - 1;
                playTarotCard(cardIndex);
            }
            break;
        case ' ': // Space bar for hard drop
        case 'Space': // Some browsers use 'Space' instead of ' '
            if (typeof hardDropPiece === "function") {
                event.preventDefault(); // Prevent page scrolling
                hardDropPiece();
            }
            break;
        case 'p': case 'P': // Pause game
            togglePause();
            break;
        case 'o': case 'O': // Show objectives
            if (typeof showObjectivesOverlay === "function") {
                showObjectivesOverlay();
            }
            break;
        case 'c': case 'C': // Hold piece
            if (typeof TarotTetris.holdPiece === "function") {
                // Create state object for holdPiece
                const holdState = {
                    heldPiece: window.heldPiece,
                    piece: window.piece,
                    canHold: window.canHold,
                    spawnPiece: window.spawnPiece,
                    updateHoldUI: function() {
                        if (typeof TarotTetris.updateHoldUI === "function") {
                            TarotTetris.updateHoldUI(window.heldPiece);
                        }
                    }
                };
                TarotTetris.holdPiece(holdState);
                // Update global variables
                window.heldPiece = holdState.heldPiece;
                window.piece = holdState.piece;
                window.canHold = holdState.canHold;
            }
            break;
        default:
            break;
    }

    // Redraw the game board and piece after any movement
    if (typeof context !== "undefined" && typeof board !== "undefined") {
        context.clearRect(0, 0, canvas.width, canvas.height);
        board.draw(context);
        if (typeof TarotTetris.drawGhostPiece === "function" && typeof piece !== "undefined") {
            TarotTetris.drawGhostPiece(context, piece, board);
        }
        if (typeof piece !== "undefined" && piece.draw) {
            piece.draw(context);
        }
    }
});

// Unlock hard drop on keyup
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowDown' && event.shiftKey) {
        hardDropLocked = false;
    }
    // Also unlock if either Shift or ArrowDown is released
    if (event.key === 'Shift' || event.key === 'ArrowDown') {
        hardDropLocked = false;
    }
});

// Prevent arrow keys and space bar from scrolling the page only during gameplay
window.addEventListener('keydown', (event) => {
    // Only prevent default if the game is active (not game over and not paused)
    if (typeof gameOver !== "undefined" && !gameOver && typeof gamePaused !== "undefined" && !gamePaused) {
        // Only prevent default for game control keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(event.key)) {
            event.preventDefault();
        }
    }
});

// Mobile controls
const moveLeftButton = document.getElementById('move-left');
const rotateButton = document.getElementById('rotate');
const moveRightButton = document.getElementById('move-right');
const moveDownButton = document.getElementById('move-down');

if (moveLeftButton) {
    moveLeftButton.addEventListener('click', () => {
        if (typeof gameOver !== "undefined" && gameOver) return;
        if (typeof piece !== "undefined" && piece.canMoveLeft && piece.canMoveLeft(board)) {
            piece.moveLeft();
            if (typeof updateScore === "function") updateScore();
        }
    });
}

if (rotateButton) {
    rotateButton.addEventListener('click', () => {
        if (typeof gameOver !== "undefined" && gameOver) return;
        if (typeof piece !== "undefined" && piece.rotate) {
            piece.rotate(board);
            if (board.collides(piece) && piece.undoRotate) {
                piece.undoRotate();
            }
            if (typeof updateScore === "function") updateScore();
        }
    });
}

if (moveRightButton) {
    moveRightButton.addEventListener('click', () => {
        if (typeof gameOver !== "undefined" && gameOver) return;
        if (typeof piece !== "undefined" && piece.canMoveRight && piece.canMoveRight(board)) {
            piece.moveRight();
            if (typeof updateScore === "function") updateScore();
        }
    });
}

if (moveDownButton) {
    moveDownButton.addEventListener('click', () => {
        if (typeof gameOver !== "undefined" && gameOver) return;
        if (typeof hardDropPiece === "function") {
            hardDropPiece();
            if (typeof updateScore === "function") updateScore();
        }
    });
}

// Fullscreen toggle
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
