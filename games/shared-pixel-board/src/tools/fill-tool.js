/**
 * Fill Tool - flood fill
 */

import state from "../core/state.js";
import { validCoordinates, buildFillCells } from "../core/math.js";
import { FILL_PIXEL_CAP } from "../config/constants.js";

export function createFillTool(toolManager, renderer) {
  return {
    name: "fill",

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      const layer = state.getActiveLayer();
      const startColor = state.getPixelAt(x, y);

      if (startColor.toUpperCase() === state.selectedColor.toUpperCase()) {
        state.emit("notice", { message: "Target color same as fill color", ok: false });
        return;
      }

      const { cells, capped } = buildFillCells(
        x,
        y,
        (bx, by) => state.getPixelAt(bx, by),
        state.selectedColor,
        FILL_PIXEL_CAP
      );

      toolManager.commitPixels(cells, state.selectedColor);

      if (capped) {
        state.emit("notice", { message: `Fill capped at ${FILL_PIXEL_CAP} pixels`, ok: false });
      } else {
        state.emit("notice", { message: `Filled ${cells.length} pixels`, ok: true });
      }
    },

    onPointerMove(x, y, event) {
      // No preview for fill
    },

    async onPointerUp(x, y, event) {
      // No-op
    },

    cancel() {
      // No-op
    }
  };
}
