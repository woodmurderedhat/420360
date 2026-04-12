/**
 * AssetManager.js
 * 
 * Handles loading and managing assets (SVGs, audio, etc.)
 */

export class AssetManager {
  constructor() {
    this.svgList = [];
    this.svgCache = {};
    this.audioBuffers = {};
    this.loadingPromises = [];
  }
  
  /**
   * Initialize the asset manager and load initial assets
   */
  async init() {
    try {
      // Load shapes list from JSON file
      const shapesList = await this.loadShapesJson();
      
      if (shapesList && shapesList.length > 0) {
        // Load SVGs from the shapes.json list
        for (const shapeName of shapesList) {
          const loadPromise = this.loadSVG(shapeName);
          this.loadingPromises.push(loadPromise);
        }
      } else {
        console.warn('shapes.json returned empty, using default SVG');
        // Create a default SVG if shapes list is empty
        this.createDefaultSVG();
      }
      
      // Wait for all assets to load
      await Promise.all(this.loadingPromises);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AssetManager:', error);
      return false;
    }
  }
  
  /**
   * Load shapes list from JSON file
   * @returns {Promise<string[]>} List of SVG filenames
   */
  async loadShapesJson() {
    try {
      const response = await fetch('./data/shapes.json');
      if (!response.ok) {
        throw new Error(`Failed to load shapes.json: ${response.status}`);
      }
      
      const data = await response.json();
      return data.shapes || [];
    } catch (error) {
      console.warn('Could not load shapes.json, will try directory scan:', error);
      return [];
    }
  }
  
  /**
   * Load an SVG file
   * @param {string} name - SVG filename
   * @returns {Promise<SVGElement>} Parsed SVG element
   */
  async loadSVG(name) {
    try {
      const path = `./assets/vectors/${name}`;
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Failed to load SVG ${name}: ${response.status}`);
      }
      
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Store in cache
      this.svgCache[name] = svgElement;
      this.svgList.push(name);
      
      return svgElement;
    } catch (error) {
      console.error(`Error loading SVG ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Register an SVG from a File object (for user uploads)
   * @param {File} file - SVG file from input element
   * @returns {Promise<SVGElement>} Parsed SVG element
   */
  registerSVG(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.svg')) {
        reject(new Error('File is not an SVG'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const svgText = event.target.result;
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          
          // Generate a unique name
          const name = `user_${Date.now()}_${file.name}`;
          
          // Store in cache
          this.svgCache[name] = svgElement;
          this.svgList.push(name);
          
          resolve(svgElement);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Create a default SVG if no assets are available
   */
  createDefaultSVG() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "40");
    circle.setAttribute("fill", "#6e44ff");
    
    svg.appendChild(circle);
    
    // Store in cache
    const name = "default.svg";
    this.svgCache[name] = svg;
    this.svgList.push(name);
  }
  
  /**
   * Get a random SVG from the loaded assets
   * @returns {SVGElement} Random SVG element
   */
  getRandomSVG() {
    if (this.svgList.length === 0) {
      this.createDefaultSVG();
    }
    
    const randomIndex = Math.floor(Math.random() * this.svgList.length);
    const svgName = this.svgList[randomIndex];
    return this.svgCache[svgName];
  }
  
  /**
   * Get an SVG by name
   * @param {string} name - SVG name
   * @returns {SVGElement|null} SVG element or null if not found
   */
  getSVG(name) {
    return this.svgCache[name] || null;
  }
  
  /**
   * Load an audio file
   * @param {string} name - Audio filename
   * @returns {Promise<AudioBuffer>} Decoded audio buffer
   */
  async loadAudio(name) {
    try {
      // Try .ogg first, then fall back to .mp3
      let response;
      let path;
      
      try {
        path = `./assets/audio/${name}.ogg`;
        response = await fetch(path);
      } catch (error) {
        path = `./assets/audio/${name}.mp3`;
        response = await fetch(path);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load audio ${name}: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Create AudioContext on demand
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Store in cache
      this.audioBuffers[name] = audioBuffer;
      
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading audio ${name}:`, error);
      throw error;
    }
  }
}
