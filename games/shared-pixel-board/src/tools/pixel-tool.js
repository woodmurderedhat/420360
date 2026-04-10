/**
 * Pixel Tool - single pixel placement
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";

export function createPixelTool(toolManager) {
  return {
    name: "pixel",
    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      // Place single pixel
      const cells = [{ x, y }];
      toolManager.commitPixels(cells, state.selectedColor);
    },

    onPointerMove(x, y, event) {
      // Render pixel preview on hover
      if (validCoordinates(x, y)) {
        // Preview handled by canvas hover state
      }
    },

    async onPointerUp(x, y, event) {
      // No-op
    },

    cancel() {
      // No-op
    }
  };
}
