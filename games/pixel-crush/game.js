/**
 * Game.js - Main game state management and logic for Pixel Crush
 * Handles game flow, scoring, levels, and coordinates between board and UI
 */

(function(window) {
    'use strict';

    const INITIAL_MOVES = 30;
    const LEVEL_TARGETS = [1000, 2500, 5000, 8000, 12000, 18000, 25000, 35000, 50000, 75000];
    const SCORE_MULTIPLIERS = {
        3: 100,  // 3-match base score
        4: 300,  // 4-match
        5: 800,  // 5-match
        6: 1500, // 6-match
        7: 2500, // 7-match
        8: 4000  // 8+ match
    };

    class Game {
        constructor() {
            this.board = null;
            this.ui = null;
            this.canvas = null;
            this.ctx = null;
            
            // Game state
            this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
            this.score = 0;
            this.level = 1;
            this.moves = INITIAL_MOVES;
            this.target = LEVEL_TARGETS[0];
            this.combo = 0;
            this.totalScore = 0;
            
            // Input handling
            this.selectedPixel = null;
            this.isAnimating = false;
            
            // Performance tracking
            this.lastFrameTime = 0;
            this.animationId = null;
            
            // Mobile touch support
            this.touchStartPos = null;
            this.touchEndPos = null;
        }

        init() {
            // Get canvas and context
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                console.error('Canvas not found or 2D context not supported');
                return false;
            }

            // Initialize modules
            this.board = new window.PixelCrushBoard();
            this.ui = new window.PixelCrushUI(this);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved progress
            this.loadProgress();
            
            // Initial render
            this.render();
            
            console.log('Pixel Crush initialized');
            return true;
        }

        setupEventListeners() {
            // Mouse events
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            
            // Touch events for mobile
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
            
            // Game control buttons
            document.getElementById('startGame').addEventListener('click', () => this.startGame());
            document.getElementById('pauseGame').addEventListener('click', () => this.togglePause());
            document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
            document.getElementById('nextLevel').addEventListener('click', () => this.nextLevel());
            document.getElementById('playAgain').addEventListener('click', () => this.resetGame());
            document.getElementById('backToMenu').addEventListener('click', () => this.backToMenu());
            
            // Theme selector
            document.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', (e) => this.changeTheme(e.target.dataset.theme));
            });
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
            
            // Prevent context menu on canvas
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        handleCanvasClick(e) {
            if (this.gameState !== 'playing' || this.isAnimating) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Scale coordinates to canvas size
            const canvasX = (x / rect.width) * this.canvas.width;
            const canvasY = (y / rect.height) * this.canvas.height;
            
            const pixelPos = this.getPixelPosition(canvasX, canvasY);
            if (pixelPos) {
                this.handlePixelSelect(pixelPos);
            }
        }

        handleCanvasMouseMove(e) {
            if (this.gameState !== 'playing') return;
            
            // Update cursor style based on hover
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const canvasX = (x / rect.width) * this.canvas.width;
            const canvasY = (y / rect.height) * this.canvas.height;
            
            const pixelPos = this.getPixelPosition(canvasX, canvasY);
            this.canvas.style.cursor = pixelPos ? 'pointer' : 'default';
        }

        handleTouchStart(e) {
            e.preventDefault();
            if (this.gameState !== 'playing' || this.isAnimating) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            this.touchStartPos = {
                x: (touch.clientX - rect.left) / rect.width * this.canvas.width,
                y: (touch.clientY - rect.top) / rect.height * this.canvas.height
            };
        }

        handleTouchMove(e) {
            e.preventDefault();
        }

        handleTouchEnd(e) {
            e.preventDefault();
            if (!this.touchStartPos || this.gameState !== 'playing' || this.isAnimating) return;
            
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            this.touchEndPos = {
                x: (touch.clientX - rect.left) / rect.width * this.canvas.width,
                y: (touch.clientY - rect.top) / rect.height * this.canvas.height
            };
            
            this.handleSwipeGesture();
            this.touchStartPos = null;
            this.touchEndPos = null;
        }

        handleSwipeGesture() {
            if (!this.touchStartPos || !this.touchEndPos) return;
            
            const startPixel = this.getPixelPosition(this.touchStartPos.x, this.touchStartPos.y);
            const endPixel = this.getPixelPosition(this.touchEndPos.x, this.touchEndPos.y);
            
            if (startPixel && endPixel && this.board.isAdjacent(startPixel, endPixel)) {
                this.attemptSwap(startPixel, endPixel);
                
                // Haptic feedback for mobile
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            } else if (startPixel && !endPixel) {
                // Tap without swipe - select pixel
                this.handlePixelSelect(startPixel);
            }
        }

        handleKeyPress(e) {
            switch (e.key) {
                case ' ':
                case 'Escape':
                    e.preventDefault();
                    if (this.gameState === 'playing') {
                        this.togglePause();
                    }
                    break;
                case 'r':
                case 'R':
                    if (this.gameState === 'gameOver' || this.gameState === 'menu') {
                        this.resetGame();
                    }
                    break;
                case 'n':
                case 'N':
                    if (this.gameState === 'levelComplete') {
                        this.nextLevel();
                    }
                    break;
            }
        }

        getPixelPosition(canvasX, canvasY) {
            const pixelSize = this.canvas.width / 8;
            const col = Math.floor(canvasX / pixelSize);
            const row = Math.floor(canvasY / pixelSize);
            
            if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                return { row, col };
            }
            return null;
        }

        handlePixelSelect(pixelPos) {
            if (this.selectedPixel) {
                if (this.selectedPixel.row === pixelPos.row && this.selectedPixel.col === pixelPos.col) {
                    // Deselect same pixel
                    this.selectedPixel = null;
                } else if (this.board.isAdjacent(this.selectedPixel, pixelPos)) {
                    // Attempt swap with adjacent pixel
                    this.attemptSwap(this.selectedPixel, pixelPos);
                    this.selectedPixel = null;
                } else {
                    // Select new pixel
                    this.selectedPixel = pixelPos;
                }
            } else {
                // Select pixel
                this.selectedPixel = pixelPos;
            }
            
            this.render();
        }

        async attemptSwap(pos1, pos2) {
            if (this.isAnimating || this.moves <= 0) return;
            
            this.isAnimating = true;
            
            // Play swap sound
            if (window.GameSounds && window.GameSounds.isEnabled()) {
                window.GameSounds.sounds.MOVE();
            }
            
            // Perform the swap
            this.board.swapPixels(pos1, pos2);
            
            // Check for matches
            const matches = this.board.findMatches();
            
            if (matches.length === 0) {
                // No matches - swap back
                this.board.swapPixels(pos1, pos2);
                
                // Play error sound
                if (window.GameSounds && window.GameSounds.isEnabled()) {
                    window.GameSounds.sounds.ERROR();
                }
                
                this.isAnimating = false;
                this.render();
                return;
            }
            
            // Valid move - consume move and process matches
            this.moves--;
            this.ui.updateMoves(this.moves);
            
            await this.processMatchingSequence();
            
            this.isAnimating = false;
            
            // Check win/lose conditions
            this.checkGameEndConditions();
        }

        async processMatchingSequence() {
            let totalMatchesProcessed = 0;
            
            while (true) {
                const matches = this.board.findMatches();
                if (matches.length === 0) break;
                
                // Calculate score for this match
                const matchScore = this.calculateMatchScore(matches);
                this.score += matchScore;
                totalMatchesProcessed++;
                
                // Update combo
                this.combo++;
                
                // Show score particles
                this.ui.showScoreParticles(matches, matchScore, this.combo);
                
                // Play match sound
                if (window.GameSounds && window.GameSounds.isEnabled()) {
                    if (matches.length >= 5) {
                        window.GameSounds.sounds.POWER_UP();
                    } else {
                        window.GameSounds.sounds.COLLECT_ITEM();
                    }
                }
                
                // Remove matches and check for power-ups
                const powerUps = this.board.removeMatches(matches);
                
                // Apply power-ups
                for (const powerUp of powerUps) {
                    const affectedPositions = this.board.activatePowerUp(
                        powerUp.position.row, 
                        powerUp.position.col, 
                        powerUp.type, 
                        powerUp.direction
                    );
                    
                    if (affectedPositions.length > 0) {
                        const powerUpScore = affectedPositions.length * 50;
                        this.score += powerUpScore;
                        this.ui.showScoreParticles(affectedPositions, powerUpScore, this.combo);
                    }
                }
                
                // Apply gravity and add new pixels
                this.board.applyGravity();
                
                // Update UI
                this.ui.updateScore(this.score);
                this.ui.updateCombo(this.combo);
                this.render();
                
                // Small delay for visual effect
                await this.delay(300);
            }
            
            // Reset combo if no more matches
            if (totalMatchesProcessed > 0) {
                setTimeout(() => {
                    this.combo = 0;
                    this.ui.updateCombo(this.combo);
                }, 1000);
            }
        }

        calculateMatchScore(matches) {
            const baseScore = SCORE_MULTIPLIERS[Math.min(matches.length, 8)] || SCORE_MULTIPLIERS[8];
            const comboMultiplier = 1 + (this.combo * 0.5);
            const levelMultiplier = 1 + (this.level - 1) * 0.1;
            
            return Math.floor(baseScore * comboMultiplier * levelMultiplier);
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        checkGameEndConditions() {
            if (this.score >= this.target) {
                // Level completed
                this.levelComplete();
            } else if (this.moves <= 0) {
                // Check if player can still make moves
                if (!this.board.canMakeMove()) {
                    this.gameOver();
                } else if (this.score < this.target) {
                    this.gameOver();
                }
            }
        }

        startGame() {
            this.gameState = 'playing';
            this.score = 0;
            this.level = 1;
            this.moves = INITIAL_MOVES;
            this.target = LEVEL_TARGETS[0];
            this.combo = 0;
            this.selectedPixel = null;
            
            this.board.initializeGrid();
            
            this.ui.updateScore(this.score);
            this.ui.updateLevel(this.level);
            this.ui.updateMoves(this.moves);
            this.ui.updateTarget(this.target);
            this.ui.updateCombo(this.combo);
            this.ui.updateProgress(this.score, this.target);
            this.ui.hideGameOver();
            
            // Play start sound
            if (window.GameSounds && window.GameSounds.isEnabled()) {
                window.GameSounds.sounds.GAME_START();
            }
            
            this.render();
        }

        togglePause() {
            if (this.gameState === 'playing') {
                this.gameState = 'paused';
            } else if (this.gameState === 'paused') {
                this.gameState = 'playing';
            }
            
            this.ui.updateGameState(this.gameState);
        }

        resetGame() {
            this.gameState = 'menu';
            this.selectedPixel = null;
            this.isAnimating = false;
            
            this.ui.updateGameState(this.gameState);
            this.ui.hideGameOver();
            this.render();
        }

        nextLevel() {
            if (this.level < LEVEL_TARGETS.length) {
                this.level++;
                this.target = LEVEL_TARGETS[this.level - 1];
                this.moves = INITIAL_MOVES + (this.level - 1) * 5; // More moves for higher levels
                this.combo = 0;
                this.selectedPixel = null;
                
                this.board.initializeGrid();
                
                this.ui.updateLevel(this.level);
                this.ui.updateMoves(this.moves);
                this.ui.updateTarget(this.target);
                this.ui.updateCombo(this.combo);
                this.ui.updateProgress(this.score, this.target);
                
                this.gameState = 'playing';
                this.ui.updateGameState(this.gameState);
                
                // Play level up sound
                if (window.GameSounds && window.GameSounds.isEnabled()) {
                    window.GameSounds.sounds.LEVEL_UP();
                }
                
                this.render();
            } else {
                // All levels completed
                this.gameOver(true);
            }
        }

        levelComplete() {
            this.gameState = 'levelComplete';
            this.totalScore += this.score;
            
            // Save progress
            this.saveProgress();
            
            // Play success sound
            if (window.GameSounds && window.GameSounds.isEnabled()) {
                window.GameSounds.sounds.SUCCESS();
            }
            
            this.ui.updateGameState(this.gameState);
            this.ui.showLevelComplete();
        }

        gameOver(completed = false) {
            this.gameState = 'gameOver';
            this.totalScore += this.score;
            
            // Save progress
            this.saveProgress();
            
            // Play game over sound
            if (window.GameSounds && window.GameSounds.isEnabled()) {
                if (completed) {
                    window.GameSounds.sounds.SUCCESS();
                } else {
                    window.GameSounds.sounds.GAME_OVER();
                }
            }
            
            this.ui.updateGameState(this.gameState);
            this.ui.showGameOver(this.score, this.level, completed);
        }

        backToMenu() {
            this.resetGame();
        }

        changeTheme(themeName) {
            this.board.setTheme(themeName);
            
            // Update active theme in UI
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === themeName) {
                    option.classList.add('active');
                }
            });
            
            // Save theme preference
            localStorage.setItem('pixelCrushTheme', themeName);
            
            this.render();
        }

        render() {
            if (!this.ctx || !this.board) return;
            
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.drawGrid();
            
            // Draw selection highlight
            if (this.selectedPixel && this.gameState === 'playing') {
                this.drawSelectionHighlight(this.selectedPixel);
            }
            
            // Draw pause overlay
            if (this.gameState === 'paused') {
                this.drawPauseOverlay();
            }
        }

        drawGrid() {
            const grid = this.board.getGrid();
            const pixelSize = this.canvas.width / 8;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const pixelType = grid[row][col];
                    if (pixelType !== null) {
                        const x = col * pixelSize;
                        const y = row * pixelSize;
                        
                        // Get pixel color
                        const color = this.board.getPixelColor(pixelType);
                        
                        // Draw pixel with border
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(x + 2, y + 2, pixelSize - 4, pixelSize - 4);
                        
                        // Add highlight effect
                        this.ctx.fillStyle = this.lightenColor(color, 0.3);
                        this.ctx.fillRect(x + 2, y + 2, pixelSize - 4, 8);
                        this.ctx.fillRect(x + 2, y + 2, 8, pixelSize - 4);
                    }
                }
            }
            
            // Draw grid lines
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            for (let i = 0; i <= 8; i++) {
                const pos = i * pixelSize;
                this.ctx.moveTo(pos, 0);
                this.ctx.lineTo(pos, this.canvas.height);
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(this.canvas.width, pos);
            }
            
            this.ctx.stroke();
        }

        drawSelectionHighlight(pixel) {
            const pixelSize = this.canvas.width / 8;
            const x = pixel.col * pixelSize;
            const y = pixel.row * pixelSize;
            
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
            
            // Add pulsing effect
            const time = Date.now() * 0.005;
            const alpha = 0.3 + 0.3 * Math.sin(time);
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.fillRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
        }

        drawPauseOverlay() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }

        lightenColor(color, factor) {
            // Convert hex to RGB
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // Lighten
            const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
            const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
            const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
            
            return `rgb(${newR}, ${newG}, ${newB})`;
        }

        saveProgress() {
            const progress = {
                bestScores: {
                    level1: this.level >= 1 ? Math.max(this.score, this.loadBestScore(1)) : this.loadBestScore(1),
                    level2: this.level >= 2 ? Math.max(this.score, this.loadBestScore(2)) : this.loadBestScore(2),
                    level3: this.level >= 3 ? Math.max(this.score, this.loadBestScore(3)) : this.loadBestScore(3),
                    total: Math.max(this.totalScore, this.loadBestScore('total'))
                },
                theme: this.board.getCurrentTheme()
            };
            
            localStorage.setItem('pixelCrushProgress', JSON.stringify(progress));
            
            // Update high scores display
            this.ui.updateHighScores(progress.bestScores);
        }

        loadProgress() {
            try {
                const saved = localStorage.getItem('pixelCrushProgress');
                if (saved) {
                    const progress = JSON.parse(saved);
                    
                    // Load theme
                    if (progress.theme) {
                        this.changeTheme(progress.theme);
                    }
                    
                    // Update high scores display
                    if (progress.bestScores) {
                        this.ui.updateHighScores(progress.bestScores);
                    }
                }
            } catch (e) {
                console.warn('Failed to load progress:', e);
            }
        }

        loadBestScore(level) {
            try {
                const saved = localStorage.getItem('pixelCrushProgress');
                if (saved) {
                    const progress = JSON.parse(saved);
                    if (progress.bestScores) {
                        if (level === 'total') return progress.bestScores.total || 0;
                        return progress.bestScores[`level${level}`] || 0;
                    }
                }
            } catch (e) {
                console.warn('Failed to load best score:', e);
            }
            return 0;
        }

        getGameState() {
            return {
                gameState: this.gameState,
                score: this.score,
                level: this.level,
                moves: this.moves,
                target: this.target,
                combo: this.combo
            };
        }
    }

    // Export to global namespace
    window.PixelCrush = new Game();

})(window);