/**
 * saveSettings.js - Save settings functionality for the Generative Art Studio
 */

import {
    settingsKey,
    numShapes,
    lineWidth,
    canvasWidthInput,
    canvasHeightInput,
    seedInput,
    currentArtStyle,
    colorTheme,
    baseHue,
    saturation,
    lightness,
    backgroundColor,
    animationToggle,
    animationSpeedInput,
    interactiveToggle
} from './state.js';

/**
 * Save current settings to local storage
 */
function saveSettings() {
    const settings = {
        numShapes,
        lineWidth,
        canvasWidth: canvasWidthInput.value,
        canvasHeight: canvasHeightInput.value,
        seed: seedInput.value || null,
        style: currentArtStyle,
        colorTheme,
        baseHue,
        saturation,
        lightness,
        backgroundColor,
        isAnimating: animationToggle ? animationToggle.checked : false,
        animationSpeed: animationSpeedInput ? +animationSpeedInput.value : 50,
        isInteractive: interactiveToggle ? interactiveToggle.checked : false
    };

    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export { saveSettings };
