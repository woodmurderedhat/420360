// autoplay.js - loop controller
import { stepRound } from './main-loop.js';

class AutoPlayCtl {
  constructor(){ this.timer=null; this.speed=400; }
  start(){ if (this.timer) return; this.timer = setInterval(()=> stepRound(), this.speed); updateStatus('running'); }
  stop(){ if (!this.timer) return; clearInterval(this.timer); this.timer=null; updateStatus('stopped'); }
  setSpeed(ms){ this.speed = ms; if (this.timer){ this.stop(); this.start(); } }
}
function updateStatus(txt){ const el = document.getElementById('autoplayStatus'); if (el) el.textContent = txt; }
export const AutoPlay = new AutoPlayCtl();
