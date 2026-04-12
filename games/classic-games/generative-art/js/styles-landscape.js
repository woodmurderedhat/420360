/**
 * styles-landscape.js - Landscape art style for the Generative Art Studio
 * Creates procedurally generated landscapes with natural elements and atmospheric effects
 */

import { drawLandscapeLayer } from './layers/landscape.js';
import { drawLightRaysLayer } from './layers/light-rays.js';
import { drawGradientOverlayLayer } from './layers/gradient-overlay.js';
import { drawOrganicNoiseLayer } from './layers/organic-noise.js';
import { createRandomFunction } from './utils.js';

/**
 * Draw a landscape artwork
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc. from appState)
 */
function drawLandscapeMasterpiece(ctx, palette, isAnimationFrame = false, params = {}) {
    // Extract parameters with defaults
    const {
        canvasWidth, 
        canvasHeight, 
        seed,
        landscapeType = getRandomLandscapeType(seed),
        timeOfDay = getRandomTimeOfDay(seed + 1),
        weatherCondition = getRandomWeatherCondition(seed + 2),
        landscapeComplexity = 50 + (Math.random() * 50) // 50-100
    } = params;

    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);

    // Create landscape-specific parameters
    const landscapeParams = {
        canvasWidth,
        canvasHeight,
        seed: seedValue,
        landscapeType,
        timeOfDay,
        weatherCondition,
        landscapeComplexity
    };

    // Draw the main landscape
    drawLandscapeLayer(ctx, palette, isAnimationFrame, landscapeParams, 1.0);

    // Add additional atmospheric effects based on weather and time of day
    addAtmosphericEffects(ctx, palette, isAnimationFrame, {
        ...landscapeParams,
        seed: seedValue + 10
    }, 0.7);

    // Add final color adjustments based on time of day
    addColorAdjustments(ctx, palette, isAnimationFrame, {
        ...landscapeParams,
        seed: seedValue + 20
    }, 0.5);
}

/**
 * Get a random landscape type based on seed
 * @param {number} seed - Random seed
 * @returns {string} Landscape type
 */
function getRandomLandscapeType(seed) {
    const randomFn = createRandomFunction(seed);
    const types = ['mountain', 'desert', 'ocean', 'forest'];
    return types[Math.floor(randomFn() * types.length)];
}

/**
 * Get a random time of day based on seed
 * @param {number} seed - Random seed
 * @returns {string} Time of day
 */
function getRandomTimeOfDay(seed) {
    const randomFn = createRandomFunction(seed);
    const times = ['dawn', 'day', 'sunset', 'night'];
    return times[Math.floor(randomFn() * times.length)];
}

/**
 * Get a random weather condition based on seed
 * @param {number} seed - Random seed
 * @returns {string} Weather condition
 */
function getRandomWeatherCondition(seed) {
    const randomFn = createRandomFunction(seed);
    const conditions = ['clear', 'cloudy', 'foggy', 'stormy'];
    
    // Weight the conditions to make clear weather more common
    const rand = randomFn();
    if (rand < 0.5) return 'clear';
    if (rand < 0.7) return 'cloudy';
    if (rand < 0.85) return 'foggy';
    return 'stormy';
}

/**
 * Add additional atmospheric effects based on weather and time of day
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the effects
 */
function addAtmosphericEffects(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, timeOfDay, weatherCondition, seed } = params;
    
    // Skip for clear weather
    if (weatherCondition === 'clear') return;
    
    // Add light rays for dawn and sunset
    if ((timeOfDay === 'dawn' || timeOfDay === 'sunset') && weatherCondition !== 'stormy') {
        const lightDirection = timeOfDay === 'dawn' ? 90 : 270; // Right or left
        const lightColor = timeOfDay === 'dawn' ? '#ffb347' : '#ff7e5f'; // Orange or red-orange
        
        const lightParams = {
            canvasWidth,
            canvasHeight,
            seed,
            lightRaysDirection: lightDirection,
            lightRaysIntensity: 0.7,
            lightRaysSpread: 60,
            lightRaysColor: lightColor
        };
        
        drawLightRaysLayer(ctx, palette, isAnimationFrame, lightParams, opacity * 0.6);
    }
    
    // Add fog overlay for foggy conditions
    if (weatherCondition === 'foggy') {
        const fogParams = {
            canvasWidth,
            canvasHeight,
            seed: seed + 1,
            organicNoiseDensity: 20
        };
        
        // Use organic noise with high opacity for fog
        drawOrganicNoiseLayer(ctx, ['#ffffff', '#f0f0f0'], isAnimationFrame, fogParams, opacity * 0.4);
    }
}

/**
 * Add color adjustments based on time of day
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters
 * @param {number} opacity - Opacity of the adjustments
 */
function addColorAdjustments(ctx, palette, isAnimationFrame, params, opacity) {
    const { canvasWidth, canvasHeight, timeOfDay, seed } = params;
    
    // Add color overlay based on time of day
    let overlayColors = [];
    let blendMode = 'overlay';
    
    switch (timeOfDay) {
        case 'dawn':
            overlayColors = ['rgba(255, 200, 100, 0.2)', 'rgba(255, 150, 50, 0.1)'];
            break;
        case 'day':
            // No color adjustment needed for day
            return;
        case 'sunset':
            overlayColors = ['rgba(255, 100, 50, 0.2)', 'rgba(200, 50, 100, 0.1)'];
            break;
        case 'night':
            overlayColors = ['rgba(0, 20, 80, 0.3)', 'rgba(0, 0, 40, 0.2)'];
            blendMode = 'multiply';
            break;
    }
    
    if (overlayColors.length > 0) {
        const overlayParams = {
            canvasWidth,
            canvasHeight,
            seed,
            blendMode,
            gradientType: 'linear'
        };
        
        drawGradientOverlayLayer(ctx, overlayColors, isAnimationFrame, overlayParams, opacity);
    }
}

// Export the landscape masterpiece drawing function
export { drawLandscapeMasterpiece };
