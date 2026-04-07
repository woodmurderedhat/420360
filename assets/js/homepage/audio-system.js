export function createMusicSystem({ state, config, loadPreference, savePreference }) {
  return {
    audio: null,
    ctrl: null,
    status: null,
    attempting: false,
    ready: false,

    init() {
      this.audio = document.getElementById('bgMusic');
      this.ctrl = document.getElementById('music-control');
      this.status = document.getElementById('music-status');

      if (!this.audio || !this.ctrl) return;

      state.musicEnabled = loadPreference(config.STORAGE_KEYS.MUSIC_ENABLED, false);

      this.setupEventListeners();
      this.normalizeAudioSource();
      this.updateUI();

      setInterval(() => {
        if (Math.random() < 0.33 && state.mouseActive) this.glitchButton();
      }, 2400);
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
        if (e.key === 'm' || e.key === 'M') this.toggle();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (!this.audio.paused) this.audio._wasPlaying = true;
          this.audio.pause();
        } else if (this.audio._wasPlaying && state.musicEnabled) {
          this.audio.play().catch(() => {});
        }
        if (!document.hidden) this.audio._wasPlaying = false;
        this.updateUI();
      });

      const firstGesture = () => {
        if (state.musicEnabled && this.audio.paused) this.play();
        window.removeEventListener('click', firstGesture);
        window.removeEventListener('keydown', firstGesture);
      };
      window.addEventListener('click', firstGesture);
      window.addEventListener('keydown', firstGesture);

      this.audio.addEventListener('canplaythrough', () => {
        this.ready = true;
        if (state.musicEnabled) this.play();
      }, { once: true });

      this.audio.addEventListener('error', () => {
        setTimeout(() => {
          if (!this.ready) {
            try { this.audio.load(); } catch (e) {}
          }
        }, 1800);
      });

      setTimeout(() => {
        if (state.musicEnabled && !this.ready && this.audio.paused) this.play();
      }, 2500);
    },

    normalizeAudioSource() {
      if (!this.audio.getAttribute('data-src-set')) {
        const srcTag = this.audio.querySelector('source');
        if (srcTag) {
          const raw = srcTag.getAttribute('src');
          if (raw) this.audio.src = encodeURI(raw);
          this.audio.setAttribute('data-src-set', '1');
        }
      }
      try { this.audio.load(); } catch (e) {}
    },

    updateUI() {
      if (!this.status) return;
      const on = !this.audio.paused && !this.audio.ended;
      this.status.textContent = 'MUSIC: ' + (on ? 'ON' : 'OFF');
      this.ctrl.setAttribute('aria-pressed', String(on));
    },

    fadeTo(targetVol, ms = 1200) {
      const steps = 30;
      const start = this.audio.volume;
      const delta = targetVol - start;
      let i = 0;

      clearInterval(this.audio._fadeInt);
      this.audio._fadeInt = setInterval(() => {
        i++;
        this.audio.volume = Math.min(1, Math.max(0, start + delta * (i / steps)));
        if (i >= steps) clearInterval(this.audio._fadeInt);
      }, ms / steps);
    },

    async play() {
      if (this.attempting) return;
      this.attempting = true;

      try {
        this.audio.volume = 0;
        await this.audio.play();
        this.fadeTo(config.MUSIC_TARGET_VOLUME, config.MUSIC_FADE_DURATION);
        state.musicEnabled = true;
      } catch (err) {
      } finally {
        this.attempting = false;
        this.updateUI();
      }
    },

    stop() {
      this.audio.pause();
      this.updateUI();
    },

    toggle() {
      if (this.audio.paused) {
        state.musicEnabled = true;
        this.play();
        savePreference(config.STORAGE_KEYS.MUSIC_ENABLED, true);
      } else {
        state.musicEnabled = false;
        this.stop();
        savePreference(config.STORAGE_KEYS.MUSIC_ENABLED, false);
      }
    },

    glitchButton() {
      if (this.ctrl.classList.contains('glitching')) return;
      this.ctrl.classList.add('glitching');
      setTimeout(() => this.ctrl.classList.remove('glitching'), 260);
    }
  };
}

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
