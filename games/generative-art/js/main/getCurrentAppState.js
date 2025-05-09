/**
 * getCurrentAppState.js - Get current application state for the Generative Art Studio
 */

import {
    currentArtStyle,
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
    interactiveToggle
} from './state.js';

/**
 * Get the current application state
 * @returns {Object} The current state
 */
function getCurrentAppState() {
    return {
        style: currentArtStyle,
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

export { getCurrentAppState };
