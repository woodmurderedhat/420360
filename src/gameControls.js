import { piece, board, spawnPiece, holdPiece } from './gameLogic.js';
import { updateScore } from './gameUI.js';

// Add event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

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