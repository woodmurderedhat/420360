/**
 * toggleFullscreen.js - Toggle fullscreen functionality for the Generative Art Studio
 */

import { canvas } from './state.js';

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (canvas.webkitRequestFullscreen) { /* Safari */
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { /* IE11 */
            canvas.msRequestFullscreen();
        }
        canvas.classList.add('fullscreen-canvas');
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        canvas.classList.remove('fullscreen-canvas');
    }
}

export { toggleFullscreen };
