// Manages the overall game state
export let score = 0;
export let level = 1;
export let gameOver = false;
export let lastTime = 0;
export let dropInterval = 500; // Default speed (milliseconds)
export let linesClearedThisLevel = 0;
export const linesToLevelUp = 10;
export let combo = 0;
export let heldPiece = null;

export function resetGameState() {
    score = 0;
    level = 1;
    linesClearedThisLevel = 0;
    dropInterval = 500;
    gameOver = false;
    combo = 0;
    heldPiece = null;
}