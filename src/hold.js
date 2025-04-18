/**
 * Hold Piece Logic for Tarot Tetris.
 * Exports holdPiece and updateHoldUI for managing the hold feature.
 */
(function(exports) {
    // Max number of pieces that can be held
    const MAX_HELD_PIECES = 3;

    /**
     * Hold the current piece. If hold is full, do nothing.
     * If not, add current piece to hold and spawn a new one.
     * If hold is not empty, allow swapping with any held piece (by index).
     * state: { heldPieces, piece, canHold, spawnPiece, updateHoldUI, selectIndex }
     */
    function holdPiece(state) {
        if (!state.canHold) return;
        state.heldPieces = state.heldPieces || [];
        // If selectIndex is provided, swap with that held piece
        if (typeof state.selectIndex === 'number' && state.heldPieces[state.selectIndex]) {
            const temp = state.heldPieces[state.selectIndex];
            state.heldPieces[state.selectIndex] = state.piece;
            state.piece = temp;
            state.piece.position = { x: 3, y: 0 };
        } else if (state.heldPieces.length < MAX_HELD_PIECES) {
            // Add current piece to hold and spawn new one
            state.heldPieces.push(state.piece);
            state.spawnPiece();
        } else {
            // Hold is full, do nothing or give feedback
            return;
        }
        state.canHold = false;
        state.updateHoldUI(state.heldPieces);
    }

    /**
     * Update the hold UI to show all held pieces.
     * heldPieces: array of Piece objects
     */
    function updateHoldUI(heldPieces) {
        const holdContainer = document.getElementById('hold-container');
        if (!holdContainer) {
            console.warn("Hold container not found.");
            return;
        }
        holdContainer.innerHTML = '';
        if (!heldPieces || heldPieces.length === 0) return;
        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63'];
        heldPieces.forEach((heldPiece, idx) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'held-piece-preview';
            pieceDiv.title = `Held #${idx + 1}`;

            // Render the piece as a mini grid
            heldPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const block = document.createElement('div');
                        block.className = 'block';
                        block.style.backgroundColor = colors[heldPiece.typeIndex % colors.length];
                        block.style.gridRowStart = y + 1;
                        block.style.gridColumnStart = x + 1;
                        pieceDiv.appendChild(block);
                    }
                });
            });
            pieceDiv.style.display = 'grid';
            pieceDiv.style.gridTemplateRows = `repeat(${heldPiece.shape.length}, 1fr)`;
            pieceDiv.style.gridTemplateColumns = `repeat(${heldPiece.shape[0].length}, 1fr)`;
            pieceDiv.style.marginBottom = '0.7rem';

            // Add info and buttons container
            const infoDiv = document.createElement('div');
            infoDiv.style.display = 'flex';
            infoDiv.style.flexDirection = 'column';
            infoDiv.style.alignItems = 'center';
            infoDiv.style.marginTop = '0.2rem';

            // Show score value
            const scoreSpan = document.createElement('span');
            scoreSpan.textContent = `Value: ${heldPiece.getScoreValue ? heldPiece.getScoreValue() : (heldPiece.scoreValue || 0)}`;
            scoreSpan.style.fontSize = '0.8rem';
            scoreSpan.style.color = '#ffeb3b';
            infoDiv.appendChild(scoreSpan);

            // Upgrade button
            const upgradeBtn = document.createElement('button');
            upgradeBtn.textContent = 'Upgrade';
            upgradeBtn.className = 'hold-upgrade-btn';
            upgradeBtn.style.margin = '0.2rem 0 0.1rem 0';
            upgradeBtn.style.fontSize = '0.7rem';
            upgradeBtn.onclick = function(e) {
                e.stopPropagation();
                if (typeof window.upgradeHeldPiece === 'function') {
                    window.upgradeHeldPiece(idx);
                }
            };
            infoDiv.appendChild(upgradeBtn);

            // Swap In button
            const swapBtn = document.createElement('button');
            swapBtn.textContent = 'Swap In';
            swapBtn.className = 'hold-swap-btn';
            swapBtn.style.fontSize = '0.7rem';
            swapBtn.onclick = function(e) {
                e.stopPropagation();
                if (typeof window.TarotTetris.selectHeldPiece === 'function') {
                    window.TarotTetris.selectHeldPiece(idx);
                }
            };
            infoDiv.appendChild(swapBtn);

            // Wrap pieceDiv and infoDiv
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.appendChild(pieceDiv);
            wrapper.appendChild(infoDiv);

            holdContainer.appendChild(wrapper);
        });
    }

    function updateNextUI(nextQueue) {
        const nextContainer = document.getElementById('next-container');
        if (!nextContainer) {
            console.warn("Next container not found.");
            return;
        }
        nextContainer.innerHTML = '';
        if (!nextQueue || nextQueue.length === 0) return;

        const colors = ['#ff5722', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#e91e63'];
        nextQueue.forEach((nextPiece, idx) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'next-piece-preview';
            // Optionally, add a class for the first/second/third preview
            pieceDiv.classList.add('preview-' + (idx + 1));
            // Render the piece as a mini grid
            nextPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const block = document.createElement('div');
                        block.className = 'block';
                        block.style.backgroundColor = colors[nextPiece.typeIndex % colors.length];
                        block.style.gridRowStart = y + 1;
                        block.style.gridColumnStart = x + 1;
                        pieceDiv.appendChild(block);
                    }
                });
            });
            // Set up a mini grid for each piece
            pieceDiv.style.display = 'grid';
            pieceDiv.style.gridTemplateRows = `repeat(${nextPiece.shape.length}, 1fr)`; 
            pieceDiv.style.gridTemplateColumns = `repeat(${nextPiece.shape[0].length}, 1fr)`;
            pieceDiv.style.marginBottom = '0.7rem';
            nextContainer.appendChild(pieceDiv);
        });
    }

    // Expose selectHeldPiece for UI
    exports.selectHeldPiece = function(idx) {
        if (typeof window.heldPieces !== 'undefined' && typeof window.piece !== 'undefined' && typeof window.canHold !== 'undefined') {
            const state = {
                heldPieces: window.heldPieces,
                piece: window.piece,
                canHold: window.canHold,
                spawnPiece: window.spawnPiece,
                updateHoldUI: function() {
                    if (typeof exports.updateHoldUI === 'function') {
                        exports.updateHoldUI(window.heldPieces);
                    }
                },
                selectIndex: idx
            };
            exports.holdPiece(state);
            window.heldPieces = state.heldPieces;
            window.piece = state.piece;
            window.canHold = state.canHold;
        }
    };

    exports.holdPiece = holdPiece;
    exports.updateHoldUI = updateHoldUI;
    exports.updateNextUI = updateNextUI;
})(window.TarotTetris = window.TarotTetris || {});
