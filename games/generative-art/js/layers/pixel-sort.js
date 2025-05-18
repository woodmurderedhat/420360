/**
 * js/layers/pixel-sort.js - Pixel Sort layer for the Generative Art Studio
 * Implements pixel sorting algorithms for interesting visual effects
 */

import { randomRange, randomInt } from '../utils.js';

/**
 * Draw a Pixel Sort layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawPixelSortLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, pixelSortDensity = 50 } = params;
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);
    
    // Convert density to usable parameters
    const density = pixelSortDensity / 100; // Convert 0-100 scale to 0-1
    
    // Create offscreen canvas for manipulation
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;
    const offCtx = offscreenCanvas.getContext('2d');
    
    // Copy current canvas content to offscreen canvas
    offCtx.drawImage(ctx.canvas, 0, 0);
    
    // Get image data for pixel manipulation
    const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    
    // Determine sort parameters based on density
    const sortIntensity = Math.floor(density * 10) + 1; // 1-11 sort passes
    const sortThreshold = 0.1 + (density * 0.4); // 0.1-0.5 threshold for sorting
    
    // Choose sort method based on seed
    const sortMethod = Math.floor(randomFn() * 4);
    
    // Apply pixel sorting
    switch (sortMethod) {
        case 0:
            sortByBrightness(data, canvasWidth, canvasHeight, sortIntensity, sortThreshold, randomFn);
            break;
        case 1:
            sortByHue(data, canvasWidth, canvasHeight, sortIntensity, sortThreshold, randomFn);
            break;
        case 2:
            sortByRows(data, canvasWidth, canvasHeight, sortIntensity, sortThreshold, randomFn);
            break;
        case 3:
            sortByColumns(data, canvasWidth, canvasHeight, sortIntensity, sortThreshold, randomFn);
            break;
    }
    
    // If this is an animation frame, add some dynamic effects
    if (isAnimationFrame) {
        // Add time-based effects that change with each frame
        const time = Date.now() * 0.001;
        
        // Apply a wave distortion effect
        applyWaveDistortion(data, canvasWidth, canvasHeight, time);
    }
    
    // Put the modified image data back to the offscreen canvas
    offCtx.putImageData(imageData, 0, 0);
    
    // Draw the offscreen canvas back to the main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);
    
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
 * Calculate brightness of a pixel (0-1)
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} index - Pixel index
 * @returns {number} Brightness value (0-1)
 */
function getBrightness(data, index) {
    return (data[index] + data[index + 1] + data[index + 2]) / (255 * 3);
}

/**
 * Calculate hue of a pixel (0-1)
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} index - Pixel index
 * @returns {number} Hue value (0-1)
 */
function getHue(data, index) {
    const r = data[index] / 255;
    const g = data[index + 1] / 255;
    const b = data[index + 2] / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) return 0; // No saturation, hue is undefined
    
    let hue;
    if (max === r) {
        hue = (g - b) / (max - min);
    } else if (max === g) {
        hue = 2 + (b - r) / (max - min);
    } else {
        hue = 4 + (r - g) / (max - min);
    }
    
    hue /= 6;
    if (hue < 0) hue += 1;
    
    return hue;
}

/**
 * Sort pixels in a row by brightness
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} y - Row index
 * @param {number} threshold - Threshold for sorting (0-1)
 */
function sortRowByBrightness(data, width, y, threshold) {
    const row = [];
    const rowStart = y * width * 4;
    
    // Collect pixels in the row
    for (let x = 0; x < width; x++) {
        const i = rowStart + x * 4;
        const brightness = getBrightness(data, i);
        
        // Only sort pixels above threshold
        if (brightness > threshold) {
            row.push({
                index: i,
                value: brightness,
                r: data[i],
                g: data[i + 1],
                b: data[i + 2],
                a: data[i + 3]
            });
        }
    }
    
    // Sort pixels by brightness
    row.sort((a, b) => a.value - b.value);
    
    // Put sorted pixels back
    for (let i = 0; i < row.length; i++) {
        const pixel = row[i];
        data[pixel.index] = pixel.r;
        data[pixel.index + 1] = pixel.g;
        data[pixel.index + 2] = pixel.b;
        data[pixel.index + 3] = pixel.a;
    }
}

/**
 * Sort pixels in a column by brightness
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} x - Column index
 * @param {number} threshold - Threshold for sorting (0-1)
 */
function sortColumnByBrightness(data, width, height, x, threshold) {
    const column = [];
    
    // Collect pixels in the column
    for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        const brightness = getBrightness(data, i);
        
        // Only sort pixels above threshold
        if (brightness > threshold) {
            column.push({
                index: i,
                value: brightness,
                r: data[i],
                g: data[i + 1],
                b: data[i + 2],
                a: data[i + 3]
            });
        }
    }
    
    // Sort pixels by brightness
    column.sort((a, b) => a.value - b.value);
    
    // Put sorted pixels back
    for (let i = 0; i < column.length; i++) {
        const pixel = column[i];
        data[pixel.index] = pixel.r;
        data[pixel.index + 1] = pixel.g;
        data[pixel.index + 2] = pixel.b;
        data[pixel.index + 3] = pixel.a;
    }
}

/**
 * Sort image by brightness
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Number of sort passes
 * @param {number} threshold - Threshold for sorting (0-1)
 * @param {Function} randomFn - Seeded random function
 */
function sortByBrightness(data, width, height, intensity, threshold, randomFn) {
    // Sort random rows and columns
    for (let i = 0; i < intensity; i++) {
        // Decide whether to sort a row or column
        if (randomFn() < 0.5) {
            // Sort a random row
            const y = Math.floor(randomFn() * height);
            sortRowByBrightness(data, width, y, threshold);
        } else {
            // Sort a random column
            const x = Math.floor(randomFn() * width);
            sortColumnByBrightness(data, width, height, x, threshold);
        }
    }
}

/**
 * Sort image by hue
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Number of sort passes
 * @param {number} threshold - Threshold for sorting (0-1)
 * @param {Function} randomFn - Seeded random function
 */
function sortByHue(data, width, height, intensity, threshold, randomFn) {
    // Similar to sortByBrightness but using hue instead
    for (let i = 0; i < intensity; i++) {
        const y = Math.floor(randomFn() * height);
        const rowStart = y * width * 4;
        
        const row = [];
        
        // Collect pixels in the row
        for (let x = 0; x < width; x++) {
            const i = rowStart + x * 4;
            const hue = getHue(data, i);
            
            // Only sort pixels with saturation above threshold
            if (hue > threshold) {
                row.push({
                    index: i,
                    value: hue,
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    a: data[i + 3]
                });
            }
        }
        
        // Sort pixels by hue
        row.sort((a, b) => a.value - b.value);
        
        // Put sorted pixels back
        for (let i = 0; i < row.length; i++) {
            const pixel = row[i];
            data[pixel.index] = pixel.r;
            data[pixel.index + 1] = pixel.g;
            data[pixel.index + 2] = pixel.b;
            data[pixel.index + 3] = pixel.a;
        }
    }
}

/**
 * Sort image by rows
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Number of sort passes
 * @param {number} threshold - Threshold for sorting (0-1)
 * @param {Function} randomFn - Seeded random function
 */
function sortByRows(data, width, height, intensity, threshold, randomFn) {
    // Sort multiple rows
    const numRows = Math.floor(height * threshold);
    
    for (let i = 0; i < numRows; i++) {
        const y = Math.floor(randomFn() * height);
        sortRowByBrightness(data, width, y, 0); // Sort all pixels in the row
    }
}

/**
 * Sort image by columns
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Number of sort passes
 * @param {number} threshold - Threshold for sorting (0-1)
 * @param {Function} randomFn - Seeded random function
 */
function sortByColumns(data, width, height, intensity, threshold, randomFn) {
    // Sort multiple columns
    const numColumns = Math.floor(width * threshold);
    
    for (let i = 0; i < numColumns; i++) {
        const x = Math.floor(randomFn() * width);
        sortColumnByBrightness(data, width, height, x, 0); // Sort all pixels in the column
    }
}

/**
 * Apply wave distortion effect for animation
 * @param {Uint8ClampedArray} data - Image data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time for animation
 */
function applyWaveDistortion(data, width, height, time) {
    // Create a temporary array to store the modified pixels
    const tempData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i++) {
        tempData[i] = data[i];
    }
    
    // Apply wave distortion
    for (let y = 0; y < height; y++) {
        // Calculate wave offset based on time and y position
        const waveOffset = Math.sin(y * 0.05 + time * 2) * 10;
        
        for (let x = 0; x < width; x++) {
            // Calculate source and destination positions
            const destIndex = (y * width + x) * 4;
            const srcX = Math.floor(x + waveOffset) % width;
            if (srcX < 0) srcX += width;
            const srcIndex = (y * width + srcX) * 4;
            
            // Copy pixel data with distortion
            if (srcIndex >= 0 && srcIndex < data.length - 3) {
                data[destIndex] = tempData[srcIndex];
                data[destIndex + 1] = tempData[srcIndex + 1];
                data[destIndex + 2] = tempData[srcIndex + 2];
                data[destIndex + 3] = tempData[srcIndex + 3];
            }
        }
    }
}
