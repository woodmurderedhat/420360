// Tree.js
// Handles growth stages, slots, and procedural rendering.
import { emit, on, off } from './EventBus.js';

export const name = 'Tree';

let state = null;

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
 * Procedural tree rendering using recursive branching algorithm
 * @param {Object} e - Event with canvas and state
 */
function handleRenderTree(e) {
  const { canvas, state } = e.detail;
  if (!canvas) return; // No canvas to render on

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Set up tree parameters based on stage
  const treeParams = getTreeParameters(state);

  // Draw the tree
  drawTree(ctx, width / 2, height, treeParams);

  // Add seasonal effects
  addSeasonalEffects(ctx, width, height, state.season);

  // Add fruits if applicable
  if (state.slots.fruits > 0) {
    drawFruits(ctx, width, height, state);
  }

  // Add critters if applicable
  if (state.slots.critters > 0) {
    drawCritters(ctx, width, height, state);
  }
}

/**
 * Get tree rendering parameters based on growth stage
 * @param {Object} state - Tree state
 * @returns {Object} Parameters for tree rendering
 */
function getTreeParameters(state) {
  const stage = state.stage;
  const seed = state.visualSeed || Math.random();

  // Base parameters
  const params = {
    trunkLength: 60 + stage * 10,
    trunkWidth: 5 + stage * 2,
    branchFactor: 0.75,
    branchAngle: Math.PI / 6,
    maxDepth: 3 + Math.min(stage, 7),
    leafSize: 3 + stage * 0.5,
    leafCount: state.slots.leaves * 3,
    rootDepth: 20 + stage * 5,
    rootWidth: 3 + stage * 1.5,
    rootCount: state.slots.roots * 2,
    seed: seed,
    jitter: 0.1 + (stage > 5 ? 0.05 : 0)
  };

  // Adjust for legendary stages
  if (stage >= 11) {
    params.trunkWidth += (stage - 10) * 1.5;
    params.leafSize += (stage - 10) * 0.3;
    params.branchFactor = 0.8;
    params.maxDepth += Math.min(stage - 10, 3);
  }

  return params;
}

/**
 * Draw the tree trunk and branches recursively
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Starting x position
 * @param {number} y - Starting y position
 * @param {Object} params - Tree parameters
 * @param {number} depth - Current recursion depth
 * @param {number} angle - Current branch angle
 */
function drawTree(ctx, x, y, params, depth = 0, angle = -Math.PI / 2) {
  if (depth > params.maxDepth) return;

  const length = depth === 0 ? params.trunkLength : params.trunkLength * Math.pow(params.branchFactor, depth);
  const width = depth === 0 ? params.trunkWidth : params.trunkWidth * Math.pow(params.branchFactor, depth);

  // Calculate end point with some randomness
  const jitter = params.jitter * (0.5 - params.seed) * Math.PI;
  const endX = x + Math.cos(angle + jitter) * length;
  const endY = y + Math.sin(angle + jitter) * length;

  // Draw branch/trunk
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = width;

  // Color based on depth (trunk vs branches)
  if (depth === 0) {
    ctx.strokeStyle = '#8B4513'; // Brown for trunk
  } else {
    // Gradually lighter brown for branches
    const lightness = 30 + depth * 5;
    ctx.strokeStyle = `hsl(25, 60%, ${lightness}%)`;
  }

  ctx.stroke();

  // Draw leaves at the ends of branches
  if (depth > 0 && depth === params.maxDepth - 1) {
    drawLeaves(ctx, endX, endY, params);
  }

  // Recursively draw branches
  if (depth < params.maxDepth) {
    // Left branch
    drawTree(
      ctx,
      endX,
      endY,
      params,
      depth + 1,
      angle - params.branchAngle + (params.seed - 0.5) * 0.2
    );

    // Right branch
    drawTree(
      ctx,
      endX,
      endY,
      params,
      depth + 1,
      angle + params.branchAngle + (params.seed - 0.5) * 0.2
    );

    // Sometimes add a middle branch for more fullness in higher stages
    if (params.maxDepth > 5 && depth < 2) {
      drawTree(
        ctx,
        endX,
        endY,
        params,
        depth + 1,
        angle + (params.seed - 0.5) * 0.3
      );
    }
  }

  // Draw roots at the base of the trunk
  if (depth === 0) {
    drawRoots(ctx, x, y, params);
  }
}

/**
 * Draw leaves around branch endpoints
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center x position
 * @param {number} y - Center y position
 * @param {Object} params - Tree parameters
 */
function drawLeaves(ctx, x, y, params) {
  const leafCount = Math.min(params.leafCount, 12);
  const radius = params.leafSize * 3;

  // Determine leaf color based on season
  let leafColor;
  switch (params.season) {
    case 'summer':
      leafColor = '#228B22'; // Forest green
      break;
    case 'autumn':
      // Random autumn colors
      const autumnColors = ['#FF8C00', '#FF4500', '#8B0000', '#DAA520'];
      leafColor = autumnColors[Math.floor(params.seed * autumnColors.length)];
      break;
    case 'winter':
      leafColor = '#7CFC00'; // Lighter green with less leaves
      break;
    case 'spring':
    default:
      leafColor = '#32CD32'; // Lime green
  }

  ctx.fillStyle = leafColor;

  // Draw cluster of leaves
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + params.seed;
    const distance = radius * (0.5 + params.seed * 0.5);
    const leafX = x + Math.cos(angle) * distance;
    const leafY = y + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.ellipse(
      leafX,
      leafY,
      params.leafSize,
      params.leafSize * 1.5,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

/**
 * Draw roots at the base of the trunk
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Starting x position
 * @param {number} y - Starting y position
 * @param {Object} params - Tree parameters
 */
function drawRoots(ctx, x, y, params) {
  const rootCount = params.rootCount;
  const rootSpread = params.trunkWidth * 3;

  for (let i = 0; i < rootCount; i++) {
    // Alternate roots left and right
    const direction = i % 2 === 0 ? -1 : 1;
    // Calculate angle for visual reference (not used directly in drawing)
    // const angle = Math.PI / 2 + direction * (Math.PI / 4 + params.seed * 0.2);

    // Calculate control and end points for the curve
    const rootLength = params.rootDepth * (0.7 + params.seed * 0.6);
    const controlX = x + direction * rootSpread * (0.5 + params.seed * 0.5);
    const controlY = y + rootLength * 0.5;
    const endX = x + direction * rootSpread * (1 + params.seed * 0.5);
    const endY = y + rootLength;

    // Draw the root
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.lineWidth = params.rootWidth * (0.5 + params.seed * 0.5);
    ctx.strokeStyle = '#654321'; // Dark brown for roots
    ctx.stroke();
  }
}

/**
 * Draw fruits on the tree
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} state - Tree state
 */
function drawFruits(ctx, width, height, state) {
  const fruitCount = state.slots.fruits;
  const seed = state.visualSeed || Math.random();
  const stage = state.stage;

  // Only draw fruits if we have slots for them
  if (fruitCount <= 0) return;

  // Determine fruit positions based on tree structure
  const treeHeight = 60 + stage * 10; // Same as trunk length
  const treeWidth = treeHeight * 0.8;

  // Fruit color and size
  ctx.fillStyle = '#FF0000'; // Red apples

  for (let i = 0; i < fruitCount; i++) {
    // Distribute fruits around the tree crown
    const angle = (i / fruitCount) * Math.PI * 2 + seed;
    const distance = treeWidth * 0.6 * (0.7 + seed * 0.3);
    const fruitX = width / 2 + Math.cos(angle) * distance;
    const fruitY = height - treeHeight * 0.7 + Math.sin(angle) * distance * 0.5;
    const fruitSize = 5 + stage * 0.5;

    // Draw the fruit
    ctx.beginPath();
    ctx.arc(fruitX, fruitY, fruitSize, 0, Math.PI * 2);
    ctx.fill();

    // Add a small stem
    ctx.beginPath();
    ctx.moveTo(fruitX, fruitY - fruitSize);
    ctx.lineTo(fruitX, fruitY - fruitSize - 3);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#654321';
    ctx.stroke();
  }
}

/**
 * Draw critters on the tree
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} state - Tree state
 */
function drawCritters(ctx, width, height, state) {
  const critterCount = state.slots.critters;
  const seed = state.visualSeed || Math.random();
  const stage = state.stage;

  // Only draw critters if we have slots for them
  if (critterCount <= 0) return;

  // Determine critter positions based on tree structure
  const treeHeight = 60 + stage * 10; // Same as trunk length
  const treeWidth = treeHeight * 0.8;

  for (let i = 0; i < critterCount; i++) {
    // Distribute critters around the tree
    const angle = (i / critterCount) * Math.PI * 1.5 + seed + Math.PI / 4;
    const distance = treeWidth * 0.7 * (0.6 + seed * 0.4);
    const critterX = width / 2 + Math.cos(angle) * distance;
    const critterY = height - treeHeight * 0.5 + Math.sin(angle) * distance * 0.6;

    // Draw a simple bird or squirrel silhouette
    if (i % 2 === 0) {
      // Bird
      drawBird(ctx, critterX, critterY, 8 + seed * 4);
    } else {
      // Squirrel
      drawSquirrel(ctx, critterX, critterY, 10 + seed * 5);
    }
  }
}

/**
 * Draw a simple bird silhouette
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center x position
 * @param {number} y - Center y position
 * @param {number} size - Bird size
 */
function drawBird(ctx, x, y, size) {
  ctx.fillStyle = '#000000';

  // Bird body
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bird wings
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x - size * 1.2, y - size * 0.8);
  ctx.lineTo(x - size * 0.8, y);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x + size * 1.2, y - size * 0.8);
  ctx.lineTo(x + size * 0.8, y);
  ctx.closePath();
  ctx.fill();

  // Bird head
  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Bird beak
  ctx.beginPath();
  ctx.moveTo(x + size * 1.1, y - size * 0.3);
  ctx.lineTo(x + size * 1.5, y - size * 0.2);
  ctx.lineTo(x + size * 1.1, y - size * 0.1);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a simple squirrel silhouette
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center x position
 * @param {number} y - Center y position
 * @param {number} size - Squirrel size
 */
function drawSquirrel(ctx, x, y, size) {
  ctx.fillStyle = '#8B4513'; // Brown

  // Squirrel body
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size * 1.2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Squirrel head
  ctx.beginPath();
  ctx.arc(x - size * 0.7, y - size * 0.7, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Squirrel tail
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, y + size * 0.4);
  ctx.quadraticCurveTo(
    x + size * 1.2,
    y,
    x + size * 0.8,
    y - size * 0.8
  );
  ctx.quadraticCurveTo(
    x + size * 0.6,
    y - size * 1.2,
    x + size * 0.2,
    y - size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Squirrel ear
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.9,
    y - size * 1.1,
    size * 0.2,
    size * 0.4,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

/**
 * Add seasonal effects to the tree scene
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} season - Current season
 */
function addSeasonalEffects(ctx, width, height, season) {
  switch (season) {
    case 'winter':
      // Add snow
      drawSnow(ctx, width, height);
      break;
    case 'spring':
      // Add flowers
      drawFlowers(ctx, width, height);
      break;
    case 'autumn':
      // Add falling leaves
      drawFallingLeaves(ctx, width, height);
      break;
    case 'summer':
      // Add sun rays
      drawSunRays(ctx, width, height);
      break;
  }
}

/**
 * Draw snow effect for winter
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawSnow(ctx, width, height) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

  // Draw snow on the ground
  ctx.beginPath();
  ctx.rect(0, height - 20, width, 20);
  ctx.fill();

  // Draw snowflakes
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.7;
    const size = 1 + Math.random() * 3;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw flowers effect for spring
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawFlowers(ctx, width, height) {
  const flowerColors = ['#FF69B4', '#FF1493', '#FFC0CB', '#FFFF00'];

  // Draw flowers on the ground
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = height - 10 - Math.random() * 20;
    const size = 3 + Math.random() * 4;
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

    // Flower petals
    ctx.fillStyle = color;
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * size;
      const petalY = y + Math.sin(angle) * size;

      ctx.beginPath();
      ctx.arc(petalX, petalY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flower center
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw falling leaves effect for autumn
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawFallingLeaves(ctx, width, height) {
  const leafColors = ['#FF8C00', '#FF4500', '#8B0000', '#DAA520'];

  // Draw falling leaves
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.8;
    const size = 4 + Math.random() * 5;
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const angle = Math.random() * Math.PI * 2;

    ctx.fillStyle = color;

    // Draw a simple leaf shape
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(0, size * 1.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#8B4513';
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Draw sun rays effect for summer
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawSunRays(ctx, width, height) {
  // Draw sun in the corner
  const sunX = width * 0.9;
  const sunY = height * 0.1;
  const sunRadius = 30;

  // Sun glow
  const gradient = ctx.createRadialGradient(
    sunX, sunY, sunRadius * 0.5,
    sunX, sunY, sunRadius * 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Sun circle
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sun rays
  ctx.strokeStyle = '#FFFF00';
  ctx.lineWidth = 2;

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const startX = sunX + Math.cos(angle) * sunRadius;
    const startY = sunY + Math.sin(angle) * sunRadius;
    const endX = sunX + Math.cos(angle) * sunRadius * 2;
    const endY = sunY + Math.sin(angle) * sunRadius * 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}
