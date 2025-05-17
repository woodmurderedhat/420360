/**
 * gallery.js - Gallery functionality for the Generative Art Studio
 * Handles saving, loading, and displaying artwork in the gallery
 */

import { generateUniqueId, formatDate } from './utils.js';

// Local storage key for gallery
const GALLERY_STORAGE_KEY = 'generativeArtGallery';
const MAX_GALLERY_ITEMS = 50; // Maximum number of items to store in gallery
const THUMBNAIL_WIDTH = 300; // Width of thumbnail images
const THUMBNAIL_HEIGHT = 200; // Height of thumbnail images
const ITEMS_PER_PAGE = 12; // Number of items to show per page in gallery

/**
 * Create a resized thumbnail from a canvas
 * @param {HTMLCanvasElement} canvas - The source canvas
 * @param {number} width - The desired width
 * @param {number} height - The desired height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {string} The data URL of the thumbnail
 */
function createThumbnail(canvas, width = THUMBNAIL_WIDTH, height = THUMBNAIL_HEIGHT, quality = 0.8) {
    // Create a temporary canvas for the thumbnail
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;
    const thumbnailCtx = thumbnailCanvas.getContext('2d');

    // Draw the original canvas onto the thumbnail canvas with proper scaling
    thumbnailCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);

    // Convert to JPEG for better compression (smaller file size)
    return thumbnailCanvas.toDataURL('image/jpeg', quality);
}

/**
 * Save the current artwork to the gallery
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} settings - The settings used to create the artwork
 * @returns {string} The ID of the saved artwork
 */
function saveToGallery(canvas, settings) {
    try {
        // Generate a high-quality version for export (PNG)
        const fullDataURL = canvas.toDataURL('image/png');

        // Generate a compressed thumbnail for gallery display
        const thumbnailDataURL = createThumbnail(canvas);

        // Create a gallery item with a unique ID
        const id = generateUniqueId();
        const timestamp = new Date().toISOString();

        const galleryItem = {
            id,
            timestamp,
            thumbnailDataURL, // Smaller thumbnail for gallery display
            fullDataURL,      // Full resolution for export (only loaded when needed)
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
 * Create a gallery item element
 * @param {Object} item - The gallery item data
 * @param {Function} onSelect - Callback when an item is selected
 * @param {Function} onDelete - Callback when an item is deleted
 * @returns {HTMLElement} The gallery item element
 */
function createGalleryItemElement(item, onSelect, onDelete) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.dataset.id = item.id;

    // Create thumbnail with lazy loading
    const img = document.createElement('img');
    img.loading = 'lazy'; // Lazy load images

    // Use thumbnail for display if available, fallback to full image
    img.src = item.thumbnailDataURL || item.dataURL || item.fullDataURL;
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
                    const galleryContainer = document.getElementById('galleryContainer');
                    if (galleryContainer) {
                        galleryContainer.innerHTML = '<p class="gallery-empty">Your gallery is empty. Create and save some artwork!</p>';
                    }
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

        // Use the full resolution image for export
        const imageUrl = item.fullDataURL || item.dataURL;

        // Create temporary link to download image
        const link = document.createElement('a');
        link.download = `generative-art-${item.settings?.style?.toLowerCase().replace(/\s+/g, '-') || 'artwork'}-${Date.now()}.png`;
        link.href = imageUrl;
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

    return galleryItem;
}

/**
 * Create pagination controls
 * @param {HTMLElement} container - The container element
 * @param {number} currentPage - The current page
 * @param {number} totalPages - The total number of pages
 * @param {Function} onPageChange - Callback when page changes
 */
function createPaginationControls(container, currentPage, totalPages, onPageChange) {
    // Don't show pagination if only one page
    if (totalPages <= 1) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'gallery-pagination';

    // Previous page button
    const prevButton = document.createElement('button');
    prevButton.textContent = '← Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    });

    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'page-indicator';
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

    // Next page button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next →';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    });

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageIndicator);
    paginationContainer.appendChild(nextButton);

    container.appendChild(paginationContainer);
}

/**
 * Populate the gallery container with artwork
 * @param {HTMLElement} container - The container element
 * @param {Function} onSelect - Callback when an item is selected
 * @param {Function} onDelete - Callback when an item is deleted
 * @param {number} page - The page to display (1-based)
 */
function populateGallery(container, onSelect, onDelete, page = 1) {
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

                // Calculate pagination
                const totalItems = gallery.length;
                const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

                // Ensure page is within valid range
                page = Math.max(1, Math.min(page, totalPages));

                // Calculate slice indices
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

                // Get items for current page
                const pageItems = gallery.slice(startIndex, endIndex);

                // Create gallery items container
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'gallery-items-container';

                // Create gallery items
                pageItems.forEach(item => {
                    const galleryItem = createGalleryItemElement(item, onSelect, onDelete);
                    itemsContainer.appendChild(galleryItem);
                });

                container.appendChild(itemsContainer);

                // Create pagination controls
                createPaginationControls(container, page, totalPages, (newPage) => {
                    populateGallery(container, onSelect, onDelete, newPage);
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
 * @param {Object} options - Export options
 * @returns {string} The data URL of the exported image
 */
function exportAsPNG(canvas, style, options = {}) {
    // Default to high quality PNG
    const dataURL = canvas.toDataURL('image/png');

    // Create filename
    const filename = `generative-art-${style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return dataURL;
}

/**
 * Export artwork as JPEG
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} style - The art style name
 * @param {number} quality - JPEG quality (0-1)
 * @returns {string} The data URL of the exported image
 */
function exportAsJPEG(canvas, style, quality = 0.9) {
    // Create JPEG with specified quality
    const dataURL = canvas.toDataURL('image/jpeg', quality);

    // Create filename
    const filename = `generative-art-${style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
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
    exportAsPNG,
    exportAsJPEG,
    createThumbnail
};
