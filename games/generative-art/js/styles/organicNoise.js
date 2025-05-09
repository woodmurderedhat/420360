/**
 * organicNoise.js - Organic Noise style implementation for the Generative Art Studio
 */

/**
 * Draw the Organic Noise style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawOrganicNoise(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const numCurves = 50 + Math.floor(Math.random() * 100);
    
    for (let i = 0; i < numCurves; i++) {
        const colorIndex = Math.floor((i / numCurves) * palette.length) % palette.length;
        
        let x = width * Math.random();
        let y = height * Math.random();
        
        // Add animation and interactivity
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i * 0.1) * 10;
            y += Math.cos(frameCount * 0.01 + i * 0.1) * 10;
        }
        
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            const influence = Math.max(0, 1 - distToMouse / 300);
            x += (mouseX - x) * influence * 0.05;
            y += (mouseY - y) * influence * 0.05;
        }
        
        const cp1x = x + Math.random() * 200 - 100;
        const cp1y = y + Math.random() * 200 - 100;
        const cp2x = x + Math.random() * 200 - 100;
        const cp2y = y + Math.random() * 200 - 100;
        const endX = x + Math.random() * 200 - 100;
        const endY = y + Math.random() * 200 - 100;
        
        ctx.strokeStyle = palette[colorIndex];
        ctx.lineWidth = 1 + Math.random() * 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.stroke();
    }
}

// Export the drawing function
export { drawOrganicNoise };
