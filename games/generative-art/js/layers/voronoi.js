/**
 * js/layers/voronoi.js - Voronoi Cells layer for the Generative Art Studio
 */

/**
 * Draw a reduced Voronoi Cells layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    // Implementation from styles-default.js will be moved here
    // For now, let's keep it simple for demonstration
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, voronoiDensity } = params;
    const numPoints = Math.floor(voronoiDensity / 100 * 200) + 10; // Example density mapping

    // Placeholder: Actual Voronoi generation logic would be complex
    // This is a simplified representation
    ctx.globalAlpha = opacity;
    ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < numPoints / 5; i++) { // Reduced complexity for layer
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = Math.random() * 50 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0; // Reset global alpha
}
