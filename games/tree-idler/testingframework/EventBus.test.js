// EventBus.test.js
// Unit tests for EventBus.js using the vanilla test framework
import { test, assert, assertEqual, assertThrows, describe, beforeEach } from './test-framework.js';
import * as EventBus from '../lib/EventBus.js';

describe('EventBus', () => {
  let called, detail;
  beforeEach(() => {
    called = false;
    detail = null;
  });

  test('emit/on should call handler with correct detail', () => {
    EventBus.on('testEvent', e => {
      called = true;
      detail = e.detail;
    });
    EventBus.emit('testEvent', { foo: 42 });
    assert(called, 'Handler should be called');
    assertEqual(detail.foo, 42, 'Detail should match');
    EventBus.off('testEvent', () => {}); // Clean up
  });

  test('off should remove handler', () => {
    const handler = () => { called = true; };
    EventBus.on('testEvent2', handler);
    EventBus.off('testEvent2', handler);
    EventBus.emit('testEvent2', {});
    assert(!called, 'Handler should not be called after off');
  });

  test('once should only call handler once', () => {
    let count = 0;
    EventBus.once('testEvent3', () => { count++; });
    EventBus.emit('testEvent3', {});
    EventBus.emit('testEvent3', {});
    assertEqual(count, 1, 'Handler should be called only once');
  });
});
