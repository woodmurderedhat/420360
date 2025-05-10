/**
 * uimodule.js - UI handling for the Generative Art Studio
 * Contains UI setup, event handling, and UI-related utility functions
 */

import { artStyles } from './styles.js';
import { setSeed, debounce } from './utils.js';
import {
    startAnimation,
    stopAnimation,
    setAnimationSpeed,
    setInteractiveMode
} from './animation.js';
import {
    saveToGallery,
    populateGallery,
    exportAsPNG,
    deleteFromGallery
} from './gallery.js';
import {
    saveToHistory,
    undo,
    redo
} from './history.js';

// DOM Elements
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance

// Main UI elements
const regenerateButton = document.getElementById('regenerateButton');
const exportButton = document.getElementById('exportButton');
const galleryButton = document.getElementById('galleryButton');
const saveToGalleryButton = document.getElementById('saveToGalleryButton');

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

// Color UI elements
const colorThemeSelector = document.getElementById('colorThemeSelector');
const customColorControls = document.getElementById('customColorControls');
const baseHueInput = document.getElementById('baseHue');
const saturationInput = document.getElementById('saturation');
const lightnessInput = document.getElementById('lightness');
const backgroundColorPicker = document.getElementById('backgroundColorPicker');

// Animation UI elements
const animationToggle = document.getElementById('animationToggle');
const animationSpeedInput = document.getElementById('animationSpeed');
const interactiveToggle = document.getElementById('interactiveToggle');

// Layer opacity controls
const voronoiOpacityInput = document.getElementById('voronoiOpacity');
const organicSplattersOpacityInput = document.getElementById('organicSplattersOpacity');
const neonWavesOpacityInput = document.getElementById('neonWavesOpacity');
const fractalLinesOpacityInput = document.getElementById('fractalLinesOpacity');
const geometricGridOpacityInput = document.getElementById('geometricGridOpacity');
const particleSwarmOpacityInput = document.getElementById('particleSwarmOpacity');
const organicNoiseOpacityInput = document.getElementById('organicNoiseOpacity');
const glitchMosaicOpacityInput = document.getElementById('glitchMosaicOpacity');
const pixelSortOpacityInput = document.getElementById('pixelSortOpacity');

// Layer density controls
const voronoiDensityInput = document.getElementById('voronoiDensity');
const organicSplattersDensityInput = document.getElementById('organicSplattersDensity');
const neonWavesDensityInput = document.getElementById('neonWavesDensity');
const fractalLinesDensityInput = document.getElementById('fractalLinesDensity');

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

// Display elements for layer opacity values
const voronoiOpacityDisplay = document.getElementById('voronoiOpacityValue');
const organicSplattersOpacityDisplay = document.getElementById('organicSplattersOpacityValue');
const neonWavesOpacityDisplay = document.getElementById('neonWavesOpacityValue');
const fractalLinesOpacityDisplay = document.getElementById('fractalLinesOpacityValue');
const geometricGridOpacityDisplay = document.getElementById('geometricGridOpacityValue');
const particleSwarmOpacityDisplay = document.getElementById('particleSwarmOpacityValue');
const organicNoiseOpacityDisplay = document.getElementById('organicNoiseOpacityValue');
const glitchMosaicOpacityDisplay = document.getElementById('glitchMosaicOpacityValue');
const pixelSortOpacityDisplay = document.getElementById('pixelSortOpacityValue');

// Display elements for layer density values
const voronoiDensityDisplay = document.getElementById('voronoiDensityValue');
const organicSplattersDensityDisplay = document.getElementById('organicSplattersDensityValue');
const neonWavesDensityDisplay = document.getElementById('neonWavesDensityValue');
const fractalLinesDensityDisplay = document.getElementById('fractalLinesDensityValue');

// Local storage key for settings
const settingsKey = 'generativeArtSettings';

/**
 * Set up the UI controls and event listeners.
 * @param {Object} appState - The application state
 * @param {Function} drawArtwork - Function to draw artwork
 * @param {Function} initCanvas - Function to initialize canvas
 * @param {Function} getCurrentAppState - Function to get current app state
 * @param {Function} applyAppState - Function to apply app state
 */
function setupUI(appState, drawArtwork, initCanvas, getCurrentAppState, applyAppState) {
    // The UI now focuses only on the Default art style
    // No style selector needed

    // Regenerate button
    regenerateButton.addEventListener('click', () => {
        // Stop animation if running
        if (animationToggle && animationToggle.checked) {
            stopAnimation();
            animationToggle.checked = false;
        }

        drawArtwork(appState.currentArtStyle);
    });

    // Export button
    exportButton.addEventListener('click', () => {
        exportAsPNG(canvas, appState.currentArtStyle);
    });

    // Gallery button
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            openGallery(appState, applySettingsBtn, applyAppState);
        });
    }

    // Save to gallery button
    if (saveToGalleryButton) {
        saveToGalleryButton.addEventListener('click', () => {
            const settings = {
                style: appState.currentArtStyle,
                numShapes: appState.numShapes,
                lineWidth: appState.lineWidth,
                seed: seedInput.value,
                colorTheme: appState.colorTheme,
                baseHue: appState.baseHue,
                saturation: appState.saturation,
                lightness: appState.lightness,
                backgroundColor: appState.backgroundColor
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

        // Update basic settings
        appState.numShapes = +numShapesInput.value;
        appState.lineWidth = +lineWidthInput.value;

        // Update seed
        if (seedInput.value) {
            setSeed(seedInput.value);
        } else {
            setSeed(null);
        }

        // Update color settings
        if (colorThemeSelector) appState.colorTheme = colorThemeSelector.value;
        if (baseHueInput) appState.baseHue = +baseHueInput.value;
        if (saturationInput) appState.saturation = +saturationInput.value;
        if (lightnessInput) appState.lightness = +lightnessInput.value;
        if (backgroundColorPicker) appState.backgroundColor = backgroundColorPicker.value;

        // Update layer opacity settings
        if (voronoiOpacityInput) appState.voronoiOpacity = +voronoiOpacityInput.value;
        if (organicSplattersOpacityInput) appState.organicSplattersOpacity = +organicSplattersOpacityInput.value;
        if (neonWavesOpacityInput) appState.neonWavesOpacity = +neonWavesOpacityInput.value;
        if (fractalLinesOpacityInput) appState.fractalLinesOpacity = +fractalLinesOpacityInput.value;
        if (geometricGridOpacityInput) appState.geometricGridOpacity = +geometricGridOpacityInput.value;
        if (particleSwarmOpacityInput) appState.particleSwarmOpacity = +particleSwarmOpacityInput.value;
        if (organicNoiseOpacityInput) appState.organicNoiseOpacity = +organicNoiseOpacityInput.value;
        if (glitchMosaicOpacityInput) appState.glitchMosaicOpacity = +glitchMosaicOpacityInput.value;
        if (pixelSortOpacityInput) appState.pixelSortOpacity = +pixelSortOpacityInput.value;

        // Update layer density settings
        if (voronoiDensityInput) appState.voronoiDensity = +voronoiDensityInput.value;
        if (organicSplattersDensityInput) appState.organicSplattersDensity = +organicSplattersDensityInput.value;
        if (neonWavesDensityInput) appState.neonWavesDensity = +neonWavesDensityInput.value;
        if (fractalLinesDensityInput) appState.fractalLinesDensity = +fractalLinesDensityInput.value;

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
        saveSettings(appState);

        // Update display
        currentSeedDisplay.textContent = seedInput.value || 'random';

        // Save state to history
        saveToHistory(getCurrentAppState());

        // Redraw artwork with the Default art style
        drawArtwork('Default');

        // Start animation if enabled
        if (animationToggle && animationToggle.checked) {
            startAnimation(canvas, ctx, 'Default', {
                animationSpeed: +animationSpeedInput.value,
                isInteractive: interactiveToggle ? interactiveToggle.checked : false,
                backgroundColor: appState.backgroundColor,
                colorTheme: appState.colorTheme,
                baseHue: appState.baseHue,
                saturation: appState.saturation,
                lightness: appState.lightness,
                lineWidth: appState.lineWidth,
                numShapes: appState.numShapes,
                // Layer opacity settings
                voronoiOpacity: appState.voronoiOpacity,
                organicSplattersOpacity: appState.organicSplattersOpacity,
                neonWavesOpacity: appState.neonWavesOpacity,
                fractalLinesOpacity: appState.fractalLinesOpacity,
                geometricGridOpacity: appState.geometricGridOpacity,
                particleSwarmOpacity: appState.particleSwarmOpacity,
                organicNoiseOpacity: appState.organicNoiseOpacity,
                glitchMosaicOpacity: appState.glitchMosaicOpacity,
                pixelSortOpacity: appState.pixelSortOpacity,
                // Layer density settings
                voronoiDensity: appState.voronoiDensity,
                organicSplattersDensity: appState.organicSplattersDensity,
                neonWavesDensity: appState.neonWavesDensity,
                fractalLinesDensity: appState.fractalLinesDensity
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

            // Set to Default art style
            appState.currentArtStyle = artStyles.DEFAULT;

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
}

/**
 * Open the gallery modal and populate it
 * @param {Object} appState - The application state
 * @param {HTMLElement} applySettingsBtn - The apply settings button
 * @param {Function} applyAppState - Function to apply app state
 */
function openGallery(appState, applySettingsBtn, applyAppState) {
    if (!galleryModal || !galleryContainer) return;

    galleryModal.style.display = 'block';

    // Populate gallery
    populateGallery(galleryContainer,
        // On select callback
        (item) => {
            // Load settings from gallery item
            if (item.settings) {
                if (item.settings.style) {
                    appState.currentArtStyle = artStyles.DEFAULT;
                }

                if (item.settings.numShapes) {
                    numShapesInput.value = item.settings.numShapes;
                    appState.numShapes = +item.settings.numShapes;
                    numShapesDisplay.textContent = item.settings.numShapes;
                }

                if (item.settings.lineWidth) {
                    lineWidthInput.value = item.settings.lineWidth;
                    appState.lineWidth = +item.settings.lineWidth;
                    lineWidthDisplay.textContent = item.settings.lineWidth;
                }

                if (item.settings.seed) {
                    seedInput.value = item.settings.seed;
                    currentSeedDisplay.textContent = item.settings.seed;
                }

                if (item.settings.colorTheme && colorThemeSelector) {
                    colorThemeSelector.value = item.settings.colorTheme;
                    appState.colorTheme = item.settings.colorTheme;

                    if (customColorControls) {
                        customColorControls.style.display = appState.colorTheme === 'custom' ? 'block' : 'none';
                    }
                }

                if (item.settings.baseHue && baseHueInput) {
                    baseHueInput.value = item.settings.baseHue;
                    appState.baseHue = +item.settings.baseHue;
                    if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                }

                if (item.settings.saturation && saturationInput) {
                    saturationInput.value = item.settings.saturation;
                    appState.saturation = +item.settings.saturation;
                    if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                }

                if (item.settings.lightness && lightnessInput) {
                    lightnessInput.value = item.settings.lightness;
                    appState.lightness = +item.settings.lightness;
                    if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                }

                if (item.settings.backgroundColor && backgroundColorPicker) {
                    backgroundColorPicker.value = item.settings.backgroundColor;
                    appState.backgroundColor = item.settings.backgroundColor;
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
                // Reuse the same select callback
                (item) => {
                    // Load settings from gallery item
                    if (item.settings) {
                        if (item.settings.style) {
                            appState.currentArtStyle = artStyles.DEFAULT;
                        }

                        if (item.settings.numShapes) {
                            numShapesInput.value = item.settings.numShapes;
                            appState.numShapes = +item.settings.numShapes;
                            numShapesDisplay.textContent = item.settings.numShapes;
                        }

                        if (item.settings.lineWidth) {
                            lineWidthInput.value = item.settings.lineWidth;
                            appState.lineWidth = +item.settings.lineWidth;
                            lineWidthDisplay.textContent = item.settings.lineWidth;
                        }

                        if (item.settings.seed) {
                            seedInput.value = item.settings.seed;
                            currentSeedDisplay.textContent = item.settings.seed;
                        }

                        if (item.settings.colorTheme && colorThemeSelector) {
                            colorThemeSelector.value = item.settings.colorTheme;
                            appState.colorTheme = item.settings.colorTheme;

                            if (customColorControls) {
                                customColorControls.style.display = appState.colorTheme === 'custom' ? 'block' : 'none';
                            }
                        }

                        if (item.settings.baseHue && baseHueInput) {
                            baseHueInput.value = item.settings.baseHue;
                            appState.baseHue = +item.settings.baseHue;
                            if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                        }

                        if (item.settings.saturation && saturationInput) {
                            saturationInput.value = item.settings.saturation;
                            appState.saturation = +item.settings.saturation;
                            if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                        }

                        if (item.settings.lightness && lightnessInput) {
                            lightnessInput.value = item.settings.lightness;
                            appState.lightness = +item.settings.lightness;
                            if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                        }

                        if (item.settings.backgroundColor && backgroundColorPicker) {
                            backgroundColorPicker.value = item.settings.backgroundColor;
                            appState.backgroundColor = item.settings.backgroundColor;
                        }

                        // Apply settings
                        applySettingsBtn.click();
                    }

                    // Close gallery
                    galleryModal.style.display = 'none';
                },
                // Simplified delete callback
                (id) => {
                    deleteFromGallery(id);
                    // Refresh gallery after deletion
                    openGallery(appState, applySettingsBtn, applyAppState);
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
 * @param {Function} initCanvas - Function to initialize canvas
 */
function handleFullscreenChange(initCanvas) {
    if (!document.fullscreenElement) {
        canvas.classList.remove('fullscreen-canvas');
        // Redraw to adjust to new size
        initCanvas();
    }
}

/**
 * Save current settings to local storage
 * @param {Object} appState - The application state
 */
function saveSettings(appState) {
    const settings = {
        numShapes: appState.numShapes,
        lineWidth: appState.lineWidth,
        canvasWidth: canvasWidthInput.value,
        canvasHeight: canvasHeightInput.value,
        seed: seedInput.value || null,
        style: appState.currentArtStyle,
        colorTheme: appState.colorTheme,
        baseHue: appState.baseHue,
        saturation: appState.saturation,
        lightness: appState.lightness,
        backgroundColor: appState.backgroundColor,
        isAnimating: animationToggle ? animationToggle.checked : false,
        animationSpeed: animationSpeedInput ? +animationSpeedInput.value : 50,
        isInteractive: interactiveToggle ? interactiveToggle.checked : false
    };

    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

/**
 * Load saved settings if present
 * @param {Object} appState - The application state
 */
function loadSettings(appState) {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
        try {
            const s = JSON.parse(saved);

            // Load basic settings
            if (s.numShapes) {
                numShapesInput.value = s.numShapes;
                appState.numShapes = +s.numShapes;
                numShapesDisplay.textContent = s.numShapes;
            }

            if (s.lineWidth) {
                lineWidthInput.value = s.lineWidth;
                appState.lineWidth = +s.lineWidth;
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
                appState.currentArtStyle = artStyles.DEFAULT;
            }

            // Load color settings
            if (s.colorTheme && colorThemeSelector) {
                appState.colorTheme = s.colorTheme;
                colorThemeSelector.value = appState.colorTheme;

                // Show/hide custom color controls
                if (customColorControls) {
                    customColorControls.style.display = appState.colorTheme === 'custom' ? 'block' : 'none';
                }
            }

            if (s.baseHue && baseHueInput) {
                appState.baseHue = s.baseHue;
                baseHueInput.value = appState.baseHue;
                if (baseHueDisplay) baseHueDisplay.textContent = appState.baseHue;
            }

            if (s.saturation && saturationInput) {
                appState.saturation = s.saturation;
                saturationInput.value = appState.saturation;
                if (saturationDisplay) saturationDisplay.textContent = appState.saturation;
            }

            if (s.lightness && lightnessInput) {
                appState.lightness = s.lightness;
                lightnessInput.value = appState.lightness;
                if (lightnessDisplay) lightnessDisplay.textContent = appState.lightness;
            }

            if (s.backgroundColor && backgroundColorPicker) {
                appState.backgroundColor = s.backgroundColor;
                backgroundColorPicker.value = appState.backgroundColor;
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
 * Apply settings from URL query parameters if present for shareable links.
 * @param {Object} _ - Unused application state parameter
 * @param {Function} applyAppState - Function to apply app state
 * @param {Function} getCurrentAppState - Function to get current app state
 */
function applyUrlParams(_, applyAppState, getCurrentAppState) {
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
 * Set up keyboard shortcuts
 * @param {Object} appState - The application state
 * @param {Function} drawArtwork - Function to draw artwork
 * @param {HTMLElement} regenerateButton - The regenerate button
 * @param {HTMLElement} exportButton - The export button
 * @param {HTMLElement} galleryButton - The gallery button
 * @param {HTMLElement} undoButton - The undo button
 * @param {HTMLElement} redoButton - The redo button
 */
function setupKeyboardShortcuts(appState, drawArtwork, regenerateButton, exportButton, galleryButton, undoButton, redoButton) {
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

        // Number keys 1-9 will regenerate the artwork
        if (event.key >= '1' && event.key <= '9') {
            // Always use Default art style
            appState.currentArtStyle = artStyles.DEFAULT;
            // Regenerate with new seed
            setSeed(null);
            drawArtwork(appState.currentArtStyle);
        }
    });
}

/**
 * Set up the share link functionality
 * @param {Object} appState - The application state
 */
function setupShareLink(appState) {
    const copyLinkBtn = document.getElementById('copyLinkButton');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const params = new URLSearchParams();
            params.set('style', appState.currentArtStyle);
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
}

/**
 * Set up color theme controls
 * @param {Object} appState - The application state
 */
function setupColorThemeControls(appState) {
    if (colorThemeSelector && customColorControls) {
        colorThemeSelector.addEventListener('change', () => {
            appState.colorTheme = colorThemeSelector.value;
            customColorControls.style.display = appState.colorTheme === 'custom' ? 'block' : 'none';
        });
    }
}

/**
 * Set up animation controls
 * @param {Object} appState - The application state
 * @param {Function} drawArtwork - Function to draw artwork
 */
function setupAnimationControls(appState, drawArtwork) {
    // Animation toggle
    if (animationToggle) {
        animationToggle.addEventListener('change', () => {
            if (animationToggle.checked) {
                // Enable animation speed slider
                if (animationSpeedInput) animationSpeedInput.disabled = false;

                // Start animation
                startAnimation(canvas, ctx, appState.currentArtStyle, {
                    animationSpeed: +animationSpeedInput.value,
                    isInteractive: interactiveToggle ? interactiveToggle.checked : false,
                    backgroundColor: appState.backgroundColor,
                    colorTheme: appState.colorTheme,
                    baseHue: appState.baseHue,
                    saturation: appState.saturation,
                    lightness: appState.lightness,
                    lineWidth: appState.lineWidth,
                    numShapes: appState.numShapes
                });
            } else {
                // Disable animation speed slider
                if (animationSpeedInput) animationSpeedInput.disabled = true;

                // Stop animation
                stopAnimation();

                // Redraw static artwork
                drawArtwork(appState.currentArtStyle);
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
}

/**
 * Set up slider value displays
 */
function setupSliderDisplays() {
    // Basic sliders
    numShapesInput.addEventListener('input', () => {
        numShapesDisplay.textContent = numShapesInput.value;
    });

    lineWidthInput.addEventListener('input', () => {
        lineWidthDisplay.textContent = lineWidthInput.value;
    });

    // Color sliders
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

    // Layer opacity sliders
    if (voronoiOpacityInput && voronoiOpacityDisplay) {
        voronoiOpacityInput.addEventListener('input', () => {
            voronoiOpacityDisplay.textContent = voronoiOpacityInput.value;
        });
    }

    if (organicSplattersOpacityInput && organicSplattersOpacityDisplay) {
        organicSplattersOpacityInput.addEventListener('input', () => {
            organicSplattersOpacityDisplay.textContent = organicSplattersOpacityInput.value;
        });
    }

    if (neonWavesOpacityInput && neonWavesOpacityDisplay) {
        neonWavesOpacityInput.addEventListener('input', () => {
            neonWavesOpacityDisplay.textContent = neonWavesOpacityInput.value;
        });
    }

    if (fractalLinesOpacityInput && fractalLinesOpacityDisplay) {
        fractalLinesOpacityInput.addEventListener('input', () => {
            fractalLinesOpacityDisplay.textContent = fractalLinesOpacityInput.value;
        });
    }

    if (geometricGridOpacityInput && geometricGridOpacityDisplay) {
        geometricGridOpacityInput.addEventListener('input', () => {
            geometricGridOpacityDisplay.textContent = geometricGridOpacityInput.value;
        });
    }

    if (particleSwarmOpacityInput && particleSwarmOpacityDisplay) {
        particleSwarmOpacityInput.addEventListener('input', () => {
            particleSwarmOpacityDisplay.textContent = particleSwarmOpacityInput.value;
        });
    }

    if (organicNoiseOpacityInput && organicNoiseOpacityDisplay) {
        organicNoiseOpacityInput.addEventListener('input', () => {
            organicNoiseOpacityDisplay.textContent = organicNoiseOpacityInput.value;
        });
    }

    if (glitchMosaicOpacityInput && glitchMosaicOpacityDisplay) {
        glitchMosaicOpacityInput.addEventListener('input', () => {
            glitchMosaicOpacityDisplay.textContent = glitchMosaicOpacityInput.value;
        });
    }

    if (pixelSortOpacityInput && pixelSortOpacityDisplay) {
        pixelSortOpacityInput.addEventListener('input', () => {
            pixelSortOpacityDisplay.textContent = pixelSortOpacityInput.value;
        });
    }

    // Layer density sliders
    if (voronoiDensityInput && voronoiDensityDisplay) {
        voronoiDensityInput.addEventListener('input', () => {
            voronoiDensityDisplay.textContent = voronoiDensityInput.value;
        });
    }

    if (organicSplattersDensityInput && organicSplattersDensityDisplay) {
        organicSplattersDensityInput.addEventListener('input', () => {
            organicSplattersDensityDisplay.textContent = organicSplattersDensityInput.value;
        });
    }

    if (neonWavesDensityInput && neonWavesDensityDisplay) {
        neonWavesDensityInput.addEventListener('input', () => {
            neonWavesDensityDisplay.textContent = neonWavesDensityInput.value;
        });
    }

    if (fractalLinesDensityInput && fractalLinesDensityDisplay) {
        fractalLinesDensityInput.addEventListener('input', () => {
            fractalLinesDensityDisplay.textContent = fractalLinesDensityInput.value;
        });
    }
}

/**
 * Set up gallery modal controls
 */
function setupGalleryModalControls() {
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
}

/**
 * Set up fullscreen button
 */
function setupFullscreenButton() {
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }
}

/**
 * Set up history controls (undo/redo)
 * @param {Function} applyAppState - Function to apply app state
 */
function setupHistoryControls(applyAppState) {
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

    return { undoButton, redoButton };
}

/**
 * Set up window resize handler
 * @param {Function} initCanvas - Function to initialize canvas
 */
function setupWindowResize(initCanvas) {
    window.addEventListener('resize', debounce(() => {
        // Only resize if custom dimensions are not set
        if (!canvasWidthInput.value && !canvasHeightInput.value) {
            initCanvas();
        }
    }, 250));
}

/**
 * Set up fullscreen change event listeners
 * @param {Function} initCanvas - Function to initialize canvas
 */
function setupFullscreenChangeListeners(initCanvas) {
    document.addEventListener('fullscreenchange', () => handleFullscreenChange(initCanvas));
    document.addEventListener('webkitfullscreenchange', () => handleFullscreenChange(initCanvas));
    document.addEventListener('mozfullscreenchange', () => handleFullscreenChange(initCanvas));
    document.addEventListener('MSFullscreenChange', () => handleFullscreenChange(initCanvas));
}

export {
    canvas,
    ctx,
    numShapesInput,
    lineWidthInput,
    canvasWidthInput,
    canvasHeightInput,
    seedInput,
    colorThemeSelector,
    baseHueInput,
    saturationInput,
    lightnessInput,
    backgroundColorPicker,
    animationToggle,
    animationSpeedInput,
    interactiveToggle,
    // Layer opacity controls
    voronoiOpacityInput,
    organicSplattersOpacityInput,
    neonWavesOpacityInput,
    fractalLinesOpacityInput,
    geometricGridOpacityInput,
    particleSwarmOpacityInput,
    organicNoiseOpacityInput,
    glitchMosaicOpacityInput,
    pixelSortOpacityInput,
    // Layer density controls
    voronoiDensityInput,
    organicSplattersDensityInput,
    neonWavesDensityInput,
    fractalLinesDensityInput,
    // Display elements
    numShapesDisplay,
    lineWidthDisplay,
    baseHueDisplay,
    saturationDisplay,
    lightnessDisplay,
    animationSpeedDisplay,
    currentSeedDisplay,
    settingsKey,
    setupUI,
    openGallery,
    toggleFullscreen,
    handleFullscreenChange,
    saveSettings,
    loadSettings,
    applyUrlParams,
    setupKeyboardShortcuts,
    setupShareLink,
    setupColorThemeControls,
    setupAnimationControls,
    setupSliderDisplays,
    setupGalleryModalControls,
    setupFullscreenButton,
    setupHistoryControls,
    setupWindowResize,
    setupFullscreenChangeListeners
};
