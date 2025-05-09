/**
 * applyAppState.js - Apply application state for the Generative Art Studio
 */

import { artStyles } from '../styles/index.js';
import {
    currentArtStyle,
    styleSelector,
    currentStyleDisplaySpan,
    numShapesInput,
    numShapesDisplay,
    lineWidthInput,
    lineWidthDisplay,
    canvasWidthInput,
    canvasHeightInput,
    seedInput,
    currentSeedDisplay,
    colorThemeSelector,
    colorTheme,
    customColorControls,
    baseHueInput,
    baseHueDisplay,
    saturationInput,
    saturationDisplay,
    lightnessInput,
    lightnessDisplay,
    backgroundColorPicker,
    applySettingsBtn
} from './state.js';

/**
 * Apply a state to the application
 * @param {Object} state - The state to apply
 */
function applyAppState(state) {
    if (!state) return;

    // Update UI elements
    if (state.style && Object.values(artStyles).includes(state.style)) {
        currentArtStyle = state.style;
        styleSelector.value = state.style;
        currentStyleDisplaySpan.textContent = state.style;
    }

    if (state.numShapes) {
        numShapesInput.value = state.numShapes;
        numShapesDisplay.textContent = state.numShapes;
    }

    if (state.lineWidth) {
        lineWidthInput.value = state.lineWidth;
        lineWidthDisplay.textContent = state.lineWidth;
    }

    if (state.canvasWidth) {
        canvasWidthInput.value = state.canvasWidth;
    }

    if (state.canvasHeight) {
        canvasHeightInput.value = state.canvasHeight;
    }

    if (state.seed !== undefined) {
        seedInput.value = state.seed || '';
        currentSeedDisplay.textContent = state.seed || 'random';
    }

    if (state.colorTheme && colorThemeSelector) {
        colorThemeSelector.value = state.colorTheme;
        colorTheme = state.colorTheme;

        if (customColorControls) {
            customColorControls.style.display = state.colorTheme === 'custom' ? 'block' : 'none';
        }
    }

    if (state.baseHue !== undefined && baseHueInput) {
        baseHueInput.value = state.baseHue;
        if (baseHueDisplay) baseHueDisplay.textContent = state.baseHue;
    }

    if (state.saturation !== undefined && saturationInput) {
        saturationInput.value = state.saturation;
        if (saturationDisplay) saturationDisplay.textContent = state.saturation;
    }

    if (state.lightness !== undefined && lightnessInput) {
        lightnessInput.value = state.lightness;
        if (lightnessDisplay) lightnessDisplay.textContent = state.lightness;
    }

    if (state.backgroundColor && backgroundColorPicker) {
        backgroundColorPicker.value = state.backgroundColor;
    }

    // Apply the state
    applySettingsBtn.click();
}

export { applyAppState };
