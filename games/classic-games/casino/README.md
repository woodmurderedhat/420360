# Casino Dice Simulation (Prototype)

Modular ES module implementation of a pseudo on-chain style dice game for economic / strategy visualization. No real money, not a blockchain dApp.

## Features (M0-M1)
- Up to 10 players (P0 manual, others simulated)
- Strategies: fixed, random, martingale (basic)
- Liquidity providers pool with proportional shares
- Owner fee & house edge economics
- Autoplay loop + single step
- Basic analytics: bets, wins, losses, streak highs, realized edge

## Run
Open `index.html` in a modern browser (no build step). Click Init then Auto ▶ or Step.

## Next Ideas
- More strategies (anti-martingale, stop-loss brackets)
- LP deposit/withdraw UI controls
- Charts / distributions
- Seeded RNG + replay
- Persistence (localStorage)

---
Educational only.
