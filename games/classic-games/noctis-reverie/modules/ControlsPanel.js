/**
 * ControlsPanel.js
 * 
 * Handles UI controls for starting and regenerating the animation.
 */

export class ControlsPanel {
  /**
   * Create a new controls panel
   * @param {EventBus} eventBus - Event bus for communication
   */
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.startButton = null;
    this.regenerateButton = null;
    this.creditsButton = null;
    this.isRunning = false;
  }
  
  /**
   * Initialize the controls panel
   */
  init() {
    // Get button elements
    this.startButton = document.getElementById('start-btn');
    this.regenerateButton = document.getElementById('regenerate-btn');
    this.creditsButton = document.getElementById('credits-btn');
    
    if (!this.startButton || !this.regenerateButton || !this.creditsButton) {
      console.error('Control buttons not found in the DOM');
      return;
    }
    
    // Add event listeners
    this.startButton.addEventListener('click', this.handleStartClick.bind(this));
    this.regenerateButton.addEventListener('click', this.handleRegenerateClick.bind(this));
    this.creditsButton.addEventListener('click', this.handleCreditsClick.bind(this));
    
    // Initially disable regenerate button
    this.regenerateButton.disabled = true;
    
    // Subscribe to renderer events
    this.eventBus.subscribe('renderer:started', () => {
      this.isRunning = true;
      this.updateButtonStates();
    });
    
    this.eventBus.subscribe('renderer:stopped', () => {
      this.isRunning = false;
      this.updateButtonStates();
    });
  }
  
  /**
   * Handle start button click
   * @param {Event} event - Click event
   */
  handleStartClick(event) {
    if (this.isRunning) {
      // Stop the animation
      this.eventBus.publish('stop', null);
    } else {
      // Start the animation
      this.eventBus.publish('start', null);
    }
  }
  
  /**
   * Handle regenerate button click
   * @param {Event} event - Click event
   */
  handleRegenerateClick(event) {
    this.eventBus.publish('regenerate', null);
  }
  
  /**
   * Handle credits button click
   * @param {Event} event - Click event
   */
  handleCreditsClick(event) {
    this.eventBus.publish('showCredits', null);
  }
  
  /**
   * Update button states based on current status
   */
  updateButtonStates() {
    if (this.isRunning) {
      this.startButton.textContent = 'Stop';
      this.regenerateButton.disabled = false;
    } else {
      this.startButton.textContent = 'Start';
      this.regenerateButton.disabled = true;
    }
  }
}
