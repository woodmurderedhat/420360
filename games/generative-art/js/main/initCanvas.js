/**
 * initCanvas.js - Canvas initialization for the Generative Art Studio
 */

import { 
    canvas, 
    ctx, 
    canvasWidthInput, 
    canvasHeightInput, 
    backgroundColor, 
    currentArtStyle 
} from './state.js';
import { drawArtwork } from './drawArtwork.js';

/**
 * Initialize the canvas dimensions and sets up event listeners.
 */
function initCanvas() {
    // Reset any existing transformations to avoid cumulative scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = window.devicePixelRatio || 1;

    // Use custom dimensions if provided, otherwise fill viewport
    const w = +canvasWidthInput.value || window.innerWidth;
    const h = +canvasHeightInput.value || window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);

    // Set background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, w, h);

    drawArtwork(currentArtStyle);
}

export { initCanvas };
