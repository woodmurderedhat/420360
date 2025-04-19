/**
 * Ghost Piece System for Tarot Tetris.
 * Provides functionality to calculate and render the ghost piece that shows where the current piece will land.
 */
(function(exports) {
    // Cache for the ghost piece to avoid creating a new instance on every frame
    let ghostPieceCache = null;

    /**
     * Calculates the position of the ghost piece based on the current piece and board state.
     * @param {Object} piece - The current active piece
     * @param {Object} board - The game board
     * @returns {Object} The ghost piece with calculated landing position
     */
    function calculateGhostPiece(piece, board) {
        if (!piece || !piece.type || !board) return null;

        // Create a new ghost piece or reuse the cached one
        if (!ghostPieceCache) {
            ghostPieceCache = new TarotTetris.Piece(piece.type);
        }

        // Copy all relevant properties from the active piece
        ghostPieceCache.type = piece.type;
        ghostPieceCache.typeIndex = piece.typeIndex;
        ghostPieceCache.shape = piece.shape.map(row => [...row]);
        ghostPieceCache.position = { ...piece.position };
        ghostPieceCache.rotation = piece.rotation;
        ghostPieceCache.scoreValue = piece.scoreValue;

        // If phase effect is active, we need special handling
        const phaseActive = window.__phaseActive === true;

        if (phaseActive) {
            // With phase effect, we need to find the lowest position without boundary collision
            let lowestY = ghostPieceCache.position.y;

            // Move down until we hit the bottom boundary
            while (lowestY < board.rows - ghostPieceCache.shape.length) {
                lowestY++;
            }

            ghostPieceCache.position.y = lowestY;
        } else {
            // Standard ghost piece calculation - move down until collision
            let canMoveDown = true;

            while (canMoveDown) {
                // Create a test position one row down
                const testY = ghostPieceCache.position.y + 1;

                // Check if this position would be valid
                const coordinates = ghostPieceCache.getCoordinates({
                    x: ghostPieceCache.position.x,
                    y: testY
                });

                let collision = false;

                for (let coord of coordinates) {
                    // Check boundaries
                    if (coord.y >= board.rows || coord.x < 0 || coord.x >= board.columns) {
                        collision = true;
                        break;
                    }

                    // Check collision with existing blocks
                    if (board.grid[coord.y] && board.grid[coord.y][coord.x] !== 0) {
                        collision = true;
                        break;
                    }
                }

                if (collision) {
                    canMoveDown = false;
                } else {
                    ghostPieceCache.position.y = testY;
                }
            }
        }

        return ghostPieceCache;
    }

    /**
     * Draws the ghost piece on the canvas.
     * @param {CanvasRenderingContext2D} context - The 2D rendering context
     * @param {Object} piece - The current active piece
     * @param {Object} board - The game board
     */
    function drawGhostPiece(context, piece, board) {
        if (!context || !piece || !board) return;

        // Get ghost piece upgrade level (0-2)
        const ghostPieceLevel = window.ghostPieceLevel || 0;

        // Calculate ghost piece position
        const ghostPiece = calculateGhostPiece(piece, board);
        if (!ghostPiece) return;

        // Only draw the ghost if it's not at the same position as the active piece
        if (ghostPiece.position.y === piece.position.y) return;

        // Get the color for the ghost piece
        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63'];
        const ghostColor = colors[ghostPiece.typeIndex % colors.length];

        // Base opacity increases with ghost piece level
        const baseOpacity = 0.3 + (ghostPieceLevel * 0.15); // 0.3, 0.45, 0.6
        const hexOpacity = Math.floor(baseOpacity * 255).toString(16).padStart(2, '0');

        // Save the current context state
        context.save();

        // Draw the ghost piece blocks
        ghostPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    // Enhanced ghost piece with level 2 gets an outline
                    if (ghostPieceLevel >= 2) {
                        // Draw outline
                        context.strokeStyle = ghostColor;
                        context.lineWidth = 2;
                        context.strokeRect(
                            (ghostPiece.position.x + x) * 30 + 1,
                            (ghostPiece.position.y + y) * 30 + 1,
                            28,
                            28
                        );
                    }

                    // Fill with semi-transparent color
                    context.fillStyle = ghostColor + hexOpacity;
                    context.globalAlpha = baseOpacity;
                    context.fillRect(
                        (ghostPiece.position.x + x) * 30,
                        (ghostPiece.position.y + y) * 30,
                        30,
                        30
                    );
                }
            });
        });

        // Draw landing indicator line for level 1+
        if (ghostPieceLevel >= 1) {
            // Calculate the width of the piece
            let minX = Infinity;
            let maxX = -Infinity;

            ghostPiece.getCoordinates().forEach(coord => {
                minX = Math.min(minX, coord.x);
                maxX = Math.max(maxX, coord.x + 1);
            });

            const y = ghostPiece.position.y * 30;

            context.beginPath();
            context.moveTo(minX * 30, y);
            context.lineTo(maxX * 30, y);
            context.strokeStyle = ghostColor;
            context.lineWidth = 2;
            context.stroke();
        }

        // Restore the context state
        context.globalAlpha = 1.0;
        context.restore();

        // Emit ghost piece updated event if event system is available
        if (TarotTetris.events && typeof TarotTetris.events.emit === 'function') {
            TarotTetris.events.emit('ghostPiece:updated', {
                piece: piece,
                ghostPiece: ghostPiece,
                level: ghostPieceLevel
            });
        }
    }

    /**
     * Gets the landing position Y coordinate for the current piece.
     * Useful for hard drop functionality.
     * @param {Object} piece - The current active piece
     * @param {Object} board - The game board
     * @returns {number} The Y coordinate where the piece would land
     */
    function getLandingPosition(piece, board) {
        const ghostPiece = calculateGhostPiece(piece, board);
        return ghostPiece ? ghostPiece.position.y : piece.position.y;
    }

    // Export functions to the TarotTetris namespace
    exports.drawGhostPiece = drawGhostPiece;
    exports.calculateGhostPiece = calculateGhostPiece;
    exports.getLandingPosition = getLandingPosition;

})(window.TarotTetris = window.TarotTetris || {});
