/**
 * Hold Piece Logic for Tarot Tetris.
 * Exports holdPiece and updateHoldUI for managing the hold feature.
 */
(function(exports) {
    function holdPiece(state) {
        // state: { heldPiece, piece, canHold, spawnPiece, updateHoldUI }
        if (!state.canHold) return;
        if (state.heldPiece) {
            const temp = state.heldPiece;
            state.heldPiece = state.piece;
            state.piece = temp;
            state.piece.position = { x: 3, y: 0 }; // Reset position
        } else {
            state.heldPiece = state.piece;
            state.spawnPiece();
        }
        state.canHold = false; // Prevent holding multiple times in a row
        state.updateHoldUI();
    }

    function updateHoldUI(heldPiece) {
        const holdContainer = document.getElementById('hold-container');
        if (!holdContainer) {
            console.warn("Hold container not found.");
            return;
        }
        holdContainer.innerHTML = '';
        if (heldPiece) {
            const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63']; // Color palette
            heldPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const block = document.createElement('div');
                        block.style.gridRowStart = y + 1;
                        block.style.gridColumnStart = x + 1;
                        block.className = 'block';
                        block.style.backgroundColor = colors[heldPiece.typeIndex % colors.length];
                        holdContainer.appendChild(block);
                    }
                });
            });
        }
    }

    exports.holdPiece = holdPiece;
    exports.updateHoldUI = updateHoldUI;
})(window.TarotTetris = window.TarotTetris || {});
