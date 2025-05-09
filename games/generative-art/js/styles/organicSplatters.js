/**
 * organicSplatters.js - Organic Splatters style implementation for the Generative Art Studio
 */

/**
 * Draw the Organic Splatters style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawOrganicSplatters(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const numSplatters = 30 + Math.floor(Math.random() * 70);
    
    for (let i = 0; i < numSplatters; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;
        
        // Add animation
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i) * 5;
            y += Math.cos(frameCount * 0.01 + i) * 5;
        }
        
        // Add interactivity
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            const influence = Math.max(0, 1 - distToMouse / 300);
            x += (mouseX - x) * influence * 0.05;
            y += (mouseY - y) * influence * 0.05;
        }
        
        const radius = 20 + Math.random() * 80;
        const color = palette[Math.floor(Math.random() * palette.length)];
        
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = Math.random() < 0.5 ? 'multiply' : 'screen';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + Math.random() * 20;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
}

// Export the drawing function
export { drawOrganicSplatters };
