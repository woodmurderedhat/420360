/**
 * palette.js - Color palette generation for the Generative Art Studio
 * Handles creating color palettes based on different themes and art styles
 */

import { randomRange, hslToString } from './utils.js';
import { artStyles } from './styles.js';
import { handleError, ErrorType, ErrorSeverity } from './error-service.js';

// Palette cache to store recently generated palettes
// Structure: { cacheKey: { palette: Array<string>, timestamp: number, hits: number } }
const paletteCache = new Map();
const MAX_CACHE_SIZE = 50; // Maximum number of palettes to cache
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generate a cache key for a palette
 * @param {string} style - The art style
 * @param {string} colorTheme - The color theme
 * @param {number} baseHue - Base hue value
 * @param {number} saturation - Saturation value
 * @param {number} lightness - Lightness value
 * @returns {string} A unique cache key
 */
function generateCacheKey(style, colorTheme, baseHue, saturation, lightness) {
    // For random themes, don't use a cache key since we want a new palette each time
    if (colorTheme === 'random') {
        return null;
    }

    // For custom themes, include all parameters in the key
    return `${style}|${colorTheme}|${baseHue}|${saturation}|${lightness}`;
}

/**
 * Clear old entries from the palette cache
 * @private
 */
function pruneCache() {
    // If cache is under the limit, no need to prune
    if (paletteCache.size <= MAX_CACHE_SIZE) {
        return;
    }

    // Convert to array for sorting
    const entries = Array.from(paletteCache.entries());

    // Sort by last access time (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    entriesToRemove.forEach(entry => {
        paletteCache.delete(entry[0]);
    });
}

/**
 * Generates a color palette based on the selected art style and color theme.
 * Uses a caching system to improve performance for repeated palette generation.
 *
 * @param {string} style - The current art style.
 * @param {string} colorTheme - The color theme to use
 * @param {number} baseHue - Base hue for custom themes (0-360)
 * @param {number} saturation - Saturation for custom themes (0-100)
 * @param {number} lightness - Lightness for custom themes (0-100)
 * @returns {Array<string>} An array of color strings.
 */
function generatePalette(style, colorTheme = 'random', baseHue = 180, saturation = 70, lightness = 50) {
    try {
        // Generate cache key
        const cacheKey = generateCacheKey(style, colorTheme, baseHue, saturation, lightness);

        // Check cache for non-random themes
        if (cacheKey && paletteCache.has(cacheKey)) {
            // Update cache entry timestamp and hit count
            const cacheEntry = paletteCache.get(cacheKey);
            cacheEntry.timestamp = Date.now();
            cacheEntry.hits++;
            cacheHits++;

            // Return cached palette
            return [...cacheEntry.palette]; // Return a copy to prevent modification
        }

        // Cache miss, generate a new palette
        cacheMisses++;
    // Use custom color settings if selected
    let paletteBaseHue = colorTheme === 'custom' ? baseHue : Math.random() * 360;
    let paletteSaturation = colorTheme === 'custom' ? saturation : 70 + Math.random() * 30;
    let paletteLightness = colorTheme === 'custom' ? lightness : 50 + Math.random() * 20;

    const palette = [];
    let numColors = 5;

    // Generate palette based on color theme
    switch (colorTheme) {
        case 'monochrome':
            numColors = 5;
            for (let i = 0; i < numColors; i++) {
                // Vary lightness for monochrome
                const l = 30 + (i * 60 / numColors);
                palette.push(hslToString(paletteBaseHue, paletteSaturation, l));
            }
            break;

        case 'complementary':
            // Base color and its complement
            palette.push(hslToString(paletteBaseHue, paletteSaturation, paletteLightness));
            palette.push(hslToString((paletteBaseHue + 180) % 360, paletteSaturation, paletteLightness));

            // Add variations
            palette.push(hslToString(paletteBaseHue, paletteSaturation * 0.8, paletteLightness * 1.2));
            palette.push(hslToString((paletteBaseHue + 180) % 360, paletteSaturation * 0.8, paletteLightness * 1.2));
            palette.push(hslToString(paletteBaseHue, paletteSaturation * 0.6, paletteLightness * 0.8));
            break;

        case 'analogous':
            // Base color and analogous colors
            for (let i = 0; i < 5; i++) {
                const hue = (paletteBaseHue + (i - 2) * 30 + 360) % 360;
                palette.push(hslToString(hue, paletteSaturation, paletteLightness));
            }
            break;

        case 'triadic':
            // Three colors evenly spaced
            for (let i = 0; i < 3; i++) {
                const hue = (paletteBaseHue + i * 120) % 360;
                palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                // Add a lighter and darker version
                palette.push(hslToString(hue, paletteSaturation * 0.8, Math.min(paletteLightness * 1.3, 95)));
                palette.push(hslToString(hue, paletteSaturation * 1.1, paletteLightness * 0.7));
            }
            break;

        case 'random':
        default:
            // Style-specific palettes
            switch (style) {
                case artStyles.GEOMETRIC_GRID:
                    numColors = Math.random() < 0.5 ? 3 : 5;
                    paletteSaturation = Math.random() < 0.5 ? (30 + Math.random() * 20) : (70 + Math.random() * 20);
                    paletteLightness = Math.random() < 0.5 ? (70 + Math.random() * 15) : (40 + Math.random() * 20);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (Math.random() < 0.5 ? (360 / numColors) : 180))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;

                case artStyles.ORGANIC_NOISE:
                    numColors = 7;
                    paletteSaturation = 60 + Math.random() * 25;
                    paletteLightness = 55 + Math.random() * 20;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (15 + Math.random() * 20))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;

                case artStyles.FRACTAL_LINES:
                    palette.push(hslToString(paletteBaseHue, 80 + Math.random() * 20, 30 + Math.random() * 20));
                    palette.push(hslToString((paletteBaseHue + 180 + (Math.random() - 0.5) * 60) % 360, 80 + Math.random() * 20, 70 + Math.random() * 20));
                    break;

                case artStyles.PARTICLE_SWARM:
                    numColors = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (120 + Math.random() * 60)) % 360;
                        palette.push(hslToString(hue, 90 + Math.random() * 10, 50 + Math.random() * 10));
                    }
                    break;

                case artStyles.ORGANIC_SPLATTERS:
                    numColors = 4;
                    paletteSaturation = 75 + Math.random() * 25;
                    paletteLightness = 45 + Math.random() * 15;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (90 + Math.random() * 30))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;

                case artStyles.GLITCH_MOSAIC:
                    if (Math.random() < 0.5) {
                        numColors = 6;
                        for (let i = 0; i < numColors; i++) {
                            palette.push(hslToString(Math.random() * 360, 70 + Math.random() * 30, 50 + Math.random() * 25));
                        }
                    } else {
                        const accentHue = Math.random() * 360;
                        palette.push(hslToString(accentHue, 80 + Math.random() * 20, 50 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 20 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 50 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 80 + Math.random() * 10));
                    }
                    break;

                case artStyles.NEON_WAVES:
                    // Neon colors with dark background
                    palette.push(hslToString(paletteBaseHue, 100, 60)); // Main neon color
                    palette.push(hslToString((paletteBaseHue + 60) % 360, 100, 60));
                    palette.push(hslToString((paletteBaseHue + 180) % 360, 100, 60));
                    palette.push(hslToString((paletteBaseHue + 240) % 360, 100, 60));
                    palette.push(hslToString(0, 0, 10)); // Dark background/accent
                    break;

                case artStyles.PIXEL_SORT:
                    // Limited palette for pixel sorting
                    numColors = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (360 / numColors)) % 360;
                        palette.push(hslToString(hue, 70 + Math.random() * 30, 40 + Math.random() * 30));
                    }
                    break;

                case artStyles.VORONOI_CELLS:
                    // Soft colors for Voronoi cells
                    numColors = 5 + Math.floor(Math.random() * 3);
                    paletteSaturation = 50 + Math.random() * 30;
                    paletteLightness = 60 + Math.random() * 20;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (360 / numColors)) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;

                case artStyles.DEFAULT:
                    // Rich, diverse palette for the default masterpiece style
                    // Include a wide range of colors that work well together
                    numColors = 8 + Math.floor(Math.random() * 4);

                    // Add some vibrant colors
                    for (let i = 0; i < numColors / 2; i++) {
                        const hue = (paletteBaseHue + i * (360 / (numColors / 2))) % 360;
                        palette.push(hslToString(hue, 85 + Math.random() * 15, 55 + Math.random() * 15));
                    }

                    // Add some softer, more pastel colors
                    for (let i = 0; i < numColors / 2; i++) {
                        const hue = (paletteBaseHue + 30 + i * (360 / (numColors / 2))) % 360;
                        palette.push(hslToString(hue, 60 + Math.random() * 20, 75 + Math.random() * 15));
                    }

                    // Add a few neutral colors
                    palette.push(hslToString(0, 0, 95)); // Near white
                    palette.push(hslToString(0, 0, 20)); // Near black
                    palette.push(hslToString(paletteBaseHue, 15, 50)); // Muted base hue
                    break;

                default:
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (360 / numColors))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
            }
    }

    // Store in cache if we have a cache key
    if (cacheKey) {
        // Prune cache if needed
        pruneCache();

        // Store the new palette
        paletteCache.set(cacheKey, {
            palette: [...palette], // Store a copy to prevent modification
            timestamp: Date.now(),
            hits: 1
        });
    }

    return palette;
    } catch (error) {
        handleError(error, ErrorType.RENDERING, ErrorSeverity.WARNING, {
            component: 'palette',
            message: 'Error generating color palette'
        });

        // Return a simple fallback palette
        return [
            'rgb(200, 50, 50)',
            'rgb(50, 200, 50)',
            'rgb(50, 50, 200)',
            'rgb(200, 200, 50)',
            'rgb(200, 50, 200)'
        ];
    }
}

/**
 * Clear the palette cache
 * Useful when changing themes or when palette generation logic changes
 */
export function clearPaletteCache() {
    paletteCache.clear();
    cacheHits = 0;
    cacheMisses = 0;
}

/**
 * Get statistics about the palette cache
 * @returns {Object} Cache statistics
 */
export function getPaletteCacheStats() {
    return {
        size: paletteCache.size,
        maxSize: MAX_CACHE_SIZE,
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0
    };
}

export { generatePalette };
