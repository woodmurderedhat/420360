/**
 * pixel-board-source.js
 *
 * Fetches the shared pixel board state from Firebase (one-time snapshot) and
 * renders it onto an HTMLCanvasElement that the glitch engine can use as its
 * source image instead of the static banner PNG.
 */

const FIREBASE_BASE = 'https://www.gstatic.com/firebasejs/12.11.0/firebase-';

const BOARD_SIZE = 256;
const DEFAULT_FILL = '#111827';
const COLOR_PATTERN = /^#[0-9A-F]{6}$/i;
const FIREBASE_APP_NAME = 'glitch-bg-reader';

/**
 * Render a map of { "x_y": "#RRGGBB" } onto a new offscreen canvas and return it.
 * @param {Map|Object} pixels  - pixel data, iterable as entries
 * @returns {HTMLCanvasElement}
 */
function renderPixelsToCanvas(pixels) {
  const canvas = document.createElement('canvas');
  canvas.width = BOARD_SIZE;
  canvas.height = BOARD_SIZE;

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = DEFAULT_FILL;
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  const entries = pixels instanceof Map ? pixels.entries() : Object.entries(pixels);
  for (const [key, color] of entries) {
    if (!key.includes('_') || !COLOR_PATTERN.test(color)) continue;
    const parts = key.split('_');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  return canvas;
}

/**
 * Fetch the shared pixel board from Firebase and return a rendered canvas.
 *
 * @param {Object} firebaseConfig  - Firebase project config object
 * @param {Object} [options]
 * @param {number} [options.timeoutMs=5000]  - abort after this many ms
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function fetchPixelBoardCanvas(firebaseConfig, { timeoutMs = 5000 } = {}) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Pixel board fetch timed out')), timeoutMs)
  );

  const fetchPromise = (async () => {
    const [{ initializeApp, getApp }, { getDatabase, ref, get }] = await Promise.all([
      import(`${FIREBASE_BASE}app.js`),
      import(`${FIREBASE_BASE}database.js`)
    ]);

    // Reuse an existing Firebase app instance if one was already created under
    // our dedicated name, otherwise initialize a new one.
    let app;
    try {
      app = getApp(FIREBASE_APP_NAME);
    } catch {
      app = initializeApp(firebaseConfig, FIREBASE_APP_NAME);
    }

    const db = getDatabase(app);
    const snap = await get(ref(db, 'pixels'));
    const pixels = snap.exists() ? snap.val() : {};

    return renderPixelsToCanvas(pixels);
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}
