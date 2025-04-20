# Tree Idler

A browser-based idle resource management game where you embody a tree. Grow your tree by collecting sunlight and water, farmed using leaves and roots.

## How to Run the Game

Due to browser security restrictions, JavaScript modules cannot be loaded directly from the file system using the `file://` protocol. To run the game, you need to use a local development server.

### Option 1: Using the included server script (Recommended)

1. Make sure you have Node.js installed on your computer
2. Double-click the `start-server.bat` file
3. Open your browser and navigate to http://localhost:8080

### Option 2: Using any HTTP server

You can use any HTTP server to serve the files. Some options include:

- Python's built-in HTTP server:
  ```
  python -m http.server 8080
  ```
- VS Code's Live Server extension
- Any other local development server

## Game Instructions

- **Grow your tree** by collecting sunlight and water
- **Add and upgrade leaves** to collect more sunlight
- **Add and upgrade roots** to collect more water
- **Harvest fruits** when they appear (after growth stage 3)
- **Purchase upgrades** to improve your resource collection

## Settings

- **Volume**: Adjust the game volume
- **Graphics Quality**: Choose between high, medium, and low quality graphics
- **Reset Game**: Reset your progress and start over

## Saving

The game automatically saves your progress to your browser's localStorage. You can close the browser and return later to continue where you left off.

## Troubleshooting

If you encounter any issues:

1. Make sure you're running the game through a web server (not directly from the file system)
2. Check your browser console for any error messages
3. Try clearing your browser cache and localStorage if you experience save issues
