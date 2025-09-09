# 420360.xyz Development Instructions

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Project Overview
420360.xyz is a retro-style static website hosting arcade games with a 90s aesthetic. The site features popup animations, glitch effects, and multiple interactive games including Tarot Tetromino and Casino simulations.

## Working Effectively

### Bootstrap and Serve the Repository
- **Local development server**: `python3 -m http.server 8000` - starts in <1 second
- **Access the site**: Navigate to `http://localhost:8000`
- **NEVER CANCEL**: Server starts instantly, no timeout needed

### Testing and Validation
- **Casino game tests**: `cd games/casino && npm test` - takes 0.2 seconds. NEVER CANCEL.
- **All tests must pass**: 4 tests should pass, 0 should fail
- **Command output should show**: `Tests complete: 4 passed, 0 failed`

### Repository Structure Overview
```
/home/runner/work/420360/420360/
├── index.html              # Main landing page with retro popups
├── .github/
│   └── workflows/
│       └── static.yml      # GitHub Pages deployment
├── assets/
│   ├── images/            # Site images and favicon
│   ├── music/             # Background music files
│   └── sounds/            # Sound effects (9 audio files)
├── games/                 # Individual game directories
│   ├── casino/           # Dice casino simulation (has npm test)
│   ├── tarot-tetromino/  # Tetris with tarot card mechanics
│   ├── noctis-reverie/   # Dreamlike exploration game
│   ├── generative-art/   # Procedural art generator
│   └── [other games]     # Additional arcade games
├── about/                # About page content
├── null-vesper/          # Special content sections
└── testpages/            # Test page content
```

## Validation Scenarios

**ALWAYS run through complete end-to-end scenarios after making changes:**

### Primary Validation Workflow
1. **Start local server**: `python3 -m http.server 8000`
2. **Test homepage**: Navigate to `http://localhost:8000`
   - Verify retro popup animations appear
   - Confirm text morphing effects work
   - Test ABOUT and GAMES buttons in header
   - Verify social links and controls are functional
3. **Test games index**: Click GAMES button
   - Verify overlay opens with game grid
   - Confirm all games are listed
   - Test game filtering and search
4. **Test individual games**: Click on Tarot Tetromino
   - Game should load in overlay
   - Verify game board renders
   - Test start game functionality
   - Confirm controls are responsive
5. **Test casino game**: Navigate to `/games/casino/`
   - Verify simulation interface loads
   - Test placing a bet (click "Bet" button)
   - Confirm balance updates correctly
   - Verify analytics update

### Asset Validation
- **Images load**: Check `http://localhost:8000/assets/images/` for directory listing
- **Music accessible**: Verify `assets/music/Chaos is Our Love.mp3` exists
- **Sounds available**: Confirm 9 sound files in `assets/sounds/` directory

### Game-Specific Testing
- **Tarot Tetromino**: Start game, verify tetris pieces fall, test pause functionality
- **Casino**: Place bet, verify RNG system works, check analytics update
- **All games**: Verify back navigation to homepage works

## Build and Deployment

### No Build Process Required
- **This is a static website** - no compilation or build steps needed
- **GitHub Pages deployment**: Handled automatically by `.github/workflows/static.yml`
- **Deployment**: Pushes to `main` branch trigger automatic deployment
- **No package.json at root**: Only individual games may have their own dependencies

### Casino Game Testing
- **Run tests**: `cd games/casino && npm test`
- **Expected output**: `Tests complete: 4 passed, 0 failed`
- **Time**: Takes ~0.2 seconds to complete
- **Coverage**: Tests RNG, betting engine, liquidity pool distribution, fairness

## Development Guidelines

### Making Changes
- **Always test locally**: Start HTTP server and manually verify changes
- **Test across multiple games**: Ensure changes don't break existing functionality
- **Verify asset loading**: Check that images, music, and sounds still work
- **Cross-browser compatibility**: The site uses modern JavaScript features

### Before Committing
- **No linting required**: Pure static site with no linting setup
- **No build step**: Just ensure files are saved correctly
- **Manual testing is essential**: Run through validation scenarios

## Common Tasks

### Serving the Site Locally
```bash
cd /home/runner/work/420360/420360
python3 -m http.server 8000
# Access at http://localhost:8000
```

### Testing Casino Game
```bash
cd /home/runner/work/420360/420360/games/casino
npm test
# Should show: Tests complete: 4 passed, 0 failed
```

### Checking Assets
```bash
ls -la assets/images/    # Should show 5 image files
ls -la assets/music/     # Should show 1 MP3 file
ls -la assets/sounds/    # Should show 9 WAV files
```

## Troubleshooting

### Common Issues
- **Popups not loading**: Check browser console for CORS or blocked resource errors
- **Games not working**: Verify JavaScript isn't being blocked
- **Assets not loading**: Confirm HTTP server is serving from correct directory
- **Tests failing**: Check Node.js version and npm install status

### External Dependencies
- **Fonts**: Uses Google Fonts (may be blocked in some environments)
- **GIFs**: References Giphy CDN (may be blocked)
- **These blockages don't affect core functionality**

## Key Implementation Details

### Homepage Features
- **Retro popup ads**: Animated windows with random positioning
- **Text morphing**: Sentences change randomly with glitch effects
- **90s aesthetic**: Multiple CSS animations and effects
- **Sound system**: Background music and sound effects (user-activated)
- **Game launcher**: Embedded iframe system for games

### Game System
- **Overlay-based**: Games open in modal overlays
- **Individual implementations**: Each game is self-contained
- **PostMessage API**: Communication between parent and game iframes
- **Local storage**: Games may persist data locally

## Performance Notes
- **Heavy JavaScript**: Site uses many animations and effects
- **Asset intensive**: Multiple music and sound files
- **Client-side only**: No server processing required
- **Modern browser required**: Uses ES6+ features extensively

Remember: This is a static website project focused on providing a nostalgic 90s web experience with functional arcade games. Always prioritize visual functionality and user experience testing over traditional build processes.