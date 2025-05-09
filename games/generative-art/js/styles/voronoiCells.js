/**
 * voronoiCells.js - Voronoi Cells style implementation for the Generative Art Studio
 */

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

// Export the drawing function
export { drawVoronoiCells };
