/**
 * animation-controls.js - Animation controls for the Generative Art Studio
 * Handles UI controls for animation settings and functionality
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import {
    startAnimation,
    stopAnimation,
    setAnimationSpeed,
    setInteractiveMode,
    setAdaptiveQuality,
    cleanupAnimationResources,
    currentFps,
    qualityLevel
} from '../animation.js';

// Animation controls configuration
const animationControls = [
    { id: 'animationSpeed', stateKey: 'animationSpeed', defaultValue: 50, min: 1, max: 100 }
];

// FPS monitoring interval
let fpsMonitoringInterval = null;

/**
 * Set up animation controls
 * @param {Function} drawArtworkFn - Function to draw artwork
 */
function setupAnimationControls(drawArtworkFn) {
    try {
        const animationToggle = getElement('animationToggle');
        const animationSpeedInput = getElement('animationSpeed');
        const interactiveToggle = getElement('interactiveToggle');
        const adaptiveQualityToggle = getElement('adaptiveQualityToggle');
        const fpsDisplay = getElement('fpsDisplay');
        const canvas = getElement('canvas');
        const ctx = getElement('ctx');
        
        if (!animationToggle || !canvas || !ctx) return;
        
        // Set initial values from state
        const state = getState();
        if (state.animationEnabled !== undefined) {
            animationToggle.checked = state.animationEnabled;
            if (animationSpeedInput) {
                animationSpeedInput.disabled = !state.animationEnabled;
            }
        }
        
        if (state.interactiveMode !== undefined && interactiveToggle) {
            interactiveToggle.checked = state.interactiveMode;
        }
        
        if (state.adaptiveQuality !== undefined && adaptiveQualityToggle) {
            adaptiveQualityToggle.checked = state.adaptiveQuality;
        }
        
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
                
                // Start animation with all state parameters
                startAnimation(canvas, ctx, state.currentArtStyle, {
                    // Basic settings
                    animationSpeed: getValue('animationSpeed') || 50,
                    isInteractive: getValue('interactiveToggle') || false,
                    adaptiveQuality: getValue('adaptiveQualityToggle') || true,
                    backgroundColor: state.backgroundColor,
                    colorTheme: state.colorTheme,
                    baseHue: state.baseHue,
                    saturation: state.saturation,
                    lightness: state.lightness,
                    lineWidth: state.lineWidth,
                    numShapes: state.numShapes,
                    
                    // Pass the entire state to ensure all parameters are available
                    ...state
                });
                
                // Start FPS display update
                if (fpsDisplay) {
                    startFpsMonitoring();
                }
                
                // Update state
                updateState({ animationEnabled: true });
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
                if (drawArtworkFn) {
                    drawArtworkFn(getState().currentArtStyle);
                }
                
                // Stop FPS display update
                if (fpsDisplay) {
                    stopFpsMonitoring();
                    fpsDisplay.textContent = '-';
                }
                
                // Update state
                updateState({ animationEnabled: false });
            }
        });
        
        // Animation speed slider
        if (animationSpeedInput) {
            // Set initial value from state
            if (state.animationSpeed !== undefined) {
                animationSpeedInput.value = state.animationSpeed;
                const animationSpeedDisplay = getElement('animationSpeedDisplay');
                if (animationSpeedDisplay) {
                    animationSpeedDisplay.textContent = state.animationSpeed;
                }
            }
            
            addListener('animationSpeed', 'input', () => {
                const animationSpeed = getValue('animationSpeed');
                const animationSpeedDisplay = getElement('animationSpeedDisplay');
                
                if (animationSpeedDisplay) {
                    animationSpeedDisplay.textContent = animationSpeed;
                }
                
                setAnimationSpeed(animationSpeed);
                
                // Update state
                updateState({ animationSpeed });
            });
        }
        
        // Interactive mode toggle
        if (interactiveToggle) {
            addListener('interactiveToggle', 'change', () => {
                const isInteractive = getValue('interactiveToggle');
                setInteractiveMode(isInteractive);
                
                // Update state
                updateState({ interactiveMode: isInteractive });
            });
        }
        
        // Adaptive quality toggle
        if (adaptiveQualityToggle) {
            addListener('adaptiveQualityToggle', 'change', () => {
                const adaptiveQuality = getValue('adaptiveQualityToggle');
                setAdaptiveQuality(adaptiveQuality);
                
                // Update state
                updateState({ adaptiveQuality });
            });
        }
        
        // Register animation event handlers
        registerHandler('toggleAnimation', () => {
            if (animationToggle) {
                animationToggle.checked = !animationToggle.checked;
                animationToggle.dispatchEvent(new Event('change'));
            }
        });
        
        // Register reset event handler
        registerHandler('resetAnimation', () => {
            resetAnimationControls();
            
            // Redraw artwork if not animating
            if (!getState().animationEnabled && drawArtworkFn) {
                drawArtworkFn(getState().currentArtStyle, false);
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'setupAnimationControls',
            message: 'Error setting up animation controls'
        });
    }
}

/**
 * Start FPS monitoring
 */
function startFpsMonitoring() {
    try {
        const fpsDisplay = getElement('fpsDisplay');
        const qualityLevelDisplay = getElement('qualityLevelDisplay');
        
        if (!fpsDisplay) return;
        
        // Clear any existing interval
        stopFpsMonitoring();
        
        // Update FPS display every 500ms
        fpsMonitoringInterval = setInterval(() => {
            fpsDisplay.textContent = currentFps().toFixed(1);
            
            if (qualityLevelDisplay) {
                qualityLevelDisplay.textContent = `${(qualityLevel() * 100).toFixed(0)}%`;
            }
        }, 500);
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
            component: 'startFpsMonitoring',
            message: 'Error starting FPS monitoring'
        });
    }
}

/**
 * Stop FPS monitoring
 */
function stopFpsMonitoring() {
    if (fpsMonitoringInterval) {
        clearInterval(fpsMonitoringInterval);
        fpsMonitoringInterval = null;
    }
}

/**
 * Reset animation controls to default values
 */
function resetAnimationControls() {
    try {
        const animationToggle = getElement('animationToggle');
        const animationSpeedInput = getElement('animationSpeed');
        const animationSpeedDisplay = getElement('animationSpeedDisplay');
        const interactiveToggle = getElement('interactiveToggle');
        const adaptiveQualityToggle = getElement('adaptiveQualityToggle');
        
        // Stop animation if running
        if (animationToggle && animationToggle.checked) {
            animationToggle.checked = false;
            animationToggle.dispatchEvent(new Event('change'));
        }
        
        // Reset animation speed
        if (animationSpeedInput) {
            animationSpeedInput.value = 50;
            if (animationSpeedDisplay) {
                animationSpeedDisplay.textContent = 50;
            }
        }
        
        // Reset interactive mode
        if (interactiveToggle) {
            interactiveToggle.checked = false;
        }
        
        // Reset adaptive quality
        if (adaptiveQualityToggle) {
            adaptiveQualityToggle.checked = true;
        }
        
        // Update state
        updateState({
            animationEnabled: false,
            animationSpeed: 50,
            interactiveMode: false,
            adaptiveQuality: true
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'resetAnimationControls',
            message: 'Error resetting animation controls'
        });
    }
}

// Public API
export {
    setupAnimationControls,
    startFpsMonitoring,
    stopFpsMonitoring,
    resetAnimationControls,
    animationControls
};
