/**
 * glitchMosaic.js - Glitch Mosaic style implementation for the Generative Art Studio
 */

/**
 * Draw the Glitch Mosaic style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawGlitchMosaic(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const numRects = 30 + Math.floor(Math.random() * 70);
    const maxShift = 20 + Math.random() * 30;
    
    // Create a base of random rectangles
    const tempPalette = [...palette]; // Clone the palette
    for (let k = 0; k < 50; k++) {
        ctx.fillStyle = tempPalette[Math.floor(Math.random() * tempPalette.length)];
        ctx.fillRect(
            Math.random() * width, 
            Math.random() * height, 
            Math.random() * 200, 
            Math.random() * 200
        );
    }
    
    // Apply glitch effect by copying and shifting parts of the canvas
    for (let i = 0; i < numRects; i++) {
        let sx = Math.random() * width;
        let sy = Math.random() * height;
        
        // Add animation
        if (isAnimationFrame) {
            sx += Math.sin(frameCount * 0.01 + i) * 10;
            sy += Math.cos(frameCount * 0.01 + i) * 10;
        }
        
        // Add interactivity
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(sx - mouseX, 2) + Math.pow(sy - mouseY, 2));
            if (distToMouse < 200) {
                const angle = Math.atan2(sy - mouseY, sx - mouseX);
                sx += Math.cos(angle) * (1 - distToMouse / 200) * 50;
                sy += Math.sin(angle) * (1 - distToMouse / 200) * 50;
            }
        }
        
        const sw = 50 + Math.random() * (width / 5);
        const sh = 50 + Math.random() * (height / 5);
        
        const dx = sx + (Math.random() - 0.5) * 2 * maxShift;
        const dy = sy + (Math.random() - 0.5) * 2 * maxShift;
        
        const sourceX = Math.max(0, Math.floor(sx));
        const sourceY = Math.max(0, Math.floor(sy));
        const sourceW = Math.max(1, Math.floor(sw));
        const sourceH = Math.max(1, Math.floor(sh));
        
        const destX = Math.max(0, Math.floor(dx));
        const destY = Math.max(0, Math.floor(dy));
        
        // Safety checks to prevent errors
        if (sourceX + sourceW > width || sourceY + sourceH > height ||
            destX + sourceW > width || destY + sourceH > height) {
            continue;
        }
        
        try {
            ctx.drawImage(
                ctx.canvas,
                sourceX, sourceY, sourceW, sourceH,
                destX, destY, sourceW, sourceH
            );
        } catch (e) {
            // Fallback if drawImage fails
            ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
            ctx.fillRect(destX, destY, sourceW, sourceH);
        }
    }
    
    // Add scan lines for extra glitch effect
    if (Math.random() < 0.5 || isAnimationFrame) {
        ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)] || 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5 + Math.random();
        ctx.globalAlpha = 0.1 + Math.random() * 0.2;
        
        const scanLineSpacing = 3 + Math.random() * 4;
        const offset = isAnimationFrame ? frameCount % scanLineSpacing : 0;
        
        for (let y = offset; y < height; y += scanLineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// Export the drawing function
export { drawGlitchMosaic };
