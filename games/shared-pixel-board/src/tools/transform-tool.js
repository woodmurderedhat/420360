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
  function applyTransform(type) {
    const layer = state.getActiveLayer();
    if (!layer) return;

    let transformedPixels = null;
    switch (type) {
      case "flipH":     transformedPixels = flipLayerHorizontal(layer.pixels); break;
      case "flipV":     transformedPixels = flipLayerVertical(layer.pixels);   break;
      case "rotateCW":  transformedPixels = rotateLayer90CW(layer.pixels);     break;
      case "rotateCCW": transformedPixels = rotateLayer90CCW(layer.pixels);    break;
      default: return;
    }

    if (!transformedPixels) return;

    const previousPixels = new Map(layer.pixels);
    layer.pixels = transformedPixels;

    state.pushHistory({
      id: Date.now(),
      timestamp: new Date(),
      layerId: layer.id,
      tool: "transform",
      previousPixels,
      pixels: transformedPixels
    });

    renderer.render();
    state.emit("notice", { message: "Transform applied", ok: true });
  }

  return {
    name: "transform",
    applyTransform,

    async onPointerDown(x, y, event) {
      // Transforms are applied via the Tool Options panel buttons
    },

    onPointerMove(x, y, event) {},

    async onPointerUp(x, y, event) {},

    cancel() {}
  };
}
