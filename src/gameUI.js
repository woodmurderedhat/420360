import { score, level } from './gameState.js';

export function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    } else {
        console.warn("Score element not found.");
    }
}

export function updateLevel() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = `Level: ${level}`;
    } else {
        console.warn("Level element not found.");
    }
}

export function updateGameInfo(info) {
    const gameInfoElement = document.getElementById('game-info');
    if (gameInfoElement) {
        gameInfoElement.textContent = `Game Info: ${info}`;
        gameInfoElement.setAttribute('aria-live', 'polite');
    } else {
        console.warn("Game info element not found.");
    }
}