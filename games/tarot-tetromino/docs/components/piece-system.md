# Piece System

The Piece System manages the tetromino pieces in Tarot Tetromino, including their shapes, colors, movement, and rotation.

## File: `src/piece.js`

## Core Responsibilities

- Define tetromino shapes and colors
- Handle piece movement (left, right, down)
- Manage piece rotation and wall kicks
- Generate random pieces
- Render pieces on the canvas

## Piece Class

The `TarotTetris.Piece` class encapsulates the piece functionality:

```javascript
TarotTetris.Piece = function(type) {
    this.type = type || TarotTetris.Piece.getRandomType();
    this.typeIndex = TarotTetris.Piece.TYPES.indexOf(this.type);
    this.shape = this.getShape();
    this.position = { x: 3, y: 0 };
    this.rotation = 0;
};
```

## Tetromino Definitions

### Shapes

```javascript
TarotTetris.Piece.SHAPES = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
};
```

### Colors

```javascript
TarotTetris.Piece.COLORS = {
    'I': '#00FFFF', // Cyan
    'O': '#FFFF00', // Yellow
    'T': '#800080', // Purple
    'S': '#00FF00', // Green
    'Z': '#FF0000', // Red
    'J': '#0000FF', // Blue
    'L': '#FF7F00'  // Orange
};
```

### Types

```javascript
TarotTetris.Piece.TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
```

## Key Methods

### Shape Generation

```javascript
TarotTetris.Piece.prototype.getShape = function() {
    return TarotTetris.Piece.SHAPES[this.type].map(row => row.slice());
};
```

### Random Piece Generation

```javascript
TarotTetris.Piece.getRandomType = function() {
    // Use unlocked tetrominoes if available
    const types = window.unlockedTetrominoes || TarotTetris.Piece.TYPES;
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
};
```

### Movement Methods

```javascript
TarotTetris.Piece.prototype.moveLeft = function() {
    this.position.x--;
};

TarotTetris.Piece.prototype.moveRight = function() {
    this.position.x++;
};

TarotTetris.Piece.prototype.moveDown = function() {
    this.position.y++;
};
```

### Collision Detection

```javascript
TarotTetris.Piece.prototype.canMoveLeft = function(board) {
    // Create a test piece
    const testPiece = new TarotTetris.Piece(this.type);
    testPiece.shape = this.shape.map(row => row.slice());
    testPiece.position = { x: this.position.x - 1, y: this.position.y };
    
    // Check if the test piece collides with the board
    return !board.collides(testPiece);
};

TarotTetris.Piece.prototype.canMoveRight = function(board) {
    // Create a test piece
    const testPiece = new TarotTetris.Piece(this.type);
    testPiece.shape = this.shape.map(row => row.slice());
    testPiece.position = { x: this.position.x + 1, y: this.position.y };
    
    // Check if the test piece collides with the board
    return !board.collides(testPiece);
};

TarotTetris.Piece.prototype.canMoveDown = function(board) {
    // Create a test piece
    const testPiece = new TarotTetris.Piece(this.type);
    testPiece.shape = this.shape.map(row => row.slice());
    testPiece.position = { x: this.position.x, y: this.position.y + 1 };
    
    // Check if the test piece collides with the board
    return !board.collides(testPiece);
};
```

### Rotation

```javascript
TarotTetris.Piece.prototype.rotate = function(board) {
    // Skip rotation for O piece
    if (this.type === 'O') return;
    
    // Store the original shape and rotation
    const originalShape = this.shape.map(row => row.slice());
    const originalRotation = this.rotation;
    
    // Rotate the shape
    this.rotateShape();
    
    // Try wall kicks if the rotation causes a collision
    if (board.collides(this)) {
        // Try wall kicks
        if (!this.tryWallKicks(board)) {
            // If wall kicks fail, revert to the original shape
            this.shape = originalShape;
            this.rotation = originalRotation;
        } else {
            // Wall kick succeeded
            if (this.type === 'T') {
                // Check for T-spin
                this.checkTSpin(board);
            }
        }
    } else {
        // Rotation succeeded without wall kicks
        if (this.type === 'T') {
            // Check for T-spin
            this.checkTSpin(board);
        }
    }
};

TarotTetris.Piece.prototype.rotateShape = function() {
    // Get the dimensions of the shape
    const rows = this.shape.length;
    const cols = this.shape[0].length;
    
    // Create a new rotated shape
    const newShape = [];
    for (let i = 0; i < cols; i++) {
        newShape[i] = [];
        for (let j = 0; j < rows; j++) {
            newShape[i][j] = this.shape[rows - 1 - j][i];
        }
    }
    
    // Update the shape and rotation
    this.shape = newShape;
    this.rotation = (this.rotation + 1) % 4;
};
```

### Wall Kicks

```javascript
TarotTetris.Piece.prototype.tryWallKicks = function(board) {
    // Get wall kick data based on piece type and rotation
    const wallKickData = this.getWallKickData();
    
    // Try each wall kick offset
    for (const offset of wallKickData) {
        // Apply the offset
        this.position.x += offset[0];
        this.position.y += offset[1];
        
        // Check if the offset resolves the collision
        if (!board.collides(this)) {
            return true;
        }
        
        // Revert the offset
        this.position.x -= offset[0];
        this.position.y -= offset[1];
    }
    
    return false;
};

TarotTetris.Piece.prototype.getWallKickData = function() {
    // Return wall kick data based on piece type and rotation
    if (this.type === 'I') {
        return TarotTetris.wallKick.I_WALL_KICKS[this.rotation];
    } else {
        return TarotTetris.wallKick.JLSTZ_WALL_KICKS[this.rotation];
    }
};
```

### Rendering

```javascript
TarotTetris.Piece.prototype.render = function(context, blockSize) {
    const color = TarotTetris.Piece.COLORS[this.type];
    
    context.fillStyle = color;
    
    for (let row = 0; row < this.shape.length; row++) {
        for (let col = 0; col < this.shape[row].length; col++) {
            if (this.shape[row][col]) {
                const x = (this.position.x + col) * blockSize;
                const y = (this.position.y + row) * blockSize;
                
                context.fillRect(x, y, blockSize, blockSize);
                
                // Draw block border
                context.strokeStyle = '#000';
                context.strokeRect(x, y, blockSize, blockSize);
            }
        }
    }
};
```

## T-Spin Detection

```javascript
TarotTetris.Piece.prototype.checkTSpin = function(board) {
    // Only check for T-spins with T pieces after rotation
    if (this.type !== 'T' || !lastMoveWasRotation) return;
    
    // Get the corners around the T piece
    const corners = this.getTCorners(board);
    
    // Count filled corners
    const filledCorners = corners.filter(corner => corner).length;
    
    // Check for T-spin or mini T-spin
    if (filledCorners >= 3) {
        tSpinDetected = {
            isTSpin: true,
            isMini: this.isMiniTSpin(corners),
            corners: corners
        };
    } else {
        tSpinDetected = null;
    }
};

TarotTetris.Piece.prototype.getTCorners = function(board) {
    // Get the four corners around the T piece
    const corners = [];
    
    // Top-left corner
    corners.push(this.isCornerFilled(board, -1, -1));
    
    // Top-right corner
    corners.push(this.isCornerFilled(board, 1, -1));
    
    // Bottom-left corner
    corners.push(this.isCornerFilled(board, -1, 1));
    
    // Bottom-right corner
    corners.push(this.isCornerFilled(board, 1, 1));
    
    return corners;
};

TarotTetris.Piece.prototype.isCornerFilled = function(board, dx, dy) {
    // Check if a corner is filled (either by a block or out of bounds)
    const x = this.position.x + dx;
    const y = this.position.y + dy;
    
    // Out of bounds is considered filled
    if (x < 0 || x >= board.columns || y < 0 || y >= board.rows) {
        return true;
    }
    
    // Check if the cell is filled
    return board.grid[y][x] !== 0;
};

TarotTetris.Piece.prototype.isMiniTSpin = function(corners) {
    // Determine if this is a mini T-spin based on the corners
    // Mini T-spins have only 3 corners filled, with both corners on the front side filled
    
    // Get the front corners based on rotation
    let frontCorners;
    switch (this.rotation) {
        case 0: // T pointing up
            frontCorners = [corners[2], corners[3]]; // Bottom corners
            break;
        case 1: // T pointing right
            frontCorners = [corners[0], corners[2]]; // Left corners
            break;
        case 2: // T pointing down
            frontCorners = [corners[0], corners[1]]; // Top corners
            break;
        case 3: // T pointing left
            frontCorners = [corners[1], corners[3]]; // Right corners
            break;
    }
    
    // It's a mini T-spin if both front corners are filled
    return frontCorners[0] && frontCorners[1];
};
```

## Integration with Other Systems

### Board System

The Piece System interacts closely with the Board System:
- Collision detection between pieces and the board
- Wall kicks during rotation
- T-spin detection

### Ghost Piece

The Piece System is used by the Ghost Piece system to create a preview of where the piece will land:

```javascript
function updateGhostPiece() {
    if (!piece) return;
    
    // Create a copy of the current piece
    ghostPiece = new TarotTetris.Piece(piece.type);
    ghostPiece.shape = piece.shape.map(row => row.slice());
    ghostPiece.position = { x: piece.position.x, y: piece.position.y };
    
    // Drop the ghost piece to the bottom
    while (ghostPiece.canMoveDown(board)) {
        ghostPiece.moveDown();
    }
}
```

### Hold System

The Piece System is used by the Hold System to store and swap pieces:

```javascript
TarotTetris.holdPiece = function(state) {
    if (!state.canHold) return;
    
    // Get the current piece
    const currentPiece = state.piece;
    
    // Add the current piece to the hold queue
    state.heldPieces.push(currentPiece);
    
    // Limit the hold queue size
    if (state.heldPieces.length > 3) {
        state.heldPieces.shift();
    }
    
    // Spawn a new piece
    state.spawnPiece();
    
    // Prevent holding again until the next piece
    state.canHold = false;
    
    // Update the hold UI
    state.updateHoldUI();
};
```

## Extending the Piece System

### Adding New Piece Types

To add a new piece type:

```javascript
// Add a new shape definition
TarotTetris.Piece.SHAPES['P'] = [
    [1, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
];

// Add a color for the new shape
TarotTetris.Piece.COLORS['P'] = '#FF00FF'; // Magenta

// Add to the list of available types
TarotTetris.Piece.TYPES.push('P');
```

### Adding Special Piece Effects

To add special effects to certain piece types:

```javascript
TarotTetris.Piece.prototype.applySpecialEffect = function() {
    switch (this.type) {
        case 'I':
            // Special effect for I piece
            this.applyIEffect();
            break;
        case 'T':
            // Special effect for T piece
            this.applyTEffect();
            break;
        // Add more cases for other piece types
    }
};

TarotTetris.Piece.prototype.applyIEffect = function() {
    // Implement special effect for I piece
    // For example, clear the row when the piece lands
    console.log('I piece special effect activated');
};

TarotTetris.Piece.prototype.applyTEffect = function() {
    // Implement special effect for T piece
    // For example, increase score multiplier for T-spins
    console.log('T piece special effect activated');
};
```

## Example: Adding a Piece Trail Effect

```javascript
// Add a property to track previous positions
TarotTetris.Piece.prototype.previousPositions = [];

// Modify the moveDown method to track positions
const originalMoveDown = TarotTetris.Piece.prototype.moveDown;
TarotTetris.Piece.prototype.moveDown = function() {
    // Store the current position
    this.previousPositions.push({
        x: this.position.x,
        y: this.position.y,
        shape: this.shape.map(row => row.slice())
    });
    
    // Limit the trail length
    if (this.previousPositions.length > 5) {
        this.previousPositions.shift();
    }
    
    // Call the original method
    originalMoveDown.call(this);
};

// Add a method to render the trail
TarotTetris.Piece.prototype.renderTrail = function(context, blockSize) {
    const color = TarotTetris.Piece.COLORS[this.type];
    
    // Render each previous position with decreasing opacity
    this.previousPositions.forEach((pos, index) => {
        const opacity = 0.1 + (index * 0.1); // 0.1 to 0.5
        
        context.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        
        for (let row = 0; row < pos.shape.length; row++) {
            for (let col = 0; col < pos.shape[row].length; col++) {
                if (pos.shape[row][col]) {
                    const x = (pos.x + col) * blockSize;
                    const y = (pos.y + row) * blockSize;
                    
                    context.fillRect(x, y, blockSize, blockSize);
                }
            }
        }
    });
};
```
