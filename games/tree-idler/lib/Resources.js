// Resources.js
// Handles sunlight, water, upgrades, and resource generation.
import { emit, on, off } from './EventBus.js';

export const name = 'Resources';

let tickInterval = null;
let state = null;

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
  // Initialize resources in game state if not present
  state = api?.state || getInitialResources();
  // Ensure upgrades object and its properties always exist
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
    state.sunlight += 1 * state.upgrades.leafEfficiency;
    state.water += 1 * state.upgrades.rootEfficiency;
    emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
    emit('stateUpdated', { ...state });
  }, 1000);

  // Listen for upgrade events
  on('upgradeLeaf', handleUpgradeLeaf);
  on('upgradeRoot', handleUpgradeRoot);
}

export function deactivate(api) {
  if (tickInterval) clearInterval(tickInterval);
  off('upgradeLeaf', handleUpgradeLeaf);
  off('upgradeRoot', handleUpgradeRoot);
}

function handleUpgradeLeaf() {
  state.upgrades.leafEfficiency *= 1.2;
  emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
}

function handleUpgradeRoot() {
  state.upgrades.rootEfficiency *= 1.2;
  emit('resourcesUpdated', { sunlight: state.sunlight, water: state.water });
}
