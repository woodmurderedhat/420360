/**
 * Line Tool - draw straight lines between two points
 */

import state from "../core/state.js";
import { validCoordinates, buildLineCells } from "../core/math.js";

export function createLineTool(toolManager, renderer) {
  return {
    name: "line",
    startPoint: null,
    isDrawing: false,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;
      this.isDrawing = true;
      this.startPoint = { x, y };
      // Show a single-pixel anchor immediately
      renderer.renderLinePreview(x, y, x, y, state.selectedColor);
    },

    onPointerMove(x, y, event) {
      if (this.isDrawing && this.startPoint !== null && validCoordinates(x, y)) {
        renderer.renderLinePreview(this.startPoint.x, this.startPoint.y, x, y, state.selectedColor);
      } else if (!this.isDrawing) {
        renderer.clearOverlay();
      }
    },

    async onPointerUp(x, y, event) {
      if (!this.isDrawing || this.startPoint === null) return;
      if (validCoordinates(x, y)) {
        const cells = buildLineCells(this.startPoint.x, this.startPoint.y, x, y);
        toolManager.commitPixels(cells, state.selectedColor);
      }
      this.startPoint = null;
      this.isDrawing = false;
    },

    cancel() {
      this.startPoint = null;
      this.isDrawing = false;
      renderer.clearOverlay();
    }
  };
}
