/**
 * geometricGridPrimitive.js - Geometric Grid Primitive implementation for the Generative Art Studio
 */

/**
 * Draw a geometric grid primitive (for individual cell drawing)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 */
function drawGeometricGridPrimitive(ctx, palette) {
    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
    
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const size = 20 + Math.random() * 50;
    const shouldFill = Math.random() < 0.3;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1 + Math.random() * 2;
    
    const primitiveType = Math.floor(Math.random() * 4);
    
    switch (primitiveType) {
        case 0: // Line
            ctx.beginPath();
            ctx.moveTo(-size / 2, 0);
            ctx.lineTo(size / 2, 0);
            ctx.stroke();
            break;
        case 1: // Rectangle
            ctx.beginPath();
            if (shouldFill) {
                ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                ctx.fillRect(-size / 2, -size / 2, size, size);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.strokeRect(-size / 2, -size / 2, size, size);
            }
            break;
        case 2: // Circle
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            if (shouldFill) {
                ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.stroke();
            }
            break;
        case 3: // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
            if (shouldFill) {
                ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.stroke();
            }
            break;
    }
    
    ctx.restore();
}

// Export the drawing function
export { drawGeometricGridPrimitive };
