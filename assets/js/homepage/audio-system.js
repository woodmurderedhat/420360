export function createSfxSystem({ state, config, loadPreference, savePreference }) {
  return {
    ctrl: null,
    status: null,
    lastPlay: 0,
    pool: [],

    SFX_FILES: [
      'BreakBeat_Slice01.wav', 'BreakBeat_Slice02.wav', 'BreakBeat_Slice03.wav', 'BreakBeat_Slice04.wav',
      'Clap02.wav', 'Clap03.wav', 'Clap04.wav', 'Clap05.wav', 'Clap06.wav'
    ],

    init() {
      this.ctrl = document.getElementById('sfx-control');
      this.status = document.getElementById('sfx-status');

      if (!this.ctrl) return;

      state.sfxEnabled = loadPreference(config.STORAGE_KEYS.SFX_ENABLED, false);

      this.pool = this.SFX_FILES.map(f => {
        const a = new Audio('assets/sounds/' + f);
        a.preload = 'auto';
        return a;
      });

      this.setupEventListeners();
      this.updateUI();

      window.playAdSfx = () => this.play();
    },

    setupEventListeners() {
      this.ctrl.addEventListener('click', e => {
        e.stopPropagation();
        this.toggle();
      });

      this.ctrl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });

      window.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 's' || e.key === 'S') this.toggle();
      });

      const prime = () => {
        this.pool.forEach(a => {
          try {
            a.muted = true;
            a.play().then(() => {
              a.pause();
              a.currentTime = 0;
              a.muted = false;
            }).catch(() => {});
          } catch (e) {}
        });
        window.removeEventListener('click', prime);
        window.removeEventListener('keydown', prime);
      };
      window.addEventListener('click', prime);
      window.addEventListener('keydown', prime);
    },

    updateUI() {
      if (!this.status) return;
      this.status.textContent = 'SFX: ' + (state.sfxEnabled ? 'ON' : 'OFF');
      this.ctrl.setAttribute('aria-pressed', String(state.sfxEnabled));
    },

    play() {
      if (!state.sfxEnabled) return;

      const now = Date.now();
      if (now - this.lastPlay < config.SFX_MIN_INTERVAL) return;
      this.lastPlay = now;

      const base = this.pool[Math.floor(Math.random() * this.pool.length)];
      try {
        const inst = base.cloneNode();
        inst.volume = config.SFX_BASE_VOLUME * (0.85 + Math.random() * 0.3);
        inst.playbackRate = 0.95 + Math.random() * 0.1;
        inst.play().catch(() => {});
      } catch (e) {}
    },

    toggle() {
      state.sfxEnabled = !state.sfxEnabled;
      this.updateUI();
      savePreference(config.STORAGE_KEYS.SFX_ENABLED, state.sfxEnabled);
    }
  };
}
