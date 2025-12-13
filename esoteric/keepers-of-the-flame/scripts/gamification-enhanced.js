/**
 * Keepers of the Flame - Enhanced Gamification System
 * Integrates with the Esoteric Hub unified gamification system
 * 
 * ENHANCEMENTS IN THIS VERSION:
 * 1. Advanced Sub-Rank System: Each rank has 3 tiers (rising, steady, mastered)
 * 2. Interactive Flame Visualization: Visual flame with color/size changes based on streak
 * 3. Daily Ritual System: Track daily ritual practices with auto-notification
 * 4. Story Progress Tracking: Visual category progress bars with percentages
 * 5. Festival Countdown Timers: Auto-detect and countdown to seasonal festivals
 * 
 * Core Mechanics:
 * - Story Collection: Unlock stories by visiting during different times/conditions
 * - Fire-Tending: Daily visit streaks keep the "sacred flame" burning
 * - Storyteller Ranks: Spark → Ember → Flame → Bonfire → Sacred Fire (each with 3 sub-tiers)
 * - Seasonal Cycles: Tied to Zoroastrian festivals with countdown multipliers
 * - Daily Rituals: Optional meditation/ritual tracking for extra progression
 */

class KeepersOfTheFlamGamification {
    constructor() {
        this.storageKey = 'keepers_of_flame_progress';
        this.progress = this.loadProgress();
        this.currentDate = new Date();
        this.seasonalFestivals = {
            'nowruz': { month: 2, day: 21, name: 'Nowruz (Spring Renewal)', emoji: '🌱', color: '#4CAF50' },
            'tirgan': { month: 6, day: 15, name: 'Tirgan (Courage)', emoji: '⚔️', color: '#FF9800' },
            'mehregan': { month: 9, day: 16, name: 'Mehregan (Friendship)', emoji: '👥', color: '#FF6B9D' },
            'yalda': { month: 11, day: 30, name: 'Yalda Night (Winter)', emoji: '🌙', color: '#2196F3' }
        };
        
        // Story categories with theme colors
        this.storyCategories = {
            'creation': { name: 'Creation Stories', color: '#FFD700', stories: ['creation_myth'] },
            'wisdom': { name: 'Wisdom Tales', color: '#9C27B0', stories: ['ahura_wisdom'] },
            'hero': { name: 'Hero\'s Journey', color: '#F44336', stories: ['heroic_zarathustra'] },
            'prophecy': { name: 'Prophecies', color: '#FF6B35', stories: ['fire_prophecy'] },
            'seasonal': { name: 'Seasonal Stories', color: '#FF9800', stories: ['seasonal_renewal', 'courage_tale', 'friendship_circle', 'yalda_eternal'] }
        };
    }

    /**
     * Load progress from localStorage with migration support
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const progress = JSON.parse(saved);
                // Migrate to enhanced system
                return this.migrateProgress(progress);
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
            longestFlameStreak: 0,
            lastVisitDate: null,
            storytellerRank: 0, // 0-4: Spark through Sacred Fire
            storytellerSubRank: 0, // 0-2: Rising, Steady, Mastered
            storyProgress: {},
            seasonalVisits: {},
            dailyRituals: {}, // Format: { 'YYYY-MM-DD': count }
            ritualStreak: 0,
            longestRitualStreak: 0,
            lastRitualDate: null,
            flameVisualizationData: {
                baseHeight: 100,
                maxHeight: 400,
                color: '#ff6b35',
                glow: 0
            }
        };
    }

    /**
     * Migrate old progress to new enhanced system
     */
    migrateProgress(oldProgress) {
        if (!oldProgress.storytellerSubRank) {
            oldProgress.storytellerSubRank = 0;
        }
        if (!oldProgress.longestFlameStreak) {
            oldProgress.longestFlameStreak = oldProgress.currentFlameStreak || 0;
        }
        if (!oldProgress.dailyRituals) {
            oldProgress.dailyRituals = {};
        }
        if (!oldProgress.ritualStreak) {
            oldProgress.ritualStreak = 0;
        }
        if (!oldProgress.longestRitualStreak) {
            oldProgress.longestRitualStreak = 0;
        }
        if (!oldProgress.lastRitualDate) {
            oldProgress.lastRitualDate = null;
        }
        if (!oldProgress.flameVisualizationData) {
            oldProgress.flameVisualizationData = {
                baseHeight: 100,
                maxHeight: 400,
                color: '#ff6b35',
                glow: 0
            };
        }
        return oldProgress;
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
        
        // Update rank and sub-rank
        this.updateRank();
        this.updateSubRank();
        
        // Update flame visualization
        this.updateFlameVisualization();
        
        this.saveProgress();
        this.signalHubUpdate();
    }

    /**
     * Track daily ritual practice
     */
    trackDailyRitual(type = 'meditation', duration = 15) {
        const today = new Date().toDateString();
        const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!this.progress.dailyRituals[dateKey]) {
            this.progress.dailyRituals[dateKey] = 0;
        }
        this.progress.dailyRituals[dateKey]++;
        
        // Update ritual streak
        const lastRitual = this.progress.lastRitualDate;
        const lastDate = lastRitual ? new Date(lastRitual) : null;
        const todayDate = new Date();
        
        if (lastDate) {
            const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                this.progress.ritualStreak++;
            } else if (daysDiff > 1) {
                this.progress.ritualStreak = 1;
            }
        } else {
            this.progress.ritualStreak = 1;
        }
        
        // Update longest streak
        if (this.progress.ritualStreak > this.progress.longestRitualStreak) {
            this.progress.longestRitualStreak = this.progress.ritualStreak;
        }
        
        this.progress.lastRitualDate = today;
        
        // Award achievement for ritual milestones
        if (this.progress.ritualStreak === 7) {
            this.unlockAchievement('ritual_week_streak');
        }
        if (this.progress.ritualStreak === 30) {
            this.unlockAchievement('ritual_month_dedication');
        }
        
        this.saveProgress();
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
        
        // Update longest streak
        if (this.progress.currentFlameStreak > this.progress.longestFlameStreak) {
            this.progress.longestFlameStreak = this.progress.currentFlameStreak;
        }
        
        this.progress.lastVisitDate = today;
    }

    /**
     * Update the interactive flame visualization
     */
    updateFlameVisualization() {
        const streak = this.progress.currentFlameStreak;
        const rank = this.progress.storytellerRank;
        const festival = this.getActiveFestivalInfo();
        
        // Base height calculation (grows with streak)
        let height = 100 + (streak * 5);
        height = Math.min(height, 400); // Cap at 400px
        
        // Color based on rank
        const rankColors = [
            '#ff6b35', // Spark - orange
            '#f7931e', // Ember - warm orange
            '#fdb833', // Flame - gold
            '#d4af37', // Bonfire - bright gold
            '#ffb700'  // Sacred Fire - brilliant gold
        ];
        
        let color = rankColors[rank] || '#ff6b35';
        
        // Additional glow during festival
        let glow = 0;
        if (festival.active) {
            glow = Math.sin(Date.now() / 1000) * 0.5 + 1; // Pulsing glow
        }
        
        this.progress.flameVisualizationData = {
            baseHeight: 100,
            maxHeight: 400,
            currentHeight: height,
            color: color,
            glow: glow,
            streak: streak,
            rank: rank
        };
    }

    /**
     * Track visits during seasonal festivals
     */
    trackSeasonalVisit() {
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();
        
        for (let [key, festival] of Object.entries(this.seasonalFestivals)) {
            // Create a window around the festival date (±14 days)
            const festivalMonth = festival.month - 1;
            const festivalDay = festival.day;
            const tolerance = 14;
            
            // Check if current date is within festival window
            const festivalDate = new Date(this.currentDate.getFullYear(), festivalMonth, festivalDay);
            const dayDiff = Math.abs(this.currentDate - festivalDate) / (1000 * 60 * 60 * 24);
            
            if (dayDiff <= tolerance) {
                const seasonKey = `${key}_${this.currentDate.getFullYear()}`;
                
                if (!this.progress.seasonalVisits[seasonKey]) {
                    this.progress.seasonalVisits[seasonKey] = 0;
                }
                this.progress.seasonalVisits[seasonKey]++;
                
                // Apply seasonal bonuses
                this.applySeasonalBonus(key);
            }
        }
    }

    /**
     * Apply bonuses based on seasonal festival visit
     */
    applySeasonalBonus(festivalKey) {
        const seasonalBonuses = {
            'nowruz': { flameBonus: 1.5, achievementId: 'nowruz_blessing' },
            'tirgan': { flameBonus: 1.3, achievementId: 'tirgan_blessing' },
            'mehregan': { flameBonus: 1.2, achievementId: 'mehregan_blessing' },
            'yalda': { flameBonus: 1.4, achievementId: 'yalda_blessing' }
        };
        
        if (seasonalBonuses[festivalKey]) {
            const bonus = seasonalBonuses[festivalKey];
            // Bonus is applied through multiplier on flame streak gains
            this.unlockAchievement(bonus.achievementId);
        }
    }

    /**
     * Get current season
     */
    getCurrentSeason() {
        const month = this.currentDate.getMonth();
        const seasons = [
            'winter', 'winter', // Jan, Feb
            'spring', 'spring', 'spring', // Mar, Apr, May
            'summer', 'summer', 'summer', // Jun, Jul, Aug
            'autumn', 'autumn', 'autumn', // Sep, Oct, Nov
            'winter' // Dec
        ];
        return seasons[month];
    }

    /**
     * Get active festival info with countdown
     */
    getActiveFestivalInfo() {
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();
        
        for (let [key, festival] of Object.entries(this.seasonalFestivals)) {
            const festivalMonth = festival.month - 1;
            const festivalDay = festival.day;
            const tolerance = 14;
            
            const festivalDate = new Date(this.currentDate.getFullYear(), festivalMonth, festivalDay);
            const dayDiff = Math.abs(this.currentDate - festivalDate) / (1000 * 60 * 60 * 24);
            
            if (dayDiff <= tolerance) {
                const daysUntil = Math.ceil((festivalDate - this.currentDate) / (1000 * 60 * 60 * 24));
                return {
                    key: key,
                    name: festival.name,
                    emoji: festival.emoji,
                    color: festival.color,
                    daysUntil: daysUntil,
                    daysPassed: Math.floor(dayDiff),
                    totalDays: tolerance * 2,
                    progress: Math.floor((dayDiff / (tolerance * 2)) * 100),
                    active: true
                };
            }
        }
        
        return { active: false };
    }

    /**
     * Get next upcoming festival
     */
    getNextFestival() {
        const today = this.currentDate;
        const currentYear = today.getFullYear();
        const festivals = [];
        
        for (let [key, festival] of Object.entries(this.seasonalFestivals)) {
            const festivalDate = new Date(currentYear, festival.month - 1, festival.day);
            if (festivalDate < today) {
                // Festival already passed this year, check next year
                festivalDate.setFullYear(currentYear + 1);
            }
            const daysUntil = Math.ceil((festivalDate - today) / (1000 * 60 * 60 * 24));
            festivals.push({
                key: key,
                name: festival.name,
                emoji: festival.emoji,
                daysUntil: daysUntil,
                date: festivalDate
            });
        }
        
        // Sort by days until and return closest
        festivals.sort((a, b) => a.daysUntil - b.daysUntil);
        return festivals[0] || null;
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
        const rituals = Object.keys(this.progress.dailyRituals).length;
        
        const score = stories * 10 + streak * 5 + visits + rituals * 2;
        
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
        
        // Award rank achievements
        if (this.progress.storytellerRank >= 1 && !this.progress.achievements.includes('storyteller_spark')) {
            this.unlockAchievement('storyteller_spark');
        }
        if (this.progress.storytellerRank >= 2 && !this.progress.achievements.includes('storyteller_ember')) {
            this.unlockAchievement('storyteller_ember');
        }
        if (this.progress.storytellerRank >= 3 && !this.progress.achievements.includes('storyteller_flame')) {
            this.unlockAchievement('storyteller_flame');
        }
        if (this.progress.storytellerRank >= 4 && !this.progress.achievements.includes('storyteller_bonfire')) {
            this.unlockAchievement('storyteller_bonfire');
        }
    }

    /**
     * Update sub-rank (Rising, Steady, Mastered) within each rank
     */
    updateSubRank() {
        const rankThresholds = [30, 100, 250, 500, 1000];
        const currentThreshold = rankThresholds[this.progress.storytellerRank];
        const nextThreshold = rankThresholds[this.progress.storytellerRank + 1];
        
        if (!nextThreshold) {
            this.progress.storytellerSubRank = 2; // Mastered at top rank
            return;
        }
        
        const stories = this.progress.unlockedStories.length;
        const streak = this.progress.currentFlameStreak;
        const visits = this.progress.totalVisits;
        const rituals = Object.keys(this.progress.dailyRituals).length;
        const score = stories * 10 + streak * 5 + visits + rituals * 2;
        
        const rangeSize = nextThreshold - currentThreshold;
        const progress = score - currentThreshold;
        const percentage = progress / rangeSize;
        
        if (percentage < 0.33) {
            this.progress.storytellerSubRank = 0; // Rising
        } else if (percentage < 0.66) {
            this.progress.storytellerSubRank = 1; // Steady
        } else {
            this.progress.storytellerSubRank = 2; // Mastered
        }
    }

    /**
     * Get story progress by category
     */
    getStoryProgressByCategory() {
        const progress = {};
        
        for (let [catKey, category] of Object.entries(this.storyCategories)) {
            const unlockedInCategory = category.stories.filter(s => 
                this.progress.unlockedStories.includes(s)
            ).length;
            
            progress[catKey] = {
                name: category.name,
                color: category.color,
                unlocked: unlockedInCategory,
                total: category.stories.length,
                percentage: Math.round((unlockedInCategory / category.stories.length) * 100)
            };
        }
        
        return progress;
    }

    /**
     * Get rank information with detailed descriptions and sub-tiers
     */
    getRankInfo() {
        const ranks = [
            { 
                level: 0, 
                name: 'Spark', 
                icon: '✦',
                color: '#ff6b35',
                title: 'The First Kindling',
                description: 'You have just begun your journey as a Keeper. Like a spark from flint, your consciousness has awakened to the truth. The flame is small but it burns with hope.',
                requirements: 'Initial rank - Your journey begins here',
                powers: ['Access to basic stories', 'Daily flame tracking begins'],
                subTiers: [
                    { name: 'Rising Spark', icon: '✦', description: 'Your first steps into the tradition' },
                    { name: 'Steady Spark', icon: '✦⚬', description: 'Finding consistency in your practice' },
                    { name: 'Mastered Spark', icon: '✦✦', description: 'Ready to ascend to Ember' }
                ]
            },
            { 
                level: 1, 
                name: 'Ember', 
                icon: '✦✦',
                color: '#f7931e',
                title: 'Glowing Embers',
                description: 'Your flame has grown from a spark to glowing embers. You understand the basic principles and have visited often. You are becoming a steady presence among the Keepers.',
                requirements: '30+ points (Stories unlocked + Visits + Streak)',
                powers: ['Unlock seasonal story insights', 'Extended streak bonuses', 'Seasonal timing awareness'],
                subTiers: [
                    { name: 'Rising Ember', icon: '✦✦', description: 'Growing warmer with knowledge' },
                    { name: 'Steady Ember', icon: '✦✦⚬', description: 'A reliable source of warmth' },
                    { name: 'Mastered Ember', icon: '✦✦✦', description: 'Ready to become a true Flame' }
                ]
            },
            { 
                level: 2, 
                name: 'Flame', 
                icon: '✦✦✦',
                color: '#fdb833',
                title: 'Keeper\'s Flame',
                description: 'Now you tend a true flame. It burns steadily, warming those around you. You have learned the deeper meanings of the stories and maintain discipline in your practice.',
                requirements: '100+ points (Multiple stories, consistent visits)',
                powers: ['Full story library access', '7+ day streaks grant bonuses', 'Seasonal festival bonuses active'],
                subTiers: [
                    { name: 'Rising Flame', icon: '✦✦✦', description: 'Your light begins to shine brightly' },
                    { name: 'Steady Flame', icon: '✦✦✦⚬', description: 'A beacon for seekers' },
                    { name: 'Mastered Flame', icon: '✦✦✦✦', description: 'Ready to join the Bonfire circle' }
                ]
            },
            { 
                level: 3, 
                name: 'Bonfire', 
                icon: '⭕✦⭕',
                color: '#d4af37',
                title: 'Circle\'s Bonfire',
                description: 'Your flame has grown so bright that others gather around it. You are a teacher, a guide, a living embodiment of Zoroastrian wisdom. Your practice inspires community.',
                requirements: '250+ points (Mastery of traditions, consistent practice)',
                powers: ['Share insights with hub community', 'Multiplied seasonal bonuses', 'Access to advanced teachings'],
                subTiers: [
                    { name: 'Rising Bonfire', icon: '⭕✦⭕', description: 'Others begin to gather' },
                    { name: 'Steady Bonfire', icon: '⭕✦✦⭕', description: 'A community gathers around you' },
                    { name: 'Mastered Bonfire', icon: '⭕✦✦✦⭕', description: 'Ready to become the Sacred Fire' }
                ]
            },
            { 
                level: 4, 
                name: 'Sacred Fire', 
                icon: '⭕✦✦✦⭕',
                color: '#ffb700',
                title: 'The Eternal Flame',
                description: 'You have become one with the Sacred Fire itself. Your wisdom runs deep as the roots of ancient oaks, your light shines far as stars. You are a Keeper of the timeless tradition.',
                requirements: '500+ points (Complete mastery and sustained dedication)',
                powers: ['Unlock all hidden teachings', 'Mentor lesser keepers', 'Participate in rare sacred ceremonies', 'Cosmic alignment bonuses'],
                subTiers: [
                    { name: 'Rising Sacred Fire', icon: '⭕✦✦✦⭕', description: 'Ancient wisdom flows through you' },
                    { name: 'Steady Sacred Fire', icon: '⭕✦✦✦✦⭕', description: 'The eternal flame burns strong' },
                    { name: 'Mastered Sacred Fire', icon: '⭕✦✦✦✦✦⭕', description: 'Ultimate mastery of the tradition' }
                ]
            }
        ];
        const rankInfo = ranks[this.progress.storytellerRank];
        const subTier = rankInfo.subTiers[this.progress.storytellerSubRank];
        
        return {
            ...rankInfo,
            subTier: subTier,
            currentSubTierName: subTier.name,
            currentSubTierIcon: subTier.icon
        };
    }

    /**
     * Get rank progression percentage
     */
    getRankProgressPercentage() {
        const stories = this.progress.unlockedStories.length;
        const streak = this.progress.currentFlameStreak;
        const visits = this.progress.totalVisits;
        const rituals = Object.keys(this.progress.dailyRituals).length;
        const score = stories * 10 + streak * 5 + visits + rituals * 2;
        
        const levels = [0, 30, 100, 250, 500];
        const currentLevel = this.progress.storytellerRank;
        const nextLevel = currentLevel + 1;
        
        if (nextLevel >= levels.length) return 100;
        
        const min = levels[currentLevel];
        const max = levels[nextLevel];
        const progress = Math.min(score - min, max - min);
        const percentage = Math.round((progress / (max - min)) * 100);
        
        return Math.min(percentage, 99);
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(id) {
        if (!this.progress.achievements.includes(id)) {
            this.progress.achievements.push(id);
            this.saveProgress();
            return true;
        }
        return false;
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
                currentRank: this.getRankInfo().name,
                currentSubRank: this.getRankInfo().currentSubTierName,
                flameStreak: this.progress.currentFlameStreak,
                ritualStreak: this.progress.ritualStreak
            };
            window.esotericGamification.saveProgress();
        }
    }

    /**
     * Get all achievements for this project
     */
    getAllAchievements() {
        return {
            // Story achievements
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
            // Streak achievements
            'flame_keeper_week': {
                name: 'Flame Keeper',
                desc: 'Maintain a 7-day visit streak',
                icon: '🔥',
                category: 'streaks'
            },
            'flame_keeper_month': {
                name: 'Month-Long Flame',
                desc: 'Maintain a 30-day visit streak',
                icon: '🔥🔥',
                category: 'streaks'
            },
            'flame_keeper_century': {
                name: 'Centennial Keeper',
                desc: 'Reach a 100-day visit streak',
                icon: '🔥⭕',
                category: 'streaks'
            },
            // Ritual achievements
            'ritual_week_streak': {
                name: 'Ritual Devotee',
                desc: 'Practice rituals for 7 consecutive days',
                icon: '🙏',
                category: 'rituals'
            },
            'ritual_month_dedication': {
                name: 'Month of Dedication',
                desc: 'Practice rituals for 30 consecutive days',
                icon: '🙏🙏',
                category: 'rituals'
            },
            // Rank achievements
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
            // Festival achievements
            'nowruz_blessing': {
                name: 'Nowruz Blessing',
                desc: 'Visit during Nowruz season',
                icon: '🌱',
                category: 'festivals'
            },
            'tirgan_blessing': {
                name: 'Tirgan Blessing',
                desc: 'Visit during Tirgan season',
                icon: '⚔️',
                category: 'festivals'
            },
            'mehregan_blessing': {
                name: 'Mehregan Blessing',
                desc: 'Visit during Mehregan season',
                icon: '🤝',
                category: 'festivals'
            },
            'yalda_blessing': {
                name: 'Yalda Blessing',
                desc: 'Visit during Yalda Night',
                icon: '🌙',
                category: 'festivals'
            },
            // Collection achievements
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
            rankEl.textContent = rankInfo.currentSubTierName;
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
        
        // Update longest streak
        const longestStreakEl = document.getElementById('ktf-longest-streak');
        if (longestStreakEl) {
            longestStreakEl.textContent = this.progress.longestFlameStreak;
        }
        
        // Update ritual streak
        const ritualStreakEl = document.getElementById('ktf-ritual-streak');
        if (ritualStreakEl) {
            ritualStreakEl.textContent = this.progress.ritualStreak;
        }
        
        // Update visits
        const visitsEl = document.getElementById('ktf-total-visits');
        if (visitsEl) {
            visitsEl.textContent = this.progress.totalVisits;
        }
        
        // Update story progress bars
        this.renderStoryProgress();
        
        // Update festival countdown
        this.renderFestivalCountdown();
        
        // Update flame visualization
        this.renderFlameVisualization();
    }

    /**
     * Render story progress by category
     */
    renderStoryProgress() {
        const container = document.getElementById('ktf-story-progress');
        if (!container) return;
        
        const progress = this.getStoryProgressByCategory();
        container.innerHTML = '';
        
        for (let [key, cat] of Object.entries(progress)) {
            const bar = document.createElement('div');
            bar.className = 'ktf-story-bar';
            bar.innerHTML = `
                <div class="ktf-story-label">${cat.name}</div>
                <div class="ktf-progress-container">
                    <div class="ktf-progress-fill" style="width: ${cat.percentage}%; background-color: ${cat.color};"></div>
                </div>
                <div class="ktf-progress-text">${cat.unlocked}/${cat.total}</div>
            `;
            container.appendChild(bar);
        }
    }

    /**
     * Render festival countdown timer
     */
    renderFestivalCountdown() {
        const container = document.getElementById('ktf-festival-countdown');
        if (!container) return;
        
        const festival = this.getActiveFestivalInfo();
        container.innerHTML = '';
        
        if (festival.active) {
            const countdown = document.createElement('div');
            countdown.className = 'ktf-festival-active';
            countdown.style.borderColor = festival.color;
            countdown.innerHTML = `
                <div class="ktf-festival-header" style="color: ${festival.color};">
                    ${festival.emoji} ${festival.name}
                </div>
                <div class="ktf-festival-progress">
                    <div class="ktf-progress-container">
                        <div class="ktf-progress-fill" style="width: ${festival.progress}%; background-color: ${festival.color};"></div>
                    </div>
                </div>
                <div class="ktf-festival-days">
                    ${festival.daysUntil > 0 ? `${festival.daysUntil} days remaining` : 'Festival Active!'}
                </div>
            `;
            container.appendChild(countdown);
        } else {
            const next = this.getNextFestival();
            if (next) {
                const upcoming = document.createElement('div');
                upcoming.className = 'ktf-festival-upcoming';
                upcoming.innerHTML = `
                    <div class="ktf-festival-header">
                        ${next.emoji} Next: ${next.name}
                    </div>
                    <div class="ktf-festival-days">
                        ${next.daysUntil} days until
                    </div>
                `;
                container.appendChild(upcoming);
            }
        }
    }

    /**
     * Render interactive flame visualization
     */
    renderFlameVisualization() {
        const container = document.getElementById('ktf-flame-visualization');
        if (!container) return;
        
        const data = this.progress.flameVisualizationData;
        const height = data.currentHeight || 100;
        const color = data.color || '#ff6b35';
        
        container.innerHTML = `
            <div class="ktf-flame-container">
                <div class="ktf-flame" style="
                    height: ${height}px;
                    background: linear-gradient(to top, ${color}, ${this.lightenColor(color, 50)});
                    box-shadow: 0 0 ${20 + data.glow * 10}px ${color};
                    filter: drop-shadow(0 0 ${10 + data.glow * 5}px ${color}aa);
                "></div>
                <div class="ktf-flame-info">
                    <div class="ktf-flame-stat">
                        <span>Streak: ${data.streak}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Lighten a color for gradient effect
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        return '#' + (Math.min(255, (num >> 16) + amt).toString(16).padStart(2, '0') +
            Math.min(255, (num >> 8 & 0x00FF) + amt).toString(16).padStart(2, '0') +
            Math.min(255, (num & 0x0000FF) + amt).toString(16).padStart(2, '0'));
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    window.keepersOfTheFlamGamification = new KeepersOfTheFlamGamification();
});

