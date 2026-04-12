- Recent Additions (since last update): Reverse Labouchere strategy, player EV stats, streak histogram, anomaly flags, rolling volatility, CSV export.
- [DONE] Additional strategies: D'Alembert, Fibonacci, Kelly (approx), Stop-after-N-wins.
- [TODO] Reverse Labouchere.
- [PLANNED] Strategy switching triggers (streak/drawdown/time).
- [PLANNED] Risk controls: per-strategy max escalation cooldown.
- [DONE] Adaptive base bet (% bankroll via baseBetPct in profile).
	- [DONE] Reverse Labouchere.
- [DONE] LP share tokenization simulation (mint/burn tokens; price = poolValue / supply).
	- [PLANNED] Time-weighted share accounting.
	- [DONE] Direct player-owned LP staking/unstaking (P0 wallet <-> LP balance transfer via UI buttons).
		- [DONE] Dedicated staking panel with max stake/unstake, validation feedback, owned LP highlighting, token value display.
- [DONE] Per-bet proof includes commit (pre-published) & roll derivation hash (server seed hidden until rotation/reveal).
- [DONE] Manual rotation + seed archive (last 20) with rolls count.
- [NEXT] Delayed automatic reveal window & clientSeed customization per player.
- [DONE] Export analytics JSON (download button implemented; CSV pending).
- Real-time anomaly flags (e.g., improbable streak > threshold sigma).
	- [DONE] Improbable streak anomaly detection & panel.
	- [DONE] Rolling bank volatility metric.
	- [DONE] Win/loss streak distribution histogram.
	- [DONE] CSV export of analytics & per-player stats.
# Casino Dice Simulation: Improvement Roadmap

## 1. Core Game Mechanics
- [DONE] Multiple concurrent bets per round (batch all active players each tick) to increase throughput realism.
- Variable house edge per game mode or promotional periods.
- Expanded bet types: over/under ranges, exact match jackpots, multi-roll parlays.
- Progressive jackpot funded by a slice of each losing bet; rare high multiplier outcomes.
- Side bets for streaks (e.g., wager that next 3 bets are wins) using combinatorial odds.

## 2. Player Strategy Layer
- [DONE] Configurable strategy profiles (in-code JSON object; future external JSON import).
- [DONE] Additional strategies: D'Alembert, Fibonacci, Kelly (approx), Stop-after-N-wins.
- [TODO] Reverse Labouchere.
- [PLANNED] Strategy switching triggers (streak/drawdown/time).
- [PLANNED] Risk controls: per-strategy max escalation cooldown.
- [DONE] Adaptive base bet (% bankroll via baseBetPct in profile).

## 3. Liquidity Provider (LP) System
- Time-weighted share accounting (record checkpoints so late joiners don’t dilute prior unrealized PnL unfairly).
- Locked stake periods with early withdrawal penalty logic.
- Dynamic fee split: owner/LP performance fee or performance-based bonuses.
- Individual LP risk tiers: opt into max exposure caps (LP declines share above threshold—remaining redistributed).
- LP auto-compound toggle (earnings auto-added to invested principal vs tracked as separate realized PnL bucket).
- [DONE] LP share tokenization simulation (mint/burn tokens; price = poolValue / supply).

## 4. Bank & Risk Management
- Real VaR-style exposure check: simulate worst-case streak windows before accepting large bets.
- Reserve ratio target: if liquidity < threshold, automatically reduce allowed maxBet or rollUnder variance.
- Circuit breaker: pause new bets if realized edge deviates beyond tolerance (e.g., due to variance or exploit).
- Rolling volatility metrics (std dev of bankDelta) for adjusting dynamic maxExposureRatio.
- Stress test mode: run Monte Carlo off-screen to project insolvency probability given current parameters.

## 5. Randomness & Fairness
- [DONE] Switch RNG to a provably fair commit-reveal chain (hash of (serverSeed + clientSeed + nonce)).
- [DONE] Per-bet proof includes commit (pre-published) & roll derivation hash (server seed hidden until rotation/reveal).
- [DONE] Manual rotation + seed archive (last 20) with rolls count.
- [NEXT] Delayed automatic reveal window & clientSeed customization per player.

## 6. Analytics & Telemetry
- [DONE] Time-series buffers for: liquidity, houseProfit (sparklines implemented; totalValue pending sparkline if needed).
- Win/loss streak distribution histogram separate from bet size histogram.
- Player-level EV and variance estimation (Wilson interval on win probability).
- LP APR / APY estimation (annualized based on session runtime scaling).
- [DONE] Export analytics JSON (download button implemented; CSV pending).
- Real-time anomaly flags (e.g., improbable streak > threshold sigma).

## 7. UI/UX Enhancements
- Tabbed dashboards: Players | LPs | Risk | Analytics | Settings.
- Tooltip micro-panels for each LP & player (history preview, last 5 bets, realized vs unrealized PnL).
- Dark/light theme toggle & responsive mobile layout tweaks.
- Color-coded streak intensity (heat gradient) instead of numeric only.
- Smooth animated counters instead of hard re-render flashes.

## 8. Session Management
- [DONE] Versioned save format (include schemaVersion, gracefully migrate older saves).
- Auto-save interval with debounced writes & local backup slots (slot1..slot5).
- Import/export (download JSON file) instead of only localStorage.
- Deterministic replay mode: store roll sequence seed + bet decisions for deterministic playback.

## 9. Performance & Architecture
- Switch from full re-render to diff-based updates (track dirty entities).
- Batch log updates & virtualized log view for long sessions (>10k lines).
- Offload simulation to a Web Worker when autoplay speed < 50ms to keep UI responsive.
- Use a state snapshot ring buffer for rewind/time-travel debugging.
- Add lightweight unit tests (e.g., Jest) for: payout math, LP share edge cases, serialization round-trip.

## 10. Extensibility / Multi-Game Support
- Abstract Game interface: register dice, roulette, blackjack modules with common bet lifecycle.
- Shared Bank + per-game risk modules; cross-game LP exposure dashboards.
- Modular strategy registry; allow runtime injection of user-authored strategies (sandboxed eval with safety checks).

## 11. Security / Integrity (Simulation Context)
- Input validation UI-side (min/max clamps) + internal asserts in processing functions.
- Guard against NaN / Infinity propagation (validate all numeric state mutations).
- Freeze config after lock-in period unless cheat/dev mode enabled.

## 12. Advanced Economic Features
- Simulated token price volatility affecting notional value; LP hedging mini-game.
- Fee tiers: higher volume players earn reduced feeRate (introduce loyalty program simulation).
- Referral bonus simulation (portion of referred player fees streamed to referrer wallet).
- Buy-back & burn mechanic: owner can burn a fraction of houseProfit to simulate token scarcity effect on LP token price (if tokenization implemented).

## 13. Visualization Ideas
- Animated dice roll outcome with timeline of last N rolls, color-coded by win/loss.
- Liquidity waterfall chart after large payouts.
- Real-time Gantt-like bar for active strategies across players.

## 14. Testing & Reliability
- Deterministic test seeds ensuring reproducible streak scenarios.
- Fuzz test harness generating random strategy mixes & asserting invariants (no negative liquidity, conservation of total value minus fees).
- [DONE] Invariant checks: sum(LP balances) == bank.liquidity (within epsilon) — basic banner implemented.
- Snapshot tests for serialization format.

## 15. Developer Tooling
- ESLint + Prettier config addition.
- TypeScript migration for stronger contract guarantees (interfaces for Player/LP/Config).
- Git hooks (pre-commit) running lint and lightweight test suite.

## 16. Reliability Metrics & Alerts
- Track simulation ticks per second; warn if UI falls behind.
- Health panel: invariants status, last drift correction, RNG seed, active strategies count.

## 17. Roadmap Phasing
- Phase 1: Provably fair RNG, charts, batch round processing.
- Phase 2: LP token model, strategy plugins, advanced analytics.
- Phase 3: Multi-game framework + stress testing + worker offload.
- Phase 4: Economic simulations (jackpot, fee tiers, referral, token price modeling).

## 18. Quick Wins (Low Effort / High Value)
1. [DONE] Versioned save format.
2. [DONE - scaffold] Provably fair RNG commit-reveal.
3. [DONE] Sparkline charts (liquidity & houseProfit).
4. [DONE] Batch player betting each round.
5. [DONE] Basic invariant assertion & warning banner.

---
This document enumerates potential enhancements to deepen realism, analytics clarity, performance, fairness, and extensibility of the dice casino simulation.
