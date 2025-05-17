/**
 * controls.js - UI controls for the Generative Art Studio
 * Handles UI control setup and interactions
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { clearPaletteCache } from '../palette.js';
import { setSeed } from '../utils.js';
import { artStyles } from '../styles.js';
import {
    startAnimation,
    stopAnimation,
    setAnimationSpeed,
    setInteractiveMode,
    setAdaptiveQuality,
    cleanupAnimationResources
} from '../animation.js';

// Local storage key for settings
const SETTINGS_KEY = 'generativeArtSettings';

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
 * Set up animation controls
 * @param {Function} drawArtwork - Function to draw artwork
 */
function setupAnimationControls(drawArtwork) {
    const animationToggle = getElement('animationToggle');
    const animationSpeedInput = getElement('animationSpeedInput');
    const interactiveToggle = getElement('interactiveToggle');
    const adaptiveQualityToggle = getElement('adaptiveQualityToggle');
    const fpsDisplay = getElement('fpsDisplay');
    const canvas = getElement('canvas');
    const ctx = getElement('ctx');
    
    if (!animationToggle || !canvas || !ctx) return;
    
    // Animation toggle
    addListener('animationToggle', 'change', () => {
        const isAnimating = getValue('animationToggle');
        
        if (isAnimating) {
            // Enable animation speed slider
            if (animationSpeedInput) {
                animationSpeedInput.disabled = false;
            }
            
            // Get current state
            const state = getState();
            
            // Start animation
            startAnimation(canvas, ctx, state.currentArtStyle, {
                animationSpeed: getValue('animationSpeedInput') || 50,
                isInteractive: getValue('interactiveToggle') || false,
                backgroundColor: state.backgroundColor,
                colorTheme: state.colorTheme,
                baseHue: state.baseHue,
                saturation: state.saturation,
                lightness: state.lightness,
                lineWidth: state.lineWidth,
                numShapes: state.numShapes
            });
            
            // Start FPS display update
            if (fpsDisplay) {
                startFpsMonitoring();
            }
        } else {
            // Disable animation speed slider
            if (animationSpeedInput) {
                animationSpeedInput.disabled = true;
            }
            
            // Stop animation with full cleanup
            stopAnimation(true);
            
            // Ensure all resources are properly cleaned up
            cleanupAnimationResources();
            
            // Redraw static artwork
            if (drawArtwork) {
                drawArtwork(getState().currentArtStyle);
            }
            
            // Stop FPS display update
            if (fpsDisplay) {
                stopFpsMonitoring();
                fpsDisplay.textContent = '-';
            }
        }
    });
    
    // Animation speed slider
    if (animationSpeedInput) {
        addListener('animationSpeedInput', 'input', () => {
            const animationSpeed = getValue('animationSpeedInput');
            const animationSpeedDisplay = getElement('animationSpeedDisplay');
            
            if (animationSpeedDisplay) {
                animationSpeedDisplay.textContent = animationSpeed;
            }
            
            setAnimationSpeed(animationSpeed);
        });
    }
    
    // Interactive mode toggle
    if (interactiveToggle) {
        addListener('interactiveToggle', 'change', () => {
            setInteractiveMode(getValue('interactiveToggle'));
        });
    }
    
    // Adaptive quality toggle
    if (adaptiveQualityToggle) {
        addListener('adaptiveQualityToggle', 'change', () => {
            setAdaptiveQuality(getValue('adaptiveQualityToggle'));
        });
    }
    
    // FPS monitoring
    let fpsMonitoringInterval = null;
    
    function startFpsMonitoring() {
        if (fpsMonitoringInterval) {
            clearInterval(fpsMonitoringInterval);
        }
        
        fpsMonitoringInterval = setInterval(() => {
            if (fpsDisplay) {
                // Import these dynamically to avoid circular dependencies
                const { currentFps, qualityLevel } = require('../animation.js');
                
                fpsDisplay.textContent = currentFps;
                
                // Update quality level display if it exists
                const qualityDisplay = document.getElementById('qualityLevelDisplay');
                if (qualityDisplay) {
                    qualityDisplay.textContent = Math.round(qualityLevel * 100) + '%';
                }
            }
        }, 500);
    }
    
    function stopFpsMonitoring() {
        if (fpsMonitoringInterval) {
            clearInterval(fpsMonitoringInterval);
            fpsMonitoringInterval = null;
        }
    }
    
    // Register animation event handlers
    registerHandler('toggleAnimation', () => {
        if (animationToggle) {
            animationToggle.checked = !animationToggle.checked;
            animationToggle.dispatchEvent(new Event('change'));
        }
    });
}

/**
 * Set up slider display updates
 */
function setupSliderDisplays() {
    // Map of input IDs to display elements
    const sliderDisplayMap = {
        'numShapes': getElement('numShapesDisplay'),
        'lineWidth': getElement('lineWidthDisplay'),
        'baseHue': getElement('baseHueDisplay'),
        'saturation': getElement('saturationDisplay'),
        'lightness': getElement('lightnessDisplay'),
        'animationSpeed': getElement('animationSpeedDisplay')
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
    SETTINGS_KEY,
    setupColorThemeControls,
    setupAnimationControls,
    setupSliderDisplays
};
