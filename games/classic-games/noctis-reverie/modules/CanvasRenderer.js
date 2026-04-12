/**
 * CanvasRenderer.js
 * 
 * Handles rendering using the Canvas 2D API.
 * Creates generative art with SVG elements and particles.
 */

export class CanvasRenderer {
  /**
   * Create a new Canvas renderer
   * @param {GraphicsContext} graphicsContext - Graphics context
   * @param {AssetManager} assetManager - Asset manager
   * @param {EventBus} eventBus - Event bus
   */
  constructor(graphicsContext, assetManager, eventBus) {
    this.ctx = graphicsContext;
    this.assets = assetManager;
    this.eventBus = eventBus;
    
    // Animation properties
    this.animationId = null;
    this.lastFrameTime = 0;
    this.isRunning = false;
    
    // Scene elements
    this.elements = [];
    this.particles = [];
    
    // Configuration
    this.config = {
      maxElements: 20,
      maxParticles: 100,
      backgroundColor: '#0a0a12',
      particleColors: ['#6e44ff', '#ff44a1', '#44a1ff', '#a1ff44'],
      fadeInDuration: 2000, // ms
      rotationSpeed: 0.5,   // radians per second
    };
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
    this.generateScene();
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
    this.ctx.clear(this.config.backgroundColor);
    
    // Update and draw elements
    this.updateElements(deltaTime);
    this.drawElements();
    
    // Update and draw particles
    this.updateParticles(deltaTime);
    this.drawParticles();
    
    // Continue the animation loop
    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.update.bind(this));
    }
  }
  
  /**
   * Generate a new scene with random elements
   */
  generateScene() {
    // Clear existing elements and particles
    this.elements = [];
    this.particles = [];
    
    // Create random SVG elements
    const numElements = Math.floor(Math.random() * this.config.maxElements) + 5;
    
    for (let i = 0; i < numElements; i++) {
      const svg = this.assets.getRandomSVG();
      
      if (!svg) continue;
      
      const element = {
        svg: svg,
        x: Math.random() * this.ctx.width,
        y: Math.random() * this.ctx.height,
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * this.config.rotationSpeed,
        opacity: 0, // Start transparent for fade-in
        fadeIn: true,
        fadeSpeed: 1 / (this.config.fadeInDuration / 1000), // per second
        velocityX: (Math.random() - 0.5) * 20,
        velocityY: (Math.random() - 0.5) * 20,
      };
      
      this.elements.push(element);
    }
    
    // Create particles
    this.generateParticles();
  }
  
  /**
   * Generate random particles
   */
  generateParticles() {
    const numParticles = Math.floor(Math.random() * this.config.maxParticles) + 20;
    
    for (let i = 0; i < numParticles; i++) {
      const particle = {
        x: Math.random() * this.ctx.width,
        y: Math.random() * this.ctx.height,
        radius: Math.random() * 3 + 1,
        color: this.config.particleColors[Math.floor(Math.random() * this.config.particleColors.length)],
        velocityX: (Math.random() - 0.5) * 30,
        velocityY: (Math.random() - 0.5) * 30,
        opacity: Math.random() * 0.5 + 0.2,
        fadeSpeed: Math.random() * 0.2 + 0.1,
        growing: Math.random() > 0.5,
      };
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Update all elements
   * @param {number} deltaTime - Time since last frame in seconds
   */
  updateElements(deltaTime) {
    for (const element of this.elements) {
      // Update position
      element.x += element.velocityX * deltaTime;
      element.y += element.velocityY * deltaTime;
      
      // Wrap around screen edges
      if (element.x < -element.width) element.x = this.ctx.width;
      if (element.x > this.ctx.width) element.x = -element.width;
      if (element.y < -element.height) element.y = this.ctx.height;
      if (element.y > this.ctx.height) element.y = -element.height;
      
      // Update rotation
      element.rotation += element.rotationSpeed * deltaTime;
      
      // Update opacity (fade in/out)
      if (element.fadeIn) {
        element.opacity += element.fadeSpeed * deltaTime;
        if (element.opacity >= 1) {
          element.opacity = 1;
          element.fadeIn = false;
        }
      }
    }
  }
  
  /**
   * Draw all elements
   */
  drawElements() {
    for (const element of this.elements) {
      this.ctx.setAlpha(element.opacity);
      this.ctx.drawSVG(
        element.svg,
        element.x,
        element.y,
        element.width,
        element.height,
        element.rotation
      );
    }
    this.ctx.resetAlpha();
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
        particle.radius += 0.5 * deltaTime;
        if (particle.radius > 4) {
          particle.growing = false;
        }
      } else {
        particle.radius -= 0.5 * deltaTime;
        if (particle.radius < 1) {
          particle.growing = true;
        }
      }
      
      // Update opacity
      particle.opacity += (Math.random() - 0.5) * particle.fadeSpeed * deltaTime;
      particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
    }
  }
  
  /**
   * Draw all particles
   */
  drawParticles() {
    for (const particle of this.particles) {
      this.ctx.setAlpha(particle.opacity);
      this.ctx.drawCircle(
        particle.x,
        particle.y,
        particle.radius,
        null,
        particle.color
      );
    }
    this.ctx.resetAlpha();
  }
  
  /**
   * Handle window resize
   */
  resize() {
    this.ctx.updateDimensions();
  }
}
