export function createIntervalManager({
  state,
  config,
  spawnPopup,
  glitchRandomWord,
  morphToRandomSentence,
  startColorChaos,
  stopColorChaos
}) {
  function getIntervals() {
    if (state.reducedMotion) {
      return {
        popup: config.POPUP_INTERVAL_REDUCED,
        glitch: config.GLITCH_INTERVAL_REDUCED,
        morph: config.MORPH_INTERVAL_REDUCED
      };
    }
    if (state.chillMode) {
      return {
        popup: config.POPUP_INTERVAL_CHILL,
        glitch: config.GLITCH_INTERVAL_CHILL,
        morph: config.MORPH_INTERVAL_CHILL
      };
    }
    return {
      popup: config.POPUP_INTERVAL_MS,
      glitch: config.GLITCH_INTERVAL_DEFAULT,
      morph: config.MORPH_INTERVAL_DEFAULT
    };
  }

  function getBurstSettings() {
    if (state.reducedMotion) {
      return {
        interval: config.MORPH_BURST_INTERVAL_REDUCED,
        duration: config.MORPH_BURST_DURATION_REDUCED,
        step: config.MORPH_BURST_STEP_REDUCED
      };
    }
    if (state.chillMode) {
      return {
        interval: config.MORPH_BURST_INTERVAL_CHILL,
        duration: config.MORPH_BURST_DURATION_CHILL,
        step: config.MORPH_BURST_STEP_CHILL
      };
    }
    return {
      interval: config.MORPH_BURST_INTERVAL_DEFAULT,
      duration: config.MORPH_BURST_DURATION_DEFAULT,
      step: config.MORPH_BURST_STEP_DEFAULT
    };
  }

  function doBurstStep(step) {
    if (!state.burstActive) return;
    morphToRandomSentence();
    state.morphStepId = setTimeout(() => doBurstStep(step), step);
  }

  function endMorphBurst() {
    if (state.morphStepId) {
      clearTimeout(state.morphStepId);
      state.morphStepId = null;
    }
    state.burstActive = false;
    state.burstTimeoutId = null;
  }

  function startMorphBurst() {
    if (state.burstActive) return;
    const { duration, step } = getBurstSettings();
    if (duration <= 0 || step <= 0) return;
    state.burstActive = true;
    doBurstStep(step);
    state.burstTimeoutId = setTimeout(endMorphBurst, duration);
  }

  function startIntervals() {
    const intervals = getIntervals();
    startColorChaos();

    if (!state.intervalIds.popup && intervals.popup > 0 && !state.popupsPaused) {
      state.intervalIds.popup = setInterval(spawnPopup, intervals.popup);
    }

    if (!state.intervalIds.glitch && intervals.glitch > 0) {
      state.intervalIds.glitch = setInterval(glitchRandomWord, intervals.glitch);
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
    if (state.intervalIds.morph) {
      clearInterval(state.intervalIds.morph);
      state.intervalIds.morph = null;
    }
    if (state.burstIntervalId) {
      clearInterval(state.burstIntervalId);
      state.burstIntervalId = null;
    }
    if (state.morphStepId) {
      clearTimeout(state.morphStepId);
      state.morphStepId = null;
    }
    if (state.burstTimeoutId) {
      clearTimeout(state.burstTimeoutId);
      state.burstTimeoutId = null;
    }
    state.burstActive = false;

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
    getBurstSettings,
    startMorphBurst,
    doBurstStep,
    endMorphBurst,
    startIntervals,
    stopIntervals,
    restartIntervals,
    pauseBackground
  };
}
