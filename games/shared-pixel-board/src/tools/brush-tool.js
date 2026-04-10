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

      const cells = buildBrushStamp(x, y, state.brushSize);
      for (const cell of cells) {
        if (validCoordinates(cell.x, cell.y)) {
          this.cellsInStroke.add(`${cell.x}_${cell.y}`);
          // Draw immediately for live feedback
          renderer.drawPixel(cell.x, cell.y, state.selectedColor);
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
            const key = `${cell.x}_${cell.y}`;
            if (!this.cellsInStroke.has(key)) {
              this.cellsInStroke.add(key);
              // Draw immediately for live feedback
              renderer.drawPixel(cell.x, cell.y, state.selectedColor);
            }
          }
        }
      }

      this.lastPoint = { x, y };
      renderer.renderBrushPreview(x, y, state.brushSize, state.selectedColor);
    },

    async onPointerUp(x, y, event) {
      if (!this.strokeActive) return;

      const cells = Array.from(this.cellsInStroke).map((key) => {
        const [cx, cy] = key.split("_").map(Number);
        return { x: cx, y: cy };
      });

      // Commit to history and fire Firebase; renderer.render() re-draws from state
      toolManager.commitPixels(cells, state.selectedColor);

      this.strokeActive = false;
      this.cellsInStroke.clear();
      this.lastPoint = null;
    },

    cancel() {
      this.strokeActive = false;
      this.cellsInStroke.clear();
      this.lastPoint = null;
      renderer.clearOverlay();
    }
  };
}
