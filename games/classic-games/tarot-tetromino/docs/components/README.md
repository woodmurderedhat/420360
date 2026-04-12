# Tarot Tetromino: Component Documentation

This section provides detailed documentation for each major component of the Tarot Tetromino game.

## Component Overview

Tarot Tetromino is built with a modular architecture, with each component responsible for a specific aspect of the game. This separation of concerns makes the codebase easier to understand, maintain, and extend.

## Component List

1. [Game Core](game-core.md) - Main game loop and initialization
2. [Board System](board-system.md) - Game board representation and rendering
3. [Piece System](piece-system.md) - Tetromino shapes and movement
4. [Tarot Card System](tarot-system.md) - Card effects and mechanics
5. [Shop System](shop-system.md) - In-game purchases and upgrades
6. [Sound System](sound-system.md) - Music and sound effects
7. [Event System](event-system.md) - Custom event handling
8. [Visual Effects](visual-effects.md) - Particle and screen effects
9. [Controls](controls.md) - Keyboard and touch input handling
10. [Overlays](overlays.md) - Game screens and UI elements
11. [Objectives](objectives.md) - Challenge system

## Component Interactions

The components interact with each other through:

1. **Direct Function Calls** - Some components expose public methods that can be called by other components
2. **Event System** - Components can emit and listen for events to communicate indirectly
3. **Shared State** - Some global state is shared between components
4. **Namespace** - The `TarotTetris` namespace provides a way to share functionality

## Extending Components

Each component documentation page includes information on how to extend or modify that component. This includes:

- Key functions and their parameters
- Important variables and their purpose
- Extension points for adding new features
- Examples of common modifications
