// EventBus.js
// Provides pub/sub using CustomEvent.

/**
 * Emit a custom event with detail data.
 * @param {string} event - Event name
 * @param {any} detail - Event payload
 */
export function emit(event, detail) {
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

/**
 * Subscribe to an event.
 * @param {string} event - Event name
 * @param {(e: CustomEvent) => void} handler - Event handler
 */
export function on(event, handler) {
  window.addEventListener(event, handler);
}

/**
 * Unsubscribe from an event.
 * @param {string} event - Event name
 * @param {(e: CustomEvent) => void} handler - Event handler
 */
export function off(event, handler) {
  window.removeEventListener(event, handler);
}

/**
 * Subscribe to an event once.
 * @param {string} event - Event name
 * @param {(e: CustomEvent) => void} handler - Event handler
 */
export function once(event, handler) {
  function wrapper(e) {
    handler(e);
    off(event, wrapper);
  }
  on(event, wrapper);
}
