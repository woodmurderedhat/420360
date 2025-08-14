/**
 * js/layers/landscape.js - Landscape layer for the Generative Art Studio
 * Creates procedurally generated landscapes using combinations of other layers
 */

import { createRandomFunction } from '../utils.js';
import { drawGradientOverlayLayer } from './gradient-overlay.js';
import { drawOrganicNoiseLayer } from './organic-noise.js';
import { drawFlowingLinesLayer } from './flowing-lines.js';
import { drawLightRaysLayer } from './light-rays.js';
import { drawNeonWavesLayer } from './neon-waves.js';
import { drawVoronoiCellsLayer } from './voronoi.js';
import { drawOrganicSplattersLayer } from './organic-splatters.js';

/**
 * Draw a Landscape layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawLandscapeLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const {
        canvasWidth,
        canvasHeight,
        seed,
        landscapeType = 'mountain', // mountain, desert, ocean, forest
        timeOfDay = 'day', // day, sunset, night, dawn
        landscapeComplexity = 50, // 0-100
        weatherCondition = 'clear' // clear, cloudy, foggy, stormy
    } = params;

    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Divide the canvas into sections (sky, mountains, foreground)
    const horizonLine = canvasHeight * (0.4 + randomFn() * 0.2); // 40-60% from top

    // Create a landscape-specific palette by organizing the input palette
    const landscapePalette = organizePalette(palette, landscapeType, timeOfDay, randomFn);

    // Draw sky
    drawSky(ctx, landscapePalette.sky, isAnimationFrame, {
        canvasWidth,
        canvasHeight,
        horizonLine,
        seed: seedValue,
        timeOfDay,
        weatherCondition
    }, 1.0);

    // Draw distant mountains/terrain
    drawDistantTerrain(ctx, landscapePalette.distant, isAnimationFrame, {
        canvasWidth,
        canvasHeight,
        horizonLine,
        seed: seedValue + 1,
        landscapeType,
        complexity: landscapeComplexity * 0.5 // Less complex for distant terrain
    }, 1.0);

    // Draw mid-ground terrain
    drawMidgroundTerrain(ctx, landscapePalette.midground, isAnimationFrame, {
        canvasWidth,
        canvasHeight,
        horizonLine,
        seed: seedValue + 2,
        landscapeType,
        complexity: landscapeComplexity * 0.8
    }, 1.0);

    // Draw foreground terrain
    drawForegroundTerrain(ctx, landscapePalette.foreground, isAnimationFrame, {
        canvasWidth,
        canvasHeight,
        horizonLine,
        seed: seedValue + 3,
        landscapeType,
        complexity: landscapeComplexity
    }, 1.0);

    // Add atmospheric effects based on weather condition
    if (weatherCondition !== 'clear') {
        drawAtmosphericEffects(ctx, landscapePalette.atmosphere, isAnimationFrame, {
            canvasWidth,
            canvasHeight,
            seed: seedValue + 4,
            weatherCondition,
            timeOfDay
        }, 0.7);
    }

    // Add lighting effects based on time of day
    drawLightingEffects(ctx, landscapePalette.light, isAnimationFrame, {
        canvasWidth,
        canvasHeight,
        seed: seedValue + 5,
        timeOfDay,
        weatherCondition
    }, 0.8);

    // Restore the context state
    ctx.restore();
}

/**
 * Organize the palette into landscape-specific color groups
 * @param {Array<string>} palette - The original color palette
 * @param {string} landscapeType - Type of landscape
 * @param {string} timeOfDay - Time of day
 * @param {Function} randomFn - Seeded random function
 * @returns {Object} Organized palette with color groups
 */
function organizePalette(palette, landscapeType, timeOfDay, randomFn) {
    // Make sure we have enough colors
    if (palette.length < 5) {
        // Duplicate colors if we don't have enough
        while (palette.length < 5) {
            palette.push(palette[randomFn() * palette.length | 0]);
        }
    }

    // Shuffle the palette to get more random combinations
    const shuffled = [...palette].sort(() => randomFn() - 0.5);

    // Organize into landscape-specific color groups
    return {
        sky: shuffled.slice(0, 2), // Sky colors (usually 2)
        distant: shuffled.slice(2, 4), // Distant terrain colors (usually 2)
        midground: shuffled.slice(4, 6 % shuffled.length), // Midground colors
        foreground: shuffled.slice(6 % shuffled.length, 8 % shuffled.length), // Foreground colors
        atmosphere: shuffled.slice(8 % shuffled.length, 9 % shuffled.length), // Atmospheric effect colors
        light: shuffled.slice(9 % shuffled.length, 10 % shuffled.length) // Light effect colors
    };
}

/**
 * Draw the sky portion of the landscape
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Sky color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawSky(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, horizonLine, timeOfDay, weatherCondition, seed } = params;

    // Create a clipping region for the sky
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, horizonLine);
    ctx.clip();

    // Create gradient parameters based on time of day
    const gradientParams = {
        canvasWidth,
        canvasHeight: horizonLine, // Only apply to sky portion
        seed,
        gradientType: 'linear',
        blendMode: 'source-over'
    };

    // Configure gradient direction based on time of day
    if (timeOfDay === 'dawn' || timeOfDay === 'sunset') {
        // Horizontal gradient for sunrise/sunset
        gradientParams.gradientDirection = 'horizontal';
    } else {
        // Vertical gradient for day/night
        gradientParams.gradientDirection = 'vertical';
    }

    // Draw gradient sky
    drawGradientOverlayLayer(ctx, palette, isAnimationFrame, gradientParams, opacity);

    // Add clouds if weather is cloudy or stormy
    if (weatherCondition === 'cloudy' || weatherCondition === 'stormy') {
        const cloudParams = {
            canvasWidth,
            canvasHeight: horizonLine,
            seed: seed + 1,
            voronoiDensity: weatherCondition === 'stormy' ? 70 : 40
        };

        // Use voronoi cells with low opacity for clouds
        ctx.globalAlpha = weatherCondition === 'stormy' ? 0.7 : 0.4;
        drawVoronoiCellsLayer(ctx, ['#ffffff', '#f0f0f0'], isAnimationFrame, cloudParams, 0.6);
    }

    // Add fog effect if weather is foggy
    if (weatherCondition === 'foggy') {
        const fogParams = {
            canvasWidth,
            canvasHeight: horizonLine,
            seed: seed + 2,
            organicNoiseDensity: 30
        };

        // Use organic noise with high opacity for fog
        ctx.globalAlpha = 0.7;
        drawOrganicNoiseLayer(ctx, ['#ffffff', '#f0f0f0'], isAnimationFrame, fogParams, 0.8);
    }

    // Add stars at night
    if (timeOfDay === 'night' && weatherCondition !== 'cloudy' && weatherCondition !== 'stormy') {
        const starParams = {
            canvasWidth,
            canvasHeight: horizonLine,
            seed: seed + 3,
            dotMatrixDensity: 80
        };

        // Use dot matrix with high opacity for stars
        ctx.globalAlpha = 0.8;
        drawDotMatrixLayer(ctx, ['#ffffff', '#ffffcc'], isAnimationFrame, starParams, 0.7);
    }

    ctx.restore();
}

/**
 * Draw distant terrain (mountains, hills, etc.)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Distant terrain color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawDistantTerrain(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, horizonLine, landscapeType, complexity, seed } = params;

    // Determine the height of the distant terrain based on landscape type
    let terrainHeight;
    switch (landscapeType) {
        case 'mountain':
            terrainHeight = canvasHeight * 0.25; // Tall mountains
            break;
        case 'forest':
            terrainHeight = canvasHeight * 0.15; // Medium hills with trees
            break;
        case 'desert':
            terrainHeight = canvasHeight * 0.1; // Low dunes
            break;
        case 'ocean':
            terrainHeight = canvasHeight * 0.05; // Very low distant islands
            break;
        default:
            terrainHeight = canvasHeight * 0.15;
    }

    // Create a clipping region for the distant terrain
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonLine - 10, canvasWidth, terrainHeight);
    ctx.clip();

    // Draw the distant terrain silhouette
    if (landscapeType === 'mountain') {
        // Draw jagged mountain peaks
        drawMountainSilhouette(ctx, palette, horizonLine, canvasWidth, terrainHeight, seed, complexity);
    } else {
        // Use organic noise for other terrain types
        const terrainParams = {
            canvasWidth,
            canvasHeight,
            seed,
            organicNoiseDensity: 30 + (complexity * 0.3)
        };

        drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, terrainParams, opacity * 0.8);

        // Add a defined horizon line
        ctx.fillStyle = palette[0] || '#000000';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, horizonLine - 2, canvasWidth, 4);
    }

    ctx.restore();
}

/**
 * Draw mountain silhouette with peaks
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Color palette
 * @param {number} horizonLine - Y-coordinate of horizon line
 * @param {number} width - Canvas width
 * @param {number} height - Mountain height
 * @param {number} seed - Random seed
 * @param {number} complexity - Complexity factor
 */
function drawMountainSilhouette(ctx, palette, horizonLine, width, height, seed, complexity) {
    // Create a seeded random function
    const randomFn = createRandomFunction(seed);

    // Determine number of mountain peaks based on complexity
    const numPeaks = Math.floor(3 + (complexity / 20)); // 3-8 peaks

    // Create mountain ranges with different distances
    const numRanges = 2 + Math.floor(randomFn() * 2); // 2-3 ranges

    for (let range = 0; range < numRanges; range++) {
        // Further ranges are lighter and less detailed
        const rangeDistance = range / numRanges; // 0 to almost 1
        const rangeHeight = height * (1 - rangeDistance * 0.7);
        const rangePeaks = Math.max(2, Math.floor(numPeaks * (1 - rangeDistance * 0.5)));
        const rangeColor = palette[range % palette.length];

        // Draw this mountain range
        ctx.fillStyle = rangeColor;
        ctx.beginPath();
        ctx.moveTo(0, horizonLine);

        // Generate points for the mountain silhouette
        const peakWidth = width / (rangePeaks - 1);

        for (let i = 0; i < rangePeaks; i++) {
            const x = i * peakWidth;

            // Peak height varies, with some peaks being much taller
            const peakFactor = (randomFn() < 0.3) ? 0.7 + randomFn() * 0.3 : 0.3 + randomFn() * 0.4;
            const y = horizonLine - rangeHeight * peakFactor;

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                // Add some smaller bumps between major peaks
                const prevX = (i - 1) * peakWidth;
                const bumpCount = 1 + Math.floor(randomFn() * 3); // 1-3 bumps

                for (let j = 1; j <= bumpCount; j++) {
                    const bumpX = prevX + (peakWidth * j / (bumpCount + 1));
                    const bumpHeight = rangeHeight * (0.1 + randomFn() * 0.2);
                    const bumpY = horizonLine - bumpHeight;

                    // Use quadratic curves for smoother mountains
                    const controlX = bumpX - peakWidth / (bumpCount + 1) / 2;
                    const controlY = bumpY - bumpHeight * randomFn() * 0.5;

                    ctx.quadraticCurveTo(controlX, controlY, bumpX, bumpY);
                }

                // Add the main peak
                const controlX = x - peakWidth / 4;
                const controlY = y - rangeHeight * 0.1 * randomFn();
                ctx.quadraticCurveTo(controlX, controlY, x, y);
            }
        }

        // Complete the mountain silhouette
        ctx.lineTo(width, horizonLine);
        ctx.closePath();
        ctx.fill();

        // Add snow caps to tall mountains if it's a mountain landscape
        if (range === 0 && rangeHeight > height * 0.7) {
            drawSnowCaps(ctx, horizonLine, width, rangeHeight, rangePeaks, peakWidth, seed + 100);
        }
    }
}

/**
 * Draw snow caps on mountain peaks
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} horizonLine - Y-coordinate of horizon line
 * @param {number} width - Canvas width
 * @param {number} height - Mountain height
 * @param {number} peaks - Number of peaks
 * @param {number} peakWidth - Width between peaks
 * @param {number} seed - Random seed
 */
function drawSnowCaps(ctx, horizonLine, width, height, peaks, peakWidth, seed) {
    const randomFn = createRandomFunction(seed);

    // Draw snow with semi-transparent white
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let i = 0; i < peaks; i++) {
        const x = i * peakWidth;

        // Only add snow to some of the tallest peaks
        if (randomFn() < 0.7) {
            const peakHeight = height * (0.7 + randomFn() * 0.3);
            const snowHeight = peakHeight * (0.1 + randomFn() * 0.2);
            const snowY = horizonLine - peakHeight;

            // Draw a small triangle of snow
            ctx.beginPath();
            ctx.moveTo(x - peakWidth * 0.2, snowY + snowHeight);
            ctx.lineTo(x, snowY);
            ctx.lineTo(x + peakWidth * 0.2, snowY + snowHeight);
            ctx.closePath();
            ctx.fill();
        }
    }
}

/**
 * Draw midground terrain
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Midground color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawMidgroundTerrain(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, horizonLine, landscapeType, complexity, seed } = params;

    // Create a clipping region for the midground
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonLine, canvasWidth, canvasHeight * 0.3);
    ctx.clip();

    // Use flowing lines for terrain features
    const terrainParams = {
        canvasWidth,
        canvasHeight,
        seed,
        flowingLinesDensity: 20 + (complexity * 0.4)
    };

    drawFlowingLinesLayer(ctx, palette, isAnimationFrame, terrainParams, opacity * 0.9);

    ctx.restore();
}

/**
 * Draw foreground terrain
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Foreground color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawForegroundTerrain(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, horizonLine, landscapeType, complexity, seed } = params;

    // Create a clipping region for the foreground
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonLine + canvasHeight * 0.3, canvasWidth, canvasHeight * 0.7);
    ctx.clip();

    // Use organic splatters for detailed foreground elements
    const terrainParams = {
        canvasWidth,
        canvasHeight,
        seed,
        organicSplattersDensity: 40 + (complexity * 0.6)
    };

    drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, terrainParams, opacity);

    ctx.restore();
}

/**
 * Draw atmospheric effects (rain, fog, etc.)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Atmosphere color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawAtmosphericEffects(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, weatherCondition, timeOfDay, seed } = params;

    if (weatherCondition === 'stormy') {
        // Use neon waves for rain
        const rainParams = {
            canvasWidth,
            canvasHeight,
            seed,
            neonWavesDensity: 70
        };

        drawNeonWavesLayer(ctx, palette, isAnimationFrame, rainParams, opacity * 0.6);
    } else if (weatherCondition === 'foggy') {
        // Add additional fog layer over entire scene
        const fogParams = {
            canvasWidth,
            canvasHeight,
            seed,
            organicNoiseDensity: 20
        };

        drawOrganicNoiseLayer(ctx, ['#ffffff', '#f0f0f0'], isAnimationFrame, fogParams, opacity * 0.5);
    }
}

/**
 * Draw lighting effects based on time of day
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - Light color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the layer
 */
function drawLightingEffects(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, timeOfDay, weatherCondition, seed } = params;

    // Skip lighting effects if it's stormy
    if (weatherCondition === 'stormy') return;

    // Configure light rays based on time of day
    let lightDirection = 0;
    let lightIntensity = 0.5;
    let lightColor = null;

    switch (timeOfDay) {
        case 'dawn':
            lightDirection = 90; // From right
            lightIntensity = 0.6;
            lightColor = palette[0] || '#ffb347'; // Orange-ish
            break;
        case 'day':
            lightDirection = 0; // From top
            lightIntensity = 0.4;
            lightColor = palette[0] || '#ffffff'; // White
            break;
        case 'sunset':
            lightDirection = 270; // From left
            lightIntensity = 0.7;
            lightColor = palette[0] || '#ff7e5f'; // Orange-red
            break;
        case 'night':
            lightDirection = 180; // From bottom
            lightIntensity = 0.3;
            lightColor = palette[0] || '#4b6cb7'; // Blue-ish
            break;
    }

    // Add light rays
    const lightParams = {
        canvasWidth,
        canvasHeight,
        seed,
        lightRaysDirection: lightDirection,
        lightRaysIntensity: lightIntensity,
        lightRaysSpread: 60,
        lightRaysColor: lightColor
    };

    // Reduce opacity for night
    const lightOpacity = timeOfDay === 'night' ? opacity * 0.4 : opacity;

    drawLightRaysLayer(ctx, palette, isAnimationFrame, lightParams, lightOpacity);
}
