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

    // Helper to create layer-specific params with randomized variations
    const createLayerParams = (densityProperty) => {
        // Add random variations to parameters for more diverse results
        const randomVariation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
        const randomRotation = Math.random() * 360; // Random rotation angle
        const randomScale = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 scale factor
        const randomColorShift = Math.random() * 60 - 30; // -30 to +30 color shift

        return {
            canvasWidth,
            canvasHeight,
            seed, // Pass global seed, layers can use it if needed
            lineWidth: (params.lineWidth || 1) * randomVariation, // Randomize line width
            [densityProperty]: (params[densityProperty] || 50) * randomVariation, // Randomize density
            // Pass additional global parameters with random variations
            blendMode: params.blendMode || 'source-over',
            colorShiftAmount: (params.colorShiftAmount || 0) + randomColorShift,
            scaleAmount: (params.scaleAmount || 1.0) * randomScale,
            rotationAmount: (params.rotationAmount || 0) + randomRotation,
            // Add more random parameters for layers to use
            randomFactor: Math.random(), // Generic random factor layers can use
            noiseScale: Math.random() * 0.1 + 0.01, // Random noise scale
            distortionAmount: Math.random() * 0.2 // Random distortion amount
        };
    };

    // Create an array of layer drawing functions with their parameters
    const layers = [];

    // Add each layer to the array if its opacity is > 0
    if (voronoiOpacity > 0 && typeof drawVoronoiCellsLayer === 'function') {
        layers.push({
            draw: drawVoronoiCellsLayer,
            params: createLayerParams('voronoiDensity'),
            opacity: voronoiOpacity,
            zIndex: Math.random() // Random z-index for layer ordering
        });
    }

    if (organicSplattersOpacity > 0 && typeof drawOrganicSplattersLayer === 'function') {
        layers.push({
            draw: drawOrganicSplattersLayer,
            params: createLayerParams('organicSplattersDensity'),
            opacity: organicSplattersOpacity,
            zIndex: Math.random()
        });
    }

    if (neonWavesOpacity > 0 && typeof drawNeonWavesLayer === 'function') {
        layers.push({
            draw: drawNeonWavesLayer,
            params: createLayerParams('neonWavesDensity'),
            opacity: neonWavesOpacity,
            zIndex: Math.random()
        });
    }

    if (fractalLinesOpacity > 0 && typeof drawFractalLinesLayer === 'function') {
        const fractalParams = {
            ...createLayerParams('fractalLinesDensity'),
            lineWidth: params.lineWidth * (Math.random() * 0.5 + 0.75) // Randomize line width
        };
        layers.push({
            draw: drawFractalLinesLayer,
            params: fractalParams,
            opacity: fractalLinesOpacity,
            zIndex: Math.random()
        });
    }

    if (geometricGridOpacity > 0 && typeof drawGeometricGridLayer === 'function') {
        layers.push({
            draw: drawGeometricGridLayer,
            params: createLayerParams('geometricGridDensity'),
            opacity: geometricGridOpacity,
            zIndex: Math.random()
        });
    }

    if (particleSwarmOpacity > 0 && typeof drawParticleSwarmLayer === 'function') {
        layers.push({
            draw: drawParticleSwarmLayer,
            params: createLayerParams('particleSwarmDensity'),
            opacity: particleSwarmOpacity,
            zIndex: Math.random()
        });
    }

    if (organicNoiseOpacity > 0 && typeof drawOrganicNoiseLayer === 'function') {
        layers.push({
            draw: drawOrganicNoiseLayer,
            params: createLayerParams('organicNoiseDensity'),
            opacity: organicNoiseOpacity,
            zIndex: Math.random()
        });
    }

    if (glitchMosaicOpacity > 0 && typeof drawGlitchMosaicLayer === 'function') {
        layers.push({
            draw: drawGlitchMosaicLayer,
            params: createLayerParams('glitchMosaicDensity'),
            opacity: glitchMosaicOpacity,
            zIndex: Math.random()
        });
    }

    if (pixelSortOpacity > 0 && typeof drawPixelSortLayer === 'function') {
        layers.push({
            draw: drawPixelSortLayer,
            params: createLayerParams('pixelSortDensity'),
            opacity: pixelSortOpacity,
            zIndex: Math.random()
        });
    }

    if (gradientOverlayOpacity > 0 && typeof drawGradientOverlayLayer === 'function') {
        const gradientParams = {
            canvasWidth,
            canvasHeight,
            seed,
            blendMode: params.blendMode || 'overlay',
            gradientType: Math.random() < 0.5 ? 'radial' : 'linear', // Randomize gradient type
            gradientAngle: Math.random() * 360 // Random angle for linear gradients
        };
        layers.push({
            draw: drawGradientOverlayLayer,
            params: gradientParams,
            opacity: gradientOverlayOpacity,
            zIndex: Math.random()
        });
    }

    if (dotMatrixOpacity > 0 && typeof drawDotMatrixLayer === 'function') {
        layers.push({
            draw: drawDotMatrixLayer,
            params: createLayerParams('dotMatrixDensity'),
            opacity: dotMatrixOpacity,
            zIndex: Math.random()
        });
    }

    if (textureOverlayOpacity > 0 && typeof drawTextureOverlayLayer === 'function') {
        const textureParams = {
            ...createLayerParams('textureOverlayDensity'),
            blendMode: params.blendMode || 'overlay',
            textureType: Math.floor(Math.random() * 5) // Random texture type
        };
        layers.push({
            draw: drawTextureOverlayLayer,
            params: textureParams,
            opacity: textureOverlayOpacity,
            zIndex: Math.random()
        });
    }

    if (symmetricalPatternsOpacity > 0 && typeof drawSymmetricalPatternsLayer === 'function') {
        layers.push({
            draw: drawSymmetricalPatternsLayer,
            params: createLayerParams('symmetricalPatternsDensity'),
            opacity: symmetricalPatternsOpacity,
            zIndex: Math.random()
        });
    }

    if (flowingLinesOpacity > 0 && typeof drawFlowingLinesLayer === 'function') {
        const flowingParams = {
            ...createLayerParams('flowingLinesDensity'),
            lineWidth: params.lineWidth * (Math.random() * 0.5 + 0.75) // Randomize line width
        };
        layers.push({
            draw: drawFlowingLinesLayer,
            params: flowingParams,
            opacity: flowingLinesOpacity,
            zIndex: Math.random()
        });
    }

    if (lightRaysOpacity > 0 && typeof drawLightRaysLayer === 'function') {
        const lightRaysParams = {
            ...createLayerParams('lightRaysDensity'),
            lightRaysIntensity: Math.random() * 0.5 + 0.5, // Random intensity between 0.5 and 1.0
            lightRaysDirection: Math.random() * 360, // Random direction
            lightRaysSpread: Math.random() * 90 + 30, // Random spread between 30 and 120
            lightRaysColor: Math.random() < 0.7 ? null : palette[Math.floor(Math.random() * palette.length)] // Sometimes use a specific color
        };
        layers.push({
            draw: drawLightRaysLayer,
            params: lightRaysParams,
            opacity: lightRaysOpacity,
            zIndex: Math.random()
        });
    }

    // Sort layers by z-index to randomize drawing order
    layers.sort((a, b) => a.zIndex - b.zIndex);

    // Draw layers in the randomized order
    layers.forEach(layer => {
        layer.draw(ctx, palette, isAnimationFrame, layer.params, layer.opacity);
    });

    // All layers have now been implemented and integrated into the enhanced default masterpiece style with randomized order
}

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
