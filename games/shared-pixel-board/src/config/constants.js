/**
 * Global configuration and constants for the Shared Pixel Board
 */

// Board dimensions
export const BOARD_SIZE = 256;
export const PIXEL_SIZE = 8;

// Default colors
export const DEFAULT_COLOR = "#111827";
export const COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

// Tool definitions
export const TOOLS = {
  PIXEL: "pixel",
  BRUSH: "brush",
  ERASER: "eraser",
  SPRAY: "spray",
  PICKER: "picker",
  LINE: "line",
  FILL: "fill",
  TEXT: "text",
  STAMP: "stamp",
  TRANSFORM: "transform"
};

// Palette colors
export const PALETTE_COLORS = [
  "#FF4D4D",
  "#4DFF88",
  "#4DB8FF",
  "#FFE14D",
  "#C24DFF",
  "#FF8C4D",
  "#00D4AA",
  "#F5F5F5",
  "#111827"
];

// Cooldown (set to 0 as requested)
export const COOLDOWN_MS = 0;

// Fill cap
export const FILL_PIXEL_CAP = 480;

// Pan step
export const PAN_STEP_PX = 100;

// Max history entries
export const MAX_HISTORY = 40;

// Local storage keys
export const STORAGE_KEYS = {
  lastPlacementAt: "sharedPixelLastPlacementAt",
  selectedColor: "sharedPixelSelectedColor",
  activeTool: "sharedPixelActiveTool",
  brushSize: "sharedPixelBrushSize",
  gridEnabled: "sharedPixelGridEnabled",
  layerVisibility: "sharedPixelLayerVisibility",
  sessionId: "sharedPixelSessionId",
  canvasDraft: "sharedPixelCanvasDraft"
};

// Spectator mode flag
export const SPECTATOR_MODE = new URLSearchParams(window.location.search).get("mode") === "spectator";

// Firebase config
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhOspsUxX9f_ylCQrNDPfS40yeNykgvj8",
  authDomain: "project-6657144175400685165.firebaseapp.com",
  databaseURL: "https://project-6657144175400685165-default-rtdb.firebaseio.com",
  projectId: "project-6657144175400685165",
  storageBucket: "project-6657144175400685165.firebasestorage.app",
  messagingSenderId: "604138773261",
  appId: "1:604138773261:web:162f7ab4984c7a27d5ae44",
  measurementId: "G-P3RN62EDSJ"
};

// Brush sizes (in pixels, interpreted as radius for odd numbers)
export const BRUSH_SIZES = [1, 2, 3, 4, 5];

// Zoom config
export const ZOOM_CONFIG = {
  MIN: 0.5,
  MAX: 4,
  STEP_MULTIPLIER: 1.12,
  ZOOM_OUT_MULTIPLIER: 0.89
};

// Blend modes for layers
export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "color-dodge",
  "color-burn"
];

// Stamp patterns (offset cells relative to click point)
export const STAMP_PATTERNS = {
  square: {
    cells: [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y:  0 }, { x: 0, y:  0 }, { x: 1, y:  0 },
      { x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 }
    ]
  },
  circle: {
    cells: [
                        { x: 0, y: -2 },
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -2, y:  0 }, { x: -1, y:  0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 },
                        { x: 0, y:  2 }
    ]
  },
  cross: {
    cells: [
                        { x: 0, y: -2 },
                        { x: 0, y: -1 },
      { x: -2, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
                        { x: 0, y:  1 },
                        { x: 0, y:  2 }
    ]
  },
  star: {
    cells: [
      { x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 },
      { x: -2, y: -1 }, { x: 0, y: -1 }, { x: 2, y: -1 },
      { x: -2, y:  0 }, { x: -1, y:  0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: -2, y:  1 }, { x: 0, y:  1 }, { x: 2, y:  1 },
      { x: -1, y:  2 }, { x: 0, y:  2 }, { x: 1, y:  2 }
    ]
  }
};

// Default tool options
export const TOOL_OPTIONS_DEFAULTS = {
  spray: { radius: 5, density: 3, particleCount: 10 },
  stamp: { selectedPattern: "square" },
  brush: { continuous: true },
  eraser: {},
  pixel: {},
  line: {},
  fill: {},
  text: {},
  picker: {},
  transform: {}
};


