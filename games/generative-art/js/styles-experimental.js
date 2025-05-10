/**
 * styles-experimental.js - Experimental art style implementations for the Generative Art Studio
 * Contains more advanced and experimental art style drawing functions
 */

import { randomRange, randomInt } from './utils.js';

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

// Export the experimental art style drawing functions
export {
    drawGlitchMosaic,
    drawNeonWaves,
    drawPixelSort
};
