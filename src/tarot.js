import { score, dropInterval } from './gameState.js';
import { updateScore, updateGameInfo } from './gameUI.js';

export const tarotEffects = {
    "The Fool": {
        effect: () => {
            setGameSpeed(1000);
            setTimeout(() => setGameSpeed(500), 10000);
            updateGameInfo('The Fool slows time, giving you a moment to breathe.');
        },
        description: "Slows down the game speed for 10 seconds."
    },
    "The Magician": {
        effect: () => {
            score *= 2;
            updateScore();
            updateGameInfo('The Magician doubles your score with a wave of magic!');
        },
        description: "Doubles your current score."
    },
    "The High Priestess": {
        effect: () => {
            board.clearRandomRow();
            updateGameInfo('The High Priestess clears a random row, offering a clean slate.');
        },
        description: "Clears a random row on the board."
    },
    "The Empress": {
        effect: () => {
            board.addSolidRow();
            updateGameInfo('The Empress adds a solid row with a gap, testing your adaptability.');
        },
        description: "Adds a solid row with a random gap to the bottom of the board."
    }
    // Add other tarot effects here
};

export function initializeTarotDeck() {
    tarotDeck = Object.keys(tarotEffects);
    console.info("Tarot deck initialized with all available cards.");
}