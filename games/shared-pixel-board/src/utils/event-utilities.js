/**
 * Advanced Event Delegation and Lifecycle Management
 * Provides composable event handlers, delegated listeners, and cleanup
 */

/**
 * Event delegator for efficient event handling
 */
export class EventDelegator {
  constructor() {
    this.listeners = new Map();
    this.delegated = new Map();
  }

  /**
   * Register direct event listener
   */
  on(target, eventName, handler) {
    if (!target) return;

    const key = `${eventName}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    const listener = (event) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Handler error for ${eventName}:`, error);
      }
    };

    // Store originalHandler so off() can match by the caller's reference
    this.listeners.get(key).push({ target, listener, originalHandler: handler });
    target.addEventListener(eventName, listener);
  }

  /**
   * Register delegated event listener
   */
  delegate(parent, selector, eventName, handler) {
    if (!parent) return;

    const listener = (event) => {
      const target = event.target.closest(selector);
      if (target) {
        try {
          handler(event, target);
        } catch (error) {
          console.error(`Delegated handler error for ${eventName}:`, error);
        }
      }
    };

    // Key encodes both selector and event name so cleanup can extract the event
    const key = `${selector}:${eventName}`;
    if (!this.delegated.has(key)) {
      this.delegated.set(key, []);
    }

    this.delegated.get(key).push({ parent, listener });
    parent.addEventListener(eventName, listener);
  }

  /**
   * Remove specific listener
   */
  off(target, eventName, handler) {
    const key = `${eventName}`;
    if (!this.listeners.has(key)) return;

    const handlers = this.listeners.get(key);
    // Match by originalHandler (listener is the internal wrapper, not the caller's fn)
    const index = handlers.findIndex(
      (h) => h.target === target && h.originalHandler === handler
    );

    if (index >= 0) {
      target.removeEventListener(eventName, handlers[index].listener);
      handlers.splice(index, 1);
    }
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    // Clean up direct listeners — key IS the event name
    for (const [eventName, handlers] of this.listeners) {
      handlers.forEach(({ target, listener }) => {
        if (target && listener) {
          target.removeEventListener(eventName, listener);
        }
      });
    }
    this.listeners.clear();

    // Clean up delegated listeners — key is "selector:eventName"
    for (const [key, handlers] of this.delegated) {
      const eventName = key.slice(key.lastIndexOf(":") + 1);
      handlers.forEach(({ parent, listener }) => {
        if (parent && listener) {
          parent.removeEventListener(eventName, listener);
        }
      });
    }
    this.delegated.clear();
  }
}

/**
 * Compose multiple handlers
 */
export function composeHandlers(...handlers) {
  return function composedHandler(...args) {
    for (const handler of handlers) {
      if (typeof handler === "function") {
        handler(...args);
      }
    }
  };
}

/**
 * Debounce handler for high-frequency events
 */
export function debounceHandler(handler, delay = 100) {
  let timeoutId = null;
  let lastArgs = null;

  return function debounced(...args) {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handler(...lastArgs);
    }, delay);
  };
}

/**
 * Throttle handler for continuous events
 */
export function throttleHandler(handler, interval = 100) {
  let lastExecute = 0;
  let timeoutId = null;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastExecute = now - lastExecute;

    if (timeSinceLastExecute >= interval) {
      lastExecute = now;
      handler(...args);
      clearTimeout(timeoutId);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastExecute = Date.now();
        handler(...args);
      }, interval - timeSinceLastExecute);
    }
  };
}

/**
 * Once-only handler
 */
export function onceHandler(handler) {
  let called = false;
  return function once(...args) {
    if (!called) {
      called = true;
      return handler(...args);
    }
  };
}
