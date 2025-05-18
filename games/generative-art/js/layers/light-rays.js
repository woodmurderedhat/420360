/**
 * js/layers/light-rays.js - Light Rays layer for the Generative Art Studio
 * Implements crepuscular/god rays effect with customizable parameters
 */

import { parseColorToRgb } from '../utils.js';

/**
 * Draw a Light Rays layer with customizable parameters
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawLightRaysLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const {
        canvasWidth,
        canvasHeight,
        lightRaysDensity = 50,
        lightRaysIntensity = 0.7,
        lightRaysDirection = 0, // 0-360 degrees
        lightRaysSpread = 60,   // Spread angle in degrees
        lightRaysColor = null   // If null, use palette colors
    } = params;

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Calculate number of rays based on density
    const numRays = Math.floor((lightRaysDensity / 100) * 30) + 5;

    // Calculate ray origin position (default to top center with some randomness)
    let originX, originY;

    // Convert direction from degrees to radians
    const directionRad = (lightRaysDirection || 0) * Math.PI / 180;

    // Position the origin based on the direction
    // For direction 0 (top), origin is at top center
    // For direction 90 (right), origin is at right center
    // etc.
    if (directionRad >= 0 && directionRad < Math.PI/2) {
        // Top-right quadrant
        const factor = directionRad / (Math.PI/2);
        originX = canvasWidth * factor;
        originY = 0;
    } else if (directionRad >= Math.PI/2 && directionRad < Math.PI) {
        // Bottom-right quadrant
        const factor = (directionRad - Math.PI/2) / (Math.PI/2);
        originX = canvasWidth;
        originY = canvasHeight * factor;
    } else if (directionRad >= Math.PI && directionRad < 3*Math.PI/2) {
        // Bottom-left quadrant
        const factor = (directionRad - Math.PI) / (Math.PI/2);
        originX = canvasWidth * (1 - factor);
        originY = canvasHeight;
    } else {
        // Top-left quadrant
        const factor = (directionRad - 3*Math.PI/2) / (Math.PI/2);
        originX = 0;
        originY = canvasHeight * (1 - factor);
    }

    // Add slight animation to origin if this is an animation frame
    if (isAnimationFrame) {
        const time = Date.now() * 0.001;
        originX += Math.sin(time * 0.5) * canvasWidth * 0.05;
        originY += Math.cos(time * 0.3) * canvasHeight * 0.05;
    }

    // Calculate the spread in radians
    const spreadRad = (lightRaysSpread / 2) * Math.PI / 180;

    // Create a radial gradient for the rays
    const gradient = ctx.createRadialGradient(
        originX, originY, 0,
        originX, originY, Math.max(canvasWidth, canvasHeight) * 1.5
    );

    // Set up the gradient colors
    const rayColor = lightRaysColor || palette[Math.floor(Math.random() * palette.length)];

    // Parse the color to create the gradient with our utility function
    const { r, g, b } = parseColorToRgb(rayColor);

    // Now use the validated RGB values
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${lightRaysIntensity})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    // Draw each ray
    for (let i = 0; i < numRays; i++) {
        // Calculate the angle for this ray within the spread
        const angleOffset = (Math.random() * 2 - 1) * spreadRad;
        const rayAngle = directionRad + angleOffset;

        // Calculate the end point of the ray (far beyond canvas edge)
        const rayLength = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) * 2;
        const endX = originX + Math.cos(rayAngle + Math.PI) * rayLength;
        const endY = originY + Math.sin(rayAngle + Math.PI) * rayLength;

        // Calculate ray width based on position in the spread
        const normalizedOffset = Math.abs(angleOffset) / spreadRad; // 0 at center, 1 at edges
        const rayWidth = (1 - Math.pow(normalizedOffset, 2)) * 50 * (lightRaysIntensity || 0.7);

        // Draw the ray
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = rayWidth;
        ctx.strokeStyle = gradient;

        // Add some animation to the rays if this is an animation frame
        if (isAnimationFrame) {
            const time = Date.now() * 0.001;
            const flickerSpeed = 0.5 + Math.random() * 2;
            const flicker = 0.7 + Math.sin(time * flickerSpeed + i) * 0.3;
            ctx.globalAlpha = opacity * flicker;
        }

        ctx.stroke();
    }

    // Add a glow at the origin point
    const glowRadius = Math.min(canvasWidth, canvasHeight) * 0.1;
    const glowGradient = ctx.createRadialGradient(
        originX, originY, 0,
        originX, originY, glowRadius
    );

    // No need for additional validation here as parseColorToRgb already handles it

    glowGradient.addColorStop(0, `rgba(255, 255, 255, ${lightRaysIntensity})`);
    glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${lightRaysIntensity * 0.5})`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(originX, originY, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Restore the context state
    ctx.restore();
}
