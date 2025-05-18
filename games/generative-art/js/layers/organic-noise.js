/**
 * js/layers/organic-noise.js - Organic Noise layer for the Generative Art Studio
 * Implements natural noise patterns and textures using Perlin/Simplex noise
 */

/**
 * Draw an Organic Noise layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, organicNoiseDensity = 50 } = params;
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Create noise with varying density
    const density = organicNoiseDensity / 100; // Convert 0-100 scale to 0-1
    const scale = 0.003 + (density * 0.01); // Scale factor for noise (smaller = more zoomed out)
    const detail = Math.floor(density * 5) + 2; // Level of detail/octaves
    
    // Create ImageData for pixel manipulation
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;
    
    // Use the seed to create deterministic noise
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);
    
    // Generate noise values
    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
            // Calculate noise value using multiple octaves (fractal noise)
            let noiseValue = 0;
            let amplitude = 1;
            let frequency = 1;
            let maxValue = 0;
            
            // Add multiple layers of noise with different frequencies
            for (let i = 0; i < detail; i++) {
                // Get noise value at this position and frequency
                const nx = x * scale * frequency;
                const ny = y * scale * frequency;
                
                // Use improved noise function
                const value = improvedNoise(nx, ny, seedValue * 0.1 * frequency);
                
                // Add to total noise value
                noiseValue += value * amplitude;
                
                // Keep track of max possible value for normalization
                maxValue += amplitude;
                
                // Increase frequency and decrease amplitude for next octave
                amplitude *= 0.5;
                frequency *= 2;
            }
            
            // Normalize noise value to 0-1 range
            noiseValue = (noiseValue / maxValue) * 0.5 + 0.5;
            
            // Apply animation if needed
            if (isAnimationFrame) {
                // Shift noise pattern slightly over time
                const time = Date.now() * 0.0005;
                noiseValue = (noiseValue + Math.sin(time + x * 0.01 + y * 0.01) * 0.1) % 1.0;
            }
            
            // Map noise value to color from palette
            const colorIndex = Math.floor(noiseValue * palette.length);
            const color = hexToRgb(palette[colorIndex % palette.length]);
            
            // Set pixel color
            const pixelIndex = (y * canvasWidth + x) * 4;
            data[pixelIndex] = color.r;
            data[pixelIndex + 1] = color.g;
            data[pixelIndex + 2] = color.b;
            data[pixelIndex + 3] = 255 * (0.3 + noiseValue * 0.7); // Vary alpha for more organic feel
        }
    }
    
    // Put the image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

/**
 * Create a deterministic random function based on a seed
 * @param {number} seed - The random seed
 * @returns {Function} A seeded random function
 */
function createRandomFunction(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

/**
 * Convert a hex color string to RGB object
 * @param {string} hex - The hex color string
 * @returns {Object} RGB color object
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
}

/**
 * Improved Perlin noise function
 * Based on Ken Perlin's improved noise algorithm
 */
function improvedNoise(x, y, z) {
    // Find unit cube that contains point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    // Find relative x, y, z of point in cube
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    // Compute fade curves for each of x, y, z
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    // Hash coordinates of the 8 cube corners
    const p = new Array(512);
    for (let i = 0; i < 256; i++) {
        p[i] = p[i + 256] = permutation[i];
    }
    
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    
    // Add blended results from 8 corners of cube
    return lerp(w, 
        lerp(v, 
            lerp(u, grad(p[AA], x, y, z), grad(p[BA], x-1, y, z)),
            lerp(u, grad(p[AB], x, y-1, z), grad(p[BB], x-1, y-1, z))
        ),
        lerp(v, 
            lerp(u, grad(p[AA+1], x, y, z-1), grad(p[BA+1], x-1, y, z-1)),
            lerp(u, grad(p[AB+1], x, y-1, z-1), grad(p[BB+1], x-1, y-1, z-1))
        )
    );
}

/**
 * Fade function for Perlin noise
 */
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation for Perlin noise
 */
function lerp(t, a, b) {
    return a + t * (b - a);
}

/**
 * Gradient function for Perlin noise
 */
function grad(hash, x, y, z) {
    // Convert low 4 bits of hash code into 12 gradient directions
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * Permutation table for Perlin noise
 */
const permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
    247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
    65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
    200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
    207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
    119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
    218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
    81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
    184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
    222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];
