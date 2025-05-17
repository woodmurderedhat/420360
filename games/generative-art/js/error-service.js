/**
 * error-service.js - Standardized error handling for the Generative Art Studio
 * Provides consistent error logging, user feedback, and error recovery
 */

// Error types
export const ErrorType = {
    RENDERING: 'rendering',
    STATE: 'state',
    STORAGE: 'storage',
    NETWORK: 'network',
    WORKER: 'worker',
    UI: 'ui',
    ANIMATION: 'animation',
    WEBGL: 'webgl',
    UNKNOWN: 'unknown'
};

// Error severity levels
export const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

// Default error messages by type
const defaultErrorMessages = {
    [ErrorType.RENDERING]: 'Error rendering artwork',
    [ErrorType.STATE]: 'Error managing application state',
    [ErrorType.STORAGE]: 'Error accessing browser storage',
    [ErrorType.NETWORK]: 'Network error',
    [ErrorType.WORKER]: 'Background processing error',
    [ErrorType.UI]: 'User interface error',
    [ErrorType.ANIMATION]: 'Animation error',
    [ErrorType.WEBGL]: 'WebGL rendering error',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred'
};

// Error listeners
const errorListeners = [];

/**
 * Handle an error with standardized logging and user feedback
 * @param {Error|string} error - The error object or message
 * @param {string} type - The error type (from ErrorType enum)
 * @param {string} severity - The error severity (from ErrorSeverity enum)
 * @param {Object} details - Additional error details
 * @returns {string} The error ID for reference
 */
export function handleError(error, type = ErrorType.UNKNOWN, severity = ErrorSeverity.ERROR, details = {}) {
    // Generate a unique error ID
    const errorId = generateErrorId();
    
    // Create standardized error object
    const errorObject = {
        id: errorId,
        timestamp: new Date().toISOString(),
        type,
        severity,
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : null,
        details
    };
    
    // Log the error
    logError(errorObject);
    
    // Show user feedback if needed
    if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
        showUserFeedback(errorObject);
    }
    
    // Notify error listeners
    notifyErrorListeners(errorObject);
    
    return errorId;
}

/**
 * Log an error to the console with consistent formatting
 * @param {Object} errorObject - The standardized error object
 */
function logError(errorObject) {
    const { id, timestamp, type, severity, message, stack, details } = errorObject;
    
    // Format the console output
    const logPrefix = `[${severity.toUpperCase()}][${type}][${id}]`;
    
    // Use appropriate console method based on severity
    switch (severity) {
        case ErrorSeverity.INFO:
            console.info(`${logPrefix} ${message}`, { timestamp, details });
            break;
        case ErrorSeverity.WARNING:
            console.warn(`${logPrefix} ${message}`, { timestamp, details });
            break;
        case ErrorSeverity.ERROR:
        case ErrorSeverity.CRITICAL:
            console.error(`${logPrefix} ${message}`, { timestamp, stack, details });
            break;
        default:
            console.log(`${logPrefix} ${message}`, { timestamp, details });
    }
}

/**
 * Show user feedback for an error
 * @param {Object} errorObject - The standardized error object
 */
function showUserFeedback(errorObject) {
    const { type, severity, message } = errorObject;
    
    // Get a user-friendly message
    const userMessage = getUserFriendlyMessage(type, message);
    
    // Create or update error notification element
    const notificationContainer = document.getElementById('errorNotifications') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `error-notification ${severity}`;
    notification.innerHTML = `
        <div class="error-icon">${getErrorIcon(severity)}</div>
        <div class="error-content">
            <div class="error-title">${getErrorTitle(severity)}</div>
            <div class="error-message">${userMessage}</div>
        </div>
        <button class="error-close">&times;</button>
    `;
    
    // Add close button functionality
    const closeButton = notification.querySelector('.error-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
            
            // Remove container if empty
            if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
            }
        }, 300);
    });
    
    // Auto-dismiss non-critical errors after a delay
    if (severity !== ErrorSeverity.CRITICAL) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add to the DOM
    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
}

/**
 * Create the notification container if it doesn't exist
 * @returns {HTMLElement} The notification container
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'errorNotifications';
    container.className = 'error-notification-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Get a user-friendly error message
 * @param {string} type - The error type
 * @param {string} message - The original error message
 * @returns {string} A user-friendly message
 */
function getUserFriendlyMessage(type, message) {
    // If the message is already user-friendly, use it
    if (message && message.length < 100 && !message.includes('Error:')) {
        return message;
    }
    
    // Otherwise use a default message based on the error type
    return defaultErrorMessages[type] || defaultErrorMessages[ErrorType.UNKNOWN];
}

/**
 * Get an appropriate icon for the error severity
 * @param {string} severity - The error severity
 * @returns {string} HTML for the icon
 */
function getErrorIcon(severity) {
    switch (severity) {
        case ErrorSeverity.INFO:
            return '&#9432;'; // Information symbol
        case ErrorSeverity.WARNING:
            return '&#9888;'; // Warning symbol
        case ErrorSeverity.ERROR:
        case ErrorSeverity.CRITICAL:
            return '&#9888;'; // Warning symbol
        default:
            return '&#9432;'; // Information symbol
    }
}

/**
 * Get an appropriate title for the error severity
 * @param {string} severity - The error severity
 * @returns {string} The title text
 */
function getErrorTitle(severity) {
    switch (severity) {
        case ErrorSeverity.INFO:
            return 'Information';
        case ErrorSeverity.WARNING:
            return 'Warning';
        case ErrorSeverity.ERROR:
            return 'Error';
        case ErrorSeverity.CRITICAL:
            return 'Critical Error';
        default:
            return 'Notification';
    }
}

/**
 * Generate a unique error ID
 * @returns {string} A unique error ID
 */
function generateErrorId() {
    return 'err_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Add an error listener
 * @param {Function} listener - Function to call when an error occurs
 * @returns {Function} Function to remove the listener
 */
export function addErrorListener(listener) {
    errorListeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
        const index = errorListeners.indexOf(listener);
        if (index !== -1) {
            errorListeners.splice(index, 1);
        }
    };
}

/**
 * Notify all error listeners
 * @param {Object} errorObject - The standardized error object
 */
function notifyErrorListeners(errorObject) {
    errorListeners.forEach(listener => {
        try {
            listener(errorObject);
        } catch (listenerError) {
            console.error('Error in error listener:', listenerError);
        }
    });
}

/**
 * Create a CSS style for error notifications
 */
function createErrorStyles() {
    // Check if styles already exist
    if (document.getElementById('error-service-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'error-service-styles';
    style.textContent = `
        .error-notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        }
        
        .error-notification {
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            padding: 12px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            opacity: 0.95;
        }
        
        .error-notification.visible {
            transform: translateX(0);
        }
        
        .error-notification.closing {
            transform: translateX(120%);
        }
        
        .error-notification.info {
            border-left: 4px solid #2196F3;
        }
        
        .error-notification.warning {
            border-left: 4px solid #FF9800;
        }
        
        .error-notification.error {
            border-left: 4px solid #F44336;
        }
        
        .error-notification.critical {
            border-left: 4px solid #9C27B0;
        }
        
        .error-icon {
            margin-right: 12px;
            font-size: 24px;
            display: flex;
            align-items: center;
        }
        
        .error-content {
            flex: 1;
        }
        
        .error-title {
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .error-message {
            font-size: 14px;
            color: #555;
        }
        
        .error-close {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #999;
            padding: 0;
            margin-left: 8px;
            align-self: flex-start;
        }
        
        .error-close:hover {
            color: #555;
        }
    `;
    
    document.head.appendChild(style);
}

// Create error styles when the module is imported
createErrorStyles();
