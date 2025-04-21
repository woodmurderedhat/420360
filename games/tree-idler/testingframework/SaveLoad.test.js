// SaveLoad.test.js
// Unit tests for SaveLoad.js using the vanilla test framework
import { test, assert, describe, beforeEach } from './test-framework.js';
import * as SaveLoad from '../lib/SaveLoad.js';

describe('SaveLoad', () => {
  let api, state;
  beforeEach(() => {
    state = { resources: { sunlight: 42, water: 7 } };
    api = { state };
    // Clear localStorage before each test
    localStorage.removeItem('save');
  });

  test('save stores state in localStorage', () => {
    SaveLoad.install(api);
    SaveLoad.save(api);
    const saved = JSON.parse(localStorage.getItem('save'));
    assert(saved.resources.sunlight === 42, 'Sunlight should be saved');
    assert(saved.resources.water === 7, 'Water should be saved');
  });

  test('load restores state from localStorage', () => {
    SaveLoad.install(api);
    localStorage.setItem('save', JSON.stringify({ resources: { sunlight: 99, water: 1 } }));
    SaveLoad.load(api);
    assert(api.state.resources.sunlight === 99, 'Sunlight should be loaded');
    assert(api.state.resources.water === 1, 'Water should be loaded');
  });

  test('load handles missing save gracefully', () => {
    SaveLoad.install(api);
    localStorage.removeItem('save');
    let error = false;
    try {
      SaveLoad.load(api);
    } catch (e) {
      error = true;
    }
    assert(!error, 'Missing save should not throw');
  });

  test('save and load handle corrupted data', () => {
    SaveLoad.install(api);
    localStorage.setItem('save', 'not-json');
    let error = false;
    try {
      SaveLoad.load(api);
    } catch (e) {
      error = true;
    }
    assert(!error, 'Corrupted save should not throw');
  });
});
