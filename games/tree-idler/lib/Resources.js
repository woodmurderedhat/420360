// Resources.js
// Handles sunlight, water, fruits, upgrades, and resource generation.
import { emit, on, off } from './EventBus.js';

export const name = 'Resources';

let tickInterval = null;
let getState = () => ({});
let updateState = () => {};
let EventBus = null;
let weather = 'clear';

// State for timed buffs (managed locally within this module)
let activeBuffs = {}; // { buffType: { multiplier: number, endTime: number, description: string? }, ... }
let buffTimeouts = {}; // Store timeouts for clearing buffs

export function install(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;

  const currentState = getState();
  if (!currentState.upgrades) {
    updateState({ upgrades: { leafEfficiency: 1, rootEfficiency: 1, fruitValue: 1, fruitSpeed: 1, autoHarvest: false } });
  }
  if (typeof currentState.sunlight !== 'number') updateState({ sunlight: 0 });
  if (typeof currentState.water !== 'number') updateState({ water: 0 });
  if (typeof currentState.fruits !== 'number') updateState({ fruits: 0 });
  activeBuffs = currentState.activeBuffs || {};
  weather = currentState.weather?.current || 'clear';

  EventBus.emit('resourcesInitialized', getState());
}

export function activate(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;

  if (tickInterval) clearInterval(tickInterval);
  Object.values(buffTimeouts).forEach(clearTimeout);
  buffTimeouts = {};

  processLoadedBuffs();

  tickInterval = setInterval(() => {
    const currentState = getState();
    const mult = getResourceMultiplier();
    const prestigeBonus = 1 + (currentState.prestigeLevel || 0) * 0.10;
    // Apply Legacy Oak Bonus: +5% per oak (every 5 prestige levels)
    const legacyOakBonus = 1 + (currentState.legacyOaks || 0) * 0.05;

    const sunlightBuffMultiplier = activeBuffs.sunlightMultiplier?.multiplier || 1;
    const waterBuffMultiplier = activeBuffs.waterMultiplier?.multiplier || 1;

    const deepRootsBonus = currentState.legacyUpgrades?.deepRoots ? 1.25 : 1;
    const sunCrystalBonus = currentState.legacyUpgrades?.sunCrystal ? 1.25 : 1;

    const baseSunlightGain = 1 * (currentState.upgrades?.leafEfficiency || 1);
    const baseWaterGain = 1 * (currentState.upgrades?.rootEfficiency || 1);

    const newSunlight = currentState.sunlight + (baseSunlightGain * mult.sunlight * prestigeBonus * legacyOakBonus * sunCrystalBonus * sunlightBuffMultiplier);
    const newWater = currentState.water + (baseWaterGain * mult.water * prestigeBonus * legacyOakBonus * deepRootsBonus * waterBuffMultiplier);

    let newFruits = currentState.fruits;
    if (currentState.tree?.growthStage >= 3) {
        // Apply Legacy Oak bonus to fruit speed as well
        newFruits += 0.1 * (currentState.upgrades?.fruitSpeed || 1) * prestigeBonus * legacyOakBonus;
    }

    if (currentState.upgrades?.autoHarvest && newFruits >= 1) {
        const harvestableFruits = Math.floor(newFruits);
        handleHarvestFruit({ amount: harvestableFruits });
        newFruits = getState().fruits;
    } else {
        const update = {
          sunlight: newSunlight,
          water: newWater,
          fruits: newFruits
        };
        updateState(update);
        EventBus.emit('resourcesUpdated', getState());
    }

    cleanupExpiredBuffs();

  }, 1000);

  EventBus.on('upgradeRequest', handleUpgradeRequest);
  EventBus.on('toggleAutoHarvest', handleToggleAutoHarvest);
  EventBus.on('harvestFruit', handleHarvestFruit);
  EventBus.on('weatherChanged', handleWeatherChanged);
  EventBus.on('stateLoaded', handleStateLoaded);
  EventBus.on('applyBuff', handleApplyBuff);
}

export function deactivate(api) {
  if (tickInterval) clearInterval(tickInterval);
  Object.values(buffTimeouts).forEach(clearTimeout);

  EventBus.off('upgradeRequest', handleUpgradeRequest);
  EventBus.off('toggleAutoHarvest', handleToggleAutoHarvest);
  EventBus.off('harvestFruit', handleHarvestFruit);
  EventBus.off('weatherChanged', handleWeatherChanged);
  EventBus.off('stateLoaded', handleStateLoaded);
  EventBus.off('applyBuff', handleApplyBuff);

  tickInterval = null;
  getState = () => ({});
  updateState = () => {};
  EventBus = null;
  activeBuffs = {};
  buffTimeouts = {};
}

function handleStateLoaded(loadedState) {
    if (loadedState.weather) {
        weather = loadedState.weather.current || 'clear';
    }
    if (!loadedState.upgrades) {
        updateState({ upgrades: { leafEfficiency: 1, rootEfficiency: 1, fruitValue: 1, fruitSpeed: 1, autoHarvest: false } });
    }
    activeBuffs = loadedState.activeBuffs || {};
    processLoadedBuffs();
}

function processLoadedBuffs() {
    const now = Date.now();
    let changed = false;
    Object.values(buffTimeouts).forEach(clearTimeout);
    buffTimeouts = {};

    for (const type in activeBuffs) {
        const buff = activeBuffs[type];
        const remainingTime = buff.endTime - now;

        if (remainingTime > 0) {
            buffTimeouts[type] = setTimeout(() => {
                console.log('Expired buff via timeout:', type);
                delete activeBuffs[type];
                delete buffTimeouts[type];
                updateState({ activeBuffs: { ...activeBuffs } });
                EventBus.emit('buffsUpdated', getActiveBuffsWithRemainingTime());
            }, remainingTime);
        } else {
            console.log('Removing expired buff on load:', type);
            delete activeBuffs[type];
            changed = true;
        }
    }
    if (changed) {
        updateState({ activeBuffs: { ...activeBuffs } });
        EventBus.emit('buffsUpdated', getActiveBuffsWithRemainingTime());
    }
}

function calculateUpgradeCost(upgradeType, currentLevel) {
    const costs = {
        leafEfficiency: { base: 10, scale: 1.5, resource: 'sunlight' },
        rootEfficiency: { base: 10, scale: 1.5, resource: 'water' },
        fruitValue: { base: 50, scale: 1.8, resource: 'sunlight' },
        fruitSpeed: { base: 50, scale: 1.8, resource: 'water' },
    };
    const config = costs[upgradeType];
    if (!config) return { cost: Infinity, resource: 'sunlight' };

    const level = Math.max(1, currentLevel);
    const cost = Math.floor(config.base * Math.pow(config.scale, level - 1));
    return { cost, resource: config.resource };
}

function handleUpgradeRequest(eventData) {
    const { type } = eventData;
    const currentState = getState();
    const currentUpgrades = currentState.upgrades || {};
    const currentLevel = currentUpgrades[type] || 1;

    const { cost, resource } = calculateUpgradeCost(type, currentLevel);

    if (currentState[resource] >= cost) {
        updateState({ [resource]: currentState[resource] - cost });

        const multiplier = 1.2;
        updateState({ 
            upgrades: { 
                ...currentUpgrades, 
                [type]: currentLevel * multiplier 
            }
        });

        EventBus.emit('upgradePurchased', { type: type, level: currentLevel * multiplier, cost: cost });
        EventBus.emit('resourcesUpdated', getState());
        EventBus.emit('uiNotification', { message: `Upgraded ${type}!`, type: 'success' });
    } else {
        EventBus.emit('uiNotification', { message: `Need ${cost} ${resource} to upgrade ${type}.`, type: 'warning' });
    }
}

function handleToggleAutoHarvest() {
    const currentUpgrades = getState().upgrades || {};
    const newState = !currentUpgrades.autoHarvest;
    updateState({ 
        upgrades: { 
            ...currentUpgrades, 
            autoHarvest: newState 
        }
    });
    EventBus.emit('settingsUpdated', { autoHarvest: newState });
    EventBus.emit('uiNotification', { message: `Auto-Harvest ${newState ? 'Enabled' : 'Disabled'}.` });
}

function handleHarvestFruit(eventData) {
    const amountToHarvest = eventData?.amount || 1;
    const currentState = getState();
    const currentFruits = currentState.fruits || 0;

    if (currentFruits >= amountToHarvest) {
        const fruitValue = currentState.upgrades?.fruitValue || 1;
        const prestigeBonus = 1 + (currentState.prestigeLevel || 0) * 0.10;
        // Apply Legacy Oak Bonus to fruit value on harvest
        const legacyOakBonus = 1 + (currentState.legacyOaks || 0) * 0.05;
        const sunCrystalBonus = currentState.legacyUpgrades?.sunCrystal ? 1.25 : 1;

        const gainedSunlight = amountToHarvest * fruitValue * prestigeBonus * legacyOakBonus * sunCrystalBonus;

        const newState = {
            fruits: Math.max(0, currentFruits - amountToHarvest),
            sunlight: (currentState.sunlight || 0) + gainedSunlight
        };
        updateState(newState);

        EventBus.emit('fruitHarvested', { amount: amountToHarvest, gainedSunlight });
        EventBus.emit('resourcesUpdated', getState());
    }
}

function handleWeatherChanged(e) {
    weather = e.detail?.weather || 'clear';
}

function getResourceMultiplier() {
    switch (weather) {
        case 'rain': return { sunlight: 0.8, water: 1.5 };
        case 'drought': return { sunlight: 1.2, water: 0.5 };
        case 'frost': return { sunlight: 0.7, water: 0.7 };
        default: return { sunlight: 1, water: 1 };
    }
}

function handleApplyBuff(eventData) {
    const { type, value, duration, description } = eventData;
    const endTime = Date.now() + duration;

    if (buffTimeouts[type]) {
        clearTimeout(buffTimeouts[type]);
    }

    activeBuffs[type] = { multiplier: value, endTime, description };
    console.log('Applied buff:', type, value, duration);

    buffTimeouts[type] = setTimeout(() => {
        console.log('Expired buff via timeout:', type);
        delete activeBuffs[type];
        delete buffTimeouts[type];
        updateState({ activeBuffs: { ...activeBuffs } });
        EventBus.emit('buffsUpdated', getActiveBuffsWithRemainingTime());
    }, duration);

    updateState({ activeBuffs: { ...activeBuffs } });
    EventBus.emit('buffsUpdated', getActiveBuffsWithRemainingTime());
}

function cleanupExpiredBuffs() {
    const now = Date.now();
    let changed = false;
    for (const type in activeBuffs) {
        if (activeBuffs[type].endTime <= now) {
            console.log('Cleaning up expired buff:', type);
            delete activeBuffs[type];
            if (buffTimeouts[type]) {
                clearTimeout(buffTimeouts[type]);
                delete buffTimeouts[type];
            }
            changed = true;
        }
    }
    if (changed) {
        updateState({ activeBuffs: { ...activeBuffs } });
        EventBus.emit('buffsUpdated', getActiveBuffsWithRemainingTime());
    }
}

function getActiveBuffsWithRemainingTime() {
    const now = Date.now();
    const buffsForUI = [];
    for (const type in activeBuffs) {
        const buff = activeBuffs[type];
        const remaining = Math.max(0, buff.endTime - now);
        if (remaining > 0) {
            buffsForUI.push({
                id: type,
                description: buff.description || type,
                remaining: remaining,
                multiplier: buff.multiplier
            });
        }
    }
    return buffsForUI;
}

export function calculateResourceGeneration(state) {
    const { sunlight, water, upgrades, growthStage, weather, legacyUpgrades, legacyOaks } = state;

    let baseSunlightRate = 1;
    let baseWaterRate = 1;

    if (weather?.type === 'sunny') baseSunlightRate *= 1.5;
    if (weather?.type === 'rainy') baseWaterRate *= 1.5;
    if (weather?.type === 'cloudy') {
        baseSunlightRate *= 0.75;
        baseWaterRate *= 0.75;
    }

    const leafEfficiency = upgrades?.leafEfficiency || 1;
    const rootEfficiency = upgrades?.rootEfficiency || 1;

    const sunCrystalBonus = legacyUpgrades?.sunCrystal ? 1.25 : 1;
    const deepRootsBonus = legacyUpgrades?.deepRoots ? 1.25 : 1;

    const legacyOakBonus = 1 + (legacyOaks || 0) * 0.05;

    let sunlightRate = baseSunlightRate * leafEfficiency * sunCrystalBonus * legacyOakBonus;
    let waterRate = baseWaterRate * rootEfficiency * deepRootsBonus * legacyOakBonus;

    const stageMultiplier = 1 + (growthStage * 0.1);
    sunlightRate *= stageMultiplier;
    waterRate *= stageMultiplier;

    const fruitSpeed = upgrades?.fruitSpeed || 1;
    const fruitValue = upgrades?.fruitValue || 1;
    const effectiveFruitValue = fruitValue * sunCrystalBonus;
    let fruitRate = (growthStage > 2) ? (0.1 * fruitSpeed * stageMultiplier * legacyOakBonus) : 0;

    return {
        sunlightRate,
        waterRate,
        fruitRate,
        effectiveFruitValue
    };
}

export function harvestFruits(state) {
    const { fruits, growthStage } = state;
    const { fruitRate, effectiveFruitValue } = calculateResourceGeneration(state);

    if (fruitRate > 0) {
        const harvestedAmount = Math.floor(fruitRate * 10);
        const fruitGain = harvestedAmount * effectiveFruitValue;
        return { ...state, fruits: fruits + fruitGain };
    }
    return state;
}
