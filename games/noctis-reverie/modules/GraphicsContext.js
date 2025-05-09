/**
 * GraphicsContext.js
 * 
 * Provides an abstraction over Canvas2D or WebGL rendering contexts.
 * This allows renderers to work with either context type.
 */

export class GraphicsContext {
  /**
   * Create a new graphics context
   * @param {HTMLCanvasElement} canvas - Canvas element to use
   * @param {string} contextType - 'canvas2d' or 'webgl' (defaults to 'canvas2d')
   */
  constructor(canvas, contextType = 'canvas2d') {
    this.canvas = canvas;
    this.contextType = contextType;
    
    if (contextType === 'webgl') {
      this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!this.gl) {
        throw new Error('WebGL not supported');
      }
      
      this.ctx2d = null;
    } else {
      this.ctx2d = canvas.getContext('2d');
      
      if (!this.ctx2d) {
        throw new Error('Canvas 2D not supported');
      }
      
      this.gl = null;
    }
    
    this.width = canvas.width;
    this.height = canvas.height;
  }
  
  /**
   * Clear the canvas
   * @param {string} color - CSS color string (for Canvas2D)
   */
  clear(color = 'rgba(0, 0, 0, 0)') {
    if (this.ctx2d) {
      this.ctx2d.clearRect(0, 0, this.width, this.height);
      
      if (color !== 'rgba(0, 0, 0, 0)') {
        this.ctx2d.fillStyle = color;
        this.ctx2d.fillRect(0, 0, this.width, this.height);
      }
    } else if (this.gl) {
      // Parse color for WebGL
      let r = 0, g = 0, b = 0, a = 0;
      
      if (color.startsWith('#')) {
        // Hex color
        const hex = color.substring(1);
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
        a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
      } else if (color.startsWith('rgba')) {
        // RGBA color
        const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (rgba) {
          r = parseInt(rgba[1]) / 255;
          g = parseInt(rgba[2]) / 255;
          b = parseInt(rgba[3]) / 255;
          a = parseFloat(rgba[4]);
        }
      } else if (color.startsWith('rgb')) {
        // RGB color
        const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgb) {
          r = parseInt(rgb[1]) / 255;
          g = parseInt(rgb[2]) / 255;
          b = parseInt(rgb[3]) / 255;
          a = 1;
        }
      }
      
      this.gl.clearColor(r, g, b, a);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
  }
  
  /**
   * Draw an SVG element on the canvas
   * @param {SVGElement} svg - SVG element to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} rotation - Rotation in radians
   */
  drawSVG(svg, x, y, width, height, rotation = 0) {
    if (!this.ctx2d) {
      console.warn('drawSVG is only supported in Canvas2D mode');
      return;
    }
    
    // Create a data URL from the SVG
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create an image and draw it when loaded
    const img = new Image();
    img.onload = () => {
      this.ctx2d.save();
      this.ctx2d.translate(x + width / 2, y + height / 2);
      this.ctx2d.rotate(rotation);
      this.ctx2d.drawImage(img, -width / 2, -height / 2, width, height);
      this.ctx2d.restore();
      
      // Clean up
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
  
  /**
   * Draw a path on the canvas
   * @param {Array<{x: number, y: number}>} points - Array of points
   * @param {string} strokeColor - CSS color string for stroke
   * @param {string} fillColor - CSS color string for fill
   * @param {number} lineWidth - Line width
   * @param {boolean} closed - Whether to close the path
   */
  drawPath(points, strokeColor = null, fillColor = null, lineWidth = 1, closed = false) {
    if (!this.ctx2d || points.length < 2) {
      return;
    }
    
    this.ctx2d.beginPath();
    this.ctx2d.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx2d.lineTo(points[i].x, points[i].y);
    }
    
    if (closed) {
      this.ctx2d.closePath();
    }
    
    if (fillColor) {
      this.ctx2d.fillStyle = fillColor;
      this.ctx2d.fill();
    }
    
    if (strokeColor) {
      this.ctx2d.strokeStyle = strokeColor;
      this.ctx2d.lineWidth = lineWidth;
      this.ctx2d.stroke();
    }
  }
  
  /**
   * Draw a circle on the canvas
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Radius
   * @param {string} strokeColor - CSS color string for stroke
   * @param {string} fillColor - CSS color string for fill
   * @param {number} lineWidth - Line width
   */
  drawCircle(x, y, radius, strokeColor = null, fillColor = null, lineWidth = 1) {
    if (!this.ctx2d) {
      return;
    }
    
    this.ctx2d.beginPath();
    this.ctx2d.arc(x, y, radius, 0, Math.PI * 2);
    
    if (fillColor) {
      this.ctx2d.fillStyle = fillColor;
      this.ctx2d.fill();
    }
    
    if (strokeColor) {
      this.ctx2d.strokeStyle = strokeColor;
      this.ctx2d.lineWidth = lineWidth;
      this.ctx2d.stroke();
    }
  }
  
  /**
   * Set global alpha (transparency)
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    if (this.ctx2d) {
      this.ctx2d.globalAlpha = alpha;
    } else if (this.gl) {
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      // Alpha will be applied in shaders
    }
  }
  
  /**
   * Reset global alpha to 1
   */
  resetAlpha() {
    if (this.ctx2d) {
      this.ctx2d.globalAlpha = 1;
    }
  }
  
  /**
   * Update context dimensions when canvas is resized
   */
  updateDimensions() {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.width, this.height);
    }
  }
}
