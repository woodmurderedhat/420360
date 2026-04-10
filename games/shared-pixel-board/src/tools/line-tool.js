/**
 * Line Tool - draw straight lines between two points
 */

import state from "../core/state.js";
import { validCoordinates, buildLineCells } from "../core/math.js";

export function createLineTool(toolManager, renderer) {
  return {
    name: "line",
    startPoint: null,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      if (this.startPoint === null) {
        // First click - set anchor
        this.startPoint = { x, y };
      } else {
        // Second click - draw line and commit
        const cells = buildLineCells(this.startPoint.x, this.startPoint.y, x, y);
        toolManager.commitPixels(cells, state.selectedColor);
        this.startPoint = null;
      }
    },

    onPointerMove(x, y, event) {
      if (this.startPoint !== null && validCoordinates(x, y)) {
        // Show line preview
        renderer.renderLinePreview(this.startPoint.x, this.startPoint.y, x, y, state.selectedColor);
      } else {
        renderer.clearOverlay();
      }
    },

    async onPointerUp(x, y, event) {
      // No-op (all work done in onPointerDown)
    },

    cancel() {
      this.startPoint = null;
      renderer.clearOverlay();
    }
  };
}
