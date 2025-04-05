const leaderboard = {
    scores: [],

    addScore: function(name, score) {
        this.scores.push({ name, score });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10); // Keep top 10 scores
        this.saveScores();
    },

    saveScores: function() {
        localStorage.setItem('tetrisLeaderboard', JSON.stringify(this.scores));
    },

    loadScores: function() {
        const savedScores = localStorage.getItem('tetrisLeaderboard');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
    },

    displayScores: function() {
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = '';
        this.scores.forEach(score => {
            const scoreElement = document.createElement('div');
            scoreElement.textContent = `${score.name}: ${score.score}`;
            leaderboardElement.appendChild(scoreElement);
        });
    }
};

leaderboard.loadScores();