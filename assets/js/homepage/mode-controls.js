export function createModeControls({
  state,
  config,
  loadPreference,
  savePreference,
  intervalManager,
  popupSystem,
  onChillModeChanged
}) {
  function updateChillButtonVisibility() {
    const chillBtn = document.getElementById('chill-control');
    if (chillBtn) {
      if (state.popupsPaused) {
        chillBtn.style.display = 'none';
      } else {
        chillBtn.style.display = 'flex';
      }
    }
  }

  function toggleChillMode() {
    state.chillMode = !state.chillMode;
    savePreference(config.STORAGE_KEYS.CHILL_MODE, state.chillMode);

    const btn = document.getElementById('chill-control');
    if (btn) {
      btn.classList.toggle('chill-active', state.chillMode);
      const label = btn.querySelector('.ctrl-btn-label');
      if (label) label.textContent = state.chillMode ? 'CHILL: ON' : 'CHILL';
    }

    if (onChillModeChanged) onChillModeChanged();
    intervalManager.restartIntervals();
  }

  function togglePopupPause() {
    state.popupsPaused = !state.popupsPaused;
    savePreference(config.STORAGE_KEYS.POPUPS_PAUSED, state.popupsPaused);

    const btn = document.getElementById('popup-control');
    if (btn) {
      btn.classList.toggle('popups-paused', state.popupsPaused);
      const label = btn.querySelector('.ctrl-btn-label');
      if (label) label.textContent = state.popupsPaused ? 'POPUPS: OFF' : 'POPUPS: ON';
    }

    updateChillButtonVisibility();

    if (state.popupsPaused) {
      if (state.intervalIds.popup) {
        clearInterval(state.intervalIds.popup);
        state.intervalIds.popup = null;
      }
    } else {
      const intervals = intervalManager.getIntervals();
      if (!state.intervalIds.popup && intervals.popup > 0) {
        state.intervalIds.popup = setInterval(popupSystem.spawnPopup, intervals.popup);
      }
    }
  }

  function loadUserPreferences() {
    state.chillMode = loadPreference(config.STORAGE_KEYS.CHILL_MODE, false);
    const chillBtn = document.getElementById('chill-control');
    if (chillBtn && state.chillMode) {
      chillBtn.classList.add('chill-active');
      const label = chillBtn.querySelector('.ctrl-btn-label');
      if (label) label.textContent = 'CHILL: ON';
    }

    if (localStorage.getItem(config.STORAGE_KEYS.POPUPS_PAUSED) === 'false') {
      localStorage.removeItem(config.STORAGE_KEYS.POPUPS_PAUSED);
    }

    state.popupsPaused = loadPreference(config.STORAGE_KEYS.POPUPS_PAUSED, true);
    const popupBtn = document.getElementById('popup-control');
    if (popupBtn) {
      if (state.popupsPaused) {
        popupBtn.classList.add('popups-paused');
        const label = popupBtn.querySelector('.ctrl-btn-label');
        if (label) label.textContent = 'POPUPS: OFF';
      } else {
        const label = popupBtn.querySelector('.ctrl-btn-label');
        if (label) label.textContent = 'POPUPS: ON';
      }
    }

    updateChillButtonVisibility();
    if (onChillModeChanged) onChillModeChanged();
  }

  return {
    updateChillButtonVisibility,
    toggleChillMode,
    togglePopupPause,
    loadUserPreferences
  };
}
