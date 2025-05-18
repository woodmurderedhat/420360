/**
 * layer-controls.js - Layer controls for the Generative Art Studio
 * Handles UI controls for layer opacity and density settings
 */

import { getElement, getElements, addListener, setValue, getValue, getValues } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { clearPaletteCache } from '../palette.js';

// Layer opacity controls configuration
const layerOpacityControls = [
    { id: 'voronoiOpacity', stateKey: 'voronoiOpacity', defaultValue: 0.7 },
    { id: 'organicSplattersOpacity', stateKey: 'organicSplattersOpacity', defaultValue: 0.6 },
    { id: 'neonWavesOpacity', stateKey: 'neonWavesOpacity', defaultValue: 0.5 },
    { id: 'fractalLinesOpacity', stateKey: 'fractalLinesOpacity', defaultValue: 0.6 },
    { id: 'geometricGridOpacity', stateKey: 'geometricGridOpacity', defaultValue: 0.7 },
    { id: 'particleSwarmOpacity', stateKey: 'particleSwarmOpacity', defaultValue: 0.7 },
    { id: 'organicNoiseOpacity', stateKey: 'organicNoiseOpacity', defaultValue: 0.5 },
    { id: 'glitchMosaicOpacity', stateKey: 'glitchMosaicOpacity', defaultValue: 0.6 },
    { id: 'pixelSortOpacity', stateKey: 'pixelSortOpacity', defaultValue: 0.7 },
    { id: 'gradientOverlayOpacity', stateKey: 'gradientOverlayOpacity', defaultValue: 0.3 },
    { id: 'dotMatrixOpacity', stateKey: 'dotMatrixOpacity', defaultValue: 0.6 },
    { id: 'textureOverlayOpacity', stateKey: 'textureOverlayOpacity', defaultValue: 0.4 },
    { id: 'symmetricalPatternsOpacity', stateKey: 'symmetricalPatternsOpacity', defaultValue: 0.7 },
    { id: 'flowingLinesOpacity', stateKey: 'flowingLinesOpacity', defaultValue: 0.6 }
];

// Layer density controls configuration
const layerDensityControls = [
    { id: 'voronoiDensity', stateKey: 'voronoiDensity', defaultValue: 50 },
    { id: 'organicSplattersDensity', stateKey: 'organicSplattersDensity', defaultValue: 50 },
    { id: 'neonWavesDensity', stateKey: 'neonWavesDensity', defaultValue: 50 },
    { id: 'fractalLinesDensity', stateKey: 'fractalLinesDensity', defaultValue: 50 },
    { id: 'dotMatrixDensity', stateKey: 'dotMatrixDensity', defaultValue: 50 },
    { id: 'flowingLinesDensity', stateKey: 'flowingLinesDensity', defaultValue: 50 },
    { id: 'symmetricalPatternsDensity', stateKey: 'symmetricalPatternsDensity', defaultValue: 50 }
];

/**
 * Set up layer opacity controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupLayerOpacityControls(drawArtworkFn) {
    try {
        // Set up each opacity control
        layerOpacityControls.forEach(control => {
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
                    const value = parseFloat(input.value);
                    
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
        
        // Register reset event handler
        registerHandler('resetLayerOpacities', () => {
            resetLayerOpacities();
            
            // Redraw artwork if not animating
            if (!getState().animationEnabled && drawArtworkFn) {
                drawArtworkFn(getState().currentArtStyle, false);
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupLayerOpacityControls',
            message: 'Error setting up layer opacity controls'
        });
    }
}

/**
 * Set up layer density controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupLayerDensityControls(drawArtworkFn) {
    try {
        // Set up each density control
        layerDensityControls.forEach(control => {
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
        
        // Register reset event handler
        registerHandler('resetLayerDensities', () => {
            resetLayerDensities();
            
            // Redraw artwork if not animating
            if (!getState().animationEnabled && drawArtworkFn) {
                drawArtworkFn(getState().currentArtStyle, false);
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupLayerDensityControls',
            message: 'Error setting up layer density controls'
        });
    }
}

/**
 * Reset layer opacities to default values
 */
function resetLayerOpacities() {
    try {
        const stateUpdate = {};
        
        layerOpacityControls.forEach(control => {
            const input = getElement(control.id);
            const display = getElement(`${control.id}Value`);
            
            if (input) {
                input.value = control.defaultValue;
                if (display) {
                    display.textContent = control.defaultValue;
                }
                
                stateUpdate[control.stateKey] = control.defaultValue;
            }
        });
        
        updateState(stateUpdate);
        clearPaletteCache();
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'resetLayerOpacities',
            message: 'Error resetting layer opacities'
        });
    }
}

/**
 * Reset layer densities to default values
 */
function resetLayerDensities() {
    try {
        const stateUpdate = {};
        
        layerDensityControls.forEach(control => {
            const input = getElement(control.id);
            const display = getElement(`${control.id}Value`);
            
            if (input) {
                input.value = control.defaultValue;
                if (display) {
                    display.textContent = control.defaultValue;
                }
                
                stateUpdate[control.stateKey] = control.defaultValue;
            }
        });
        
        updateState(stateUpdate);
        clearPaletteCache();
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'resetLayerDensities',
            message: 'Error resetting layer densities'
        });
    }
}

// Public API
export {
    setupLayerOpacityControls,
    setupLayerDensityControls,
    resetLayerOpacities,
    resetLayerDensities,
    layerOpacityControls,
    layerDensityControls
};
