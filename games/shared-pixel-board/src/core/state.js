/**
 * Global state management for the pixel board application
 * Single source of truth for all application state
 */

import {
  TOOLS,
  PALETTE_COLORS,
  DEFAULT_COLOR,
  COOLDOWN_MS,
  SPECTATOR_MODE,
  MAX_HISTORY,
  STORAGE_KEYS,
  TOOL_OPTIONS_DEFAULTS,
  ZOOM_CONFIG
} from "../config/constants.js";

class PixelBoardState {
  constructor() {
    // UI State
    this.selectedColor = PALETTE_COLORS[0];
    this.activeTool = TOOLS.PIXEL;
    this.gridEnabled = false;
    this.helpVisible = false;
    this.touchPanMode = false;

    // Canvas rendering state
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;

    // Layer management
    this.layers = [
      {
        id: "layer_0",
        name: "Base Layer",
        pixels: new Map(), // { "x_y": "#RRGGBB" }
        visible: true,
        opacity: 1,
        blendMode: "normal",
        locked: false
      }
    ];
    this.activeLayerId = "layer_0";
    this.nextLayerId = 1;

    // Tool-specific state
    this.toolOptions = { ...TOOL_OPTIONS_DEFAULTS };
    this.brushSize = 2;

    // Gesture state
    this.lineStartPoint = null;
    this.brushStrokeActive = false;
    this.brushLastPoint = null;
    this.brushStrokeCells = new Set();
    this.transformBounds = null;
    this.mirrorMode = null; // null, 'x', 'y', or 'both'

    // Active pointers
    this.activePointers = new Map();
    this.pinchDistanceStart = 0;
    this.pinchZoomStart = 1;
    this.pinchMidpointLast = null;
    this.dragPanActive = false;

    // Connection state
    this.isConnected = false;
    this.writeInFlight = false;
    this.pendingWriteStartedAt = 0;
    this.lastAckMs = null;
    this.sessionId = this.generateSessionId();

    // History management
    this.history = [];
    this.redoHistory = [];

    // Stats
    this.stats = {
      placements: 0,
      blockedCooldown: 0,
      blockedNoop: 0,
      successfulWrites: 0
    };

    // UI feedback
    this.lastNotice = "";
    this.lastNoticeOk = false;

    // Event hooks for reactive updates
    this.listeners = new Map();

    this.loadSavedState();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Subscribe to state changes
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Emit state change event
   */
  emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      for (const callback of this.listeners.get(eventName)) {
        callback(data);
      }
    }
  }

  /**
   * Set selected color
   */
  setColor(color) {
    if (SPECTATOR_MODE) return;
    this.selectedColor = color.toUpperCase();
    this.emit("colorChanged", { color: this.selectedColor });
  }

  /**
   * Set active tool
   */
  setTool(tool) {
    if (!Object.values(TOOLS).includes(tool)) return;
    this.activeTool = tool;
    this.emit("toolChanged", { tool });
  }

  /**
   * Add or update layer
   */
  addLayer(name = "New Layer") {
    const id = `layer_${this.nextLayerId++}`;
    const layer = {
      id,
      name,
      pixels: new Map(),
      visible: true,
      opacity: 1,
      blendMode: "normal",
      locked: false
    };
    this.layers.push(layer);
    this.activeLayerId = id;
    this.emit("layerAdded", { layer });
    return id;
  }

  /**
   * Delete layer by ID
   */
  deleteLayer(id) {
    if (this.layers.length <= 1) {
      console.warn("Cannot delete the last layer");
      return false;
    }
    const index = this.layers.findIndex((l) => l.id === id);
    if (index === -1) return false;
    this.layers.splice(index, 1);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[0].id;
    }
    this.emit("layerDeleted", { id });
    return true;
  }

  /**
   * Get active layer
   */
  getActiveLayer() {
    return this.layers.find((l) => l.id === this.activeLayerId) || this.layers[0];
  }

  /**
   * Get pixel color at coordinates on active layer
   */
  getPixelAt(x, y, layerId = this.activeLayerId) {
    const layer = this.layers.find((l) => l.id === layerId);
    if (!layer) return DEFAULT_COLOR;
    return layer.pixels.get(`${x}_${y}`) || DEFAULT_COLOR;
  }

  /**
   * Set pixel on layer
   */
  setPixel(x, y, color, layerId = this.activeLayerId) {
    const layer = this.layers.find((l) => l.id === layerId);
    if (!layer) return;
    const key = `${x}_${y}`;
    layer.pixels.set(key, color.toUpperCase());
  }

  /**
   * Push action to history
   */
  pushHistory(action) {
    this.history.push(action);
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
    this.redoHistory.length = 0; // Clear redo on new action
    this.emit("historyChanged", { history: this.history, redoHistory: this.redoHistory });
  }

  /**
   * Check if can undo
   */
  canUndo() {
    return this.history.length > 0 && !SPECTATOR_MODE;
  }

  /**
   * Check if can redo
   */
  canRedo() {
    return this.redoHistory.length > 0 && !SPECTATOR_MODE;
  }

  /**
   * Load saved preferences from localStorage
   */
  loadSavedState() {
    const savedColor = localStorage.getItem(STORAGE_KEYS.selectedColor);
    if (savedColor && /^#[0-9A-F]{6}$/i.test(savedColor)) {
      this.selectedColor = savedColor.toUpperCase();
    }

    const savedTool = localStorage.getItem(STORAGE_KEYS.activeTool);
    if (savedTool && Object.values(TOOLS).includes(savedTool)) {
      this.activeTool = savedTool;
    }

    const savedBrushSize = Number(localStorage.getItem(STORAGE_KEYS.brushSize) || 2);
    if (Number.isFinite(savedBrushSize)) {
      this.brushSize = Math.max(1, Math.min(5, savedBrushSize));
    }

    const savedGridEnabled = localStorage.getItem(STORAGE_KEYS.gridEnabled);
    this.gridEnabled = savedGridEnabled === "1";
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    localStorage.setItem(STORAGE_KEYS.selectedColor, this.selectedColor);
    localStorage.setItem(STORAGE_KEYS.activeTool, this.activeTool);
    localStorage.setItem(STORAGE_KEYS.brushSize, String(this.brushSize));
    localStorage.setItem(STORAGE_KEYS.gridEnabled, this.gridEnabled ? "1" : "0");
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.layers.forEach((layer) => layer.pixels.clear());
    this.history = [];
    this.redoHistory = [];
    this.stats = { placements: 0, blockedCooldown: 0, blockedNoop: 0, successfulWrites: 0 };
    this.emit("stateReset", {});
  }
}

// Singleton instance
export const state = new PixelBoardState();
export default state;
