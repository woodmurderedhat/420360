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
    // For non-custom themes, sometimes use multiple base hues for more variety
    let paletteBaseHue;
    let useMultipleBaseHues = false;
    let secondaryBaseHue = 0;

    if (colorTheme === 'custom') {
        paletteBaseHue = baseHue;
    } else {
        // Occasionally use multiple base hues for more variety
        useMultipleBaseHues = Math.random() < 0.4; // 40% chance of using multiple base hues
        paletteBaseHue = Math.random() * 360;

        if (useMultipleBaseHues) {
            // Choose a secondary hue that's significantly different from the primary
            const hueOffset = 60 + Math.random() * 240; // Between 60 and 300 degrees offset
            secondaryBaseHue = (paletteBaseHue + hueOffset) % 360;
        }
    }

    // More varied saturation and lightness for more diverse palettes
    let paletteSaturation, paletteLightness;
    // Sometimes use different saturation/lightness for each color
    const useVaryingValues = Math.random() < 0.5; // 50% chance

    if (colorTheme === 'custom') {
        paletteSaturation = saturation;
        paletteLightness = lightness;
    } else {
        // Expanded range of color profiles for more variety
        const colorProfile = Math.random();

        if (colorProfile < 0.2) {
            // Vibrant colors
            paletteSaturation = 85 + Math.random() * 15;
            paletteLightness = 45 + Math.random() * 25;
        } else if (colorProfile < 0.4) {
            // Pastel colors
            paletteSaturation = 30 + Math.random() * 40;
            paletteLightness = 70 + Math.random() * 25;
        } else if (colorProfile < 0.6) {
            // Muted colors
            paletteSaturation = 15 + Math.random() * 45;
            paletteLightness = 35 + Math.random() * 35;
        } else if (colorProfile < 0.8) {
            // High contrast
            paletteSaturation = 60 + Math.random() * 40;
            paletteLightness = 25 + Math.random() * 65;
        } else {
            // Extreme colors - either very saturated or very desaturated
            if (Math.random() < 0.5) {
                paletteSaturation = 90 + Math.random() * 10; // Nearly 100% saturation
                paletteLightness = 20 + Math.random() * 60;
            } else {
                paletteSaturation = 5 + Math.random() * 15; // Nearly grayscale
                paletteLightness = 10 + Math.random() * 80;
            }
        }
    }

    const palette = [];
    let numColors = 5;

    // Generate palette based on color theme
    switch (colorTheme) {
        case 'monochrome':
            numColors = 5 + Math.floor(Math.random() * 3); // 5-7 colors
            for (let i = 0; i < numColors; i++) {
                // Vary lightness for monochrome with more randomness
                let l, s;

                if (useVaryingValues) {
                    // More random distribution
                    l = 20 + Math.random() * 70;
                    s = paletteSaturation * (0.7 + Math.random() * 0.6); // 70-130% of base saturation
                } else {
                    // More structured distribution
                    l = 25 + (i * 65 / numColors) + (Math.random() * 10 - 5); // Add small random variation
                    s = paletteSaturation;
                }

                // Occasionally add a slight hue shift for interest
                const hueShift = Math.random() < 0.3 ? (Math.random() * 10 - 5) : 0;
                palette.push(hslToString((paletteBaseHue + hueShift + 360) % 360, s, l));
            }
            break;

        case 'complementary':
            // Base color and its complement with more variations
            numColors = 6 + Math.floor(Math.random() * 3); // 6-8 colors

            // Add base colors
            palette.push(hslToString(paletteBaseHue, paletteSaturation, paletteLightness));
            palette.push(hslToString((paletteBaseHue + 180) % 360, paletteSaturation, paletteLightness));

            // Add more varied variations
            for (let i = 0; i < numColors - 2; i++) {
                const useComplement = Math.random() < 0.5;
                const hue = useComplement ?
                    (paletteBaseHue + 180 + (Math.random() * 30 - 15)) % 360 :
                    (paletteBaseHue + (Math.random() * 30 - 15)) % 360;

                const satMult = 0.5 + Math.random() * 0.7; // 50-120% of base saturation
                const lightMult = 0.6 + Math.random() * 0.8; // 60-140% of base lightness

                palette.push(hslToString(hue,
                    Math.min(paletteSaturation * satMult, 100),
                    Math.min(paletteLightness * lightMult, 95)));
            }
            break;

        case 'analogous':
            // Base color and analogous colors with more randomness
            numColors = 5 + Math.floor(Math.random() * 3); // 5-7 colors

            // Randomize the angle spread for more variety
            const angleSpread = 20 + Math.random() * 20; // 20-40 degrees

            for (let i = 0; i < numColors; i++) {
                // More random distribution around the base hue
                const hue = (paletteBaseHue + (i - numColors/2) * angleSpread + (Math.random() * 10 - 5) + 360) % 360;

                // Vary saturation and lightness for each color
                const s = useVaryingValues ?
                    Math.min(paletteSaturation * (0.8 + Math.random() * 0.4), 100) :
                    paletteSaturation;

                const l = useVaryingValues ?
                    Math.min(paletteLightness * (0.8 + Math.random() * 0.4), 95) :
                    paletteLightness;

                palette.push(hslToString(hue, s, l));
            }
            break;

        case 'triadic':
            // Three colors evenly spaced with more variations
            numColors = 9 + Math.floor(Math.random() * 3); // 9-11 colors

            // Base triadic colors
            const triadicHues = [
                paletteBaseHue,
                (paletteBaseHue + 120) % 360,
                (paletteBaseHue + 240) % 360
            ];

            // Add variations of each triadic color
            for (let i = 0; i < numColors; i++) {
                const baseHueIndex = i % 3;
                const baseHue = triadicHues[baseHueIndex];

                // Add some random variation to the hue
                const hueVariation = Math.random() * 20 - 10; // -10 to +10 degrees
                const hue = (baseHue + hueVariation + 360) % 360;

                // Randomize saturation and lightness more
                const satVariation = 0.6 + Math.random() * 0.8; // 60-140% variation
                const lightVariation = 0.6 + Math.random() * 0.8; // 60-140% variation

                const s = Math.min(paletteSaturation * satVariation, 100);
                const l = Math.min(paletteLightness * lightVariation, 95);

                palette.push(hslToString(hue, s, l));
            }
            break;

        case 'random':
        default:
            // Style-specific palettes with enhanced randomness
            switch (style) {
                case artStyles.GEOMETRIC_GRID:
                    // More varied color count
                    numColors = 3 + Math.floor(Math.random() * 5); // 3-7 colors

                    // More extreme saturation and lightness variations
                    if (Math.random() < 0.3) {
                        // High contrast geometric look
                        paletteSaturation = 80 + Math.random() * 20;
                        paletteLightness = 30 + Math.random() * 30;
                    } else if (Math.random() < 0.6) {
                        // Pastel geometric look
                        paletteSaturation = 20 + Math.random() * 30;
                        paletteLightness = 70 + Math.random() * 20;
                    } else {
                        // Muted geometric look
                        paletteSaturation = 30 + Math.random() * 40;
                        paletteLightness = 40 + Math.random() * 30;
                    }

                    // Use either the primary or secondary base hue
                    const baseHueToUse = useMultipleBaseHues && Math.random() < 0.5 ? secondaryBaseHue : paletteBaseHue;

                    for (let i = 0; i < numColors; i++) {
                        // More varied hue distribution
                        let hue;
                        if (Math.random() < 0.4) {
                            // Evenly spaced colors
                            hue = (baseHueToUse + (i * (360 / numColors))) % 360;
                        } else if (Math.random() < 0.7) {
                            // Complementary pairs
                            hue = (baseHueToUse + (i % 2 === 0 ? 0 : 180) + (Math.random() * 30 - 15)) % 360;
                        } else {
                            // Random colors with some relationship
                            hue = (baseHueToUse + (Math.random() * 120 - 60)) % 360;
                        }

                        // Occasionally vary saturation and lightness per color
                        const s = useVaryingValues ? paletteSaturation * (0.7 + Math.random() * 0.6) : paletteSaturation;
                        const l = useVaryingValues ? paletteLightness * (0.7 + Math.random() * 0.6) : paletteLightness;

                        palette.push(hslToString(hue, s, l));
                    }

                    // Occasionally add a completely random color for interest
                    if (Math.random() < 0.3) {
                        palette.push(hslToString(Math.random() * 360,
                                                Math.random() * 100,
                                                Math.random() * 100));
                    }
                    break;

                case artStyles.ORGANIC_NOISE:
                    // More varied color count
                    numColors = 5 + Math.floor(Math.random() * 5); // 5-9 colors

                    // More varied saturation and lightness
                    if (Math.random() < 0.5) {
                        // Vibrant organic look
                        paletteSaturation = 60 + Math.random() * 40;
                        paletteLightness = 45 + Math.random() * 30;
                    } else {
                        // Muted organic look
                        paletteSaturation = 30 + Math.random() * 40;
                        paletteLightness = 40 + Math.random() * 40;
                    }

                    // Decide on hue distribution strategy
                    const hueDistribution = Math.random();

                    for (let i = 0; i < numColors; i++) {
                        let hue;

                        if (hueDistribution < 0.33) {
                            // Closely related hues
                            hue = (paletteBaseHue + (i * (10 + Math.random() * 20))) % 360;
                        } else if (hueDistribution < 0.66) {
                            // Wider spread
                            hue = (paletteBaseHue + (i * (30 + Math.random() * 30))) % 360;
                        } else {
                            // Two color groups
                            const group = i < numColors / 2 ? 0 : 1;
                            hue = (paletteBaseHue + (group * 180) + (Math.random() * 60 - 30)) % 360;
                        }

                        // Vary saturation and lightness per color
                        const s = useVaryingValues ?
                            Math.min(paletteSaturation * (0.7 + Math.random() * 0.6), 100) :
                            paletteSaturation;

                        const l = useVaryingValues ?
                            Math.min(paletteLightness * (0.7 + Math.random() * 0.6), 95) :
                            paletteLightness;

                        palette.push(hslToString(hue, s, l));
                    }
                    break;

                case artStyles.FRACTAL_LINES:
                    // More colors for fractal lines
                    numColors = 3 + Math.floor(Math.random() * 3); // 3-5 colors

                    // Choose a color strategy
                    const fractalStrategy = Math.random();

                    if (fractalStrategy < 0.3) {
                        // High contrast strategy
                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + (i * 360 / numColors)) % 360;
                            palette.push(hslToString(hue,
                                                    80 + Math.random() * 20,
                                                    i % 2 === 0 ? (20 + Math.random() * 20) : (70 + Math.random() * 20)));
                        }
                    } else if (fractalStrategy < 0.6) {
                        // Monochromatic with accent
                        const accentHue = (paletteBaseHue + 180 + (Math.random() * 60 - 30)) % 360;

                        // Main color variations
                        for (let i = 0; i < numColors - 1; i++) {
                            const l = 20 + (i * 60 / (numColors - 1));
                            palette.push(hslToString(paletteBaseHue, 70 + Math.random() * 30, l));
                        }

                        // Accent color
                        palette.push(hslToString(accentHue, 90 + Math.random() * 10, 60 + Math.random() * 20));
                    } else {
                        // Completely random colors
                        for (let i = 0; i < numColors; i++) {
                            palette.push(hslToString(Math.random() * 360,
                                                    60 + Math.random() * 40,
                                                    30 + Math.random() * 50));
                        }
                    }
                    break;

                case artStyles.PARTICLE_SWARM:
                    // More varied color count
                    numColors = 3 + Math.floor(Math.random() * 5); // 3-7 colors

                    // Choose a color strategy
                    const particleStrategy = Math.random();

                    if (particleStrategy < 0.3) {
                        // Complementary colors
                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + (i % 2 === 0 ? 0 : 180) + (Math.random() * 40 - 20)) % 360;
                            palette.push(hslToString(hue,
                                                    80 + Math.random() * 20,
                                                    40 + Math.random() * 40));
                        }
                    } else if (particleStrategy < 0.6) {
                        // Triadic colors
                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + (i % 3) * 120 + (Math.random() * 30 - 15)) % 360;
                            palette.push(hslToString(hue,
                                                    70 + Math.random() * 30,
                                                    50 + Math.random() * 30));
                        }
                    } else {
                        // Wide-spaced colors
                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + i * (60 + Math.random() * 60)) % 360;
                            const s = 70 + Math.random() * 30;
                            const l = 40 + Math.random() * 40;
                            palette.push(hslToString(hue, s, l));
                        }
                    }

                    // Occasionally add a bright accent color
                    if (Math.random() < 0.4) {
                        palette.push(hslToString(Math.random() * 360, 100, 70));
                    }
                    break;

                case artStyles.ORGANIC_SPLATTERS:
                    // More varied color count
                    numColors = 4 + Math.floor(Math.random() * 4); // 4-7 colors

                    // Choose a color strategy
                    const splattersStrategy = Math.random();

                    if (splattersStrategy < 0.33) {
                        // Analogous colors
                        paletteSaturation = 70 + Math.random() * 30;
                        paletteLightness = 40 + Math.random() * 30;

                        const hueRange = 30 + Math.random() * 60; // 30-90 degree range

                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + (i - numColors/2) * hueRange / numColors) % 360;
                            palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                        }
                    } else if (splattersStrategy < 0.66) {
                        // Split complementary
                        const hue1 = paletteBaseHue;
                        const hue2 = (paletteBaseHue + 180 - 30) % 360;
                        const hue3 = (paletteBaseHue + 180 + 30) % 360;

                        for (let i = 0; i < numColors; i++) {
                            let hue;
                            if (i % 3 === 0) hue = hue1 + (Math.random() * 20 - 10);
                            else if (i % 3 === 1) hue = hue2 + (Math.random() * 20 - 10);
                            else hue = hue3 + (Math.random() * 20 - 10);

                            const s = 60 + Math.random() * 40;
                            const l = 40 + Math.random() * 40;

                            palette.push(hslToString(hue, s, l));
                        }
                    } else {
                        // Random with some relationship
                        for (let i = 0; i < numColors; i++) {
                            const hue = Math.random() * 360;
                            const s = 50 + Math.random() * 50;
                            const l = 30 + Math.random() * 50;

                            palette.push(hslToString(hue, s, l));
                        }
                    }
                    break;

                case artStyles.GLITCH_MOSAIC:
                    // More varied strategies for glitch mosaic
                    const glitchStrategy = Math.random();

                    if (glitchStrategy < 0.3) {
                        // Completely random colors
                        numColors = 5 + Math.floor(Math.random() * 5); // 5-9 colors
                        for (let i = 0; i < numColors; i++) {
                            palette.push(hslToString(Math.random() * 360,
                                                    Math.random() * 100,
                                                    Math.random() * 100));
                        }
                    } else if (glitchStrategy < 0.6) {
                        // Neon accent with grayscale
                        const accentHue = Math.random() * 360;

                        // Add multiple neon accents
                        palette.push(hslToString(accentHue, 100, 60));
                        palette.push(hslToString((accentHue + 180) % 360, 100, 60));

                        // Add grayscale range
                        for (let i = 0; i < 4; i++) {
                            const l = 10 + i * 25; // 10, 35, 60, 85
                            palette.push(hslToString(0, 0, l));
                        }
                    } else {
                        // Duotone with variations
                        const hue1 = Math.random() * 360;
                        const hue2 = (hue1 + 180) % 360;

                        // First color variations
                        for (let i = 0; i < 3; i++) {
                            const s = 70 + Math.random() * 30;
                            const l = 30 + i * 20; // 30, 50, 70
                            palette.push(hslToString(hue1, s, l));
                        }

                        // Second color variations
                        for (let i = 0; i < 3; i++) {
                            const s = 70 + Math.random() * 30;
                            const l = 30 + i * 20; // 30, 50, 70
                            palette.push(hslToString(hue2, s, l));
                        }
                    }
                    break;

                case artStyles.NEON_WAVES:
                    // Enhanced neon colors with more variation
                    const neonStrategy = Math.random();

                    if (neonStrategy < 0.4) {
                        // Classic neon with dark background
                        // Main neon colors with slight variations
                        const mainHue = Math.random() * 360;
                        const secondaryHue = (mainHue + 30 + Math.random() * 60) % 360;
                        const tertiaryHue = (mainHue + 180 + Math.random() * 60) % 360;

                        // Add main neon colors
                        palette.push(hslToString(mainHue, 100, 60 + Math.random() * 10));
                        palette.push(hslToString(secondaryHue, 100, 60 + Math.random() * 10));
                        palette.push(hslToString(tertiaryHue, 100, 60 + Math.random() * 10));

                        // Add dark background/accent
                        palette.push(hslToString(0, 0, 5 + Math.random() * 10));

                        // Sometimes add a light accent
                        if (Math.random() < 0.5) {
                            palette.push(hslToString(0, 0, 90 + Math.random() * 10));
                        }
                    } else {
                        // More varied neon palette
                        numColors = 5 + Math.floor(Math.random() * 3); // 5-7 colors

                        // Generate random neon colors
                        for (let i = 0; i < numColors - 1; i++) {
                            const hue = Math.random() * 360;
                            const s = 90 + Math.random() * 10; // Very saturated
                            const l = 50 + Math.random() * 20; // Medium to bright

                            palette.push(hslToString(hue, s, l));
                        }

                        // Always add a dark background
                        palette.push(hslToString(0, 0, Math.random() < 0.7 ?
                                                (5 + Math.random() * 10) : // Usually very dark
                                                (20 + Math.random() * 20))); // Sometimes slightly lighter
                    }
                    break;

                case artStyles.PIXEL_SORT:
                    // More varied pixel sort palettes
                    const pixelStrategy = Math.random();

                    if (pixelStrategy < 0.33) {
                        // Limited palette with high contrast
                        numColors = 3 + Math.floor(Math.random() * 2); // 3-4 colors

                        // Choose a base hue and its complement
                        const baseHue = Math.random() * 360;
                        const compHue = (baseHue + 180) % 360;

                        // Add base color variations
                        palette.push(hslToString(baseHue, 80 + Math.random() * 20, 30 + Math.random() * 20));
                        palette.push(hslToString(baseHue, 60 + Math.random() * 20, 60 + Math.random() * 20));

                        // Add complementary color
                        palette.push(hslToString(compHue, 80 + Math.random() * 20, 50 + Math.random() * 30));

                        // Sometimes add a neutral color
                        if (numColors > 3) {
                            palette.push(hslToString(0, 0, Math.random() < 0.5 ?
                                                    (10 + Math.random() * 20) : // Dark
                                                    (80 + Math.random() * 15))); // Light
                        }
                    } else if (pixelStrategy < 0.66) {
                        // Analogous colors
                        numColors = 4 + Math.floor(Math.random() * 3); // 4-6 colors

                        const hueRange = 60 + Math.random() * 60; // 60-120 degree range

                        for (let i = 0; i < numColors; i++) {
                            const hue = (paletteBaseHue + (i * hueRange / (numColors - 1))) % 360;
                            const s = 70 + Math.random() * 30;
                            const l = 40 + Math.random() * 30;

                            palette.push(hslToString(hue, s, l));
                        }
                    } else {
                        // Random colors with some relationship
                        numColors = 5 + Math.floor(Math.random() * 3); // 5-7 colors

                        let prevHue = Math.random() * 360;

                        for (let i = 0; i < numColors; i++) {
                            // Each color is somewhat related to the previous one
                            const hueShift = Math.random() < 0.7 ?
                                            (Math.random() * 60 - 30) : // Usually small shift
                                            (90 + Math.random() * 90); // Sometimes large shift

                            const hue = (prevHue + hueShift) % 360;
                            prevHue = hue;

                            const s = 50 + Math.random() * 50;
                            const l = 30 + Math.random() * 50;

                            palette.push(hslToString(hue, s, l));
                        }
                    }
                    break;

                case artStyles.VORONOI_CELLS:
                    // More varied Voronoi cell palettes
                    const voronoiStrategy = Math.random();

                    if (voronoiStrategy < 0.33) {
                        // Soft pastel palette
                        numColors = 5 + Math.floor(Math.random() * 4); // 5-8 colors

                        paletteSaturation = 30 + Math.random() * 30; // 30-60%
                        paletteLightness = 70 + Math.random() * 20; // 70-90%

                        // Choose distribution method
                        const distribution = Math.random();

                        for (let i = 0; i < numColors; i++) {
                            let hue;

                            if (distribution < 0.5) {
                                // Evenly distributed
                                hue = (paletteBaseHue + i * (360 / numColors)) % 360;
                            } else {
                                // Clustered with occasional outliers
                                hue = Math.random() < 0.8 ?
                                    (paletteBaseHue + (Math.random() * 60 - 30)) % 360 : // Cluster
                                    Math.random() * 360; // Outlier
                            }

                            // Vary saturation and lightness slightly
                            const s = paletteSaturation + (Math.random() * 20 - 10);
                            const l = paletteLightness + (Math.random() * 10 - 5);

                            palette.push(hslToString(hue, s, l));
                        }
                    } else if (voronoiStrategy < 0.66) {
                        // Vibrant contrasting palette
                        numColors = 6 + Math.floor(Math.random() * 4); // 6-9 colors

                        // Choose multiple base hues
                        const hues = [];
                        const numBaseHues = 2 + Math.floor(Math.random() * 3); // 2-4 base hues

                        for (let i = 0; i < numBaseHues; i++) {
                            hues.push((paletteBaseHue + i * (360 / numBaseHues)) % 360);
                        }

                        // Generate colors based on the base hues
                        for (let i = 0; i < numColors; i++) {
                            const baseHue = hues[i % hues.length];
                            const hue = (baseHue + (Math.random() * 30 - 15)) % 360;

                            const s = 60 + Math.random() * 40;
                            const l = 40 + Math.random() * 40;

                            palette.push(hslToString(hue, s, l));
                        }
                    } else {
                        // Monochromatic with accent
                        numColors = 7 + Math.floor(Math.random() * 3); // 7-9 colors

                        // Main monochromatic colors
                        for (let i = 0; i < numColors - 2; i++) {
                            const s = 40 + Math.random() * 30;
                            const l = 30 + (i * 50 / (numColors - 3));

                            palette.push(hslToString(paletteBaseHue, s, l));
                        }

                        // Add accent colors
                        const accentHue = (paletteBaseHue + 180) % 360;
                        palette.push(hslToString(accentHue, 80 + Math.random() * 20, 50 + Math.random() * 20));
                        palette.push(hslToString(accentHue, 60 + Math.random() * 20, 70 + Math.random() * 20));
                    }
                    break;

                case artStyles.LANDSCAPE:
                    // Landscape-specific palette generation
                    const landscapeType = Math.random();
                    const timeOfDay = Math.random();

                    if (timeOfDay < 0.25) {
                        // Dawn/sunrise palette
                        if (landscapeType < 0.25) {
                            // Mountain sunrise
                            palette.push(hslToString(20, 90, 70)); // Bright orange
                            palette.push(hslToString(35, 80, 80)); // Yellow-orange
                            palette.push(hslToString(200, 30, 40)); // Dark blue-gray
                            palette.push(hslToString(220, 40, 60)); // Medium blue
                            palette.push(hslToString(260, 20, 30)); // Dark purple-blue
                            palette.push(hslToString(180, 10, 70)); // Light blue-gray
                            palette.push(hslToString(40, 60, 90)); // Light yellow
                        } else if (landscapeType < 0.5) {
                            // Forest sunrise
                            palette.push(hslToString(25, 90, 65)); // Orange
                            palette.push(hslToString(40, 80, 75)); // Yellow-orange
                            palette.push(hslToString(100, 60, 20)); // Dark green
                            palette.push(hslToString(120, 50, 40)); // Medium green
                            palette.push(hslToString(140, 40, 60)); // Light green
                            palette.push(hslToString(30, 30, 80)); // Light peach
                            palette.push(hslToString(15, 70, 60)); // Burnt orange
                        } else if (landscapeType < 0.75) {
                            // Ocean sunrise
                            palette.push(hslToString(20, 90, 70)); // Bright orange
                            palette.push(hslToString(30, 80, 80)); // Yellow-orange
                            palette.push(hslToString(200, 80, 30)); // Deep blue
                            palette.push(hslToString(190, 70, 50)); // Medium blue
                            palette.push(hslToString(180, 60, 70)); // Light blue
                            palette.push(hslToString(40, 40, 90)); // Light yellow
                            palette.push(hslToString(350, 30, 80)); // Light pink
                        } else {
                            // Desert sunrise
                            palette.push(hslToString(15, 90, 65)); // Orange-red
                            palette.push(hslToString(30, 80, 75)); // Orange
                            palette.push(hslToString(40, 70, 60)); // Sand
                            palette.push(hslToString(25, 60, 40)); // Brown
                            palette.push(hslToString(15, 50, 30)); // Dark brown
                            palette.push(hslToString(45, 40, 85)); // Light sand
                            palette.push(hslToString(10, 80, 60)); // Rust
                        }
                    } else if (timeOfDay < 0.5) {
                        // Day palette
                        if (landscapeType < 0.25) {
                            // Mountain day
                            palette.push(hslToString(210, 80, 70)); // Sky blue
                            palette.push(hslToString(220, 40, 90)); // Light blue
                            palette.push(hslToString(240, 20, 50)); // Gray-blue
                            palette.push(hslToString(200, 30, 40)); // Dark blue-gray
                            palette.push(hslToString(100, 30, 60)); // Gray-green
                            palette.push(hslToString(90, 40, 70)); // Light green
                            palette.push(hslToString(35, 30, 90)); // Off-white
                        } else if (landscapeType < 0.5) {
                            // Forest day
                            palette.push(hslToString(200, 70, 70)); // Sky blue
                            palette.push(hslToString(210, 30, 90)); // Light blue
                            palette.push(hslToString(120, 70, 30)); // Dark green
                            palette.push(hslToString(100, 60, 40)); // Medium green
                            palette.push(hslToString(80, 50, 60)); // Light green
                            palette.push(hslToString(60, 40, 70)); // Yellow-green
                            palette.push(hslToString(40, 30, 80)); // Tan
                        } else if (landscapeType < 0.75) {
                            // Ocean day
                            palette.push(hslToString(195, 80, 70)); // Sky blue
                            palette.push(hslToString(205, 40, 90)); // Light blue
                            palette.push(hslToString(210, 80, 40)); // Deep blue
                            palette.push(hslToString(190, 70, 60)); // Medium blue
                            palette.push(hslToString(180, 60, 80)); // Light blue-green
                            palette.push(hslToString(170, 40, 70)); // Aqua
                            palette.push(hslToString(60, 30, 90)); // Light sand
                        } else {
                            // Desert day
                            palette.push(hslToString(210, 80, 70)); // Sky blue
                            palette.push(hslToString(200, 30, 90)); // Light blue
                            palette.push(hslToString(40, 70, 60)); // Sand
                            palette.push(hslToString(30, 60, 50)); // Medium sand
                            palette.push(hslToString(20, 50, 40)); // Dark sand
                            palette.push(hslToString(15, 40, 30)); // Brown
                            palette.push(hslToString(45, 30, 85)); // Light sand
                        }
                    } else if (timeOfDay < 0.75) {
                        // Sunset palette
                        if (landscapeType < 0.25) {
                            // Mountain sunset
                            palette.push(hslToString(0, 80, 60)); // Red-orange
                            palette.push(hslToString(20, 90, 70)); // Orange
                            palette.push(hslToString(40, 80, 80)); // Yellow-orange
                            palette.push(hslToString(280, 30, 40)); // Dark purple
                            palette.push(hslToString(260, 40, 60)); // Medium purple
                            palette.push(hslToString(290, 30, 70)); // Light purple
                            palette.push(hslToString(320, 40, 80)); // Pink
                        } else if (landscapeType < 0.5) {
                            // Forest sunset
                            palette.push(hslToString(10, 90, 60)); // Red-orange
                            palette.push(hslToString(30, 80, 70)); // Orange
                            palette.push(hslToString(50, 70, 80)); // Yellow-orange
                            palette.push(hslToString(100, 60, 20)); // Dark green
                            palette.push(hslToString(110, 50, 30)); // Medium-dark green
                            palette.push(hslToString(120, 40, 40)); // Medium green
                            palette.push(hslToString(340, 50, 70)); // Pink
                        } else if (landscapeType < 0.75) {
                            // Ocean sunset
                            palette.push(hslToString(0, 90, 60)); // Red
                            palette.push(hslToString(20, 90, 70)); // Orange
                            palette.push(hslToString(40, 80, 80)); // Yellow-orange
                            palette.push(hslToString(200, 80, 30)); // Deep blue
                            palette.push(hslToString(220, 70, 40)); // Medium blue
                            palette.push(hslToString(240, 60, 50)); // Light blue-purple
                            palette.push(hslToString(300, 50, 70)); // Purple-pink
                        } else {
                            // Desert sunset
                            palette.push(hslToString(0, 90, 60)); // Red
                            palette.push(hslToString(15, 90, 70)); // Red-orange
                            palette.push(hslToString(30, 80, 80)); // Orange
                            palette.push(hslToString(40, 70, 50)); // Sand
                            palette.push(hslToString(30, 60, 40)); // Dark sand
                            palette.push(hslToString(20, 50, 30)); // Brown
                            palette.push(hslToString(350, 60, 70)); // Pink-red
                        }
                    } else {
                        // Night palette
                        if (landscapeType < 0.25) {
                            // Mountain night
                            palette.push(hslToString(240, 70, 20)); // Dark blue
                            palette.push(hslToString(230, 60, 30)); // Medium-dark blue
                            palette.push(hslToString(220, 50, 40)); // Medium blue
                            palette.push(hslToString(210, 40, 50)); // Light blue
                            palette.push(hslToString(200, 30, 15)); // Very dark blue-gray
                            palette.push(hslToString(180, 20, 30)); // Dark gray-blue
                            palette.push(hslToString(60, 100, 90)); // Bright yellow (stars)
                        } else if (landscapeType < 0.5) {
                            // Forest night
                            palette.push(hslToString(240, 70, 20)); // Dark blue
                            palette.push(hslToString(230, 60, 30)); // Medium-dark blue
                            palette.push(hslToString(120, 60, 10)); // Very dark green
                            palette.push(hslToString(140, 50, 20)); // Dark green
                            palette.push(hslToString(160, 40, 30)); // Medium-dark green
                            palette.push(hslToString(200, 30, 40)); // Blue-gray
                            palette.push(hslToString(60, 100, 90)); // Bright yellow (stars)
                        } else if (landscapeType < 0.75) {
                            // Ocean night
                            palette.push(hslToString(240, 70, 20)); // Dark blue
                            palette.push(hslToString(230, 60, 30)); // Medium-dark blue
                            palette.push(hslToString(220, 50, 40)); // Medium blue
                            palette.push(hslToString(210, 80, 15)); // Very dark blue
                            palette.push(hslToString(200, 70, 25)); // Dark blue-green
                            palette.push(hslToString(190, 60, 35)); // Medium blue-green
                            palette.push(hslToString(60, 100, 90)); // Bright yellow (stars)
                        } else {
                            // Desert night
                            palette.push(hslToString(240, 70, 20)); // Dark blue
                            palette.push(hslToString(230, 60, 30)); // Medium-dark blue
                            palette.push(hslToString(40, 50, 20)); // Dark sand
                            palette.push(hslToString(30, 40, 30)); // Medium-dark sand
                            palette.push(hslToString(20, 30, 40)); // Medium sand
                            palette.push(hslToString(10, 20, 15)); // Very dark brown
                            palette.push(hslToString(60, 100, 90)); // Bright yellow (stars)
                        }
                    }
                    break;

                case artStyles.DEFAULT:
                    // Enhanced random palette generation for the default masterpiece style with maximum randomness

                    // Expanded palette strategies for more variety
                    const paletteStrategy = Math.random();

                    if (paletteStrategy < 0.15) {
                        // Monochromatic with accents - enhanced version
                        numColors = 7 + Math.floor(Math.random() * 5); // 7-11 colors

                        // Sometimes use a completely random hue, sometimes use the base hue
                        const monoHue = Math.random() < 0.7 ? Math.random() * 360 : paletteBaseHue;

                        // Multiple accent hues for more interest
                        const accentHue1 = (monoHue + 180 + (Math.random() * 60 - 30)) % 360;
                        const accentHue2 = (monoHue + 120 + (Math.random() * 60 - 30)) % 360;
                        const accentHue3 = (monoHue + 240 + (Math.random() * 60 - 30)) % 360;

                        // Main monochromatic colors with more variation
                        for (let i = 0; i < numColors - 3; i++) {
                            // More random distribution of lightness
                            const l = Math.random() < 0.7 ?
                                    (25 + (i * 55 / (numColors - 3)) + (Math.random() * 20 - 10)) : // Structured with variation
                                    (20 + Math.random() * 70); // Completely random

                            // More random saturation
                            const s = Math.random() < 0.7 ?
                                    (50 + Math.random() * 50) : // Higher saturation
                                    (20 + Math.random() * 40); // Lower saturation

                            // Slight hue variations
                            const hueVar = Math.random() * 20 - 10;

                            palette.push(hslToString((monoHue + hueVar + 360) % 360, s, l));
                        }

                        // Add multiple accent colors
                        if (Math.random() < 0.8) palette.push(hslToString(accentHue1, 90 + Math.random() * 10, 50 + Math.random() * 30));
                        if (Math.random() < 0.7) palette.push(hslToString(accentHue2, 80 + Math.random() * 20, 60 + Math.random() * 30));
                        if (Math.random() < 0.6) palette.push(hslToString(accentHue3, 70 + Math.random() * 30, 40 + Math.random() * 40));

                        // Sometimes add a completely random color for interest
                        if (Math.random() < 0.4) {
                            palette.push(hslToString(Math.random() * 360, Math.random() * 100, Math.random() * 100));
                        }

                    } else if (paletteStrategy < 0.3) {
                        // Complementary with variations - enhanced version
                        numColors = 8 + Math.floor(Math.random() * 6); // 8-13 colors

                        // Base hues - sometimes use multiple complementary pairs
                        const numPairs = 1 + Math.floor(Math.random() * 2); // 1-2 pairs
                        const basePairs = [];

                        for (let i = 0; i < numPairs; i++) {
                            const hue1 = Math.random() * 360;
                            const hue2 = (hue1 + 180) % 360;
                            basePairs.push([hue1, hue2]);
                        }

                        // Generate colors from the complementary pairs
                        for (let i = 0; i < numColors; i++) {
                            // Select which pair to use
                            const pairIndex = Math.floor(i * numPairs / numColors);
                            const [hue1, hue2] = basePairs[pairIndex];

                            // Decide which hue from the pair to use
                            const useFirstHue = Math.random() < 0.5;
                            const baseHue = useFirstHue ? hue1 : hue2;

                            // Add variation to the hue
                            const hueVar = Math.random() * 40 - 20; // -20 to +20 degrees
                            const h = (baseHue + hueVar + 360) % 360;

                            // Randomize saturation and lightness
                            const s = 50 + Math.random() * 50;
                            const l = 30 + Math.random() * 60;

                            palette.push(hslToString(h, s, l));
                        }

                        // Sometimes add a neutral color
                        if (Math.random() < 0.5) {
                            palette.push(hslToString(0, 0, Math.random() * 100));
                        }

                    } else if (paletteStrategy < 0.45) {
                        // Triadic harmony - enhanced version
                        numColors = 9 + Math.floor(Math.random() * 6); // 9-14 colors

                        // Sometimes use perfect triadic, sometimes use modified triadic
                        const perfectTriadic = Math.random() < 0.6;
                        const baseHue = Math.random() * 360;

                        const triadicHues = perfectTriadic ?
                            [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360] : // Perfect triadic
                            [baseHue, (baseHue + 110 + Math.random() * 20) % 360, (baseHue + 230 + Math.random() * 20) % 360]; // Modified triadic

                        // Add more variation to each color
                        for (let i = 0; i < numColors; i++) {
                            const baseHueIndex = i % 3;
                            const baseHue = triadicHues[baseHueIndex];

                            // More random hue variation
                            const hueVar = Math.random() < 0.7 ?
                                        (Math.random() * 30 - 15) : // Small variation
                                        (Math.random() * 60 - 30); // Larger variation

                            const hue = (baseHue + hueVar + 360) % 360;

                            // Decide on a color profile for this color
                            const colorProfile = Math.random();
                            let s, l;

                            if (colorProfile < 0.33) {
                                // Vibrant
                                s = 80 + Math.random() * 20;
                                l = 45 + Math.random() * 25;
                            } else if (colorProfile < 0.66) {
                                // Pastel
                                s = 40 + Math.random() * 30;
                                l = 70 + Math.random() * 25;
                            } else {
                                // Muted
                                s = 20 + Math.random() * 40;
                                l = 30 + Math.random() * 40;
                            }

                            palette.push(hslToString(hue, s, l));
                        }

                        // Sometimes add completely random colors
                        if (Math.random() < 0.5) {
                            const numRandomColors = 1 + Math.floor(Math.random() * 3); // 1-3 random colors
                            for (let i = 0; i < numRandomColors; i++) {
                                palette.push(hslToString(Math.random() * 360, Math.random() * 100, Math.random() * 100));
                            }
                        }

                    } else if (paletteStrategy < 0.6) {
                        // Analogous with wide range - enhanced version
                        numColors = 8 + Math.floor(Math.random() * 6); // 8-13 colors

                        // Sometimes use a completely random hue, sometimes use the base hue
                        const baseHue = Math.random() < 0.7 ? Math.random() * 360 : paletteBaseHue;

                        // More varied range
                        const range = Math.random() < 0.7 ?
                                    (30 + Math.random() * 60) : // 30-90 degrees (standard analogous)
                                    (100 + Math.random() * 80); // 100-180 degrees (wide analogous)

                        // Sometimes distribute evenly, sometimes cluster
                        const evenDistribution = Math.random() < 0.6;

                        for (let i = 0; i < numColors; i++) {
                            let hue;

                            if (evenDistribution) {
                                // Evenly distributed with small random variation
                                hue = (baseHue + (i - numColors/2) * range / numColors + (Math.random() * 20 - 10) + 360) % 360;
                            } else {
                                // Clustered around a few points
                                const cluster = Math.floor(i * 3 / numColors); // 0, 1, or 2
                                const clusterHue = (baseHue + cluster * range / 2) % 360;
                                hue = (clusterHue + (Math.random() * 30 - 15)) % 360;
                            }

                            // Randomize saturation and lightness more
                            const s = 40 + Math.random() * 60;
                            const l = 30 + Math.random() * 60;

                            palette.push(hslToString(hue, s, l));
                        }

                        // Sometimes add a contrasting accent
                        if (Math.random() < 0.4) {
                            const accentHue = (baseHue + 180) % 360;
                            palette.push(hslToString(accentHue, 90 + Math.random() * 10, 50 + Math.random() * 30));
                        }

                    } else if (paletteStrategy < 0.75) {
                        // Split complementary - new strategy
                        numColors = 9 + Math.floor(Math.random() * 5); // 9-13 colors

                        const baseHue = Math.random() * 360;
                        const comp1 = (baseHue + 180 - 30 - Math.random() * 20) % 360;
                        const comp2 = (baseHue + 180 + 30 + Math.random() * 20) % 360;

                        // Generate variations of each hue
                        for (let i = 0; i < numColors; i++) {
                            let hue;

                            // Decide which of the three hues to use as base
                            if (i % 3 === 0) {
                                hue = (baseHue + (Math.random() * 30 - 15)) % 360;
                            } else if (i % 3 === 1) {
                                hue = (comp1 + (Math.random() * 30 - 15)) % 360;
                            } else {
                                hue = (comp2 + (Math.random() * 30 - 15)) % 360;
                            }

                            // Randomize saturation and lightness
                            const s = 50 + Math.random() * 50;
                            const l = 30 + Math.random() * 60;

                            palette.push(hslToString(hue, s, l));
                        }

                        // Sometimes add neutral colors
                        if (Math.random() < 0.6) palette.push(hslToString(0, 0, 95)); // Near white
                        if (Math.random() < 0.6) palette.push(hslToString(0, 0, 15)); // Near black

                    } else if (paletteStrategy < 0.9) {
                        // Random color explosion with some harmony - enhanced version
                        numColors = 10 + Math.floor(Math.random() * 8); // 10-17 colors

                        // Choose a randomness strategy
                        const randomnessLevel = Math.random();

                        if (randomnessLevel < 0.4) {
                            // Colors with some relationship to previous
                            let prevHue = Math.random() * 360;

                            for (let i = 0; i < numColors; i++) {
                                // Decide how much to shift from previous hue
                                const hueShift = Math.random() < 0.7 ?
                                                (Math.random() * 60 - 30) : // Small shift
                                                (60 + Math.random() * 120); // Large shift

                                const hue = (prevHue + hueShift) % 360;
                                prevHue = hue;

                                const s = 20 + Math.random() * 80;
                                const l = 20 + Math.random() * 70;

                                palette.push(hslToString(hue, s, l));
                            }
                        } else {
                            // Completely random colors
                            for (let i = 0; i < numColors; i++) {
                                const hue = Math.random() * 360;
                                const s = Math.random() * 100;
                                const l = 10 + Math.random() * 80; // Avoid too dark or too light

                                palette.push(hslToString(hue, s, l));
                            }
                        }

                        // Add some extreme colors for interest
                        if (Math.random() < 0.5) palette.push(hslToString(Math.random() * 360, 100, 50)); // Super saturated
                        if (Math.random() < 0.5) palette.push(hslToString(0, 0, Math.random() < 0.5 ? 0 : 100)); // Pure black or white

                    } else {
                        // Color temperature contrast - new strategy
                        numColors = 10 + Math.floor(Math.random() * 6); // 10-15 colors

                        // Warm colors (reds, oranges, yellows)
                        const warmHue = Math.random() * 60 + (Math.random() < 0.5 ? 0 : 300); // 0-60 or 300-360

                        // Cool colors (blues, greens)
                        const coolHue = Math.random() * 180 + 90; // 90-270

                        // Generate warm and cool colors
                        for (let i = 0; i < numColors; i++) {
                            const useWarm = i % 2 === 0;
                            const baseHue = useWarm ? warmHue : coolHue;

                            // Add variation to the hue
                            const hueVar = Math.random() * 40 - 20;
                            const hue = (baseHue + hueVar + 360) % 360;

                            // Warm colors tend to be more saturated, cool colors more varied
                            const s = useWarm ?
                                    (70 + Math.random() * 30) : // Warm: high saturation
                                    (30 + Math.random() * 70); // Cool: varied saturation

                            // Randomize lightness
                            const l = 30 + Math.random() * 60;

                            palette.push(hslToString(hue, s, l));
                        }

                        // Add neutral bridge colors
                        if (Math.random() < 0.7) palette.push(hslToString(0, 0, 90)); // Light neutral
                        if (Math.random() < 0.7) palette.push(hslToString(0, 0, 30)); // Dark neutral
                        if (Math.random() < 0.5) palette.push(hslToString(0, 0, 60)); // Mid neutral
                    }

                    // Add neutral colors for all strategies with more randomness
                    if (Math.random() < 0.6) palette.push(hslToString(0, 0, 95 + Math.random() * 5)); // Near white
                    if (Math.random() < 0.6) palette.push(hslToString(0, 0, Math.random() * 20)); // Near black
                    if (Math.random() < 0.4) palette.push(hslToString(paletteBaseHue, 10 + Math.random() * 10, 40 + Math.random() * 20)); // Muted base hue

                    // Sometimes add a completely unexpected color for interest
                    if (Math.random() < 0.3) {
                        palette.push(hslToString(Math.random() * 360, Math.random() * 100, Math.random() * 100));
                    }

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
