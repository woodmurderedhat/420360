/**
 * responsive.js - Responsive UI handling for the Generative Art Studio
 * Manages responsive UI features and mobile-specific functionality
 */

import { getElement, getElements } from './components.js';
import { registerHandler, triggerEvent } from './events.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';

// Private module state
let _isMobileView = false;
let _isTabletView = false;
let _isPanelVisible = true;
let _sectionStates = {};

/**
 * Initialize responsive UI features
 */
function initResponsiveUI() {
    try {
        // Check initial viewport size
        checkViewportSize();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up collapsible sections
        setupCollapsibleSections();
        
        // Set up mobile menu
        setupMobileMenu();
        
        // Set up mobile action buttons
        setupMobileActionButtons();
        
        // Apply touch-friendly classes
        applyTouchFriendlyClasses();
        
        // Set up window resize handler
        window.addEventListener('resize', handleWindowResize);
        
        return true;
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'responsive',
            message: 'Error initializing responsive UI'
        });
        return false;
    }
}

/**
 * Check viewport size and set device type flags
 */
function checkViewportSize() {
    const width = window.innerWidth;
    _isMobileView = width <= 768;
    _isTabletView = width > 768 && width <= 1024;
    
    // Apply device-specific classes to body
    document.body.classList.toggle('mobile-view', _isMobileView);
    document.body.classList.toggle('tablet-view', _isTabletView);
    
    // Handle panel visibility based on device type
    const controlsPanel = getElement('controlsPanel');
    if (controlsPanel) {
        if (_isMobileView) {
            controlsPanel.classList.toggle('mobile-visible', _isPanelVisible);
        } else {
            controlsPanel.style.display = _isPanelVisible ? 'flex' : 'none';
        }
    }
}

/**
 * Set up event listeners for responsive UI
 */
function setupEventListeners() {
    // Toggle panel button
    const togglePanelButton = getElement('togglePanelButton');
    if (togglePanelButton) {
        togglePanelButton.addEventListener('click', toggleControlPanel);
    }
    
    // Mobile menu overlay
    const mobileMenuOverlay = getElement('mobileMenuOverlay');
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => {
            if (_isMobileView && _isPanelVisible) {
                toggleControlPanel();
            }
        });
    }
}

/**
 * Toggle control panel visibility
 */
function toggleControlPanel() {
    _isPanelVisible = !_isPanelVisible;
    
    const controlsPanel = getElement('controlsPanel');
    const togglePanelButton = getElement('togglePanelButton');
    const mobileMenuOverlay = getElement('mobileMenuOverlay');
    
    if (!controlsPanel || !togglePanelButton) return;
    
    if (_isMobileView) {
        // Mobile view - slide panel in/out
        controlsPanel.classList.toggle('mobile-visible', _isPanelVisible);
        togglePanelButton.textContent = _isPanelVisible ? 'Close' : 'Settings';
        
        // Toggle overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.toggle('visible', _isPanelVisible);
        }
    } else {
        // Desktop/tablet view - show/hide panel
        controlsPanel.style.display = _isPanelVisible ? 'flex' : 'none';
        togglePanelButton.textContent = _isPanelVisible ? 'Hide Settings' : 'Show Settings';
    }
}

/**
 * Set up collapsible sections for tablet and mobile views
 */
function setupCollapsibleSections() {
    const sections = document.querySelectorAll('.control-section');
    
    sections.forEach(section => {
        const heading = section.querySelector('h3');
        if (!heading) return;
        
        // Store initial state
        const sectionId = section.id || `section-${Math.random().toString(36).substr(2, 9)}`;
        if (!section.id) section.id = sectionId;
        
        _sectionStates[sectionId] = {
            collapsed: false
        };
        
        // Add click handler to heading
        heading.addEventListener('click', (e) => {
            // Only handle clicks in tablet or mobile view
            if (!_isTabletView && !_isMobileView) return;
            
            // Toggle collapsed state
            _sectionStates[sectionId].collapsed = !_sectionStates[sectionId].collapsed;
            
            // Update UI
            heading.classList.toggle('collapsed', _sectionStates[sectionId].collapsed);
            section.classList.toggle('collapsed', _sectionStates[sectionId].collapsed);
        });
    });
}

/**
 * Set up mobile menu functionality
 */
function setupMobileMenu() {
    // Nothing additional needed here as the toggle functionality
    // is handled by the toggleControlPanel function
}

/**
 * Set up mobile action buttons
 */
function setupMobileActionButtons() {
    // Mobile regenerate button
    const mobileRegenerateButton = getElement('mobileRegenerateButton');
    if (mobileRegenerateButton) {
        mobileRegenerateButton.addEventListener('click', () => {
            triggerEvent('regenerate');
        });
    }
    
    // Mobile export button
    const mobileExportButton = getElement('mobileExportButton');
    if (mobileExportButton) {
        mobileExportButton.addEventListener('click', () => {
            triggerEvent('export');
        });
    }
    
    // Mobile gallery button
    const mobileGalleryButton = getElement('mobileGalleryButton');
    if (mobileGalleryButton) {
        mobileGalleryButton.addEventListener('click', () => {
            triggerEvent('openGallery');
        });
    }
    
    // Mobile fullscreen button
    const mobileFullscreenButton = getElement('mobileFullscreenButton');
    if (mobileFullscreenButton) {
        mobileFullscreenButton.addEventListener('click', () => {
            triggerEvent('toggleFullscreen');
        });
    }
}

/**
 * Apply touch-friendly classes to input elements
 */
function applyTouchFriendlyClasses() {
    // Add touch-friendly class to range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        input.classList.add('touch-friendly-slider');
    });
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Debounce resize handling
    if (window._resizeTimeout) {
        clearTimeout(window._resizeTimeout);
    }
    
    window._resizeTimeout = setTimeout(() => {
        checkViewportSize();
    }, 250);
}

/**
 * Clean up responsive UI resources
 */
function cleanupResponsiveUI() {
    window.removeEventListener('resize', handleWindowResize);
}

// Public API
export {
    initResponsiveUI,
    toggleControlPanel,
    cleanupResponsiveUI
};
