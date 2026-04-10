/**
 * Main application entry point
 * Initializes all modules and wires up events
 */

import state from "./core/state.js";
import CanvasRenderer from "./core/canvas.js";
import EventManager from "./ui/events.js";
import ToolManager from "./tools/tool-manager.js";
import { createPixelTool } from "./tools/pixel-tool.js";
import { createBrushTool } from "./tools/brush-tool.js";
import { createLineTool } from "./tools/line-tool.js";
import { createFillTool } from "./tools/fill-tool.js";
import { createEraserTool } from "./tools/eraser-tool.js";
import { createPickerTool } from "./tools/picker-tool.js";
import { createSprayTool } from "./tools/spray-tool.js";
import { createTextTool } from "./tools/text-tool.js";
import { createStampTool } from "./tools/stamp-tool.js";
import { createTransformTool } from "./tools/transform-tool.js";
import { TOOLS, FIREBASE_CONFIG, SPECTATOR_MODE } from "./config/constants.js";

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onChildAdded,
  onChildChanged,
  onValue,
  serverTimestamp,
  onDisconnect,
  remove
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// ============================================================================
// GLOBAL STATE
// ============================================================================

// Firebase database reference (set after initialization)
let firebaseDb = null;

// ============================================================================
// FIREBASE UTILITY FUNCTIONS
// ============================================================================

/**
 * Write pixels to Firebase without cooldown
 * Called by tools after committing pixels to local state
 */
async function writePixelsToFirebase(cells, color) {
  if (!firebaseDb) return;

  try {
    const updates = {};
    for (const cell of cells) {
      const key = `pixels/${cell.x}_${cell.y}`;
      updates[key] = color;
    }
    await update(ref(firebaseDb), updates);
  } catch (error) {
    console.error("Firebase write error:", error);
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

async function initializeApplication() {
  try {
    console.log("🎨 Initializing Shared Pixel Board...");

    // Get DOM elements
    const canvas = document.getElementById("pixelCanvas");
    const overlayCanvas = document.getElementById("overlayCanvas");
    const canvasWrap = document.getElementById("canvasWrap");
    const toggleHelpBtn = document.getElementById("toggleHelp");
    const closeHelpBtn = document.getElementById("closeHelp");
    const helpPanel = document.getElementById("helpPanel");

    if (!canvas || !overlayCanvas || !canvasWrap) {
      console.error("❌ Canvas elements not found");
      return;
    }

    // Initialize canvas renderer
    const renderer = new CanvasRenderer(canvas, overlayCanvas, state);
    console.log("✓ Canvas renderer initialized");

    // Initialize tool manager
    const toolManager = new ToolManager(renderer);
    toolManager.setFirebaseWriter(firebaseDb 
      ? (cells, color) => writePixelsToFirebase(cells, color)
      : null);

    // Register tools
    toolManager.registerTool(TOOLS.PIXEL, createPixelTool(toolManager));
    toolManager.registerTool(TOOLS.BRUSH, createBrushTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.LINE, createLineTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.FILL, createFillTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.ERASER, createEraserTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.PICKER, createPickerTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.SPRAY, createSprayTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.TEXT, createTextTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.STAMP, createStampTool(toolManager, renderer));
    toolManager.registerTool(TOOLS.TRANSFORM, createTransformTool(toolManager, renderer));
    console.log("✓ All tools registered");

    // Initialize event manager
    const eventManager = new EventManager(canvas, canvasWrap, renderer, toolManager);
    console.log("✓ Event manager initialized");

    // Bind UI events
    bindUIEvents(toolManager, eventManager, renderer, toggleHelpBtn, closeHelpBtn, helpPanel);
    console.log("✓ UI events bound");

    // Setup layers panel
    setupLayerControls();
    renderLayersList();
    console.log("✓ Layers panel initialized");

    // Render initial board
    renderer.render();
    console.log("✓ Initial render complete");
    
    // Set default tool
    selectTool(toolManager, document.querySelector(`[data-tool="${TOOLS.PIXEL}"]`), TOOLS.PIXEL);

    // Initialize Firebase if configured
    if (isFirebaseConfigured()) {
      await initializeFirebase(toolManager, renderer);
      console.log("✓ Firebase initialized");
    } else {
      state.emit("notice", { message: "Firebase not configured. Local mode only.", ok: false });
    }

    // Show welcome message
    state.emit("notice", { message: "🎨 Ready to paint!", ok: true });
    console.log("✅ Application initialized successfully");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    state.emit("notice", { message: `Init error: ${error.message}`, ok: false });
  }
}

// ============================================================================
// UI EVENT BINDING
// ============================================================================

function bindUIEvents(toolManager, eventManager, renderer, toggleHelpBtn, closeHelpBtn, helpPanel) {
  // Tool buttons
  document.querySelectorAll(".tool-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (tool && !SPECTATOR_MODE) {
        selectTool(toolManager, btn, tool);
      }
    });
  });

  // Palette buttons
  document.querySelectorAll(".palette-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!SPECTATOR_MODE) {
        const color = btn.dataset.paletteColor;
        if (color) {
          state.setColor(color);
          updateColorUI(btn);
        }
      }
    });
  });

  // Color picker
  const colorPicker = document.getElementById("colorPicker");
  if (colorPicker) {
    colorPicker.addEventListener("change", (e) => {
      if (!SPECTATOR_MODE) {
        state.setColor(e.target.value);
      }
    });
  }

  // Brush size
  const brushSize = document.getElementById("brushSize");
  if (brushSize) {
    brushSize.addEventListener("change", (e) => {
      state.brushSize = Number(e.target.value);
      state.savePreferences();
      state.emit("brushSizeChanged", { size: state.brushSize });
    });
  }

  // Grid toggle
  const gridToggle = document.getElementById("gridToggle");
  if (gridToggle) {
    gridToggle.addEventListener("change", () => {
      state.gridEnabled = gridToggle.checked;
      state.savePreferences();
      renderer.render();
    });
  }

  // History actions
  const undoBtn = document.getElementById("undoAction");
  const redoBtn = document.getElementById("redoAction");
  if (undoBtn) undoBtn.addEventListener("click", () => toolManager.performUndo());
  if (redoBtn) redoBtn.addEventListener("click", () => toolManager.performRedo());

  // Export
  const exportBtn = document.getElementById("exportPng");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      renderer.exportPNG();
      state.emit("notice", { message: "PNG exported", ok: true });
    });
  }

  // Share
  const shareBtn = document.getElementById("copySpectatorLink");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", "spectator");
      try {
        await navigator.clipboard.writeText(url.toString());
        state.emit("notice", { message: "Spectator link copied", ok: true });
      } catch {
        state.emit("notice", { message: `Spectator URL: ${url.toString()}`, ok: false });
      }
    });
  }

  // Help modal
  if (toggleHelpBtn) toggleHelpBtn.addEventListener("click", () => {
    state.helpVisible = true;
    helpPanel.hidden = false;
  });
  if (closeHelpBtn) closeHelpBtn.addEventListener("click", () => {
    state.helpVisible = false;
    helpPanel.hidden = true;
  });
  if (helpPanel) {
    helpPanel.addEventListener("click", (e) => {
      if (e.target === helpPanel) {
        state.helpVisible = false;
        helpPanel.hidden = true;
      }
    });
  }

  // Listen to state events
  state.on("colorChanged", (data) => {
    updateColorUI();
  });

  // State event listener safety wrappers
  state.on("notice", (data) => {
    try {
      const noticeBox = document.getElementById("noticeBox");
      if (noticeBox) {
        noticeBox.textContent = data.message || "";
        noticeBox.classList.toggle("ok", Boolean(data.ok));
      }
    } catch (err) {
      console.error("Notice update failed:", err);
    }
  });

  state.on("hoverChanged", (data) => {
    try {
      const hoverStatus = document.getElementById("hoverStatus");
      if (hoverStatus && data) {
        hoverStatus.textContent = `Cursor: ${data.x}, ${data.y} | ${data.color || "#000000"}`;
      }
    } catch (err) {
      console.error("Hover update failed:", err);
    }
  });

  state.on("zoomChanged", (data) => {
    try {
      const zoomStatus = document.getElementById("zoomStatus");
      if (zoomStatus && data && data.zoom) {
        zoomStatus.textContent = `Zoom: ${Math.round(data.zoom * 100)}%`;
      }
    } catch (err) {
      console.error("Zoom update failed:", err);
    }
  });

  state.on("toolChanged", (data) => {
    const modeStatus = document.getElementById("modeStatus");
    if (modeStatus) {
      modeStatus.textContent = `Tool: ${data.tool}`;
    }
  });

  state.on("historyChanged", (data) => {
    try {
      const historyStatus = document.getElementById("historyStatus");
      if (historyStatus && data) {
        const histCount = (data.history && data.history.length) || 0;
        const redoCount = (data.redoHistory && data.redoHistory.length) || 0;
        historyStatus.textContent = `History: ${histCount} | Redo: ${redoCount}`;
      }
    } catch (err) {
      console.error("History update failed:", err);
    }
  });
}

function selectTool(toolManager, button, toolName) {
  // Remove active class from all buttons
  document.querySelectorAll(".tool-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Add active class to clicked button
  button.classList.add("active");
  // Set tool
  toolManager.setActiveTool(toolName);
}

function updateColorUI() {
  const colorPicker = document.getElementById("colorPicker");
  const colorSwatch = document.getElementById("currentColorSwatch");

  if (colorPicker) colorPicker.value = state.selectedColor;
  if (colorSwatch) {
    colorSwatch.textContent = state.selectedColor;
    colorSwatch.style.backgroundColor = state.selectedColor;
  }

  // Update palette button active states
  document.querySelectorAll(".palette-btn").forEach((btn) => {
    const btnColor = (btn.dataset.paletteColor || "").toUpperCase();
    btn.classList.toggle("active", btnColor === state.selectedColor.toUpperCase());
  });
}

// ============================================================================
// LAYERS PANEL MANAGEMENT
// ============================================================================

function renderLayersList() {
  const container = document.getElementById("layersContainer");
  if (!container) return;

  container.innerHTML = "";

  // Render each layer
  state.layers.forEach((layer, index) => {
    const layerEl = document.createElement("div");
    layerEl.className = "layer-item";
    layerEl.dataset.layerId = layer.id;

    const isActive = layer.id === state.activeLayerId;
    if (isActive) layerEl.classList.add("active");

    // Layer name and controls
    const nameEl = document.createElement("span");
    nameEl.className = "layer-name";
    nameEl.textContent = layer.name;
    nameEl.addEventListener("click", () => {
      state.activeLayerId = layer.id;
      renderLayersList();
    });

    // Visibility toggle
    const visToggle = document.createElement("button");
    visToggle.className = "layer-toggle-visibility";
    visToggle.textContent = layer.visible ? "👁️" : "🚫";
    visToggle.title = layer.visible ? "Hide layer" : "Show layer";
    visToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      layer.visible = !layer.visible;
      renderLayersList();
    });

    // Layer opacity slider with optimized rendering
    const opacityInput = document.createElement("input");
    opacityInput.type = "range";
    opacityInput.min = "0";
    opacityInput.max = "100";
    opacityInput.value = Math.round(layer.opacity * 100);
    opacityInput.className = "layer-opacity";
    opacityInput.title = `Opacity: ${Math.round(layer.opacity * 100)}%`;
    opacityInput.addEventListener("input", (e) => {
      const newOpacity = Number(e.target.value) / 100;
      layer.opacity = newOpacity;
      e.target.title = `Opacity: ${e.target.value}%`;
      // Render canvas with new opacity immediately
      renderer.render();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "layer-delete";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete layer";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.layers.length > 1) {
        const idx = state.layers.findIndex((l) => l.id === layer.id);
        if (idx >= 0) {
          state.layers.splice(idx, 1);
          if (state.activeLayerId === layer.id) {
            state.activeLayerId = state.layers[0].id;
          }
          renderLayersList();
        }
      } else {
        state.emit("notice", { message: "Cannot delete last layer", ok: false });
      }
    });

    layerEl.appendChild(visToggle);
    layerEl.appendChild(nameEl);
    layerEl.appendChild(opacityInput);
    layerEl.appendChild(deleteBtn);
    container.appendChild(layerEl);
  });
}

function setupLayerControls() {
  const addLayerBtn = document.getElementById("addLayerBtn");
  if (addLayerBtn) {
    addLayerBtn.addEventListener("click", () => {
      const newLayer = {
        id: `layer_${Date.now()}`,
        name: `Layer ${state.layers.length + 1}`,
        pixels: new Map(),
        visible: true,
        opacity: 1,
        blendMode: "normal"
      };
      state.layers.push(newLayer);
      state.activeLayerId = newLayer.id;
      renderLayersList();
    });
  }
}

// ============================================================================
// FIREBASE INTEGRATION (NO COOLDOWN)
// ============================================================================

function isFirebaseConfigured() {
  return Object.values(FIREBASE_CONFIG).every((val) => String(val || "").trim().length > 0);
}

async function initializeFirebase(toolManager, renderer) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);

    // Initialize analytics
    getAnalytics(app);

    firebaseDb = getDatabase(app);

    // Listen for connection status
    onValue(ref(firebaseDb, ".info/connected"), (snap) => {
      const connected = Boolean(snap.val());
      state.isConnected = connected;
      const statusEl = document.getElementById("connectionStatus");
      if (statusEl) {
        statusEl.textContent = connected ? "online" : "offline";
        statusEl.classList.toggle("online", connected);
        statusEl.classList.toggle("offline", !connected);
      }
    });

    // Listen for pixel updates
    onChildAdded(ref(firebaseDb, "pixels"), (snap) => {
      const key = snap.key;
      const color = String(snap.val() || "").toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color) || !key.includes("_")) return;

      const [x, y] = key.split("_").map(Number);
      state.layers[0].pixels.set(key, color);
      renderer.render();
    });

    onChildChanged(ref(firebaseDb, "pixels"), (snap) => {
      const key = snap.key;
      const color = String(snap.val() || "").toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color) || !key.includes("_")) return;

      const [x, y] = key.split("_").map(Number);
      state.layers[0].pixels.set(key, color);
      renderer.render();
    });

    // Update presence
    const presenceRef = ref(firebaseDb, `presence/${state.sessionId}`);
    await set(presenceRef, { at: serverTimestamp() });
    onDisconnect(presenceRef).remove();

    // Listen for user count
    onValue(ref(firebaseDb, "presence"), (snap) => {
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      const userCount = document.getElementById("userCount");
      if (userCount) userCount.textContent = `Users: ${count}`;
    });

    // Cleanup on unload
    window.addEventListener("beforeunload", async () => {
      try {
        await remove(presenceRef);
      } catch {
        // Ignore cleanup errors
      }
    });

    state.emit("notice", { message: "Firebase sync active (no cooldown)", ok: true });

    // Now set the Firebase writer on tool manager
    if (toolManager) {
      toolManager.setFirebaseWriter((cells, color) => writePixelsToFirebase(cells, color));
    }
  } catch (error) {
    console.error("Firebase init failed:", error);
    state.emit("notice", { message: `Firebase error: ${error.message}`, ok: false });
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

document.addEventListener("DOMContentLoaded", initializeApplication);
