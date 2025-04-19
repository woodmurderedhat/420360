/**
 * Ghost Piece Rendering for Tarot Tetris.
 * Exports drawGhostPiece for showing where the current piece will land.
 */
(function(exports) {
    function drawGhostPiece(context, piece, board) {
        if (!piece || !piece.type) return;

        // Get ghost piece upgrade level (0-2)
        const ghostPieceLevel = window.ghostPieceLevel || 0;

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

            // Base opacity increases with ghost piece level
            const baseOpacity = 0.3 + (ghostPieceLevel * 0.15); // 0.3, 0.45, 0.6
            const hexOpacity = Math.floor(baseOpacity * 255).toString(16).padStart(2, '0');

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
                        context.globalAlpha = 1.0;
                    }
                });
            });

            // Draw landing indicator line for level 1+
            if (ghostPieceLevel >= 1) {
                const minX = ghostPiece.position.x;
                const maxX = ghostPiece.position.x + ghostPiece.shape[0].length;
                const y = ghostPiece.position.y * 30;

                context.beginPath();
                context.moveTo(minX * 30, y);
                context.lineTo(maxX * 30, y);
                context.strokeStyle = ghostColor;
                context.lineWidth = 2;
                context.stroke();
            }
        }
    }

    exports.drawGhostPiece = drawGhostPiece;
})(window.TarotTetris = window.TarotTetris || {});
