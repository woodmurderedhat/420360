/**
 * styles-advanced.js - Advanced art style implementations for the Generative Art Studio
 * Contains more complex art style drawing functions
 */

import { randomRange, randomInt } from './utils.js';

/**
 * Draw the Fractal Lines style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawFractalLines(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const maxDepth = 4 + Math.floor(Math.random() * 3);
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    
    const numBaseLines = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numBaseLines; i++) {
        let x1 = Math.random() * width;
        let y1 = Math.random() * height;
        let x2 = Math.random() * width;
        let y2 = Math.random() * height;
        
        // Add animation
        if (isAnimationFrame) {
            const angle = frameCount * 0.01;
            x1 += Math.sin(angle + i) * 10;
            y1 += Math.cos(angle + i) * 10;
            x2 += Math.sin(angle + i + Math.PI) * 10;
            y2 += Math.cos(angle + i + Math.PI) * 10;
        }
        
        // Add interactivity
        if (isInteractive) {
            const dist1 = Math.sqrt(Math.pow(x1 - mouseX, 2) + Math.pow(y1 - mouseY, 2));
            const dist2 = Math.sqrt(Math.pow(x2 - mouseX, 2) + Math.pow(y2 - mouseY, 2));
            
            const influence1 = Math.max(0, 1 - dist1 / 300);
            const influence2 = Math.max(0, 1 - dist2 / 300);
            
            x1 += (mouseX - x1) * influence1 * 0.1;
            y1 += (mouseY - y1) * influence1 * 0.1;
            x2 += (mouseX - x2) * influence2 * 0.1;
            y2 += (mouseY - y2) * influence2 * 0.1;
        }
        
        drawFractalLineRecursive(ctx, x1, y1, x2, y2, 0, maxDepth, palette);
    }
}

/**
 * Recursive helper for drawing fractal lines
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x1 - Start x coordinate
 * @param {number} y1 - Start y coordinate
 * @param {number} x2 - End x coordinate
 * @param {number} y2 - End y coordinate
 * @param {number} depth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @param {Array<string>} palette - The color palette
 */
function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, maxDepth, palette) {
    if (depth >= maxDepth) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const offsetAmount = length * 0.3 * (Math.random() - 0.5) * 2;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const normalX = -dy / length;
    const normalY = dx / length;
    
    const newMidX = midX + normalX * offsetAmount;
    const newMidY = midY + normalY * offsetAmount;
    
    ctx.strokeStyle = palette[depth % palette.length];
    
    drawFractalLineRecursive(ctx, x1, y1, newMidX, newMidY, depth + 1, maxDepth, palette);
    drawFractalLineRecursive(ctx, newMidX, newMidY, x2, y2, depth + 1, maxDepth, palette);
}

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

// Export the advanced art style drawing functions
export {
    drawFractalLines,
    drawParticleSwarm,
    drawOrganicSplatters,
    drawFractalLineRecursive
};
