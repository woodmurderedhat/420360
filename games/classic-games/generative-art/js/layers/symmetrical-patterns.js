/**
 * js/layers/symmetrical-patterns.js - Symmetrical Patterns layer for the Generative Art Studio
 * Creates symmetrical and mandala-like patterns with radial or reflective symmetry
 */

/**
 * Draw a Symmetrical Patterns layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, density, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawSymmetricalPatternsLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, symmetricalPatternsDensity = 50 } = params;
    
    // Create a seeded random function
    const seedValue = seed || Math.floor(Math.random() * 1000000);
    const randomFn = createRandomFunction(seedValue);
    
    // Save the current context state
    ctx.save();
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Determine pattern type (radial, reflective, or kaleidoscope)
    const patternType = randomFn() < 0.33 ? 'radial' : 
                        randomFn() < 0.66 ? 'reflective' : 'kaleidoscope';
    
    // Calculate center of the canvas
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Calculate pattern parameters based on density
    // Higher density means more complex patterns
    const complexity = Math.floor(3 + (symmetricalPatternsDensity / 100) * 12); // 3-15 elements
    
    // Animation parameters
    const time = isAnimationFrame ? Date.now() * 0.001 : 0;
    const rotationSpeed = isAnimationFrame ? 0.2 + randomFn() * 0.3 : 0;
    const pulseAmount = isAnimationFrame ? 0.1 + randomFn() * 0.2 : 0;
    
    // Draw the selected pattern type
    switch (patternType) {
        case 'radial':
            drawRadialPattern(ctx, centerX, centerY, complexity, palette, randomFn, time, rotationSpeed, pulseAmount);
            break;
        case 'reflective':
            drawReflectivePattern(ctx, canvasWidth, canvasHeight, complexity, palette, randomFn, time, rotationSpeed);
            break;
        case 'kaleidoscope':
            drawKaleidoscopePattern(ctx, centerX, centerY, complexity, palette, randomFn, time, rotationSpeed, pulseAmount);
            break;
    }
    
    // Restore the context state
    ctx.restore();
}

/**
 * Draw a radial symmetry pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} complexity - Pattern complexity
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} rotationSpeed - Rotation speed for animation
 * @param {number} pulseAmount - Amount of pulsing for animation
 */
function drawRadialPattern(ctx, centerX, centerY, complexity, palette, randomFn, time, rotationSpeed, pulseAmount) {
    // Determine number of segments in the radial pattern
    const numSegments = Math.max(4, Math.floor(complexity * 1.5)); // At least 4 segments
    
    // Determine radius of the pattern
    const maxRadius = Math.min(centerX, centerY) * 0.85;
    
    // Choose shape type for the pattern
    const shapeType = randomFn() < 0.33 ? 'circle' : 
                      randomFn() < 0.66 ? 'triangle' : 'line';
    
    // Choose colors from palette
    const colors = [];
    const numColors = Math.min(palette.length, 3 + Math.floor(randomFn() * 3)); // 3-5 colors
    
    for (let i = 0; i < numColors; i++) {
        colors.push(palette[Math.floor(randomFn() * palette.length)]);
    }
    
    // Animation effects
    const rotation = time * rotationSpeed;
    const pulse = pulseAmount > 0 ? Math.sin(time * 2) * pulseAmount + 1 : 1;
    
    // Draw the radial pattern
    for (let i = 0; i < numSegments; i++) {
        // Calculate angle for this segment
        const angle = (i / numSegments) * Math.PI * 2 + rotation;
        
        // Choose color for this segment
        const color = colors[i % colors.length];
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        
        // Calculate radius for this segment (can vary for more interesting patterns)
        const radius = maxRadius * (0.7 + randomFn() * 0.3) * pulse;
        
        // Draw the shape based on type
        switch (shapeType) {
            case 'circle':
                drawRadialCircle(ctx, centerX, centerY, angle, radius, randomFn);
                break;
            case 'triangle':
                drawRadialTriangle(ctx, centerX, centerY, angle, radius, randomFn);
                break;
            case 'line':
                drawRadialLine(ctx, centerX, centerY, angle, radius, randomFn);
                break;
        }
    }
    
    // Add some decorative elements in the center
    drawCenterDecoration(ctx, centerX, centerY, maxRadius * 0.3, colors, randomFn, time);
}

/**
 * Draw a circle in a radial pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} angle - Angle of the circle
 * @param {number} radius - Maximum radius
 * @param {Function} randomFn - Seeded random function
 */
function drawRadialCircle(ctx, centerX, centerY, angle, radius, randomFn) {
    // Calculate position of the circle
    const distance = radius * (0.3 + randomFn() * 0.7);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Calculate size of the circle
    const circleRadius = radius * (0.05 + randomFn() * 0.15);
    
    // Draw the circle
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
    
    // Randomly fill or stroke
    if (randomFn() < 0.7) {
        ctx.fill();
    } else {
        ctx.lineWidth = 2 + randomFn() * 3;
        ctx.stroke();
    }
}

/**
 * Draw a triangle in a radial pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} angle - Angle of the triangle
 * @param {number} radius - Maximum radius
 * @param {Function} randomFn - Seeded random function
 */
function drawRadialTriangle(ctx, centerX, centerY, angle, radius, randomFn) {
    // Calculate position of the triangle
    const distance = radius * (0.3 + randomFn() * 0.7);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Calculate size of the triangle
    const size = radius * (0.1 + randomFn() * 0.2);
    
    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.866, y + size * 0.5); // 30 degrees
    ctx.lineTo(x - size * 0.866, y + size * 0.5); // -30 degrees
    ctx.closePath();
    
    // Randomly fill or stroke
    if (randomFn() < 0.7) {
        ctx.fill();
    } else {
        ctx.lineWidth = 2 + randomFn() * 3;
        ctx.stroke();
    }
}

/**
 * Draw a line in a radial pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} angle - Angle of the line
 * @param {number} radius - Maximum radius
 * @param {Function} randomFn - Seeded random function
 */
function drawRadialLine(ctx, centerX, centerY, angle, radius, randomFn) {
    // Calculate start and end points of the line
    const innerRadius = radius * (0.1 + randomFn() * 0.3);
    const outerRadius = radius * (0.7 + randomFn() * 0.3);
    
    const x1 = centerX + Math.cos(angle) * innerRadius;
    const y1 = centerY + Math.sin(angle) * innerRadius;
    const x2 = centerX + Math.cos(angle) * outerRadius;
    const y2 = centerY + Math.sin(angle) * outerRadius;
    
    // Draw the line
    ctx.lineWidth = 2 + randomFn() * 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * Draw decorative elements in the center of a radial pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} radius - Radius of the center decoration
 * @param {Array<string>} colors - Colors to use
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 */
function drawCenterDecoration(ctx, centerX, centerY, radius, colors, randomFn, time) {
    // Choose a decoration type
    const decorationType = randomFn() < 0.5 ? 'circles' : 'star';
    
    // Animation effect
    const rotation = time * 0.5;
    
    switch (decorationType) {
        case 'circles':
            // Draw concentric circles
            const numCircles = 3 + Math.floor(randomFn() * 3);
            
            for (let i = 0; i < numCircles; i++) {
                const circleRadius = radius * (1 - i / numCircles);
                ctx.strokeStyle = colors[i % colors.length];
                ctx.lineWidth = 1 + randomFn() * 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            break;
            
        case 'star':
            // Draw a star
            const numPoints = 5 + Math.floor(randomFn() * 4);
            const innerRadius = radius * 0.4;
            const outerRadius = radius;
            
            ctx.fillStyle = colors[0];
            ctx.beginPath();
            
            for (let i = 0; i < numPoints * 2; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const a = (i / (numPoints * 2)) * Math.PI * 2 + rotation;
                
                const x = centerX + Math.cos(a) * r;
                const y = centerY + Math.sin(a) * r;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fill();
            break;
    }
}

/**
 * Draw a reflective symmetry pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Pattern complexity
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} rotationSpeed - Rotation speed for animation
 */
function drawReflectivePattern(ctx, width, height, complexity, palette, randomFn, time, rotationSpeed) {
    // Determine number of axes for reflection
    const numAxes = 2 + Math.floor(randomFn() * 3); // 2-4 axes
    
    // Choose colors from palette
    const colors = [];
    const numColors = Math.min(palette.length, 3 + Math.floor(randomFn() * 3)); // 3-5 colors
    
    for (let i = 0; i < numColors; i++) {
        colors.push(palette[Math.floor(randomFn() * palette.length)]);
    }
    
    // Animation effects
    const rotation = time * rotationSpeed;
    
    // Create a temporary canvas for drawing the base pattern
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the base pattern
    drawBasePattern(tempCtx, width, height, complexity, colors, randomFn);
    
    // Apply reflections
    for (let i = 0; i < numAxes; i++) {
        const angle = (i / numAxes) * Math.PI + rotation;
        applyReflection(ctx, tempCanvas, width, height, angle);
    }
}

/**
 * Draw a base pattern for reflection
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} complexity - Pattern complexity
 * @param {Array<string>} colors - Colors to use
 * @param {Function} randomFn - Seeded random function
 */
function drawBasePattern(ctx, width, height, complexity, colors, randomFn) {
    // Draw random shapes in one quadrant
    const numShapes = 5 + Math.floor(complexity * 1.5);
    
    for (let i = 0; i < numShapes; i++) {
        // Choose a random position in the first quadrant
        const x = randomFn() * width / 2;
        const y = randomFn() * height / 2;
        
        // Choose a random size
        const size = 10 + randomFn() * 30;
        
        // Choose a random color
        ctx.fillStyle = colors[Math.floor(randomFn() * colors.length)];
        
        // Choose a random shape
        const shapeType = randomFn() < 0.33 ? 'circle' : 
                          randomFn() < 0.66 ? 'rectangle' : 'triangle';
        
        // Draw the shape
        switch (shapeType) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'rectangle':
                ctx.fillRect(x - size / 2, y - size / 2, size, size);
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }
}

/**
 * Apply reflection to a pattern
 * @param {CanvasRenderingContext2D} ctx - The destination canvas context
 * @param {HTMLCanvasElement} sourceCanvas - The source canvas with the base pattern
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} angle - Angle of reflection axis
 */
function applyReflection(ctx, sourceCanvas, width, height, angle) {
    // Save context state
    ctx.save();
    
    // Translate to center
    ctx.translate(width / 2, height / 2);
    
    // Rotate to the reflection axis angle
    ctx.rotate(angle);
    
    // Draw the original pattern
    ctx.drawImage(sourceCanvas, -width / 2, -height / 2);
    
    // Apply reflection (scale by -1 in the x direction)
    ctx.scale(-1, 1);
    
    // Draw the reflected pattern
    ctx.drawImage(sourceCanvas, -width / 2, -height / 2);
    
    // Restore context state
    ctx.restore();
}

/**
 * Draw a kaleidoscope pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} complexity - Pattern complexity
 * @param {Array<string>} palette - The color palette
 * @param {Function} randomFn - Seeded random function
 * @param {number} time - Current time for animation
 * @param {number} rotationSpeed - Rotation speed for animation
 * @param {number} pulseAmount - Amount of pulsing for animation
 */
function drawKaleidoscopePattern(ctx, centerX, centerY, complexity, palette, randomFn, time, rotationSpeed, pulseAmount) {
    // Determine number of segments in the kaleidoscope
    const numSegments = 6 + Math.floor(randomFn() * 6) * 2; // 6, 8, 10, 12, 14, 16
    
    // Determine radius of the kaleidoscope
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Choose colors from palette
    const colors = [];
    const numColors = Math.min(palette.length, 3 + Math.floor(randomFn() * 3)); // 3-5 colors
    
    for (let i = 0; i < numColors; i++) {
        colors.push(palette[Math.floor(randomFn() * palette.length)]);
    }
    
    // Animation effects
    const rotation = time * rotationSpeed;
    const pulse = pulseAmount > 0 ? Math.sin(time * 2) * pulseAmount + 1 : 1;
    
    // Create a temporary canvas for drawing a single segment
    const segmentCanvas = document.createElement('canvas');
    segmentCanvas.width = maxRadius;
    segmentCanvas.height = maxRadius;
    const segmentCtx = segmentCanvas.getContext('2d');
    
    // Draw the base segment
    drawKaleidoscopeSegment(segmentCtx, maxRadius, complexity, colors, randomFn);
    
    // Draw the kaleidoscope by repeating the segment
    for (let i = 0; i < numSegments; i++) {
        // Calculate angle for this segment
        const angle = (i / numSegments) * Math.PI * 2 + rotation;
        
        // Save context state
        ctx.save();
        
        // Move to center and rotate
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Apply pulse effect if animating
        if (pulse !== 1) {
            ctx.scale(pulse, pulse);
        }
        
        // Draw the segment
        ctx.drawImage(segmentCanvas, 0, 0);
        
        // Restore context state
        ctx.restore();
    }
}

/**
 * Draw a single segment for a kaleidoscope pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} radius - Radius of the segment
 * @param {number} complexity - Pattern complexity
 * @param {Array<string>} colors - Colors to use
 * @param {Function} randomFn - Seeded random function
 */
function drawKaleidoscopeSegment(ctx, radius, complexity, colors, randomFn) {
    // Draw random shapes in the segment
    const numShapes = 5 + Math.floor(complexity * 1.5);
    
    for (let i = 0; i < numShapes; i++) {
        // Choose a random position in the segment (polar coordinates)
        const r = randomFn() * radius;
        const theta = randomFn() * Math.PI / 6; // 30 degrees
        
        // Convert to Cartesian coordinates
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        // Choose a random size
        const size = 5 + randomFn() * 20;
        
        // Choose a random color
        ctx.fillStyle = colors[Math.floor(randomFn() * colors.length)];
        
        // Choose a random shape
        const shapeType = randomFn() < 0.33 ? 'circle' : 
                          randomFn() < 0.66 ? 'rectangle' : 'triangle';
        
        // Draw the shape
        switch (shapeType) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'rectangle':
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(theta);
                ctx.fillRect(-size / 2, -size / 2, size, size);
                ctx.restore();
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
                break;
        }
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
