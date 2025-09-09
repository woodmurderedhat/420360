/**
 * Easy integration helper for 420360 Global Highscore System
 * Add this to any game to automatically submit scores to the global leaderboard
 */

(function() {
    'use strict';
    
    // Simple wrapper to submit scores to the global system
    window.SubmitHighscore = function(gameId, score, scoreType = 'score', playerName = 'Player') {
        try {
            // Check if we're running inside the main site (in an iframe)
            if (window.parent && window.parent.HighscoreService) {
                window.parent.HighscoreService.submitScore(gameId, playerName, score, scoreType);
                return true;
            }
            
            // Fallback: check if running standalone and HighscoreService is available
            if (window.HighscoreService) {
                window.HighscoreService.submitScore(gameId, playerName, score, scoreType);
                return true;
            }
            
            // If neither is available, just log for debugging
            console.log(`Would submit score for ${gameId}: ${score} (${scoreType})`);
            return false;
        } catch (error) {
            console.warn('Failed to submit highscore:', error);
            return false;
        }
    };
    
    // Helper function to get the game ID from the current URL
    window.GetGameId = function() {
        const path = window.location.pathname;
        const segments = path.split('/');
        
        // Try to extract game ID from URL
        if (segments.length >= 2) {
            const gameDir = segments[segments.length - 2];
            if (gameDir && gameDir !== 'games') {
                return gameDir;
            }
        }
        
        // Fallback to detecting from page title or URL
        const title = document.title.toLowerCase();
        if (title.includes('snake')) return 'snake';
        if (title.includes('breakout')) return 'breakout';
        if (title.includes('pong')) return 'pong';
        if (title.includes('flappy')) return 'flappy-bird';
        if (title.includes('space') && title.includes('invaders')) return 'space-invaders';
        if (title.includes('asteroids')) return 'asteroids';
        if (title.includes('tetris') || title.includes('tetromino')) return 'tarot-tetromino';
        if (title.includes('memory')) return 'memory';
        if (title.includes('simon')) return 'neon-simon';
        if (title.includes('maze')) return 'glitch-maze';
        if (title.includes('rain')) return 'pixel-rain';
        if (title.includes('jumper')) return 'infinite-jumper';
        if (title.includes('crush')) return 'pixel-crush';
        
        return 'unknown-game';
    };
    
    // Auto-integration for common localStorage patterns
    window.AutoIntegrateHighscores = function(config = {}) {
        const gameId = config.gameId || window.GetGameId();
        
        // Common localStorage keys to monitor
        const commonKeys = [
            'snakeHighScore',
            'breakoutHighScore', 
            'pongBestWins',
            'flappyBirdHighScore',
            'spaceInvadersHighScore',
            'asteroidsHighScore',
            'infiniteJumperHighScore',
            'memoryBestScore',
            'neonSimonBest',
            'pixelRainBest',
            'glitchMazeBestLevel'
        ];
        
        // Monitor localStorage changes
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(this, arguments);
            
            // Check if this is a highscore update
            if (commonKeys.includes(key) || key.includes('HighScore') || key.includes('Best')) {
                const score = parseInt(value);
                if (!isNaN(score) && score > 0) {
                    // Determine score type
                    let scoreType = 'score';
                    if (key.includes('Level')) scoreType = 'level';
                    if (key.includes('Wins')) scoreType = 'wins';
                    
                    // Submit to global system
                    setTimeout(() => {
                        window.SubmitHighscore(gameId, score, scoreType);
                    }, 100);
                }
            }
            
            return result;
        };
        
        console.log(`Auto-integration enabled for ${gameId}`);
    };
    
})();

// Auto-enable for games that include this script
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts have loaded
    setTimeout(() => {
        if (window.location.pathname.includes('/games/')) {
            window.AutoIntegrateHighscores();
        }
    }, 500);
});