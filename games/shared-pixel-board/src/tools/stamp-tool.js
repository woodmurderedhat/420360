/**
 * Stamp Tool - place predefined patterns
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";
import { STAMP_PATTERNS } from "../config/constants.js";

export function createStampTool(toolManager, renderer) {
  return {
    name: "stamp",

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      const options = state.toolOptions[state.activeTool] || {
        selectedPattern: "square"
      };

      const pattern = STAMP_PATTERNS[options.selectedPattern] || STAMP_PATTERNS.square;
      const cells = [];

      for (const patternCell of pattern.cells) {
        const px = x + patternCell.x;
        const py = y + patternCell.y;
        if (validCoordinates(px, py)) {
          cells.push({ x: px, y: py });
        }
      }

      if (cells.length > 0) {
        toolManager.commitPixels(cells, state.selectedColor);
      }
    },

    onPointerMove(x, y, event) {
      if (validCoordinates(x, y)) {
        const options = state.toolOptions[state.activeTool] || {
          selectedPattern: "square"
        };
        const pattern = STAMP_PATTERNS[options.selectedPattern] || STAMP_PATTERNS.square;

        renderer.overlayCtx.clearRect(0, 0, renderer.overlayCanvas.width, renderer.overlayCanvas.height);
        renderer.overlayCtx.globalAlpha = 0.5;
        renderer.overlayCtx.fillStyle = state.selectedColor;

        for (const patternCell of pattern.cells) {
          const px = x + patternCell.x;
          const py = y + patternCell.y;
          if (validCoordinates(px, py)) {
            renderer.overlayCtx.fillRect(px * 8, py * 8, 8, 8);
          }
        }

        renderer.overlayCtx.globalAlpha = 1.0;
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
