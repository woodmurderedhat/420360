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
const cooldownSelect = document.getElementById("cooldownSelect");
const gridToggle = document.getElementById("gridToggle");
const connectionStatus = document.getElementById("connectionStatus");
const cooldownStatus = document.getElementById("cooldownStatus");
const userCount = document.getElementById("userCount");
const boardStamp = document.getElementById("boardStamp");
const hoverStatus = document.getElementById("hoverStatus");
const sessionStats = document.getElementById("sessionStats");
const reconnectBanner = document.getElementById("reconnectBanner");
const noticeBox = document.getElementById("noticeBox");
const canvasWrap = document.querySelector(".canvas-wrap");

const pixelCache = new Map();
const sessionId = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
let selectedColor = "#FF4D4D";
let cooldownMs = Number(cooldownSelect.value);
let lastPlacementAt = Number(localStorage.getItem("sharedPixelLastPlacementAt") || 0);
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

function setNotice(message, ok = false) {
  noticeBox.textContent = message;
  noticeBox.classList.toggle("ok", ok);
}

function syncCurrentColor(color) {
  selectedColor = color.toUpperCase();
  currentColorSwatch.style.background = selectedColor;
  currentColorSwatch.textContent = selectedColor;
}

function updateCooldownBadge() {
  const remainingMs = lastPlacementAt + cooldownMs - Date.now();
  if (remainingMs <= 0) {
    cooldownStatus.textContent = "ready";
    return;
  }

  cooldownStatus.textContent = `cooldown: ${(remainingMs / 1000).toFixed(1)}s`;
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
  if (!db) {
    setNotice("Firebase is not configured.");
    return;
  }

  if (writeInFlight) {
    setNotice("Write queued: wait for current placement.");
    return;
  }

  if (!validCoordinates(x, y)) {
    return;
  }

  if (!COLOR_PATTERN.test(selectedColor)) {
    setNotice("Invalid color format. Use #RRGGBB.");
    return;
  }

  const key = `${x}_${y}`;
  if (pixelCache.get(key) === selectedColor) {
    stats.blockedNoop += 1;
    renderSessionStats();
    setNotice("No-op blocked: pixel already that color.");
    return;
  }

  const now = Date.now();
  if (now - lastPlacementAt < cooldownMs) {
    stats.blockedCooldown += 1;
    renderSessionStats();
    setNotice("Cooldown active.");
    updateCooldownBadge();
    return;
  }

  try {
    writeInFlight = true;
    lastPlacementAt = now;
    localStorage.setItem("sharedPixelLastPlacementAt", String(lastPlacementAt));
    updateCooldownBadge();

    const updates = {
      [`pixels/${key}`]: selectedColor,
      "meta/lastUpdated": serverTimestamp(),
      "meta/lastEditor": sessionId
    };

    await update(ref(db), updates);
    stats.placements += 1;
    renderSessionStats();
    setNotice("Placement accepted.", true);
  } catch (error) {
    setNotice(`Write failed: ${error.message}`);
  } finally {
    writeInFlight = false;
  }
}

function bindUI() {
  colorPicker.addEventListener("input", (event) => {
    syncCurrentColor(event.target.value);
  });

  cooldownSelect.addEventListener("change", (event) => {
    cooldownMs = Number(event.target.value);
    updateCooldownBadge();
  });

  gridToggle.addEventListener("change", redrawFromCache);

  canvasWrap.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY < 0 ? 1.12 : 0.89;
    applyZoom(zoomLevel * zoomDelta, event.clientX, event.clientY);
  }, { passive: false });

  canvas.addEventListener("pointerdown", (event) => {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (event.pointerType === "touch") {
      return;
    }

    if (event.button === 1 || event.shiftKey) {
      dragPanActive = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartScrollLeft = canvasWrap.scrollLeft;
      dragStartScrollTop = canvasWrap.scrollTop;
      canvasWrap.classList.add("panning");
      return;
    }

    if (event.button === 0) {
      const { x, y } = canvasToBoardCoordinates(event);
      placePixel(x, y);
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (activePointers.size === 2) {
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

    if (activePointers.size > 1) {
      hoverStatus.textContent = "hover: -";
      return;
    }

    const { x, y } = canvasToBoardCoordinates(event);
    if (!validCoordinates(x, y)) {
      hoverStatus.textContent = "hover: -";
      return;
    }

    const key = `${x}_${y}`;
    const existingColor = pixelCache.get(key) || DEFAULT_COLOR;
    hoverStatus.textContent = `hover: ${x},${y} ${existingColor}`;
  });

  canvas.addEventListener("pointerleave", () => {
    hoverStatus.textContent = "hover: -";
  });

  canvas.addEventListener("pointerup", (event) => {
    activePointers.delete(event.pointerId);

    if (event.pointerType === "touch" && activePointers.size === 0 && pinchDistanceStart === 0) {
      const { x, y } = canvasToBoardCoordinates(event);
      placePixel(x, y);
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
    const [x, y] = key.split("_").map(Number);
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
    const [x, y] = key.split("_").map(Number);
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
    connectionStatus.textContent = connected ? "online" : "offline";
    connectionStatus.classList.toggle("online", connected);
    connectionStatus.classList.toggle("offline", !connected);
    reconnectBanner.classList.toggle("active", !connected);
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
  renderSessionStats();
  drawBaseBoard();
  syncCurrentColor(colorPicker.value);
  bindUI();
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
