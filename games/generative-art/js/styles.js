/**
 * styles.js - Art style definitions for the Generative Art Studio
 * Contains the art style constants and style-specific drawing functions
 */

// Art style definitions
const artStyles = {
    DEFAULT: 'Default',
    GEOMETRIC_GRID: 'Geometric Grid',
    ORGANIC_NOISE: 'Organic Noise',
    FRACTAL_LINES: 'Fractal Lines',
    PARTICLE_SWARM: 'Particle Swarm',
    ORGANIC_SPLATTERS: 'Organic Splatters',
    GLITCH_MOSAIC: 'Glitch Mosaic',
    NEON_WAVES: 'Neon Waves',
    PIXEL_SORT: 'Pixel Sort',
    VORONOI_CELLS: 'Voronoi Cells',
};

/**
 * Draw the Geometric Grid style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawGeometricGrid(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    const cols = 5 + Math.floor(Math.random() * 10);
    const rows = 3 + Math.floor(Math.random() * 8);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    // Animation factor
    const animFactor = isAnimationFrame ? frameCount * 0.01 : 0;
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            ctx.save();
            
            // Add subtle movement if animating
            let xOffset = (Math.random() - 0.25) * cellWidth * 0.5;
            let yOffset = (Math.random() - 0.25) * cellHeight * 0.5;
            
            if (isAnimationFrame) {
                xOffset += Math.sin(frameCount * 0.02 + i * 0.5) * 5;
                yOffset += Math.cos(frameCount * 0.02 + j * 0.5) * 5;
            }
            
            // Interactive influence
            if (isInteractive) {
                const cellCenterX = i * cellWidth + cellWidth / 2;
                const cellCenterY = j * cellHeight + cellHeight / 2;
                const distToMouse = Math.sqrt(
                    Math.pow(cellCenterX - mouseX, 2) + 
                    Math.pow(cellCenterY - mouseY, 2)
                );
                const influence = Math.max(0, 1 - distToMouse / 300);
                xOffset += (mouseX - cellCenterX) * influence * 0.1;
                yOffset += (mouseY - cellCenterY) * influence * 0.1;
            }
            
            const x = i * cellWidth + cellWidth / 2 + xOffset;
            const y = j * cellHeight + cellHeight / 2 + yOffset;
            
            ctx.translate(x, y);
            ctx.rotate((Math.random() * Math.PI * 2) + (isAnimationFrame ? animFactor : 0));
            
            const color = palette[Math.floor(Math.random() * palette.length)];
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1 + Math.random() * 3;
            const shouldFill = Math.random() < 0.3;
            
            const primitiveType = Math.floor(Math.random() * 4);
            const size = Math.min(cellWidth, cellHeight) * (0.2 + Math.random() * 0.5);
            
            switch (primitiveType) {
                case 0:
                    ctx.beginPath();
                    ctx.moveTo(-size / 2, 0);
                    ctx.lineTo(size / 2, 0);
                    ctx.stroke();
                    break;
                case 1:
                    ctx.beginPath();
                    if (shouldFill) {
                        ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                        ctx.fillRect(-size / 2, -size / 2, size, size);
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.strokeRect(-size / 2, -size / 2, size, size);
                    }
                    break;
                case 2:
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
                case 3:
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
    }
}

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

// Export the art styles and drawing functions
export { 
    artStyles,
    drawGeometricGrid,
    drawOrganicNoise
};
