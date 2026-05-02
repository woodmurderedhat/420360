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
  calendarPopupSystem,
  randomizeColors,
  startIntervals,
  onStarted
}) {
  function setHomepageReadyState(ready) {
    if (!document.body) return;
    document.body.classList.toggle('homepage-ready', !!ready);
  }

  function init() {
    if (state.initialized) return;

    setHomepageReadyState(false);

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
      setHomepageReadyState(true);
      return;
    }
    blurb.start();
    modeControls.loadUserPreferences();
    interactionSystem.setupControlButtons();
    interactionSystem.setupEventHandlers();

    ambientRadioSystem.init();
    sfxSystem.init();

    randomizeColors();
    calendarPopupSystem?.showToday();
    startIntervals();

    setInterval(() => {
      if (Math.random() < 0.5) popupSystem.randomPopupGlitchOut();
    }, 4500 + Math.random() * 6000);

    if (typeof onStarted === 'function') onStarted();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHomepageReadyState(true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
