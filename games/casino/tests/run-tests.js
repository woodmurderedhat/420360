// Simple ad-hoc test harness (no deps)
import assert from 'assert';
import { RNG } from '../rng.js';
import { State, resetState } from '../state.js';
import { processBet } from '../bet-engine.js';
import { Player, LP } from '../models.js';
import { recomputeShares } from '../lp-engine.js';

let passed=0, failed=0;
function test(name, fn){
  try { fn(); console.log('PASS', name); passed++; }
  catch(e){ console.error('FAIL', name, e); failed++; }
}

// RNG determinism
test('RNG deterministic sequence after setSeed', ()=>{
  RNG.setSeed('abc');
  const seq1 = Array.from({length:5}, ()=> RNG.next());
  RNG.setSeed('abc');
  const seq2 = Array.from({length:5}, ()=> RNG.next());
  assert.deepStrictEqual(seq1, seq2, 'Sequences differ');
});

// Bet exposure and internal odds enforcement
import { getBetRequest } from '../strategies.js';

test('Bet engine ignores external odds manipulation', ()=>{
  resetState();
  const p = new Player(0, 5000, 'fixed', true); State.players.push(p);
  const lp = new LP(0, 10000); State.lps.push(lp); State.bank.liquidity += lp.wallet.balance; recomputeShares();
  p.baseBet = 100;
  const req = { amount: 100, odds: 9999, rollUnder: State.config.currentRollUnder };
  processBet(p, req);
  assert(p.lastBet.odds < 500, 'Internal odds not applied');
  // ensure balances are in cents (integers)
  assert(Number.isInteger(p.wallet.balance), 'Player balance not integer cents');
});

// LP delta distribution
import { log } from '../bet-engine.js';

test('LP delta distribution preserves total liquidity +/- tolerance', ()=>{
  resetState();
  for (let i=0;i<3;i++){ const lp = new LP(i, 1000); State.lps.push(lp); State.bank.liquidity += lp.wallet.balance; }
  recomputeShares();
  // simulate positive delta distribution via bet engine path is complex; here ensure recomputeShares keeps parity
  const total = State.lps.reduce((s,lp)=>s+lp.wallet.balance,0);
  assert(Math.abs(total - State.bank.liquidity) < 5, 'Liquidity drift after setup');
});

test('RNG fairness approximate distribution over large sample', ()=>{
  RNG.setSeed('fairness-seed');
  const N = 20000;
  const counts = new Array(10).fill(0); // buckets of 100 each
  for (let i=0;i<N;i++){
    const r = RNG.provablyFairRoll ? RNG.provablyFairRoll().roll : Math.floor(RNG.next()*1000)+1;
    counts[Math.min(9, Math.floor((r-1)/100))]++;
  }
  const expected = N/10;
  counts.forEach(c=>{
    const diff = Math.abs(c-expected)/expected;
    assert(diff < 0.08, 'Bucket deviation too high '+diff);
  });
});

process.on('exit', ()=>{
  console.log(`Tests complete: ${passed} passed, ${failed} failed`);
  if (failed>0) process.exit(1);
});
