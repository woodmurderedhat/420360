// main-loop.js - single round progression
import { State } from './state.js';
import { getBetRequest } from './strategies.js';
import { processBet, log } from './bet-engine.js';
import { AutoPlay } from './autoplay.js';
import { renderAll } from './ui-render.js';

export function stepRound(){
  State.round++;
  if (State.config.maxAutoRounds>0 && State.round > State.config.maxAutoRounds){
    log(`Round limit ${State.config.maxAutoRounds} reached; autoplay halted`);
    try { if (AutoPlay && AutoPlay.stop) AutoPlay.stop(); } catch(_e){}
    return;
  }
  // batch: every active player gets one bet attempt this round
  let activeCount = 0;
  State.players.forEach(p=>{
    if (!p.active) return;
    if (p.isSim || (p.id===0 && State.config.autoP0Enabled)) {
      if (p.id===0 && State.config.autoP0Enabled) {
        const bal = p.wallet.balance;
        const sl = p.stopLoss;
        const tp = p.takeProfit;
        // Require at least one bound set to continue auto; if neither, skip auto bet
        if (sl==null && tp==null) { return; }
        // If bound breached, disable auto and uncheck UI
        if ((sl!=null && bal <= sl) || (tp!=null && bal >= tp)) {
          State.config.autoP0Enabled = false;
          try { const chk=document.getElementById('chkAutoP0'); if (chk) chk.checked=false; } catch(_e){}
          log('Auto P0 stopped: stop condition reached');
          return;
        }
      }
      const req = getBetRequest(p);
      if (req) { processBet(p, req); activeCount++; }
      else if (p.isSim) {
        p.active = false;
        const reason = p.disableReason || 'balance';
        log(`P${p.id} DISABLED (${reason})`);
      }
    }
  // Attempt auto-reactivation / rebuy for inactive players
  State.players.forEach(p=>{
    if (!p.isSim) return;
    if (p.active) return;
    const cfg = State.config;
    if (!cfg.autoReactivate) return;
    // criteria: disabled for insufficient funds or stopLoss cleared and rebuy available
    const nowRound = State.round;
    if (p.lastRebuyRound && (nowRound - p.lastRebuyRound) < cfg.rebuyCooldownRounds) return;
    const balDisplay = p.wallet.balance/100;
    if (p.disableReason === 'insufficient' && balDisplay < cfg.rebuyThreshold) {
      // perform rebuy
      const addC = Math.round(cfg.rebuyAmount * 100);
      p.wallet.balance += addC;
      p.active = true;
      p.disableReason = null;
      p.lastRebuyRound = nowRound;
      log(`P${p.id} REBUY +${cfg.rebuyAmount.toFixed(2)} (bal=${(p.wallet.balance/100).toFixed(2)})`);
    } else if (p.disableReason === 'stopLoss') {
      // if balance recovered above stopLoss via other events (unlikely) allow reactivate
      if (p.wallet.balance > (p.stopLoss||0)) {
        p.active = true; p.disableReason=null; log(`P${p.id} REACTIVATED (stopLoss cleared)`);
      }
    } else if (p.disableReason === 'takeProfit') {
      // do nothing unless manual intervention
    }
  });
  });
  if (activeCount === 0) { 
    log('No active sim players; autoplay halted'); 
    try { if (AutoPlay && AutoPlay.stop) AutoPlay.stop(); } catch(_e){}
  }
  try { renderAll(); } catch(e){ console.error('Render error', e); }
}
