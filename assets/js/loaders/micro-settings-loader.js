/**
 * Micro Settings Panel Loader
 * 
 * Injected globally to all pages (homepage, games, esoteric sections, etc.)
 * 
 * This script:
 * 1. Creates and initializes the Micro Settings Panel
 * 2. Loads persisted settings from localStorage
 * 3. Makes the panel accessible via keyboard shortcut (Ctrl+Shift+S)
 * 4. Gracefully handles pages without the main state system
 */

(async function initMicroSettingsPanel() {
  try {
    // Try to import the panel and dependencies
    // Gracefully fall back if we're not on a page with these modules
    let MicroSettingsPanel;
    let config;
    let state;
    let storage;

    // Check if we're on the homepage with the full state system
    const hasHomepageModules = !!window.__microSettingsPanelReady || 
                               (document.querySelector('script[src*="homepage.js"]') || 
                                document.querySelector('script[src*="assets/js/homepage"]'));

    // If we have the modules available globally (injected by homepage.js),
    // use them. Otherwise, try dynamic imports.
    try {
      const panelModule = await import('../addons/micro-settings-panel.js');
      MicroSettingsPanel = panelModule.MicroSettingsPanel;

      const configModule = await import('../homepage/config.js');
      config = configModule.CONFIG;

      const stateModule = await import('../homepage/state.js');
      state = stateModule.state;

      const storageModule = await import('../homepage/storage.js');
      storage = storageModule;
    } catch (e) {
      // Fallback: create a minimal config object if imports fail
      console.warn('[MicroSettingsPanel] Could not import modules, using fallback mode:', e.message);
      
      // Minimal fallback config
      config = {
        MICRO_SETTINGS: {
          EFFECTS_ENABLED: 'microSettingsEffectsEnabled',
          SOUND_DEFAULT: 'microSettingsSoundDefault',
          POPUP_INTENSITY: 'microSettingsPopupIntensity',
          SESSION_RESUME_ENABLED: 'microSettingsSessionResumeEnabled',
          LAST_VISITED_TAB: 'microSettingsLastVisitedTab'
        },
        SFX_BASE_VOLUME: 0.55
      };

      // Minimal fallback state
      state = {
        microSettings: {
          effectsEnabled: localStorage.getItem('microSettingsEffectsEnabled') === 'true' || true,
          soundDefault: parseFloat(localStorage.getItem('microSettingsSoundDefault')) || 0.55,
          popupIntensity: parseInt(localStorage.getItem('microSettingsPopupIntensity')) || 100,
          sessionResumeEnabled: localStorage.getItem('microSettingsSessionResumeEnabled') === 'true' || false,
          lastVisitedTab: null
        }
      };

      // Minimal fallback storage
      storage = {
        savePreference: (key, value) => {
          try {
            localStorage.setItem(key, String(value));
          } catch (err) {
            console.warn('Failed to save preference:', key);
          }
        }
      };

      // Fallback component (inline minimal version)
      MicroSettingsPanel = class {
        constructor(cfg, st, stor) {
          this.config = cfg;
          this.state = st;
          this.storage = stor;
          this.isOpen = false;
          this.init();
        }

        init() {
          this.create();
          this.attachListeners();
        }

        create() {
          const panel = document.createElement('div');
          panel.id = 'micro-settings-panel';
          panel.className = 'micro-settings-panel';
          panel.innerHTML = `
            <div class="micro-settings-header">
              <div class="micro-settings-title">⚙ SETTINGS</div>
              <button class="micro-settings-close" aria-label="Close">×</button>
            </div>
            <div class="micro-settings-content">
              <div class="micro-settings-toggle">
                <label for="ms-effects-toggle">
                  <input type="checkbox" id="ms-effects-toggle" />
                  <span class="micro-settings-label">Reduced Effects</span>
                </label>
              </div>
              <div class="micro-settings-toggle">
                <label for="ms-sound-toggle">
                  <input type="checkbox" id="ms-sound-toggle" />
                  <span class="micro-settings-label">Sound Default</span>
                </label>
              </div>
              <div class="micro-settings-toggle">
                <label for="ms-popup-toggle">
                  <input type="checkbox" id="ms-popup-toggle" />
                  <span class="micro-settings-label">Popup Intensity</span>
                </label>
                <div class="micro-settings-slider-wrapper">
                  <input type="range" id="ms-popup-slider" class="micro-settings-slider" min="0" max="100" value="100" />
                  <span class="micro-settings-value" id="ms-popup-value">100%</span>
                </div>
              </div>
              <div class="micro-settings-toggle">
                <label for="ms-resume-toggle">
                  <input type="checkbox" id="ms-resume-toggle" />
                  <span class="micro-settings-label">Session Resume</span>
                </label>
              </div>
            </div>
          `;
          document.body.appendChild(panel);
          this.panelElement = panel;
          this.loadSettingsToUI();
        }

        attachListeners() {
          const header = this.panelElement.querySelector('.micro-settings-header');
          let isDragging = false;
          let offset = { x: 0, y: 0 };

          header.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = this.panelElement.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
          });

          document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.panelElement.style.left = (e.clientX - offset.x) + 'px';
            this.panelElement.style.top = (e.clientY - offset.y) + 'px';
          });

          document.addEventListener('mouseup', () => {
            isDragging = false;
          });

          this.panelElement.querySelector('.micro-settings-close')
            .addEventListener('click', () => this.close());

          this.panelElement.querySelector('#ms-effects-toggle')
            .addEventListener('change', (e) => {
              this.state.microSettings.effectsEnabled = e.target.checked;
              this.storage.savePreference(this.config.MICRO_SETTINGS.EFFECTS_ENABLED, e.target.checked);
              document.documentElement.dataset.reducedEffects = e.target.checked ? 'false' : 'true';
            });

          this.panelElement.querySelector('#ms-sound-toggle')
            .addEventListener('change', (e) => {
              const level = e.target.checked ? this.config.SFX_BASE_VOLUME : 0;
              this.state.microSettings.soundDefault = level;
              localStorage.setItem(this.config.MICRO_SETTINGS.SOUND_DEFAULT, level);
            });

          this.panelElement.querySelector('#ms-popup-slider')
            .addEventListener('input', (e) => {
              const intensity = parseInt(e.target.value);
              this.state.microSettings.popupIntensity = intensity;
              localStorage.setItem(this.config.MICRO_SETTINGS.POPUP_INTENSITY, intensity);
              this.panelElement.querySelector('#ms-popup-value').textContent = intensity + '%';
            });

          this.panelElement.querySelector('#ms-resume-toggle')
            .addEventListener('change', (e) => {
              this.state.microSettings.sessionResumeEnabled = e.target.checked;
              this.storage.savePreference(this.config.MICRO_SETTINGS.SESSION_RESUME_ENABLED, e.target.checked);
            });

          document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
              e.preventDefault();
              this.toggle();
            }
          });
        }

        loadSettingsToUI() {
          const m = this.state.microSettings;
          this.panelElement.querySelector('#ms-effects-toggle').checked = m.effectsEnabled;
          this.panelElement.querySelector('#ms-sound-toggle').checked = m.soundDefault > 0;
          this.panelElement.querySelector('#ms-popup-slider').value = m.popupIntensity;
          this.panelElement.querySelector('#ms-popup-value').textContent = m.popupIntensity + '%';
          this.panelElement.querySelector('#ms-resume-toggle').checked = m.sessionResumeEnabled;
        }

        toggle() {
          this.isOpen ? this.close() : this.open();
        }

        open() {
          this.panelElement.classList.add('micro-settings-open');
          this.isOpen = true;
        }

        close() {
          this.panelElement.classList.remove('micro-settings-open');
          this.isOpen = false;
        }
      };
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initPanel();
      });
    } else {
      initPanel();
    }

    function initPanel() {
      // Initialize microSettings from localStorage if we have the init function
      if (typeof window.initMicroSettings === 'function') {
        window.initMicroSettings(config);
      }

      // Load CSS if not already loaded
      if (!document.getElementById('micro-settings-panel-css')) {
        const link = document.createElement('link');
        link.id = 'micro-settings-panel-css';
        link.rel = 'stylesheet';
        link.href = 'assets/css/micro-settings-panel.css';
        document.head.appendChild(link);
      }

      // Create and initialize the panel
      const panel = new MicroSettingsPanel(config, state, storage);

      // Inject a compact taskbar button next to the clock if present.
      const clockEl = document.getElementById('taskbar-clock');
      if (clockEl && !document.getElementById('micro-settings-taskbar-btn')) {
        const btn = document.createElement('button');
        btn.id = 'micro-settings-taskbar-btn';
        btn.type = 'button';
        btn.textContent = ':)';
        btn.setAttribute('aria-label', 'Toggle micro settings panel');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Micro settings (:))');
        clockEl.insertAdjacentElement('afterend', btn);

        const syncBtn = (open) => {
          btn.classList.toggle('active', !!open);
          btn.setAttribute('aria-pressed', open ? 'true' : 'false');
        };

        btn.addEventListener('click', () => {
          if (window.__microSettingsPanel && typeof window.__microSettingsPanel.toggle === 'function') {
            window.__microSettingsPanel.toggle();
            syncBtn(!!window.__microSettingsPanel.isOpen);
          }
        });

        window.addEventListener('micro-settings:visibility', (evt) => {
          syncBtn(!!evt?.detail?.open);
        });
      }

      // Allow taskbar button to toggle panel even if it uses decoupled events.
      window.addEventListener('micro-settings:toggle-request', () => {
        if (window.__microSettingsPanel && typeof window.__microSettingsPanel.toggle === 'function') {
          window.__microSettingsPanel.toggle();
        }
      });

      // Make it accessible globally for debugging
      window.__microSettingsPanel = panel;

      // Optionally: auto-open on first visit (set to false for default closed)
      // panel.open();
    }
  } catch (error) {
    console.error('[MicroSettingsPanel] Loader error:', error);
  }
})();
