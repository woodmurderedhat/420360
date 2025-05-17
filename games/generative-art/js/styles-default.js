/**
 * styles-default.js - Default masterpiece art style for the Generative Art Studio
 * Combines elements from all other art styles into one harmonious masterpiece
 */

import { randomRange, randomInt } from './utils.js';
import { generateVoronoiCells } from './worker-manager.js';
import { initWebGL, isWebGLAvailable, renderParticles, renderGradient } from './webgl-renderer.js';

/**
 * Draw the Default Masterpiece style - combines all other art styles
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 */
function drawDefaultMasterpiece(ctx, palette, isAnimationFrame = false, params = {}) {
    const {
        width,
        height,
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
        // New layer opacity settings
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
        // New layer density settings
        dotMatrixDensity = 20,
        flowingLinesDensity = 8,
        symmetricalPatternsDensity = 6,
        // Blend mode settings (default to 'source-over' which is normal blending)
        blendMode = 'source-over',
        // Color shift settings
        colorShiftAmount = 0,
        // Scale and rotation settings
        scaleAmount = 1.0,
        rotationAmount = 0,
        // Performance optimization flags
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

    // Determine which layers are static vs. dynamic
    // Static layers: don't change with animation or interaction
    // Dynamic layers: change with animation frames or interaction

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
        const voronoiParams = { ...params, layerDensity: voronoiDensity };
        drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, voronoiParams, voronoiOpacity);
    }

    // 3. Add Organic Splatters for color blobs - mostly static with slight animation
    const isOrganicSplattersDynamic = isAnimationFrame && (isInteractive || frameCount > 0);
    if (shouldDrawLayer(isOrganicSplattersDynamic, organicSplattersOpacity)) {
        const splattersParams = { ...params, layerDensity: organicSplattersDensity };
        drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, splattersParams, organicSplattersOpacity);
    }

    // 4. Add Neon Waves for glowing elements - highly dynamic with animation
    const isNeonWavesDynamic = isAnimationFrame;
    if (shouldDrawLayer(isNeonWavesDynamic, neonWavesOpacity)) {
        const neonParams = { ...params, layerDensity: neonWavesDensity };
        drawNeonWavesLayer(ctx, palette, isAnimationFrame, neonParams, neonWavesOpacity);
    }

    // 5. Add Fractal Lines for structure - moderately dynamic with animation
    const isFractalLinesDynamic = isAnimationFrame && (isInteractive || frameCount % 3 === 0);
    if (shouldDrawLayer(isFractalLinesDynamic, fractalLinesOpacity)) {
        const fractalParams = { ...params, layerDensity: fractalLinesDensity };
        drawFractalLinesLayer(ctx, palette, isAnimationFrame, fractalParams, fractalLinesOpacity);
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

/**
 * Draw a reduced Voronoi Cells layer
 */
function drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 15 } = params;

    ctx.globalAlpha = opacity;

    // Use layer density from UI settings
    const numCells = layerDensity;

    // Static cache for Voronoi cells
    if (!window.voronoiCache) {
        window.voronoiCache = new Map();
    }

    // Create a cache key based on parameters
    const cacheKey = `${width}_${height}_${numCells}_${isAnimationFrame ? frameCount : 0}_${isInteractive ? Math.round(mouseX) + "_" + Math.round(mouseY) : "0_0"}`;

    // Try to use worker for Voronoi generation if not in cache
    if (!window.voronoiCache.has(cacheKey)) {
        // Generate cell centers
        const cellCenters = [];
        for (let i = 0; i < numCells; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;

            // Add animation
            if (isAnimationFrame) {
                x += Math.sin(frameCount * 0.01 + i) * 5;
                y += Math.cos(frameCount * 0.01 + i) * 5;
            }

            // Add interactivity
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
                const influence = Math.max(0, 1 - distToMouse / 300);
                x += (mouseX - x) * influence * 0.1;
                y += (mouseY - y) * influence * 0.1;
            }

            cellCenters.push({
                x,
                y,
                color: palette[Math.floor(Math.random() * palette.length)],
                radius: 50 + Math.random() * 150
            });
        }

        // Store in cache
        window.voronoiCache.set(cacheKey, cellCenters);

        // Try to generate Voronoi cells using worker in the background for next time
        // This won't block the main thread
        if (typeof generateVoronoiCells === 'function') {
            const seed = cacheKey;
            generateVoronoiCells(width, height, numCells, seed)
                .then(result => {
                    // Store the worker-generated result for future use
                    window.voronoiCache.set(`worker_${cacheKey}`, result);

                    // Limit cache size to prevent memory issues
                    if (window.voronoiCache.size > 20) {
                        // Remove oldest entries
                        const keys = Array.from(window.voronoiCache.keys());
                        for (let i = 0; i < keys.length - 20; i++) {
                            window.voronoiCache.delete(keys[i]);
                        }
                    }
                })
                .catch(error => {
                    console.warn('Worker Voronoi generation failed, using fallback:', error);
                });
        }
    }

    // Get cells from cache
    const cellCenters = window.voronoiCache.get(cacheKey);

    // Check if we have worker-generated Voronoi data
    const workerData = window.voronoiCache.get(`worker_${cacheKey}`);

    if (workerData) {
        // Use the worker-generated Voronoi data
        // This would be a more efficient rendering using the pre-computed Voronoi cells
        // For now, we'll just use the cell centers as before
    }

    // Draw each cell
    for (const cell of cellCenters) {
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);

        // Draw a polygon instead of a circle to create a more cell-like appearance
        const sides = 5 + Math.floor(Math.random() * 4);
        const angleOffset = Math.random() * Math.PI * 2;

        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = angleOffset + (i * 2 * Math.PI / sides);
            const x = cell.x + Math.cos(angle) * cell.radius * (0.8 + Math.random() * 0.4);
            const y = cell.y + Math.sin(angle) * cell.radius * (0.8 + Math.random() * 0.4);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Organic Splatters layer
 */
function drawOrganicSplattersLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 10 } = params;

    ctx.globalAlpha = opacity;

    // Use layer density from UI settings
    const numSplatters = layerDensity;

    for (let i = 0; i < numSplatters; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;

        // Add animation
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i) * 5;
            y += Math.cos(frameCount * 0.01 + i) * 5;
        }

        // Add interactivity
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            const influence = Math.max(0, 1 - distToMouse / 300);
            x += (mouseX - x) * influence * 0.05;
            y += (mouseY - y) * influence * 0.05;
        }

        const radius = 30 + Math.random() * 100;
        const color = palette[Math.floor(Math.random() * palette.length)];

        ctx.fillStyle = color;
        ctx.globalCompositeOperation = Math.random() < 0.5 ? 'multiply' : 'screen';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + Math.random() * 20;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Neon Waves layer
 */
function drawNeonWavesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 5 } = params;

    ctx.globalAlpha = opacity;

    // Use layer density from UI settings
    const numWaves = layerDensity;

    for (let i = 0; i < numWaves; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];

        // Wave parameters
        const startX = -width * 0.2;
        const startY = height * (0.2 + Math.random() * 0.6);
        const frequency = 0.005 + Math.random() * 0.015;
        const amplitude = 20 + Math.random() * 80;
        const phaseShift = Math.random() * Math.PI * 2;

        // Animation and interactivity
        let interactiveFrequency = frequency;
        let interactiveAmplitude = amplitude;
        let timeOffset = isAnimationFrame ? frameCount * 0.05 : 0;

        if (isInteractive) {
            const distToWave = Math.abs(mouseY - startY);
            const influence = Math.max(0, 1 - distToWave / 200);
            interactiveFrequency += (mouseX / width) * influence * 0.01;
            interactiveAmplitude += (mouseY / height) * influence * 50;
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let x = 0; x < width * 1.2; x += 2) {
            const actualX = startX + x;
            const wavePhase = x * interactiveFrequency + phaseShift + timeOffset;
            const actualY = startY + Math.sin(wavePhase) * interactiveAmplitude;

            ctx.lineTo(actualX, actualY);
        }

        // Neon glow effect
        const thickness = 1 + Math.random() * 2;

        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Inner bright line
        ctx.shadowBlur = 0;
        ctx.lineWidth = thickness / 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    // Reset
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Fractal Lines layer
 */
function drawFractalLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 2 } = params;

    ctx.globalAlpha = opacity;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;

    // Use layer density from UI settings
    const numBaseLines = layerDensity;
    const maxDepth = 3 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numBaseLines; i++) {
        let x1 = Math.random() * width;
        let y1 = Math.random() * height;
        let x2 = Math.random() * width;
        let y2 = Math.random() * height;

        // Add animation
        if (isAnimationFrame) {
            const angle = frameCount * 0.01;
            x1 += Math.sin(angle + i) * 10;
            y1 += Math.cos(angle + i) * 10;
            x2 += Math.sin(angle + i + Math.PI) * 10;
            y2 += Math.cos(angle + i + Math.PI) * 10;
        }

        // Add interactivity
        if (isInteractive) {
            const distToMouse1 = Math.sqrt(Math.pow(x1 - mouseX, 2) + Math.pow(y1 - mouseY, 2));
            const distToMouse2 = Math.sqrt(Math.pow(x2 - mouseX, 2) + Math.pow(y2 - mouseY, 2));

            const influence1 = Math.max(0, 1 - distToMouse1 / 300);
            const influence2 = Math.max(0, 1 - distToMouse2 / 300);

            x1 += (mouseX - x1) * influence1 * 0.1;
            y1 += (mouseY - y1) * influence1 * 0.1;
            x2 += (mouseX - x2) * influence2 * 0.1;
            y2 += (mouseY - y2) * influence2 * 0.1;
        }

        const color = palette[Math.floor(Math.random() * palette.length)];
        ctx.strokeStyle = color;

        // Draw fractal line recursively
        drawFractalLineRecursive(ctx, x1, y1, x2, y2, maxDepth, color, palette);
    }

    ctx.globalAlpha = opacity;
}

/**
 * Helper function for fractal lines
 */
function drawFractalLineRecursive(ctx, x1, y1, x2, y2, depth, color, palette) {
    if (depth <= 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Add some randomness to the midpoint (perpendicular to the line)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate perpendicular offset
    const offsetAmount = length * (0.1 + Math.random() * 0.2);
    const offsetX = -dy / length * offsetAmount;
    const offsetY = dx / length * offsetAmount;

    const newMidX = midX + offsetX;
    const newMidY = midY + offsetY;

    // Randomly change color for some branches
    if (Math.random() < 0.3) {
        ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
    } else {
        ctx.strokeStyle = color;
    }

    // Recursively draw the two halves
    drawFractalLineRecursive(ctx, x1, y1, newMidX, newMidY, depth - 1, color, palette);
    drawFractalLineRecursive(ctx, newMidX, newMidY, x2, y2, depth - 1, color, palette);
}

/**
 * Draw a reduced Geometric Grid layer
 */
function drawGeometricGridLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced grid size
    const cols = 3 + Math.floor(Math.random() * 4);
    const rows = 2 + Math.floor(Math.random() * 3);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Animation factor
    const animFactor = isAnimationFrame ? frameCount * 0.01 : 0;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Skip some cells for a more sparse look
            if (Math.random() < 0.4) continue;

            ctx.save();

            // Add subtle movement if animating
            let xOffset = (Math.random() - 0.25) * cellWidth * 0.5;
            let yOffset = (Math.random() - 0.25) * cellHeight * 0.5;

            if (isAnimationFrame) {
                xOffset += Math.sin(frameCount * 0.02 + i * 0.5) * 5;
                yOffset += Math.cos(frameCount * 0.02 + j * 0.5) * 5;
            }

            // Interactive influence
            if (isInteractive) {
                const cellCenterX = i * cellWidth + cellWidth / 2;
                const cellCenterY = j * cellHeight + cellHeight / 2;
                const distToMouse = Math.sqrt(
                    Math.pow(cellCenterX - mouseX, 2) +
                    Math.pow(cellCenterY - mouseY, 2)
                );
                const influence = Math.max(0, 1 - distToMouse / 300);
                xOffset += (mouseX - cellCenterX) * influence * 0.1;
                yOffset += (mouseY - cellCenterY) * influence * 0.1;
            }

            const x = i * cellWidth + cellWidth / 2 + xOffset;
            const y = j * cellHeight + cellHeight / 2 + yOffset;

            ctx.translate(x, y);
            ctx.rotate((Math.random() * Math.PI * 2) + (isAnimationFrame ? animFactor : 0));

            const color = palette[Math.floor(Math.random() * palette.length)];
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1 + Math.random() * 3;
            const shouldFill = Math.random() < 0.3;

            const primitiveType = Math.floor(Math.random() * 4);
            const size = Math.min(cellWidth, cellHeight) * (0.2 + Math.random() * 0.5);

            switch (primitiveType) {
                case 0:
                    ctx.beginPath();
                    ctx.moveTo(-size / 2, 0);
                    ctx.lineTo(size / 2, 0);
                    ctx.stroke();
                    break;
                case 1:
                    ctx.beginPath();
                    if (shouldFill) {
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fillRect(-size / 2, -size / 2, size, size);
                        ctx.globalAlpha = opacity;
                    } else {
                        ctx.strokeRect(-size / 2, -size / 2, size, size);
                    }
                    break;
                case 2:
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                    if (shouldFill) {
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fill();
                        ctx.globalAlpha = opacity;
                    } else {
                        ctx.stroke();
                    }
                    break;
                case 3:
                    ctx.beginPath();
                    ctx.moveTo(0, -size / 2);
                    ctx.lineTo(size / 2, size / 2);
                    ctx.lineTo(-size / 2, size / 2);
                    ctx.closePath();
                    if (shouldFill) {
                        ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.3);
                        ctx.fill();
                        ctx.globalAlpha = opacity;
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
            ctx.restore();
        }
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Particle Swarm layer
 */
function drawParticleSwarmLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of particles
    const numParticles = 30 + Math.floor(Math.random() * 50);
    const trailLength = 5 + Math.random() * 10;
    const maxSpeed = 1 + Math.random() * 2;

    // Try to use WebGL for particle rendering if available
    // Initialize WebGL if not already initialized
    let useWebGL = false;

    if (isAnimationFrame && !window.webglInitialized) {
        window.webglInitialized = true;
        initWebGL(ctx.canvas);
    }

    // Check if WebGL is available
    useWebGL = isWebGLAvailable();

    if (useWebGL) {
        // Generate particles for WebGL rendering
        const particles = [];

        for (let i = 0; i < numParticles; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;

            // Add animation
            if (isAnimationFrame) {
                x += Math.sin(frameCount * 0.01 + i * 0.1) * 5;
                y += Math.cos(frameCount * 0.01 + i * 0.1) * 5;
            }

            let vx = (Math.random() - 0.5) * maxSpeed * 2;
            let vy = (Math.random() - 0.5) * maxSpeed * 2;

            // Add interactivity
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
                if (distToMouse < 200) {
                    const angle = Math.atan2(y - mouseY, x - mouseX);
                    vx += Math.cos(angle) * (1 - distToMouse / 200) * 2;
                    vy += Math.sin(angle) * (1 - distToMouse / 200) * 2;
                }
            }

            // Parse color from palette
            const color = palette[Math.floor(Math.random() * palette.length)];
            const rgb = color.match(/\d+/g).map(Number);

            // Generate multiple particles for each trail segment
            for (let j = 0; j < trailLength; j++) {
                x += vx;
                y += vy;

                vx += (Math.random() - 0.5) * 0.5;
                vy += (Math.random() - 0.5) * 0.5;

                // Add particle with decreasing size and alpha for trail effect
                particles.push({
                    x,
                    y,
                    r: rgb[0],
                    g: rgb[1],
                    b: rgb[2],
                    a: opacity * (1 - (j / trailLength)),
                    size: 3 + Math.random() * 5 * (1 - (j / trailLength))
                });
            }
        }

        // Render particles using WebGL
        renderParticles(particles, frameCount);
    } else {
        // Fallback to Canvas 2D API
        for (let i = 0; i < numParticles; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;

            // Add animation
            if (isAnimationFrame) {
                x += Math.sin(frameCount * 0.01 + i * 0.1) * 5;
                y += Math.cos(frameCount * 0.01 + i * 0.1) * 5;
            }

            let vx = (Math.random() - 0.5) * maxSpeed * 2;
            let vy = (Math.random() - 0.5) * maxSpeed * 2;

            // Add interactivity
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
                if (distToMouse < 200) {
                    const angle = Math.atan2(y - mouseY, x - mouseX);
                    vx += Math.cos(angle) * (1 - distToMouse / 200) * 2;
                    vy += Math.sin(angle) * (1 - distToMouse / 200) * 2;
                }
            }

            const color = palette[Math.floor(Math.random() * palette.length)];

            ctx.beginPath();
            ctx.moveTo(x, y);

            for (let j = 0; j < trailLength; j++) {
                x += vx;
                y += vy;

                vx += (Math.random() - 0.5) * 0.5;
                vy += (Math.random() - 0.5) * 0.5;

                ctx.lineTo(x, y);
                ctx.strokeStyle = color;
                ctx.globalAlpha = opacity * (1 - (j / trailLength));
                ctx.lineWidth = 1 + Math.random();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Organic Noise layer
 */
function drawOrganicNoiseLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Reduced number of curves
    const numCurves = 20 + Math.floor(Math.random() * 30);

    for (let i = 0; i < numCurves; i++) {
        const colorIndex = Math.floor((i / numCurves) * palette.length) % palette.length;

        let x = width * Math.random();
        let y = height * Math.random();

        // Add animation and interactivity
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i * 0.1) * 10;
            y += Math.cos(frameCount * 0.01 + i * 0.1) * 10;
        }

        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            const influence = Math.max(0, 1 - distToMouse / 300);
            x += (mouseX - x) * influence * 0.05;
            y += (mouseY - y) * influence * 0.05;
        }

        const cp1x = x + Math.random() * 200 - 100;
        const cp1y = y + Math.random() * 200 - 100;
        const cp2x = x + Math.random() * 200 - 100;
        const cp2y = y + Math.random() * 200 - 100;
        const endX = x + Math.random() * 200 - 100;
        const endY = y + Math.random() * 200 - 100;

        ctx.strokeStyle = palette[colorIndex];
        ctx.lineWidth = 1 + Math.random() * 2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.stroke();
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Glitch Mosaic layer
 */
function drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Very reduced number of glitch effects
    const numRects = 5 + Math.floor(Math.random() * 10);
    const maxShift = 10 + Math.random() * 20;

    // Apply glitch effect by copying and shifting parts of the canvas
    for (let i = 0; i < numRects; i++) {
        let sx = Math.random() * width;
        let sy = Math.random() * height;

        // Add animation
        if (isAnimationFrame) {
            sx += Math.sin(frameCount * 0.01 + i) * 10;
            sy += Math.cos(frameCount * 0.01 + i) * 10;
        }

        // Add interactivity
        if (isInteractive) {
            const distToMouse = Math.sqrt(Math.pow(sx - mouseX, 2) + Math.pow(sy - mouseY, 2));
            if (distToMouse < 200) {
                const angle = Math.atan2(sy - mouseY, sx - mouseX);
                sx += Math.cos(angle) * (1 - distToMouse / 200) * 50;
                sy += Math.sin(angle) * (1 - distToMouse / 200) * 50;
            }
        }

        const sw = 20 + Math.random() * 100;
        const sh = 10 + Math.random() * 50;

        // Calculate destination with a shift
        const dx = sx + (Math.random() - 0.5) * maxShift;
        const dy = sy + (Math.random() - 0.5) * maxShift;

        // Source coordinates must be within canvas bounds
        const sourceX = Math.max(0, Math.min(width - 1, sx));
        const sourceY = Math.max(0, Math.min(height - 1, sy));
        const sourceW = Math.min(sw, width - sourceX);
        const sourceH = Math.min(sh, height - sourceY);

        // Destination coordinates can be outside
        const destX = dx;
        const destY = dy;

        try {
            ctx.drawImage(
                ctx.canvas,
                sourceX, sourceY, sourceW, sourceH,
                destX, destY, sourceW, sourceH
            );
        } catch (e) {
            // Fallback if drawImage fails
            ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
            ctx.fillRect(destX, destY, sourceW, sourceH);
        }
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a reduced Pixel Sort layer
 */
function drawPixelSortLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Add a few sorted pixel-like rectangles
    const numSortedSections = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numSortedSections; i++) {
        // Choose a random starting point
        const startX = Math.random() * width;
        const startY = Math.random() * height;

        // Choose a random direction (horizontal or vertical)
        const isHorizontal = Math.random() < 0.5;

        // Choose a random length
        const length = 50 + Math.random() * 200;
        const thickness = 2 + Math.random() * 10;

        // Sort a section of "pixels"
        const numPixels = 10 + Math.floor(Math.random() * 20);
        const pixelSize = length / numPixels;

        // Create an array of colors from the palette
        const colors = [];
        for (let j = 0; j < numPixels; j++) {
            colors.push(palette[Math.floor(Math.random() * palette.length)]);
        }

        // Sort colors by brightness (simple approximation)
        colors.sort((a, b) => {
            // Extract RGB values
            const rgbA = a.match(/\d+/g).map(Number);
            const rgbB = b.match(/\d+/g).map(Number);

            // Calculate brightness
            const brightnessA = (rgbA[0] + rgbA[1] + rgbA[2]) / 3;
            const brightnessB = (rgbB[0] + rgbB[1] + rgbB[2]) / 3;

            return brightnessA - brightnessB;
        });

        // Draw the sorted pixels
        for (let j = 0; j < numPixels; j++) {
            ctx.fillStyle = colors[j];

            if (isHorizontal) {
                ctx.fillRect(
                    startX + j * pixelSize,
                    startY,
                    pixelSize,
                    thickness
                );
            } else {
                ctx.fillRect(
                    startX,
                    startY + j * pixelSize,
                    thickness,
                    pixelSize
                );
            }
        }
    }

    // Add a few glitch effects
    const numGlitches = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numGlitches; i++) {
        const glitchX = Math.random() * width;
        const glitchY = Math.random() * height;
        const glitchW = 5 + Math.random() * 20;
        const glitchH = 2 + Math.random() * 10;

        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(glitchX, glitchY, glitchW, glitchH);
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a Gradient Overlay layer
 */
function drawGradientOverlayLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, colorShiftAmount = 0 } = params;

    ctx.globalAlpha = opacity;

    // Create a gradient - choose between linear, radial, or conic based on random value
    const gradientType = Math.floor(Math.random() * 3);

    // Try to use WebGL for gradient rendering if available
    let useWebGL = false;

    if (isAnimationFrame && !window.webglInitialized) {
        window.webglInitialized = true;
        initWebGL(ctx.canvas);
    }

    // Check if WebGL is available
    useWebGL = isWebGLAvailable();

    // Apply color shift if specified
    const shiftedPalette = colorShiftAmount !== 0 ?
        palette.map(color => {
            const rgb = color.match(/\d+/g).map(Number);
            const r = Math.min(255, Math.max(0, rgb[0] + colorShiftAmount));
            const g = Math.min(255, Math.max(0, rgb[1] + colorShiftAmount));
            const b = Math.min(255, Math.max(0, rgb[2] + colorShiftAmount));
            return `rgb(${r}, ${g}, ${b})`;
        }) : palette;

    if (useWebGL) {
        // Parse colors for WebGL
        const colors = [];
        const numColors = Math.min(shiftedPalette.length, 5);

        for (let i = 0; i < numColors; i++) {
            const color = shiftedPalette[i % shiftedPalette.length];
            const rgb = color.match(/\d+/g).map(Number);

            colors.push({
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
                a: opacity
            });
        }

        // Set blend mode if specified
        if (params.blendMode && params.blendMode !== 'source-over') {
            ctx.globalCompositeOperation = params.blendMode;
        }

        // Render gradient using WebGL
        renderGradient(colors, width, height, frameCount, gradientType);

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    } else {
        // Fallback to Canvas 2D API
        let gradient;

        if (gradientType === 0) {
            // Linear gradient
            const angle = (isAnimationFrame ? frameCount * 0.01 : Math.random() * Math.PI * 2);
            const startX = width / 2 - Math.cos(angle) * width;
            const startY = height / 2 - Math.sin(angle) * height;
            const endX = width / 2 + Math.cos(angle) * width;
            const endY = height / 2 + Math.sin(angle) * height;

            gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        } else if (gradientType === 1) {
            // Radial gradient
            let centerX = width / 2;
            let centerY = height / 2;

            // Add interactivity to the center point
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(centerX - mouseX, 2) + Math.pow(centerY - mouseY, 2));
                const influence = Math.max(0, 1 - distToMouse / 300);
                centerX += (mouseX - centerX) * influence * 0.5;
                centerY += (mouseY - centerY) * influence * 0.5;
            }

            const innerRadius = 0;
            const outerRadius = Math.max(width, height) * 0.7;

            gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        } else {
            // Conic gradient (simulated with multiple color stops in a radial gradient)
            let centerX = width / 2;
            let centerY = height / 2;

            if (isAnimationFrame) {
                centerX += Math.sin(frameCount * 0.02) * width * 0.1;
                centerY += Math.cos(frameCount * 0.02) * height * 0.1;
            }

            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(centerX - mouseX, 2) + Math.pow(centerY - mouseY, 2));
                const influence = Math.max(0, 1 - distToMouse / 300);
                centerX += (mouseX - centerX) * influence * 0.5;
                centerY += (mouseY - centerY) * influence * 0.5;
            }

            // Simulate conic gradient with a radial gradient with many color stops
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
        }

        // Add color stops
        const numStops = Math.min(shiftedPalette.length, 5);
        for (let i = 0; i < numStops; i++) {
            gradient.addColorStop(i / (numStops - 1), shiftedPalette[i % shiftedPalette.length]);
        }

        // Set blend mode if specified
        if (params.blendMode && params.blendMode !== 'source-over') {
            ctx.globalCompositeOperation = params.blendMode;
        }

        // Apply the gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.globalAlpha = opacity;
}

/**
 * Draw a Dot Matrix layer
 */
function drawDotMatrixLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 20, scaleAmount = 1.0 } = params;

    ctx.globalAlpha = opacity;

    // Calculate grid size based on density
    const gridSize = Math.max(5, Math.floor(width / layerDensity));
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);

    // Set blend mode if specified
    if (params.blendMode && params.blendMode !== 'source-over') {
        ctx.globalCompositeOperation = params.blendMode;
    }

    // Draw dots in a grid pattern
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Skip some dots for a more organic look
            if (Math.random() < 0.3) continue;

            // Calculate base position
            let x = i * gridSize + gridSize / 2;
            let y = j * gridSize + gridSize / 2;

            // Add animation
            if (isAnimationFrame) {
                x += Math.sin(frameCount * 0.02 + j * 0.1) * gridSize * 0.2;
                y += Math.cos(frameCount * 0.02 + i * 0.1) * gridSize * 0.2;
            }

            // Add interactivity
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
                const influence = Math.max(0, 1 - distToMouse / (300 * scaleAmount));

                // Push dots away from mouse
                if (distToMouse < 300 * scaleAmount) {
                    const angle = Math.atan2(y - mouseY, x - mouseX);
                    x += Math.cos(angle) * influence * 30 * scaleAmount;
                    y += Math.sin(angle) * influence * 30 * scaleAmount;
                }
            }

            // Determine dot size - smaller near edges, larger in center
            const distToCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const maxDist = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
            const sizeFactor = 1 - (distToCenter / maxDist) * 0.7;

            // Apply scale amount
            const dotSize = gridSize * 0.4 * sizeFactor * scaleAmount;

            // Choose color
            const colorIndex = (i + j) % palette.length;
            ctx.fillStyle = palette[colorIndex];

            // Draw the dot
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
}

/**
 * Draw a Texture Overlay layer
 */
function drawTextureOverlayLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false } = params;

    ctx.globalAlpha = opacity;

    // Set blend mode if specified
    if (params.blendMode && params.blendMode !== 'source-over') {
        ctx.globalCompositeOperation = params.blendMode;
    } else {
        // Default to multiply for texture overlay
        ctx.globalCompositeOperation = 'multiply';
    }

    // Create a noise texture
    const textureType = Math.floor(Math.random() * 3);

    if (textureType === 0) {
        // Paper texture (small random dots)
        const dotSize = 1;
        const dotSpacing = 3;

        for (let x = 0; x < width; x += dotSpacing) {
            for (let y = 0; y < height; y += dotSpacing) {
                if (Math.random() < 0.2) {
                    const brightness = 180 + Math.random() * 75; // Light color for subtle effect
                    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.1)`;
                    ctx.fillRect(x, y, dotSize, dotSize);
                }
            }
        }
    } else if (textureType === 1) {
        // Grain texture (random noise)
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const value = 220 + Math.floor(Math.random() * 35);
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
            data[i + 3] = Math.random() < 0.3 ? Math.floor(Math.random() * 30) : 0; // A
        }

        ctx.putImageData(imageData, 0, 0);
    } else {
        // Scratches texture (random lines)
        const numLines = 50;

        for (let i = 0; i < numLines; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const length = 10 + Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            const x2 = x1 + Math.cos(angle) * length;
            const y2 = y1 + Math.sin(angle) * length;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
}

/**
 * Draw a Symmetrical Patterns layer
 */
function drawSymmetricalPatternsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 6, rotationAmount = 0 } = params;

    ctx.globalAlpha = opacity;

    // Determine symmetry type
    const symmetryType = Math.floor(Math.random() * 3);

    // Set blend mode if specified
    if (params.blendMode && params.blendMode !== 'source-over') {
        ctx.globalCompositeOperation = params.blendMode;
    }

    // Save the current context state
    ctx.save();

    // Set up the center of symmetry
    let centerX = width / 2;
    let centerY = height / 2;

    // Add animation to center point
    if (isAnimationFrame) {
        centerX += Math.sin(frameCount * 0.01) * width * 0.05;
        centerY += Math.cos(frameCount * 0.01) * height * 0.05;
    }

    // Add interactivity to center point
    if (isInteractive) {
        const distToMouse = Math.sqrt(Math.pow(centerX - mouseX, 2) + Math.pow(centerY - mouseY, 2));
        const influence = Math.max(0, 1 - distToMouse / 300);
        centerX += (mouseX - centerX) * influence * 0.2;
        centerY += (mouseY - centerY) * influence * 0.2;
    }

    // Translate to center point
    ctx.translate(centerX, centerY);

    // Apply rotation if specified
    if (rotationAmount !== 0) {
        ctx.rotate(rotationAmount * Math.PI * 2);
    }

    if (symmetryType === 0) {
        // Radial symmetry
        const numSegments = layerDensity;
        const segmentAngle = (Math.PI * 2) / numSegments;

        // Draw one segment
        const segment = () => {
            const color = palette[Math.floor(Math.random() * palette.length)];
            ctx.fillStyle = color;

            // Draw a random shape
            const shapeType = Math.floor(Math.random() * 3);
            const size = Math.min(width, height) * 0.15;

            if (shapeType === 0) {
                // Triangle
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(size, size / 2);
                ctx.lineTo(size / 2, size);
                ctx.closePath();
                ctx.fill();
            } else if (shapeType === 1) {
                // Rectangle
                ctx.fillRect(0, 0, size, size / 2);
            } else {
                // Arc
                ctx.beginPath();
                ctx.arc(size / 2, 0, size / 2, 0, Math.PI);
                ctx.fill();
            }
        };

        // Repeat the segment around the center
        for (let i = 0; i < numSegments; i++) {
            ctx.save();
            ctx.rotate(i * segmentAngle);
            segment();
            ctx.restore();
        }
    } else if (symmetryType === 1) {
        // Reflection symmetry
        const numShapes = layerDensity;

        for (let i = 0; i < numShapes; i++) {
            const color = palette[i % palette.length];
            ctx.fillStyle = color;

            const size = 10 + Math.random() * 30;
            const distance = 20 + Math.random() * 100;
            const angle = Math.random() * Math.PI;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            // Draw shape on both sides
            for (const sign of [-1, 1]) {
                ctx.beginPath();
                ctx.arc(x * sign, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else {
        // Kaleidoscope
        const numReflections = layerDensity;
        const segmentAngle = (Math.PI * 2) / numReflections;

        // Draw base pattern
        const basePattern = () => {
            const numShapes = 3 + Math.floor(Math.random() * 5);

            for (let i = 0; i < numShapes; i++) {
                const color = palette[i % palette.length];
                ctx.fillStyle = color;

                const size = 5 + Math.random() * 15;
                const distance = 20 + Math.random() * 80;
                const angle = Math.random() * (segmentAngle / 2);

                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Repeat and reflect the pattern
        for (let i = 0; i < numReflections; i++) {
            ctx.save();
            ctx.rotate(i * segmentAngle);
            basePattern();
            ctx.scale(-1, 1); // Reflect
            basePattern();
            ctx.restore();
        }
    }

    // Restore the context state
    ctx.restore();

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
}

/**
 * Draw a Flowing Lines layer
 */
function drawFlowingLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    const { width, height, frameCount = 0, mouseX = 0, mouseY = 0, isInteractive = false, layerDensity = 8 } = params;

    ctx.globalAlpha = opacity;

    // Set blend mode if specified
    if (params.blendMode && params.blendMode !== 'source-over') {
        ctx.globalCompositeOperation = params.blendMode;
    }

    // Number of flowing lines
    const numLines = layerDensity;

    // Create flow field parameters
    const fieldScale = 0.005;
    const fieldStrength = 50;
    const lineLength = 100 + Math.random() * 200;

    for (let i = 0; i < numLines; i++) {
        // Choose a color
        const color = palette[i % palette.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + Math.random() * 2;

        // Starting point
        let x = Math.random() * width;
        let y = Math.random() * height;

        // Add animation to starting point
        if (isAnimationFrame) {
            x += Math.sin(frameCount * 0.01 + i) * 10;
            y += Math.cos(frameCount * 0.01 + i) * 10;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Draw the flowing line
        for (let j = 0; j < lineLength; j++) {
            // Calculate flow field angle at this point
            const noiseX = x * fieldScale;
            const noiseY = y * fieldScale;
            const noiseValue = (Math.sin(noiseX) + Math.cos(noiseY)) * Math.PI;

            // Add animation to the flow field
            const animationOffset = isAnimationFrame ? Math.sin(frameCount * 0.01) * Math.PI * 0.2 : 0;
            const angle = noiseValue + animationOffset;

            // Calculate direction
            let dx = Math.cos(angle);
            let dy = Math.sin(angle);

            // Add interactivity
            if (isInteractive) {
                const distToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
                if (distToMouse < 200) {
                    const influence = Math.max(0, 1 - distToMouse / 200);
                    const mouseAngle = Math.atan2(y - mouseY, x - mouseX);

                    // Blend the flow field direction with direction away from mouse
                    dx = dx * (1 - influence) + Math.cos(mouseAngle) * influence;
                    dy = dy * (1 - influence) + Math.sin(mouseAngle) * influence;
                }
            }

            // Move in the calculated direction
            x += dx * fieldStrength * 0.1;
            y += dy * fieldStrength * 0.1;

            // Stop if we go out of bounds
            if (x < 0 || x > width || y < 0 || y > height) {
                break;
            }

            ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
}

// Export the default masterpiece drawing function
export { drawDefaultMasterpiece };
