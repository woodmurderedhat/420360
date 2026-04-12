/**
 * utils.js - Utility functions for the Generative Art Studio
 * Contains random number generation, seeding, and other helper functions
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

        // Add seedrandom method to Math object for compatibility with existing code
        Math.seedrandom = function(seedStr) {
            setSeed(seedStr);
            return Math.random;
        };
    } else {
        seedValue = null;
        Math.random = originalRandom;

        // Remove seedrandom method
        Math.seedrandom = undefined;
    }
}

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
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
 * Convert HSL values to a CSS color string
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @param {number} a - Alpha (0-1), optional
 * @returns {string} CSS color string
 */
function hslToString(h, s, l, a = 1) {
    if (a < 1) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function to prevent multiple rapid calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Throttle a function to limit how often it can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} The throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Create a seeded random function that generates consistent pseudo-random numbers
 * @param {number} seed - The seed value for random generation
 * @returns {Function} A function that returns pseudo-random numbers between 0 and 1
 */
function createRandomFunction(seed) {
    let currentSeed = seed;
    return function() {
        // Simple seeded random function using Linear Congruential Generator
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Check if a value is a valid number
 * @param {*} value - The value to check
 * @returns {boolean} Whether the value is a valid number
 */
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Format a date as a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

/**
 * Parse a color string to RGB values
 * @param {string} color - The color string to parse (hex, rgb, or hsl)
 * @returns {Object} An object with r, g, b properties
 */
function parseColorToRgb(color) {
    try {
        // Default fallback values
        let r = 255, g = 200, b = 100;

        if (!color) {
            return { r, g, b };
        }

        // Check if the color is in hex format (#RRGGBB)
        if (color.startsWith('#')) {
            if (color.length >= 7) {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            } else if (color.length >= 4) {
                // Handle shorthand hex (#RGB)
                r = parseInt(color.slice(1, 2) + color.slice(1, 2), 16);
                g = parseInt(color.slice(2, 3) + color.slice(2, 3), 16);
                b = parseInt(color.slice(3, 4) + color.slice(3, 4), 16);
            }
        } else if (color.startsWith('rgb')) {
            // Handle rgb/rgba format
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (rgbMatch) {
                r = parseInt(rgbMatch[1], 10);
                g = parseInt(rgbMatch[2], 10);
                b = parseInt(rgbMatch[3], 10);
            }
        } else if (color.startsWith('hsl')) {
            // Handle hsl/hsla format by converting to RGB
            const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/i);
            if (hslMatch) {
                const h = parseInt(hslMatch[1], 10) / 360;
                const s = parseInt(hslMatch[2], 10) / 100;
                const l = parseInt(hslMatch[3], 10) / 100;

                // Convert HSL to RGB using the algorithm
                if (s === 0) {
                    // Achromatic (gray)
                    r = g = b = Math.round(l * 255);
                } else {
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;

                    r = Math.round(hueToRgb(p, q, h + 1/3) * 255);
                    g = Math.round(hueToRgb(p, q, h) * 255);
                    b = Math.round(hueToRgb(p, q, h - 1/3) * 255);
                }
            }
        }

        // Validate that we have valid numbers
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            r = 255;
            g = 200;
            b = 100;
        }

        return { r, g, b };
    } catch (error) {
        // Return fallback values if any error occurs
        return { r: 255, g: 200, b: 100 };
    }
}

/**
 * Helper function for HSL to RGB conversion
 * @param {number} p - First parameter for conversion
 * @param {number} q - Second parameter for conversion
 * @param {number} t - Third parameter for conversion
 * @returns {number} RGB component value (0-1)
 */
function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

// Export the utility functions
export {
    setSeed,
    seededRandom,
    rnd,
    hashString,
    randomItem,
    randomRange,
    randomInt,
    hslToString,
    parseColorToRgb,
    hueToRgb,
    clamp,
    debounce,
    throttle,
    createRandomFunction,
    generateUniqueId,
    isValidNumber,
    formatDate
};
