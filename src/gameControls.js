import { piece, board, spawnPiece, holdPiece } from './gameLogic.js';
import { updateScore } from './gameUI.js';
import { tarotEffects, initializeTarotDeck } from './tarot.js';

// Tarot deck state
let tarotDeck = initializeTarotDeck();

// Add event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (typeof gameOver !== "undefined" && gameOver) return;

    // Tarot card activation: Number keys 1-4 (for available cards)
    if (/^[1-4]$/.test(event.key)) {
        const tarotNames = Object.keys(tarotEffects);
        const idx = parseInt(event.key, 10) - 1;
        if (tarotNames[idx]) {
            const tarotName = tarotNames[idx];
            if (tarotEffects[tarotName] && typeof tarotEffects[tarotName].effect === "function") {
                tarotEffects[tarotName].effect();
            }
        }
        return;
    }

    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (piece.canMoveDown(board)) {
                piece.moveDown();
            } else {
                board.mergePiece(piece);
                spawnPiece();
            }
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            piece.rotate(board);
            break;
        case 'Shift':
            holdPiece();
            break;
        default:
            break;
    }

    // Redraw the game board and piece after any movement
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    piece.draw(context);
});

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});
