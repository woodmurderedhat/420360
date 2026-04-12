/**
 * js/layers/organic-splatters.js - Organic Splatters layer for the Generative Art Studio
 */

/**
 * Draw a reduced Organic Splatters layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, organicSplattersDensity } = params;
    const numSplatters = Math.floor(organicSplattersDensity / 100 * 50) + 5; // Example density mapping

    ctx.globalAlpha = opacity;
    for (let i = 0; i < numSplatters; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const radius = Math.random() * 30 + 10;
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0; // Reset global alpha
}
