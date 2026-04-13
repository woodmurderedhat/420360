export const state = {
  // User preferences (loaded from localStorage)
  musicEnabled: true,
  sfxEnabled: true,
  chillMode: false,
  popupsPaused: false,

  // Micro Settings Panel preferences
  microSettings: {
    effectsEnabled: true,
    soundDefault: 0.55,
    popupIntensity: 100,
    sessionResumeEnabled: false,
    lastVisitedTab: null
  },

  // Runtime state
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
  mouseActive: false,
  mouseIdleTimeoutId: null,
  intervalIds: {
    popup: null,
    glitch: null,
    wordStream: null
  },

  initialized: false,
  sentences: [],

  activePopups: [],
  currentSentence: '',
  videoWindowLoaded: false,

  wordStream: {
    sentenceIndex: 0,
    wordIndex: 0
  }
};

/**
 * Initialize microSettings from localStorage
 * Called during app startup to restore persisted preferences
 * Requires access to CONFIG from config.js
 */
export function initMicroSettings(config) {
  const MS = config.MICRO_SETTINGS;
  
  // Helper function for reading boolean preferences
  const loadBoolPref = (key, defaultVal) => {
    const val = localStorage.getItem(key);
    return val === null ? defaultVal : val === 'true';
  };

  state.microSettings.effectsEnabled = loadBoolPref(MS.EFFECTS_ENABLED, true);
  state.microSettings.soundDefault = parseFloat(localStorage.getItem(MS.SOUND_DEFAULT)) || 0.55;
  state.microSettings.popupIntensity = parseInt(localStorage.getItem(MS.POPUP_INTENSITY)) || 100;
  state.microSettings.sessionResumeEnabled = loadBoolPref(MS.SESSION_RESUME_ENABLED, false);
  
  const lastTab = localStorage.getItem(MS.LAST_VISITED_TAB);
  if (lastTab) {
    try {
      state.microSettings.lastVisitedTab = JSON.parse(lastTab);
    } catch (e) {
      state.microSettings.lastVisitedTab = null;
    }
  }

  // Apply effectsEnabled to document
  if (!state.microSettings.effectsEnabled) {
    document.documentElement.dataset.reducedEffects = 'true';
  }
}

/**
 * Save the current section/tab for session resume
 */
export function saveCurrentTab(sectionId) {
  if (!sectionId) return;
  
  // Update state
  state.microSettings.lastVisitedTab = {
    sectionId,
    timestamp: Date.now()
  };
  
  // Persist to localStorage
  try {
    localStorage.setItem(
      'microSettingsLastVisitedTab',
      JSON.stringify(state.microSettings.lastVisitedTab)
    );
  } catch (e) {
    console.warn('Failed to save last visited tab:', e);
  }
}

/**
 * Get the last visited tab if session resume is enabled
 */
export function getLastVisitedTab() {
  if (!state.microSettings.sessionResumeEnabled) return null;
  return state.microSettings.lastVisitedTab;
}

/**
 * Setup session resume tracking
 * Call this during homepage initialization to track navigation
 */
export function setupSessionResume() {
  // Track clicks on section links
  const sectionLinks = document.querySelectorAll('[data-section-id], [href*="games"], [href*="esoteric"], [href*="about"], [href*="cartoons"]');
  
  sectionLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Extract section ID from link attributes or href
      const sectionId = link.getAttribute('data-section-id') || 
                       link.getAttribute('href')?.split('/')[1] || 
                       link.textContent?.toLowerCase() || 'unknown';
      saveCurrentTab(sectionId);
    });
  });
}
