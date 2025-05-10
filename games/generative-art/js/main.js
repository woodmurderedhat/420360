/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization and core functionality
 */

import { generatePalette } from './palette.js';
import { artStyles, drawGeometricGrid, drawOrganicNoise } from './styles.js';
import { drawFractalLines, drawParticleSwarm, drawOrganicSplatters } from './styles-advanced.js';
import { drawGlitchMosaic, drawNeonWaves, drawPixelSort } from './styles-experimental.js';
import { drawVoronoiCells } from './styles-more.js';
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
    currentArtStyle: artStyles.GEOMETRIC_GRID,
    numShapes: +numShapesInput.value,
    lineWidth: +lineWidthInput.value,
    backgroundColor: backgroundColorPicker ? backgroundColorPicker.value : '#ffffff',
    colorTheme: colorThemeSelector ? colorThemeSelector.value : 'random',
    baseHue: baseHueInput ? +baseHueInput.value : 180,
    saturation: saturationInput ? +saturationInput.value : 70,
    lightness: lightnessInput ? +lightnessInput.value : 50
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
                numShapes: appState.numShapes
            };

            // Draw based on selected style
            switch (style) {
                case artStyles.DEFAULT:
                    drawDefaultMasterpiece(ctx, palette, false, params);
                    break;
                case artStyles.GEOMETRIC_GRID:
                    drawGeometricGrid(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_NOISE:
                    drawOrganicNoise(ctx, palette, false, params);
                    break;
                case artStyles.FRACTAL_LINES:
                    drawFractalLines(ctx, palette, false, params);
                    break;
                case artStyles.PARTICLE_SWARM:
                    drawParticleSwarm(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_SPLATTERS:
                    drawOrganicSplatters(ctx, palette, false, params);
                    break;
                case artStyles.GLITCH_MOSAIC:
                    drawGlitchMosaic(ctx, palette, false, params);
                    break;
                case artStyles.NEON_WAVES:
                    drawNeonWaves(ctx, palette, false, params);
                    break;
                case artStyles.PIXEL_SORT:
                    drawPixelSort(ctx, palette, false, params);
                    break;
                case artStyles.VORONOI_CELLS:
                    drawVoronoiCells(ctx, palette, false, params);
                    break;
            }
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
        isInteractive: interactiveToggle ? interactiveToggle.checked : false
    };
}

/**
 * Apply a state to the application
 * @param {Object} state - The state to apply
 */
function applyAppState(state) {
    if (!state) return;

    // Update app state
    if (state.style && Object.values(artStyles).includes(state.style)) {
        appState.currentArtStyle = state.style;
    }

    if (state.numShapes) {
        appState.numShapes = +state.numShapes;
    }

    if (state.lineWidth) {
        appState.lineWidth = +state.lineWidth;
    }

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
