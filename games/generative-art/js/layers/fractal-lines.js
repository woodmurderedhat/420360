/**
 * js/layers/fractal-lines.js - Fractal Lines layer for the Generative Art Studio
 */

/**
 * Helper function for fractal lines
 */
function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, color, palette) {
    if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.stroke();
        return;
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const newX = midX + dy * 0.2 * (Math.random() - 0.5);
    const newY = midY - dx * 0.2 * (Math.random() - 0.5);

    const nextColor = palette[Math.floor(Math.random() * palette.length)];

    drawFractalLineRecursive(ctx, x1, y1, newX, newY, depth - 1, color, palette);
    drawFractalLineRecursive(ctx, newX, newY, x2, y2, depth - 1, nextColor, palette);
}

/**
 * Draw a reduced Fractal Lines layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, fractalLinesDensity } = params;
    const numLines = Math.floor(fractalLinesDensity / 100 * 5) + 1; // Example density mapping
    const maxDepth = 3;

    ctx.globalAlpha = opacity;
    ctx.lineWidth = params.lineWidth || 1;

    for (let i = 0; i < numLines; i++) {
        const startX = Math.random() * canvasWidth;
        const startY = Math.random() * canvasHeight;
        const endX = Math.random() * canvasWidth;
        const endY = Math.random() * canvasHeight;
        const initialColor = palette[Math.floor(Math.random() * palette.length)];
        drawFractalLineRecursive(ctx, startX, startY, endX, endY, maxDepth, initialColor, palette);
    }
    ctx.globalAlpha = 1.0; // Reset global alpha
}
