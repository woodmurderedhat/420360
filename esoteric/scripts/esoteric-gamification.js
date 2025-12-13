/**
 * Esoteric Hub Unified Gamification System
 * Tracks progress and achievements across all esoteric content
 * Philosophy: Signal-based architecture with persistent user data
 * 
 * This system acts as the central hub for all esoteric explorations,
 * aggregating data from the Daughters of Zion and providing unified
 * progression tracking across all mystical journeys.
 */

class EsotericGamification {
    constructor() {
        this.storageKey = 'esoteric_hub_progress';
        this.daughtersStorageKey = 'daughters_of_zion_progress';
        this.keepersStorageKey = 'keepers_of_flame_progress';
        this.goldenDawnStorageKey = 'golden_dawn_progress';
        this.progress = this.loadProgress();
        this.daughtersProgress = this.loadDaughtersProgress();
        this.keepersProgress = this.loadKeepersProgress();
        this.goldenDawnProgress = this.loadGoldenDawnProgress();
        
        // Define all esoteric projects
        this.projects = {
            'daughters-of-zion': {
                name: 'The Daughters of Zion',
                icon: '◇◇◇',
                sections: ['seven-veils', 'rituals', 'hidden-names', 'circle-mothers', 'library', 'moon-calendar', 'history', 'about'],
                achievements: [
                    'veil_1', 'veil_2', 'veil_3', 'veil_4', 'veil_5', 'veil_6', 'veil_7',
                    'all_veils', 'history', 'rituals', 'hidden_names', 'circle_mothers', 'library', 'moon_calendar'
                ]
            },
            'keepers-of-the-flame': {
                name: 'Keepers of the Flame',
                icon: '🔥',
                sections: ['stories', 'traditions', 'about'],
                achievements: [
                    'story_creation_myth', 'story_ahura_wisdom', 'story_heroic_zarathustra', 'story_fire_prophecy',
                    'story_seasonal_renewal', 'story_courage_tale', 'story_friendship_circle', 'story_yalda_eternal',
                    'flame_keeper_week', 'storyteller_spark', 'storyteller_ember', 'storyteller_flame',
                    'storyteller_bonfire', 'storyteller_sacred', 'all_stories', 'all_seasons'
                ]
            },
            'golden-dawn': {
                name: 'The Golden Dawn',
                icon: '✨',
                sections: ['grades', 'tarot', 'kabbalah', 'rituals', 'about'],
                achievements: [
                    'grade_neophyte', 'grade_initiate', 'grade_adept', 'grade_adeptus',
                    'all_major_arcana', 'first_ritual', 'five_rituals', 'all_tools',
                    'element_fire_200', 'element_water_200', 'element_air_200', 'element_earth_200', 'element_spirit_200',
                    'tree_seeker', 'path_walker', 'golden_visionary'
                ]
            }
        };
        
        // Hub-level achievements - expanded for new projects
        this.hubAchievements = {
            'esoteric_explorer': { 
                name: 'Esoteric Explorer', 
                desc: 'Visit the Esoteric Hub', 
                icon: '✦',
                category: 'hub'
            },
            'daughters_initiate': { 
                name: 'Daughters Initiate', 
                desc: 'Begin your journey with the Daughters of Zion', 
                icon: '◇',
                category: 'daughters',
                requirement: () => this.daughtersProgress.totalVisits >= 1
            },
            'daughters_seeker': { 
                name: 'Daughters Seeker', 
                desc: 'Visit 5 different sections of Daughters of Zion', 
                icon: '◇◇',
                category: 'daughters',
                requirement: () => this.countVisitedSections('daughters-of-zion') >= 5
            },
            'daughters_master': { 
                name: 'Daughters Master', 
                desc: 'Visit all sections of Daughters of Zion', 
                icon: '◇◇◇',
                category: 'daughters',
                requirement: () => this.countVisitedSections('daughters-of-zion') >= 8
            },
            'keepers_initiate': {
                name: 'Keeper Initiate',
                desc: 'Begin your journey with Keepers of the Flame',
                icon: '🔥',
                category: 'keepers',
                requirement: () => this.keepersProgress.totalVisits >= 1
            },
            'keepers_storyteller': {
                name: 'Accomplished Storyteller',
                desc: 'Unlock 5 stories in Keepers of the Flame',
                icon: '📖',
                category: 'keepers',
                requirement: () => this.keepersProgress.unlockedStories.length >= 5
            },
            'keepers_master': {
                name: 'Sacred Fire Master',
                desc: 'Unlock all 8 stories and reach highest rank',
                icon: '🔥✦',
                category: 'keepers',
                requirement: () => this.keepersProgress.unlockedStories.length >= 8 && this.keepersProgress.currentFlameStreak >= 7
            },
            'golden_seeker': {
                name: 'Golden Seeker',
                desc: 'Begin your journey with The Golden Dawn',
                icon: '✨',
                category: 'golden-dawn',
                requirement: () => this.goldenDawnProgress.totalVisits >= 1
            },
            'golden_adept': {
                name: 'Adept of the Order',
                desc: 'Achieve Adept grade in The Golden Dawn',
                icon: '🔷',
                category: 'golden-dawn',
                requirement: () => this.goldenDawnProgress.currentGrade >= 4
            },
            'golden_master': {
                name: 'Adeptus Major',
                desc: 'Achieve the highest grade in The Golden Dawn',
                icon: '⭐',
                category: 'golden-dawn',
                requirement: () => this.goldenDawnProgress.currentGrade >= 7
            },
            'spiritual_pilgrim': { 
                name: 'Spiritual Pilgrim', 
                desc: 'Achieve 10 unlocked achievements across esoteric content', 
                icon: '🚶',
                category: 'progression',
                requirement: () => this.getTotalUnlockedAchievements() >= 10
            },
            'enlightened_soul': { 
                name: 'Enlightened Soul', 
                desc: 'Achieve 25 unlocked achievements across esoteric content', 
                icon: '✨',
                category: 'progression',
                requirement: () => this.getTotalUnlockedAchievements() >= 25
            },
            'mystical_collector': { 
                name: 'Mystical Collector', 
                desc: 'Unlock achievements from multiple esoteric projects', 
                icon: '📚',
                category: 'collection',
                requirement: () => this.getProjectsWithAchievements().length > 1
            },
            'lunar_devotee': { 
                name: 'Lunar Devotee', 
                desc: 'Unlock all moon phase achievements in Daughters of Zion', 
                icon: '🌙',
                category: 'daughters',
                requirement: () => this.checkMoonPhaseAchievements()
            },
            'dedicated_student': { 
                name: 'Dedicated Student', 
                desc: 'Make 10 visits to the esoteric hub', 
                icon: '📖',
                category: 'hub',
                requirement: () => this.progress.hubVisits >= 10
            },
            'circle_sister': { 
                name: 'Circle Sister', 
                desc: 'Make 50 visits to the esoteric hub', 
                icon: '👭',
                category: 'hub',
                requirement: () => this.progress.hubVisits >= 50
            }
        };
        
        // Rank definitions
        this.ranks = [
            { level: 1, name: 'Initiate', minPoints: 0, icon: '◇', color: '#7b5e8b' },
            { level: 2, name: 'Seeker', minPoints: 5, icon: '◇◇', color: '#8fbc8f' },
            { level: 3, name: 'Wanderer', minPoints: 15, icon: '◇◇◇', color: '#c9a961' },
            { level: 4, name: 'Keeper', minPoints: 30, icon: '✦', color: '#d4af37' },
            { level: 5, name: 'Circle Mother', minPoints: 50, icon: '✦✦', color: '#6b4c9a' },
            { level: 6, name: 'Enlightened', minPoints: 100, icon: '✦✦✦', color: '#4a8c3a' }
        ];
    }

    /**
     * Initialize the gamification system
     */
    init() {
        this.trackHubVisit();
        this.renderStats();
        this.renderAchievements();
        this.setupMobileMenu();
        this.checkAndUnlockAchievements();
        this.updateProgressBar();
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load esoteric progress:', error);
        }
        return {
            hubVisits: 0,
            unlockedAchievements: [],
            projectProgress: {},
            lastVisit: null
        };
    }

    /**
     * Load Daughters of Zion progress for aggregation
     */
    loadDaughtersProgress() {
        try {
            const saved = localStorage.getItem(this.daughtersStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load daughters progress:', error);
        }
        return {
            visitedPages: [],
            achievements: [],
            totalVisits: 0
        };
    }

    /**
     * Load Keepers of the Flame progress for aggregation
     */
    loadKeepersProgress() {
        try {
            const saved = localStorage.getItem(this.keepersStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load keepers progress:', error);
        }
        return {
            totalVisits: 0,
            unlockedStories: [],
            achievements: [],
            currentFlameStreak: 0
        };
    }

    /**
     * Load The Golden Dawn progress for aggregation
     */
    loadGoldenDawnProgress() {
        try {
            const saved = localStorage.getItem(this.goldenDawnStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load golden dawn progress:', error);
        }
        return {
            totalVisits: 0,
            currentGrade: 0,
            unlockedTarotCards: [],
            completedRituals: [],
            achievements: []
        };
    }

    /**
     * Save hub progress
     */
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save esoteric progress:', error);
        }
    }

    /**
     * Track a hub visit
     */
    trackHubVisit() {
        this.progress.hubVisits++;
        this.progress.lastVisit = new Date().toISOString();
        this.saveProgress();
    }

    /**
     * Get the current rank
     */
    getCurrentRank() {
        const points = this.getTotalPoints();
        let currentRank = this.ranks[0];
        
        for (let rank of this.ranks) {
            if (points >= rank.minPoints) {
                currentRank = rank;
            }
        }
        
        return currentRank;
    }

    /**
     * Calculate total points from achievements
     */
    getTotalPoints() {
        let points = 0;
        
        // 1 point per unlocked hub achievement
        points += this.progress.unlockedAchievements.length;
        
        // 1 point per unlocked daughters achievement
        if (this.daughtersProgress && this.daughtersProgress.achievements) {
            points += this.daughtersProgress.achievements.length;
        }
        
        // 1 point per unlocked keepers achievement
        if (this.keepersProgress && this.keepersProgress.achievements) {
            points += this.keepersProgress.achievements.length;
        }
        
        // 1 point per unlocked golden dawn achievement
        if (this.goldenDawnProgress && this.goldenDawnProgress.achievements) {
            points += this.goldenDawnProgress.achievements.length;
        }
        
        return points;
    }

    /**
     * Get total unlocked achievements across all projects
     */
    getTotalUnlockedAchievements() {
        let total = this.progress.unlockedAchievements.length;
        if (this.daughtersProgress && this.daughtersProgress.achievements) {
            total += this.daughtersProgress.achievements.length;
        }
        if (this.keepersProgress && this.keepersProgress.achievements) {
            total += this.keepersProgress.achievements.length;
        }
        if (this.goldenDawnProgress && this.goldenDawnProgress.achievements) {
            total += this.goldenDawnProgress.achievements.length;
        }
        return total;
    }

    /**
     * Count visited sections for a project
     */
    countVisitedSections(projectKey) {
        if (!this.daughtersProgress || !this.daughtersProgress.visitedPages) {
            return 0;
        }
        
        const sections = this.projects[projectKey].sections;
        let count = 0;
        
        for (let section of sections) {
            if (this.daughtersProgress.visitedPages.some(p => p.includes(section))) {
                count++;
            }
        }
        
        return count;
    }

    /**
     * Check moon phase achievements
     */
    checkMoonPhaseAchievements() {
        if (!this.daughtersProgress || !this.daughtersProgress.achievements) {
            return false;
        }
        
        const moonAchievements = [
            'moon_new', 'moon_waxing', 'moon_full', 'moon_waning'
        ];
        
        return moonAchievements.every(a => 
            this.daughtersProgress.achievements.includes(a)
        );
    }

    /**
     * Get projects with achievements
     */
    getProjectsWithAchievements() {
        let projects = [];
        
        // Check hub achievements
        if (this.progress.unlockedAchievements.length > 0) {
            projects.push('hub');
        }
        
        // Check daughters achievements
        if (this.daughtersProgress && this.daughtersProgress.achievements && 
            this.daughtersProgress.achievements.length > 0) {
            projects.push('daughters-of-zion');
        }
        
        // Check keepers achievements
        if (this.keepersProgress && this.keepersProgress.achievements && 
            this.keepersProgress.achievements.length > 0) {
            projects.push('keepers-of-the-flame');
        }
        
        // Check golden dawn achievements
        if (this.goldenDawnProgress && this.goldenDawnProgress.achievements && 
            this.goldenDawnProgress.achievements.length > 0) {
            projects.push('golden-dawn');
        }
        
        return projects;
    }

    /**
     * Check and unlock achievements based on conditions
     */
    checkAndUnlockAchievements() {
        for (let [key, achievement] of Object.entries(this.hubAchievements)) {
            if (!this.progress.unlockedAchievements.includes(key)) {
                if (achievement.requirement && achievement.requirement()) {
                    this.unlockAchievement(key);
                }
            }
        }
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(key) {
        if (!this.progress.unlockedAchievements.includes(key)) {
            this.progress.unlockedAchievements.push(key);
            this.saveProgress();
            
            const achievement = this.hubAchievements[key];
            if (achievement) {
                this.showToast(achievement);
            }
        }
    }

    /**
     * Show achievement toast notification
     */
    showToast(achievement) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">${achievement.icon}</div>
            <div class="toast-content">
                <div class="toast-title">Achievement Unlocked!</div>
                <div>${achievement.name}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('closing');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    /**
     * Render stats section
     */
    renderStats() {
        const totalSections = this.countVisitedSections('daughters-of-zion');
        const totalAchievements = this.getTotalUnlockedAchievements();
        const currentRank = this.getCurrentRank();
        const hubVisits = this.progress.hubVisits;
        
        // Update pages visited stat
        const pagesEl = document.getElementById('stat-pages');
        if (pagesEl) {
            pagesEl.textContent = `${totalSections} of 8`;
        }
        const pagesFill = document.getElementById('progress-pages');
        if (pagesFill) {
            pagesFill.style.width = `${(totalSections / 8) * 100}%`;
        }
        
        // Update achievements stat
        const achEl = document.getElementById('stat-achievements');
        if (achEl) {
            achEl.textContent = totalAchievements.toString();
        }
        const achFill = document.getElementById('progress-achievements');
        if (achFill) {
            achFill.style.width = `${Math.min((totalAchievements / 35) * 100, 100)}%`;
        }
        
        // Update rank stat
        const rankEl = document.getElementById('stat-rank');
        if (rankEl) {
            rankEl.textContent = currentRank.name;
            rankEl.style.color = currentRank.color;
        }
        const rankFill = document.getElementById('progress-rank');
        if (rankFill) {
            const points = this.getTotalPoints();
            const nextRank = this.ranks.find(r => r.level === currentRank.level + 1);
            const nextMinPoints = nextRank ? nextRank.minPoints : currentRank.minPoints + 50;
            const progress = ((points - currentRank.minPoints) / (nextMinPoints - currentRank.minPoints)) * 100;
            rankFill.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Update visits stat
        const visitsEl = document.getElementById('stat-visits');
        if (visitsEl) {
            visitsEl.textContent = hubVisits.toString();
        }
        const visitsFill = document.getElementById('progress-visits');
        if (visitsFill) {
            visitsFill.style.width = `${Math.min((hubVisits / 50) * 100, 100)}%`;
        }
    }

    /**
     * Render achievements section
     */
    renderAchievements() {
        const container = document.getElementById('achievement-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let [key, achievement] of Object.entries(this.hubAchievements)) {
            const isUnlocked = this.progress.unlockedAchievements.includes(key);
            
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            
            container.appendChild(card);
        }
    }

    /**
     * Update progress bar animation
     */
    updateProgressBar() {
        // Reload stats periodically to catch changes
        setInterval(() => {
            this.daughtersProgress = this.loadDaughtersProgress();
            this.checkAndUnlockAchievements();
            this.renderStats();
            this.renderAchievements();
        }, 1000);
    }

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
            // Close menu when a link is clicked
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                });
            });
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EsotericGamification;
}
