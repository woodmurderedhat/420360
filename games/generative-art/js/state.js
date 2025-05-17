/**
 * state.js - Centralized state management for the Generative Art Studio
 * Handles application state, state updates, and state persistence
 */

import { artStyles } from './styles.js';
import { saveToHistory } from './history.js';

// Default state values
const defaultState = {
    // Core parameters
    currentArtStyle: artStyles.DEFAULT,
    numShapes: 100,
    lineWidth: 1,
    backgroundColor: '#ffffff',
    colorTheme: 'random',
    baseHue: 180,
    saturation: 70,
    lightness: 50,
    seed: Math.floor(Math.random() * 1000000),
    
    // Canvas dimensions
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    
    // Animation settings
    animationEnabled: false,
    animationSpeed: 50,
    interactiveMode: false,
    adaptiveQuality: true,
    
    // Layer opacity settings
    voronoiOpacity: 0.7,
    organicSplattersOpacity: 0.6,
    neonWavesOpacity: 0.5,
    fractalLinesOpacity: 0.6,
    geometricGridOpacity: 0.7,
    particleSwarmOpacity: 0.7,
    organicNoiseOpacity: 0.5,
    glitchMosaicOpacity: 0.6,
    pixelSortOpacity: 0.7,
    gradientOverlayOpacity: 0.3,
    dotMatrixOpacity: 0.6,
    textureOverlayOpacity: 0.4,
    symmetricalPatternsOpacity: 0.7,
    flowingLinesOpacity: 0.6,
    
    // Layer density settings
    voronoiDensity: 50,
    organicSplattersDensity: 50,
    neonWavesDensity: 50,
    fractalLinesDensity: 50,
    dotMatrixDensity: 50,
    flowingLinesDensity: 50,
    symmetricalPatternsDensity: 50,
    
    // Advanced settings
    blendMode: 'normal',
    colorShiftAmount: 0,
    scaleAmount: 1,
    rotationAmount: 0
};

// Current application state
let appState = { ...defaultState };

// Event listeners for state changes
const stateChangeListeners = [];

/**
 * Get the current application state
 * @returns {Object} The current application state
 */
function getState() {
    return { ...appState };
}

/**
 * Update the application state
 * @param {Object} newState - Partial state to update
 * @param {boolean} recordHistory - Whether to record this state change in history
 * @param {boolean} notifyListeners - Whether to notify state change listeners
 * @returns {Object} The updated state
 */
function updateState(newState, recordHistory = true, notifyListeners = true) {
    // Create a new state object by merging the current state with the new state
    const previousState = { ...appState };
    appState = { ...appState, ...newState };
    
    // Record in history if requested
    if (recordHistory) {
        saveToHistory(getState());
    }
    
    // Notify listeners if requested
    if (notifyListeners) {
        notifyStateChangeListeners(previousState, appState);
    }
    
    return appState;
}

/**
 * Reset the application state to default values
 * @param {boolean} recordHistory - Whether to record this state change in history
 * @returns {Object} The reset state
 */
function resetState(recordHistory = true) {
    // Generate a new random seed
    const newDefaultState = { 
        ...defaultState,
        seed: Math.floor(Math.random() * 1000000)
    };
    
    return updateState(newDefaultState, recordHistory);
}

/**
 * Add a listener for state changes
 * @param {Function} listener - Function to call when state changes
 * @returns {Function} Function to remove the listener
 */
function addStateChangeListener(listener) {
    stateChangeListeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
        const index = stateChangeListeners.indexOf(listener);
        if (index !== -1) {
            stateChangeListeners.splice(index, 1);
        }
    };
}

/**
 * Notify all state change listeners
 * @param {Object} previousState - The previous state
 * @param {Object} currentState - The current state
 */
function notifyStateChangeListeners(previousState, currentState) {
    stateChangeListeners.forEach(listener => {
        try {
            listener(previousState, currentState);
        } catch (error) {
            console.error('Error in state change listener:', error);
        }
    });
}

/**
 * Save the current state to localStorage
 */
function saveStateToStorage() {
    try {
        localStorage.setItem('generativeArtState', JSON.stringify(appState));
    } catch (error) {
        console.error('Error saving state to localStorage:', error);
    }
}

/**
 * Load state from localStorage
 * @param {boolean} recordHistory - Whether to record this state change in history
 * @returns {Object} The loaded state or null if no saved state exists
 */
function loadStateFromStorage(recordHistory = false) {
    try {
        const savedState = localStorage.getItem('generativeArtState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            updateState(parsedState, recordHistory);
            return appState;
        }
    } catch (error) {
        console.error('Error loading state from localStorage:', error);
    }
    return null;
}

/**
 * Apply state from URL parameters
 * @param {URLSearchParams} params - URL search parameters
 * @param {boolean} recordHistory - Whether to record this state change in history
 * @returns {Object} The updated state
 */
function applyStateFromUrlParams(params, recordHistory = true) {
    const newState = {};
    
    // Process URL parameters and update state
    for (const [key, value] of params.entries()) {
        // Only update if the key exists in our state
        if (key in appState) {
            // Convert value to appropriate type
            if (typeof appState[key] === 'number') {
                newState[key] = parseFloat(value);
            } else if (typeof appState[key] === 'boolean') {
                newState[key] = value === 'true';
            } else {
                newState[key] = value;
            }
        }
    }
    
    return updateState(newState, recordHistory);
}

/**
 * Generate a URL with the current state as parameters
 * @returns {string} URL with state parameters
 */
function generateStateUrl() {
    const url = new URL(window.location.href);
    url.search = ''; // Clear existing parameters
    
    // Add each state property as a URL parameter
    Object.entries(appState).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    
    return url.toString();
}

// Export the state management functions
export {
    getState,
    updateState,
    resetState,
    addStateChangeListener,
    saveStateToStorage,
    loadStateFromStorage,
    applyStateFromUrlParams,
    generateStateUrl
};
