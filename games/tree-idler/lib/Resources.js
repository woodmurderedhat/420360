// Resources.js
// Handles sunlight, water, upgrades, and resource generation.
import { emit, on, off } from './EventBus.js';

export const name = 'Resources';

let tickInterval = null;
let state = null;
let weather = 'clear';

function getInitialResources() {
  return {
    sunlight: 0,
    water: 0,
    upgrades: {
      leafEfficiency: 1,
      rootEfficiency: 1
    }
  };
}

export function install(api) {
  state = api?.state || getInitialResources();
  if (!state.upgrades) state.upgrades = { leafEfficiency: 1, rootEfficiency: 1 };
  if (typeof state.upgrades.leafEfficiency !== 'number') state.upgrades.leafEfficiency = 1;
  if (typeof state.upgrades.rootEfficiency !== 'number') state.upgrades.rootEfficiency = 1;
  emit('resourcesInitialized', { ...state });
}

export function activate(api) {
  // Defensive: ensure upgrades object and its properties always exist
  if (!state.upgrades) state.upgrades = { leafEfficiency: 1, rootEfficiency: 1 };
  if (typeof state.upgrades.leafEfficiency !== 'number') state.upgrades.leafEfficiency = 1;
  if (typeof state.upgrades.rootEfficiency !== 'number') state.upgrades.rootEfficiency = 1;
  // Idle resource generation (every second)
  tickInterval = setInterval(() => {
    const mult = getResourceMultiplier();
    state.sunlight += 1 * state.upgrades.leafEfficiency * mult.sunlight;
    state.water += 1 * state.upgrades.rootEfficiency * mult.water;
    emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
    emit('stateUpdated', { ...state });
  }, 1000);

  // Listen for upgrade events
  on('upgradeLeaf', handleUpgradeLeaf);
  on('upgradeRoot', handleUpgradeRoot);
  on('weatherChanged', handleWeatherChanged);
}

export function deactivate(api) {
  if (tickInterval) clearInterval(tickInterval);
  off('upgradeLeaf', handleUpgradeLeaf);
  off('upgradeRoot', handleUpgradeRoot);
  off('weatherChanged', handleWeatherChanged);
}

function handleUpgradeLeaf() {
  state.upgrades.leafEfficiency *= 1.2;
  emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
}

function handleUpgradeRoot() {
  state.upgrades.rootEfficiency *= 1.2;
  emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
}

function handleWeatherChanged(e) {
  weather = e.weather;
}

function getResourceMultiplier() {
  switch (weather) {
    case 'rain': return { sunlight: 1, water: 2 };
    case 'drought': return { sunlight: 0.7, water: 0.5 };
    case 'frost': return { sunlight: 0.8, water: 0.8 };
    default: return { sunlight: 1, water: 1 };
  }
}
