/**
 * Enhanced Esoteric Hub Unified Gamification System
 * Advanced tracking, cross-project achievements, progression, and seasonal events
 * Philosophy: Signal-based architecture with persistent user data and mystical progression
 * 
 * This enhanced system provides:
 * - Comprehensive cross-project achievement tracking
 * - Advanced progression levels with titles
 * - Streak tracking for daily engagement
 * - Seasonal events and challenges
 * - Interconnected mystical experience
 */

class EnhancedEsotericGamification {
    constructor() {
        this.storageKey = 'esoteric_hub_progress';
        this.daughtersStorageKey = 'daughters_of_zion_progress';
        this.keepersStorageKey = 'keepers_of_flame_progress';
        this.goldenDawnStorageKey = 'golden_dawn_progress';
        this.streakStorageKey = 'esoteric_streak_data';
        this.seasonalStorageKey = 'esoteric_seasonal_data';
        
        this.progress = this.loadProgress();
        this.daughtersProgress = this.loadDaughtersProgress();
        this.keepersProgress = this.loadKeepersProgress();
        this.goldenDawnProgress = this.loadGoldenDawnProgress();
        this.streakData = this.loadStreakData();
        this.seasonalData = this.loadSeasonalData();
        
        // Define all esoteric projects
        this.projects = {
            'daughters-of-zion': {
                name: 'The Daughters of Zion',
                icon: '◇◇◇',
                color: '#7b5e8b',
                sections: ['seven-veils', 'rituals', 'hidden-names', 'circle-mothers', 'library', 'moon-calendar', 'history', 'about'],
                achievements: [
                    'veil_1', 'veil_2', 'veil_3', 'veil_4', 'veil_5', 'veil_6', 'veil_7',
                    'all_veils', 'history', 'rituals', 'hidden_names', 'circle_mothers', 'library', 'moon_calendar'
                ]
            },
            'keepers-of-the-flame': {
                name: 'Keepers of the Flame',
                icon: '🔥',
                color: '#d4511a',
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
                color: '#c9a961',
                sections: ['grades', 'tarot', 'kabbalah', 'rituals', 'about'],
                achievements: [
                    'grade_neophyte', 'grade_initiate', 'grade_adept', 'grade_adeptus',
                    'all_major_arcana', 'first_ritual', 'five_rituals', 'all_tools',
                    'element_fire_200', 'element_water_200', 'element_air_200', 'element_earth_200', 'element_spirit_200',
                    'tree_seeker', 'path_walker', 'golden_visionary'
                ]
            }
        };

        // Hub-level achievements - comprehensive cross-project system
        this.hubAchievements = {
            // Trinity and Gateway Achievements
            'esoteric_explorer': { 
                name: 'Esoteric Explorer', 
                desc: 'Visit the Esoteric Hub', 
                icon: '✦',
                category: 'gateway',
                points: 5
            },
            'mystical_trinity': {
                name: 'Mystical Trinity',
                desc: 'Visit all three esoteric projects',
                icon: '◇🔥✨',
                category: 'cross-project',
                points: 25,
                requirement: () => {
                    const daughters = this.daughtersProgress.totalVisits >= 1;
                    const keepers = this.keepersProgress.totalVisits >= 1;
                    const golden = this.goldenDawnProgress.totalVisits >= 1;
                    return daughters && keepers && golden;
                }
            },
            'scholar_of_traditions': {
                name: 'Scholar of Traditions',
                desc: 'Unlock 5 achievements in each of the three projects',
                icon: '📚✦',
                category: 'cross-project',
                points: 50,
                requirement: () => {
                    const daughters = this.daughtersProgress.achievements?.length >= 5;
                    const keepers = this.keepersProgress.achievements?.length >= 5;
                    const golden = this.goldenDawnProgress.achievements?.length >= 5;
                    return daughters && keepers && golden;
                }
            },
            'illuminated_being': {
                name: 'Illuminated Being',
                desc: 'Reach advanced progression in all three traditions',
                icon: '⭐⭐⭐',
                category: 'cross-project',
                points: 100,
                requirement: () => {
                    const daughtersAdvanced = this.countVisitedSections('daughters-of-zion') >= 6;
                    const keepersAdvanced = this.keepersProgress.unlockedStories?.length >= 6;
                    const goldenAdvanced = this.goldenDawnProgress.currentGrade >= 3;
                    return daughtersAdvanced && keepersAdvanced && goldenAdvanced;
                }
            },

            // Daughters of Zion Achievements
            'daughters_initiate': { 
                name: 'Daughters Initiate', 
                desc: 'Begin your journey with the Daughters of Zion', 
                icon: '◇',
                category: 'daughters',
                points: 10,
                requirement: () => this.daughtersProgress.totalVisits >= 1
            },
            'daughters_seeker': { 
                name: 'Daughters Seeker', 
                desc: 'Visit 5 different sections of Daughters of Zion', 
                icon: '◇◇',
                category: 'daughters',
                points: 20,
                requirement: () => this.countVisitedSections('daughters-of-zion') >= 5
            },
            'daughters_master': { 
                name: 'Daughters Master', 
                desc: 'Visit all sections of Daughters of Zion', 
                icon: '◇◇◇',
                category: 'daughters',
                points: 35,
                requirement: () => this.countVisitedSections('daughters-of-zion') >= 8
            },
            'veil_walker': {
                name: 'Veil Walker',
                desc: 'Unlock all Seven Veils achievements',
                icon: '🌙◇',
                category: 'daughters',
                points: 30,
                requirement: () => {
                    const veils = ['veil_1', 'veil_2', 'veil_3', 'veil_4', 'veil_5', 'veil_6', 'veil_7'];
                    return veils.every(v => this.daughtersProgress.achievements?.includes(v));
                }
            },

            // Keepers of the Flame Achievements
            'keepers_initiate': {
                name: 'Keeper Initiate',
                desc: 'Begin your journey with Keepers of the Flame',
                icon: '🔥',
                category: 'keepers',
                points: 10,
                requirement: () => this.keepersProgress.totalVisits >= 1
            },
            'keepers_storyteller': {
                name: 'Accomplished Storyteller',
                desc: 'Unlock 5 stories in Keepers of the Flame',
                icon: '📖',
                category: 'keepers',
                points: 20,
                requirement: () => this.keepersProgress.unlockedStories?.length >= 5
            },
            'keepers_master': {
                name: 'Sacred Fire Master',
                desc: 'Unlock all 8 stories and reach highest rank',
                icon: '🔥✦',
                category: 'keepers',
                points: 35,
                requirement: () => this.keepersProgress.unlockedStories?.length >= 8 && this.keepersProgress.currentFlameStreak >= 7
            },
            'flame_keeper_eternal': {
                name: 'Eternal Flame Keeper',
                desc: 'Maintain a 30-day flame streak',
                icon: '🔥🔥',
                category: 'keepers',
                points: 50,
                requirement: () => this.streakData.currentStreak >= 30
            },

            // The Golden Dawn Achievements
            'golden_seeker': {
                name: 'Golden Seeker',
                desc: 'Begin your journey with The Golden Dawn',
                icon: '✨',
                category: 'golden-dawn',
                points: 10,
                requirement: () => this.goldenDawnProgress.totalVisits >= 1
            },
            'golden_adept': {
                name: 'Adept of the Order',
                desc: 'Achieve Adept grade in The Golden Dawn',
                icon: '🔷',
                category: 'golden-dawn',
                points: 25,
                requirement: () => this.goldenDawnProgress.currentGrade >= 4
            },
            'golden_master': {
                name: 'Adeptus Major',
                desc: 'Achieve the highest grade in The Golden Dawn',
                icon: '⭐',
                category: 'golden-dawn',
                points: 40,
                requirement: () => this.goldenDawnProgress.currentGrade >= 7
            },
            'hermetic_sage': {
                name: 'Hermetic Sage',
                desc: 'Unlock all 22 Major Arcana cards',
                icon: '🎴✨',
                category: 'golden-dawn',
                points: 30,
                requirement: () => this.goldenDawnProgress.unlockedTarotCards?.length >= 22
            },

            // Progression Achievements
            'spiritual_pilgrim': { 
                name: 'Spiritual Pilgrim', 
                desc: 'Achieve 10 unlocked achievements across esoteric content', 
                icon: '🚶',
                category: 'progression',
                points: 15,
                requirement: () => this.getTotalUnlockedAchievements() >= 10
            },
            'enlightened_soul': { 
                name: 'Enlightened Soul', 
                desc: 'Achieve 25 unlocked achievements across esoteric content', 
                icon: '✨',
                category: 'progression',
                points: 40,
                requirement: () => this.getTotalUnlockedAchievements() >= 25
            },
            'cosmic_consciousness': {
                name: 'Cosmic Consciousness',
                desc: 'Achieve 50 unlocked achievements across all traditions',
                icon: '🌌',
                category: 'progression',
                points: 75,
                requirement: () => this.getTotalUnlockedAchievements() >= 50
            },
            'mystical_collector': { 
                name: 'Mystical Collector', 
                desc: 'Unlock achievements from all three esoteric projects', 
                icon: '📚',
                category: 'collection',
                points: 20,
                requirement: () => this.getProjectsWithAchievements().length >= 3
            },

            // Engagement and Dedication
            'dedicated_student': { 
                name: 'Dedicated Student', 
                desc: 'Make 10 visits to the esoteric hub', 
                icon: '📖',
                category: 'engagement',
                points: 10,
                requirement: () => this.progress.hubVisits >= 10
            },
            'circle_sister': { 
                name: 'Circle Sister', 
                desc: 'Make 50 visits to the esoteric hub', 
                icon: '👭',
                category: 'engagement',
                points: 25,
                requirement: () => this.progress.hubVisits >= 50
            },
            'eternal_seeker': {
                name: 'Eternal Seeker',
                desc: 'Make 100 visits to the esoteric hub',
                icon: '∞',
                category: 'engagement',
                points: 50,
                requirement: () => this.progress.hubVisits >= 100
            },
            'weekly_devotion': {
                name: 'Weekly Devotion',
                desc: 'Visit the hub at least once per week for 4 weeks',
                icon: '📅',
                category: 'streak',
                points: 20,
                requirement: () => this.streakData.weeklyStreak >= 4
            },
            'daily_enlightenment': {
                name: 'Daily Enlightenment',
                desc: 'Visit the hub 7 days in a row',
                icon: '☀️',
                category: 'streak',
                points: 30,
                requirement: () => this.streakData.dailyStreak >= 7
            },

            // Seasonal and Special Events
            'equinox_blessing': {
                name: 'Equinox Blessing',
                desc: 'Participate in the spring or fall equinox event',
                icon: '⚖️',
                category: 'seasonal',
                points: 25,
                requirement: () => this.seasonalData.completedSeasons?.includes('equinox')
            },
            'solstice_wisdom': {
                name: 'Solstice Wisdom',
                desc: 'Participate in the summer or winter solstice event',
                icon: '☀️❄️',
                category: 'seasonal',
                points: 25,
                requirement: () => this.seasonalData.completedSeasons?.includes('solstice')
            }
        };

        // Enhanced Rank System with multiple progression paths
        this.ranks = [
            { level: 1, name: 'Initiate', minPoints: 0, icon: '◇', color: '#7b5e8b', description: 'New to the esoteric path' },
            { level: 2, name: 'Seeker', minPoints: 10, icon: '◇◇', color: '#8fbc8f', description: 'Exploring the mysteries' },
            { level: 3, name: 'Wanderer', minPoints: 25, icon: '◇◇◇', color: '#c9a961', description: 'Traversing spiritual realms' },
            { level: 4, name: 'Keeper of Wisdom', minPoints: 50, icon: '✦', color: '#d4af37', description: 'Accumulating sacred knowledge' },
            { level: 5, name: 'Circle Mother', minPoints: 100, icon: '✦✦', color: '#6b4c9a', description: 'Guide to others on the path' },
            { level: 6, name: 'Illuminated Sage', minPoints: 150, icon: '✦✦✦', color: '#4a8c3a', description: 'Living the eternal flame' },
            { level: 7, name: 'Ascended Master', minPoints: 250, icon: '∞✦', color: '#ffd700', description: 'Master of all three traditions' }
        ];

        // Seasonal Events
        this.seasonalEvents = {
            'spring_equinox': {
                name: 'Spring Equinox: Balance & Renewal',
                season: 'spring',
                description: 'Celebrate the balance of day and night. Explore themes of renewal and rebirth across all traditions.',
                icon: '🌱',
                active: this.isSeasonActive('spring'),
                challenges: [
                    { name: 'Visit all three projects', reward: 10 },
                    { name: 'Unlock 3 new achievements', reward: 15 }
                ]
            },
            'summer_solstice': {
                name: 'Summer Solstice: Maximum Light',
                season: 'summer',
                description: 'Embrace the pinnacle of light and energy. Engage deeply with fire-related traditions.',
                icon: '☀️',
                active: this.isSeasonActive('summer'),
                challenges: [
                    { name: 'Unlock 5 Keepers of the Flame stories', reward: 20 },
                    { name: 'Maintain a 7-day hub streak', reward: 15 }
                ]
            },
            'autumn_equinox': {
                name: 'Autumn Equinox: Harvest & Reflection',
                season: 'autumn',
                description: 'Reflect on growth and gather wisdom. Explore the library and mystical knowledge.',
                icon: '🍂',
                active: this.isSeasonActive('autumn'),
                challenges: [
                    { name: 'Visit all Daughters sections', reward: 20 },
                    { name: 'Unlock library achievements', reward: 15 }
                ]
            },
            'winter_solstice': {
                name: 'Winter Solstice: Eternal Return',
                season: 'winter',
                description: 'Honor the eternal cycle of darkness and rebirth. Advance through The Golden Dawn.',
                icon: '❄️',
                active: this.isSeasonActive('winter'),
                challenges: [
                    { name: 'Progress to a new Golden Dawn grade', reward: 25 },
                    { name: 'Unlock 10 achievements', reward: 15 }
                ]
            }
        };
    }

    /**
     * Initialize the gamification system
     */
    init() {
        this.trackHubVisit();
        this.updateStreakData();
        this.renderStats();
        this.renderAchievements();
        this.renderCrossProjectAchievements();
        this.renderSeasonalEvents();
        this.renderProgressTracking();
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
            lastVisit: null,
            totalTimeSpent: 0
        };
    }

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
            totalVisits: 0,
            timeSpent: 0
        };
    }

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
            currentFlameStreak: 0,
            timeSpent: 0
        };
    }

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
            achievements: [],
            timeSpent: 0
        };
    }

    loadStreakData() {
        try {
            const saved = localStorage.getItem(this.streakStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load streak data:', error);
        }
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastVisitDate: null,
            dailyStreak: 0,
            weeklyStreak: 0,
            visits: []
        };
    }

    loadSeasonalData() {
        try {
            const saved = localStorage.getItem(this.seasonalStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load seasonal data:', error);
        }
        return {
            completedSeasons: [],
            activeEventProgress: {},
            seasonalAchievements: []
        };
    }

    /**
     * Save progress
     */
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
            localStorage.setItem(this.streakStorageKey, JSON.stringify(this.streakData));
            localStorage.setItem(this.seasonalStorageKey, JSON.stringify(this.seasonalData));
        } catch (error) {
            console.warn('Failed to save esoteric progress:', error);
        }
    }

    /**
     * Track hub visit and update streaks
     */
    trackHubVisit() {
        this.progress.hubVisits++;
        this.progress.lastVisit = new Date().toISOString();
        this.saveProgress();
    }

    /**
     * Update streak data based on visit patterns
     */
    updateStreakData() {
        const today = new Date().toDateString();
        const lastVisit = this.streakData.lastVisitDate;

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastVisit === yesterday.toDateString()) {
                // Continued streak
                this.streakData.currentStreak++;
                this.streakData.dailyStreak++;
            } else {
                // Streak broken
                if (this.streakData.currentStreak > this.streakData.longestStreak) {
                    this.streakData.longestStreak = this.streakData.currentStreak;
                }
                this.streakData.currentStreak = 1;
                this.streakData.dailyStreak = 1;
            }

            this.streakData.lastVisitDate = today;
            this.streakData.visits.push(today);
            this.saveProgress();
        }
    }

    /**
     * Check if a season is active based on current date
     */
    isSeasonActive(season) {
        const month = new Date().getMonth();
        switch(season) {
            case 'spring': return month >= 2 && month <= 4; // Mar-May
            case 'summer': return month >= 5 && month <= 7; // Jun-Aug
            case 'autumn': return month >= 8 && month <= 10; // Sep-Nov
            case 'winter': return month >= 11 || month <= 1; // Dec-Feb
            default: return false;
        }
    }

    /**
     * Get current rank
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
     * Get next rank
     */
    getNextRank() {
        const currentRank = this.getCurrentRank();
        return this.ranks.find(r => r.level === currentRank.level + 1);
    }

    /**
     * Calculate total points
     */
    getTotalPoints() {
        let points = 0;
        
        // Points from hub achievements
        for (let achievementKey of this.progress.unlockedAchievements) {
            const achievement = this.hubAchievements[achievementKey];
            if (achievement && achievement.points) {
                points += achievement.points;
            }
        }
        
        // Points from other projects (bonus multiplier)
        if (this.daughtersProgress?.achievements) {
            points += this.daughtersProgress.achievements.length * 1.5;
        }
        if (this.keepersProgress?.achievements) {
            points += this.keepersProgress.achievements.length * 1.5;
        }
        if (this.goldenDawnProgress?.achievements) {
            points += this.goldenDawnProgress.achievements.length * 1.5;
        }
        
        return Math.floor(points);
    }

    /**
     * Get total unlocked achievements across all projects
     */
    getTotalUnlockedAchievements() {
        let total = this.progress.unlockedAchievements.length;
        if (this.daughtersProgress?.achievements) {
            total += this.daughtersProgress.achievements.length;
        }
        if (this.keepersProgress?.achievements) {
            total += this.keepersProgress.achievements.length;
        }
        if (this.goldenDawnProgress?.achievements) {
            total += this.goldenDawnProgress.achievements.length;
        }
        return total;
    }

    /**
     * Count visited sections for a project
     */
    countVisitedSections(projectKey) {
        if (projectKey === 'daughters-of-zion') {
            if (!this.daughtersProgress?.visitedPages) {
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
        return 0;
    }

    /**
     * Get projects with achievements
     */
    getProjectsWithAchievements() {
        let projects = [];
        
        if (this.progress.unlockedAchievements.length > 0) {
            projects.push('hub');
        }
        if (this.daughtersProgress?.achievements?.length > 0) {
            projects.push('daughters-of-zion');
        }
        if (this.keepersProgress?.achievements?.length > 0) {
            projects.push('keepers-of-the-flame');
        }
        if (this.goldenDawnProgress?.achievements?.length > 0) {
            projects.push('golden-dawn');
        }
        
        return projects;
    }

    /**
     * Check and unlock achievements
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
     * Show achievement toast
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
                <div class="toast-desc">+${achievement.points || 10} points</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('closing');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    /**
     * Render main stats
     */
    renderStats() {
        const totalAchievements = this.getTotalUnlockedAchievements();
        const currentRank = this.getCurrentRank();
        const hubVisits = this.progress.hubVisits;
        const points = this.getTotalPoints();

        // Update achievements
        const achEl = document.getElementById('stat-achievements');
        if (achEl) {
            achEl.textContent = totalAchievements.toString();
        }

        // Update rank
        const rankEl = document.getElementById('stat-rank');
        if (rankEl) {
            rankEl.textContent = currentRank.name;
            rankEl.style.color = currentRank.color;
        }

        // Update visits
        const visitsEl = document.getElementById('stat-visits');
        if (visitsEl) {
            visitsEl.textContent = hubVisits.toString();
        }
    }

    /**
     * Render achievement grid
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
                <div class="achievement-points">+${achievement.points || 10} pts</div>
            `;
            
            container.appendChild(card);
        }
    }

    /**
     * Render cross-project achievements
     */
    renderCrossProjectAchievements() {
        const container = document.getElementById('cross-achievement-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const crossProjectAchievements = Object.entries(this.hubAchievements)
            .filter(([_, ach]) => ach.category === 'cross-project');
        
        if (crossProjectAchievements.length === 0) {
            container.innerHTML = '<p>No cross-project achievements yet.</p>';
            return;
        }
        
        for (let [key, achievement] of crossProjectAchievements) {
            const isUnlocked = this.progress.unlockedAchievements.includes(key);
            
            const card = document.createElement('div');
            card.className = `cross-achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="cross-ach-icon">${achievement.icon}</div>
                <div class="cross-ach-content">
                    <div class="cross-ach-name">${achievement.name}</div>
                    <div class="cross-ach-desc">${achievement.desc}</div>
                </div>
                <div class="cross-ach-status">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
            `;
            
            container.appendChild(card);
        }
    }

    /**
     * Render seasonal events
     */
    renderSeasonalEvents() {
        // Placeholder for seasonal event rendering
        // This would be expanded with full seasonal UI
    }

    /**
     * Render progression tracking
     */
    renderProgressTracking() {
        // Render project progress
        const daughtersProgressEl = document.getElementById('daughters-progress-showcase');
        if (daughtersProgressEl) {
            const sections = this.countVisitedSections('daughters-of-zion');
            const achievements = this.daughtersProgress.achievements?.length || 0;
            
            const sectionsEl = daughtersProgressEl.querySelector('#daughters-sections');
            const achievementsEl = daughtersProgressEl.querySelector('#daughters-achievements');
            
            if (sectionsEl) sectionsEl.textContent = `${sections} / 8`;
            if (achievementsEl) achievementsEl.textContent = achievements.toString();
        }

        const keepersProgressEl = document.getElementById('keepers-progress-showcase');
        if (keepersProgressEl) {
            const stories = this.keepersProgress.unlockedStories?.length || 0;
            const achievements = this.keepersProgress.achievements?.length || 0;
            
            const storiesEl = keepersProgressEl.querySelector('#keepers-stories');
            const achievementsEl = keepersProgressEl.querySelector('#keepers-achievements');
            
            if (storiesEl) storiesEl.textContent = `${stories} / 8`;
            if (achievementsEl) achievementsEl.textContent = achievements.toString();
        }

        const goldenProgressEl = document.getElementById('golden-progress-showcase');
        if (goldenProgressEl) {
            const gradeNames = ['Neophyte', 'Initiate', 'Adept', 'Adeptus', 'Master', 'Master Adept', 'Exempt'];
            const grade = gradeNames[this.goldenDawnProgress.currentGrade] || 'Neophyte';
            const achievements = this.goldenDawnProgress.achievements?.length || 0;
            
            const gradeEl = goldenProgressEl.querySelector('#golden-grade');
            const achievementsEl = goldenProgressEl.querySelector('#golden-achievements');
            
            if (gradeEl) gradeEl.textContent = grade;
            if (achievementsEl) achievementsEl.textContent = achievements.toString();
        }
    }

    /**
     * Update progress bar animation
     */
    updateProgressBar() {
        setInterval(() => {
            this.daughtersProgress = this.loadDaughtersProgress();
            this.keepersProgress = this.loadKeepersProgress();
            this.goldenDawnProgress = this.loadGoldenDawnProgress();
            this.checkAndUnlockAchievements();
            this.renderStats();
            this.renderAchievements();
            this.renderCrossProjectAchievements();
            this.renderProgressTracking();
        }, 2000);
    }

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
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
    module.exports = EnhancedEsotericGamification;
}
