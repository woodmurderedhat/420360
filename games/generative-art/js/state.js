/**
 * state.js - Centralized state management for the Generative Art Studio
 * Handles application state, state updates, and state persistence
 */

import { artStyles } from './styles.js';

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
    lightRaysOpacity: 0.4,

    // Layer density settings
    voronoiDensity: 50,
    organicSplattersDensity: 50,
    neonWavesDensity: 50,
    fractalLinesDensity: 50,
    dotMatrixDensity: 50,
    flowingLinesDensity: 50,
    symmetricalPatternsDensity: 50,
    lightRaysDensity: 50,

    // Advanced settings
    blendMode: 'normal',
    colorShiftAmount: 0,
    scaleAmount: 1,
    rotationAmount: 0,

    // Light Rays settings
    lightRaysIntensity: 0.7,
    lightRaysDirection: 45,
    lightRaysSpread: 60
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
 * @param {boolean} notifyListeners - Whether to notify state change listeners
 * @returns {Object} The updated state
 */
function updateState(newState, notifyListeners = true) {
    // Create a new state object by merging the current state with the new state
    const previousState = { ...appState };
    appState = { ...appState, ...newState };

    // Notify listeners if requested
    if (notifyListeners) {
        notifyStateChangeListeners(previousState, appState);
    }

    return appState;
}

/**
 * Reset the application state to default values
 * @param {boolean} notifyListeners - Whether to notify state change listeners
 * @returns {Object} The reset state
 */
function resetState(notifyListeners = true) {
    // Generate a new random seed
    const newDefaultState = {
        ...defaultState,
        seed: Math.floor(Math.random() * 1000000),
        // Randomize layer opacities for more varied art styles
        voronoiOpacity: Math.random() * 0.9,
        organicSplattersOpacity: Math.random() * 0.9,
        neonWavesOpacity: Math.random() * 0.9,
        fractalLinesOpacity: Math.random() * 0.9,
        geometricGridOpacity: Math.random() * 0.9,
        particleSwarmOpacity: Math.random() * 0.9,
        organicNoiseOpacity: Math.random() * 0.9,
        glitchMosaicOpacity: Math.random() * 0.9,
        pixelSortOpacity: Math.random() * 0.9,
        gradientOverlayOpacity: Math.random() * 0.5, // Lower max for overlay effects
        dotMatrixOpacity: Math.random() * 0.9,
        textureOverlayOpacity: Math.random() * 0.6, // Lower max for overlay effects
        symmetricalPatternsOpacity: Math.random() * 0.9,
        flowingLinesOpacity: Math.random() * 0.9,
        lightRaysOpacity: Math.random() * 0.7, // Lower max for light effects

        // Randomize layer densities for more varied art styles
        voronoiDensity: 20 + Math.random() * 80,
        organicSplattersDensity: 20 + Math.random() * 80,
        neonWavesDensity: 20 + Math.random() * 80,
        fractalLinesDensity: 20 + Math.random() * 80,
        geometricGridDensity: 20 + Math.random() * 80,
        particleSwarmDensity: 20 + Math.random() * 80,
        organicNoiseDensity: 20 + Math.random() * 80,
        glitchMosaicDensity: 20 + Math.random() * 80,
        pixelSortDensity: 20 + Math.random() * 80,
        dotMatrixDensity: 20 + Math.random() * 80,
        textureOverlayDensity: 20 + Math.random() * 80,
        symmetricalPatternsDensity: 20 + Math.random() * 80,
        flowingLinesDensity: 20 + Math.random() * 80,
        lightRaysDensity: 20 + Math.random() * 80
    };

    return updateState(newDefaultState, notifyListeners);
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
 * @returns {Object} The loaded state or null if no saved state exists
 */
function loadStateFromStorage() {
    try {
        const savedState = localStorage.getItem('generativeArtState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            updateState(parsedState);
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
 * @returns {Object} The updated state
 */
function applyStateFromUrlParams(params) {
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

    return updateState(newState);
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
