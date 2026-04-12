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
import { state } from './homepage/state.js';
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
import { createTextSystem } from './homepage/text-system.js';
import { createOverlaySystem } from './homepage/overlay-system.js';
import { createInteractionSystem } from './homepage/interaction-system.js';
import { createVisualEffects } from './homepage/visual-effects.js';
import { createModeControls } from './homepage/mode-controls.js';
import { startHomepageBootstrap } from './homepage/bootstrap.js';
import { createHomepageActions } from './homepage/actions.js';
import { initAddons } from './homepage/addons/index.js';
import { createTaskbar } from './homepage/taskbar.js';


/* ============================================
  SENTENCES FOR BLURB (global, loaded via script)
  ============================================ */
// SENTENCES is now loaded globally from sentences.js

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


const textSystem = createTextSystem({
  state,
  config: CONFIG,
  getSentencesFallback: () => (
    typeof window !== 'undefined' && Array.isArray(window.SENTENCES)
      ? window.SENTENCES
      : []
  )
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
  glitchRandomWord: textSystem.glitchRandomWord,
  streamNextWord: textSystem.streamNextWord,
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

// Addons are loaded after boot so they don't block the initial render
initAddons({ textSystem });

// Build the taskbar in the DOM before bootstrap runs setupControlButtons()
createTaskbar();

startHomepageBootstrap({
  state,
  config: CONFIG,
  ensureAgeGateAccess,
  loadAgeGateProfile,
  isAgeGateValid,
  getRegionMinimumAge,
  saveAgeGateProfile,
  textSystem,
  modeControls,
  interactionSystem,
  musicSystem: MusicSystem,
  sfxSystem: SFXSystem,
  overlaySystem,
  popupSystem,
  randomizeColors: visualEffects.randomizeColors,
  stopIntervals: () => intervalManager.stopIntervals()
});

