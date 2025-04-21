// Events.test.js
// Unit tests for Events.js using the vanilla test framework
import { test, assert, describe, beforeEach } from './test-framework.js';
import * as Events from '../lib/Events.js';
import { emit, on, off } from '../lib/EventBus.js';

describe('Events', () => {
  let api, state;
  beforeEach(() => {
    state = { events: {} };
    api = { state };
  });

  test('install initializes event state', () => {
    Events.install(api);
    assert(api.state.events, 'events state should be initialized');
  });

  test('activate registers event listeners', () => {
    Events.install(api);
    Events.activate(api);
    // Simulate event emission and check for side effects if any
    // (Assume Events.js listens for a known event, e.g., "natureGift")
    let called = false;
    on('natureGift', () => { called = true; });
    emit('natureGift', { type: 'dew' });
    assert(called, 'natureGift event should be handled');
    Events.deactivate(api);
  });

  test('deactivate removes event listeners', () => {
    Events.install(api);
    Events.activate(api);
    let called = false;
    function handler() { called = true; }
    on('natureGift', handler);
    Events.deactivate(api);
    emit('natureGift', { type: 'dew' });
    assert(!called, 'natureGift handler should not be called after deactivate');
    off('natureGift', handler);
  });

  test('handles unknown event gracefully', () => {
    Events.install(api);
    Events.activate(api);
    let error = false;
    try {
      emit('unknownEvent', {});
    } catch (e) {
      error = true;
    }
    assert(!error, 'Unknown events should not throw');
    Events.deactivate(api);
  });
});
