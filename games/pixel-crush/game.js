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
    
    // Enhanced level configuration with varying moves and features
    const LEVEL_CONFIG = [
        { moves: 30, target: 1000, specialFeature: null },
        { moves: 28, target: 2500, specialFeature: 'more_colors' },
        { moves: 26, target: 5000, specialFeature: 'power_boost' },
        { moves: 25, target: 8000, specialFeature: 'combo_bonus' },
        { moves: 24, target: 12000, specialFeature: 'time_pressure' },
        { moves: 23, target: 18000, specialFeature: 'mega_combos' },
        { moves: 22, target: 25000, specialFeature: 'chain_reaction' },
        { moves: 21, target: 35000, specialFeature: 'cascade_bonus' },
        { moves: 20, target: 50000, specialFeature: 'master_mode' },
        { moves: 18, target: 75000, specialFeature: 'perfect_challenge' }
    ];

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
            this.target = LEVEL_CONFIG[0].target;
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
            this.touchStartTime = 0;
            this.touchMoved = false;
            this.touchHighlight = null;
            
            // Special level features
            this.specialFeature = null;
            this.powerUpBoost = 1.0;
            this.comboBonus = 1.0;
            this.megaCombosEnabled = false;
            this.chainReactionBonus = 1.0;
            this.cascadeBonus = 1.0;
            this.levelEffects = {};
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
            
            // Set up responsive canvas
            this.setupResponsiveCanvas();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved progress
            this.loadProgress();
            
            // Initial render
            this.render();
            
            console.log('Pixel Crush initialized');
            return true;
        }

        setupResponsiveCanvas() {
            // Set up responsive canvas sizing
            this.resizeCanvas();
            
            // Listen for window resize events
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            const container = this.canvas.parentElement;
            
            // Calculate optimal canvas size
            const maxWidth = container.clientWidth - 20; // Leave some margin
            const maxHeight = window.innerHeight * 0.6; // Max 60% of screen height
            
            // Maintain square aspect ratio
            const size = Math.min(maxWidth, maxHeight, 600); // Cap at 600px for desktop
            
            // Update canvas size
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
            
            // Set internal resolution (keep high for crisp graphics)
            const pixelRatio = window.devicePixelRatio || 1;
            const internalSize = 480 * pixelRatio;
            
            this.canvas.width = internalSize;
            this.canvas.height = internalSize;
            
            // Scale context for high DPI displays
            this.ctx.scale(pixelRatio, pixelRatio);
            
            // Re-render after resize
            if (this.board) {
                this.render();
            }
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
            
            this.touchStartTime = Date.now();
            this.touchMoved = false;
            
            // Visual feedback for touch start
            const pixel = this.getPixelPosition(this.touchStartPos.x, this.touchStartPos.y);
            if (pixel) {
                this.touchHighlight = pixel;
                this.render();
            }
        }

        handleTouchMove(e) {
            e.preventDefault();
            if (!this.touchStartPos || this.gameState !== 'playing' || this.isAnimating) return;
            
            this.touchMoved = true;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            const currentPos = {
                x: (touch.clientX - rect.left) / rect.width * this.canvas.width,
                y: (touch.clientY - rect.top) / rect.height * this.canvas.height
            };
            
            // Calculate movement distance for better gesture recognition
            const dx = currentPos.x - this.touchStartPos.x;
            const dy = currentPos.y - this.touchStartPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Threshold for minimum movement to trigger gesture
            const minSwipeDistance = 20;
            
            if (distance > minSwipeDistance) {
                const endPixel = this.getPixelPosition(currentPos.x, currentPos.y);
                if (endPixel && endPixel !== this.touchHighlight) {
                    this.touchEndPos = currentPos;
                    this.touchHighlight = endPixel;
                    this.render();
                }
            }
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
            
            const touchDuration = Date.now() - this.touchStartTime;
            
            // Distinguish between tap and swipe based on movement and duration
            if (!this.touchMoved && touchDuration < 300) {
                // Quick tap - handle as selection
                const pixel = this.getPixelPosition(this.touchStartPos.x, this.touchStartPos.y);
                if (pixel) {
                    this.handlePixelSelect(pixel);
                    
                    // Light haptic feedback for selection
                    if (navigator.vibrate) {
                        navigator.vibrate(20);
                    }
                }
            } else if (this.touchMoved) {
                // Movement detected - handle as swipe
                this.handleSwipeGesture();
            }
            
            // Clean up touch state
            this.touchStartPos = null;
            this.touchEndPos = null;
            this.touchHighlight = null;
            this.touchMoved = false;
            this.render();
        }

        handleSwipeGesture() {
            if (!this.touchStartPos || !this.touchEndPos) return;
            
            const startPixel = this.getPixelPosition(this.touchStartPos.x, this.touchStartPos.y);
            const endPixel = this.getPixelPosition(this.touchEndPos.x, this.touchEndPos.y);
            
            // Calculate swipe distance and direction
            const dx = this.touchEndPos.x - this.touchStartPos.x;
            const dy = this.touchEndPos.y - this.touchStartPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Minimum distance for a valid swipe
            const minSwipeDistance = 30;
            
            if (distance < minSwipeDistance) {
                // Too small movement, treat as tap
                if (startPixel) {
                    this.handlePixelSelect(startPixel);
                    if (navigator.vibrate) {
                        navigator.vibrate(20);
                    }
                }
                return;
            }
            
            if (startPixel && endPixel && this.board.isAdjacent(startPixel, endPixel)) {
                this.attemptSwap(startPixel, endPixel);
                
                // Enhanced haptic feedback for successful swap
                if (navigator.vibrate) {
                    navigator.vibrate([30, 10, 30]); // Pattern for successful swap
                }
            } else if (startPixel && endPixel && !this.board.isAdjacent(startPixel, endPixel)) {
                // Invalid move - different haptic pattern
                if (navigator.vibrate) {
                    navigator.vibrate([10, 10, 10]); // Quick buzz for invalid move
                }
                
                // Show visual feedback for invalid move
                this.showInvalidMoveEffect(startPixel, endPixel);
            } else if (startPixel && !endPixel) {
                // Swipe started on valid pixel but ended outside board
                this.handlePixelSelect(startPixel);
                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }
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

        showInvalidMoveEffect(startPixel, endPixel) {
            // Add visual feedback for invalid moves
            this.invalidMovePixels = [startPixel, endPixel];
            this.invalidMoveTime = Date.now();
            this.render();
            
            // Clear the effect after a short duration
            setTimeout(() => {
                this.invalidMovePixels = null;
                this.render();
            }, 500);
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
                
                // Play match sound with variety based on match size and special features
                if (window.GameSounds && window.GameSounds.isEnabled()) {
                    if (matches.length >= 6) {
                        window.GameSounds.sounds.POWER_UP();
                    } else if (matches.length >= 5) {
                        window.GameSounds.sounds.SCORE_POINT();
                    } else if (this.combo >= 3) {
                        window.GameSounds.sounds.COLLECT_ITEM();
                    } else {
                        window.GameSounds.sounds.MENU_SELECT();
                    }
                    
                    // Add extra sound for special level features
                    if (this.megaCombosEnabled && this.combo >= 3) {
                        setTimeout(() => {
                            if (window.GameSounds && window.GameSounds.isEnabled()) {
                                window.GameSounds.sounds.LEVEL_UP();
                            }
                        }, 100);
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
            let comboMultiplier = 1 + (this.combo * 0.6);
            const levelMultiplier = 1 + (this.level - 1) * 0.12;
            
            // Apply special level features
            comboMultiplier *= this.comboBonus;
            
            let finalScore = Math.floor(baseScore * comboMultiplier * levelMultiplier);
            
            // Enhanced cascade bonus if this is part of a cascade
            if (this.combo > 1) {
                const cascadeMultiplier = this.cascadeBonus * (1 + this.combo * 0.2);
                finalScore = Math.floor(finalScore * cascadeMultiplier);
            }
            
            // Enhanced chain reaction bonus for large matches
            if (matches.length >= 5) {
                const chainMultiplier = this.chainReactionBonus * (1 + (matches.length - 5) * 0.3);
                finalScore = Math.floor(finalScore * chainMultiplier);
            }
            
            // Mega combo bonus for special levels with escalating bonus
            if (this.megaCombosEnabled && this.combo >= 3) {
                const megaMultiplier = 1.5 + (this.combo - 3) * 0.3;
                finalScore = Math.floor(finalScore * megaMultiplier);
            }
            
            // Perfect mode super bonus
            if (this.levelEffects.perfectMode && this.combo >= 5) {
                finalScore = Math.floor(finalScore * 2.0);
            }
            
            // Master mode bonus for high combos
            if (this.levelEffects.masterGlow && this.combo >= 4) {
                finalScore = Math.floor(finalScore * 1.3);
            }
            
            return finalScore;
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
            this.moves = LEVEL_CONFIG[0].moves;
            this.target = LEVEL_CONFIG[0].target;
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
            this.level++;
            
            // Use predefined config for first 10 levels, then generate infinite levels
            let levelData;
            if (this.level <= LEVEL_CONFIG.length) {
                levelData = LEVEL_CONFIG[this.level - 1];
            } else {
                // Generate infinite level progression with exponentially increasing difficulty
                levelData = this.generateInfiniteLevel(this.level);
            }
            
            this.target = levelData.target;
            this.moves = levelData.moves;
            this.combo = 0;
            this.selectedPixel = null;
            
            this.board.initializeGrid();
            
            // Apply special level features
            this.applyLevelFeatures(levelData.specialFeature);
            
            this.ui.updateLevel(this.level);
            this.ui.updateMoves(this.moves);
            this.ui.updateTarget(this.target);
            this.ui.updateCombo(this.combo);
            this.ui.updateProgress(this.score, this.target);
            this.ui.showLevelInfo(this.level, levelData.specialFeature);
            
            this.gameState = 'playing';
            this.ui.updateGameState(this.gameState);
            
            // Play level up sound
            if (window.GameSounds && window.GameSounds.isEnabled()) {
                window.GameSounds.sounds.LEVEL_UP();
            }
            
            this.render();
        }
        
        generateInfiniteLevel(level) {
            // Base values from the last predefined level
            const baseTarget = LEVEL_CONFIG[LEVEL_CONFIG.length - 1].target; // 75000
            const baseMoves = LEVEL_CONFIG[LEVEL_CONFIG.length - 1].moves; // 18
            
            // Calculate how many levels beyond the predefined ones
            const infiniteLevel = level - LEVEL_CONFIG.length;
            
            // Exponentially increasing target - gets significantly harder
            // Each level beyond 10 increases target by 40% + additional scaling
            const targetMultiplier = Math.pow(1.4, infiniteLevel) * (1 + infiniteLevel * 0.1);
            const target = Math.floor(baseTarget * targetMultiplier);
            
            // Gradually decreasing moves - but not too harsh
            // Minimum moves is 12, decreases by 1 every 3 levels
            const moveReduction = Math.floor(infiniteLevel / 3);
            const moves = Math.max(12, baseMoves - moveReduction);
            
            // Cycle through special features for variety
            const specialFeatures = [
                'more_colors', 'power_boost', 'combo_bonus', 'time_pressure',
                'mega_combos', 'chain_reaction', 'cascade_bonus', 'master_mode', 'perfect_challenge'
            ];
            const specialFeature = specialFeatures[infiniteLevel % specialFeatures.length];
            
            return {
                moves: moves,
                target: target,
                specialFeature: specialFeature
            };
        }
        
        applyLevelFeatures(feature) {
            // Reset any previous special features
            this.specialFeature = feature;
            this.powerUpBoost = 1.0;
            this.comboBonus = 1.0;
            this.megaCombosEnabled = false;
            this.chainReactionBonus = 1.0;
            this.cascadeBonus = 1.0;
            this.levelEffects = {};
            
            switch (feature) {
                case 'more_colors':
                    // Add more color variety and sparkle effects
                    this.levelEffects.sparkle = true;
                    this.levelEffects.colorVariety = true;
                    break;
                case 'power_boost':
                    // Increase power-up generation rate with visual effects
                    this.powerUpBoost = 1.8;
                    this.levelEffects.powerGlow = true;
                    break;
                case 'combo_bonus':
                    // Increase combo multiplier effectiveness with enhanced feedback
                    this.comboBonus = 2.2;
                    this.levelEffects.comboTrail = true;
                    break;
                case 'time_pressure':
                    // Add visual urgency effects and screen shake
                    this.levelEffects.urgency = true;
                    this.levelEffects.screenShake = true;
                    break;
                case 'mega_combos':
                    // Enable mega combo cascades with explosive effects
                    this.megaCombosEnabled = true;
                    this.comboBonus = 1.5;
                    this.levelEffects.explosions = true;
                    break;
                case 'chain_reaction':
                    // Enhanced chain reaction effects with particle trails
                    this.chainReactionBonus = 2.2;
                    this.levelEffects.chainTrails = true;
                    break;
                case 'cascade_bonus':
                    // Bonus for cascade matches with flowing effects
                    this.cascadeBonus = 1.8;
                    this.levelEffects.cascadeFlow = true;
                    break;
                case 'master_mode':
                    // All bonuses active with enhanced visuals
                    this.powerUpBoost = 2.2;
                    this.comboBonus = 2.8;
                    this.megaCombosEnabled = true;
                    this.chainReactionBonus = 2.5;
                    this.cascadeBonus = 2.2;
                    this.levelEffects.masterGlow = true;
                    this.levelEffects.allEffects = true;
                    break;
                case 'perfect_challenge':
                    // Ultimate challenge with maximum effects
                    this.powerUpBoost = 3.2;
                    this.comboBonus = 3.5;
                    this.megaCombosEnabled = true;
                    this.chainReactionBonus = 3.0;
                    this.cascadeBonus = 3.0;
                    this.levelEffects.perfectMode = true;
                    this.levelEffects.allEffects = true;
                    break;
                default:
                    // Reset all special features
                    this.powerUpBoost = 1.0;
                    this.comboBonus = 1.0;
                    this.megaCombosEnabled = false;
                    this.chainReactionBonus = 1.0;
                    this.cascadeBonus = 1.0;
                    break;
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
            
            // Draw touch highlight for mobile
            if (this.touchHighlight && this.gameState === 'playing') {
                this.drawTouchHighlight(this.touchHighlight);
            }
            
            // Draw invalid move effect
            if (this.invalidMovePixels && this.gameState === 'playing') {
                this.drawInvalidMoveEffect(this.invalidMovePixels);
            }
            
            // Draw special level effects
            if (this.levelEffects && this.gameState === 'playing') {
                this.drawLevelEffects();
            }
            
            // Draw pause overlay
            if (this.gameState === 'paused') {
                this.drawPauseOverlay();
            }
        }

        drawGrid() {
            const grid = this.board.getGrid();
            const pixelRatio = window.devicePixelRatio || 1;
            const baseSize = 480; // Base internal canvas size
            const pixelSize = baseSize / 8;
            
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

        drawTouchHighlight(pixel) {
            const pixelSize = this.canvas.width / 8;
            const x = pixel.col * pixelSize;
            const y = pixel.row * pixelSize;
            
            // Draw a pulsing blue highlight for touch
            this.ctx.strokeStyle = '#00ccff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x + 2, y + 2, pixelSize - 4, pixelSize - 4);
            
            // Add a subtle glow effect
            const time = Date.now() * 0.008;
            const alpha = 0.2 + 0.2 * Math.sin(time);
            this.ctx.fillStyle = `rgba(0, 204, 255, ${alpha})`;
            this.ctx.fillRect(x + 2, y + 2, pixelSize - 4, pixelSize - 4);
        }

        drawInvalidMoveEffect(pixels) {
            const pixelSize = this.canvas.width / 8;
            
            // Draw red highlights for invalid moves
            this.ctx.strokeStyle = '#ff3366';
            this.ctx.lineWidth = 3;
            
            pixels.forEach(pixel => {
                const x = pixel.col * pixelSize;
                const y = pixel.row * pixelSize;
                
                // Animate with a shake effect
                const offset = Math.sin(Date.now() * 0.02) * 1.5;
                this.ctx.strokeRect(x + 1 + offset, y + 1, pixelSize - 2, pixelSize - 2);
                
                // Add red tint
                this.ctx.fillStyle = 'rgba(255, 51, 102, 0.3)';
                this.ctx.fillRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
            });
        }

        drawLevelEffects() {
            const time = Date.now() * 0.005;
            
            // Master mode glow
            if (this.levelEffects.masterGlow || this.levelEffects.allEffects) {
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 15 + Math.sin(time) * 5;
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
                this.ctx.shadowBlur = 0;
            }
            
            // Perfect mode effects
            if (this.levelEffects.perfectMode) {
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 20 + Math.sin(time * 1.5) * 10;
                this.ctx.strokeStyle = '#ff00ff';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
                this.ctx.shadowBlur = 0;
            }
            
            // Power glow effects
            if (this.levelEffects.powerGlow && this.combo > 0) {
                const alpha = 0.3 + 0.2 * Math.sin(time * 2);
                this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
                this.ctx.fillRect(0, 0, this.canvas.width, 5);
                this.ctx.fillRect(0, this.canvas.height - 5, this.canvas.width, 5);
                this.ctx.fillRect(0, 0, 5, this.canvas.height);
                this.ctx.fillRect(this.canvas.width - 5, 0, 5, this.canvas.height);
            }
            
            // Sparkle effects for color variety
            if (this.levelEffects.sparkle && Math.random() < 0.1) {
                this.drawSparkles();
            }
        }

        drawSparkles() {
            const sparkleCount = 3;
            for (let i = 0; i < sparkleCount; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const size = 2 + Math.random() * 3;
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x, y, size, size);
                
                // Add colored sparkle
                this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 70%)`;
                this.ctx.fillRect(x + 1, y + 1, size - 1, size - 1);
            }
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