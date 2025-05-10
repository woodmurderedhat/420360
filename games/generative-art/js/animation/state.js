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

// Export animation state
export {
    isAnimating,
    animationFrameId,
    lastFrameTime,
    frameCount,
    animationSpeed,
    fpsLimit,
    fpsInterval,
    isInteractive,
    mouseX,
    mouseY,
    lastMouseMoveTime,
    mouseMoveThrottle
};

// Export mutable buffer references
export { bufferCanvas, bufferCtx };
