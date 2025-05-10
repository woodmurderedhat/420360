/**
 * main.js - Main entry point for the Generative Art Studio
 * Handles initialization, UI setup, and event handling
 */

import { setSeed, hashString, debounce } from './utils.js';
import { generatePalette } from './palette.js';
import { artStyles, drawGeometricGrid, drawOrganicNoise } from './styles.js';
import { drawFractalLines, drawParticleSwarm, drawOrganicSplatters } from './styles-advanced.js';
import { drawGlitchMosaic, drawNeonWaves, drawPixelSort } from './styles-experimental.js';
import { drawVoronoiCells, drawGeometricGridPrimitive, drawOrganicNoisePrimitive } from './styles-more.js';
import { drawDefaultMasterpiece } from './styles-default.js';
import {
    initAnimation,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationSpeed,
    setInteractiveMode
} from './animation.js';
import {
    saveToGallery,
    loadGallery,
    populateGallery,
    exportAsPNG,
    deleteFromGallery
} from './gallery.js';
import {
    saveToHistory,
    undo,
    redo,
    clearHistory,
    updateHistoryButtons,
    getHistoryStates
} from './history.js';

// DOM Elements
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance

// Main UI elements
const regenerateButton = document.getElementById('regenerateButton');
const exportButton = document.getElementById('exportButton');
const galleryButton = document.getElementById('galleryButton');
const styleSelector = document.getElementById('styleSelector');
const currentStyleDisplaySpan = document.querySelector('#currentStyleDisplay span');

// Control panel elements
const numShapesInput = document.getElementById('numShapes');
const lineWidthInput = document.getElementById('lineWidth');
const canvasWidthInput = document.getElementById('canvasWidth');
const canvasHeightInput = document.getElementById('canvasHeight');
const seedInput = document.getElementById('seedInput');
const applySettingsBtn = document.getElementById('applySettings');
const randomSeedButton = document.getElementById('randomSeedButton');
const togglePanelButton = document.getElementById('togglePanelButton');
const controlsPanel = document.getElementById('controlsPanel');
const currentSeedDisplay = document.querySelector('#currentSeedDisplay span');
const saveToGalleryButton = document.getElementById('saveToGalleryButton');

// New UI elements
const colorThemeSelector = document.getElementById('colorThemeSelector');
const customColorControls = document.getElementById('customColorControls');
const baseHueInput = document.getElementById('baseHue');
const saturationInput = document.getElementById('saturation');
const lightnessInput = document.getElementById('lightness');
const backgroundColorPicker = document.getElementById('backgroundColorPicker');
const animationToggle = document.getElementById('animationToggle');
const animationSpeedInput = document.getElementById('animationSpeed');
const interactiveToggle = document.getElementById('interactiveToggle');

// Gallery modal elements
const galleryModal = document.getElementById('galleryModal');
const galleryContainer = document.getElementById('galleryContainer');
const closeButton = document.querySelector('.close-button');

// Display elements for slider values
const numShapesDisplay = document.getElementById('numShapesValue');
const lineWidthDisplay = document.getElementById('lineWidthValue');
const baseHueDisplay = document.getElementById('baseHueValue');
const saturationDisplay = document.getElementById('saturationValue');
const lightnessDisplay = document.getElementById('lightnessValue');
const animationSpeedDisplay = document.getElementById('animationSpeedValue');

// Application state
let currentArtStyle = artStyles.GEOMETRIC_GRID;
let numShapes = +numShapesInput.value;
let lineWidth = +lineWidthInput.value;
let backgroundColor = backgroundColorPicker ? backgroundColorPicker.value : '#ffffff';
let colorTheme = colorThemeSelector ? colorThemeSelector.value : 'random';
let baseHue = baseHueInput ? +baseHueInput.value : 180;
let saturation = saturationInput ? +saturationInput.value : 70;
let lightness = lightnessInput ? +lightnessInput.value : 50;

// Local storage key for settings
const settingsKey = 'generativeArtSettings';

/**
 * Initialize the canvas dimensions and sets up event listeners.
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

    // Set background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, w, h);

    drawArtwork(currentArtStyle);
}

/**
 * Draw artwork based on the selected style
 * @param {string} style - The art style to draw
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function drawArtwork(style, showLoading = true) {
    // Show loading indicator for complex styles
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (showLoading && loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    // Use requestAnimationFrame to ensure loading indicator is displayed
    requestAnimationFrame(() => {
        try {
            // Get canvas dimensions
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            // Clear canvas and set background
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Apply global line width
            ctx.lineWidth = lineWidth;

            // Generate palette
            const palette = generatePalette(style, colorTheme, baseHue, saturation, lightness);

            // Common parameters for all styles
            const params = {
                width,
                height,
                lineWidth,
                numShapes
            };

            // Draw based on selected style
            switch (style) {
                case artStyles.DEFAULT:
                    drawDefaultMasterpiece(ctx, palette, false, params);
                    break;
                case artStyles.GEOMETRIC_GRID:
                    drawGeometricGrid(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_NOISE:
                    drawOrganicNoise(ctx, palette, false, params);
                    break;
                case artStyles.FRACTAL_LINES:
                    drawFractalLines(ctx, palette, false, params);
                    break;
                case artStyles.PARTICLE_SWARM:
                    drawParticleSwarm(ctx, palette, false, params);
                    break;
                case artStyles.ORGANIC_SPLATTERS:
                    drawOrganicSplatters(ctx, palette, false, params);
                    break;
                case artStyles.GLITCH_MOSAIC:
                    drawGlitchMosaic(ctx, palette, false, params);
                    break;
                case artStyles.NEON_WAVES:
                    drawNeonWaves(ctx, palette, false, params);
                    break;
                case artStyles.PIXEL_SORT:
                    drawPixelSort(ctx, palette, false, params);
                    break;
                case artStyles.VORONOI_CELLS:
                    drawVoronoiCells(ctx, palette, false, params);
                    break;
            }
        } catch (error) {
            console.error('Error drawing artwork:', error);
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    });
}

/**
 * Load saved settings if present
 */
function loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
        try {
            const s = JSON.parse(saved);

            // Load basic settings
            if (s.numShapes) {
                numShapesInput.value = s.numShapes;
                numShapes = +s.numShapes;
                numShapesDisplay.textContent = s.numShapes;
            }

            if (s.lineWidth) {
                lineWidthInput.value = s.lineWidth;
                lineWidth = +s.lineWidth;
                lineWidthDisplay.textContent = s.lineWidth;
            }

            if (s.canvasWidth) canvasWidthInput.value = s.canvasWidth;
            if (s.canvasHeight) canvasHeightInput.value = s.canvasHeight;

            // Load seed
            if (s.seed) {
                seedInput.value = s.seed;
                setSeed(s.seed);
                currentSeedDisplay.textContent = s.seed;
            } else {
                seedInput.value = '';
                setSeed(null);
                currentSeedDisplay.textContent = 'random';
            }

            // Load style
            if (s.style && Object.values(artStyles).includes(s.style)) {
                currentArtStyle = s.style;
                styleSelector.value = currentArtStyle;
                currentStyleDisplaySpan.textContent = currentArtStyle;
            }

            // Load color settings
            if (s.colorTheme && colorThemeSelector) {
                colorTheme = s.colorTheme;
                colorThemeSelector.value = colorTheme;

                // Show/hide custom color controls
                if (customColorControls) {
                    customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                }
            }

            if (s.baseHue && baseHueInput) {
                baseHue = s.baseHue;
                baseHueInput.value = baseHue;
                if (baseHueDisplay) baseHueDisplay.textContent = baseHue;
            }

            if (s.saturation && saturationInput) {
                saturation = s.saturation;
                saturationInput.value = saturation;
                if (saturationDisplay) saturationDisplay.textContent = saturation;
            }

            if (s.lightness && lightnessInput) {
                lightness = s.lightness;
                lightnessInput.value = lightness;
                if (lightnessDisplay) lightnessDisplay.textContent = lightness;
            }

            if (s.backgroundColor && backgroundColorPicker) {
                backgroundColor = s.backgroundColor;
                backgroundColorPicker.value = backgroundColor;
            }

            // Load animation settings
            if (s.isAnimating !== undefined && animationToggle) {
                animationToggle.checked = s.isAnimating;
            }

            if (s.animationSpeed !== undefined && animationSpeedInput) {
                animationSpeedInput.value = s.animationSpeed;
                if (animationSpeedDisplay) animationSpeedDisplay.textContent = s.animationSpeed;
                setAnimationSpeed(s.animationSpeed);
            }

            if (s.isInteractive !== undefined && interactiveToggle) {
                interactiveToggle.checked = s.isInteractive;
                setInteractiveMode(s.isInteractive);
            }

        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

/**
 * Save current settings to local storage
 */
function saveSettings() {
    const settings = {
        numShapes,
        lineWidth,
        canvasWidth: canvasWidthInput.value,
        canvasHeight: canvasHeightInput.value,
        seed: seedInput.value || null,
        style: currentArtStyle,
        colorTheme,
        baseHue,
        saturation,
        lightness,
        backgroundColor,
        isAnimating: animationToggle ? animationToggle.checked : false,
        animationSpeed: animationSpeedInput ? +animationSpeedInput.value : 50,
        isInteractive: interactiveToggle ? interactiveToggle.checked : false
    };

    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

/**
 * Get the current application state
 * @returns {Object} The current state
 */
function getCurrentAppState() {
    return {
        style: currentArtStyle,
        numShapes: +numShapesInput.value,
        lineWidth: +lineWidthInput.value,
        canvasWidth: canvasWidthInput.value,
        canvasHeight: canvasHeightInput.value,
        seed: seedInput.value,
        colorTheme: colorThemeSelector ? colorThemeSelector.value : 'random',
        baseHue: baseHueInput ? +baseHueInput.value : 180,
        saturation: saturationInput ? +saturationInput.value : 70,
        lightness: lightnessInput ? +lightnessInput.value : 50,
        backgroundColor: backgroundColorPicker ? backgroundColorPicker.value : '#ffffff',
        isAnimating: animationToggle ? animationToggle.checked : false,
        animationSpeed: animationSpeedInput ? +animationSpeedInput.value : 50,
        isInteractive: interactiveToggle ? interactiveToggle.checked : false
    };
}

/**
 * Apply a state to the application
 * @param {Object} state - The state to apply
 */
function applyAppState(state) {
    if (!state) return;

    // Update UI elements
    if (state.style && Object.values(artStyles).includes(state.style)) {
        currentArtStyle = state.style;
        styleSelector.value = state.style;
        currentStyleDisplaySpan.textContent = state.style;
    }

    if (state.numShapes) {
        numShapesInput.value = state.numShapes;
        numShapesDisplay.textContent = state.numShapes;
    }

    if (state.lineWidth) {
        lineWidthInput.value = state.lineWidth;
        lineWidthDisplay.textContent = state.lineWidth;
    }

    if (state.canvasWidth) {
        canvasWidthInput.value = state.canvasWidth;
    }

    if (state.canvasHeight) {
        canvasHeightInput.value = state.canvasHeight;
    }

    if (state.seed !== undefined) {
        seedInput.value = state.seed || '';
        currentSeedDisplay.textContent = state.seed || 'random';
    }

    if (state.colorTheme && colorThemeSelector) {
        colorThemeSelector.value = state.colorTheme;
        colorTheme = state.colorTheme;

        if (customColorControls) {
            customColorControls.style.display = state.colorTheme === 'custom' ? 'block' : 'none';
        }
    }

    if (state.baseHue !== undefined && baseHueInput) {
        baseHueInput.value = state.baseHue;
        if (baseHueDisplay) baseHueDisplay.textContent = state.baseHue;
    }

    if (state.saturation !== undefined && saturationInput) {
        saturationInput.value = state.saturation;
        if (saturationDisplay) saturationDisplay.textContent = state.saturation;
    }

    if (state.lightness !== undefined && lightnessInput) {
        lightnessInput.value = state.lightness;
        if (lightnessDisplay) lightnessDisplay.textContent = state.lightness;
    }

    if (state.backgroundColor && backgroundColorPicker) {
        backgroundColorPicker.value = state.backgroundColor;
    }

    // Apply the state
    applySettingsBtn.click();
}

/**
 * Apply settings from URL query parameters if present for shareable links.
 */
function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let updated = false;
    const state = {};

    if (params.has('style')) {
        const style = params.get('style');
        if (Object.values(artStyles).includes(style)) {
            state.style = style;
            updated = true;
        }
    }

    if (params.has('numShapes')) {
        state.numShapes = params.get('numShapes');
        updated = true;
    }

    if (params.has('lineWidth')) {
        state.lineWidth = params.get('lineWidth');
        updated = true;
    }

    if (params.has('width')) {
        state.canvasWidth = params.get('width');
        updated = true;
    }

    if (params.has('height')) {
        state.canvasHeight = params.get('height');
        updated = true;
    }

    if (params.has('seed')) {
        state.seed = params.get('seed');
        updated = true;
    }

    if (params.has('colorTheme') && colorThemeSelector) {
        state.colorTheme = params.get('colorTheme');
        updated = true;
    }

    if (params.has('baseHue') && baseHueInput) {
        state.baseHue = params.get('baseHue');
        updated = true;
    }

    if (params.has('saturation') && saturationInput) {
        state.saturation = params.get('saturation');
        updated = true;
    }

    if (params.has('lightness') && lightnessInput) {
        state.lightness = params.get('lightness');
        updated = true;
    }

    if (params.has('bg') && backgroundColorPicker) {
        state.backgroundColor = '#' + params.get('bg');
        updated = true;
    }

    if (updated) {
        applyAppState(state);

        // Save initial state to history
        saveToHistory(getCurrentAppState());
    }
}

/**
 * Set up the UI controls, including style selector and event listeners.
 */
function setupUI() {
    // Populate style selector
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

    // Style selector change event
    styleSelector.addEventListener('change', (event) => {
        currentArtStyle = event.target.value;
        currentStyleDisplaySpan.textContent = currentArtStyle;

        // Stop animation if running
        if (animationToggle && animationToggle.checked) {
            stopAnimation();
            animationToggle.checked = false;
        }

        drawArtwork(currentArtStyle);
    });

    // Regenerate button
    regenerateButton.addEventListener('click', () => {
        // Stop animation if running
        if (animationToggle && animationToggle.checked) {
            stopAnimation();
            animationToggle.checked = false;
        }

        drawArtwork(currentArtStyle);
    });

    // Export button
    exportButton.addEventListener('click', () => {
        exportAsPNG(canvas, currentArtStyle);
    });

    // Gallery button
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            openGallery();
        });
    }

    // Save to gallery button
    if (saveToGalleryButton) {
        saveToGalleryButton.addEventListener('click', () => {
            const settings = {
                style: currentArtStyle,
                numShapes,
                lineWidth,
                seed: seedInput.value,
                colorTheme,
                baseHue,
                saturation,
                lightness,
                backgroundColor
            };

            saveToGallery(canvas, settings);
            alert('Artwork saved to gallery!');
        });
    }

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

        // Update settings
        numShapes = +numShapesInput.value;
        lineWidth = +lineWidthInput.value;

        // Update seed
        if (seedInput.value) {
            setSeed(seedInput.value);
        } else {
            setSeed(null);
        }

        // Update color settings
        if (colorThemeSelector) colorTheme = colorThemeSelector.value;
        if (baseHueInput) baseHue = +baseHueInput.value;
        if (saturationInput) saturation = +saturationInput.value;
        if (lightnessInput) lightness = +lightnessInput.value;
        if (backgroundColorPicker) backgroundColor = backgroundColorPicker.value;

        // Update animation settings
        if (animationSpeedInput) {
            setAnimationSpeed(+animationSpeedInput.value);
        }

        if (interactiveToggle) {
            setInteractiveMode(interactiveToggle.checked);
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

        // Save settings
        saveSettings();

        // Update display
        currentSeedDisplay.textContent = seedInput.value || 'random';

        // Save state to history
        saveToHistory(getCurrentAppState());

        // Redraw artwork
        drawArtwork(currentArtStyle);

        // Start animation if enabled
        if (animationToggle && animationToggle.checked) {
            startAnimation(canvas, ctx, currentArtStyle, {
                animationSpeed: +animationSpeedInput.value,
                isInteractive: interactiveToggle ? interactiveToggle.checked : false,
                backgroundColor,
                colorTheme,
                baseHue,
                saturation,
                lightness,
                lineWidth,
                numShapes
            });
        }
    });

    // Reset to default settings
    const resetSettingsBtn = document.getElementById('resetSettings');
    if (resetSettingsBtn) {
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

            // Reset color settings
            if (colorThemeSelector) colorThemeSelector.value = 'random';
            if (baseHueInput) baseHueInput.value = 180;
            if (saturationInput) saturationInput.value = 70;
            if (lightnessInput) lightnessInput.value = 50;
            if (backgroundColorPicker) backgroundColorPicker.value = '#ffffff';

            // Reset animation settings
            if (animationToggle) animationToggle.checked = false;
            if (animationSpeedInput) animationSpeedInput.value = 50;
            if (interactiveToggle) interactiveToggle.checked = false;

            // Reset random
            setSeed(null);

            // Stop animation if running
            stopAnimation();

            // Reinitialize canvas
            initCanvas();
        });
    }

    // Copy link for sharing current settings
    const copyLinkBtn = document.getElementById('copyLinkButton');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const params = new URLSearchParams();
            params.set('style', currentArtStyle);
            params.set('numShapes', numShapesInput.value);
            params.set('lineWidth', lineWidthInput.value);
            if (canvasWidthInput.value) params.set('width', canvasWidthInput.value);
            if (canvasHeightInput.value) params.set('height', canvasHeightInput.value);
            if (seedInput.value) params.set('seed', seedInput.value);

            // Add color settings
            if (colorThemeSelector) params.set('colorTheme', colorThemeSelector.value);
            if (baseHueInput) params.set('baseHue', baseHueInput.value);
            if (saturationInput) params.set('saturation', saturationInput.value);
            if (lightnessInput) params.set('lightness', lightnessInput.value);
            if (backgroundColorPicker) {
                // Convert #RRGGBB to RRGGBB
                params.set('bg', backgroundColorPicker.value.substring(1));
            }

            const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                copyLinkBtn.textContent = 'Link Copied!';
                setTimeout(() => copyLinkBtn.textContent = 'Copy Link', 2000);
            });
        });
    }

    // Color theme selector
    if (colorThemeSelector && customColorControls) {
        colorThemeSelector.addEventListener('change', () => {
            colorTheme = colorThemeSelector.value;
            customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
        });
    }

    // Animation toggle
    if (animationToggle) {
        animationToggle.addEventListener('change', () => {
            if (animationToggle.checked) {
                // Enable animation speed slider
                if (animationSpeedInput) animationSpeedInput.disabled = false;

                // Start animation
                startAnimation(canvas, ctx, currentArtStyle, {
                    animationSpeed: +animationSpeedInput.value,
                    isInteractive: interactiveToggle ? interactiveToggle.checked : false,
                    backgroundColor,
                    colorTheme,
                    baseHue,
                    saturation,
                    lightness,
                    lineWidth,
                    numShapes
                });
            } else {
                // Disable animation speed slider
                if (animationSpeedInput) animationSpeedInput.disabled = true;

                // Stop animation
                stopAnimation();

                // Redraw static artwork
                drawArtwork(currentArtStyle);
            }
        });
    }

    // Animation speed slider
    if (animationSpeedInput) {
        animationSpeedInput.addEventListener('input', () => {
            if (animationSpeedDisplay) {
                animationSpeedDisplay.textContent = animationSpeedInput.value;
            }
            setAnimationSpeed(+animationSpeedInput.value);
        });
    }

    // Interactive mode toggle
    if (interactiveToggle) {
        interactiveToggle.addEventListener('change', () => {
            setInteractiveMode(interactiveToggle.checked);
        });
    }

    // Gallery modal close button
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            galleryModal.style.display = 'none';
        });
    }

    // Close gallery when clicking outside the modal
    window.addEventListener('click', (event) => {
        if (event.target === galleryModal) {
            galleryModal.style.display = 'none';
        }
    });

    // Fullscreen button
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }

    // Undo/Redo buttons
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    if (undoButton) {
        undoButton.addEventListener('click', () => {
            const prevState = undo();
            if (prevState) {
                applyAppState(prevState);
            }
        });
    }

    if (redoButton) {
        redoButton.addEventListener('click', () => {
            const nextState = redo();
            if (nextState) {
                applyAppState(nextState);
            }
        });
    }

    // Update slider value displays
    numShapesInput.addEventListener('input', () => {
        numShapesDisplay.textContent = numShapesInput.value;
    });

    lineWidthInput.addEventListener('input', () => {
        lineWidthDisplay.textContent = lineWidthInput.value;
    });

    if (baseHueInput && baseHueDisplay) {
        baseHueInput.addEventListener('input', () => {
            baseHueDisplay.textContent = baseHueInput.value;
        });
    }

    if (saturationInput && saturationDisplay) {
        saturationInput.addEventListener('input', () => {
            saturationDisplay.textContent = saturationInput.value;
        });
    }

    if (lightnessInput && lightnessDisplay) {
        lightnessInput.addEventListener('input', () => {
            lightnessDisplay.textContent = lightnessInput.value;
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Regenerate (R)
        if (event.key.toUpperCase() === 'R') {
            regenerateButton.click();
        }

        // Export (E)
        if (event.key.toUpperCase() === 'E') {
            exportButton.click();
        }

        // Gallery (G)
        if (event.key.toUpperCase() === 'G' && galleryButton) {
            galleryButton.click();
        }

        // Toggle Animation (Space)
        if (event.key === ' ' && animationToggle) {
            animationToggle.checked = !animationToggle.checked;
            animationToggle.dispatchEvent(new Event('change'));
            event.preventDefault(); // Prevent page scrolling
        }

        // Fullscreen (F)
        if (event.key.toUpperCase() === 'F') {
            toggleFullscreen();
            event.preventDefault();
        }

        // Undo (Ctrl+Z)
        if (event.key.toUpperCase() === 'Z' && (event.ctrlKey || event.metaKey) && undoButton) {
            undoButton.click();
            event.preventDefault();
        }

        // Redo (Ctrl+Y or Ctrl+Shift+Z)
        if ((event.key.toUpperCase() === 'Y' && (event.ctrlKey || event.metaKey)) ||
            (event.key.toUpperCase() === 'Z' && (event.ctrlKey || event.metaKey) && event.shiftKey)) {
            if (redoButton) {
                redoButton.click();
                event.preventDefault();
            }
        }

        // Style selection (1-9)
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
    });
}

/**
 * Open the gallery modal and populate it
 */
function openGallery() {
    if (!galleryModal || !galleryContainer) return;

    galleryModal.style.display = 'block';

    // Populate gallery
    populateGallery(galleryContainer,
        // On select callback
        (item) => {
            // Load settings from gallery item
            if (item.settings) {
                if (item.settings.style) {
                    currentArtStyle = item.settings.style;
                    styleSelector.value = currentArtStyle;
                    currentStyleDisplaySpan.textContent = currentArtStyle;
                }

                if (item.settings.numShapes) {
                    numShapesInput.value = item.settings.numShapes;
                    numShapes = +item.settings.numShapes;
                    numShapesDisplay.textContent = item.settings.numShapes;
                }

                if (item.settings.lineWidth) {
                    lineWidthInput.value = item.settings.lineWidth;
                    lineWidth = +item.settings.lineWidth;
                    lineWidthDisplay.textContent = item.settings.lineWidth;
                }

                if (item.settings.seed) {
                    seedInput.value = item.settings.seed;
                    currentSeedDisplay.textContent = item.settings.seed;
                }

                if (item.settings.colorTheme && colorThemeSelector) {
                    colorThemeSelector.value = item.settings.colorTheme;
                    colorTheme = item.settings.colorTheme;

                    if (customColorControls) {
                        customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                    }
                }

                if (item.settings.baseHue && baseHueInput) {
                    baseHueInput.value = item.settings.baseHue;
                    baseHue = +item.settings.baseHue;
                    if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                }

                if (item.settings.saturation && saturationInput) {
                    saturationInput.value = item.settings.saturation;
                    saturation = +item.settings.saturation;
                    if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                }

                if (item.settings.lightness && lightnessInput) {
                    lightnessInput.value = item.settings.lightness;
                    lightness = +item.settings.lightness;
                    if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                }

                if (item.settings.backgroundColor && backgroundColorPicker) {
                    backgroundColorPicker.value = item.settings.backgroundColor;
                    backgroundColor = item.settings.backgroundColor;
                }

                // Apply settings
                applySettingsBtn.click();
            }

            // Close gallery
            galleryModal.style.display = 'none';
        },
        // On delete callback
        (id) => {
            // Remove from storage
            deleteFromGallery(id);
            // Re-render gallery UI
            populateGallery(galleryContainer,
                (item) => {
                    if (item.settings) {
                        if (item.settings.style) {
                            currentArtStyle = item.settings.style;
                            styleSelector.value = currentArtStyle;
                            currentStyleDisplaySpan.textContent = currentArtStyle;
                        }
                        if (item.settings.numShapes) {
                            numShapesInput.value = item.settings.numShapes;
                            numShapes = +item.settings.numShapes;
                            numShapesDisplay.textContent = item.settings.numShapes;
                        }
                        if (item.settings.lineWidth) {
                            lineWidthInput.value = item.settings.lineWidth;
                            lineWidth = +item.settings.lineWidth;
                            lineWidthDisplay.textContent = item.settings.lineWidth;
                        }
                        if (item.settings.seed) {
                            seedInput.value = item.settings.seed;
                            currentSeedDisplay.textContent = item.settings.seed;
                        }
                        if (item.settings.colorTheme && colorThemeSelector) {
                            colorThemeSelector.value = item.settings.colorTheme;
                            colorTheme = item.settings.colorTheme;
                            if (customColorControls) {
                                customColorControls.style.display = colorTheme === 'custom' ? 'block' : 'none';
                            }
                        }
                        if (item.settings.baseHue && baseHueInput) {
                            baseHueInput.value = item.settings.baseHue;
                            baseHue = +item.settings.baseHue;
                            if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                        }
                        if (item.settings.saturation && saturationInput) {
                            saturationInput.value = item.settings.saturation;
                            saturation = +item.settings.saturation;
                            if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                        }
                        if (item.settings.lightness && lightnessInput) {
                            lightnessInput.value = item.settings.lightness;
                            lightness = +item.settings.lightness;
                            if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                        }
                        if (item.settings.backgroundColor && backgroundColorPicker) {
                            backgroundColorPicker.value = item.settings.backgroundColor;
                            backgroundColor = item.settings.backgroundColor;
                        }
                        applySettingsBtn.click();
                    }
                    galleryModal.style.display = 'none';
                },
                (id) => {
                    // Recursively handle delete
                    deleteFromGallery(id);
                    populateGallery(galleryContainer, arguments.callee, arguments.callee);
                }
            );
        }
    );
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (canvas.webkitRequestFullscreen) { /* Safari */
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { /* IE11 */
            canvas.msRequestFullscreen();
        }
        canvas.classList.add('fullscreen-canvas');
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        canvas.classList.remove('fullscreen-canvas');
    }
}

/**
 * Handle fullscreen change events
 */
function handleFullscreenChange() {
    if (!document.fullscreenElement) {
        canvas.classList.remove('fullscreen-canvas');
        // Redraw to adjust to new size
        initCanvas();
    }
}

// Initialize the application
window.addEventListener('load', () => {
    // Set up UI
    setupUI();

    // Initialize animation
    initAnimation(canvas);

    // Load settings
    loadSettings();

    // Apply URL parameters
    applyUrlParams();

    // Initialize canvas
    initCanvas();

    // Set up fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Save initial state to history
    saveToHistory(getCurrentAppState());
    updateHistoryButtons();
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Only resize if custom dimensions are not set
    if (!canvasWidthInput.value && !canvasHeightInput.value) {
        initCanvas();
    }
}, 250));
