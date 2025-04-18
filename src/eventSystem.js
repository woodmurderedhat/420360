/**
 * Event System for Tarot Tetris
 * A centralized event system to handle communication between components.
 * This allows for better decoupling of components and easier maintenance.
 */

(function(exports) {
    // Store event listeners
    const eventListeners = {};

    /**
     * Subscribe to an event
     * @param {string} eventName - The name of the event to subscribe to
     * @param {Function} callback - The callback function to execute when the event is triggered
     * @returns {Function} A function to unsubscribe from the event
     */
    function on(eventName, callback) {
        if (!eventListeners[eventName]) {
            eventListeners[eventName] = [];
        }

        eventListeners[eventName].push(callback);

        // Return a function to unsubscribe
        return function unsubscribe() {
            const index = eventListeners[eventName].indexOf(callback);
            if (index !== -1) {
                eventListeners[eventName].splice(index, 1);
            }
        };
    }

    /**
     * Emit an event
     * @param {string} eventName - The name of the event to emit
     * @param {*} data - The data to pass to the event listeners
     */
    function emit(eventName, data) {
        if (!eventListeners[eventName]) {
            return;
        }

        // Create a copy of the listeners array to avoid issues if a listener unsubscribes during execution
        const listeners = [...eventListeners[eventName]];

        for (const listener of listeners) {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for "${eventName}":`, error);
            }
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - The name of the event to clear listeners for
     */
    function off(eventName) {
        if (eventName) {
            delete eventListeners[eventName];
        } else {
            // Clear all event listeners if no event name is provided
            Object.keys(eventListeners).forEach(key => {
                delete eventListeners[key];
            });
        }
    }

    /**
     * Subscribe to an event and unsubscribe after it's triggered once
     * @param {string} eventName - The name of the event to subscribe to
     * @param {Function} callback - The callback function to execute when the event is triggered
     * @returns {Function} A function to unsubscribe from the event
     */
    function once(eventName, callback) {
        const unsubscribe = on(eventName, function onceCallback(data) {
            unsubscribe();
            callback(data);
        });

        return unsubscribe;
    }

    /**
     * Get all registered event names
     * @returns {Array<string>} Array of event names
     */
    function getEventNames() {
        return Object.keys(eventListeners);
    }

    /**
     * Get the number of listeners for an event
     * @param {string} eventName - The name of the event
     * @returns {number} The number of listeners
     */
    function listenerCount(eventName) {
        return eventListeners[eventName] ? eventListeners[eventName].length : 0;
    }

    // Export the event system functions
    exports.events = {
        on,
        emit,
        off,
        once,
        getEventNames,
        listenerCount
    };

    // Define standard game events
    exports.EVENTS = {
        // Game state events
        GAME_INITIALIZED: 'game:initialized',
        GAME_STARTED: 'game:started',
        GAME_PAUSED: 'game:paused',
        GAME_RESUMED: 'game:resumed',
        GAME_OVER: 'game:over',
        LEVEL_UP: 'game:levelUp',

        // Piece events
        PIECE_SPAWNED: 'piece:spawned',
        PIECE_MOVED: 'piece:moved',
        PIECE_ROTATED: 'piece:rotated',
        PIECE_LOCKED: 'piece:locked',
        PIECE_HELD: 'piece:held',
        PIECE_DROPPED: 'piece:dropped',

        // Board events
        LINES_CLEARED: 'board:linesCleared',
        BOARD_CLEARED: 'board:cleared',

        // Score events
        SCORE_UPDATED: 'score:updated',
        GOLD_UPDATED: 'gold:updated',

        // Tarot events
        TAROT_CARD_ADDED: 'tarot:cardAdded',
        TAROT_CARD_PLAYED: 'tarot:cardPlayed',

        // Shop events
        SHOP_OPENED: 'shop:opened',
        SHOP_CLOSED: 'shop:closed',
        ITEM_PURCHASED: 'shop:itemPurchased',
        TETRIMINO_UPGRADED: 'shop:tetriminoUpgraded',
        TETRIMINO_UNLOCKED: 'shop:tetriminoUnlocked',

        // UI events
        UI_OVERLAY_SHOWN: 'ui:overlayShown',
        UI_OVERLAY_HIDDEN: 'ui:overlayHidden'
    };

})(window.TarotTetris = window.TarotTetris || {});
