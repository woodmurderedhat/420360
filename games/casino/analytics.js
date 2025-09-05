// analytics.js - track aggregated stats
import { State } from './state.js';
import { fromCents } from './money.js';

export function recordBet({ betC, win, payoutC, feeC, betNetC, player }) {
  const a = State.analytics;
  a.totalBets++;
  a.betVolume += betC; // cents
  if (win) { a.totalWins++; a.houseProfit -= (payoutC - betNetC); } else { a.totalLosses++; a.houseProfit += betNetC; }
  // per-player tracking (cents)
  player.totalBet += betC;
  if (win) player.totalWon += (payoutC - betC); // net profit relative to stake
  // track streak extremes
  if (player.currentStreak > 0) a.streaks.longestWin = Math.max(a.streaks.longestWin, player.currentStreak);
  if (player.currentStreak < 0) a.streaks.longestLoss = Math.max(a.streaks.longestLoss, Math.abs(player.currentStreak));
  const s = player.currentStreak;
  const key = s>0? 'W'+s : s<0? 'L'+(-s): null;
  if (key){ a.streakDist.set(key, (a.streakDist.get(key)||0)+1); }
  // anomaly: probability of current streak length under fair p ~ rollUnder/100
  const rollUnder = State.config.currentRollUnder || 49.5;
  const pWin = rollUnder/100;
  if (Math.abs(s) >= 8){
    const len = Math.abs(s);
    const p = (s>0? pWin: (1-pWin)) ** len;
    if (p < 1e-4){
      a.anomalies.push({ round: State.round, type:'streak', player: player.id, streak: s, prob: p });
      if (a.anomalies.length>50) a.anomalies.shift();
    }
  }
  // histogram bucket (round bet to nearest power-like bucket 10/25/50/100/250/500/1000 etc.)
  const bucket = bucketFor(fromCents(betC));
  a.betHistogram.set(bucket, (a.betHistogram.get(bucket)||0)+1);
}

export function realizedEdge(){
  const a = State.analytics;
  if (!a.betVolume) return 0;
  return a.houseProfit / a.betVolume;
}

function bucketFor(v){
  if (v < 25) return 10;
  if (v < 50) return 25;
  if (v < 100) return 50;
  if (v < 250) return 100;
  if (v < 500) return 250;
  if (v < 1000) return 500;
  if (v < 2500) return 1000;
  if (v < 5000) return 2500;
  return 5000;
}
