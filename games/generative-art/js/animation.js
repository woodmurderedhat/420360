/**
 * animation.js - Animation and interactive functionality for the Generative Art Studio
 * Handles animation loops, frame timing, and interactive features
 */

import { generatePalette } from './palette.js';
import { artStyles } from './styles.js';
import { drawDefaultMasterpiece } from './styles-default.js';

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

/**
 * Initialize animation and interactive features
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function initAnimation(canvas) {
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
    canvas.addEventListener('mousemove', (event) => {
        schedulePointerUpdate(event.clientX, event.clientY);
    });

    // Set up touch tracking for mobile
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        schedulePointerUpdate(touch.clientX, touch.clientY);
    });

    // Handle canvas resize
    window.addEventListener('resize', () => {
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
    });

    // Initialize FPS monitoring
    lastFpsUpdateTime = performance.now();
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
 */
function stopAnimation() {
    if (!isAnimating) return;

    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Clear FPS history when animation stops
    fpsHistory = [];
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
        stopAnimation();
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

    // Common parameters for all styles
    const params = {
        width,
        height,
        frameCount,
        mouseX,
        mouseY,
        isInteractive,
        lineWidth: settings.lineWidth || 1,
        numShapes: settings.numShapes || 100,
        backgroundColor: settings.backgroundColor || '#ffffff',
        colorTheme: settings.colorTheme || 'random',
        baseHue: settings.baseHue || 180,
        saturation: settings.saturation || 70,
        lightness: settings.lightness || 50,

        // Layer opacity settings
        voronoiOpacity: settings.voronoiOpacity || 0.4,
        organicSplattersOpacity: settings.organicSplattersOpacity || 0.3,
        neonWavesOpacity: settings.neonWavesOpacity || 0.6,
        fractalLinesOpacity: settings.fractalLinesOpacity || 0.7,
        geometricGridOpacity: settings.geometricGridOpacity || 0.6,
        particleSwarmOpacity: settings.particleSwarmOpacity || 0.5,
        organicNoiseOpacity: settings.organicNoiseOpacity || 0.3,
        glitchMosaicOpacity: settings.glitchMosaicOpacity || 0.15,
        pixelSortOpacity: settings.pixelSortOpacity || 0.2,

        // New layer opacity settings
        gradientOverlayOpacity: settings.gradientOverlayOpacity || 0.3,
        dotMatrixOpacity: settings.dotMatrixOpacity || 0.4,
        textureOverlayOpacity: settings.textureOverlayOpacity || 0.2,
        symmetricalPatternsOpacity: settings.symmetricalPatternsOpacity || 0.5,
        flowingLinesOpacity: settings.flowingLinesOpacity || 0.4,

        // Layer density settings - apply quality level for adaptive performance
        voronoiDensity: Math.round((settings.voronoiDensity || 15) * qualityLevel),
        organicSplattersDensity: Math.round((settings.organicSplattersDensity || 10) * qualityLevel),
        neonWavesDensity: Math.round((settings.neonWavesDensity || 5) * qualityLevel),
        fractalLinesDensity: Math.round((settings.fractalLinesDensity || 2) * qualityLevel),

        // New layer density settings - apply quality level for adaptive performance
        dotMatrixDensity: Math.round((settings.dotMatrixDensity || 20) * qualityLevel),
        flowingLinesDensity: Math.round((settings.flowingLinesDensity || 8) * qualityLevel),
        symmetricalPatternsDensity: Math.round((settings.symmetricalPatternsDensity || 6) * qualityLevel),

        // Advanced settings
        blendMode: settings.blendMode || 'source-over',
        colorShiftAmount: settings.colorShiftAmount || 0,
        scaleAmount: settings.scaleAmount || 1.0,
        rotationAmount: settings.rotationAmount || 0,

        // Add quality level to params
        qualityLevel: qualityLevel
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
        stopAnimation(); // Stop animation on error
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
    isAnimating,
    isInteractive,
    currentFps,
    qualityLevel
};
