/**
 * events.js - Event handling for the Generative Art Studio
 * Manages event listeners and handlers for UI interactions
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { debounce, throttle } from '../utils.js';

// Utility function to escape HTML
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) { 
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; 
    });
}

// Private module state
const _eventHandlers = new Map();
const _eventListeners = [];
const _observedElements = new Map();

/**
 * Register an event handler
 * @param {string} eventName - The name of the event
 * @param {Function} handler - The event handler function
 */
function registerHandler(eventName, handler) {
    _eventHandlers.set(eventName, handler);
}

/**
 * Trigger an event
 * @param {string} eventName - The name of the event
 * @param {Object} data - Data to pass to the event handler
 * @returns {any} The result of the event handler
 */
function triggerEvent(eventName, data = {}) {
    const handler = _eventHandlers.get(eventName);
    if (handler) {
        try {
            return handler(data);
        } catch (error) {
            handleError(error, ErrorType.UI, ErrorSeverity.ERROR, {
                component: 'triggerEvent',
                eventName,
                message: `Error triggering event "${eventName}"`
            });
        }
    }
    return null;
}

/**
 * Set up keyboard shortcuts
 * @param {Object} options - Options for keyboard shortcuts
 */
function setupKeyboardShortcuts(options = {}) {
    const keyHandlers = {
        'r': () => triggerEvent('regenerate'),
        'e': () => triggerEvent('export'),
        'g': () => triggerEvent('openGallery'),
        'f': (e) => {
            e.preventDefault();
            triggerEvent('toggleFullscreen');
        },
        ' ': (e) => {
            e.preventDefault();
            triggerEvent('toggleAnimation');
        },
        'ctrl+z': (e) => {
            e.preventDefault();
            triggerEvent('undo');
        },
        'ctrl+y': (e) => {
            e.preventDefault();
            triggerEvent('redo');
        },
        'ctrl+shift+z': (e) => {
            e.preventDefault();
            triggerEvent('redo');
        },
        'c': () => triggerEvent('toggleCompositionGuides'),
        'p': () => triggerEvent('showPresets'),
        'h': () => triggerEvent('toggleHelp'),
        'esc': () => triggerEvent('closeAllModals')
    };
    
    // Add number keys for styles
    for (let i = 1; i <= 9; i++) {
        keyHandlers[`${i}`] = () => triggerEvent('selectStyle', { index: i - 1 });
    }
    
    // Handler for keyboard shortcuts
    const handleKeyDown = (e) => {
        // Skip if user is typing in an input field
        if (
            document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA' || 
            document.activeElement.tagName === 'SELECT' ||
            document.activeElement.isContentEditable
        ) {
            return;
        }
        
        let key = e.key.toLowerCase();
        
        // Create shortcut string with modifiers
        if (e.ctrlKey) key = 'ctrl+' + key;
        if (e.shiftKey) key = key.includes('ctrl+') ? key.replace('ctrl+', 'ctrl+shift+') : 'shift+' + key;
        
        // Check for escape key
        if (e.key === 'Escape') key = 'esc';
        
        // Execute handler if found
        const handler = keyHandlers[key];
        if (handler) {
            handler(e);
            
            // Show visual feedback for the shortcut
            showShortcutFeedback(key);
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    _eventListeners.push({ element: document, type: 'keydown', handler: handleKeyDown });
}

/**
 * Show visual feedback when a keyboard shortcut is used
 * @param {string} key - The key combination
 */
function showShortcutFeedback(key) {
    // Create or get feedback element
    let feedback = document.getElementById('shortcut-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'shortcut-feedback';
        document.body.appendChild(feedback);
    }
    
    // Format key for display
    const displayKey = key
        .replace('ctrl+', 'Ctrl + ')
        .replace('shift+', 'Shift + ')
        .replace(' ', 'Space');
    
    // Add descriptive text based on the shortcut
    let action = 'Unknown Action';
    switch (key) {
        case 'r': action = 'Regenerate Artwork'; break;
        case 'e': action = 'Export as PNG'; break;
        case 'g': action = 'Open Gallery'; break;
        case 'f': action = 'Toggle Fullscreen'; break;
        case ' ': action = 'Toggle Animation'; break;
        case 'ctrl+z': action = 'Undo'; break;
        case 'ctrl+y': case 'ctrl+shift+z': action = 'Redo'; break;
        case 'c': action = 'Toggle Composition Guides'; break;
        case 'p': action = 'Show Presets'; break;
        case 'h': action = 'Toggle Help'; break;
        case 'esc': action = 'Close Modal'; break;
        default:
            if (key >= '1' && key <= '9') {
                action = `Select Style ${key}`;
            }
    }
    
    // Update content and show
    feedback.innerHTML = `
        <div class="key">${escapeHtml(displayKey)}</div>
        <div class="action">${escapeHtml(action)}</div>
    `;
    feedback.classList.add('visible');
    
    // Hide after delay
    setTimeout(() => {
        feedback.classList.remove('visible');
    }, 1500);
}

/**
 * Observe element changes to update UI
 * @param {string} elementId - ID of the element to observe
 * @param {Function} callback - Callback function when element changes
 * @returns {Function} Function to stop observing
 */
function observeElementChanges(elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) return () => {};
    
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
        callback(element, mutations);
    });
    
    // Start observing
    observer.observe(element, { 
        attributes: true, 
        childList: true,
        subtree: true,
        characterData: true
    });
    
    // Store observer for cleanup
    _observedElements.set(elementId, observer);
    
    // Return function to stop observing
    return () => {
        observer.disconnect();
        _observedElements.delete(elementId);
    };
}

/**
 * Set up window resize handling
 * @param {Function} callback - Function to call on window resize
 */
function setupWindowResize(callback) {
    if (!callback) return;

    const handleResize = debounce(() => {
        try {
            callback();
        } catch (error) {
            handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
                component: 'events',
                event: 'resize',
                message: 'Error handling window resize'
            });
        }
    }, 250);

    window.addEventListener('resize', handleResize);
    _eventListeners.push({ element: window, type: 'resize', handler: handleResize });
}

/**
 * Set up fullscreen change listeners
 * @param {Function} callback - Function to call on fullscreen change
 */
function setupFullscreenChangeListeners(callback) {
    if (!callback) return;

    const handleFullscreenChange = () => {
        try {
            const canvas = getElement('canvas');
            if (document.fullscreenElement) {
                canvas.classList.add('fullscreen-canvas');
            } else {
                canvas.classList.remove('fullscreen-canvas');
            }
            callback();
        } catch (error) {
            handleError(error, ErrorType.UI, ErrorSeverity.WARNING, {
                component: 'events',
                event: 'fullscreenchange',
                message: 'Error handling fullscreen change'
            });
        }
    };

    // Add event listeners for different browser implementations
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    _eventListeners.push({ element: document, type: 'fullscreenchange', handler: handleFullscreenChange });
    _eventListeners.push({ element: document, type: 'webkitfullscreenchange', handler: handleFullscreenChange });
    _eventListeners.push({ element: document, type: 'mozfullscreenchange', handler: handleFullscreenChange });
    _eventListeners.push({ element: document, type: 'MSFullscreenChange', handler: handleFullscreenChange });
}

/**
 * Clean up all event listeners
 */
function cleanupEventListeners() {
    // Remove all registered event listeners
    _eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
    });
    _eventListeners.length = 0;
    
    // Disconnect all mutation observers
    _observedElements.forEach((observer) => {
        observer.disconnect();
    });
    _observedElements.clear();
}

// Public API
export {
    registerHandler,
    triggerEvent,
    setupKeyboardShortcuts,
    setupWindowResize,
    setupFullscreenChangeListeners,
    observeElementChanges,
    cleanupEventListeners
};
