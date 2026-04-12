/**
 * AudioManager.js
 * 
 * Handles audio playback and effects using the Web Audio API.
 */

export class AudioManager {
  constructor() {
    // Create audio context
    this.ctx = null;
    this.buffers = {};
    this.sources = {};
    this.masterGain = null;
    this.filters = {};
    
    // Initialize when first used (to avoid autoplay restrictions)
    this.initialized = false;
  }
  
  /**
   * Initialize the audio context (call on user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      // Create audio context
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7; // Default volume
      this.masterGain.connect(this.ctx.destination);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
  
  /**
   * Load an audio file
   * @param {string} name - Audio name (without extension)
   * @returns {Promise<AudioBuffer>} Decoded audio buffer
   */
  async loadLoop(name) {
    if (!this.initialized) {
      this.init();
    }
    
    if (!this.ctx) {
      throw new Error('Audio context not available');
    }
    
    // Check if already loaded
    if (this.buffers[name]) {
      return this.buffers[name];
    }
    
    try {
      // Try .ogg first, then fall back to .mp3
      let response;
      let path;
      
      try {
        path = `./assets/audio/${name}.ogg`;
        response = await fetch(path);
        if (!response.ok) throw new Error('OGG not found');
      } catch (error) {
        path = `./assets/audio/${name}.mp3`;
        response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load audio ${name}: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      
      // Store in cache
      this.buffers[name] = audioBuffer;
      
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading audio ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Play an audio loop
   * @param {string} name - Audio name
   * @param {Object} options - Playback options
   * @param {number} options.volume - Volume (0-1)
   * @param {number} options.fadeIn - Fade-in time in seconds
   * @returns {Promise<string>} Source ID
   */
  async play(name, options = {}) {
    if (!this.initialized) {
      this.init();
    }
    
    if (!this.ctx) {
      console.warn('Audio context not available');
      return null;
    }
    
    // Resume audio context if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    try {
      // Load audio if not already loaded
      if (!this.buffers[name]) {
        await this.loadLoop(name);
      }
      
      // Create source
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[name];
      source.loop = true;
      
      // Create gain node for this source
      const gainNode = this.ctx.createGain();
      
      // Set volume
      const volume = options.volume !== undefined ? options.volume : 1.0;
      
      // Apply fade-in if specified
      if (options.fadeIn) {
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(
          volume,
          this.ctx.currentTime + options.fadeIn
        );
      } else {
        gainNode.gain.value = volume;
      }
      
      // Connect nodes
      source.connect(gainNode);
      
      // Connect to filter if exists for this name
      if (this.filters[name]) {
        gainNode.connect(this.filters[name]);
        this.filters[name].connect(this.masterGain);
      } else {
        gainNode.connect(this.masterGain);
      }
      
      // Start playback
      source.start(0);
      
      // Generate unique ID
      const id = `${name}_${Date.now()}`;
      
      // Store source and gain node
      this.sources[id] = {
        source,
        gainNode,
        name
      };
      
      return id;
    } catch (error) {
      console.error(`Error playing audio ${name}:`, error);
      return null;
    }
  }
  
  /**
   * Stop a specific audio source
   * @param {string} id - Source ID
   * @param {number} fadeOut - Fade-out time in seconds
   */
  stop(id, fadeOut = 0) {
    if (!this.sources[id]) {
      return;
    }
    
    const { source, gainNode } = this.sources[id];
    
    if (fadeOut > 0) {
      // Fade out
      const currentTime = this.ctx.currentTime;
      gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOut);
      
      // Stop after fade out
      setTimeout(() => {
        try {
          source.stop();
        } catch (error) {
          // Ignore errors if already stopped
        }
        delete this.sources[id];
      }, fadeOut * 1000);
    } else {
      // Stop immediately
      try {
        source.stop();
      } catch (error) {
        // Ignore errors if already stopped
      }
      delete this.sources[id];
    }
  }
  
  /**
   * Stop all audio sources
   * @param {number} fadeOut - Fade-out time in seconds
   */
  stopAll(fadeOut = 0) {
    Object.keys(this.sources).forEach(id => {
      this.stop(id, fadeOut);
    });
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   * @param {number} fadeTime - Fade time in seconds
   */
  setVolume(volume, fadeTime = 0) {
    if (!this.initialized || !this.masterGain) {
      return;
    }
    
    volume = Math.max(0, Math.min(1, volume));
    
    if (fadeTime > 0) {
      const currentTime = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + fadeTime);
    } else {
      this.masterGain.gain.value = volume;
    }
  }
  
  /**
   * Set a filter for a specific audio type
   * @param {string} name - Audio name
   * @param {string} filterType - Filter type ('lowpass', 'highpass', etc.)
   * @param {Object} options - Filter options
   */
  setFilter(name, filterType, options = {}) {
    if (!this.initialized || !this.ctx) {
      return;
    }
    
    // Create filter node
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    
    // Set filter parameters
    if (options.frequency !== undefined) {
      filter.frequency.value = options.frequency;
    }
    
    if (options.Q !== undefined) {
      filter.Q.value = options.Q;
    }
    
    if (options.gain !== undefined) {
      filter.gain.value = options.gain;
    }
    
    // Store filter
    this.filters[name] = filter;
    
    // Reconnect any playing sources of this type
    Object.keys(this.sources).forEach(id => {
      const source = this.sources[id];
      if (source.name === name) {
        // Disconnect from current destination
        source.gainNode.disconnect();
        
        // Connect to filter
        source.gainNode.connect(filter);
        filter.connect(this.masterGain);
      }
    });
  }
  
  /**
   * Remove filter for a specific audio type
   * @param {string} name - Audio name
   */
  removeFilter(name) {
    if (!this.filters[name]) {
      return;
    }
    
    // Reconnect any playing sources of this type directly to master
    Object.keys(this.sources).forEach(id => {
      const source = this.sources[id];
      if (source.name === name) {
        // Disconnect from filter
        source.gainNode.disconnect();
        
        // Connect directly to master
        source.gainNode.connect(this.masterGain);
      }
    });
    
    // Remove filter
    delete this.filters[name];
  }
}
