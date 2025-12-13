/**
 * Gamification System for Daughters of Zion
 * Tracks progress, achievements, and interactive elements
 * Philosophy: Combine 420360 retro interactivity with spiritual progression
 */

class DaughtersGamification {
    constructor() {
        this.storageKey = 'daughters_of_zion_progress';
        this.progress = this.loadProgress();
        this.achievements = {
            'first_visit': { name: 'Seeker', desc: 'First visit to the archive', icon: '✦' },
            'veil_1': { name: 'Dust Walker', desc: 'Explored the First Veil', icon: '◇' },
            'veil_2': { name: 'Ash Bearer', desc: 'Explored the Second Veil', icon: '◇' },
            'veil_3': { name: 'Water Keeper', desc: 'Explored the Third Veil', icon: '◇' },
            'veil_4': { name: 'Oil Anointed', desc: 'Explored the Fourth Veil', icon: '◇' },
            'veil_5': { name: 'Wine Blessed', desc: 'Explored the Fifth Veil', icon: '◇' },
            'veil_6': { name: 'Milk Nourished', desc: 'Explored the Sixth Veil', icon: '◇' },
            'veil_7': { name: 'Light Unveiled', desc: 'Explored the Seventh Veil', icon: '◇' },
            'all_veils': { name: 'Veil Master', desc: 'Explored all Seven Veils', icon: '✧' },
            'history': { name: 'Chronicler', desc: 'Read the History', icon: '📜' },
            'rituals': { name: 'Ritualist', desc: 'Studied the Rituals', icon: '🕯️' },
            'hidden_names': { name: 'Name Keeper', desc: 'Discovered Hidden Names', icon: '👁️' },
            'circle_mothers': { name: 'Circle Initiate', desc: 'Met the Circle Mothers', icon: '⭕' },
            'library': { name: 'Librarian', desc: 'Entered the Library', icon: '📚' },
            'moon_calendar': { name: 'Moon Watcher', desc: 'Consulted the Moon Calendar', icon: '🌙' },
            'explorer': { name: 'Explorer', desc: 'Visited all main sections', icon: '🗺️' },
            // Moon phase achievements
            'moon_new': { name: 'Veiled Visitor', desc: 'Visited during New Moon', icon: '🌑' },
            'moon_waxing': { name: 'Ascending Soul', desc: 'Visited during Waxing Moon', icon: '🌒' },
            'moon_full': { name: 'Illuminated One', desc: 'Visited during Full Moon', icon: '🌕' },
            'moon_waning': { name: 'Returning Spirit', desc: 'Visited during Waning Moon', icon: '🌘' },
            'moon_all_phases': { name: 'Lunar Adept', desc: 'Visited during all moon phases', icon: '🌙✨' },
            // Streak achievements
            'streak_3': { name: 'Devoted', desc: '3-day visit streak', icon: '🔥' },
            'streak_7': { name: 'Faithful', desc: '7-day visit streak', icon: '🔥🔥' },
            'streak_30': { name: 'Consecrated', desc: '30-day visit streak', icon: '🔥🔥🔥' },
            // Engagement achievements
            'visits_10': { name: 'Regular Visitor', desc: '10 total visits', icon: '👣' },
            'visits_50': { name: 'Dedicated Student', desc: '50 total visits', icon: '👣👣' },
            'visits_100': { name: 'Circle Sister', desc: '100 total visits', icon: '👣👣👣' }
        };

        this.ranks = [
            { level: 1, name: 'Initiate', minPoints: 0, icon: '◇' },
            { level: 2, name: 'Seeker', minPoints: 5, icon: '◇◇' },
            { level: 3, name: 'Student', minPoints: 10, icon: '◇◇◇' },
            { level: 4, name: 'Sister', minPoints: 20, icon: '✦' },
            { level: 5, name: 'Keeper', minPoints: 35, icon: '✦✦' },
            { level: 6, name: 'Circle Mother', minPoints: 50, icon: '✦✦✦' }
        ];
        this.init();
    }

    init() {
        this.createProgressBar();
        this.createStatsPanel();
        this.createShortcutsHint();
        this.trackPageVisit();
        this.setupKeyboardShortcuts();
        this.markVisitedCards();
        this.setupInteractiveElements();
        this.updateStats();
        this.signalToHub();
        
        // Check for first visit achievement
        if (!this.progress.achievements.includes('first_visit')) {
            this.unlockAchievement('first_visit');
        }
    }

    /**
     * Signal to the Esoteric Hub that user is exploring Daughters of Zion
     * This allows the hub to update its unified tracking system
     */
    signalToHub() {
        // Create a custom event that the hub can listen for
        const signal = new CustomEvent('daughtersProgressUpdate', {
            detail: {
                visitedPages: this.progress.visitedPages,
                achievements: this.progress.achievements,
                totalVisits: this.progress.totalVisits,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(signal);
        
        // Also ensure hub localStorage is aware
        try {
            const hubKey = 'esoteric_hub_progress';
            const hubProgress = localStorage.getItem(hubKey);
            if (!hubProgress) {
                // Initialize hub progress if it doesn't exist
                localStorage.setItem(hubKey, JSON.stringify({
                    hubVisits: 0,
                    unlockedAchievements: [],
                    projectProgress: {},
                    lastVisit: null
                }));
            }
        } catch (error) {
            console.debug('Hub integration signal sent');
        }
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load progress from localStorage:', error);
        }
        return {
            visitedPages: [],
            achievements: [],
            veilsUnlocked: [],
            hiddenNamesRevealed: [],
            totalVisits: 0,
            lastVisit: null,
            moonPhasesVisited: [],
            visitDates: [],
            currentStreak: 0,
            longestStreak: 0,
            intentions: []
        };
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save progress to localStorage:', error);
        }
    }

    trackPageVisit() {
        const currentPage = window.location.pathname;
        if (!this.progress.visitedPages.includes(currentPage)) {
            this.progress.visitedPages.push(currentPage);
        }
        this.progress.totalVisits++;
        this.progress.lastVisit = new Date().toISOString();

        // Initialize arrays if they don't exist
        if (!this.progress.visitDates) {
            this.progress.visitDates = [];
        }
        if (!this.progress.moonPhasesVisited) {
            this.progress.moonPhasesVisited = [];
        }

        // Track visit date for streak calculation
        const today = new Date().toDateString();
        if (!this.progress.visitDates.includes(today)) {
            this.progress.visitDates.push(today);
            this.calculateStreak();
        }

        // Track moon phase
        this.trackMoonPhase();

        // Check for page-specific achievements
        if (currentPage.includes('seven-veils')) {
            for (let i = 1; i <= 7; i++) {
                this.unlockAchievement(`veil_${i}`);
            }
            // Check if all veils unlocked
            const allVeils = [1,2,3,4,5,6,7].every(i => this.progress.achievements.includes(`veil_${i}`));
            if (allVeils) this.unlockAchievement('all_veils');
        }
        if (currentPage.includes('history')) this.unlockAchievement('history');
        if (currentPage.includes('rituals')) this.unlockAchievement('rituals');
        if (currentPage.includes('hidden-names')) this.unlockAchievement('hidden_names');
        if (currentPage.includes('circle-mothers')) this.unlockAchievement('circle_mothers');
        if (currentPage.includes('library')) this.unlockAchievement('library');
        if (currentPage.includes('moon-calendar')) this.unlockAchievement('moon_calendar');

        // Check explorer achievement
        const mainPages = ['history', 'rituals', 'hidden-names', 'circle-mothers', 'library', 'seven-veils', 'moon-calendar'];
        const visitedMain = mainPages.filter(p => this.progress.visitedPages.some(vp => vp.includes(p)));
        if (visitedMain.length >= mainPages.length) {
            this.unlockAchievement('explorer');
        }

        // Check visit count achievements
        if (this.progress.totalVisits >= 10) this.unlockAchievement('visits_10');
        if (this.progress.totalVisits >= 50) this.unlockAchievement('visits_50');
        if (this.progress.totalVisits >= 100) this.unlockAchievement('visits_100');

        this.saveProgress();
        this.signalToHub();
        this.updateProgressBar();
    }

    trackMoonPhase() {
        // Initialize moonPhasesVisited if it doesn't exist
        if (!this.progress.moonPhasesVisited) {
            this.progress.moonPhasesVisited = [];
        }

        // Calculate current moon phase
        const now = new Date();
        const knownNewMoon = new Date('2024-01-11T11:57:00Z');
        const lunarCycle = 29.53058867;
        const daysSinceNew = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
        const moonAge = daysSinceNew % lunarCycle;

        let currentPhase;
        if (moonAge < 1.84566 || moonAge >= 27.68493) {
            currentPhase = 'new';
        } else if (moonAge < 14.76529) {
            currentPhase = 'waxing';
        } else if (moonAge < 16.61095) {
            currentPhase = 'full';
        } else {
            currentPhase = 'waning';
        }

        // Track this phase if not already tracked
        if (!this.progress.moonPhasesVisited.includes(currentPhase)) {
            this.progress.moonPhasesVisited.push(currentPhase);
            this.unlockAchievement(`moon_${currentPhase}`);

            // Check if all phases visited
            if (this.progress.moonPhasesVisited.length >= 4) {
                this.unlockAchievement('moon_all_phases');
            }
        }
    }

    calculateStreak() {
        const dates = this.progress.visitDates.map(d => new Date(d)).sort((a, b) => b - a);
        if (dates.length === 0) {
            this.progress.currentStreak = 0;
            return;
        }

        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if last visit was today or yesterday
        const lastVisit = new Date(dates[0]);
        lastVisit.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) {
            // Streak broken
            this.progress.currentStreak = 1;
        } else {
            // Count consecutive days
            for (let i = 1; i < dates.length; i++) {
                const current = new Date(dates[i]);
                current.setHours(0, 0, 0, 0);
                const previous = new Date(dates[i - 1]);
                previous.setHours(0, 0, 0, 0);
                const diff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

                if (diff === 1) {
                    streak++;
                } else {
                    break;
                }
            }
            this.progress.currentStreak = streak;
        }

        // Update longest streak
        if (this.progress.currentStreak > this.progress.longestStreak) {
            this.progress.longestStreak = this.progress.currentStreak;
        }

        // Check streak achievements
        if (this.progress.currentStreak >= 3) this.unlockAchievement('streak_3');
        if (this.progress.currentStreak >= 7) this.unlockAchievement('streak_7');
        if (this.progress.currentStreak >= 30) this.unlockAchievement('streak_30');
    }

    unlockAchievement(achievementId) {
        if (!this.progress.achievements.includes(achievementId)) {
            this.progress.achievements.push(achievementId);
            this.saveProgress();
            this.showAchievementToast(achievementId);
            this.updateStats();
        }
    }

    showAchievementToast(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.innerHTML = `
            <span class="achievement-icon" aria-hidden="true">${achievement.icon}</span>
            <strong>${achievement.name}</strong><br>
            <small>${achievement.desc}</small>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    createProgressBar() {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.setAttribute('role', 'progressbar');
        container.setAttribute('aria-label', 'Overall exploration progress');
        container.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
        document.body.insertBefore(container, document.body.firstChild);
        this.updateProgressBar();
    }

    updateProgressBar() {
        const totalAchievements = Object.keys(this.achievements).length;
        const unlockedAchievements = this.progress.achievements.length;
        const percentage = (unlockedAchievements / totalAchievements) * 100;

        const progressBar = document.getElementById('progressBar');
        const container = document.querySelector('.progress-container');

        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }

        if (container) {
            container.setAttribute('aria-valuenow', Math.round(percentage));
            container.setAttribute('aria-valuemin', '0');
            container.setAttribute('aria-valuemax', '100');
        }
    }

    createStatsPanel() {
        const panel = document.createElement('div');
        panel.className = 'stats-panel';
        panel.id = 'statsPanel';
        panel.setAttribute('role', 'complementary');
        panel.setAttribute('aria-label', 'Progress statistics');
        panel.innerHTML = `
            <h3>PROGRESS</h3>
            <div class="stat-item stat-rank">
                <span class="stat-label">Rank:</span>
                <span class="stat-value" id="statRank" aria-live="polite">Initiate</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Streak:</span>
                <span class="stat-value" id="statStreak" aria-live="polite">0 🔥</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Veils:</span>
                <span class="stat-value" id="statVeils" aria-live="polite">0/7</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Moon Phases:</span>
                <span class="stat-value" id="statMoonPhases" aria-live="polite">0/4</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Achievements:</span>
                <span class="stat-value" id="statAchievements" aria-live="polite">0/${Object.keys(this.achievements).length}</span>
            </div>
        `;
        document.body.appendChild(panel);
    }

    updateStats() {
        const veilsUnlocked = [1,2,3,4,5,6,7].filter(i =>
            this.progress.achievements.includes(`veil_${i}`)
        ).length;

        const mainPages = ['history', 'rituals', 'hidden-names', 'circle-mothers', 'library', 'seven-veils'];
        const pagesVisited = mainPages.filter(p =>
            this.progress.visitedPages.some(vp => vp.includes(p))
        ).length;

        // Calculate rank
        const points = this.progress.achievements.length;
        const currentRank = this.ranks.slice().reverse().find(r => points >= r.minPoints) || this.ranks[0];

        // Update rank display
        const rankEl = document.getElementById('statRank');
        if (rankEl) {
            rankEl.textContent = `${currentRank.icon} ${currentRank.name}`;
        }

        // Update streak display
        const streakEl = document.getElementById('statStreak');
        if (streakEl) {
            const streakIcon = this.progress.currentStreak >= 7 ? '🔥🔥' :
                              this.progress.currentStreak >= 3 ? '🔥' : '';
            streakEl.textContent = `${this.progress.currentStreak} ${streakIcon}`;
        }

        // Update moon phases
        const moonPhasesEl = document.getElementById('statMoonPhases');
        if (moonPhasesEl) {
            moonPhasesEl.textContent = `${this.progress.moonPhasesVisited.length}/4`;
        }

        const statVeils = document.getElementById('statVeils');
        const statPages = document.getElementById('statPages');
        const statAchievements = document.getElementById('statAchievements');

        if (statVeils) statVeils.textContent = `${veilsUnlocked}/7`;
        if (statPages) statPages.textContent = `${pagesVisited}/6`;
        if (statAchievements) {
            statAchievements.textContent = `${this.progress.achievements.length}/${Object.keys(this.achievements).length}`;
        }
    }

    createShortcutsHint() {
        const hint = document.createElement('div');
        hint.className = 'shortcuts-hint';
        hint.innerHTML = `
            <strong>SHORTCUTS:</strong><br>
            <kbd>H</kbd> Home<br>
            <kbd>V</kbd> Veils<br>
            <kbd>R</kbd> Rituals<br>
            <kbd>L</kbd> Library<br>
            <kbd>?</kbd> Help
        `;
        document.body.appendChild(hint);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

            switch(key) {
                case 'h':
                    window.location.href = basePath + 'index.html';
                    break;
                case 'v':
                    window.location.href = basePath + 'pages/seven-veils.html';
                    break;
                case 'r':
                    window.location.href = basePath + 'pages/rituals.html';
                    break;
                case 'l':
                    window.location.href = basePath + 'pages/library.html';
                    break;
                case 'a':
                    window.location.href = basePath + 'pages/about.html';
                    break;
                case 'c':
                    window.location.href = basePath + 'pages/circle-mothers.html';
                    break;
                case 'n':
                    window.location.href = basePath + 'pages/hidden-names.html';
                    break;
                case '?':
                    this.showHelp();
                    break;
            }
        });
    }

    showHelp() {
        alert(`DAUGHTERS OF ZION - NAVIGATION HELP

Keyboard Shortcuts:
H - Home
V - Seven Veils
R - Rituals
L - Library
A - About
C - Circle Mothers
N - Hidden Names
? - This help

Progress Tracking:
Your exploration progress is automatically saved.
Unlock achievements by visiting different sections.
Complete all Seven Veils to become a Veil Master.

Interactive Elements:
Click on cards to mark them as visited.
Hover over elements for additional effects.
Hidden names can be revealed by clicking.`);
    }

    markVisitedCards() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            const link = card.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (this.progress.visitedPages.some(p => p.includes(href))) {
                    card.classList.add('visited');
                }
            }

            // Add click tracking
            card.addEventListener('click', () => {
                card.classList.add('visited');
            });
        });
    }

    setupInteractiveElements() {
        // Make veil symbols interactive
        const veilSymbols = document.querySelectorAll('.veil-symbol');
        veilSymbols.forEach((symbol, index) => {
            symbol.classList.add('interactive-element');
            symbol.addEventListener('click', () => {
                symbol.classList.add('veil-unlock');
                setTimeout(() => symbol.classList.remove('veil-unlock'), 500);
            });
        });

        // Setup hidden name reveals
        const hiddenNames = document.querySelectorAll('.hidden-name');
        hiddenNames.forEach(name => {
            name.addEventListener('click', () => {
                if (!name.classList.contains('revealed')) {
                    name.classList.add('revealed');
                    const nameText = name.textContent;
                    if (!this.progress.hiddenNamesRevealed.includes(nameText)) {
                        this.progress.hiddenNamesRevealed.push(nameText);
                        this.saveProgress();
                    }
                }
            });
        });

        // Add interactive glow to feature icons
        const featureIcons = document.querySelectorAll('.feature-icon');
        featureIcons.forEach(icon => {
            icon.classList.add('interactive-element');
        });
    }

    // Public method to manually unlock a veil
    unlockVeil(veilNumber) {
        if (veilNumber >= 1 && veilNumber <= 7) {
            this.unlockAchievement(`veil_${veilNumber}`);
        }
    }

    // Public method to get current progress
    getProgress() {
        return {
            ...this.progress,
            percentage: (this.progress.achievements.length / Object.keys(this.achievements).length) * 100
        };
    }

    // Public method to reset progress (for testing)
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            location.reload();
        }
    }
}

// Initialize gamification system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.daughtersGame = new DaughtersGamification();
    });
} else {
    window.daughtersGame = new DaughtersGamification();
}

// Expose to window for console access
window.DaughtersGamification = DaughtersGamification;

