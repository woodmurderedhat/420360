// manifestValidator.test.js
// Unit tests for manifestValidator.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import { validateManifest } from '../lib/Validator.js';

describe('Manifest Validator', () => {
  test('validates a valid manifest', () => {
    const validManifest = {
      modules: [
        { name: 'Resources', path: './lib/Resources.js' },
        { name: 'Tree', path: './lib/Tree.js' }
      ],
      initialState: { sunlight: 0, water: 0 },
      schemaVersion: '1.0.0'
    };
    
    const result = validateManifest(validManifest);
    assert(result.valid, 'Valid manifest should pass validation');
    assertEqual(result.errors.length, 0, 'Valid manifest should have no errors');
  });
  
  test('rejects non-object manifest', () => {
    const result = validateManifest('not an object');
    assert(!result.valid, 'Non-object manifest should fail validation');
    assert(result.errors.length > 0, 'Non-object manifest should have errors');
  });
  
  test('requires all mandatory properties', () => {
    const invalidManifest = {
      modules: [{ name: 'Test', path: './test.js' }],
      // Missing initialState and schemaVersion
    };
    
    const result = validateManifest(invalidManifest);
    assert(!result.valid, 'Manifest missing required properties should fail validation');
    assert(result.errors.includes('Missing required property: initialState'), 'Should report missing initialState');
    assert(result.errors.includes('Missing required property: schemaVersion'), 'Should report missing schemaVersion');
  });
  
  test('validates modules array items', () => {
    const invalidManifest = {
      modules: [
        { name: 'Valid', path: './valid.js' },
        { /* Missing name and path */ },
        'not an object'
      ],
      initialState: {},
      schemaVersion: '1.0.0'
    };
    
    const result = validateManifest(invalidManifest);
    assert(!result.valid, 'Manifest with invalid modules should fail validation');
    assert(result.errors.includes('modules[1] missing \'name\'.'), 'Should report missing name in module');
    assert(result.errors.includes('modules[1] missing \'path\'.'), 'Should report missing path in module');
    assert(result.errors.includes('modules[2] must be an object.'), 'Should report non-object module');
  });
  
  test('validates property types', () => {
    const invalidManifest = {
      modules: 'not an array',
      initialState: 'not an object',
      schemaVersion: 123 // Not a string
    };
    
    const result = validateManifest(invalidManifest);
    assert(!result.valid, 'Manifest with invalid property types should fail validation');
    assert(result.errors.includes('modules must be an array.'), 'Should report modules not being an array');
    assert(result.errors.includes('initialState must be an object.'), 'Should report initialState not being an object');
    assert(result.errors.includes('schemaVersion must be a string.'), 'Should report schemaVersion not being a string');
  });
});
