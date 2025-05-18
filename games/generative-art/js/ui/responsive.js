/**
 * responsive.js - Responsive UI handling for the Generative Art Studio
 * Manages responsive UI features and mobile-specific functionality
 */

import { getElement, getElements } from './components.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';

// Responsive breakpoints
const BREAKPOINTS = {
    MOBILE: 600,
    TABLET: 1024
};

// Current device type
let currentDeviceType = 'desktop';

// Track if panel is expanded or collapsed
let isPanelExpanded = true;

/**
 * Initialize responsive UI behavior
 */
function initResponsiveUI() {
    try {
        // Get UI elements
        const togglePanelButton = getElement('togglePanelButton');
        const controlsPanel = getElement('controlsPanel');
        const mobileMenuOverlay = getElement('mobileMenuOverlay');
        
        // Set up panel toggle button
        if (togglePanelButton && controlsPanel) {
            togglePanelButton.addEventListener('click', () => {
                toggleControlPanel(controlsPanel, togglePanelButton);
            });
        }
        
        // Set up mobile menu overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                if (window.innerWidth <= BREAKPOINTS.TABLET) {
                    hideControlPanel(controlsPanel, togglePanelButton);
                }
            });
        }
        
        // Set up collapsible sections
        setupCollapsibleSections();
        
        // Set up tabbed interface for control categories
        setupTabbedInterface();
        
        // Set up responsive adaptation
        window.addEventListener('resize', handleResize);
        
        // Initial responsive setup
        handleResize();
        
        return true;
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
            component: 'initResponsiveUI',
            message: 'Failed to initialize responsive UI'
        });
        return false;
    }
}

/**
 * Set up collapsible sections in the control panel
 */
function setupCollapsibleSections() {
    try {
        const controlSections = document.querySelectorAll('.control-section');
        
        controlSections.forEach(section => {
            const heading = section.querySelector('h3');
            const content = document.createElement('div');
            
            // Skip if already processed or no heading
            if (!heading || section.classList.contains('collapsible-processed')) {
                return;
            }
            
            // Mark as processed
            section.classList.add('collapsible-processed');
            
            // Move all content except heading into content div
            Array.from(section.children).forEach(child => {
                if (child !== heading) {
                    content.appendChild(child);
                }
            });
            
            // Add content container back to section
            section.appendChild(content);
            content.className = 'section-content';
            
            // Add collapse/expand functionality
            heading.classList.add('collapsible-heading');
            heading.addEventListener('click', () => {
                section.classList.toggle('collapsed');
                
                // Save state to localStorage
                const isCollapsed = section.classList.contains('collapsed');
                const sectionId = section.id || heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
                localStorage.setItem(`section-${sectionId}-collapsed`, isCollapsed);
            });
            
            // Restore collapsed state from localStorage
            const sectionId = section.id || heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
            const isCollapsed = localStorage.getItem(`section-${sectionId}-collapsed`) === 'true';
            if (isCollapsed) {
                section.classList.add('collapsed');
            }
        });
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
            component: 'setupCollapsibleSections',
            message: 'Failed to set up collapsible sections'
        });
    }
}

/**
 * Set up tabbed interface for control categories
 */
function setupTabbedInterface() {
    try {
        // Create tab container if it doesn't exist
        let tabContainer = document.querySelector('.control-tabs');
        if (!tabContainer) {
            tabContainer = document.createElement('div');
            tabContainer.className = 'control-tabs';
            
            const controlsPanel = getElement('controlsPanel');
            if (controlsPanel) {
                controlsPanel.insertBefore(tabContainer, controlsPanel.firstChild);
            }
        }
        
        // Define tab categories
        const categories = [
            { id: 'basic', label: 'Basic', selector: '.control-section:nth-child(1), .control-section:nth-child(2)' },
            { id: 'layers', label: 'Layers', selector: '.control-section:nth-child(3), .control-section:nth-child(4)' },
            { id: 'advanced', label: 'Advanced', selector: '.control-section:nth-child(5), .control-section:nth-child(6), .control-section:nth-child(7), .control-section:nth-child(8)' },
            { id: 'tools', label: 'Tools', selector: '.control-section:nth-child(9)' }
        ];
        
        // Create tabs
        categories.forEach(category => {
            const tab = document.createElement('button');
            tab.textContent = category.label;
            tab.className = 'control-tab';
            tab.dataset.category = category.id;
            tabContainer.appendChild(tab);
            
            tab.addEventListener('click', () => {
                // Activate this tab
                document.querySelectorAll('.control-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show sections for this category, hide others
                document.querySelectorAll('.control-section').forEach(section => {
                    section.classList.add('hidden');
                });
                document.querySelectorAll(category.selector).forEach(section => {
                    section.classList.remove('hidden');
                });
                
                // Save active tab to localStorage
                localStorage.setItem('active-control-tab', category.id);
            });
        });
        
        // Activate the saved tab or the first one
        const savedTab = localStorage.getItem('active-control-tab');
        const tabToActivate = tabContainer.querySelector(savedTab ? 
            `[data-category="${savedTab}"]` : '.control-tab');
        if (tabToActivate) {
            tabToActivate.click();
        }
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
            component: 'setupTabbedInterface',
            message: 'Failed to set up tabbed interface'
        });
    }
}

/**
 * Handle resize event to adapt UI to current screen size
 */
function handleResize() {
    try {
        const width = window.innerWidth;
        const controlsPanel = getElement('controlsPanel');
        const togglePanelButton = getElement('togglePanelButton');
        
        // Determine device type
        let newDeviceType = 'desktop';
        if (width <= BREAKPOINTS.MOBILE) {
            newDeviceType = 'mobile';
        } else if (width <= BREAKPOINTS.TABLET) {
            newDeviceType = 'tablet';
        }
        
        // If device type changed, update UI accordingly
        if (newDeviceType !== currentDeviceType) {
            currentDeviceType = newDeviceType;
            
            // Apply device-specific adaptations
            document.body.dataset.deviceType = currentDeviceType;
            
            // Auto-collapse panel on small screens
            if (currentDeviceType === 'mobile' && isPanelExpanded) {
                hideControlPanel(controlsPanel, togglePanelButton);
            }
        }
    } catch (error) {
        handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
            component: 'handleResize',
            message: 'Error handling window resize'
        });
    }
}

/**
 * Toggle control panel visibility
 * @param {HTMLElement} panel - The control panel element
 * @param {HTMLElement} button - The toggle button element
 */
function toggleControlPanel(panel, button) {
    if (!panel) return;
    
    if (panel.classList.contains('collapsed')) {
        showControlPanel(panel, button);
    } else {
        hideControlPanel(panel, button);
    }
}

/**
 * Show the control panel
 * @param {HTMLElement} panel - The control panel element
 * @param {HTMLElement} button - The toggle button element
 */
function showControlPanel(panel, button) {
    if (!panel) return;
    
    panel.classList.remove('collapsed');
    if (button) {
        button.textContent = 'Hide Settings';
        button.setAttribute('aria-expanded', 'true');
    }
    
    // Show overlay on mobile
    const overlay = getElement('mobileMenuOverlay');
    if (overlay && window.innerWidth <= BREAKPOINTS.TABLET) {
        overlay.classList.add('visible');
    }
    
    isPanelExpanded = true;
}

/**
 * Hide the control panel
 * @param {HTMLElement} panel - The control panel element
 * @param {HTMLElement} button - The toggle button element
 */
function hideControlPanel(panel, button) {
    if (!panel) return;
    
    panel.classList.add('collapsed');
    if (button) {
        button.textContent = 'Show Settings';
        button.setAttribute('aria-expanded', 'false');
    }
    
    // Hide overlay on mobile
    const overlay = getElement('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
    
    isPanelExpanded = false;
}

/**
 * Clean up responsive UI resources
 */
function cleanupResponsiveUI() {
    window.removeEventListener('resize', handleResize);
    // Additional cleanup as needed
}

// Export public functions
export {
    initResponsiveUI,
    toggleControlPanel,
    showControlPanel,
    hideControlPanel,
    cleanupResponsiveUI,
    BREAKPOINTS
};
