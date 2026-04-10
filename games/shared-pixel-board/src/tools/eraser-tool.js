/**
 * Eraser Tool - erase pixels back to default color
 */

import state from "../core/state.js";
import { validCoordinates, buildBrushStamp, DEFAULT_COLOR } from "../core/math.js";

export function createEraserTool(toolManager, renderer) {
  return {
    name: "eraser",
    strokeActive: false,
    cellsInStroke: new Set(),
    lastPoint: null,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      this.strokeActive = true;
      this.cellsInStroke.clear();
      this.lastPoint = { x, y };

      const cells = buildBrushStamp(x, y, state.brushSize);
      for (const cell of cells) {
        if (validCoordinates(cell.x, cell.y)) {
          this.cellsInStroke.add(`${cell.x}_${cell.y}`);
        }
      }
    },

    onPointerMove(x, y, event) {
      if (!this.strokeActive || !validCoordinates(x, y)) {
        renderer.renderBrushPreview(x, y, state.brushSize, "#888888");
        return;
      }

      if (!this.lastPoint) {
        this.lastPoint = { x, y };
      }

      const dx = x - this.lastPoint.x;
      const dy = y - this.lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        renderer.renderBrushPreview(x, y, state.brushSize, "#888888");
        return;
      }

      const steps = Math.ceil(distance);
      for (let i = 0; i <= steps; i++) {
        const t = steps > 0 ? i / steps : 0;
        const px = Math.round(this.lastPoint.x + dx * t);
        const py = Math.round(this.lastPoint.y + dy * t);

        const cells = buildBrushStamp(px, py, state.brushSize);
        for (const cell of cells) {
          if (validCoordinates(cell.x, cell.y)) {
            this.cellsInStroke.add(`${cell.x}_${cell.y}`);
          }
        }
      }

      this.lastPoint = { x, y };
      renderer.clearOverlay();
    },

    async onPointerUp(x, y, event) {
      if (!this.strokeActive) return;

      const cells = Array.from(this.cellsInStroke).map((key) => {
        const [x, y] = key.split("_").map(Number);
        return { x, y };
      });

      // Import DEFAULT_COLOR - use hardcoded for now
      toolManager.commitPixels(cells, "#111827");

      this.strokeActive = false;
      this.cellsInStroke.clear();
      this.lastPoint = null;
    },

    cancel() {
      this.strokeActive = false;
      this.cellsInStroke.clear();
      this.lastPoint = null;
    }
  };
}
