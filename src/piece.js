/**
 * Represents a Tetris piece.
 */
class Piece {
    /**
     * Returns a random tetromino type.
     * @returns {string} One of 'I', 'O', 'T', 'S', 'Z', 'J', 'L'
     */
    static getRandomType() {
        const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Constructs a new Piece.
     * @param {string} [type] - The type of the piece (e.g., 'I', 'O', 'T'). If not provided, a random type is selected.
     */
    constructor(type) {
        const tetrominoes = {
            I: { shape: [[1, 1, 1, 1]], score: 40 },
            O: { shape: [[1, 1], [1, 1]], score: 30 },
            T: { shape: [[0, 1, 0], [1, 1, 1]], score: 50 },
            S: { shape: [[0, 1, 1], [1, 1, 0]], score: 60 },
            Z: { shape: [[1, 1, 0], [0, 1, 1]], score: 60 },
            J: { shape: [[1, 0, 0], [1, 1, 1]], score: 70 },
            L: { shape: [[0, 0, 1], [1, 1, 1]], score: 70 }
        };

        const keys = Object.keys(tetrominoes);
        const randomKey = type || keys[Math.floor(Math.random() * keys.length)];
        this.shape = tetrominoes[randomKey]?.shape || tetrominoes['T'].shape; // Fallback to T shape
        this.scoreValue = tetrominoes[randomKey]?.score || 0;
        this.position = { x: 3, y: 0 }; // Start position
        this.typeIndex = keys.indexOf(randomKey); // Get the index of the piece type
    }

    /**
     * Draws the piece on the canvas.
     * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
     */
    draw(context) {
        if (!context) {
            console.error("Invalid canvas context in draw:", context);
            return;
        }
        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63']; // Color palette
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillStyle = colors[this.typeIndex % colors.length];
                    context.fillRect((this.position.x + x) * 30, (this.position.y + y) * 30, 30, 30);
                    context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    context.strokeRect((this.position.x + x) * 30, (this.position.y + y) * 30, 30, 30);
                }
            });
        });
    }

    /**
     * Moves the piece down by one unit.
     */
    moveDown() {
        this.position.y++;
    }

    /**
     * Moves the piece left by one unit.
     */
    moveLeft() {
        this.position.x--;
    }

    /**
     * Moves the piece right by one unit.
     */
    moveRight() {
        this.position.x++;
    }

    /**
     * Checks if the piece can move down without colliding.
     * @param {Board} board - The game board.
     * @returns {boolean} True if the piece can move down, false otherwise.
     */
    canMoveDown(board) {
         if (!board || !board.grid) {
            console.error("Invalid board object in canMoveDown:", board);
            return false;
        }
        const newPosition = { x: this.position.x, y: this.position.y + 1 };
        const coordinates = this.getCoordinates(newPosition);

        for (let coord of coordinates) {
            if (coord.y >= board.rows || coord.x < 0 || coord.x >= board.columns) {
                return false;
            }
            if (!board.grid[coord.y]) {
                console.warn(`Row ${coord.y} is undefined.`);
                return false;
            }
            if (board.grid[coord.y][coord.x] === undefined) {
                console.warn(`Potential out-of-bounds access at y: ${coord.y}, x: ${coord.x}`);
                return false;
            }
            if (board.grid[coord.y][coord.x] !== 0) {
                return false;
            }
        }

        return true;
    }

   /**
    * Checks if the piece can move left without colliding.
    * @param {Board} board - The game board.
    * @returns {boolean} True if the piece can move left, false otherwise.
    */
    canMoveLeft(board) {
        if (!board || !board.grid) {
            console.error("Invalid board object in canMoveLeft:", board);
            return false;
        }
        const newPosition = { x: this.position.x - 1, y: this.position.y };
        const coordinates = this.getCoordinates(newPosition);

        for (let coord of coordinates) {
            if (coord.x < 0 || coord.y < 0 || coord.y >= board.rows) {
                return false;
            }
             if (!board.grid[coord.y]) {
                console.warn(`Row ${coord.y} is undefined.`);
                return false;
            }
             if (board.grid[coord.y][coord.x] === undefined) {
                console.warn(`Potential out-of-bounds access at y: ${coord.y}, x: ${coord.x}`);
                return false;
            }
            if (board.grid[coord.y][coord.x] !== 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if the piece can move right without colliding.
     * @param {Board} board - The game board.
     * @returns {boolean} True if the piece can move right, false otherwise.
     */
    canMoveRight(board) {
        if (!board || !board.grid) {
            console.error("Invalid board object in canMoveRight:", board);
            return false;
        }
        const newPosition = { x: this.position.x + 1, y: this.position.y };
        const coordinates = this.getCoordinates(newPosition);

        for (let coord of coordinates) {
            if (coord.x >= board.columns || coord.y < 0 || coord.y >= board.rows) {
                return false;
            }
             if (!board.grid[coord.y]) {
                console.warn(`Row ${coord.y} is undefined.`);
                return false;
            }
             if (board.grid[coord.y][coord.x] === undefined) {
                console.warn(`Potential out-of-bounds access at y: ${coord.y}, x: ${coord.x}`);
                return false;
            }
            if (board.grid[coord.y][coord.x] !== 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Undoes a rotation by rotating the piece back to its original orientation.
     */
    undoRotate() {
        this.rotate();
        this.rotate();
        this.rotate();
    }

    /**
     * Rotates the piece clockwise.
     * @param {Board} board - The game board.
     */
    rotate(board) {
        const originalShape = this.shape;
        this.shape = this.shape[0].map((_, index) =>
            this.shape.map(row => row[index]).reverse()
        );
        if (board.collides(this)) {
            this.shape = originalShape; // Revert rotation if it causes a collision
        } else if (this.position.x < 0 || this.position.x + this.shape[0].length > board.columns) {
            this.shape = originalShape; // Revert if rotation goes out of bounds
        }
    }

    /**
     * Moves the piece by a specified direction.
     * @param {object} direction - An object with x and y properties representing the direction to move.
     */
    move(direction) {
        this.position.x += direction.x;
        this.position.y += direction.y;
    }

    /**
     * Gets the coordinates of the piece's blocks.
     * @param {object} [position=this.position] - The position to calculate coordinates from.
     * @returns {Array<object>} An array of objects with x and y properties representing the coordinates.
     */
    getCoordinates(position = this.position) {
        const coordinates = [];
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    coordinates.push({ x: position.x + x, y: position.y + y });
                }
            });
        });
        return coordinates;
    }

    /**
     * Gets the score value of the piece.
     * @returns {number} The score value of the piece.
     */
    getScoreValue() {
        return this.scoreValue;
    }
}
