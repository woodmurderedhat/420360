/**
 * Micro Settings Panel Component
 * 
 * A floating, draggable settings panel for quick access to key preferences:
 * - Reduced Effects (toggles animations + game effects)
 * - Sound Default (volume/enabled for SFX)
 * - Popup Intensity (controls spawn rate)
 * - Session Resume (remembers last visited section)
 * 
 * Settings are persisted to localStorage and reflected in the global state object.
 */

export class MicroSettingsPanel {
  constructor(config, state, storage) {
    this.config = config;
    this.state = state;
    this.storage = storage;
    
    this.panelElement = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.isOpen = false;

    this.init();
  }

  /**
   * Initialize the panel
   */
  init() {
    this.create();
    this.attachEventListeners();
  }

  /**
   * Create the panel DOM structure
   */
  create() {
    const panelId = 'micro-settings-panel';
    
    // Check if panel already exists (avoid duplicates)
    if (document.getElementById(panelId)) {
      this.panelElement = document.getElementById(panelId);
      return;
    }

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'micro-settings-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Micro Settings Panel');
    panel.setAttribute('aria-modal', 'false');

    const headerBar = document.createElement('div');
    headerBar.className = 'micro-settings-header';
    headerBar.innerHTML = `
      <div class="micro-settings-title">⚙ SETTINGS</div>
      <button class="micro-settings-close" aria-label="Close settings panel">×</button>
    `;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'micro-settings-content';
    contentDiv.innerHTML = `
      <div class="micro-settings-toggle">
        <label for="ms-effects-toggle">
          <input type="checkbox" id="ms-effects-toggle" class="micro-settings-input" />
          <span class="micro-settings-label">Reduced Effects</span>
        </label>
      </div>

      <div class="micro-settings-toggle">
        <label for="ms-sound-toggle">
          <input type="checkbox" id="ms-sound-toggle" class="micro-settings-input" />
          <span class="micro-settings-label">Sound Default</span>
        </label>
      </div>

      <div class="micro-settings-toggle">
        <label for="ms-popup-toggle">
          <input type="checkbox" id="ms-popup-toggle" class="micro-settings-input" />
          <span class="micro-settings-label">Popup Intensity</span>
        </label>
        <div class="micro-settings-slider-wrapper">
          <input type="range" id="ms-popup-slider" class="micro-settings-slider" min="0" max="100" value="100" />
          <span class="micro-settings-value" id="ms-popup-value">100%</span>
        </div>
      </div>

      <div class="micro-settings-toggle">
        <label for="ms-resume-toggle">
          <input type="checkbox" id="ms-resume-toggle" class="micro-settings-input" />
          <span class="micro-settings-label">Session Resume</span>
        </label>
      </div>
    `;

    panel.appendChild(headerBar);
    panel.appendChild(contentDiv);
    document.body.appendChild(panel);

    this.panelElement = panel;
  }

  /**
   * Attach event listeners to the panel and its controls
   */
  attachEventListeners() {
    if (!this.panelElement) return;

    // Header dragging
    const header = this.panelElement.querySelector('.micro-settings-header');
    header?.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag());

    // Close button
    const closeBtn = this.panelElement.querySelector('.micro-settings-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Settings toggles
    const effectsToggle = this.panelElement.querySelector('#ms-effects-toggle');
    effectsToggle?.addEventListener('change', () => this.handleEffectsToggle());

    const soundToggle = this.panelElement.querySelector('#ms-sound-toggle');
    soundToggle?.addEventListener('change', () => this.handleSoundToggle());

    const popupToggle = this.panelElement.querySelector('#ms-popup-toggle');
    popupToggle?.addEventListener('change', () => this.handlePopupToggle());

    const popupSlider = this.panelElement.querySelector('#ms-popup-slider');
    popupSlider?.addEventListener('input', () => this.handlePopupSlider());

    const resumeToggle = this.panelElement.querySelector('#ms-resume-toggle');
    resumeToggle?.addEventListener('change', () => this.handleResumeToggle());

    // Keyboard shortcut: Ctrl+Shift+S to toggle panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Load current settings into UI
    this.loadSettingsToUI();
  }

  /**
   * Load current settings from state into the UI controls
   */
  loadSettingsToUI() {
    const { microSettings } = this.state;

    const effectsToggle = this.panelElement?.querySelector('#ms-effects-toggle');
    if (effectsToggle) {
      effectsToggle.checked = microSettings.effectsEnabled;
    }

    const soundToggle = this.panelElement?.querySelector('#ms-sound-toggle');
    if (soundToggle) {
      soundToggle.checked = microSettings.soundDefault > 0;
    }

    const popupSlider = this.panelElement?.querySelector('#ms-popup-slider');
    if (popupSlider) {
      popupSlider.value = microSettings.popupIntensity;
      const valueDisplay = this.panelElement?.querySelector('#ms-popup-value');
      if (valueDisplay) {
        valueDisplay.textContent = `${microSettings.popupIntensity}%`;
      }
    }

    const resumeToggle = this.panelElement?.querySelector('#ms-resume-toggle');
    if (resumeToggle) {
      resumeToggle.checked = microSettings.sessionResumeEnabled;
    }
  }

  /**
   * Handle effects toggle change
   */
  handleEffectsToggle() {
    const toggle = this.panelElement?.querySelector('#ms-effects-toggle');
    if (!toggle) return;

    this.state.microSettings.effectsEnabled = toggle.checked;
    this.storage.savePreference(this.config.MICRO_SETTINGS.EFFECTS_ENABLED, toggle.checked);

    // Apply to document
    if (toggle.checked) {
      document.documentElement.dataset.reducedEffects = 'false';
    } else {
      document.documentElement.dataset.reducedEffects = 'true';
    }
  }

  /**
   * Handle sound toggle change
   */
  handleSoundToggle() {
    const toggle = this.panelElement?.querySelector('#ms-sound-toggle');
    if (!toggle) return;

    const soundLevel = toggle.checked ? this.config.SFX_BASE_VOLUME : 0;
    this.state.microSettings.soundDefault = soundLevel;
    localStorage.setItem(this.config.MICRO_SETTINGS.SOUND_DEFAULT, soundLevel);
  }

  /**
   * Handle popup toggle change (enables/disables slider)
   */
  handlePopupToggle() {
    const toggle = this.panelElement?.querySelector('#ms-popup-toggle');
    const slider = this.panelElement?.querySelector('#ms-popup-slider');
    
    if (!toggle || !slider) return;

    // If toggled off, set intensity to 0; if toggled on, restore to last value
    if (!toggle.checked) {
      slider.value = 0;
      this.state.microSettings.popupIntensity = 0;
      localStorage.setItem(this.config.MICRO_SETTINGS.POPUP_INTENSITY, 0);
      const valueDisplay = this.panelElement?.querySelector('#ms-popup-value');
      if (valueDisplay) valueDisplay.textContent = '0%';
    } else {
      // Toggle back on: restore to default or last value
      const defaultIntensity = 100;
      slider.value = defaultIntensity;
      this.state.microSettings.popupIntensity = defaultIntensity;
      localStorage.setItem(this.config.MICRO_SETTINGS.POPUP_INTENSITY, defaultIntensity);
      const valueDisplay = this.panelElement?.querySelector('#ms-popup-value');
      if (valueDisplay) valueDisplay.textContent = '100%';
    }
  }

  /**
   * Handle popup intensity slider change
   */
  handlePopupSlider() {
    const slider = this.panelElement?.querySelector('#ms-popup-slider');
    if (!slider) return;

    const intensity = parseInt(slider.value);
    this.state.microSettings.popupIntensity = intensity;
    localStorage.setItem(this.config.MICRO_SETTINGS.POPUP_INTENSITY, intensity);

    const valueDisplay = this.panelElement?.querySelector('#ms-popup-value');
    if (valueDisplay) {
      valueDisplay.textContent = `${intensity}%`;
    }
  }

  /**
   * Handle session resume toggle change
   */
  handleResumeToggle() {
    const toggle = this.panelElement?.querySelector('#ms-resume-toggle');
    if (!toggle) return;

    this.state.microSettings.sessionResumeEnabled = toggle.checked;
    this.storage.savePreference(this.config.MICRO_SETTINGS.SESSION_RESUME_ENABLED, toggle.checked);
  }

  /**
   * Start dragging the panel
   */
  startDrag(e) {
    if (e.button !== 0) return; // Only left mouse button
    
    this.isDragging = true;
    const rect = this.panelElement?.getBoundingClientRect();
    if (rect) {
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
    }
  }

  /**
   * Drag the panel across the screen
   */
  drag(e) {
    if (!this.isDragging || !this.panelElement) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    this.panelElement.style.left = `${Math.max(0, x)}px`;
    this.panelElement.style.top = `${Math.max(0, y)}px`;
  }

  /**
   * Stop dragging the panel
   */
  stopDrag() {
    this.isDragging = false;
  }

  /**
   * Open the settings panel
   */
  open() {
    if (!this.panelElement) return;
    this.panelElement.classList.add('micro-settings-open');
    this.panelElement.setAttribute('aria-modal', 'true');
    this.isOpen = true;
    this.loadSettingsToUI(); // Refresh UI from state
    window.dispatchEvent(new CustomEvent('micro-settings:visibility', { detail: { open: true } }));
  }

  /**
   * Close the settings panel
   */
  close() {
    if (!this.panelElement) return;
    this.panelElement.classList.remove('micro-settings-open');
    this.panelElement.setAttribute('aria-modal', 'false');
    this.isOpen = false;
    window.dispatchEvent(new CustomEvent('micro-settings:visibility', { detail: { open: false } }));
  }

  /**
   * Toggle the settings panel open/closed
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Get a reference to the panel element (for external integration)
   */
  getElement() {
    return this.panelElement;
  }
}

export default MicroSettingsPanel;
