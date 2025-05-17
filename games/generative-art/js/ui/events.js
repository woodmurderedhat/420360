/**
 * events.js - Event handling for the Generative Art Studio
 * Manages event listeners and handlers for UI interactions
 */

import { getElement, getElements, addListener, setValue, getValue } from './components.js';
import { getState, updateState } from '../state.js';
import { handleError, ErrorType, ErrorSeverity } from '../error-service.js';
import { debounce, throttle } from '../utils.js';

// Private module state
const _eventHandlers = new Map();
const _eventListeners = [];

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
                component: 'events',
                event: eventName,
                message: `Error in event handler for ${eventName}`
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
            triggerEvent('toggleFullscreen');
            e.preventDefault();
        },
        ' ': (e) => {
            triggerEvent('toggleAnimation');
            e.preventDefault(); // Prevent page scrolling
        },
        'ctrl+z': (e) => {
            triggerEvent('undo');
            e.preventDefault();
        },
        'ctrl+y': (e) => {
            triggerEvent('redo');
            e.preventDefault();
        },
        'ctrl+shift+z': (e) => {
            triggerEvent('redo');
            e.preventDefault();
        }
    };

    // Add number key handlers (1-9)
    for (let i = 1; i <= 9; i++) {
        keyHandlers[i.toString()] = () => {
            triggerEvent('quickGenerate', { preset: i });
        };
    }

    // Add custom handlers from options
    if (options.customHandlers) {
        Object.entries(options.customHandlers).forEach(([key, handler]) => {
            keyHandlers[key] = handler;
        });
    }

    // Handle keydown events
    const handleKeyDown = (event) => {
        // Skip if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Get key combination
        let key = event.key.toLowerCase();
        if (event.ctrlKey) key = 'ctrl+' + key;
        if (event.shiftKey && key !== 'ctrl+z') key = 'shift+' + key;

        // Execute handler if exists
        const handler = keyHandlers[key];
        if (handler) {
            handler(event);
        }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    _eventListeners.push({ element: document, type: 'keydown', handler: handleKeyDown });
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
    _eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
    });
    _eventListeners.length = 0;
}

// Public API
export {
    registerHandler,
    triggerEvent,
    setupKeyboardShortcuts,
    setupWindowResize,
    setupFullscreenChangeListeners,
    cleanupEventListeners
};
