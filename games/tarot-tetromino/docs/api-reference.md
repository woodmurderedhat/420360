# Tarot Tetromino: API Reference

This document provides a reference for the public API of Tarot Tetromino, including the global namespace, event system, and key functions that can be used to interact with the game.

## TarotTetris Namespace

The `TarotTetris` namespace contains shared functionality and state that can be accessed throughout the game.

### Game State Properties

```javascript
// Core game state
TarotTetris.score         // Current game score
TarotTetris.level         // Current game level
TarotTetris.gold          // Player's gold amount
TarotTetris.dropInterval  // Current piece drop interval (in ms)
TarotTetris.combo         // Current combo count

// Level progression
TarotTetris.linesClearedThisLevel  // Lines cleared in current level
TarotTetris.linesToLevelUp         // Lines needed to reach next level
```

### Core Functions

```javascript
// Update UI elements
TarotTetris.updateScore(scoreElement)       // Update score display
TarotTetris.updateLevel(levelElement)       // Update level display
TarotTetris.updateGold(goldElement)         // Update gold display
TarotTetris.updateGameInfo(element, text)   // Update game info text

// Game speed control
TarotTetris.setGameSpeed(interval)          // Set the piece drop interval

// Hold piece functionality
TarotTetris.holdPiece(state)                // Hold the current piece

// Next piece preview
TarotTetris.updateNextUI(nextQueue)         // Update next piece preview

// Hold piece UI
TarotTetris.updateHoldUI(heldPieces)        // Update hold piece display
```

### Classes

```javascript
// Board class
TarotTetris.Board
  .reset()                // Reset the board
  .mergePiece(piece)      // Merge a piece into the board
  .clearLines()           // Clear completed lines
  .collides(piece)        // Check if a piece collides with the board
  .moveRowsUp(rows)       // Move all rows up
  .addRandomGarbageRow()  // Add a random garbage row
  .clearTopRows(count)    // Clear the top rows
  .clearBottomRows(count) // Clear the bottom rows
  .clearRandomRow()       // Clear a random row
  .isBoardFull()          // Check if the board is full

// Piece class
TarotTetris.Piece
  .moveLeft()             // Move piece left
  .moveRight()            // Move piece right
  .moveDown()             // Move piece down
  .rotate(board)          // Rotate piece
  .canMoveDown(board)     // Check if piece can move down
  .canMoveLeft(board)     // Check if piece can move left
  .canMoveRight(board)    // Check if piece can move right
```

## Event System

The event system allows components to communicate with each other through events.

### Event Constants

```javascript
TarotTetris.EVENTS = {
    GAME_INITIALIZED: 'game:initialized',
    GAME_STARTED: 'game:started',
    GAME_OVER: 'game:over',
    PIECE_SPAWNED: 'piece:spawned',
    PIECE_DROPPED: 'piece:dropped',
    LINES_CLEARED: 'lines:cleared',
    LEVEL_UP: 'level:up',
    TAROT_CARD_DRAWN: 'tarot:card_drawn',
    TAROT_CARD_PLAYED: 'tarot:card_played',
    SHOP_ITEM_PURCHASED: 'shop:item_purchased',
    OBJECTIVE_COMPLETED: 'objective:completed'
};
```

### Event Methods

```javascript
// Subscribe to an event
TarotTetris.events.on(eventName, callback)

// Emit an event
TarotTetris.events.emit(eventName, data)

// Remove an event listener
TarotTetris.events.off(eventName, callback)
```

### Event Usage Example

```javascript
// Subscribe to the LINES_CLEARED event
TarotTetris.events.on(TarotTetris.EVENTS.LINES_CLEARED, function(data) {
    console.log(`Cleared ${data.linesCleared} lines for ${data.score} points`);
});

// Emit the LINES_CLEARED event
TarotTetris.events.emit(TarotTetris.EVENTS.LINES_CLEARED, {
    linesCleared: 4,
    score: 800
});
```

## Sound System

The sound system manages game audio, including sound effects and background music.

```javascript
// Initialize the sound system
TarotTetris.sound.initialize()

// Play a sound effect
TarotTetris.sound.play(soundName)

// Play background music
TarotTetris.sound.playMusic(musicName)

// Stop background music
TarotTetris.sound.stopMusic()

// Set volume
TarotTetris.sound.setVolume(volume)  // 0.0 to 1.0

// Mute/unmute
TarotTetris.sound.mute()
TarotTetris.sound.unmute()
```

## Shop System

The shop system manages in-game purchases and upgrades.

```javascript
// Initialize the shop
TarotTetris.shop.init()

// Purchase an item
TarotTetris.shop.purchase(itemId)

// Check if player can afford an item
TarotTetris.shop.canAfford(itemId)

// Get upgrade level
TarotTetris.shop.getUpgradeLevel(upgradeId)
```

## Tarot System

Functions for interacting with the tarot card system.

```javascript
// Initialize the tarot deck
initializeTarotDeck()

// Draw a tarot card
drawTarotCard()

// Play a tarot card
playTarotCard(cardIndex)

// Update the tarot UI
updateTarotUI()
```

## Visual Effects

Functions for adding visual effects to the game.

```javascript
// Add a tarot visual effect
addTarotVisualEffect(effectName, duration, options)

// Available effects:
// - 'flash'
// - 'particle-burst'
// - 'screen-shake'
// - 'neon-glow'
// - 'scanlines'
```

## Global Functions

These functions are available globally for compatibility with the script loading system.

```javascript
// Game control
startGame()               // Start the game
handleGameOver()          // Handle game over state
update(time)              // Main game loop

// Piece control
spawnPiece()              // Spawn a new piece
hardDropPiece()           // Hard drop the current piece
holdPiece()               // Hold the current piece

// UI updates
updateScore()             // Update the score display
updateGameInfo(text)      // Update game info text
```

## Integration Examples

### Adding a Custom Event Listener

```javascript
// Listen for game over events
TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, function(data) {
    console.log(`Game over! Player: ${data.playerName}, Score: ${data.score}`);
    
    // Custom analytics tracking
    trackGameCompletion(data.playerName, data.score, data.level);
});
```

### Creating a Custom Tarot Card Effect

```javascript
// Add a new tarot effect
tarotEffects["Custom Card"] = {
    effect: function() {
        // Custom effect implementation
        TarotTetris.score += 200;
        updateScore();
        
        // Play sound effect
        TarotTetris.sound.play('bonus');
        
        // Add visual effect
        addTarotVisualEffect('particle-burst', 2000, { color: '#ff00ff' });
        
        // Update game info
        updateGameInfo('Custom Card grants 200 bonus points!');
    },
    description: "Adds 200 bonus points to your score."
};
```

### Extending the Game with a Plugin

```javascript
// Create a plugin that adds new functionality
(function() {
    // Add to the TarotTetris namespace
    TarotTetris.plugins = TarotTetris.plugins || {};
    
    // Create a new plugin
    TarotTetris.plugins.customPlugin = {
        init: function() {
            // Initialize plugin
            console.log('Custom plugin initialized');
            
            // Add event listeners
            TarotTetris.events.on(TarotTetris.EVENTS.GAME_STARTED, this.onGameStarted);
        },
        
        onGameStarted: function(data) {
            console.log(`Game started for player: ${data.playerName}`);
            // Add custom functionality
        }
    };
    
    // Auto-initialize when the document is ready
    document.addEventListener('DOMContentLoaded', function() {
        TarotTetris.plugins.customPlugin.init();
    });
})();
```
