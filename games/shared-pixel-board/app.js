import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
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

const BOARD_SIZE = 100;
const PIXEL_SIZE = 8;
const DEFAULT_COLOR = "#111827";
const COLOR_PATTERN = /^#[0-9A-F]{6}$/;
const SPECTATOR_MODE = new URLSearchParams(window.location.search).get("mode") === "spectator";
const PAN_STEP_PX = 100;
const FILL_PIXEL_CAP = 480;
const TOOLS = {
  PIXEL: "pixel",
  BRUSH: "brush",
  LINE: "line",
  FILL: "fill"
};
const PALETTE_COLORS = [
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
const STORAGE_KEYS = {
  lastPlacementAt: "sharedPixelLastPlacementAt",
  selectedColor: "sharedPixelSelectedColor",
  activeTool: "sharedPixelActiveTool",
  brushSize: "sharedPixelBrushSize",
  gridEnabled: "sharedPixelGridEnabled"
};

const firebaseConfig = {
  apiKey: "AIzaSyBhOspsUxX9f_ylCQrNDPfS40yeNykgvj8",
  authDomain: "project-6657144175400685165.firebaseapp.com",
  databaseURL: "https://project-6657144175400685165-default-rtdb.firebaseio.com",
  projectId: "project-6657144175400685165",
  storageBucket: "project-6657144175400685165.firebasestorage.app",
  messagingSenderId: "604138773261",
  appId: "1:604138773261:web:162f7ab4984c7a27d5ae44",
  measurementId: "G-P3RN62EDSJ"
};

const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const colorPicker = document.getElementById("colorPicker");
const currentColorSwatch = document.getElementById("currentColorSwatch");
const gridToggle = document.getElementById("gridToggle");
const connectionStatus = document.getElementById("connectionStatus");
const modeStatus = document.getElementById("modeStatus");
const toolStatus = document.getElementById("toolStatus");
const syncStatus = document.getElementById("syncStatus");
const cooldownStatus = document.getElementById("cooldownStatus");
const userCount = document.getElementById("userCount");
const boardStamp = document.getElementById("boardStamp");
const hoverStatus = document.getElementById("hoverStatus");
const sessionStats = document.getElementById("sessionStats");
const historyStatus = document.getElementById("historyStatus");
const reconnectBanner = document.getElementById("reconnectBanner");
const noticeBox = document.getElementById("noticeBox");
const canvasWrap = document.querySelector(".canvas-wrap");
const exportPng = document.getElementById("exportPng");
const copySpectatorLink = document.getElementById("copySpectatorLink");
const toggleHelp = document.getElementById("toggleHelp");
const closeHelp = document.getElementById("closeHelp");
const undoAction = document.getElementById("undoAction");
const redoAction = document.getElementById("redoAction");
const helpPanel = document.getElementById("helpPanel");
const paletteButtons = Array.from(document.querySelectorAll("[data-palette-color]"));
const toolSelect = document.getElementById("toolSelect");
const brushSizeField = document.getElementById("brushSizeField");
const brushSizeSelect = document.getElementById("brushSize");
const fillCapValue = document.getElementById("fillCapValue");
const mobilePixel = document.getElementById("mobilePixel");
const mobileBrush = document.getElementById("mobileBrush");
const mobileLine = document.getElementById("mobileLine");
const mobileFill = document.getElementById("mobileFill");
const mobileUndo = document.getElementById("mobileUndo");
const mobileHelp = document.getElementById("mobileHelp");
const mobilePan = document.getElementById("mobilePan");
const overlayCanvas = document.getElementById("overlayCanvas");
const overlayCtx = overlayCanvas.getContext("2d");
const zoomStatus = document.getElementById("zoomStatus");

const pixelCache = new Map();
const sessionId = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
let selectedColor = "#FF4D4D";
const cooldownMs = 30000;
let lastPlacementAt = Number(localStorage.getItem(STORAGE_KEYS.lastPlacementAt) || 0);
let db = null;
let writeInFlight = false;
let zoomLevel = 1;
let dragPanActive = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartScrollLeft = 0;
let dragStartScrollTop = 0;
const activePointers = new Map();
let pinchDistanceStart = 0;
let pinchZoomStart = 1;
let pinchMidpointLast = null;
let isConnected = false;
let pendingWriteStartedAt = 0;
let lastAckMs = null;
let activeTool = TOOLS.PIXEL;
let brushSize = Number(brushSizeSelect?.value || 2);
let lineStartPoint = null;
let brushStrokeActive = false;
let brushLastPoint = null;
const brushStrokeCells = new Set();
let helpVisible = false;
let touchPanMode = false;
const actionHistory = [];
const redoHistory = [];
const MAX_HISTORY = 40;

const stats = {
  placements: 0,
  blockedCooldown: 0,
  blockedNoop: 0
};

canvas.width = BOARD_SIZE * PIXEL_SIZE;
canvas.height = BOARD_SIZE * PIXEL_SIZE;

function renderSessionStats() {
  sessionStats.textContent = `session: ok ${stats.placements} | cd ${stats.blockedCooldown} | noop ${stats.blockedNoop}`;
}

function renderHistoryStatus() {
  historyStatus.textContent = `history: ${actionHistory.length} | redo: ${redoHistory.length}`;
  undoAction.disabled = actionHistory.length === 0 || SPECTATOR_MODE || writeInFlight;
  redoAction.disabled = redoHistory.length === 0 || SPECTATOR_MODE || writeInFlight;
  mobileUndo.disabled = actionHistory.length === 0 || SPECTATOR_MODE || writeInFlight;
}

function renderSyncStatus() {
  syncStatus.classList.remove("sync-live", "sync-pending", "sync-offline");

  if (!isConnected) {
    syncStatus.textContent = "sync: offline";
    syncStatus.classList.add("sync-offline");
    return;
  }

  if (writeInFlight || pendingWriteStartedAt > 0) {
    syncStatus.textContent = "sync: syncing";
    syncStatus.classList.add("sync-pending");
    return;
  }

  if (typeof lastAckMs === "number") {
    syncStatus.textContent = `sync: live ${lastAckMs}ms`;
  } else {
    syncStatus.textContent = "sync: live";
  }
  syncStatus.classList.add("sync-live");
}

function renderZoomStatus() {
  zoomStatus.textContent = `zoom: ${Math.round(zoomLevel * 100)}%`;
}

function clearOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function renderLinePreview(cursorX, cursorY) {
  clearOverlay();
  if (activeTool !== TOOLS.LINE || !lineStartPoint || !validCoordinates(cursorX, cursorY)) {
    return;
  }

  const cells = buildLineCells(lineStartPoint.x, lineStartPoint.y, cursorX, cursorY);

  overlayCtx.globalAlpha = 0.75;
  overlayCtx.fillStyle = "#ffffff";
  overlayCtx.fillRect(
    lineStartPoint.x * PIXEL_SIZE,
    lineStartPoint.y * PIXEL_SIZE,
    PIXEL_SIZE,
    PIXEL_SIZE
  );

  overlayCtx.globalAlpha = 0.55;
  overlayCtx.fillStyle = selectedColor;
  for (const cell of cells) {
    overlayCtx.fillRect(cell.x * PIXEL_SIZE, cell.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }

  overlayCtx.globalAlpha = 1.0;
}

function renderBrushPreview(x, y) {
  clearOverlay();
  if (activeTool !== TOOLS.BRUSH || brushStrokeActive || !validCoordinates(x, y)) {
    return;
  }
  const cells = buildBrushStamp(x, y);
  overlayCtx.globalAlpha = 0.5;
  overlayCtx.fillStyle = selectedColor;
  for (const cell of cells) {
    if (validCoordinates(cell.x, cell.y)) {
      overlayCtx.fillRect(cell.x * PIXEL_SIZE, cell.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
  overlayCtx.globalAlpha = 1.0;
}

function updateCanvasCursor() {
  canvas.classList.remove("tool-pixel", "tool-brush", "tool-line", "tool-fill", "line-anchored");
  canvas.classList.add(`tool-${activeTool}`);
  if (activeTool === TOOLS.LINE && lineStartPoint) {
    canvas.classList.add("line-anchored");
  }
}

function setTouchPanMode(enabled) {
  touchPanMode = enabled;
  mobilePan.setAttribute("aria-pressed", String(enabled));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampScrollBounds() {
  canvasWrap.scrollLeft = clamp(canvasWrap.scrollLeft, 0, Math.max(0, canvasWrap.scrollWidth - canvasWrap.clientWidth));
  canvasWrap.scrollTop = clamp(canvasWrap.scrollTop, 0, Math.max(0, canvasWrap.scrollHeight - canvasWrap.clientHeight));
}

function applyZoom(newZoom, originClientX, originClientY) {
  const clampedZoom = clamp(newZoom, 0.5, 4);
  const rect = canvasWrap.getBoundingClientRect();
  const originX = originClientX - rect.left + canvasWrap.scrollLeft;
  const originY = originClientY - rect.top + canvasWrap.scrollTop;
  const worldX = originX / zoomLevel;
  const worldY = originY / zoomLevel;

  zoomLevel = clampedZoom;
  canvas.style.width = `${canvas.width * zoomLevel}px`;
  canvas.style.height = `${canvas.height * zoomLevel}px`;

  canvasWrap.scrollLeft = worldX * zoomLevel - (originClientX - rect.left);
  canvasWrap.scrollTop = worldY * zoomLevel - (originClientY - rect.top);
  clampScrollBounds();
  renderZoomStatus();
}

function getPointerDistance(pointerA, pointerB) {
  const dx = pointerA.x - pointerB.x;
  const dy = pointerA.y - pointerB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPointerMidpoint(pointerA, pointerB) {
  return {
    x: (pointerA.x + pointerB.x) / 2,
    y: (pointerA.y + pointerB.y) / 2
  };
}

function drawBaseBoard() {
  ctx.fillStyle = DEFAULT_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function drawGrid() {
  if (!gridToggle.checked) {
    return;
  }

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= BOARD_SIZE; i += 1) {
    const pos = i * PIXEL_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function redrawFromCache() {
  ctx.fillStyle = DEFAULT_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  pixelCache.forEach((color, key) => {
    const [x, y] = key.split("_").map(Number);
    drawPixel(x, y, color);
  });

  drawGrid();
}

function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

function makeCellKey(x, y) {
  return `${x}_${y}`;
}

function parseCellKey(key) {
  const [x, y] = key.split("_").map(Number);
  return { x, y };
}

function getPixelColorAt(x, y) {
  return pixelCache.get(makeCellKey(x, y)) || DEFAULT_COLOR;
}

function setNotice(message, ok = false) {
  noticeBox.textContent = message;
  noticeBox.classList.toggle("ok", ok);
}

function pushHistoryEntry(entry) {
  actionHistory.push(entry);
  if (actionHistory.length > MAX_HISTORY) {
    actionHistory.shift();
  }
  redoHistory.length = 0;
  renderHistoryStatus();
}

function setActiveTool(nextTool) {
  if (!Object.values(TOOLS).includes(nextTool)) {
    return;
  }

  activeTool = nextTool;
  toolSelect.value = nextTool;
  if (nextTool === TOOLS.LINE && lineStartPoint) {
    toolStatus.textContent = `tool: ${nextTool} (anchored)`;
  } else {
    toolStatus.textContent = `tool: ${nextTool}`;
  }
  toolStatus.classList.add("tool-active");
  brushSizeField.classList.toggle("disabled", nextTool !== TOOLS.BRUSH);
  brushSizeSelect.disabled = nextTool !== TOOLS.BRUSH;
  localStorage.setItem(STORAGE_KEYS.activeTool, nextTool);

  if (nextTool !== TOOLS.LINE) {
    lineStartPoint = null;
  }
  clearOverlay();
  updateCanvasCursor();
}

function syncCurrentColor(color) {
  selectedColor = color.toUpperCase();
  colorPicker.value = selectedColor;
  localStorage.setItem(STORAGE_KEYS.selectedColor, selectedColor);
  currentColorSwatch.style.background = selectedColor;
  currentColorSwatch.textContent = selectedColor;
  paletteButtons.forEach((button) => {
    const buttonColor = String(button.dataset.paletteColor || "").toUpperCase();
    button.classList.toggle("active", buttonColor === selectedColor);
  });
}

function updateCooldownBadge() {
  if (SPECTATOR_MODE) {
    cooldownStatus.textContent = "spectator";
    return;
  }

  const remainingMs = lastPlacementAt + cooldownMs - Date.now();
  if (remainingMs <= 0) {
    cooldownStatus.textContent = "ready";
    return;
  }

  cooldownStatus.textContent = `cooldown: ${(remainingMs / 1000).toFixed(1)}s`;
}

function checkPlacementPrerequisites() {
  if (!db) {
    setNotice("Firebase is not configured.");
    return false;
  }

  if (SPECTATOR_MODE) {
    setNotice("Spectator mode: painting disabled.");
    return false;
  }

  if (writeInFlight) {
    setNotice("Write queued: wait for current placement.");
    return false;
  }

  if (!COLOR_PATTERN.test(selectedColor)) {
    setNotice("Invalid color format. Use #RRGGBB.");
    return false;
  }

  const now = Date.now();
  if (now - lastPlacementAt < cooldownMs) {
    stats.blockedCooldown += 1;
    renderSessionStats();
    setNotice("Cooldown active.");
    updateCooldownBadge();
    return false;
  }

  return true;
}

function normalizeCells(cells) {
  const unique = new Set();
  for (const cell of cells) {
    if (!validCoordinates(cell.x, cell.y)) {
      continue;
    }
    unique.add(makeCellKey(cell.x, cell.y));
  }
  return unique;
}

function buildLineCells(startX, startY, endX, endY) {
  const cells = [];
  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({ x, y });
    if (x === endX && y === endY) {
      break;
    }
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return cells;
}

function buildBrushStamp(centerX, centerY) {
  const radius = Math.max(0, Math.floor((brushSize - 1) / 2));
  const cells = [];
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      cells.push({ x, y });
    }
  }
  return cells;
}

function buildFillCells(startX, startY) {
  const startColor = getPixelColorAt(startX, startY).toUpperCase();
  if (startColor === selectedColor) {
    return { cells: [], capped: false };
  }

  const queue = [{ x: startX, y: startY }];
  const visited = new Set([makeCellKey(startX, startY)]);
  const filled = [];
  let queueIndex = 0;
  let capped = false;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    if (getPixelColorAt(current.x, current.y).toUpperCase() !== startColor) {
      continue;
    }

    filled.push(current);
    if (filled.length >= FILL_PIXEL_CAP) {
      capped = true;
      break;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const next of neighbors) {
      if (!validCoordinates(next.x, next.y)) {
        continue;
      }
      const key = makeCellKey(next.x, next.y);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push(next);
    }
  }

  return { cells: filled, capped };
}

async function placeCells(cells, options = {}) {
  if (!checkPlacementPrerequisites()) {
    return;
  }

  const normalized = normalizeCells(cells);
  const changed = [];
  const previousColors = new Map();
  for (const key of normalized) {
    if (pixelCache.get(key) === selectedColor) {
      continue;
    }
    changed.push(key);
    previousColors.set(key, pixelCache.get(key) || DEFAULT_COLOR);
  }

  if (changed.length === 0) {
    stats.blockedNoop += 1;
    renderSessionStats();
    setNotice("No-op blocked: all targeted pixels already match.");
    return;
  }

  try {
    writeInFlight = true;
    pendingWriteStartedAt = Date.now();
    renderSyncStatus();
    lastPlacementAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.lastPlacementAt, String(lastPlacementAt));
    updateCooldownBadge();

    const updates = {
      "meta/lastUpdated": serverTimestamp(),
      "meta/lastEditor": sessionId
    };

    for (const key of changed) {
      updates[`pixels/${key}`] = selectedColor;
    }

    await update(ref(db), updates);
    stats.placements += 1;
    renderSessionStats();

    if (!options.fromHistory) {
      pushHistoryEntry({
        actionLabel: options.actionLabel || "Placement",
        changes: changed.map((key) => ({
          key,
          prev: previousColors.get(key) || DEFAULT_COLOR,
          next: selectedColor
        }))
      });
    }

    const actionLabel = options.actionLabel || "Placement";
    const countText = changed.length > 1 ? ` (${changed.length} px)` : "";
    setNotice(`${actionLabel} accepted${countText}.`, true);
  } catch (error) {
    setNotice(`Write failed: ${error.message}`);
  } finally {
    writeInFlight = false;
    renderHistoryStatus();
    renderSyncStatus();
  }
}

async function applyHistoryChanges(changes, actionLabel) {
  if (!checkPlacementPrerequisites()) {
    return false;
  }

  if (!changes.length) {
    return false;
  }

  try {
    writeInFlight = true;
    pendingWriteStartedAt = Date.now();
    renderSyncStatus();
    lastPlacementAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.lastPlacementAt, String(lastPlacementAt));
    updateCooldownBadge();

    const updates = {
      "meta/lastUpdated": serverTimestamp(),
      "meta/lastEditor": sessionId
    };

    for (const change of changes) {
      updates[`pixels/${change.key}`] = change.next;
    }

    await update(ref(db), updates);
    stats.placements += 1;
    renderSessionStats();
    setNotice(`${actionLabel} applied (${changes.length} px).`, true);
    return true;
  } catch (error) {
    setNotice(`History action failed: ${error.message}`);
    return false;
  } finally {
    writeInFlight = false;
    renderHistoryStatus();
    renderSyncStatus();
  }
}

async function performUndo() {
  if (SPECTATOR_MODE || actionHistory.length === 0) {
    return;
  }

  const entry = actionHistory[actionHistory.length - 1];
  const inverse = entry.changes.map((change) => ({
    key: change.key,
    prev: change.next,
    next: change.prev
  }));

  const applied = await applyHistoryChanges(inverse, `Undo ${entry.actionLabel}`);
  if (!applied) {
    return;
  }

  actionHistory.pop();
  redoHistory.push(entry);
  renderHistoryStatus();
}

async function performRedo() {
  if (SPECTATOR_MODE || redoHistory.length === 0) {
    return;
  }

  const entry = redoHistory[redoHistory.length - 1];
  const applied = await applyHistoryChanges(entry.changes, `Redo ${entry.actionLabel}`);
  if (!applied) {
    return;
  }

  redoHistory.pop();
  actionHistory.push(entry);
  renderHistoryStatus();
}

function isFormFieldFocused() {
  const focused = document.activeElement;
  if (!focused) {
    return false;
  }

  const tag = focused.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || focused.isContentEditable;
}

function applyKeyboardPan(dx, dy) {
  canvasWrap.scrollLeft += dx;
  canvasWrap.scrollTop += dy;
  clampScrollBounds();
}

function zoomFromCenter(nextZoom) {
  const rect = canvasWrap.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  applyZoom(nextZoom, centerX, centerY);
}

function setPaletteButtonSwatches() {
  paletteButtons.forEach((button, index) => {
    const fallbackColor = PALETTE_COLORS[index] || "#FF4D4D";
    const color = String(button.dataset.paletteColor || fallbackColor).toUpperCase();
    button.dataset.paletteColor = color;
    button.style.background = color;
    button.style.borderColor = color === "#F5F5F5" ? "#b69763" : "rgba(17, 10, 6, 0.55)";
  });
}

function exportCanvasPng() {
  try {
    const link = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = canvas.toDataURL("image/png");
    link.download = `shared-pixel-board-${BOARD_SIZE}x${BOARD_SIZE}-${stamp}.png`;
    link.click();
    setNotice("PNG exported.", true);
  } catch (error) {
    setNotice(`Export failed: ${error.message}`);
  }
}

function setHelpVisible(visible) {
  helpVisible = visible;
  helpPanel.hidden = !visible;
}

function cancelActiveGesture() {
  let cancelled = false;
  if (lineStartPoint) {
    lineStartPoint = null;
    clearOverlay();
    cancelled = true;
  }
  if (brushStrokeActive) {
    cancelBrushStroke();
    cancelled = true;
  }
  if (cancelled) {
    setActiveTool(activeTool);
    setNotice("Active tool gesture cancelled.");
  }
}

function applySavedPreferences() {
  const savedColor = String(localStorage.getItem(STORAGE_KEYS.selectedColor) || "").toUpperCase();
  if (COLOR_PATTERN.test(savedColor)) {
    colorPicker.value = savedColor;
  }

  const savedBrushSize = Number(localStorage.getItem(STORAGE_KEYS.brushSize) || "");
  if (Number.isFinite(savedBrushSize)) {
    brushSize = clamp(savedBrushSize, 1, 5);
    brushSizeSelect.value = String(brushSize);
  }

  const savedGridEnabled = localStorage.getItem(STORAGE_KEYS.gridEnabled);
  if (savedGridEnabled === "1" || savedGridEnabled === "0") {
    gridToggle.checked = savedGridEnabled === "1";
  }

  const savedTool = String(localStorage.getItem(STORAGE_KEYS.activeTool) || "");
  if (Object.values(TOOLS).includes(savedTool)) {
    activeTool = savedTool;
  }
}

function buildSpectatorUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("mode", "spectator");
  return url.toString();
}

async function copySpectatorUrl() {
  const spectatorUrl = buildSpectatorUrl();
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Clipboard API unavailable");
    }
    await navigator.clipboard.writeText(spectatorUrl);
    setNotice("Spectator link copied.", true);
  } catch (_error) {
    setNotice(`Spectator link: ${spectatorUrl}`);
  }
}

function applyModeUI() {
  if (!SPECTATOR_MODE) {
    modeStatus.textContent = "mode: paint";
    return;
  }

  modeStatus.textContent = "mode: spectator";
  modeStatus.classList.add("spectator");
  colorPicker.disabled = true;
  toolSelect.disabled = true;
  brushSizeSelect.disabled = true;
  brushSizeField.classList.add("disabled");
  paletteButtons.forEach((button) => {
    button.disabled = true;
  });
  mobilePixel.disabled = true;
  mobileBrush.disabled = true;
  mobileLine.disabled = true;
  mobileFill.disabled = true;
  copySpectatorLink.disabled = false;
  undoAction.disabled = true;
  redoAction.disabled = true;
  mobileUndo.disabled = true;
  setNotice("Spectator mode enabled. Live updates active, painting disabled.", true);
}

function bindHotkeys() {
  window.addEventListener("keydown", (event) => {
    const keyLower = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && keyLower === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        performRedo();
      } else {
        performUndo();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && keyLower === "y") {
      event.preventDefault();
      performRedo();
      return;
    }

    if (keyLower === "escape") {
      if (helpVisible) {
        setHelpVisible(false);
        event.preventDefault();
        return;
      }
      cancelActiveGesture();
      event.preventDefault();
      return;
    }

    if (event.repeat || isFormFieldFocused()) {
      return;
    }

    const key = event.key;

    if (key >= "1" && key <= "9") {
      const index = Number(key) - 1;
      const color = PALETTE_COLORS[index];
      if (color && !SPECTATOR_MODE) {
        syncCurrentColor(color);
      }
      event.preventDefault();
      return;
    }

    if (key === "+" || key === "=") {
      zoomFromCenter(zoomLevel * 1.12);
      event.preventDefault();
      return;
    }

    if (key === "-" || key === "_") {
      zoomFromCenter(zoomLevel * 0.89);
      event.preventDefault();
      return;
    }

    if (key === "0") {
      zoomFromCenter(1);
      event.preventDefault();
      return;
    }

    if (key === "ArrowLeft") {
      applyKeyboardPan(-PAN_STEP_PX, 0);
      event.preventDefault();
      return;
    }

    if (key === "ArrowRight") {
      applyKeyboardPan(PAN_STEP_PX, 0);
      event.preventDefault();
      return;
    }

    if (key === "ArrowUp") {
      applyKeyboardPan(0, -PAN_STEP_PX);
      event.preventDefault();
      return;
    }

    if (key === "ArrowDown") {
      applyKeyboardPan(0, PAN_STEP_PX);
      event.preventDefault();
      return;
    }

    if (key.toLowerCase() === "g") {
      gridToggle.checked = !gridToggle.checked;
      redrawFromCache();
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key.toLowerCase() === "p") {
      setActiveTool(TOOLS.PIXEL);
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key.toLowerCase() === "b") {
      setActiveTool(TOOLS.BRUSH);
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key.toLowerCase() === "l") {
      setActiveTool(TOOLS.LINE);
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key.toLowerCase() === "f") {
      setActiveTool(TOOLS.FILL);
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key === "[") {
      brushSize = clamp(brushSize - 1, 1, 5);
      brushSizeSelect.value = String(brushSize);
      localStorage.setItem(STORAGE_KEYS.brushSize, String(brushSize));
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && key === "]") {
      brushSize = clamp(brushSize + 1, 1, 5);
      brushSizeSelect.value = String(brushSize);
      localStorage.setItem(STORAGE_KEYS.brushSize, String(brushSize));
      event.preventDefault();
      return;
    }

    if (key.toLowerCase() === "e") {
      exportCanvasPng();
      event.preventDefault();
      return;
    }

    if (keyLower === "?" || (event.key === "/" && event.shiftKey)) {
      setHelpVisible(!helpVisible);
      event.preventDefault();
      return;
    }

    if (keyLower === "s") {
      copySpectatorUrl();
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && keyLower === "u") {
      performUndo();
      event.preventDefault();
      return;
    }

    if (!SPECTATOR_MODE && keyLower === "r") {
      performRedo();
      event.preventDefault();
    }
  });
}

function canvasToBoardCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const eventX = event.clientX ?? (event.touches && event.touches[0] ? event.touches[0].clientX : null);
  const eventY = event.clientY ?? (event.touches && event.touches[0] ? event.touches[0].clientY : null);
  if (eventX === null || eventY === null) {
    return { x: -1, y: -1 };
  }

  const x = Math.floor((eventX - rect.left) * scaleX / PIXEL_SIZE);
  const y = Math.floor((eventY - rect.top) * scaleY / PIXEL_SIZE);
  return { x, y };
}

function validCoordinates(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

async function placePixel(x, y) {
  if (!validCoordinates(x, y)) {
    return;
  }
  await placeCells([{ x, y }], { actionLabel: "Placement" });
}

function accumulateBrushCells(fromPoint, toPoint) {
  const path = buildLineCells(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
  for (const point of path) {
    const stamp = buildBrushStamp(point.x, point.y);
    for (const cell of stamp) {
      if (!validCoordinates(cell.x, cell.y)) {
        continue;
      }
      brushStrokeCells.add(makeCellKey(cell.x, cell.y));
    }
  }
}

function startBrushStroke(x, y) {
  brushStrokeActive = true;
  brushStrokeCells.clear();
  brushLastPoint = { x, y };
  accumulateBrushCells(brushLastPoint, brushLastPoint);
}

function continueBrushStroke(x, y) {
  if (!brushStrokeActive || !brushLastPoint) {
    return;
  }
  const nextPoint = { x, y };
  accumulateBrushCells(brushLastPoint, nextPoint);
  brushLastPoint = nextPoint;
}

async function commitBrushStroke() {
  if (!brushStrokeActive) {
    return;
  }

  brushStrokeActive = false;
  brushLastPoint = null;
  const cells = Array.from(brushStrokeCells).map(parseCellKey);
  brushStrokeCells.clear();
  if (cells.length === 0) {
    return;
  }

  await placeCells(cells, { actionLabel: "Brush stroke" });
}

function cancelBrushStroke() {
  brushStrokeActive = false;
  brushLastPoint = null;
  brushStrokeCells.clear();
}

async function handleToolPlacement(x, y) {
  if (!validCoordinates(x, y)) {
    return;
  }

  if (activeTool === TOOLS.PIXEL) {
    await placePixel(x, y);
    return;
  }

  if (activeTool === TOOLS.FILL) {
    const fillResult = buildFillCells(x, y);
    await placeCells(fillResult.cells, { actionLabel: "Fill" });
    if (fillResult.capped && fillResult.cells.length > 0) {
      setNotice(`Fill capped at ${FILL_PIXEL_CAP} pixels.`, true);
    }
    return;
  }

  if (activeTool === TOOLS.LINE) {
    if (!lineStartPoint) {
      lineStartPoint = { x, y };
      setActiveTool(activeTool);
      setNotice(`Line anchor set at ${x},${y}. Click destination.`, true);
      return;
    }

    const cells = buildLineCells(lineStartPoint.x, lineStartPoint.y, x, y);
    lineStartPoint = null;
    updateCanvasCursor();
    clearOverlay();
    await placeCells(cells, { actionLabel: "Line" });
  }
}

function bindUI() {
  colorPicker.addEventListener("input", (event) => {
    syncCurrentColor(event.target.value);
  });

  paletteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (SPECTATOR_MODE) {
        return;
      }

      const color = String(button.dataset.paletteColor || "").toUpperCase();
      if (COLOR_PATTERN.test(color)) {
        syncCurrentColor(color);
      }
    });
  });

  exportPng.addEventListener("click", exportCanvasPng);
  copySpectatorLink.addEventListener("click", copySpectatorUrl);
  toggleHelp.addEventListener("click", () => setHelpVisible(true));
  closeHelp.addEventListener("click", () => setHelpVisible(false));
  closeHelp.addEventListener("pointerup", (event) => {
    event.preventDefault();
    setHelpVisible(false);
  });
  helpPanel.addEventListener("click", (event) => {
    if (event.target === helpPanel) {
      setHelpVisible(false);
    }
  });
  undoAction.addEventListener("click", performUndo);
  redoAction.addEventListener("click", performRedo);
  mobilePixel.addEventListener("click", () => setActiveTool(TOOLS.PIXEL));
  mobileBrush.addEventListener("click", () => setActiveTool(TOOLS.BRUSH));
  mobileLine.addEventListener("click", () => setActiveTool(TOOLS.LINE));
  mobileFill.addEventListener("click", () => setActiveTool(TOOLS.FILL));
  mobileUndo.addEventListener("click", performUndo);
  mobileHelp.addEventListener("click", () => setHelpVisible(true));
  mobilePan.addEventListener("click", () => setTouchPanMode(!touchPanMode));

  toolSelect.addEventListener("change", (event) => {
    setActiveTool(event.target.value);
  });

  brushSizeSelect.addEventListener("change", (event) => {
    const parsed = Number(event.target.value);
    brushSize = clamp(Number.isFinite(parsed) ? parsed : 2, 1, 5);
    brushSizeSelect.value = String(brushSize);
    localStorage.setItem(STORAGE_KEYS.brushSize, String(brushSize));
  });

  gridToggle.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.gridEnabled, gridToggle.checked ? "1" : "0");
    redrawFromCache();
  });

  canvasWrap.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY < 0 ? 1.12 : 0.89;
    applyZoom(zoomLevel * zoomDelta, event.clientX, event.clientY);
  }, { passive: false });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  canvas.addEventListener("pointerdown", (event) => {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Cancel drag-pan if a second touch arrives (transition to pinch)
    if (event.pointerType === "touch" && activePointers.size > 1 && dragPanActive) {
      dragPanActive = false;
      canvasWrap.classList.remove("panning");
    }

    if (event.pointerType !== "touch" && (event.button === 1 || event.shiftKey)) {
      dragPanActive = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartScrollLeft = canvasWrap.scrollLeft;
      dragStartScrollTop = canvasWrap.scrollTop;
      canvasWrap.classList.add("panning");
      return;
    }

    if (event.pointerType !== "touch" && event.button === 2) {
      if (!SPECTATOR_MODE) {
        const { x: ex, y: ey } = canvasToBoardCoordinates(event);
        if (validCoordinates(ex, ey)) {
          const picked = getPixelColorAt(ex, ey);
          syncCurrentColor(picked);
          setNotice(`Color picked: ${picked}.`, true);
        }
      }
      return;
    }

    if (event.pointerType !== "touch" && event.button !== 0) {
      return;
    }

    if (event.pointerType === "touch" && touchPanMode && activePointers.size === 1) {
      dragPanActive = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartScrollLeft = canvasWrap.scrollLeft;
      dragStartScrollTop = canvasWrap.scrollTop;
      canvasWrap.classList.add("panning");
      return;
    }

    const { x, y } = canvasToBoardCoordinates(event);
    if (!validCoordinates(x, y)) {
      return;
    }

    if (activeTool === TOOLS.BRUSH) {
      startBrushStroke(x, y);
      return;
    }

    if (event.pointerType !== "touch") {
      handleToolPlacement(x, y);
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (activePointers.size === 2) {
      if (brushStrokeActive) {
        cancelBrushStroke();
      }
      const pointers = Array.from(activePointers.values());
      const distance = getPointerDistance(pointers[0], pointers[1]);
      const midpoint = getPointerMidpoint(pointers[0], pointers[1]);

      if (pinchDistanceStart === 0) {
        pinchDistanceStart = distance;
        pinchZoomStart = zoomLevel;
        pinchMidpointLast = midpoint;
      } else {
        const nextZoom = pinchZoomStart * (distance / pinchDistanceStart);
        applyZoom(nextZoom, midpoint.x, midpoint.y);
        canvasWrap.scrollLeft -= midpoint.x - pinchMidpointLast.x;
        canvasWrap.scrollTop -= midpoint.y - pinchMidpointLast.y;
        clampScrollBounds();
        pinchMidpointLast = midpoint;
      }
    }

    if (dragPanActive) {
      canvasWrap.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
      canvasWrap.scrollTop = dragStartScrollTop - (event.clientY - dragStartY);
      clampScrollBounds();
      return;
    }

    const { x, y } = canvasToBoardCoordinates(event);
    if (brushStrokeActive && activePointers.size === 1 && validCoordinates(x, y)) {
      continueBrushStroke(x, y);
    }

    if (activePointers.size > 1) {
      hoverStatus.textContent = "hover: -";
      return;
    }

    if (!validCoordinates(x, y)) {
      hoverStatus.textContent = "hover: -";
      clearOverlay();
      return;
    }

    const key = `${x}_${y}`;
    const existingColor = pixelCache.get(key) || DEFAULT_COLOR;
    hoverStatus.textContent = `hover: ${x},${y} ${existingColor}`;
    if (activeTool === TOOLS.LINE) {
      renderLinePreview(x, y);
    } else if (activeTool === TOOLS.BRUSH) {
      renderBrushPreview(x, y);
    } else {
      clearOverlay();
    }
  });

  canvas.addEventListener("pointerleave", () => {
    hoverStatus.textContent = "hover: -";
    clearOverlay();
  });

  canvas.addEventListener("pointerup", async (event) => {
    activePointers.delete(event.pointerId);

    if (brushStrokeActive && activePointers.size <= 1) {
      await commitBrushStroke();
    }

    if (event.pointerType === "touch" && activePointers.size === 0 && pinchDistanceStart === 0 && !touchPanMode) {
      const { x, y } = canvasToBoardCoordinates(event);
      await handleToolPlacement(x, y);
    }

    if (activePointers.size < 2) {
      pinchDistanceStart = 0;
      pinchMidpointLast = null;
    }

    if (dragPanActive) {
      dragPanActive = false;
      canvasWrap.classList.remove("panning");
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    activePointers.delete(event.pointerId);
    if (brushStrokeActive) {
      cancelBrushStroke();
    }
    if (activePointers.size < 2) {
      pinchDistanceStart = 0;
      pinchMidpointLast = null;
    }

    if (dragPanActive) {
      dragPanActive = false;
      canvasWrap.classList.remove("panning");
    }
  });

  setInterval(updateCooldownBadge, 120);
}

function wireDatabaseListeners() {
  const pixelsRef = ref(db, "pixels");

  onChildAdded(pixelsRef, (snap) => {
    const key = snap.key;
    const color = String(snap.val() || "").toUpperCase();
    if (!COLOR_PATTERN.test(color) || !key.includes("_")) {
      return;
    }

    pixelCache.set(key, color);
    const { x, y } = parseCellKey(key);
    if (validCoordinates(x, y)) {
      drawPixel(x, y, color);
      if (gridToggle.checked) {
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.strokeRect(x * PIXEL_SIZE + 0.5, y * PIXEL_SIZE + 0.5, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  });

  onChildChanged(pixelsRef, (snap) => {
    const key = snap.key;
    const color = String(snap.val() || "").toUpperCase();
    if (!COLOR_PATTERN.test(color) || !key.includes("_")) {
      return;
    }

    pixelCache.set(key, color);
    const { x, y } = parseCellKey(key);
    if (validCoordinates(x, y)) {
      drawPixel(x, y, color);
      if (gridToggle.checked) {
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.strokeRect(x * PIXEL_SIZE + 0.5, y * PIXEL_SIZE + 0.5, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  });

  onValue(ref(db, ".info/connected"), (snap) => {
    const connected = Boolean(snap.val());
    isConnected = connected;
    connectionStatus.textContent = connected ? "online" : "offline";
    connectionStatus.classList.toggle("online", connected);
    connectionStatus.classList.toggle("offline", !connected);
    reconnectBanner.classList.toggle("active", !connected);
    renderSyncStatus();
  });

  onValue(ref(db, "presence"), (snap) => {
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    userCount.textContent = `users: ${count}`;
  });

  onValue(ref(db, "meta/lastUpdated"), (snap) => {
    if (!snap.exists()) {
      boardStamp.textContent = "last update: -";
      return;
    }

    const value = Number(snap.val());
    const when = Number.isFinite(value) ? new Date(value) : new Date();
    boardStamp.textContent = `last update: ${when.toLocaleTimeString()}`;
    if (pendingWriteStartedAt > 0) {
      lastAckMs = clamp(Date.now() - pendingWriteStartedAt, 0, 5000);
      pendingWriteStartedAt = 0;
      renderSyncStatus();
    }
  });
}

async function initPresence() {
  const presenceRef = ref(db, `presence/${sessionId}`);
  await set(presenceRef, { at: serverTimestamp() });
  onDisconnect(presenceRef).remove();

  window.addEventListener("beforeunload", async () => {
    try {
      await remove(presenceRef);
    } catch (_error) {
      // Ignore unload cleanup failures.
    }
  });
}

function firebaseConfigured() {
  return Object.values(firebaseConfig).every((value) => String(value || "").trim().length > 0);
}

async function boot() {
  setHelpVisible(false);
  applySavedPreferences();
  renderSessionStats();
  renderHistoryStatus();
  renderSyncStatus();
  renderZoomStatus();
  setPaletteButtonSwatches();
  setActiveTool(activeTool);
  fillCapValue.textContent = `${FILL_PIXEL_CAP} px (locked)`;
  drawBaseBoard();
  syncCurrentColor(colorPicker.value);
  bindUI();
  bindHotkeys();
  applyModeUI();
  updateCooldownBadge();

  if (!firebaseConfigured()) {
    setNotice("Firebase config placeholders detected. Fill app.js with real project values.");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    if (await analyticsIsSupported()) {
      getAnalytics(app);
    }
    db = getDatabase(app);
    wireDatabaseListeners();
    await initPresence();
    setNotice("Live board active. Last-write-wins enabled.", true);
  } catch (error) {
    setNotice(`Firebase init failed: ${error.message}`);
  }
}

boot();
