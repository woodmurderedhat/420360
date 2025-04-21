// Achievements.js
// Tracks and emits achievement unlocks.
import { emit, on, off } from './EventBus.js';

export const name = 'Achievements';

let state = {
  firstPrestige: false,
  sunlight1000: false,
  legendaryStage: false,
  fruitMaster: false,
  squirrelHero: false
};
let squirrelScareCount = 0;

function checkAchievements({ prestigeLevel, sunlight, tree, event }) {
  let changed = false;
  if (!state.firstPrestige && prestigeLevel > 0) { state.firstPrestige = true; changed = true; }
  if (!state.sunlight1000 && sunlight >= 1000) { state.sunlight1000 = true; changed = true; }
  if (!state.legendaryStage && tree?.stage >= 11) { state.legendaryStage = true; changed = true; }
  if (!state.fruitMaster && tree?.slots?.fruits >= 8) { state.fruitMaster = true; changed = true; }
  if (!state.squirrelHero && squirrelScareCount >= 10) { state.squirrelHero = true; changed = true; }
  if (changed) emit('achievementsUpdated', { ...state });
}

function handlePrestigeAwarded(e) {
  checkAchievements({ prestigeLevel: e.detail.prestigeLevel });
}
function handleResourcesUpdated(e) {
  checkAchievements({ sunlight: e.detail.sunlight });
}
function handleTreeStageAdvanced(e) {
  checkAchievements({ tree: e.detail });
}
function handleSquirrelScared() {
  squirrelScareCount++;
  checkAchievements({ event: 'squirrelScared' });
}
function handleTreeInitialized(e) {
  checkAchievements({ tree: e.detail });
}

export function install(api) {
  // Restore from save if present
  if (api?.state?.achievements) state = { ...state, ...api.state.achievements };
}

export function activate(api) {
  on('prestigeAwarded', handlePrestigeAwarded);
  on('resourcesUpdated', handleResourcesUpdated);
  on('treeStageAdvanced', handleTreeStageAdvanced);
  on('squirrelScared', handleSquirrelScared);
  on('treeInitialized', handleTreeInitialized);
  emit('achievementsUpdated', { ...state });
}

export function deactivate(api) {
  off('prestigeAwarded', handlePrestigeAwarded);
  off('resourcesUpdated', handleResourcesUpdated);
  off('treeStageAdvanced', handleTreeStageAdvanced);
  off('squirrelScared', handleSquirrelScared);
  off('treeInitialized', handleTreeInitialized);
}