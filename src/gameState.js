/**
 * Game State and UI Helpers for Tarot Tetris.
 * Attaches state variables and helper functions for score, level, combo, and UI updates to window.TarotTetris.
 */
(function(exports) {
    exports.score = 0;
    exports.level = 1;
    exports.combo = 0;
    exports.dropInterval = 500;
    exports.linesClearedThisLevel = 0;
    exports.linesToLevelUp = 10;

    exports.setGameSpeed = function(speed) {
        exports.dropInterval = speed;
    };

    exports.updateScore = function(scoreElement) {
        if (scoreElement) {
            scoreElement.textContent = `Score: ${exports.score}`;
        } else {
            console.warn("Score element not found.");
        }
    };

    exports.updateGameInfo = function(gameInfoElement, info) {
        if (gameInfoElement) {
            gameInfoElement.textContent = `Game Info: ${info}`;
            gameInfoElement.setAttribute('aria-live', 'polite'); // Announce updates for screen readers
        } else {
            console.warn("Game info element not found.");
        }
    };

    exports.updateLevel = function(levelElement) {
        if (levelElement) {
            levelElement.textContent = `Level: ${exports.level}`;
        } else {
            console.warn("Level element not found.");
        }
    };
})(window.TarotTetris = window.TarotTetris || {});

// Global updateGameInfo for tarot.js and other scripts
window.updateGameInfo = function(message) {
    var infoElem = document.getElementById('game-info');
    if (infoElem) {
        infoElem.textContent = message;
        infoElem.classList.add('highlight');
        setTimeout(() => infoElem.classList.remove('highlight'), 500);
    } else {
        console.warn("Game info element not found.");
    }
};

// Global updateScore for tarot.js and other scripts
window.updateScore = function() {
    var scoreElem = document.getElementById('score');
    if (scoreElem) {
        scoreElem.textContent = "Score: " + (window.TarotTetris && window.TarotTetris.score !== undefined ? window.TarotTetris.score : 0);
        scoreElem.classList.add('highlight');
        setTimeout(() => scoreElem.classList.remove('highlight'), 500);
    } else {
        console.warn("Score element not found.");
    }
};
