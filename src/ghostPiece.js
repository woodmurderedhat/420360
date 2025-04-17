/**
 * Ghost Piece Rendering for Tarot Tetris.
 * Exports drawGhostPiece for showing where the current piece will land.
 */
(function(exports) {
    function drawGhostPiece(context, piece, board) {
        if (!piece || !piece.type) return;
        const ghostPiece = new TarotTetris.Piece(piece.type);
        ghostPiece.shape = piece.shape.map(row => [...row]);
        ghostPiece.position = { ...piece.position };
        ghostPiece.typeIndex = piece.typeIndex;

        // Move ghost down until it can't move further
        while (ghostPiece.canMoveDown(board)) {
            ghostPiece.moveDown();
        }

        // Only draw the ghost if it's not overlapping the current piece
        if (ghostPiece.position.y !== piece.position.y) {
            const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63'];
            const ghostColor = colors[ghostPiece.typeIndex % colors.length];
            ghostPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        context.fillStyle = ghostColor + '4D'; // Add transparency (hex 4D = ~30%)
                        context.globalAlpha = 0.3;
                        context.fillRect((ghostPiece.position.x + x) * 30, (ghostPiece.position.y + y) * 30, 30, 30);
                        context.globalAlpha = 1.0;
                    }
                });
            });
        }
    }

    exports.drawGhostPiece = drawGhostPiece;
})(window.TarotTetris = window.TarotTetris || {});
