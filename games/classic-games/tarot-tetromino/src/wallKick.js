/**
 * Wall Kick System for Tarot Tetris
 * Implements the Super Rotation System (SRS) for tetrimino rotation.
 */

(function(exports) {
    // Wall kick data for J, L, S, T, Z tetriminoes
    const JLSTZ_WALL_KICK_DATA = {
        '0->1': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}],
        '1->0': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}],
        '1->2': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}],
        '2->1': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}],
        '2->3': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}],
        '3->2': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}],
        '3->0': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}],
        '0->3': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}]
    };

    // Wall kick data for I tetrimino
    const I_WALL_KICK_DATA = {
        '0->1': [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: -1}, {x: 1, y: 2}],
        '1->0': [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: 1}, {x: -1, y: -2}],
        '1->2': [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: 2}, {x: 2, y: -1}],
        '2->1': [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: -2}, {x: -2, y: 1}],
        '2->3': [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: 1}, {x: -1, y: -2}],
        '3->2': [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: -1}, {x: 1, y: 2}],
        '3->0': [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: -2}, {x: -2, y: 1}],
        '0->3': [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: 2}, {x: 2, y: -1}]
    };

    // Wall kick data for O tetrimino (no wall kicks needed)
    const O_WALL_KICK_DATA = {
        '0->1': [{x: 0, y: 0}],
        '1->0': [{x: 0, y: 0}],
        '1->2': [{x: 0, y: 0}],
        '2->1': [{x: 0, y: 0}],
        '2->3': [{x: 0, y: 0}],
        '3->2': [{x: 0, y: 0}],
        '3->0': [{x: 0, y: 0}],
        '0->3': [{x: 0, y: 0}]
    };

    // Wall kick data for custom tetriminoes (simplified version of JLSTZ)
    const CUSTOM_WALL_KICK_DATA = {
        '0->1': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -1}, {x: -1, y: -1}],
        '1->0': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}],
        '1->2': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}],
        '2->1': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -1}, {x: -1, y: -1}],
        '2->3': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -1}, {x: 1, y: -1}],
        '3->2': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 1}, {x: -1, y: 1}],
        '3->0': [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 1}, {x: -1, y: 1}],
        '0->3': [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -1}, {x: 1, y: -1}]
    };

    /**
     * Get the appropriate wall kick data for a tetrimino type
     * @param {string} type - The tetrimino type
     * @returns {Object} The wall kick data for the tetrimino type
     */
    function getWallKickData(type) {
        if (type === 'I') {
            return I_WALL_KICK_DATA;
        } else if (type === 'O') {
            return O_WALL_KICK_DATA;
        } else if (['J', 'L', 'S', 'T', 'Z'].includes(type)) {
            return JLSTZ_WALL_KICK_DATA;
        } else {
            // For custom tetriminoes
            return CUSTOM_WALL_KICK_DATA;
        }
    }

    // Export wall kick data and functions
    exports.wallKick = {
        getWallKickData
    };

})(window.TarotTetris = window.TarotTetris || {});
