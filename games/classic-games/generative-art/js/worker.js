/**
 * worker.js - Web Worker for intensive calculations in the Generative Art Studio
 * Handles background processing of computationally expensive operations
 */

// Store the original Math.random function
const originalRandom = Math.random;
let seedValue = null;
let seedNumber = 1;

/**
 * Simple seeded random number generator (LCG)
 * @returns {number} A pseudo-random number between 0 and 1
 */
function seededRandom() {
    seedNumber = (seedNumber * 9301 + 49297) % 233280;
    return seedNumber / 233280;
}

/**
 * Random function that uses seeded random if a seed is set, otherwise uses Math.random
 * @returns {number} A random number between 0 and 1
 */
function rnd() {
    return seedValue != null ? seededRandom() : originalRandom();
}

/**
 * Hash a string to an integer for seeding
 * @param {string} str - The string to hash
 * @returns {number} A positive integer hash
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Set the random seed
 * @param {string|null} seed - The seed string or null to use Math.random
 */
function setSeed(seed) {
    if (seed) {
        seedValue = hashString(seed);
        seedNumber = seedValue;
        Math.random = rnd;
    } else {
        seedValue = null;
        Math.random = originalRandom;
    }
}

/**
 * Get a random number between min and max
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random number between min and max
 */
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Get a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer between min and max
 */
function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Generate Perlin noise
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate (optional)
 * @returns {number} Noise value between -1 and 1
 */
function perlinNoise(x, y, z = 0) {
    // Simplified Perlin noise implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                  grad(p[BA], x - 1, y, z)),
                          lerp(u, grad(p[AB], x, y - 1, z),
                                  grad(p[BB], x - 1, y - 1, z))),
                  lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                                  grad(p[BA + 1], x - 1, y, z - 1)),
                          lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                                  grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Permutation table
const p = new Array(512);
for (let i = 0; i < 256; i++) {
    p[i] = p[i + 256] = Math.floor(Math.random() * 256);
}

/**
 * Generate Voronoi cells
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} numPoints - Number of Voronoi points
 * @param {string} seed - Random seed
 * @returns {Object} Voronoi cell data
 */
function generateVoronoiCells(width, height, numPoints, seed) {
    // Set seed for deterministic results
    if (seed) setSeed(seed);
    
    // Generate random points
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: randomRange(0, width),
            y: randomRange(0, height)
        });
    }
    
    // Create Voronoi cell data
    const cellData = new Uint32Array(width * height * 4);
    
    // For each pixel, find the closest point
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minDist = Infinity;
            let closestPoint = 0;
            
            for (let i = 0; i < points.length; i++) {
                const dx = points[i].x - x;
                const dy = points[i].y - y;
                const dist = dx * dx + dy * dy;
                
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = i;
                }
            }
            
            // Set pixel data (point index)
            const idx = (y * width + x) * 4;
            cellData[idx] = closestPoint;
            cellData[idx + 3] = 255; // Alpha
        }
    }
    
    return {
        points,
        cellData
    };
}

/**
 * Generate noise texture
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @param {number} scale - Noise scale
 * @param {string} seed - Random seed
 * @returns {Uint8ClampedArray} Noise texture data
 */
function generateNoiseTexture(width, height, scale, seed) {
    // Set seed for deterministic results
    if (seed) setSeed(seed);
    
    const data = new Uint8ClampedArray(width * height * 4);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = (perlinNoise(x / scale, y / scale) + 1) * 0.5;
            const idx = (y * width + x) * 4;
            
            data[idx] = value * 255;     // R
            data[idx + 1] = value * 255; // G
            data[idx + 2] = value * 255; // B
            data[idx + 3] = 255;         // A
        }
    }
    
    return data;
}

// Listen for messages from the main thread
self.addEventListener('message', (e) => {
    const { type, data } = e.data;
    
    switch (type) {
        case 'voronoi':
            const voronoiResult = generateVoronoiCells(
                data.width,
                data.height,
                data.numPoints,
                data.seed
            );
            self.postMessage({ type: 'voronoi', result: voronoiResult }, [voronoiResult.cellData.buffer]);
            break;
            
        case 'noise':
            const noiseResult = generateNoiseTexture(
                data.width,
                data.height,
                data.scale,
                data.seed
            );
            self.postMessage({ type: 'noise', result: noiseResult }, [noiseResult.buffer]);
            break;

        case 'processNoise':
            // Process organic noise data in background
            processNoiseData(data);
            break;
            
        case 'generateFractal':
            // Generate fractal patterns in background
            generateFractalData(data);
            break;
            
        case 'applyVisualEffects':
            // Apply visual effects like bloom, glow, or distortion
            applyVisualEffects(data);
            break;
            
        default:
            self.postMessage({ type: 'error', message: 'Unknown task type', originalType: type });
    }
});

// Process noise data for organic noise layer
function processNoiseData(data) {
    try {
        // Implementation for noise processing
        const result = { /* processed noise data */ };
        self.postMessage({ type: 'processNoise', result });
    } catch (error) {
        self.postMessage({ type: 'error', message: 'Error processing noise data', error: error.message });
    }
}

// Generate fractal pattern data
function generateFractalData(data) {
    try {
        // Implementation for fractal generation
        const result = { /* generated fractal data */ };
        self.postMessage({ type: 'generateFractal', result });
    } catch (error) {
        self.postMessage({ type: 'error', message: 'Error generating fractal data', error: error.message });
    }
}

// Apply visual effects to image data
function applyVisualEffects(data) {
    try {
        // Implementation for visual effects
        const result = { /* processed image data */ };
        self.postMessage({ type: 'applyVisualEffects', result });
    } catch (error) {
        self.postMessage({ type: 'error', message: 'Error applying visual effects', error: error.message });
    }
}
