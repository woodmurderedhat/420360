/**
 * setupUI.js - UI setup for the Generative Art Studio
 */

import { setSeed } from '../utils.js';
import { saveToGallery, exportAsPNG } from '../gallery.js';
import { saveToHistory, undo, redo, updateHistoryButtons } from '../history.js';
import { startAnimation, stopAnimation, setAnimationSpeed, setInteractiveMode } from '../animation.js';
import { artStyles } from '../styles/index.js';
import {
    canvas,
    ctx,
    styleSelector,
    currentStyleDisplaySpan,
    regenerateButton,
    exportButton,
    galleryButton,
    saveToGalleryButton,
    randomSeedButton,
    seedInput,
    currentSeedDisplay,
    togglePanelButton,
    controlsPanel,
    applySettingsBtn,
    numShapesInput,
    lineWidthInput,
    canvasWidthInput,
    canvasHeightInput,
    colorThemeSelector,
    baseHueInput,
    saturationInput,
    lightnessInput,
    backgroundColorPicker,
    animationToggle,
    animationSpeedInput,
    interactiveToggle,
    galleryModal,
    closeButton,
    numShapesDisplay,
    lineWidthDisplay,
    baseHueDisplay,
    saturationDisplay,
    lightnessDisplay,
    animationSpeedDisplay,
    customColorControls,
    currentArtStyle,
    numShapes,
    lineWidth,
    colorTheme,
    baseHue,
    saturation,
    lightness,
    backgroundColor
} from './state.js';
import { drawArtwork } from './drawArtwork.js';
import { saveSettings } from './saveSettings.js';
import { getCurrentAppState } from './getCurrentAppState.js';
import { initCanvas } from './initCanvas.js';
import { openGallery } from './openGallery.js';
import { toggleFullscreen } from './toggleFullscreen.js';

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

export { setupUI };
