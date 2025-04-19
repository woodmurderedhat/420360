# Event System

The Event System provides a centralized way for different components of Tarot Tetromino to communicate with each other without direct dependencies. It implements a publish-subscribe pattern that allows components to emit events and subscribe to events emitted by other components.

## File: `src/eventSystem.js`

## Core Responsibilities

- Provide a mechanism for components to emit events
- Allow components to subscribe to events
- Handle event unsubscription
- Pass data between components through events

## Implementation

The Event System is implemented as a simple event emitter attached to the `TarotTetris` namespace:

```javascript
// Initialize the TarotTetris namespace if it doesn't exist
window.TarotTetris = window.TarotTetris || {};

// Event system implementation
TarotTetris.events = {
    // Store event listeners
    listeners: {},
    
    // Subscribe to an event
    on: function(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
        
        // Return a function to unsubscribe
        return () => this.off(eventName, callback);
    },
    
    // Unsubscribe from an event
    off: function(eventName, callback) {
        if (!this.listeners[eventName]) return;
        
        const index = this.listeners[eventName].indexOf(callback);
        if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
        }
    },
    
    // Emit an event
    emit: function(eventName, data) {
        if (!this.listeners[eventName]) return;
        
        this.listeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }
};
```

## Event Constants

The Event System defines constants for common events to ensure consistency:

```javascript
// Event constants
TarotTetris.EVENTS = {
    // Game lifecycle events
    GAME_INITIALIZED: 'game:initialized',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',
    
    // Piece events
    PIECE_SPAWNED: 'piece:spawned',
    PIECE_MOVED: 'piece:moved',
    PIECE_ROTATED: 'piece:rotated',
    PIECE_DROPPED: 'piece:dropped',
    PIECE_LOCKED: 'piece:locked',
    PIECE_HELD: 'piece:held',
    
    // Board events
    LINES_CLEARED: 'lines:cleared',
    BOARD_CLEARED: 'board:cleared',
    
    // Scoring events
    SCORE_UPDATED: 'score:updated',
    LEVEL_UP: 'level:up',
    COMBO_UPDATED: 'combo:updated',
    
    // Tarot events
    TAROT_CARD_DRAWN: 'tarot:card_drawn',
    TAROT_CARD_PLAYED: 'tarot:card_played',
    
    // Shop events
    SHOP_ITEM_PURCHASED: 'shop:item_purchased',
    GOLD_UPDATED: 'gold:updated',
    
    // Objective events
    OBJECTIVE_PROGRESS: 'objective:progress',
    OBJECTIVE_COMPLETED: 'objective:completed'
};
```

## Usage Examples

### Subscribing to Events

```javascript
// Subscribe to the GAME_OVER event
TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, function(data) {
    console.log(`Game over! Player: ${data.playerName}, Score: ${data.score}`);
    
    // Update UI or perform other actions
    updateGameOverUI(data.playerName, data.score);
});

// Subscribe to the LINES_CLEARED event
TarotTetris.events.on(TarotTetris.EVENTS.LINES_CLEARED, function(data) {
    console.log(`Cleared ${data.linesCleared} lines for ${data.score} points`);
    
    // Update UI or perform other actions
    updateLinesCounter(data.linesCleared);
    playLineClearSound(data.linesCleared);
});
```

### Emitting Events

```javascript
// Emit the GAME_STARTED event
TarotTetris.events.emit(TarotTetris.EVENTS.GAME_STARTED, {
    playerName: playerNameInput.value.trim() || 'Player',
    score: TarotTetris.score,
    level: TarotTetris.level
});

// Emit the LINES_CLEARED event
TarotTetris.events.emit(TarotTetris.EVENTS.LINES_CLEARED, {
    linesCleared: 4,
    score: 800,
    combo: TarotTetris.combo
});
```

### Unsubscribing from Events

```javascript
// Subscribe to an event and store the unsubscribe function
const unsubscribe = TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, function(data) {
    console.log(`Game over! Score: ${data.score}`);
});

// Later, unsubscribe from the event
unsubscribe();

// Alternative method to unsubscribe
function onGameOver(data) {
    console.log(`Game over! Score: ${data.score}`);
}

TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, onGameOver);

// Later, unsubscribe using the off method
TarotTetris.events.off(TarotTetris.EVENTS.GAME_OVER, onGameOver);
```

## Integration with Other Systems

### Game Core

The Game Core emits events at key points in the game lifecycle:

```javascript
// Game initialization
TarotTetris.events.emit(TarotTetris.EVENTS.GAME_INITIALIZED, {
    score: TarotTetris.score,
    level: TarotTetris.level,
    gold: TarotTetris.gold
});

// Game start
TarotTetris.events.emit(TarotTetris.EVENTS.GAME_STARTED, {
    playerName: playerNameInput.value.trim() || 'Player',
    score: TarotTetris.score,
    level: TarotTetris.level
});

// Game over
TarotTetris.events.emit(TarotTetris.EVENTS.GAME_OVER, {
    playerName: playerName,
    score: TarotTetris.score,
    level: TarotTetris.level,
    gold: TarotTetris.gold
});
```

### Piece System

The Piece System emits events when pieces are spawned, moved, or locked:

```javascript
// Piece spawned
TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_SPAWNED, {
    piece: piece,
    nextQueue: nextQueue
});

// Piece dropped
TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_DROPPED, {
    piece: piece
});
```

### Tarot System

The Tarot System emits events when cards are drawn or played:

```javascript
// Card drawn
TarotTetris.events.emit(TarotTetris.EVENTS.TAROT_CARD_DRAWN, {
    card: card,
    handSize: playerHand.length
});

// Card played
TarotTetris.events.emit(TarotTetris.EVENTS.TAROT_CARD_PLAYED, {
    card: card,
    effect: effect
});
```

## Extending the Event System

### Adding New Event Types

To add a new event type:

```javascript
// Add a new event constant
TarotTetris.EVENTS.CUSTOM_EVENT = 'custom:event';

// Emit the new event
TarotTetris.events.emit(TarotTetris.EVENTS.CUSTOM_EVENT, {
    customData: 'value'
});

// Subscribe to the new event
TarotTetris.events.on(TarotTetris.EVENTS.CUSTOM_EVENT, function(data) {
    console.log('Custom event received:', data.customData);
});
```

### Adding Event Debugging

To add debugging for events:

```javascript
// Create a debug wrapper around the event system
TarotTetris.debugEvents = {
    on: function(eventName, callback) {
        return TarotTetris.events.on(eventName, function(data) {
            console.log(`Event received: ${eventName}`, data);
            callback(data);
        });
    },
    
    emit: function(eventName, data) {
        console.log(`Event emitted: ${eventName}`, data);
        TarotTetris.events.emit(eventName, data);
    },
    
    off: function(eventName, callback) {
        TarotTetris.events.off(eventName, callback);
    }
};
```

### Adding Event History

To track event history for debugging:

```javascript
// Add event history tracking
TarotTetris.eventHistory = [];

// Wrap the emit method to record history
const originalEmit = TarotTetris.events.emit;
TarotTetris.events.emit = function(eventName, data) {
    // Record the event
    TarotTetris.eventHistory.push({
        eventName: eventName,
        data: JSON.parse(JSON.stringify(data || {})),
        timestamp: Date.now()
    });
    
    // Limit history size
    if (TarotTetris.eventHistory.length > 100) {
        TarotTetris.eventHistory.shift();
    }
    
    // Call the original emit method
    originalEmit.call(this, eventName, data);
};

// Add a method to get the event history
TarotTetris.getEventHistory = function() {
    return TarotTetris.eventHistory;
};
```

## Example: Creating a Custom Analytics System

```javascript
// Create an analytics system using the event system
TarotTetris.analytics = {
    init: function() {
        // Subscribe to key events
        TarotTetris.events.on(TarotTetris.EVENTS.GAME_STARTED, this.onGameStarted);
        TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, this.onGameOver);
        TarotTetris.events.on(TarotTetris.EVENTS.LINES_CLEARED, this.onLinesCleared);
        TarotTetris.events.on(TarotTetris.EVENTS.TAROT_CARD_PLAYED, this.onTarotCardPlayed);
        
        console.log('Analytics system initialized');
    },
    
    onGameStarted: function(data) {
        // Track game start
        console.log('Game started:', data.playerName);
        // Send analytics data to server
    },
    
    onGameOver: function(data) {
        // Track game over
        console.log('Game over:', data.playerName, data.score, data.level);
        // Send analytics data to server
    },
    
    onLinesCleared: function(data) {
        // Track lines cleared
        if (data.linesCleared === 4) {
            console.log('Tetris!', data.score);
            // Send analytics data to server
        }
    },
    
    onTarotCardPlayed: function(data) {
        // Track tarot card usage
        console.log('Tarot card played:', data.card);
        // Send analytics data to server
    }
};

// Initialize the analytics system
document.addEventListener('DOMContentLoaded', function() {
    TarotTetris.analytics.init();
});
```
