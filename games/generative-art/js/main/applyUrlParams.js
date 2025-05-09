/**
 * applyUrlParams.js - Apply URL parameters for the Generative Art Studio
 */

import { artStyles } from '../styles/index.js';
import { saveToHistory } from '../history.js';
import { colorThemeSelector, baseHueInput, saturationInput, lightnessInput, backgroundColorPicker } from './state.js';
import { applyAppState } from './applyAppState.js';
import { getCurrentAppState } from './getCurrentAppState.js';

/**
 * Apply settings from URL query parameters if present for shareable links.
 */
function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let updated = false;
    const state = {};

    if (params.has('style')) {
        const style = params.get('style');
        if (Object.values(artStyles).includes(style)) {
            state.style = style;
            updated = true;
        }
    }

    if (params.has('numShapes')) {
        state.numShapes = params.get('numShapes');
        updated = true;
    }

    if (params.has('lineWidth')) {
        state.lineWidth = params.get('lineWidth');
        updated = true;
    }

    if (params.has('width')) {
        state.canvasWidth = params.get('width');
        updated = true;
    }

    if (params.has('height')) {
        state.canvasHeight = params.get('height');
        updated = true;
    }

    if (params.has('seed')) {
        state.seed = params.get('seed');
        updated = true;
    }

    if (params.has('colorTheme') && colorThemeSelector) {
        state.colorTheme = params.get('colorTheme');
        updated = true;
    }

    if (params.has('baseHue') && baseHueInput) {
        state.baseHue = params.get('baseHue');
        updated = true;
    }

    if (params.has('saturation') && saturationInput) {
        state.saturation = params.get('saturation');
        updated = true;
    }

    if (params.has('lightness') && lightnessInput) {
        state.lightness = params.get('lightness');
        updated = true;
    }

    if (params.has('bg') && backgroundColorPicker) {
        state.backgroundColor = '#' + params.get('bg');
        updated = true;
    }

    if (updated) {
        applyAppState(state);

        // Save initial state to history
        saveToHistory(getCurrentAppState());
    }
}

export { applyUrlParams };
