/**
 * Pixel Glitch Background Engine
 *
 * Loads the arcade banner image and corrupts pixels based on mouse movement.
 * Corruption is permanent until page reload.
 *
 * Features:
 * - Full-screen canvas background
 * - Mouse-driven pixel corruption of real image pixels
 * - Extreme glitch intensity (tears, displacement, channel shears)
 * - Persistent damage (no auto-restore)
 * - Responsive to viewport size
 */

class PixelGlitchEngine {
  constructor(canvasId, imageUrl) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.imageUrl = imageUrl;
    this.image = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isInitialized = false;

    // Glitch parameters tuned for subtle full-image distortion
    this.glitchRadius = 0;
    this.glitchIntensity = 0.08;
    this.maxDisplacement = 3;
    this.scanLineHeight = 1;

    // Throttle mouse events to keep full-canvas processing lightweight
    this.lastGlitchTime = 0;
    this.glitchThrottle = 80;

    this.effectCooldowns = {
      move: 80,
      click: 140,
      scrollUp: 130,
      scrollDown: 130,
      ambient: 900
    };
    this.lastEffectAt = {
      move: 0,
      click: 0,
      scrollUp: 0,
      scrollDown: 0,
      ambient: 0
    };
    this.isProcessing = false;
    this.pendingEffect = null;

    this.initPromise = null;
  }

  start() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init();
    return this.initPromise;
  }

  async init() {
    try {
      // Set canvas to full viewport size
      this.resizeCanvas();

      // Load image
      await this.loadImage();

      // Draw initial image
      this.drawImage();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('Pixel Glitch Engine initialized');
    } catch (error) {
      console.error('Failed to initialize Pixel Glitch Engine:', error);
    }
  }

  loadImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.image = img;
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${this.imageUrl}`));
      };
      img.src = this.imageUrl;
    });
  }

  drawImage() {
    if (!this.image || !this.ctx) return;

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const imageW = this.image.naturalWidth || this.image.width;
    const imageH = this.image.naturalHeight || this.image.height;

    const scale = Math.max(canvasW / imageW, canvasH / imageH);
    const drawW = imageW * scale;
    const drawH = imageH * scale;
    const offsetX = (canvasW - drawW) * 0.5;
    const offsetY = (canvasH - drawH) * 0.5;

    this.ctx.clearRect(0, 0, canvasW, canvasH);
    this.ctx.drawImage(this.image, offsetX, offsetY, drawW, drawH);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onMouseMove(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Throttle glitch application
    const now = performance.now();
    if (now - this.lastGlitchTime >= this.glitchThrottle) {
      this.triggerMove();
      this.lastGlitchTime = now;
    }
  }

  onWindowResize() {
    this.resizeCanvas();
    this.drawImage();
  }

  triggerMove() {
    this.queueEffect('move');
    if (Math.random() < 0.08) this.queueEffect('ambient');
  }

  triggerClickTear() {
    this.queueEffect('click');
  }

  triggerScrollUp() {
    this.queueEffect('scrollUp');
  }

  triggerScrollDown() {
    this.queueEffect('scrollDown');
  }

  queueEffect(effectType) {
    if (!this.ctx || !this.isInitialized) return;

    const now = performance.now();
    const cooldown = this.effectCooldowns[effectType] || 0;
    if (now - (this.lastEffectAt[effectType] || 0) < cooldown) return;
    this.lastEffectAt[effectType] = now;

    if (this.isProcessing) {
      this.pendingEffect = effectType;
      return;
    }

    this.isProcessing = true;
    requestAnimationFrame(() => this.processEffect(effectType));
  }

  processEffect(effectType) {
    if (!this.ctx) {
      this.isProcessing = false;
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;
    const region = this.ctx.getImageData(0, 0, width, height);
    const data = region.data;
    const source = new Uint8ClampedArray(data);

    switch (effectType) {
      case 'move':
        this.applyMoveProfile(data, source, width, height);
        break;
      case 'click':
        this.applyClickProfile(data, source, width, height);
        break;
      case 'scrollUp':
        this.applyScrollUpProfile(data, source, width, height);
        break;
      case 'scrollDown':
        this.applyScrollDownProfile(data, source, width, height);
        break;
      case 'ambient':
        this.applyAmbientProfile(data, source, width, height);
        break;
      default:
        this.applyMoveProfile(data, source, width, height);
        break;
    }

    this.ctx.putImageData(region, 0, 0);
    this.isProcessing = false;

    if (this.pendingEffect) {
      const queued = this.pendingEffect;
      this.pendingEffect = null;
      this.queueEffect(queued);
    }
  }

  applyGlitch() {
    this.queueEffect('move');
  }

  applyMoveProfile(data, source, width, height) {
    this.glitchDisplacePixels(data, source, width, height, 0.08, 3);
    this.glitchScanlineShear(data, source, width, height, 1 + this.randInt(0, 2), 7);
    if (Math.random() < 0.18) {
      this.glitchChromaBands(data, source, width, height, this.randInt(-2, 2), this.randInt(-1, 1), 2);
    }
  }

  applyClickProfile(data, source, width, height) {
    this.glitchDigitalTearExpand(data, source, width, height);
    this.glitchBlockTears(data, source, width, height, 6 + this.randInt(0, 6));
    this.glitchScanlineShear(data, source, width, height, 4 + this.randInt(0, 3), 18);

    if (Math.random() < 0.8) {
      this.glitchChromaBands(data, source, width, height, this.randInt(-5, 5), this.randInt(-2, 2), 4);
    }
    if (Math.random() < 0.5) {
      this.glitchLumaDropout(data, width, height, 1 + this.randInt(0, 2), 18, 48);
    }
  }

  applyScrollUpProfile(data, source, width, height) {
    this.glitchFrameSlip(data, source, width, height, -1);
    this.glitchScanlineShear(data, source, width, height, 3 + this.randInt(0, 3), 16);
    this.glitchVerticalScratches(data, width, height, 2 + this.randInt(0, 2));
    if (Math.random() < 0.7) {
      this.glitchChromaBands(data, source, width, height, this.randInt(-3, -1), this.randInt(-2, 0), 3);
    }
  }

  applyScrollDownProfile(data, source, width, height) {
    this.glitchFrameSlip(data, source, width, height, 1);
    this.glitchLumaDropout(data, width, height, 2 + this.randInt(0, 2), 22, 64);
    this.glitchPixelateChunks(data, source, width, height, 8 + this.randInt(0, 6), 8, 22);
    if (Math.random() < 0.7) {
      this.glitchChromaBands(data, source, width, height, this.randInt(1, 4), this.randInt(0, 2), 4);
    }
  }

  applyAmbientProfile(data, source, width, height) {
    const roll = Math.random();
    if (roll < 0.33) {
      this.glitchFrameSlip(data, source, width, height, this.randInt(-1, 1) || 1);
      this.glitchScanlineShear(data, source, width, height, 2 + this.randInt(0, 2), 12);
      return;
    }
    if (roll < 0.66) {
      this.glitchPixelateChunks(data, source, width, height, 6 + this.randInt(0, 6), 6, 16);
      this.glitchLumaDropout(data, width, height, 1 + this.randInt(0, 2), 14, 36);
      return;
    }
    this.glitchChromaBands(data, source, width, height, this.randInt(-4, 4), this.randInt(-2, 2), 5);
    this.glitchVerticalScratches(data, width, height, 1 + this.randInt(0, 2));
  }

  glitchDisplacePixels(data, source, width, height, intensity = this.glitchIntensity, maxDisplacement = this.maxDisplacement) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.random() > intensity) continue;

        const sx = this.clamp(x + this.randInt(-maxDisplacement, maxDisplacement), 0, width - 1);
        const sy = this.clamp(y + this.randInt(-maxDisplacement, maxDisplacement), 0, height - 1);

        const targetIdx = (y * width + x) * 4;
        const srcIdxBase = (sy * width + sx) * 4;

        // Sample true nearby pixels, then split channels for chromatic corruption.
        const rIdx = this.channelOffset(srcIdxBase, width, height, source, 0, this.randInt(-1, 1), this.randInt(-1, 1));
        const gIdx = this.channelOffset(srcIdxBase, width, height, source, 1, this.randInt(-1, 1), this.randInt(-1, 1));
        const bIdx = this.channelOffset(srcIdxBase, width, height, source, 2, this.randInt(-2, 2), this.randInt(-1, 1));

        data[targetIdx] = source[rIdx];
        data[targetIdx + 1] = source[gIdx];
        data[targetIdx + 2] = source[bIdx];
        data[targetIdx + 3] = 255;
      }
    }
  }

  glitchBlockTears(data, source, width, height, tearCount = 10 + this.randInt(0, 8)) {

    for (let t = 0; t < tearCount; t++) {
      const blockW = this.randInt(8, 42);
      const blockH = this.randInt(6, 24);
      const srcX = this.randInt(0, Math.max(0, width - blockW));
      const srcY = this.randInt(0, Math.max(0, height - blockH));
      const shiftX = this.randInt(-64, 64);
      const shiftY = this.randInt(-20, 20);

      for (let by = 0; by < blockH; by++) {
        const rowSrcY = srcY + by;
        const rowDstY = this.clamp(rowSrcY + shiftY, 0, height - 1);

        for (let bx = 0; bx < blockW; bx++) {
          const rowSrcX = srcX + bx;
          const rowDstX = this.clamp(rowSrcX + shiftX, 0, width - 1);

          const rowJitterX = this.randInt(-2, 2);
          const srcIdx = (rowSrcY * width + this.clamp(rowSrcX + rowJitterX, 0, width - 1)) * 4;
          const dstIdx = (rowDstY * width + rowDstX) * 4;

          data[dstIdx] = source[srcIdx];
          data[dstIdx + 1] = source[srcIdx + 1];
          data[dstIdx + 2] = source[srcIdx + 2];
          data[dstIdx + 3] = 255;
        }
      }
    }
  }

  glitchDigitalTearExpand(data, source, width, height) {
    const srcW = this.randInt(18, Math.max(20, Math.floor(width * 0.12)));
    const srcH = this.randInt(10, Math.max(12, Math.floor(height * 0.08)));
    const srcX = this.randInt(0, Math.max(0, width - srcW));
    const srcY = this.randInt(0, Math.max(0, height - srcH));

    const scaleX = 1.4 + Math.random() * 1.8;
    const scaleY = 0.85 + Math.random() * 0.55;
    const dstW = this.clamp(Math.floor(srcW * scaleX), 12, width);
    const dstH = this.clamp(Math.floor(srcH * scaleY), 8, height);
    const dstX = this.randInt(0, Math.max(0, width - dstW));
    const dstY = this.randInt(0, Math.max(0, height - dstH));

    for (let y = 0; y < dstH; y++) {
      const edgeNoise = this.randInt(-2, 2);
      const yRatio = dstH <= 1 ? 0 : y / (dstH - 1);
      const sy = this.clamp(srcY + Math.floor(yRatio * (srcH - 1)), 0, height - 1);

      for (let x = 0; x < dstW; x++) {
        if (x < 2 || x > dstW - 3) {
          if (Math.random() < 0.4) continue;
        }

        const xRatio = dstW <= 1 ? 0 : x / (dstW - 1);
        const sx = this.clamp(srcX + Math.floor(xRatio * (srcW - 1)) + edgeNoise, 0, width - 1);

        const dstIdx = ((dstY + y) * width + (dstX + x)) * 4;
        const srcBase = (sy * width + sx) * 4;

        data[dstIdx] = source[this.channelOffset(srcBase, width, height, source, 0, this.randInt(-2, 2), this.randInt(-1, 1))];
        data[dstIdx + 1] = source[this.channelOffset(srcBase, width, height, source, 1, this.randInt(-1, 1), this.randInt(-1, 1))];
        data[dstIdx + 2] = source[this.channelOffset(srcBase, width, height, source, 2, this.randInt(-3, 3), this.randInt(-1, 1))];
        data[dstIdx + 3] = 255;
      }
    }
  }

  glitchScanlineShear(data, source, width, height, lineCount = 1 + this.randInt(0, 2), maxShift = 6) {

    for (let l = 0; l < lineCount; l++) {
      const y = this.randInt(0, height - 1);
      const shift = this.randInt(-maxShift, maxShift);

      for (let dy = 0; dy < this.scanLineHeight; dy++) {
        const lineY = this.clamp(y + dy, 0, height - 1);
        for (let x = 0; x < width; x++) {
          const sx = this.clamp(x + shift, 0, width - 1);
          const srcIdx = (lineY * width + sx) * 4;
          const dstIdx = (lineY * width + x) * 4;

          data[dstIdx] = source[srcIdx];
          data[dstIdx + 1] = source[srcIdx + 1];
          data[dstIdx + 2] = source[srcIdx + 2];
          data[dstIdx + 3] = 255;
        }
      }
    }
  }

  glitchPixelateChunks(data, source, width, height, chunkCount = 12 + this.randInt(0, 16), minSize = 5, maxSize = 18) {

    for (let c = 0; c < chunkCount; c++) {
      const chunkSize = this.randInt(minSize, maxSize);
      const startX = this.randInt(0, Math.max(0, width - chunkSize));
      const startY = this.randInt(0, Math.max(0, height - chunkSize));
      const sampleX = this.clamp(startX + this.randInt(-12, 12), 0, width - 1);
      const sampleY = this.clamp(startY + this.randInt(-12, 12), 0, height - 1);
      const sampleIdx = (sampleY * width + sampleX) * 4;

      const r = source[sampleIdx];
      const g = source[sampleIdx + 1];
      const b = source[sampleIdx + 2];

      for (let y = 0; y < chunkSize; y++) {
        for (let x = 0; x < chunkSize; x++) {
          const px = startX + x;
          const py = startY + y;
          const idx = (py * width + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  glitchFrameSlip(data, source, width, height, direction = 1) {
    const bandCount = 2 + this.randInt(0, 2);
    for (let b = 0; b < bandCount; b++) {
      const bandH = this.randInt(8, 42);
      const startY = this.randInt(0, Math.max(0, height - bandH));
      const shiftY = direction * this.randInt(6, 24);

      for (let y = 0; y < bandH; y++) {
        const sy = this.clamp(startY + y, 0, height - 1);
        const dy = this.clamp(sy + shiftY, 0, height - 1);

        for (let x = 0; x < width; x++) {
          const wobble = this.randInt(-2, 2);
          const sx = this.clamp(x + wobble, 0, width - 1);
          const srcIdx = (sy * width + sx) * 4;
          const dstIdx = (dy * width + x) * 4;

          data[dstIdx] = source[srcIdx];
          data[dstIdx + 1] = source[srcIdx + 1];
          data[dstIdx + 2] = source[srcIdx + 2];
          data[dstIdx + 3] = 255;
        }
      }
    }
  }

  glitchChromaBands(data, source, width, height, dx, dy, bandCount = 3) {
    for (let b = 0; b < bandCount; b++) {
      const bandY = this.randInt(0, height - 1);
      const bandH = this.randInt(2, 8);

      for (let y = 0; y < bandH; y++) {
        const py = this.clamp(bandY + y, 0, height - 1);
        for (let x = 0; x < width; x++) {
          const base = (py * width + x) * 4;
          const rIdx = this.channelOffset(base, width, height, source, 0, dx, dy);
          const gIdx = this.channelOffset(base, width, height, source, 1, Math.floor(dx * 0.5), dy);
          const bIdx = this.channelOffset(base, width, height, source, 2, -dx, -dy);
          data[base] = source[rIdx];
          data[base + 1] = source[gIdx];
          data[base + 2] = source[bIdx];
          data[base + 3] = 255;
        }
      }
    }
  }

  glitchLumaDropout(data, width, height, stripeCount = 2, minH = 16, maxH = 42) {
    for (let s = 0; s < stripeCount; s++) {
      const startY = this.randInt(0, height - 1);
      const stripeH = this.randInt(minH, maxH);
      const factor = 0.38 + Math.random() * 0.35;

      for (let y = 0; y < stripeH; y++) {
        const py = this.clamp(startY + y, 0, height - 1);
        for (let x = 0; x < width; x++) {
          const idx = (py * width + x) * 4;
          data[idx] = Math.floor(data[idx] * factor);
          data[idx + 1] = Math.floor(data[idx + 1] * factor);
          data[idx + 2] = Math.floor(data[idx + 2] * factor);
          data[idx + 3] = 255;
        }
      }
    }
  }

  glitchVerticalScratches(data, width, height, count = 2) {
    for (let s = 0; s < count; s++) {
      const x = this.randInt(0, width - 1);
      const thickness = this.randInt(1, 2);
      const brightness = 145 + this.randInt(0, 70);

      for (let y = 0; y < height; y++) {
        for (let dx = 0; dx < thickness; dx++) {
          const px = this.clamp(x + dx, 0, width - 1);
          const idx = (y * width + px) * 4;
          data[idx] = this.clamp(data[idx] + brightness * 0.17, 0, 255);
          data[idx + 1] = this.clamp(data[idx + 1] + brightness * 0.17, 0, 255);
          data[idx + 2] = this.clamp(data[idx + 2] + brightness * 0.12, 0, 255);
          data[idx + 3] = 255;
        }
      }
    }
  }

  channelOffset(baseIdx, width, height, source, channelOffset, dx, dy) {
    const pixel = baseIdx / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);

    const nx = this.clamp(x + dx, 0, width - 1);
    const ny = this.clamp(y + dy, 0, height - 1);

    return (ny * width + nx) * 4 + channelOffset;
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const imageUrl = 'assets/images/420360arcadebanner.png';
  const bootGlitchEngine = () => {
    if (window.glitchEngine) return;
    window.glitchEngine = new PixelGlitchEngine('glitch-bg', imageUrl);
    window.glitchEngine.start();
  };

  const firstInteractionEvents = ['mousemove', 'touchstart', 'keydown', 'wheel'];
  const onFirstInteraction = () => {
    firstInteractionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, onFirstInteraction, interactionOptions);
    });
    bootGlitchEngine();
  };
  const interactionOptions = { passive: true, once: true };

  firstInteractionEvents.forEach((eventName) => {
    window.addEventListener(eventName, onFirstInteraction, interactionOptions);
  });

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      bootGlitchEngine();
    }, { timeout: 2500 });
  } else {
    setTimeout(bootGlitchEngine, 2500);
  }
});
