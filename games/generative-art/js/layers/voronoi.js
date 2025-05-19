/**
 * js/layers/voronoi.js - Voronoi Cells layer for the Generative Art Studio
 */

/**
 * Draw a reduced Voronoi Cells layer with enhanced randomization
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawVoronoiCellsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    // Extract parameters with defaults
    const {
        canvasWidth,
        canvasHeight,
        seed,
        voronoiDensity = 50,
        randomFactor = Math.random(), // Use randomFactor if provided
        distortionAmount = Math.random() * 0.2,
        scaleAmount = 1.0
    } = params;

    // Create a seeded random function if seed is provided
    const seedRandom = seed ?
        (() => {
            let seedValue = parseInt(seed, 10) || Date.now();
            return () => {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                return seedValue / 233280;
            };
        })() :
        Math.random;

    // Calculate number of points based on density with more variation
    const densityVariation = 0.5 + seedRandom() * 1.5; // 0.5 to 2.0 multiplier
    const numPoints = Math.floor((voronoiDensity / 100 * 200 * densityVariation) + 10);

    // Set global alpha for the layer
    ctx.globalAlpha = opacity;

    // Choose a random rendering style for the Voronoi cells
    const renderStyle = Math.floor(seedRandom() * 4); // 0-3 different styles

    // Generate points for Voronoi cells
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: seedRandom() * canvasWidth,
            y: seedRandom() * canvasHeight,
            color: palette[Math.floor(seedRandom() * palette.length)]
        });
    }

    // Draw based on the selected style
    switch (renderStyle) {
        case 0: // Circular cells
            for (const point of points) {
                const size = seedRandom() * 50 * scaleAmount + 10;
                ctx.fillStyle = point.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();

                // Sometimes add a stroke
                if (seedRandom() < 0.3) {
                    ctx.strokeStyle = palette[Math.floor(seedRandom() * palette.length)];
                    ctx.lineWidth = 1 + seedRandom() * 2;
                    ctx.stroke();
                }
            }
            break;

        case 1: // Rectangular cells
            for (const point of points) {
                const width = (seedRandom() * 60 + 20) * scaleAmount;
                const height = (seedRandom() * 60 + 20) * scaleAmount;
                const rotation = seedRandom() * Math.PI * 2;

                ctx.fillStyle = point.color;
                ctx.save();
                ctx.translate(point.x, point.y);
                ctx.rotate(rotation);
                ctx.fillRect(-width/2, -height/2, width, height);

                // Sometimes add a stroke
                if (seedRandom() < 0.4) {
                    ctx.strokeStyle = palette[Math.floor(seedRandom() * palette.length)];
                    ctx.lineWidth = 1 + seedRandom() * 3;
                    ctx.strokeRect(-width/2, -height/2, width, height);
                }

                ctx.restore();
            }
            break;

        case 2: // Polygon cells
            for (const point of points) {
                const sides = Math.floor(seedRandom() * 4) + 3; // 3-6 sides
                const size = (seedRandom() * 40 + 15) * scaleAmount;
                const rotation = seedRandom() * Math.PI * 2;

                ctx.fillStyle = point.color;
                ctx.save();
                ctx.translate(point.x, point.y);
                ctx.rotate(rotation);

                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const distortion = 1 + (seedRandom() * 2 - 1) * distortionAmount;
                    const x = Math.cos(angle) * size * distortion;
                    const y = Math.sin(angle) * size * distortion;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();

                // Add stroke with probability
                if (seedRandom() < 0.5) {
                    ctx.strokeStyle = palette[Math.floor(seedRandom() * palette.length)];
                    ctx.lineWidth = 1 + seedRandom() * 2;
                    ctx.stroke();
                }

                ctx.restore();
            }
            break;

        case 3: // Overlapping transparent cells
            // Use semi-transparent colors
            for (const point of points) {
                const color = point.color;
                // Extract HSL values from the color string
                const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                if (hslMatch) {
                    const h = parseInt(hslMatch[1], 10);
                    const s = parseInt(hslMatch[2], 10);
                    const l = parseInt(hslMatch[3], 10);
                    // Create semi-transparent version
                    const alpha = 0.2 + seedRandom() * 0.4; // 0.2 to 0.6 alpha
                    ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
                } else {
                    ctx.fillStyle = color;
                }

                const size = (seedRandom() * 80 + 30) * scaleAmount;
                ctx.beginPath();

                // Create irregular blob shape
                const blobPoints = Math.floor(seedRandom() * 5) + 5; // 5-9 points
                for (let i = 0; i < blobPoints; i++) {
                    const angle = (i / blobPoints) * Math.PI * 2;
                    const distortion = 1 + (seedRandom() * 2 - 1) * distortionAmount * 2;
                    const x = point.x + Math.cos(angle) * size * distortion;
                    const y = point.y + Math.sin(angle) * size * distortion;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        // Use bezier curves for smoother shapes
                        const prevAngle = ((i - 1) / blobPoints) * Math.PI * 2;
                        const prevX = point.x + Math.cos(prevAngle) * size * (1 + (seedRandom() * 2 - 1) * distortionAmount * 2);
                        const prevY = point.y + Math.sin(prevAngle) * size * (1 + (seedRandom() * 2 - 1) * distortionAmount * 2);

                        const cpX1 = prevX + (x - prevX) * 0.3 + (seedRandom() * 20 - 10);
                        const cpY1 = prevY + (y - prevY) * 0.3 + (seedRandom() * 20 - 10);
                        const cpX2 = prevX + (x - prevX) * 0.7 + (seedRandom() * 20 - 10);
                        const cpY2 = prevY + (y - prevY) * 0.7 + (seedRandom() * 20 - 10);

                        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
            }
            break;
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0;
}
