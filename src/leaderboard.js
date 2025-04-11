/**
 * Manages the leaderboard functionality, including adding scores,
 * saving and loading scores from local storage, and displaying the leaderboard.
 */
/**
 * Sanitizes a string by escaping HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

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
    addScore(name, score) {
        if (typeof name !== 'string' || typeof score !== 'number') {
            console.error("Invalid input: Name must be a string and score must be a number.");
            return;
        }

        // Always sanitize the name before storing
        const safeName = sanitize(name);

        this.scores.push({ name: safeName, score });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10); // Keep top 10 scores
        this.saveScores();
    },

    /**
     * Saves the leaderboard scores to local storage as a JSON string.
     */
    saveScores() {
        try {
            localStorage.setItem('tetrisLeaderboard', JSON.stringify(this.scores));
        } catch (error) {
            console.error("Error saving scores to localStorage:", error);
        }
    },

    /**
     * Loads the leaderboard scores from local storage, parsing the JSON string.
     */
    loadScores() {
        try {
            const savedScores = localStorage.getItem('tetrisLeaderboard');
            this.scores = savedScores ? JSON.parse(savedScores) : [];
        } catch (error) {
            console.error("Error loading scores from localStorage:", error);
            this.scores = []; // Reset scores if parsing fails
        }
    },

    /**
     * Displays the leaderboard scores in the designated HTML element.
     */
    displayScores() {
        const leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) {
            console.warn("Leaderboard element not found.");
            return;
        }
        leaderboardElement.innerHTML = this.scores
            .map(({ name, score }) => `<div>${name}: ${score}</div>`)
            .join('');
        // All names are sanitized before storage, so this is safe.
    }
};

leaderboard.loadScores();
leaderboard.displayScores(); // Ensure leaderboard is displayed on page load
export default leaderboard;
