/**
 * controls.js - UI controls for the Generative Art Studio
 * Handles UI control setup and interactions
 */

import { getElement, addListener, getValue } from './components.js'; // Removed getElements, setValue
import { updateState } from '../state.js'; // Removed getState
import { clearPaletteCache } from '../palette.js';

// Local storage key for settings
// const SETTINGS_KEY = 'generativeArtSettings'; // Removed

/**
 * Set up color theme controls
 */
function setupColorThemeControls() {
    const colorThemeSelector = getElement('colorThemeSelector');
    const customColorControls = getElement('customColorControls');

    if (colorThemeSelector && customColorControls) {
        addListener('colorThemeSelector', 'change', () => {
            // Update state
            const colorTheme = getValue('colorThemeSelector');
            updateState({ colorTheme });

            // Show/hide custom color controls
            customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';

            // Clear palette cache when theme changes
            clearPaletteCache();
        });
    }

    // Add event listeners for custom color controls to clear cache when changed
    const colorControls = ['baseHueInput', 'saturationInput', 'lightnessInput'];
    colorControls.forEach(control => {
        const element = getElement(control);
        if (element) {
            element.addEventListener('change', () => {
                // Only clear cache if we're using custom colors
                if (getValue('colorThemeSelector') === 'custom') {
                    clearPaletteCache();
                }
            });
        }
    });
}

/**
 * Set up slider display updates
 */
function setupSliderDisplays() {
    // Map of input IDs to display elements
    const sliderDisplayMap = {
        // Basic controls
        'numShapes': getElement('numShapesDisplay'),
        'lineWidth': getElement('lineWidthDisplay'),
        'baseHue': getElement('baseHueDisplay'),
        'saturation': getElement('saturationDisplay'),
        'lightness': getElement('lightnessDisplay'),

        // Layer opacity controls (keeping these as they are related to art generation)
        'voronoiOpacity': getElement('voronoiOpacityDisplay'),
        'organicSplattersOpacity': getElement('organicSplattersOpacityDisplay'),
        'neonWavesOpacity': getElement('neonWavesOpacityDisplay'),
        'fractalLinesOpacity': getElement('fractalLinesOpacityDisplay'),
        'geometricGridOpacity': getElement('geometricGridOpacityDisplay'),
        'particleSwarmOpacity': getElement('particleSwarmOpacityDisplay'),
        'organicNoiseOpacity': getElement('organicNoiseOpacityDisplay'),
        'glitchMosaicOpacity': getElement('glitchMosaicOpacityDisplay'),
        'pixelSortOpacity': getElement('pixelSortOpacityDisplay'),
        'gradientOverlayOpacity': getElement('gradientOverlayOpacityDisplay'),
        'dotMatrixOpacity': getElement('dotMatrixOpacityDisplay'),
        'textureOverlayOpacity': getElement('textureOverlayOpacityDisplay'),
        'symmetricalPatternsOpacity': getElement('symmetricalPatternsOpacityDisplay'),
        'flowingLinesOpacity': getElement('flowingLinesOpacityDisplay'),

        // Layer density controls (keeping these)
        'voronoiDensity': getElement('voronoiDensityDisplay'),
        'organicSplattersDensity': getElement('organicSplattersDensityDisplay'),
        'neonWavesDensity': getElement('neonWavesDensityDisplay'),
        'fractalLinesDensity': getElement('fractalLinesDensityDisplay'),
        'dotMatrixDensity': getElement('dotMatrixDensityDisplay'),
        'flowingLinesDensity': getElement('flowingLinesDensityDisplay'),
        'symmetricalPatternsDensity': getElement('symmetricalPatternsDensityDisplay'),

        // Advanced controls (keeping these)
        'colorShiftAmount': getElement('colorShiftAmountDisplay'),
        'scaleAmount': getElement('scaleAmountDisplay'),
        'rotationAmount': getElement('rotationAmountDisplay')
    };

    // Set up input event listeners
    Object.entries(sliderDisplayMap).forEach(([inputId, displayElement]) => {
        const inputElement = document.getElementById(inputId);
        if (inputElement && displayElement) {
            inputElement.addEventListener('input', () => {
                displayElement.textContent = inputElement.value;
            });
        }
    });
}

// Public API
export {
    setupColorThemeControls,
    setupSliderDisplays
};
