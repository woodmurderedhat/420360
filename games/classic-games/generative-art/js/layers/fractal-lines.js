/**
 * js/layers/fractal-lines.js - Enhanced Fractal Lines layer for the Generative Art Studio
 * Implements advanced branching, color transitions, and glow effects
 */

import { parseColorToRgb } from '../utils.js';

/**
 * Helper function to interpolate between two colors
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} - Interpolated color in rgba format
 */
function interpolateColors(color1, color2, factor) {
    // Parse colors to RGB using our utility function
    const { r: r1, g: g1, b: b1 } = parseColorToRgb(color1);
    const { r: r2, g: g2, b: b2 } = parseColorToRgb(color2);

    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgba(${r}, ${g}, ${b}, 1)`;
}

/**
 * Enhanced recursive function for drawing fractal lines with glow effects
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start x coordinate
 * @param {number} y1 - Start y coordinate
 * @param {number} x2 - End x coordinate
 * @param {number} y2 - End y coordinate
 * @param {number} depth - Current recursion depth
 * @param {string} startColor - Starting color
 * @param {string} endColor - Ending color
 * @param {number} thickness - Line thickness
 * @param {number} maxDepth - Maximum recursion depth
 * @param {Array<string>} palette - Color palette for branching
 * @param {boolean} isMainBranch - Whether this is a main branch
 * @param {number} branchProbability - Probability of creating additional branches
 */
function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, startColor, endColor, thickness, maxDepth, palette, isMainBranch = true, branchProbability = 0.7) {
    if (depth === 0) {
        // Draw the final line segment with glow effect
        const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const normalizedLength = Math.min(1, lineLength / 200); // Normalize length for glow intensity

        // Parse colors for glow using our utility function
        const { r, g, b } = parseColorToRgb(startColor);

        // Draw glow (multiple passes with decreasing opacity)
        const glowPasses = isMainBranch ? 3 : 2;
        const glowSize = thickness * (isMainBranch ? 3 : 2);

        for (let pass = 0; pass < glowPasses; pass++) {
            const glowOpacity = (glowPasses - pass) / glowPasses * 0.5 * normalizedLength;
            const glowThickness = thickness + (pass * glowSize / glowPasses);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = glowThickness;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${glowOpacity})`;
            ctx.stroke();
        }

        // Draw the core line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness * 0.6;
        ctx.strokeStyle = startColor;
        ctx.stroke();

        return;
    }

    // Calculate midpoint with some randomness
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Add more variation for more interesting patterns
    const displacementFactor = 0.3 * (1 - depth / maxDepth); // More displacement at higher levels
    const newX = midX + dy * displacementFactor * (Math.random() - 0.5);
    const newY = midY - dx * displacementFactor * (Math.random() - 0.5);

    // Interpolate colors for smooth transitions
    const midColor = interpolateColors(startColor, endColor, 0.5);

    // Calculate thickness for this level (thinner as we go deeper)
    const newThickness = thickness * 0.85;

    // Draw the two main branches
    drawFractalLineRecursive(ctx, x1, y1, newX, newY, depth - 1, startColor, midColor, newThickness, maxDepth, palette, isMainBranch, branchProbability);
    drawFractalLineRecursive(ctx, newX, newY, x2, y2, depth - 1, midColor, endColor, newThickness, maxDepth, palette, isMainBranch, branchProbability);

    // Randomly add extra branches for more complexity
    if (depth > 1 && Math.random() < branchProbability * (depth / maxDepth)) {
        // Calculate a new point for the branch
        const branchX = newX + (dx + dy) * 0.3 * (Math.random() - 0.5);
        const branchY = newY + (dy - dx) * 0.3 * (Math.random() - 0.5);

        // Get a new color from the palette for the branch
        const branchColor = palette[Math.floor(Math.random() * palette.length)];

        // Draw the extra branch with reduced thickness
        drawFractalLineRecursive(
            ctx, newX, newY, branchX, branchY,
            depth - 1, midColor, branchColor,
            newThickness * 0.7, maxDepth, palette, false, branchProbability * 0.7
        );
    }
}

/**
 * Draw an enhanced Fractal Lines layer with glow effects and complex branching
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame (used for animated effects)
 * @param {Object} params - Parameters including canvasWidth, canvasHeight, fractalLinesDensity, lineWidth.
 * @param {number} opacity - Opacity of the layer
 */
export function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    // Save context state
    ctx.save();

    // Add some animation effects if this is an animation frame
    const animationOffset = isAnimationFrame ? Math.sin(Date.now() * 0.001) * 10 : 0;
    const animationRotation = isAnimationFrame ? Math.sin(Date.now() * 0.0005) * 0.05 : 0;

    const { canvasWidth, canvasHeight, fractalLinesDensity, lineWidth } = params;
    // Ensure fractalLinesDensity is a number, default if not provided
    const density = typeof fractalLinesDensity === 'number' ? fractalLinesDensity : 50;
    const numLines = Math.floor((density / 100) * 8) + 1; // More lines with higher density

    // Increase max depth based on density for more complex fractals
    const maxDepth = Math.floor((density / 100) * 2) + 3; // 3-5 based on density

    ctx.globalAlpha = opacity;
    const baseThickness = lineWidth || 2; // Thicker base lines for better visibility

    // Create a set of predefined starting points for more intentional composition
    const startingPoints = [];

    // Add some points from the edges for a more balanced composition
    startingPoints.push({ x: 0, y: canvasHeight / 3 });
    startingPoints.push({ x: 0, y: canvasHeight * 2/3 });
    startingPoints.push({ x: canvasWidth, y: canvasHeight / 3 });
    startingPoints.push({ x: canvasWidth, y: canvasHeight * 2/3 });
    startingPoints.push({ x: canvasWidth / 3, y: 0 });
    startingPoints.push({ x: canvasWidth * 2/3, y: 0 });
    startingPoints.push({ x: canvasWidth / 3, y: canvasHeight });
    startingPoints.push({ x: canvasWidth * 2/3, y: canvasHeight });

    // Add some random points
    for (let i = 0; i < numLines - startingPoints.length; i++) {
        startingPoints.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight
        });
    }

    // Draw fractal lines from each starting point
    for (let i = 0; i < Math.min(numLines, startingPoints.length); i++) {
        // Get starting point
        const startPoint = startingPoints[i];

        // Apply animation offset and rotation if animating
        const startX = startPoint.x + (isAnimationFrame ? animationOffset * Math.cos(i) : 0);
        const startY = startPoint.y + (isAnimationFrame ? animationOffset * Math.sin(i) : 0);

        // Calculate end point with some randomness but directed toward center for better composition
        const centerPull = 0.3 + Math.random() * 0.4; // How strongly to pull toward center
        const randomFactor = 1 - centerPull;

        const endX = (canvasWidth / 2) * centerPull + randomFactor * Math.random() * canvasWidth;
        const endY = (canvasHeight / 2) * centerPull + randomFactor * Math.random() * canvasHeight;

        // Select colors for this fractal line
        const startColorIndex = Math.floor(Math.random() * palette.length);
        const endColorIndex = (startColorIndex + 1 + Math.floor(Math.random() * (palette.length - 1))) % palette.length;

        const startColor = palette[startColorIndex];
        const endColor = palette[endColorIndex];

        // Apply rotation if animating
        if (isAnimationFrame && animationRotation !== 0) {
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            ctx.rotate(animationRotation);
            ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
        }

        // Initial call to the recursive function with improved parameters
        drawFractalLineRecursive(
            ctx, startX, startY, endX, endY,
            maxDepth, startColor, endColor,
            baseThickness, maxDepth, palette, true, 0.7
        );

        // Reset rotation if applied
        if (isAnimationFrame && animationRotation !== 0) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = opacity; // Restore opacity after transform reset
        }
    }

    // Restore context state
    ctx.restore();
}
