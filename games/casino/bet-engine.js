// bet-engine.js - validation & resolution
import { State } from './state.js';
import { RNG } from './rng.js';
import { recordBet } from './analytics.js';
import { recomputeShares } from './lp-engine.js';
import { toCents, fromCents, fmt } from './money.js';

function deriveOdds(rollUnder){
  // odds multiplier before applying houseEdge to net stake payout
  // fair (no edge) multiplier = 100 / rollUnder
  if (!isFinite(rollUnder) || rollUnder <= 0) return 0;
  return 100 / rollUnder;
}

export function processBet(player, req) {
  const cfg = State.config;
  const betDisplay = req.amount;
  if (betDisplay < cfg.minBet || betDisplay > cfg.maxBet) return log(`P${player.id} BET REJECT size`);
  const betC = toCents(betDisplay);
  if (player.wallet.balance < betC) return log(`P${player.id} BET REJECT balance`);
  const rollUnder = req.rollUnder;
  const internalOdds = deriveOdds(rollUnder);
  const feeC = Math.round(betC * cfg.feeRate);
  const betNetC = betC - feeC;
  const potentialPayoutC = betNetC * (1 - cfg.houseEdge) * internalOdds;
  if (!isFinite(potentialPayoutC) || potentialPayoutC <= 0) return log(`P${player.id} BET REJECT badOdds`);
  const futureBank = State.bank.liquidity + betNetC;
  if (potentialPayoutC > futureBank) return log(`P${player.id} REJECT bank cover`);
  if (potentialPayoutC > futureBank * cfg.maxExposureRatio) return log(`P${player.id} REJECT exposure`);
  player.wallet.balance -= betC;
  State.owner.feeBalance += feeC;
  let bankDeltaC = 0;
  const scaledUnder = Math.round(rollUnder * 10);
  const pf = RNG.provablyFairRoll ? RNG.provablyFairRoll() : { roll: RNG.nextInt(1,1000) };
  const roll = pf.roll;
  const win = roll <= scaledUnder;
  let payoutC = 0;
  if (win){
    payoutC = Math.round(betNetC * (1 - cfg.houseEdge) * internalOdds);
    bankDeltaC = betNetC - payoutC;
    player.wallet.balance += payoutC;
    player.currentStreak = player.currentStreak >=0 ? player.currentStreak + 1 : 1;
  } else {
    bankDeltaC = betNetC;
    player.currentStreak = player.currentStreak <=0 ? player.currentStreak - 1 : -1;
  }
  State.bank.liquidity += bankDeltaC;
  const buf = State.bank.deltaBuffer; buf.push(bankDeltaC); if (buf.length>200) buf.shift();
  distributeDeltaToLPs(bankDeltaC);
  if (bankDeltaC !== 0){
    log(`POOL Δ ${bankDeltaC>=0?'+':''}${fmt(bankDeltaC)} newLiquidity=${fmt(State.bank.liquidity)}`);
  }
  player.lastBet = { amount: betDisplay, odds: internalOdds, rollUnder, result: win?'win':'lose', roll: (roll/10).toFixed(1), payout: win? fromCents(payoutC):0, provablyFair: pf };
  recordBet({ betC, win, payoutC, feeC, betNetC, player });
  log(formatLogBet(player, win, betC, roll, req.rollUnder, payoutC, pf));
}

function formatLogBet(player, win, amtC, roll, under, payoutC, pf) {
  const pfInfo = (pf && pf.commit) ? ` commit=${pf.commit}${pf.serverSeed? ' seed='+pf.serverSeed.slice(0,6):''} nonce=${pf.nonce}` : '';
  return `R${State.round} P${player.id} BET ${fmt(amtC)} roll ${(roll/10).toFixed(1)} <= ${under}? ${win? 'WIN +'+fmt(payoutC):'LOSE'} bal=${fmt(player.wallet.balance)}${pfInfo}`;
}

function distributeDeltaToLPs(delta){
  if (!delta) return; // cents; nothing to distribute
  const lps = State.lps;
  if (!lps.length) return;
  const totalPool = lps.reduce((s,lp)=> s + lp.wallet.balance, 0);
  if (totalPool <= 0){
    // Edge case: pool empty; on positive delta just split evenly, on negative ignore (cannot pull from zero)
    if (delta > 0){
      const addEach = Math.trunc(delta / lps.length);
      lps.forEach(lp=>{ lp.wallet.balance += addEach; });
      recomputeShares();
    }
    return;
  }
  if (delta < 0) {
    // Negative delta reduces LP balances proportionally (cannot exceed balance)
    lps.forEach(lp=>{
      const share = lp.wallet.balance / totalPool;
      const cut = Math.round(delta * share);
      lp.wallet.balance += cut;
      if (lp.wallet.balance < 0) lp.wallet.balance = 0; // guard
    });
  } else {
    // Positive delta increases balances proportionally to existing weight
    lps.forEach(lp=>{
      const share = lp.wallet.balance / totalPool;
      const gain = Math.round(delta * share);
      lp.wallet.balance += gain;
    });
  }
  recomputeShares();
}

export function log(line) {
  State.log.push(line);
  if (State.log.length > 400) State.log.shift();
}
