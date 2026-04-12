/**
 * Tetris.js - Entry point for Tarot Tetromino game
 * This file initializes the game and provides the main entry point.
 */

// Initialize the TarotTetris namespace
window.TarotTetris = window.TarotTetris || {};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if all required elements exist
    const requiredElements = [
        { id: 'tetris', name: 'Game Canvas' },
        { id: 'score', name: 'Score Display' },
        { id: 'level', name: 'Level Display' },
        { id: 'game-info', name: 'Game Info' },
        { id: 'tarot-container', name: 'Tarot Container' },
        { id: 'hold-container', name: 'Hold Container' },
        { id: 'leaderboard', name: 'Leaderboard' }
    ];
    
    let missingElements = [];
    requiredElements.forEach(element => {
        if (!document.getElementById(element.id)) {
            missingElements.push(element.name);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements.join(', '));
    }
    
    // Initialize touch controls if available
    if (typeof initTouchControls === 'function') {
        initTouchControls();
    }
    
    // Create objectives panel if available
    if (typeof createObjectivesPanel === 'function') {
        createObjectivesPanel();
    }
    
    // Show intro overlay if available
    if (typeof showIntroOverlay === 'function') {
        showIntroOverlay();
    }
    
    // Initialize arcade ads if available
    if (typeof initArcadeAds === 'function') {
        initArcadeAds({
            awardScoreBonus: function(bonus) {
                TarotTetris.score += bonus;
                const scoreElement = document.getElementById('score');
                if (scoreElement && typeof TarotTetris.updateScore === 'function') {
                    TarotTetris.updateScore(scoreElement);
                }
            },
            updateScore: function() {
                const scoreElement = document.getElementById('score');
                if (scoreElement && typeof TarotTetris.updateScore === 'function') {
                    TarotTetris.updateScore(scoreElement);
                }
            },
            getAddTarotCardToHand: function() {
                return typeof window.addTarotCardToHand === 'function' ? window.addTarotCardToHand : null;
            }
        });
    }
});
