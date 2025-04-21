// DataLoader.test.js
// Unit tests for DataLoader.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import { loadManifest } from '../lib/DataLoader.js';

describe('DataLoader', () => {
  test('loadManifest validates a valid manifest', async () => {
    const validManifest = {
      modules: [
        { name: 'Resources', path: './lib/Resources.js' },
        { name: 'Tree', path: './lib/Tree.js' }
      ],
      initialState: { sunlight: 0, water: 0 },
      schemaVersion: '1.0.0'
    };
    
    let result;
    let error = null;
    
    try {
      result = await loadManifest(validManifest);
    } catch (e) {
      error = e;
    }
    
    assert(error === null, 'Should not throw an error for valid manifest');
    assert(result === validManifest, 'Should return the original manifest if valid');
  });
  
  test('loadManifest rejects an invalid manifest', async () => {
    const invalidManifest = {
      // Missing required properties
      modules: 'not an array'
    };
    
    let error = null;
    
    try {
      await loadManifest(invalidManifest);
    } catch (e) {
      error = e;
    }
    
    assert(error !== null, 'Should throw an error for invalid manifest');
    assert(error.message.includes('validation'), 'Error should mention validation');
  });
  
  test('loadManifest validates module entries', async () => {
    const invalidModulesManifest = {
      modules: [
        { name: 'Valid', path: './valid.js' },
        { /* Missing name and path */ }
      ],
      initialState: {},
      schemaVersion: '1.0.0'
    };
    
    let error = null;
    
    try {
      await loadManifest(invalidModulesManifest);
    } catch (e) {
      error = e;
    }
    
    assert(error !== null, 'Should throw an error for invalid module entries');
  });
});
