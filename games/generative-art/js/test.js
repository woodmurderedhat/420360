/**
 * test.js - Test script to verify that main.js is working correctly
 */

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
} from './main.js';

// Log imported values to verify they're working
console.log('Test script loaded successfully');
console.log('Canvas:', canvas);
console.log('Current Art Style:', currentArtStyle);
console.log('numShapes:', numShapes);
console.log('lineWidth:', lineWidth);
console.log('backgroundColor:', backgroundColor);
console.log('colorTheme:', colorTheme);
console.log('baseHue:', baseHue);
console.log('saturation:', saturation);
console.log('lightness:', lightness);
console.log('canvasWidthInput:', canvasWidthInput);
console.log('canvasHeightInput:', canvasHeightInput);

// Test that functions are imported correctly
console.log('initCanvas function:', typeof initCanvas === 'function');
console.log('drawArtwork function:', typeof drawArtwork === 'function');
console.log('loadSettings function:', typeof loadSettings === 'function');
console.log('saveSettings function:', typeof saveSettings === 'function');
console.log('getCurrentAppState function:', typeof getCurrentAppState === 'function');
console.log('applyAppState function:', typeof applyAppState === 'function');
console.log('applyUrlParams function:', typeof applyUrlParams === 'function');
console.log('setupUI function:', typeof setupUI === 'function');
console.log('openGallery function:', typeof openGallery === 'function');
console.log('toggleFullscreen function:', typeof toggleFullscreen === 'function');
console.log('handleFullscreenChange function:', typeof handleFullscreenChange === 'function');
