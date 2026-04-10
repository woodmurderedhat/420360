/**
 * Color Picker Tool (Eyedropper)
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";
import { PIXEL_SIZE } from "../config/constants.js";

export function createPickerTool(toolManager, renderer) {
  return {
    name: "picker",

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      const color = state.getPixelAt(x, y);
      state.setColor(color);
      state.emit("notice", { message: `Color picked: ${color}`, ok: true });
    },

    onPointerMove(x, y, event) {
      if (validCoordinates(x, y)) {
        const color = state.getPixelAt(x, y);
        renderer.overlayCtx.clearRect(
          0,
          0,
          renderer.overlayCanvas.width,
          renderer.overlayCanvas.height
        );
        renderer.overlayCtx.fillStyle = "rgba(255,255,255,0.3)";
        renderer.overlayCtx.fillRect(
          x * PIXEL_SIZE,
          y * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE
        );
      }
    },

    async onPointerUp(x, y, event) {
      // No-op
    },

    cancel() {
      renderer.clearOverlay();
    }
  };
}
