/**
 * index.js - Main UI module for the Generative Art Studio
 * Coordinates UI components and provides a unified interface
 */

import { getElement, getElements, hasRequiredElements, addListener, setValue, getValue } from './components.js';
import { registerHandler, triggerEvent, setupKeyboardShortcuts, setupWindowResize, setupFullscreenChangeListeners, cleanupEventListeners } from './events.js';
import { SETTINGS_KEY, setupColorThemeControls, setupAnimationControls, setupSliderDisplays } from './controls.js';
import { setupGalleryModalControls, openGallery } from './gallery-ui.js';
import { initResponsiveUI, toggleControlPanel, cleanupResponsiveUI } from './responsive.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { setSeed } from '../utils.js';
import { saveToGallery } from '../gallery.js';
import { saveToHistory, undo, redo, updateHistoryButtons } from '../history.js';
import { cleanupAnimationResources, stopAnimation } from '../animation.js';
import { clearPaletteCache } from '../palette.js';
import { artStyles } from '../styles.js';

// Private module state
let _initialized = false;
let _drawArtworkFn = null;
let _initCanvasFn = null;
let _getCurrentAppStateFn = null;
let _applyAppStateFn = null;

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
        _getCurrentAppStateFn = options.getCurrentAppState;
        _applyAppStateFn = options.applyAppState;

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
        // Stop animation if running with full cleanup
        const animationToggle = getElement('animationToggle');
        if (animationToggle && animationToggle.checked) {
            stopAnimation(true); // Full cleanup
            animationToggle.checked = false;
        }

        // Ensure resources are cleaned up before regenerating
        cleanupAnimationResources();

        if (_drawArtworkFn) {
            _drawArtworkFn(getState().currentArtStyle);
        }
    });

    // Export button
    addListener('exportButton', 'click', () => {
        triggerEvent('export');
    });

    // Gallery button
    addListener('galleryButton', 'click', () => {
        openGallery();
    });

    // Save to gallery button
    addListener('saveToGalleryButton', 'click', () => {
        const canvas = getElement('canvas');
        if (!canvas) return;

        const state = getState();
        const settings = {
            style: state.currentArtStyle,
            numShapes: state.numShapes,
            lineWidth: state.lineWidth,
            seed: getValue('seedInput'),
            colorTheme: state.colorTheme,
            baseHue: state.baseHue,
            saturation: state.saturation,
            lightness: state.lightness,
            backgroundColor: state.backgroundColor
        };

        saveToGallery(canvas, settings);
        alert('Artwork saved to gallery!');
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

    // Toggle panel visibility
    addListener('togglePanelButton', 'click', () => {
        const controlsPanel = getElement('controlsPanel');
        const togglePanelButton = getElement('togglePanelButton');

        if (!controlsPanel || !togglePanelButton) return;

        if (controlsPanel.style.display === 'none') {
            controlsPanel.style.display = 'flex';
            togglePanelButton.textContent = 'Hide Settings';
            togglePanelButton.title = 'Toggle settings panel';
        } else {
            controlsPanel.style.display = 'none';
            togglePanelButton.textContent = 'Show Settings';
            togglePanelButton.title = 'Toggle settings panel';
        }
    });

    // Apply settings and re-render
    addListener('applySettingsBtn', 'click', () => {
        const canvas = getElement('canvas');
        const ctx = getElement('ctx');
        if (!canvas || !ctx) return;

        // Reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Get current state
        const state = getState();

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

        // Update state
        updateState(newState);

        // Update display
        const currentSeedDisplay = getElement('currentSeedDisplay');
        if (currentSeedDisplay) {
            currentSeedDisplay.textContent = seedValue || 'random';
        }

        // Save state to history
        if (_getCurrentAppStateFn) {
            saveToHistory(_getCurrentAppStateFn());
            updateHistoryButtons();
        }

        // Redraw artwork
        if (_drawArtworkFn) {
            _drawArtworkFn('Default');
        }
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

    registerHandler('undo', () => {
        undo();
        if (_applyAppStateFn) _applyAppStateFn(getState());
    });

    registerHandler('redo', () => {
        redo();
        if (_applyAppStateFn) _applyAppStateFn(getState());
    });

    registerHandler('quickGenerate', ({ preset }) => {
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
    // Set up UI components
    setupColorThemeControls();
    setupAnimationControls(_drawArtworkFn);
    setupSliderDisplays();
    setupGalleryModalControls();

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
    cleanupAnimationResources();
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
    openGallery,
    SETTINGS_KEY
};
