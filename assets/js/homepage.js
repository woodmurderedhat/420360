/**
 * 420360 Homepage JavaScript
 * Extracted and improved from index.html
 * 
 * Features:
 * - Popup system with spawn control
 * - Overlay windows for content
 * - Music & SFX system with persistence
 * - Chill mode for reduced animations
 * - Accessibility improvements
 */

import { CONFIG, ICON_DATA, ADS, POPUP_COLOR_SCHEMES } from './homepage/config.js';
import { state, initMicroSettings, setupSessionResume } from './homepage/state.js';
import { loadPreference, savePreference } from './homepage/storage.js';
import {
  getRegionMinimumAge,
  loadAgeGateProfile,
  saveAgeGateProfile,
  isAgeGateValid
} from './homepage/age-gate.js';
import { createIntervalManager } from './homepage/interval-manager.js';
import { createMusicSystem, createSfxSystem } from './homepage/audio-system.js';
import { ensureAgeGateAccess } from './homepage/init-flow.js';
import { createPopupSystem } from './homepage/popup-system.js';
import { createBlurbSystem } from './homepage/blurb/system.js';
import { createOverlaySystem } from './homepage/overlay-system.js';
import { createInteractionSystem } from './homepage/interaction-system.js';
import { createVisualEffects } from './homepage/visual-effects.js';
import { createModeControls } from './homepage/mode-controls.js';
import { startHomepageBootstrap } from './homepage/bootstrap.js';
import { createHomepageActions } from './homepage/actions.js';
import { initAddons } from './homepage/addons/index.js';
import { createTaskbar } from './homepage/taskbar.js';


/* ============================================
  SENTENCES FOR BLURB
  ============================================ */
function resolveInitialSentencePool() {
  if (typeof window === 'undefined') return [];
  if (!Array.isArray(window.SENTENCES)) return [];
  return window.SENTENCES.filter(s => typeof s === 'string' && s.trim());
}

/* ============================================
   AD/POPUP DATA
   ============================================ */

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, m => escapeMap[m]);
}


const initialSentencePool = resolveInitialSentencePool();

const blurb = createBlurbSystem({
  state,
  config: CONFIG,
  sentencePool: initialSentencePool,
  getSentencesFallback: resolveInitialSentencePool,
  allowExternalSentencePoolUpdates: false,
  hooks: {
    onWarning: info => {
      console.warn('[blurb]', info?.message || 'Unknown warning', info?.details || '');
    }
  }
});

const visualEffects = createVisualEffects({ state });

// ======== burst control ========


/* ============================================
   POPUP MANAGEMENT SYSTEM
   ============================================ */

const overlaySystem = createOverlaySystem({
  config: CONFIG,
  state,
  escapeHtml,
  pauseBackground: () => intervalManager.pauseBackground(),
  startIntervals: () => intervalManager.startIntervals()
});

const popupSystem = createPopupSystem({
  state,
  config: CONFIG,
  ads: ADS,
  iconData: ICON_DATA,
  popupColorSchemes: POPUP_COLOR_SCHEMES,
  escapeHtml,
  onOpenOracle: () => overlaySystem.openOracle(),
  getGlitchContext: () => {
    const engine = window.glitchEngineV2;
    if (!engine) return null;
    if (typeof engine.getRecentTriggerContext === 'function') {
      const recent = engine.getRecentTriggerContext();
      if (recent) return recent;
    }
    if (typeof engine.getDiagnostics === 'function') {
      return engine.getDiagnostics();
    }
    return null;
  }
});

/* ============================================
   INTERVAL MANAGEMENT
   ============================================ */

const intervalManager = createIntervalManager({
  state,
  config: CONFIG,
  spawnPopup: popupSystem.spawnPopup,
  blurb,
  startColorChaos: visualEffects.startColorChaos,
  stopColorChaos: visualEffects.stopColorChaos
});

const modeControls = createModeControls({
  state,
  config: CONFIG,
  loadPreference,
  savePreference,
  intervalManager,
  popupSystem,
  onChillModeChanged: () => visualEffects.onChillModeChanged()
});

/* ============================================
   MUSIC SYSTEM
   ============================================ */

const MusicSystem = createMusicSystem({
  state,
  config: CONFIG,
  loadPreference,
  savePreference
});

/* ============================================
   SFX SYSTEM
   ============================================ */

const SFXSystem = createSfxSystem({
  state,
  config: CONFIG,
  loadPreference,
  savePreference
});

const actions = createHomepageActions({ overlaySystem });

const interactionSystem = createInteractionSystem({
  state,
  config: CONFIG,
  openAbout: overlaySystem.openAbout,
  openGamesIndex: overlaySystem.openGamesIndex,
  openBoardIndex: overlaySystem.openBoardIndex,
  openEsotericHub: overlaySystem.openEsotericHub,
  openMovieReviews: overlaySystem.openMovieReviews,
  openDaughtersIndex: overlaySystem.openDaughtersIndex,
  openOracle: overlaySystem.openOracle,
  openIssues: actions.openIssues,
  toggleVideoWindow: actions.toggleVideoWindow,
  toggleCommunePanel: () => window._toggleCommunePanel?.(),
  toggleChillMode: modeControls.toggleChillMode,
  togglePopupPause: modeControls.togglePopupPause,
  closeOverlay: overlaySystem.closeOverlay,
  openGameOverlay: overlaySystem.openGameOverlay,
  openContentOverlay: overlaySystem.openContentOverlay,
  startIntervals: () => intervalManager.startIntervals(),
  stopIntervals: () => intervalManager.stopIntervals(),
  hasOpenOverlay: overlaySystem.hasOpenOverlay,
  spawnPopup: popupSystem.spawnPopup,
  startButtonChaos: visualEffects.startButtonChaos,
  stopButtonChaos: visualEffects.stopButtonChaos,
  triggerControlChaosPulse: visualEffects.triggerControlChaosPulse
});

// Build the taskbar in the DOM before bootstrap runs setupControlButtons()
createTaskbar();

// Initialize Micro Settings from localStorage
initMicroSettings(CONFIG);

// Setup session resume tracking
setupSessionResume();

// Expose state globally for game-sounds.js and other modules
window.__microSettingsState = state;

startHomepageBootstrap({
  state,
  config: CONFIG,
  ensureAgeGateAccess,
  loadAgeGateProfile,
  isAgeGateValid,
  getRegionMinimumAge,
  saveAgeGateProfile,
  blurb,
  initialSentencePool: blurb.getSentencePool(),
  modeControls,
  interactionSystem,
  musicSystem: MusicSystem,
  sfxSystem: SFXSystem,
  overlaySystem,
  popupSystem,
  randomizeColors: visualEffects.randomizeColors,
  startIntervals: () => intervalManager.startIntervals(),
  onStarted: () => {
    // Addons are loaded after boot so they don't block initial render.
    initAddons({ blurb });
  }
});

