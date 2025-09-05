# Casino Dice Game Plan

A modular, self-contained HTML/JS simulation of a decentralized-style on-chain dice casino (proof-of-concept only). No blockchain, no wallets, no real randomness—just deterministic / pseudo-random simulation showcasing liquidity pool (LP) economics, player strategies, and house operations.

---

## 1. Objectives

- Demonstrate core flow of a house‑banked dice game with up to 10 Players + 10 LPs.
- Visualize bankroll dynamics (Players, LP pool, Owner fees) per round.
- Allow autoplay (simulation) + manual interaction for a "real" player.
- Support multiple betting strategies (fixed, random, martingale, anti‑martingale, stop‑loss / profit‑target).
- Track analytics: win/loss counts, streaks, house edge performance, LP yield.
- Provide an extendable skeleton for adding more games or plugging in a real RNG later.

---

## 2. Core Loop (Per Round)

1. Select next active player (sequential).
2. Determine bet amount & parameters (odds / roll-under) via strategy.
3. Validate: balances, max bet, bank solvency (can it cover max payout?).
4. Apply 1% fee → Owner wallet.
5. Generate pseudo-random roll 1–100.
6. Resolve outcome → Win path or Loss path.
7. Update balances, histories, analytics.
8. Optionally allow LP deposits/withdrawals after round.
9. Render updated UI dashboards.

---

## 3. Entities

- Player (id, wallet, isSim, strategy, config, streak trackers)
- LP (id, wallet, share, pending deposit/withdraw flags)
- Bank (liquidity, reserved exposure, share model)
- Owner (fee balance)
- Analytics (aggregated derived stats)
- RNG (pluggable module: Pseudo RNG now, future: VRF / crypto)

### Wallet

- balance: number
- history: array of transactional events
  - { type: 'bet' | 'win' | 'lose' | 'deposit' | 'withdraw' | 'fee' | 'lpGain', round, amount, meta }

---

## 4. Data Structures (Draft)

```js
const State = {
  round: 0,
  config: {
    maxPlayers: 10,
    maxLPs: 10,
    houseEdge: 0.02,   // additional to fee
    feeRate: 0.01,
    defaultOdds: 100/49, // example implied 2.04x payout path
    minBet: 10,
    maxBet: 5000,
    maxExposureRatio: 0.25 // bank can't risk >25% on any single payout
  },
  bank: {
    liquidity: 0,
    reserved: 0
  },
  owner: { feeBalance: 0 },
  players: [],
  lps: [],
  analytics: {
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    streaks: { longestWin: 0, longestLoss: 0 },
    lpEarnings: [],
    houseProfit: 0,
    volatilitySamples: []
  }
};
```

---

## 5. Mechanics

### 5.1 Bet Validation

- Reject if player balance < bet.
- Compute maxPayout = betNet * (1 - houseEdge) * odds.
- Require bank.liquidity >= maxPayout and (maxPayout <= bank.liquidity * config.maxExposureRatio).

### 5.2 Fee & Edge

- fee = bet * feeRate → owner.feeBalance.
- House edge applied only on payout side (reduces multiplier slightly).

### 5.3 Win Path

- payout = betNet * (1 - houseEdge) * odds.
- Player wallet +payout; bank.liquidity −= payout.

### 5.4 Loss Path

- Player wallet −= bet.
- betNet distributed to LPs proportional to their dynamic share at resolution time.
- bank.liquidity += betNet.

### 5.5 LP Shares

Dynamic share = lp.wallet.balance / totalLPBalance (no separate share tokens initially). Optional future enhancement: minted share tokens to decouple deposit timing.

### 5.6 Deposits / Withdrawals

- Deposit: increase wallet + bank.liquidity; share auto-recomputes.
- Withdraw: ensure (bank.liquidity − amount) ≥ outstanding reserved exposures.
- Potential partial withdrawal if insufficient free liquidity (stretch goal).

### 5.7 Strategies (Initial)

- fixed: constant baseBet.
- random: uniform [minBet, maxBetStrategy].
- martingale: double after loss, reset after win (with cap).
- antiMartingale (paroli): increase after win up to ladder, reset after loss.
- stopBracket: stop-loss / take-profit thresholds that disable further betting.

### 5.8 RNG

- `Math.random()` placeholder wrapped in `RNG.nextInt(1,100)`.
- Hook point for seeding or deterministic replay (store seeds per round).

### 5.9 Analytics Additions

- Rolling house edge realized = (houseProfit / totalBetsVolume).
- LP APR (simulated) extrapolated from average per-round earnings.
- Distribution histogram of bet sizes / outcomes.

---

## 6. UI / Dashboards

### Panels

1. Players Grid
   - id, strategy tag, balance, last bet, last result, streak.
2. LP Pool
   - total liquidity, list of LP balances + shares %, pending actions.
3. Owner
   - fee balance, realized houseProfit.
4. Round Log (scrolling)
   - textual events: P1 BET 120 (roll 37 < 50) WIN +134.22
5. Controls
   - Start/Stop autoplay, single-step round, adjust speed (ms delay), toggle strategy editing.
6. Strategy Editor (selected player)
   - pick strategy, base bet, limits.
7. Analytics
   - totals, charts (basic ASCII / simple bars) for early version.

### Style

- Align with existing retro / minimal docs: simple headings, monospace blocks for logs.

---

## 7. Module Breakdown (ES Modules)

- `state.js`: central mutable state & init helpers.
- `rng.js`: RNG abstraction.
- `models.js`: Player, LP, Wallet classes.
- `strategies.js`: implement strategy functions returning bet amount.
- `bet-engine.js`: validation + resolve logic.
- `lp-engine.js`: deposit/withdraw helpers.
- `analytics.js`: update + compute derived metrics.
- `ui-render.js`: DOM diff / render functions.
- `autoplay.js`: loop controller (setInterval / requestAnimationFrame style).
- `events.js`: simple pub/sub bus (optional; could be inline early).

All modules loaded via `<script type="module">` from `index.html` (mirroring other games—no bundler).

---

## 8. State Flow (Happy Path)

```
[autoplay tick] -> select player -> strategy(bal, history) -> betRequest
  -> bet-engine.validate(state, betRequest)
    -> if ok: executeRoll -> outcome
      -> update wallets, bank
      -> analytics.record(outcome)
      -> ui-render.refresh()
```

---

## 9. Performance & Limits

- Max 10 players & 10 LPs: O(n) loops trivial.
- Per-round operations < 1ms typical.
- UI updates batched; throttle to frame boundaries if speed > ~20 rounds/sec.

---

## 10. Edge Cases

- Bank insolvency attempt: bet rejected (log event).
- Martingale overflow: clamp to player balance or config.maxBet.
- Player zero balance: auto-disable further bets.
- All players disabled: autoplay halts.
- LP withdrawal draining pool below coverage → partial or rejection.

---

## 11. Roadmap (Milestones)

1. M0: Data model + manual single bet in console.
2. M1: Autoplay loop + fixed/random strategies + basic DOM display.
3. M2: Add martingale & anti-martingale + analytics counters.
4. M3: LP deposit/withdraw UI + dynamic share logic.
5. M4: Strategy editor & stop-loss / take-profit.
6. M5: Charts & deeper analytics (streak graphs, distribution bars).
7. M6: Persistence (localStorage snapshot & restore session).
8. M7: Pluggable RNG seeds + deterministic replay.
9. M8: Extend to second game type (e.g., roulette placeholder) using same bank.

---

## 12. Extension Ideas

- Tokenization of LP shares (mint/burn share units at deposit/withdraw).
- Multi-asset pools (separate sub-pools or unified with weights).
- Progressive jackpot side pot fed by small % of each bet.
- Risk tiers: conservative vs aggressive payout tables.
- Real cryptographic RNG adaptor.
- API export of round logs (JSON download).

---

## 13. Glossary

- Bet Net: bet minus fee.
- Exposure: potential max loss to bank for a single unresolved bet.
- LP: Liquidity Provider; supplies bankroll capital.
- House Edge: reduced multiplier vs true odds; source of expected profit.
- Fee: flat % skim to owner independent of win/loss variance.
- Strategy: algorithm determining bet size/params for a player.

---

## 14. Implementation Notes

- Keep numeric operations in floats; later introduce BigInt wrapper if precision becomes critical.
- Normalize all bet math to a helper to avoid drift.
- All history events stamped with round number for replay.
- Prefer pure functions for analytics for easier future testing.

---

## 15. Minimal HTML Skeleton (Draft)

```html
<div id="casino">
  <section id="players"></section>
  <section id="lp-pool"></section>
  <section id="owner"></section>
  <section id="controls"></section>
  <section id="analytics"></section>
  <section id="log" class="mono"></section>
</div>
<script type="module" src="./main.js"></script>
```

---

## 16. MVP Acceptance

- Can run 100+ autoplay rounds without errors.
- Balances remain non-negative and conserve value: Sum(player balances) + bank + owner fees equals initial capital + net simulated edge.
- Strategies selectable for at least 3 players.
- LP distribution reflects proportional shares.

---

This plan aligns with existing project style: no build tools, modular ES scripts, clear folder-local scope.
