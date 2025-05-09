/**
 * init.js - Animation initialization for the Generative Art Studio
 */

import {
    lastMouseMoveTime,
    mouseMoveThrottle,
    mouseX,
    mouseY,
    bufferCanvas,
    bufferCtx
} from './state.js';

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

// Export the initialization function
export { initAnimation };
