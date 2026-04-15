export const CONFIG = {
  // Popup settings
  POPUP_INTERVAL_MS: 1000,
  POPUP_INTERVAL_CHILL: 4000,
  POPUP_INTERVAL_REDUCED: 8000,
  POPUP_LIFETIME_MS: 9500,
  MAX_POPUPS: 200,
  NON_OVERLAP_ATTEMPTS: 30,

  // Animation intervals
  GLITCH_INTERVAL_DEFAULT: 300,
  GLITCH_INTERVAL_CHILL: 700,
  GLITCH_INTERVAL_REDUCED: 1600,

  // Word stream (continuous blurb ticker)
  WORD_STREAM_INTERVAL_DEFAULT: 380,
  WORD_STREAM_INTERVAL_CHILL: 650,
  WORD_STREAM_INTERVAL_REDUCED: 950,

  MORPH_INTERVAL_DEFAULT: 2500,
  MORPH_INTERVAL_CHILL: 5000,
  MORPH_INTERVAL_REDUCED: 10000,

  // Morph burst configuration (used instead of a constant interval)
  MORPH_BURST_INTERVAL_DEFAULT: 30000,
  MORPH_BURST_INTERVAL_CHILL: 60000,
  MORPH_BURST_INTERVAL_REDUCED: 90000,
  MORPH_BURST_DURATION_DEFAULT: 5000,
  MORPH_BURST_DURATION_CHILL: 10000,
  MORPH_BURST_DURATION_REDUCED: 15000,
  MORPH_BURST_STEP_DEFAULT: 500,
  MORPH_BURST_STEP_CHILL: 1000,
  MORPH_BURST_STEP_REDUCED: 1500,

  // Timing durations (ms)
  OVERLAY_FADE_DURATION: 190,
  GLITCH_WORD_MIN_DURATION: 220,
  GLITCH_WORD_MAX_DURATION: 900,
  MUSIC_FADE_DURATION: 1800,
  SFX_MIN_INTERVAL: 90,

  // Mouse idle timeout (ms) before animations pause
  MOUSE_IDLE_TIMEOUT: 1500,

  // Progressive blurb reveal configuration
  POINTER_REVEAL_MIN_INTERVAL: 140,
  POINTER_REVEAL_MIN_DISTANCE: 36,
  SCROLL_REVEAL_MIN_INTERVAL: 180,

  // Audio settings
  MUSIC_TARGET_VOLUME: 0.65,
  SFX_BASE_VOLUME: 0.55,

  // LocalStorage keys
  STORAGE_KEYS: {
    AGE_GATE_PROFILE: 'ageGateProfile',
    MUSIC_ENABLED: 'musicEnabled',
    AMBIENT_RADIO_PROGRESS: 'ambientRadioProgress',
    SFX_ENABLED: 'sfxEnabled',
    CHILL_MODE: 'chillMode',
    POPUPS_PAUSED: 'popupsPaused'
  },

  AMBIENT_RADIO: {
    STARTER_CHANNEL_COUNT: 2,
    CHANNELS: [
      {
        id: 'mist',
        label: 'Neon Mist',
        description: 'Groove Salad — ambient/trip-hop drift for focus sessions.',
        streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
        unlock: { dwellSeconds: 0, interactions: 0, plays: 0 }
      },
      {
        id: 'pulse',
        label: 'Signal Pulse',
        description: 'Space Station Soma — late-night transmissions from orbit.',
        streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
        unlock: { dwellSeconds: 0, interactions: 0, plays: 0 }
      },
      {
        id: 'nocturne',
        label: 'Nocturne Field',
        description: 'Drone Zone — deep dark ambient. Unlocked through dwell.',
        streamUrl: 'https://ice1.somafm.com/dronezone-256-mp3',
        unlock: { dwellSeconds: 300, interactions: 40, plays: 3 }
      },
      {
        id: 'afterglow',
        label: 'Afterglow Tape',
        description: 'The Trip — psychedelic/prog transmissions. Long-session unlock.',
        streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3',
        unlock: { dwellSeconds: 600, interactions: 80, plays: 6 }
      }
    ]
  },

  // Micro Settings Panel keys
  MICRO_SETTINGS: {
    EFFECTS_ENABLED: 'microSettingsEffectsEnabled',
    SOUND_DEFAULT: 'microSettingsSoundDefault',
    POPUP_INTENSITY: 'microSettingsPopupIntensity',
    SESSION_RESUME_ENABLED: 'microSettingsSessionResumeEnabled',
    LAST_VISITED_TAB: 'microSettingsLastVisitedTab'
  }
};

export const ICON_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALklEQVQoka3OMQ0AAAzDsPnfpM1Yip5JRGCBqgMFBQUFBQUFBQUFBQUFBSUlG8mG6tD3oxAAAAAElFTkSuQmCC";

export const ADS = [
  { label: "SHOP • REDBUBBLE", href: "https://www.redbubble.com/shop/ap/174665816?asc=u", gif: "https://media.giphy.com/media/R7roNpEGCKqzjs1kkO/giphy.gif" },
  { label: "NOCTIS REVERIE", href: "https://420360.xyz/games/noctis-reverie/index.html", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "247420", href: "https://discord.gg/an-entrypoint-367741339393327104", gif: "https://media.giphy.com/media/DfqSbJVYLHmO8QFn1R/giphy.gif" },
  { label: "GIPHY", href: "https://giphy.com/woodmurderedhat", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "WOODMURDEREDHAT", href: "https://github.com/woodmurderedhat", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@woodenhat", gif: "https://media.giphy.com/media/JeEjGpM2TVZGaM5BuE/giphy.gif" },
  { label: "FRIDAY", href: "#", gif: "https://media.giphy.com/media/3PLAXg1osLVVttjRTN/giphy.gif" },
  { label: "SATURDAY", href: "#", gif: "https://media.giphy.com/media/WveGOgFwcI6uTn2khE/giphy.gif" },
  { label: "PEARL WHAT?", href: "https://www.youtube.com/watch?v=DXS6NbEAkLM", gif: "https://media.giphy.com/media/eYDnuFt0MckAb3xdSH/giphy.gif" },
  { label: "ZEF SHELLED#", href: "#", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "MOAN-AH", href: "https://www.youtube.com/watch?v=wo5QBEux8nk", gif: "https://media.giphy.com/media/DfqSbJVYLHmO8QFn1R/giphy.gif" },
  { label: "WEDNESDAY", href: "#", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "WAR ART", href: "#", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" },
  { label: "ZEF DEMONS", href: "#", gif: "https://media.giphy.com/media/JeEjGpM2TVZGaM5BuE/giphy.gif" },
  { label: "SCHIZODIO", href: "https://schizodio.xyz/brobaker", gif: "https://media.giphy.com/media/8Javw7WzqetpyiT3ls/giphy.gif" },
  { label: "SHADOW PROTOCOL", href: "https://420360.xyz/null-vesper/shadow-protocol/", gif: "https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif" },
  { label: "TIM ORACLE", href: "__INTERNAL_ORACLE__", gif: "https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif" },
  { label: "DAUGHTERS OF ZION", href: "https://420360.xyz/esoteric/daughters-of-zion/index.html", gif: "https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif" }
];

export const POPUP_COLOR_SCHEMES = [
  { bg: '#2a1a1a', primary: '#cc3333', secondary: '#8b2635', highlight: '#ff6666' },
  { bg: '#2a2a1a', primary: '#cccc33', secondary: '#8b8b35', highlight: '#ffff66' },
  { bg: '#1a2a1a', primary: '#4a8c3a', secondary: '#7b5e8b', highlight: '#8fbc8f' },
  { bg: '#1a1a1a', primary: '#666666', secondary: '#444444', highlight: '#cccccc' }
];
