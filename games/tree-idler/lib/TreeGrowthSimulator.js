// ... TreeGrowthSimulator.js ...
// Modular tree growth simulator using Saplings Growing Up and sunray-based algorithms

export function createSimulator(options = {}) {
  return {
    options,
    getGrowthParameters,
    renderTree,
    simulateGrowth,
  };
}

// Utility to bias angle toward sun
function biasAngleTowardSun(angle, sunAngle, intensity = 1) {
  // Blend the branch angle toward the sun angle based on intensity (0-1)
  return angle + (sunAngle - angle) * 0.25 * intensity;
}

// Example: species-specific parameter overrides
const speciesPresets = {
  Oak: {
    trunkWidth: 7,
    branchFactor: 0.7,
    leafSize: 4,
  },
  Willow: {
    branchAngle: Math.PI / 8,
    leafCount: 5,
    leafSize: 2.5,
  },
  Pine: {
    trunkWidth: 4,
    branchFactor: 0.8,
    leafSize: 2,
    maxDepth: 8,
  },
};

export function getGrowthParameters(stage = 1, sunlight = 0, season = 'spring', species = 'Oak') {
  // Use species presets and adjust for stage/sunlight/season
  const preset = speciesPresets[species] || speciesPresets['Oak'];
  const maxDepth = Math.min(5 + Math.floor(stage / 2), preset.maxDepth || 7);
  return {
    trunkLength: 60 + stage * 10,
    trunkWidth: preset.trunkWidth || 6,
    branchAngle: preset.branchAngle || Math.PI / 6,
    branchFactor: preset.branchFactor || 0.7,
    leafCount: preset.leafCount || Math.min(3 + stage, 12),
    leafSize: preset.leafSize || 3,
    rootCount: 2 + Math.floor(stage / 2),
    rootDepth: 20 + stage * 5,
    rootWidth: 2 + stage * 0.5,
    maxDepth,
    sunlight,
    season,
    species,
    sunAngle: Math.PI / 2, // Always up for now
    jitter: 0.1,
  };
}

// Recursive function to draw the tree trunk and branches using Saplings Growing Up Algorithm
function drawBranch(ctx, x, y, params, depth = 0, angle = -Math.PI / 2) {
  if (depth > params.maxDepth) return;
  const length = depth === 0 ? params.trunkLength : params.trunkLength * Math.pow(params.branchFactor, depth);
  const width = depth === 0 ? params.trunkWidth : params.trunkWidth * Math.pow(params.branchFactor, depth);
  const jitter = params.jitter ? params.jitter * (0.5 - (params.seed || 0.5)) * Math.PI : 0;
  const endX = x + Math.cos(angle + jitter) * length;
  const endY = y + Math.sin(angle + jitter) * length;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = width;
  ctx.strokeStyle = depth === 0 ? '#8B4513' : `hsl(25, 60%, ${30 + depth * 5}%)`;
  ctx.stroke();
  // Draw leaves at the ends of branches
  if (depth > 0 && depth === params.maxDepth - 1) {
    drawLeaves(ctx, endX, endY, params);
  }
  // Recursively draw branches, biasing toward sun
  if (depth < params.maxDepth) {
    const sunIntensity = params.sunlight ? Math.min(params.sunlight / 100, 1) : 0.5;
    const leftAngle = biasAngleTowardSun(
      angle - params.branchAngle + ((params.seed || 0.5) - 0.5) * 0.2,
      params.sunAngle,
      sunIntensity
    );
    const rightAngle = biasAngleTowardSun(
      angle + params.branchAngle + ((params.seed || 0.5) - 0.5) * 0.2,
      params.sunAngle,
      sunIntensity
    );
    drawBranch(ctx, endX, endY, params, depth + 1, leftAngle);
    drawBranch(ctx, endX, endY, params, depth + 1, rightAngle);
    if (params.maxDepth > 5 && depth < 2) {
      const midAngle = biasAngleTowardSun(
        angle + ((params.seed || 0.5) - 0.5) * 0.3,
        params.sunAngle,
        sunIntensity
      );
      drawBranch(ctx, endX, endY, params, depth + 1, midAngle);
    }
  }
  // Draw roots at the base of the trunk
  if (depth === 0) {
    drawRoots(ctx, x, y, params);
  }
}

function drawLeaves(ctx, x, y, params) {
  const leafCount = Math.min(params.leafCount, 12);
  const radius = params.leafSize * 3;
  ctx.fillStyle = '#32CD32'; // Default green
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + (params.seed || 0);
    const distance = radius * (0.5 + (params.seed || 0.5) * 0.5);
    const leafX = x + Math.cos(angle) * distance;
    const leafY = y + Math.sin(angle) * distance;
    ctx.beginPath();
    ctx.ellipse(leafX, leafY, params.leafSize, params.leafSize * 1.5, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRoots(ctx, x, y, params) {
  const rootCount = params.rootCount;
  const rootSpread = params.trunkWidth * 3;
  for (let i = 0; i < rootCount; i++) {
    const direction = i % 2 === 0 ? -1 : 1;
    const rootLength = params.rootDepth * (0.7 + (params.seed || 0.5) * 0.6);
    const controlX = x + direction * rootSpread * (0.5 + (params.seed || 0.5) * 0.5);
    const controlY = y + rootLength * 0.5;
    const endX = x + direction * rootSpread * (1 + (params.seed || 0.5) * 0.5);
    const endY = y + rootLength;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.lineWidth = params.rootWidth * (0.5 + (params.seed || 0.5) * 0.5);
    ctx.strokeStyle = '#654321';
    ctx.stroke();
  }
}

export function renderTree(ctx, width, height, state) {
  const params = getGrowthParameters(state.stage, state.sunlight, state.season, state.species);
  params.seed = state.visualSeed || Math.random();
  params.jitter = 0.1 + (state.stage > 5 ? 0.05 : 0);
  drawBranch(ctx, width / 2, height, params);
  // Weather overlays
  if (state.weather === 'rain') {
    drawRain(ctx, width, height);
  } else if (state.weather === 'frost') {
    drawFrost(ctx, width, height);
  } else if (state.weather === 'drought') {
    drawDrought(ctx, width, height);
  }
}

function drawRain(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(100,180,255,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 2, y + 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFrost(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(200,240,255,0.7)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 6, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDrought(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(220,180,80,0.3)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = height - 10 - Math.random() * 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16, y);
    ctx.stroke();
  }
  ctx.restore();
}

// Advances the tree state by delta (time/resources)
export function simulateGrowth(state, delta) {
  // Simple: advance stage every 60s, unlock slots at certain stages
  const newState = { ...state };
  if (!newState._growthTimer) newState._growthTimer = 0;
  newState._growthTimer += delta;
  if (newState._growthTimer >= 60) {
    newState.stage = (newState.stage || 1) + 1;
    newState._growthTimer = 0;
    // Unlock slots
    if (newState.stage % 2 === 0) newState.slots.leaves++;
    if (newState.stage % 2 === 1) newState.slots.roots++;
    if (newState.stage === 3) newState.slots.fruits = 1;
    if (newState.stage === 7) newState.slots.critters = 1;
  }
  return newState;
}
