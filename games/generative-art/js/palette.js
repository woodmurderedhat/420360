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
    // Use custom color settings if selected, otherwise use more varied random values
    let paletteBaseHue = colorTheme === 'custom' ? baseHue : Math.random() * 360;

    // More varied saturation and lightness for more diverse palettes
    let paletteSaturation, paletteLightness;

    if (colorTheme === 'custom') {
        paletteSaturation = saturation;
        paletteLightness = lightness;
    } else {
        // Randomly choose between different saturation/lightness profiles
        const colorProfile = Math.random();

        if (colorProfile < 0.25) {
            // Vibrant colors
            paletteSaturation = 80 + Math.random() * 20;
            paletteLightness = 45 + Math.random() * 25;
        } else if (colorProfile < 0.5) {
            // Pastel colors
            paletteSaturation = 40 + Math.random() * 30;
            paletteLightness = 70 + Math.random() * 20;
        } else if (colorProfile < 0.75) {
            // Muted colors
            paletteSaturation = 20 + Math.random() * 40;
            paletteLightness = 40 + Math.random() * 30;
        } else {
            // High contrast
            paletteSaturation = 60 + Math.random() * 40;
            paletteLightness = 30 + Math.random() * 60;
        }
    }

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
                    // Enhanced random palette generation for the default masterpiece style

                    // Randomly choose a palette generation strategy for more variety
                    const paletteStrategy = Math.random();

                    if (paletteStrategy < 0.2) {
                        // Monochromatic with accents
                        numColors = 6 + Math.floor(Math.random() * 4);
                        const monoHue = Math.random() * 360;
                        const accentHue = (monoHue + 180 + (Math.random() * 60 - 30)) % 360;

                        // Main monochromatic colors
                        for (let i = 0; i < numColors - 2; i++) {
                            const l = 30 + (i * 50 / (numColors - 2));
                            const s = 60 + Math.random() * 40;
                            palette.push(hslToString(monoHue, s, l));
                        }

                        // Add accent colors
                        palette.push(hslToString(accentHue, 90 + Math.random() * 10, 50 + Math.random() * 20));
                        palette.push(hslToString(accentHue, 70 + Math.random() * 20, 70 + Math.random() * 20));

                    } else if (paletteStrategy < 0.4) {
                        // Complementary with variations
                        numColors = 8 + Math.floor(Math.random() * 4);
                        const hue1 = Math.random() * 360;
                        const hue2 = (hue1 + 180) % 360;

                        for (let i = 0; i < numColors / 2; i++) {
                            // First complementary color with variations
                            const h1 = (hue1 + (Math.random() * 30 - 15)) % 360;
                            const s1 = 70 + Math.random() * 30;
                            const l1 = 40 + Math.random() * 40;
                            palette.push(hslToString(h1, s1, l1));

                            // Second complementary color with variations
                            const h2 = (hue2 + (Math.random() * 30 - 15)) % 360;
                            const s2 = 70 + Math.random() * 30;
                            const l2 = 40 + Math.random() * 40;
                            palette.push(hslToString(h2, s2, l2));
                        }

                    } else if (paletteStrategy < 0.6) {
                        // Triadic harmony
                        numColors = 9 + Math.floor(Math.random() * 3);
                        const baseHue = Math.random() * 360;

                        for (let i = 0; i < 3; i++) {
                            const hue = (baseHue + i * 120) % 360;

                            // Three variations of each hue
                            palette.push(hslToString(hue, 90 + Math.random() * 10, 50 + Math.random() * 15)); // Vibrant
                            palette.push(hslToString(hue, 60 + Math.random() * 20, 70 + Math.random() * 20)); // Pastel
                            palette.push(hslToString(hue, 40 + Math.random() * 20, 30 + Math.random() * 20)); // Muted
                        }

                    } else if (paletteStrategy < 0.8) {
                        // Analogous with wide range
                        numColors = 7 + Math.floor(Math.random() * 5);
                        const baseHue = Math.random() * 360;
                        const range = 30 + Math.random() * 60; // Between 30-90 degrees

                        for (let i = 0; i < numColors; i++) {
                            const hue = (baseHue + (i - numColors/2) * range / numColors + 360) % 360;
                            const sat = 60 + Math.random() * 40;
                            const light = 40 + Math.random() * 40;
                            palette.push(hslToString(hue, sat, light));
                        }

                    } else {
                        // Random color explosion with some harmony
                        numColors = 10 + Math.floor(Math.random() * 6);

                        // Generate completely random colors but with some relationship
                        for (let i = 0; i < numColors; i++) {
                            // Every third color is related to the previous one
                            const hue = (i % 3 === 0) ?
                                Math.random() * 360 :
                                (palette.length > 0 ?
                                    (parseInt(palette[palette.length-1].match(/hsl\((\d+)/)[1]) +
                                    (Math.random() < 0.5 ? 30 : 330) + Math.random() * 30) % 360 :
                                    Math.random() * 360);

                            const sat = 20 + Math.random() * 80;
                            const light = 20 + Math.random() * 70;
                            palette.push(hslToString(hue, sat, light));
                        }
                    }

                    // Add neutral colors for all strategies
                    if (Math.random() < 0.7) palette.push(hslToString(0, 0, 95)); // Near white
                    if (Math.random() < 0.7) palette.push(hslToString(0, 0, 20)); // Near black
                    if (Math.random() < 0.5) palette.push(hslToString(paletteBaseHue, 15, 50)); // Muted base hue

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
