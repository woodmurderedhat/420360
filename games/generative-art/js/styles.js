/**
 * styles.js - Art style definitions for the Generative Art Studio
 * Contains the art style constants and imports the style implementations
 */

// Import style implementations
import { drawDefaultMasterpiece } from './styles-default.js';
import { drawVoronoiCellsLayer } from './layers/voronoi.js';
import { drawOrganicSplattersLayer } from './layers/organic-splatters.js';
import { drawNeonWavesLayer } from './layers/neon-waves.js';
import { drawFractalLinesLayer } from './layers/fractal-lines.js';
import { drawGeometricGridLayer } from './layers/geometric-grid.js';
import { drawParticleSwarmLayer } from './layers/particle-swarm.js';
import { drawOrganicNoiseLayer } from './layers/organic-noise.js';
import { drawGlitchMosaicLayer } from './layers/glitch-mosaic.js';
import { drawPixelSortLayer } from './layers/pixel-sort.js';
import { drawGradientOverlayLayer } from './layers/gradient-overlay.js';
import { drawDotMatrixLayer } from './layers/dot-matrix.js';
import { drawTextureOverlayLayer } from './layers/texture-overlay.js';
import { drawSymmetricalPatternsLayer } from './layers/symmetrical-patterns.js';
import { drawFlowingLinesLayer } from './layers/flowing-lines.js';

// All art styles have now been implemented as separate modules

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
    GRADIENT_OVERLAY: 'gradient-overlay',
    DOT_MATRIX: 'dot-matrix',
    FLOWING_LINES: 'flowing-lines',
    SYMMETRICAL_PATTERNS: 'symmetrical-patterns',
    TEXTURE_OVERLAY: 'texture-overlay'
};

/**
 * Draw artwork in the selected style
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} style - The art style to draw
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, opacities, densities, etc. from appState)
 */
export function drawArtwork(ctx, style, palette, isAnimationFrame = false, params = {}) {
    // Default to the default style if the specified style doesn't exist
    if (!Object.values(artStyles).includes(style)) {
        style = artStyles.DEFAULT;
    }

    // Ensure params has all necessary properties from appState for individual styles too
    const {
        canvasWidth, canvasHeight, seed, lineWidth,
        // Layer specific params that might be used by individual styles
        voronoiDensity, organicSplattersDensity, neonWavesDensity, fractalLinesDensity,
        geometricGridDensity, particleSwarmDensity // Add others as needed
    } = params;

    // Helper to create layer-specific params, useful if individual styles are just single layers
    const createLayerParams = (densityProperty, densityValue) => ({
        canvasWidth,
        canvasHeight,
        seed,
        lineWidth,
        [densityProperty]: densityValue
    });

    // Draw the selected style
    switch (style) {
        case artStyles.DEFAULT:
            drawDefaultMasterpiece(ctx, palette, isAnimationFrame, params); // Pass all params
            break;
        case artStyles.VORONOI_CELLS:
            if (typeof drawVoronoiCellsLayer === 'function') {
                drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, createLayerParams('voronoiDensity', voronoiDensity), 1.0); // Full opacity for individual style
            }
            break;
        case artStyles.ORGANIC_SPLATTERS:
            if (typeof drawOrganicSplattersLayer === 'function') {
                drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, createLayerParams('organicSplattersDensity', organicSplattersDensity), 1.0);
            }
            break;
        case artStyles.NEON_WAVES:
            if (typeof drawNeonWavesLayer === 'function') {
                drawNeonWavesLayer(ctx, palette, isAnimationFrame, createLayerParams('neonWavesDensity', neonWavesDensity), 1.0);
            }
            break;
        case artStyles.FRACTAL_LINES:
            if (typeof drawFractalLinesLayer === 'function') {
                drawFractalLinesLayer(ctx, palette, isAnimationFrame, createLayerParams('fractalLinesDensity', fractalLinesDensity), 1.0);
            }
            break;
        case artStyles.GEOMETRIC_GRID:
            if (typeof drawGeometricGridLayer === 'function') {
                drawGeometricGridLayer(ctx, palette, isAnimationFrame, createLayerParams('geometricGridDensity', geometricGridDensity), 1.0);
            }
            break;
        case artStyles.PARTICLE_SWARM:
            if (typeof drawParticleSwarmLayer === 'function') {
                drawParticleSwarmLayer(ctx, palette, isAnimationFrame, createLayerParams('particleSwarmDensity', particleSwarmDensity), 1.0);
            }
            break;
        case artStyles.ORGANIC_NOISE:
            if (typeof drawOrganicNoiseLayer === 'function') {
                drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, createLayerParams('organicNoiseDensity', params.organicNoiseDensity || 50), 1.0);
            }
            break;
        case artStyles.GLITCH_MOSAIC:
            if (typeof drawGlitchMosaicLayer === 'function') {
                drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, createLayerParams('glitchMosaicDensity', params.glitchMosaicDensity || 50), 1.0);
            }
            break;
        case artStyles.PIXEL_SORT:
            if (typeof drawPixelSortLayer === 'function') {
                drawPixelSortLayer(ctx, palette, isAnimationFrame, createLayerParams('pixelSortDensity', params.pixelSortDensity || 50), 1.0);
            }
            break;
        case artStyles.GRADIENT_OVERLAY:
            if (typeof drawGradientOverlayLayer === 'function') {
                // Gradient overlay doesn't use density, so we pass a simpler params object
                const gradientParams = {
                    canvasWidth,
                    canvasHeight,
                    seed,
                    blendMode: params.blendMode || 'overlay'
                };
                drawGradientOverlayLayer(ctx, palette, isAnimationFrame, gradientParams, 1.0);
            }
            break;
        case artStyles.DOT_MATRIX:
            if (typeof drawDotMatrixLayer === 'function') {
                drawDotMatrixLayer(ctx, palette, isAnimationFrame, createLayerParams('dotMatrixDensity', params.dotMatrixDensity || 50), 1.0);
            }
            break;
        case artStyles.TEXTURE_OVERLAY:
            if (typeof drawTextureOverlayLayer === 'function') {
                const textureParams = {
                    canvasWidth,
                    canvasHeight,
                    seed,
                    textureOverlayDensity: params.textureOverlayDensity || 50,
                    blendMode: params.blendMode || 'overlay'
                };
                drawTextureOverlayLayer(ctx, palette, isAnimationFrame, textureParams, 1.0);
            }
            break;
        case artStyles.SYMMETRICAL_PATTERNS:
            if (typeof drawSymmetricalPatternsLayer === 'function') {
                drawSymmetricalPatternsLayer(ctx, palette, isAnimationFrame, createLayerParams('symmetricalPatternsDensity', params.symmetricalPatternsDensity || 50), 1.0);
            }
            break;
        case artStyles.FLOWING_LINES:
            if (typeof drawFlowingLinesLayer === 'function') {
                const flowingParams = {
                    ...createLayerParams('flowingLinesDensity', params.flowingLinesDensity || 50),
                    lineWidth: params.lineWidth || 2
                };
                drawFlowingLinesLayer(ctx, palette, isAnimationFrame, flowingParams, 1.0);
            }
            break;
        default:
            console.warn(`Art style "${style}" not yet implemented. Drawing default.`);
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
        case artStyles.DEFAULT: return 'Masterpiece';
        case artStyles.VORONOI_CELLS: return 'Voronoi Cells';
        case artStyles.ORGANIC_SPLATTERS: return 'Organic Splatters';
        case artStyles.NEON_WAVES: return 'Neon Waves';
        case artStyles.FRACTAL_LINES: return 'Fractal Lines';
        case artStyles.GEOMETRIC_GRID: return 'Geometric Grid';
        case artStyles.PARTICLE_SWARM: return 'Particle Swarm';
        case artStyles.ORGANIC_NOISE: return 'Organic Noise';
        case artStyles.GLITCH_MOSAIC: return 'Glitch Mosaic';
        case artStyles.PIXEL_SORT: return 'Pixel Sort';
        case artStyles.GRADIENT_OVERLAY: return 'Gradient Overlay';
        case artStyles.DOT_MATRIX: return 'Dot Matrix';
        case artStyles.FLOWING_LINES: return 'Flowing Lines';
        case artStyles.SYMMETRICAL_PATTERNS: return 'Symmetrical Patterns';
        case artStyles.TEXTURE_OVERLAY: return 'Texture Overlay';
        default:
            return style.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
