export const DEFAULT_IMAGE_URL = 'assets/images/420360arcadebanner.png';

export const QUALITY_TIERS = {
  low: { label: 'low', chanceScale: 0.55, intensityScale: 0.72, maxEffects: 3, maxCost: 4 },
  balanced: { label: 'balanced', chanceScale: 0.9, intensityScale: 1.0, maxEffects: 4, maxCost: 7 },
  high: { label: 'high', chanceScale: 1.0, intensityScale: 1.15, maxEffects: 6, maxCost: 11 }
};

export const PIPELINE_PRESETS = {
  cinematic: {
    move: [
      { id: 'drift-shear', weight: 1.4 },
      { id: 'chroma-banding', weight: 1.1 },
      { id: 'channel-fracture', weight: 0.95 },
      { id: 'edge-crawl', weight: 0.9 },
      { id: 'edge-sink', weight: 0.8 },
      { id: 'directional-exposure', weight: 1.1 }
    ],
    moveSwipe: [
      { id: 'swipe-tear', weight: 1.2 },
      { id: 'wave-tear', weight: 1.0 },
      { id: 'ribbon-desync', weight: 1.0 },
      { id: 'ghost-trails', weight: 0.8 }
    ],
    moveWhip: [
      { id: 'whip-burst', weight: 1.4 },
      { id: 'channel-fracture', weight: 0.9 },
      { id: 'tile-shatter', weight: 0.8 }
    ],
    moveJitter: [
      { id: 'jitter-grid', weight: 1.3 },
      { id: 'chroma-banding', weight: 1.0 },
      { id: 'edge-crawl', weight: 0.7 },
      { id: 'edge-sink', weight: 0.7 },
      { id: 'cut-horizontal-burn', weight: 0.75 },
      { id: 'cut-horizontal-sink', weight: 0.75 },
      { id: 'cut-vertical-burn', weight: 0.75 },
      { id: 'cut-vertical-sink', weight: 0.75 }
    ],
    moveSurge: [
      { id: 'surge-overdrive', weight: 1.3 },
      { id: 'wave-tear', weight: 1.0 },
      { id: 'ribbon-desync', weight: 1.0 },
      { id: 'temporal-echo', weight: 0.9 },
      { id: 'per-channel-echo', weight: 0.95 },
      { id: 'cut-horizontal-burn', weight: 0.7 },
      { id: 'cut-horizontal-sink', weight: 0.7 },
      { id: 'cut-vertical-burn', weight: 0.7 },
      { id: 'cut-vertical-sink', weight: 0.7 }
    ],
    moveStall: [
      { id: 'stall-dropout', weight: 1.4 },
      { id: 'tile-shatter', weight: 0.9 },
      { id: 'cut-horizontal-burn', weight: 0.6 },
      { id: 'cut-horizontal-sink', weight: 0.8 },
      { id: 'cut-vertical-burn', weight: 0.6 },
      { id: 'cut-vertical-sink', weight: 0.8 }
    ],
    click: [
      { id: 'impact-fracture', weight: 1.4 },
      { id: 'edge-shard-jitter', weight: 1.05 },
      { id: 'ghost-trails', weight: 1.0 },
      { id: 'temporal-echo', weight: 0.8 }
    ],
    scrollUp: [
      { id: 'scroll-up-rake', weight: 1.4 },
      { id: 'edge-crawl', weight: 0.8 }
    ],
    scrollDown: [
      { id: 'scroll-down-sink', weight: 1.4 },
      { id: 'tile-shatter', weight: 0.8 }
    ],
    ambient: [
      { id: 'ambient-flicker', weight: 1.1 },
      { id: 'temporal-echo', weight: 0.7 },
      { id: 'per-channel-echo', weight: 0.75 },
      { id: 'edge-crawl', weight: 0.7 },
      { id: 'edge-sink', weight: 0.7 },
      { id: 'directional-exposure', weight: 0.8 }
    ]
  },
  chaotic: {
    move: [
      { id: 'surge-overdrive', weight: 1.0 },
      { id: 'whip-burst', weight: 1.0 },
      { id: 'channel-fracture', weight: 1.0 },
      { id: 'wave-tear', weight: 0.95 },
      { id: 'jitter-grid', weight: 1.0 },
      { id: 'ribbon-desync', weight: 0.8 },
      { id: 'directional-exposure', weight: 1.0 },
      { id: 'cut-horizontal-burn', weight: 0.8 },
      { id: 'cut-horizontal-sink', weight: 0.8 },
      { id: 'cut-vertical-burn', weight: 0.8 },
      { id: 'cut-vertical-sink', weight: 0.8 }
    ],
    moveSwipe: [
      { id: 'swipe-tear', weight: 1.1 },
      { id: 'surge-overdrive', weight: 1.1 },
      { id: 'wave-tear', weight: 1.05 },
      { id: 'tile-shatter', weight: 0.9 }
    ],
    moveWhip: [
      { id: 'whip-burst', weight: 1.2 },
      { id: 'impact-fracture', weight: 1.0 },
      { id: 'edge-shard-jitter', weight: 0.95 },
      { id: 'ribbon-desync', weight: 0.8 }
    ],
    moveJitter: [
      { id: 'jitter-grid', weight: 1.2 },
      { id: 'ghost-trails', weight: 0.9 },
      { id: 'edge-crawl', weight: 0.9 },
      { id: 'edge-sink', weight: 0.9 },
      { id: 'cut-horizontal-burn', weight: 0.9 },
      { id: 'cut-horizontal-sink', weight: 0.9 },
      { id: 'cut-vertical-burn', weight: 0.9 },
      { id: 'cut-vertical-sink', weight: 0.9 }
    ],
    moveSurge: [
      { id: 'surge-overdrive', weight: 1.4 },
      { id: 'channel-fracture', weight: 1.05 },
      { id: 'impact-fracture', weight: 1.0 },
      { id: 'wave-tear', weight: 1.0 },
      { id: 'temporal-echo', weight: 0.8 }
    ],
    moveStall: [
      { id: 'stall-dropout', weight: 1.3 },
      { id: 'edge-crawl', weight: 1.0 },
      { id: 'edge-sink', weight: 1.0 },
      { id: 'cut-horizontal-burn', weight: 0.8 },
      { id: 'cut-horizontal-sink', weight: 1.0 },
      { id: 'cut-vertical-burn', weight: 0.8 },
      { id: 'cut-vertical-sink', weight: 1.0 }
    ],
    click: [
      { id: 'impact-fracture', weight: 1.2 },
      { id: 'surge-overdrive', weight: 1.0 },
      { id: 'edge-shard-jitter', weight: 1.0 },
      { id: 'ghost-trails', weight: 1.0 }
    ],
    scrollUp: [
      { id: 'scroll-up-rake', weight: 1.1 },
      { id: 'ribbon-desync', weight: 1.0 }
    ],
    scrollDown: [
      { id: 'scroll-down-sink', weight: 1.1 },
      { id: 'tile-shatter', weight: 1.0 }
    ],
    ambient: [
      { id: 'ambient-flicker', weight: 0.9 },
      { id: 'edge-crawl', weight: 0.9 },
      { id: 'edge-sink', weight: 0.9 },
      { id: 'temporal-echo', weight: 0.9 },
      { id: 'per-channel-echo', weight: 0.85 },
      { id: 'directional-exposure', weight: 0.9 }
    ]
  },
  subtle: {
    move: [
      { id: 'drift-shear', weight: 1.4 },
      { id: 'chroma-banding', weight: 1.0 },
      { id: 'directional-exposure', weight: 0.8 }
    ],
    moveSwipe: [{ id: 'swipe-tear', weight: 1.0 }],
    moveWhip: [{ id: 'whip-burst', weight: 1.0 }],
    moveJitter: [
      { id: 'jitter-grid', weight: 1.0 },
      { id: 'cut-horizontal-burn', weight: 0.6 },
      { id: 'cut-horizontal-sink', weight: 0.6 },
      { id: 'cut-vertical-burn', weight: 0.6 },
      { id: 'cut-vertical-sink', weight: 0.6 }
    ],
    moveSurge: [{ id: 'surge-overdrive', weight: 1.0 }],
    moveStall: [{ id: 'stall-dropout', weight: 1.0 }],
    click: [{ id: 'impact-fracture', weight: 1.0 }],
    scrollUp: [{ id: 'scroll-up-rake', weight: 1.0 }],
    scrollDown: [{ id: 'scroll-down-sink', weight: 1.0 }],
    ambient: [
      { id: 'ambient-flicker', weight: 1.0 },
      { id: 'edge-crawl', weight: 0.7 },
      { id: 'edge-sink', weight: 0.7 }
    ]
  },
  mobileSafe: {
    move: [
      { id: 'drift-shear', weight: 1.3 },
      { id: 'directional-exposure', weight: 0.8 }
    ],
    moveSwipe: [{ id: 'swipe-tear', weight: 1.0 }],
    moveWhip: [{ id: 'whip-burst', weight: 1.0 }],
    moveJitter: [
      { id: 'jitter-grid', weight: 1.0 },
      { id: 'cut-horizontal-burn', weight: 0.6 },
      { id: 'cut-horizontal-sink', weight: 0.6 },
      { id: 'cut-vertical-burn', weight: 0.6 },
      { id: 'cut-vertical-sink', weight: 0.6 }
    ],
    moveSurge: [{ id: 'surge-overdrive', weight: 1.0 }],
    moveStall: [{ id: 'stall-dropout', weight: 1.0 }],
    click: [{ id: 'impact-fracture', weight: 1.0 }],
    scrollUp: [{ id: 'scroll-up-rake', weight: 1.0 }],
    scrollDown: [{ id: 'scroll-down-sink', weight: 1.0 }],
    ambient: [
      { id: 'ambient-flicker', weight: 1.0 },
      { id: 'edge-crawl', weight: 0.6 },
      { id: 'edge-sink', weight: 0.6 }
    ]
  }
};

export const EFFECT_COOLDOWNS = {
  move: 80,
  moveDrift: 110,
  moveSwipe: 75,
  moveWhip: 90,
  moveJitter: 95,
  moveSurge: 70,
  moveStall: 115,
  click: 140,
  scrollUp: 130,
  scrollDown: 130,
  ambient: 900
};

export const TIER_ORDER = ['low', 'balanced', 'high'];

export const MOUSE_LOCAL_DEFAULTS = {
  enabled: true,
  cooldownMs: 38,
  radiusMultiplier: 1,
  intensityMultiplier: 1.25,
  budgetMultiplier: 1,
  minCooldownMs: 12,
  minRadiusMultiplier: 0.35,
  minIntensityMultiplier: 0.25,
  minBudgetMultiplier: 0.2
};

export const MOUSE_LOCAL_TIER_PARAMS = {
  low: { radius: 42, budgetFraction: 0.038, cascades: 2, intensity: 0.72 },
  balanced: { radius: 96, budgetFraction: 0.08, cascades: 3, intensity: 1.12 },
  high: { radius: 124, budgetFraction: 0.115, cascades: 4, intensity: 1.25 }
};
