/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization and core functionality
 */

import { generatePalette, clearPaletteCache } from './palette.js';
import { drawDefaultMasterpiece } from './styles-default.js';
import { getState, updateState, loadStateFromStorage, applyStateFromUrlParams } from './state.js';
import { handleError, ErrorType, ErrorSeverity } from './error-service.js';
import { setSeed } from './utils.js';

// Import the UI module
import * as UI from './ui/index.js';

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
        const w = window.innerWidth; // Simplified to always use window inner dimensions
        const h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.scale(dpr, dpr);

        // Set background color
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(0, 0, w, h);

        drawArtwork(); // Simplified, style is implicit (default)
    } catch (error) {
        handleError(error, ErrorType.RENDERING, ErrorSeverity.ERROR, {
            component: 'initCanvas',
            message: 'Error initializing canvas'
        });
    }
}

/**
 * Draw artwork based on the selected style with enhanced randomization
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function drawArtwork(showLoading = true) { // Removed style parameter
    try {
        // Clear palette cache (always, as style is now fixed or implicit)
        clearPaletteCache();

        // Show loading indicator
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

                // Randomize layer opacities and densities for more varied results
                // Only do this if we're not using a specific seed for reproducibility
                const randomizedState = {
                    // Randomize layer opacities
                    voronoiOpacity: Math.random() * 0.9,
                    organicSplattersOpacity: Math.random() * 0.9,
                    neonWavesOpacity: Math.random() * 0.9,
                    fractalLinesOpacity: Math.random() * 0.9,
                    geometricGridOpacity: Math.random() * 0.9,
                    particleSwarmOpacity: Math.random() * 0.9,
                    organicNoiseOpacity: Math.random() * 0.9,
                    glitchMosaicOpacity: Math.random() * 0.9,
                    pixelSortOpacity: Math.random() * 0.9,
                    gradientOverlayOpacity: Math.random() * 0.5,
                    dotMatrixOpacity: Math.random() * 0.9,
                    textureOverlayOpacity: Math.random() * 0.6,
                    symmetricalPatternsOpacity: Math.random() * 0.9,
                    flowingLinesOpacity: Math.random() * 0.9,
                    lightRaysOpacity: Math.random() * 0.7,

                    // Randomize layer densities
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
                    lightRaysDensity: 20 + Math.random() * 80,

                    // Randomize other parameters
                    lineWidth: 0.5 + Math.random() * 2.5, // 0.5 to 3.0
                    blendMode: ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten'][Math.floor(Math.random() * 6)],
                    colorShiftAmount: Math.random() * 60 - 30, // -30 to +30
                    scaleAmount: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
                    rotationAmount: Math.random() * 360 // 0 to 360
                };

                // Update state with randomized values
                updateState(randomizedState, false); // Don't notify listeners to avoid UI updates

                // Get current state after updates
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

                // Generate palette with more randomness
                const palette = generatePalette(
                    state.currentArtStyle,
                    state.colorTheme,
                    state.baseHue,
                    state.saturation,
                    state.lightness
                );

                // Common parameters for all styles - pass the entire state as params
                const params = {
                    ...state,
                    width,
                    height,
                    isAnimationFrame: false, // Animation removed
                    randomSeed: Math.random() * 1000000, // Additional random seed for more variation
                    randomFactor: Math.random() // Generic random factor for layers to use
                };

                // Always draw the Default Masterpiece style
                drawDefaultMasterpiece(ctx, palette, false, params);

            } catch (error) {
                handleError(error, ErrorType.RENDERING, ErrorSeverity.ERROR, {
                    component: 'drawArtwork',
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
            message: 'Error preparing to draw artwork'
        });
    }
}

// Initialize the application
window.addEventListener('load', () => {
    try {
        // Initialize UI module
        const uiInitialized = UI.initialize({
            drawArtwork,
            initCanvas
        });

        if (!uiInitialized) {
            throw new Error('Failed to initialize UI module');
        }

        // Get canvas element
        const canvas = UI.getElement('canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Load settings from storage (might only be seed now)
        loadStateFromStorage();

        // Apply URL parameters (might only be seed now)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size > 0) {
            applyStateFromUrlParams(urlParams);
        }

        // Initialize seed with current state
        const state = getState();
        if (state.seed) {
            setSeed(state.seed.toString());
        } else {
            // If no seed in state (e.g. first load), generate a random one
            const randomSeed = Date.now().toString();
            setSeed(randomSeed);
            updateState({ seed: randomSeed });
            UI.setValue('seedInput', randomSeed); // Update UI if seedInput exists
        }

        // Initialize canvas
        initCanvas();

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
