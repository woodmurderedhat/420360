export function createIntervalManager({
  state,
  config,
  spawnPopup,
  blurb,
  startColorChaos,
  stopColorChaos
}) {
  const runBlurbGlitch = () => {
    if (!blurb || typeof blurb.glitchRandomWord !== 'function') return;
    blurb.glitchRandomWord();
  };

  const runBlurbStream = () => {
    if (!blurb || typeof blurb.streamNextWord !== 'function') return;
    blurb.streamNextWord();
  };

  function getIntervals() {
    if (state.reducedMotion) {
      return {
        popup: config.POPUP_INTERVAL_REDUCED,
        glitch: config.GLITCH_INTERVAL_REDUCED,
        wordStream: config.WORD_STREAM_INTERVAL_REDUCED
      };
    }
    if (state.chillMode) {
      return {
        popup: config.POPUP_INTERVAL_CHILL,
        glitch: config.GLITCH_INTERVAL_CHILL,
        wordStream: config.WORD_STREAM_INTERVAL_CHILL
      };
    }
    return {
      popup: config.POPUP_INTERVAL_MS,
      glitch: config.GLITCH_INTERVAL_DEFAULT,
      wordStream: config.WORD_STREAM_INTERVAL_DEFAULT
    };
  }

  function startIntervals() {
    const intervals = getIntervals();
    startColorChaos();

    if (!state.intervalIds.popup && intervals.popup > 0 && !state.popupsPaused) {
      state.intervalIds.popup = setInterval(spawnPopup, intervals.popup);
    }

    if (!state.intervalIds.glitch && intervals.glitch > 0) {
      state.intervalIds.glitch = setInterval(runBlurbGlitch, intervals.glitch);
    }

    if (!state.intervalIds.wordStream && intervals.wordStream > 0) {
      state.intervalIds.wordStream = setInterval(runBlurbStream, intervals.wordStream);
    }

    document.documentElement.classList.remove('paused');
  }

  function stopIntervals() {
    if (state.intervalIds.popup) {
      clearInterval(state.intervalIds.popup);
      state.intervalIds.popup = null;
    }
    if (state.intervalIds.glitch) {
      clearInterval(state.intervalIds.glitch);
      state.intervalIds.glitch = null;
    }
    if (state.intervalIds.wordStream) {
      clearInterval(state.intervalIds.wordStream);
      state.intervalIds.wordStream = null;
    }

    stopColorChaos();
    document.documentElement.classList.add('paused');
  }

  function restartIntervals() {
    stopIntervals();
    if (!document.hidden) {
      startIntervals();
    }
  }

  function pauseBackground() {
    stopIntervals();
  }

  return {
    getIntervals,
    startIntervals,
    stopIntervals,
    restartIntervals,
    pauseBackground
  };
}
