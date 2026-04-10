/**
 * Text Tool - place text on canvas
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";

export function createTextTool(toolManager, renderer) {
  return {
    name: "text",
    inputActive: false,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;
      this.showTextInputModal(x, y, toolManager);
    },

    onPointerMove(x, y, event) {
      // Show text input prompt on hover
      renderer.overlayCtx.clearRect(0, 0, renderer.overlayCanvas.width, renderer.overlayCanvas.height);
      renderer.overlayCtx.fillStyle = "rgba(255,255,255,0.2)";
      renderer.overlayCtx.fillRect(x * 8, y * 8, 8, 8);
    },

    async onPointerUp(x, y, event) {
      // No-op
    },

    showTextInputModal(x, y, toolManager) {
      // This would ideally open a proper modal, but for now, use prompt
      const text = prompt("Enter text:", "A");
      if (!text) return;

      // Simple text rendering - just mark cells for now
      // A full implementation would rasterize text to pixels
      const cells = [];
      for (let i = 0; i < text.length && i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          const px = x + (i * 4);
          const py = y + j;
          if (validCoordinates(px, py)) {
            cells.push({ x: px, y: py });
          }
        }
      }

      if (cells.length > 0) {
        toolManager.commitPixels(cells, state.selectedColor);
      }
    },

    cancel() {
      // No-op
    }
  };
}
