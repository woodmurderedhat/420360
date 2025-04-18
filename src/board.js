(function(exports) {
class Board {
    /**
     * Constructs a new Board instance.
     * Initializes the board with a grid of rows and columns.
     */
    constructor() {
        this.rows = 20;
        this.columns = 10;
        this.grid = this.createGrid();
        // Track tetromino types in each cell for score calculation
        this.pieceTypes = this.createPieceTypeGrid();
    }

    /**
     * Creates the grid for the Tetris board.
     * @returns {Array<Array<number>>} A 2D array representing the Tetris grid, filled with 0s.
     */
    createGrid() {
        try {
            return Array.from({ length: this.rows }, () => Array(this.columns).fill(0));
        } catch (error) {
            console.error("Error creating grid:", error);
            return []; // Return an empty grid as a fallback
        }
    }

    /**
     * Creates a grid to track tetromino types for score calculation.
     * @returns {Array<Array<string|null>>} A 2D array tracking tetromino types, filled with null.
     */
    createPieceTypeGrid() {
        try {
            return Array.from({ length: this.rows }, () => Array(this.columns).fill(null));
        } catch (error) {
            console.error("Error creating piece type grid:", error);
            return []; // Return an empty grid as a fallback
        }
    }

    /**
     * Moves all rows up by a given count, removing from the top and adding empty rows at the bottom.
     * @param {number} count - Number of rows to move up.
     */
    moveRowsUp(count) {
        if (!this.grid) {
            console.warn("Grid is undefined in moveRowsUp.");
            return;
        }
        for (let i = 0; i < count; i++) {
            this.grid.shift(); // Remove the top row
            this.grid.push(Array(this.columns).fill(0)); // Add empty row at the bottom
        }
    }

    /**
     * Adds a random garbage row at the bottom with a single random hole, shifting the board up.
     */
    addRandomGarbageRow() {
        if (!this.grid) {
            console.warn("Grid is undefined in addRandomGarbageRow.");
            return;
        }
        const hole = Math.floor(Math.random() * this.columns);
        const garbageRow = Array.from({ length: this.columns }, (_, i) => (i === hole ? 0 : 8)); // 8 = garbage color
        this.grid.shift(); // Remove the top row
        this.grid.push(garbageRow); // Add garbage row at the bottom
    }

    /**
     * Resets the board by creating a new empty grid.
     */
    reset() {
        this.grid = this.createGrid();
        this.pieceTypes = this.createPieceTypeGrid();
    }

    /**
     * Checks if a given piece collides with the board or other pieces.
     * @param {Piece} piece - The piece to check for collisions.
     * @returns {boolean} True if the piece collides, false otherwise.
     */
    collides(piece) {
        if (!piece || !piece.getCoordinates) {
            console.error("Invalid piece object in collides:", piece);
            return true; // Treat as collision to prevent further errors
        }

        // If phase effect is active, pieces can pass through blocks (but not boundaries)
        const phaseActive = window.__phaseActive === true;

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            // Always check boundaries, even with phase effect
            if (coord.x < 0 || coord.x >= this.columns || coord.y >= this.rows || coord.y < 0) {
                return true;
            }
            if (!this.grid[coord.y]) {
                console.warn(`Row ${coord.y} is undefined.`);
                return true;
            }
            if (this.grid[coord.y][coord.x] === undefined) {
                console.warn(`Potential out-of-bounds access at y: ${coord.y}, x: ${coord.x}`);
                return true; // Treat as collision to prevent errors
            }
            // Skip block collision check if phase effect is active
            if (!phaseActive && this.grid[coord.y][coord.x] !== 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Draws the Tetris board on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     */
    draw(ctx) {
        if (!ctx) {
            console.error("Invalid canvas context in draw:", ctx);
            return;
        }
        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63']; // Color palette

        // Check if mirror effect is active
        const mirrorActive = window.__mirrorActive === true;

        // If mirror effect is active, save the canvas state and apply a horizontal flip
        if (mirrorActive) {
            ctx.save();
            ctx.translate(this.columns * 30, 0);
            ctx.scale(-1, 1);
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const cellValue = this.grid[row][col];
                ctx.fillStyle = cellValue === 0 ? 'rgba(255, 255, 255, 0.1)' : colors[cellValue % colors.length];
                ctx.fillRect(col * 30, row * 30, 30, 30);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.strokeRect(col * 30, row * 30, 30, 30);
            }
        }

        // Restore the canvas state if mirror effect was applied
        if (mirrorActive) {
            ctx.restore();
        }
    }

    /**
     * Checks for full lines in the grid.
     * @returns {Array<number>} An array of row indices that are full.
     */
    checkFullLines() {
        let linesToClear = [];
        for (let row = 0; row < this.rows; row++) {
            if (!this.grid[row]) {
                console.warn(`Row ${row} is undefined.`);
                continue;
            }
            if (this.grid[row].every(cell => cell !== 0)) {
                linesToClear.push(row);
            }
        }
        return linesToClear;
    }

    /**
     * Merges a piece into the board.
     * @param {Piece} piece - The piece to merge into the board.
     */
    mergePiece(piece) {
        if (!piece || !piece.getCoordinates) {
            console.error("Invalid piece object in mergePiece:", piece);
            return;
        }

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            if (coord.y >= 0 && coord.y < this.rows && coord.x >= 0 && coord.x < this.columns) {
                if (!this.grid[coord.y]) {
                    console.warn(`Row ${coord.y} is undefined in mergePiece.`);
                    continue;
                }
                this.grid[coord.y][coord.x] = piece.typeIndex + 1; // Use piece's color index

                // Store the piece type for score calculation
                if (this.pieceTypes && this.pieceTypes[coord.y]) {
                    this.pieceTypes[coord.y][coord.x] = piece.type;
                }
            } else {
                console.warn(`Out-of-bounds coordinate: x=${coord.x}, y=${coord.y}`);
            }
        }
    }

    /**
     * Clears full lines from the board.
     * @returns {Object} Object containing the number of lines cleared and the score for each line.
     */
    clearLines() {
        const linesToClear = this.checkFullLines();
        if (!Array.isArray(linesToClear)) {
            console.error("checkFullLines did not return an array:", linesToClear);
            return { count: 0, lineScores: [] };
        }

        // Calculate score for each line before clearing
        const lineScores = [];
        for (let line of linesToClear) {
            if (line >= 0 && line < this.grid.length) {
                // Calculate score for this line based on tetromino pieces
                const lineScore = this.calculateLineScore(line);
                lineScores.push(lineScore);

                // Clear the line
                this.grid.splice(line, 1);
                this.grid.unshift(Array(this.columns).fill(0));

                // Also clear the piece types for this line
                if (this.pieceTypes) {
                    this.pieceTypes.splice(line, 1);
                    this.pieceTypes.unshift(Array(this.columns).fill(null));
                }
            } else {
                console.warn(`Line index out of bounds: ${line}`);
            }
        }

        return {
            count: linesToClear.length,
            lineScores: lineScores
        };
    }

    /**
     * Calculates the score for a single line based on the tetromino pieces in it from left to right.
     * @param {number} lineIndex - The index of the line to calculate score for.
     * @returns {number} The score for the line.
     */
    calculateLineScore(lineIndex) {
        if (!this.pieceTypes || !this.pieceTypes[lineIndex]) {
            return 0;
        }

        let lineScore = 0;

        // Calculate score from left to right (order matters now)
        for (let col = 0; col < this.columns; col++) {
            const pieceType = this.pieceTypes[lineIndex][col];
            if (pieceType && TarotTetris.ALL_TETROMINOES[pieceType]) {
                // Add the piece score to the running total
                lineScore += TarotTetris.ALL_TETROMINOES[pieceType].score || 0;
            }
        }

        // Apply the player's level as a multiplier
        if (TarotTetris && typeof TarotTetris.level === 'number') {
            lineScore *= TarotTetris.level;
        }

        return lineScore;
    }

    /**
     * Replaces random pieces on the board with other random pieces.
     */
    replaceRandomPieces() {
        if (!this.grid) {
            console.warn("Grid is undefined in replaceRandomPieces.");
            return;
        }
        for (let row = 0; row < this.rows; row++) {
            if (!this.grid[row]) {
                console.warn(`Row ${row} is undefined in replaceRandomPieces.`);
                continue;
            }
            for (let col = 0; col < this.columns; col++) {
                if (this.grid[row][col] !== 0 && Math.random() < 0.1) { // Only replace non-empty cells
                    this.grid[row][col] = Math.floor(Math.random() * 7) + 1; // Random piece type
                }
            }
        }
    }

    /**
     * Clears a specified number of rows from the bottom of the board.
     * @param {number} count - The number of rows to clear.
     */
    clearBottomRows(count) {
        if (!this.grid) {
            console.warn("Grid is undefined in clearBottomRows.");
            return;
        }
        for (let i = 0; i < count; i++) {
            this.grid.pop();
            this.grid.unshift(Array(this.columns).fill(0));
        }
    }

    /**
     * Clears a specified number of rows from the top of the board.
     * @param {number} count - The number of rows to clear.
     */
    clearTopRows(count) {
        if (!this.grid) {
            console.warn("Grid is undefined in clearTopRows.");
            return;
        }
        for (let i = 0; i < count; i++) {
            this.grid.shift();
            this.grid.push(Array(this.columns).fill(0));
        }
    }

    /**
     * Clears a random row on the board.
     */
    clearRandomRow() {
        if (!this.grid) {
            console.warn("Grid is undefined in clearRandomRow.");
            return;
        }
        const randomRow = Math.floor(Math.random() * this.rows);
        this.grid[randomRow] = Array(this.columns).fill(0);
    }

    /**
     * Adds a garbage row to the bottom of the board.
     */
    addGarbageRow() {
        if (!this.grid) {
            console.warn("Grid is undefined in addGarbageRow.");
            return;
        }
        this.grid.shift(); // Remove the top row
        this.grid.push(Array(this.columns).fill(1)); // Add a garbage row at the bottom
    }

    /**
     * Checks if the board is full.
     * @returns {boolean} True if the board is full, false otherwise.
     */
    isBoardFull() {
        if (!this.grid) {
            console.warn("Grid is undefined in isBoardFull.");
            return false;
        }
        // Check if the top row has any filled cells
        return this.grid[0].some(cell => cell !== 0);
    }

    /**
     * Checks if a piece can move down without colliding.
     * @param {Piece} piece - The piece to check.
     * @returns {boolean} True if the piece can move down, false otherwise.
     */
    canMoveDown(piece) {
        if (!piece || !piece.getCoordinates) {
            console.error("Invalid piece object in canMoveDown:", piece);
            return false;
        }

        // If phase effect is active, pieces can pass through blocks (but not boundaries)
        const phaseActive = window.__phaseActive === true;

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newY = coord.y + 1;
            // Always check boundaries
            if (newY >= this.rows) {
                return false;
            }
            // Skip block collision check if phase effect is active
            if (!phaseActive && this.grid[newY][coord.x] !== 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if a piece can move left without colliding.
     * @param {Piece} piece - The piece to check.
     * @returns {boolean} True if the piece can move left, false otherwise.
     */
    canMoveLeft(piece) {
        if (!piece || !piece.getCoordinates) {
            console.error("Invalid piece object in canMoveLeft:", piece);
            return false;
        }

        // If phase effect is active, pieces can pass through blocks (but not boundaries)
        const phaseActive = window.__phaseActive === true;

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newX = coord.x - 1;
            // Always check boundaries
            if (newX < 0) {
                return false;
            }
            // Skip block collision check if phase effect is active
            if (!phaseActive && this.grid[coord.y][newX] !== 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if a piece can move right without colliding.
     * @param {Piece} piece - The piece to check.
     * @returns {boolean} True if the piece can move right, false otherwise.
     */
    canMoveRight(piece) {
        if (!piece || !piece.getCoordinates) {
            console.error("Invalid piece object in canMoveRight:", piece);
            return false;
        }

        // If phase effect is active, pieces can pass through blocks (but not boundaries)
        const phaseActive = window.__phaseActive === true;

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newX = coord.x + 1;
            // Always check boundaries
            if (newX >= this.columns) {
                return false;
            }
            // Skip block collision check if phase effect is active
            if (!phaseActive && this.grid[coord.y][newX] !== 0) {
                return false;
            }
        }
        return true;
    }
}

// Export Board to the TarotTetris namespace
exports.Board = Board;
})(window.TarotTetris = window.TarotTetris || {});
