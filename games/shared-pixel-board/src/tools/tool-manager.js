/**
 * Tool manager - coordinates tool creation, selection, and execution
 */

import state from "../core/state.js";
import { TOOLS, PALETTE_COLORS } from "../config/constants.js";

// Tool imports will be added as tools are created
// For now, placeholder implementations

class ToolManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.tools = new Map();
    this.activeTool = null;

    // Tools will be registered as they're created
    this.registerToolPlaceholders();
  }

  /**
   * Register placeholder tools
   * These will be replaced with actual tool implementations
   */
  registerToolPlaceholders() {
    // Placeholder: tools will be imported and registered from their modules
    // For now, create minimal tool objects
    for (const toolName of Object.values(TOOLS)) {
      this.tools.set(toolName, {
        name: toolName,
        onPointerDown: async (x, y, event) => { },
        onPointerMove: (x, y, event) => { },
        onPointerUp: async (x, y, event) => { },
        cancel: () => { },
        render: () => { }
      });
    }
    this.activeTool = this.tools.get(TOOLS.PIXEL);
  }

  /**
   * Register a tool
   */
  registerTool(toolName, toolImplementation) {
    this.tools.set(toolName, toolImplementation);
  }

  /**
   * Set active tool
   */
  setActiveTool(toolName) {
    if (!Object.values(TOOLS).includes(toolName)) {
      console.warn(`Unknown tool: ${toolName}`);
      return;
    }

    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`Tool not registered: ${toolName}`);
      return;
    }

    this.activeTool = tool;
    state.setTool(toolName);
  }

  /**
   * Get active tool
   */
  getActiveTool() {
    return this.activeTool;
  }

  /**
   * Handle tool pointer down
   */
  async handleToolPointerDown(x, y, event) {
    if (!this.activeTool) return;
    if (this.activeTool.onPointerDown) {
      await this.activeTool.onPointerDown(x, y, event);
    }
  }

  /**
   * Handle tool pointer move
   */
  handleToolPointerMove(x, y, event) {
    if (!this.activeTool) return;
    if (this.activeTool.onPointerMove) {
      this.activeTool.onPointerMove(x, y, event);
    }

    // Update hover status
    const layer = state.getActiveLayer();
    const color = state.getPixelAt(x, y);
    state.emit("hoverChanged", { x, y, color });
  }

  /**
   * Handle tool pointer up
   */
  async handleToolPointerUp(x, y, event) {
    if (!this.activeTool) return;
    if (this.activeTool.onPointerUp) {
      await this.activeTool.onPointerUp(x, y, event);
    }
  }

  /**
   * Cancel active tool
   */
  cancelActiveTool() {
    if (this.activeTool && this.activeTool.cancel) {
      this.activeTool.cancel();
    }
    this.renderer.clearOverlay();
  }

  /**
   * Handle tool shortcut key
   */
  handleToolShortcut(keyLower) {
    const toolMap = {
      p: TOOLS.PIXEL,
      b: TOOLS.BRUSH,
      e: TOOLS.ERASER,
      s: TOOLS.SPRAY,
      i: TOOLS.PICKER,
      l: TOOLS.LINE,
      f: TOOLS.FILL,
      t: TOOLS.TEXT
    };

    const tool = toolMap[keyLower];
    if (tool && !state.SPECTATOR_MODE) {
      this.setActiveTool(tool);
    }
  }

  /**
   * Select color from palette
   */
  selectPaletteColor(index) {
    if (state.SPECTATOR_MODE) return;
    const color = PALETTE_COLORS[index];
    if (color) {
      state.setColor(color);
    }
  }

  /**
   * Perform undo
   */
  async performUndo() {
    if (!state.canUndo()) return;

    const action = state.history.pop();
    if (!action) return;

    // Restore layer state from action
    if (action.layerId && action.previousPixels) {
      const layer = state.layers.find((l) => l.id === action.layerId);
      if (layer) {
        // Restore previous state
        layer.pixels.clear();
        for (const [key, color] of action.previousPixels) {
          layer.pixels.set(key, color);
        }
      }
    }

    state.redoHistory.push(action);
    this.renderer.render();
    state.emit("historyChanged", { history: state.history, redoHistory: state.redoHistory });
  }

  /**
   * Perform redo
   */
  async performRedo() {
    if (!state.canRedo()) return;

    const action = state.redoHistory.pop();
    if (!action) return;

    // Apply action to current layer
    if (action.layerId && action.pixels) {
      const layer = state.layers.find((l) => l.id === action.layerId);
      if (layer) {
        // Apply pixels
        for (const [key, color] of action.pixels) {
          layer.pixels.set(key, color);
        }
      }
    }

    state.history.push(action);
    this.renderer.render();
    state.emit("historyChanged", { history: state.history, redoHistory: state.redoHistory });
  }

  /**
   * Commit pixels to layer history
   */
  commitPixels(cells, color, layerId = state.activeLayerId) {
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const previousPixels = new Map();
    const affectedCells = [];

    for (const cell of cells) {
      const key = `${cell.x}_${cell.y}`;
      previousPixels.set(key, layer.pixels.get(key) || "#111827");
      layer.pixels.set(key, color);
      affectedCells.push([key, color]);
    }

    // Create history entry
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date(),
      layerId,
      tool: state.activeTool,
      color,
      pixels: new Map(affectedCells),
      previousPixels
    };

    state.pushHistory(historyEntry);
    this.renderer.render();
    state.stats.placements++;
  }
}

export default ToolManager;
