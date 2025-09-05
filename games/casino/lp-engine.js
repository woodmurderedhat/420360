// lp-engine.js - deposit / withdraw / share handling
import { State } from './state.js';
import { log } from './bet-engine.js';
import { toCents, fmt } from './money.js';

export function recomputeShares(){
  if (State.config.lpTokenization){
    // derive share from tokenBalance / totalTokenSupply
    const supply = State.bank.totalTokenSupply || 1;
    State.lps.forEach(lp=>{ 
      const raw = (lp.tokenBalance||0) / supply; 
      lp.share = isFinite(raw) && raw>=0 ? raw : 0; 
    });
    // bank.liquidity should equal sum of LP wallet balances
    const total = State.lps.reduce((s,lp)=>s+lp.wallet.balance,0) || 0;
    const drift = total - State.bank.liquidity;
    if (Math.abs(drift) > 0.0001) State.bank.liquidity = total;
    return;
  }
  // legacy share proportional to wallet balance
  const total = State.lps.reduce((s,lp)=>s+lp.wallet.balance,0) || 1;
  State.lps.forEach(lp=>{ 
    const raw = lp.wallet.balance / total; 
    lp.share = isFinite(raw) && raw>=0 ? raw : 0; 
  });
  const drift = total - State.bank.liquidity;
  if (Math.abs(drift) > 0.0001) {
    State.bank.liquidity = total; // snap to actual pool funds
  }
}

export function depositLP(lp, amount){
  if (amount<=0) return;
  const amountC = toCents(amount);
  // ensure availableCash covers deposit
  if (lp.availableCash === undefined) lp.availableCash = 0;
  if (amountC > lp.availableCash) return log(`LP${lp.id} DEPOSIT FAIL funds`);
  lp.availableCash -= amountC;
  lp.wallet.balance += amountC;
  State.bank.liquidity += amountC;
  lp.totalContributed += amountC;
  // extend lock if active
  if (lp.lockUntil && lp.lockUntil < Date.now()) lp.lockUntil = null;
  if (State.config.lpTokenization){
    const price = calcLPTokenPrice();
    const minted = price>0 ? amount / price : amount; // initial price falls back to 1:1
    lp.tokenBalance = (lp.tokenBalance||0) + minted;
    State.bank.totalTokenSupply += minted;
  }
  lp.wallet.push({ type:'deposit', round:State.round, amount: amountC });
  recomputeShares();
  log(`LP${lp.id} DEPOSIT ${fmt(amountC)} totalContrib=${fmt(lp.totalContributed)}`);
}

export function withdrawLP(lp, amount){
  if (amount<=0) return;
  let amountC = toCents(amount);
  if (lp.lockUntil && Date.now() < lp.lockUntil) return log(`LP${lp.id} WITHDRAW LOCKED`);
  if (amountC > lp.wallet.balance) amountC = lp.wallet.balance;
  if (State.bank.liquidity - amountC < 0) return log(`LP${lp.id} WITHDRAW FAIL liquidity`);
  lp.wallet.balance -= amountC;
  State.bank.liquidity -= amountC;
  if (State.config.lpTokenization){
    const price = calcLPTokenPrice();
    const burn = price>0 ? amount / price : amount;
    lp.tokenBalance = Math.max(0, (lp.tokenBalance||0) - burn);
    State.bank.totalTokenSupply = Math.max(0, State.bank.totalTokenSupply - burn);
  }
  lp.availableCash = (lp.availableCash||0) + amountC;
  lp.totalWithdrawn += amountC;
  lp.wallet.push({ type:'withdraw', round:State.round, amount: amountC });
  recomputeShares();
  log(`LP${lp.id} WITHDRAW ${fmt(amountC)} totalWithdrawn=${fmt(lp.totalWithdrawn)}`);
}

function calcLPTokenPrice(){
  const supply = State.bank.totalTokenSupply;
  if (!supply) return 1; // initial
  return State.bank.liquidity / supply;
}

// Move availableCash from an LP (that is owned by a player) into that player's betting wallet.
// This simulates the owner claiming withdrawn proceeds into their playable balance.
export function claimLPCash(lp){
  if (!lp) return;
  if (lp.ownerPlayerId === undefined) return log(`LP${lp.id} CLAIM FAIL noOwner`);
  const amt = lp.availableCash || 0;
  if (amt <= 0) return log(`LP${lp.id} CLAIM 0`);
  const player = State.players.find(p=> p.id === lp.ownerPlayerId);
  if (!player) return log(`LP${lp.id} CLAIM FAIL missingPlayer`);
  player.wallet.balance += amt;
  lp.availableCash = 0;
  log(`LP${lp.id} CLAIM -> P${player.id} ${fmt(amt)}`);
}

export function playerStakeToLP(player, lp, amount){
  if (!lp || lp.ownerPlayerId !== player.id) return log(`LP${lp?.id} STAKE FAIL owner`);
  if (amount<=0) return;
  const amountC = toCents(amount);
  if (player.wallet.balance < amountC) return log(`P${player.id} STAKE FAIL funds`);
  player.wallet.balance -= amountC;
  lp.wallet.balance += amountC;
  State.bank.liquidity += amountC;
  lp.totalContributed += amountC;
  // apply (or extend) lock based on config
  const minMs = (State.config.lpMinLockSecs||0)*1000;
  if (minMs>0){
    const target = Date.now() + minMs;
    lp.lockUntil = lp.lockUntil ? Math.max(lp.lockUntil, target) : target;
  }
  if (State.config.lpTokenization){
    const price = calcLPTokenPrice();
    const minted = price>0 ? amount / price : amount;
    lp.tokenBalance = (lp.tokenBalance||0) + minted;
    State.bank.totalTokenSupply += minted;
  }
  recomputeShares();
  log(`P${player.id} STAKE -> LP${lp.id} ${fmt(amountC)}`);
}

export function playerUnstakeFromLP(player, lp, amount){
  if (!lp || lp.ownerPlayerId !== player.id) return log(`LP${lp?.id} UNSTAKE FAIL owner`);
  if (amount<=0) return;
  if (lp.lockUntil && Date.now() < lp.lockUntil) return log(`LP${lp.id} UNSTAKE LOCKED`);
  let amountC = toCents(amount);
  if (amountC > lp.wallet.balance) amountC = lp.wallet.balance;
  if (amountC<=0) return;
  lp.wallet.balance -= amountC;
  State.bank.liquidity -= amountC;
  player.wallet.balance += amountC;
  if (State.config.lpTokenization){
    const price = calcLPTokenPrice();
    const burn = price>0 ? amount / price : amount;
    lp.tokenBalance = Math.max(0, (lp.tokenBalance||0) - burn);
    State.bank.totalTokenSupply = Math.max(0, State.bank.totalTokenSupply - burn);
  }
  recomputeShares();
  log(`P${player.id} UNSTAKE <- LP${lp.id} ${fmt(amountC)}`);
}
