/**
 * js/ui/light-rays-controls.js - Light Rays controls for the Generative Art Studio
 * Handles the UI controls for the Light Rays layer
 */

import { getElement, getElements, updateSliderValue } from './components.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';

/**
 * Initialize Light Rays controls
 * @param {Object} callbacks - Callback functions
 * @returns {boolean} - Whether initialization was successful
 */
export function initLightRaysControls(callbacks) {
    try {
        const { drawArtwork } = callbacks;
        
        // Get UI elements
        const lightRaysOpacitySlider = getElement('lightRaysOpacity');
        const lightRaysIntensitySlider = getElement('lightRaysIntensity');
        const lightRaysDirectionSlider = getElement('lightRaysDirection');
        const lightRaysSpreadSlider = getElement('lightRaysSpread');
        const lightRaysDensitySlider = getElement('lightRaysDensity');
        
        // Get value display elements
        const lightRaysOpacityValue = getElement('lightRaysOpacityValue');
        const lightRaysIntensityValue = getElement('lightRaysIntensityValue');
        const lightRaysDirectionValue = getElement('lightRaysDirectionValue');
        const lightRaysSpreadValue = getElement('lightRaysSpreadValue');
        const lightRaysDensityValue = getElement('lightRaysDensityValue');
        
        // Get direction preview element
        const lightDirectionPreview = getElement('lightDirectionPreview');
        const directionIndicator = lightDirectionPreview ? 
            lightDirectionPreview.querySelector('.direction-indicator') : null;
        
        // Apply enhanced slider styles
        [
            lightRaysOpacitySlider,
            lightRaysIntensitySlider,
            lightRaysDirectionSlider,
            lightRaysSpreadSlider,
            lightRaysDensitySlider
        ].forEach(slider => {
            if (slider) {
                slider.classList.add('enhanced-slider');
            }
        });
        
        // Set up event listeners for opacity slider
        if (lightRaysOpacitySlider && lightRaysOpacityValue) {
            lightRaysOpacitySlider.addEventListener('input', () => {
                updateSliderValue(lightRaysOpacitySlider, lightRaysOpacityValue);
                drawArtwork();
            });
            
            // Initialize value display
            updateSliderValue(lightRaysOpacitySlider, lightRaysOpacityValue);
        }
        
        // Set up event listeners for intensity slider
        if (lightRaysIntensitySlider && lightRaysIntensityValue) {
            lightRaysIntensitySlider.addEventListener('input', () => {
                updateSliderValue(lightRaysIntensitySlider, lightRaysIntensityValue);
                drawArtwork();
            });
            
            // Initialize value display
            updateSliderValue(lightRaysIntensitySlider, lightRaysIntensityValue);
        }
        
        // Set up event listeners for direction slider
        if (lightRaysDirectionSlider && lightRaysDirectionValue) {
            lightRaysDirectionSlider.addEventListener('input', () => {
                const direction = parseInt(lightRaysDirectionSlider.value);
                updateSliderValue(lightRaysDirectionSlider, lightRaysDirectionValue);
                
                // Update direction preview
                if (directionIndicator) {
                    directionIndicator.style.transform = 
                        `rotate(${direction}deg) translate(-50%, -50%)`;
                }
                
                drawArtwork();
            });
            
            // Initialize value display and preview
            updateSliderValue(lightRaysDirectionSlider, lightRaysDirectionValue);
            if (directionIndicator) {
                const initialDirection = parseInt(lightRaysDirectionSlider.value);
                directionIndicator.style.transform = 
                    `rotate(${initialDirection}deg) translate(-50%, -50%)`;
            }
        }
        
        // Set up event listeners for spread slider
        if (lightRaysSpreadSlider && lightRaysSpreadValue) {
            lightRaysSpreadSlider.addEventListener('input', () => {
                updateSliderValue(lightRaysSpreadSlider, lightRaysSpreadValue);
                drawArtwork();
            });
            
            // Initialize value display
            updateSliderValue(lightRaysSpreadSlider, lightRaysSpreadValue);
        }
        
        // Set up event listeners for density slider
        if (lightRaysDensitySlider && lightRaysDensityValue) {
            lightRaysDensitySlider.addEventListener('input', () => {
                updateSliderValue(lightRaysDensitySlider, lightRaysDensityValue);
                drawArtwork();
            });
            
            // Initialize value display
            updateSliderValue(lightRaysDensitySlider, lightRaysDensityValue);
        }
        
        return true;
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'initLightRaysControls',
            message: 'Failed to initialize Light Rays controls'
        });
        return false;
    }
}
