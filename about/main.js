// About page interactive logic
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const npcNameEl = document.getElementById('npcName');
const packsListEl = document.getElementById('packsList');
const restartBtn = document.getElementById('restartBtn');
const randomBtn = document.getElementById('randomPackBtn');

let currentPackId = 'overview';
let engine = new DialogueEngine(window.ABOUT_PACKS[currentPackId], { onRender: renderNode });
engine.render();

function renderNode(payload) {
  npcNameEl.textContent = payload.speaker;
  textEl.classList.remove('type-caret');
  textEl.textContent = '';
  const full = payload.text;
  let i = 0; const speed = 10;
  (function type(){
    if(i <= full.length){ textEl.textContent = full.slice(0,i); i++; setTimeout(type,speed); }
    else { textEl.classList.add('type-caret'); }
  })();
  choicesEl.innerHTML='';
  if(payload.end){
    const li=document.createElement('li');
    const btn=document.createElement('button');
    btn.className='choice-btn pixel-font';
    btn.textContent='↻ Restart Pack';
    btn.onclick=()=>engine.reset();
    li.appendChild(btn); choicesEl.appendChild(li);
  } else {
    payload.choices.forEach((c,idx)=>{
      const li=document.createElement('li');
      const b=document.createElement('button');
      b.className='choice-btn pixel-font fade-in';
      b.textContent=(idx+1)+'. '+c.text+(c.ending?' •':'');
      b.onclick=()=>engine.choose(idx);
      li.appendChild(b); choicesEl.appendChild(li);
    });
  }
}

function refreshPackButtons(){
  packsListEl.innerHTML='';
  Object.entries(window.ABOUT_PACKS).forEach(([id,pack])=>{
    const btn=document.createElement('button');
    btn.title=pack.meta?.description||pack.meta?.title||id;
    btn.textContent=(id===currentPackId?'▶ ':'') + (pack.meta?.title||id);
    btn.onclick=()=>{ currentPackId=id; engine.loadPack(pack); refreshPackButtons(); };
    packsListEl.appendChild(btn);
  });
}
refreshPackButtons();

restartBtn.addEventListener('click', ()=>engine.reset());
randomBtn.addEventListener('click', ()=>{
  const ids=Object.keys(window.ABOUT_PACKS);
  currentPackId=ids[Math.floor(Math.random()*ids.length)];
  engine.loadPack(window.ABOUT_PACKS[currentPackId]);
  refreshPackButtons();
});

window.addEventListener('keydown', e=>{
  if(e.key==='r' || e.key==='R'){ engine.reset(); return; }
  if(/^[1-4]$/.test(e.key)) { engine.choose(parseInt(e.key,10)-1); }
});

// Simple avatar animation
const canvas=document.getElementById('npcCanvas');
const ctx=canvas.getContext('2d');
let tick=0;
(function loop(){ ctx.imageSmoothingEnabled=false; ctx.clearRect(0,0,64,64); ctx.fillStyle='#111'; ctx.fillRect(0,0,64,64); ctx.fillStyle='#00fff7'; ctx.fillRect(4,4,56,56); ctx.fillStyle='#181825'; ctx.fillRect(8,8,48,48); const blink=(tick%160)<6; ctx.fillStyle= blink?'#181825':'#fff700'; ctx.fillRect(20,24,8,8); ctx.fillRect(36,24,8,8); ctx.fillStyle='#ff00ea'; const mh=4+Math.floor((Math.sin(tick/25)+1)*2); ctx.fillRect(24,38,16,mh); tick++; requestAnimationFrame(loop); })();
