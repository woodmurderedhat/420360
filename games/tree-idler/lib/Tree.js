// Tree.js
// Handles growth stages, slots, and procedural rendering.
import { emit, on, off } from './EventBus.js';
import { createSimulator } from './TreeGrowthSimulator.js';

export const name = 'Tree';

let state = null;
let simulator = createSimulator();

function getInitialTree() {
  return {
    stage: 1,
    slots: {
      leaves: 1,
      roots: 1,
      fruits: 0,
      critters: 0
    },
    visualSeed: Math.random(),
    legendary: 0,
    season: 'spring'
  };
}

export function install(api) {
  state = api?.state?.tree || getInitialTree();
  emit('treeInitialized', { ...state });
}

export function activate() {
  on('advanceStage', handleAdvanceStage);
  on('renderTree', handleRenderTree);
  on('seasonChange', handleSeasonChange);
}

export function deactivate() {
  off('advanceStage', handleAdvanceStage);
  off('renderTree', handleRenderTree);
  off('seasonChange', handleSeasonChange);
}

function handleAdvanceStage() {
  state.stage++;
  // Unlock slots at certain stages
  if (state.stage % 2 === 0) state.slots.leaves++;
  if (state.stage % 2 === 1) state.slots.roots++;
  if (state.stage === 3) state.slots.fruits = 1;
  if (state.stage === 7) state.slots.critters = 1;
  emit('treeStageAdvanced', { ...state });
  emit('stateUpdated', { tree: { ...state } });
  // Trigger a re-render with the new stage
  emit('renderTree', { canvas: null, state: { ...state } });
}

function handleSeasonChange(e) {
  state.season = e.detail.season;
  emit('stateUpdated', { tree: { ...state } });
  // Trigger a re-render with the new season
  emit('renderTree', { canvas: null, state: { ...state } });
}

/**
 * Procedural tree rendering using TreeGrowthSimulator
 * @param {Object} e - Event with canvas and state
 */
function handleRenderTree(e) {
  const { canvas, state } = e.detail;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  simulator.renderTree(ctx, width, height, state);
}

// The following functions are kept for legacy or migration purposes
// drawTree, drawLeaves, drawRoots, drawFruits, drawCritters
// These are no longer part of the rendering pipeline
