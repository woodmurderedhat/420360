/**
 * js/layers/neon-waves.js - Enhanced Neon Waves layer for the Generative Art Studio
 * Implements advanced glow effects, variable thickness, and improved animation
 */

import { parseColorToRgb } from '../utils.js';

/**
 * Draw an enhanced Neon Waves layer with glow effects and depth
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, neonWavesDensity = 5, lineWidth = 2 } = params;
    // Calculate number of waves based on density parameter
    const numWaves = Math.floor((neonWavesDensity / 100) * 15) + 2;

    // Save the current context state
    ctx.save();
    ctx.globalAlpha = opacity;

    // Create waves with different depths (foreground, midground, background)
    const depthLevels = 3;

    for (let depth = 0; depth < depthLevels; depth++) {
        // Calculate waves per depth level
        const wavesInThisDepth = Math.ceil(numWaves / depthLevels);

        // Adjust opacity and size based on depth
        const depthOpacity = 1 - (depth * 0.2);
        const depthScale = 1 - (depth * 0.15);

        for (let i = 0; i < wavesInThisDepth; i++) {
            // Get a color from the palette
            const baseColor = palette[Math.floor(Math.random() * palette.length)];

            // Parse the color to create glow effects using our utility function
            const { r, g, b } = parseColorToRgb(baseColor);

            // Calculate wave parameters
            const waveAmplitude = (30 + Math.random() * 40) * depthScale;
            const waveFrequency = 0.01 + Math.random() * 0.03;
            const wavePhase = Math.random() * Math.PI * 2;
            const waveSpeed = 0.0005 + Math.random() * 0.001;
            const baseY = Math.random() * canvasHeight;
            const thickness = (lineWidth + Math.random() * 3) * depthScale;

            // Draw the glow effect (multiple passes with decreasing opacity)
            const glowPasses = 3;
            const glowSize = thickness * 3;

            for (let pass = 0; pass < glowPasses; pass++) {
                const glowOpacity = (glowPasses - pass) / glowPasses * 0.6 * depthOpacity;
                const glowThickness = thickness + (pass * glowSize / glowPasses);

                ctx.beginPath();
                ctx.lineWidth = glowThickness;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${glowOpacity})`;

                // Draw the wave path
                ctx.beginPath();

                // Starting point
                const startY = baseY + Math.sin(wavePhase) * waveAmplitude;
                ctx.moveTo(0, startY);

                // Draw the wave with smoother resolution
                const step = 5; // Smaller step for smoother curves
                for (let x = step; x <= canvasWidth; x += step) {
                    // Calculate time factor for animation
                    const timeFactor = isAnimationFrame ? Date.now() * waveSpeed : 0;

                    // Calculate y position with multiple sine waves for complexity
                    const y = baseY +
                        Math.sin(x * waveFrequency + wavePhase + timeFactor) * waveAmplitude +
                        Math.sin(x * waveFrequency * 2.5 + wavePhase * 0.8 + timeFactor * 1.3) * (waveAmplitude * 0.3);

                    ctx.lineTo(x, y);
                }

                ctx.stroke();
            }

            // Draw the core of the wave (brightest part)
            ctx.beginPath();
            ctx.lineWidth = thickness * 0.6;
            ctx.strokeStyle = baseColor; // Original color at full brightness

            // Redraw the same wave path for the core
            const startY = baseY + Math.sin(wavePhase) * waveAmplitude;
            ctx.moveTo(0, startY);

            const step = 5;
            for (let x = step; x <= canvasWidth; x += step) {
                const timeFactor = isAnimationFrame ? Date.now() * waveSpeed : 0;

                const y = baseY +
                    Math.sin(x * waveFrequency + wavePhase + timeFactor) * waveAmplitude +
                    Math.sin(x * waveFrequency * 2.5 + wavePhase * 0.8 + timeFactor * 1.3) * (waveAmplitude * 0.3);

                ctx.lineTo(x, y);
            }

            ctx.stroke();

            // Add highlight (brightest center)
            ctx.beginPath();
            ctx.lineWidth = thickness * 0.2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * depthOpacity})`;

            // Redraw the same wave path for the highlight
            ctx.moveTo(0, startY);

            for (let x = step; x <= canvasWidth; x += step) {
                const timeFactor = isAnimationFrame ? Date.now() * waveSpeed : 0;

                const y = baseY +
                    Math.sin(x * waveFrequency + wavePhase + timeFactor) * waveAmplitude +
                    Math.sin(x * waveFrequency * 2.5 + wavePhase * 0.8 + timeFactor * 1.3) * (waveAmplitude * 0.3);

                ctx.lineTo(x, y);
            }

            ctx.stroke();
        }
    }

    // Restore the context state
    ctx.restore();
}
