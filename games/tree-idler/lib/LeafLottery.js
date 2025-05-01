import { emit, on, off } from './EventBus.js'; // Correctly import functions

export const name = 'LeafLottery';

const LOTTERY_COST = 50; // Example cost in sunlight
const LOTTERY_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds

// Buff Definitions (Simplified: type maps to Resources.js activeBuffs keys)
const BUFFS = [
    { id: 'sunlight_x2_5m', description: 'Sunlight x2 for 5 minutes', duration: 5 * 60 * 1000, type: 'sunlightMultiplier', value: 2 },
    { id: 'water_x2_5m', description: 'Water x2 for 5 minutes', duration: 5 * 60 * 1000, type: 'waterMultiplier', value: 2 },
    { id: 'instant_fruit', description: 'Instant +1 Fruit', duration: 0, type: 'instant_fruit', value: 1 }, // Special type for instant effect
    { id: 'instant_lp', description: 'Instant +1 Legacy Point', duration: 0, type: 'instant_lp', value: 1 }, // Needs handling if implemented
];

// Plugin API refs
let getState = () => ({});
let updateState = () => {};
let lastLotteryTime = 0;
let handleStateLoadedListener = null; // Store the listener function

function isAvailable() {
    const now = Date.now();
    const cooldownOver = (now - lastLotteryTime) >= LOTTERY_COOLDOWN;
    const currentState = getState();
    const canAfford = currentState && currentState.sunlight >= LOTTERY_COST;
    return { available: cooldownOver && canAfford, cooldownOver, canAfford };
}

function tryLottery() {
    const status = isAvailable();
    if (!status.available) {
        console.warn('Lottery not available.', status);
        emit('uiNotification', { message: `Lottery not ready! ${!status.cooldownOver ? 'On cooldown.' : 'Not enough sunlight.'}`, type: 'warning' }); // Use imported emit
        return;
    }

    const currentState = getState();

    // Deduct cost using updateState
    updateState({ sunlight: currentState.sunlight - LOTTERY_COST });
    emit('resourcesUpdated', getState()); // Use imported emit

    // Set cooldown
    lastLotteryTime = Date.now();
    updateState({ leafLottery: { lastLotteryTime } }); // Save cooldown time

    // Select outcome
    const randomIndex = Math.floor(Math.random() * BUFFS.length);
    const selectedBuff = BUFFS[randomIndex];

    // Apply effect by emitting event
    if (selectedBuff.type === 'instant_fruit') {
        // Handle instant effects directly or via specific events if needed
        updateState({ fruits: (currentState.fruits || 0) + selectedBuff.value });
        emit('resourcesUpdated', getState()); // Use imported emit
        emit('uiNotification', { message: `Leaf Lottery: ${selectedBuff.description}`, type: 'success' }); // Use imported emit
    } else if (selectedBuff.type === 'instant_lp') {
        const currentLP = currentState.legacyPoints || 0;
        updateState({ legacyPoints: currentLP + selectedBuff.value });
        emit('resourcesUpdated', getState()); // Use imported emit
        emit('uiNotification', { message: `Leaf Lottery: ${selectedBuff.description}`, type: 'success' }); // Use imported emit
    } else if (selectedBuff.duration > 0) {
        emit('applyBuff', { // Use imported emit
            type: selectedBuff.type,
            value: selectedBuff.value,
            duration: selectedBuff.duration
        });
        emit('uiNotification', { message: `Leaf Lottery Buff: ${selectedBuff.description}`, type: 'success' }); // Use imported emit
    } else {
        // Handle other potential instant effects
        console.log(`Lottery Result (Instant): ${selectedBuff.description}`);
        emit('uiNotification', { message: `Leaf Lottery: ${selectedBuff.description}`, type: 'success' }); // Use imported emit
    }

    // Notify UI about cooldown and result
    emit('lotteryStateUpdated', { // Use imported emit
        available: false,
        cooldownEnds: lastLotteryTime + LOTTERY_COOLDOWN,
        lastResult: selectedBuff.description
    });
    // No need to emit saveGame, periodic save handles it.
}

// --- Plugin Lifecycle --- //

export function install(api) {
    getState = api.getState;
    updateState = api.updateState;
    // Load initial state from main game state
    const initialState = getState();
    lastLotteryTime = initialState.leafLottery?.lastLotteryTime || 0;
}

export function activate(api) {
    getState = api.getState;
    updateState = api.updateState;

    // Re-read state in case it was loaded after install
    const currentState = getState();
    lastLotteryTime = currentState.leafLottery?.lastLotteryTime || 0;

    on('tryLottery', tryLottery); // Use imported on

    // Store the listener function
    handleStateLoadedListener = (loadedState) => {
        // Update local state if game is loaded
        lastLotteryTime = loadedState.leafLottery?.lastLotteryTime || 0;
        // Broadcast initial/loaded state to UI
        emit('lotteryStateUpdated', { // Use imported emit
            available: isAvailable().available,
            cooldownEnds: lastLotteryTime + LOTTERY_COOLDOWN,
            lastResult: null // Result isn't saved
        });
    };
    on('stateLoaded', handleStateLoadedListener); // Use imported on

    // Broadcast initial state to UI
    emit('lotteryStateUpdated', { // Use imported emit
        available: isAvailable().available,
        cooldownEnds: lastLotteryTime + LOTTERY_COOLDOWN,
        lastResult: null
    });
}

export function deactivate(api) {
    off('tryLottery', tryLottery); // Use imported off
    // Use the stored listener function for removal
    if (handleStateLoadedListener) {
        off('stateLoaded', handleStateLoadedListener); // Use imported off
        handleStateLoadedListener = null; // Clear the stored listener
    }
    getState = () => ({});
    updateState = () => {};
}

// --- Save/Load Integration --- //
// State (`lastLotteryTime`) is saved via updateState({ leafLottery: ... })
// Buffs are handled by Resources.js save/load