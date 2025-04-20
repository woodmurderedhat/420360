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

  // Growth stage properties
  GROWTH_STAGES: [
    { name: "Seedling", multiplier: 1 },
    { name: "Sapling", multiplier: 1.5 },
    { name: "Mature", multiplier: 2 },
  ],
};

export default Config;
