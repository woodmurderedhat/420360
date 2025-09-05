// main.js - wiring
import { State, resetState } from './state.js';
import { Player, LP } from './models.js';
import { toCents, fromCents, fmt } from './money.js';
import { recomputeShares, depositLP, withdrawLP, claimLPCash, playerStakeToLP, playerUnstakeFromLP } from './lp-engine.js';
import { renderAll } from './ui-render.js';
import { getBetRequest } from './strategies.js';
import { processBet, log } from './bet-engine.js';
import { AutoPlay } from './autoplay.js';
import { stepRound } from './main-loop.js';
import { RNG } from './rng.js';

function init(){
  resetState();
  // create players
  const simStrategies = [
    'random',
    'martingale',
    'antiMartingale',
    'dAlembert',
    'fibonacci',
    'labouchere',
    'reverseLab',
    'kelly',
    'stopAfterNWins',
    'fixed'
  ];
  for (let i=0;i<10;i++) {
    let strat;
    if (i===0) strat = 'fixed';
    else strat = simStrategies[(i-1) % simStrategies.length];
    const p = new Player(i, 2000, strat, i!==0);
    if (i===0) p.isSim = false; // real/manual player
    // Name players after their strategy for clarity
    p.name = strat;
    State.players.push(p);
  }
  // create LPs
  for (let i=0;i<5;i++) {
    const lp = new LP(i, 2000);
    State.lps.push(lp);
    State.bank.liquidity += lp.wallet.balance;
    if (State.config.lpTokenization){ lp.tokenBalance = lp.wallet.balance; State.bank.totalTokenSupply += lp.tokenBalance; }
  }
  // add separate LP stake for real player (player 0) without reducing wallet
  const lpForP0 = new LP(State.lps.length, 2000);
  lpForP0.ownerPlayerId = 0; // reference back to player 0
  State.lps.push(lpForP0);
  State.bank.liquidity += lpForP0.wallet.balance;
  if (State.config.lpTokenization){ lpForP0.tokenBalance = lpForP0.wallet.balance; State.bank.totalTokenSupply += lpForP0.tokenBalance; }
  // give all LPs some initial availableCash = 0 (explicit)
  State.lps.forEach(lp=>{ lp.availableCash = lp.availableCash||0; });
  recomputeShares();
  log('Initialized state');
  renderAll();
  const chk = document.getElementById('chkAutoP0'); if (chk) chk.checked = !!State.config.autoP0Enabled;
}

function manualBet(){
  const p0 = State.players[0];
  const input = document.getElementById('manualBet');
  const val = parseFloat(input.value)||0;
  p0.baseBet = val;
  const req = getBetRequest(p0);
  if (req){ processBet(p0, req); renderAll(); }
}

// UI wiring
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnInit').addEventListener('click', init);
  document.getElementById('btnStep').addEventListener('click', ()=> stepRound());
  document.getElementById('btnManualBet').addEventListener('click', manualBet);
  document.getElementById('btnAutoStart').addEventListener('click', ()=>{ AutoPlay.start(); toggleAutoButtons(true); });
  document.getElementById('btnAutoStop').addEventListener('click', ()=>{ AutoPlay.stop(); toggleAutoButtons(false); });
  document.getElementById('speedInput').addEventListener('change', e=> AutoPlay.setSpeed(parseInt(e.target.value)||400));
  document.getElementById('player0Strategy').addEventListener('change', e=>{ State.players[0].strategy = e.target.value; });
  // keep name in sync with strategy for player 0
  document.getElementById('player0Strategy').addEventListener('change', e=>{ State.players[0].name = e.target.value; });
  document.getElementById('rollUnderInput').addEventListener('change', e=>{ 
    const raw = e.target.value.trim();
    const val = parseFloat(raw);
    if (!State.config.cheatUnlocked){ e.target.value = State.config.currentRollUnder; return; }
    if (isNaN(val)){ e.target.value = State.config.currentRollUnder; log('Invalid rollUnder (NaN)'); return; }
    // constrain to (1, 98.9) to avoid pathological odds / divide-by-zero and ensure >0 chance
    const clamped = Math.min(98.9, Math.max(1.0, val));
    State.config.currentRollUnder = clamped;
    if (clamped !== val) { log(`rollUnder clamped to ${clamped}`); }
    else { log(`Odds changed rollUnder=${clamped}`); }
  });
  document.getElementById('btnLPDeposit').addEventListener('click', ()=>{
    const id = parseInt(document.getElementById('lpId').value)||0;
    const amt = parseFloat(document.getElementById('lpAmount').value)||0;
  const lockSecs = parseInt(document.getElementById('lpLockSecs').value)||0;
  if (lockSecs>=0) State.config.lpMinLockSecs = lockSecs;
    const lp = State.lps[id]; if (!lp) return;
    if (lp.ownerPlayerId === 0){ const p0 = State.players[0]; playerStakeToLP(p0, lp, amt); }
    else { depositLP(lp, amt); }
    renderAll();
  });
  document.getElementById('btnLPWithdraw').addEventListener('click', ()=>{
    const id = parseInt(document.getElementById('lpId').value)||0;
    const amt = parseFloat(document.getElementById('lpAmount').value)||0;
    const lp = State.lps[id]; if (!lp) return;
    if (lp.ownerPlayerId === 0){ const p0 = State.players[0]; playerUnstakeFromLP(p0, lp, amt); }
    else { withdrawLP(lp, amt); }
    renderAll();
  });
  document.getElementById('btnLPClaim').addEventListener('click', ()=>{
    const id = parseInt(document.getElementById('lpId').value)||0;
    const lp = State.lps[id]; if (!lp) return;
    claimLPCash(lp); renderAll();
  });
  document.getElementById('btnApplySeed').addEventListener('click', ()=>{ const seed = document.getElementById('seedInput').value.trim(); RNG.setSeed(seed); log(`Seed set: ${seed}`); });
  document.getElementById('btnRevealSeed').addEventListener('click', ()=>{ const info = RNG.revealCurrentSeed(); log(`Seed reveal commit=${info.commit} seed=${info.serverSeed.slice(0,8)} rolls=${info.rolls}`); renderAll(); });
  document.getElementById('btnApplyStops').addEventListener('click', ()=>{ const p0 = State.players[0]; p0.stopLoss = parseNumOrNull('stopLossInput'); p0.takeProfit = parseNumOrNull('takeProfitInput'); log(`P0 stops SL=${p0.stopLoss} TP=${p0.takeProfit}`); });
  // Rebuy / Auto-reactivate controls
  const btnAutoReact = document.getElementById('btnToggleAutoReactivate');
  if (btnAutoReact){
    btnAutoReact.addEventListener('click', ()=>{
      State.config.autoReactivate = !State.config.autoReactivate;
      btnAutoReact.textContent = 'Auto Reactivate: ' + (State.config.autoReactivate? 'ON':'OFF');
    });
  }
  const btnApplyRebuy = document.getElementById('btnApplyRebuy');
  if (btnApplyRebuy){
    btnApplyRebuy.addEventListener('click', ()=>{
      const thr = parseFloat(document.getElementById('rebuyThreshold').value)||0;
      const amt = parseFloat(document.getElementById('rebuyAmount').value)||0;
      if (thr>=0) State.config.rebuyThreshold = thr;
      if (amt>0) State.config.rebuyAmount = amt;
      log(`Rebuy settings threshold=${thr} amount=${amt}`);
    });
  }
  document.getElementById('btnSave').addEventListener('click', saveSession);
  document.getElementById('btnLoad').addEventListener('click', loadSession);
  document.getElementById('btnClear').addEventListener('click', ()=>{ localStorage.removeItem('casinoSession'); log('Session cleared'); });
  document.getElementById('btnExportAnalytics').addEventListener('click', exportAnalytics);
  document.getElementById('btnExportCSV').addEventListener('click', exportAnalyticsCSV);
  document.getElementById('btnStakeMax').addEventListener('click', ()=>{ const p0 = State.players[0]; document.getElementById('stakeAmount').value = Math.floor(p0.wallet.balance); });
  document.getElementById('btnUnstakeMax').addEventListener('click', ()=>{ const lp = findOwnedLP(); if (lp) document.getElementById('unstakeAmount').value = Math.floor(lp.wallet.balance); });
  document.getElementById('btnStakeDo').addEventListener('click', ()=>{ stakeFromPanel(); });
  document.getElementById('btnUnstakeDo').addEventListener('click', ()=>{ unstakeFromPanel(); });
  const chkAuto = document.getElementById('chkAutoP0');
  if (chkAuto){ chkAuto.addEventListener('change', e=>{ State.config.autoP0Enabled = e.target.checked; }); }
  // Simulator controls
  document.getElementById('btnApplySimLimits').addEventListener('click', ()=>{
    const minBet = parseFloat(document.getElementById('simMinBet').value) || 10;
    const maxBet = parseFloat(document.getElementById('simMaxBet').value) || 500;
    if (minBet > 0 && maxBet >= minBet) {
      State.config.simMinBet = minBet;
      State.config.simMaxBet = maxBet;
      log(`Simulator betting limits: ${minBet} - ${maxBet}`);
      renderAll();
    } else {
      log('Invalid betting limits: min must be > 0 and max >= min');
    }
  });
  init();
  setupCheatListener();
});

function toggleAutoButtons(running){
  document.getElementById('btnAutoStart').disabled = running;
  document.getElementById('btnAutoStop').disabled = !running;
}

// expose for console debugging
window.CasinoState = State;
window.saveSession = saveSession;

function parseNumOrNull(id){ const v = document.getElementById(id).value.trim(); return v===''? null : parseFloat(v); }

function serializeState(){
  const schemaVersion = 1; // increment when structure changes
  return JSON.stringify({
    schemaVersion,
    round: State.round,
  config: { currentRollUnder: State.config.currentRollUnder, deterministicRNG: State.config.deterministicRNG, maxAutoRounds: State.config.maxAutoRounds, autoP0Enabled: State.config.autoP0Enabled },
  players: State.players.map(p=>({ id:p.id, bal:p.wallet.balance, strat:p.strategy, baseBet:p.baseBet, stopLoss:p.stopLoss, takeProfit:p.takeProfit })),
  lps: State.lps.map(lp=>({ id:lp.id, bal:lp.wallet.balance, availableCash: lp.availableCash||0, ownerPlayerId: lp.ownerPlayerId, totalContributed: lp.totalContributed, totalWithdrawn: lp.totalWithdrawn, initialStake: lp.initialStake })),
  owner: { fee: State.owner.feeBalance },
  bank: { liquidity: State.bank.liquidity },
    analytics: { initialValue: State.analytics.initialValue }
  });
}

function saveSession(){
  try { localStorage.setItem('casinoSession', serializeState()); log('Session saved'); } catch(e){ console.warn(e); }
}

function loadSession(){
  const raw = localStorage.getItem('casinoSession'); if (!raw) { log('No saved session'); return; }
  try {
    const data = JSON.parse(raw);
    const ver = data.schemaVersion || 0;
    // migration path examples (extend as new versions added)
    if (ver === 0) {
      // older saves lacked schemaVersion; assume fields exist as previous format
      // wrap in migration adjustments if needed in future
    }
    if (ver > 1) { log('Save newer than runtime; attempt partial load'); }
    resetState();
    State.config.currentRollUnder = data.config.currentRollUnder || 49.5;
  if (data.config.deterministicRNG !== undefined) State.config.deterministicRNG = data.config.deterministicRNG;
  if (data.config.maxAutoRounds !== undefined) State.config.maxAutoRounds = data.config.maxAutoRounds;
  if (data.config.autoP0Enabled !== undefined) State.config.autoP0Enabled = data.config.autoP0Enabled;
  data.players.forEach(o=>{ const p = new Player(o.id, fromCents? fromCents(o.bal): o.bal, o.strat, o.id!==0); p.wallet.balance = o.bal; p.baseBet = o.baseBet; p.stopLoss=o.stopLoss; p.takeProfit=o.takeProfit; if (o.id===0) p.isSim=false; State.players.push(p); });
  data.lps.forEach(o=>{ const l = new LP(o.id, fromCents? fromCents(o.bal): o.bal); l.wallet.balance = o.bal; l.availableCash = o.availableCash || 0; if (o.ownerPlayerId !== undefined) l.ownerPlayerId = o.ownerPlayerId; if (o.totalContributed !== undefined) l.totalContributed = o.totalContributed; if (o.totalWithdrawn !== undefined) l.totalWithdrawn = o.totalWithdrawn; if (o.initialStake !== undefined) l.initialStake = o.initialStake; State.lps.push(l); State.bank.liquidity += l.wallet.balance; });
  State.owner.feeBalance = data.owner.fee || 0;
    State.analytics.initialValue = data.analytics.initialValue || 0;
    recomputeShares();
    log('Session loaded v'+ver);
    renderAll();
  // restore checkbox state
  const chk = document.getElementById('chkAutoP0'); if (chk) chk.checked = !!State.config.autoP0Enabled;
  } catch(e){ console.error(e); log('Load failed'); }
}

// Cheat activation: Ctrl+Shift+C then P
function setupCheatListener(){
  let cCount = 0;
  let timer = null;
  function reset(){ cCount = 0; if (timer){ clearTimeout(timer); timer=null; } }
  window.addEventListener('keydown', (e)=>{
    if (State.config.cheatUnlocked) return; // already unlocked
    if (e.key.toLowerCase()==='c') {
      cCount++;
      if (timer) clearTimeout(timer);
      // reset window after 2s idle
      timer = setTimeout(reset, 2000);
      if (cCount >= 5) {
        reset();
        State.config.cheatUnlocked = true;
        const oddsField = document.querySelector('.odds-field');
        const input = document.getElementById('rollUnderInput');
        if (input){ input.disabled = false; }
        if (oddsField){ oddsField.dataset.locked = 'false'; oddsField.style.filter=''; oddsField.style.opacity='1'; }
        log('Cheat unlocked: odds adjustable');
      }
    } else {
      reset();
    }
  });
  const oddsField = document.querySelector('.odds-field');
  if (oddsField) oddsField.dataset.locked = 'true';
}

function exportAnalytics(){
  try {
    const payload = {
  schemaVersion: 1,
      timestamp: Date.now(),
      round: State.round,
      analytics: State.analytics,
      bank: State.bank,
      players: State.players.map(p=>({ id:p.id, balance:p.wallet.balance, strategy:p.strategy })),
      lps: State.lps.map(lp=>({ id:lp.id, balance:lp.wallet.balance, share:lp.share })),
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casino-analytics-'+payload.round+'.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
    log('Analytics exported');
  } catch(e){ console.error(e); log('Export failed'); }
}

function exportAnalyticsCSV(){
  try {
    const rows = [];
    rows.push(['round','totalBets','totalWins','totalLosses','houseProfit','edge','volatility']);
    const a = State.analytics;
    const edge = a.betVolume? (a.houseProfit/a.betVolume):0;
    const vol = (State.bank.deltaBuffer||[]).length;
    rows.push([State.round,a.totalBets,a.totalWins,a.totalLosses,a.houseProfit.toFixed(2),edge.toFixed(6),vol]);
    rows.push([]);
    rows.push(['player','balance','totalBet','totalWon']);
    State.players.forEach(p=> rows.push([p.id,p.wallet.balance.toFixed(2),p.totalBet,p.totalWon.toFixed(2)]));
    const csv = rows.map(r=> r.map(v=>`"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a'); aEl.href=url; aEl.download='casino-analytics-'+State.round+'.csv'; document.body.appendChild(aEl); aEl.click(); setTimeout(()=>{ URL.revokeObjectURL(url); aEl.remove(); },0);
    log('CSV exported');
  } catch(e){ console.error(e); log('CSV export failed'); }
}

function findOwnedLP(){ return State.lps.find(l=> l.ownerPlayerId===0); }
function stakeFromPanel(){
  const p0 = State.players[0]; const lp = findOwnedLP(); if (!lp){ setStakeStatus('Owned LP not found'); return; }
  let amt = parseFloat(document.getElementById('stakeAmount').value)||0;
  if (amt<=0){ flashStatus('stakeStatus','Enter positive stake'); return; }
  if (amt > p0.wallet.balance){ amt = p0.wallet.balance; }
  if (amt<=0){ flashStatus('stakeStatus','Insufficient balance'); return; }
  playerStakeToLP(p0, lp, amt); setStakeStatus(`Staked ${amt.toFixed(2)}`); renderAll(); }
function unstakeFromPanel(){
  const p0 = State.players[0]; const lp = findOwnedLP(); if (!lp){ flashStatus('stakeStatus','Owned LP not found'); return; }
  let amt = parseFloat(document.getElementById('unstakeAmount').value)||0;
  if (amt<=0){ flashStatus('stakeStatus','Enter positive unstake'); return; }
  if (amt > lp.wallet.balance){ amt = lp.wallet.balance; }
  if (amt<=0){ flashStatus('stakeStatus','Empty LP'); return; }
  playerUnstakeFromLP(p0, lp, amt); setStakeStatus(`Unstaked ${amt.toFixed(2)}`); renderAll(); }
function flashStatus(id,msg){ const el=document.getElementById(id); if (!el) return; el.textContent=msg; el.style.color='#e74c3c'; setTimeout(()=>{ el.style.color='#888'; },600); }
function setStakeStatus(msg){ const el = document.getElementById('stakeStatus'); if (el) el.textContent = msg; }
