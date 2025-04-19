# Tarot Tetromino: Gameplay Documentation

## Core Gameplay

Tarot Tetromino combines classic Tetris mechanics with mystical tarot card elements to create a unique gameplay experience.

### Basic Controls

#### Keyboard Controls
- **Left/Right Arrow Keys**: Move piece horizontally
- **Down Arrow**: Soft drop (accelerate descent)
- **Up Arrow**: Rotate piece clockwise
- **Z Key**: Rotate piece counter-clockwise
- **Space Bar**: Hard drop (instantly drop piece)
- **C Key**: Hold piece
- **P Key**: Pause game
- **ESC Key**: Open menu

#### Mobile Controls
- **Swipe Left/Right**: Move piece horizontally
- **Swipe Down**: Soft drop
- **Tap Rotate Button**: Rotate piece
- **Tap Drop Button**: Hard drop
- **Tap Hold Button**: Hold piece
- **Tap Pause Button**: Pause game

### Game Flow

1. **Start Game**: Player enters name and starts the game
2. **Piece Movement**: Control falling tetrominoes to create complete lines
3. **Line Clearing**: Complete horizontal lines to clear them and score points
4. **Tarot Cards**: Collect tarot cards by clearing lines
5. **Card Activation**: Play tarot cards to trigger special effects
6. **Level Progression**: Clear lines to increase level and game speed
7. **Game Over**: Occurs when pieces stack to the top of the board

## Scoring System

### Basic Scoring
- **Single Line**: 100 points × current level
- **Double Line**: 300 points × current level
- **Triple Line**: 500 points × current level
- **Tetris (4 Lines)**: 800 points × current level

### Advanced Scoring
- **T-Spin Single**: 400 points × current level
- **T-Spin Double**: 1000 points × current level
- **T-Spin Triple**: 1600 points × current level
- **Mini T-Spin**: 100 points × current level
- **Mini T-Spin Single**: 200 points × current level

### Combo System
- **Combo Multiplier**: Increases with consecutive line clears
- **Combo Bonus**: (Combo Count × 50) × current level
- **Combo Upgrade**: Can be enhanced through the shop

## Leveling System

- **Level Progression**: Level increases after clearing a certain number of lines
- **Lines Required**: 10 lines per level (adjustable)
- **Speed Increase**: Game speed increases with each level
- **Scoring Impact**: Higher levels provide higher score multipliers

## Tarot Card System

### Card Collection
- **Card Drop Rate**: Chance to receive a card after clearing lines
- **Drop Rate Upgrade**: Can be enhanced through the shop
- **Hand Size**: Limited to 3 cards at a time

### Card Types
- **Major Arcana**: 22 cards with significant effects
- **Reversed Cards**: Alternative versions with different effects

### Notable Card Effects
- **The Fool**: Slows game speed for 10 seconds
- **The Magician**: Doubles current score
- **The Hierophant**: Clears the entire board
- **Death**: Clears a random row but reduces score
- **The Tower**: Clears the top two rows
- **The World**: Spawns a new piece immediately

### Advanced Card Effects
- **Morphing**: Changes piece shape randomly
- **Spinning**: Rotates piece randomly
- **Phasing**: Allows piece to pass through blocks
- **Time Warp**: Randomly changes fall speed
- **Teleportation**: Moves piece to random columns

## Special Mechanics

### T-Spin Detection
- **T-Spin**: Detected when a T piece is rotated into a tight spot
- **Mini T-Spin**: A less complex T-spin maneuver
- **T-Spin Bonus**: Additional points awarded for T-spin line clears

### Hold System
- **Hold Queue**: Store up to 3 pieces for later use
- **Hold Limitation**: Can only hold once per piece
- **Strategic Use**: Save valuable pieces for optimal placement

### Ghost Piece
- **Functionality**: Shows where the current piece will land
- **Upgrades**: Can be enhanced through the shop for better visibility
- **Tactical Use**: Helps with precise placements

### Coyote Time
- **Functionality**: Brief window after landing where piece can still be moved
- **Duration**: Base time is 300ms, can be upgraded
- **Strategic Use**: Allows for last-moment adjustments

## Shop System

### Currency
- **Gold**: Earned through gameplay and clearing lines
- **Persistence**: Gold is saved between game sessions

### Upgrades
- **Combo Multiplier**: Increases combo bonus points
- **Tarot Chance**: Increases chance of drawing tarot cards
- **Ghost Piece**: Enhances ghost piece visibility
- **Coyote Time**: Extends the window for moving landed pieces

### Special Unlocks
- **Special Tetriminoes**: Unlock unique piece shapes
- **Cosmetic Items**: Visual enhancements for the game

## Objectives System

- **Daily Objectives**: Special challenges that reset daily
- **Achievement Objectives**: Permanent challenges to complete
- **Rewards**: Gold and special items for completing objectives

## Leaderboard

- **High Scores**: Tracks the highest scores achieved
- **Persistence**: Scores are saved to localStorage
- **Display**: Shows player name and score

## Game Modes

- **Standard Mode**: Classic gameplay with tarot elements
- **Future Potential**: Time Attack, Puzzle Mode, etc.

## Tips and Strategies

1. **Plan Ahead**: Use the next queue to plan your moves
2. **Use Hold Strategically**: Hold pieces for optimal situations
3. **Learn T-Spins**: Master T-spin techniques for bonus points
4. **Save Powerful Cards**: Keep game-changing tarot cards for critical moments
5. **Invest in Upgrades**: Prioritize shop upgrades that match your playstyle
6. **Clear Multiple Lines**: Aim for Tetris clears (4 lines) when possible
7. **Build Combos**: Try to clear lines consecutively for combo bonuses
