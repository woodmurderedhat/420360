// strategies.js - returns bet request { amount, odds, rollUnder }
import { State } from './state.js';
import { fromCents } from './money.js';

export function computeOdds(rollUnder){
  // Fair multiplier ignoring edge would be 100 / rollUnder.
  // House edge applied on payout side elsewhere (bet-engine uses (1 - houseEdge)).
  return 100 / rollUnder;
}

export const StrategyProfiles = {
  default: { baseBetPct: null, stopAfterWins: null },
};

function ensureRuntimeFields(p){
  if (!p._fibSeq) p._fibSeq = [1,1];
  if (p._fibIndex === undefined) p._fibIndex = 0;
  if (p._dalLevel === undefined) p._dalLevel = 0;
  if (p._winsThisCycle === undefined) p._winsThisCycle = 0;
  if (!p._revLabSeq) p._revLabSeq = [1,2,3];
  if (!p._labSeq) p._labSeq = [1,2,3,4];
}

export function getBetRequest(player) {
  const cfg = State.config;
  const profile = StrategyProfiles[player.strategyProfile||'default'] || StrategyProfiles.default;
  ensureRuntimeFields(player);
  // adaptive base bet percent
  if (profile.baseBetPct){
    const balDisplay = fromCents(player.wallet.balance);
    const target = balDisplay * profile.baseBetPct;
    player.baseBet = Math.max(cfg.minBet, Math.min(cfg.maxBet, target));
  }
  // dynamic rollUnder from config (can be decimal up to 1 place)
  let rollUnder = cfg.currentRollUnder || 49.5;
  if (!isFinite(rollUnder)) rollUnder = 49.5;
  // keep within sane bounds to prevent extreme odds (and division by zero / negative)
  if (rollUnder < 1) rollUnder = 1;
  if (rollUnder > 98.9) rollUnder = 98.9;
  const odds = computeOdds(rollUnder);
  let amount = player.baseBet;

  switch(player.strategy) {
    case 'random': {
      const span = Math.max(cfg.minBet, player.baseBet);
      amount = randInt(cfg.minBet, Math.min(cfg.maxBet, span * 2));
      break;
    }
    case 'martingale': {
      if (player.lastBet && player.lastBet.result === 'lose') {
        player.martingaleLevel = Math.min(player.martingaleLevel + 1, 8);
      } else {
        player.martingaleLevel = 0;
      }
      amount = player.baseBet * (2 ** player.martingaleLevel);
      break;
    }
    case 'antiMartingale': {
      if (player.lastBet && player.lastBet.result === 'win') {
        player.antiLevel = Math.min(player.antiLevel + 1, 5);
      } else {
        player.antiLevel = 0;
      }
      amount = player.baseBet * (1 + player.antiLevel); // linear ladder
      break;
    }
    case 'dAlembert': {
      if (player.lastBet) {
        if (player.lastBet.result === 'lose') player._dalLevel++; else if (player._dalLevel>0) player._dalLevel--;
      }
      amount = player.baseBet * (1 + player._dalLevel);
      break;
    }
    case 'fibonacci': {
      if (player.lastBet) {
        if (player.lastBet.result === 'lose') { player._fibIndex = Math.min(player._fibIndex + 1, 15); }
        else { player._fibIndex = Math.max(player._fibIndex - 2, 0); }
      }
      const fibVal = fibAt(player._fibIndex);
      amount = player.baseBet * fibVal;
      break;
    }
    case 'labouchere': {
      // stake is sum of first and last numbers. On win, remove them; on loss add their sum at end.
      if (!Array.isArray(player._labSeq) || player._labSeq.length===0) player._labSeq = [1,2,3,4];
      if (player.lastBet) {
        if (player.lastBet.result === 'win') {
          if (player._labSeq.length>1) { player._labSeq.shift(); player._labSeq.pop(); }
          else { player._labSeq.pop(); }
          if (player._labSeq.length===0) { player._labSeq = [1,2,3,4]; }
        } else if (player.lastBet.result === 'lose') {
          const add = (player._labSeq[0]||1) + (player._labSeq[player._labSeq.length-1]||1);
          if (player._labSeq.length<20) player._labSeq.push(add);
        }
      }
      const first = player._labSeq[0]||1; const last = player._labSeq[player._labSeq.length-1]||first;
      amount = player.baseBet * (first + last);
      break;
    }
    case 'reverseLab': {
      // reverse Labouchere: on win add sum to end, on loss remove ends
      if (!Array.isArray(player._revLabSeq) || player._revLabSeq.length===0) player._revLabSeq = [1,2,3];
      if (player.lastBet) {
        if (player.lastBet.result === 'win') {
          const add = (player._revLabSeq[0]||1) + (player._revLabSeq[player._revLabSeq.length-1]||1);
          if (player._revLabSeq.length<20) player._revLabSeq.push(add);
        } else if (player.lastBet.result === 'lose') {
          if (player._revLabSeq.length>1) { player._revLabSeq.shift(); player._revLabSeq.pop(); }
          else { player._revLabSeq.pop(); }
          if (player._revLabSeq.length===0) player._revLabSeq = [1,2,3];
        }
      }
      const f = player._revLabSeq[0]||1; const l = player._revLabSeq[player._revLabSeq.length-1]||f;
      amount = player.baseBet * (f + l);
      break;
    }
    case 'kelly': {
      // approximate kelly fraction using current realized edge vs odds
      const edge = Math.max(-0.05, Math.min(0.05, (1 - State.config.houseEdge) - (rollUnder/100))); // crude placeholder
      const b = odds - 1;
      const k = (edge / b) || 0; // fraction of bankroll
      const frac = Math.max(0, Math.min(0.1, k));
      const bankrollDisplay = fromCents(player.wallet.balance);
      amount = Math.max(cfg.minBet, bankrollDisplay * frac);
      break;
    }
    case 'stopAfterNWins': {
      if (player.lastBet && player.lastBet.result === 'win') player._winsThisCycle++; else if (player.lastBet) player._winsThisCycle = 0;
      const limit = profile.stopAfterWins || 3;
      if (player._winsThisCycle >= limit) return null; // stop betting
      amount = player.baseBet;
      break;
    }
    case 'fixed':
    default:
      amount = player.baseBet;
  }

  amount = clamp(amount, cfg.minBet, cfg.maxBet);
  // Apply simulator limits for sim players
  if (player.isSim) {
    amount = clamp(amount, cfg.simMinBet, cfg.simMaxBet);
  }
  // Ensure we do not exceed balance (convert cents to display)
  const balDisplay = fromCents(player.wallet.balance);
  amount = Math.min(amount, balDisplay);
  // stop-loss / take-profit enforcement
  if (player.stopLoss !== null && player.wallet.balance <= player.stopLoss) { player.disableReason='stopLoss'; return null; }
  if (player.takeProfit !== null && player.wallet.balance >= player.takeProfit) { player.disableReason='takeProfit'; return null; }
  const effectiveMinBet = player.isSim ? cfg.simMinBet : cfg.minBet;
  if (amount < effectiveMinBet) { player.disableReason='insufficient'; return null; } // can't bet
  return { amount, odds, rollUnder };
}

function fibAt(i){
  let a=1,b=1; if (i<=1) return 1; for (let n=2;n<=i;n++){ const c=a+b; a=b; b=c; if (b>1e6) break; } return b;
}

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function clamp(v,a,b){ return Math.min(Math.max(v,a),b); }
