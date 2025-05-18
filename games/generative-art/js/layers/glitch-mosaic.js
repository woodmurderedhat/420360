/**
 * js/layers/glitch-mosaic.js - Glitch Mosaic layer for the Generative Art Studio
 * Implements digital glitch effects and mosaic patterns
 */

/**
 * Draw a Glitch Mosaic layer
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array<string>} palette - The color palette
 * @param {boolean} isAnimationFrame - Whether this is an animation frame
 * @param {Object} params - Additional parameters (canvas dimensions, etc.)
 * @param {number} opacity - Opacity of the layer
 */
export function drawGlitchMosaicLayer(ctx, palette, isAnimationFrame, params, opacity = 1.0) {
    if (opacity === 0) return;

    const { canvasWidth, canvasHeight, seed, glitchMosaicDensity = 50 } = params;
    
    // Set global alpha for the layer
    ctx.globalAlpha = opacity;
    
    // Create a seeded random function
    const randomFn = createRandomFunction(seed || Math.floor(Math.random() * 1000000));
    
    // Convert density to usable parameters
    const density = glitchMosaicDensity / 100; // Convert 0-100 scale to 0-1
    
    // Calculate number of glitch effects based on density
    const numGlitches = Math.floor(5 + density * 15); // 5-20 glitches depending on density
    
    // Calculate mosaic cell size based on density (smaller cells = higher density)
    const cellSize = Math.max(5, Math.floor(50 - (density * 40))); // 10-50px cells
    
    // Create offscreen canvas for manipulation
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;
    const offCtx = offscreenCanvas.getContext('2d');
    
    // Copy current canvas content to offscreen canvas
    offCtx.drawImage(ctx.canvas, 0, 0);
    
    // Apply mosaic effect
    applyMosaicEffect(offCtx, canvasWidth, canvasHeight, cellSize);
    
    // Apply glitch effects
    for (let i = 0; i < numGlitches; i++) {
        // Choose a random glitch effect
        const glitchType = Math.floor(randomFn() * 4);
        
        switch (glitchType) {
            case 0:
                applyColorShiftGlitch(offCtx, canvasWidth, canvasHeight, randomFn);
                break;
            case 1:
                applySliceGlitch(offCtx, canvasWidth, canvasHeight, randomFn);
                break;
            case 2:
                applyPixelationGlitch(offCtx, canvasWidth, canvasHeight, randomFn, cellSize);
                break;
            case 3:
                applyNoiseGlitch(offCtx, canvasWidth, canvasHeight, randomFn, palette);
                break;
        }
    }
    
    // If this is an animation frame, add some dynamic glitches
    if (isAnimationFrame) {
        // Add time-based glitches that change with each frame
        const time = Date.now() * 0.001;
        
        // Scanline effect that moves over time
        applyScanlineEffect(offCtx, canvasWidth, canvasHeight, time);
        
        // Occasional "signal loss" effect
        if (Math.sin(time * 0.5) > 0.9) {
            applySignalLossEffect(offCtx, canvasWidth, canvasHeight, time);
        }
    }
    
    // Draw the modified canvas back to the main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

/**
 * Apply a mosaic/pixelation effect to the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} cellSize - Size of mosaic cells
 */
function applyMosaicEffect(ctx, width, height, cellSize) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create a temporary array to store the mosaic colors
    const tempData = new Uint8ClampedArray(data.length);
    
    // Apply mosaic effect
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Calculate average color for this cell
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            // Sample pixels in this cell
            for (let cy = 0; cy < cellSize && y + cy < height; cy++) {
                for (let cx = 0; cx < cellSize && x + cx < width; cx++) {
                    const pixelIndex = ((y + cy) * width + (x + cx)) * 4;
                    r += data[pixelIndex];
                    g += data[pixelIndex + 1];
                    b += data[pixelIndex + 2];
                    a += data[pixelIndex + 3];
                    count++;
                }
            }
            
            // Calculate average
            if (count > 0) {
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                a = Math.floor(a / count);
            }
            
            // Apply average color to all pixels in this cell
            for (let cy = 0; cy < cellSize && y + cy < height; cy++) {
                for (let cx = 0; cx < cellSize && x + cx < width; cx++) {
                    const pixelIndex = ((y + cy) * width + (x + cx)) * 4;
                    tempData[pixelIndex] = r;
                    tempData[pixelIndex + 1] = g;
                    tempData[pixelIndex + 2] = b;
                    tempData[pixelIndex + 3] = a;
                }
            }
        }
    }
    
    // Copy the mosaic data back to the original image data
    for (let i = 0; i < data.length; i++) {
        data[i] = tempData[i];
    }
    
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply a color shift glitch effect
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 */
function applyColorShiftGlitch(ctx, width, height, randomFn) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Determine shift amount
    const shiftX = Math.floor(randomFn() * 20) - 10; // -10 to 10 pixels
    const shiftY = Math.floor(randomFn() * 10) - 5; // -5 to 5 pixels
    
    // Choose which color channel to shift (0=R, 1=G, 2=B)
    const channelToShift = Math.floor(randomFn() * 3);
    
    // Create a temporary array to store the shifted colors
    const tempData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i++) {
        tempData[i] = data[i];
    }
    
    // Apply shift to the selected channel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            
            // Calculate shifted position
            const shiftedX = Math.max(0, Math.min(width - 1, x + shiftX));
            const shiftedY = Math.max(0, Math.min(height - 1, y + shiftY));
            const shiftedPixelIndex = (shiftedY * width + shiftedX) * 4;
            
            // Apply shift to the selected channel
            tempData[pixelIndex + channelToShift] = data[shiftedPixelIndex + channelToShift];
        }
    }
    
    // Copy the shifted data back to the original image data
    for (let i = 0; i < data.length; i++) {
        data[i] = tempData[i];
    }
    
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply a slice glitch effect (horizontal displacement)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 */
function applySliceGlitch(ctx, width, height, randomFn) {
    // Get the current canvas content
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Number of slices
    const numSlices = Math.floor(randomFn() * 5) + 2; // 2-6 slices
    
    // For each slice
    for (let i = 0; i < numSlices; i++) {
        // Determine slice position and height
        const sliceY = Math.floor(randomFn() * height);
        const sliceHeight = Math.floor(randomFn() * 30) + 5; // 5-35 pixels
        
        // Determine displacement amount
        const displacement = Math.floor(randomFn() * 40) - 20; // -20 to 20 pixels
        
        // Skip if displacement is 0
        if (displacement === 0) continue;
        
        // Create a temporary canvas for the slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = width;
        sliceCanvas.height = sliceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');
        
        // Draw the slice to the temporary canvas
        sliceCtx.drawImage(ctx.canvas, 
            0, sliceY, width, sliceHeight,
            0, 0, width, sliceHeight);
        
        // Clear the slice area on the main canvas
        ctx.clearRect(0, sliceY, width, sliceHeight);
        
        // Draw the slice back with displacement
        ctx.drawImage(sliceCanvas, displacement, sliceY);
    }
}

/**
 * Apply a pixelation glitch effect to random areas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {number} basePixelSize - Base pixel size for the effect
 */
function applyPixelationGlitch(ctx, width, height, randomFn, basePixelSize) {
    // Number of pixelated areas
    const numAreas = Math.floor(randomFn() * 3) + 1; // 1-3 areas
    
    for (let i = 0; i < numAreas; i++) {
        // Determine area position and size
        const areaX = Math.floor(randomFn() * width * 0.8);
        const areaY = Math.floor(randomFn() * height * 0.8);
        const areaWidth = Math.floor(randomFn() * (width - areaX) * 0.5) + 50;
        const areaHeight = Math.floor(randomFn() * (height - areaY) * 0.5) + 50;
        
        // Determine pixelation size (larger than base mosaic)
        const pixelSize = basePixelSize * (1 + randomFn() * 3); // 1-4x base size
        
        // Get the area image data
        const areaData = ctx.getImageData(areaX, areaY, areaWidth, areaHeight);
        
        // Create a temporary canvas for pixelation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = areaWidth;
        tempCanvas.height = areaHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw the area to the temporary canvas
        tempCtx.putImageData(areaData, 0, 0);
        
        // Clear the temporary canvas and redraw at a smaller size
        tempCtx.save();
        tempCtx.clearRect(0, 0, areaWidth, areaHeight);
        tempCtx.scale(1 / pixelSize, 1 / pixelSize);
        tempCtx.drawImage(tempCanvas, 0, 0);
        
        // Scale back up with pixelation
        tempCtx.scale(pixelSize, pixelSize);
        tempCtx.drawImage(tempCanvas, 0, 0, areaWidth / pixelSize, areaHeight / pixelSize, 
                         0, 0, areaWidth, areaHeight);
        tempCtx.restore();
        
        // Draw the pixelated area back to the main canvas
        ctx.drawImage(tempCanvas, areaX, areaY);
    }
}

/**
 * Apply a noise glitch effect
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} randomFn - Seeded random function
 * @param {Array<string>} palette - Color palette
 */
function applyNoiseGlitch(ctx, width, height, randomFn, palette) {
    // Number of noise areas
    const numAreas = Math.floor(randomFn() * 5) + 2; // 2-6 areas
    
    for (let i = 0; i < numAreas; i++) {
        // Determine area position and size
        const areaX = Math.floor(randomFn() * width * 0.9);
        const areaY = Math.floor(randomFn() * height * 0.9);
        const areaWidth = Math.floor(randomFn() * 100) + 20; // 20-120 pixels
        const areaHeight = Math.floor(randomFn() * 50) + 10; // 10-60 pixels
        
        // Get a color from the palette
        const colorIndex = Math.floor(randomFn() * palette.length);
        const color = palette[colorIndex];
        
        // Draw noise rectangle
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + randomFn() * 0.4; // 0.3-0.7 opacity
        ctx.fillRect(areaX, areaY, areaWidth, areaHeight);
        
        // Add some random lines for texture
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const x1 = areaX + randomFn() * areaWidth;
            const y1 = areaY + randomFn() * areaHeight;
            const x2 = areaX + randomFn() * areaWidth;
            const y2 = areaY + randomFn() * areaHeight;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    }
}

/**
 * Apply a scanline effect that moves over time
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time value
 */
function applyScanlineEffect(ctx, width, height, time) {
    // Calculate scanline position based on time
    const scanlineY = (height * 0.5 * Math.sin(time * 2) + height * 0.5) % height;
    const scanlineHeight = 2 + Math.sin(time * 5) * 2; // 0-4 pixels
    
    // Draw scanline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, scanlineY, width, scanlineHeight);
    
    // Add a second, more subtle scanline
    const scanlineY2 = (height * 0.5 * Math.sin(time * 3 + 1) + height * 0.5) % height;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(0, scanlineY2, width, 1);
}

/**
 * Apply a "signal loss" effect
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time value
 */
function applySignalLossEffect(ctx, width, height, time) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply distortion
    for (let y = 0; y < height; y++) {
        // Calculate distortion amount based on y position and time
        const distortionX = Math.sin(y * 0.1 + time * 10) * 10;
        
        for (let x = 0; x < width; x++) {
            // Calculate source and destination positions
            const destIndex = (y * width + x) * 4;
            const srcX = Math.floor(x + distortionX) % width;
            const srcIndex = (y * width + srcX) * 4;
            
            // Copy pixel data with distortion
            if (srcIndex >= 0 && srcIndex < data.length - 3) {
                data[destIndex] = data[srcIndex];
                data[destIndex + 1] = data[srcIndex + 1];
                data[destIndex + 2] = data[srcIndex + 2];
            }
        }
    }
    
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Create a deterministic random function based on a seed
 * @param {number} seed - The random seed
 * @returns {Function} A seeded random function
 */
function createRandomFunction(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
