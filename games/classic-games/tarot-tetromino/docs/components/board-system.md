# Board System

The Board System is responsible for managing the game board, including the grid of cells, piece collision detection, and line clearing.

## File: `src/board.js`

## Core Responsibilities

- Maintain the state of the game board grid
- Handle collision detection between pieces and the board
- Process line clearing and scoring
- Render the board and pieces to the canvas
- Manage special board effects (clearing rows, adding garbage, etc.)

## Board Class

The `TarotTetris.Board` class encapsulates the board functionality:

```javascript
TarotTetris.Board = function() {
    this.rows = 20;
    this.columns = 10;
    this.grid = [];
    this.reset();
};
```

## Key Methods

### Board Initialization

```javascript
TarotTetris.Board.prototype.reset = function() {
    // Initialize an empty grid
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
        this.grid[row] = [];
        for (let col = 0; col < this.columns; col++) {
            this.grid[row][col] = 0;
        }
    }
};
```

### Collision Detection

```javascript
TarotTetris.Board.prototype.collides = function(piece) {
    // Check if a piece collides with the board or boundaries
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const boardRow = piece.position.y + row;
                const boardCol = piece.position.x + col;
                
                // Check boundaries
                if (boardRow < 0 || boardRow >= this.rows || 
                    boardCol < 0 || boardCol >= this.columns) {
                    return true;
                }
                
                // Check collision with existing blocks
                if (this.grid[boardRow][boardCol]) {
                    return true;
                }
            }
        }
    }
    return false;
};
```

### Merging Pieces

```javascript
TarotTetris.Board.prototype.mergePiece = function(piece) {
    // Merge a piece into the board grid
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const boardRow = piece.position.y + row;
                const boardCol = piece.position.x + col;
                
                if (boardRow >= 0 && boardRow < this.rows && 
                    boardCol >= 0 && boardCol < this.columns) {
                    this.grid[boardRow][boardCol] = piece.typeIndex + 1;
                }
            }
        }
    }
};
```

### Line Clearing

```javascript
TarotTetris.Board.prototype.clearLines = function() {
    let linesCleared = 0;
    
    // Check each row for completeness
    for (let row = this.rows - 1; row >= 0; row--) {
        let rowFull = true;
        
        for (let col = 0; col < this.columns; col++) {
            if (!this.grid[row][col]) {
                rowFull = false;
                break;
            }
        }
        
        if (rowFull) {
            // Clear the row and move rows down
            for (let r = row; r > 0; r--) {
                for (let c = 0; c < this.columns; c++) {
                    this.grid[r][c] = this.grid[r-1][c];
                }
            }
            
            // Clear the top row
            for (let c = 0; c < this.columns; c++) {
                this.grid[0][c] = 0;
            }
            
            // Increment lines cleared and check the same row again
            linesCleared++;
            row++;
        }
    }
    
    return linesCleared;
};
```

### Board Rendering

```javascript
TarotTetris.Board.prototype.render = function(context, blockSize) {
    // Render the board grid
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
            if (this.grid[row][col]) {
                const typeIndex = this.grid[row][col] - 1;
                const color = TarotTetris.Piece.COLORS[TarotTetris.Piece.TYPES[typeIndex]];
                
                context.fillStyle = color;
                context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                
                // Draw block border
                context.strokeStyle = '#000';
                context.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
        }
    }
};
```

## Special Board Methods

### Adding Garbage Rows

```javascript
TarotTetris.Board.prototype.addRandomGarbageRow = function() {
    // Move all rows up
    for (let row = 0; row < this.rows - 1; row++) {
        for (let col = 0; col < this.columns; col++) {
            this.grid[row][col] = this.grid[row + 1][col];
        }
    }
    
    // Add a random garbage row at the bottom
    const gapPosition = Math.floor(Math.random() * this.columns);
    for (let col = 0; col < this.columns; col++) {
        this.grid[this.rows - 1][col] = col === gapPosition ? 0 : 1;
    }
};
```

### Clearing Random Row

```javascript
TarotTetris.Board.prototype.clearRandomRow = function() {
    // Find rows that have at least one block
    const nonEmptyRows = [];
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
            if (this.grid[row][col]) {
                nonEmptyRows.push(row);
                break;
            }
        }
    }
    
    if (nonEmptyRows.length > 0) {
        // Select a random non-empty row
        const randomIndex = Math.floor(Math.random() * nonEmptyRows.length);
        const rowToClear = nonEmptyRows[randomIndex];
        
        // Clear the row
        for (let col = 0; col < this.columns; col++) {
            this.grid[rowToClear][col] = 0;
        }
        
        return rowToClear;
    }
    
    return -1;
};
```

### Moving Rows Up

```javascript
TarotTetris.Board.prototype.moveRowsUp = function(rowsToMove) {
    // Move rows up by the specified amount
    for (let row = 0; row < this.rows - rowsToMove; row++) {
        for (let col = 0; col < this.columns; col++) {
            this.grid[row][col] = this.grid[row + rowsToMove][col];
        }
    }
    
    // Clear the bottom rows
    for (let row = this.rows - rowsToMove; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
            this.grid[row][col] = 0;
        }
    }
};
```

## Board State Checks

```javascript
TarotTetris.Board.prototype.isBoardFull = function() {
    // Check if any blocks exist in the top row
    for (let col = 0; col < this.columns; col++) {
        if (this.grid[0][col]) {
            return true;
        }
    }
    return false;
};
```

## Integration with Other Systems

### Piece System

The Board System interacts closely with the Piece System:
- Collision detection between pieces and the board
- Merging pieces into the board when they land
- Rendering pieces on the board

### Game Core

The Game Core uses the Board System to:
- Initialize and reset the board
- Check for collisions during piece movement
- Process line clearing and scoring
- Check for game over conditions

### Tarot Card System

Some tarot card effects directly modify the board:
- Clearing the entire board
- Adding garbage rows
- Clearing random rows
- Moving rows up or down

## Extending the Board System

### Adding New Board Effects

To add a new board effect:

```javascript
TarotTetris.Board.prototype.newBoardEffect = function(parameters) {
    // Implement the new effect
    // For example, a checkerboard clearing pattern:
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
            if ((row + col) % 2 === 0) {
                this.grid[row][col] = 0;
            }
        }
    }
};
```

### Modifying Board Rendering

To add special rendering effects:

```javascript
TarotTetris.Board.prototype.renderWithEffect = function(context, blockSize, effect) {
    // Standard rendering
    this.render(context, blockSize);
    
    // Add special effect overlay
    context.save();
    
    if (effect === 'glow') {
        context.globalAlpha = 0.5;
        context.fillStyle = '#00ffff';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.grid[row][col]) {
                    context.beginPath();
                    context.arc(
                        col * blockSize + blockSize/2,
                        row * blockSize + blockSize/2,
                        blockSize * 0.7,
                        0, Math.PI * 2
                    );
                    context.fill();
                }
            }
        }
    }
    
    context.restore();
};
```

## Example: Adding a Board Shake Effect

```javascript
// Add a method to the Board class
TarotTetris.Board.prototype.shake = function(intensity = 5, duration = 500) {
    const canvas = document.getElementById('tetris');
    const wrapper = document.getElementById('canvas-wrapper');
    
    if (!canvas || !wrapper) return;
    
    let startTime = performance.now();
    let shaking = true;
    
    function updateShake() {
        if (!shaking) return;
        
        const elapsed = performance.now() - startTime;
        if (elapsed >= duration) {
            wrapper.style.transform = 'translate(0px, 0px)';
            shaking = false;
            return;
        }
        
        const progress = elapsed / duration;
        const decay = 1 - progress;
        const currentIntensity = intensity * decay;
        
        const dx = (Math.random() * 2 - 1) * currentIntensity;
        const dy = (Math.random() * 2 - 1) * currentIntensity;
        
        wrapper.style.transform = `translate(${dx}px, ${dy}px)`;
        
        requestAnimationFrame(updateShake);
    }
    
    requestAnimationFrame(updateShake);
};
```
