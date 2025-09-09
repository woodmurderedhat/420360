/**
 * Global Leaderboard Component for 420360
 * Displays highscores from all games in a retro-styled interface
 */

class GlobalLeaderboard {
    constructor(container) {
        this.container = container;
        this.refreshInterval = null;
        this.currentView = 'global'; // 'global' or specific game
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.bindEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="leaderboard-wrapper">
                <div class="leaderboard-header">
                    <h2>🏆 GLOBAL HIGHSCORES 🏆</h2>
                    <div class="leaderboard-controls">
                        <select id="gameFilter" class="retro-select">
                            <option value="global">ALL GAMES</option>
                            <option value="snake">SNAKE</option>
                            <option value="breakout">BREAKOUT</option>
                            <option value="pong">PONG</option>
                            <option value="flappy-bird">FLAPPY BIRD</option>
                            <option value="space-invaders">SPACE INVADERS</option>
                            <option value="asteroids">ASTEROIDS</option>
                            <option value="infinite-jumper">INFINITE JUMPER</option>
                            <option value="memory">MEMORY CARDS</option>
                            <option value="neon-simon">NEON SIMON</option>
                            <option value="pixel-rain">PIXEL RAIN</option>
                            <option value="glitch-maze">GLITCH MAZE</option>
                            <option value="tarot-tetromino">TAROT TETROMINO</option>
                            <option value="pixel-crush">PIXEL CRUSH</option>
                        </select>
                        <button id="refreshBtn" class="retro-btn">🔄</button>
                        <button id="closeBtn" class="retro-btn">✕</button>
                    </div>
                </div>
                <div class="leaderboard-content">
                    <div id="loadingMsg" class="loading">LOADING SCORES...</div>
                    <div id="scoresContainer" class="scores-list" style="display: none;">
                        <!-- Scores will be populated here -->
                    </div>
                    <div id="noScoresMsg" class="no-scores" style="display: none;">
                        NO SCORES RECORDED YET<br>
                        <small>Start playing to see your scores here!</small>
                    </div>
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('leaderboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'leaderboard-styles';
        style.textContent = `
            .leaderboard-wrapper {
                background: var(--bg, #1a1f1a);
                border: 4px solid var(--secondary, #7b5e8b);
                box-shadow: 
                    0 0 0 4px var(--primary, #4a8c3a),
                    8px 8px 0 0 var(--highlight, #8fbc8f),
                    0 0 0 8px #000;
                color: var(--text, #e8f5e8);
                font-family: 'Press Start 2P', 'Courier New', monospace;
                max-width: 600px;
                margin: 0 auto;
                font-size: 10px;
            }
            
            .leaderboard-header {
                background: var(--secondary, #7b5e8b);
                color: var(--bg, #1a1f1a);
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 4px solid var(--primary, #4a8c3a);
            }
            
            .leaderboard-header h2 {
                margin: 0;
                font-size: 12px;
                color: var(--highlight, #8fbc8f);
                text-shadow: 2px 2px 0 var(--primary, #4a8c3a);
            }
            
            .leaderboard-controls {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            
            .retro-select {
                background: var(--bg, #1a1f1a);
                color: var(--text, #e8f5e8);
                border: 2px solid var(--primary, #4a8c3a);
                font-family: inherit;
                font-size: 8px;
                padding: 4px 6px;
                cursor: pointer;
            }
            
            .retro-btn {
                background: var(--bg, #1a1f1a);
                color: var(--highlight, #8fbc8f);
                border: 2px solid var(--primary, #4a8c3a);
                font-family: inherit;
                font-size: 10px;
                padding: 4px 8px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .retro-btn:hover {
                background: var(--primary, #4a8c3a);
                color: var(--bg, #1a1f1a);
            }
            
            .leaderboard-content {
                padding: 16px 12px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .loading, .no-scores {
                text-align: center;
                color: var(--secondary, #7b5e8b);
                padding: 20px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            
            .scores-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .score-entry {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: linear-gradient(90deg, var(--bg, #1a1f1a), transparent);
                border-left: 3px solid var(--primary, #4a8c3a);
                position: relative;
            }
            
            .score-entry:nth-child(1) { border-left-color: #ffd700; }
            .score-entry:nth-child(2) { border-left-color: #c0c0c0; }
            .score-entry:nth-child(3) { border-left-color: #cd7f32; }
            
            .score-rank {
                color: var(--highlight, #8fbc8f);
                font-weight: bold;
                min-width: 20px;
            }
            
            .score-info {
                flex: 1;
                margin: 0 12px;
            }
            
            .score-player {
                color: var(--text, #e8f5e8);
                margin-bottom: 2px;
            }
            
            .score-game {
                color: var(--secondary, #7b5e8b);
                font-size: 8px;
            }
            
            .score-value {
                color: var(--primary, #4a8c3a);
                font-weight: bold;
                text-shadow: 1px 1px 0 var(--secondary, #7b5e8b);
            }
            
            .score-source {
                font-size: 6px;
                color: var(--secondary, #7b5e8b);
                opacity: 0.7;
                position: absolute;
                bottom: 2px;
                right: 4px;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 600px) {
                .leaderboard-wrapper {
                    margin: 0 10px;
                    font-size: 8px;
                }
                
                .leaderboard-header {
                    flex-direction: column;
                    gap: 8px;
                    padding: 6px 8px;
                }
                
                .score-entry {
                    padding: 6px 8px;
                }
                
                .score-info {
                    margin: 0 8px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    bindEvents() {
        const gameFilter = this.container.querySelector('#gameFilter');
        const refreshBtn = this.container.querySelector('#refreshBtn');
        const closeBtn = this.container.querySelector('#closeBtn');
        
        gameFilter?.addEventListener('change', (e) => {
            this.currentView = e.target.value;
            this.loadScores();
        });
        
        refreshBtn?.addEventListener('click', () => {
            this.loadScores();
        });
        
        closeBtn?.addEventListener('click', () => {
            this.hide();
        });
    }
    
    async loadScores() {
        const loadingMsg = this.container.querySelector('#loadingMsg');
        const scoresContainer = this.container.querySelector('#scoresContainer');
        const noScoresMsg = this.container.querySelector('#noScoresMsg');
        
        loadingMsg.style.display = 'block';
        scoresContainer.style.display = 'none';
        noScoresMsg.style.display = 'none';
        
        try {
            let scores;
            if (this.currentView === 'global') {
                scores = await window.HighscoreService.getGlobalLeaderboard(20);
            } else {
                scores = await window.HighscoreService.getLeaderboard(this.currentView, 10);
            }
            
            this.displayScores(scores);
        } catch (error) {
            console.error('Failed to load scores:', error);
            this.showError();
        }
    }
    
    displayScores(scores) {
        const loadingMsg = this.container.querySelector('#loadingMsg');
        const scoresContainer = this.container.querySelector('#scoresContainer');
        const noScoresMsg = this.container.querySelector('#noScoresMsg');
        
        loadingMsg.style.display = 'none';
        
        if (!scores || scores.length === 0) {
            noScoresMsg.style.display = 'block';
            return;
        }
        
        scoresContainer.style.display = 'block';
        scoresContainer.innerHTML = scores.map((score, index) => 
            this.renderScoreEntry(score, index + 1)
        ).join('');
    }
    
    renderScoreEntry(score, rank) {
        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        const gameDisplay = this.currentView === 'global' ? 
            `<div class="score-game">${score.game_name || score.game_id || 'Unknown Game'}</div>` : '';
        
        return `
            <div class="score-entry">
                <div class="score-rank">${rankEmoji}${rank}</div>
                <div class="score-info">
                    <div class="score-player">${this.escapeHtml(score.player_name || 'Anonymous')}</div>
                    ${gameDisplay}
                </div>
                <div class="score-value">${this.formatScore(score.score_value)}</div>
                <div class="score-source">${score.source === 'local' ? 'LOCAL' : 'GLOBAL'}</div>
            </div>
        `;
    }
    
    formatScore(score) {
        if (score >= 1000000) {
            return (score / 1000000).toFixed(1) + 'M';
        } else if (score >= 1000) {
            return (score / 1000).toFixed(1) + 'K';
        }
        return score.toString();
    }
    
    escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function(m) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
        });
    }
    
    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.loadScores();
        
        // Auto-refresh every 30 seconds while visible
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => {
            if (this.isVisible) {
                this.loadScores();
            }
        }, 30000);
    }
    
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    showError() {
        const scoresContainer = this.container.querySelector('#scoresContainer');
        const loadingMsg = this.container.querySelector('#loadingMsg');
        const noScoresMsg = this.container.querySelector('#noScoresMsg');
        
        loadingMsg.style.display = 'none';
        scoresContainer.style.display = 'none';
        noScoresMsg.innerHTML = 'ERROR LOADING SCORES<br><small>Check connection and try again</small>';
        noScoresMsg.style.display = 'block';
    }
}

// Export for use
window.GlobalLeaderboard = GlobalLeaderboard;