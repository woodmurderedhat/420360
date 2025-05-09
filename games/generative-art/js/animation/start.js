/**
 * start.js - Start animation functionality for the Generative Art Studio
 */

import {
    isAnimating,
    animationSpeed,
    isInteractive,
    frameCount,
    lastFrameTime
} from './state.js';
import { animationLoop } from './loop.js';

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

// Export the start animation function
export { startAnimation };
