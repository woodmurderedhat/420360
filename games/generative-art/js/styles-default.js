/**
 * styles-default.js - Default masterpiece art style for the Generative Art Studio
 * Combines elements from all other art styles into one harmonious masterpiece
 */

// Import implemented layer rendering functions
import { drawVoronoiCellsLayer } from './layers/voronoi.js';
import { drawOrganicSplattersLayer } from './layers/organic-splatters.js';
import { drawNeonWavesLayer } from './layers/neon-waves.js';
import { drawFractalLinesLayer } from './layers/fractal-lines.js';
import { drawGeometricGridLayer } from './layers/geometric-grid.js';
import { drawParticleSwarmLayer } from './layers/particle-swarm.js';
import { drawOrganicNoiseLayer } from './layers/organic-noise.js';

// TODO: The following layers are defined in state.js but not yet implemented
// These will be implemented in future updates:
// - glitch-mosaic.js: Digital glitch effects and mosaic patterns
// - pixel-sort.js: Pixel sorting algorithms for interesting visual effects
// - gradient-overlay.js: Gradient overlay effects
// - dot-matrix.js: Dot matrix patterns reminiscent of old printers
// - texture-overlay.js: Texture overlay effects
// - symmetrical-patterns.js: Symmetrical and mandala-like patterns
// - flowing-lines.js: Flowing, organic line patterns

/**
 * Draw the Default Masterpiece style - combines all other art styles
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, opacities, densities, etc. from appState)
 */
function drawDefaultMasterpiece(ctx, palette, isAnimationFrame = false, params = {}) {
    // Extract only the parameters we need from the params object
    const {
        canvasWidth, canvasHeight, seed,
        voronoiOpacity = 0,
        organicSplattersOpacity = 0,
        neonWavesOpacity = 0,
        fractalLinesOpacity = 0,
        geometricGridOpacity = 0,
        particleSwarmOpacity = 0,
        organicNoiseOpacity = 0,
        // The following are not yet implemented but defined in state.js
        // glitchMosaicOpacity = 0,
        // pixelSortOpacity = 0,
        // gradientOverlayOpacity = 0,
        // dotMatrixOpacity = 0,
        // textureOverlayOpacity = 0,
        // symmetricalPatternsOpacity = 0,
        // flowingLinesOpacity = 0
    } = params;

    // Helper to create layer-specific params
    const createLayerParams = (densityProperty) => ({
        canvasWidth,
        canvasHeight,
        seed, // Pass global seed, layers can use it if needed
        lineWidth: params.lineWidth || 1, // Pass global lineWidth with default
        [densityProperty]: params[densityProperty] || 50 // Default density to 50 if not provided
    });

    // Draw Voronoi Cells Layer
    if (voronoiOpacity > 0 && typeof drawVoronoiCellsLayer === 'function') {
        drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, createLayerParams('voronoiDensity'), voronoiOpacity);
    }

    // Draw Organic Splatters Layer
    if (organicSplattersOpacity > 0 && typeof drawOrganicSplattersLayer === 'function') {
        drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, createLayerParams('organicSplattersDensity'), organicSplattersOpacity);
    }

    // Draw Neon Waves Layer
    if (neonWavesOpacity > 0 && typeof drawNeonWavesLayer === 'function') {
        drawNeonWavesLayer(ctx, palette, isAnimationFrame, createLayerParams('neonWavesDensity'), neonWavesOpacity);
    }

    // Draw Fractal Lines Layer
    if (fractalLinesOpacity > 0 && typeof drawFractalLinesLayer === 'function') {
        const fractalParams = {
            ...createLayerParams('fractalLinesDensity'),
            lineWidth: params.lineWidth // Ensure fractal lines also get lineWidth if it's separate or uses global
        };
        drawFractalLinesLayer(ctx, palette, isAnimationFrame, fractalParams, fractalLinesOpacity);
    }

    // Draw Geometric Grid Layer
    if (geometricGridOpacity > 0 && typeof drawGeometricGridLayer === 'function') {
        drawGeometricGridLayer(ctx, palette, isAnimationFrame, createLayerParams('geometricGridDensity'), geometricGridOpacity);
    }

    // Draw Particle Swarm Layer
    if (particleSwarmOpacity > 0 && typeof drawParticleSwarmLayer === 'function') {
        drawParticleSwarmLayer(ctx, palette, isAnimationFrame, createLayerParams('particleSwarmDensity'), particleSwarmOpacity);
    }

    // Draw Organic Noise Layer
    if (organicNoiseOpacity > 0 && typeof drawOrganicNoiseLayer === 'function') {
        drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, createLayerParams('organicNoiseDensity'), organicNoiseOpacity);
    }

    // TODO: Add calls for other layers (Glitch Mosaic, Pixel Sort, etc.)
    // following the same pattern once their modules and drawing functions are available and imported.

    // ... (calls for other layers like Dot Matrix, Flowing Lines, Symmetrical Patterns)

    // Layers like Gradient Overlay or Texture Overlay might not have "density"
    // and might take different parameters.
    // Example for Gradient Overlay:
    // if (params.gradientOverlayOpacity > 0 && typeof drawGradientOverlayLayer === 'function') {
    //     const gradientParams = { canvasWidth, canvasHeight, /* other relevant params */ };
    //     drawGradientOverlayLayer(ctx, palette, isAnimationFrame, gradientParams, params.gradientOverlayOpacity);
    // }
}

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
