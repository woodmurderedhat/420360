/**
 * neonWaves.js - Neon Waves style implementation for the Generative Art Studio
 */

/**
 * Draw the Neon Waves style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawNeonWaves(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    // Set background to dark
    ctx.fillStyle = 'rgb(10, 10, 15)';
    ctx.fillRect(0, 0, width, height);
    
    const numWaves = 10 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < numWaves; i++) {
        const color = palette[i % palette.length];
        let startX = Math.random() * width * 0.2;
        let startY = Math.random() * height;
        
        // Animation factors
        const timeOffset = isAnimationFrame ? frameCount * 0.02 : 0;
        const amplitude = 20 + Math.random() * 80;
        const frequency = 0.005 + Math.random() * 0.02;
        const phaseShift = Math.random() * Math.PI * 2;
        
        // Interactive factors
        let interactiveAmplitude = amplitude;
        let interactiveFrequency = frequency;
        
        if (isInteractive) {
            const distToMouse = Math.min(height, Math.abs(startY - mouseY));
            const influence = Math.max(0, 1 - distToMouse / (height * 0.5));
            interactiveAmplitude += influence * 50;
            interactiveFrequency += influence * 0.01;
        }
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        for (let x = 0; x < width * 1.2; x += 2) {
            const actualX = startX + x;
            const wavePhase = x * interactiveFrequency + phaseShift + timeOffset;
            const actualY = startY + Math.sin(wavePhase) * interactiveAmplitude;
            
            ctx.lineTo(actualX, actualY);
        }
        
        // Neon glow effect
        const thickness = 1 + Math.random() * 3;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Outer glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // Inner bright line
        ctx.shadowBlur = 0;
        ctx.lineWidth = thickness / 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }
    
    // Reset
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.shadowBlur = 0;
}

// Export the drawing function
export { drawNeonWaves };
