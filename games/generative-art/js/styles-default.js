/**
 * styles-default.js - Default masterpiece art style for the Generative Art Studio
 * Combines elements from all other art styles into one harmonious masterpiece
 */

import { randomRange, randomInt } from './utils.js';
// import { generateVoronoiCells } from './worker-manager.js'; // This will be handled by the voronoi.js module if needed
import { initWebGL, isWebGLAvailable, renderParticles, renderGradient } from './webgl-renderer.js';

// Import layer rendering functions from their new modules
import { drawVoronoiCellsLayer } from './layers/voronoi.js';
import { drawOrganicSplattersLayer } from './layers/organic-splatters.js';
import { drawNeonWavesLayer } from './layers/neon-waves.js';
import { drawFractalLinesLayer } from './layers/fractal-lines.js';
// TODO: Import other layer functions as they are created (e.g., geometric-grid, particle-swarm)

/**
 * Draw the Default Masterpiece style - combines all other art styles
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawDefaultMasterpiece(ctx, palette, isAnimationFrame = false, params = {}) {
    const {
        width, // canvasWidth for new layer functions
        height, // canvasHeight for new layer functions
        frameCount = 0,
        mouseX = 0,
        mouseY = 0,
        isInteractive = false,
        backgroundColor = 'rgb(10, 10, 15)',
        colorTheme = 'random',
        baseHue = 180,
        saturation = 70,
        lightness = 50,
        // Layer opacity settings
        voronoiOpacity = 0.4,
        organicSplattersOpacity = 0.3,
        neonWavesOpacity = 0.6,
        fractalLinesOpacity = 0.7,
        geometricGridOpacity = 0.6,
        particleSwarmOpacity = 0.5,
        organicNoiseOpacity = 0.3,
        glitchMosaicOpacity = 0.15,
        pixelSortOpacity = 0.2,
        gradientOverlayOpacity = 0.3,
        dotMatrixOpacity = 0.4,
        textureOverlayOpacity = 0.2,
        symmetricalPatternsOpacity = 0.5,
        flowingLinesOpacity = 0.4,
        // Layer density settings
        voronoiDensity = 15,
        organicSplattersDensity = 10,
        neonWavesDensity = 5,
        fractalLinesDensity = 2,
        dotMatrixDensity = 20,
        flowingLinesDensity = 8,
        symmetricalPatternsDensity = 6,
        // Other params from original file
        seed, // Make sure seed is passed if needed by layers like Voronoi
        lineWidth, // Make sure lineWidth is passed for layers like Fractal Lines
        blendMode = 'source-over',
        colorShiftAmount = 0,
        scaleAmount = 1.0,
        rotationAmount = 0,
        dynamicElementsOnly = false,
        qualityLevel = 1.0
    } = params;

    // Create a layered composition by applying multiple styles with opacity from UI settings

    // Only draw background if we're not in dynamic-only mode
    if (!dynamicElementsOnly) {
        // 1. Use background color from UI settings if available, otherwise use dark background for contrast
        ctx.fillStyle = backgroundColor !== '#ffffff' ? backgroundColor : 'rgb(10, 10, 15)';
        ctx.fillRect(0, 0, width, height);
    }

    // Helper function to determine if a layer should be drawn in the current pass
    const shouldDrawLayer = (isLayerDynamic, opacity) => {
        // Skip layers with zero opacity
        if (opacity <= 0) return false;

        // If we're drawing only dynamic elements, skip static layers
        if (dynamicElementsOnly && !isLayerDynamic) return false;

        // If we're drawing only static elements, skip dynamic layers
        if (!dynamicElementsOnly && isAnimationFrame && isLayerDynamic) return false;

        return true;
    };

    // 2. Add Voronoi Cells as a base layer - mostly static with slight animation
    const isVoronoiDynamic = isAnimationFrame && (isInteractive || frameCount > 0);
    if (shouldDrawLayer(isVoronoiDynamic, voronoiOpacity)) {
        const layerParams = { ...params, canvasWidth: width, canvasHeight: height, seed: seed || 'defaultSeed', voronoiDensity };
        drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, layerParams, voronoiOpacity);
    }

    // 3. Add Organic Splatters for color blobs - mostly static with slight animation
    const isOrganicSplattersDynamic = isAnimationFrame && (isInteractive || frameCount > 0);
    if (shouldDrawLayer(isOrganicSplattersDynamic, organicSplattersOpacity)) {
        const layerParams = { ...params, canvasWidth: width, canvasHeight: height, organicSplattersDensity };
        drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, layerParams, organicSplattersOpacity);
    }

    // 4. Add Neon Waves for glowing elements - highly dynamic with animation
    const isNeonWavesDynamic = isAnimationFrame;
    if (shouldDrawLayer(isNeonWavesDynamic, neonWavesOpacity)) {
        const layerParams = { ...params, canvasWidth: width, canvasHeight: height, neonWavesDensity };
        drawNeonWavesLayer(ctx, palette, isAnimationFrame, layerParams, neonWavesOpacity);
    }

    // 5. Add Fractal Lines for structure - moderately dynamic with animation
    const isFractalLinesDynamic = isAnimationFrame && (isInteractive || frameCount % 3 === 0);
    if (shouldDrawLayer(isFractalLinesDynamic, fractalLinesOpacity)) {
        const layerParams = { ...params, canvasWidth: width, canvasHeight: height, fractalLinesDensity, lineWidth: lineWidth };
        drawFractalLinesLayer(ctx, palette, isAnimationFrame, layerParams, fractalLinesOpacity);
    }

    // 6. Add Geometric Grid elements for balance - mostly static with slight animation
    const isGeometricGridDynamic = isAnimationFrame && (isInteractive || frameCount % 5 === 0);
    if (shouldDrawLayer(isGeometricGridDynamic, geometricGridOpacity)) {
        drawGeometricGridLayer(ctx, palette, isAnimationFrame, params, geometricGridOpacity);
    }

    // 7. Add Particle Swarm for movement - highly dynamic with animation
    const isParticleSwarmDynamic = isAnimationFrame;
    if (shouldDrawLayer(isParticleSwarmDynamic, particleSwarmOpacity)) {
        drawParticleSwarmLayer(ctx, palette, isAnimationFrame, params, particleSwarmOpacity);
    }

    // 8. Add subtle Organic Noise for texture - moderately dynamic with animation
    const isOrganicNoiseDynamic = isAnimationFrame && (isInteractive || frameCount % 4 === 0);
    if (shouldDrawLayer(isOrganicNoiseDynamic, organicNoiseOpacity)) {
        drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, params, organicNoiseOpacity);
    }

    // 9. Add Glitch Mosaic effects for contemporary feel - highly dynamic with animation
    const isGlitchMosaicDynamic = isAnimationFrame;
    if (shouldDrawLayer(isGlitchMosaicDynamic, glitchMosaicOpacity)) {
        drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, params, glitchMosaicOpacity);
    }

    // 10. Add Pixel Sort effects for digital aesthetic - mostly static with occasional changes
    const isPixelSortDynamic = isAnimationFrame && (isInteractive || frameCount % 10 === 0);
    if (shouldDrawLayer(isPixelSortDynamic, pixelSortOpacity)) {
        drawPixelSortLayer(ctx, palette, isAnimationFrame, params, pixelSortOpacity);
    }

    // 11. Add Gradient Overlay for depth and color transitions - moderately dynamic with animation
    const isGradientOverlayDynamic = isAnimationFrame && (isInteractive || frameCount % 6 === 0);
    if (shouldDrawLayer(isGradientOverlayDynamic, gradientOverlayOpacity)) {
        drawGradientOverlayLayer(ctx, palette, isAnimationFrame, params, gradientOverlayOpacity);
    }

    // 12. Add Dot Matrix for pattern and texture - moderately dynamic with animation
    const isDotMatrixDynamic = isAnimationFrame && (isInteractive || frameCount % 3 === 0);
    if (shouldDrawLayer(isDotMatrixDynamic, dotMatrixOpacity)) {
        const dotMatrixParams = { ...params, layerDensity: dotMatrixDensity };
        drawDotMatrixLayer(ctx, palette, isAnimationFrame, dotMatrixParams, dotMatrixOpacity);
    }

    // 13. Add Texture Overlay for a gritty or paper-like feel - static
    const isTextureOverlayDynamic = false;
    if (shouldDrawLayer(isTextureOverlayDynamic, textureOverlayOpacity)) {
        drawTextureOverlayLayer(ctx, palette, isAnimationFrame, params, textureOverlayOpacity);
    }

    // 14. Add Symmetrical Patterns for balance and structure - moderately dynamic with animation
    const isSymmetricalPatternsDynamic = isAnimationFrame && (isInteractive || frameCount % 5 === 0);
    if (shouldDrawLayer(isSymmetricalPatternsDynamic, symmetricalPatternsOpacity)) {
        const symmetricalParams = { ...params, layerDensity: symmetricalPatternsDensity };
        drawSymmetricalPatternsLayer(ctx, palette, isAnimationFrame, symmetricalParams, symmetricalPatternsOpacity);
    }

    // 15. Add Flowing Lines for movement and flow - highly dynamic with animation
    const isFlowingLinesDynamic = isAnimationFrame;
    if (shouldDrawLayer(isFlowingLinesDynamic, flowingLinesOpacity)) {
        const flowingLinesParams = { ...params, layerDensity: flowingLinesDensity };
        drawFlowingLinesLayer(ctx, palette, isAnimationFrame, flowingLinesParams, flowingLinesOpacity);
    }

    // Reset composite operation and global alpha
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
}

// The following functions have been moved to their respective files in the js/layers/ directory
// and are now imported at the top of this file.
// Their original definitions are removed from here.

// /**
//  * Draw a reduced Voronoi Cells layer
//  */
// function drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) { ... } // REMOVED

// /**
//  * Draw a reduced Organic Splatters layer
//  */
// function drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) { ... } // REMOVED

// /**
//  * Draw a reduced Neon Waves layer
//  */
// function drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) { ... } // REMOVED

// /**
//  * Draw a reduced Fractal Lines layer
//  */
// function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) { ... } // REMOVED

// /**
//  * Helper function for fractal lines
//  */
// function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, color, palette) { ... } // REMOVED

/**
 * Draw a reduced Geometric Grid layer
 */
// ...existing code...

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
