// player-autobet.js - P0 specific autobet controller
import { State } from './state.js';
import { getBetRequest } from './strategies.js';
import { processBet, log } from './bet-engine.js';
import { renderAll } from './ui-render.js';

class PlayerAutoBetCtl {
  constructor() {
    this.timer = null;
    this.speed = 1000; // Default 1 second between bets for P0
    this.isRunning = false;
  }

  start() {
    if (this.timer) return;
    
    const p0 = State.players[0];
    if (!p0 || !p0.active) {
      log('Cannot start P0 autobet: player not active');
      return;
    }

    // Validate that P0 has sufficient balance and bet amount set
    const betInput = document.getElementById('manualBet');
    const betAmount = parseFloat(betInput.value) || 0;
    if (betAmount <= 0) {
      log('Cannot start P0 autobet: invalid bet amount');
      return;
    }

    // Set the base bet from the manual bet input
    p0.baseBet = betAmount;
    
    this.isRunning = true;
    this.timer = setInterval(() => this.executeBet(), this.speed);
    this.updateButtonStates();
    log(`P0 autobet started with ${betAmount} bet`);
  }

  stop() {
    if (!this.timer) return;
    
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.updateButtonStates();
    log('P0 autobet stopped');
  }

  executeBet() {
    const p0 = State.players[0];
    if (!p0 || !p0.active) {
      log('P0 autobet stopped: player not active');
      this.stop();
      return;
    }

    // Check stop conditions
    const bal = p0.wallet.balance;
    const sl = p0.stopLoss;
    const tp = p0.takeProfit;
    
    if ((sl != null && bal <= sl) || (tp != null && bal >= tp)) {
      log('P0 autobet stopped: stop condition reached');
      this.stop();
      return;
    }

    // Execute the bet
    const req = getBetRequest(p0);
    if (req) {
      processBet(p0, req);
      renderAll();
    } else {
      log('P0 autobet stopped: cannot generate bet request');
      this.stop();
    }
  }

  setSpeed(ms) {
    this.speed = ms;
    if (this.timer) {
      this.stop();
      this.start();
    }
  }

  updateButtonStates() {
    const startBtn = document.getElementById('btnP0AutoStart');
    const stopBtn = document.getElementById('btnP0AutoStop');
    
    if (startBtn && stopBtn) {
      startBtn.disabled = this.isRunning;
      stopBtn.disabled = !this.isRunning;
    }
  }
}

export const PlayerAutoBet = new PlayerAutoBetCtl();