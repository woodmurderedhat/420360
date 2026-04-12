export function startHomepageBootstrap({
  state,
  config,
  ensureAgeGateAccess,
  loadAgeGateProfile,
  isAgeGateValid,
  getRegionMinimumAge,
  saveAgeGateProfile,
  textSystem,
  modeControls,
  interactionSystem,
  musicSystem,
  sfxSystem,
  overlaySystem,
  popupSystem,
  randomizeColors,
  startIntervals,
  stopIntervals
}) {
  function init() {
    if (state.initialized) return;

    const gateResult = ensureAgeGateAccess({
      storageKey: config.STORAGE_KEYS.AGE_GATE_PROFILE,
      loadAgeGateProfile,
      isAgeGateValid,
      getRegionMinimumAge,
      saveAgeGateProfile,
      onAccessGranted: init
    });
    if (gateResult.blocked) return;

    state.initialized = true;

    state.sentences = (Array.isArray(window.SENTENCES) && window.SENTENCES.length)
      ? window.SENTENCES.filter(s => typeof s === 'string' && s.trim())
      : [];

    textSystem.initWordStream();
    modeControls.loadUserPreferences();
    interactionSystem.setupControlButtons();
    interactionSystem.setupEventHandlers();

    musicSystem.init();
    sfxSystem.init();

    overlaySystem.createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);

    randomizeColors();
    startIntervals();

    setInterval(() => {
      if (Math.random() < 0.5) popupSystem.randomPopupGlitchOut();
    }, 4500 + Math.random() * 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
