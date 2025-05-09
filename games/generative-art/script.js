// README is in index.html

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const regenerateButton = document.getElementById('regenerateButton');
const exportButton = document.getElementById('exportButton');
const styleSelector = document.getElementById('styleSelector');
const currentStyleDisplaySpan = document.querySelector('#currentStyleDisplay span');

// New bindings for additional controls
const numShapesInput      = document.getElementById('numShapes');
const lineWidthInput      = document.getElementById('lineWidth');
const canvasWidthInput    = document.getElementById('canvasWidth');
const canvasHeightInput   = document.getElementById('canvasHeight');
const seedInput           = document.getElementById('seedInput');
const applySettingsBtn    = document.getElementById('applySettings');
const randomSeedButton    = document.getElementById('randomSeedButton');
const togglePanelButton   = document.getElementById('togglePanelButton');
const controlsPanel       = document.getElementById('controlsPanel');
const currentSeedDisplay  = document.querySelector('#currentSeedDisplay span');

// Display elements for slider values
const numShapesDisplay = document.getElementById('numShapesValue');
const lineWidthDisplay = document.getElementById('lineWidthValue');
numShapesDisplay.textContent = numShapesInput.value;
lineWidthDisplay.textContent = lineWidthInput.value;
numShapesInput.addEventListener('input', () => {
    numShapesDisplay.textContent = numShapesInput.value;
});
lineWidthInput.addEventListener('input', () => {
    lineWidthDisplay.textContent = lineWidthInput.value;
});

const artStyles = {
    DEFAULT: 'Default',
    GEOMETRIC_GRID: 'Geometric Grid',
    ORGANIC_NOISE: 'Organic Noise',
    FRACTAL_LINES: 'Fractal Lines',
    PARTICLE_SWARM: 'Particle Swarm',
    ORGANIC_SPLATTERS: 'Organic Splatters',
    GLITCH_MOSAIC: 'Glitch Mosaic',
};

let currentArtStyle = artStyles.GEOMETRIC_GRID; // Default art style

// Default parameters
let numShapes = +numShapesInput.value;
let lineWidth = +lineWidthInput.value;
let seedValue = null;
let seedNumber = 1;
const originalRandom = Math.random;

// Simple seeded random (LCG)
function seededRandom() {
    seedNumber = (seedNumber * 9301 + 49297) % 233280;
    return seedNumber / 233280;
}

function rnd() {
    return seedValue != null ? seededRandom() : originalRandom();
}
// Use rnd() globally for randomness
Math.random = rnd;

// Hash a string to integer for seeding
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}
// Local storage key for settings
const settingsKey = 'generativeArtSettings';

// Load saved settings if present
function loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
        try {
            const s = JSON.parse(saved);
            if (s.numShapes) {
                numShapesInput.value = s.numShapes;
                numShapes = +s.numShapes;
            }
            if (s.lineWidth) {
                lineWidthInput.value = s.lineWidth;
                lineWidth = +s.lineWidth;
            }
            if (s.canvasWidth) canvasWidthInput.value = s.canvasWidth;
            if (s.canvasHeight) canvasHeightInput.value = s.canvasHeight;
            if (s.seed) {
                seedInput.value = s.seed;
                seedValue = hashString(s.seed);
                seedNumber = seedValue;
                Math.random = rnd;
            } else {
                seedInput.value = '';
                seedValue = null;
                Math.random = originalRandom;
            }
            if (s.style) {
                currentArtStyle = s.style;
                styleSelector.value = currentArtStyle;
                currentStyleDisplaySpan.textContent = currentArtStyle;
            }
            // Update UI displays
            numShapesDisplay.textContent = numShapesInput.value;
            lineWidthDisplay.textContent = lineWidthInput.value;
            currentSeedDisplay.textContent = seedInput.value || 'random';
        } catch {}
    }
}

/**
 * Initializes the canvas dimensions and sets up event listeners.
 */
function initCanvas() {
    // Reset any existing transformations to avoid cumulative scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = window.devicePixelRatio || 1;
    // Use custom dimensions if provided, otherwise fill viewport
    const w = +canvasWidthInput.value || window.innerWidth;
    const h = +canvasHeightInput.value || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    drawArtwork(currentArtStyle);
}

/**
 * Generates a random HSL color palette based on the selected art style.
 * @param {string} style - The current art style.
 * @returns {Array<string>} An array of HSL color strings.
 */
function generatePalette(style) {
    const baseHue = Math.random() * 360;
    const palette = [];
    let numColors = 5;
    let saturation = 70 + Math.random() * 30;
    let lightness = 50 + Math.random() * 20;

    switch (style) {
        case artStyles.GEOMETRIC_GRID:
            numColors = Math.random() < 0.5 ? 3 : 5;
            saturation = Math.random() < 0.5 ? (30 + Math.random() * 20) : (70 + Math.random() * 20);
            lightness = Math.random() < 0.5 ? (70 + Math.random() * 15) : (40 + Math.random() * 20);
            for (let i = 0; i < numColors; i++) {
                const hue = (baseHue + (i * (Math.random() < 0.5 ? (360 / numColors) : 180))) % 360;
                palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            break;
        case artStyles.ORGANIC_NOISE:
            numColors = 7;
            saturation = 60 + Math.random() * 25;
            lightness = 55 + Math.random() * 20;
            for (let i = 0; i < numColors; i++) {
                const hue = (baseHue + (i * (15 + Math.random() * 20))) % 360;
                palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            break;
        case artStyles.FRACTAL_LINES:
            palette.push(`hsl(${baseHue}, ${80 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`);
            palette.push(`hsl(${(baseHue + 180 + (Math.random() - 0.5) * 60) % 360}, ${80 + Math.random() * 20}%, ${70 + Math.random() * 20}%)`);
            break;
        case artStyles.PARTICLE_SWARM:
            numColors = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numColors; i++) {
                const hue = (baseHue + i * (120 + Math.random() * 60)) % 360;
                palette.push(`hsl(${hue}, ${90 + Math.random() * 10}%, ${50 + Math.random() * 10}%)`);
            }
            break;
        case artStyles.ORGANIC_SPLATTERS:
            numColors = 4;
            saturation = 75 + Math.random() * 25;
            lightness = 45 + Math.random() * 15;
            for (let i = 0; i < numColors; i++) {
                const hue = (baseHue + (i * (90 + Math.random() * 30))) % 360;
                palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            break;
        case artStyles.GLITCH_MOSAIC:
            if (Math.random() < 0.5) {
                numColors = 6;
                for (let i = 0; i < numColors; i++) {
                    palette.push(`hsl(${Math.random() * 360}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 25}%)`);
                }
            } else {
                const accentHue = Math.random() * 360;
                palette.push(`hsl(${accentHue}, ${80 + Math.random() * 20}%, ${50 + Math.random() * 10}%)`);
                palette.push(`hsl(0, 0%, ${20 + Math.random() * 10}%)`);
                palette.push(`hsl(0, 0%, ${50 + Math.random() * 10}%)`);
                palette.push(`hsl(0, 0%, ${80 + Math.random() * 10}%)`);
            }
            break;
        default:
            for (let i = 0; i < numColors; i++) {
                const hue = (baseHue + (i * (360 / numColors))) % 360;
                palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
    }
    return palette;
}

/**
 * Draws a single primitive based on the selected art style.
 * @param {string} style - The current art style.
 * @param {Array<string>} palette - The color palette to use.
 */
function drawPrimitive(style, palette) {
    switch (style) {
        case artStyles.GEOMETRIC_GRID:
            drawGeometricGridPrimitive(palette);
            break;
        case artStyles.ORGANIC_NOISE:
            drawOrganicNoisePrimitive(palette);
            break;
        case artStyles.FRACTAL_LINES:
            break;
        case artStyles.PARTICLE_SWARM:
            break;
        case artStyles.ORGANIC_SPLATTERS:
            drawOrganicSplattersPrimitive(palette);
            break;
        case artStyles.GLITCH_MOSAIC:
            break;
        default:
            drawRandomShapePrimitive(palette);
            break;
    }
}

/**
 * Draws a random shape primitive (original logic).
 * @param {Array<string>} palette - The color palette to use.
 */
function drawRandomShapePrimitive(palette) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const strokeWidth = 0.5 + Math.random() * 4.5;
    const shouldFill = Math.random() < 0.2;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = color;

    const primitiveType = Math.floor(Math.random() * 5);

    switch (primitiveType) {
        case 0:
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 200);
            ctx.stroke();
            break;
        case 1:
            ctx.beginPath();
            if (shouldFill) {
                ctx.globalAlpha = 0.1 + Math.random() * 0.3;
                ctx.fillRect(x, y, Math.random() * 150, Math.random() * 150);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.strokeRect(x, y, Math.random() * 150, Math.random() * 150);
            }
            break;
        case 2:
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 75, 0, Math.PI * 2);
            if (shouldFill) {
                ctx.globalAlpha = 0.1 + Math.random() * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.stroke();
            }
            break;
        case 3:
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + (Math.random() - 0.5) * 300, y + (Math.random() - 0.5) * 300,
                x + (Math.random() - 0.5) * 300, y + (Math.random() - 0.5) * 300,
                x + (Math.random() - 0.5) * 300, y + (Math.random() - 0.5) * 300
            );
            ctx.stroke();
            break;
        case 4:
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100);
            ctx.lineTo(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100);
            ctx.closePath();
            if (shouldFill) {
                ctx.globalAlpha = 0.1 + Math.random() * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.stroke();
            }
            break;
    }
}

/**
 * Clears the canvas and draws a new artwork composition based on the selected style.
 * @param {string} style - The current art style.
 */
function drawArtwork(style) {
    // Apply global line width
    ctx.lineWidth = lineWidth;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const palette = generatePalette(style);
    // Number of primitives controlled by slider
    const totalPrimitives = numShapes;

    switch (style) {
        case artStyles.GEOMETRIC_GRID:
            drawGeometricGrid(palette);
            break;
        case artStyles.ORGANIC_NOISE:
            const numCurves = 50 + Math.floor(Math.random() * 100);
            for (let i = 0; i < numCurves; i++) {
                drawOrganicNoisePrimitive(palette, i, numCurves);
            }
            break;
        case artStyles.FRACTAL_LINES:
            drawFractalLines(palette);
            break;
        case artStyles.PARTICLE_SWARM:
            drawParticleSwarm(palette);
            break;
        case artStyles.ORGANIC_SPLATTERS:
            const numSplatters = 30 + Math.floor(Math.random() * 70);
            for (let i = 0; i < numSplatters; i++) {
                drawOrganicSplattersPrimitive(palette);
            }
            break;
        case artStyles.GLITCH_MOSAIC:
            drawGlitchMosaic(palette);
            break;
        default:
            for (let i = 0; i < totalPrimitives; i++) {
                drawPrimitive(style, palette);
            }
            break;
    }
}

// --- Art Style Implementations ---

function drawGeometricGrid(palette) {
    const cols = 5 + Math.floor(Math.random() * 10);
    const rows = 3 + Math.floor(Math.random() * 8);
    const cellWidth = window.innerWidth / cols;
    const cellHeight = window.innerHeight / rows;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            ctx.save();
            const xOffset = (Math.random() - 0.25) * cellWidth * 0.5;
            const yOffset = (Math.random() - 0.25) * cellHeight * 0.5;
            const x = i * cellWidth + cellWidth / 2 + xOffset;
            const y = j * cellHeight + cellHeight / 2 + yOffset;

            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);

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
                        ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                        ctx.fillRect(-size / 2, -size / 2, size, size);
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.strokeRect(-size / 2, -size / 2, size, size);
                    }
                    break;
                case 2:
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                    if (shouldFill) {
                        ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
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
                        ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
            ctx.restore();
        }
    }
}

function drawOrganicNoisePrimitive(palette, index, totalCurves) {
    const x = window.innerWidth * Math.random();
    const y = window.innerHeight * Math.random();
    const cp1x = x + Math.random() * 200 - 100;
    const cp1y = y + Math.random() * 200 - 100;
    const cp2x = x + Math.random() * 200 - 100;
    const cp2y = y + Math.random() * 200 - 100;
    const endX = x + Math.random() * 200 - 100;
    const endY = y + Math.random() * 200 - 100;

    const colorIndex = Math.floor((index / totalCurves) * palette.length) % palette.length;
    ctx.strokeStyle = palette[colorIndex];
    ctx.lineWidth = 1 + Math.random() * 2;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
}

function drawFractalLines(palette) {
    const maxDepth = 4 + Math.floor(Math.random() * 3);
    ctx.lineWidth = 0.5 + Math.random() * 1.5;

    const numBaseLines = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBaseLines; i++) {
        const x1 = Math.random() * window.innerWidth;
        const y1 = Math.random() * window.innerHeight;
        const x2 = Math.random() * window.innerWidth;
        const y2 = Math.random() * window.innerHeight;
        drawFractalLineRecursive(x1, y1, x2, y2, 0, maxDepth, palette);
    }
}

function drawFractalLineRecursive(x1, y1, x2, y2, depth, maxDepth, palette) {
    if (depth > maxDepth) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const offsetAmount = length * 0.3 * (Math.random() - 0.5) * 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const normalX = -dy / length;
    const normalY = dx / length;

    const newMidX = midX + normalX * offsetAmount;
    const newMidY = midY + normalY * offsetAmount;

    ctx.strokeStyle = palette[depth % palette.length];

    drawFractalLineRecursive(x1, y1, newMidX, newMidY, depth + 1, maxDepth, palette);
    drawFractalLineRecursive(newMidX, newMidY, x2, y2, depth + 1, maxDepth, palette);
}

function drawParticleSwarm(palette) {
    const numParticles = 200 + Math.floor(Math.random() * 301);
    const trailLength = 10 + Math.random() * 20;
    const maxSpeed = 2 + Math.random() * 3;

    for (let i = 0; i < numParticles; i++) {
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        let vx = (Math.random() - 0.5) * maxSpeed * 2;
        let vy = (Math.random() - 0.5) * maxSpeed * 2;
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
            ctx.globalAlpha = 1 - (j / trailLength);
            ctx.lineWidth = 1 + Math.random();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        ctx.globalAlpha = 1.0;
    }
}

function drawOrganicSplattersPrimitive(palette) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const radius = 20 + Math.random() * 80;
    const color = palette[Math.floor(Math.random() * palette.length)];

    ctx.fillStyle = color;
    ctx.globalCompositeOperation = Math.random() < 0.5 ? 'multiply' : 'screen';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + Math.random() * 20;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
}

function drawGlitchMosaic(palette) {
    const numRects = 30 + Math.floor(Math.random() * 70);
    const maxShift = 20 + Math.random() * 30;

    const tempPalette = generatePalette(artStyles.GEOMETRIC_GRID);
    for (let k = 0; k < 50; k++) {
        ctx.fillStyle = tempPalette[Math.floor(Math.random() * tempPalette.length)];
        ctx.fillRect(Math.random() * window.innerWidth, Math.random() * window.innerHeight, Math.random() * 200, Math.random() * 200);
    }

    for (let i = 0; i < numRects; i++) {
        const sx = Math.random() * window.innerWidth;
        const sy = Math.random() * window.innerHeight;
        const sw = 50 + Math.random() * (window.innerWidth / 5);
        const sh = 50 + Math.random() * (window.innerHeight / 5);

        const dx = sx + (Math.random() - 0.5) * 2 * maxShift;
        const dy = sy + (Math.random() - 0.5) * 2 * maxShift;

        const sourceX = Math.max(0, Math.floor(sx));
        const sourceY = Math.max(0, Math.floor(sy));
        const sourceW = Math.max(1, Math.floor(sw));
        const sourceH = Math.max(1, Math.floor(sh));

        const destX = Math.max(0, Math.floor(dx));
        const destY = Math.max(0, Math.floor(dy));

        if (sourceX + sourceW > window.innerWidth || sourceY + sourceH > window.innerHeight ||
            destX + sourceW > window.innerWidth || destY + sourceH > window.innerHeight) {
            continue;
        }

        ctx.drawImage(
            canvas,
            sx, sy, sw, sh,
            dx, dy, sw, sh
        );
    }

    if (Math.random() < 0.5) {
        ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)] || 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5 + Math.random();
        ctx.globalAlpha = 0.1 + Math.random() * 0.2;
        for (let y = 0; y < window.innerHeight; y += (3 + Math.random() * 4)) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(window.innerWidth, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }
}

/**
 * Applies settings from URL query parameters if present for shareable links.
 */
function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let updated = false;
    if (params.has('style')) {
        const style = params.get('style');
        if (Object.values(artStyles).includes(style)) {
            currentArtStyle = style;
            styleSelector.value = style;
            currentStyleDisplaySpan.textContent = style;
            updated = true;
        }
    }
    if (params.has('numShapes')) {
        numShapesInput.value = params.get('numShapes');
        updated = true;
    }
    if (params.has('lineWidth')) {
        lineWidthInput.value = params.get('lineWidth');
        updated = true;
    }
    if (params.has('width')) {
        canvasWidthInput.value = params.get('width');
        updated = true;
    }
    if (params.has('height')) {
        canvasHeightInput.value = params.get('height');
        updated = true;
    }
    if (params.has('seed')) {
        seedInput.value = params.get('seed');
        updated = true;
    }
    if (updated) {
        applySettingsBtn.click();
    }
}

/**
 * Sets up the UI controls, including style selector and event listeners.
 */
function setupUI() {
    Object.values(artStyles).forEach(styleName => {
        const option = document.createElement('option');
        option.value = styleName;
        option.textContent = styleName;
        if (styleName === currentArtStyle) {
            option.selected = true;
        }
        styleSelector.appendChild(option);
    });
    currentStyleDisplaySpan.textContent = currentArtStyle;

    styleSelector.addEventListener('change', (event) => {
        currentArtStyle = event.target.value;
        currentStyleDisplaySpan.textContent = currentArtStyle;
        drawArtwork(currentArtStyle);
    });

    regenerateButton.addEventListener('click', () => drawArtwork(currentArtStyle));
    exportButton.addEventListener('click', exportCanvasAsPNG);

    document.addEventListener('keydown', (event) => {
        if (event.key.toUpperCase() === 'R') {
            drawArtwork(currentArtStyle);
        }
        const styleKeys = Object.values(artStyles);
        if (event.key >= '1' && event.key <= String(styleKeys.length)) {
            const styleIndex = parseInt(event.key) - 1;
            if (styleKeys[styleIndex]) {
                currentArtStyle = styleKeys[styleIndex];
                styleSelector.value = currentArtStyle;
                currentStyleDisplaySpan.textContent = currentArtStyle;
                drawArtwork(currentArtStyle);
            }
        }
        if (event.key.toUpperCase() === 'E') {
            exportCanvasAsPNG();
        }
    });

    // Random seed generation
    randomSeedButton.addEventListener('click', () => {
        const randomSeed = Date.now().toString();
        seedInput.value = randomSeed;
        currentSeedDisplay.textContent = randomSeed;
        // Auto apply new seed and redraw
        applySettingsBtn.click();
    });

    // Toggle panel visibility
    togglePanelButton.addEventListener('click', () => {
        if (controlsPanel.style.display === 'none') {
            controlsPanel.style.display = 'flex';
            togglePanelButton.textContent = 'Hide Settings';
            togglePanelButton.title = 'Toggle settings panel';
        } else {
            controlsPanel.style.display = 'none';
            togglePanelButton.textContent = 'Show Settings';
            togglePanelButton.title = 'Toggle settings panel';
        }
    });

    // Apply settings and re-render
    applySettingsBtn.addEventListener('click', () => {
        // Reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        numShapes = +numShapesInput.value;
        lineWidth = +lineWidthInput.value;
        if (seedInput.value) {
            seedValue = hashString(seedInput.value);
            seedNumber = seedValue;
            Math.random = rnd;
        } else {
            seedValue = null;
            Math.random = originalRandom;
        }
        // Resize canvas
        const dpr = window.devicePixelRatio || 1;
        const w = +canvasWidthInput.value || window.innerWidth;
        const h = +canvasHeightInput.value || window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        drawArtwork(currentArtStyle);
        // Save settings
        const settings = {
            numShapes: numShapes,
            lineWidth: lineWidth,
            canvasWidth: canvasWidthInput.value,
            canvasHeight: canvasHeightInput.value,
            seed: seedInput.value || null,
            style: currentArtStyle
        };
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        currentSeedDisplay.textContent = seedInput.value || 'random';
    });

    // Reset to default settings
    const resetSettingsBtn = document.getElementById('resetSettings');
    resetSettingsBtn.addEventListener('click', () => {
        // Reset input values
        numShapesInput.value = 100;
        lineWidthInput.value = 1;
        numShapesDisplay.textContent = numShapesInput.value;
        lineWidthDisplay.textContent = lineWidthInput.value;
        canvasWidthInput.value = '';
        canvasHeightInput.value = '';
        seedInput.value = '';
        // Reset style selection
        currentArtStyle = artStyles.GEOMETRIC_GRID;
        styleSelector.value = currentArtStyle;
        currentStyleDisplaySpan.textContent = currentArtStyle;
        // Reset random
        seedValue = null;
        seedNumber = 1;
        Math.random = originalRandom;
        // Reinitialize canvas
        initCanvas();
    });

    // Copy link for sharing current settings
    const copyLinkBtn = document.getElementById('copyLinkButton');
    copyLinkBtn.addEventListener('click', () => {
        const params = new URLSearchParams();
        params.set('style', currentArtStyle);
        params.set('numShapes', numShapesInput.value);
        params.set('lineWidth', lineWidthInput.value);
        if (canvasWidthInput.value) params.set('width', canvasWidthInput.value);
        if (canvasHeightInput.value) params.set('height', canvasHeightInput.value);
        if (seedInput.value) params.set('seed', seedInput.value);
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            copyLinkBtn.textContent = 'Link Copied!';
            setTimeout(() => copyLinkBtn.textContent = 'Copy Link', 2000);
        });
    });
}

window.addEventListener('load', () => {
    setupUI();
    loadSettings();
    applyUrlParams();
    initCanvas();
});
window.addEventListener('resize', initCanvas);

function exportCanvasAsPNG() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `generative-art-${currentArtStyle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

