/**
 * js/layers/neon-waves.js - Neon Waves layer for the Generative Art Studio
 */

/**
 * Draw a reduced Neon Waves layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, neonWavesDensity } = params;
    const numWaves = Math.floor(neonWavesDensity / 100 * 10) + 2; // Example density mapping

    ctx.globalAlpha = opacity;
    ctx.lineWidth = 2;
    for (let i = 0; i < numWaves; i++) {
        ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * canvasHeight);
        for (let x = 0; x < canvasWidth; x += 20) {
            ctx.lineTo(x, Math.random() * canvasHeight / 2 + canvasHeight / 4 + Math.sin(x * 0.02 + Date.now() * 0.001 * (isAnimationFrame ? 1 : 0)) * 20);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0; // Reset global alpha
}
