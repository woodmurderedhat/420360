/**
 * js/layers/flowing-lines.js - Flowing Lines layer for the Generative Art Studio
 * Creates curved, flowing line patterns with organic movement
 */

/**
 * Draw a Flowing Lines layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, density, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawFlowingLinesLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, flowingLinesDensity = 50, lineWidth = 1 } = params;
    
    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);
    
    // Save the current context state
    ctx.save();
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Determine line style based on density
    // Higher density means more lines
    const numLines = Math.floor(5 + (flowingLinesDensity / 100) * 20); // 5-25 lines
    
    // Determine line complexity
    const complexity = Math.floor(3 + (flowingLinesDensity / 100) * 7); // 3-10 segments per line
    
    // Determine flow style (smooth, wavy, or chaotic)
    const flowStyle = randomFn() < 0.33 ? 'smooth' : 
                      randomFn() < 0.66 ? 'wavy' : 'chaotic';
    
    // Animation parameters
    const time = isAnimationFrame ? Date.now() * 0.001 : 0;
    const animationSpeed = isAnimationFrame ? 0.2 + randomFn() * 0.3 : 0;
    
    // Draw the flowing lines
    for (let i = 0; i < numLines; i++) {
        // Choose a color from the palette
        const color = palette[Math.floor(randomFn() * palette.length)];
        ctx.strokeStyle = color;
        
        // Set line width (vary slightly for more organic feel)
        ctx.lineWidth = lineWidth * (0.5 + randomFn() * 1.0);
        
        // Set line cap and join for smoother lines
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw a flowing line based on the selected style
        switch (flowStyle) {
            case 'smooth':
                drawSmoothLine(ctx, canvasWidth, canvasHeight, complexity, randomFn, time, animationSpeed);
                break;
            case 'wavy':
                drawWavyLine(ctx, canvasWidth, canvasHeight, complexity, randomFn, time, animationSpeed);
                break;
            case 'chaotic':
                drawChaoticLine(ctx, canvasWidth, canvasHeight, complexity, randomFn, time, animationSpeed);
                break;
        }
    }
    
    // Restore the context state
    ctx.restore();
}

/**
 * Draw a smooth flowing line using Bezier curves
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Number of segments in the line
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} animationSpeed - Speed of animation
 */
function drawSmoothLine(ctx, width, height, complexity, randomFn, time, animationSpeed) {
    // Generate control points for the Bezier curve
    const points = generateControlPoints(width, height, complexity, randomFn);
    
    // Apply animation if needed
    if (time > 0) {
        animatePoints(points, time, animationSpeed, randomFn);
    }
    
    // Draw the Bezier curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i += 3) {
        // Make sure we have enough points for a Bezier curve
        if (i + 2 < points.length) {
            ctx.bezierCurveTo(
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y,
                points[i + 2].x, points[i + 2].y
            );
        } else {
            // If we don't have enough points, just draw a line to the last point
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    
    ctx.stroke();
}

/**
 * Draw a wavy flowing line with sine wave modulation
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Number of segments in the line
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} animationSpeed - Speed of animation
 */
function drawWavyLine(ctx, width, height, complexity, randomFn, time, animationSpeed) {
    // Generate base control points
    const points = generateControlPoints(width, height, complexity, randomFn);
    
    // Apply animation if needed
    if (time > 0) {
        animatePoints(points, time, animationSpeed, randomFn);
    }
    
    // Apply sine wave modulation to the points
    const waveFrequency = 0.1 + randomFn() * 0.2;
    const waveAmplitude = 10 + randomFn() * 20;
    
    for (let i = 0; i < points.length; i++) {
        const phase = i * waveFrequency + time * animationSpeed;
        points[i].x += Math.sin(phase) * waveAmplitude;
        points[i].y += Math.cos(phase) * waveAmplitude;
    }
    
    // Draw the Bezier curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i += 3) {
        if (i + 2 < points.length) {
            ctx.bezierCurveTo(
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y,
                points[i + 2].x, points[i + 2].y
            );
        } else {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    
    ctx.stroke();
}

/**
 * Draw a chaotic flowing line with noise-based direction
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Number of segments in the line
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} animationSpeed - Speed of animation
 */
function drawChaoticLine(ctx, width, height, complexity, randomFn, time, animationSpeed) {
    // Start at a random position
    const startX = randomFn() * width;
    const startY = randomFn() * height;
    
    // Set initial direction
    let angle = randomFn() * Math.PI * 2;
    
    // Set step size
    const stepSize = 10 + randomFn() * 20;
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    let x = startX;
    let y = startY;
    
    for (let i = 0; i < complexity * 3; i++) {
        // Use noise to change the direction
        angle += (randomFn() - 0.5) * 0.5;
        
        // Apply animation if needed
        if (time > 0) {
            angle += Math.sin(time * animationSpeed + i * 0.1) * 0.2;
        }
        
        // Calculate new position
        x += Math.cos(angle) * stepSize;
        y += Math.sin(angle) * stepSize;
        
        // Keep within bounds
        x = Math.max(0, Math.min(width, x));
        y = Math.max(0, Math.min(height, y));
        
        // Draw line segment
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
}

/**
 * Generate control points for a Bezier curve
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Number of segments in the line
 * @param {Function} randomFn - Seeded random function
 * @returns {Array<Object>} Array of control points
 */
function generateControlPoints(width, height, complexity, randomFn) {
    const points = [];
    
    // Start at a random position
    const startX = randomFn() * width;
    const startY = randomFn() * height;
    points.push({ x: startX, y: startY });
    
    // Generate control points for each segment
    for (let i = 0; i < complexity; i++) {
        // Generate three control points for each Bezier curve segment
        for (let j = 0; j < 3; j++) {
            // Calculate position with some randomness
            // but ensure points are somewhat connected for smooth curves
            const prevPoint = points[points.length - 1];
            const distance = 50 + randomFn() * 100;
            const angle = randomFn() * Math.PI * 2;
            
            const x = prevPoint.x + Math.cos(angle) * distance;
            const y = prevPoint.y + Math.sin(angle) * distance;
            
            // Keep within bounds
            const boundedX = Math.max(0, Math.min(width, x));
            const boundedY = Math.max(0, Math.min(height, y));
            
            points.push({ x: boundedX, y: boundedY });
        }
    }
    
    return points;
}

/**
 * Animate control points
 * @param {Array<Object>} points - Array of control points
 * @param {number} time - Current time
 * @param {number} speed - Animation speed
 * @param {Function} randomFn - Seeded random function
 */
function animatePoints(points, time, speed, randomFn) {
    for (let i = 0; i < points.length; i++) {
        // Generate a unique phase for each point
        const phase = i * 0.1 + time * speed;
        
        // Apply circular motion
        const radius = 5 + randomFn() * 10;
        points[i].x += Math.sin(phase) * radius;
        points[i].y += Math.cos(phase) * radius;
    }
}

/**
 * Create a seeded random function
 * @param {number} seed - The random seed
 * @returns {Function} A seeded random function
 */
function createRandomFunction(seed) {
    return function() {
        // Simple seeded random function
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
