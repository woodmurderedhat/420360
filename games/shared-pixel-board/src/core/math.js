/**
 * Math utilities for pixel board operations
 */

import { BOARD_SIZE, PIXEL_SIZE } from "../config/constants.js";

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Check if coordinates are valid (within board bounds)
 */
export function validCoordinates(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

/**
 * Create a cell key from coordinates
 */
export function makeCellKey(x, y) {
  return `${x}_${y}`;
}

/**
 * Parse cell key back to coordinates
 */
export function parseCellKey(key) {
  if (!key || typeof key !== "string") {
    return { x: 0, y: 0 };
  }
  const parts = key.split("_");
  return {
    x: parseInt(parts[0], 10) || 0,
    y: parseInt(parts[1], 10) || 0
  };
}

/**
 * Convert canvas mouse/touch event to board coordinates
 * Uses rect dimensions directly so CSS zoom is already factored in —
 * avoids the double-zoom bug that occurred when multiplying scaleX * (1/zoomLevel).
 */
export function canvasToBoardCoordinates(canvas, event, zoomLevel = 1) {
  const rect = canvas.getBoundingClientRect();

  const eventX = event.clientX ?? (event.touches && event.touches[0] ? event.touches[0].clientX : null);
  const eventY = event.clientY ?? (event.touches && event.touches[0] ? event.touches[0].clientY : null);

  if (eventX === null || eventY === null) {
    return { x: -1, y: -1 };
  }

  // rect.width already reflects CSS zoom, so dividing by it normalises correctly
  const x = Math.floor((eventX - rect.left) / rect.width * BOARD_SIZE);
  const y = Math.floor((eventY - rect.top) / rect.height * BOARD_SIZE);
  return { x, y };
}

/**
 * Convert board coordinates to canvas pixel coordinates
 */
export function boardToCanvasCoordinates(x, y) {
  return {
    canvasX: x * PIXEL_SIZE,
    canvasY: y * PIXEL_SIZE,
    canvasWidth: PIXEL_SIZE,
    canvasHeight: PIXEL_SIZE
  };
}

/**
 * Build a line of cells using Bresenham's line algorithm
 */
export function buildLineCells(startX, startY, endX, endY) {
  const cells = [];
  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({ x, y });
    if (x === endX && y === endY) {
      break;
    }
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

  return cells;
}

/**
 * Build brush stamp cells (square pattern around center)
 */
export function buildBrushStamp(centerX, centerY, brushSize) {
  const radius = Math.max(0, Math.floor((brushSize - 1) / 2));
  const cells = [];
  
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      cells.push({ x, y });
    }
  }
  
  return cells;
}

/**
 * Build circular brush stamp using distance
 */
export function buildCircularBrush(centerX, centerY, brushSize) {
  const radius = brushSize / 2;
  const cells = [];
  
  for (let y = centerY - brushSize; y <= centerY + brushSize; y += 1) {
    for (let x = centerX - brushSize; x <= centerX + brushSize; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        cells.push({ x, y });
      }
    }
  }
  
  return cells;
}

/**
 * Build spray/airbrush particles with random scatter
 */
export function buildSprayParticles(centerX, centerY, radius, particleCount) {
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    particles.push({
      x: Math.round(x),
      y: Math.round(y),
      opacity: 0.3 + Math.random() * 0.7 // Variable opacity
    });
  }
  
  return particles;
}

/**
 * Build fill region using flood fill algorithm
 */
export function buildFillCells(startX, startY, getPixelAt, targetColor, cap = 480) {
  const startColor = getPixelAt(startX, startY).toUpperCase();
  
  if (startColor === targetColor) {
    return { cells: [], capped: false };
  }

  const queue = [{ x: startX, y: startY }];
  const visited = new Set([makeCellKey(startX, startY)]);
  const filled = [];
  let queueIndex = 0;
  let capped = false;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    filled.push(current);

    if (filled.length >= cap) {
      capped = true;
      break;
    }

    const neighbors = [
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 }
    ];

    for (const neighbor of neighbors) {
      if (!validCoordinates(neighbor.x, neighbor.y)) {
        continue;
      }

      const key = makeCellKey(neighbor.x, neighbor.y);
      if (visited.has(key)) {
        continue;
      }

      const neighborColor = getPixelAt(neighbor.x, neighbor.y).toUpperCase();
      if (neighborColor !== startColor) {
        continue;
      }

      visited.add(key);
      queue.push(neighbor);
    }
  }

  return { cells: filled, capped };
}

/**
 * Normalize a set of cells (remove duplicates, filter valid coordinates)
 */
export function normalizeCells(cells) {
  const unique = new Set();
  
  for (const cell of cells) {
    if (!validCoordinates(cell.x, cell.y)) {
      continue;
    }
    unique.add(makeCellKey(cell.x, cell.y));
  }
  
  return unique;
}

/**
 * Apply mirror transformation to cells
 */
export function applyMirrorTransform(cells, mirrorMode) {
  if (!mirrorMode) return cells;

  const mirrored = new Set();
  
  for (const cell of cells) {
    mirrored.add(cell);
    
    if (mirrorMode === "x" || mirrorMode === "both") {
      const mirroredX = BOARD_SIZE - 1 - cell.x;
      mirrored.add({ x: mirroredX, y: cell.y });
    }
    
    if (mirrorMode === "y" || mirrorMode === "both") {
      const mirroredY = BOARD_SIZE - 1 - cell.y;
      mirrored.add({ x: cell.x, y: mirroredY });
    }
    
    if (mirrorMode === "both") {
      const mirroredX = BOARD_SIZE - 1 - cell.x;
      const mirroredY = BOARD_SIZE - 1 - cell.y;
      mirrored.add({ x: mirroredX, y: mirroredY });
    }
  }
  
  return mirrored;
}

/**
 * Flip layer horizontally (pixel-level operation)
 */
export function flipLayerHorizontal(pixelMap) {
  const flipped = new Map();
  
  for (const [key, color] of pixelMap) {
    const { x, y } = parseCellKey(key);
    const mirroredX = BOARD_SIZE - 1 - x;
    flipped.set(makeCellKey(mirroredX, y), color);
  }
  
  return flipped;
}

/**
 * Flip layer vertically (pixel-level operation)
 */
export function flipLayerVertical(pixelMap) {
  const flipped = new Map();
  
  for (const [key, color] of pixelMap) {
    const { x, y } = parseCellKey(key);
    const mirroredY = BOARD_SIZE - 1 - y;
    flipped.set(makeCellKey(x, mirroredY), color);
  }
  
  return flipped;
}

/**
 * Rotate layer 90 degrees clockwise
 */
export function rotateLayer90CW(pixelMap) {
  const rotated = new Map();
  
  for (const [key, color] of pixelMap) {
    const { x, y } = parseCellKey(key);
    // For 90° CW: new_x = old_y, new_y = size - 1 - old_x
    const newX = y;
    const newY = BOARD_SIZE - 1 - x;
    rotated.set(makeCellKey(newX, newY), color);
  }
  
  return rotated;
}

/**
 * Rotate layer 90 degrees counter-clockwise
 */
export function rotateLayer90CCW(pixelMap) {
  const rotated = new Map();
  
  for (const [key, color] of pixelMap) {
    const { x, y } = parseCellKey(key);
    // For 90° CCW: new_x = size - 1 - old_y, new_y = old_x
    const newX = BOARD_SIZE - 1 - y;
    const newY = x;
    rotated.set(makeCellKey(newX, newY), color);
  }
  
  return rotated;
}

/**
 * Get distance between two points
 */
export function getPointDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get midpoint between two points
 */
export function getPointMidpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}
