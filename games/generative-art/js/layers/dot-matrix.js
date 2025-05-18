/**
 * js/layers/dot-matrix.js - Dot Matrix layer for the Generative Art Studio
 * Creates dot matrix patterns reminiscent of old printers
 */

/**
 * Draw a Dot Matrix layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, density, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawDotMatrixLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, dotMatrixDensity = 50 } = params;
    
    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);
    
    // Save the current context state
    ctx.save();
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Calculate grid size based on density
    // Higher density means more dots (smaller grid cells)
    const gridSize = Math.max(4, Math.floor(20 - (dotMatrixDensity / 100) * 16));
    
    // Calculate number of dots in each dimension
    const numDotsX = Math.ceil(canvasWidth / gridSize);
    const numDotsY = Math.ceil(canvasHeight / gridSize);
    
    // Determine dot style (filled circles, hollow circles, or squares)
    const dotStyle = randomFn() < 0.6 ? 'filled' : randomFn() < 0.8 ? 'hollow' : 'square';
    
    // Determine if we should use a monochrome style for retro feel
    const isMonochrome = randomFn() < 0.4;
    
    // Choose a base color for monochrome mode
    const baseColor = palette[Math.floor(randomFn() * palette.length)];
    
    // Animation parameters
    const time = isAnimationFrame ? Date.now() * 0.001 : 0;
    const waveAmplitude = isAnimationFrame ? 2 + randomFn() * 3 : 0;
    const waveFrequency = 0.1 + randomFn() * 0.2;
    
    // Draw the dot matrix
    for (let y = 0; y < numDotsY; y++) {
        for (let x = 0; x < numDotsX; x++) {
            // Calculate dot position
            const posX = x * gridSize + gridSize / 2;
            const posY = y * gridSize + gridSize / 2;
            
            // Apply wave effect for animation
            const offsetY = isAnimationFrame ? 
                Math.sin(x * waveFrequency + time) * waveAmplitude : 0;
            
            // Determine dot size based on a pattern or random value
            // This creates the halftone-like effect
            let dotSize;
            
            // Create a halftone pattern based on position
            const distanceFromCenter = Math.sqrt(
                Math.pow((posX / canvasWidth) - 0.5, 2) + 
                Math.pow((posY / canvasHeight) - 0.5, 2)
            );
            
            // Adjust size based on distance from center (halftone effect)
            dotSize = gridSize * (0.2 + (1 - distanceFromCenter) * 0.7);
            
            // Add some randomness to dot size
            dotSize *= 0.7 + randomFn() * 0.6;
            
            // Skip some dots randomly for a more natural look
            if (randomFn() > 0.9 - (dotMatrixDensity / 100) * 0.3) {
                continue;
            }
            
            // Choose color
            let dotColor;
            if (isMonochrome) {
                // For monochrome, use variations of the base color
                const brightness = 0.3 + randomFn() * 0.7;
                dotColor = adjustColorBrightness(baseColor, brightness);
            } else {
                // Use a color from the palette
                dotColor = palette[Math.floor(randomFn() * palette.length)];
            }
            
            // Draw the dot
            ctx.fillStyle = dotColor;
            ctx.strokeStyle = dotColor;
            
            switch (dotStyle) {
                case 'filled':
                    ctx.beginPath();
                    ctx.arc(posX, posY + offsetY, dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'hollow':
                    ctx.lineWidth = Math.max(1, dotSize / 8);
                    ctx.beginPath();
                    ctx.arc(posX, posY + offsetY, dotSize / 2, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case 'square':
                    ctx.fillRect(
                        posX - dotSize / 2, 
                        posY + offsetY - dotSize / 2, 
                        dotSize, 
                        dotSize
                    );
                    break;
            }
        }
    }
    
    // Restore the context state
    ctx.restore();
}

/**
 * Adjust the brightness of a color
 * @param {string} color - The color in hex format (#RRGGBB)
 * @param {number} factor - Brightness factor (0-1)
 * @returns {string} The adjusted color
 */
function adjustColorBrightness(color, factor) {
    // Parse the hex color
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    // Adjust brightness
    const adjustedR = Math.floor(r * factor);
    const adjustedG = Math.floor(g * factor);
    const adjustedB = Math.floor(b * factor);
    
    // Convert back to hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
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
