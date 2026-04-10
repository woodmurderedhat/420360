/**
 * Transform Tool - flip and rotate layers
 */

import state from "../core/state.js";
import {
  flipLayerHorizontal,
  flipLayerVertical,
  rotateLayer90CW,
  rotateLayer90CCW
} from "../core/math.js";

export function createTransformTool(toolManager, renderer) {
  return {
    name: "transform",

    async onPointerDown(x, y, event) {
      this.showTransformMenu(renderer);
    },

    onPointerMove(x, y, event) {
      // No preview
    },

    async onPointerUp(x, y, event) {
      // No-op
    },

    showTransformMenu(renderer) {
      const choice = prompt(
        "Transform:\n1=Flip H\n2=Flip V\n3=Rotate 90 CW\n4=Rotate 90 CCW\n(Enter 1-4):",
        "1"
      );

      if (!choice) return;

      const layer = state.getActiveLayer();
      let transformedPixels = null;

      switch (choice) {
        case "1":
          transformedPixels = flipLayerHorizontal(layer.pixels);
          break;
        case "2":
          transformedPixels = flipLayerVertical(layer.pixels);
          break;
        case "3":
          transformedPixels = rotateLayer90CW(layer.pixels);
          break;
        case "4":
          transformedPixels = rotateLayer90CCW(layer.pixels);
          break;
        default:
          state.emit("notice", { message: "Invalid transform", ok: false });
          return;
      }

      if (transformedPixels) {
        const previousPixels = new Map(layer.pixels);
        layer.pixels = transformedPixels;

        // Create history entry
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date(),
          layerId: layer.id,
          tool: "transform",
          previousPixels,
          pixels: transformedPixels
        };

        state.pushHistory(historyEntry);
        renderer.render();
        state.emit("notice", { message: "Transform applied", ok: true });
      }
    },

    cancel() {
      // No-op
    }
  };
}
