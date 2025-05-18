/**
 * styles-default.js - Enhanced Default masterpiece art style for the Generative Art Studio
 * Combines elements from all other art styles into one harmonious masterpiece
 * with improved visual effects and composition
 */

// Import implemented layer rendering functions
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
import { drawLightRaysLayer } from './layers/light-rays.js';

// All layers have now been implemented with enhanced visual effects

/**
 * Draw the Enhanced Default Masterpiece style - combines all other art styles with improved visuals
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
        glitchMosaicOpacity = 0,
        pixelSortOpacity = 0,
        gradientOverlayOpacity = 0,
        dotMatrixOpacity = 0,
        textureOverlayOpacity = 0,
        symmetricalPatternsOpacity = 0,
        flowingLinesOpacity = 0,
        lightRaysOpacity = 0
    } = params;

    // Helper to create layer-specific params
    const createLayerParams = (densityProperty) => ({
        canvasWidth,
        canvasHeight,
        seed, // Pass global seed, layers can use it if needed
        lineWidth: params.lineWidth || 1, // Pass global lineWidth with default
        [densityProperty]: params[densityProperty] || 50, // Default density to 50 if not provided
        // Pass additional global parameters that might be needed by layers
        blendMode: params.blendMode || 'source-over',
        colorShiftAmount: params.colorShiftAmount || 0,
        scaleAmount: params.scaleAmount || 1.0,
        rotationAmount: params.rotationAmount || 0
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

    // Draw Glitch Mosaic Layer
    if (glitchMosaicOpacity > 0 && typeof drawGlitchMosaicLayer === 'function') {
        drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, createLayerParams('glitchMosaicDensity'), glitchMosaicOpacity);
    }

    // Draw Pixel Sort Layer
    if (pixelSortOpacity > 0 && typeof drawPixelSortLayer === 'function') {
        drawPixelSortLayer(ctx, palette, isAnimationFrame, createLayerParams('pixelSortDensity'), pixelSortOpacity);
    }

    // Draw Gradient Overlay Layer
    if (gradientOverlayOpacity > 0 && typeof drawGradientOverlayLayer === 'function') {
        const gradientParams = {
            canvasWidth,
            canvasHeight,
            seed,
            blendMode: params.blendMode || 'overlay'
        };
        drawGradientOverlayLayer(ctx, palette, isAnimationFrame, gradientParams, gradientOverlayOpacity);
    }

    // Draw Dot Matrix Layer
    if (dotMatrixOpacity > 0 && typeof drawDotMatrixLayer === 'function') {
        drawDotMatrixLayer(ctx, palette, isAnimationFrame, createLayerParams('dotMatrixDensity'), dotMatrixOpacity);
    }

    // Draw Texture Overlay Layer
    if (textureOverlayOpacity > 0 && typeof drawTextureOverlayLayer === 'function') {
        const textureParams = {
            ...createLayerParams('textureOverlayDensity'),
            blendMode: params.blendMode || 'overlay'
        };
        drawTextureOverlayLayer(ctx, palette, isAnimationFrame, textureParams, textureOverlayOpacity);
    }

    // Draw Symmetrical Patterns Layer
    if (symmetricalPatternsOpacity > 0 && typeof drawSymmetricalPatternsLayer === 'function') {
        drawSymmetricalPatternsLayer(ctx, palette, isAnimationFrame, createLayerParams('symmetricalPatternsDensity'), symmetricalPatternsOpacity);
    }

    // Draw Flowing Lines Layer
    if (flowingLinesOpacity > 0 && typeof drawFlowingLinesLayer === 'function') {
        const flowingParams = {
            ...createLayerParams('flowingLinesDensity'),
            lineWidth: params.lineWidth || 2
        };
        drawFlowingLinesLayer(ctx, palette, isAnimationFrame, flowingParams, flowingLinesOpacity);
    }

    // Draw Light Rays Layer (new dramatic lighting effect)
    if (lightRaysOpacity > 0 && typeof drawLightRaysLayer === 'function') {
        const lightRaysParams = {
            ...createLayerParams('lightRaysDensity'),
            lightRaysIntensity: params.lightRaysIntensity || 0.7,
            lightRaysDirection: params.lightRaysDirection || 0,
            lightRaysSpread: params.lightRaysSpread || 60,
            lightRaysColor: params.lightRaysColor || null
        };
        drawLightRaysLayer(ctx, palette, isAnimationFrame, lightRaysParams, lightRaysOpacity);
    }

    // All layers have now been implemented and integrated into the enhanced default masterpiece style
}

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
