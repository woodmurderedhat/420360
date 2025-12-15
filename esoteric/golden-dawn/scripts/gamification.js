/**
 * The Golden Dawn - Project-Specific Gamification
 * Integrates with the Esoteric Hub unified gamification system
 * 
 * Core Mechanics:
 * - Grade Progression: Follow actual Golden Dawn hierarchy (Neophyte through Adeptus Major)
 * - Ritual Tracking: Complete ceremonial rituals and collect tools
 * - Tarot Discovery: Unlock tarot cards through exploration (22 Major Arcana)
 * - Hermetic Study: Progress through Tree of Life and elemental mastery
 * - Cross-System Mastery: Combine Kabbalah, Tarot, Alchemy, and Astrology
 */

class TheGoldenDawnGamification {
    constructor() {
        this.storageKey = 'golden_dawn_progress';
        this.progress = this.loadProgress();
        // Expose to window so standalone page-instantiated instances are discoverable
        try { window.theGoldenDawnGamification = window.theGoldenDawnGamification || this; } catch (e) {}
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
            console.warn('Failed to load The Golden Dawn progress:', error);
        }
        return {
            totalVisits: 0,
            visitedPages: [],
            currentGrade: 0, // 0: Neophyte, 1-3: Initiate grades, 4-6: Adept grades, 7: Adeptus Major
            gradeProgress: {}, // Track progress within current grade
            unlockedTarotCards: [],
            completedRituals: [],
            collectedTools: [],
            achievements: [],
            treeOfLifeProgress: [],
            elementalMastery: { fire: 0, water: 0, air: 0, earth: 0, spirit: 0 },
            kabbalisticKnowledge: [],
            alchemicalStages: [],
            astrologicalLearning: []
        };
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
            { level: 0, name: 'Neophyte', symbol: '⚪', color: '#ffffff' },
            { level: 1, name: 'Initiate 0°', symbol: '◇', color: '#ffb347' },
            { level: 2, name: 'Initiate 1°', symbol: '◇◇', color: '#ff8c42' },
            { level: 3, name: 'Initiate 2°', symbol: '◇◇◇', color: '#ff6b35' },
            { level: 4, name: 'Adept 3°', symbol: '🔷', color: '#f7931e' },
            { level: 5, name: 'Adept 4°', symbol: '🔷🔷', color: '#ffb366' },
            { level: 6, name: 'Adept 5°', symbol: '🔷🔷🔷', color: '#d4af37' },
            { level: 7, name: 'Adeptus Major', symbol: '⭐', color: '#ffd700' }
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
        
        this.saveProgress();
        this.signalHubUpdate();
    }

    /**
     * Check and advance grade progression
     */
    checkGradeProgression() {
        const grades = this.getGradesHierarchy();
        const currentGrade = this.progress.currentGrade;
        
        // Grade progression based on various factors
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
                this.unlockAchievement(`grade_${grades[req.grade].name.replace(/°.*/, '').toLowerCase()}`);
            }
        }
    }

    /**
     * Check for tarot card unlocks (22 Major Arcana)
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
        
        // Unlock based on visit patterns and other conditions
        for (let card of majorArcana) {
            const cardKey = `tarot_${card.id}`;
            if (!this.progress.unlockedTarotCards.includes(cardKey)) {
                // Progressive unlock based on visits
                const unlockThreshold = (card.id + 1) * 2;
                if (this.progress.totalVisits >= unlockThreshold) {
                    this.progress.unlockedTarotCards.push(cardKey);
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
     * Check for ritual completions and ceremonial tools
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
                // Rituals unlock based on visits and page visits
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
        
        // Distribute elemental knowledge based on visits
        for (let element of elements) {
            const elementalLesson = Math.floor(this.progress.totalVisits / 5);
            if (!this.progress.elementalMastery[element]) {
                this.progress.elementalMastery[element] = 0;
            }
            this.progress.elementalMastery[element] = Math.min(elementalLesson * 10, 200);
        }
        
        // Unlock elemental achievements
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
        }
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
                achievements: this.progress.achievements.length
            };
            window.esotericGamification.saveProgress();
        }

        // Dispatch event for hub listeners
        try {
            const detail = {
                totalVisits: this.progress.totalVisits,
                currentGrade: this.getCurrentGrade().name,
                unlockedCards: this.progress.unlockedTarotCards.length,
                completedRituals: this.progress.completedRituals.length,
                achievements: this.progress.achievements.length
            };
            document.dispatchEvent(new CustomEvent('goldenDawnProgressUpdate', { detail }));
        } catch (e) {
            console.debug('Failed to dispatch goldenDawnProgressUpdate', e);
        }
    }

    /**
     * Get all achievements for this project
     */
    getAllAchievements() {
        const achievements = {
            'grade_neophyte': { name: 'Seeker of Light', desc: 'Achieve Neophyte grade', icon: '⚪', category: 'grades' },
            'grade_initiate': { name: 'Entered Initiate', desc: 'Achieve Initiate grade', icon: '◇', category: 'grades' },
            'grade_adept': { name: 'Adept Magician', desc: 'Achieve Adept grade', icon: '🔷', category: 'grades' },
            'grade_adeptus': { name: 'Master of the Hermetic Arts', desc: 'Achieve Adeptus Major', icon: '⭐', category: 'grades' },
            'all_major_arcana': { name: 'Collector of Arcana', desc: 'Unlock all 22 Major Arcana cards', icon: '🎴', category: 'tarot' },
            'first_ritual': { name: 'Ritual Initiate', desc: 'Complete your first ritual', icon: '🕯️', category: 'rituals' },
            'five_rituals': { name: 'Ceremonial Master', desc: 'Complete 5 rituals', icon: '🕯️🕯️', category: 'rituals' },
            'all_tools': { name: 'Custodian of Tools', desc: 'Collect all ceremonial tools', icon: '⚔️', category: 'tools' },
            'element_fire_200': { name: 'Fire Master', desc: 'Master fire element', icon: '🔥', category: 'elements' },
            'element_water_200': { name: 'Water Master', desc: 'Master water element', icon: '💧', category: 'elements' },
            'element_air_200': { name: 'Air Master', desc: 'Master air element', icon: '🌬️', category: 'elements' },
            'element_earth_200': { name: 'Earth Master', desc: 'Master earth element', icon: '🌍', category: 'elements' },
            'element_spirit_200': { name: 'Spirit Master', desc: 'Master spirit element', icon: '✨', category: 'elements' },
            'tree_seeker': { name: 'Seeker of the Tree', desc: 'Begin exploration of the Tree of Life', icon: '🌳', category: 'kabbalah' },
            'path_walker': { name: 'Path Walker', desc: 'Complete a path working', icon: '🛤️', category: 'kabbalah' },
            'golden_visionary': { name: 'Golden Visionary', desc: 'Master all systems of the Golden Dawn', icon: '🔮', category: 'mastery' }
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
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    window.theGoldenDawnGamification = new TheGoldenDawnGamification();
});

// Ensure the Hub gamification script is available when this project loads directly
(function ensureHubLoaded() {
    if (window.esotericGamification) return;

    const candidates = [
        '/esoteric/scripts/esoteric-gamification-enhanced.js',
        '../scripts/esoteric-gamification-enhanced.js',
        '../../scripts/esoteric-gamification-enhanced.js',
        '/scripts/esoteric-gamification-enhanced.js'
    ];

    function tryLoad(i) {
        if (i >= candidates.length) return;
        const s = document.createElement('script');
        s.crossOrigin = 'anonymous';
        s.src = candidates[i];
        s.onload = function() {
            try {
                const Klass = window.EnhancedEsotericGamification || (typeof EnhancedEsotericGamification !== 'undefined' ? EnhancedEsotericGamification : null);
                if (!window.esotericGamification && Klass) {
                    window.esotericGamification = new Klass();
                    window.esotericGamification.init();
                }
                if (window.theGoldenDawnGamification && window.esotericGamification) {
                    window.theGoldenDawnGamification.signalHubUpdate();
                }
            } catch (e) { console.warn('Failed to signal or init hub after loading:', e); }
        };
        s.onerror = function() { tryLoad(i + 1); };
        document.head.appendChild(s);
    }

    tryLoad(0);
})();
