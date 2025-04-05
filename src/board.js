class Board {
    /**
     * Constructs a new Board instance.
     * Initializes the board with a grid of rows and columns.
     */
    constructor() {
        this.rows = 20;
        this.columns = 10;
        this.grid = this.createGrid();
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
     * Resets the board by creating a new empty grid.
     */
    reset() {
        this.grid = this.createGrid();
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

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
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
            if (this.grid[coord.y][coord.x] !== 0) {
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
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const cellValue = this.grid[row][col];
                ctx.fillStyle = cellValue === 0 ? 'rgba(255, 255, 255, 0.1)' : colors[cellValue % colors.length];
                ctx.fillRect(col * 30, row * 30, 30, 30);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.strokeRect(col * 30, row * 30, 30, 30);
            }
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
            } else {
                console.warn(`Out-of-bounds coordinate: x=${coord.x}, y=${coord.y}`);
            }
        }
    }

    /**
     * Clears full lines from the board.
     * @returns {number} The number of lines cleared.
     */
    clearLines() {
        const linesToClear = this.checkFullLines();
        if (!Array.isArray(linesToClear)) {
            console.error("checkFullLines did not return an array:", linesToClear);
            return 0;
        }
        for (let line of linesToClear) {
            if (line >= 0 && line < this.grid.length) {
                this.grid.splice(line, 1);
                this.grid.unshift(Array(this.columns).fill(0));
            } else {
                console.warn(`Line index out of bounds: ${line}`);
            }
        }
        return linesToClear.length; // Return the number of lines cleared
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
     * Adds a solid row to the bottom of the board.
     */
    addSolidRow() {
        if (!this.grid) {
            console.warn("Grid is undefined in addSolidRow.");
            return;
        }
        this.grid.shift(); // Remove the top row
        const solidRow = Array(this.columns).fill(1);
        const randomGap = Math.floor(Math.random() * this.columns);
        solidRow[randomGap] = 0; // Create a gap in the solid row
        this.grid.push(solidRow); // Add the solid row with a gap at the bottom
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

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newY = coord.y + 1;
            if (newY >= this.rows || this.grid[newY][coord.x] !== 0) {
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

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newX = coord.x - 1;
            if (newX < 0 || this.grid[coord.y][newX] !== 0) {
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

        const coordinates = piece.getCoordinates();
        for (let coord of coordinates) {
            const newX = coord.x + 1;
            if (newX >= this.columns || this.grid[coord.y][newX] !== 0) {
                return false;
            }
        }
        return true;
    }
}