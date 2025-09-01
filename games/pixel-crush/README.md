# Pixel Crush

A colorful Candy Crush-style match-3 puzzle game built for the 420360 retro gaming collection.

## 🎮 How to Play

### Objective
- Match 3 or more pixels of the same color to clear them
- Reach the target score within the allotted moves
- Progress through increasingly challenging levels

### Controls
- **Mouse/Desktop**: Click to select a pixel, then click an adjacent pixel to swap
- **Touch/Mobile**: Tap and drag to swap pixels, or tap to select and tap adjacent to swap
- **Keyboard**: Space/Escape to pause, R to restart, N for next level

### Game Features

#### Match-3 Mechanics
- **8x8 Grid**: Classic puzzle board with colorful pixels
- **Gravity Physics**: Pixels fall down to fill empty spaces
- **New Pixel Generation**: Fresh pixels spawn at the top

#### Power-Ups
- **4-Match Line Power**: Creates a power pixel that clears an entire row or column
- **5-Match Rainbow Power**: Creates a power pixel that clears all pixels of one color
- **Combo System**: Chain matches for score multipliers

#### Progression
- **10 Levels**: Each with increasing difficulty and score targets
- **Move Limits**: Strategic gameplay with limited moves per level
- **Score Targets**: Reach specific point goals to advance

#### Visual Themes
- **Classic**: Traditional bright colors
- **Neon**: Vibrant electric colors
- **Retro**: Vintage color palette
- **Pastel**: Soft, muted tones

## 🚀 Features

### Responsive Design
- **Desktop**: Full sidebar with controls and statistics
- **Mobile**: Optimized touch-friendly layout
- **Tablet**: Adaptive design for medium screens

### Audio Integration
- Integrates with 420360's shared sound system
- Sound effects for moves, matches, power-ups, and game events
- Respects user's SFX preference settings

### Progress Tracking
- **Local Storage**: Save progress and high scores
- **Best Scores**: Track best scores for each level
- **Theme Persistence**: Remember preferred color theme
- **Statistics**: View total score across all games

### Accessibility
- High contrast color schemes
- Keyboard navigation support
- Screen reader friendly UI elements
- Touch gesture support for mobile

## 🛠 Technical Implementation

### Architecture
The game follows a modular design pattern:

- **`index.html`**: Main game page with retro 420360 styling
- **`board.js`**: Grid logic, matching algorithms, and power-up system
- **`game.js`**: Game state management, scoring, and level progression
- **`ui.js`**: User interface updates, animations, and particle effects

### Key Technologies
- **Canvas 2D API**: Smooth pixel rendering and animations
- **Web Audio API**: Sound effects via shared game-sounds.js
- **localStorage**: Progress persistence
- **CSS Grid/Flexbox**: Responsive layout design
- **Touch Events**: Mobile gesture support

### Integration
- Uses 420360's shared sound system (`/assets/js/game-sounds.js`)
- Follows site-wide CSS custom property conventions
- Consistent with other games' scoring and progress systems
- Integrated into the main games index with proper metadata

## 🎨 Customization

### Adding New Themes
Edit the `THEMES` object in `board.js`:

```javascript
const THEMES = {
    newTheme: [
        '#color1', // Red variant
        '#color2', // Green variant
        '#color3', // Blue variant
        '#color4', // Yellow variant
        '#color5', // Magenta variant
        '#color6'  // Cyan variant
    ]
};
```

### Adjusting Difficulty
Modify constants in `game.js`:

```javascript
const INITIAL_MOVES = 30;           // Starting moves per level
const LEVEL_TARGETS = [1000, ...];  // Score targets for each level
const SCORE_MULTIPLIERS = { ... };  // Points per match size
```

### Power-Up Behavior
Customize power-up generation in `board.js`:

```javascript
// 4-match creates line power-up
// 5+ match creates rainbow power-up
// Modify generatePowerUps() method for different behaviors
```

## 🏗 Development

### Running Locally
1. Start a local web server in the project root
2. Navigate to `/games/pixel-crush/`
3. Game will initialize automatically

### Testing
- Test on multiple screen sizes for responsive design
- Verify touch gestures work on mobile devices
- Check audio integration with site-wide SFX toggle
- Confirm progress saving/loading functionality

### Browser Compatibility
- Modern browsers with Canvas 2D API support
- Mobile browsers with touch event support
- ES6+ JavaScript features used throughout

## 📝 Game Balance

### Scoring System
- **3-match**: 100 points × combo × level multiplier
- **4-match**: 300 points × combo × level multiplier
- **5-match**: 800 points × combo × level multiplier
- **6+ match**: Exponentially increasing rewards
- **Power-ups**: 50 points per affected pixel

### Level Progression
- Moves increase slightly with each level (+5 per level)
- Score targets follow an exponential curve
- Level multiplier increases by 10% per level

### Combo System
- Each consecutive match increases combo counter
- Combo multiplier: 1 + (combo × 0.5)
- Combo resets after no matches for 1 second

---

Built with ❤️ for the 420360 retro gaming experience.