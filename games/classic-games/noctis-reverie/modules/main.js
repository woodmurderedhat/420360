/**
 * Noctis Reverie - Main Entry Point
 * 
 * This module initializes all components and starts the application.
 */

import { EventBus } from './EventBus.js';
import { AssetManager } from './AssetManager.js';
import { GraphicsContext } from './GraphicsContext.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { WebGLRenderer } from './WebGLRenderer.js';
import { AudioManager } from './AudioManager.js';
import { ControlsPanel } from './ControlsPanel.js';
import { CreditsModal } from './CreditsModal.js';

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  
  // Create event bus for communication between modules
  const eventBus = new EventBus();
  
  // Initialize asset manager and load assets
  const assetManager = new AssetManager();
  await assetManager.init();
  
  // Set up canvas
  const canvas = document.getElementById('reverie-canvas');
  resizeCanvas(canvas);
  
  // Create graphics context
  const graphicsContext = new GraphicsContext(canvas);
  
  // Initialize renderer (Canvas2D by default, WebGL as fallback)
  let renderer;
  try {
    renderer = new CanvasRenderer(graphicsContext, assetManager, eventBus);
  } catch (error) {
    console.warn('Canvas renderer failed to initialize, falling back to WebGL:', error);
    renderer = new WebGLRenderer(graphicsContext, assetManager, eventBus);
  }
  
  // Initialize audio
  const audioManager = new AudioManager();
  
  // Set up UI controls
  const controlsPanel = new ControlsPanel(eventBus);
  const creditsModal = new CreditsModal();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    renderer.resize();
  });
  
  // Subscribe to events
  eventBus.subscribe('start', () => {
    renderer.start();
    audioManager.play('ambient');
  });
  
  eventBus.subscribe('regenerate', () => {
    renderer.stop();
    renderer.start();
  });
  
  // Initialize UI
  controlsPanel.init();
  creditsModal.init();
  
});

/**
 * Resize canvas to fill the window
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 */
function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
