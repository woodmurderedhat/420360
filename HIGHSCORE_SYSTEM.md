# Global Highscore System - 420360

## Overview

The 420360 site now features a comprehensive global highscore tracking system that allows all games to submit scores to a centralized leaderboard while maintaining backward compatibility with existing localStorage-based scoring.

## Features

- **Global Leaderboard**: View high scores across all games or filter by specific game
- **Multiple Score Types**: Supports different score formats (score, level, wins, leaderboard, total)
- **Automatic Integration**: Easy setup for new games with minimal code changes
- **Backward Compatibility**: Maintains existing localStorage functionality as fallback
- **Retro Styling**: Matches the 90s aesthetic of the site
- **Real-time Updates**: Scores update immediately with refresh functionality

## Usage

### For Players

1. **Access Leaderboard**: Click the "LEADERBOARD" button in the header or press 'L'
2. **Filter Games**: Use the dropdown to view scores for specific games or all games
3. **Refresh**: Click the refresh button (🔄) to update scores
4. **Close**: Click the X button or press Escape to close

### For Developers

#### Quick Integration (Recommended)

For most games, simply add this line to the `<head>` section:

```html
<!-- Global Highscore Integration -->
<script src="../../assets/js/highscore-integration.js"></script>
```

This automatically:
- Detects the game ID from URL/title
- Monitors localStorage changes for highscore updates
- Submits scores to the global system

#### Manual Integration

For custom scoring systems, use the manual submission function:

```javascript
// Submit a score manually
window.SubmitHighscore(gameId, score, scoreType, playerName);

// Examples:
window.SubmitHighscore('snake', 150, 'score', 'Player');
window.SubmitHighscore('pong', 5, 'wins', 'Player');
window.SubmitHighscore('maze', 10, 'level', 'Player');
```

#### Score Types

- `'score'` - Standard numeric score (default)
- `'level'` - Level reached
- `'wins'` - Number of wins/matches
- `'leaderboard'` - Complex leaderboard object
- `'total'` - Total accumulated points

## Architecture

### Components

1. **HighscoreService** (`assets/js/highscore-service.js`)
   - Core service handling score submission and retrieval
   - Supabase-ready with localStorage fallback
   - Score normalization and caching

2. **GlobalLeaderboard** (`assets/js/global-leaderboard.js`)
   - UI component for displaying scores
   - Filtering and sorting functionality
   - Responsive design

3. **Integration Helper** (`assets/js/highscore-integration.js`)
   - Auto-integration for easy setup
   - Game ID detection
   - localStorage monitoring

### Database Backend

Currently uses localStorage for demo/fallback mode. Ready for Supabase integration:

```javascript
// Supabase configuration (to be updated with real credentials)
this.supabaseUrl = 'https://xyzcompany.supabase.co';
this.supabaseKey = 'your-anon-key-here';
```

## Games Integrated

### Fully Integrated (Manual)
- Snake
- Breakout

### Auto-Integrated
- Pong
- Flappy Bird
- Memory Cards
- Asteroids  
- Space Invaders
- Infinite Jumper
- Neon Simon
- Pixel Rain
- Glitch Maze

### Pending Integration
- Tarot Tetromino
- Pixel Crush
- Casino games
- Generative Art (non-scored)
- Tim Oracle (non-scored)
- Noctis Reverie (non-scored)

## Configuration

### Adding New Games

1. Add game entry to `games/index.html` GAMES array:
```javascript
{ 
  id: 'new-game', 
  name: 'NEW GAME', 
  url: 'new-game/', 
  tags: ['arcade'], 
  blurb: 'Game description.', 
  gif: 'https://media.giphy.com/media/ID/giphy.gif',
  scoreKey: 'newGameHighScore', 
  scoreType: 'score' 
}
```

2. Add integration script to game's index.html or use manual submission

3. Update localStorage key mapping in highscore-service.js if needed

### Customizing Display

The leaderboard styling can be customized via CSS variables in `global-leaderboard.js`:

```css
--bg: #1a1f1a
--primary: #4a8c3a  
--secondary: #7b5e8b
--highlight: #8fbc8f
--text: #e8f5e8
```

## Future Enhancements

- [ ] Real Supabase database integration
- [ ] Player name input system
- [ ] Achievement/badge system
- [ ] Social sharing features
- [ ] Export/import functionality
- [ ] Analytics and statistics

## Troubleshooting

### Scores Not Appearing
1. Check browser console for errors
2. Verify game ID matches expected format
3. Ensure localStorage keys are correct
4. Try refreshing the leaderboard manually

### Integration Issues
1. Verify script paths are correct (`../../assets/js/...`)
2. Check that HighscoreService is loaded before game scripts
3. Ensure game is properly detecting score updates

### Performance
- Leaderboard caches scores for 5 minutes
- Maximum 1000 global scores stored in localStorage
- Auto-refresh every 30 seconds when visible