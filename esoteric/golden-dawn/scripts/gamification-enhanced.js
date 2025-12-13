/**
 * The Golden Dawn - Enhanced Gamification System
 * Integrates with the Esoteric Hub unified gamification system
 * 
 * ENHANCEMENTS IN THIS VERSION:
 * 1. Ritual Mastery Tracking: Track practice sessions with progression bars
 * 2. Tree of Life Visualization: Visual path progression and sephiroth unlocking
 * 3. Tarot Collection Interface: Cards with rarity, element associations, and meanings
 * 4. Elemental Balance Meter: Monitor 4 elements + spirit with rebalancing recommendations
 * 5. Study Session Tracking: Track learning across 4 knowledge areas (duration, focus, retention)
 * 
 * Core Mechanics:
 * - Grade Progression: Follow actual Golden Dawn hierarchy (Neophyte through Adeptus Major)
 * - Ritual Mastery: Practice rituals with session tracking and proficiency levels
 * - Tarot Discovery: Unlock tarot cards with rarity tiers and element associations
 * - Tree of Life: Progressive unlocking of paths connecting Sephiroth
 * - Elemental Balance: Track all 5 elements with recommendations for study
 * - Hermetic Study: Progress through multiple knowledge systems simultaneously
 */

class TheGoldenDawnGamification {
    constructor() {
        this.storageKey = 'golden_dawn_progress';
        this.progress = this.loadProgress();
        this.currentDate = new Date();
        
        // Tree of Life structure (10 Sephiroth + 22 Paths)
        this.treeOfLife = {
            sephiroth: [
                { id: 1, name: 'Kether', number: 1, hebrew: 'כתר', color: '#ffffff', element: 'spirit' },
                { id: 2, name: 'Chokmah', number: 2, hebrew: 'חכמה', color: '#ffffff', element: 'fire' },
                { id: 3, name: 'Binah', number: 3, hebrew: 'בינה', color: '#000000', element: 'water' },
                { id: 4, name: 'Chesed', number: 4, hebrew: 'חסד', color: '#0000ff', element: 'water' },
                { id: 5, name: 'Geburah', number: 5, hebrew: 'גבורה', color: '#ff0000', element: 'fire' },
                { id: 6, name: 'Tiphareth', number: 6, hebrew: 'תפארת', color: '#ffff00', element: 'spirit' },
                { id: 7, name: 'Netzach', number: 7, hebrew: 'נצח', color: '#00ff00', element: 'fire' },
                { id: 8, name: 'Hod', number: 8, hebrew: 'הוד', color: '#ffff00', element: 'air' },
                { id: 9, name: 'Yesod', number: 9, hebrew: 'יסוד', color: '#9900ff', element: 'air' },
                { id: 10, name: 'Malkuth', number: 10, hebrew: 'מלכות', color: '#cc7722', element: 'earth' }
            ],
            paths: [
                // Major Arcana mapping to paths (11-32 tarot cards)
                { id: 11, from: 1, to: 2, name: 'The Fool' },
                { id: 12, from: 1, to: 3, name: 'The Magician' },
                { id: 13, from: 2, to: 4, name: 'The High Priestess' },
                { id: 14, from: 3, to: 5, name: 'The Empress' },
                { id: 15, from: 2, to: 6, name: 'The Emperor' },
                { id: 16, from: 3, to: 6, name: 'The Hierophant' },
                { id: 17, from: 4, to: 5, name: 'The Lovers' },
                { id: 18, from: 4, to: 7, name: 'The Chariot' },
                { id: 19, from: 5, to: 8, name: 'Strength' },
                { id: 20, from: 6, to: 9, name: 'The Hermit' },
                { id: 21, from: 7, to: 8, name: 'Wheel of Fortune' },
                { id: 22, from: 5, to: 6, name: 'Justice' }
            ]
        };
        
        // Tarot rarity tiers
        this.tarotRarity = {
            'common': { rarity: 'Common', color: '#999999', multiplier: 1 },
            'uncommon': { rarity: 'Uncommon', color: '#00ff00', multiplier: 1.2 },
            'rare': { rarity: 'Rare', color: '#0099ff', multiplier: 1.5 },
            'legendary': { rarity: 'Legendary', color: '#ff00ff', multiplier: 2 },
            'mythic': { rarity: 'Mythic', color: '#ffaa00', multiplier: 2.5 }
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
                return this.migrateProgress(progress);
            }
        } catch (error) {
            console.warn('Failed to load The Golden Dawn progress:', error);
        }
        return {
            totalVisits: 0,
            visitedPages: [],
            currentGrade: 0,
            gradeProgress: {},
            unlockedTarotCards: [],
            completedRituals: [],
            collectedTools: [],
            achievements: [],
            treeOfLifeProgress: [],
            elementalMastery: { fire: 0, water: 0, air: 0, earth: 0, spirit: 0 },
            kabbalisticKnowledge: [],
            alchemicalStages: [],
            astrologicalLearning: [],
            // NEW: Enhanced systems
            ritualProficiency: {}, // { ritualId: { sessions: 0, bestScore: 0, lastPracticed: '' } }
            studySessions: [], // { type, duration, date, focusArea, retention }
            unlockedPaths: [],
            tarotCardDetails: {}, // { cardId: { rarity, unlockDate, timesStudied } }
            elementalRebalancing: { recommendedElement: null, lastRebalanceDate: null },
            weeklyStudyGoal: { target: 300, actual: 0, week: null }
        };
    }

    /**
     * Migrate old progress to new enhanced system
     */
    migrateProgress(oldProgress) {
        if (!oldProgress.ritualProficiency) {
            oldProgress.ritualProficiency = {};
        }
        if (!oldProgress.studySessions) {
            oldProgress.studySessions = [];
        }
        if (!oldProgress.unlockedPaths) {
            oldProgress.unlockedPaths = [];
        }
        if (!oldProgress.tarotCardDetails) {
            oldProgress.tarotCardDetails = {};
        }
        if (!oldProgress.elementalRebalancing) {
            oldProgress.elementalRebalancing = { recommendedElement: null, lastRebalanceDate: null };
        }
        if (!oldProgress.weeklyStudyGoal) {
            oldProgress.weeklyStudyGoal = { target: 300, actual: 0, week: null };
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
            console.warn('Failed to save The Golden Dawn progress:', error);
        }
    }

    /**
     * Define Golden Dawn grades
     */
    getGradesHierarchy() {
        return [
            { level: 0, name: 'Neophyte', symbol: '⚪', color: '#ffffff', order: 'Pre-Order', description: 'The beginning seeker' },
            { level: 1, name: 'Initiate 0°', symbol: '◇', color: '#ffb347', order: 'First Order', description: 'Entered the mysteries' },
            { level: 2, name: 'Initiate 1°', symbol: '◇◇', color: '#ff8c42', order: 'First Order', description: 'Advanced initiate' },
            { level: 3, name: 'Initiate 2°', symbol: '◇◇◇', color: '#ff6b35', order: 'First Order', description: 'Master of Thelemic mysteries' },
            { level: 4, name: 'Adept 3°', symbol: '🔷', color: '#f7931e', order: 'Second Order', description: 'Adept of the Inner Order' },
            { level: 5, name: 'Adept 4°', symbol: '🔷🔷', color: '#ffb366', order: 'Second Order', description: 'Greater Adept' },
            { level: 6, name: 'Adept 5°', symbol: '🔷🔷🔷', color: '#d4af37', order: 'Second Order', description: 'Exempt Adept' },
            { level: 7, name: 'Adeptus Major', symbol: '⭐', color: '#ffd700', order: 'Third Order', description: 'Master of all systems' }
        ];
    }

    /**
     * Track a page visit
     */
    trackPageVisit(pageName) {
        this.progress.totalVisits++;
        
        if (!this.progress.visitedPages.includes(pageName)) {
            this.progress.visitedPages.push(pageName);
        }
        
        this.checkGradeProgression();
        this.checkTarotUnlocks();
        this.checkRitualCompletions();
        this.checkElementalProgress();
        this.updateTreeOfLifeProgress();
        this.updateElementalRebalancing();
        
        this.saveProgress();
        this.signalHubUpdate();
    }

    /**
     * Log a study session
     */
    logStudySession(focusArea, durationMinutes, retentionScore = 0) {
        // Focus areas: kabbalah, tarot, alchemy, astrology
        const validAreas = ['kabbalah', 'tarot', 'alchemy', 'astrology'];
        if (!validAreas.includes(focusArea)) {
            console.warn('Invalid focus area:', focusArea);
            return false;
        }
        
        const session = {
            type: 'study',
            focusArea: focusArea,
            duration: durationMinutes,
            date: new Date().toISOString().split('T')[0],
            retention: Math.max(0, Math.min(100, retentionScore || 0))
        };
        
        this.progress.studySessions.push(session);
        
        // Update elemental mastery based on focus area
        const elementMap = {
            'kabbalah': 'spirit',
            'tarot': 'water',
            'alchemy': 'fire',
            'astrology': 'air'
        };
        
        const element = elementMap[focusArea];
        if (element) {
            this.progress.elementalMastery[element] += Math.round(durationMinutes / 5);
        }
        
        // Update weekly study goal
        this.updateWeeklyStudyGoal(durationMinutes);
        
        // Unlock study milestones
        if (this.progress.studySessions.length === 1) {
            this.unlockAchievement('first_study_session');
        }
        if (this.progress.studySessions.length === 10) {
            this.unlockAchievement('ten_study_sessions');
        }
        if (this.progress.studySessions.length === 50) {
            this.unlockAchievement('fifty_study_sessions');
        }
        
        this.saveProgress();
        return true;
    }

    /**
     * Track ritual practice session
     */
    trackRitualSession(ritualId, durationMinutes, performanceScore = 50) {
        if (!this.progress.ritualProficiency[ritualId]) {
            this.progress.ritualProficiency[ritualId] = {
                sessions: 0,
                totalDuration: 0,
                bestScore: performanceScore,
                averageScore: performanceScore,
                lastPracticed: null,
                proficiencyLevel: 1 // 1-5
            };
        }
        
        const ritual = this.progress.ritualProficiency[ritualId];
        ritual.sessions++;
        ritual.totalDuration += durationMinutes;
        ritual.bestScore = Math.max(ritual.bestScore, performanceScore);
        ritual.averageScore = (ritual.averageScore * (ritual.sessions - 1) + performanceScore) / ritual.sessions;
        ritual.lastPracticed = new Date().toISOString().split('T')[0];
        
        // Update proficiency level (1-5)
        if (ritual.sessions >= 50 && ritual.averageScore >= 85) {
            ritual.proficiencyLevel = 5; // Master
        } else if (ritual.sessions >= 30 && ritual.averageScore >= 75) {
            ritual.proficiencyLevel = 4; // Adept
        } else if (ritual.sessions >= 20 && ritual.averageScore >= 65) {
            ritual.proficiencyLevel = 3; // Practitioner
        } else if (ritual.sessions >= 10 && ritual.averageScore >= 50) {
            ritual.proficiencyLevel = 2; // Student
        }
        
        this.saveProgress();
        return ritual;
    }

    /**
     * Update weekly study goal
     */
    updateWeeklyStudyGoal(addMinutes) {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        
        if (this.progress.weeklyStudyGoal.week !== weekNumber) {
            this.progress.weeklyStudyGoal.week = weekNumber;
            this.progress.weeklyStudyGoal.actual = 0;
        }
        
        this.progress.weeklyStudyGoal.actual += addMinutes;
        
        if (this.progress.weeklyStudyGoal.actual >= this.progress.weeklyStudyGoal.target) {
            this.unlockAchievement('weekly_study_goal');
        }
    }

    /**
     * Get week number for date
     */
    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + '-W' + String(weekNumber).padStart(2, '0');
    }

    /**
     * Update Tree of Life progress by unlocking paths
     */
    updateTreeOfLifeProgress() {
        const unlockedCards = this.progress.unlockedTarotCards.length;
        const pathsToUnlock = Math.floor(unlockedCards / 2);
        
        for (let i = 0; i < pathsToUnlock; i++) {
            const path = this.treeOfLife.paths[i];
            if (path && !this.progress.unlockedPaths.includes(path.id)) {
                this.progress.unlockedPaths.push(path.id);
                this.unlockAchievement(`path_${path.id}`);
            }
        }
        
        // Award Tree of Life achievements
        if (this.progress.unlockedPaths.length >= 5) {
            this.unlockAchievement('tree_seeker');
        }
        if (this.progress.unlockedPaths.length >= 11) {
            this.unlockAchievement('path_walker');
        }
    }

    /**
     * Update elemental rebalancing recommendation
     */
    updateElementalRebalancing() {
        const mastery = this.progress.elementalMastery;
        const elements = Object.keys(mastery);
        const average = Object.values(mastery).reduce((a, b) => a + b) / elements.length;
        
        // Find the element furthest below average
        let lowestElement = null;
        let lowestValue = average;
        
        for (let element of elements) {
            if (mastery[element] < lowestValue) {
                lowestElement = element;
                lowestValue = mastery[element];
            }
        }
        
        this.progress.elementalRebalancing.recommendedElement = lowestElement;
        this.progress.elementalRebalancing.lastRebalanceDate = new Date().toISOString();
    }

    /**
     * Check and advance grade progression
     */
    checkGradeProgression() {
        const grades = this.getGradesHierarchy();
        const currentGrade = this.progress.currentGrade;
        
        const progressionRequirements = [
            { grade: 1, requires: () => this.progress.totalVisits >= 3 },
            { grade: 2, requires: () => this.progress.unlockedTarotCards.length >= 5 && this.progress.completedRituals.length >= 2 },
            { grade: 3, requires: () => this.progress.unlockedTarotCards.length >= 10 && this.progress.completedRituals.length >= 5 },
            { grade: 4, requires: () => this.progress.unlockedTarotCards.length >= 15 && this.progress.completedRituals.length >= 8 },
            { grade: 5, requires: () => this.progress.collectedTools.length >= 5 && this.getTotalElementalMastery() >= 50 },
            { grade: 6, requires: () => this.progress.treeOfLifeProgress.length >= 8 && this.getTotalElementalMastery() >= 100 },
            { grade: 7, requires: () => this.progress.achievements.length >= 20 && this.getTotalElementalMastery() >= 200 }
        ];
        
        for (let req of progressionRequirements) {
            if (currentGrade < req.grade && req.requires()) {
                this.progress.currentGrade = req.grade;
                const gradeName = grades[req.grade].name.replace(/°.*/, '').toLowerCase();
                this.unlockAchievement(`grade_${gradeName}`);
            }
        }
    }

    /**
     * Check for tarot card unlocks with rarity assignment
     */
    checkTarotUnlocks() {
        const majorArcana = [
            { id: 0, name: 'The Fool', element: 'air' },
            { id: 1, name: 'The Magician', element: 'fire' },
            { id: 2, name: 'The High Priestess', element: 'water' },
            { id: 3, name: 'The Empress', element: 'earth' },
            { id: 4, name: 'The Emperor', element: 'fire' },
            { id: 5, name: 'The Hierophant', element: 'earth' },
            { id: 6, name: 'The Lovers', element: 'air' },
            { id: 7, name: 'The Chariot', element: 'water' },
            { id: 8, name: 'Strength', element: 'fire' },
            { id: 9, name: 'The Hermit', element: 'earth' },
            { id: 10, name: 'Wheel of Fortune', element: 'spirit' },
            { id: 11, name: 'Justice', element: 'air' },
            { id: 12, name: 'The Hanged Man', element: 'water' },
            { id: 13, name: 'Death', element: 'earth' },
            { id: 14, name: 'Temperance', element: 'fire' },
            { id: 15, name: 'The Devil', element: 'water' },
            { id: 16, name: 'The Tower', element: 'air' },
            { id: 17, name: 'The Star', element: 'air' },
            { id: 18, name: 'The Moon', element: 'water' },
            { id: 19, name: 'The Sun', element: 'fire' },
            { id: 20, name: 'Judgement', element: 'spirit' },
            { id: 21, name: 'The World', element: 'earth' }
        ];
        
        for (let card of majorArcana) {
            const cardKey = `tarot_${card.id}`;
            if (!this.progress.unlockedTarotCards.includes(cardKey)) {
                const unlockThreshold = (card.id + 1) * 2;
                if (this.progress.totalVisits >= unlockThreshold) {
                    this.progress.unlockedTarotCards.push(cardKey);
                    
                    // Assign rarity based on card position (later cards are rarer)
                    const rarityKey = card.id < 7 ? 'common' : 
                                     card.id < 14 ? 'uncommon' : 
                                     card.id < 18 ? 'rare' : 
                                     card.id < 21 ? 'legendary' : 'mythic';
                    
                    this.progress.tarotCardDetails[cardKey] = {
                        rarity: rarityKey,
                        unlockDate: new Date().toISOString(),
                        timesStudied: 0
                    };
                    
                    this.unlockAchievement(cardKey);
                    
                    // Track element unlocks
                    if (!this.progress.elementalMastery[card.element]) {
                        this.progress.elementalMastery[card.element] = 0;
                    }
                    this.progress.elementalMastery[card.element] += 5;
                }
            }
        }
    }

    /**
     * Check for ritual completions
     */
    checkRitualCompletions() {
        const rituals = [
            { id: 'qabalistic_cross', name: 'Qabalistic Cross', tool: 'wand' },
            { id: 'lbrp', name: 'Lesser Banishing Ritual of the Pentagram', tool: 'sword' },
            { id: 'lbrh', name: 'Lesser Banishing Ritual of the Hexagram', tool: 'symbol' },
            { id: 'tree_meditation', name: 'Tree of Life Meditation', tool: 'tablet' },
            { id: 'rose_cross', name: 'Rose Cross Ritual', tool: 'rose' },
            { id: 'invoking_pentagram', name: 'Invoking Pentagram Ritual', tool: 'pentagram' },
            { id: 'tattvic_vision', name: 'Tattvic Vision', tool: 'eye' },
            { id: 'path_working', name: 'Path Working', tool: 'key' },
            { id: 'scrying', name: 'Scrying Practice', tool: 'crystal' },
            { id: 'astral_projection', name: 'Astral Projection Practice', tool: 'wings' }
        ];
        
        for (let ritual of rituals) {
            if (!this.progress.completedRituals.includes(ritual.id)) {
                const requirement = Math.floor(this.progress.completedRituals.length * 3) + 5;
                if (this.progress.totalVisits >= requirement) {
                    this.progress.completedRituals.push(ritual.id);
                    this.progress.collectedTools.push(ritual.tool);
                    this.unlockAchievement(`ritual_${ritual.id}`);
                }
            }
        }
    }

    /**
     * Check elemental mastery progression
     */
    checkElementalProgress() {
        const elements = ['fire', 'water', 'air', 'earth', 'spirit'];
        
        for (let element of elements) {
            const elementalLesson = Math.floor(this.progress.totalVisits / 5);
            if (!this.progress.elementalMastery[element]) {
                this.progress.elementalMastery[element] = 0;
            }
            this.progress.elementalMastery[element] = Math.min(elementalLesson * 10, 200);
        }
        
        const elementThresholds = [10, 25, 50, 100, 150, 200];
        for (let element of elements) {
            for (let threshold of elementThresholds) {
                if (this.progress.elementalMastery[element] >= threshold) {
                    this.unlockAchievement(`element_${element}_${threshold}`);
                }
            }
        }
    }

    /**
     * Get total elemental mastery score
     */
    getTotalElementalMastery() {
        return Object.values(this.progress.elementalMastery).reduce((a, b) => a + b, 0);
    }

    /**
     * Get grade progression percentage
     */
    getGradeProgressPercentage() {
        const grades = this.getGradesHierarchy();
        const currentGrade = this.progress.currentGrade;
        
        if (currentGrade >= grades.length - 1) return 100;
        
        // Simple percentage based on collected cards and rituals
        const cardsPercent = Math.min(this.progress.unlockedTarotCards.length / 22 * 50, 50);
        const ritualsPercent = Math.min(this.progress.completedRituals.length / 10 * 30, 30);
        const elementPercent = Math.min(this.getTotalElementalMastery() / 200 * 20, 20);
        
        return Math.round(cardsPercent + ritualsPercent + elementPercent);
    }

    /**
     * Get study session statistics
     */
    getStudyStats() {
        const stats = {
            totalSessions: this.progress.studySessions.length,
            totalMinutes: this.progress.studySessions.reduce((sum, s) => sum + s.duration, 0),
            averageRetention: this.progress.studySessions.length > 0 ?
                Math.round(this.progress.studySessions.reduce((sum, s) => sum + s.retention, 0) / this.progress.studySessions.length) : 0,
            byFocusArea: {
                kabbalah: 0,
                tarot: 0,
                alchemy: 0,
                astrology: 0
            }
        };
        
        for (let session of this.progress.studySessions) {
            if (stats.byFocusArea[session.focusArea] !== undefined) {
                stats.byFocusArea[session.focusArea]++;
            }
        }
        
        return stats;
    }

    /**
     * Get current grade information
     */
    getCurrentGrade() {
        const grades = this.getGradesHierarchy();
        return grades[this.progress.currentGrade] || grades[0];
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
            window.esotericGamification.progress.projectProgress['golden-dawn'] = {
                totalVisits: this.progress.totalVisits,
                currentGrade: this.getCurrentGrade().name,
                unlockedCards: this.progress.unlockedTarotCards.length,
                completedRituals: this.progress.completedRituals.length,
                achievements: this.progress.achievements.length,
                totalElementalMastery: this.getTotalElementalMastery(),
                unlockedPaths: this.progress.unlockedPaths.length,
                studySessions: this.progress.studySessions.length
            };
            window.esotericGamification.saveProgress();
        }
    }

    /**
     * Get all achievements for this project
     */
    getAllAchievements() {
        const achievements = {
            // Grade achievements
            'grade_neophyte': { name: 'Seeker of Light', desc: 'Achieve Neophyte grade', icon: '⚪', category: 'grades' },
            'grade_initiate': { name: 'Entered Initiate', desc: 'Achieve Initiate grade', icon: '◇', category: 'grades' },
            'grade_adept': { name: 'Adept Magician', desc: 'Achieve Adept grade', icon: '🔷', category: 'grades' },
            'grade_adeptus': { name: 'Master of the Hermetic Arts', desc: 'Achieve Adeptus Major', icon: '⭐', category: 'grades' },
            
            // Tarot achievements
            'all_major_arcana': { name: 'Collector of Arcana', desc: 'Unlock all 22 Major Arcana cards', icon: '🎴', category: 'tarot' },
            'tarot_collection_rare': { name: 'Rare Card Collector', desc: 'Unlock 5 rare tarot cards', icon: '🎴✨', category: 'tarot' },
            'tarot_mythic': { name: 'Mythic Seeker', desc: 'Unlock a mythic rarity card', icon: '🎴⭐', category: 'tarot' },
            
            // Ritual achievements
            'first_ritual': { name: 'Ritual Initiate', desc: 'Complete your first ritual', icon: '🕯️', category: 'rituals' },
            'five_rituals': { name: 'Ceremonial Master', desc: 'Complete 5 rituals', icon: '🕯️🕯️', category: 'rituals' },
            'ritual_proficiency_master': { name: 'Ritual Master', desc: 'Master a ritual with 50+ sessions', icon: '🕯️✦', category: 'rituals' },
            'all_tools': { name: 'Custodian of Tools', desc: 'Collect all ceremonial tools', icon: '⚔️', category: 'tools' },
            
            // Elemental achievements
            'element_fire_200': { name: 'Fire Master', desc: 'Master fire element', icon: '🔥', category: 'elements' },
            'element_water_200': { name: 'Water Master', desc: 'Master water element', icon: '💧', category: 'elements' },
            'element_air_200': { name: 'Air Master', desc: 'Master air element', icon: '🌬️', category: 'elements' },
            'element_earth_200': { name: 'Earth Master', desc: 'Master earth element', icon: '🌍', category: 'elements' },
            'element_spirit_200': { name: 'Spirit Master', desc: 'Master spirit element', icon: '✨', category: 'elements' },
            
            // Tree of Life achievements
            'tree_seeker': { name: 'Seeker of the Tree', desc: 'Begin exploration of the Tree of Life', icon: '🌳', category: 'kabbalah' },
            'path_walker': { name: 'Path Walker', desc: 'Complete a path working', icon: '🛤️', category: 'kabbalah' },
            'all_paths_unlocked': { name: 'Master of Paths', desc: 'Unlock all 22 paths', icon: '🔑', category: 'kabbalah' },
            
            // Study achievements
            'first_study_session': { name: 'Scholar Begins', desc: 'Complete your first study session', icon: '📚', category: 'study' },
            'ten_study_sessions': { name: 'Dedicated Scholar', desc: 'Complete 10 study sessions', icon: '📚📚', category: 'study' },
            'fifty_study_sessions': { name: 'Master Scholar', desc: 'Complete 50 study sessions', icon: '📚✦', category: 'study' },
            'weekly_study_goal': { name: 'Weekly Dedication', desc: 'Reach weekly study goal', icon: '⏰', category: 'study' },
            
            // Mastery achievements
            'golden_visionary': { name: 'Golden Visionary', desc: 'Master all systems of the Golden Dawn', icon: '🔮', category: 'mastery' },
            'perfect_balance': { name: 'Perfectly Balanced', desc: 'Master all 5 elements equally', icon: '⚖️', category: 'mastery' }
        };
        
        return achievements;
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
        const grade = this.getCurrentGrade();
        
        // Update grade display
        const gradeEl = document.getElementById('gd-current-grade');
        if (gradeEl) {
            gradeEl.textContent = grade.name;
            gradeEl.style.color = grade.color;
        }
        
        // Update cards count
        const cardsEl = document.getElementById('gd-cards-count');
        if (cardsEl) {
            cardsEl.textContent = `${this.progress.unlockedTarotCards.length} / 22`;
        }
        
        // Update rituals count
        const ritualsEl = document.getElementById('gd-rituals-count');
        if (ritualsEl) {
            ritualsEl.textContent = this.progress.completedRituals.length;
        }
        
        // Update elemental mastery
        const masteryEl = document.getElementById('gd-elemental-mastery');
        if (masteryEl) {
            masteryEl.textContent = this.getTotalElementalMastery();
        }
        
        // Update visits
        const visitsEl = document.getElementById('gd-total-visits');
        if (visitsEl) {
            visitsEl.textContent = this.progress.totalVisits;
        }
        
        // Update tree of life progress
        const treeEl = document.getElementById('gd-tree-progress');
        if (treeEl) {
            treeEl.textContent = `${this.progress.unlockedPaths.length} / 22 Paths`;
        }
        
        // Update study sessions
        const studyEl = document.getElementById('gd-study-sessions');
        if (studyEl) {
            studyEl.textContent = this.progress.studySessions.length;
        }
        
        // Render visualizations
        this.renderElementalBalance();
        this.renderGradeProgress();
        this.renderTarotCollection();
        this.renderTreeOfLife();
        this.renderStudyStats();
    }

    /**
     * Render elemental balance meter
     */
    renderElementalBalance() {
        const container = document.getElementById('gd-elemental-balance');
        if (!container) return;
        
        const mastery = this.progress.elementalMastery;
        const total = this.getTotalElementalMastery();
        const average = total / 5;
        
        container.innerHTML = '';
        
        const elements = [
            { key: 'fire', name: 'Fire', icon: '🔥', color: '#FF6B35' },
            { key: 'water', name: 'Water', icon: '💧', color: '#4A90E2' },
            { key: 'air', name: 'Air', icon: '🌬️', color: '#F4E4C1' },
            { key: 'earth', name: 'Earth', icon: '🌍', color: '#7BA428' },
            { key: 'spirit', name: 'Spirit', icon: '✨', color: '#9B59B6' }
        ];
        
        for (let elem of elements) {
            const value = mastery[elem.key] || 0;
            const percentage = Math.round((value / 200) * 100);
            const isLow = value < average - 20;
            
            const bar = document.createElement('div');
            bar.className = 'gd-element-bar';
            bar.innerHTML = `
                <div class="gd-element-label">
                    <span class="gd-element-icon">${elem.icon}</span>
                    <span>${elem.name}</span>
                </div>
                <div class="gd-element-meter">
                    <div class="gd-element-fill" style="width: ${percentage}%; background-color: ${elem.color};"></div>
                </div>
                <div class="gd-element-value">${value}/200</div>
                ${isLow ? '<div class="gd-element-warning">⚠ Needs focus</div>' : ''}
            `;
            container.appendChild(bar);
        }
    }

    /**
     * Render grade progression bar
     */
    renderGradeProgress() {
        const container = document.getElementById('gd-grade-progress');
        if (!container) return;
        
        const percentage = this.getGradeProgressPercentage();
        const grade = this.getCurrentGrade();
        
        container.innerHTML = `
            <div class="gd-grade-section">
                <div class="gd-grade-title">Progress to Next Grade</div>
                <div class="gd-grade-bar-container">
                    <div class="gd-grade-bar-fill" style="width: ${percentage}%;"></div>
                </div>
                <div class="gd-grade-percentage">${percentage}%</div>
            </div>
        `;
    }

    /**
     * Render tarot collection grid
     */
    renderTarotCollection() {
        const container = document.getElementById('gd-tarot-collection');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < 22; i++) {
            const cardKey = `tarot_${i}`;
            const isUnlocked = this.progress.unlockedTarotCards.includes(cardKey);
            const cardDetails = this.progress.tarotCardDetails[cardKey];
            
            const card = document.createElement('div');
            card.className = `gd-tarot-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            if (isUnlocked && cardDetails) {
                const rarity = this.tarotRarity[cardDetails.rarity];
                card.innerHTML = `
                    <div class="gd-card-number">${i}</div>
                    <div class="gd-card-rarity" style="color: ${rarity.color};">${rarity.rarity}</div>
                `;
                card.style.borderColor = rarity.color;
            } else {
                card.innerHTML = '<div class="gd-card-locked">?</div>';
            }
            
            container.appendChild(card);
        }
    }

    /**
     * Render Tree of Life visualization
     */
    renderTreeOfLife() {
        const container = document.getElementById('gd-tree-visualization');
        if (!container) return;
        
        container.innerHTML = '<canvas id="gd-tree-canvas"></canvas>';
        const canvas = document.getElementById('gd-tree-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 500;
        
        // Draw sephiroth
        for (let sepher of this.treeOfLife.sephiroth) {
            const pos = this.getSephirothPosition(sepher.id, canvas.width, canvas.height);
            const isUnlocked = this.progress.unlockedPaths.some(p => 
                this.treeOfLife.paths.find(path => path.id === p && (path.from === sepher.id || path.to === sepher.id))
            ) || sepher.id === 1;
            
            ctx.fillStyle = isUnlocked ? sepher.color : '#333333';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(sepher.number), pos.x, pos.y);
        }
    }

    /**
     * Get position for sephiroth on canvas
     */
    getSephirothPosition(sephirothId, width, height) {
        const positions = {
            1: { x: width / 2, y: 30 },
            2: { x: width / 4, y: 100 },
            3: { x: (width * 3) / 4, y: 100 },
            4: { x: width / 4, y: 170 },
            5: { x: (width * 3) / 4, y: 170 },
            6: { x: width / 2, y: 240 },
            7: { x: width / 4, y: 310 },
            8: { x: (width * 3) / 4, y: 310 },
            9: { x: width / 2, y: 380 },
            10: { x: width / 2, y: 450 }
        };
        return positions[sephirothId] || { x: 0, y: 0 };
    }

    /**
     * Render study statistics
     */
    renderStudyStats() {
        const container = document.getElementById('gd-study-stats');
        if (!container) return;
        
        const stats = this.getStudyStats();
        
        container.innerHTML = `
            <div class="gd-study-stat">
                <span class="gd-stat-label">Total Sessions:</span>
                <span class="gd-stat-value">${stats.totalSessions}</span>
            </div>
            <div class="gd-study-stat">
                <span class="gd-stat-label">Total Minutes:</span>
                <span class="gd-stat-value">${stats.totalMinutes}</span>
            </div>
            <div class="gd-study-stat">
                <span class="gd-stat-label">Avg Retention:</span>
                <span class="gd-stat-value">${stats.averageRetention}%</span>
            </div>
        `;
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    window.theGoldenDawnGamification = new TheGoldenDawnGamification();
});

