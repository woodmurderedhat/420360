/**
 * Touch Controls for Tarot Tetromino
 * This file handles touch gestures for mobile play, including swipes and taps.
 */

// Touch control state
const touchState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    lastMoveTime: 0,
    moveThreshold: 30, // Minimum distance to trigger a move
    swipeThreshold: 80, // Minimum distance to trigger a swipe
    tapThreshold: 10, // Maximum distance for a tap
    doubleTapThreshold: 300, // Maximum time between taps for double tap
    lastTapTime: 0,
    moveDelay: 100, // Delay between moves when holding
    isMoving: false,
    moveDirection: null,
    moveInterval: null
};

// Initialize touch controls
function initTouchControls() {
    const swipeOverlay = document.getElementById('swipe-overlay');
    const canvas = document.getElementById('tetris');

    if (!swipeOverlay || !canvas) {
        console.warn('Touch controls: Required elements not found');
        return;
    }

    // Make swipe overlay active for touch events
    swipeOverlay.style.pointerEvents = 'auto';

    // Touch start handler
    swipeOverlay.addEventListener('touchstart', handleTouchStart, { passive: false });

    // Touch move handler
    swipeOverlay.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Touch end handler
    swipeOverlay.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Add mobile button handlers
    setupMobileButtons();
}

// Handle touch start
function handleTouchStart(event) {
    // Prevent default to avoid scrolling
    event.preventDefault();

    if (typeof gameOver !== 'undefined' && gameOver) return;
    if (typeof gamePaused !== 'undefined' && gamePaused) return;

    const touch = event.touches[0];
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.startTime = Date.now();
    touchState.isMoving = false;
    touchState.moveDirection = null;

    // Clear any existing move interval
    if (touchState.moveInterval) {
        clearInterval(touchState.moveInterval);
        touchState.moveInterval = null;
    }
}

// Handle touch move
function handleTouchMove(event) {
    // Prevent default to avoid scrolling
    event.preventDefault();

    if (typeof gameOver !== 'undefined' && gameOver) return;
    if (typeof gamePaused !== 'undefined' && gamePaused) return;
    if (!touchState.startTime) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    const currentTime = Date.now();

    // Check if we've moved enough to trigger a move
    if (!touchState.isMoving &&
        (Math.abs(deltaX) > touchState.moveThreshold ||
         Math.abs(deltaY) > touchState.moveThreshold)) {

        touchState.isMoving = true;

        // Determine move direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal move
            touchState.moveDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            // Vertical move
            touchState.moveDirection = deltaY > 0 ? 'down' : 'up';
        }

        // Execute the move
        executeMove(touchState.moveDirection);

        // Set up continuous movement if holding
        touchState.lastMoveTime = currentTime;
        touchState.moveInterval = setInterval(() => {
            if (touchState.isMoving && touchState.moveDirection) {
                executeMove(touchState.moveDirection);
            }
        }, touchState.moveDelay);
    }
}

// Handle touch end
function handleTouchEnd(event) {
    // Prevent default
    event.preventDefault();

    if (typeof gameOver !== 'undefined' && gameOver) return;
    if (typeof gamePaused !== 'undefined' && gamePaused) return;

    // Clear move interval
    if (touchState.moveInterval) {
        clearInterval(touchState.moveInterval);
        touchState.moveInterval = null;
    }

    // If we weren't moving, check for tap or swipe
    if (!touchState.isMoving) {
        const deltaTime = Date.now() - touchState.startTime;

        // Check for double tap
        if (Date.now() - touchState.lastTapTime < touchState.doubleTapThreshold) {
            // Double tap - hard drop
            if (typeof hardDropPiece === 'function') {
                hardDropPiece();
            }
            touchState.lastTapTime = 0; // Reset to prevent triple tap
        } else {
            // Single tap - rotate
            if (typeof piece !== 'undefined' && piece.rotate) {
                const rotated = piece.rotate(board);
                // No need to check for collision and undo rotation
                // as the rotate method now handles wall kicks and returns false if rotation fails

                // Track if the last move was a rotation for T-spin detection
                if (typeof lastMoveWasRotation !== 'undefined') {
                    lastMoveWasRotation = rotated;
                }

                // Check for T-spin if rotation was successful
                if (rotated && piece.type === 'T' && TarotTetris.tSpin && typeof TarotTetris.tSpin.detectTSpin === 'function') {
                    if (typeof tSpinDetected !== 'undefined') {
                        tSpinDetected = TarotTetris.tSpin.detectTSpin(piece, board, true);
                    }
                }
            }
            touchState.lastTapTime = Date.now();
        }
    } else {
        // Check for swipe
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        const deltaTime = Date.now() - touchState.startTime;

        // Fast swipe down = hard drop
        if (deltaY > touchState.swipeThreshold && deltaTime < 300) {
            if (typeof hardDropPiece === 'function') {
                hardDropPiece();
            }
        }

        // Fast swipe up = hold piece
        if (deltaY < -touchState.swipeThreshold && deltaTime < 300) {
            if (typeof TarotTetris.holdPiece === 'function') {
                // Create state object for holdPiece
                const holdState = {
                    heldPieces: window.heldPieces || [],
                    piece: window.piece,
                    canHold: window.canHold,
                    spawnPiece: window.spawnPiece,
                    updateHoldUI: function() {
                        if (typeof TarotTetris.updateHoldUI === 'function') {
                            TarotTetris.updateHoldUI(window.heldPieces);
                        }
                    }
                };
                TarotTetris.holdPiece(holdState);
                // Update global variables
                window.heldPieces = holdState.heldPieces;
                window.piece = holdState.piece;
                window.canHold = holdState.canHold;
            }
        }
    }

    // Reset touch state
    touchState.isMoving = false;
    touchState.moveDirection = null;
    touchState.startTime = 0;
}

// Execute move based on direction
function executeMove(direction) {
    if (typeof piece === 'undefined') return;

    switch (direction) {
        case 'left':
            if (piece.canMoveLeft && piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'right':
            if (piece.canMoveRight && piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'down':
            if (piece.canMoveDown && piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'up':
            if (piece.rotate) {
                const rotated = piece.rotate(board);
                // No need to check for collision and undo rotation
                // as the rotate method now handles wall kicks and returns false if rotation fails

                // Track if the last move was a rotation for T-spin detection
                if (typeof lastMoveWasRotation !== 'undefined') {
                    lastMoveWasRotation = rotated;
                }

                // Check for T-spin if rotation was successful
                if (rotated && piece.type === 'T' && TarotTetris.tSpin && typeof TarotTetris.tSpin.detectTSpin === 'function') {
                    if (typeof tSpinDetected !== 'undefined') {
                        tSpinDetected = TarotTetris.tSpin.detectTSpin(piece, board, true);
                    }
                }
            }
            break;
    }
}

// Setup mobile button handlers
function setupMobileButtons() {
    // Hold piece button
    const holdButton = document.getElementById('hold-piece');
    if (holdButton) {
        holdButton.addEventListener('click', () => {
            if (typeof TarotTetris.holdPiece === 'function') {
                // Create state object for holdPiece
                const holdState = {
                    heldPieces: window.heldPieces || [],
                    piece: window.piece,
                    canHold: window.canHold,
                    spawnPiece: window.spawnPiece,
                    updateHoldUI: function() {
                        if (typeof TarotTetris.updateHoldUI === 'function') {
                            TarotTetris.updateHoldUI(window.heldPieces);
                        }
                    }
                };
                TarotTetris.holdPiece(holdState);
                // Update global variables
                window.heldPieces = holdState.heldPieces;
                window.piece = holdState.piece;
                window.canHold = holdState.canHold;
            }
        });
    }

    // Rotate button
    const rotateButton = document.getElementById('rotate');
    if (rotateButton) {
        rotateButton.addEventListener('click', () => {
            if (typeof piece !== 'undefined' && piece.rotate) {
                const rotated = piece.rotate(board);

                // Track if the last move was a rotation for T-spin detection
                if (typeof lastMoveWasRotation !== 'undefined') {
                    lastMoveWasRotation = rotated;
                }

                // Check for T-spin if rotation was successful
                if (rotated && piece.type === 'T' && TarotTetris.tSpin &&
                    typeof TarotTetris.tSpin.detectTSpin === 'function') {
                    if (typeof tSpinDetected !== 'undefined') {
                        tSpinDetected = TarotTetris.tSpin.detectTSpin(piece, board, true);
                    }
                }
            }
        });
    }

    // Hard drop button
    const hardDropButton = document.getElementById('hard-drop');
    if (hardDropButton) {
        hardDropButton.addEventListener('click', () => {
            if (typeof hardDropPiece === 'function') {
                hardDropPiece();
            }
        });
    }

    // Move left button
    const moveLeftButton = document.getElementById('move-left');
    if (moveLeftButton) {
        moveLeftButton.addEventListener('click', () => {
            if (typeof piece !== 'undefined' && piece.canMoveLeft && piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
        });
    }

    // Move right button
    const moveRightButton = document.getElementById('move-right');
    if (moveRightButton) {
        moveRightButton.addEventListener('click', () => {
            if (typeof piece !== 'undefined' && piece.canMoveRight && piece.canMoveRight(board)) {
                piece.moveRight();
            }
        });
    }

    // Move down button
    const moveDownButton = document.getElementById('move-down');
    if (moveDownButton) {
        moveDownButton.addEventListener('click', () => {
            if (typeof piece !== 'undefined' && piece.canMoveDown && piece.canMoveDown(board)) {
                piece.moveDown();
            }
        });
    }

    // Mobile pause button
    const pauseButton = document.getElementById('mobile-pause');
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (typeof togglePause === 'function') {
                togglePause();
            }
        });
    }

    // Mobile objectives button
    const objectivesButton = document.getElementById('mobile-objectives');
    if (objectivesButton) {
        objectivesButton.addEventListener('click', () => {
            if (typeof showObjectivesOverlay === 'function') {
                showObjectivesOverlay();
            }
        });
    }
}

// Initialize touch controls when the DOM is loaded
document.addEventListener('DOMContentLoaded', initTouchControls);

// Export functions to global scope
window.initTouchControls = initTouchControls;
