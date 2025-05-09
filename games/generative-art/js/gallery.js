/**
 * gallery.js - Gallery functionality for the Generative Art Studio
 * Handles saving, loading, and displaying artwork in the gallery
 */

import { generateUniqueId, formatDate } from './utils.js';

// Local storage key for gallery
const GALLERY_STORAGE_KEY = 'generativeArtGallery';
const MAX_GALLERY_ITEMS = 50; // Maximum number of items to store in gallery

/**
 * Save the current artwork to the gallery
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} settings - The settings used to create the artwork
 * @returns {string} The ID of the saved artwork
 */
function saveToGallery(canvas, settings) {
    try {
        // Generate a thumbnail from the canvas
        const dataURL = canvas.toDataURL('image/png');

        // Create a gallery item with a unique ID
        const id = generateUniqueId();
        const timestamp = new Date().toISOString();

        const galleryItem = {
            id,
            timestamp,
            dataURL,
            settings: { ...settings },
            title: `${settings.style} - ${formatDate(new Date())}`
        };

        // Load existing gallery
        const gallery = loadGallery();

        // Add new item at the beginning
        gallery.unshift(galleryItem);

        // Limit gallery size to prevent localStorage issues
        if (gallery.length > MAX_GALLERY_ITEMS) {
            gallery.splice(MAX_GALLERY_ITEMS);
        }

        // Save gallery
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery));

        return id;
    } catch (error) {
        console.error('Error saving to gallery:', error);
        return null;
    }
}

/**
 * Load the gallery from local storage
 * @returns {Array} The gallery items
 */
function loadGallery() {
    const galleryData = localStorage.getItem(GALLERY_STORAGE_KEY);
    return galleryData ? JSON.parse(galleryData) : [];
}

/**
 * Delete an artwork from the gallery
 * @param {string} id - The ID of the artwork to delete
 * @returns {boolean} Whether the deletion was successful
 */
function deleteFromGallery(id) {
    const gallery = loadGallery();
    const initialLength = gallery.length;

    const filteredGallery = gallery.filter(item => item.id !== id);

    if (filteredGallery.length < initialLength) {
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(filteredGallery));
        return true;
    }

    return false;
}

/**
 * Get a specific artwork from the gallery
 * @param {string} id - The ID of the artwork to get
 * @returns {Object|null} The gallery item or null if not found
 */
function getGalleryItem(id) {
    const gallery = loadGallery();
    return gallery.find(item => item.id === id) || null;
}

/**
 * Populate the gallery container with artwork
 * @param {HTMLElement} container - The container element
 * @param {Function} onSelect - Callback when an item is selected
 * @param {Function} onDelete - Callback when an item is deleted
 */
function populateGallery(container, onSelect, onDelete) {
    try {
        // Show loading state
        container.innerHTML = '<div class="gallery-loading">Loading gallery...</div>';

        // Load gallery (async to prevent UI blocking)
        setTimeout(() => {
            try {
                // Clear the container
                container.innerHTML = '';

                // Load gallery
                const gallery = loadGallery();

                if (gallery.length === 0) {
                    container.innerHTML = '<p class="gallery-empty">Your gallery is empty. Create and save some artwork!</p>';
                    return;
                }

                // Create gallery items
                gallery.forEach(item => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.dataset.id = item.id;

                    // Create thumbnail with lazy loading
                    const img = document.createElement('img');
                    img.loading = 'lazy'; // Lazy load images
                    img.src = item.dataURL;
                    img.alt = item.title;
                    img.title = item.title;

                    // Add loading indicator for image
                    img.addEventListener('load', () => {
                        galleryItem.classList.add('loaded');
                    });

                    // Create info section
                    const info = document.createElement('div');
                    info.className = 'gallery-item-info';

                    const title = document.createElement('h3');
                    title.className = 'gallery-item-title';
                    title.textContent = item.title;

                    const date = document.createElement('div');
                    date.className = 'gallery-item-date';
                    date.textContent = formatDate(item.timestamp);

                    // Create actions
                    const actions = document.createElement('div');
                    actions.className = 'gallery-item-actions';

                    const loadBtn = document.createElement('button');
                    loadBtn.textContent = 'Load';
                    loadBtn.title = 'Load this artwork';
                    loadBtn.addEventListener('click', () => {
                        if (typeof onSelect === 'function') {
                            onSelect(item);
                        }
                    });

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.title = 'Delete this artwork';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this artwork?')) {
                            deleteFromGallery(item.id);
                            galleryItem.classList.add('removing');

                            // Animate removal
                            setTimeout(() => {
                                galleryItem.remove();

                                // Check if gallery is now empty
                                if (loadGallery().length === 0) {
                                    container.innerHTML = '<p class="gallery-empty">Your gallery is empty. Create and save some artwork!</p>';
                                }

                                if (typeof onDelete === 'function') {
                                    onDelete(item.id);
                                }
                            }, 300);
                        }
                    });

                    // Export button
                    const exportBtn = document.createElement('button');
                    exportBtn.textContent = 'Export';
                    exportBtn.title = 'Export as PNG';
                    exportBtn.addEventListener('click', (e) => {
                        e.stopPropagation();

                        // Create temporary link to download image
                        const link = document.createElement('a');
                        link.download = `generative-art-${item.settings?.style?.toLowerCase().replace(/\s+/g, '-') || 'artwork'}-${Date.now()}.png`;
                        link.href = item.dataURL;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });

                    // Assemble the gallery item
                    actions.appendChild(loadBtn);
                    actions.appendChild(exportBtn);
                    actions.appendChild(deleteBtn);

                    info.appendChild(title);
                    info.appendChild(date);
                    info.appendChild(actions);

                    galleryItem.appendChild(img);
                    galleryItem.appendChild(info);

                    container.appendChild(galleryItem);
                });
            } catch (error) {
                console.error('Error populating gallery:', error);
                container.innerHTML = '<p class="gallery-error">Error loading gallery. Please try again.</p>';
            }
        }, 10); // Small timeout to allow UI to update
    } catch (error) {
        console.error('Error in populateGallery:', error);
        container.innerHTML = '<p class="gallery-error">Error loading gallery. Please try again.</p>';
    }
}

/**
 * Export artwork as PNG
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} style - The art style name
 * @returns {string} The data URL of the exported image
 */
function exportAsPNG(canvas, style) {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `generative-art-${style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return dataURL;
}

// Export gallery functions
export {
    saveToGallery,
    loadGallery,
    deleteFromGallery,
    getGalleryItem,
    populateGallery,
    exportAsPNG
};
