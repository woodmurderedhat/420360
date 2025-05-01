// SaveLoad.js
// Handles localStorage, LZ-String, and periodic saves.

import { emit, on, off } from './EventBus.js';

export const name = 'SaveLoad';

let saveInterval = null;
// Remove lastState, use getState from api
// let lastState = null; 
let getState = () => ({}); // Placeholder for getState from pluginApi
let EventBus = null;

const layoutKey = 'tree-idler-layout';
let layout = {};

// Dynamically load LZ-String from CDN if not present
async function getLZString() {
  if (window.LZString) return window.LZString;
  // Use a more robust import mechanism if available, or ensure this runs early
  try {
      await import('https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js');
      return window.LZString;
  } catch (error) {
      console.error("Failed to load LZString:", error);
      // Fallback or error handling - maybe disable saving?
      return null; 
  }
}

function getSaveKey() {
  return 'tree-idler-save';
}

function saveLayout() {
  try {
      localStorage.setItem(layoutKey, JSON.stringify(layout));
  } catch (e) {
      console.warn('Failed to save layout:', e);
  }
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

// Handler for purchasing legacy upgrades
function handleSpendLegacyPoints(eventData) {
    const { type, cost } = eventData;
    const currentState = getState();
    const currentPoints = currentState.legacyPoints || 0;

    if (currentPoints >= cost) {
        const newLegacyPoints = currentPoints - cost;
        const newLegacyUpgrades = { ...(currentState.legacyUpgrades || {}), [type]: true };

        updateState({
            legacyPoints: newLegacyPoints,
            legacyUpgrades: newLegacyUpgrades
        });

        // Notify UI and potentially other systems
        EventBus.emit('uiNotification', { message: `Purchased legacy upgrade: ${type}!`, type: 'success' });
        EventBus.emit('legacyUpgradePurchased', { type }); // Specific event if needed
        EventBus.emit('resourcesUpdated', getState()); // Trigger general UI/Resource update

    } else {
        EventBus.emit('uiNotification', { message: `Not enough Legacy Points for ${type}. Need ${cost}.`, type: 'warning' });
    }
}

// Handler for prestige request
async function handlePrestigeRequest() {
    const currentState = getState();
    if (!currentState) {
        console.warn("Cannot prestige: current state is unavailable.");
        EventBus.emit('uiNotification', { message: 'Error: Cannot access game state to prestige.', type: 'error' });
        return;
    }

    console.log("Handling prestige request...");

    // 1. Calculate Legacy Points Earned (Placeholder: 1 point per growth stage)
    const pointsEarned = currentState.growthStage || 0;
    const newTotalLegacyPoints = (currentState.legacyPoints || 0) + pointsEarned;

    // 2. Prepare the new state after reset
    const newPrestigeLevel = (currentState.prestigeLevel || 0) + 1;
    const keptLegacyUpgrades = currentState.legacyUpgrades || {};

    // Calculate Legacy Oaks
    const legacyOaks = Math.floor(newPrestigeLevel / 5);

    // Get initial state values (we might need DataLoader's help or a default object)
    // For now, assume basic reset values:
    let newSunlight = 0;
    let newWater = 0;

    // 3. Apply Seed Vault Bonus if owned
    if (keptLegacyUpgrades.seedVault) {
        const seedVaultBonus = 50; // Consistent bonus value
        newSunlight += seedVaultBonus;
        newWater += seedVaultBonus;
        console.log(`Applying Seed Vault bonus during prestige: +${seedVaultBonus} sunlight & water.`);
    }

    const resetState = {
        // Keep prestige-related fields
        prestigeLevel: newPrestigeLevel,
        legacyPoints: newTotalLegacyPoints,
        legacyUpgrades: keptLegacyUpgrades,
        legacyOaks: legacyOaks, // <-- Add legacy oaks count
        
        // Reset core resources (with potential Seed Vault bonus)
        sunlight: newSunlight,
        water: newWater,
        fruits: 0, // Reset fruits
        
        // Reset progression
        growthStage: 0,
        upgrades: { // Reset standard upgrades to initial values
            leafEfficiency: 1,
            rootEfficiency: 1,
            fruitValue: 1,
            fruitSpeed: 1,
            autoHarvest: false // Keep autoHarvest? Design doc says yes. Let's adjust.
        },
        
        // Reset achievements? Or keep them?
        achievements: currentState.achievements || {}, // Keep achievements for now
        
        // Keep settings
        settings: currentState.settings || { colorBlindMode: false }
    };

    // Adjust based on Design Doc: Keep auto-harvest
    if (currentState.upgrades?.autoHarvest) {
        resetState.upgrades.autoHarvest = true;
        console.log("Preserving Auto-Harvest across prestige.");
    }
    // Add other preservations if needed (e.g., critter traps)

    console.log("New state after prestige:", resetState);

    // 4. Save the new state
    try {
        await saveState(resetState);
        EventBus.emit('uiNotification', { message: `Prestiged to level ${newPrestigeLevel}! Gained ${pointsEarned} Legacy Points.`, type: 'success' });
        
        // 5. Reload the game
        // Short delay to allow notification to potentially show
        setTimeout(() => {
            location.reload();
        }, 500); 

    } catch (error) {
        console.error("Failed to save state after prestige:", error);
        EventBus.emit('uiNotification', { message: 'Error saving state after prestige.', type: 'error' });
    }
}

// No longer need handleStateUpdated for saving
// function handleStateUpdated(e) { ... }

export function install(api) {
  // Store api methods
  getState = api.getState;
  EventBus = api.EventBus;

  // On install, try to load state from localStorage
  getLZString().then(LZString => {
    if (!LZString) {
        console.warn("LZString not available, cannot load saved state.");
        return;
    }
    const data = localStorage.getItem(getSaveKey());
    if (data) {
      try {
        const json = LZString.decompressFromUTF16(data);
        if (!json) throw new Error("Decompressed data is null or empty.");
        const state = JSON.parse(json);
        console.log('Loaded state from localStorage:', state);
        EventBus.emit('loadState', state); // Emit loadState for module-loader
      } catch (e) {
        console.warn('Failed to load or parse save data:', e);
        // Optionally clear corrupted save data
        // localStorage.removeItem(getSaveKey());
      }
    }
  });

  // Load layout from localStorage
  const layoutData = localStorage.getItem(layoutKey);
  if (layoutData) {
    try {
      layout = JSON.parse(layoutData);
      EventBus.emit('layoutRestored', layout);
    } catch (e) {
      console.warn('Failed to load layout data:', e);
      layout = {};
    }
  }
}

export function activate(api) {
  // Store api methods (needed again in case of re-activation)
  getState = api.getState;
  EventBus = api.EventBus;

  // Remove stateUpdated listener for saving
  // on('stateUpdated', handleStateUpdated);
  
  // Set up periodic saving using getState
  saveInterval = setInterval(async () => {
    const currentState = getState(); // Get current state directly
    if (currentState) {
        await saveState(currentState); // Use await for async saveState
    }
  }, 30000); // 30s

  // Listen for UI layout changes
  EventBus.on('panelMoved', handlePanelMoved);
  EventBus.on('panelCollapsed', handlePanelCollapsed);
  // Listen for legacy point spending requests
  EventBus.on('spendLegacyPoints', handleSpendLegacyPoints);
  // Listen for prestige requests
  EventBus.on('prestigeRequest', handlePrestigeRequest);
}

export function deactivate(api) {
  // Clean up listeners and interval
  // off('stateUpdated', handleStateUpdated);
  if (saveInterval) clearInterval(saveInterval);
  saveInterval = null;

  EventBus.off('panelMoved', handlePanelMoved);
  EventBus.off('panelCollapsed', handlePanelCollapsed);
  // Stop listening for legacy point spending requests
  EventBus.off('spendLegacyPoints', handleSpendLegacyPoints);
  // Stop listening for prestige requests
  EventBus.off('prestigeRequest', handlePrestigeRequest);
  
  // Clear stored methods
  getState = () => ({});
  EventBus = null;
}

async function saveState(state) {
  const LZString = await getLZString();
  if (!LZString) {
      console.warn("LZString not available, cannot save state.");
      return;
  }
  try {
    const json = JSON.stringify(state);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(getSaveKey(), compressed);
    // console.log('State saved.'); // Optional: less verbose logging
    EventBus.emit('stateSaved', null); // Notify that save occurred
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}
