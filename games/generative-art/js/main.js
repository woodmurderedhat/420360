/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization and core functionality
 */

import { generatePalette } from './palette.js';
import { artStyles } from './styles.js';
import { drawDefaultMasterpiece } from './styles-default.js';
import { initAnimation } from './animation.js';
import { saveToHistory, updateHistoryButtons } from './history.js';
import {
    canvas,
    ctx,
    numShapesInput,
    lineWidthInput,
    canvasWidthInput,
    canvasHeightInput,
    seedInput,
    colorThemeSelector,
    baseHueInput,
    saturationInput,
    lightnessInput,
    backgroundColorPicker,
    animationToggle,
    animationSpeedInput,
    interactiveToggle,
    setupUI,
    loadSettings,
    applyUrlParams,
    setupKeyboardShortcuts,
    setupShareLink,
    setupColorThemeControls,
    setupAnimationControls,
    setupSliderDisplays,
    setupGalleryModalControls,
    setupFullscreenButton,
    setupHistoryControls,
    setupWindowResize,
    setupFullscreenChangeListeners
} from './uimodule.js';

// Application state
const appState = {
    currentArtStyle: artStyles.DEFAULT,
    numShapes: +numShapesInput.value,
    lineWidth: +lineWidthInput.value,
    backgroundColor: backgroundColorPicker ? backgroundColorPicker.value : '#ffffff',
    colorTheme: colorThemeSelector ? colorThemeSelector.value : 'random',
    baseHue: baseHueInput ? +baseHueInput.value : 180,
    saturation: saturationInput ? +saturationInput.value : 70,
    lightness: lightnessInput ? +lightnessInput.value : 50,

    // Layer opacity settings
    voronoiOpacity: voronoiOpacityInput ? +voronoiOpacityInput.value : 0.4,
    organicSplattersOpacity: organicSplattersOpacityInput ? +organicSplattersOpacityInput.value : 0.3,
    neonWavesOpacity: neonWavesOpacityInput ? +neonWavesOpacityInput.value : 0.6,
    fractalLinesOpacity: fractalLinesOpacityInput ? +fractalLinesOpacityInput.value : 0.7,
    geometricGridOpacity: geometricGridOpacityInput ? +geometricGridOpacityInput.value : 0.6,
    particleSwarmOpacity: particleSwarmOpacityInput ? +particleSwarmOpacityInput.value : 0.5,
    organicNoiseOpacity: organicNoiseOpacityInput ? +organicNoiseOpacityInput.value : 0.3,
    glitchMosaicOpacity: glitchMosaicOpacityInput ? +glitchMosaicOpacityInput.value : 0.15,
    pixelSortOpacity: pixelSortOpacityInput ? +pixelSortOpacityInput.value : 0.2,

    // Layer density settings
    voronoiDensity: voronoiDensityInput ? +voronoiDensityInput.value : 15,
    organicSplattersDensity: organicSplattersDensityInput ? +organicSplattersDensityInput.value : 10,
    neonWavesDensity: neonWavesDensityInput ? +neonWavesDensityInput.value : 5,
    fractalLinesDensity: fractalLinesDensityInput ? +fractalLinesDensityInput.value : 2
};

/**
 * Initialize the canvas dimensions and sets up event listeners.
 */
function initCanvas() {
    // Reset any existing transformations to avoid cumulative scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = window.devicePixelRatio || 1;

    // Use custom dimensions if provided, otherwise fill viewport
    const w = +canvasWidthInput.value || window.innerWidth;
    const h = +canvasHeightInput.value || window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);

    // Set background color
    ctx.fillStyle = appState.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    drawArtwork(appState.currentArtStyle);
}

/**
 * Draw artwork based on the selected style
 * @param {string} style - The art style to draw
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function drawArtwork(style, showLoading = true) {
    // Show loading indicator for complex styles
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (showLoading && loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    // Use requestAnimationFrame to ensure loading indicator is displayed
    requestAnimationFrame(() => {
        try {
            // Get canvas dimensions
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            // Clear canvas and set background
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = appState.backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Apply global line width
            ctx.lineWidth = appState.lineWidth;

            // Generate palette
            const palette = generatePalette(
                style,
                appState.colorTheme,
                appState.baseHue,
                appState.saturation,
                appState.lightness
            );

            // Common parameters for all styles
            const params = {
                width,
                height,
                lineWidth: appState.lineWidth,
                numShapes: appState.numShapes,
                backgroundColor: appState.backgroundColor,
                colorTheme: appState.colorTheme,
                baseHue: appState.baseHue,
                saturation: appState.saturation,
                lightness: appState.lightness,

                // Layer opacity settings
                voronoiOpacity: appState.voronoiOpacity,
                organicSplattersOpacity: appState.organicSplattersOpacity,
                neonWavesOpacity: appState.neonWavesOpacity,
                fractalLinesOpacity: appState.fractalLinesOpacity,
                geometricGridOpacity: appState.geometricGridOpacity,
                particleSwarmOpacity: appState.particleSwarmOpacity,
                organicNoiseOpacity: appState.organicNoiseOpacity,
                glitchMosaicOpacity: appState.glitchMosaicOpacity,
                pixelSortOpacity: appState.pixelSortOpacity,

                // Layer density settings
                voronoiDensity: appState.voronoiDensity,
                organicSplattersDensity: appState.organicSplattersDensity,
                neonWavesDensity: appState.neonWavesDensity,
                fractalLinesDensity: appState.fractalLinesDensity
            };

            // Always draw the Default Masterpiece style
            drawDefaultMasterpiece(ctx, palette, false, params);
        } catch (error) {
            console.error('Error drawing artwork:', error);
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    });
}

/**
 * Get the current application state
 * @returns {Object} The current state
 */
function getCurrentAppState() {
    return {
        style: appState.currentArtStyle,
        numShapes: +numShapesInput.value,
        lineWidth: +lineWidthInput.value,
        canvasWidth: canvasWidthInput.value,
        canvasHeight: canvasHeightInput.value,
        seed: seedInput.value,
        colorTheme: colorThemeSelector ? colorThemeSelector.value : 'random',
        baseHue: baseHueInput ? +baseHueInput.value : 180,
        saturation: saturationInput ? +saturationInput.value : 70,
        lightness: lightnessInput ? +lightnessInput.value : 50,
        backgroundColor: backgroundColorPicker ? backgroundColorPicker.value : '#ffffff',
        isAnimating: animationToggle ? animationToggle.checked : false,
        animationSpeed: animationSpeedInput ? +animationSpeedInput.value : 50,
        isInteractive: interactiveToggle ? interactiveToggle.checked : false,

        // Layer opacity settings
        voronoiOpacity: voronoiOpacityInput ? +voronoiOpacityInput.value : 0.4,
        organicSplattersOpacity: organicSplattersOpacityInput ? +organicSplattersOpacityInput.value : 0.3,
        neonWavesOpacity: neonWavesOpacityInput ? +neonWavesOpacityInput.value : 0.6,
        fractalLinesOpacity: fractalLinesOpacityInput ? +fractalLinesOpacityInput.value : 0.7,
        geometricGridOpacity: geometricGridOpacityInput ? +geometricGridOpacityInput.value : 0.6,
        particleSwarmOpacity: particleSwarmOpacityInput ? +particleSwarmOpacityInput.value : 0.5,
        organicNoiseOpacity: organicNoiseOpacityInput ? +organicNoiseOpacityInput.value : 0.3,
        glitchMosaicOpacity: glitchMosaicOpacityInput ? +glitchMosaicOpacityInput.value : 0.15,
        pixelSortOpacity: pixelSortOpacityInput ? +pixelSortOpacityInput.value : 0.2,

        // Layer density settings
        voronoiDensity: voronoiDensityInput ? +voronoiDensityInput.value : 15,
        organicSplattersDensity: organicSplattersDensityInput ? +organicSplattersDensityInput.value : 10,
        neonWavesDensity: neonWavesDensityInput ? +neonWavesDensityInput.value : 5,
        fractalLinesDensity: fractalLinesDensityInput ? +fractalLinesDensityInput.value : 2
    };
}

/**
 * Apply a state to the application
 * @param {Object} state - The state to apply
 */
function applyAppState(state) {
    if (!state) return;

    // Update app state - basic settings
    if (state.style && Object.values(artStyles).includes(state.style)) {
        appState.currentArtStyle = state.style;
    }

    if (state.numShapes) {
        appState.numShapes = +state.numShapes;
    }

    if (state.lineWidth) {
        appState.lineWidth = +state.lineWidth;
    }

    // Update color settings
    if (state.colorTheme) {
        appState.colorTheme = state.colorTheme;
    }

    if (state.baseHue !== undefined) {
        appState.baseHue = +state.baseHue;
    }

    if (state.saturation !== undefined) {
        appState.saturation = +state.saturation;
    }

    if (state.lightness !== undefined) {
        appState.lightness = +state.lightness;
    }

    if (state.backgroundColor) {
        appState.backgroundColor = state.backgroundColor;
    }

    // Update layer opacity settings
    if (state.voronoiOpacity !== undefined) {
        appState.voronoiOpacity = +state.voronoiOpacity;
    }

    if (state.organicSplattersOpacity !== undefined) {
        appState.organicSplattersOpacity = +state.organicSplattersOpacity;
    }

    if (state.neonWavesOpacity !== undefined) {
        appState.neonWavesOpacity = +state.neonWavesOpacity;
    }

    if (state.fractalLinesOpacity !== undefined) {
        appState.fractalLinesOpacity = +state.fractalLinesOpacity;
    }

    if (state.geometricGridOpacity !== undefined) {
        appState.geometricGridOpacity = +state.geometricGridOpacity;
    }

    if (state.particleSwarmOpacity !== undefined) {
        appState.particleSwarmOpacity = +state.particleSwarmOpacity;
    }

    if (state.organicNoiseOpacity !== undefined) {
        appState.organicNoiseOpacity = +state.organicNoiseOpacity;
    }

    if (state.glitchMosaicOpacity !== undefined) {
        appState.glitchMosaicOpacity = +state.glitchMosaicOpacity;
    }

    if (state.pixelSortOpacity !== undefined) {
        appState.pixelSortOpacity = +state.pixelSortOpacity;
    }

    // Update layer density settings
    if (state.voronoiDensity !== undefined) {
        appState.voronoiDensity = +state.voronoiDensity;
    }

    if (state.organicSplattersDensity !== undefined) {
        appState.organicSplattersDensity = +state.organicSplattersDensity;
    }

    if (state.neonWavesDensity !== undefined) {
        appState.neonWavesDensity = +state.neonWavesDensity;
    }

    if (state.fractalLinesDensity !== undefined) {
        appState.fractalLinesDensity = +state.fractalLinesDensity;
    }
}

// Initialize the application
window.addEventListener('load', () => {
    // Set up UI
    setupUI(appState, drawArtwork, initCanvas, getCurrentAppState, applyAppState);

    // Set up additional UI components
    const { undoButton, redoButton } = setupHistoryControls(applyAppState);
    setupKeyboardShortcuts(appState, drawArtwork, regenerateButton, exportButton, galleryButton, undoButton, redoButton);
    setupShareLink(appState);
    setupColorThemeControls(appState);
    setupAnimationControls(appState, drawArtwork);
    setupSliderDisplays();
    setupGalleryModalControls();
    setupFullscreenButton();
    setupWindowResize(initCanvas);
    setupFullscreenChangeListeners(initCanvas);

    // Initialize animation
    initAnimation(canvas);

    // Load settings
    loadSettings(appState);

    // Apply URL parameters
    applyUrlParams(appState, applyAppState, getCurrentAppState);

    // Initialize canvas
    initCanvas();

    // Save initial state to history
    saveToHistory(getCurrentAppState());
    updateHistoryButtons();
});
