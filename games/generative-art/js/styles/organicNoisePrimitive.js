/**
 * organicNoisePrimitive.js - Organic Noise Primitive implementation for the Generative Art Studio
 */

/**
 * Draw an organic noise primitive
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {number} index - Index for color selection
 * @param {number} total - Total number of primitives
 */
function drawOrganicNoisePrimitive(ctx, palette, index = 0, total = 1) {
    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
    
    const x = canvasWidth * Math.random();
    const y = canvasHeight * Math.random();
    const cp1x = x + Math.random() * 200 - 100;
    const cp1y = y + Math.random() * 200 - 100;
    const cp2x = x + Math.random() * 200 - 100;
    const cp2y = y + Math.random() * 200 - 100;
    const endX = x + Math.random() * 200 - 100;
    const endY = y + Math.random() * 200 - 100;
    
    const colorIndex = Math.floor((index / total) * palette.length) % palette.length;
    ctx.strokeStyle = palette[colorIndex];
    ctx.lineWidth = 1 + Math.random() * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
}

// Export the drawing function
export { drawOrganicNoisePrimitive };
