// SaveLoad.js
// Handles localStorage, LZ-String, and periodic saves.

import { emit, on, off } from './EventBus.js';

export const name = 'SaveLoad';

let saveInterval = null;
let lastState = null;

const layoutKey = 'tree-idler-layout';
let layout = {};

// Dynamically load LZ-String from CDN if not present
async function getLZString() {
  if (window.LZString) return window.LZString;
  await import('https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js');
  return window.LZString;
}

function getSaveKey() {
  return 'tree-idler-save';
}

function saveLayout() {
  localStorage.setItem(layoutKey, JSON.stringify(layout));
}

function handlePanelMoved(e) {
  layout[e.detail.name] = layout[e.detail.name] || {};
  layout[e.detail.name].left = e.detail.left;
  layout[e.detail.name].top = e.detail.top;
  saveLayout();
}

function handlePanelCollapsed(e) {
  layout[e.detail.name] = layout[e.detail.name] || {};
  layout[e.detail.name].collapsed = e.detail.collapsed;
  saveLayout();
}

function handleStateUpdated(e) {
  lastState = e.detail;
  if (window && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('requestAchievementsSave', {
      detail: lastState
    }));
  }
}

export function install(api) {
  // On install, try to load state from localStorage
  getLZString().then(LZString => {
    const data = localStorage.getItem(getSaveKey());
    if (data) {
      try {
        const json = LZString.decompressFromUTF16(data);
        const state = JSON.parse(json);
        emit('loadState', state);
      } catch (e) {
        console.warn('Failed to load save data:', e);
      }
    }
  });

  // Load layout from localStorage
  const layoutData = localStorage.getItem(layoutKey);
  if (layoutData) {
    try {
      layout = JSON.parse(layoutData);
      emit('layoutRestored', layout);
    } catch (e) {
      layout = {};
    }
  }
}

export function activate(api) {
  on('stateUpdated', handleStateUpdated);
  saveInterval = setInterval(() => {
    if (lastState) saveState(lastState);
  }, 30000); // 30s

  on('panelMoved', handlePanelMoved);
  on('panelCollapsed', handlePanelCollapsed);
}

export function deactivate(api) {
  off('stateUpdated', handleStateUpdated);
  if (saveInterval) clearInterval(saveInterval);

  off('panelMoved', handlePanelMoved);
  off('panelCollapsed', handlePanelCollapsed);
}

async function saveState(state) {
  const LZString = await getLZString();
  try {
    const json = JSON.stringify(state);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(getSaveKey(), compressed);
    emit('stateSaved', null);
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}
