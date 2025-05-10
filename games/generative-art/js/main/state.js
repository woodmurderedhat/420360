/**
 * state.js - Application state and DOM elements for the Generative Art Studio
 * Contains shared state used by main functions
 */

import { artStyles } from '../styles/index.js';

// DOM Elements
export const canvas = document.getElementById('artCanvas');
export const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance

// Main UI elements
export const regenerateButton = document.getElementById('regenerateButton');
export const exportButton = document.getElementById('exportButton');
export const galleryButton = document.getElementById('galleryButton');
export const styleSelector = document.getElementById('styleSelector');
export const currentStyleDisplaySpan = document.querySelector('#currentStyleDisplay span');

// Control panel elements
export const numShapesInput = document.getElementById('numShapes');
export const lineWidthInput = document.getElementById('lineWidth');
export const canvasWidthInput = document.getElementById('canvasWidth');
export const canvasHeightInput = document.getElementById('canvasHeight');
export const seedInput = document.getElementById('seedInput');
export const applySettingsBtn = document.getElementById('applySettings');
export const randomSeedButton = document.getElementById('randomSeedButton');
export const togglePanelButton = document.getElementById('togglePanelButton');
export const controlsPanel = document.getElementById('controlsPanel');
export const currentSeedDisplay = document.querySelector('#currentSeedDisplay span');
export const saveToGalleryButton = document.getElementById('saveToGalleryButton');

// New UI elements
export const colorThemeSelector = document.getElementById('colorThemeSelector');
export const customColorControls = document.getElementById('customColorControls');
export const baseHueInput = document.getElementById('baseHue');
export const saturationInput = document.getElementById('saturation');
export const lightnessInput = document.getElementById('lightness');
export const backgroundColorPicker = document.getElementById('backgroundColorPicker');
export const animationToggle = document.getElementById('animationToggle');
export const animationSpeedInput = document.getElementById('animationSpeed');
export const interactiveToggle = document.getElementById('interactiveToggle');

// Gallery modal elements
export const galleryModal = document.getElementById('galleryModal');
export const galleryContainer = document.getElementById('galleryContainer');
export const closeButton = document.querySelector('.close-button');

// Display elements for slider values
export const numShapesDisplay = document.getElementById('numShapesValue');
export const lineWidthDisplay = document.getElementById('lineWidthValue');
export const baseHueDisplay = document.getElementById('baseHueValue');
export const saturationDisplay = document.getElementById('saturationValue');
export const lightnessDisplay = document.getElementById('lightnessValue');
export const animationSpeedDisplay = document.getElementById('animationSpeedValue');

// Application state
let currentArtStyle = artStyles.GEOMETRIC_GRID;
let numShapes = +numShapesInput.value;
let lineWidth = +lineWidthInput.value;
let backgroundColor = backgroundColorPicker ? backgroundColorPicker.value : '#ffffff';
let colorTheme = colorThemeSelector ? colorThemeSelector.value : 'random';
let baseHue = baseHueInput ? +baseHueInput.value : 180;
let saturation = saturationInput ? +saturationInput.value : 70;
let lightness = lightnessInput ? +lightnessInput.value : 50;

// Export mutable state variables
export {
    currentArtStyle,
    numShapes,
    lineWidth,
    backgroundColor,
    colorTheme,
    baseHue,
    saturation,
    lightness
};

// Local storage key for settings
export const settingsKey = 'generativeArtSettings';
