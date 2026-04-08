export class CanvasSurface {
  constructor(canvasId, imageUrl) {
    this.canvas = document.getElementById(canvasId);
    this.imageUrl = imageUrl;
    this.ctx = this.canvas?.getContext('2d', { willReadFrequently: true }) || null;
    this.image = null;
    this.pristineSource = null;
    this.pristineWidth = 0;
    this.pristineHeight = 0;
  }

  get ready() {
    return !!(this.canvas && this.ctx && this.image);
  }

  async loadImage() {
    if (!this.canvas || !this.ctx) {
      throw new Error('Glitch canvas element was not found.');
    }

    this.image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load glitch image: ${this.imageUrl}`));
      img.src = this.imageUrl;
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  drawImage() {
    if (!this.ready) return;

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
    this.capturePristineSource();
  }

  capturePristineSource() {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    this.pristineSource = new Uint8ClampedArray(imageData.data);
    this.pristineWidth = width;
    this.pristineHeight = height;
  }

  getFrame() {
    if (!this.ctx || !this.canvas) return null;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const region = this.ctx.getImageData(0, 0, width, height);
    const pristineSource = this.pristineSource
      && this.pristineWidth === width
      && this.pristineHeight === height
      ? this.pristineSource
      : new Uint8ClampedArray(region.data);

    return {
      region,
      data: region.data,
      source: new Uint8ClampedArray(region.data),
      pristineSource,
      width,
      height
    };
  }

  putFrame(region) {
    if (!this.ctx || !region) return;
    this.ctx.putImageData(region, 0, 0);
  }
}
