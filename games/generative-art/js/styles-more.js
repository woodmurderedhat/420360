/**
 * styles-more.js - Additional art style implementations for the Generative Art Studio
 * Contains the Voronoi Cells style and other additional styles
 */

import { randomRange, randomInt } from './utils.js';

/**
 * Draw the Voronoi Cells style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawVoronoiCells(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;
    
    // For a true Voronoi diagram, we'd need to compute distances to all points
    // This is a simplified version that creates a cell-like appearance
    const numCells = 30 + Math.floor(Math.random() * 50);
    
    // Generate cell centers
    const cellCenters = [];
    for (let i = 0; i < numCells; i++) {
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
            x += (mouseX - x) * influence * 0.1;
            y += (mouseY - y) * influence * 0.1;
        }
        
        cellCenters.push({
            x,
            y,
            color: palette[Math.floor(Math.random() * palette.length)],
            radius: 30 + Math.random() * 100
        });
    }
    
    // Draw each cell
    for (const cell of cellCenters) {
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = 0.1 + Math.random() * 0.3;
        
        // Draw a polygon instead of a circle to create a more cell-like appearance
        const sides = 5 + Math.floor(Math.random() * 4);
        const angleOffset = Math.random() * Math.PI * 2;
        
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = angleOffset + (i * 2 * Math.PI / sides);
            const x = cell.x + Math.cos(angle) * cell.radius * (0.8 + Math.random() * 0.4);
            const y = cell.y + Math.sin(angle) * cell.radius * (0.8 + Math.random() * 0.4);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Add cell border
        if (Math.random() < 0.5) {
            ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
            ctx.lineWidth = 0.5 + Math.random();
            ctx.globalAlpha = 0.3 + Math.random() * 0.3;
            ctx.stroke();
        }
    }
    
    ctx.globalAlpha = 1.0;
    
    // Add connecting lines between some cells for a network effect
    if (Math.random() < 0.7 || isAnimationFrame) {
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < cellCenters.length; i++) {
            const cell1 = cellCenters[i];
            
            // Connect to a few nearby cells
            for (let j = i + 1; j < cellCenters.length; j++) {
                const cell2 = cellCenters[j];
                const distance = Math.sqrt(
                    Math.pow(cell1.x - cell2.x, 2) + 
                    Math.pow(cell1.y - cell2.y, 2)
                );
                
                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(cell1.x, cell1.y);
                    ctx.lineTo(cell2.x, cell2.y);
                    ctx.strokeStyle = Math.random() < 0.5 ? cell1.color : cell2.color;
                    ctx.stroke();
                }
            }
        }
        
        ctx.globalAlpha = 1.0;
    }
}

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

/**
 * Draw an organic noise primitive
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {number} index - Index for color selection
 * @param {number} total - Total number of primitives
 */
function drawOrganicNoisePrimitive(ctx, palette, index = 0, total = 1) {
    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
    
    const x = canvasWidth * Math.random();
    const y = canvasHeight * Math.random();
    const cp1x = x + Math.random() * 200 - 100;
    const cp1y = y + Math.random() * 200 - 100;
    const cp2x = x + Math.random() * 200 - 100;
    const cp2y = y + Math.random() * 200 - 100;
    const endX = x + Math.random() * 200 - 100;
    const endY = y + Math.random() * 200 - 100;
    
    const colorIndex = Math.floor((index / total) * palette.length) % palette.length;
    ctx.strokeStyle = palette[colorIndex];
    ctx.lineWidth = 1 + Math.random() * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
}

// Export the additional art style drawing functions
export {
    drawVoronoiCells,
    drawGeometricGridPrimitive,
    drawOrganicNoisePrimitive
};
