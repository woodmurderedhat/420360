/**
 * Pixel Tool - single pixel placement
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";

export function createPixelTool(toolManager) {
  return {
    name: "pixel",
    isDrawing: false,
    lastCell: null,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;
      this.isDrawing = true;
      this.lastCell = { x, y };
      toolManager.commitPixels([{ x, y }], state.selectedColor);
    },

    onPointerMove(x, y, event) {
      if (!this.isDrawing || !validCoordinates(x, y)) return;
      if (this.lastCell && this.lastCell.x === x && this.lastCell.y === y) return;
      this.lastCell = { x, y };
      toolManager.commitPixels([{ x, y }], state.selectedColor);
    },

    async onPointerUp(x, y, event) {
      this.isDrawing = false;
      this.lastCell = null;
    },

    cancel() {
      this.isDrawing = false;
      this.lastCell = null;
    }
  };
}
