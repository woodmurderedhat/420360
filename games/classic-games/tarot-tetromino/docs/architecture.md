# Tarot Tetromino: Architecture

## Code Structure Overview

Tarot Tetromino follows a modular architecture with separate JavaScript files for different game components. The game uses vanilla JavaScript without external frameworks, making it lightweight and easy to understand.

## File Organization

### HTML Structure

- `index.html`: Main game HTML file containing the game layout and UI elements

### CSS Files

- `css/style.css`: Main stylesheet
- `css/base.css`: Base styling for common elements
- `css/board.css`: Styling for the game board
- `css/effects.css`: Visual effects styling
- `css/footer.css`: Footer styling
- `css/modern-tarot.css`: Tarot card styling
- `css/objectives-panel.css`: Objectives panel styling
- `css/overlays.css`: Game overlays styling
- `css/panel.css`: UI panel styling
- `css/shop.css`: Shop interface styling
- `css/sound-settings.css`: Sound settings styling
- `css/tarot.css`: Tarot card styling

### JavaScript Files

- `src/game.js`: Main game logic and initialization
- `src/board.js`: Game board representation and mechanics
- `src/piece.js`: Tetromino piece logic
- `src/tarot.js`: Tarot card system and effects
- `src/eventSystem.js`: Custom event handling system
- `src/soundSystem.js`: Audio management
- `src/wallKick.js`: Wall kick implementation for piece rotation
- `src/tSpinDetection.js`: T-spin detection logic
- `src/leaderboard.js`: High score tracking
- `src/gameOverlays.js`: Game overlay screens
- `src/objectivesPanel.js`: Objectives system
- `src/arcadeads.js`: In-game advertisement system
- `src/gameControls.js`: Keyboard and button controls
- `src/visualEffects.js`: Visual effects system
- `src/hold.js`: Hold piece functionality
- `src/ghostPiece.js`: Ghost piece visualization
- `src/gameState.js`: Game state management
- `src/touchControls.js`: Mobile touch controls
- `src/shop.js`: In-game shop system

### Assets

- `assets/music/`: Background music files
- `assets/sounds/`: Sound effect files

## Dependency Graph

```
index.html
├── CSS Files
│   ├── style.css
│   ├── base.css
│   ├── board.css
│   └── ...
│
└── JavaScript Files
    ├── eventSystem.js
    ├── soundSystem.js
    ├── wallKick.js
    ├── tSpinDetection.js
    ├── board.js
    ├── piece.js
    ├── leaderboard.js
    ├── gameOverlays.js
    ├── objectivesPanel.js
    ├── tarot.js
    ├── arcadeads.js
    ├── gameControls.js
    ├── visualEffects.js
    ├── hold.js
    ├── ghostPiece.js
    ├── gameState.js
    ├── touchControls.js
    ├── shop.js
    └── game.js (initializes the game)
```

## Component Interactions

### Core Game Loop (game.js)

The main game loop in `game.js` coordinates the overall game flow:

1. Initializes the game board and UI
2. Manages the game state (playing, paused, game over)
3. Handles the spawning of new pieces
4. Processes player input via the control systems
5. Updates the game state based on piece movement and collision
6. Triggers line clearing and scoring
7. Manages level progression

### Event System (eventSystem.js)

The event system provides a communication layer between components:

- Components can emit events when significant actions occur
- Other components can subscribe to these events and react accordingly
- Decouples components for better maintainability

### State Management

Game state is managed through a combination of:

- Global variables for core game state
- The `TarotTetris` namespace for shared functionality
- Local storage for persistent data (high scores, upgrades)

## Rendering System

The game uses a combination of HTML/CSS for UI elements and Canvas for the game board:

- The main game board is rendered using a Canvas element
- UI elements (score, level, next piece, etc.) are HTML elements
- Tarot cards and effects use a combination of HTML/CSS and Canvas

## Data Flow

1. User input is captured by control systems (keyboard, touch)
2. Input is processed by the game loop to move or rotate the active piece
3. The board system checks for collisions and merges pieces when they land
4. The scoring system updates based on line clears and other actions
5. The tarot system may be triggered based on game events
6. The UI is updated to reflect the current game state
7. The game loop continues until game over

## Persistence

The game uses localStorage for persistent data:

- High scores are saved to localStorage
- Shop upgrades and unlocks are persisted between sessions
- Player preferences (sound settings, etc.) are saved

## Extensibility

The modular architecture makes it easy to extend the game:

- New tetromino shapes can be added to the piece system
- Additional tarot cards can be implemented in the tarot system
- New visual effects can be added to the effects system
- The shop can be expanded with new upgrades
