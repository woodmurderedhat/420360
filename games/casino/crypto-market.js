// crypto-market.js - Crypto market price simulation
import { State } from './state.js';
import { log } from './bet-engine.js';

let initialPrice = 50000;
let priceHistory = [];

export function initCryptoMarket() {
  initialPrice = State.config.cryptoPrice;
  priceHistory = [initialPrice];
}

export function updateCryptoPrice() {
  const cfg = State.config;
  
  // Base volatility
  let volatility = cfg.cryptoVolatility || 0.02;
  
  // Trend influence
  const trendBonus = cfg.cryptoTrend * 0.005; // 0.5% trend bias
  
  // Random price movement
  const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
  const priceChangePercent = (randomChange * volatility) + trendBonus;
  
  // Update price
  const oldPrice = cfg.cryptoPrice;
  cfg.cryptoPrice = Math.max(1, cfg.cryptoPrice * (1 + priceChangePercent));
  
  // Store price history (keep last 24 entries for "24h" change)
  priceHistory.push(cfg.cryptoPrice);
  if (priceHistory.length > 24) priceHistory.shift();
  
  // Log significant moves (>5%)
  if (Math.abs(priceChangePercent) > 0.05) {
    const direction = priceChangePercent > 0 ? '🚀' : '💥';
    log(`${direction} Crypto ${priceChangePercent > 0 ? 'pump' : 'dump'}: ${(priceChangePercent * 100).toFixed(1)}% to $${cfg.cryptoPrice.toFixed(0)}`);
  }
  
  return {
    currentPrice: cfg.cryptoPrice,
    previousPrice: oldPrice,
    changePercent: priceChangePercent,
    trend: cfg.cryptoTrend
  };
}

export function getCrypto24hChange() {
  if (priceHistory.length < 2) return 0;
  const current = priceHistory[priceHistory.length - 1];
  const dayAgo = priceHistory[0];
  return ((current - dayAgo) / dayAgo);
}

export function setCryptoTrend(trend) {
  State.config.cryptoTrend = Math.max(-1, Math.min(1, trend));
  const trendName = trend > 0 ? 'Bullish 🐂' : trend < 0 ? 'Bearish 🐻' : 'Neutral ⚖️';
  log(`Market trend set to: ${trendName}`);
}

export function setCryptoVolatility(volatility) {
  State.config.cryptoVolatility = Math.max(0, Math.min(0.2, volatility));
  log(`Crypto volatility set to: ${(volatility * 100).toFixed(1)}%`);
}

// Simulate crypto market effects on betting
export function getCryptoMultiplier() {
  // Price volatility affects betting behavior
  const volatility = State.config.cryptoVolatility || 0.02;
  
  // Higher volatility = higher risk appetite = slightly higher bets
  return 1 + (volatility * 5); // 2% volatility = 10% higher bets
}

// Export for testing
export function getCryptoState() {
  return {
    price: State.config.cryptoPrice,
    volatility: State.config.cryptoVolatility,
    trend: State.config.cryptoTrend,
    history: [...priceHistory],
    change24h: getCrypto24hChange()
  };
}