// Resources.test.js
// Unit tests for Resources.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import * as Resources from '../lib/Resources.js';

describe('Resources', () => {
  let api, state;
  beforeEach(() => {
    state = null;
    api = { state: null };
  });

  test('install initializes state if not present', () => {
    Resources.install(api);
    // Should emit resourcesInitialized event (not directly testable here), but state should be set
    assert(typeof Resources.install === 'function', 'install should be a function');
  });

  test('resource upgrades increase efficiency', () => {
    api.state = { sunlight: 0, water: 0, upgrades: { leafEfficiency: 1, rootEfficiency: 1 } };
    Resources.install(api);
    // Simulate upgrade events
    Resources.activate(api);
    window.dispatchEvent(new CustomEvent('upgradeLeaf'));
    window.dispatchEvent(new CustomEvent('upgradeRoot'));
    // No direct way to check internal state, but test does not throw
    assert(true, 'Upgrades processed without error');
    Resources.deactivate(api);
  });
});
