// Centralized configuration for game constants and tunable parameters
const Config = {
  // Resource caps
  MAX_SUNLIGHT: 1_000_000,
  MAX_WATER: 1_000_000,
  MAX_NUTRIENTS: 1_000_000,

  // Base production rates
  BASE_SUNLIGHT_PRODUCTION: 1,
  BASE_WATER_PRODUCTION: 1,
  BASE_NUTRIENT_PRODUCTION: 1,

  // Upgrade multipliers
  UPGRADE_MULTIPLIERS: {
    leaves: 1.2,
    roots: 1.15,
    fruit: 1.5,
  },

  // Upgrade costs
  UPGRADE_COSTS: {
    leaves: { sunlight: 100, water: 50 },
    roots: { water: 100, nutrients: 50 },
    fruit: { sunlight: 200, water: 100, nutrients: 100 },
  },

  // Fruit types
  FRUIT_TYPES: [
    { name: "Apple", value: 100 },
    { name: "Pear", value: 150 },
    { name: "Peach", value: 200 },
  ],

  // Growth stage properties (10 stages, matching Tree.js expectations)
  GROWTH_STAGES: [
    { name: "Seedling", multiplier: 1, leafSlots: 1, rootSlots: 1, fruitEnabled: false, branchDepth: 1, leafEfficiency: 1, rootEfficiency: 1, growthCost: { sunlight: 0, water: 0 } },
    { name: "Sprout", multiplier: 1.1, leafSlots: 2, rootSlots: 2, fruitEnabled: false, branchDepth: 2, leafEfficiency: 1.1, rootEfficiency: 1.1, growthCost: { sunlight: 10, water: 10 } },
    { name: "Sapling", multiplier: 1.2, leafSlots: 3, rootSlots: 3, fruitEnabled: true, branchDepth: 3, leafEfficiency: 1.2, rootEfficiency: 1.2, growthCost: { sunlight: 25, water: 25 } },
    { name: "Young Tree", multiplier: 1.3, leafSlots: 4, rootSlots: 4, fruitEnabled: true, branchDepth: 3, leafEfficiency: 1.3, rootEfficiency: 1.3, growthCost: { sunlight: 50, water: 50 } },
    { name: "Mature Tree", multiplier: 1.4, leafSlots: 5, rootSlots: 5, fruitEnabled: true, branchDepth: 4, leafEfficiency: 1.4, rootEfficiency: 1.4, growthCost: { sunlight: 100, water: 100 } },
    { name: "Tall Tree", multiplier: 1.5, leafSlots: 6, rootSlots: 6, fruitEnabled: true, branchDepth: 4, leafEfficiency: 1.5, rootEfficiency: 1.5, growthCost: { sunlight: 200, water: 200 } },
    { name: "Broad Tree", multiplier: 1.6, leafSlots: 7, rootSlots: 7, fruitEnabled: true, branchDepth: 5, leafEfficiency: 1.6, rootEfficiency: 1.6, growthCost: { sunlight: 400, water: 400 } },
    { name: "Old Tree", multiplier: 1.7, leafSlots: 8, rootSlots: 8, fruitEnabled: true, branchDepth: 5, leafEfficiency: 1.7, rootEfficiency: 1.7, growthCost: { sunlight: 800, water: 800 } },
    { name: "Ancient Tree", multiplier: 1.8, leafSlots: 9, rootSlots: 9, fruitEnabled: true, branchDepth: 6, leafEfficiency: 1.8, rootEfficiency: 1.8, growthCost: { sunlight: 1600, water: 1600 } },
    { name: "Elder Tree", multiplier: 2.0, leafSlots: 10, rootSlots: 10, fruitEnabled: true, branchDepth: 6, leafEfficiency: 2.0, rootEfficiency: 2.0, growthCost: { sunlight: 3200, water: 3200 } },
  ],

  // Colors and visuals
  COLORS: {
    backgroundSky: "#b3e0ff",
    backgroundMountains: "#a0b3c6",
    backgroundGround: "#8B4513",
    treeTrunk: "#5D4037",
    leaf: "#008000",
    leafStroke: "#006400",
    fruitRipe: "#FF5722",
    fruitUnripe: "#FFA726"
  },

  // Animation parameters
  ANIMATION: {
    leafSwayAmplitude: 0.15, // radians
    leafSwaySpeed: 1.2, // radians/sec
    parallax: [0.2, 0.5, 1] // background, mountains, ground
  },
};

export default Config;
