# Tetris Game

This is a classic Tetris game implemented using HTML5 and JavaScript. The game follows the traditional Tetris rules and includes a leaderboard to track high scores.

## Project Structure

- `index.html`: The main HTML document that sets up the structure of the Tetris game. It includes references to the CSS and JavaScript files and contains the canvas element for rendering the game.
  
- `src/tetris.js`: The entry point for the Tetris game logic. It initializes the game, sets up the game loop, and handles user input for controlling the pieces.
  
- `src/board.js`: Defines the Board class, which manages the game grid. It includes methods for drawing the board, checking for filled lines, and clearing completed lines.
  
- `src/piece.js`: Defines the Piece class, which represents the Tetris pieces. It includes properties for the shape and position of the piece, as well as methods for rotating and moving the piece.
  
- `src/game.js`: Manages the overall game state. It handles the spawning of new pieces, collision detection, and scoring. It also manages the game over state and restarts the game.
  
- `src/leaderboard.js`: Manages the leaderboard functionality. It includes methods for saving and retrieving scores, as well as displaying the leaderboard on the screen.
  
- `style.css`: Contains the styles for the game, including layout, colors, and animations for the Tetris pieces and the game board.

## How to Play

1. Open `index.html` in a web browser.
2. Use the arrow keys to move and rotate the Tetris pieces.
3. The goal is to fill horizontal lines with pieces to clear them and score points.
4. The game ends when the pieces stack up to the top of the board.

## Leaderboard

Scores are saved locally, and you can view the leaderboard to see the top scores achieved in the game.

Enjoy playing Tetris!