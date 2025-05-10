/**
 * animation.js - Animation and interactive functionality for the Generative Art Studio
 * Handles animation loops, frame timing, and interactive features
 */

import { generatePalette } from './palette.js';
import { artStyles } from './styles.js';
import { drawGeometricGrid, drawOrganicNoise } from './styles.js';
import { drawFractalLines, drawParticleSwarm, drawOrganicSplatters } from './styles-advanced.js';
import { drawGlitchMosaic, drawNeonWaves, drawPixelSort } from './styles-experimental.js';
import { drawVoronoiCells } from './styles-more.js';
import { drawDefaultMasterpiece } from './styles-default.js';

// Animation state
let isAnimating = false;
let animationFrameId = null;
let lastFrameTime = 0;
let frameCount = 0;
let animationSpeed = 50;
let fpsLimit = 60; // Maximum FPS
let fpsInterval = 1000 / fpsLimit;

// Interactive state
let isInteractive = false;
let mouseX = 0;
let mouseY = 0;
let lastMouseMoveTime = 0;
let mouseMoveThrottle = 16; // Throttle mouse events to ~60fps

// Canvas buffer for smoother rendering
let bufferCanvas = null;
let bufferCtx = null;

/**
 * Initialize animation and interactive features
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} settings - Animation settings
 */
function initAnimation(canvas, settings = {}) {
    // Create buffer canvas for smoother rendering
    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferCtx = bufferCanvas.getContext('2d', { alpha: false });

    // Set up throttled mouse tracking for interactive mode
    canvas.addEventListener('mousemove', (event) => {
        const currentTime = performance.now();
        if (currentTime - lastMouseMoveTime < mouseMoveThrottle) return;

        lastMouseMoveTime = currentTime;
        const rect = canvas.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) * (canvas.width / rect.width) / (window.devicePixelRatio || 1);
        mouseY = (event.clientY - rect.top) * (canvas.height / rect.height) / (window.devicePixelRatio || 1);
    });

    // Set up throttled touch tracking for mobile
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();

        const currentTime = performance.now();
        if (currentTime - lastMouseMoveTime < mouseMoveThrottle) return;

        lastMouseMoveTime = currentTime;
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width) / (window.devicePixelRatio || 1);
        mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height) / (window.devicePixelRatio || 1);
    });

    // Handle canvas resize
    window.addEventListener('resize', () => {
        if (bufferCanvas) {
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
        }
    });
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

    // Reset frame counter
    frameCount = 0;
    lastFrameTime = performance.now();

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

    // Control animation speed and respect FPS limit
    const frameDelay = Math.max(fpsInterval, 1000 / (animationSpeed * 0.6));
    if (deltaTime < frameDelay) return;

    // Update frame counter and time
    frameCount++;
    lastFrameTime = currentTime;

    // Get canvas dimensions
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Ensure buffer canvas is properly sized
    if (bufferCanvas.width !== canvas.width || bufferCanvas.height !== canvas.height) {
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
    }

    // Generate palette
    const palette = generatePalette(
        style,
        settings.colorTheme || 'random',
        settings.baseHue || 180,
        settings.saturation || 70,
        settings.lightness || 50
    );

    // Semi-transparent clear for motion trails
    bufferCtx.fillStyle = settings.backgroundColor + '40'; // 25% opacity
    bufferCtx.fillRect(0, 0, width, height);

    // Common parameters for all styles
    const params = {
        width,
        height,
        frameCount,
        mouseX,
        mouseY,
        isInteractive,
        lineWidth: settings.lineWidth || 1,
        numShapes: settings.numShapes || 100
    };

    try {
        // Draw based on selected style
        switch (style) {
            case artStyles.DEFAULT:
                drawDefaultMasterpiece(bufferCtx, palette, true, params);
                break;
            case artStyles.GEOMETRIC_GRID:
                drawGeometricGrid(bufferCtx, palette, true, params);
                break;
            case artStyles.ORGANIC_NOISE:
                drawOrganicNoise(bufferCtx, palette, true, params);
                break;
            case artStyles.FRACTAL_LINES:
                drawFractalLines(bufferCtx, palette, true, params);
                break;
            case artStyles.PARTICLE_SWARM:
                drawParticleSwarm(bufferCtx, palette, true, params);
                break;
            case artStyles.ORGANIC_SPLATTERS:
                drawOrganicSplatters(bufferCtx, palette, true, params);
                break;
            case artStyles.GLITCH_MOSAIC:
                drawGlitchMosaic(bufferCtx, palette, true, params);
                break;
            case artStyles.NEON_WAVES:
                drawNeonWaves(bufferCtx, palette, true, params);
                break;
            case artStyles.PIXEL_SORT:
                drawPixelSort(bufferCtx, palette, true, params);
                break;
            case artStyles.VORONOI_CELLS:
                drawVoronoiCells(bufferCtx, palette, true, params);
                break;
        }

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
    isAnimating,
    isInteractive
};
