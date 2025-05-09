/**
 * loop.js - Animation loop functionality for the Generative Art Studio
 */

import { generatePalette } from '../palette.js';
import {
    artStyles,
    drawGeometricGrid,
    drawOrganicNoise,
    drawFractalLines,
    drawParticleSwarm,
    drawOrganicSplatters,
    drawGlitchMosaic,
    drawNeonWaves,
    drawPixelSort,
    drawVoronoiCells
} from '../styles/index.js';
import {
    isAnimating,
    animationFrameId,
    lastFrameTime,
    frameCount,
    animationSpeed,
    fpsInterval,
    isInteractive,
    mouseX,
    mouseY,
    bufferCanvas,
    bufferCtx
} from './state.js';
import { stopAnimation } from './stop.js';

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

// Export the animation loop function
export { animationLoop };
