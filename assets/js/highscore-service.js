/**
 * Global Highscore Service for 420360
 * Provides global leaderboard functionality using Supabase as backend
 * Maintains backward compatibility with localStorage
 */

class HighscoreService {
    constructor() {
        // Supabase configuration
        this.supabaseUrl = 'https://lcjlvfvltaaayeruvtbw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjamx2ZnZsdGFhYXllcnV2dGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI3MjUsImV4cCI6MjA3MzAwODcyNX0.GBSvJFoQ63sAlou5HRpbP22gU8A5Y5i0ZfwKBYwje6Y';
        this.tableName = 'highscores';
        this.initialized = false;
        this.fallbackMode = true; // Start in fallback mode, switch to online if available
        this.supabase = null;
        
        // Cache for reducing API calls
        this.scoreCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Supabase client
            if (typeof window.supabase !== 'undefined') {
                this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
                
                // Test database connection by trying to select from the table
                const { data, error } = await this.supabase
                    .from(this.tableName)
                    .select('id')
                    .limit(1);
                
                if (error) {
                    console.warn('HighscoreService: Database test failed, using localStorage fallback:', error.message);
                    this.fallbackMode = true;
                } else {
                    this.fallbackMode = false;
                    this.initialized = true;
                    console.log('HighscoreService initialized with database connection');
                }
            } else {
                throw new Error('Supabase client not available');
            }
        } catch (error) {
            console.warn('HighscoreService: Failed to initialize database connection, using localStorage fallback:', error.message);
            this.fallbackMode = true;
            this.initialized = true;
        }
    }
    
    /**
     * Submit a score for a game
     * @param {string} gameId - Unique identifier for the game
     * @param {string} playerName - Player name (optional, defaults to 'Anonymous')
     * @param {number|object} score - Score value or score object
     * @param {string} scoreType - Type of score (score, level, wins, etc.)
     * @param {object} metadata - Additional metadata (optional)
     */
    async submitScore(gameId, playerName = 'Anonymous', score, scoreType = 'score', metadata = {}) {
        // Always save to localStorage for immediate feedback and fallback
        this.saveToLocalStorage(gameId, score, scoreType);
        
        if (this.fallbackMode) {
            return { success: true, source: 'localStorage' };
        }
        
        try {
            const scoreEntry = {
                game_id: gameId,
                player_name: playerName.substring(0, 20), // Limit name length
                score_value: this.normalizeScore(score, scoreType),
                score_type: scoreType,
                raw_score: JSON.stringify(score),
                metadata: JSON.stringify(metadata),
                timestamp: new Date().toISOString(),
                session_id: this.getSessionId()
            };
            
            // Submit to Supabase database
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert([scoreEntry]);
            
            if (error) {
                console.warn('Failed to submit to database:', error.message);
                // Fall back to localStorage simulation for this submission
                this.saveToGlobalStorage(scoreEntry);
                return { success: true, source: 'localStorage_fallback' };
            }
            
            // Clear cache to force refresh
            this.scoreCache.clear();
            
            return { success: true, source: 'database' };
        } catch (error) {
            console.warn('Failed to submit to global leaderboard:', error);
            // Fall back to localStorage simulation
            this.saveToGlobalStorage(scoreEntry);
            return { success: true, source: 'localStorage_fallback' };
        }
    }
    
    /**
     * Get leaderboard for a specific game
     * @param {string} gameId - Game identifier
     * @param {number} limit - Number of entries to return
     * @param {string} scoreType - Score type filter
     */
    async getLeaderboard(gameId, limit = 10, scoreType = null) {
        const cacheKey = `${gameId}_${limit}_${scoreType}`;
        
        // Check cache first
        if (this.scoreCache.has(cacheKey) && 
            Date.now() - this.lastCacheUpdate < this.cacheTimeout) {
            return this.scoreCache.get(cacheKey);
        }
        
        if (this.fallbackMode) {
            return this.getLocalLeaderboard(gameId, limit);
        }
        
        try {
            // Query Supabase for game-specific leaderboard
            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('game_id', gameId)
                .order('score_value', { ascending: false })
                .limit(limit);
            
            if (scoreType) {
                query = query.eq('score_type', scoreType);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.warn('Failed to fetch leaderboard from database:', error.message);
                return this.getFromGlobalStorage(gameId, limit, scoreType);
            }
            
            this.scoreCache.set(cacheKey, data);
            this.lastCacheUpdate = Date.now();
            return data;
        } catch (error) {
            console.warn('Failed to fetch global leaderboard:', error);
            return this.getLocalLeaderboard(gameId, limit);
        }
    }
    
    /**
     * Get global leaderboard across all games
     */
    async getGlobalLeaderboard(limit = 20) {
        if (this.fallbackMode) {
            return this.getAllLocalScores(limit);
        }
        
        try {
            // Query all games from Supabase, ordered by score
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('score_value', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.warn('Failed to fetch global leaderboard from database:', error.message);
                return this.getAllGlobalScores(limit);
            }
            
            // Add game names for display
            const gameNameMap = {
                'snake': 'Snake',
                'breakout': 'Breakout',
                'pong': 'Pong',
                'flappy-bird': 'Flappy Bird',
                'space-invaders': 'Space Invaders',
                'asteroids': 'Asteroids',
                'infinite-jumper': 'Infinite Jumper',
                'memory': 'Memory Cards',
                'neon-simon': 'Neon Simon',
                'pixel-rain': 'Pixel Rain',
                'glitch-maze': 'Glitch Maze',
                'tarot-tetromino': 'Tarot Tetromino',
                'pixel-crush': 'Pixel Crush'
            };
            
            return data.map(score => ({
                ...score,
                game_name: gameNameMap[score.game_id] || score.game_id,
                source: 'database'
            }));
        } catch (error) {
            console.warn('Failed to fetch global leaderboard:', error);
            return this.getAllLocalScores(limit);
        }
    }
    
    // Helper methods
    normalizeScore(score, scoreType) {
        if (typeof score === 'number') return score;
        if (typeof score === 'object') {
            // Handle different score object types
            if (scoreType === 'leaderboard' && Array.isArray(score)) {
                return score.length > 0 ? score[0].score : 0;
            }
            if (score.total !== undefined) return score.total;
            if (score.score !== undefined) return score.score;
        }
        return parseInt(score) || 0;
    }
    
    saveToLocalStorage(gameId, score, scoreType) {
        const key = this.getLocalStorageKey(gameId, scoreType);
        const currentBest = localStorage.getItem(key);
        const normalizedScore = this.normalizeScore(score, scoreType);
        
        if (!currentBest || normalizedScore > parseInt(currentBest)) {
            localStorage.setItem(key, normalizedScore.toString());
        }
    }
    
    getLocalStorageKey(gameId, scoreType) {
        // Map to existing localStorage keys for backward compatibility
        const keyMap = {
            'snake': 'snakeHighScore',
            'breakout': 'breakoutHighScore',
            'pong': 'pongBestWins',
            'flappy-bird': 'flappyBirdHighScore',
            'space-invaders': 'spaceInvadersHighScore',
            'asteroids': 'asteroidsHighScore',
            'infinite-jumper': 'infiniteJumperHighScore',
            'memory': 'memoryBestScore',
            'neon-simon': 'neonSimonBest',
            'pixel-rain': 'pixelRainBest',
            'glitch-maze': 'glitchMazeBestLevel',
            'tarot-tetromino': 'tetrisLeaderboard',
            'pixel-crush': 'pixelCrushProgress'
        };
        
        return keyMap[gameId] || `${gameId}HighScore`;
    }
    
    getLocalLeaderboard(gameId, limit) {
        const key = this.getLocalStorageKey(gameId);
        const score = localStorage.getItem(key);
        if (!score) return [];
        
        return [{
            player_name: 'Local Player',
            score_value: parseInt(score),
            timestamp: new Date().toISOString(),
            source: 'local'
        }];
    }
    
    getAllLocalScores(limit) {
        const scores = [];
        const gameMap = {
            'snakeHighScore': 'Snake',
            'breakoutHighScore': 'Breakout',
            'pongBestWins': 'Pong',
            'flappyBirdHighScore': 'Flappy Bird',
            'spaceInvadersHighScore': 'Space Invaders',
            'asteroidsHighScore': 'Asteroids',
            'infiniteJumperHighScore': 'Infinite Jumper',
            'memoryBestScore': 'Memory Cards',
            'neonSimonBest': 'Neon Simon',
            'pixelRainBest': 'Pixel Rain'
        };
        
        for (const [key, gameName] of Object.entries(gameMap)) {
            const score = localStorage.getItem(key);
            if (score) {
                scores.push({
                    game_name: gameName,
                    player_name: 'Local Player',
                    score_value: parseInt(score),
                    timestamp: new Date().toISOString(),
                    source: 'local'
                });
            }
        }
        
        return scores.sort((a, b) => b.score_value - a.score_value).slice(0, limit);
    }
    
    // Simulated global storage for demo (in real implementation, these would be Supabase calls)
    saveToGlobalStorage(scoreEntry) {
        const globalScores = JSON.parse(localStorage.getItem('globalHighscores') || '[]');
        globalScores.push(scoreEntry);
        
        // Keep only top 1000 scores to avoid localStorage bloat
        globalScores.sort((a, b) => b.score_value - a.score_value);
        localStorage.setItem('globalHighscores', JSON.stringify(globalScores.slice(0, 1000)));
    }
    
    getFromGlobalStorage(gameId, limit, scoreType) {
        const globalScores = JSON.parse(localStorage.getItem('globalHighscores') || '[]');
        return globalScores
            .filter(s => s.game_id === gameId && (!scoreType || s.score_type === scoreType))
            .sort((a, b) => b.score_value - a.score_value)
            .slice(0, limit);
    }
    
    getAllGlobalScores(limit) {
        const globalScores = JSON.parse(localStorage.getItem('globalHighscores') || '[]');
        return globalScores
            .sort((a, b) => b.score_value - a.score_value)
            .slice(0, limit);
    }
    
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        return this.sessionId;
    }
}

// Create global instance
window.HighscoreService = new HighscoreService();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighscoreService;
}
