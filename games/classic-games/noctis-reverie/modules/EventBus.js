/**
 * EventBus.js
 * 
 * A simple pub/sub implementation for loose coupling between modules.
 * Allows components to communicate without direct dependencies.
 */

export class EventBus {
  constructor() {
    this.subscribers = {};
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Function to call when event is published
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    
    this.subscribers[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }
  
  /**
   * Publish an event with data
   * @param {string} event - Event name
   * @param {any} data - Data to pass to subscribers
   */
  publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }
    
    this.subscribers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
  
  /**
   * Remove all subscribers for an event
   * @param {string} event - Event name
   */
  clearEvent(event) {
    if (this.subscribers[event]) {
      delete this.subscribers[event];
    }
  }
  
  /**
   * Remove all subscribers
   */
  clearAll() {
    this.subscribers = {};
  }
}
