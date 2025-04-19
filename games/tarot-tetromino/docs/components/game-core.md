# Game Core Component

The Game Core component is the central controller for Tarot Tetromino. It manages the main game loop, initializes other components, and coordinates the overall game flow.

## File: `src/game.js`

## Core Responsibilities

- Initialize the game and all its components
- Manage the main game loop
- Handle piece spawning and movement
- Process collisions and line clearing
- Track scoring and level progression
- Manage game state (playing, paused, game over)

## Key Functions

### Game Initialization

```javascript
function initializeGame()
```

Initializes the game by:
- Resetting the game board
- Setting up the initial game state (score, level, etc.)
- Initializing the tarot deck
- Loading saved upgrades from localStorage
- Resetting the hold pieces
- Initializing the preview queue
- Spawning the first piece

### Game Loop

```javascript
function update(time = 0)
```

The main game loop that:
- Checks if the game is over or paused
- Calculates the time delta since the last update
- Moves the current piece down if enough time has passed
- Handles piece locking and spawning when a piece lands
- Checks for line clears and T-spins
- Updates the score and level
- Requests the next animation frame

### Piece Spawning

```javascript
function spawnPiece()
```

Spawns a new piece by:
- Taking the next piece from the preview queue
- Adding a new random piece to the queue
- Checking for game over conditions
- Resetting the hold ability
- Emitting a piece spawned event

### Hard Drop

```javascript
function hardDropPiece()
```

Drops the current piece to the bottom of the board:
- Moves the piece down until it collides
- Locks the piece in place
- Checks for T-spins and line clears
- Updates the score and level
- Spawns a new piece

### Game Over Handling

```javascript
function handleGameOver()
```

Handles the game over state:
- Sets the game over flag
- Updates the game info display
- Records the score to the leaderboard
- Shows the game over overlay
- Emits a game over event

## Key Variables

- `board`: The game board instance
- `piece`: The current active piece
- `nextQueue`: Queue of upcoming pieces
- `heldPieces`: Array of held pieces
- `TarotTetris.score`: Current game score
- `TarotTetris.level`: Current game level
- `TarotTetris.dropInterval`: Time between automatic piece drops
- `gameOver`: Flag indicating if the game is over
- `gamePaused`: Flag indicating if the game is paused

## Events

The Game Core component emits several events through the Event System:

- `GAME_INITIALIZED`: When the game is first initialized
- `GAME_STARTED`: When the game starts after the intro
- `PIECE_SPAWNED`: When a new piece is spawned
- `PIECE_DROPPED`: When a piece is hard dropped
- `GAME_OVER`: When the game ends

## Integration Points

### Adding New Game Mechanics

To add new game mechanics, you can:

1. Add new variables to track the state of your mechanic
2. Modify the `update` function to include your mechanic's logic
3. Add new event emissions for important state changes
4. Extend the initialization function to set up your mechanic

### Modifying Game Rules

To modify existing game rules:

1. Adjust the relevant variables (e.g., `TarotTetris.dropInterval` for speed)
2. Modify the scoring calculations in the line clearing logic
3. Change the level progression in the `increaseLevel` function

## Example: Adding a New Game Mode

To add a new game mode:

```javascript
// Add a game mode flag
let timeAttackMode = false;

// Modify initialization to support the new mode
function initializeGame(mode = 'standard') {
    // Existing initialization code...
    
    if (mode === 'timeAttack') {
        timeAttackMode = true;
        // Set up time attack specific variables
        gameTimeLimit = 180000; // 3 minutes
        gameStartTime = performance.now();
    }
    
    // Continue with normal initialization...
}

// Modify the update loop to handle the new mode
function update(time = 0) {
    // Existing update code...
    
    if (timeAttackMode) {
        const elapsedTime = time - gameStartTime;
        if (elapsedTime >= gameTimeLimit) {
            handleGameOver();
            return;
        }
        
        // Update time display
        updateTimeDisplay(gameTimeLimit - elapsedTime);
    }
    
    // Continue with normal update...
}
```
