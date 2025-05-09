/**
 * index.js - Re-exports all main functionality from the main directory
 * This file makes it easier to import all main functions from a single location
 */

// Import and re-export application state
import {
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
    canvasHeightInput
} from './state.js';

// Import and re-export main functions
import { initCanvas } from './initCanvas.js';
import { drawArtwork } from './drawArtwork.js';
import { loadSettings } from './loadSettings.js';
import { saveSettings } from './saveSettings.js';
import { getCurrentAppState } from './getCurrentAppState.js';
import { applyAppState } from './applyAppState.js';
import { applyUrlParams } from './applyUrlParams.js';
import { setupUI } from './setupUI.js';
import { openGallery } from './openGallery.js';
import { toggleFullscreen } from './toggleFullscreen.js';
import { handleFullscreenChange } from './handleFullscreenChange.js';

// Export all main functionality
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
