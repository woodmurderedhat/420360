/**
 * Game Overlays for Tarot Tetromino
 * This file handles all game overlays including intro, pause, game over, and level up screens.
 */

// Store overlay state
const overlayState = {
    activeOverlay: null,
    introShown: false,
    tutorialStep: 0
};

/**
 * Create and show the game intro overlay
 */
function showIntroOverlay() {
    // Don't show intro if it's already been shown this session
    if (overlayState.introShown) return;

    // Create overlay container if it doesn't exist
    let overlay = document.getElementById('game-intro-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-intro-overlay';
        overlay.className = 'game-overlay intro-overlay';
        document.body.appendChild(overlay);
    }

    // Set overlay content
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2 class="overlay-title">Welcome to Tarot Tetromino</h2>
            <div class="intro-steps">
                <div class="intro-step active" data-step="1">
                    <h3>Game Objectives</h3>
                    <p>Clear lines to score points and level up. The game speeds up as you progress through levels.</p>
                    <div class="objective-icons">
                        <div class="objective-icon">
                            <span class="icon">🧩</span>
                            <span>Clear Lines</span>
                        </div>
                        <div class="objective-icon">
                            <span class="icon">⬆️</span>
                            <span>Level Up</span>
                        </div>
                        <div class="objective-icon">
                            <span class="icon">🏆</span>
                            <span>High Score</span>
                        </div>
                    </div>
                </div>
                <div class="intro-step" data-step="2">
                    <h3>Tarot Cards</h3>
                    <p>Tarot cards appear as you play. Click a card to activate its mystical effect!</p>
                    <div class="tarot-example">
                        <div class="mini-tarot-card">
                            <div class="title">The Fool</div>
                            <div class="description">Slows down time</div>
                        </div>
                        <div class="mini-tarot-card">
                            <div class="title">The Magician</div>
                            <div class="description">Doubles score</div>
                        </div>
                        <div class="mini-tarot-card">
                            <div class="title">The Tower</div>
                            <div class="description">Clears top rows</div>
                        </div>
                    </div>
                </div>
                <div class="intro-step" data-step="3">
                    <h3>Controls</h3>
                    <div class="controls-grid">
                        <div class="control-item">
                            <span class="key">←</span>
                            <span>Move Left</span>
                        </div>
                        <div class="control-item">
                            <span class="key">→</span>
                            <span>Move Right</span>
                        </div>
                        <div class="control-item">
                            <span class="key">↓</span>
                            <span>Move Down</span>
                        </div>
                        <div class="control-item">
                            <span class="key">↑</span>
                            <span>Rotate</span>
                        </div>
                        <div class="control-item">
                            <span class="key">Space</span>
                            <span>Hard Drop</span>
                        </div>
                        <div class="control-item">
                            <span class="key">C</span>
                            <span>Hold Piece</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="intro-navigation">
                <button id="prev-intro-step" class="neon-btn" disabled>Previous</button>
                <div class="step-indicators">
                    <span class="step-dot active" data-step="1"></span>
                    <span class="step-dot" data-step="2"></span>
                    <span class="step-dot" data-step="3"></span>
                </div>
                <button id="next-intro-step" class="neon-btn">Next</button>
            </div>
            <div class="player-name-input">
                <label for="intro-player-name">Enter Your Name:</label>
                <input type="text" id="intro-player-name" placeholder="Enter your name" aria-label="Enter your name" required>
            </div>
            <button id="start-game-from-intro" class="neon-btn start-btn">Start Game</button>
        </div>
    `;

    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);

    // Set up navigation buttons
    const prevButton = document.getElementById('prev-intro-step');
    const nextButton = document.getElementById('next-intro-step');
    const startButton = document.getElementById('start-game-from-intro');
    const steps = overlay.querySelectorAll('.intro-step');
    const dots = overlay.querySelectorAll('.step-dot');

    // Initialize step
    overlayState.tutorialStep = 1;

    // Next button handler
    nextButton.addEventListener('click', () => {
        if (overlayState.tutorialStep < 3) {
            steps[overlayState.tutorialStep - 1].classList.remove('active');
            dots[overlayState.tutorialStep - 1].classList.remove('active');
            overlayState.tutorialStep++;
            steps[overlayState.tutorialStep - 1].classList.add('active');
            dots[overlayState.tutorialStep - 1].classList.add('active');

            prevButton.disabled = false;
            if (overlayState.tutorialStep === 3) {
                nextButton.disabled = true;
            }
        }
    });

    // Previous button handler
    prevButton.addEventListener('click', () => {
        if (overlayState.tutorialStep > 1) {
            steps[overlayState.tutorialStep - 1].classList.remove('active');
            dots[overlayState.tutorialStep - 1].classList.remove('active');
            overlayState.tutorialStep--;
            steps[overlayState.tutorialStep - 1].classList.add('active');
            dots[overlayState.tutorialStep - 1].classList.add('active');

            nextButton.disabled = false;
            if (overlayState.tutorialStep === 1) {
                prevButton.disabled = true;
            }
        }
    });

    // Start button handler
    startButton.addEventListener('click', () => {
        // Get player name
        const playerNameInput = document.getElementById('intro-player-name');
        if (!playerNameInput.value.trim()) {
            playerNameInput.classList.add('error');
            setTimeout(() => playerNameInput.classList.remove('error'), 1000);
            return;
        }

        // Set player name in the main game input
        const mainPlayerNameInput = document.getElementById('player-name');
        if (mainPlayerNameInput) {
            mainPlayerNameInput.value = playerNameInput.value.trim();
        }

        // Replace intro content with countdown
        const introContent = overlay.querySelector('.overlay-content');
        introContent.innerHTML = `
            <h2 class="overlay-title">Get Ready!</h2>
            <div class="countdown-timer">
                <div class="countdown-number">3</div>
            </div>
            <p class="countdown-message">Game starting...</p>
        `;

        // Start countdown
        let count = 3;
        const countdownElement = overlay.querySelector('.countdown-number');

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
                countdownElement.classList.add('pulse');
                setTimeout(() => countdownElement.classList.remove('pulse'), 500);
            } else {
                clearInterval(countdownInterval);
                hideOverlay(overlay);
                overlayState.introShown = true;

                // Start the game
                if (typeof startGame === 'function') {
                    startGame();
                } else if (typeof initializeGame === 'function') {
                    initializeGame();
                }
            }
        }, 1000);
    });

    // Set as active overlay
    overlayState.activeOverlay = overlay;
}

/**
 * Create and show the pause overlay
 */
function showPauseOverlay() {
    // Create overlay container if it doesn't exist
    let overlay = document.getElementById('game-pause-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-pause-overlay';
        overlay.className = 'game-overlay pause-overlay';
        document.body.appendChild(overlay);
    }

    // Set overlay content
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2 class="overlay-title">Game Paused</h2>
            <div class="pause-stats">
                <div class="stat-item">
                    <span class="stat-label">Score</span>
                    <span class="stat-value">${TarotTetris.score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${TarotTetris.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Lines to Level Up</span>
                    <span class="stat-value">${TarotTetris.linesToLevelUp - TarotTetris.linesClearedThisLevel}</span>
                </div>
            </div>
            <div class="pause-buttons">
                <button id="resume-game" class="neon-btn">Resume Game</button>
                <button id="restart-game" class="neon-btn">Restart Game</button>
            </div>
            <div class="keyboard-shortcuts">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <span class="key">P</span>
                        <span>Pause/Resume</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">R</span>
                        <span>Restart Game</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">M</span>
                        <span>Mute Sound</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);

    // Set up button handlers
    const resumeButton = document.getElementById('resume-game');
    const restartButton = document.getElementById('restart-game');

    resumeButton.addEventListener('click', () => {
        hideOverlay(overlay);
        // Resume game logic here
        if (typeof resumeGame === 'function') {
            resumeGame();
        }
    });

    restartButton.addEventListener('click', () => {
        hideOverlay(overlay);
        // Unpause the game
        if (typeof resumeGame === 'function') {
            resumeGame();
        }
        // Restart game logic here
        if (typeof initializeGame === 'function') {
            // Reset game state
            window.gameOver = false;
            // Initialize game
            initializeGame();
            // Make sure the game is in started state
            document.body.classList.add('game-started');
            // Start animation loop
            requestAnimationFrame(window.update);
        }
    });

    // Set as active overlay
    overlayState.activeOverlay = overlay;
}

/**
 * Create and show the game over overlay
 * @param {string} playerName - The player's name
 * @param {number} score - The player's final score
 * @param {number} level - The player's final level
 */
function showGameOverOverlay(playerName, score, level) {
    // Create overlay container if it doesn't exist
    let overlay = document.getElementById('game-over-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.className = 'game-overlay game-over-overlay';
        document.body.appendChild(overlay);
    }

    // Set overlay content
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2 class="overlay-title">Game Over</h2>
            <div class="game-over-message">
                <p>Well played, <span class="player-name">${playerName || 'Player'}</span>!</p>
            </div>
            <div class="final-stats">
                <div class="stat-item">
                    <span class="stat-label">Final Score</span>
                    <span class="stat-value">${score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Level Reached</span>
                    <span class="stat-value">${level}</span>
                </div>
            </div>
            <div class="game-over-buttons">
                <button id="play-again" class="neon-btn">Play Again</button>
                <button id="view-leaderboard" class="neon-btn">View Leaderboard</button>
            </div>
        </div>
    `;

    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);

    // Set up button handlers
    const playAgainButton = document.getElementById('play-again');
    const viewLeaderboardButton = document.getElementById('view-leaderboard');

    playAgainButton.addEventListener('click', () => {
        hideOverlay(overlay);
        // Restart game logic here
        if (typeof initializeGame === 'function') {
            // Reset game state
            window.gameOver = false;
            // Initialize game
            initializeGame();
            // Make sure the game is in started state
            document.body.classList.add('game-started');
            // Start animation loop
            requestAnimationFrame(window.update);
        }
    });

    viewLeaderboardButton.addEventListener('click', () => {
        hideOverlay(overlay);
        // Show leaderboard logic here
        const leaderboardElement = document.getElementById('footer-leaderboard');
        if (leaderboardElement) {
            leaderboardElement.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Set as active overlay
    overlayState.activeOverlay = overlay;
}

/**
 * Create and show the level up overlay
 * @param {number} level - The new level
 */
function showLevelUpOverlay(level) {
    // Create overlay container if it doesn't exist
    let overlay = document.getElementById('level-up-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'level-up-overlay';
        overlay.className = 'game-overlay level-up-overlay';
        document.body.appendChild(overlay);
    }

    // Set overlay content
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2 class="overlay-title">Level Up!</h2>
            <div class="level-up-animation">
                <div class="level-number">${level}</div>
            </div>
            <p class="level-message">The game will now speed up!</p>
        </div>
    `;

    // Show overlay with animation
    overlay.classList.add('visible');

    // Auto-hide after a delay
    setTimeout(() => {
        hideOverlay(overlay);
    }, 2000);

    // Set as active overlay
    overlayState.activeOverlay = overlay;
}

/**
 * Create and show the objectives overlay
 */
function showObjectivesOverlay() {
    // Create overlay container if it doesn't exist
    let overlay = document.getElementById('objectives-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'objectives-overlay';
        overlay.className = 'game-overlay objectives-overlay';
        document.body.appendChild(overlay);
    }

    // Calculate lines needed to level up
    const linesNeeded = TarotTetris.linesToLevelUp - TarotTetris.linesClearedThisLevel;

    // Set overlay content
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2 class="overlay-title">Current Objectives</h2>
            <div class="objectives-list">
                <div class="objective-item">
                    <div class="objective-icon">🧩</div>
                    <div class="objective-details">
                        <div class="objective-name">Clear ${linesNeeded} more line${linesNeeded !== 1 ? 's' : ''}</div>
                        <div class="objective-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(TarotTetris.linesClearedThisLevel / TarotTetris.linesToLevelUp) * 100}%"></div>
                            </div>
                            <div class="progress-text">${TarotTetris.linesClearedThisLevel}/${TarotTetris.linesToLevelUp}</div>
                        </div>
                    </div>
                </div>
                <div class="objective-item">
                    <div class="objective-icon">⬆️</div>
                    <div class="objective-details">
                        <div class="objective-name">Reach Level ${TarotTetris.level + 1}</div>
                        <div class="objective-description">Current: Level ${TarotTetris.level}</div>
                    </div>
                </div>
                <div class="objective-item">
                    <div class="objective-icon">🏆</div>
                    <div class="objective-details">
                        <div class="objective-name">Beat High Score</div>
                        <div class="objective-description">Current: ${TarotTetris.score}</div>
                    </div>
                </div>
            </div>
            <button id="close-objectives" class="neon-btn">Close</button>
        </div>
    `;

    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);

    // Set up close button handler
    const closeButton = document.getElementById('close-objectives');
    closeButton.addEventListener('click', () => {
        hideOverlay(overlay);
    });

    // Set as active overlay
    overlayState.activeOverlay = overlay;
}

/**
 * Hide an overlay with animation
 * @param {HTMLElement} overlay - The overlay element to hide
 */
function hideOverlay(overlay) {
    if (!overlay) return;

    overlay.classList.remove('visible');
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 300); // Match this with CSS transition time

    overlayState.activeOverlay = null;
}

/**
 * Hide all active overlays
 */
function hideAllOverlays() {
    const overlays = document.querySelectorAll('.game-overlay');
    overlays.forEach(overlay => {
        hideOverlay(overlay);
    });

    overlayState.activeOverlay = null;
}

/**
 * Toggle the pause overlay
 */
function togglePauseOverlay() {
    const pauseOverlay = document.getElementById('game-pause-overlay');

    if (pauseOverlay && pauseOverlay.classList.contains('visible')) {
        hideOverlay(pauseOverlay);
        // Resume game logic here
        if (typeof resumeGame === 'function') {
            resumeGame();
        }
    } else {
        showPauseOverlay();
    }
}

// Export functions to global scope
window.showIntroOverlay = showIntroOverlay;
window.showPauseOverlay = showPauseOverlay;
window.showGameOverOverlay = showGameOverOverlay;
window.showLevelUpOverlay = showLevelUpOverlay;
window.showObjectivesOverlay = showObjectivesOverlay;
window.hideOverlay = hideOverlay;
window.hideAllOverlays = hideAllOverlays;
window.togglePauseOverlay = togglePauseOverlay;
