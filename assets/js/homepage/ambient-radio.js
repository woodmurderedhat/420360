function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function defaultProgress(channels, starterCount) {
  const unlocked = channels.slice(0, starterCount).map(channel => channel.id);
  return {
    plays: 0,
    interactions: 0,
    dwellSeconds: 0,
    unlockedChannelIds: unlocked,
    currentChannelId: unlocked[0] || (channels[0] && channels[0].id) || null
  };
}

function asHoursMinutes(seconds) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs < 1) return `${mins}m`;
  return `${hrs}h ${mins % 60}m`;
}


export function createAmbientRadioSystem({ state, config, loadPreference, savePreference }) {
  const ambientConfig = config.AMBIENT_RADIO || {};
  const channels = Array.isArray(ambientConfig.CHANNELS) ? ambientConfig.CHANNELS : [];
  const starterCount = clamp(ambientConfig.STARTER_CHANNEL_COUNT || 2, 1, Math.max(1, channels.length));
  const storageKeys = {
    enabled: config.STORAGE_KEYS.MUSIC_ENABLED,
    progress: config.STORAGE_KEYS.AMBIENT_RADIO_PROGRESS
  };

  return {
    ctrl: null,
    status: null,
    widget: null,
    fallbackAudio: null,
    audioCtx: null,
    analyser: null,
    vizRaf: null,
    vizFreqData: null,
    vizPaletteCache: null,
    vizPaletteTick: 0,
    vizResizeObserver: null,
    vizLastFrameAt: 0,
    vizPausedForHidden: false,
    isOpen: false,
    mode: 'idle',
    dwellInterval: null,
    isAttemptingPlay: false,
    resumeOnVisible: false,
    progress: defaultProgress(channels, starterCount),
    ui: {
      currentChannel: null,
      channelMeta: null,
      unlockCount: null,
      dwellValue: null,
      interactionsValue: null,
      playsValue: null,
      statusLine: null,
      sourceLine: null,
      playToggle: null,
      nextButton: null,
      closeButton: null,
      visualizer: null
    },

    init() {
      this.ctrl = document.getElementById('music-control');
      this.status = document.getElementById('music-status');
      this.fallbackAudio = document.getElementById('bgMusic');

      if (!this.ctrl) return;

      this.progress = this.loadProgress();
      state.musicEnabled = loadPreference(storageKeys.enabled, false);

      this.buildWidget();
      this.setupControlBindings();
      this.setupActivityTracking();
      this.applyUnlocks();
      this.refreshWidget();

      if (this.fallbackAudio) {
        this.fallbackAudio.volume = config.MUSIC_TARGET_VOLUME;
        this.fallbackAudio.preload = 'metadata';
      }

      if (state.musicEnabled) {
        this.mode = 'idle';
      }

      this.updateStatus();
    },

    loadProgress() {
      const fallback = defaultProgress(channels, starterCount);
      let raw = '';
      try {
        raw = localStorage.getItem(storageKeys.progress) || '';
      } catch (err) {
        raw = '';
      }
      const saved = safeJsonParse(raw, fallback);
      if (!saved || typeof saved !== 'object') return fallback;

      const merged = {
        plays: Number(saved.plays) || 0,
        interactions: Number(saved.interactions) || 0,
        dwellSeconds: Number(saved.dwellSeconds) || 0,
        unlockedChannelIds: Array.isArray(saved.unlockedChannelIds) ? saved.unlockedChannelIds.slice() : fallback.unlockedChannelIds.slice(),
        currentChannelId: typeof saved.currentChannelId === 'string' ? saved.currentChannelId : fallback.currentChannelId
      };

      const knownIds = new Set(channels.map(channel => channel.id));
      merged.unlockedChannelIds = merged.unlockedChannelIds.filter(id => knownIds.has(id));

      channels.slice(0, starterCount).forEach(channel => {
        if (!merged.unlockedChannelIds.includes(channel.id)) merged.unlockedChannelIds.push(channel.id);
      });

      if (!merged.currentChannelId || !knownIds.has(merged.currentChannelId)) {
        merged.currentChannelId = merged.unlockedChannelIds[0] || (channels[0] && channels[0].id) || null;
      }

      return merged;
    },

    saveProgress() {
      try {
        localStorage.setItem(storageKeys.progress, JSON.stringify(this.progress));
      } catch (err) {
        console.warn('Failed to save ambient radio progress');
      }
    },

    buildWidget() {
      if (this.widget) return;

      const taskbar = document.getElementById('taskbar');
      if (!taskbar) return;

      this.widget = document.createElement('div');
      this.widget.id = 'ambient-radio-widget';
      this.widget.hidden = true;
      this.widget.setAttribute('role', 'dialog');
      this.widget.setAttribute('aria-label', 'Ambient radio and track roulette');

      this.widget.innerHTML = `
        <div id="arw-header">
          <span id="arw-title">// AMBIENT RADIO //</span>
          <button id="arw-close" type="button" aria-label="Close ambient radio widget">[-]</button>
        </div>
        <div id="arw-subline">ROTATING SIGNAL CHANNELS + TRACK ROULETTE</div>

        <div class="arw-section">
          <div class="arw-section-label">-- CHANNEL --</div>
          <div id="arw-current-channel">Signal channel loading...</div>
          <div id="arw-channel-meta"></div>
        </div>

        <div class="arw-section">
          <div class="arw-section-label">-- ROULETTE PROGRESS --</div>
          <div id="arw-unlock-count"></div>
          <div class="arw-stat-grid">
            <span id="arw-stat-dwell"></span>
            <span id="arw-stat-interactions"></span>
            <span id="arw-stat-plays"></span>
          </div>
        </div>

        <div class="arw-section">
          <div class="arw-section-label">-- SIGNAL STATUS --</div>
          <div id="arw-status-line"></div>
          <div id="arw-source-line"></div>
        </div>

        <div id="arw-controls">
          <button id="arw-play-toggle" type="button">PLAY</button>
          <button id="arw-next-channel" type="button">NEXT CHANNEL</button>
        </div>

        <canvas id="arw-visualizer" aria-hidden="true" width="270" height="28"></canvas>

      `;

      taskbar.appendChild(this.widget);

      this.ui.currentChannel = this.widget.querySelector('#arw-current-channel');
      this.ui.channelMeta = this.widget.querySelector('#arw-channel-meta');
      this.ui.unlockCount = this.widget.querySelector('#arw-unlock-count');
      this.ui.dwellValue = this.widget.querySelector('#arw-stat-dwell');
      this.ui.interactionsValue = this.widget.querySelector('#arw-stat-interactions');
      this.ui.playsValue = this.widget.querySelector('#arw-stat-plays');
      this.ui.statusLine = this.widget.querySelector('#arw-status-line');
      this.ui.sourceLine = this.widget.querySelector('#arw-source-line');
      this.ui.playToggle = this.widget.querySelector('#arw-play-toggle');
      this.ui.nextButton = this.widget.querySelector('#arw-next-channel');
      this.ui.closeButton = this.widget.querySelector('#arw-close');
      this.ui.visualizer = this.widget.querySelector('#arw-visualizer');

      this.setupVisualizerObservers();

      this.ui.playToggle?.addEventListener('click', evt => {
        evt.stopPropagation();
        this.togglePlayback();
      });
      this.ui.nextButton?.addEventListener('click', evt => {
        evt.stopPropagation();
        this.rotateChannel(true);
      });
      this.ui.closeButton?.addEventListener('click', evt => {
        evt.stopPropagation();
        this.closeWidget();
      });
    },

    setupControlBindings() {
      this.ctrl.addEventListener('click', evt => {
        evt.stopPropagation();
        this.toggleWidget();
      });

      this.ctrl.addEventListener('keydown', evt => {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          this.toggleWidget();
        }
      });

      window.addEventListener('keydown', evt => {
        if (evt.target?.tagName === 'INPUT' || evt.target?.tagName === 'TEXTAREA') return;
        if (evt.key === 'm' || evt.key === 'M') this.toggleWidget();
      });

      document.addEventListener('click', evt => {
        if (!this.isOpen || !this.widget) return;
        if (this.widget.contains(evt.target) || this.ctrl.contains(evt.target)) return;
        this.closeWidget();
      });

      document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape') this.closeWidget();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.resumeOnVisible = !!state.musicEnabled;
          this.pauseMediaOnly();
          return;
        }
        if (this.resumeOnVisible) {
          this.resumeOnVisible = false;
          this.startPlayback();
        }
      });

      window.addEventListener('resize', () => {
        this.resizeVisualizerCanvas();
      });
    },

    setupVisualizerObservers() {
      if (this.vizResizeObserver || typeof window.ResizeObserver !== 'function') return;
      const canvas = this.ui && this.ui.visualizer;
      if (!canvas) return;
      this.vizResizeObserver = new ResizeObserver(() => {
        this.resizeVisualizerCanvas();
      });
      this.vizResizeObserver.observe(canvas);
    },

    setupActivityTracking() {
      if (this.dwellInterval) clearInterval(this.dwellInterval);
      let dwellTicks = 0;
      this.dwellInterval = setInterval(() => {
        if (document.hidden) return;
        this.progress.dwellSeconds += 1;
        dwellTicks += 1;
        this.applyUnlocks();
        if (dwellTicks >= 15) {
          dwellTicks = 0;
          this.saveProgress();
        }
        this.refreshWidget();
      }, 1000);

      let interactionDelta = 0;
      const bumpInteraction = () => {
        this.progress.interactions += 1;
        interactionDelta += 1;
        this.applyUnlocks();
        if (interactionDelta >= 5) {
          interactionDelta = 0;
          this.saveProgress();
        }
        this.refreshWidget();
      };

      document.addEventListener('click', bumpInteraction, { passive: true });
      document.addEventListener('keydown', evt => {
        if (evt.key.length === 1 || evt.key === 'Enter') bumpInteraction();
      });

      window.addEventListener('beforeunload', () => this.saveProgress());
    },

    pauseMediaOnly() {
      if (this.fallbackAudio) {
        this.fallbackAudio.pause();
      }
      this.stopVisualizer();
    },

    ensureAudioContext() {
      if (this.audioCtx) return;
      if (!this.fallbackAudio) return;
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = this.audioCtx.createMediaElementSource(this.fallbackAudio);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.75;
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (err) {
        this.audioCtx = null;
        this.analyser = null;
      }
    },

    resizeVisualizerCanvas() {
      const canvas = this.ui && this.ui.visualizer;
      if (!canvas) return;

      const cssWidth = Math.floor(canvas.clientWidth || canvas.getBoundingClientRect().width || 270);
      const cssHeight = Math.floor(canvas.clientHeight || canvas.getBoundingClientRect().height || 28);
      const width = Math.max(96, cssWidth);
      const height = Math.max(20, cssHeight);

      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    },

    parseRgbColor(value) {
      if (!value || typeof value !== 'string') return null;
      const match = value.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (!match) return null;
      return [
        clamp(Number(match[1]) || 0, 0, 255),
        clamp(Number(match[2]) || 0, 0, 255),
        clamp(Number(match[3]) || 0, 0, 255)
      ];
    },

    rgbToCss(rgb, fallback) {
      if (!Array.isArray(rgb) || rgb.length < 3) return fallback;
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    },

    scaleRgb(rgb, factor) {
      if (!Array.isArray(rgb) || rgb.length < 3) return null;
      return rgb.map(v => clamp(Math.round(v * factor), 0, 255));
    },

    getVisualizerPalette() {
      const now = (window.performance && window.performance.now)
        ? window.performance.now()
        : Date.now();
      const cacheMs = this.isOpen ? 200 : 1000;
      if (this.vizPaletteCache && (now - this.vizPaletteTick) < cacheMs) {
        return this.vizPaletteCache;
      }

      const widgetStyle = this.widget ? window.getComputedStyle(this.widget) : null;
      const borderColor = widgetStyle
        ? (widgetStyle.borderLeftColor || widgetStyle.borderColor || '')
        : '';
      const borderRgb = this.parseRgbColor(borderColor) || [47, 217, 129];

      const canvas = this.ui && this.ui.visualizer;
      const bgColor = canvas ? window.getComputedStyle(canvas).backgroundColor : '';
      const bgRgb = this.parseRgbColor(bgColor) || [5, 15, 11];

      const dimRgb = this.scaleRgb(borderRgb, 0.3) || [13, 61, 34];

      const palette = {
        on: this.rgbToCss(borderRgb, '#2fd981'),
        dim: this.rgbToCss(dimRgb, '#0d3d22'),
        bg: this.rgbToCss(bgRgb, '#050f0b')
      };

      this.vizPaletteCache = palette;
      this.vizPaletteTick = now;
      return palette;
    },

    getVisualizerTargetFps() {
      if (!state.musicEnabled) return 0;
      if (!this.isOpen) return 0;
      return this.isOpen ? 24 : 6;
    },

    pauseVisualizerForHidden() {
      if (this.vizRaf) {
        cancelAnimationFrame(this.vizRaf);
        this.vizRaf = null;
      }
      this.vizLastFrameAt = 0;
      this.vizPausedForHidden = true;
    },

    resumeVisualizerFromHidden() {
      if (!this.vizPausedForHidden) return;
      if (!state.musicEnabled) {
        this.vizPausedForHidden = false;
        return;
      }
      if (!this.isOpen) return;
      this.vizPausedForHidden = false;
      this.startVisualizer();
    },

    startVisualizer() {
      this.stopVisualizer();
      const canvas = this.ui && this.ui.visualizer;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.resizeVisualizerCanvas();

      const BAR_W = 8;
      const MIN_GAP = 2;
      const PIXEL = 4;

      const draw = (timeStamp) => {
        this.vizRaf = requestAnimationFrame(draw);

        const fps = this.getVisualizerTargetFps();
        if (!fps) return;

        const now = typeof timeStamp === 'number'
          ? timeStamp
          : ((window.performance && window.performance.now) ? window.performance.now() : Date.now());
        const frameInterval = 1000 / fps;
        if (this.vizLastFrameAt && (now - this.vizLastFrameAt) < frameInterval) {
          return;
        }
        this.vizLastFrameAt = now;

        if (this.isOpen) {
          this.resizeVisualizerCanvas();
        }

        const W = canvas.width;
        const H = canvas.height;
        const palette = this.getVisualizerPalette();

        const roughCount = Math.floor(W / (BAR_W + MIN_GAP));
        const barCount = clamp(roughCount, 4, 64);
        const gapCount = Math.max(0, barCount - 1);
        const availableForGaps = Math.max(0, W - (barCount * BAR_W));
        const gap = gapCount > 0 ? Math.floor(availableForGaps / gapCount) : 0;
        const gapRemainder = gapCount > 0 ? (availableForGaps - (gap * gapCount)) : 0;

        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, W, H);

        let freqData = null;
        if (this.analyser) {
          if (!this.vizFreqData || this.vizFreqData.length !== this.analyser.frequencyBinCount) {
            this.vizFreqData = new Uint8Array(this.analyser.frequencyBinCount);
          }
          freqData = this.vizFreqData;
          this.analyser.getByteFrequencyData(freqData);
        }

        const totalPixels = Math.floor(H / PIXEL);

        let x = 0;
        for (let i = 0; i < barCount; i++) {
          let level = 0;

          if (freqData) {
            const binStart = Math.floor(i * freqData.length / barCount);
            const binEnd = Math.min(Math.ceil((i + 1) * freqData.length / barCount), freqData.length);
            let sum = 0;
            for (let b = binStart; b < binEnd; b++) sum += freqData[b];
            level = sum / ((binEnd - binStart) || 1) / 255;
          }

          const filledPixels = clamp(Math.round(level * totalPixels), 0, totalPixels);

          for (let p = 0; p < totalPixels; p++) {
            const py = H - (p + 1) * PIXEL;
            ctx.fillStyle = p < filledPixels ? palette.on : palette.dim;
            ctx.fillRect(x, py, BAR_W, PIXEL - 1);
          }

          x += BAR_W;
          if (i < gapCount) {
            x += gap + (i < gapRemainder ? 1 : 0);
          }
        }
      };

      draw();
    },

    stopVisualizer() {
      if (this.vizRaf) {
        cancelAnimationFrame(this.vizRaf);
        this.vizRaf = null;
      }
      this.vizLastFrameAt = 0;
      this.vizPausedForHidden = false;
      const canvas = this.ui && this.ui.visualizer;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.resizeVisualizerCanvas();
          const palette = this.getVisualizerPalette();
          ctx.fillStyle = palette.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    },

    getUnlockedChannels() {
      const unlocked = channels.filter(channel => this.progress.unlockedChannelIds.includes(channel.id));
      return unlocked.length ? unlocked : channels.slice(0, starterCount);
    },

    getCurrentChannel() {
      if (!channels.length) return null;
      const unlocked = this.getUnlockedChannels();
      const found = unlocked.find(channel => channel.id === this.progress.currentChannelId);
      if (found) return found;
      this.progress.currentChannelId = unlocked[0].id;
      this.saveProgress();
      return unlocked[0];
    },

    applyUnlocks() {
      let changed = false;
      channels.forEach((channel, index) => {
        if (index < starterCount) return;
        if (this.progress.unlockedChannelIds.includes(channel.id)) return;
        const unlock = channel.unlock || {};
        const dwellOk = (unlock.dwellSeconds || 0) <= this.progress.dwellSeconds;
        const interactionsOk = (unlock.interactions || 0) <= this.progress.interactions;
        const playsOk = (unlock.plays || 0) <= this.progress.plays;
        if (dwellOk && interactionsOk && playsOk) {
          this.progress.unlockedChannelIds.push(channel.id);
          changed = true;
        }
      });

      if (changed) {
        this.saveProgress();
      }
    },

    async playStream(channel) {
      if (!this.fallbackAudio) throw new Error('No audio element');
      if (!channel || !channel.streamUrl) throw new Error('Channel has no stream URL');

      this.fallbackAudio.crossOrigin = 'anonymous';
      this.fallbackAudio.src = channel.streamUrl;
      this.fallbackAudio.loop = false;
      this.fallbackAudio.volume = config.MUSIC_TARGET_VOLUME;
      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.fallbackAudio.play();
      this.mode = 'stream';
      if (this.isOpen) {
        this.startVisualizer();
      } else {
        this.pauseVisualizerForHidden();
      }
      this.updateStatus();
      return true;
    },

    async playLocalFallback() {
      if (!this.fallbackAudio) throw new Error('No audio element');

      const sourceTag = this.fallbackAudio.querySelector('source');
      const localSrc = sourceTag ? sourceTag.getAttribute('src') : '';
      this.fallbackAudio.crossOrigin = 'anonymous';
      if (localSrc) this.fallbackAudio.src = localSrc;
      this.fallbackAudio.loop = true;
      this.fallbackAudio.volume = config.MUSIC_TARGET_VOLUME;
      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.fallbackAudio.play();
      this.mode = 'fallback';
      if (this.isOpen) {
        this.startVisualizer();
      } else {
        this.pauseVisualizerForHidden();
      }
      this.updateStatus();
      return true;
    },

    stopPlayback() {
      this.stopVisualizer();
      this.pauseMediaOnly();

      state.musicEnabled = false;
      savePreference(storageKeys.enabled, false);
      this.mode = 'idle';
      this.resumeOnVisible = false;
      this.refreshWidget();
      this.updateStatus();
    },

    async startPlayback() {
      if (this.isAttemptingPlay) return;
      const current = this.getCurrentChannel();
      if (!current) return;

      this.isAttemptingPlay = true;
      let played = false;
      try {
        await this.playStream(current);
        played = true;
      } catch (err) {
        try {
          await this.playLocalFallback();
          played = true;
        } catch (fallbackErr) {
          this.mode = 'idle';
        }
      } finally {
        state.musicEnabled = played;
        savePreference(storageKeys.enabled, played);
        if (played) {
          this.progress.plays += 1;
          this.applyUnlocks();
          this.saveProgress();
        }
        this.isAttemptingPlay = false;
        this.refreshWidget();
        this.updateStatus();
      }
    },

    async togglePlayback() {
      if (state.musicEnabled) {
        this.stopPlayback();
        return;
      }
      await this.startPlayback();
    },

    async rotateChannel(fromUserAction = false) {
      const unlocked = this.getUnlockedChannels();
      if (!unlocked.length) return;

      const currentIndex = unlocked.findIndex(channel => channel.id === this.progress.currentChannelId);
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % unlocked.length;
      this.progress.currentChannelId = unlocked[nextIndex].id;
      this.saveProgress();
      this.refreshWidget();

      if (fromUserAction && state.musicEnabled) {
        this.stopPlayback();
        await this.startPlayback();
      }
    },

    openWidget() {
      if (!this.widget) return;

      // Prevent overlap/state conflicts with the clock-oracle widget.
      const oracleWidget = document.getElementById('oracle-widget');
      if (oracleWidget && !oracleWidget.hidden) {
        oracleWidget.hidden = true;
        const clockBtn = document.getElementById('taskbar-clock');
        if (clockBtn) {
          clockBtn.classList.remove('widget-open');
          clockBtn.setAttribute('aria-expanded', 'false');
        }
      }

      this.widget.hidden = false;
      this.ctrl.classList.add('widget-open');
      this.ctrl.setAttribute('aria-pressed', 'true');
      this.isOpen = true;
      this.resizeVisualizerCanvas();
      this.resumeVisualizerFromHidden();
      this.refreshWidget();
    },

    closeWidget() {
      if (!this.widget || this.widget.hidden) return;
      this.widget.hidden = true;
      this.ctrl.classList.remove('widget-open');
      this.ctrl.setAttribute('aria-pressed', 'false');
      this.isOpen = false;
      this.pauseVisualizerForHidden();
    },

    toggleWidget() {
      if (this.isOpen) {
        this.closeWidget();
        return;
      }
      this.openWidget();
    },

    refreshWidget() {
      if (!this.widget) return;
      const current = this.getCurrentChannel();
      const unlocked = this.getUnlockedChannels();
      const total = channels.length;

      if (this.ui.currentChannel) {
        this.ui.currentChannel.textContent = current
          ? `${current.label} (${current.id.toUpperCase()})`
          : 'No channels configured';
      }

      if (this.ui.channelMeta) {
        this.ui.channelMeta.textContent = current && current.description
          ? current.description
          : 'Rotate channels to discover new ambient loops.';
      }

      if (this.ui.unlockCount) {
        this.ui.unlockCount.textContent = `Unlocked channels: ${unlocked.length}/${total}`;
      }

      if (this.ui.dwellValue) this.ui.dwellValue.textContent = `Dwell ${asHoursMinutes(this.progress.dwellSeconds)}`;
      if (this.ui.interactionsValue) this.ui.interactionsValue.textContent = `Interactions ${this.progress.interactions}`;
      if (this.ui.playsValue) this.ui.playsValue.textContent = `Plays ${this.progress.plays}`;

      if (this.ui.statusLine) {
        this.ui.statusLine.textContent = state.musicEnabled ? 'Signal is active.' : 'Signal is idle.';
      }

      if (this.ui.sourceLine) {
        this.ui.sourceLine.textContent = this.mode === 'stream'
          ? 'Source: Live radio stream'
          : this.mode === 'fallback'
            ? 'Source: Local fallback track'
            : 'Source: standby';
      }

      if (this.ui.playToggle) {
        this.ui.playToggle.textContent = state.musicEnabled ? 'PAUSE' : 'PLAY';
      }
    },

    updateStatus() {
      if (!this.status) return;
      const on = state.musicEnabled;
      this.status.textContent = `MUSIC: ${on ? 'ON' : 'OFF'}`;
    }
  };
}