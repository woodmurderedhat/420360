/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization and core functionality
 */

import { generatePalette, clearPaletteCache, getPaletteCacheStats } from './palette.js';
import { artStyles } from './styles.js';
import { drawDefaultMasterpiece } from './styles-default.js';
import { initAnimation } from './animation.js';
import { initWorkers } from './worker-manager.js';
import { saveToHistory, updateHistoryButtons } from './history.js';
import { handleError, ErrorType, ErrorSeverity } from './error-service.js';
import {
    getState,
    updateState,
    resetState,
    loadStateFromStorage,
    applyStateFromUrlParams
} from './state.js';
import { setSeed } from './utils.js';

// Import the new UI module
import * as UI from './ui/index.js';

// Use centralized state management instead of local appState object

/**
 * Initialize the canvas dimensions and sets up event listeners.
 */
function initCanvas() {
    try {
        // Get canvas and context from UI module
        const canvas = UI.getElement('canvas');
        const ctx = UI.getElement('ctx');

        if (!canvas || !ctx) {
            handleError(
                new Error('Canvas or context not found'),
                ErrorType.RENDERING,
                ErrorSeverity.ERROR,
                { component: 'initCanvas', message: 'Canvas elements not found in the DOM' }
            );
            return;
        }

        // Reset any existing transformations to avoid cumulative scaling
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const dpr = window.devicePixelRatio || 1;

        // Get current state
        const state = getState();

        // Use custom dimensions if provided, otherwise fill viewport
        const canvasWidthInput = UI.getElement('canvasWidthInput');
        const canvasHeightInput = UI.getElement('canvasHeightInput');

        const w = (canvasWidthInput && +canvasWidthInput.value) || window.innerWidth;
        const h = (canvasHeightInput && +canvasHeightInput.value) || window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.scale(dpr, dpr);

        // Set background color
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(0, 0, w, h);

        drawArtwork(state.currentArtStyle);
    } catch (error) {
        handleError(error, ErrorType.RENDERING, ErrorSeverity.ERROR, {
            component: 'initCanvas',
            message: 'Error initializing canvas'
        });
    }
}

/**
 * Draw artwork based on the selected style
 * @param {string} style - The art style to draw
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function drawArtwork(style, showLoading = true) {
    try {
        // Clear palette cache when style changes from the current one
        const currentState = getState();
        if (currentState.currentArtStyle !== style) {
            clearPaletteCache();
        }

        // Show loading indicator for complex styles
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (showLoading && loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }

        // Use requestAnimationFrame to ensure loading indicator is displayed
        requestAnimationFrame(() => {
            try {
                // Get canvas and context from UI module
                const canvas = UI.getElement('canvas');
                const ctx = UI.getElement('ctx');

                if (!canvas || !ctx) {
                    throw new Error('Canvas or context not found');
                }

                // Get current state
                const state = getState();

                // Get canvas dimensions
                const width = canvas.width / (window.devicePixelRatio || 1);
                const height = canvas.height / (window.devicePixelRatio || 1);

                // Clear canvas and set background
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = state.backgroundColor;
                ctx.fillRect(0, 0, width, height);

                // Apply global line width
                ctx.lineWidth = state.lineWidth;

                // Generate palette
                const palette = generatePalette(
                    style,
                    state.colorTheme,
                    state.baseHue,
                    state.saturation,
                    state.lightness
                );

                // Common parameters for all styles - pass the entire state as params
                // This simplifies the code and ensures all parameters are available
                const params = {
                    ...state,
                    width,
                    height,
                    isAnimationFrame: false
                };

                // Always draw the Default Masterpiece style
                // Pass all parameters to ensure all UI settings affect the style
                drawDefaultMasterpiece(ctx, palette, false, params);

                // Update state with the current art style
                if (currentState.currentArtStyle !== style) {
                    updateState({ currentArtStyle: style });
                }
            } catch (error) {
                handleError(error, ErrorType.RENDERING, ErrorSeverity.ERROR, {
                    component: 'drawArtwork',
                    style,
                    message: 'Error drawing artwork'
                });
            } finally {
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        });
    } catch (error) {
        handleError(error, ErrorType.RENDERING, ErrorSeverity.ERROR, {
            component: 'drawArtwork',
            style,
            message: 'Error preparing to draw artwork'
        });
    }
}

/**
 * Get the current application state
 * @returns {Object} The current state
 */
function getCurrentAppState() {
    try {
        // Get the base state from our state management
        const state = getState();

        // Override with any current UI values that might not be in state yet
        return {
            ...state,
            style: state.currentArtStyle,
            numShapes: UI.getValue('numShapesInput') ?? state.numShapes,
            lineWidth: UI.getValue('lineWidthInput') ?? state.lineWidth,
            canvasWidth: UI.getValue('canvasWidthInput') ?? state.canvasWidth,
            canvasHeight: UI.getValue('canvasHeightInput') ?? state.canvasHeight,
            seed: UI.getValue('seedInput') ?? state.seed,
            colorTheme: UI.getValue('colorThemeSelector') ?? state.colorTheme,
            baseHue: UI.getValue('baseHueInput') ?? state.baseHue,
            saturation: UI.getValue('saturationInput') ?? state.saturation,
            lightness: UI.getValue('lightnessInput') ?? state.lightness,
            backgroundColor: UI.getValue('backgroundColorPicker') ?? state.backgroundColor,
            isAnimating: UI.getValue('animationToggle') ?? state.animationEnabled,
            animationSpeed: UI.getValue('animationSpeedInput') ?? state.animationSpeed,
            isInteractive: UI.getValue('interactiveToggle') ?? state.interactiveMode
        };
    } catch (error) {
        handleError(error, ErrorType.STATE, ErrorSeverity.WARNING, {
            component: 'getCurrentAppState',
            message: 'Error getting current application state'
        });

        // Return the base state if there's an error
        return getState();
    }
}

/**
 * Apply a state to the application
 * @param {Object} state - The state to apply
 */
function applyAppState(state) {
    if (!state) return;

    // Create a new state object with properly typed values
    const newState = {};

    // Map style to currentArtStyle if needed
    if (state.style && Object.values(artStyles).includes(state.style)) {
        newState.currentArtStyle = state.style;
    }

    // Process numeric values
    const numericProps = [
        'numShapes', 'lineWidth', 'baseHue', 'saturation', 'lightness',
        'voronoiOpacity', 'organicSplattersOpacity', 'neonWavesOpacity',
        'fractalLinesOpacity', 'geometricGridOpacity', 'particleSwarmOpacity',
        'organicNoiseOpacity', 'glitchMosaicOpacity', 'pixelSortOpacity',
        'gradientOverlayOpacity', 'dotMatrixOpacity', 'textureOverlayOpacity',
        'symmetricalPatternsOpacity', 'flowingLinesOpacity',
        'voronoiDensity', 'organicSplattersDensity', 'neonWavesDensity',
        'fractalLinesDensity', 'dotMatrixDensity', 'flowingLinesDensity',
        'symmetricalPatternsDensity', 'colorShiftAmount', 'scaleAmount',
        'rotationAmount', 'animationSpeed'
    ];

    numericProps.forEach(prop => {
        if (state[prop] !== undefined) {
            newState[prop] = +state[prop];
        }
    });

    // Process string values
    const stringProps = [
        'colorTheme', 'backgroundColor', 'blendMode'
    ];

    stringProps.forEach(prop => {
        if (state[prop] !== undefined) {
            newState[prop] = state[prop];
        }
    });

    // Process boolean values
    if (state.isAnimating !== undefined) {
        newState.animationEnabled = state.isAnimating === true || state.isAnimating === 'true';
    }

    if (state.isInteractive !== undefined) {
        newState.interactiveMode = state.isInteractive === true || state.isInteractive === 'true';
    }

    if (state.adaptiveQuality !== undefined) {
        newState.adaptiveQuality = state.adaptiveQuality === true || state.adaptiveQuality === 'true';
    }

    // Update the state
    updateState(newState);
}

/**
 * Log palette cache statistics to the console
 * Useful for debugging and performance monitoring
 */
function logPaletteCacheStats() {
    const stats = getPaletteCacheStats();
    console.log('Palette Cache Statistics:', stats);
    console.log(`Cache Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    console.log(`Cache Size: ${stats.size}/${stats.maxSize}`);
    console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);
}

// Add palette cache stats to window for debugging
window.logPaletteCacheStats = logPaletteCacheStats;

// Initialize the application
window.addEventListener('load', () => {
    try {
        // Initialize UI module
        const uiInitialized = UI.initialize({
            drawArtwork,
            initCanvas,
            getCurrentAppState,
            applyAppState
        });

        if (!uiInitialized) {
            throw new Error('Failed to initialize UI module');
        }

        // Get canvas element
        const canvas = UI.getElement('canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Initialize animation
        initAnimation(canvas);

        // Initialize web workers for background processing
        initWorkers();

        // Load settings from storage
        loadStateFromStorage();

        // Apply URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size > 0) {
            applyStateFromUrlParams(urlParams);
        }

        // Initialize seed with current state
        const state = getState();
        if (state.seed) {
            setSeed(state.seed.toString());
        }

        // Initialize canvas
        initCanvas();

        // Save initial state to history
        saveToHistory(getCurrentAppState());
        updateHistoryButtons();

        // Register event handlers for UI events
        UI.triggerEvent('registerHandlers', {
            drawArtwork,
            initCanvas,
            getCurrentAppState,
            applyAppState
        });

        console.log('Application initialized successfully');
    } catch (error) {
        handleError(error, ErrorType.INITIALIZATION, ErrorSeverity.CRITICAL, {
            component: 'main',
            message: 'Error initializing application'
        });

        // Show error message to user
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error Initializing Application</h3>
                    <p>${error.message}</p>
                    <p>Please try refreshing the page. If the problem persists, contact support.</p>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }
});
