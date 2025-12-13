/**
 * Keepers of the Flame - Project-Specific Gamification
 * Integrates with the Esoteric Hub unified gamification system
 * 
 * Core Mechanics:
 * - Story Collection: Unlock stories by visiting during different times/conditions
 * - Fire-Tending: Daily visit streaks keep the "sacred flame" burning
 * - Storyteller Ranks: Spark → Ember → Flame → Bonfire → Sacred Fire
 * - Seasonal Cycles: Tied to Zoroastrian festivals
 */

class KeepersOfTheFlamGamification {
    constructor() {
        this.storageKey = 'keepers_of_flame_progress';
        this.progress = this.loadProgress();
        this.currentDate = new Date();
        this.seasonalFestivals = {
            'nowruz': { month: 2, day: 21, name: 'Nowruz (Spring Renewal)' },
            'tirgan': { month: 6, day: 15, name: 'Tirgan (Courage)' },
            'mehregan': { month: 9, day: 16, name: 'Mehregan (Friendship)' },
            'yalda': { month: 11, day: 30, name: 'Yalda Night (Winter)' }
        };
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
            console.warn('Failed to load Keepers of the Flame progress:', error);
        }
        return {
            totalVisits: 0,
            visitedPages: [],
            unlockedStories: [],
            achievements: [],
            currentFlameStreak: 0,
            lastVisitDate: null,
            storytellerRank: 0, // 0: Spark, 1: Ember, 2: Flame, 3: Bonfire, 4: Sacred Fire
            storyProgress: {},
            seasonalVisits: {}
        };
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save Keepers of the Flame progress:', error);
        }
    }

    /**
     * Track a page visit
     */
    trackPageVisit(pageName) {
        this.progress.totalVisits++;
        
        if (!this.progress.visitedPages.includes(pageName)) {
            this.progress.visitedPages.push(pageName);
        }
        
        // Update flame streak
        this.updateFlameStreak();
        
        // Track seasonal visits
        this.trackSeasonalVisit();
        
        // Check for story unlocks based on visit patterns
        this.checkStoryUnlocks();
        
        // Update rank
        this.updateRank();
        
        this.saveProgress();
        this.signalHubUpdate();
    }

    /**
     * Update the sacred flame streak
     */
    updateFlameStreak() {
        const today = new Date().toDateString();
        const lastVisit = this.progress.lastVisitDate;
        
        if (lastVisit === today) {
            // Already visited today, don't increment
            return;
        }
        
        const lastDate = lastVisit ? new Date(this.progress.lastVisitDate) : null;
        const todayDate = new Date();
        
        if (lastDate) {
            const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                // Consecutive day - increase streak
                this.progress.currentFlameStreak++;
            } else if (daysDiff > 1) {
                // Streak broken - reset
                this.progress.currentFlameStreak = 1;
            }
        } else {
            // First visit
            this.progress.currentFlameStreak = 1;
        }
        
        this.progress.lastVisitDate = today;
    }

    /**
     * Track visits during seasonal festivals
     */
    trackSeasonalVisit() {
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();
        
        for (let [key, festival] of Object.entries(this.seasonalFestivals)) {
            if (festival.month - 1 === month) {
                const weekOfMonth = Math.floor(day / 7);
                const seasonKey = `${key}_week_${weekOfMonth}`;
                
                if (!this.progress.seasonalVisits[seasonKey]) {
                    this.progress.seasonalVisits[seasonKey] = 0;
                }
                this.progress.seasonalVisits[seasonKey]++;
            }
        }
    }

    /**
     * Check for story unlocks based on conditions
     */
    checkStoryUnlocks() {
        const stories = [
            {
                id: 'creation_myth',
                name: 'The Creation Myth',
                unlockedAt: () => this.progress.totalVisits >= 1,
                theme: 'creation'
            },
            {
                id: 'ahura_wisdom',
                name: 'Ahura Mazda\'s Wisdom',
                unlockedAt: () => this.progress.totalVisits >= 5,
                theme: 'wisdom'
            },
            {
                id: 'heroic_zarathustra',
                name: 'The Hero\'s Journey of Zarathustra',
                unlockedAt: () => this.progress.totalVisits >= 10,
                theme: 'hero'
            },
            {
                id: 'fire_prophecy',
                name: 'The Sacred Fire Prophecy',
                unlockedAt: () => this.progress.currentFlameStreak >= 7,
                theme: 'prophecy'
            },
            {
                id: 'seasonal_renewal',
                name: 'Nowruz: The Season of Renewal',
                unlockedAt: () => this.visitedSeasonalFestival('nowruz'),
                theme: 'seasonal'
            },
            {
                id: 'courage_tale',
                name: 'Tirgan: The Tale of Courage',
                unlockedAt: () => this.visitedSeasonalFestival('tirgan'),
                theme: 'seasonal'
            },
            {
                id: 'friendship_circle',
                name: 'Mehregan: The Gathering Circle',
                unlockedAt: () => this.visitedSeasonalFestival('mehregan'),
                theme: 'seasonal'
            },
            {
                id: 'yalda_eternal',
                name: 'Yalda: The Eternal Flame',
                unlockedAt: () => this.visitedSeasonalFestival('yalda'),
                theme: 'seasonal'
            }
        ];
        
        for (let story of stories) {
            if (!this.progress.unlockedStories.includes(story.id) && story.unlockedAt()) {
                this.progress.unlockedStories.push(story.id);
                this.unlockAchievement(`story_${story.id}`);
            }
        }
    }

    /**
     * Check if a seasonal festival was visited
     */
    visitedSeasonalFestival(festivalKey) {
        return Object.keys(this.progress.seasonalVisits).some(k => k.startsWith(festivalKey));
    }

    /**
     * Update storyteller rank based on progress
     */
    updateRank() {
        const stories = this.progress.unlockedStories.length;
        const streak = this.progress.currentFlameStreak;
        const visits = this.progress.totalVisits;
        
        const score = stories * 10 + streak * 5 + visits;
        
        if (score >= 500) {
            this.progress.storytellerRank = 4; // Sacred Fire
        } else if (score >= 250) {
            this.progress.storytellerRank = 3; // Bonfire
        } else if (score >= 100) {
            this.progress.storytellerRank = 2; // Flame
        } else if (score >= 30) {
            this.progress.storytellerRank = 1; // Ember
        } else {
            this.progress.storytellerRank = 0; // Spark
        }
    }

    /**
     * Get rank information
     */
    getRankInfo() {
        const ranks = [
            { level: 0, name: 'Spark', icon: '✦', color: '#ff6b35' },
            { level: 1, name: 'Ember', icon: '✦✦', color: '#f7931e' },
            { level: 2, name: 'Flame', icon: '✦✦✦', color: '#fdb833' },
            { level: 3, name: 'Bonfire', icon: '⭕✦⭕', color: '#d4af37' },
            { level: 4, name: 'Sacred Fire', icon: '⭕✦✦✦⭕', color: '#ffb700' }
        ];
        return ranks[this.progress.storytellerRank];
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(id) {
        if (!this.progress.achievements.includes(id)) {
            this.progress.achievements.push(id);
            this.saveProgress();
        }
    }

    /**
     * Signal the hub that progress was updated
     */
    signalHubUpdate() {
        if (window.esotericGamification) {
            window.esotericGamification.progress.projectProgress['keepers-of-the-flame'] = {
                totalVisits: this.progress.totalVisits,
                unlockedCount: this.progress.unlockedStories.length,
                achievements: this.progress.achievements.length,
                currentRank: this.getRankInfo().name
            };
            window.esotericGamification.saveProgress();
        }
    }

    /**
     * Get all achievements for this project
     */
    getAllAchievements() {
        return {
            'story_creation_myth': { 
                name: 'First Story',
                desc: 'Unlock the Creation Myth',
                icon: '📖',
                category: 'stories'
            },
            'story_ahura_wisdom': {
                name: 'Seeker of Wisdom',
                desc: 'Unlock Ahura Mazda\'s Wisdom',
                icon: '🧠',
                category: 'stories'
            },
            'story_heroic_zarathustra': {
                name: 'Hero\'s Path',
                desc: 'Unlock The Hero\'s Journey of Zarathustra',
                icon: '⚔️',
                category: 'stories'
            },
            'story_fire_prophecy': {
                name: 'Keeper\'s Vision',
                desc: 'Unlock The Sacred Fire Prophecy through flame streaks',
                icon: '🔮',
                category: 'stories'
            },
            'story_seasonal_renewal': {
                name: 'Spring\'s Wisdom',
                desc: 'Unlock Nowruz story during spring season',
                icon: '🌱',
                category: 'seasonal'
            },
            'story_courage_tale': {
                name: 'Summer\'s Valor',
                desc: 'Unlock Tirgan story during summer season',
                icon: '🌞',
                category: 'seasonal'
            },
            'story_friendship_circle': {
                name: 'Autumn\'s Bonds',
                desc: 'Unlock Mehregan story during autumn season',
                icon: '🍂',
                category: 'seasonal'
            },
            'story_yalda_eternal': {
                name: 'Winter\'s Light',
                desc: 'Unlock Yalda story during winter season',
                icon: '❄️',
                category: 'seasonal'
            },
            'flame_keeper_week': {
                name: 'Flame Keeper',
                desc: 'Maintain a 7-day visit streak',
                icon: '🔥',
                category: 'streaks'
            },
            'storyteller_spark': {
                name: 'First Spark',
                desc: 'Achieve Spark rank',
                icon: '✦',
                category: 'ranks'
            },
            'storyteller_ember': {
                name: 'Rising Ember',
                desc: 'Achieve Ember rank',
                icon: '✦✦',
                category: 'ranks'
            },
            'storyteller_flame': {
                name: 'Keeper\'s Flame',
                desc: 'Achieve Flame rank',
                icon: '✦✦✦',
                category: 'ranks'
            },
            'storyteller_bonfire': {
                name: 'Circle\'s Bonfire',
                desc: 'Achieve Bonfire rank',
                icon: '⭕✦⭕',
                category: 'ranks'
            },
            'storyteller_sacred': {
                name: 'Sacred Fire Master',
                desc: 'Achieve Sacred Fire rank (highest)',
                icon: '⭕✦✦✦⭕',
                category: 'ranks'
            },
            'all_stories': {
                name: 'Complete Storyteller',
                desc: 'Unlock all stories',
                icon: '📚',
                category: 'collection'
            },
            'all_seasons': {
                name: 'Cycle of Festivals',
                desc: 'Experience all seasonal festivals',
                icon: '🔄',
                category: 'collection'
            }
        };
    }

    /**
     * Initialize gamification on page load
     */
    init() {
        this.trackPageVisit('home');
        this.renderStats();
    }

    /**
     * Render statistics on page
     */
    renderStats() {
        const rankInfo = this.getRankInfo();
        
        // Update rank display if element exists
        const rankEl = document.getElementById('ktf-current-rank');
        if (rankEl) {
            rankEl.textContent = rankInfo.name;
            rankEl.style.color = rankInfo.color;
        }
        
        // Update stories count
        const storiesEl = document.getElementById('ktf-stories-count');
        if (storiesEl) {
            storiesEl.textContent = this.progress.unlockedStories.length;
        }
        
        // Update flame streak
        const streakEl = document.getElementById('ktf-flame-streak');
        if (streakEl) {
            streakEl.textContent = this.progress.currentFlameStreak;
        }
        
        // Update visits
        const visitsEl = document.getElementById('ktf-total-visits');
        if (visitsEl) {
            visitsEl.textContent = this.progress.totalVisits;
        }
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    window.keepersOfTheFlamGamification = new KeepersOfTheFlamGamification();
});
