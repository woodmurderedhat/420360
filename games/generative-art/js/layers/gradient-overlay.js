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

    const {
        canvasWidth, canvasHeight, seed,
        requestedBlendMode = 'overlay',
    } = params;

    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);

    // Initialize new randomizable parameters using randomFn for defaults
    const gradientShapeVariety = params.gradientShapeVariety !== undefined ? params.gradientShapeVariety : randomFn();
    const colorApplicationStyle = params.colorApplicationStyle !== undefined ? params.colorApplicationStyle : randomFn();

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Determine actual blend mode
    let actualBlendMode = requestedBlendMode;
    const possibleBlendModes = ['overlay', 'multiply', 'screen', 'lighten', 'darken', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
    if (requestedBlendMode === 'random') {
        actualBlendMode = possibleBlendModes[Math.floor(randomFn() * possibleBlendModes.length)];
    }

    // Set blend mode if supported and valid
    if (actualBlendMode && ctx.globalCompositeOperation) {
        const validModes = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
        if (validModes.includes(actualBlendMode)) {
            ctx.globalCompositeOperation = actualBlendMode;
        } else {
            ctx.globalCompositeOperation = 'overlay'; // Fallback
        }
    }

    // Choose a gradient type based on seed
    const gradientTypeRoll = randomFn();
    const gradientType = gradientTypeRoll < 0.33 ? 'linear' :
                         gradientTypeRoll < 0.66 ? 'radial' : 'conic';

    // Create gradient based on type
    let gradient;
    switch (gradientType) {
        case 'linear':
            gradient = createLinearGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame, gradientShapeVariety);
            break;
        case 'radial':
            gradient = createRadialGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame, gradientShapeVariety);
            break;
        case 'conic':
            gradient = createConicGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame, gradientShapeVariety);
            break;
        default:
            gradient = createLinearGradient(ctx, canvasWidth, canvasHeight, randomFn, isAnimationFrame, gradientShapeVariety);
    }

    // Add color stops using palette colors
    addColorStops(gradient, palette, randomFn, isAnimationFrame, colorApplicationStyle);

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
 * @param {number} gradientShapeVariety - Factor (0-1) for shape variation
 * @returns {CanvasGradient} The created gradient
 */
function createLinearGradient(ctx, width, height, randomFn, isAnimationFrame, gradientShapeVariety) {
    let x0 = randomFn() * width;
    let y0 = randomFn() * height;
    let x1 = randomFn() * width;
    let y1 = randomFn() * height;

    const minSeparationFactor = 0.1 + (1 - gradientShapeVariety) * 0.4;
    if (Math.abs(x1 - x0) < width * minSeparationFactor) {
        x1 = x0 + (randomFn() < 0.5 ? -1 : 1) * width * (minSeparationFactor + randomFn() * 0.2);
        x1 = Math.max(0, Math.min(width, x1));
    }
    if (Math.abs(y1 - y0) < height * minSeparationFactor) {
        y1 = y0 + (randomFn() < 0.5 ? -1 : 1) * height * (minSeparationFactor + randomFn() * 0.2);
        y1 = Math.max(0, Math.min(height, y1));
    }

    return ctx.createLinearGradient(x0, y0, x1, y1);
}

/**
 * Create a radial gradient
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} gradientShapeVariety - Factor (0-1) for shape variation
 * @returns {CanvasGradient} The created gradient
 */
function createRadialGradient(ctx, width, height, randomFn, isAnimationFrame, gradientShapeVariety) {
    const centerX0 = randomFn() * width;
    const centerY0 = randomFn() * height;
    const centerX1 = width * (0.2 + randomFn() * 0.6);
    const centerY1 = height * (0.2 + randomFn() * 0.6);

    const minRadius = Math.min(width, height) * 0.05;
    const maxRadius = Math.min(width, height) * (0.5 + gradientShapeVariety * 0.5);

    let radius0 = minRadius + randomFn() * (maxRadius * 0.3);
    let radius1 = radius0 + (minRadius * 0.5) + randomFn() * (maxRadius - radius0);
    
    if (gradientShapeVariety < 0.2 && radius0 > maxRadius * 0.1) {
        radius0 = randomFn() * maxRadius * 0.1;
    }
    if (radius1 <= radius0) {
        radius1 = radius0 + minRadius;
    }
    
    return ctx.createRadialGradient(centerX0, centerY0, radius0, centerX1, centerY1, radius1);
}

/**
 * Create a conic gradient (or simulate it for browsers that don't support it)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} gradientShapeVariety - Factor (0-1) for shape variation
 * @returns {CanvasGradient} The created gradient
 */
function createConicGradient(ctx, width, height, randomFn, isAnimationFrame, gradientShapeVariety) {
    const startAngle = randomFn() * Math.PI * 2 * (0.5 + gradientShapeVariety * 0.5);
    const centerX = width / 2 + (randomFn() - 0.5) * width * 0.4 * gradientShapeVariety;
    const centerY = height / 2 + (randomFn() - 0.5) * height * 0.4 * gradientShapeVariety;

    if (typeof ctx.createConicGradient === 'function') {
        return ctx.createConicGradient(startAngle, centerX, centerY);
    } else {
        return createRadialGradient(ctx, width, height, randomFn, isAnimationFrame, gradientShapeVariety);
    }
}

/**
 * Add color stops to a gradient using palette colors
 * @param {CanvasGradient} gradient - The gradient to add color stops to
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} colorApplicationStyle - Factor (0-1) for color application variation
 */
function addColorStops(gradient, palette, randomFn, isAnimationFrame, colorApplicationStyle) {
    if (!palette || palette.length === 0) {
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(1, 'white');
        return;
    }

    const minStops = 2;
    const maxPossibleStops = Math.max(minStops, Math.min(palette.length, 5 + Math.floor(colorApplicationStyle * 5)));
    const numStops = minStops + Math.floor(colorApplicationStyle * (maxPossibleStops - minStops));

    let offsets = [];
    for (let i = 0; i < numStops; i++) {
        offsets.push(randomFn());
    }
    offsets.sort((a, b) => a - b);

    let uniqueOffsets = [...new Set(offsets)];
    if (uniqueOffsets.length === 0) {
        uniqueOffsets = [0, 1];
    } else if (uniqueOffsets.length === 1) {
        uniqueOffsets = [uniqueOffsets[0] === 0 ? 0 : Math.max(0, uniqueOffsets[0] - 0.1), uniqueOffsets[0] === 1 ? 1 : Math.min(1, uniqueOffsets[0] + 0.1)];
        if (uniqueOffsets[0] === uniqueOffsets[1]) uniqueOffsets = [0, 1];
    }

    const pinToEdges = colorApplicationStyle > 0.3 || uniqueOffsets.length <= 2;

    if (pinToEdges) {
        uniqueOffsets[0] = 0;
        if (uniqueOffsets.length > 1) {
            uniqueOffsets[uniqueOffsets.length - 1] = 1;
        } else {
            uniqueOffsets = [0, 1];
        }
    }

    if (uniqueOffsets.length < 2) {
        uniqueOffsets = [0, 1];
    }

    for (let i = 0; i < uniqueOffsets.length; i++) {
        const offset = Math.max(0, Math.min(1, uniqueOffsets[i]));
        const colorIndex = Math.floor(randomFn() * palette.length);
        const color = palette[colorIndex];
        gradient.addColorStop(offset, color);
    }
}

/**
 * Create a seeded random function
 * @param {number} seed - The random seed
 * @returns {Function} A seeded random function
 */
function createRandomFunction(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
