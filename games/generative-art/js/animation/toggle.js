/**
 * toggle.js - Toggle animation functionality for the Generative Art Studio
 */

import { isAnimating } from './state.js';
import { startAnimation } from './start.js';
import { stopAnimation } from './stop.js';

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

// Export the toggle animation function
export { toggleAnimation };
