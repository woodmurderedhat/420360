// state.js - central state and helpers
export const State = {
  round: 0,
  config: {
    maxPlayers: 10,
    maxLPs: 10,
    houseEdge: 0.02,
    feeRate: 0.01,
  defaultOdds: 100/49, // ~2.0408x baseline (legacy)
  currentRollUnder: 49.5,
    minBet: 10,
    maxBet: 5000,
  // Simulator betting limits
  simMinBet: 10,
  simMaxBet: 500,
  // Crypto market simulation
  cryptoPrice: 50000, // Starting price in USD (e.g., Bitcoin)
  cryptoVolatility: 0.02, // 2% volatility per round
  cryptoTrend: 0, // -1 bearish, 0 neutral, 1 bullish
  maxExposureRatio: 0.25,
  cheatUnlocked: false,
  lpTokenization: true,
  deterministicRNG: false,
  maxAutoRounds: 0, // 0 = unlimited
  lpMinLockSecs: 0, // default no lock; can be adjusted via UI/console
  autoP0Enabled: false // when true, P0 will auto-bet using its strategy each round
  ,autoReactivate: false // auto reactivate sim players when criteria met
  ,rebuyThreshold: 50 // display units (e.g., dollars) threshold below which a rebuy can occur
  ,rebuyAmount: 500 // display units credited on rebuy
  ,rebuyCooldownRounds: 20 // minimum rounds between rebuys per player
  },
  bank: { liquidity: 0, reserved: 0, totalTokenSupply: 0, deltaBuffer: [] },
  owner: { feeBalance: 0 },
  players: [],
  lps: [],
  analytics: {
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    streaks: { longestWin: 0, longestLoss: 0 },
    houseProfit: 0,
  betVolume: 0, // cents
  betHistogram: new Map(), // key bucket -> count
  initialValue: 0,
  streakDist: new Map(), // key like W3 or L5 -> count
  anomalies: []
  },
  log: []
};

export function resetState() {
  State.round = 0;
  State.bank.liquidity = 0;
  State.bank.reserved = 0;
  State.owner.feeBalance = 0;
  State.players.length = 0;
  State.lps.length = 0;
  State.analytics.totalBets = 0;
  State.analytics.totalWins = 0;
  State.analytics.totalLosses = 0;
  State.analytics.streaks.longestWin = 0;
  State.analytics.streaks.longestLoss = 0;
  State.analytics.houseProfit = 0;
  State.analytics.betVolume = 0;
  // clear maps / arrays that hold dynamic references
  State.analytics.betHistogram = new Map();
  State.analytics.streakDist = new Map();
  State.analytics.anomalies = [];
  State.log.length = 0;
}
