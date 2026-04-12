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
