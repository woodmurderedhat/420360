// DataLoader.js
// Responsible for parsing and validating the manifest using a local validator.

import { validateManifest } from './Validator.js';

// JSON Schema for the manifest (kept for reference, not used by AJV)
const manifestSchema = {
  type: 'object',
  properties: {
    modules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          path: { type: 'string' }
        },
        required: ['name', 'path']
      }
    },
    initialState: { type: 'object' },
    schemaVersion: { type: 'string' }
  },
  required: ['modules', 'initialState', 'schemaVersion']
};

// Parse and validate manifest
export async function loadManifest(manifest) {
  const result = validateManifest(manifest);
  if (!result.valid) {
    console.error('Manifest validation errors:', result.errors);
    throw new Error('Manifest failed schema validation. See console for details.');
  }
  return manifest;
}
