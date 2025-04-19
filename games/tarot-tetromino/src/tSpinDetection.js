/**
 * T-Spin Detection for Tarot Tetris
 * Implements T-spin detection for scoring bonuses.
 */

(function(exports) {
    /**
     * Check if the last move was a T-spin
     * @param {Piece} piece - The current piece
     * @param {Board} board - The game board
     * @param {boolean} wasRotation - Whether the last move was a rotation
     * @returns {Object} T-spin detection result
     */
    function detectTSpin(piece, board, wasRotation) {
        // Only T pieces can perform T-spins
        if (!piece || piece.type !== 'T' || !wasRotation) {
            return { isTSpin: false, isMini: false };
        }

        // Get the corners around the T piece
        const corners = getCorners(piece, board);
        const filledCorners = corners.filter(corner => corner.isFilled).length;

        // T-Spin requires at least 3 corners to be filled
        if (filledCorners >= 3) {
            // Check if it's a mini T-spin (only front corners filled)
            const frontCornersFilled = corners
                .filter(corner => corner.isFront)
                .filter(corner => corner.isFilled)
                .length;
            
            const backCornersFilled = corners
                .filter(corner => !corner.isFront)
                .filter(corner => corner.isFilled)
                .length;
            
            // Mini T-spin: 3 corners filled, but both back corners are empty
            const isMini = frontCornersFilled === 2 && backCornersFilled < 2;
            
            return { 
                isTSpin: true, 
                isMini: isMini,
                filledCorners: filledCorners
            };
        }

        return { isTSpin: false, isMini: false };
    }

    /**
     * Get the corners around a T piece
     * @param {Piece} piece - The T piece
     * @param {Board} board - The game board
     * @returns {Array} Array of corner objects
     */
    function getCorners(piece, board) {
        if (!piece || !board || piece.type !== 'T') {
            return [];
        }

        // Get the center position of the T piece
        const center = getCenterPosition(piece);
        if (!center) return [];

        // Determine front and back based on rotation
        const rotation = piece.rotation || 0;
        
        // Define the four corners around the T piece
        const corners = [
            { x: center.x - 1, y: center.y - 1, isFront: rotation === 0 || rotation === 3 },
            { x: center.x + 1, y: center.y - 1, isFront: rotation === 0 || rotation === 1 },
            { x: center.x - 1, y: center.y + 1, isFront: rotation === 2 || rotation === 3 },
            { x: center.x + 1, y: center.y + 1, isFront: rotation === 1 || rotation === 2 }
        ];

        // Check if each corner is filled (either a block or out of bounds)
        return corners.map(corner => {
            // Out of bounds is considered filled
            if (corner.x < 0 || corner.x >= board.columns || 
                corner.y < 0 || corner.y >= board.rows) {
                return { ...corner, isFilled: true };
            }
            
            // Check if the cell is filled
            const isFilled = board.grid[corner.y][corner.x] !== 0;
            return { ...corner, isFilled };
        });
    }

    /**
     * Get the center position of a T piece
     * @param {Piece} piece - The T piece
     * @returns {Object|null} The center position or null if not a T piece
     */
    function getCenterPosition(piece) {
        if (!piece || piece.type !== 'T') {
            return null;
        }

        // The center of the T piece depends on its rotation
        const rotation = piece.rotation || 0;
        
        switch (rotation) {
            case 0: // T shape: [[0,1,0],[1,1,1]]
                return { x: piece.position.x + 1, y: piece.position.y + 1 };
            case 1: // T shape rotated 90°: [[1,0],[1,1],[1,0]]
                return { x: piece.position.x + 1, y: piece.position.y + 1 };
            case 2: // T shape rotated 180°: [[1,1,1],[0,1,0]]
                return { x: piece.position.x + 1, y: piece.position.y };
            case 3: // T shape rotated 270°: [[0,1],[1,1],[0,1]]
                return { x: piece.position.x, y: piece.position.y + 1 };
            default:
                return null;
        }
    }

    /**
     * Calculate T-spin bonus score
     * @param {Object} tSpinResult - The T-spin detection result
     * @param {number} linesCleared - Number of lines cleared
     * @returns {number} Bonus score
     */
    function calculateTSpinBonus(tSpinResult, linesCleared) {
        if (!tSpinResult.isTSpin) {
            return 0;
        }

        // T-Spin with no lines cleared
        if (linesCleared === 0) {
            return tSpinResult.isMini ? 100 : 400;
        }
        
        // T-Spin with lines cleared
        switch (linesCleared) {
            case 1: // T-Spin Single
                return tSpinResult.isMini ? 200 : 800;
            case 2: // T-Spin Double
                return tSpinResult.isMini ? 400 : 1200;
            case 3: // T-Spin Triple
                return 1600;
            default:
                return 0;
        }
    }

    // Export T-spin detection functions
    exports.tSpin = {
        detectTSpin,
        calculateTSpinBonus
    };

})(window.TarotTetris = window.TarotTetris || {});
