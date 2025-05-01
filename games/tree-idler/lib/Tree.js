// Tree.js
// Handles growth stages, slots, prestige, and triggers procedural rendering.
import { emit, on, off } from './EventBus.js';

export const name = 'Tree';

let getState = () => ({}); // Placeholder
let updateState = () => {}; // Placeholder
let EventBus = null;
let manifest = {}; // Store manifest for initial state access

export function install(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;
  manifest = api.manifest;

  // Initialize tree state if not present
  const initialState = getState();
  if (!initialState.tree) {
    handleStateLoaded(initialState); // Use loaded state handler for initialization
  }
}

export function activate(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;
  manifest = api.manifest;

  EventBus.on('advanceStageRequest', handleAdvanceStageRequest);
  EventBus.on('seasonChange', handleSeasonChange); // Assuming Weather module emits this
  // EventBus.on('prestigeRequest', handlePrestigeRequest); // Prestige is handled by SaveLoad
  EventBus.on('stateLoaded', handleStateLoaded);
}

export function deactivate(api) {
  EventBus.off('advanceStageRequest', handleAdvanceStageRequest);
  EventBus.off('seasonChange', handleSeasonChange);
  // EventBus.off('prestigeRequest', handlePrestigeRequest);
  EventBus.off('stateLoaded', handleStateLoaded);
  getState = () => ({});
  updateState = () => {};
  EventBus = null;
  manifest = {};
}

function handleStateLoaded(loadedState) {
  if (!loadedState.tree) {
    const initialTreeState = manifest.initialState?.tree || {
      growthStage: 0,
      slots: { leaves: 1, roots: 1, fruits: 0, critters: 0 },
      visualSeed: Math.random(),
      season: 'spring' // Default season
    };
    // Ensure prestige/legacy points from root state are considered if tree state is missing
    initialTreeState.prestigeLevel = loadedState.prestigeLevel || 0;
    initialTreeState.legacyPoints = loadedState.legacyPoints || 0;
    updateState({ tree: initialTreeState });
    EventBus.emit('treeInitialized', getState().tree); // Emit initialization event
  } else {
    // Ensure tree state has necessary fields, merging with defaults if needed
    const treeState = { ...(manifest.initialState?.tree || {}), ...loadedState.tree };
    treeState.prestigeLevel = loadedState.prestigeLevel || treeState.prestigeLevel || 0;
    treeState.legacyPoints = loadedState.legacyPoints || treeState.legacyPoints || 0;
    treeState.growthStage = treeState.growthStage || 0;
    treeState.slots = treeState.slots || { leaves: 1, roots: 1, fruits: 0, critters: 0 };
    treeState.visualSeed = treeState.visualSeed || Math.random();
    treeState.season = treeState.season || 'spring';
    updateState({ tree: treeState }); // Ensure state is updated even if tree existed
  }
  // Trigger initial render after state is set/loaded
  EventBus.emit('renderTreeRequest', getState().tree);
}

function calculateStageCost(stage) {
  // Exponential cost, e.g., 10 * 1.5^stage
  return Math.floor(10 * Math.pow(1.8, stage));
}

function handleAdvanceStageRequest() {
  const currentState = getState();
  const treeState = currentState.tree || {};
  const currentStage = treeState.growthStage || 0;
  const cost = calculateStageCost(currentStage);

  if (currentState.sunlight >= cost) {
    updateState({ sunlight: currentState.sunlight - cost });
    EventBus.emit('resourcesUpdated', { sunlight: getState().sunlight });

    const newStage = currentStage + 1;
    const newSlots = { ...treeState.slots };

    // Slot unlocks based on DesignDoc
    // 10 named stages (0-9), then Legendary (10+)
    if (newStage <= 10) { // Apply specific unlocks up to stage 10
        // Example: Add one leaf/root slot per stage alternately
        if (newStage % 2 !== 0) newSlots.leaves = (newSlots.leaves || 1) + 1;
        if (newStage % 2 === 0) newSlots.roots = (newSlots.roots || 1) + 1;
        // Fruits unlock at stage 3 (index 2 if 0-based, or check >= 3)
        if (newStage === 3) newSlots.fruits = Math.max(newSlots.fruits || 0, 1); // Start with 1 slot
        // Critters unlock at stage 7
        if (newStage === 7) newSlots.critters = Math.max(newSlots.critters || 0, 1);
    } else {
        // Legendary stages might grant different/fewer slots
        // Example: Add a slot every 5 legendary levels
        if (newStage % 5 === 0) {
            newSlots.leaves = (newSlots.leaves || 0) + 1;
            newSlots.roots = (newSlots.roots || 0) + 1;
        }
    }

    updateState({
      tree: {
        ...treeState,
        growthStage: newStage,
        slots: newSlots
      }
    });
    EventBus.emit('treeStageAdvanced', getState().tree);
    EventBus.emit('renderTreeRequest', getState().tree);
    EventBus.emit('uiNotification', { message: `Tree reached Stage ${newStage}!`, type: 'success' });

  } else {
    EventBus.emit('uiNotification', { message: `Need ${cost} sunlight to advance stage.`, type: 'warning' });
  }
}

function handleSeasonChange(e) {
  const newSeason = e.detail?.season || 'spring';
  const treeState = getState().tree || {};
  if (treeState.season !== newSeason) {
      updateState({ tree: { ...treeState, season: newSeason } });
      EventBus.emit('treeSeasonChanged', getState().tree);
      EventBus.emit('renderTreeRequest', getState().tree);
      EventBus.emit('uiNotification', { message: `Season changed to ${newSeason}.` });
  }
}

// REMOVED handlePrestigeRequest - Handled by SaveLoad module

// REMOVED handleSpendLegacyPoints - Handled by SaveLoad module
