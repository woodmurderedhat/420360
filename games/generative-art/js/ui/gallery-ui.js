/**
 * gallery-ui.js - Gallery UI functionality for the Generative Art Studio
 * Handles gallery modal and UI interactions
 */

import { getElement, getElements } from './components.js';
import { registerHandler } from './events.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { populateGallery, deleteFromGallery } from '../gallery.js';
import { artStyles } from '../styles.js';

/**
 * Set up gallery modal controls
 */
function setupGalleryModalControls() {
    const galleryModal = getElement('galleryModal');
    const closeButton = getElement('closeButton');
    
    // Gallery modal close button
    if (closeButton && galleryModal) {
        closeButton.addEventListener('click', () => {
            galleryModal.style.display = 'none';
        });
    }
    
    // Close gallery when clicking outside the modal
    if (galleryModal) {
        window.addEventListener('click', (event) => {
            if (event.target === galleryModal) {
                galleryModal.style.display = 'none';
            }
        });
    }
    
    // Register gallery event handler
    registerHandler('openGallery', () => {
        openGallery();
    });
}

/**
 * Open the gallery modal and populate it
 */
function openGallery() {
    try {
        const galleryModal = getElement('galleryModal');
        const galleryContainer = getElement('galleryContainer');
        const applySettingsBtn = getElement('applySettingsBtn');
        
        if (!galleryModal || !galleryContainer) {
            handleError(
                new Error('Gallery modal or container not found'),
                ErrorType.UI,
                ErrorSeverity.WARNING,
                { component: 'openGallery', message: 'Gallery elements not found in the DOM' }
            );
            return;
        }
        
        galleryModal.style.display = 'block';
        
        // Add error event listener if not already added
        if (!window._galleryErrorListenerAdded) {
            window.addEventListener('galleryError', (event) => {
                const { action, id, error } = event.detail;
                handleError(
                    new Error(`Gallery ${action} error: ${error}`),
                    ErrorType.STORAGE,
                    ErrorSeverity.WARNING,
                    { component: 'gallery', action, itemId: id }
                );
            });
            window._galleryErrorListenerAdded = true;
        }
        
        // Populate gallery
        populateGallery(galleryContainer,
            // On select callback
            (item) => {
                // Load settings from gallery item
                if (item.settings) {
                    const state = {};
                    
                    if (item.settings.style) {
                        state.currentArtStyle = artStyles.DEFAULT;
                    }
                    
                    if (item.settings.numShapes) {
                        state.numShapes = +item.settings.numShapes;
                        
                        const numShapesInput = getElement('numShapesInput');
                        const numShapesDisplay = getElement('numShapesDisplay');
                        
                        if (numShapesInput) numShapesInput.value = item.settings.numShapes;
                        if (numShapesDisplay) numShapesDisplay.textContent = item.settings.numShapes;
                    }
                    
                    if (item.settings.lineWidth) {
                        state.lineWidth = +item.settings.lineWidth;
                        
                        const lineWidthInput = getElement('lineWidthInput');
                        const lineWidthDisplay = getElement('lineWidthDisplay');
                        
                        if (lineWidthInput) lineWidthInput.value = item.settings.lineWidth;
                        if (lineWidthDisplay) lineWidthDisplay.textContent = item.settings.lineWidth;
                    }
                    
                    if (item.settings.seed) {
                        const seedInput = getElement('seedInput');
                        const currentSeedDisplay = getElement('currentSeedDisplay');
                        
                        if (seedInput) seedInput.value = item.settings.seed;
                        if (currentSeedDisplay) currentSeedDisplay.textContent = item.settings.seed;
                    }
                    
                    if (item.settings.colorTheme) {
                        state.colorTheme = item.settings.colorTheme;
                        
                        const colorThemeSelector = getElement('colorThemeSelector');
                        const customColorControls = getElement('customColorControls');
                        
                        if (colorThemeSelector) {
                            colorThemeSelector.value = item.settings.colorTheme;
                            
                            if (customColorControls) {
                                customColorControls.style.display = item.settings.colorTheme === 'custom' ? 'block' : 'none';
                            }
                        }
                    }
                    
                    if (item.settings.baseHue) {
                        state.baseHue = +item.settings.baseHue;
                        
                        const baseHueInput = getElement('baseHueInput');
                        const baseHueDisplay = getElement('baseHueDisplay');
                        
                        if (baseHueInput) baseHueInput.value = item.settings.baseHue;
                        if (baseHueDisplay) baseHueDisplay.textContent = item.settings.baseHue;
                    }
                    
                    if (item.settings.saturation) {
                        state.saturation = +item.settings.saturation;
                        
                        const saturationInput = getElement('saturationInput');
                        const saturationDisplay = getElement('saturationDisplay');
                        
                        if (saturationInput) saturationInput.value = item.settings.saturation;
                        if (saturationDisplay) saturationDisplay.textContent = item.settings.saturation;
                    }
                    
                    if (item.settings.lightness) {
                        state.lightness = +item.settings.lightness;
                        
                        const lightnessInput = getElement('lightnessInput');
                        const lightnessDisplay = getElement('lightnessDisplay');
                        
                        if (lightnessInput) lightnessInput.value = item.settings.lightness;
                        if (lightnessDisplay) lightnessDisplay.textContent = item.settings.lightness;
                    }
                    
                    if (item.settings.backgroundColor) {
                        state.backgroundColor = item.settings.backgroundColor;
                        
                        const backgroundColorPicker = getElement('backgroundColorPicker');
                        if (backgroundColorPicker) backgroundColorPicker.value = item.settings.backgroundColor;
                    }
                    
                    // Update state
                    updateState(state);
                    
                    // Apply settings
                    if (applySettingsBtn) {
                        applySettingsBtn.click();
                    }
                }
                
                // Close gallery
                galleryModal.style.display = 'none';
            },
            // On delete callback - simplified to avoid recursive refreshes
            (id) => {
                // The actual deletion is handled in the gallery.js module
                // This callback is just for any UI-specific actions after deletion
                
                // Log deletion for debugging
                console.log(`Gallery item ${id} deleted`);
                
                // Add a listener for the gallery deletion event if not already added
                if (!window._galleryDeletionListenerAdded) {
                    window.addEventListener('galleryItemDeleted', (event) => {
                        const { remainingCount } = event.detail;
                        console.log(`Gallery item deleted. Remaining items: ${remainingCount}`);
                        
                        // If all items are deleted, you might want to show a notification
                        if (remainingCount === 0) {
                            // This could be a toast notification or other UI feedback
                            console.log('Gallery is now empty');
                        }
                    });
                    
                    window._galleryDeletionListenerAdded = true;
                }
            }
        );
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'openGallery',
            message: 'Error opening gallery'
        });
        
        // Ensure gallery is displayed even if there's an error
        const galleryModal = getElement('galleryModal');
        const galleryContainer = getElement('galleryContainer');
        
        if (galleryModal) {
            galleryModal.style.display = 'block';
            
            // Show error message in gallery container
            if (galleryContainer) {
                galleryContainer.innerHTML = '<p class="gallery-error">Error loading gallery. Please try again.</p>';
            }
        }
    }
}

// Public API
export {
    setupGalleryModalControls,
    openGallery
};
