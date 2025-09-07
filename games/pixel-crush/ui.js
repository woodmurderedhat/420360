/**
 * UI.js - User interface management and visual effects for Pixel Crush
 * Handles score display, animations, particles, and game state UI updates
 */

(function(window) {
    'use strict';

    class UI {
        constructor(game) {
            this.game = game;
            this.particles = [];
            this.animationId = null;
            
            // UI elements
            this.elements = {
                score: document.getElementById('score'),
                level: document.getElementById('level'),
                moves: document.getElementById('moves'),
                target: document.getElementById('target'),
                combo: document.getElementById('combo'),
                progressFill: document.getElementById('progressFill'),
                progressText: document.getElementById('progressText'),
                levelGoal: document.getElementById('levelGoal'),
                comboDisplay: document.getElementById('comboDisplay'),
                comboMultiplier: document.getElementById('comboMultiplier'),
                gameOver: document.getElementById('gameOver'),
                finalScore: document.getElementById('finalScore'),
                finalLevel: document.getElementById('finalLevel'),
                startGame: document.getElementById('startGame'),
                pauseGame: document.getElementById('pauseGame'),
                nextLevel: document.getElementById('nextLevel'),
                bestLevel1: document.getElementById('bestLevel1'),
                bestLevel2: document.getElementById('bestLevel2'),
                bestLevel3: document.getElementById('bestLevel3'),
                bestTotal: document.getElementById('bestTotal')
            };
            
            this.startParticleSystem();
        }

        updateScore(score) {
            if (this.elements.score) {
                this.elements.score.textContent = score.toLocaleString();
                this.animateValueChange(this.elements.score);
            }
        }

        updateLevel(level) {
            if (this.elements.level) {
                this.elements.level.textContent = level;
                this.animateValueChange(this.elements.level);
            }
        }

        updateMoves(moves) {
            if (this.elements.moves) {
                this.elements.moves.textContent = moves;
                
                // Change color based on remaining moves
                if (moves <= 5) {
                    this.elements.moves.style.color = 'var(--danger)';
                } else if (moves <= 10) {
                    this.elements.moves.style.color = 'var(--warning)';
                } else {
                    this.elements.moves.style.color = 'var(--text)';
                }
                
                this.animateValueChange(this.elements.moves);
            }
        }

        updateTarget(target) {
            if (this.elements.target) {
                this.elements.target.textContent = target.toLocaleString();
            }
            
            if (this.elements.levelGoal) {
                this.elements.levelGoal.textContent = `Reach ${target.toLocaleString()} points`;
            }
        }

        updateCombo(combo) {
            if (this.elements.combo) {
                this.elements.combo.textContent = combo;
                
                if (combo > 0) {
                    this.elements.combo.style.color = 'var(--warning)';
                    this.showComboDisplay(combo);
                } else {
                    this.elements.combo.style.color = 'var(--text)';
                    this.hideComboDisplay();
                }
                
                this.animateValueChange(this.elements.combo);
            }
        }

        updateProgress(current, target) {
            const percentage = Math.min(100, (current / target) * 100);
            
            if (this.elements.progressFill) {
                this.elements.progressFill.style.width = `${percentage}%`;
            }
            
            if (this.elements.progressText) {
                this.elements.progressText.textContent = `${current.toLocaleString()} / ${target.toLocaleString()}`;
            }
        }

        updateGameState(gameState) {
            // Update button states
            const startBtn = this.elements.startGame;
            const pauseBtn = this.elements.pauseGame;
            const nextBtn = this.elements.nextLevel;
            
            switch (gameState) {
                case 'menu':
                    if (startBtn) {
                        startBtn.textContent = 'Start Game';
                        startBtn.disabled = false;
                    }
                    if (pauseBtn) {
                        pauseBtn.disabled = true;
                        pauseBtn.textContent = 'Pause';
                    }
                    if (nextBtn) {
                        nextBtn.disabled = true;
                    }
                    break;
                    
                case 'playing':
                    if (startBtn) {
                        startBtn.textContent = 'Playing';
                        startBtn.disabled = true;
                    }
                    if (pauseBtn) {
                        pauseBtn.disabled = false;
                        pauseBtn.textContent = 'Pause';
                    }
                    if (nextBtn) {
                        nextBtn.disabled = true;
                    }
                    break;
                    
                case 'paused':
                    if (pauseBtn) {
                        pauseBtn.textContent = 'Resume';
                    }
                    break;
                    
                case 'levelComplete':
                    if (nextBtn) {
                        nextBtn.disabled = false;
                    }
                    if (pauseBtn) {
                        pauseBtn.disabled = true;
                    }
                    break;
                    
                case 'gameOver':
                    if (startBtn) {
                        startBtn.textContent = 'Start Game';
                        startBtn.disabled = false;
                    }
                    if (pauseBtn) {
                        pauseBtn.disabled = true;
                        pauseBtn.textContent = 'Pause';
                    }
                    if (nextBtn) {
                        nextBtn.disabled = true;
                    }
                    break;
            }
        }

        showComboDisplay(combo) {
            if (this.elements.comboDisplay && this.elements.comboMultiplier) {
                this.elements.comboMultiplier.textContent = Math.floor(1 + combo * 0.5);
                this.elements.comboDisplay.style.display = 'block';
                
                // Auto-hide after delay
                clearTimeout(this.comboTimeout);
                this.comboTimeout = setTimeout(() => {
                    this.hideComboDisplay();
                }, 2000);
            }
        }

        hideComboDisplay() {
            if (this.elements.comboDisplay) {
                this.elements.comboDisplay.style.display = 'none';
            }
        }

        showGameOver(score, level, completed = false) {
            if (this.elements.gameOver && this.elements.finalScore && this.elements.finalLevel) {
                this.elements.finalScore.textContent = score.toLocaleString();
                this.elements.finalLevel.textContent = level;
                
                // Update title based on completion
                const title = this.elements.gameOver.querySelector('h2');
                if (title) {
                    title.textContent = completed ? 'CONGRATULATIONS!' : 'GAME OVER';
                    title.style.color = completed ? 'var(--success)' : 'var(--danger)';
                }
                
                this.elements.gameOver.style.display = 'block';
                
                // Animate in
                this.elements.gameOver.style.opacity = '0';
                this.elements.gameOver.style.transform = 'translate(-50%, -50%) scale(0.8)';
                
                setTimeout(() => {
                    this.elements.gameOver.style.transition = 'all 0.3s ease';
                    this.elements.gameOver.style.opacity = '1';
                    this.elements.gameOver.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 100);
            }
        }

        hideGameOver() {
            if (this.elements.gameOver) {
                this.elements.gameOver.style.display = 'none';
                this.elements.gameOver.style.transition = '';
            }
        }

        showLevelComplete() {
            // Use game over dialog but with different styling
            const gameState = this.game.getGameState();
            this.showGameOver(gameState.score, gameState.level, false);
            
            // Update title for level complete
            const title = this.elements.gameOver.querySelector('h2');
            if (title) {
                title.textContent = 'LEVEL COMPLETE!';
                title.style.color = 'var(--success)';
            }
        }

        updateHighScores(scores) {
            if (this.elements.bestLevel1 && scores.level1 !== undefined) {
                this.elements.bestLevel1.textContent = scores.level1.toLocaleString();
            }
            if (this.elements.bestLevel2 && scores.level2 !== undefined) {
                this.elements.bestLevel2.textContent = scores.level2.toLocaleString();
            }
            if (this.elements.bestLevel3 && scores.level3 !== undefined) {
                this.elements.bestLevel3.textContent = scores.level3.toLocaleString();
            }
            if (this.elements.bestTotal && scores.total !== undefined) {
                this.elements.bestTotal.textContent = scores.total.toLocaleString();
            }
        }

        showLevelInfo(level, specialFeature) {
            // Show level transition with special feature info
            if (!specialFeature) return;
            
            const featureDescriptions = {
                'more_colors': 'Enhanced Color Variety!',
                'power_boost': 'Power-Up Boost Active!',
                'combo_bonus': 'Combo Bonus Multiplier!',
                'time_pressure': 'Pressure Mode Engaged!',
                'mega_combos': 'Mega Combos Enabled!',
                'chain_reaction': 'Chain Reaction Bonus!',
                'cascade_bonus': 'Cascade Bonus Active!',
                'master_mode': 'Master Mode - All Bonuses!',
                'perfect_challenge': 'Perfect Challenge Mode!'
            };
            
            const description = featureDescriptions[specialFeature] || 'Special Level!';
            
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--secondary);
                color: var(--text);
                padding: 20px;
                border: 3px solid var(--primary);
                box-shadow: 0 0 0 3px var(--highlight);
                font-family: 'Press Start 2P', monospace;
                font-size: 12px;
                text-align: center;
                z-index: 10000;
                border-radius: 8px;
                animation: levelInfoPulse 0.5s ease-in-out;
            `;
            
            notification.innerHTML = `
                <div style="margin-bottom: 10px; color: var(--highlight);">LEVEL ${level}</div>
                <div>${description}</div>
            `;
            
            document.body.appendChild(notification);
            
            // Add CSS animation if not already present
            if (!document.getElementById('levelInfoStyles')) {
                const style = document.createElement('style');
                style.id = 'levelInfoStyles';
                style.textContent = `
                    @keyframes levelInfoPulse {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        showLevelAdvancement(level, specialFeature) {
            // Show brief level advancement notification for infinite gameplay
            const featureDescriptions = {
                'more_colors': 'Enhanced Color Variety!',
                'power_boost': 'Power-Up Boost Active!',
                'combo_bonus': 'Combo Bonus Multiplier!',
                'time_pressure': 'Pressure Mode Engaged!',
                'mega_combos': 'Mega Combos Enabled!',
                'chain_reaction': 'Chain Reaction Bonus!',
                'cascade_bonus': 'Cascade Bonus Active!',
                'master_mode': 'Master Mode - All Bonuses!',
                'perfect_challenge': 'Perfect Challenge Mode!'
            };
            
            const description = featureDescriptions[specialFeature] || 'New Level!';
            
            // Create a smaller, less intrusive notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, var(--success), var(--highlight));
                color: var(--bg);
                padding: 15px 25px;
                border: 2px solid var(--text);
                box-shadow: 0 4px 8px rgba(0,0,0,0.5);
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                text-align: center;
                z-index: 10000;
                border-radius: 6px;
                animation: levelAdvancePulse 0.8s ease-out;
                text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
            `;
            
            notification.innerHTML = `
                <div style="margin-bottom: 8px; font-size: 12px; color: var(--bg);">LEVEL ${level}!</div>
                <div style="font-size: 8px;">${description}</div>
                <div style="font-size: 7px; margin-top: 5px; opacity: 0.8;">+5 Bonus Moves!</div>
            `;
            
            document.body.appendChild(notification);
            
            // Add CSS animation if not already present
            if (!document.getElementById('levelAdvanceStyles')) {
                const style = document.createElement('style');
                style.id = 'levelAdvanceStyles';
                style.textContent = `
                    @keyframes levelAdvancePulse {
                        0% { 
                            opacity: 0; 
                            transform: translate(-50%, -50%) scale(0.5) rotate(-5deg); 
                        }
                        50% { 
                            opacity: 1; 
                            transform: translate(-50%, -50%) scale(1.1) rotate(2deg); 
                        }
                        100% { 
                            opacity: 1; 
                            transform: translate(-50%, -50%) scale(1) rotate(0deg); 
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Remove notification after 2 seconds (shorter than level info)
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                notification.style.transition = 'all 0.4s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 400);
            }, 2000);
        }

        animateValueChange(element) {
            if (!element) return;
            
            element.style.transform = 'scale(1.2)';
            element.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }

        showScoreParticles(positions, score, combo) {
            if (!positions || positions.length === 0) return;
            
            // Create particles for each position
            positions.forEach((pos, index) => {
                setTimeout(() => {
                    this.createScoreParticle(pos, score, combo);
                }, index * 50); // Stagger the particles
            });
        }

        createScoreParticle(position, score, combo) {
            const canvas = this.game.canvas;
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const pixelSize = canvas.width / 8;
            
            // Calculate world position
            const worldX = position.col * pixelSize + pixelSize / 2;
            const worldY = position.row * pixelSize + pixelSize / 2;
            
            // Convert to screen position
            const screenX = rect.left + (worldX / canvas.width) * rect.width;
            const screenY = rect.top + (worldY / canvas.height) * rect.height;
            
            // Create particle element
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = `+${score}`;
            
            if (combo > 1) {
                particle.textContent += ` (x${combo})`;
                particle.style.color = '#ffcc33';
            } else {
                particle.style.color = '#66ff66';
            }
            
            particle.style.position = 'fixed';
            particle.style.left = `${screenX}px`;
            particle.style.top = `${screenY}px`;
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';
            particle.style.transform = 'translate(-50%, -50%)';
            
            document.body.appendChild(particle);
            
            // Animate and remove
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
            
            // Store for particle system
            this.particles.push({
                element: particle,
                startTime: Date.now(),
                duration: 1000,
                startX: screenX,
                startY: screenY,
                targetY: screenY - 50,
                score: score,
                combo: combo
            });
        }

        startParticleSystem() {
            const updateParticles = () => {
                const now = Date.now();
                
                // Update existing particles
                this.particles = this.particles.filter(particle => {
                    const elapsed = now - particle.startTime;
                    const progress = elapsed / particle.duration;
                    
                    if (progress >= 1) {
                        // Remove completed particle
                        if (particle.element && particle.element.parentNode) {
                            particle.element.parentNode.removeChild(particle.element);
                        }
                        return false;
                    }
                    
                    // Update particle position
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentY = particle.startY + (particle.targetY - particle.startY) * easeOut;
                    const opacity = 1 - progress;
                    
                    if (particle.element) {
                        particle.element.style.top = `${currentY}px`;
                        particle.element.style.opacity = opacity;
                        particle.element.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.5})`;
                    }
                    
                    return true;
                });
                
                this.animationId = requestAnimationFrame(updateParticles);
            };
            
            updateParticles();
        }

        createBurstEffect(x, y, color = '#ffff00') {
            const burstContainer = document.createElement('div');
            burstContainer.style.position = 'fixed';
            burstContainer.style.left = `${x}px`;
            burstContainer.style.top = `${y}px`;
            burstContainer.style.pointerEvents = 'none';
            burstContainer.style.zIndex = '999';
            
            // Create multiple burst particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 30 + Math.random() * 20;
                const size = 4 + Math.random() * 6;
                
                const burstParticle = document.createElement('div');
                burstParticle.style.position = 'absolute';
                burstParticle.style.width = `${size}px`;
                burstParticle.style.height = `${size}px`;
                burstParticle.style.backgroundColor = color;
                burstParticle.style.borderRadius = '50%';
                burstParticle.style.left = '0px';
                burstParticle.style.top = '0px';
                burstParticle.style.transform = 'translate(-50%, -50%)';
                
                const targetX = Math.cos(angle) * distance;
                const targetY = Math.sin(angle) * distance;
                
                burstParticle.style.transition = 'all 0.6s ease-out';
                burstContainer.appendChild(burstParticle);
                
                // Animate burst
                setTimeout(() => {
                    burstParticle.style.transform = `translate(${targetX - size/2}px, ${targetY - size/2}px) scale(0)`;
                    burstParticle.style.opacity = '0';
                }, 50);
            }
            
            document.body.appendChild(burstContainer);
            
            // Clean up
            setTimeout(() => {
                if (burstContainer.parentNode) {
                    burstContainer.parentNode.removeChild(burstContainer);
                }
            }, 700);
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg);
                color: var(--text);
                border: 2px solid var(--primary);
                border-radius: 4px;
                padding: 10px 15px;
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Set color based on type
            switch (type) {
                case 'success':
                    notification.style.borderColor = 'var(--success)';
                    notification.style.color = 'var(--success)';
                    break;
                case 'warning':
                    notification.style.borderColor = 'var(--warning)';
                    notification.style.color = 'var(--warning)';
                    break;
                case 'error':
                    notification.style.borderColor = 'var(--danger)';
                    notification.style.color = 'var(--danger)';
                    break;
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 100);
            
            // Auto remove
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        destroy() {
            // Clean up particle system
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            
            // Clean up any remaining particles
            this.particles.forEach(particle => {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
            
            this.particles = [];
        }
    }

    // Export to global namespace
    window.PixelCrushUI = UI;

})(window);