/**
 * Canvas abstraction and rendering layer
 * Handles pixel drawing, layer compositing, grid rendering, overlays
 */

import {
  BOARD_SIZE,
  PIXEL_SIZE,
  DEFAULT_COLOR,
  BLEND_MODES
} from "../config/constants.js";
import {
  validCoordinates,
  makeCellKey,
  parseCellKey,
  boardToCanvasCoordinates
} from "./math.js";

class CanvasRenderer {
  constructor(canvasElement, overlayElement, state) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d", { alpha: false });
    this.overlayCanvas = overlayElement;
    this.overlayCtx = overlayElement.getContext("2d");
    this.state = state;

    // Ensure canvas size
    this.canvas.width = BOARD_SIZE * PIXEL_SIZE;
    this.canvas.height = BOARD_SIZE * PIXEL_SIZE;
    this.overlayCanvas.width = BOARD_SIZE * PIXEL_SIZE;
    this.overlayCanvas.height = BOARD_SIZE * PIXEL_SIZE;

    this.initializeCanvas();
  }

  /**
   * Initialize canvas with base color
   */
  initializeCanvas() {
    this.ctx.fillStyle = DEFAULT_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a single pixel at board coordinates
   */
  drawPixel(x, y, color) {
    if (!validCoordinates(x, y)) return;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x * PIXEL_SIZE,
      y * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  }

  /**
   * Clear a single pixel (revert to default color)
   */
  clearPixel(x, y) {
    this.drawPixel(x, y, DEFAULT_COLOR);
  }

  /**
   * Draw grid overlay
   */
  drawGrid(color = "rgba(255,255,255,0.07)") {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= BOARD_SIZE; i += 1) {
      const pos = i * PIXEL_SIZE + 0.5;

      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.canvas.height);
      this.ctx.stroke();

      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.canvas.width, pos);
      this.ctx.stroke();
    }
  }

  /**
   * Render complete board from all layers
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = DEFAULT_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Composite visible layers
    for (const layer of this.state.layers) {
      if (!layer.visible) continue;

      this.ctx.globalAlpha = layer.opacity;
      this.ctx.globalCompositeOperation = layer.blendMode || "source-over";

      // Draw all pixels from this layer
      for (const [key, color] of layer.pixels) {
        const { x, y } = parseCellKey(key);
        if (validCoordinates(x, y)) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            x * PIXEL_SIZE,
            y * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }

    // Reset composite operation
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = "source-over";

    // Draw grid if enabled
    if (this.state.gridEnabled) {
      this.drawGrid();
    }
  }

  /**
   * Clear overlay canvas
   */
  clearOverlay() {
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
  }

  /**
   * Render line preview on overlay
   */
  renderLinePreview(startX, startY, endX, endY, color) {
    this.clearOverlay();
    if (!validCoordinates(startX, startY) || !validCoordinates(endX, endY)) {
      return;
    }

    // Draw start point
    this.overlayCtx.globalAlpha = 0.75;
    this.overlayCtx.fillStyle = "#ffffff";
    this.overlayCtx.fillRect(
      startX * PIXEL_SIZE,
      startY * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );

    // Draw preview using Bresenham
    this.overlayCtx.globalAlpha = 0.55;
    this.overlayCtx.fillStyle = color;

    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;
    let x = startX;
    let y = startY;

    while (true) {
      this.overlayCtx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      if (x === endX && y === endY) break;

      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    this.overlayCtx.globalAlpha = 1.0;
  }

  /**
   * Render brush preview on overlay
   */
  renderBrushPreview(centerX, centerY, brushSize, color) {
    this.clearOverlay();
    if (!validCoordinates(centerX, centerY)) return;

    const radius = Math.max(0, Math.floor((brushSize - 1) / 2));
    this.overlayCtx.globalAlpha = 0.5;
    this.overlayCtx.fillStyle = color;

    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        if (validCoordinates(x, y)) {
          this.overlayCtx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }

    this.overlayCtx.globalAlpha = 1.0;
  }

  /**
   * Render spray preview on overlay
   */
  renderSprayPreview(centerX, centerY, radius, color) {
    this.clearOverlay();
    if (!validCoordinates(centerX, centerY)) return;

    this.overlayCtx.globalAlpha = 0.4;
    this.overlayCtx.strokeStyle = color;
    this.overlayCtx.lineWidth = 1;

    // Draw circle boundary
    this.overlayCtx.beginPath();
    this.overlayCtx.arc(
      centerX * PIXEL_SIZE + PIXEL_SIZE / 2,
      centerY * PIXEL_SIZE + PIXEL_SIZE / 2,
      radius * PIXEL_SIZE,
      0,
      Math.PI * 2
    );
    this.overlayCtx.stroke();

    this.overlayCtx.globalAlpha = 1.0;
  }

  /**
   * Render mirror axis overlay
   */
  renderMirrorAxis(mirrorMode, color = "rgba(255,255,255,0.3)") {
    if (!mirrorMode) return;

    this.overlayCtx.globalAlpha = 0.5;
    this.overlayCtx.strokeStyle = color;
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.setLineDash([5, 5]);

    if (mirrorMode === "x" || mirrorMode === "both") {
      const midX = (BOARD_SIZE * PIXEL_SIZE) / 2;
      this.overlayCtx.beginPath();
      this.overlayCtx.moveTo(midX, 0);
      this.overlayCtx.lineTo(midX, this.overlayCanvas.height);
      this.overlayCtx.stroke();
    }

    if (mirrorMode === "y" || mirrorMode === "both") {
      const midY = (BOARD_SIZE * PIXEL_SIZE) / 2;
      this.overlayCtx.beginPath();
      this.overlayCtx.moveTo(0, midY);
      this.overlayCtx.lineTo(this.overlayCanvas.width, midY);
      this.overlayCtx.stroke();
    }

    this.overlayCtx.setLineDash([]);
    this.overlayCtx.globalAlpha = 1.0;
  }

  /**
   * Render selection bounds (for transform tool)
   */
  renderSelectionBounds(bounds, color = "rgba(255,255,255,0.5)") {
    if (!bounds) return;

    this.overlayCtx.globalAlpha = 0.5;
    this.overlayCtx.strokeStyle = color;
    this.overlayCtx.lineWidth = 2;

    const x = bounds.x * PIXEL_SIZE;
    const y = bounds.y * PIXEL_SIZE;
    const w = bounds.width * PIXEL_SIZE;
    const h = bounds.height * PIXEL_SIZE;

    this.overlayCtx.strokeRect(x, y, w, h);

    // Draw corner handles
    const handleSize = 4;
    this.overlayCtx.fillStyle = color;
    const corners = [
      { x, y },
      { x: x + w, y },
      { x, y: y + h },
      { x: x + w, y: y + h }
    ];

    for (const corner of corners) {
      this.overlayCtx.fillRect(
        corner.x - handleSize / 2,
        corner.y - handleSize / 2,
        handleSize,
        handleSize
      );
    }

    this.overlayCtx.globalAlpha = 1.0;
  }

  /**
   * Export canvas as PNG
   */
  exportPNG(filename = "pixel-board.png") {
    try {
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = this.canvas.toDataURL("image/png");
      link.download = filename || `shared-pixel-board-${BOARD_SIZE}x${BOARD_SIZE}-${stamp}.png`;
      link.click();
      return true;
    } catch (error) {
      console.error("Export failed:", error);
      return false;
    }
  }

  /**
   * Get canvas as image data
   */
  getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Set canvas from image data
   */
  setImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply zoom and pan transformation to canvas element
   */
  applyZoom(zoomLevel) {
    this.canvas.style.width = `${this.canvas.width * zoomLevel}px`;
    this.canvas.style.height = `${this.canvas.height * zoomLevel}px`;
    this.overlayCanvas.style.width = `${this.overlayCanvas.width * zoomLevel}px`;
    this.overlayCanvas.style.height = `${this.overlayCanvas.height * zoomLevel}px`;
  }

  /**
   * Resize canvas (for board resize, future feature)
   */
  resize(newWidth, newHeight) {
    // This is a placeholder for future board resizing
    console.warn("Canvas resizing not yet implemented");
  }
}

export default CanvasRenderer;
