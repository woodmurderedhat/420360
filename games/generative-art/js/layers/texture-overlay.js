/**
 * js/layers/texture-overlay.js - Texture Overlay layer for the Generative Art Studio
 * Creates procedural texture overlay effects
 */

/**
 * Draw a Texture Overlay layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawTextureOverlayLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, textureOverlayDensity = 50, blendMode = 'overlay' } = params;
    
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
    
    // Choose a texture type based on random value
    const textureType = randomFn() < 0.33 ? 'noise' : 
                        randomFn() < 0.66 ? 'pattern' : 'grain';
    
    // Create the selected texture type
    switch (textureType) {
        case 'noise':
            createNoiseTexture(ctx, canvasWidth, canvasHeight, palette, randomFn, isAnimationFrame, textureOverlayDensity);
            break;
        case 'pattern':
            createPatternTexture(ctx, canvasWidth, canvasHeight, palette, randomFn, isAnimationFrame, textureOverlayDensity);
            break;
        case 'grain':
            createGrainTexture(ctx, canvasWidth, canvasHeight, palette, randomFn, isAnimationFrame, textureOverlayDensity);
            break;
    }
    
    // Restore the context state
    ctx.restore();
}

/**
 * Create a noise texture
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} density - Texture density (0-100)
 */
function createNoiseTexture(ctx, width, height, palette, randomFn, isAnimationFrame, density) {
    // Create ImageData for pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Calculate scale based on density (higher density = more detailed noise)
    const scale = 0.01 + (1 - density / 100) * 0.1;
    
    // Animation offset
    const timeOffset = isAnimationFrame ? Date.now() * 0.0005 : 0;
    
    // Choose a base color from the palette
    const baseColor = hexToRgb(palette[Math.floor(randomFn() * palette.length)]);
    
    // Generate Perlin-like noise
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate noise value
            const nx = x * scale;
            const ny = y * scale;
            
            // Simple noise function (can be replaced with a more sophisticated one)
            let noiseValue = improvedNoise(
                nx + timeOffset, 
                ny + timeOffset, 
                timeOffset * 10
            );
            
            // Normalize to 0-1 range
            noiseValue = (noiseValue + 1) * 0.5;
            
            // Apply color based on noise value
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = baseColor.r * noiseValue;
            data[pixelIndex + 1] = baseColor.g * noiseValue;
            data[pixelIndex + 2] = baseColor.b * noiseValue;
            data[pixelIndex + 3] = 255 * (0.2 + noiseValue * 0.8); // Vary alpha for more organic feel
        }
    }
    
    // Put the image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Create a pattern texture
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} density - Texture density (0-100)
 */
function createPatternTexture(ctx, width, height, palette, randomFn, isAnimationFrame, density) {
    // Calculate pattern size based on density
    const patternSize = Math.max(5, Math.floor(50 - (density / 100) * 45));
    
    // Choose pattern type
    const patternType = randomFn() < 0.33 ? 'grid' : 
                        randomFn() < 0.66 ? 'stripes' : 'dots';
    
    // Animation parameters
    const time = isAnimationFrame ? Date.now() * 0.001 : 0;
    const animOffset = isAnimationFrame ? Math.sin(time) * 5 : 0;
    
    // Create an offscreen canvas for the pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize * 2;
    patternCanvas.height = patternSize * 2;
    const patternCtx = patternCanvas.getContext('2d');
    
    // Choose colors from palette
    const bgColor = palette[Math.floor(randomFn() * palette.length)];
    const fgColor = palette[Math.floor(randomFn() * palette.length)];
    
    // Fill background
    patternCtx.fillStyle = bgColor;
    patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    
    // Draw pattern
    patternCtx.fillStyle = fgColor;
    
    switch (patternType) {
        case 'grid':
            // Draw grid lines
            patternCtx.lineWidth = Math.max(1, patternSize / 10);
            patternCtx.strokeStyle = fgColor;
            patternCtx.beginPath();
            patternCtx.moveTo(0, patternSize);
            patternCtx.lineTo(patternCanvas.width, patternSize);
            patternCtx.moveTo(patternSize, 0);
            patternCtx.lineTo(patternSize, patternCanvas.height);
            patternCtx.stroke();
            break;
            
        case 'stripes':
            // Draw diagonal stripes
            const stripeWidth = patternSize / 3;
            patternCtx.lineWidth = stripeWidth;
            patternCtx.strokeStyle = fgColor;
            patternCtx.beginPath();
            
            // Adjust stripe position for animation
            const offset = animOffset % (patternSize * 2);
            
            for (let i = -patternSize * 2; i <= patternSize * 4; i += patternSize) {
                patternCtx.moveTo(i + offset, 0);
                patternCtx.lineTo(i + patternSize * 2 + offset, patternSize * 2);
            }
            patternCtx.stroke();
            break;
            
        case 'dots':
            // Draw dots
            const dotSize = patternSize / 3;
            patternCtx.beginPath();
            patternCtx.arc(patternSize / 2, patternSize / 2, dotSize, 0, Math.PI * 2);
            patternCtx.arc(patternSize * 1.5, patternSize * 1.5, dotSize, 0, Math.PI * 2);
            patternCtx.fill();
            break;
    }
    
    // Create pattern and fill canvas
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
}

/**
 * Create a grain texture
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {number} density - Texture density (0-100)
 */
function createGrainTexture(ctx, width, height, palette, randomFn, isAnimationFrame, density) {
    // Create ImageData for pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Calculate grain intensity based on density
    const grainIntensity = density / 100;
    
    // Choose a base color from the palette
    const baseColor = hexToRgb(palette[Math.floor(randomFn() * palette.length)]);
    
    // Generate grain texture
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Generate random noise for this pixel
            const noise = randomFn() * 2 - 1;
            
            // Apply grain effect
            const grainValue = 1 + noise * grainIntensity;
            
            // Apply color with grain effect
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = Math.min(255, Math.max(0, baseColor.r * grainValue));
            data[pixelIndex + 1] = Math.min(255, Math.max(0, baseColor.g * grainValue));
            data[pixelIndex + 2] = Math.min(255, Math.max(0, baseColor.b * grainValue));
            data[pixelIndex + 3] = 255;
        }
    }
    
    // Put the image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Improved Perlin noise function
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {number} Noise value between -1 and 1
 */
function improvedNoise(x, y, z) {
    // Simple noise function implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    // Use a simple hash function instead of a permutation table
    const hash = (n) => {
        return ((n * 1664525) + 1013904223) % 4294967296 / 4294967296;
    };
    
    // Simple gradient function
    const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };
    
    // Calculate hash values
    const a = hash(X) + Y;
    const aa = hash(a) + Z;
    const ab = hash(a + 1) + Z;
    const b = hash(X + 1) + Y;
    const ba = hash(b) + Z;
    const bb = hash(b + 1) + Z;
    
    // Interpolate results
    return lerp(w, 
        lerp(v, 
            lerp(u, grad(hash(aa), x, y, z), grad(hash(ba), x-1, y, z)),
            lerp(u, grad(hash(ab), x, y-1, z), grad(hash(bb), x-1, y-1, z))
        ),
        lerp(v, 
            lerp(u, grad(hash(aa+1), x, y, z-1), grad(hash(ba+1), x-1, y, z-1)),
            lerp(u, grad(hash(ab+1), x, y-1, z-1), grad(hash(bb+1), x-1, y-1, z-1))
        )
    );
}

/**
 * Fade function for Perlin noise
 * @param {number} t - Input value
 * @returns {number} Faded value
 */
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation
 * @param {number} t - Interpolation factor
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number} Interpolated value
 */
function lerp(t, a, b) {
    return a + t * (b - a);
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} RGB color object
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
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
