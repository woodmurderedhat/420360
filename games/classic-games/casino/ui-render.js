// ui-render.js - DOM updates (simple full re-render per call)
import { State } from './state.js';
import { realizedEdge } from './analytics.js';
import { RNG } from './rng.js';
import { fmt, fromCents } from './money.js';
import { getCrypto24hChange } from './crypto-market.js';

// Utility function to escape HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) { 
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; 
  });
}

const el = id => document.getElementById(id);

const sparkData = {
  liquidity: [],
  house: []
};
const SPARK_MAX = 120;

export function renderAll(){
  // push data points
  sparkData.liquidity.push(State.bank.liquidity);
  sparkData.house.push(State.analytics.houseProfit);
  if (sparkData.liquidity.length > SPARK_MAX) sparkData.liquidity.shift();
  if (sparkData.house.length > SPARK_MAX) sparkData.house.shift();
  renderPlayers();
  renderLPs();
  renderOwner();
  renderCryptoMarket();
  renderAnalytics();
  renderLog();
  renderSparklines();
  checkInvariants();
}

function renderPlayers(){
  const grid = el('playersGrid'); if (!grid) return;
  const real = State.players.find(p=> p.id===0);
  const sims = State.players.filter(p=> p.id!==0);
  
  // Render real player (P0) wallet info
  if (real) {
    const balanceEl = el('playerBalance');
    const netEl = el('playerNet');
    const strategyEl = el('playerCurrentStrategy');
    
    if (balanceEl) balanceEl.textContent = fmt(real.wallet.balance);
    if (netEl) {
      const net = real.wallet.balance - (real.initialBalance || 20000); // 20000 cents = 2000 display
      netEl.textContent = (net >= 0 ? '+' : '') + fmt(net);
      netEl.style.color = net >= 0 ? '#8f8' : '#f88';
    }
    if (strategyEl) strategyEl.textContent = real.strategy || 'fixed';
  }
  
  // update owned LP id display
  const ownedSpan = document.getElementById('ownedLpId');
  if (ownedSpan){ const owned = State.lps.find(l=> l.ownerPlayerId===0); ownedSpan.textContent = owned? owned.id: '-'; }
  function card(p){
    const bets = p.totalBet || 0; // cents
    const net = p.wallet.balance - (p.initialBalance||0);
    const reason = (!p.active && p.disableReason)? `<div style="color:#e67e22;font-size:10px">${escapeHtml(p.disableReason)}</div>`:'';
    return `<div class="player ${p.isSim? 'sim':''} ${!p.active?'disabled':''}">`+
  `<div class="badge">${escapeHtml(p.name||p.strategy||('P'+p.id))}</div>`+
  `<div style="font-size:10px;opacity:0.7">id P${p.id}</div>`+
  `<div>bal ${fmt(p.wallet.balance)}</div>`+
  `<div>str ${p.currentStreak}</div>`+
      `<div>net ${(net>=0?'+':'')+fmt(net)}</div>`+
      `<div>bet ${fmt(bets)}</div>`+
      (p.lastBet? `<div>${p.lastBet.result==='win'?'<span class=highlight-win>W':'<span class=highlight-loss>L'} ${p.lastBet.amount}</span></div>`:'')+
      reason+
      `</div>`;
  }
  
  // Update active players count
  const activeCount = sims.filter(p => p.active).length;
  const activeEl = el('activePlayers');
  if (activeEl) activeEl.textContent = activeCount;
  
  grid.innerHTML = sims.map(card).join('');
}

function renderLPs(){
  el('lpTotal').textContent = fmt(State.bank.liquidity);
  el('lpReserved').textContent = fmt(State.bank.reserved);
  const list = el('lpList');
  const tokenPrice = State.config.lpTokenization && State.bank.totalTokenSupply ? (State.bank.liquidity / State.bank.totalTokenSupply) : null;
  if (tokenPrice){
    const tpEl = document.getElementById('tokenPrice');
    if (tpEl) tpEl.textContent = tokenPrice.toFixed(4);
  }
  list.innerHTML = State.lps.map(lp=>{
  const owner = lp.ownerPlayerId !== undefined ? `P${lp.ownerPlayerId}` : '-';
  const invested = lp.totalContributed - lp.totalWithdrawn;
  const pnl = lp.wallet.balance - invested;
  const roi = invested>0 ? (pnl / invested * 100) : 0;
  const tokenInfo = State.config.lpTokenization ? (()=>{ const tv = (lp.tokenBalance||0) * (tokenPrice||0); return `<br/>tokens ${(lp.tokenBalance||0).toFixed(4)}<br/>tValue ${tv.toFixed(2)}`; })() : '';
  const ownedFlag = lp.ownerPlayerId===0 ? ' <span style="color:#2ecc71">(owned)</span>' : '';
  const cls = lp.ownerPlayerId===0 ? 'lp owned' : 'lp';
  const lockTxt = lp.lockUntil && lp.lockUntil > Date.now() ? `lock ${(Math.max(0, lp.lockUntil - Date.now())/1000).toFixed(0)}s` : 'unlock';
  return `<div class="${cls}">LP${lp.id}${ownedFlag}<br/>owner ${owner}<br/>pool ${fmt(lp.wallet.balance)}${tokenInfo}<br/>cash ${fmt(lp.availableCash||0)}<br/>share ${(lp.share*100).toFixed(1)}%<br/>ROI ${roi.toFixed(2)}%<br/>${lockTxt}</div>`;
  }).join('');
}

function renderOwner(){
  el('ownerFees').textContent = fmt(State.owner.feeBalance);
  el('houseProfit').textContent = fmt(State.analytics.houseProfit);
}

function renderCryptoMarket(){
  const cfg = State.config;
  const currentPriceEl = el('currentPrice');
  const priceChangeEl = el('priceChange');
  const marketTrendEl = el('marketTrend');
  
  if (currentPriceEl) currentPriceEl.textContent = cfg.cryptoPrice.toFixed(0);
  
  if (priceChangeEl) {
    const change24h = getCrypto24hChange();
    const changePercent = (change24h * 100).toFixed(2);
    priceChangeEl.textContent = (change24h >= 0 ? '+' : '') + changePercent + '%';
    priceChangeEl.style.color = change24h >= 0 ? '#5f5' : '#f55';
  }
  
  if (marketTrendEl) {
    const trend = cfg.cryptoTrend;
    const trendText = trend > 0 ? 'Bullish 🐂' : trend < 0 ? 'Bearish 🐻' : 'Neutral ⚖️';
    marketTrendEl.textContent = trendText;
    marketTrendEl.style.color = trend > 0 ? '#5f5' : trend < 0 ? '#f55' : '#aaa';
  }
}

function renderAnalytics(){
  const a = State.analytics;
  el('aTotalBets').textContent = a.totalBets;
  el('aWins').textContent = a.totalWins;
  el('aLosses').textContent = a.totalLosses;
  el('aLongestWin').textContent = a.streaks.longestWin;
  el('aLongestLoss').textContent = a.streaks.longestLoss;
  el('aEdge').textContent = realizedEdge().toFixed(4);
  // show odds info
  const rollUnder = State.config.currentRollUnder;
  const prob = rollUnder; // percent approx
  const multiplier = (100 / rollUnder) * (1 - State.config.houseEdge); // effective payout multiple on net stake
  const probEl = document.getElementById('aProb'); if (probEl) probEl.textContent = prob.toFixed(1);
  const multEl = document.getElementById('aMult'); if (multEl) multEl.textContent = multiplier.toFixed(3);
  const totalValue = calcTotalValue();
  if (!a.initialValue) a.initialValue = totalValue; // set first time
  el('aTotalValue').textContent = totalValue.toFixed(2);
  const delta = totalValue - a.initialValue;
  el('aValueDelta').textContent = (delta>=0?'+':'') + delta.toFixed(2);
  const volEl = document.getElementById('aVol'); if (volEl){ volEl.textContent = calcVolatility().toFixed(2); }
  renderHistogram();
  renderRNGArchive();
  renderAnomalies();
}
function calcVolatility(){
  const arr = State.bank.deltaBuffer||[]; if (arr.length<2) return 0;
  const mean = arr.reduce((s,v)=>s+v,0)/arr.length;
  const variance = arr.reduce((s,v)=> s + (v-mean)**2,0)/(arr.length-1);
  return Math.sqrt(variance);
}

function renderRNGArchive(){
  const pre = document.getElementById('rngArchive'); if (!pre) return;
  const lines = RNG.archive.map(a=>`${new Date(a.revealedAt).toLocaleTimeString()} rolls=${a.rolls} commit=${a.commit} seed=${a.serverSeed.slice(0,8)}`);
  pre.textContent = lines.join('\n');
}

function renderAnomalies(){
  const pre = document.getElementById('aAnomalies'); if (!pre) return;
  pre.textContent = State.analytics.anomalies.map(a=>`R${a.round} P${a.player} streak=${a.streak} p=${a.prob.toExponential(2)}`).join('\n');
}

function calcTotalValue(){
  const playerSum = State.players.reduce((s,p)=>s+p.wallet.balance,0);
  const lpCash = State.lps.reduce((s,lp)=> s + (lp.availableCash||0), 0);
  return (playerSum + lpCash + State.bank.liquidity + State.owner.feeBalance)/100;
}

function renderHistogram(){
  const pre = el('aHistogram');
  if (!pre) return;
  const hist = Array.from(State.analytics.betHistogram.entries()).sort((a,b)=>a[0]-b[0]);
  const max = hist.reduce((m,[,c])=> Math.max(m,c),0) || 1;
  const lines = hist.map(([bucket,count])=>{
    const barLen = Math.round((count / max) * 30);
    return bucket.toString().padStart(4,' ') + ' | ' + '#'.repeat(barLen) + ' ' + count;
  });
  pre.textContent = lines.join('\n');
  renderStreakHistogram();
}
function renderStreakHistogram(){
  const pre = el('aStreakHistogram'); if (!pre) return;
  const entries = Array.from(State.analytics.streakDist.entries()).sort((a,b)=>{
    const parse = k=> [k[0], parseInt(k.slice(1),10)];
    const [aT,aN]=parse(a[0]); const [bT,bN]=parse(b[0]);
    if (aT!==bT) return aT.localeCompare(bT); return aN-bN;
  });
  const max = entries.reduce((m,[,c])=> Math.max(m,c),0) || 1;
  pre.textContent = entries.map(([k,c])=>{
    const bar = '#'.repeat(Math.round((c/max)*20));
    return k.padStart(3,' ')+' '+bar+' '+c;
  }).join('\n');
}

function renderLog(){
  const pre = el('logLines');
  pre.textContent = State.log.slice(-120).join('\n');
  pre.scrollTop = pre.scrollHeight;
}

function renderSparklines(){
  drawSpark('sparkLiquidity', sparkData.liquidity, '#4bc0c0');
  drawSpark('sparkHouse', sparkData.house, '#f39c12');
}
function drawSpark(id, arr, color){
  const c = el(id); if (!c || !arr.length) return; const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  const min = Math.min(...arr); const max = Math.max(...arr);
  const span = max - min || 1;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath();
  arr.forEach((v,i)=>{
    const x = (i/(arr.length-1))* (c.width-2) +1;
    const y = c.height - ((v - min)/span) * (c.height-2) -1;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function checkInvariants(){
  const totalLP = State.lps.reduce((s,lp)=> s + lp.wallet.balance,0);
  const drift = Math.abs(totalLP - State.bank.liquidity);
  const ok = drift < 0.01; // tolerance
  const banner = document.getElementById('warnBanner');
  if (banner){
    if (!ok){
      banner.style.display='block';
      banner.textContent = `Invariant drift detected (pool ${totalLP.toFixed(2)} vs bank ${State.bank.liquidity.toFixed(2)})`;
    } else {
      banner.style.display='none';
    }
  }
}
