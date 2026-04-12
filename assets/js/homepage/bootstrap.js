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
  function getThemeSentences() {
    return [
      '420360 is now a cannabis-first arcade dreamspace. Neon smoke drifts through popup windows, cartridges hum in the background, and each click opens a new chill loop between play, art, and curiosity.',
      'Roll into the glitch: this is where marijuana culture meets 90s browser chaos. Spark up your focus, surf retro controls, and let pixel storms turn into late-night stoner mythology.',
      'No gatekeeping, no hard sell, just a mellow digital hangout for adults. Browse weird experiments, launch arcade runs, and settle into a paced, low-pressure cannabis vibe.',
      'Chill mode is a ritual here: breathe, play, and drift. 420360 treats the web like a smoke circle made of code, memory, and bright analog nostalgia.'
    ];
  }

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

    state.sentences = (typeof window !== 'undefined' && Array.isArray(window.SENTENCES) && window.SENTENCES.length)
      ? window.SENTENCES.filter(s => typeof s === 'string' && s.trim())
      : getThemeSentences();

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
