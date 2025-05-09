/**
 * handleFullscreenChange.js - Handle fullscreen change for the Generative Art Studio
 */

import { canvas } from './state.js';
import { initCanvas } from './initCanvas.js';

/**
 * Handle fullscreen change events
 */
function handleFullscreenChange() {
    if (!document.fullscreenElement) {
        canvas.classList.remove('fullscreen-canvas');
        // Redraw to adjust to new size
        initCanvas();
    }
}

export { handleFullscreenChange };
