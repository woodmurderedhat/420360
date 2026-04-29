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
import { TOOLS, FIREBASE_CONFIG, SPECTATOR_MODE, BLEND_MODES, STORAGE_KEYS, TOOL_OPTIONS_DEFAULTS } from "./config/constants.js";

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import {
  getDatabase,
  forceWebSockets,
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

// Renderer instance (set during initialization, needed by module-level UI helpers)
let renderer = null;

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
    state.writeInFlight = true;
    state.pendingWriteStartedAt = Date.now();
    state.emit("syncStateChanged", { label: "Sync: saving", ok: false });

    const updates = {};
    for (const cell of cells) {
      const key = `pixels/${cell.x}_${cell.y}`;
      updates[key] = color;
    }
    await update(ref(firebaseDb), updates);
    state.writeInFlight = false;
    state.lastAckMs = Date.now();
    state.stats.successfulWrites += cells.length;
    state.emit("statsChanged", { ...state.stats });
    state.emit("syncStateChanged", { label: `Sync: live ${cells.length}`, ok: true });
  } catch (error) {
    state.writeInFlight = false;
    state.emit("syncStateChanged", { label: "Sync: retry needed", ok: false });
    console.error("Firebase write error:", error);
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

async function initializeApplication() {
  try {
    console.log("🎨 Initializing Shared Pixel Board...");

    // Validate DOM is ready
    if (document.readyState === "loading") {
      throw new Error("DOM not fully loaded");
    }

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
    renderer = new CanvasRenderer(canvas, overlayCanvas, state);
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
    
    // Restore the saved tool if possible, otherwise fall back to pixel.
    const initialTool = state.activeTool || TOOLS.PIXEL;
    selectTool(
      toolManager,
      document.querySelector(`[data-tool="${initialTool}"]`) || document.querySelector(`[data-tool="${TOOLS.PIXEL}"]`),
      initialTool
    );
    eventManager.resetView();
    state.emit("statsChanged", { ...state.stats });
    state.emit("syncStateChanged", {
      label: isFirebaseConfigured() ? "Sync: connecting" : "Sync: local only",
      ok: !isFirebaseConfigured()
    });

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
    // Re-throw to prevent silent failures
    if (error.message.includes("DOM not fully")) {
      console.error("Critical: DOM initialization failed");
    }
  }
}

// ============================================================================
// UI EVENT BINDING
// ============================================================================

function bindUIEvents(toolManager, eventManager, renderer, toggleHelpBtn, closeHelpBtn, helpPanel) {
  const PALETTE_LONG_PRESS_MS = 450;
  const DRAWER_SWIPE_CLOSE_PX = 72;
  const canvasWrapEl = document.getElementById("canvasWrap");
  const panelsEl = document.getElementById("sidePanels");
  const togglePanelsBtn = document.getElementById("togglePanels");
  const mobilePanelsBtn = document.getElementById("mobilePanelsAction");
  const closePanelsBtn = document.getElementById("closePanels");
  const panelsBackdrop = document.getElementById("panelsBackdrop");
  const mobilePanelNavButtons = document.querySelectorAll(".mobile-panels-nav-btn");
  const mobileCanvasHint = document.getElementById("mobileCanvasHint");
  const noticeToast = document.getElementById("noticeToast");

  const undoBtn = document.getElementById("undoAction");
  const redoBtn = document.getElementById("redoAction");
  const mobileUndoBtn = document.getElementById("mobileUndoAction");
  const mobileRedoBtn = document.getElementById("mobileRedoAction");
  const mobileZoomOutBtn = document.getElementById("mobileZoomOutAction");
  const mobileResetViewBtn = document.getElementById("mobileResetViewAction");
  const mobileZoomInBtn = document.getElementById("mobileZoomInAction");
  const mobileColorActionBtn = document.getElementById("mobileColorAction");
  const mobileSizeControls = document.getElementById("mobileSizeControls");

  const TOOL_HINTS = {
    pixel: "Pixel · tap to place",
    brush: "Brush · drag to paint",
    line: "Line · tap start, tap end",
    fill: "Fill · tap a region",
    eraser: "Eraser · drag to clear",
    spray: "Spray · hold and move",
    picker: "Picker · tap a color",
    text: "Text · tap, type, commit",
    stamp: "Stamp · tap to apply",
    transform: "Transform · use panel actions"
  };

  let noticeToastTimer = null;
  let transientHintTimer = null;
  let suppressPaletteClickUntil = 0;
  let drawerTouchStart = null;

  function isMobileViewport() {
    return window.innerWidth <= 768;
  }

  function getToolHint(toolName = state.activeTool) {
    return TOOL_HINTS[toolName] || "Tap to paint";
  }

  function setMobileCanvasHint(message, transient = false) {
    if (!mobileCanvasHint) return;

    if (transientHintTimer) {
      clearTimeout(transientHintTimer);
      transientHintTimer = null;
    }

    mobileCanvasHint.textContent = message || getToolHint();

    if (transient) {
      transientHintTimer = setTimeout(() => {
        mobileCanvasHint.textContent = getToolHint();
        transientHintTimer = null;
      }, 1600);
    }
  }

  function setPanelsOpen(open) {
    if (!panelsEl) return;

    const nextOpen = Boolean(open) && isMobileViewport();
    panelsEl.classList.toggle("open", nextOpen);
    panelsEl.setAttribute("aria-hidden", String(isMobileViewport() ? !nextOpen : false));

    [togglePanelsBtn, mobilePanelsBtn].forEach((button) => {
      if (button) button.setAttribute("aria-expanded", String(nextOpen));
    });

    if (panelsBackdrop) {
      panelsBackdrop.hidden = !nextOpen;
      panelsBackdrop.classList.toggle("open", nextOpen);
    }
  }

  function setPanelCollapsed(panelEl, collapsed) {
    if (!panelEl) return;

    panelEl.classList.toggle("collapsed", collapsed);
    const toggleBtn = panelEl.querySelector(".panel-toggle-btn");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
    }
  }

  function applyMobilePanelLayout(forceMobileDefaults = false) {
    if (!panelsEl) return;

    const mobileDefaults = {
      colors: false,
      "tool-options": false,
      layers: true,
      history: true,
      share: true
    };

    panelsEl.querySelectorAll(".panel").forEach((panelEl) => {
      if (!isMobileViewport()) {
        setPanelCollapsed(panelEl, false);
        return;
      }

      if (forceMobileDefaults) {
        const key = panelEl.dataset.panelKey;
        setPanelCollapsed(panelEl, Boolean(mobileDefaults[key]));
      }
    });
  }

  function scrollToPanel(panelKey) {
    if (!panelsEl || !panelKey) return;

    const panelEl = panelsEl.querySelector(`.panel[data-panel-key="${panelKey}"]`);
    if (!panelEl) return;

    setPanelCollapsed(panelEl, false);
    panelEl.scrollIntoView({ behavior: "smooth", block: "start" });

    mobilePanelNavButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.targetPanel === panelKey);
    });
  }

  function updateHistoryButtons() {
    const canUndo = state.canUndo();
    const canRedo = state.canRedo();

    [undoBtn, mobileUndoBtn].forEach((button) => {
      if (button) button.disabled = !canUndo;
    });
    [redoBtn, mobileRedoBtn].forEach((button) => {
      if (button) button.disabled = !canRedo;
    });
  }

  function updateZoomControls(zoom = state.zoomLevel) {
    if (mobileResetViewBtn) {
      mobileResetViewBtn.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  function updateMobileSizeControls() {
    if (!mobileSizeControls) return;

    const showSizeControls = state.activeTool === "brush" || state.activeTool === "eraser";
    mobileSizeControls.hidden = !showSizeControls;

    mobileSizeControls.querySelectorAll(".mobile-size-pill").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.size) === state.brushSize);
    });
  }

  function updateSessionStats() {
    const sessionStats = document.getElementById("sessionStats");
    if (sessionStats) {
      sessionStats.textContent = `Session: ${state.stats.placements} px`;
    }
  }

  function showNoticeToastMessage(message, ok = false) {
    if (!noticeToast || !isMobileViewport() || !message) return;

    if (noticeToastTimer) {
      clearTimeout(noticeToastTimer);
    }

    noticeToast.hidden = false;
    noticeToast.textContent = message;
    noticeToast.classList.toggle("ok", Boolean(ok));

    noticeToastTimer = setTimeout(() => {
      noticeToast.hidden = true;
      noticeToastTimer = null;
    }, 2200);
  }

  function closeMobileDrawerAfterColorAction() {
    if (isMobileViewport() && panelsEl?.classList.contains("open")) {
      setPanelsOpen(false);
      setMobileCanvasHint("Color ready · tap to paint", true);
    }
  }

  function shouldSuppressPaletteClick() {
    return Date.now() < suppressPaletteClickUntil;
  }

  function openPaletteEditor(button, paletteEditInput) {
    if (!button || !paletteEditInput) return;

    paletteEditInput.value = button.dataset.paletteColor || "#ffffff";
    paletteEditInput.click();
    suppressPaletteClickUntil = Date.now() + 700;
  }

  function registerPaletteLongPress(button, paletteEditInput, editingButtonRef) {
    let timerId = null;

    function clearLongPressTimer() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || !paletteEditInput) return;

      clearLongPressTimer();
      timerId = setTimeout(() => {
        editingButtonRef.set(button);
        openPaletteEditor(button, paletteEditInput);
        timerId = null;
      }, PALETTE_LONG_PRESS_MS);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      button.addEventListener(eventName, clearLongPressTimer);
    });
  }

  // Tool buttons
  document.querySelectorAll(".tool-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (tool && !SPECTATOR_MODE) {
        selectTool(toolManager, btn, tool);
      }
    });
  });

  document.querySelectorAll(".mobile-tool-shortcut").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (tool && !SPECTATOR_MODE) {
        selectTool(toolManager, document.querySelector(`.tool-button[data-tool="${tool}"]`), tool);
      }
    });
  });

  document.querySelectorAll(".mobile-size-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = Number(btn.dataset.size);
      if (!SPECTATOR_MODE && Number.isFinite(size)) {
        state.brushSize = size;
        state.savePreferences();
        state.emit("brushSizeChanged", { size });
      }
    });
  });

  // Palette buttons
  document.querySelectorAll(".palette-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (shouldSuppressPaletteClick()) return;
      if (!SPECTATOR_MODE) {
        const color = btn.dataset.paletteColor;
        if (color) {
          state.setColor(color);
          updateColorUI(btn);
          closeMobileDrawerAfterColorAction();
        }
      }
    });
  });

  document.querySelectorAll(".mobile-palette-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (shouldSuppressPaletteClick()) return;
      if (!SPECTATOR_MODE) {
        const color = btn.dataset.paletteColor;
        if (color) {
          state.setColor(color);
          updateColorUI();
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
        closeMobileDrawerAfterColorAction();
      }
    });
  }

  if (mobileColorActionBtn && colorPicker) {
    mobileColorActionBtn.addEventListener("click", () => {
      if (!SPECTATOR_MODE) {
        colorPicker.click();
      }
    });
  }

  // Brush size and grid are now in the dynamic tool options panel
  // (see renderToolOptions)

  // History actions
  if (undoBtn) undoBtn.addEventListener("click", () => toolManager.performUndo());
  if (redoBtn) redoBtn.addEventListener("click", () => toolManager.performRedo());
  if (mobileUndoBtn) mobileUndoBtn.addEventListener("click", () => toolManager.performUndo());
  if (mobileRedoBtn) mobileRedoBtn.addEventListener("click", () => toolManager.performRedo());
  if (mobileZoomOutBtn) mobileZoomOutBtn.addEventListener("click", () => eventManager.zoomOut());
  if (mobileZoomInBtn) mobileZoomInBtn.addEventListener("click", () => eventManager.zoomIn());
  if (mobileResetViewBtn) mobileResetViewBtn.addEventListener("click", () => eventManager.resetView());

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

  if (togglePanelsBtn) {
    togglePanelsBtn.addEventListener("click", () => {
      setPanelsOpen(!panelsEl?.classList.contains("open"));
    });
  }

  if (mobilePanelsBtn) {
    mobilePanelsBtn.addEventListener("click", () => {
      setPanelsOpen(true);
    });
  }

  if (closePanelsBtn) {
    closePanelsBtn.addEventListener("click", () => setPanelsOpen(false));
  }

  if (panelsBackdrop) {
    panelsBackdrop.addEventListener("click", () => setPanelsOpen(false));
  }

  if (panelsEl) {
    panelsEl.addEventListener("touchstart", (event) => {
      if (!isMobileViewport() || !panelsEl.classList.contains("open") || event.touches.length !== 1) {
        drawerTouchStart = null;
        return;
      }

      const touch = event.touches[0];
      drawerTouchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    panelsEl.addEventListener("touchend", (event) => {
      if (!drawerTouchStart || !isMobileViewport() || !panelsEl.classList.contains("open")) {
        drawerTouchStart = null;
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        drawerTouchStart = null;
        return;
      }

      const deltaX = touch.clientX - drawerTouchStart.x;
      const deltaY = Math.abs(touch.clientY - drawerTouchStart.y);

      if (deltaX > DRAWER_SWIPE_CLOSE_PX && deltaX > deltaY * 1.2) {
        setPanelsOpen(false);
        setMobileCanvasHint("Panels closed", true);
      }

      drawerTouchStart = null;
    }, { passive: true });

    panelsEl.addEventListener("touchcancel", () => {
      drawerTouchStart = null;
    }, { passive: true });
  }

  mobilePanelNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!isMobileViewport()) return;
      scrollToPanel(button.dataset.targetPanel);
    });
  });

  if (canvasWrapEl) {
    canvasWrapEl.addEventListener("click", () => {
      if (isMobileViewport()) {
        setPanelsOpen(false);
      }
    });
  }

  panelsEl?.querySelectorAll(".panel-header").forEach((headerEl) => {
    headerEl.addEventListener("click", (event) => {
      if (!isMobileViewport()) return;
      if (event.target.closest(".panel-action-btn") && !event.target.closest(".panel-toggle-btn")) return;

      const panelEl = headerEl.closest(".panel");
      if (!panelEl) return;
      setPanelCollapsed(panelEl, !panelEl.classList.contains("collapsed"));
      const key = panelEl.dataset.panelKey;
      if (key) {
        mobilePanelNavButtons.forEach((button) => {
          button.classList.toggle("active", button.dataset.targetPanel === key && !panelEl.classList.contains("collapsed"));
        });
      }
    });
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      setPanelsOpen(false);
      applyMobilePanelLayout(false);
    } else if (noticeToast) {
      noticeToast.hidden = true;
      applyMobilePanelLayout(false);
    }
  });

  // Listen to state events
  state.on("colorChanged", () => {
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
      showNoticeToastMessage(data.message || "", Boolean(data.ok));
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
      updateZoomControls(data?.zoom || state.zoomLevel);
    } catch (err) {
      console.error("Zoom update failed:", err);
    }
  });

  state.on("toolChanged", (data) => {
    const modeStatus = document.getElementById("modeStatus");
    if (modeStatus) {
      modeStatus.textContent = `Tool: ${data.tool}`;
    }

    document.querySelectorAll(".tool-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === data.tool);
    });

    document.querySelectorAll(".mobile-tool-shortcut").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === data.tool);
    });

    // Update cursor via data attribute
    if (canvasWrapEl) canvasWrapEl.dataset.activeTool = data.tool;
    // Re-render dynamic tool options panel
    renderToolOptions(data.tool, renderer, toolManager);
    updateMobileSizeControls();
    setMobileCanvasHint(getToolHint(data.tool));
  });

  state.on("brushSizeChanged", () => {
    renderToolOptions(state.activeTool, renderer, toolManager);
    updateMobileSizeControls();
  });

  state.on("historyChanged", (data) => {
    try {
      const historyStatus = document.getElementById("historyStatus");
      if (historyStatus && data) {
        const histCount = (data.history && data.history.length) || 0;
        const redoCount = (data.redoHistory && data.redoHistory.length) || 0;
        historyStatus.textContent = `History: ${histCount} | Redo: ${redoCount}`;
      }
      updateHistoryButtons();
    } catch (err) {
      console.error("History update failed:", err);
    }
  });

  state.on("statsChanged", () => {
    updateSessionStats();
  });

  state.on("syncStateChanged", (data) => {
    const syncStatus = document.getElementById("syncStatus");
    if (syncStatus) {
      syncStatus.textContent = data?.label || "Sync: -";
      syncStatus.classList.toggle("online", Boolean(data?.ok));
      syncStatus.classList.toggle("offline", Boolean(data && !data.ok));
    }
  });

  state.on("interactionHint", (data) => {
    setMobileCanvasHint(data?.message || getToolHint(), Boolean(data?.transient));
  });

  // ── Palette editor (double-click to edit slot color) ──────────────────────
  loadPersistedPalette();
  updateColorUI();

  const paletteEditInput = document.getElementById("paletteColorEdit");
  let editingBtn = null;
  const editingButtonRef = {
    set(button) {
      editingBtn = button;
    },
    get() {
      return editingBtn;
    }
  };

  if (paletteEditInput) {
    paletteEditInput.addEventListener("change", () => {
      if (!editingButtonRef.get()) return;
      const newColor = paletteEditInput.value.toUpperCase();
      setPaletteSlotColor(editingButtonRef.get().dataset.paletteSlot, newColor);
      persistPalette();
      editingBtn = null;
    });
  }

  document.querySelectorAll(".palette-btn").forEach((btn) => {
    btn.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (!paletteEditInput) return;
      editingButtonRef.set(btn);
      openPaletteEditor(btn, paletteEditInput);
    });

    registerPaletteLongPress(btn, paletteEditInput, editingButtonRef);
  });

  document.querySelectorAll(".mobile-palette-btn").forEach((btn) => {
    registerPaletteLongPress(btn, paletteEditInput, editingButtonRef);
  });

  // ── Initial tool options render ────────────────────────────────────────────
  renderToolOptions(state.activeTool, renderer, toolManager);
  updateHistoryButtons();
  updateZoomControls();
  updateMobileSizeControls();
  updateSessionStats();
  setPanelsOpen(false);
  applyMobilePanelLayout(true);
  mobilePanelNavButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.targetPanel === "colors");
  });
  setMobileCanvasHint(getToolHint(state.activeTool));

  // ── Set initial cursor data attribute ─────────────────────────────────────
  if (canvasWrapEl) canvasWrapEl.dataset.activeTool = state.activeTool;
}

function selectTool(toolManager, button, toolName) {
  // Remove active class from all buttons
  document.querySelectorAll(".tool-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Add active class to clicked button
  if (button) {
    button.classList.add("active");
  }
  // Set tool
  toolManager.setActiveTool(toolName);
}

function colorBrightness(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function updateColorUI() {
  const colorPicker = document.getElementById("colorPicker");
  const colorSwatch = document.getElementById("currentColorSwatch");
  const mobileColorSwatch = document.getElementById("mobileColorSwatch");
  const mobileColorLabel = document.getElementById("mobileColorLabel");

  if (colorPicker) colorPicker.value = state.selectedColor;
  if (colorSwatch) {
    colorSwatch.textContent = state.selectedColor;
    colorSwatch.style.backgroundColor = state.selectedColor;
    colorSwatch.style.color = colorBrightness(state.selectedColor) > 145 ? "#111827" : "#e7cfb5";
  }
  if (mobileColorSwatch) {
    mobileColorSwatch.style.backgroundColor = state.selectedColor;
  }
  if (mobileColorLabel) {
    mobileColorLabel.textContent = state.selectedColor;
  }

  // Update palette button active states and text contrast
  document.querySelectorAll(".palette-btn, .mobile-palette-btn").forEach((btn) => {
    const btnColor = (btn.dataset.paletteColor || "").toUpperCase();
    btn.classList.toggle("active", btnColor === state.selectedColor.toUpperCase());
    if (btnColor) {
      btn.style.color = colorBrightness(btnColor) > 145 ? "#111827" : "#e7cfb5";
    }
  });
}

function setPaletteSlotColor(slot, color) {
  document.querySelectorAll(`[data-palette-slot="${slot}"]`).forEach((btn) => {
    applyPaletteButtonColor(btn, color);
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
      renderer.render();
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

    // Top row: visibility, name, delete
    const topRow = document.createElement("div");
    topRow.className = "layer-item-row";
    topRow.appendChild(visToggle);
    topRow.appendChild(nameEl);
    topRow.appendChild(deleteBtn);
    layerEl.appendChild(topRow);

    // Bottom row: opacity, blend mode
    const bottomRow = document.createElement("div");
    bottomRow.className = "layer-item-row";
    bottomRow.style.paddingLeft = "0.25rem";
    bottomRow.appendChild(opacityInput);

    // Blend mode select
    const blendSelect = document.createElement("select");
    blendSelect.className = "layer-blend";
    blendSelect.title = "Blend mode";
    blendSelect.style.flex = "1";
    for (const mode of BLEND_MODES) {
      const opt = document.createElement("option");
      opt.value = mode;
      opt.textContent = mode;
      if (mode === layer.blendMode) opt.selected = true;
      blendSelect.appendChild(opt);
    }
    blendSelect.addEventListener("change", (e) => {
      e.stopPropagation();
      layer.blendMode = e.target.value;
      renderer.render();
    });
    bottomRow.appendChild(blendSelect);
    layerEl.appendChild(bottomRow);

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
// DYNAMIC TOOL OPTIONS PANEL
// ============================================================================

function renderToolOptions(toolName, rendererRef, toolManagerRef) {
  const container = document.getElementById("toolOptionsContent");
  if (!container) return;
  container.innerHTML = "";

  // --- Grid toggle (shared by all tools) ---
  function makeGridToggle() {
    const row = document.createElement("div");
    row.className = "grid-toggle-row";
    const lbl = document.createElement("label");
    lbl.textContent = "Grid";
    lbl.htmlFor = "gridToggleDyn";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.id = "gridToggleDyn";
    chk.checked = state.gridEnabled;
    chk.addEventListener("change", () => {
      state.gridEnabled = chk.checked;
      state.savePreferences();
      if (rendererRef) rendererRef.render();
    });
    row.appendChild(lbl);
    row.appendChild(chk);
    return row;
  }

  // --- Brush size pills ---
  function makeSizePills() {
    const group = document.createElement("div");
    group.className = "option-group";
    const lbl = document.createElement("label");
    lbl.textContent = "Brush Size";
    group.appendChild(lbl);

    const pillRow = document.createElement("div");
    pillRow.className = "size-pills";
    const dotSizes = [4, 6, 8, 11, 14];

    for (let i = 1; i <= 5; i++) {
      const pill = document.createElement("button");
      pill.className = "size-pill" + (state.brushSize === i ? " active" : "");
      pill.title = `Size ${i}`;
      const dot = document.createElement("span");
      dot.className = "size-pill-dot";
      dot.style.width = `${dotSizes[i - 1]}px`;
      dot.style.height = `${dotSizes[i - 1]}px`;
      if (state.brushSize === i) dot.style.background = "var(--accent)";
      pill.appendChild(dot);
      const size = i;
      pill.addEventListener("click", () => {
        state.brushSize = size;
        state.savePreferences();
        state.emit("brushSizeChanged", { size });
        pillRow.querySelectorAll(".size-pill").forEach((p, idx) => {
          const active = idx + 1 === size;
          p.classList.toggle("active", active);
          p.querySelector(".size-pill-dot").style.background = active
            ? "var(--accent)"
            : "var(--text-primary)";
        });
      });
      pillRow.appendChild(pill);
    }

    group.appendChild(pillRow);
    return group;
  }

  switch (toolName) {
    case "pixel": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Click or drag to place individual pixels.";
      container.appendChild(desc);
      container.appendChild(makeGridToggle());
      break;
    }

    case "brush":
    case "eraser": {
      container.appendChild(makeSizePills());
      container.appendChild(makeGridToggle());
      break;
    }

    case "line": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Click to set start point, click again to draw. ESC cancels.";
      container.appendChild(desc);
      container.appendChild(makeGridToggle());
      break;
    }

    case "fill": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Flood-fills connected same-color pixels (max 480 cells).";
      container.appendChild(desc);
      container.appendChild(makeGridToggle());
      break;
    }

    case "spray": {
      const opts = state.toolOptions[toolName] || { ...TOOL_OPTIONS_DEFAULTS.spray };
      const group = document.createElement("div");
      group.className = "spray-slider-group";

      function makeSliderRow(id, label, min, max, value, onInput) {
        const row = document.createElement("div");
        row.className = "spray-slider-row";
        const labelRow = document.createElement("div");
        labelRow.className = "spray-slider-label";
        const labelSpan = document.createElement("span");
        labelSpan.textContent = label;
        const valSpan = document.createElement("span");
        valSpan.id = id;
        valSpan.textContent = value;
        labelRow.appendChild(labelSpan);
        labelRow.appendChild(valSpan);
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "spray-range";
        slider.min = String(min);
        slider.max = String(max);
        slider.value = String(value);
        slider.addEventListener("input", () => {
          valSpan.textContent = slider.value;
          onInput(Number(slider.value));
        });
        row.appendChild(labelRow);
        row.appendChild(slider);
        return row;
      }

      group.appendChild(makeSliderRow("sprayRadiusVal", "Radius", 2, 12, opts.radius, (v) => {
        state.toolOptions[toolName] = { ...state.toolOptions[toolName], radius: v };
      }));
      group.appendChild(makeSliderRow("sprayParticlesVal", "Particles", 5, 25, opts.particleCount, (v) => {
        state.toolOptions[toolName] = { ...state.toolOptions[toolName], particleCount: v };
      }));

      container.appendChild(group);
      container.appendChild(makeGridToggle());
      break;
    }

    case "picker": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Click a pixel to sample its color. Right-click works on any tool.";
      container.appendChild(desc);
      container.appendChild(makeGridToggle());
      break;
    }

    case "text": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Click canvas → type text → Enter to commit, Esc to cancel. 4×5 pixel bitmap font (A–Z, 0–9).";
      container.appendChild(desc);
      container.appendChild(makeGridToggle());
      break;
    }

    case "stamp": {
      const opts = state.toolOptions[toolName] || { ...TOOL_OPTIONS_DEFAULTS.stamp };
      const group = document.createElement("div");
      group.className = "option-group";
      const lbl = document.createElement("label");
      lbl.textContent = "Pattern";
      group.appendChild(lbl);

      const patterns = [
        { key: "square", icon: "■", label: "Square" },
        { key: "circle", icon: "●", label: "Circle" },
        { key: "cross",  icon: "+", label: "Cross"  },
        { key: "star",   icon: "✦", label: "Star"   }
      ];

      const patternGrid = document.createElement("div");
      patternGrid.className = "stamp-patterns";

      for (const p of patterns) {
        const btn = document.createElement("button");
        btn.className = "stamp-pattern-btn" + (opts.selectedPattern === p.key ? " active" : "");
        btn.title = p.label;
        btn.textContent = p.icon;
        btn.addEventListener("click", () => {
          state.toolOptions[toolName] = { ...state.toolOptions[toolName], selectedPattern: p.key };
          patternGrid.querySelectorAll(".stamp-pattern-btn").forEach((b, i) => {
            b.classList.toggle("active", patterns[i].key === p.key);
          });
        });
        patternGrid.appendChild(btn);
      }

      group.appendChild(patternGrid);
      container.appendChild(group);
      container.appendChild(makeGridToggle());
      break;
    }

    case "transform": {
      const desc = document.createElement("p");
      desc.className = "tool-desc";
      desc.textContent = "Apply a transform to the active layer.";
      container.appendChild(desc);

      const transforms = [
        { type: "flipH",     icon: "↔", label: "Flip H"   },
        { type: "flipV",     icon: "↕", label: "Flip V"   },
        { type: "rotateCW",  icon: "↻", label: "Rot CW"   },
        { type: "rotateCCW", icon: "↺", label: "Rot CCW"  },
      ];
      const grid = document.createElement("div");
      grid.className = "stamp-patterns";
      for (const t of transforms) {
        const btn = document.createElement("button");
        btn.className = "stamp-pattern-btn";
        btn.title = t.label;
        btn.textContent = t.icon;
        btn.addEventListener("click", () => {
          const tool = toolManagerRef && toolManagerRef.getActiveTool();
          if (tool && tool.applyTransform) tool.applyTransform(t.type);
        });
        grid.appendChild(btn);
      }
      container.appendChild(grid);
      container.appendChild(makeGridToggle());
      break;
    }

    default:
      container.appendChild(makeGridToggle());
  }
}

// ============================================================================
// PALETTE PERSISTENCE
// ============================================================================

function persistPalette() {
  const btns = document.querySelectorAll(".palette-btn");
  const colors = Array.from(btns).map((b) => b.dataset.paletteColor || "");
  try {
    localStorage.setItem(STORAGE_KEYS.paletteColors, JSON.stringify(colors));
  } catch {
    // localStorage unavailable
  }
}

function applyPaletteButtonColor(btn, color) {
  btn.dataset.paletteColor = color;
  btn.style.backgroundColor = color;
  btn.style.color = colorBrightness(color) > 145 ? "#111827" : "#e7cfb5";
}

function loadPersistedPalette() {
  // Always apply data-palette-color first so colors show even with empty localStorage
  document.querySelectorAll(".palette-btn").forEach((btn) => {
    if (btn.dataset.paletteColor) {
      setPaletteSlotColor(btn.dataset.paletteSlot, btn.dataset.paletteColor);
    }
  });
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.paletteColors);
    if (!raw) return;
    const colors = JSON.parse(raw);
    if (!Array.isArray(colors)) return;
    const btns = document.querySelectorAll(".palette-btn");
    btns.forEach((btn, i) => {
      const color = (colors[i] || "").toUpperCase();
      if (/^#[0-9A-F]{6}$/.test(color)) {
        setPaletteSlotColor(btn.dataset.paletteSlot, color);
      }
    });
  } catch {
    // JSON parse or localStorage error
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
    forceWebSockets();

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
      state.emit("syncStateChanged", {
        label: connected ? (state.writeInFlight ? "Sync: saving" : "Sync: live") : "Sync: offline",
        ok: connected
      });
    });

    // Debounced render to batch rapid incoming pixel updates (e.g. initial load)
    let renderPending = false;
    function scheduleRender() {
      if (!renderPending) {
        renderPending = true;
        setTimeout(() => {
          renderPending = false;
          renderer.render();
        }, 30);
      }
    }

    // Listen for pixel updates
    onChildAdded(ref(firebaseDb, "pixels"), (snap) => {
      const key = snap.key;
      const color = String(snap.val() || "").toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color) || !key.includes("_")) return;

      state.layers[0].pixels.set(key, color);
      scheduleRender();
    });

    onChildChanged(ref(firebaseDb, "pixels"), (snap) => {
      const key = snap.key;
      const color = String(snap.val() || "").toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color) || !key.includes("_")) return;

      state.layers[0].pixels.set(key, color);
      scheduleRender();
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

    // Listen for last-updated timestamp
    onValue(ref(firebaseDb, "meta/lastUpdated"), (snap) => {
      const ts = snap.val();
      const el = document.getElementById("boardStamp");
      if (el && ts) {
        const d = new Date(ts);
        el.textContent = `Last: ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
      }
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
