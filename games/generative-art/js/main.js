/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization, UI setup, and event handling
 * Re-exports functionality from the main folder
 */

// Import all functionality from the main folder
import {
    // State
    canvas,
    ctx,
    currentArtStyle,
    numShapes,
    lineWidth,
    backgroundColor,
    colorTheme,
    baseHue,
    saturation,
    lightness,
    canvasWidthInput,
    canvasHeightInput,

    // Functions
    initCanvas,
    drawArtwork,
    loadSettings,
    saveSettings,
    getCurrentAppState,
    applyAppState,
    applyUrlParams,
    setupUI,
    openGallery,
    toggleFullscreen,
    handleFullscreenChange
} from './main/index.js';

// Import additional functionality needed for initialization
import { initAnimation } from './animation/index.js';
import { saveToHistory, updateHistoryButtons } from './history.js';

// Re-export all functionality
export {
    // State
    canvas,
    ctx,
    currentArtStyle,
    numShapes,
    lineWidth,
    backgroundColor,
    colorTheme,
    baseHue,
    saturation,
    lightness,
    canvasWidthInput,
    canvasHeightInput,

    // Functions
    initCanvas,
    drawArtwork,
    loadSettings,
    saveSettings,
    getCurrentAppState,
    applyAppState,
    applyUrlParams,
    setupUI,
    openGallery,
    toggleFullscreen,
    handleFullscreenChange
};



// Initialize the application
window.addEventListener('load', () => {
    // Set up UI
    setupUI();

    // Initialize animation
    initAnimation(canvas);

    // Load settings
    loadSettings();

    // Apply URL parameters
    applyUrlParams();

    // Initialize canvas
    initCanvas();

    // Set up fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Save initial state to history
    saveToHistory(getCurrentAppState());
    updateHistoryButtons();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Only resize if custom dimensions are not set
    if (!canvasWidthInput.value && !canvasHeightInput.value) {
        initCanvas();
    }
});
