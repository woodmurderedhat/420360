/**
 * history.js - History and undo functionality for the Generative Art Studio
 * Handles storing and restoring previous states
 */

// Maximum number of history states to store
const MAX_HISTORY_STATES = 10;

// History state
let historyStates = [];
let currentHistoryIndex = -1;

/**
 * Save the current state to history
 * @param {Object} state - The state to save
 */
function saveToHistory(state) {
    // If we're not at the end of the history, remove future states
    if (currentHistoryIndex < historyStates.length - 1) {
        historyStates = historyStates.slice(0, currentHistoryIndex + 1);
    }
    
    // Add new state
    historyStates.push({ ...state });
    
    // Limit history size
    if (historyStates.length > MAX_HISTORY_STATES) {
        historyStates.shift();
    }
    
    // Update current index
    currentHistoryIndex = historyStates.length - 1;
    
    // Update UI
    updateHistoryButtons();
}

/**
 * Undo to the previous state
 * @returns {Object|null} The previous state or null if no previous state
 */
function undo() {
    if (currentHistoryIndex <= 0) {
        return null;
    }
    
    currentHistoryIndex--;
    updateHistoryButtons();
    return { ...historyStates[currentHistoryIndex] };
}

/**
 * Redo to the next state
 * @returns {Object|null} The next state or null if no next state
 */
function redo() {
    if (currentHistoryIndex >= historyStates.length - 1) {
        return null;
    }
    
    currentHistoryIndex++;
    updateHistoryButtons();
    return { ...historyStates[currentHistoryIndex] };
}

/**
 * Clear the history
 */
function clearHistory() {
    historyStates = [];
    currentHistoryIndex = -1;
    updateHistoryButtons();
}

/**
 * Update the history buttons state
 */
function updateHistoryButtons() {
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    
    if (undoButton) {
        undoButton.disabled = currentHistoryIndex <= 0;
    }
    
    if (redoButton) {
        redoButton.disabled = currentHistoryIndex >= historyStates.length - 1;
    }
}

/**
 * Get the current history state
 * @returns {Object|null} The current state or null if no state
 */
function getCurrentState() {
    if (currentHistoryIndex < 0 || historyStates.length === 0) {
        return null;
    }
    
    return { ...historyStates[currentHistoryIndex] };
}

/**
 * Get the history states
 * @returns {Array} The history states
 */
function getHistoryStates() {
    return [...historyStates];
}

// Export history functions
export {
    saveToHistory,
    undo,
    redo,
    clearHistory,
    updateHistoryButtons,
    getCurrentState,
    getHistoryStates
};
