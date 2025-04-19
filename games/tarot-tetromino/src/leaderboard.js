/**
 * Manages the leaderboard functionality, including adding scores,
 * saving and loading scores from local storage, and displaying the leaderboard.
 */
const leaderboard = {
    /**
     * Array to store leaderboard scores. Each score is an object
     * with 'name' and 'score' properties.
     * @type {Array<{name: string, score: number}>}
     */
    scores: [],

    /**
     * Adds a new score to the leaderboard, sorts the scores,
     * and keeps only the top 10 scores.
     * @param {string} name - The name of the player.
     * @param {number} score - The score of the player.
     */
    addScore: function(name, score) {
        if (typeof name !== 'string' || typeof score !== 'number') {
            console.error("Invalid input: Name must be a string and score must be a number.");
            return;
        }

        this.scores.push({ name, score });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10); // Keep top 10 scores
        this.saveScores();
    },

    /**
     * Saves the leaderboard scores to local storage as a JSON string.
     */
    saveScores: function() {
        try {
            localStorage.setItem('tetrisLeaderboard', JSON.stringify(this.scores));
        } catch (error) {
            console.error("Error saving scores to localStorage:", error);
        }
    },

    /**
     * Loads the leaderboard scores from local storage, parsing the JSON string.
     */
    loadScores: function() {
        try {
            const savedScores = localStorage.getItem('tetrisLeaderboard');
            if (savedScores) {
                this.scores = JSON.parse(savedScores);
            }
        } catch (error) {
            console.error("Error loading scores from localStorage:", error);
            this.scores = []; // Reset scores if parsing fails
        }
    },

    /**
     * Displays the leaderboard scores in the designated HTML element.
     */
    displayScores: function() {
        const leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) {
            console.warn("Leaderboard element not found.");
            return;
        }
        leaderboardElement.innerHTML = '';
        this.scores.forEach(score => {
            const scoreElement = document.createElement('div');
            scoreElement.textContent = `${score.name}: ${score.score}`;
            leaderboardElement.appendChild(scoreElement);
        });
    }
};

leaderboard.loadScores();
leaderboard.displayScores(); // Ensure leaderboard is displayed on page load