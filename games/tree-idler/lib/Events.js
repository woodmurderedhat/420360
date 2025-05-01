// Events.js
// Handles random events (Nature's Gift, Squirrel Ambush), and Legacy Oak quirk.
import { emit, on, off } from './EventBus.js';

export const name = 'Events';

let eventInterval = null;
let getState = () => ({});
let updateState = () => {};
let EventBus = null;

// Constants for balancing (could be moved to manifest/config)
const RANDOM_EVENT_MIN_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const RANDOM_EVENT_MAX_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function scheduleRandomEvent() {
    const delay = RANDOM_EVENT_MIN_INTERVAL_MS + Math.random() * (RANDOM_EVENT_MAX_INTERVAL_MS - RANDOM_EVENT_MIN_INTERVAL_MS);
    if (eventInterval) clearTimeout(eventInterval); // Clear existing timeout
    eventInterval = setTimeout(() => {
        triggerRandomEvent();
        scheduleRandomEvent(); // Schedule the next one
    }, delay);
}

function triggerRandomEvent() {
  const roll = Math.random();
  const state = getState();
  const treeState = state.tree || {};

  // Nature's Gift (e.g., 50% chance)
  if (roll < 0.5) {
    // Example: Free water
    const amount = 10 + Math.floor(Math.random() * 10); // Random amount
    updateState({ water: (state.water || 0) + amount });
    EventBus.emit('natureGift', { type: 'Morning Dew', bonus: 'water', amount: amount });
    EventBus.emit('resourcesUpdated', { water: getState().water }); // Notify UI
  }
  // Squirrel Ambush (e.g., 30% chance, requires Stage 7+ and fruits)
  else if (roll < 0.8 && treeState.growthStage >= 7 && state.fruits >= 1) {
    // Deduct fruit immediately - player needs to scare to get bonus
    updateState({ fruits: state.fruits - 1 });
    EventBus.emit('resourcesUpdated', { fruits: getState().fruits }); // Notify UI of deduction
    EventBus.emit('squirrelAmbush'); // Notify UI to show modal
  }
  // Other potential events...
  else {
    // Placeholder for future events
    console.log("Minor random event triggered (no effect yet).");
  }

  // Schedule next event
  scheduleRandomEvent();
}

function handleSquirrelScared() {
  // Bonus: Give back the stolen fruit + 1 extra
  const state = getState();
  const bonusFruits = 2;
  updateState({ fruits: (state.fruits || 0) + bonusFruits });
  EventBus.emit('resourcesUpdated', { fruits: getState().fruits });
  // UI notification is handled by UI.js listening to this event
}

function handleSquirrelMissed() {
  // No change needed, fruit was already deducted on ambush trigger.
  // UI notification handled by UI.js
}

function handlePrestigeComplete(e) {
    // Check for Legacy Oak quirk
    // REMOVED Legacy Oak calculation - handled in SaveLoad.js
}

export function install(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;
}

export function activate(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;

  // Start random event scheduling
  scheduleRandomEvent();

  // Listen for relevant events
  EventBus.on('squirrelScared', handleSquirrelScared);
  EventBus.on('squirrelMissed', handleSquirrelMissed);
  EventBus.on('prestigeComplete', handlePrestigeComplete); // Listen for prestige to check for Legacy Oak
}

export function deactivate(api) {
  if (eventInterval) clearTimeout(eventInterval);
  eventInterval = null;

  EventBus.off('squirrelScared', handleSquirrelScared);
  EventBus.off('squirrelMissed', handleSquirrelMissed);
  EventBus.off('prestigeComplete', handlePrestigeComplete);

  getState = () => ({});
  updateState = () => {};
  EventBus = null;
}