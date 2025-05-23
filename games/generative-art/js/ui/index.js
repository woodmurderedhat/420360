/**
 * index.js - Main UI module for the Generative Art Studio
 * Coordinates UI components and provides a unified interface
 */

import { getElement, getElements, hasRequiredElements, addListener, setValue, getValue, getValues } from './components.js';
import { registerHandler, triggerEvent, setupKeyboardShortcuts, setupWindowResize, setupFullscreenChangeListeners, cleanupEventListeners } from './events.js';
import { initResponsiveUI, toggleControlPanel, cleanupResponsiveUI } from './responsive.js';
import { setupColorThemeControls } from './color-controls.js';
import { setupCanvasControls } from './canvas-controls.js';
import { setupLayerOpacityControls, setupLayerDensityControls } from './layer-controls.js';
import { initLightRaysControls } from './light-rays-controls.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { setSeed } from '../utils.js';
import { artStyles } from '../styles.js';

// Local storage key for settings
const SETTINGS_KEY = 'generativeArtSettings';

// Private module state
let _initialized = false;
let _drawArtworkFn = null;
let _initCanvasFn = null;

/**
 * Initialize the UI module
 * @param {Object} options - Initialization options
 * @returns {boolean} True if initialization was successful
 */
function initialize(options = {}) {
    if (_initialized) return true;

    try {
        // Store callback functions
        _drawArtworkFn = options.drawArtwork;
        _initCanvasFn = options.initCanvas;

        // Check for required elements
        const requiredElements = ['canvas', 'regenerateButton', 'exportButton'];
        if (!hasRequiredElements(requiredElements)) {
            handleError(
                new Error('Required UI elements not found'),
                ErrorType.UI,
                ErrorSeverity.ERROR,
                { component: 'ui', message: 'Missing required UI elements' }
            );
            return false;
        }

        // Set up event handlers
        setupEventHandlers();

        // Set up UI components
        setupUIComponents();

        _initialized = true;
        return true;
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'ui',
            message: 'Error initializing UI module'
        });
        return false;
    }
}

/**
 * Set up event handlers
 */
function setupEventHandlers() {
    // Regenerate button
    addListener('regenerateButton', 'click', () => {
        if (_drawArtworkFn) {
            _drawArtworkFn(getState().currentArtStyle);
        }
    });

    // Export button
    addListener('exportButton', 'click', () => {
        triggerEvent('export');
    });

    // Random seed generation
    addListener('randomSeedButton', 'click', () => {
        const randomSeed = Date.now().toString();
        setValue('seedInput', randomSeed);

        const currentSeedDisplay = getElement('currentSeedDisplay');
        if (currentSeedDisplay) {
            currentSeedDisplay.textContent = randomSeed;
        }

        // Auto apply new seed and redraw
        const applySettingsBtn = getElement('applySettingsBtn');
        if (applySettingsBtn) {
            applySettingsBtn.click();
        }
    });

    // Toggle panel visibility is now handled in responsive.js
    // This listener is kept for backward compatibility
    addListener('togglePanelButton', 'click', () => {
        triggerEvent('togglePanel');
    });

    // Apply settings and re-render
    addListener('applySettingsBtn', 'click', () => {
        const canvas = getElement('canvas');
        const ctx = getElement('ctx');
        if (!canvas || !ctx) return;

        // Reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Get current state
        getState(); // Just to ensure state is up to date

        // Update basic settings
        const newState = {
            numShapes: getValue('numShapesInput'),
            lineWidth: getValue('lineWidthInput')
        };

        // Update seed
        const seedValue = getValue('seedInput');
        if (seedValue) {
            setSeed(seedValue);
        } else {
            setSeed(null);
        }

        // Update color settings
        const colorThemeSelector = getElement('colorThemeSelector');
        if (colorThemeSelector) newState.colorTheme = colorThemeSelector.value;

        const baseHueInput = getElement('baseHueInput');
        if (baseHueInput) newState.baseHue = +baseHueInput.value;

        const saturationInput = getElement('saturationInput');
        if (saturationInput) newState.saturation = +saturationInput.value;

        const lightnessInput = getElement('lightnessInput');
        if (lightnessInput) newState.lightness = +lightnessInput.value;

        const backgroundColorPicker = getElement('backgroundColorPicker');
        if (backgroundColorPicker) newState.backgroundColor = backgroundColorPicker.value;

        // Update layer opacity settings using helper function
        const opacityValues = getLayerOpacityValues();
        Object.entries(opacityValues).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                newState[key] = +value;
            }
        });

        // Update layer density settings using helper function
        const densityValues = getLayerDensityValues();
        Object.entries(densityValues).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                newState[key] = +value;
            }
        });

        // Update advanced settings
        const advancedInputs = [
            'colorShiftAmount', 'scaleAmount', 'rotationAmount',
            'lightRaysIntensity', 'lightRaysDirection', 'lightRaysSpread'
        ];

        advancedInputs.forEach(inputId => {
            const value = getValue(inputId);
            if (value !== null && value !== undefined) {
                newState[inputId] = +value;
            }
        });

        const blendModeSelector = getElement('blendModeSelector');
        if (blendModeSelector) newState.blendMode = blendModeSelector.value;

        // Update state
        updateState(newState);

        // Update display
        const currentSeedDisplay = getElement('currentSeedDisplay');
        if (currentSeedDisplay) {
            currentSeedDisplay.textContent = seedValue || 'random';
        }

        // Redraw artwork
        if (_drawArtworkFn) {
            _drawArtworkFn('Default');
        }
    });

    // Mobile action buttons
    addListener('mobileRandomizeButton', 'click', () => {
        if (_drawArtworkFn) {
            // Generate a new random seed
            const randomSeed = Date.now().toString();
            setValue('seedInput', randomSeed);
            setSeed(randomSeed);

            // Update seed display if it exists
            const currentSeedDisplay = getElement('currentSeedDisplay');
            if (currentSeedDisplay) {
                currentSeedDisplay.textContent = randomSeed;
            }

            // Redraw artwork
            _drawArtworkFn(getState().currentArtStyle);
        }
    });

    addListener('mobileExportButton', 'click', () => {
        triggerEvent('export');
    });

    // Register event handlers
    registerHandler('regenerate', () => {
        const regenerateButton = getElement('regenerateButton');
        if (regenerateButton) regenerateButton.click();
    });

    registerHandler('export', () => {
        const exportButton = getElement('exportButton');
        if (exportButton) exportButton.click();
    });

    registerHandler('quickGenerate', () => {
        // Always use Default art style
        updateState({ currentArtStyle: artStyles.DEFAULT });

        // Regenerate with new seed
        setSeed(null);

        if (_drawArtworkFn) {
            _drawArtworkFn(artStyles.DEFAULT);
        }
    });

    registerHandler('toggleFullscreen', () => {
        const canvas = getElement('canvas');
        if (!canvas) return;

        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else if (canvas.webkitRequestFullscreen) { /* Safari */
                canvas.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) { /* IE11 */
                canvas.msRequestFullscreen();
            }
            canvas.classList.add('fullscreen-canvas');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    });
}

/**
 * Set up UI components
 */
function setupUIComponents() {
    // Set up UI components by category
    setupColorThemeControls(_drawArtworkFn);
    setupCanvasControls(_drawArtworkFn, _initCanvasFn);
    setupLayerOpacityControls(_drawArtworkFn);
    setupLayerDensityControls(_drawArtworkFn);

    // Initialize Light Rays controls
    initLightRaysControls({
        drawArtwork: _drawArtworkFn
    });

    // Set up window resize handling
    setupWindowResize(_initCanvasFn);

    // Set up fullscreen change listeners
    setupFullscreenChangeListeners(_initCanvasFn);

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();

    // Initialize responsive UI features
    initResponsiveUI();

    // Register responsive UI event handlers
    registerHandler('togglePanel', toggleControlPanel);
}

/**
 * Clean up UI resources
 */
function cleanup() {
    cleanupEventListeners();
    cleanupResponsiveUI();
    _initialized = false;
}

// Public API
export {
    initialize,
    cleanup,
    getElement,
    getElements,
    setValue,
    getValue,
    triggerEvent,
    SETTINGS_KEY
};
