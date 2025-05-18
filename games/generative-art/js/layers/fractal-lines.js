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
 * @param {boolean} isAnimationFrame - Whether this is an animation frame (used for animated effects)
 * @param {Object} params - Parameters including canvasWidth, canvasHeight, fractalLinesDensity, lineWidth.
 * @param {number} opacity - Opacity of the layer
 */
export function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    // Add some animation effects if this is an animation frame
    const animationOffset = isAnimationFrame ? Math.sin(Date.now() * 0.001) * 10 : 0;

    const { canvasWidth, canvasHeight, fractalLinesDensity, lineWidth } = params;
    // Ensure fractalLinesDensity is a number, default if not provided
    const density = typeof fractalLinesDensity === 'number' ? fractalLinesDensity : 50;
    const numLines = Math.floor(density / 100 * 5) + 1; // Example density mapping
    const maxDepth = 3;

    ctx.globalAlpha = opacity;
    ctx.lineWidth = lineWidth || 1; // Use provided lineWidth or default to 1

    for (let i = 0; i < numLines; i++) {
        // Apply animation offset to starting and ending points if animating
        const startX = Math.random() * canvasWidth + (isAnimationFrame ? animationOffset : 0);
        const startY = Math.random() * canvasHeight + (isAnimationFrame ? animationOffset * 0.5 : 0);
        const endX = Math.random() * canvasWidth - (isAnimationFrame ? animationOffset : 0);
        const endY = Math.random() * canvasHeight - (isAnimationFrame ? animationOffset * 0.5 : 0);

        // Initial call to the recursive function
        const initialColor = palette[Math.floor(Math.random() * palette.length)];
        drawFractalLineRecursive(ctx, startX, startY, endX, endY, maxDepth, initialColor, palette);
    }
    ctx.globalAlpha = 1.0;
}
