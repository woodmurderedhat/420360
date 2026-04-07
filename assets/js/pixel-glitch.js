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

    // Glitch parameters
      this.glitchRadius = 140;
      this.glitchIntensity = 0.95;
      this.maxDisplacement = 90;
      this.scanLineHeight = 2;

    // Throttle mouse events
    this.lastGlitchTime = 0;
      this.glitchThrottle = 16;

    this.init();
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
      this.applyGlitch();
      this.lastGlitchTime = now;
    }
  }

  onWindowResize() {
    this.resizeCanvas();
    this.drawImage();
  }

  applyGlitch() {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const radius = this.glitchRadius;

    const minX = Math.max(0, this.mouseX - radius);
    const maxX = Math.min(width - 1, this.mouseX + radius);
    const minY = Math.max(0, this.mouseY - radius);
    const maxY = Math.min(height - 1, this.mouseY + radius);

    const regionW = Math.max(1, maxX - minX + 1);
    const regionH = Math.max(1, maxY - minY + 1);

    const region = this.ctx.getImageData(minX, minY, regionW, regionH);
    const data = region.data;
    const source = new Uint8ClampedArray(data);

    this.glitchDisplacePixels(data, source, regionW, regionH);
    this.glitchBlockTears(data, source, regionW, regionH);
    this.glitchScanlineShear(data, source, regionW, regionH);
    this.glitchPixelateChunks(data, source, regionW, regionH);

    this.ctx.putImageData(region, minX, minY);
  }

  glitchDisplacePixels(data, source, width, height) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const radiusSq = (Math.min(width, height) * 0.48) ** 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) continue;

        const falloff = 1 - distSq / radiusSq;
        if (Math.random() > this.glitchIntensity * (0.35 + 0.65 * falloff)) continue;
        const disp = Math.max(1, Math.floor(this.maxDisplacement * falloff));
        const sx = this.clamp(x + this.randInt(-disp, disp), 0, width - 1);
        const sy = this.clamp(y + this.randInt(-disp, disp), 0, height - 1);

        const targetIdx = (y * width + x) * 4;
        const srcIdxBase = (sy * width + sx) * 4;

        // Sample true nearby pixels, then split channels for chromatic corruption.
        const rIdx = this.channelOffset(srcIdxBase, width, height, source, 0, this.randInt(-8, 8), this.randInt(-4, 4));
        const gIdx = this.channelOffset(srcIdxBase, width, height, source, 1, this.randInt(-6, 6), this.randInt(-3, 3));
        const bIdx = this.channelOffset(srcIdxBase, width, height, source, 2, this.randInt(-10, 10), this.randInt(-5, 5));

        data[targetIdx] = source[rIdx];
        data[targetIdx + 1] = source[gIdx];
        data[targetIdx + 2] = source[bIdx];
        data[targetIdx + 3] = 255;
      }
    }
  }

  glitchBlockTears(data, source, width, height) {
    const tearCount = 10 + this.randInt(0, 8);

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

          const srcIdx = (rowSrcY * width + rowSrcX) * 4;
          const dstIdx = (rowDstY * width + rowDstX) * 4;

          data[dstIdx] = source[srcIdx];
          data[dstIdx + 1] = source[srcIdx + 1];
          data[dstIdx + 2] = source[srcIdx + 2];
          data[dstIdx + 3] = 255;
        }
      }
    }
  }

  glitchScanlineShear(data, source, width, height) {
    const lineCount = 8 + this.randInt(0, 10);

    for (let l = 0; l < lineCount; l++) {
      const y = this.randInt(0, height - 1);
      const shift = this.randInt(-48, 48);

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

  glitchPixelateChunks(data, source, width, height) {
    const chunkCount = 12 + this.randInt(0, 16);

    for (let c = 0; c < chunkCount; c++) {
      const chunkSize = this.randInt(5, 18);
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
  window.glitchEngine = new PixelGlitchEngine('glitch-bg', imageUrl);
});
