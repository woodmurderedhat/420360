/**
 * pixelSort.js - Pixel Sort style implementation for the Generative Art Studio
 */

/**
 * Draw the Pixel Sort style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawPixelSort(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    // Create a base of random colors
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(
            Math.random() * width, 
            Math.random() * height, 
            width * 0.2 + Math.random() * width * 0.3, 
            height * 0.2 + Math.random() * height * 0.3
        );
    }
    
    // Create sorted bands
    const numBands = 20 + Math.floor(Math.random() * 30);
    
    for (let i = 0; i < numBands; i++) {
        const isHorizontal = Math.random() < 0.5;
        let bandWidth = 5 + Math.random() * 30;
        let startPos = Math.random() * (isHorizontal ? height : width);
        let length = 50 + Math.random() * (isHorizontal ? width : height);
        
        // Animation
        if (isAnimationFrame) {
            startPos += Math.sin(frameCount * 0.02 + i) * 10;
            bandWidth += Math.cos(frameCount * 0.02 + i) * 2;
        }
        
        // Interactivity
        if (isInteractive) {
            const mousePos = isHorizontal ? mouseY : mouseX;
            const distToMouse = Math.abs(startPos - mousePos);
            if (distToMouse < 100) {
                bandWidth += (1 - distToMouse / 100) * 20;
                startPos += (mousePos - startPos) * 0.1;
            }
        }
        
        const color1 = palette[Math.floor(Math.random() * palette.length)];
        const color2 = palette[Math.floor(Math.random() * palette.length)];
        
        // Create gradient
        let gradient;
        if (isHorizontal) {
            gradient = ctx.createLinearGradient(0, startPos, length, startPos);
        } else {
            gradient = ctx.createLinearGradient(startPos, 0, startPos, length);
        }
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        
        if (isHorizontal) {
            ctx.fillRect(0, startPos, length, bandWidth);
        } else {
            ctx.fillRect(startPos, 0, bandWidth, length);
        }
    }
    
    // Add glitch effects
    const numGlitches = 10 + Math.floor(Math.random() * 20);
    for (let i = 0; i < numGlitches; i++) {
        const glitchX = Math.random() * width;
        const glitchY = Math.random() * height;
        const glitchW = 5 + Math.random() * 30;
        const glitchH = 2 + Math.random() * 15;
        
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(glitchX, glitchY, glitchW, glitchH);
    }
}

// Export the drawing function
export { drawPixelSort };
