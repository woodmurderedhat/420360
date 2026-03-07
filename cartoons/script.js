const DEFAULT_SEED = 20260308;
const PARTICLE_COUNT = 1100;

let currentSeed = getSeedFromUrl();
let particles = [];
let paused = false;
let cohesion = 0.95;
let drift = 1;
let memory = 0.965;
let interactionEnergy = 0;
let canvasRef;
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pointer = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  speed: 0,
  active: false,
};

class Particle {
  constructor(w, h) {
    this.respawn(w, h, true);
  }

  respawn(w, h, fresh = false) {
    this.pos = createVector(random(w), random(h));
    this.prev = this.pos.copy();
    const direction = random(TAU);
    this.vel = p5.Vector.fromAngle(direction).mult(random(0.15, 0.7));
    this.life = fresh ? random(0.55, 1) : 1;
  }

  update(w, h) {
    this.prev.set(this.pos);

    const field = getFlowVector(this.pos.x, this.pos.y, frameCount * 0.004);
    const socialBias = createVector(w * 0.5 - this.pos.x, h * 0.5 - this.pos.y)
      .normalize()
      .mult(0.02 * cohesion);

    this.vel.add(field.mult(0.33 * drift));
    this.vel.add(socialBias);

    if (pointer.active && pointer.speed > 0.2) {
      const toMouse = createVector(pointer.x - this.pos.x, pointer.y - this.pos.y);
      const distance = max(16, toMouse.mag());
      const influence = map(distance, 16, min(w, h) * 0.45, 0.38, 0, true);
      const swayScale = reducedMotion ? 0.5 : 1;
      const sway = createVector(pointer.x - pointer.px, pointer.y - pointer.py)
        .normalize()
        .mult(influence * pointer.speed * 0.025 * swayScale);
      this.vel.add(sway);
    }

    this.vel.mult(memory);
    this.vel.limit(2.1 + interactionEnergy * 1.6);

    this.pos.add(this.vel);

    if (this.pos.x < 0 || this.pos.x > w || this.pos.y < 0 || this.pos.y > h || this.life < 0) {
      this.respawn(w, h);
    }

    this.life -= 0.0016;
  }

  draw() {
    const c1 = color(15, 110, 116, 105);
    const c2 = color(198, 95, 50, 120 + interactionEnergy * 80);
    const c3 = color(111, 143, 101, 95);

    let blendRatio = map(noise(this.pos.x * 0.004, this.pos.y * 0.004), 0, 1, 0, 1);
    blendRatio = constrain(blendRatio + interactionEnergy * 0.12, 0, 1);

    const mid = lerpColor(c1, c2, blendRatio);
    const tone = lerpColor(mid, c3, this.life * 0.3);

    stroke(tone);
    const widthScale = reducedMotion ? 0.6 : 1;
    strokeWeight((0.5 + interactionEnergy * 0.9) * widthScale);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
  }
}

function setup() {
  const holder = document.getElementById("sketch-holder");
  const size = getSketchSize(holder);
  canvasRef = createCanvas(size.w, size.h);
  canvasRef.parent(holder);

  pixelDensity(1);
  noFill();
  strokeCap(ROUND);

  applySeed(currentSeed);
  wireControls();
  touchActionNone();
}

function draw() {
  if (paused) {
    return;
  }

  if (reducedMotion && frameCount % 2 !== 0) {
    drawAtmosphericFade();
    return;
  }

  drawAtmosphericFade();

  const speedDamping = reducedMotion ? 0.82 : 0.9;
  const energyFactor = reducedMotion ? 0.045 : 0.08;

  pointer.speed *= speedDamping;
  interactionEnergy = lerp(interactionEnergy, pointer.speed * energyFactor, 0.12);
  interactionEnergy = constrain(interactionEnergy, 0, 1);

  for (let i = 0; i < particles.length; i += 1) {
    particles[i].update(width, height);
    particles[i].draw();
  }

  drawCenterPulse();
}

function drawAtmosphericFade() {
  const alphaBase = reducedMotion
    ? map(interactionEnergy, 0, 1, 20, 10)
    : map(interactionEnergy, 0, 1, 15, 4);
  background(246, 240, 227, alphaBase);
}

function drawCenterPulse() {
  const radius = min(width, height) * (0.15 + interactionEnergy * 0.1);
  const calm = color(111, 143, 101, 28);
  const tense = color(198, 95, 50, 32 + interactionEnergy * 32);
  const halo = lerpColor(calm, tense, interactionEnergy);

  noStroke();
  fill(halo);
  circle(width * 0.5, height * 0.5, radius);
}

function getFlowVector(x, y, t) {
  const primary = noise(x * 0.0018, y * 0.0018, t);
  const secondary = noise(x * 0.009, y * 0.009, t * 1.4);
  const angle = primary * TAU * 1.8 + secondary * PI * 1.2;
  const strength = 0.3 + secondary * 0.9;

  return p5.Vector.fromAngle(angle).mult(strength);
}

function resetSimulation() {
  randomSeed(currentSeed);
  noiseSeed(currentSeed);
  particles = [];
  const targetCount = reducedMotion ? Math.floor(PARTICLE_COUNT * 0.6) : PARTICLE_COUNT;
  for (let i = 0; i < targetCount; i += 1) {
    particles.push(new Particle(width, height));
  }
  pointer.speed = 0;
  interactionEnergy = 0;
  background(246, 240, 227);
}

function applySeed(newSeed) {
  currentSeed = sanitizeSeed(newSeed);
  updateUrlSeed(currentSeed);
  document.getElementById("seed-display").textContent = String(currentSeed);
  resetSimulation();
}

function sanitizeSeed(seed) {
  const parsed = Number.parseInt(String(seed), 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_SEED;
  }
  return Math.abs(parsed) % 2147483647;
}

function getSeedFromUrl() {
  const value = new URLSearchParams(window.location.search).get("seed");
  return value ? sanitizeSeed(value) : DEFAULT_SEED;
}

function updateUrlSeed(seed) {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", String(seed));
  window.history.replaceState({}, "", url.toString());
}

function getSketchSize(holder) {
  const bounds = holder.getBoundingClientRect();
  const w = max(320, floor(bounds.width));
  const h = max(320, floor(bounds.height));
  return { w, h };
}

function wireControls() {
  const prevSeedBtn = document.getElementById("prev-seed");
  const nextSeedBtn = document.getElementById("next-seed");
  const randomSeedBtn = document.getElementById("random-seed");
  const copyLinkBtn = document.getElementById("copy-link");
  const pauseBtn = document.getElementById("toggle-pause");
  const resetBtn = document.getElementById("reset-scene");
  const saveBtn = document.getElementById("save-frame");
  const motionBtn = document.getElementById("toggle-motion");

  setReducedMotion(reducedMotion);

  prevSeedBtn.addEventListener("click", () => applySeed(currentSeed - 1));
  nextSeedBtn.addEventListener("click", () => applySeed(currentSeed + 1));
  randomSeedBtn.addEventListener("click", () => {
    applySeed(floor(Math.random() * 2147483647));
  });

  copyLinkBtn.addEventListener("click", async () => {
    const text = window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      copyLinkBtn.textContent = "Copied";
      window.setTimeout(() => {
        copyLinkBtn.textContent = "Copy Link";
      }, 900);
    } catch (error) {
      copyLinkBtn.textContent = "Copy Failed";
      window.setTimeout(() => {
        copyLinkBtn.textContent = "Copy Link";
      }, 900);
    }
  });

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });

  resetBtn.addEventListener("click", () => resetSimulation());

  saveBtn.addEventListener("click", () => {
    saveCanvas(canvasRef, `autonomy-flux-${currentSeed}`, "png");
  });

  motionBtn.addEventListener("click", () => {
    setReducedMotion(!reducedMotion);
    resetSimulation();
  });

  document.getElementById("cohesion-slider").addEventListener("input", (event) => {
    cohesion = Number.parseFloat(event.target.value);
  });

  document.getElementById("drift-slider").addEventListener("input", (event) => {
    drift = Number.parseFloat(event.target.value);
  });

  document.getElementById("memory-slider").addEventListener("input", (event) => {
    memory = Number.parseFloat(event.target.value);
  });
}

function setReducedMotion(enabled) {
  reducedMotion = enabled;
  document.body.classList.toggle("reduced-motion", reducedMotion);
  const motionBtn = document.getElementById("toggle-motion");
  if (motionBtn) {
    motionBtn.textContent = reducedMotion ? "Reduced Motion: On" : "Reduced Motion: Off";
  }
}

function pointerUpdate(x, y, active = true) {
  const nx = constrain(x, 0, width);
  const ny = constrain(y, 0, height);
  pointer.px = pointer.x;
  pointer.py = pointer.y;
  pointer.x = nx;
  pointer.y = ny;

  const dx = pointer.x - pointer.px;
  const dy = pointer.y - pointer.py;
  pointer.speed = min(40, Math.hypot(dx, dy));
  pointer.active = active;
}

function mouseMoved() {
  pointerUpdate(mouseX, mouseY, true);
}

function mouseDragged() {
  pointerUpdate(mouseX, mouseY, true);
}

function touchMoved(event) {
  if (touches.length > 0) {
    pointerUpdate(touches[0].x, touches[0].y, true);
  }
  return false;
}

function mouseReleased() {
  pointer.active = false;
}

function touchEnded() {
  pointer.active = false;
  return false;
}

function touchStarted() {
  if (touches.length > 0) {
    pointerUpdate(touches[0].x, touches[0].y, true);
  }
  return false;
}

function touchActionNone() {
  const canvasElement = canvasRef.elt;
  canvasElement.style.touchAction = "none";
}

function windowResized() {
  const holder = document.getElementById("sketch-holder");
  const size = getSketchSize(holder);
  resizeCanvas(size.w, size.h);
  resetSimulation();
}
