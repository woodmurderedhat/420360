/**
 * styles.js - Art style definitions for the Generative Art Studio
 * Contains the art style constants and imports the style implementations
 */

// Import style implementations
import { drawDefaultMasterpiece } from './styles-default.js';

// Art style constants
export const artStyles = {
    DEFAULT: 'default',
    VORONOI_CELLS: 'voronoi-cells',
    ORGANIC_SPLATTERS: 'organic-splatters',
    NEON_WAVES: 'neon-waves',
    FRACTAL_LINES: 'fractal-lines',
    GEOMETRIC_GRID: 'geometric-grid',
    PARTICLE_SWARM: 'particle-swarm',
    ORGANIC_NOISE: 'organic-noise',
    GLITCH_MOSAIC: 'glitch-mosaic',
    PIXEL_SORT: 'pixel-sort',
    DOT_MATRIX: 'dot-matrix',
    FLOWING_LINES: 'flowing-lines',
    SYMMETRICAL_PATTERNS: 'symmetrical-patterns'
};

/**
 * Draw artwork in the selected style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} style - The art style to draw
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
export function drawArtwork(ctx, style, palette, isAnimationFrame = false, params = {}) {
    // Default to the default style if the specified style doesn't exist
    if (!Object.values(artStyles).includes(style)) {
        style = artStyles.DEFAULT;
    }

    // Draw the selected style
    switch (style) {
        case artStyles.DEFAULT:
            drawDefaultMasterpiece(ctx, palette, isAnimationFrame, params);
            break;
            
        // For now, all other styles will fall back to the default masterpiece style
        // as we're focusing on the default style that combines all elements
        default:
            drawDefaultMasterpiece(ctx, palette, isAnimationFrame, params);
            break;
    }
}

/**
 * Get the display name for an art style
 * @param {string} style - The art style
 * @returns {string} The display name
 */
export function getStyleDisplayName(style) {
    switch (style) {
        case artStyles.DEFAULT:
            return "Default Masterpiece";
        case artStyles.VORONOI_CELLS:
            return "Voronoi Cells";
        case artStyles.ORGANIC_SPLATTERS:
            return "Organic Splatters";
        case artStyles.NEON_WAVES:
            return "Neon Waves";
        case artStyles.FRACTAL_LINES:
            return "Fractal Lines";
        case artStyles.GEOMETRIC_GRID:
            return "Geometric Grid";
        case artStyles.PARTICLE_SWARM:
            return "Particle Swarm";
        case artStyles.ORGANIC_NOISE:
            return "Organic Noise";
        case artStyles.GLITCH_MOSAIC:
            return "Glitch Mosaic";
        case artStyles.PIXEL_SORT:
            return "Pixel Sort";
        case artStyles.DOT_MATRIX:
            return "Dot Matrix";
        case artStyles.FLOWING_LINES:
            return "Flowing Lines";
        case artStyles.SYMMETRICAL_PATTERNS:
            return "Symmetrical Patterns";
        default:
            return "Unknown Style";
    }
}

/**
 * Get a list of all available art styles with their display names
 * @returns {Array<Object>} Array of style objects with id and name properties
 */
export function getAllStyles() {
    return Object.values(artStyles).map(style => ({
        id: style,
        name: getStyleDisplayName(style)
    }));
}
