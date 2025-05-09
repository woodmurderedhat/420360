/**
 * index.js - Re-exports all animation functionality from the animation directory
 * This file makes it easier to import all animation functions from a single location
 */

// Import and re-export animation state
import {
    isAnimating,
    isInteractive
} from './state.js';

// Import and re-export animation functions
import { initAnimation } from './init.js';
import { startAnimation } from './start.js';
import { stopAnimation } from './stop.js';
import { toggleAnimation } from './toggle.js';
import { setAnimationSpeed } from './setSpeed.js';
import { setInteractiveMode } from './setInteractive.js';
import { animationLoop } from './loop.js';

// Export all animation functionality
export {
    // State
    isAnimating,
    isInteractive,
    
    // Functions
    initAnimation,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationSpeed,
    setInteractiveMode,
    animationLoop
};
