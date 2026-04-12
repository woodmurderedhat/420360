## Summary

Noctis Reverie is a self-contained, offline-capable HTML5/CSS3/JavaScript generative-art PWA that runs in any modern browser straight from static files. There is **no** Node.js, npm, bundler, or build step. Simply host the folder on GitHub Pages (or any static server) and enjoy a modular system of renderers, asset management, audio, and UI—extensible by dropping in new SVGs or by writing new modules.

---

## 1. Folder Structure

```
/noctis-reverie/  
│  
├─ index.html               ← root HTML  
├─ manifest.json            ← PWA metadata  
├─ service-worker.js        ← offline caching logic  
├─ styles.css               ← all CSS  
│  
├─ /modules/                ← ES6 modules, no build necessary  
│   ├─ EventBus.js          ← pub/sub for loose coupling  
│   ├─ AssetManager.js      ← loads SVGs, JSON, audio via fetch  
│   ├─ GraphicsContext.js   ← chooses Canvas2D or WebGL  
│   ├─ CanvasRenderer.js    ← draws shapes/particles on 2D canvas  
│   ├─ WebGLRenderer.js     ← optional high-performance shaders  
│   ├─ AudioManager.js      ← loops & filters via Web Audio API  
│   ├─ ControlsPanel.js     ← “Start”/“Regenerate” UI controls  
│   └─ CreditsModal.js      ← info overlay  
│  
├─ /assets/                  ← static assets, all same-origin  
│   ├─ /vectors/            ← drop any .svg here; auto-discovered  
│   ├─ /auto/               ← runtime-generated art (in memory)  
│   └─ /audio/              ← .ogg or .mp3 tracks for loops  
│  
└─ /data/                    ← optional JSON presets  
    └─ shapes.json  
```

---

## 2. How It Runs

1. **Open** `index.html` in a browser (or push to GitHub Pages).
2. The page loads CSS and registers the service worker.
3. The root script `<script type="module" src="./modules/main.js">` dynamically imports required modules.
4. `AssetManager` scans `/assets/vectors/` via `fetch('./assets/vectors/')` (served directory listing enabled) or a hard-coded list in `shapes.json`.
5. Upon “Start” click (or immediately on load), the chosen renderer’s `start()` begins the animation loop.
6. All assets (SVGs, audio) and code are fetched over the same origin, so **no CORS** issues and everything is cached by the service worker for offline use.

---

## 3. Core Modules & Interfaces

### 3.1 AssetManager.js

```js
export class AssetManager {
  constructor() { this.svgList = []; this.audioBuffers = {}; }
  async init() {
    // Option A: fetch('./data/shapes.json') with an array of filenames
    // Option B: rely on your webserver's directory listing to fetch SVGs
  }
  async loadSVG(name) { /* fetch and parse SVG */ }
  registerSVG(file) { /* read File object via FileReader */ }
  async loadAudio(name) { /* fetch and decode with AudioContext */ }
}
```

### 3.2 GraphicsContext.js

```js
export class GraphicsContext {
  constructor(canvas) {
    this.ctx2d = canvas.getContext('2d');
    // or: this.gl = canvas.getContext('webgl2');
  }
  clear() { this.ctx2d.clearRect(0,0,canvas.width,canvas.height); }
  // drawPath, drawImage, etc., abstracted here
}
```

### 3.3 Renderers (CanvasRenderer.js / WebGLRenderer.js)

Each implements:

```js
export class CanvasRenderer {
  constructor(ctx, assets) { /* store graphics context + SVGs */ }
  start() { /* requestAnimationFrame loop */ }
  stop()  { /* cancelAnimationFrame */ }
  update(dt) { /* animate shapes, particles */ }
}
```

### 3.4 AudioManager.js

```js
export class AudioManager {
  constructor() { this.ctx = new AudioContext(); }
  async loadLoop(name) { /* fetch & decode into buffer */ }
  play(id) { /* createBufferSource, loop=true */ }
  stopAll() { /* stop all sources */ }
  setFilter(node) { /* connect BiquadFilterNode or DelayNode */ }
}
```

### 3.5 UI Modules

* **ControlsPanel.js** registers click handlers on simple `<button>` elements in `index.html`.
* **CreditsModal.js** toggles a `<dialog>` or `<div>` overlay with ARIA labels.

---

## 4. Offline-First Setup

### 4.1 manifest.json

```json
{
  "name": "Noctis Reverie",
  "short_name": "Reverie",
  "start_url": "./index.html",
  "display": "standalone",
  "icons": [ /* paths to 192x192, 512x512 .png in /assets */ ]
}
```

### 4.2 service-worker.js

```js
const CACHE = 'reverie-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './modules/EventBus.js',
  // … list all module files and asset files
];
self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(r => r || fetch(evt.request)));
});
```

Because everything (HTML, JS modules, CSS, SVGs, audio) is served from the same folder, the service worker can cache and serve it offline without any cross-origin concerns.

---

## 5. Extending With More Art

* **Static SVGs:** Simply add new `.svg` files into `/assets/vectors/` and—if you use `shapes.json`—add their filenames there. On next load they will be available to the renderer.
* **Runtime Upload:** Use an `<input type="file" multiple accept=".svg">` and call `AssetManager.registerSVG(file)` to inject user-provided vectors into the scene.
* **Programmatic Art:** Engines can emit custom SVG paths or WebGL shaders at runtime and register them in the same asset lists.

---

## 6. No Build Step, No Dependencies

* No package.json, no npm, no webpack/rollup, no transpilation.
* Modern browsers natively support ES6 modules (`<script type="module">`) and the Fetch, Cache, ServiceWorker, and Audio APIs.
* You just clone or download the folder into your static host (GitHub Pages, Surge, Netlify’s drag-and-drop, etc.) and it works.

