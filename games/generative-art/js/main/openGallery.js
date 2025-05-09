/**
 * openGallery.js - Open gallery functionality for the Generative Art Studio
 */

import { populateGallery } from '../gallery.js';
import {
    galleryModal,
    galleryContainer,
    currentArtStyle,
    styleSelector,
    currentStyleDisplaySpan,
    numShapesInput,
    numShapes,
    numShapesDisplay,
    lineWidthInput,
    lineWidth,
    lineWidthDisplay,
    seedInput,
    currentSeedDisplay,
    colorThemeSelector,
    colorTheme,
    customColorControls,
    baseHueInput,
    baseHue,
    baseHueDisplay,
    saturationInput,
    saturation,
    saturationDisplay,
    lightnessInput,
    lightness,
    lightnessDisplay,
    backgroundColorPicker,
    backgroundColor,
    applySettingsBtn
} from './state.js';

/**
 * Open the gallery modal and populate it
 */
function openGallery() {
    if (!galleryModal || !galleryContainer) return;

    galleryModal.style.display = 'block';

    // Populate gallery
    populateGallery(galleryContainer,
        // On select callback
        (item) => {
            // Load settings from gallery item
            if (item.settings) {
                if (item.settings.style) {
                    currentArtStyle = item.settings.style;
                    styleSelector.value = currentArtStyle;
                    currentStyleDisplaySpan.textContent = currentArtStyle;
                }

                if (item.settings.numShapes) {
                    numShapesInput.value = item.settings.numShapes;
                    numShapes = +item.settings.numShapes;
                    numShapesDisplay.textContent = item.settings.numShapes;
                }

                if (item.settings.lineWidth) {
                    lineWidthInput.value = item.settings.lineWidth;
                    lineWidth = +item.settings.lineWidth;
                    lineWidthDisplay.textContent = item.settings.lineWidth;
                }

                if (item.settings.seed) {
                    seedInput.value = item.settings.seed;
                    currentSeedDisplay.textContent = item.settings.seed;
                }

                if (item.settings.colorTheme && colorThemeSelector) {
                    colorThemeSelector.value = item.settings.colorTheme;
                    colorTheme = item.settings.colorTheme;

                    if (customColorControls) {
                        customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                    }
                }

                if (item.settings.baseHue && baseHueInput) {
                    baseHueInput.value = item.settings.baseHue;
                    baseHue = +item.settings.baseHue;
                    if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                }

                if (item.settings.saturation && saturationInput) {
                    saturationInput.value = item.settings.saturation;
                    saturation = +item.settings.saturation;
                    if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                }

                if (item.settings.lightness && lightnessInput) {
                    lightnessInput.value = item.settings.lightness;
                    lightness = +item.settings.lightness;
                    if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                }

                if (item.settings.backgroundColor && backgroundColorPicker) {
                    backgroundColorPicker.value = item.settings.backgroundColor;
                    backgroundColor = item.settings.backgroundColor;
                }

                // Apply settings
                applySettingsBtn.click();
            }

            // Close gallery
            galleryModal.style.display = 'none';
        },
        // On delete callback
        (id) => {
            console.log(`Deleted gallery item: ${id}`);
        }
    );
}

export { openGallery };
