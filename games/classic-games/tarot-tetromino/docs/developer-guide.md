# Tarot Tetromino: Developer Guide

This guide provides information for developers who want to understand, modify, or extend the Tarot Tetromino game.

## Getting Started

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- A text editor or IDE
- A modern web browser for testing

### Project Setup

1. Clone or download the repository
2. No build process is required - the game uses vanilla JavaScript
3. Open `index.html` in a web browser to run the game

### Project Structure

The project follows a modular structure with separate files for different components:

```
tarot-tetromino/
├── assets/
│   ├── music/       # Background music files
│   └── sounds/      # Sound effect files
├── css/             # CSS stylesheets
├── docs/            # Documentation
├── src/             # JavaScript source files
└── index.html       # Main HTML file
```

## Core Concepts

### Namespace

The game uses the `TarotTetris` namespace to organize shared functionality and prevent global namespace pollution. Most core functionality is attached to this namespace.

```javascript
// Example of namespace usage
TarotTetris.score = 0;
TarotTetris.updateScore = function(element) {
    element.textContent = `Score: ${TarotTetris.score}`;
};
```

### Event System

The event system allows components to communicate without direct dependencies. Components can emit events and subscribe to events emitted by other components.

```javascript
// Subscribe to an event
TarotTetris.events.on('game:over', function(data) {
    console.log(`Game over! Score: ${data.score}`);
});

// Emit an event
TarotTetris.events.emit('game:over', { score: 1000 });
```

### Game Loop

The game uses `requestAnimationFrame` for the main game loop, which handles updating the game state and rendering.

```javascript
function update(time = 0) {
    const deltaTime = time - lastTime;
    
    // Update game state based on deltaTime
    
    // Request next frame if game is not over
    if (!gameOver) {
        requestAnimationFrame(update);
    }
    
    lastTime = time;
}

// Start the game loop
requestAnimationFrame(update);
```

## Common Development Tasks

### Adding a New Tetromino Shape

1. Modify the `TarotTetris.Piece` class in `src/piece.js`:

```javascript
// Add a new shape definition
TarotTetris.Piece.SHAPES['X'] = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
];

// Add to the list of available types
TarotTetris.Piece.TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L', 'X'];
```

2. Add color definition for the new shape:

```javascript
TarotTetris.Piece.COLORS['X'] = '#ff00ff'; // Magenta
```

### Adding a New Tarot Card

1. Add a new entry to the `tarotEffects` object in `src/tarot.js`:

```javascript
"New Card Name": {
    effect: function() {
        // Implement the card's effect
        TarotTetris.score += 300;
        updateScore();
        
        // Add visual effects
        if (typeof addTarotVisualEffect === "function") {
            addTarotVisualEffect('particle-burst', 3000, { color: '#ff00ff' });
        }
        
        // Update game info
        updateGameInfo('New Card adds 300 bonus points!');
    },
    description: "Adds 300 bonus points to your score."
}
```

2. Ensure the card is included in the deck initialization if it's not meant to be a special unlock.

### Adding a New Shop Item

1. Add a new item to the shop configuration in `src/shop.js`:

```javascript
{
    id: 'new_item',
    name: 'New Item',
    description: 'Description of what this item does',
    cost: 500,
    maxLevel: 3,
    effect: function(level) {
        // Implement the item's effect based on level
        console.log(`New item activated at level ${level}`);
    }
}
```

2. Add UI elements for the new item if needed.

### Creating a New Visual Effect

1. Add a new effect function to `src/visualEffects.js`:

```javascript
function createNewEffect(options = {}) {
    const element = document.createElement('div');
    element.className = 'new-effect';
    
    // Set up the effect's appearance
    element.style.backgroundColor = options.color || '#ffffff';
    
    // Add to the DOM
    const effectsContainer = document.getElementById('board-effects');
    effectsContainer.appendChild(element);
    
    // Animate the effect
    setTimeout(() => {
        element.classList.add('active');
        
        // Clean up after animation
        setTimeout(() => {
            element.remove();
        }, 1000);
    }, 0);
}

// Register the effect
TarotTetris.effects = TarotTetris.effects || {};
TarotTetris.effects.newEffect = createNewEffect;
```

2. Add CSS for the new effect in `css/effects.css`:

```css
.new-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.new-effect.active {
    opacity: 1;
}
```

### Adding a New Sound Effect

1. Add the sound file to `assets/sounds/`
2. Register the sound in `src/soundSystem.js`:

```javascript
TarotTetris.sound.register('new_sound', 'assets/sounds/new_sound.mp3');
```

3. Play the sound when needed:

```javascript
TarotTetris.sound.play('new_sound');
```

## Advanced Topics

### Performance Optimization

1. **Minimize DOM Updates**: Batch DOM updates and use requestAnimationFrame
2. **Use Canvas Efficiently**: Avoid redrawing the entire canvas when only part of it changes
3. **Object Pooling**: Reuse objects instead of creating new ones for frequently created items
4. **Event Delegation**: Use event delegation for UI elements with many similar interactions

### Mobile Optimization

1. **Touch Controls**: Ensure touch controls are responsive and intuitive
2. **Viewport Settings**: Use appropriate viewport settings in the HTML
3. **Performance**: Be mindful of mobile device limitations
4. **Battery Usage**: Reduce animation complexity on mobile devices

### Adding a New Game Mode

1. Create a new game mode configuration:

```javascript
const timeAttackMode = {
    name: 'Time Attack',
    duration: 180000, // 3 minutes
    scoreMultiplier: 1.5,
    initialize: function() {
        // Custom initialization for this mode
    },
    update: function(deltaTime) {
        // Custom update logic for this mode
    },
    handleGameOver: function() {
        // Custom game over handling
    }
};
```

2. Modify the game initialization to support the new mode:

```javascript
function initializeGame(mode = 'standard') {
    // Common initialization
    
    // Mode-specific initialization
    if (mode === 'timeAttack') {
        timeAttackMode.initialize();
        currentGameMode = timeAttackMode;
    } else {
        // Standard mode initialization
    }
}
```

3. Update the game loop to use the current mode's update function:

```javascript
function update(time = 0) {
    const deltaTime = time - lastTime;
    
    // Common updates
    
    // Mode-specific updates
    if (currentGameMode && typeof currentGameMode.update === 'function') {
        currentGameMode.update(deltaTime);
    }
    
    // Continue with normal update
    
    lastTime = time;
    requestAnimationFrame(update);
}
```

## Troubleshooting

### Common Issues

1. **Game Performance**: If the game is running slowly, check for:
   - Excessive DOM updates
   - Inefficient canvas rendering
   - Memory leaks from event listeners

2. **Mobile Issues**: If there are problems on mobile devices:
   - Check touch event handling
   - Verify viewport settings
   - Test on multiple device types

3. **Sound Issues**: If sound is not working:
   - Check browser autoplay policies
   - Verify file paths and formats
   - Test with different audio formats

### Debugging Tips

1. Use `console.log()` to track game state and function execution
2. Use browser developer tools to inspect the DOM and debug JavaScript
3. Use the Performance tab in Chrome DevTools to identify bottlenecks
4. Add a debug mode flag to display additional information:

```javascript
const DEBUG_MODE = true;

function debug(message) {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`);
    }
}

// Usage
debug('Piece spawned: ' + piece.type);
```

## Contributing

When contributing to the project:

1. Follow the existing code style and naming conventions
2. Test thoroughly on multiple browsers and devices
3. Document new features or changes
4. Keep modifications modular and maintainable

## Resources

- [MDN Web Docs](https://developer.mozilla.org/) - Reference for HTML, CSS, and JavaScript
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) - Guide to canvas drawing
- [Tetris Guidelines](https://tetris.fandom.com/wiki/Tetris_Guideline) - Official Tetris gameplay guidelines
