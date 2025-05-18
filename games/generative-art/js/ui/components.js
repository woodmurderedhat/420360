/**
 * components.js - UI component management for the Generative Art Studio
 * Handles DOM element references and basic component functionality
 */

// Private module state
const _elements = {
    // Main canvas
    canvas: document.getElementById('artCanvas'),

    // Control buttons
    regenerateButton: document.getElementById('regenerateButton'),
    exportButton: document.getElementById('exportButton'),
    galleryButton: document.getElementById('galleryButton'),
    saveToGalleryButton: document.getElementById('saveToGalleryButton'),

    // Control panel elements
    numShapesInput: document.getElementById('numShapes'),
    lineWidthInput: document.getElementById('lineWidth'),
    canvasWidthInput: document.getElementById('canvasWidth'),
    canvasHeightInput: document.getElementById('canvasHeight'),
    seedInput: document.getElementById('seedInput'),
    applySettingsBtn: document.getElementById('applySettings'),
    randomSeedButton: document.getElementById('randomSeedButton'),
    togglePanelButton: document.getElementById('togglePanelButton'),
    controlsPanel: document.getElementById('controlsPanel'),
    currentSeedDisplay: document.querySelector('#currentSeedDisplay span'),

    // Color controls
    colorThemeSelector: document.getElementById('colorThemeSelector'),
    baseHueInput: document.getElementById('baseHue'),
    saturationInput: document.getElementById('saturation'),
    lightnessInput: document.getElementById('lightness'),
    backgroundColorPicker: document.getElementById('backgroundColor'),
    customColorControls: document.getElementById('customColorControls'),

    // Animation controls
    animationToggle: document.getElementById('animationToggle'),
    animationSpeedInput: document.getElementById('animationSpeed'),
    interactiveToggle: document.getElementById('interactiveToggle'),
    adaptiveQualityToggle: document.getElementById('adaptiveQualityToggle'),
    fpsDisplay: document.getElementById('fpsDisplay'),

    // Layer opacity controls
    voronoiOpacityInput: document.getElementById('voronoiOpacity'),
    organicSplattersOpacityInput: document.getElementById('organicSplattersOpacity'),
    neonWavesOpacityInput: document.getElementById('neonWavesOpacity'),
    fractalLinesOpacityInput: document.getElementById('fractalLinesOpacity'),
    geometricGridOpacityInput: document.getElementById('geometricGridOpacity'),
    particleSwarmOpacityInput: document.getElementById('particleSwarmOpacity'),
    organicNoiseOpacityInput: document.getElementById('organicNoiseOpacity'),
    glitchMosaicOpacityInput: document.getElementById('glitchMosaicOpacity'),
    pixelSortOpacityInput: document.getElementById('pixelSortOpacity'),

    // New layer opacity controls
    gradientOverlayOpacityInput: document.getElementById('gradientOverlayOpacity'),
    dotMatrixOpacityInput: document.getElementById('dotMatrixOpacity'),
    textureOverlayOpacityInput: document.getElementById('textureOverlayOpacity'),
    symmetricalPatternsOpacityInput: document.getElementById('symmetricalPatternsOpacity'),
    flowingLinesOpacityInput: document.getElementById('flowingLinesOpacity'),
    lightRaysOpacityInput: document.getElementById('lightRaysOpacity'),

    // Layer density controls
    voronoiDensityInput: document.getElementById('voronoiDensity'),
    organicSplattersDensityInput: document.getElementById('organicSplattersDensity'),
    neonWavesDensityInput: document.getElementById('neonWavesDensity'),
    fractalLinesDensityInput: document.getElementById('fractalLinesDensity'),

    // New layer density controls
    dotMatrixDensityInput: document.getElementById('dotMatrixDensity'),
    flowingLinesDensityInput: document.getElementById('flowingLinesDensity'),
    symmetricalPatternsDensityInput: document.getElementById('symmetricalPatternsDensity'),
    lightRaysDensityInput: document.getElementById('lightRaysDensity'),

    // Advanced controls
    blendModeSelector: document.getElementById('blendModeSelector'),
    colorShiftAmountInput: document.getElementById('colorShiftAmount'),
    scaleAmountInput: document.getElementById('scaleAmount'),
    rotationAmountInput: document.getElementById('rotationAmount'),

    // Light Rays advanced controls
    lightRaysIntensityInput: document.getElementById('lightRaysIntensity'),
    lightRaysDirectionInput: document.getElementById('lightRaysDirection'),
    lightRaysSpreadInput: document.getElementById('lightRaysSpread'),
    lightDirectionPreview: document.getElementById('lightDirectionPreview'),

    // Display elements
    numShapesDisplay: document.getElementById('numShapesValue'),
    lineWidthDisplay: document.getElementById('lineWidthValue'),
    baseHueDisplay: document.getElementById('baseHueValue'),
    saturationDisplay: document.getElementById('saturationValue'),
    lightnessDisplay: document.getElementById('lightnessValue'),
    animationSpeedDisplay: document.getElementById('animationSpeedValue'),

    // Gallery modal elements
    galleryModal: document.getElementById('galleryModal'),
    galleryContainer: document.getElementById('galleryContainer'),
    closeButton: document.querySelector('.close-button'),

    // History controls
    undoButton: document.getElementById('undoButton'),
    redoButton: document.getElementById('redoButton'),
};

// Initialize canvas context if canvas exists
if (_elements.canvas) {
    _elements.ctx = _elements.canvas.getContext('2d');
}

/**
 * Get a UI element by its key
 * @param {string} key - The element key
 * @returns {HTMLElement|null} The DOM element or null if not found
 */
function getElement(key) {
    return _elements[key] || null;
}

/**
 * Get multiple UI elements by their keys
 * @param {Array<string>} keys - Array of element keys
 * @returns {Object} Object with requested elements
 */
function getElements(keys) {
    const result = {};
    keys.forEach(key => {
        result[key] = _elements[key] || null;
    });
    return result;
}

/**
 * Check if all required elements exist
 * @param {Array<string>} requiredKeys - Array of required element keys
 * @returns {boolean} True if all required elements exist
 */
function hasRequiredElements(requiredKeys) {
    return requiredKeys.every(key => !!_elements[key]);
}

/**
 * Add an event listener to an element
 * @param {string} elementKey - The element key
 * @param {string} eventType - The event type
 * @param {Function} handler - The event handler
 * @returns {boolean} True if the listener was added successfully
 */
function addListener(elementKey, eventType, handler) {
    const element = _elements[elementKey];
    if (!element) return false;

    element.addEventListener(eventType, handler);
    return true;
}

/**
 * Set the value of an input element
 * @param {string} elementKey - The element key
 * @param {string|number} value - The value to set
 * @returns {boolean} True if the value was set successfully
 */
function setValue(elementKey, value) {
    const element = _elements[elementKey];
    if (!element) return false;

    if (element.type === 'checkbox') {
        element.checked = !!value;
    } else {
        element.value = value;
    }
    return true;
}

/**
 * Get the value of an input element
 * @param {string} elementKey - The element key
 * @returns {string|number|boolean|null} The element value or null if not found
 */
function getValue(elementKey) {
    const element = _elements[elementKey];
    if (!element) return null;

    if (element.type === 'checkbox') {
        return element.checked;
    } else if (element.type === 'number') {
        return parseFloat(element.value);
    } else {
        return element.value;
    }
}

/**
 * Get values of multiple input elements
 * @param {Array<string>} elementKeys - Array of element keys
 * @returns {Object} Object with element values
 */
function getValues(elementKeys) {
    const result = {};
    elementKeys.forEach(key => {
        result[key] = getValue(key);
    });
    return result;
}

/**
 * Get all layer opacity values
 * @returns {Object} Object with all layer opacity values
 */
function getLayerOpacityValues() {
    const opacityKeys = [
        'voronoiOpacity', 'organicSplattersOpacity', 'neonWavesOpacity',
        'fractalLinesOpacity', 'geometricGridOpacity', 'particleSwarmOpacity',
        'organicNoiseOpacity', 'glitchMosaicOpacity', 'pixelSortOpacity',
        'gradientOverlayOpacity', 'dotMatrixOpacity', 'textureOverlayOpacity',
        'symmetricalPatternsOpacity', 'flowingLinesOpacity', 'lightRaysOpacity'
    ];

    return getValues(opacityKeys);
}

/**
 * Get all layer density values
 * @returns {Object} Object with all layer density values
 */
function getLayerDensityValues() {
    const densityKeys = [
        'voronoiDensity', 'organicSplattersDensity', 'neonWavesDensity',
        'fractalLinesDensity', 'dotMatrixDensity', 'flowingLinesDensity',
        'symmetricalPatternsDensity', 'lightRaysDensity'
    ];

    return getValues(densityKeys);
}

/**
 * Update slider value display
 * @param {HTMLElement} slider - The slider element
 * @param {HTMLElement} valueDisplay - The value display element
 */
function updateSliderValue(slider, valueDisplay) {
    if (slider && valueDisplay) {
        valueDisplay.textContent = slider.value;
    }
}

// Public API
export {
    getElement,
    getElements,
    hasRequiredElements,
    addListener,
    setValue,
    getValue,
    getValues,
    getLayerOpacityValues,
    getLayerDensityValues,
    updateSliderValue
};
