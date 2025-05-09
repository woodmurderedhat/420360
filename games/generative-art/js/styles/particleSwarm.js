/**
 * particleSwarm.js - Particle Swarm style implementation for the Generative Art Studio
 */

/**
 * Draw the Particle Swarm style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawParticleSwarm(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const numParticles = 200 + Math.floor(Math.random() * 301);
    const trailLength = 10 + Math.random() * 20;
    const maxSpeed = 2 + Math.random() * 3;
    
    for (let i = 0; i < numParticles; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;
        
        // Add animation
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i * 0.1) * 5;
            y += Math.cos(frameCount * 0.01 + i * 0.1) * 5;
        }
        
        let vx = (Math.random() - 0.5) * maxSpeed * 2;
        let vy = (Math.random() - 0.5) * maxSpeed * 2;
        
        // Add interactivity
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            if (distToMouse < 200) {
                const angle = Math.atan2(y - mouseY, x - mouseX);
                vx += Math.cos(angle) * (1 - distToMouse / 200) * 2;
                vy += Math.sin(angle) * (1 - distToMouse / 200) * 2;
            }
        }
        
        const color = palette[Math.floor(Math.random() * palette.length)];
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        for (let j = 0; j < trailLength; j++) {
            x += vx;
            y += vy;
            
            vx += (Math.random() - 0.5) * 0.5;
            vy += (Math.random() - 0.5) * 0.5;
            
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 1 - (j / trailLength);
            ctx.lineWidth = 1 + Math.random();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        ctx.globalAlpha = 1.0;
    }
}

// Export the drawing function
export { drawParticleSwarm };
