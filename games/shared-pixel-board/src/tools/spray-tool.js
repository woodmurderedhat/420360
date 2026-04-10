/**
 * Spray/Airbrush Tool - dispersed particle painting
 */

import state from "../core/state.js";
import { validCoordinates, buildSprayParticles } from "../core/math.js";

export function createSprayTool(toolManager, renderer) {
  return {
    name: "spray",
    sprayActive: false,
    cellsInSpray: new Set(),
    sprayInterval: null,
    currentX: 0,
    currentY: 0,

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;

      this.sprayActive = true;
      this.cellsInSpray.clear();
      this.currentX = x;
      this.currentY = y;
      this.spray(x, y);

      // Continuous spray that follows the live cursor position
      this.sprayInterval = setInterval(() => {
        if (this.sprayActive) {
          this.spray(this.currentX, this.currentY);
        } else {
          clearInterval(this.sprayInterval);
        }
      }, 50);
    },

    onPointerMove(x, y, event) {
      const radius = state.toolOptions[state.activeTool]?.radius || 5;
      renderer.renderSprayPreview(x, y, radius, state.selectedColor);

      // Update position so the interval sprays at the current cursor location
      if (this.sprayActive) {
        this.currentX = x;
        this.currentY = y;
      }
    },

    async onPointerUp(x, y, event) {
      if (!this.sprayActive) return;

      clearInterval(this.sprayInterval);
      this.sprayActive = false;

      const cells = Array.from(this.cellsInSpray).map((key) => {
        const [x, y] = key.split("_").map(Number);
        return { x, y };
      });

      toolManager.commitPixels(cells, state.selectedColor);
      this.cellsInSpray.clear();
    },

    spray(centerX, centerY) {
      const options = state.toolOptions[state.activeTool] || {
        radius: 5,
        density: 3,
        particleCount: 10
      };

      const particles = buildSprayParticles(
        centerX,
        centerY,
        options.radius,
        options.particleCount
      );

      for (const particle of particles) {
        if (validCoordinates(particle.x, particle.y)) {
          this.cellsInSpray.add(`${particle.x}_${particle.y}`);
        }
      }
    },

    cancel() {
      clearInterval(this.sprayInterval);
      this.sprayActive = false;
      this.cellsInSpray.clear();
    }
  };
}
