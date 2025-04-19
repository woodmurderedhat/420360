# Tarot Card System

The Tarot Card System is a unique feature of Tarot Tetromino that adds mystical elements to the classic Tetris gameplay. It manages the tarot deck, card drawing, and the implementation of card effects.

## File: `src/tarot.js`

## Core Responsibilities

- Define the tarot deck and card effects
- Manage the player's hand of tarot cards
- Implement card activation and effect application
- Provide visual feedback for card effects
- Track temporary effect states

## Key Components

### Tarot Deck

The tarot deck consists of cards from the Major Arcana, each with unique effects. The deck is defined in the `tarotEffects` object, which maps card names to their effects and descriptions.

```javascript
var tarotEffects = {
    "The Fool": {
        effect: function() {
            // Effect implementation
        },
        description: "Slows down the game speed for 10 seconds."
    },
    // More cards...
}
```

### Card Effects

Each tarot card has a unique effect that can influence gameplay in various ways:

- Altering game speed
- Modifying the score
- Changing the current piece
- Clearing rows
- Extending coyote time
- Adding special visual effects
- And many more

### Advanced Effects

The system includes several advanced effect functions that can be used by multiple cards:

- `morphEffect()`: Randomly changes the active piece's shape
- `spinEffect()`: Rotates the piece randomly
- `driftEffect()`: Moves the piece randomly
- `fragmentEffect()`: Splits the piece into blocks with jitter
- `phaseEffect()`: Allows the piece to pass through blocks
- `echoEffect()`: Creates a shadow clone that follows the piece
- `timeWarpEffect()`: Randomly changes the fall speed
- `mirrorEffect()`: Flips the board visuals horizontally
- `weightEffect()`: Increases gravity for the current piece
- `teleportEffect()`: Randomly moves the piece to a new column

## Key Functions

### Deck Initialization

```javascript
function initializeTarotDeck()
```

Creates a new tarot deck with all available cards, shuffles it, and prepares it for drawing.

### Drawing Cards

```javascript
function drawTarotCard()
```

Draws a card from the deck and adds it to the player's hand, with a chance based on the player's tarot chance upgrade level.

### Playing Cards

```javascript
function playTarotCard(cardIndex)
```

Activates a card from the player's hand, applying its effect and removing it from the hand.

### Updating UI

```javascript
function updateTarotUI()
```

Updates the visual representation of the player's tarot hand in the UI.

## Key Variables

- `tarotDeck`: Array containing the current deck of tarot cards
- `playerHand`: Array containing the player's current hand of tarot cards
- `previousDropInterval`: Stores the original drop interval for time-based effects
- `previousCoyoteTime`: Stores the original coyote time for time-based effects
- `window.__phaseActive`, `window.__mirrorActive`, etc.: Flags for active effects

## Integration with Other Systems

### Visual Effects

The tarot system integrates with the Visual Effects system to provide feedback when cards are played:

```javascript
if (typeof addTarotVisualEffect === "function") {
    addTarotVisualEffect('neon-glow', 3000, { color: '#ffdd57' });
    addTarotVisualEffect('particle-burst', 3000, { color: '#ffdd57' });
}
```

### Game State

The tarot system interacts with the game state to modify gameplay parameters:

```javascript
TarotTetris.setGameSpeed(TarotTetris.dropInterval / 2);
```

### Board System

Some tarot effects directly modify the board:

```javascript
board.reset();
board.clearRandomRow();
board.moveRowsUp(rowsToMoveUp);
```

## Extending the Tarot System

### Adding New Cards

To add a new tarot card:

1. Add a new entry to the `tarotEffects` object:

```javascript
"New Card Name": {
    effect: function() {
        // Implement the card's effect
        updateGameInfo('New Card effect description');
        
        // Add visual effects if desired
        if (typeof addTarotVisualEffect === "function") {
            addTarotVisualEffect('effect-name', duration, options);
        }
    },
    description: "Description of what the card does."
}
```

2. Ensure the card is included in the deck initialization if it's not meant to be a special unlock.

### Creating Custom Effects

To create a new effect type that can be used by multiple cards:

```javascript
function newCustomEffect(duration = 5000, parameter = defaultValue) {
    // Store original state if needed
    const originalState = someGameState;
    
    // Set up effect
    window.__customEffectActive = true;
    
    // Apply immediate changes
    someGameState = newValue;
    
    // Set up interval for recurring effects if needed
    const effectInterval = setInterval(() => {
        if (!window.__customEffectActive || gameOver) return;
        // Recurring effect logic
    }, intervalTime);
    
    // Set up timeout to end the effect
    setTimeout(() => {
        window.__customEffectActive = false;
        clearInterval(effectInterval);
        someGameState = originalState;
    }, duration);
    
    updateGameInfo('Custom Effect: Description of what is happening!');
}
```

## Example: Adding a New Card with Combined Effects

```javascript
"The Cosmic Joker": {
    effect: function() {
        // Combine multiple effects
        morphEffect(3000, 300); // Fast morphing for 3 seconds
        
        // Add score bonus
        TarotTetris.score += 250;
        updateScore();
        
        // Add custom visual
        if (typeof addTarotVisualEffect === "function") {
            addTarotVisualEffect('rainbow-burst', 3000, { intensity: 2 });
        }
        
        updateGameInfo('The Cosmic Joker brings chaos and rewards!');
    },
    description: "Morphs your piece rapidly and grants 250 bonus points."
}
```
