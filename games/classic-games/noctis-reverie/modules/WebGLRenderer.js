/**
 * WebGLRenderer.js
 * 
 * Handles rendering using WebGL for better performance.
 * This is a simplified implementation that focuses on particle effects.
 */

export class WebGLRenderer {
  /**
   * Create a new WebGL renderer
   * @param {GraphicsContext} graphicsContext - Graphics context
   * @param {AssetManager} assetManager - Asset manager
   * @param {EventBus} eventBus - Event bus
   */
  constructor(graphicsContext, assetManager, eventBus) {
    this.ctx = graphicsContext;
    this.assets = assetManager;
    this.eventBus = eventBus;
    
    // Check if WebGL is available
    if (!this.ctx.gl) {
      throw new Error('WebGL context not available');
    }
    
    this.gl = this.ctx.gl;
    
    // Animation properties
    this.animationId = null;
    this.lastFrameTime = 0;
    this.isRunning = false;
    
    // Particle system
    this.particles = [];
    this.particleBuffer = null;
    this.particleProgram = null;
    
    // Configuration
    this.config = {
      maxParticles: 1000,
      particleColors: [
        [0.43, 0.27, 1.0, 1.0],  // #6e44ff
        [1.0, 0.27, 0.63, 1.0],  // #ff44a1
        [0.27, 0.63, 1.0, 1.0],  // #44a1ff
        [0.63, 1.0, 0.27, 1.0],  // #a1ff44
      ],
      backgroundColor: [0.04, 0.04, 0.07, 1.0], // #0a0a12
    };
    
    // Initialize WebGL
    this.initWebGL();
  }
  
  /**
   * Initialize WebGL resources
   */
  initWebGL() {
    // Create shader program
    this.particleProgram = this.createShaderProgram(
      this.getVertexShaderSource(),
      this.getFragmentShaderSource()
    );
    
    // Get attribute and uniform locations
    this.positionAttributeLocation = this.gl.getAttribLocation(this.particleProgram, 'a_position');
    this.colorAttributeLocation = this.gl.getAttribLocation(this.particleProgram, 'a_color');
    this.sizeAttributeLocation = this.gl.getAttribLocation(this.particleProgram, 'a_size');
    this.resolutionUniformLocation = this.gl.getUniformLocation(this.particleProgram, 'u_resolution');
    
    // Create buffer for particle data
    this.particleBuffer = this.gl.createBuffer();
    
    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
  
  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) {
      this.stop();
    }
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.generateParticles();
    this.animationId = requestAnimationFrame(this.update.bind(this));
    
    this.eventBus.publish('renderer:started', null);
  }
  
  /**
   * Stop the animation loop
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.isRunning = false;
    this.eventBus.publish('renderer:stopped', null);
  }
  
  /**
   * Update the animation (called every frame)
   * @param {number} timestamp - Current timestamp
   */
  update(timestamp) {
    const deltaTime = (timestamp - this.lastFrameTime) / 1000; // in seconds
    this.lastFrameTime = timestamp;
    
    // Clear the canvas
    this.gl.clearColor(
      this.config.backgroundColor[0],
      this.config.backgroundColor[1],
      this.config.backgroundColor[2],
      this.config.backgroundColor[3]
    );
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Draw particles
    this.drawParticles();
    
    // Continue the animation loop
    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.update.bind(this));
    }
  }
  
  /**
   * Generate random particles
   */
  generateParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.maxParticles; i++) {
      const colorIndex = Math.floor(Math.random() * this.config.particleColors.length);
      const color = this.config.particleColors[colorIndex];
      
      const particle = {
        x: Math.random() * this.ctx.width,
        y: Math.random() * this.ctx.height,
        size: Math.random() * 10 + 2,
        color: [color[0], color[1], color[2], Math.random() * 0.5 + 0.2], // Random alpha
        velocityX: (Math.random() - 0.5) * 50,
        velocityY: (Math.random() - 0.5) * 50,
        growing: Math.random() > 0.5,
      };
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Update all particles
   * @param {number} deltaTime - Time since last frame in seconds
   */
  updateParticles(deltaTime) {
    for (const particle of this.particles) {
      // Update position
      particle.x += particle.velocityX * deltaTime;
      particle.y += particle.velocityY * deltaTime;
      
      // Wrap around screen edges
      if (particle.x < 0) particle.x = this.ctx.width;
      if (particle.x > this.ctx.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.ctx.height;
      if (particle.y > this.ctx.height) particle.y = 0;
      
      // Update size (pulsing effect)
      if (particle.growing) {
        particle.size += 2 * deltaTime;
        if (particle.size > 12) {
          particle.growing = false;
        }
      } else {
        particle.size -= 2 * deltaTime;
        if (particle.size < 2) {
          particle.growing = true;
        }
      }
      
      // Update opacity
      particle.color[3] += (Math.random() - 0.5) * 0.1 * deltaTime;
      particle.color[3] = Math.max(0.1, Math.min(0.7, particle.color[3]));
    }
  }
  
  /**
   * Draw all particles using WebGL
   */
  drawParticles() {
    // Use the particle shader program
    this.gl.useProgram(this.particleProgram);
    
    // Set the resolution uniform
    this.gl.uniform2f(this.resolutionUniformLocation, this.ctx.width, this.ctx.height);
    
    // Prepare particle data for GPU
    const particleData = new Float32Array(this.particles.length * 7); // x, y, r, g, b, a, size
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const offset = i * 7;
      
      particleData[offset] = particle.x;
      particleData[offset + 1] = particle.y;
      particleData[offset + 2] = particle.color[0];
      particleData[offset + 3] = particle.color[1];
      particleData[offset + 4] = particle.color[2];
      particleData[offset + 5] = particle.color[3];
      particleData[offset + 6] = particle.size;
    }
    
    // Bind the buffer and upload data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, particleData, this.gl.STATIC_DRAW);
    
    // Set up position attribute
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2, // size (x, y)
      this.gl.FLOAT, // type
      false, // normalize
      7 * 4, // stride (7 floats * 4 bytes)
      0 // offset
    );
    
    // Set up color attribute
    this.gl.enableVertexAttribArray(this.colorAttributeLocation);
    this.gl.vertexAttribPointer(
      this.colorAttributeLocation,
      4, // size (r, g, b, a)
      this.gl.FLOAT, // type
      false, // normalize
      7 * 4, // stride
      2 * 4 // offset (after x, y)
    );
    
    // Set up size attribute
    this.gl.enableVertexAttribArray(this.sizeAttributeLocation);
    this.gl.vertexAttribPointer(
      this.sizeAttributeLocation,
      1, // size
      this.gl.FLOAT, // type
      false, // normalize
      7 * 4, // stride
      6 * 4 // offset (after x, y, r, g, b, a)
    );
    
    // Draw the particles as points
    this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
  }
  
  /**
   * Handle window resize
   */
  resize() {
    this.ctx.updateDimensions();
  }
  
  /**
   * Create a WebGL shader program
   * @param {string} vertexShaderSource - Vertex shader source code
   * @param {string} fragmentShaderSource - Fragment shader source code
   * @returns {WebGLProgram} Compiled shader program
   */
  createShaderProgram(vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Failed to link shader program: ${error}`);
    }
    
    return program;
  }
  
  /**
   * Create a WebGL shader
   * @param {number} type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
   * @param {string} source - Shader source code
   * @returns {WebGLShader} Compiled shader
   */
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${error}`);
    }
    
    return shader;
  }
  
  /**
   * Get vertex shader source code
   * @returns {string} Vertex shader source
   */
  getVertexShaderSource() {
    return `
      attribute vec2 a_position;
      attribute vec4 a_color;
      attribute float a_size;
      
      uniform vec2 u_resolution;
      
      varying vec4 v_color;
      
      void main() {
        // Convert position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;
        
        // Convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
        
        // Convert from 0->2 to -1->+1 (clip space)
        vec2 clipSpace = zeroToTwo - 1.0;
        
        // Flip Y coordinate
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        // Set the point size
        gl_PointSize = a_size;
        
        // Pass color to fragment shader
        v_color = a_color;
      }
    `;
  }
  
  /**
   * Get fragment shader source code
   * @returns {string} Fragment shader source
   */
  getFragmentShaderSource() {
    return `
      precision mediump float;
      
      varying vec4 v_color;
      
      void main() {
        // Calculate distance from center of point
        vec2 center = gl_PointCoord - vec2(0.5, 0.5);
        float dist = length(center);
        
        // Discard pixels outside the circle
        if (dist > 0.5) {
          discard;
        }
        
        // Smooth the edge of the circle
        float alpha = smoothstep(0.5, 0.45, dist) * v_color.a;
        
        // Output color with calculated alpha
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `;
  }
}
