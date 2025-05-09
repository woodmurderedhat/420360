/**
 * loadSettings.js - Load settings functionality for the Generative Art Studio
 */

import { setSeed } from '../utils.js';
import { setAnimationSpeed, setInteractiveMode } from '../animation.js';
import { artStyles } from '../styles/index.js';
import {
    settingsKey,
    numShapesInput,
    lineWidthInput,
    canvasWidthInput,
    canvasHeightInput,
    seedInput,
    currentSeedDisplay,
    styleSelector,
    currentStyleDisplaySpan,
    colorThemeSelector,
    customColorControls,
    baseHueInput,
    baseHueDisplay,
    saturationInput,
    saturationDisplay,
    lightnessInput,
    lightnessDisplay,
    backgroundColorPicker,
    animationToggle,
    animationSpeedInput,
    animationSpeedDisplay,
    interactiveToggle,
    numShapesDisplay,
    lineWidthDisplay,
    currentArtStyle,
    numShapes,
    lineWidth,
    colorTheme,
    baseHue,
    saturation,
    lightness,
    backgroundColor
} from './state.js';

/**
 * Load saved settings if present
 */
function loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
        try {
            const s = JSON.parse(saved);

            // Load basic settings
            if (s.numShapes) {
                numShapesInput.value = s.numShapes;
                numShapes = +s.numShapes;
                numShapesDisplay.textContent = s.numShapes;
            }

            if (s.lineWidth) {
                lineWidthInput.value = s.lineWidth;
                lineWidth = +s.lineWidth;
                lineWidthDisplay.textContent = s.lineWidth;
            }

            if (s.canvasWidth) canvasWidthInput.value = s.canvasWidth;
            if (s.canvasHeight) canvasHeightInput.value = s.canvasHeight;

            // Load seed
            if (s.seed) {
                seedInput.value = s.seed;
                setSeed(s.seed);
                currentSeedDisplay.textContent = s.seed;
            } else {
                seedInput.value = '';
                setSeed(null);
                currentSeedDisplay.textContent = 'random';
            }

            // Load style
            if (s.style && Object.values(artStyles).includes(s.style)) {
                currentArtStyle = s.style;
                styleSelector.value = currentArtStyle;
                currentStyleDisplaySpan.textContent = currentArtStyle;
            }

            // Load color settings
            if (s.colorTheme && colorThemeSelector) {
                colorTheme = s.colorTheme;
                colorThemeSelector.value = colorTheme;

                // Show/hide custom color controls
                if (customColorControls) {
                    customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                }
            }

            if (s.baseHue && baseHueInput) {
                baseHue = s.baseHue;
                baseHueInput.value = baseHue;
                if (baseHueDisplay) baseHueDisplay.textContent = baseHue;
            }

            if (s.saturation && saturationInput) {
                saturation = s.saturation;
                saturationInput.value = saturation;
                if (saturationDisplay) saturationDisplay.textContent = saturation;
            }

            if (s.lightness && lightnessInput) {
                lightness = s.lightness;
                lightnessInput.value = lightness;
                if (lightnessDisplay) lightnessDisplay.textContent = lightness;
            }

            if (s.backgroundColor && backgroundColorPicker) {
                backgroundColor = s.backgroundColor;
                backgroundColorPicker.value = backgroundColor;
            }

            // Load animation settings
            if (s.isAnimating !== undefined && animationToggle) {
                animationToggle.checked = s.isAnimating;
            }

            if (s.animationSpeed !== undefined && animationSpeedInput) {
                animationSpeedInput.value = s.animationSpeed;
                if (animationSpeedDisplay) animationSpeedDisplay.textContent = s.animationSpeed;
                setAnimationSpeed(s.animationSpeed);
            }

            if (s.isInteractive !== undefined && interactiveToggle) {
                interactiveToggle.checked = s.isInteractive;
                setInteractiveMode(s.isInteractive);
            }

        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

export { loadSettings };
