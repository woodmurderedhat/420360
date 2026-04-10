/**
 * Brush Tool - continuous stroke painting
 */

import state from "../core/state.js";
import { validCoordinates, buildBrushStamp } from "../core/math.js";

export function createBrushTool(toolManager, renderer) {
  return {
    name: "brush",
    strokeActive: false,
    cellsInStroke: new Set(),
    lastPoint: null,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      this.strokeActive = true;
      this.cellsInStroke.clear();
      this.lastPoint = { x, y };

      // Draw initial brush position
      const cells = buildBrushStamp(x, y, state.brushSize);
      for (const cell of cells) {
        if (validCoordinates(cell.x, cell.y)) {
          this.cellsInStroke.add(`${cell.x}_${cell.y}`);
        }
      }
    },

    onPointerMove(x, y, event) {
      if (!this.strokeActive || !validCoordinates(x, y)) {
        renderer.renderBrushPreview(x, y, state.brushSize, state.selectedColor);
        return;
      }

      if (!this.lastPoint) {
        this.lastPoint = { x, y };
      }

      // Line from last point to current
      const dx = x - this.lastPoint.x;
      const dy = y - this.lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        renderer.renderBrushPreview(x, y, state.brushSize, state.selectedColor);
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
      renderer.clearOverlay(); // Don't show preview while painting
    },

    async onPointerUp(x, y, event) {
      if (!this.strokeActive) return;

      // Commit all cells from stroke
      const cells = Array.from(this.cellsInStroke).map((key) => {
        const [x, y] = key.split("_").map(Number);
        return { x, y };
      });

      toolManager.commitPixels(cells, state.selectedColor);

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
