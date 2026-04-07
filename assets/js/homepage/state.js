export const state = {
  // User preferences (loaded from localStorage)
  musicEnabled: true,
  sfxEnabled: true,
  chillMode: false,
  popupsPaused: false,

  // Runtime state
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
  mouseActive: false,
  mouseIdleTimeoutId: null,
  intervalIds: {
    popup: null,
    glitch: null,
    morph: null
  },

  // Burst control IDs for rapid sentence morphing
  burstIntervalId: null,
  morphStepId: null,
  burstTimeoutId: null,
  burstActive: false,
  initialized: false,
  sentences: [],

  activePopups: [],
  currentSentence: '',
  videoWindowLoaded: false,

  progressiveReveal: {
    enabled: true,
    words: [],
    revealedCount: 1,
    lastRevealAt: 0
  }
};
