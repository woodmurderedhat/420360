// Initialize sound system on first interaction
function initializeSound() {
  if (typeof GameSounds !== 'undefined') {
    GameSounds.enableAudio();
  }
}

let soundInitialized = false;

// Using globals PACKS, SCHEMA_SNIPPET, DialogueEngine injected by prior scripts.

const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const npcNameEl = document.getElementById('npcName');
const npcTaglineEl = document.getElementById('npcTagline');
const packsListEl = document.getElementById('packsList');
const packTitleEl = document.getElementById('packTitle');
const packDescriptionEl = document.getElementById('packDescription');
const packProgressEl = document.getElementById('packProgress');
const archiveStatsEl = document.getElementById('archiveStats');
const oracleStatusLabelEl = document.getElementById('oracleStatusLabel');
const restartBtn = document.getElementById('restartBtn');
// Upload functionality removed; only built-in packs remain.

let currentPackId = 'intro';
let typeSequence = 0;
// Persistent discovery state
const DISCOVERY_KEY = 'tim_oracle_endings_v1';
let discovered = {};
try { discovered = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || '{}'); } catch { discovered = {}; }

function saveDiscovery() { localStorage.setItem(DISCOVERY_KEY, JSON.stringify(discovered)); }

function getPackMeta(packId) {
  return PACKS[packId]?.meta || {};
}

function getTotalEndingCount() {
  return Object.values(PACKS).reduce((sum, pack) => sum + countEndings(pack), 0);
}

function updateArchiveMeta() {
  const pack = PACKS[currentPackId];
  if (!pack) return;

  const meta = getPackMeta(currentPackId);
  const totalEndings = countEndings(pack);
  const found = Object.keys(discovered[currentPackId] || {}).length;

  if (packTitleEl) packTitleEl.textContent = meta.title || currentPackId;
  if (packDescriptionEl) packDescriptionEl.textContent = meta.description || 'Uncatalogued oracle archive.';
  if (packProgressEl) packProgressEl.textContent = `ENDINGS DISCOVERED ${found}/${totalEndings}`;
  if (archiveStatsEl) {
    archiveStatsEl.textContent = `${Object.keys(PACKS).length} archives • ${getTotalEndingCount()} endings total`;
  }
  if (npcTaglineEl) {
    npcTaglineEl.textContent = meta.description || 'Choose a thread and let the static answer back.';
  }
  if (oracleStatusLabelEl) {
    oracleStatusLabelEl.textContent = found === totalEndings && totalEndings > 0
      ? 'ARCHIVE CLEARED'
      : `ARCHIVE ONLINE • ${meta.title || currentPackId}`;
  }
}

let engine = new DialogueEngine(PACKS[currentPackId], { onRender: renderNode });
engine.render();

function renderNode(payload, state) {
  npcNameEl.textContent = payload.speaker;
  // Type effect (basic)
  typeSequence += 1;
  const sequence = typeSequence;
  textEl.classList.remove('type-caret');
  textEl.textContent = '';
  const full = payload.text;
  let i = 0;
  const speed = 12; // ms per char
  function typeNext() {
    if (sequence !== typeSequence) return;
    if (i <= full.length) {
      textEl.textContent = full.slice(0,i);
      i++;
      setTimeout(typeNext, speed);
    } else {
      textEl.classList.add('type-caret');
    }
  }
  typeNext();

  // Choices
  choicesEl.innerHTML = '';
  if (payload.end) {
    // Mark ending discovered
    const packMeta = PACKS[currentPackId];
    if (packMeta) {
      const endingsSet = discovered[currentPackId] || (discovered[currentPackId] = {});
      endingsSet[payload.id] = true;
      saveDiscovery();
      refreshPackButtons();
    }
    const restartLi = document.createElement('li');
    const restartBtn = document.createElement('button');
    restartBtn.className = 'choice-btn pixel-font';
    restartBtn.textContent = '↻ Restart';
    restartBtn.onclick = () => engine.reset();
    restartLi.appendChild(restartBtn);
    choicesEl.appendChild(restartLi);
  } else {
    payload.choices.forEach((c, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'choice-btn pixel-font fade-in';
      btn.textContent = (idx+1) + '. ' + c.text + (c.ending ? ' •' : '');
      if (c.ending) btn.dataset.ending = 'true';
      btn.addEventListener('click', () => {
        if (!soundInitialized) {
          initializeSound();
          soundInitialized = true;
        }
        engine.choose(idx);
      });
      li.appendChild(btn);
      choicesEl.appendChild(li);
    });
  }
}

// Keyboard shortcuts 1-3 & R
window.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') {
    engine.reset();
    return;
  }
  if (/^[1-3]$/.test(e.key)) {
    const idx = parseInt(e.key,10)-1;
    engine.choose(idx);
  }
});

// Populate pack buttons
function countEndings(pack) {
  return Object.values(pack.nodes).filter(n => n.end).length;
}
function refreshPackButtons() {
  packsListEl.innerHTML = '';
  Object.entries(PACKS).forEach(([id, pack]) => {
    const btn = document.createElement('button');
    const totalEndings = countEndings(pack);
    const found = Object.keys(discovered[id] || {}).length;
      btn.title = (pack.meta?.description || pack.meta?.title || id) + '\nEndings: ' + found + '/' + totalEndings;
      btn.classList.toggle('discovered-all', found && found === totalEndings);
      btn.classList.toggle('active', id === currentPackId);
      let label = (id === currentPackId ? '▶ ' : '') + (pack.meta?.title || id);
      btn.textContent = label;
      // Append small meta span
      const span = document.createElement('span');
      span.className = 'meta';
    span.textContent = ' ' + found + '/' + totalEndings;
    btn.appendChild(span);
    // Ending markers
    for (let i=0;i<totalEndings;i++) {
      const marker = document.createElement('span');
      marker.className = 'ending-marker' + (i < found ? ' found':'');
      btn.appendChild(marker);
    }
    btn.onclick = () => {
      currentPackId = id;
      engine.loadPack(pack);
      refreshPackButtons();
    };
    packsListEl.appendChild(btn);
  });
  updateArchiveMeta();
}
refreshPackButtons();

restartBtn.addEventListener('click', () => engine.reset());

// Random Pack
const randomBtn = document.getElementById('randomPackBtn');
randomBtn.addEventListener('click', () => {
  const ids = Object.keys(PACKS);
  if (!ids.length) return;
  let next; let attempts=0;
  // Prefer packs not fully discovered
  const undiscovered = ids.filter(id => {
    const total = countEndings(PACKS[id]);
    const found = Object.keys(discovered[id] || {}).length;
    return found < total;
  });
  if (undiscovered.length) {
    next = undiscovered[Math.floor(Math.random()*undiscovered.length)];
  } else {
    next = ids[Math.floor(Math.random()*ids.length)];
  }
  currentPackId = next;
  engine.loadPack(PACKS[next]);
  refreshPackButtons();
});

// Custom JSON loading removed.

// Simple pixel NPC animation (blinking square face)
const canvas = document.getElementById('npcCanvas');
const ctx = canvas.getContext('2d');
let tick = 0;
function paletteVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
function drawNPC() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0,0,64,64);
  const bg = paletteVar('--panel-void', '#08110d');
  const shell = paletteVar('--highlight', '#9af9c7');
  const face = paletteVar('--surface-2', '#11241c');
  const eye = paletteVar('--secondary', '#f7a63f');
  const mouth = paletteVar('--primary', '#2fd982');
  // background
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,64,64);
  // face border
  ctx.fillStyle = shell;
  ctx.fillRect(4,4,56,56);
  ctx.fillStyle = face;
  ctx.fillRect(8,8,48,48);
  // eyes
  const blink = (tick % 180) < 6; // blink every ~3s
  ctx.fillStyle = blink ? face : eye;
  ctx.fillRect(20,24,8,8);
  ctx.fillRect(36,24,8,8);
  // mouth
  ctx.fillStyle = mouth;
  const mouthPhase = Math.sin(tick/25);
  const mouthH = 4 + Math.floor((mouthPhase+1)*2);
  ctx.fillRect(24,38,16,mouthH);
  tick++;
  requestAnimationFrame(drawNPC);
}
requestAnimationFrame(drawNPC);
