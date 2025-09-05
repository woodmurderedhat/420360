# Casino Simulation Testing

## Running Tests
From the `games/casino` directory (Node 18+ recommended):

```
npm test
```

The lightweight harness (no external deps) currently validates:
- RNG determinism after seeding (`RNG.setSeed`) 
- Internal odds enforcement (bet engine ignores provided `req.odds`) 
- LP liquidity invariant approximation (pool liquidity sum vs bank)

## Adding More Tests
Add new files under `tests/` and import the modules needed. Keep them deterministic by seeding the RNG or mocking where appropriate.

## Deterministic Mode
Toggle `State.config.deterministicRNG = true` (e.g. via console) and call `RNG.setSeed('my-seed')` then `RNG.enableDeterministic(true)` for reproducible sequences across rotations.

## Integer Cents Model
All monetary values are now stored internally as integer cents. Formatting to the UI uses `fmt(cents)`.
When adding new logic, convert user/display inputs with `toCents` and never store floats in balances.

## LP Locking
Setting a value in the Lock(s) input updates `State.config.lpMinLockSecs`. New stakes or deposits extend `lp.lockUntil` at least this many seconds into the future. Withdraw / unstake attempts while locked log a failure.

## Future Enhancements (Not Yet Implemented in Tests)
- Payout expectation vs empirical convergence
- Edge validation over large sample sizes
- Provably fair seed archive integrity
- LP token pricing over variable contributions
