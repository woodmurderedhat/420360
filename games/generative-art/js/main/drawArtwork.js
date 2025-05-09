/**
 * drawArtwork.js - Drawing functionality for the Generative Art Studio
 */

import { generatePalette } from '../palette.js';
import { 
    artStyles,
    drawGeometricGrid,
    drawOrganicNoise,
    drawFractalLines,
    drawParticleSwarm,
    drawOrganicSplatters,
    drawGlitchMosaic,
    drawNeonWaves,
    drawPixelSort,
    drawVoronoiCells
} from '../styles/index.js';
import { 
    canvas, 
    ctx, 
    backgroundColor, 
    lineWidth, 
    numShapes,
    colorTheme,
    baseHue,
    saturation,
    lightness
} from './state.js';

/**
 * Draw artwork based on the selected style
 * @param {string} style - The art style to draw
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function drawArtwork(style, showLoading = true) {
    // Show loading indicator for complex styles
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (showLoading && loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    // Use requestAnimationFrame to ensure loading indicator is displayed
    requestAnimationFrame(() => {
        try {
            // Get canvas dimensions
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            // Clear canvas and set background
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Apply global line width
            ctx.lineWidth = lineWidth;

            // Generate palette
            const palette = generatePalette(style, colorTheme, baseHue, saturation, lightness);

            // Common parameters for all styles
            const params = {
                width,
                height,
                lineWidth,
                numShapes
            };

            // Draw based on selected style
            switch (style) {
                case artStyles.GEOMETRIC_GRID:
                    drawGeometricGrid(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_NOISE:
                    drawOrganicNoise(ctx, palette, false, params);
                    break;
                case artStyles.FRACTAL_LINES:
                    drawFractalLines(ctx, palette, false, params);
                    break;
                case artStyles.PARTICLE_SWARM:
                    drawParticleSwarm(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_SPLATTERS:
                    drawOrganicSplatters(ctx, palette, false, params);
                    break;
                case artStyles.GLITCH_MOSAIC:
                    drawGlitchMosaic(ctx, palette, false, params);
                    break;
                case artStyles.NEON_WAVES:
                    drawNeonWaves(ctx, palette, false, params);
                    break;
                case artStyles.PIXEL_SORT:
                    drawPixelSort(ctx, palette, false, params);
                    break;
                case artStyles.VORONOI_CELLS:
                    drawVoronoiCells(ctx, palette, false, params);
                    break;
            }
        } catch (error) {
            console.error('Error drawing artwork:', error);
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    });
}

export { drawArtwork };
