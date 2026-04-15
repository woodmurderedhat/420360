export function startHomepageBootstrap({
  state,
  config,
  ensureAgeGateAccess,
  loadAgeGateProfile,
  isAgeGateValid,
  getRegionMinimumAge,
  saveAgeGateProfile,
  blurb,
  initialSentencePool = [],
  modeControls,
  interactionSystem,
  ambientRadioSystem,
  sfxSystem,
  overlaySystem,
  popupSystem,
  randomizeColors,
  startIntervals,
  onStarted
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

    state.sentences = Array.isArray(initialSentencePool)
      ? initialSentencePool.filter(s => typeof s === 'string' && s.trim())
      : [];

    if (!blurb || typeof blurb.start !== 'function') {
      console.warn('[blurb] Missing start() implementation on injected blurb API.');
      return;
    }
    blurb.start();
    modeControls.loadUserPreferences();
    interactionSystem.setupControlButtons();
    interactionSystem.setupEventHandlers();

    ambientRadioSystem.init();
    sfxSystem.init();

    overlaySystem.createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);

    randomizeColors();
    startIntervals();

    setInterval(() => {
      if (Math.random() < 0.5) popupSystem.randomPopupGlitchOut();
    }, 4500 + Math.random() * 6000);

    if (typeof onStarted === 'function') onStarted();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
