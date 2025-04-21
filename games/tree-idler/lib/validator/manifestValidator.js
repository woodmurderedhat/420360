// manifestValidator.js
// Custom validator for the game manifest schema (no external dependencies)

/**
 * Validates the manifest object against the expected schema.
 * @param {object} manifest - The manifest to validate.
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateManifest(manifest) {
    const errors = [];
    // 1. Check manifest is an object
    if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) {
        errors.push('Manifest must be an object.');
        return { valid: false, errors };
    }
    // 2. Required top-level properties
    const requiredProps = ['modules', 'initialState', 'schemaVersion'];
    for (const prop of requiredProps) {
        if (!(prop in manifest)) {
            errors.push(`Missing required property: ${prop}`);
        }
    }
    // 3. Type checks
    if ('modules' in manifest && !Array.isArray(manifest.modules)) {
        errors.push('modules must be an array.');
    }
    if ('initialState' in manifest && typeof manifest.initialState !== 'object') {
        errors.push('initialState must be an object.');
    }
    if ('schemaVersion' in manifest && typeof manifest.schemaVersion !== 'string') {
        errors.push('schemaVersion must be a string.');
    }
    // 4. Validate modules array items
    if (Array.isArray(manifest.modules)) {
        manifest.modules.forEach((mod, i) => {
            if (typeof mod !== 'object' || mod === null) {
                errors.push(`modules[${i}] must be an object.`);
            } else {
                if (!('name' in mod)) errors.push(`modules[${i}] missing 'name'.`);
                if (!('path' in mod)) errors.push(`modules[${i}] missing 'path'.`);
                if ('name' in mod && typeof mod.name !== 'string') errors.push(`modules[${i}].name must be a string.`);
                if ('path' in mod && typeof mod.path !== 'string') errors.push(`modules[${i}].path must be a string.`);
            }
        });
    }
    // 5. (Extend with more schema rules as needed)
    return { valid: errors.length === 0, errors };
}
