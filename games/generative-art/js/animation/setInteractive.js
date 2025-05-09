/**
 * setInteractive.js - Set interactive mode functionality for the Generative Art Studio
 */

import { isInteractive } from './state.js';

/**
 * Set the interactive mode
 * @param {boolean} interactive - Whether interactive mode is enabled
 */
function setInteractiveMode(interactive) {
    isInteractive = interactive;
}

// Export the set interactive mode function
export { setInteractiveMode };
