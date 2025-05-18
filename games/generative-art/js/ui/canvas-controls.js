/**
 * canvas-controls.js - Canvas controls for the Generative Art Studio
 * Handles UI controls for canvas size, rendering settings, and basic parameters
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { clearPaletteCache } from '../palette.js';
import { setSeed } from '../utils.js';

// Canvas controls configuration
const canvasControls = [
    { id: 'numShapes', stateKey: 'numShapes', defaultValue: 100, min: 10, max: 1000 },
    { id: 'lineWidth', stateKey: 'lineWidth', defaultValue: 1, min: 0.5, max: 10 }
];

// Advanced controls configuration
const advancedControls = [
    { id: 'colorShiftAmount', stateKey: 'colorShiftAmount', defaultValue: 0, min: -50, max: 50 },
    { id: 'scaleAmount', stateKey: 'scaleAmount', defaultValue: 1, min: 0.5, max: 2 },
    { id: 'rotationAmount', stateKey: 'rotationAmount', defaultValue: 0, min: 0, max: 1 }
];

// Blend mode options
const blendModes = [
    { id: 'source-over', name: 'Normal' },
    { id: 'multiply', name: 'Multiply' },
    { id: 'screen', name: 'Screen' },
    { id: 'overlay', name: 'Overlay' },
    { id: 'darken', name: 'Darken' },
    { id: 'lighten', name: 'Lighten' },
    { id: 'color-dodge', name: 'Color Dodge' },
    { id: 'color-burn', name: 'Color Burn' },
    { id: 'hard-light', name: 'Hard Light' },
    { id: 'soft-light', name: 'Soft Light' },
    { id: 'difference', name: 'Difference' },
    { id: 'exclusion', name: 'Exclusion' }
];

/**
 * Set up canvas controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 * @param {Function} initCanvasFn - Function to initialize canvas
 */
function setupCanvasControls(drawArtworkFn, initCanvasFn) {
    try {
        // Set up basic canvas controls
        setupBasicCanvasControls(drawArtworkFn);

        // Set up canvas size controls
        setupCanvasSizeControls(initCanvasFn);

        // Set up seed controls
        setupSeedControls(drawArtworkFn);

        // Set up advanced controls
        setupAdvancedControls(drawArtworkFn);

        // Register reset event handler
        registerHandler('resetCanvasControls', () => {
            resetCanvasControls();

            // Reinitialize canvas
            if (initCanvasFn) {
                initCanvasFn();
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupCanvasControls',
            message: 'Error setting up canvas controls'
        });
    }
}

/**
 * Set up basic canvas controls (number of shapes, line width)
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupBasicCanvasControls(drawArtworkFn) {
    try {
        // Set up each canvas control
        canvasControls.forEach(control => {
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
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupBasicCanvasControls',
            message: 'Error setting up basic canvas controls'
        });
    }
}

/**
 * Set up canvas size controls
 * @param {Function} initCanvasFn - Function to initialize canvas
 */
function setupCanvasSizeControls(initCanvasFn) {
    try {
        const canvasWidthInput = getElement('canvasWidth');
        const canvasHeightInput = getElement('canvasHeight');

        if (canvasWidthInput && canvasHeightInput) {
            // Set initial values from state
            const state = getState();
            if (state.canvasWidth) {
                canvasWidthInput.value = state.canvasWidth;
            }
            if (state.canvasHeight) {
                canvasHeightInput.value = state.canvasHeight;
            }

            // Add change event listeners
            addListener('canvasWidth', 'change', () => {
                const width = parseInt(canvasWidthInput.value, 10);
                if (width > 0) {
                    updateState({ canvasWidth: width });

                    // Reinitialize canvas
                    if (initCanvasFn) {
                        initCanvasFn();
                    }
                }
            });

            addListener('canvasHeight', 'change', () => {
                const height = parseInt(canvasHeightInput.value, 10);
                if (height > 0) {
                    updateState({ canvasHeight: height });

                    // Reinitialize canvas
                    if (initCanvasFn) {
                        initCanvasFn();
                    }
                }
            });
        }
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupCanvasSizeControls',
            message: 'Error setting up canvas size controls'
        });
    }
}

/**
 * Set up seed controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupSeedControls(drawArtworkFn) {
    try {
        const seedInput = getElement('seedInput');
        const randomSeedButton = getElement('randomSeedButton');
        const currentSeedDisplay = getElement('currentSeedDisplay');

        if (seedInput && randomSeedButton) {
            // Set initial value from state
            const state = getState();
            if (state.seed) {
                seedInput.value = state.seed;
                if (currentSeedDisplay) {
                    currentSeedDisplay.textContent = state.seed;
                }
            }

            // Add change event listener
            addListener('seedInput', 'change', () => {
                const seed = seedInput.value;
                updateState({ seed });

                // Update seed display
                if (currentSeedDisplay) {
                    currentSeedDisplay.textContent = seed;
                }

                // Set seed and redraw
                setSeed(seed);
                if (drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle);
                }
            });

            // Random seed button
            addListener('randomSeedButton', 'click', () => {
                const randomSeed = Math.floor(Math.random() * 1000000);
                seedInput.value = randomSeed;

                // Update seed display
                if (currentSeedDisplay) {
                    currentSeedDisplay.textContent = randomSeed;
                }

                // Update state
                updateState({ seed: randomSeed });

                // Set seed and redraw
                setSeed(randomSeed);
                if (drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle);
                }
            });
        }
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupSeedControls',
            message: 'Error setting up seed controls'
        });
    }
}

/**
 * Set up advanced controls (blend mode, color shift, scale, rotation)
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupAdvancedControls(drawArtworkFn) {
    try {
        // Set up blend mode selector
        const blendModeSelector = getElement('blendModeSelector');
        if (blendModeSelector) {
            // Set initial value from state
            const state = getState();
            if (state.blendMode) {
                blendModeSelector.value = state.blendMode;
            }

            // Add change event listener
            addListener('blendModeSelector', 'change', () => {
                const blendMode = getValue('blendModeSelector');
                updateState({ blendMode });

                // Redraw artwork if not animating
                if (!getState().animationEnabled && drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle, false);
                }
            });
        }

        // Set up advanced sliders
        advancedControls.forEach(control => {
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

                    // Redraw artwork if not animating
                    if (!getState().animationEnabled && drawArtworkFn) {
                        drawArtworkFn(getState().currentArtStyle, false);
                    }
                });
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupAdvancedControls',
            message: 'Error setting up advanced controls'
        });
    }
}

/**
 * Reset canvas controls to default values
 */
function resetCanvasControls() {
    try {
        const stateUpdate = {};

        // Reset basic canvas controls
        canvasControls.forEach(control => {
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

        // Reset canvas size controls
        const canvasWidthInput = getElement('canvasWidth');
        const canvasHeightInput = getElement('canvasHeight');

        if (canvasWidthInput) {
            canvasWidthInput.value = '';
            stateUpdate.canvasWidth = window.innerWidth;
        }

        if (canvasHeightInput) {
            canvasHeightInput.value = '';
            stateUpdate.canvasHeight = window.innerHeight;
        }

        // Reset seed control
        const seedInput = getElement('seedInput');
        const currentSeedDisplay = getElement('currentSeedDisplay');

        if (seedInput) {
            const randomSeed = Math.floor(Math.random() * 1000000);
            seedInput.value = randomSeed;

            if (currentSeedDisplay) {
                currentSeedDisplay.textContent = randomSeed;
            }

            stateUpdate.seed = randomSeed;
            setSeed(randomSeed);
        }

        // Reset blend mode
        const blendModeSelector = getElement('blendModeSelector');
        if (blendModeSelector) {
            blendModeSelector.value = 'source-over';
            stateUpdate.blendMode = 'source-over';
        }

        // Reset advanced controls
        advancedControls.forEach(control => {
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

        // Update state
        updateState(stateUpdate);

        // Clear palette cache
        clearPaletteCache();
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'resetCanvasControls',
            message: 'Error resetting canvas controls'
        });
    }
}

// Public API
export {
    setupCanvasControls,
    setupBasicCanvasControls,
    setupCanvasSizeControls,
    setupSeedControls,
    setupAdvancedControls,
    resetCanvasControls,
    canvasControls,
    advancedControls,
    blendModes
};
