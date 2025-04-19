(function(exports) {
/**
 * All possible tetromino definitions (standard + esoteric).
 */
exports.ALL_TETROMINOES = {
    I: { shape: [[1, 1, 1, 1]], score: 4 },
    O: { shape: [[1, 1], [1, 1]], score: 3 },
    T: { shape: [[0, 1, 0], [1, 1, 1]], score: 5 },
    S: { shape: [[0, 1, 1], [1, 1, 0]], score: 6 },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], score: 6 },
    J: { shape: [[1, 0, 0], [1, 1, 1]], score: 7 },
    L: { shape: [[0, 0, 1], [1, 1, 1]], score: 7 },

    // Esoteric variants (initially locked)
    SIGIL: { shape: [[1, 0], [1, 1], [1, 0]], score: 8 },
    HEX: { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], score: 9 },
    YOD: { shape: [[0, 1], [1, 1], [0, 1]], score: 8 },
    CROSS: { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], score: 10 },
    KEY: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 1]], score: 9 },
    EYE: { shape: [[0, 1, 0], [1, 1, 1], [1, 0, 1]], score: 11 },
    SERPENT: { shape: [[1, 1, 0], [1, 0, 1], [0, 1, 1]], score: 12 },
    TREE: { shape: [[0, 1, 0], [1, 1, 1], [1, 0, 1]], score: 11 },
    RUNE: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 1]], score: 8 },
    ANKH: { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0]], score: 13 }
};

// Start with only the standard 7 tetrominoes unlocked
if (!window.unlockedTetrominoes) {
    window.unlockedTetrominoes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
}

class Piece {
    /**
     * Returns a random tetromino type from the unlocked pool.
     * @returns {string}
     */
    static getRandomType() {
        const types = window.unlockedTetrominoes || ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Constructs a new Piece.
     * @param {string} [type] - The type of the piece (e.g., 'I', 'O', 'T', etc.). If not provided, a random unlocked type is selected.
     */
    constructor(type) {
        const tetrominoes = exports.ALL_TETROMINOES;
        const keys = window.unlockedTetrominoes || Object.keys(tetrominoes);
        const randomKey = type || keys[Math.floor(Math.random() * keys.length)];
        this.shape = tetrominoes[randomKey]?.shape || tetrominoes['T'].shape; // Fallback to T shape
        this.scoreValue = tetrominoes[randomKey]?.score || 0;
        this.position = { x: 3, y: 0 }; // Start position
        this.typeIndex = Object.keys(exports.ALL_TETROMINOES).indexOf(randomKey); // For color
        this.type = randomKey;
        this.rotation = 0; // 0 = spawn orientation, 1 = 90° clockwise, 2 = 180°, 3 = 270° clockwise
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

        // Check if fragment jitter effect is active
        const fragmentJitter = window.__fragmentJitter === true;

        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillStyle = colors[this.typeIndex % colors.length];

                    // Apply random jitter offset if fragment effect is active
                    if (fragmentJitter) {
                        const jitterX = Math.floor(Math.random() * 7) - 3; // Random offset between -3 and 3
                        const jitterY = Math.floor(Math.random() * 7) - 3;
                        context.fillRect(
                            (this.position.x + x) * 30 + jitterX,
                            (this.position.y + y) * 30 + jitterY,
                            30,
                            30
                        );
                        context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        context.strokeRect(
                            (this.position.x + x) * 30 + jitterX,
                            (this.position.y + y) * 30 + jitterY,
                            30,
                            30
                        );
                    } else {
                        // Normal rendering without jitter
                        context.fillRect((this.position.x + x) * 30, (this.position.y + y) * 30, 30, 30);
                        context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                        context.strokeRect((this.position.x + x) * 30, (this.position.y + y) * 30, 30, 30);
                    }
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
     * @param {Board} board - The game board.
     */
    undoRotate(board) {
        if (!board) return;

        // Store current rotation state (0-3)
        const currentRotation = this.rotation || 0;
        const previousRotation = (currentRotation + 3) % 4; // -1 + 4 = 3 (mod 4)

        // Store original shape and position
        const originalShape = this.shape.map(row => [...row]);
        const originalPosition = { ...this.position };

        // Rotate the shape three times (equivalent to rotating counter-clockwise once)
        for (let i = 0; i < 3; i++) {
            this.shape = this.shape[0].map((_, index) =>
                this.shape.map(row => row[index]).reverse()
            );
        }

        // Check if rotation is valid without wall kicks
        // Use getCoordinates to check boundaries properly
        const coordinates = this.getCoordinates();
        let isValidPosition = true;

        // Check if any part of the piece is out of bounds
        for (let coord of coordinates) {
            if (coord.x < 0 || coord.x >= board.columns || coord.y < 0 || coord.y >= board.rows) {
                isValidPosition = false;
                break;
            }
        }

        if (!board.collides(this) && isValidPosition) {
            // Rotation is valid, update rotation state
            this.rotation = previousRotation;
            return true;
        }

        // Try wall kicks
        if (TarotTetris.wallKick && typeof TarotTetris.wallKick.getWallKickData === 'function') {
            const wallKickData = TarotTetris.wallKick.getWallKickData(this.type);
            const kickKey = `${currentRotation}->${previousRotation}`;

            if (wallKickData[kickKey]) {
                for (const kick of wallKickData[kickKey]) {
                    // Apply wall kick
                    this.position.x = originalPosition.x + kick.x;
                    this.position.y = originalPosition.y + kick.y;

                    // Check if this position is valid using getCoordinates
                    const kickCoordinates = this.getCoordinates();
                    let isValidKickPosition = true;

                    // Check if any part of the piece is out of bounds
                    for (let coord of kickCoordinates) {
                        if (coord.x < 0 || coord.x >= board.columns || coord.y < 0 || coord.y >= board.rows) {
                            isValidKickPosition = false;
                            break;
                        }
                    }

                    if (!board.collides(this) && isValidKickPosition) {
                        // Wall kick successful, update rotation state
                        this.rotation = previousRotation;
                        return true;
                    }
                }
            }
        }

        // If we get here, rotation failed, revert to original state
        this.shape = originalShape;
        this.position = originalPosition;
        return false;
    }

    /**
     * Rotates the piece clockwise with wall kicks.
     * @param {Board} board - The game board.
     */
    rotate(board) {
        if (!board) return;

        // Store current rotation state (0-3)
        const currentRotation = this.rotation || 0;
        const nextRotation = (currentRotation + 1) % 4;

        // Store original shape and position
        const originalShape = this.shape.map(row => [...row]);
        const originalPosition = { ...this.position };

        // Rotate the shape
        this.shape = this.shape[0].map((_, index) =>
            this.shape.map(row => row[index]).reverse()
        );

        // Check if rotation is valid without wall kicks
        // Use getCoordinates to check boundaries properly
        const coordinates = this.getCoordinates();
        let isValidPosition = true;

        // Check if any part of the piece is out of bounds
        for (let coord of coordinates) {
            if (coord.x < 0 || coord.x >= board.columns || coord.y < 0 || coord.y >= board.rows) {
                isValidPosition = false;
                break;
            }
        }

        if (!board.collides(this) && isValidPosition) {
            // Rotation is valid, update rotation state
            this.rotation = nextRotation;

            // Emit piece rotated event
            if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_ROTATED, {
                    piece: this,
                    fromRotation: currentRotation,
                    toRotation: nextRotation,
                    wallKickApplied: false
                });
            }

            return true;
        }

        // Try wall kicks
        if (TarotTetris.wallKick && typeof TarotTetris.wallKick.getWallKickData === 'function') {
            const wallKickData = TarotTetris.wallKick.getWallKickData(this.type);
            const kickKey = `${currentRotation}->${nextRotation}`;

            if (wallKickData[kickKey]) {
                for (const kick of wallKickData[kickKey]) {
                    // Apply wall kick
                    this.position.x = originalPosition.x + kick.x;
                    this.position.y = originalPosition.y + kick.y;

                    // Check if this position is valid using getCoordinates
                    const kickCoordinates = this.getCoordinates();
                    let isValidKickPosition = true;

                    // Check if any part of the piece is out of bounds
                    for (let coord of kickCoordinates) {
                        if (coord.x < 0 || coord.x >= board.columns || coord.y < 0 || coord.y >= board.rows) {
                            isValidKickPosition = false;
                            break;
                        }
                    }

                    if (!board.collides(this) && isValidKickPosition) {
                        // Wall kick successful, update rotation state
                        this.rotation = nextRotation;

                        // Emit piece rotated event with wall kick info
                        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
                            TarotTetris.events.emit(TarotTetris.EVENTS.PIECE_ROTATED, {
                                piece: this,
                                fromRotation: currentRotation,
                                toRotation: nextRotation,
                                wallKickApplied: true,
                                wallKickOffset: kick
                            });
                        }

                        return true;
                    }
                }
            }
        }

        // If we get here, rotation failed, revert to original state
        this.shape = originalShape;
        this.position = originalPosition;
        return false;
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
        return this.scoreValue || 0;
    }

    /**
     * Upgrade this piece (increase score value).
     * @param {number} amount
     */
    upgrade(amount = 50) {
        this.scoreValue = (this.scoreValue || 0) + amount;
    }
}

// Export Piece to the TarotTetris namespace
exports.Piece = Piece;
})(window.TarotTetris = window.TarotTetris || {});
