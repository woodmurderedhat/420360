/**
 * js/layers/gradient-overlay.js - Gradient Overlay layer for the Generative Art Studio
 * Creates various gradient overlay effects using palette colors
 */

import { parseColorToRgb } from '../utils.js';

/**
 * Draw a Gradient Overlay layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawGradientOverlayLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, blendMode = 'overlay' } = params;

    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Set blend mode if supported
    if (blendMode && ctx.globalCompositeOperation) {
        ctx.globalCompositeOperation = blendMode;
    }

    // Choose a gradient type based on seed
    const gradientType = randomFn() < 0.33 ? 'linear' :
                         randomFn() < 0.66 ? 'radial' : 'conic';

    // Create gradient based on type
    let gradient;
    switch (gradientType) {
        case 'linear':
            gradient = createLinearGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame);
            break;
        case 'radial':
            gradient = createRadialGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame);
            break;
        case 'conic':
            gradient = createConicGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame);
            break;
    }

    // Add color stops using palette colors
    addColorStops(gradient, palette, randomFn, isAnimationFrame);

    // Apply the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Restore the context state
    ctx.restore();
}

/**
 * Create a linear gradient
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @returns {CanvasGradient} The created gradient
 */
function createLinearGradient(ctx, width, height, randomFn, isAnimationFrame) {
    // Determine gradient direction
    const angle = randomFn() * Math.PI * 2;

    // Add animation effect if needed
    const animationOffset = isAnimationFrame ? Math.sin(Date.now() * 0.001) * 20 : 0;

    // Calculate start and end points based on angle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(width * width + height * height) / 2;

    const x1 = centerX + Math.cos(angle) * radius + (isAnimationFrame ? animationOffset : 0);
    const y1 = centerY + Math.sin(angle) * radius + (isAnimationFrame ? animationOffset : 0);
    const x2 = centerX + Math.cos(angle + Math.PI) * radius - (isAnimationFrame ? animationOffset : 0);
    const y2 = centerY + Math.sin(angle + Math.PI) * radius - (isAnimationFrame ? animationOffset : 0);

    return ctx.createLinearGradient(x1, y1, x2, y2);
}

/**
 * Create a radial gradient
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @returns {CanvasGradient} The created gradient
 */
function createRadialGradient(ctx, width, height, randomFn, isAnimationFrame) {
    // Determine gradient center and radii
    const centerX = width * (0.3 + randomFn() * 0.4);
    const centerY = height * (0.3 + randomFn() * 0.4);

    // Add animation effect if needed
    const animationOffset = isAnimationFrame ? Math.sin(Date.now() * 0.001) * 20 : 0;
    const innerRadius = Math.min(width, height) * (0.05 + randomFn() * 0.1) + (isAnimationFrame ? animationOffset : 0);
    const outerRadius = Math.min(width, height) * (0.4 + randomFn() * 0.6) + (isAnimationFrame ? animationOffset : 0);

    return ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
}

/**
 * Create a conic gradient (or simulate it for browsers that don't support it)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @returns {CanvasGradient} The created gradient
 */
function createConicGradient(ctx, width, height, randomFn, isAnimationFrame) {
    // Check if createConicGradient is supported
    if (typeof ctx.createConicGradient === 'function') {
        const centerX = width / 2;
        const centerY = height / 2;
        const angle = randomFn() * Math.PI * 2 + (isAnimationFrame ? Date.now() * 0.001 : 0);
        return ctx.createConicGradient(angle, centerX, centerY);
    } else {
        // Fallback to radial gradient if conic is not supported
        return createRadialGradient(ctx, width, height, randomFn, isAnimationFrame);
    }
}

/**
 * Add color stops to a gradient using palette colors
 * @param {CanvasGradient} gradient - The gradient to add color stops to
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 */
function addColorStops(gradient, palette, randomFn, isAnimationFrame) {
    // Determine number of color stops
    const numStops = 3 + Math.floor(randomFn() * 3); // 3-5 stops

    // Add animation effect if needed
    const animationOffset = isAnimationFrame ? Math.sin(Date.now() * 0.001) * 0.1 : 0;

    // Add color stops
    for (let i = 0; i < numStops; i++) {
        const position = i / (numStops - 1) + (isAnimationFrame ? animationOffset * (i % 2 ? 1 : -1) : 0);
        const colorIndex = Math.floor(randomFn() * palette.length);
        const color = palette[colorIndex];

        // Validate position is between 0 and 1
        const safePosition = Math.max(0, Math.min(1, position));

        try {
            // Validate color by parsing it first
            parseColorToRgb(color);
            gradient.addColorStop(safePosition, color);
        } catch (error) {
            // If color parsing fails, use a fallback color
            console.warn(`Invalid color in gradient: ${color}. Using fallback.`);
            gradient.addColorStop(safePosition, '#ff9900');
        }
    }
}

/**
 * Create a seeded random function
 * @param {number} seed - The random seed
 * @returns {Function} A seeded random function
 */
function createRandomFunction(seed) {
    return function() {
        // Simple seeded random function
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
