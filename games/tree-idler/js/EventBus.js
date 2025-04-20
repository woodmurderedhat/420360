// Simple event bus for decoupling components
class EventBus {
  constructor() {
    this.events = {};
  }
  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  }
  off(event, handler) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => {
      try { handler(data); } catch (e) { console.error(e); }
    });
  }
}

const eventBus = new EventBus();
export default eventBus;
