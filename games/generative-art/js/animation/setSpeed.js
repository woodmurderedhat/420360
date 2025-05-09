/**
 * setSpeed.js - Set animation speed functionality for the Generative Art Studio
 */

import { animationSpeed } from './state.js';

/**
 * Set the animation speed
 * @param {number} speed - The animation speed (1-100)
 */
function setAnimationSpeed(speed) {
    animationSpeed = Math.max(1, Math.min(100, speed));
}

// Export the set animation speed function
export { setAnimationSpeed };
