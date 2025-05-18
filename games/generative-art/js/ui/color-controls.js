/**
 * color-controls.js - Color controls for the Generative Art Studio
 * Handles UI controls for color themes, palettes, and color settings
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { clearPaletteCache } from '../palette.js';

// Color theme options
const colorThemes = [
    { id: 'random', name: 'Random' },
    { id: 'monochrome', name: 'Monochrome' },
    { id: 'complementary', name: 'Complementary' },
    { id: 'analogous', name: 'Analogous' },
    { id: 'triadic', name: 'Triadic' },
    { id: 'custom', name: 'Custom' }
];

// Color controls configuration
const colorControls = [
    { id: 'baseHue', stateKey: 'baseHue', defaultValue: 180, min: 0, max: 360 },
    { id: 'saturation', stateKey: 'saturation', defaultValue: 70, min: 0, max: 100 },
    { id: 'lightness', stateKey: 'lightness', defaultValue: 50, min: 0, max: 100 }
];

/**
 * Set up color theme controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupColorThemeControls(drawArtworkFn) {
    try {
        const colorThemeSelector = getElement('colorThemeSelector');
        const customColorControls = getElement('customColorControls');
        
        if (colorThemeSelector && customColorControls) {
            // Set initial value from state
            const state = getState();
            if (state.colorTheme) {
                colorThemeSelector.value = state.colorTheme;
                
                // Show/hide custom color controls
                customColorControls.style.display = state.colorTheme === 'custom' ? 'block' : 'none';
            }
            
            // Add change event listener
            addListener('colorThemeSelector', 'change', () => {
                // Update state
                const colorTheme = getValue('colorThemeSelector');
                updateState({ colorTheme });
                
                // Show/hide custom color controls
                customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                
                // Clear palette cache when theme changes
                clearPaletteCache();
                
                // Redraw artwork if not animating
                if (!getState().animationEnabled && drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle, false);
                }
            });
        }
        
        // Set up custom color controls
        setupCustomColorControls(drawArtworkFn);
        
        // Set up background color control
        setupBackgroundColorControl(drawArtworkFn);
        
        // Register reset event handler
        registerHandler('resetColorTheme', () => {
            resetColorTheme();
            
            // Redraw artwork if not animating
            if (!getState().animationEnabled && drawArtworkFn) {
                drawArtworkFn(getState().currentArtStyle, false);
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupColorThemeControls',
            message: 'Error setting up color theme controls'
        });
    }
}

/**
 * Set up custom color controls (hue, saturation, lightness)
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupCustomColorControls(drawArtworkFn) {
    try {
        // Set up each color control
        colorControls.forEach(control => {
            const input = getElement(control.id);
            const display = getElement(`${control.id}Value`);
            
            if (input) {
                // Set initial value from state
                const state = getState();
                if (state[control.stateKey] !== undefined) {
                    input.value = state[control.stateKey];
                    if (display) {
                        display.textContent = state[control.stateKey];
                    }
                }
                
                // Add input event listener
                addListener(control.id, 'input', () => {
                    const value = parseInt(input.value, 10);
                    
                    // Update display
                    if (display) {
                        display.textContent = value;
                    }
                    
                    // Update state
                    const stateUpdate = {};
                    stateUpdate[control.stateKey] = value;
                    updateState(stateUpdate);
                    
                    // Clear palette cache
                    clearPaletteCache();
                    
                    // Redraw artwork if not animating
                    if (!getState().animationEnabled && drawArtworkFn) {
                        drawArtworkFn(getState().currentArtStyle, false);
                    }
                });
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupCustomColorControls',
            message: 'Error setting up custom color controls'
        });
    }
}

/**
 * Set up background color control
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupBackgroundColorControl(drawArtworkFn) {
    try {
        const backgroundColorPicker = getElement('backgroundColorPicker');
        
        if (backgroundColorPicker) {
            // Set initial value from state
            const state = getState();
            if (state.backgroundColor) {
                backgroundColorPicker.value = state.backgroundColor;
            }
            
            // Add change event listener
            addListener('backgroundColorPicker', 'change', () => {
                // Update state
                const backgroundColor = getValue('backgroundColorPicker');
                updateState({ backgroundColor });
                
                // Redraw artwork if not animating
                if (!getState().animationEnabled && drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle, false);
                }
            });
        }
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupBackgroundColorControl',
            message: 'Error setting up background color control'
        });
    }
}

/**
 * Reset color theme to default values
 */
function resetColorTheme() {
    try {
        const colorThemeSelector = getElement('colorThemeSelector');
        const customColorControls = getElement('customColorControls');
        const backgroundColorPicker = getElement('backgroundColorPicker');
        
        if (colorThemeSelector) {
            colorThemeSelector.value = 'random';
            
            // Show/hide custom color controls
            if (customColorControls) {
                customColorControls.style.display = 'none';
            }
        }
        
        // Reset custom color controls
        colorControls.forEach(control => {
            const input = getElement(control.id);
            const display = getElement(`${control.id}Value`);
            
            if (input) {
                input.value = control.defaultValue;
                if (display) {
                    display.textContent = control.defaultValue;
                }
            }
        });
        
        // Reset background color
        if (backgroundColorPicker) {
            backgroundColorPicker.value = '#ffffff';
        }
        
        // Update state
        updateState({
            colorTheme: 'random',
            baseHue: 180,
            saturation: 70,
            lightness: 50,
            backgroundColor: '#ffffff'
        });
        
        // Clear palette cache
        clearPaletteCache();
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'resetColorTheme',
            message: 'Error resetting color theme'
        });
    }
}

// Public API
export {
    setupColorThemeControls,
    setupCustomColorControls,
    setupBackgroundColorControl,
    resetColorTheme,
    colorThemes,
    colorControls
};
