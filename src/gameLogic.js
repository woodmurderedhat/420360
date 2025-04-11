import { score, level, dropInterval, resetGameState, heldPiece } from './gameState.js';
import { updateScore, updateLevel, updateGameInfo } from './gameUI.js';
import Board from './board.js';
import Piece from './piece.js';

export let piece;
export const board = new Board();
export let nextPiece;
export let canHold = true;

export function spawnPiece() {
    piece = nextPiece || new Piece();
    nextPiece = new Piece();
    piece.position = { x: Math.floor(board.columns / 2) - 1, y: 0 }; // Center the piece

    if (board.collides(piece)) {
        handleGameOver();
    }
    canHold = true;
}

export function initializeGame() {
    resetGameState();
    board.reset();
    nextPiece = new Piece();
    spawnPiece();
    updateScore();
    updateLevel();
    updateGameInfo('Game Initialized');
}

export function holdPiece() {
    if (!canHold) return;

    if (heldPiece) {
        // Swap current piece with held piece
        let tempPiece = piece;
        piece = heldPiece;
        heldPiece = tempPiece;
        piece.position = { x: 3, y: 0 }; // Reset position
    } else {
        // Hold current piece and spawn a new piece
        heldPiece = piece;
        spawnPiece();
    }
    canHold = false;
}
