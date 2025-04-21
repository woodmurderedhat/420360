// Events.js
// Handles random events, prestige, and meta-progression.
import { emit, on, off } from './EventBus.js';

export const name = 'Events';

let eventInterval = null;
let legacyPoints = 0;
let prestigeLevel = 0;
let gameState = null;
let treeState = null;
let evergreenUpgrades = { seedVault: false, deepRoots: false, sunCrystal: false };

function randomEvent() {
  const roll = Math.random();
  if (roll < 0.5) {
    emit('natureGift', { type: 'Morning Dew', bonus: 'water', amount: 10 });
  } else if (roll < 0.8) {
    // Only trigger ambush if at least 1 fruit
    if (treeState && treeState.slots && treeState.slots.fruits > 0) {
      treeState.slots.fruits--;
      emit('squirrelAmbush', { stolen: 'fruit', challenge: true });
      emit('stateUpdated', { tree: { ...treeState } });
    }
  } else {
    emit('quirkEvent', { type: 'Leaf Lottery', reward: 'buff', duration: 300 });
  }
}

function emitMetaUpdate() {
  emit('metaUpdated', {
    prestigeLevel,
    legacyPoints,
    upgrades: { ...evergreenUpgrades }
  });
}

export function install(api) {
  // Initialize meta-progression state if needed
  legacyPoints = api?.state?.legacyPoints || 0;
  prestigeLevel = api?.state?.prestigeLevel || 0;
  gameState = api?.state;
  treeState = api?.state?.tree;
  evergreenUpgrades = api?.state?.evergreenUpgrades || { seedVault: false, deepRoots: false, sunCrystal: false };
}

function handlePrestige(e) {
  prestigeLevel++;
  legacyPoints += 1;
  emit('prestigeAwarded', { prestigeLevel, legacyPoints });
  emit('stateUpdated', { legacyPoints, prestigeLevel });
  emitMetaUpdate();
}

function handleLeafLotteryDraw() {
  if (!gameState) return;
  if (gameState.sunlight < 50) {
    emit('quirkEvent', { type: 'Leaf Lottery', reward: 'Not enough sunlight!', duration: 0 });
    return;
  }
  gameState.sunlight -= 50;
  const buffs = [
    { reward: 'x2 sunlight', duration: 300 },
    { reward: 'x2 water', duration: 300 },
    { reward: 'instant prestige point', duration: 0 },
    { reward: '+100 water', duration: 0 },
    { reward: '+100 sunlight', duration: 0 }
  ];
  const buff = buffs[Math.floor(Math.random() * buffs.length)];
  if (buff.reward === 'instant prestige point') {
    prestigeLevel++;
    legacyPoints += 1;
    emit('prestigeAwarded', { prestigeLevel, legacyPoints });
    emit('stateUpdated', { legacyPoints, prestigeLevel });
  } else if (buff.reward === '+100 water') {
    gameState.water = (gameState.water || 0) + 100;
  } else if (buff.reward === '+100 sunlight') {
    gameState.sunlight += 100;
  }
  emit('quirkEvent', { type: 'Leaf Lottery', reward: buff.reward, duration: buff.duration });
  emit('stateUpdated', { sunlight: gameState.sunlight, water: gameState.water });
  emit('leafLotteryCooldown', { cooldownMs: 3600_000 });
}

function handleSquirrelScared() {
  if (treeState && treeState.slots) {
    treeState.slots.fruits++;
    emit('stateUpdated', { tree: { ...treeState } });
  }
}

function handleSquirrelMissed() {
  // No bonus, fruit already deducted
}

function handleBuyEvergreenUpgrade(e) {
  const { upgrade } = e.detail;
  if (!evergreenUpgrades[upgrade] && legacyPoints > 0) {
    evergreenUpgrades[upgrade] = true;
    legacyPoints--;
    emit('metaUpdated', {
      prestigeLevel,
      legacyPoints,
      upgrades: { ...evergreenUpgrades }
    });
    emit('stateUpdated', { legacyPoints, evergreenUpgrades: { ...evergreenUpgrades } });
  }
}

export function activate(api) {
  // Random event every 2–5 minutes
  eventInterval = setInterval(randomEvent, 120000 + Math.random() * 180000);
  on('prestige', handlePrestige);
  on('leafLotteryDraw', handleLeafLotteryDraw);
  on('squirrelScared', handleSquirrelScared);
  on('squirrelMissed', handleSquirrelMissed);
  on('buyEvergreenUpgrade', handleBuyEvergreenUpgrade);
  emitMetaUpdate();
}

export function deactivate(api) {
  if (eventInterval) clearInterval(eventInterval);
  off('prestige', handlePrestige);
  off('leafLotteryDraw', handleLeafLotteryDraw);
  off('squirrelScared', handleSquirrelScared);
  off('squirrelMissed', handleSquirrelMissed);
  off('buyEvergreenUpgrade', handleBuyEvergreenUpgrade);
}