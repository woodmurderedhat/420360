/**
 * js/layers/particle-swarm.js - Particle Swarm layer for the Generative Art Studio
 */

import { randomRange, randomInt, parseColorToRgb } from '../utils.js';
import { initWebGL, isWebGLAvailable, renderParticles } from '../webgl-renderer.js';

/**
 * Draw a Particle Swarm layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawParticleSwarmLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, particleSwarmDensity = 50, seed } = params;

    // Save the current context state
    ctx.save();

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Use seed to create deterministic randomness
    const seedValue = seed || Date.now();
    Math.seedrandom(seedValue.toString());

    // Calculate number of particles based on density
    const numParticles = Math.floor((particleSwarmDensity / 100) * 200) + 50;

    // Try to use WebGL for better performance if available
    const canvas = ctx.canvas;
    if (isWebGLAvailable() && initWebGL(canvas)) {
        // Generate particles for WebGL rendering
        const particles = generateParticles(numParticles, canvasWidth, canvasHeight, palette);

        // Render particles using WebGL
        renderParticles(particles, opacity);
    } else {
        // Fallback to Canvas 2D API
        drawParticlesCanvas2D(ctx, numParticles, canvasWidth, canvasHeight, palette, isAnimationFrame);
    }

    // Restore the context state
    ctx.restore();
}

/**
 * Generate particles for rendering
 * @param {number} numParticles - Number of particles to generate
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array<string>} palette - Color palette
 * @returns {Array<Object>} Array of particle objects
 */
function generateParticles(numParticles, width, height, palette) {
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        // Convert color from hex to RGB using our utility function
        const color = palette[Math.floor(Math.random() * palette.length)];
        const { r: rValue, g: gValue, b: bValue } = parseColorToRgb(color);
        const r = rValue / 255;
        const g = gValue / 255;
        const b = bValue / 255;

        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 1,
            color: [r, g, b, 1.0],
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }

    return particles;
}

/**
 * Draw particles using Canvas 2D API (fallback)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} numParticles - Number of particles to draw
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array<string>} palette - Color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 */
function drawParticlesCanvas2D(ctx, numParticles, width, height, palette, isAnimationFrame) {
    // Generate particles
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 5 + 1,
            color: palette[Math.floor(Math.random() * palette.length)],
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }

    // Draw each particle
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Add a subtle glow effect
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // If this is an animation frame, update particle position
        if (isAnimationFrame) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        }
    });
}