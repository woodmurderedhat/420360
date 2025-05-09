/**
 * stop.js - Stop animation functionality for the Generative Art Studio
 */

import {
    isAnimating,
    animationFrameId
} from './state.js';

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

// Export the stop animation function
export { stopAnimation };
