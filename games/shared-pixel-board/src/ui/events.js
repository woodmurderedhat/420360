/**
 * Centralized event management for canvas and UI
 * Delegates events to appropriate tool handlers
 */

import state from "../core/state.js";
import {
  canvasToBoardCoordinates,
  clamp,
  getPointDistance,
  getPointMidpoint
} from "../core/math.js";
import { ZOOM_CONFIG, PAN_STEP_PX, SPECTATOR_MODE } from "../config/constants.js";

const TOUCH_TAP_MAX_MS = 260;
const TOUCH_TAP_MAX_MOVE_PX = 12;
const TOUCH_DOUBLE_TAP_MAX_DISTANCE_PX = 18;

class EventManager {
  constructor(canvas, canvasWrap, renderer, toolManager) {
    // Validate dependencies
    if (!canvas || !canvasWrap || !renderer || !toolManager) {
      throw new Error("EventManager: Missing required dependencies");
    }

    this.canvas = canvas;
    this.canvasWrap = canvasWrap;
    this.renderer = renderer;
    this.toolManager = toolManager;

    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartScrollLeft = 0;
    this.dragStartScrollTop = 0;

    this.bindCanvasEvents();
    this.bindKeyboardEvents();
    this.bindUIEvents();
  }

  /**
   * Bind canvas pointer, wheel, and context events
   */
  bindCanvasEvents() {
    // Pointer down
    this.canvas.addEventListener("pointerdown", (event) => {
      this.handlePointerDown(event);
    });

    // Pointer move
    this.canvas.addEventListener("pointermove", (event) => {
      this.handlePointerMove(event);
    });

    // Pointer up
    this.canvas.addEventListener("pointerup", (event) => {
      this.handlePointerUp(event);
    });

    // Pointer cancel
    this.canvas.addEventListener("pointercancel", (event) => {
      this.handlePointerCancel(event);
    });

    // Pointer leave
    this.canvas.addEventListener("pointerleave", () => {
      this.renderer.clearOverlay();
    });

    // Wheel zoom
    this.canvasWrap.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const zoomDelta = event.deltaY < 0 ? ZOOM_CONFIG.STEP_MULTIPLIER : ZOOM_CONFIG.ZOOM_OUT_MULTIPLIER;
        this.applyZoom(state.zoomLevel * zoomDelta, event.clientX, event.clientY);
      },
      { passive: false }
    );

    // Context menu prevention
    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  /**
   * Handle pointer down event
   */
  handlePointerDown(event) {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (event.pointerType === "touch") {
      // Two fingers always enter navigation mode on touch devices.
      if (state.activePointers.size === 2) {
        state.touchGestureMode = "twoFingerNav";
        this.toolManager.cancelActiveTool();
        this.beginTwoFingerNavigation();
        return;
      }

      if (state.activePointers.size > 1) {
        return;
      }

      const now = performance.now();
      const lastTap = state.lastTouchTap;
      if (
        lastTap &&
        now - lastTap.time <= TOUCH_TAP_MAX_MS &&
        getPointDistance(lastTap, { x: event.clientX, y: event.clientY }) <= TOUCH_DOUBLE_TAP_MAX_DISTANCE_PX
      ) {
        state.lastTouchTap = null;
        state.touchTapCandidate = null;
        state.touchGestureMode = "idle";
        this.toolManager.cancelActiveTool();
        this.handleColorPicker(event);
        return;
      }

      state.touchTapCandidate = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: now,
        moved: false
      };
      state.touchGestureMode = "drawing";
    }

    // Middle mouse button or Shift+Click = drag pan
    if (event.pointerType !== "touch" && (event.button === 1 || event.shiftKey)) {
      this.startDragPan(event);
      return;
    }

    // Right mouse button = color picker
    if (event.pointerType !== "touch" && event.button === 2) {
      this.handleColorPicker(event);
      return;
    }

    // Ignore non-primary buttons on non-touch
    if (event.pointerType !== "touch" && event.button !== 0) {
      return;
    }

    // Delegate to tool manager
    const { x, y } = canvasToBoardCoordinates(this.canvas, event, state.zoomLevel);
    this.toolManager.handleToolPointerDown(x, y, event);
  }

  /**
   * Handle pointer move event
   */
  handlePointerMove(event) {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    // Update active pointers
    if (state.activePointers.has(event.pointerId)) {
      state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (
      event.pointerType === "touch" &&
      state.touchTapCandidate &&
      state.touchTapCandidate.pointerId === event.pointerId
    ) {
      const movedDistance = getPointDistance(
        { x: state.touchTapCandidate.startX, y: state.touchTapCandidate.startY },
        { x: event.clientX, y: event.clientY }
      );
      if (movedDistance > TOUCH_TAP_MAX_MOVE_PX) {
        state.touchTapCandidate.moved = true;
      }
    }

    // Pinch zoom
    if (state.activePointers.size >= 2) {
      this.handlePinchZoom(event);
      return;
    }

    // Drag pan
    if (state.dragPanActive) {
      this.continueDragPan(event);
      return;
    }

    // Delegate to tool manager
    const { x, y } = canvasToBoardCoordinates(this.canvas, event, state.zoomLevel);
    this.toolManager.handleToolPointerMove(x, y, event);
  }

  /**
   * Handle pointer up event
   */
  async handlePointerUp(event) {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    if (
      event.pointerType === "touch" &&
      state.touchTapCandidate &&
      state.touchTapCandidate.pointerId === event.pointerId
    ) {
      const tapDuration = performance.now() - state.touchTapCandidate.startTime;
      if (!state.touchTapCandidate.moved && tapDuration <= TOUCH_TAP_MAX_MS) {
        state.lastTouchTap = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now()
        };
      }
      state.touchTapCandidate = null;
    }

    state.activePointers.delete(event.pointerId);

    // End pinch
    if (state.activePointers.size < 2) {
      state.pinchDistanceStart = 0;
      state.pinchMidpointLast = null;
      if (event.pointerType === "touch" && state.touchGestureMode === "twoFingerNav") {
        state.touchGestureMode = "idle";
      }
    }

    // End drag pan
    if (state.dragPanActive && (event.pointerType !== "touch" || state.activePointers.size < 2)) {
      state.dragPanActive = false;
      this.canvasWrap.classList.remove("panning");
    }

    if (event.pointerType === "touch" && state.touchGestureMode !== "drawing") {
      return;
    }

    if (event.pointerType === "touch") {
      state.touchGestureMode = "idle";
    }

    // Delegate to tool manager
    const { x, y } = canvasToBoardCoordinates(this.canvas, event, state.zoomLevel);
    await this.toolManager.handleToolPointerUp(x, y, event);
  }

  /**
   * Handle pointer cancel
   */
  handlePointerCancel(event) {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    state.activePointers.delete(event.pointerId);
    if (event.pointerType === "touch") {
      state.touchTapCandidate = null;
      state.touchGestureMode = "idle";
    }

    if (state.dragPanActive) {
      state.dragPanActive = false;
      this.canvasWrap.classList.remove("panning");
    }

    if (state.activePointers.size < 2) {
      state.pinchDistanceStart = 0;
      state.pinchMidpointLast = null;
    }

    // Delegate to tool manager for cleanup
    this.toolManager.cancelActiveTool();
  }

  /**
   * Start drag pan
   */
  startDragPan(event) {
    state.dragPanActive = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartScrollLeft = this.canvasWrap.scrollLeft;
    this.dragStartScrollTop = this.canvasWrap.scrollTop;
    this.canvasWrap.classList.add("panning");
  }

  /**
   * Continue drag pan
   */
  continueDragPan(event) {
    this.canvasWrap.scrollLeft = this.dragStartScrollLeft - (event.clientX - this.dragStartX);
    this.canvasWrap.scrollTop = this.dragStartScrollTop - (event.clientY - this.dragStartY);
    this.clampScrollBounds();
  }

  /**
   * Initialize two-finger touch navigation
   */
  beginTwoFingerNavigation() {
    const pointers = Array.from(state.activePointers.values());
    if (pointers.length < 2) return;

    state.dragPanActive = true;
    this.canvasWrap.classList.add("panning");
    state.pinchDistanceStart = getPointDistance(pointers[0], pointers[1]);
    state.pinchZoomStart = state.zoomLevel;
    state.pinchMidpointLast = getPointMidpoint(pointers[0], pointers[1]);
  }

  /**
   * Handle pinch zoom
   */
  handlePinchZoom(event) {
    const pointers = Array.from(state.activePointers.values());
    if (pointers.length < 2) return;

    const distance = getPointDistance(pointers[0], pointers[1]);
    const midpoint = getPointMidpoint(pointers[0], pointers[1]);

    if (state.pinchDistanceStart === 0) {
      state.pinchDistanceStart = distance;
      state.pinchZoomStart = state.zoomLevel;
      state.pinchMidpointLast = midpoint;
    } else {
      const nextZoom = state.pinchZoomStart * (distance / state.pinchDistanceStart);
      this.applyZoom(nextZoom, midpoint.x, midpoint.y);
      this.canvasWrap.scrollLeft -= midpoint.x - state.pinchMidpointLast.x;
      this.canvasWrap.scrollTop -= midpoint.y - state.pinchMidpointLast.y;
      this.clampScrollBounds();
      state.pinchMidpointLast = midpoint;
    }
  }

  /**
   * Handle color picker (right-click)
   */
  handleColorPicker(event) {
    if (SPECTATOR_MODE) return;

    const { x, y } = canvasToBoardCoordinates(this.canvas, event, state.zoomLevel);
    const color = state.getPixelAt(x, y);
    state.setColor(color);
    this.emitNotice(`Color picked: ${color}`, true);
  }

  /**
   * Apply zoom
   */
  applyZoom(newZoom, originClientX, originClientY) {
    const clampedZoom = clamp(newZoom, ZOOM_CONFIG.MIN, ZOOM_CONFIG.MAX);
    const rect = this.canvasWrap.getBoundingClientRect();
    const originX = originClientX - rect.left + this.canvasWrap.scrollLeft;
    const originY = originClientY - rect.top + this.canvasWrap.scrollTop;
    const worldX = originX / state.zoomLevel;
    const worldY = originY / state.zoomLevel;

    state.zoomLevel = clampedZoom;
    this.renderer.applyZoom(clampedZoom);

    this.canvasWrap.scrollLeft = worldX * clampedZoom - (originClientX - rect.left);
    this.canvasWrap.scrollTop = worldY * clampedZoom - (originClientY - rect.top);
    this.clampScrollBounds();

    state.emit("zoomChanged", { zoom: clampedZoom });
  }

  /**
   * Clamp scroll bounds
   */
  clampScrollBounds() {
    this.canvasWrap.scrollLeft = clamp(
      this.canvasWrap.scrollLeft,
      0,
      Math.max(0, this.canvasWrap.scrollWidth - this.canvasWrap.clientWidth)
    );
    this.canvasWrap.scrollTop = clamp(
      this.canvasWrap.scrollTop,
      0,
      Math.max(0, this.canvasWrap.scrollHeight - this.canvasWrap.clientHeight)
    );
  }

  /**
   * Bind keyboard events
   */
  bindKeyboardEvents() {
    window.addEventListener("keydown", (event) => {
      const keyLower = event.key.toLowerCase();

      // Skip if focused on form field
      if (this.isFormFieldFocused()) return;

      // Undo (Ctrl+Z, Cmd+Z)
      if ((event.ctrlKey || event.metaKey) && keyLower === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          this.toolManager.performRedo();
        } else {
          this.toolManager.performUndo();
        }
        return;
      }

      // Redo (Ctrl+Shift+Z, Ctrl+Y, Cmd variants)
      if ((event.ctrlKey || event.metaKey) && (keyLower === "y" || (event.shiftKey && keyLower === "z"))) {
        event.preventDefault();
        this.toolManager.performRedo();
        return;
      }

      // Escape
      if (keyLower === "escape") {
        event.preventDefault();
        state.helpVisible = false;
        this.toolManager.cancelActiveTool();
        return;
      }

      if (event.repeat) return;

      const key = event.key;

      // Number keys 1-9 for palette
      if (key >= "1" && key <= "9") {
        event.preventDefault();
        this.toolManager.selectPaletteColor(Number(key) - 1);
        return;
      }

      // Zoom shortcuts
      if (key === "+" || key === "=") {
        event.preventDefault();
        this.zoomFromCenter(state.zoomLevel * ZOOM_CONFIG.STEP_MULTIPLIER);
        return;
      }

      if (key === "-" || key === "_") {
        event.preventDefault();
        this.zoomFromCenter(state.zoomLevel * ZOOM_CONFIG.ZOOM_OUT_MULTIPLIER);
        return;
      }

      if (key === "0") {
        event.preventDefault();
        this.zoomFromCenter(1);
        return;
      }

      // Arrow keys for panning
      if (key === "ArrowLeft") {
        event.preventDefault();
        this.applyKeyboardPan(-PAN_STEP_PX, 0);
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        this.applyKeyboardPan(PAN_STEP_PX, 0);
        return;
      }
      if (key === "ArrowUp") {
        event.preventDefault();
        this.applyKeyboardPan(0, -PAN_STEP_PX);
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        this.applyKeyboardPan(0, PAN_STEP_PX);
        return;
      }

      // Grid toggle (G)
      if (keyLower === "g") {
        event.preventDefault();
        state.gridEnabled = !state.gridEnabled;
        state.savePreferences();
        this.renderer.render();
        return;
      }

      // Tool shortcuts (P, B, E, S, I, L, F, T)
      this.toolManager.handleToolShortcut(keyLower);

      // Brush size ([ and ])
      if (keyLower === "[") {
        event.preventDefault();
        state.brushSize = clamp(state.brushSize - 1, 1, 5);
        state.savePreferences();
        state.emit("brushSizeChanged", { size: state.brushSize });
        return;
      }

      if (keyLower === "]") {
        event.preventDefault();
        state.brushSize = clamp(state.brushSize + 1, 1, 5);
        state.savePreferences();
        state.emit("brushSizeChanged", { size: state.brushSize });
        return;
      }

      // Export (E)
      if (keyLower === "x") {
        event.preventDefault();
        this.renderer.exportPNG();
        this.emitNotice("PNG exported", true);
        return;
      }

      // Help (?)
      if (keyLower === "?") {
        event.preventDefault();
        state.helpVisible = !state.helpVisible;
        state.emit("helpToggled", { visible: state.helpVisible });
        return;
      }

      // Copy spectator link (S)
      if (keyLower === "shift+s" || (event.shiftKey && keyLower === "s")) {
        event.preventDefault();
        this.copySpectatorLink();
        return;
      }
    });
  }

  /**
   * Bind UI component events
   */
  bindUIEvents() {
    // These are delegated to component managers
    // We emit state changes and let components listen
  }

  /**
   * Apply keyboard pan
   */
  applyKeyboardPan(deltaX, deltaY) {
    this.canvasWrap.scrollLeft += deltaX;
    this.canvasWrap.scrollTop += deltaY;
    this.clampScrollBounds();
  }

  /**
   * Zoom from center
   */
  zoomFromCenter(newZoom) {
    const centerX = this.canvasWrap.clientWidth / 2;
    const centerY = this.canvasWrap.clientHeight / 2;
    this.applyZoom(newZoom, centerX, centerY);
  }

  /**
   * Check if focused on form field
   */
  isFormFieldFocused() {
    const focused = document.activeElement;
    return (
      focused &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(focused.tagName)
    );
  }

  /**
   * Update cooldown badge (stub for now)
   */
  /**
   * Emit notice
   */
  emitNotice(message, ok = false) {
    state.emit("notice", { message, ok });
  }

  /**
   * Copy spectator link
   */
  async copySpectatorLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "spectator");
    const spectatorUrl = url.toString();

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(spectatorUrl);
      this.emitNotice("Spectator link copied", true);
    } catch (_error) {
      this.emitNotice(`Spectator link: ${spectatorUrl}`);
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    clearInterval(this.cooldownInterval);
  }
}

export default EventManager;
