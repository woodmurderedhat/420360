/**
 * state.js - Animation state variables for the Generative Art Studio
 * Contains shared state used by animation functions
 */

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

// Export animation state constants
export {
    fpsLimit,
    fpsInterval,
    mouseMoveThrottle
};

// Export mutable animation state variables
export {
    isAnimating,
    animationFrameId,
    lastFrameTime,
    frameCount,
    animationSpeed,
    isInteractive,
    mouseX,
    mouseY,
    lastMouseMoveTime
};

// Export mutable buffer references
export { bufferCanvas, bufferCtx };
