/**
 * styles-default.js - Default masterpiece art style for the Generative Art Studio
 * Combines elements from all other art styles into one harmonious masterpiece
 */

import { randomRange, randomInt } from './utils.js';

/**
 * Draw the Default Masterpiece style - combines all other art styles
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawDefaultMasterpiece(ctx, palette, isAnimationFrame = false, params = {}) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    // Create a layered composition by applying multiple styles with reduced opacity

    // 1. Start with a dark background for contrast
    ctx.fillStyle = 'rgb(10, 10, 15)';
    ctx.fillRect(0, 0, width, height);

    // 2. Add Voronoi Cells as a base layer (reduced number and opacity)
    drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, 0.4);

    // 3. Add Organic Splatters for color blobs (reduced number and opacity)
    drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, params, 0.3);

    // 4. Add Neon Waves for glowing elements (reduced number)
    drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, 0.6);

    // 5. Add Fractal Lines for structure (reduced number)
    drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, 0.7);

    // 6. Add Geometric Grid elements for balance (reduced number)
    drawGeometricGridLayer(ctx, palette, isAnimationFrame, params, 0.6);

    // 7. Add Particle Swarm for movement (reduced number)
    drawParticleSwarmLayer(ctx, palette, isAnimationFrame, params, 0.5);

    // 8. Add subtle Organic Noise for texture
    drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, params, 0.3);

    // 9. Add Glitch Mosaic effects for contemporary feel (very subtle)
    drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, params, 0.15);

    // 10. Add Pixel Sort effects for digital aesthetic (very subtle)
    drawPixelSortLayer(ctx, palette, isAnimationFrame, params, 0.2);

    // Reset composite operation and global alpha
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
}

/**
 * Draw a reduced Voronoi Cells layer
 */
function drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of cells
    const numCells = 10 + Math.floor(Math.random() * 15);

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
            radius: 50 + Math.random() * 150
        });
    }

    // Draw each cell
    for (const cell of cellCenters) {
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);

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
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Organic Splatters layer
 */
function drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of splatters
    const numSplatters = 5 + Math.floor(Math.random() * 10);

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

        const radius = 30 + Math.random() * 100;
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
    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Neon Waves layer
 */
function drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of waves
    const numWaves = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numWaves; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];

        // Wave parameters
        const startX = -width * 0.2;
        const startY = height * (0.2 + Math.random() * 0.6);
        const frequency = 0.005 + Math.random() * 0.015;
        const amplitude = 20 + Math.random() * 80;
        const phaseShift = Math.random() * Math.PI * 2;

        // Animation and interactivity
        let interactiveFrequency = frequency;
        let interactiveAmplitude = amplitude;
        let timeOffset = isAnimationFrame ? frameCount * 0.05 : 0;

        if (isInteractive) {
            const distToWave = Math.abs(mouseY - startY);
            const influence = Math.max(0, 1 - distToWave / 200);
            interactiveFrequency += (mouseX / width) * influence * 0.01;
            interactiveAmplitude += (mouseY / height) * influence * 50;
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
        const thickness = 1 + Math.random() * 2;

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
    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Fractal Lines layer
 */
function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;

    // Reduced number of base lines
    const numBaseLines = 1 + Math.floor(Math.random() * 2);
    const maxDepth = 3 + Math.floor(Math.random() * 2);

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
            const distToMouse1 = Math.sqrt(Math.pow(x1 - mouseX, 2) + Math.pow(y1 - mouseY, 2));
            const distToMouse2 = Math.sqrt(Math.pow(x2 - mouseX, 2) + Math.pow(y2 - mouseY, 2));

            const influence1 = Math.max(0, 1 - distToMouse1 / 300);
            const influence2 = Math.max(0, 1 - distToMouse2 / 300);

            x1 += (mouseX - x1) * influence1 * 0.1;
            y1 += (mouseY - y1) * influence1 * 0.1;
            x2 += (mouseX - x2) * influence2 * 0.1;
            y2 += (mouseY - y2) * influence2 * 0.1;
        }

        const color = palette[Math.floor(Math.random() * palette.length)];
        ctx.strokeStyle = color;

        // Draw fractal line recursively
        drawFractalLineRecursive(ctx, x1, y1, x2, y2, maxDepth, color, palette);
    }

    ctx.globalAlpha = opacity;
}

/**
 * Helper function for fractal lines
 */
function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, color, palette) {
    if (depth <= 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Add some randomness to the midpoint (perpendicular to the line)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate perpendicular offset
    const offsetAmount = length * (0.1 + Math.random() * 0.2);
    const offsetX = -dy / length * offsetAmount;
    const offsetY = dx / length * offsetAmount;

    const newMidX = midX + offsetX;
    const newMidY = midY + offsetY;

    // Randomly change color for some branches
    if (Math.random() < 0.3) {
        ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
    } else {
        ctx.strokeStyle = color;
    }

    // Recursively draw the two halves
    drawFractalLineRecursive(ctx, x1, y1, newMidX, newMidY, depth - 1, color, palette);
    drawFractalLineRecursive(ctx, newMidX, newMidY, x2, y2, depth - 1, color, palette);
}

/**
 * Draw a reduced Geometric Grid layer
 */
function drawGeometricGridLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced grid size
    const cols = 3 + Math.floor(Math.random() * 4);
    const rows = 2 + Math.floor(Math.random() * 3);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Animation factor
    const animFactor = isAnimationFrame ? frameCount * 0.01 : 0;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Skip some cells for a more sparse look
            if (Math.random() < 0.4) continue;

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
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fillRect(-size / 2, -size / 2, size, size);
                        ctx.globalAlpha = opacity;
                    } else {
                        ctx.strokeRect(-size / 2, -size / 2, size, size);
                    }
                    break;
                case 2:
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                    if (shouldFill) {
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fill();
                        ctx.globalAlpha = opacity;
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
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fill();
                        ctx.globalAlpha = opacity;
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
            ctx.restore();
        }
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Particle Swarm layer
 */
function drawParticleSwarmLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of particles
    const numParticles = 30 + Math.floor(Math.random() * 50);
    const trailLength = 5 + Math.random() * 10;
    const maxSpeed = 1 + Math.random() * 2;

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
            ctx.globalAlpha = opacity * (1 - (j / trailLength));
            ctx.lineWidth = 1 + Math.random();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Organic Noise layer
 */
function drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of curves
    const numCurves = 20 + Math.floor(Math.random() * 30);

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

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Glitch Mosaic layer
 */
function drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Very reduced number of glitch effects
    const numRects = 5 + Math.floor(Math.random() * 10);
    const maxShift = 10 + Math.random() * 20;

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

        const sw = 20 + Math.random() * 100;
        const sh = 10 + Math.random() * 50;

        // Calculate destination with a shift
        const dx = sx + (Math.random() - 0.5) * maxShift;
        const dy = sy + (Math.random() - 0.5) * maxShift;

        // Source coordinates must be within canvas bounds
        const sourceX = Math.max(0, Math.min(width - 1, sx));
        const sourceY = Math.max(0, Math.min(height - 1, sy));
        const sourceW = Math.min(sw, width - sourceX);
        const sourceH = Math.min(sh, height - sourceY);

        // Destination coordinates can be outside
        const destX = dx;
        const destY = dy;

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

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Pixel Sort layer
 */
function drawPixelSortLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Add a few sorted pixel-like rectangles
    const numSortedSections = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numSortedSections; i++) {
        // Choose a random starting point
        const startX = Math.random() * width;
        const startY = Math.random() * height;

        // Choose a random direction (horizontal or vertical)
        const isHorizontal = Math.random() < 0.5;

        // Choose a random length
        const length = 50 + Math.random() * 200;
        const thickness = 2 + Math.random() * 10;

        // Sort a section of "pixels"
        const numPixels = 10 + Math.floor(Math.random() * 20);
        const pixelSize = length / numPixels;

        // Create an array of colors from the palette
        const colors = [];
        for (let j = 0; j < numPixels; j++) {
            colors.push(palette[Math.floor(Math.random() * palette.length)]);
        }

        // Sort colors by brightness (simple approximation)
        colors.sort((a, b) => {
            // Extract RGB values
            const rgbA = a.match(/\d+/g).map(Number);
            const rgbB = b.match(/\d+/g).map(Number);

            // Calculate brightness
            const brightnessA = (rgbA[0] + rgbA[1] + rgbA[2]) / 3;
            const brightnessB = (rgbB[0] + rgbB[1] + rgbB[2]) / 3;

            return brightnessA - brightnessB;
        });

        // Draw the sorted pixels
        for (let j = 0; j < numPixels; j++) {
            ctx.fillStyle = colors[j];

            if (isHorizontal) {
                ctx.fillRect(
                    startX + j * pixelSize,
                    startY,
                    pixelSize,
                    thickness
                );
            } else {
                ctx.fillRect(
                    startX,
                    startY + j * pixelSize,
                    thickness,
                    pixelSize
                );
            }
        }
    }

    // Add a few glitch effects
    const numGlitches = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numGlitches; i++) {
        const glitchX = Math.random() * width;
        const glitchY = Math.random() * height;
        const glitchW = 5 + Math.random() * 20;
        const glitchH = 2 + Math.random() * 10;

        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(glitchX, glitchY, glitchW, glitchH);
    }

    ctx.globalAlpha = opacity;
}

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
