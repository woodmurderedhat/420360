/**
 * js/layers/geometric-grid.js - Geometric Grid layer for the Generative Art Studio
 */

import { randomRange, randomInt } from '../utils.js';

/**
 * Draw a Geometric Grid layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawGeometricGridLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, geometricGridDensity = 50, seed } = params;

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Calculate grid parameters based on density
    const gridSize = Math.max(5, Math.floor((100 - geometricGridDensity) / 5) + 5);
    const cols = Math.ceil(canvasWidth / gridSize);
    const rows = Math.ceil(canvasHeight / gridSize);

    // Use seed to create deterministic randomness
    const seedValue = seed || Date.now();
    Math.seedrandom(seedValue.toString());

    // Draw grid cells with different shapes
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * gridSize;
            const y = j * gridSize;

            // Randomly select a color from the palette
            const colorIndex = Math.floor(Math.random() * palette.length);
            ctx.fillStyle = palette[colorIndex];
            ctx.strokeStyle = palette[(colorIndex + 1) % palette.length];

            // Randomly select a shape type
            const shapeType = Math.floor(Math.random() * 4);

            switch (shapeType) {
                case 0: // Rectangle
                    if (Math.random() > 0.3) { // 70% chance to draw
                        ctx.fillRect(x, y, gridSize, gridSize);
                        ctx.strokeRect(x, y, gridSize, gridSize);
                    }
                    break;

                case 1: // Circle
                    if (Math.random() > 0.4) { // 60% chance to draw
                        ctx.beginPath();
                        ctx.arc(x + gridSize/2, y + gridSize/2, gridSize/2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;

                case 2: // Triangle
                    if (Math.random() > 0.5) { // 50% chance to draw
                        ctx.beginPath();
                        ctx.moveTo(x + gridSize/2, y);
                        ctx.lineTo(x + gridSize, y + gridSize);
                        ctx.lineTo(x, y + gridSize);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;

                case 3: // Cross
                    if (Math.random() > 0.6) { // 40% chance to draw
                        const lineWidth = gridSize / 10;
                        ctx.lineWidth = lineWidth;

                        // Horizontal line
                        ctx.beginPath();
                        ctx.moveTo(x, y + gridSize/2);
                        ctx.lineTo(x + gridSize, y + gridSize/2);
                        ctx.stroke();

                        // Vertical line
                        ctx.beginPath();
                        ctx.moveTo(x + gridSize/2, y);
                        ctx.lineTo(x + gridSize/2, y + gridSize);
                        ctx.stroke();
                    }
                    break;
            }
        }
    }

    // Restore the context state
    ctx.restore();
}