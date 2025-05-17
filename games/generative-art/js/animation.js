/**
 * animation.js - Animation and interactive functionality for the Generative Art Studio
 * Handles animation loops, frame timing, and interactive features
 */

import { generatePalette } from './palette.js';
import { artStyles } from './styles.js';
import { drawDefaultMasterpiece } from './styles-default.js';
import { handleError, ErrorType, ErrorSeverity } from './error-service.js';

// Animation state
let isAnimating = false;
let animationFrameId = null;
let lastFrameTime = 0;
let frameCount = 0;
let animationSpeed = 50;
let fpsLimit = 60; // Maximum FPS
let fpsInterval = 1000 / fpsLimit;

// Canvas buffers
let bufferCanvas = null;
let bufferCtx = null;

// Performance monitoring
let fpsHistory = [];
let lastFpsUpdateTime = 0;
let currentFps = 0;
let adaptiveQualityEnabled = true;
let qualityLevel = 1.0; // 1.0 = full quality, lower values reduce quality

// Interactive state
let isInteractive = false;
let mouseX = 0;
let mouseY = 0;

// Layer caching system
let staticCanvas = null;
let staticCtx = null;
let dynamicCanvas = null;
let dynamicCtx = null;
let staticLayersDirty = true; // Flag to indicate if static layers need redrawing
let lastStaticParams = null; // Store parameters to detect changes

// Event listener tracking for proper cleanup
let eventListeners = [];
let resizeObserver = null;

/**
 * Initialize animation and interactive features
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function initAnimation(canvas) {
    // Clean up any existing resources first
    cleanupAnimationResources();

    // Create buffer canvas for smoother rendering
    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferCtx = bufferCanvas.getContext('2d', { alpha: false });

    // Initialize layer caching system
    // Static canvas - for elements that don't change every frame
    staticCanvas = document.createElement('canvas');
    staticCanvas.width = canvas.width;
    staticCanvas.height = canvas.height;
    staticCtx = staticCanvas.getContext('2d', { alpha: true });

    // Dynamic canvas - for elements that change every frame
    dynamicCanvas = document.createElement('canvas');
    dynamicCanvas.width = canvas.width;
    dynamicCanvas.height = canvas.height;
    dynamicCtx = dynamicCanvas.getContext('2d', { alpha: true });

    // Mark static layers as needing redraw
    staticLayersDirty = true;

    // Helper function to update mouse/touch position
    const updatePointerPosition = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (clientX - rect.left) * (canvas.width / rect.width) / (window.devicePixelRatio || 1);
        mouseY = (clientY - rect.top) * (canvas.height / rect.height) / (window.devicePixelRatio || 1);
    };

    // Use a more efficient throttling approach with requestAnimationFrame
    let pointerUpdateScheduled = false;

    const schedulePointerUpdate = (clientX, clientY) => {
        // Store the latest position
        const latestX = clientX;
        const latestY = clientY;

        // Only schedule an update if one isn't already pending
        if (!pointerUpdateScheduled) {
            pointerUpdateScheduled = true;

            requestAnimationFrame(() => {
                updatePointerPosition(latestX, latestY);
                pointerUpdateScheduled = false;
            });
        }
    };

    // Set up mouse tracking for interactive mode
    const mouseMoveHandler = (event) => {
        schedulePointerUpdate(event.clientX, event.clientY);
    };
    canvas.addEventListener('mousemove', mouseMoveHandler);
    eventListeners.push({ element: canvas, type: 'mousemove', handler: mouseMoveHandler });

    // Set up touch tracking for mobile
    const touchMoveHandler = (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        schedulePointerUpdate(touch.clientX, touch.clientY);
    };
    canvas.addEventListener('touchmove', touchMoveHandler);
    eventListeners.push({ element: canvas, type: 'touchmove', handler: touchMoveHandler });

    // Handle canvas resize
    const resizeHandler = () => {
        if (bufferCanvas) {
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
        }

        // Resize layer canvases
        if (staticCanvas) {
            staticCanvas.width = canvas.width;
            staticCanvas.height = canvas.height;
            staticLayersDirty = true; // Need to redraw static layers after resize
        }

        if (dynamicCanvas) {
            dynamicCanvas.width = canvas.width;
            dynamicCanvas.height = canvas.height;
        }
    };
    window.addEventListener('resize', resizeHandler);
    eventListeners.push({ element: window, type: 'resize', handler: resizeHandler });

    // Use ResizeObserver for more reliable canvas size monitoring
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === canvas) {
                    resizeHandler();
                    break;
                }
            }
        });
        resizeObserver.observe(canvas);
    }

    // Initialize FPS monitoring
    lastFpsUpdateTime = performance.now();
}

/**
 * Clean up animation resources to prevent memory leaks
 */
function cleanupAnimationResources() {
    // Cancel any ongoing animation
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Remove all event listeners
    eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
    });
    eventListeners = [];

    // Disconnect ResizeObserver if it exists
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    // Release canvas references
    if (bufferCtx) {
        bufferCtx = null;
    }
    if (bufferCanvas) {
        bufferCanvas.width = 1;
        bufferCanvas.height = 1;
        bufferCanvas = null;
    }

    if (staticCtx) {
        staticCtx = null;
    }
    if (staticCanvas) {
        staticCanvas.width = 1;
        staticCanvas.height = 1;
        staticCanvas = null;
    }

    if (dynamicCtx) {
        dynamicCtx = null;
    }
    if (dynamicCanvas) {
        dynamicCanvas.width = 1;
        dynamicCanvas.height = 1;
        dynamicCanvas = null;
    }

    // Reset animation state
    isAnimating = false;
    lastFrameTime = 0;
    frameCount = 0;

    // Reset performance monitoring
    fpsHistory = [];
    lastFpsUpdateTime = 0;
    currentFps = 0;

    // Reset layer caching
    staticLayersDirty = true;
    lastStaticParams = null;
}

/**
 * Start the animation loop
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} style - The current art style
 * @param {Object} settings - Animation settings
 */
function startAnimation(canvas, ctx, style, settings = {}) {
    if (isAnimating) return;

    isAnimating = true;
    animationSpeed = settings.animationSpeed || 50;
    isInteractive = settings.isInteractive || false;

    // Reset frame counter and FPS monitoring
    frameCount = 0;
    lastFrameTime = performance.now();
    lastFpsUpdateTime = performance.now();
    fpsHistory = [];
    currentFps = 0;

    // Mark static layers as needing redraw when animation starts
    staticLayersDirty = true;
    lastStaticParams = null;

    // Start the animation loop
    animationLoop(canvas, ctx, style, settings);
}

/**
 * Stop the animation loop
 * @param {boolean} fullCleanup - Whether to perform a full cleanup of resources
 */
function stopAnimation(fullCleanup = false) {
    if (!isAnimating && !fullCleanup) return;

    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Clear FPS history when animation stops
    fpsHistory = [];

    // If full cleanup requested, release all resources
    if (fullCleanup) {
        cleanupAnimationResources();
    }
}

/**
 * Toggle animation on/off
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} style - The current art style
 * @param {Object} settings - Animation settings
 * @returns {boolean} The new animation state
 */
function toggleAnimation(canvas, ctx, style, settings = {}) {
    if (isAnimating) {
        stopAnimation(false); // Don't do full cleanup on toggle
    } else {
        startAnimation(canvas, ctx, style, settings);
    }
    return isAnimating;
}

/**
 * Set the animation speed
 * @param {number} speed - The animation speed (1-100)
 */
function setAnimationSpeed(speed) {
    animationSpeed = Math.max(1, Math.min(100, speed));
}

/**
 * Set the interactive mode
 * @param {boolean} interactive - Whether interactive mode is enabled
 */
function setInteractiveMode(interactive) {
    isInteractive = interactive;
}

/**
 * Update FPS monitoring
 * @param {number} currentTime - Current timestamp
 * @returns {number} - Current FPS
 */
function updateFpsMonitoring(currentTime) {
    // Calculate FPS
    const elapsed = currentTime - lastFpsUpdateTime;

    // Only update FPS every 500ms to get a stable reading
    if (elapsed >= 500) {
        currentFps = Math.round(fpsHistory.length / (elapsed / 1000));

        // Reset for next update
        lastFpsUpdateTime = currentTime;
        fpsHistory = [];

        // Adjust quality level based on FPS if adaptive quality is enabled
        if (adaptiveQualityEnabled) {
            if (currentFps < 30 && qualityLevel > 0.5) {
                // Reduce quality if FPS is too low
                qualityLevel = Math.max(0.5, qualityLevel - 0.1);
            } else if (currentFps > 55 && qualityLevel < 1.0) {
                // Increase quality if FPS is good
                qualityLevel = Math.min(1.0, qualityLevel + 0.05);
            }
        }
    }

    // Add frame to history
    fpsHistory.push(currentTime);

    return currentFps;
}

/**
 * Enable or disable adaptive quality
 * @param {boolean} enabled - Whether adaptive quality is enabled
 */
function setAdaptiveQuality(enabled) {
    adaptiveQualityEnabled = enabled;
    if (enabled) {
        // Reset quality level when enabling
        qualityLevel = 1.0;
    }
}

/**
 * Check if parameters have changed enough to require redrawing static layers
 * @param {Object} currentParams - Current parameters
 * @param {Object} lastParams - Last parameters used for static layers
 * @returns {boolean} - Whether static layers need redrawing
 */
function haveStaticParamsChanged(currentParams, lastParams) {
    if (!lastParams) return true;

    // Check if any non-animation parameters have changed
    const keysToCheck = [
        'backgroundColor', 'colorTheme', 'baseHue', 'saturation', 'lightness',
        'voronoiOpacity', 'organicSplattersOpacity', 'neonWavesOpacity', 'fractalLinesOpacity',
        'geometricGridOpacity', 'particleSwarmOpacity', 'organicNoiseOpacity', 'glitchMosaicOpacity',
        'pixelSortOpacity', 'gradientOverlayOpacity', 'dotMatrixOpacity', 'textureOverlayOpacity',
        'symmetricalPatternsOpacity', 'flowingLinesOpacity', 'voronoiDensity', 'organicSplattersDensity',
        'neonWavesDensity', 'fractalLinesDensity', 'dotMatrixDensity', 'flowingLinesDensity',
        'symmetricalPatternsDensity', 'blendMode', 'colorShiftAmount', 'scaleAmount', 'rotationAmount'
    ];

    for (const key of keysToCheck) {
        if (currentParams[key] !== lastParams[key]) {
            return true;
        }
    }

    return false;
}

/**
 * The main animation loop
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} style - The current art style
 * @param {Object} settings - Animation settings
 */
function animationLoop(canvas, ctx, style, settings = {}) {
    if (!isAnimating) return;

    // Request next frame first for smoother animation
    animationFrameId = requestAnimationFrame(() => animationLoop(canvas, ctx, style, settings));

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    // Update FPS monitoring
    updateFpsMonitoring(currentTime);

    // Control animation speed and respect FPS limit
    const frameDelay = Math.max(fpsInterval, 1000 / (animationSpeed * 0.6));
    if (deltaTime < frameDelay) return;

    // Update frame counter and time
    frameCount++;
    lastFrameTime = currentTime;

    // Get canvas dimensions
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Ensure all canvases are properly sized
    if (bufferCanvas.width !== canvas.width || bufferCanvas.height !== canvas.height) {
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        staticCanvas.width = canvas.width;
        staticCanvas.height = canvas.height;
        dynamicCanvas.width = canvas.width;
        dynamicCanvas.height = canvas.height;
        staticLayersDirty = true; // Need to redraw static layers after resize
    }

    // Generate palette
    const palette = generatePalette(
        style,
        settings.colorTheme || 'random',
        settings.baseHue || 180,
        settings.saturation || 70,
        settings.lightness || 50
    );

    // Common parameters for all styles - use default values from state.js if settings not provided
    const params = {
        // Animation-specific parameters
        width,
        height,
        frameCount,
        mouseX,
        mouseY,
        isInteractive,
        qualityLevel,

        // Basic settings
        lineWidth: settings.lineWidth !== undefined ? settings.lineWidth : 1,
        numShapes: settings.numShapes !== undefined ? settings.numShapes : 100,
        backgroundColor: settings.backgroundColor || '#ffffff',
        colorTheme: settings.colorTheme || 'random',
        baseHue: settings.baseHue !== undefined ? settings.baseHue : 180,
        saturation: settings.saturation !== undefined ? settings.saturation : 70,
        lightness: settings.lightness !== undefined ? settings.lightness : 50,

        // Layer opacity settings - use settings values if provided, otherwise use defaults
        voronoiOpacity: settings.voronoiOpacity !== undefined ? settings.voronoiOpacity : 0.7,
        organicSplattersOpacity: settings.organicSplattersOpacity !== undefined ? settings.organicSplattersOpacity : 0.6,
        neonWavesOpacity: settings.neonWavesOpacity !== undefined ? settings.neonWavesOpacity : 0.5,
        fractalLinesOpacity: settings.fractalLinesOpacity !== undefined ? settings.fractalLinesOpacity : 0.6,
        geometricGridOpacity: settings.geometricGridOpacity !== undefined ? settings.geometricGridOpacity : 0.7,
        particleSwarmOpacity: settings.particleSwarmOpacity !== undefined ? settings.particleSwarmOpacity : 0.7,
        organicNoiseOpacity: settings.organicNoiseOpacity !== undefined ? settings.organicNoiseOpacity : 0.5,
        glitchMosaicOpacity: settings.glitchMosaicOpacity !== undefined ? settings.glitchMosaicOpacity : 0.6,
        pixelSortOpacity: settings.pixelSortOpacity !== undefined ? settings.pixelSortOpacity : 0.7,
        gradientOverlayOpacity: settings.gradientOverlayOpacity !== undefined ? settings.gradientOverlayOpacity : 0.3,
        dotMatrixOpacity: settings.dotMatrixOpacity !== undefined ? settings.dotMatrixOpacity : 0.6,
        textureOverlayOpacity: settings.textureOverlayOpacity !== undefined ? settings.textureOverlayOpacity : 0.4,
        symmetricalPatternsOpacity: settings.symmetricalPatternsOpacity !== undefined ? settings.symmetricalPatternsOpacity : 0.7,
        flowingLinesOpacity: settings.flowingLinesOpacity !== undefined ? settings.flowingLinesOpacity : 0.6,

        // Layer density settings - apply quality level for adaptive performance
        voronoiDensity: Math.round((settings.voronoiDensity !== undefined ? settings.voronoiDensity : 50) * qualityLevel),
        organicSplattersDensity: Math.round((settings.organicSplattersDensity !== undefined ? settings.organicSplattersDensity : 50) * qualityLevel),
        neonWavesDensity: Math.round((settings.neonWavesDensity !== undefined ? settings.neonWavesDensity : 50) * qualityLevel),
        fractalLinesDensity: Math.round((settings.fractalLinesDensity !== undefined ? settings.fractalLinesDensity : 50) * qualityLevel),
        dotMatrixDensity: Math.round((settings.dotMatrixDensity !== undefined ? settings.dotMatrixDensity : 50) * qualityLevel),
        flowingLinesDensity: Math.round((settings.flowingLinesDensity !== undefined ? settings.flowingLinesDensity : 50) * qualityLevel),
        symmetricalPatternsDensity: Math.round((settings.symmetricalPatternsDensity !== undefined ? settings.symmetricalPatternsDensity : 50) * qualityLevel),

        // Advanced settings
        blendMode: settings.blendMode || 'normal',
        colorShiftAmount: settings.colorShiftAmount !== undefined ? settings.colorShiftAmount : 0,
        scaleAmount: settings.scaleAmount !== undefined ? settings.scaleAmount : 1.0,
        rotationAmount: settings.rotationAmount !== undefined ? settings.rotationAmount : 0
    };

    try {
        // Check if static layers need to be redrawn
        if (staticLayersDirty || haveStaticParamsChanged(params, lastStaticParams)) {
            // Create a copy of params without animation-specific properties
            const staticParams = { ...params };
            staticParams.isAnimationFrame = false;

            // Clear static canvas
            staticCtx.clearRect(0, 0, width, height);

            // Draw background on static canvas
            staticCtx.fillStyle = params.backgroundColor;
            staticCtx.fillRect(0, 0, width, height);

            // Draw static layers
            drawDefaultMasterpiece(staticCtx, palette, false, staticParams);

            // Update static layer state
            staticLayersDirty = false;
            lastStaticParams = { ...params };
        }

        // Clear dynamic canvas for this frame
        dynamicCtx.clearRect(0, 0, width, height);

        // For dynamic elements, we use a semi-transparent background to create motion trails
        if (isInteractive || frameCount > 1) {
            dynamicCtx.fillStyle = params.backgroundColor + '40'; // 25% opacity
            dynamicCtx.fillRect(0, 0, width, height);
        }

        // Create dynamic-only params that indicate we're only drawing dynamic elements
        const dynamicParams = { ...params };
        dynamicParams.isAnimationFrame = true;
        dynamicParams.dynamicElementsOnly = true;

        // Draw dynamic elements
        drawDefaultMasterpiece(dynamicCtx, palette, true, dynamicParams);

        // Combine layers onto the buffer canvas
        bufferCtx.clearRect(0, 0, width, height);
        bufferCtx.drawImage(staticCanvas, 0, 0);
        bufferCtx.drawImage(dynamicCanvas, 0, 0);

        // Copy buffer to main canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bufferCanvas, 0, 0);
    } catch (error) {
        console.error('Animation error:', error);
        // Stop animation with full cleanup on error
        stopAnimation(true);

        // Show error to user using error service
        try {
            handleError(error, ErrorType.ANIMATION, ErrorSeverity.ERROR, {
                component: 'animationLoop',
                message: 'Error in animation loop'
            });
        } catch (e) {
            // Fallback if error service fails
            console.error('Failed to handle animation error:', e);
        }
    }
}

// Export animation functions
export {
    initAnimation,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationSpeed,
    setInteractiveMode,
    setAdaptiveQuality,
    cleanupAnimationResources,
    isAnimating,
    isInteractive,
    currentFps,
    qualityLevel
};
