/**
 * geometricGrid.js - Geometric Grid style implementation for the Generative Art Studio
 */

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

// Export the drawing function
export { drawGeometricGrid };
