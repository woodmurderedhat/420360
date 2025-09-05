// models.js - Player, LP, Wallet (integer cents)
import { toCents } from './money.js';
export class Wallet {
  constructor(balance=0) { this.balance = toCents(balance); this.history = []; }
  push(evt) { this.history.push(evt); }
}

export class Player {
  constructor(id, balance, strategy='fixed', isSim=true) {
    this.id = id;
    this.wallet = new Wallet(balance);
    this.strategy = strategy;
  // Name shown in UI; for sims we use strategy label for clarity
  this.name = strategy;
  this.disableReason = null; // populated if player becomes inactive
    this.isSim = isSim;
    this.active = true;
    this.currentStreak = 0; // + for wins, - for losses
    this.lastBet = null; // {amount, odds, rollUnder, result}
    this.martingaleLevel = 0;
    this.baseBet = 100;
  this.antiLevel = 0; // for anti-martingale ladder
  this.stopLoss = null; // absolute balance floor
  this.takeProfit = null; // absolute balance cap
  this.totalBet = 0; // cents
  this.totalWon = 0; // cents
  this.initialBalance = toCents(balance);
  }
}

export class LP {
  constructor(id, balance) {
    this.id = id;
    this.wallet = new Wallet(balance);
    this.availableCash = 0; // cash withdrawn but not yet claimed by owning player
    // tracking metrics
  this.initialStake = toCents(balance);
  this.totalContributed = toCents(balance); // cumulative deposits into pool (cents)
    this.totalWithdrawn = 0; // cumulative withdrawals out of pool (added to availableCash)
    this.share = 0; // updated externally
    this.tokenBalance = 0; // if tokenization enabled
  }
}
