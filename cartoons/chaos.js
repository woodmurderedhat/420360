"use strict";

// ── Seeded PRNG (mulberry32) ───────────────────────────────────────────────────
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_SEED = 20260405;
const PENDULUM_TRAIL_MAX = 400;
const EPICYCLE_TRAIL_MAX = 600;
const TRAIL_BUCKETS = 20;
const PARTICLE_MAX = 1200;

// Pendulum
const PL1 = 120, PL2 = 90, PM1 = 10, PM2 = 8, PG = 1.2, PDT = 0.3;

// Epicycles
const EP_RADII = [180, 90, 45, 22, 11];
const EP_SPEEDS = [0.008, 0.024, 0.056, 0.104, 0.184];

// ── Mutable state ─────────────────────────────────────────────────────────────
let G = 0.8;
let trailFade = 0.05;
let couplingStrength = 1.35;
let currentSeed = DEFAULT_SEED;
let rng = mulberry32(DEFAULT_SEED);
let paused = false;
let showBodies = true;
let showPendulum = true;
let showEpicycles = true;

let bodies = [];
let particles = [];
let anchorX = 0;
let anchorY = 0;
let anchorVX = 0;
let anchorVY = 0;
let bodyEnergy = 0;
let couplingSignal = 0;
let clickInfluence = 0;
let clickAnchorX = 0;
let clickAnchorY = 0;

let pθ1 = 0, pθ2 = 0, pω1 = 0, pω2 = 0;
let pendulumTrail = [];

let epAngles = [0, 0, 0, 0, 0];
let epicycleTrail = [];

// Canvas (assigned in DOMContentLoaded)
let canvas, ctx;

// ── Seed system ───────────────────────────────────────────────────────────────
function sanitizeSeed(seed) {
  const parsed = Number.parseInt(String(seed), 10);
  if (Number.isNaN(parsed)) return DEFAULT_SEED;
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

function applySeed(newSeed) {
  currentSeed = sanitizeSeed(newSeed);
  rng = mulberry32(currentSeed);
  updateUrlSeed(currentSeed);
  const el = document.getElementById("seed-display");
  if (el) el.textContent = String(currentSeed);
  resetSimulation();
}

// ── Canvas helpers ────────────────────────────────────────────────────────────
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function clearCanvas() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── Simulation init ───────────────────────────────────────────────────────────
function rndColor() {
  return `hsl(${Math.floor(rng() * 360)}, 100%, 60%)`;
}

function randomBody() {
  return {
    x: rng() * canvas.width,
    y: rng() * canvas.height,
    prevX: 0,
    prevY: 0,
    vx: (rng() - 0.5) * 3,
    vy: (rng() - 0.5) * 3,
    m: rng() * 5 + 5,
    color: rndColor(),
  };
}

function initPendulum() {
  pθ1 = (rng() - 0.5) * Math.PI * 1.2 + Math.PI / 2;
  pθ2 = (rng() - 0.5) * Math.PI * 1.8 + Math.PI;
  pω1 = 0;
  pω2 = 0;
  pendulumTrail = [];
}

function resetSimulation() {
  resizeCanvas();
  anchorX = canvas.width / 2;
  anchorY = canvas.height / 2;
  anchorVX = 0;
  anchorVY = 0;
  bodyEnergy = 0;
  couplingSignal = 0;
  clickInfluence = 0;
  clickAnchorX = anchorX;
  clickAnchorY = anchorY;
  bodies = [randomBody(), randomBody(), randomBody()];
  particles = [];
  epAngles = [0, 0, 0, 0, 0];
  epicycleTrail = [];
  initPendulum();
  clearCanvas();
}

// ── Update ────────────────────────────────────────────────────────────────────
function spawnFragments(x, y, baseColor) {
  const fragmentCount = 15 + Math.floor(couplingStrength * 8);
  for (let i = 0; i < fragmentCount; i++) {
    const angle = rng() * Math.PI * 2;
    const speed = rng() * 4;
    particles.push({
      x, y, prevX: x, prevY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60 + Math.floor(rng() * 40),
      color: baseColor,
    });
  }
}

function updateBodies() {
  const dt = 0.6;
  const drag = 0.999;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const pull = 0.0005;
  const maxSpeed = 10;
  let totalMass = 0;
  let comX = 0;
  let comY = 0;
  let energySum = 0;

  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i];
    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;
      const bj = bodies[j];
      const dx = bj.x - bi.x;
      const dy = bj.y - bi.y;
      const distSq = dx * dx + dy * dy + 0.1;
      const dist = Math.sqrt(distSq);
      const force = G * bi.m * bj.m / distSq;
      bi.vx += (force * dx / dist / bi.m) * dt;
      bi.vy += (force * dy / dist / bi.m) * dt;
    }
  }

  for (const b of bodies) {
    b.prevX = b.x;
    b.prevY = b.y;
    b.vx += (centerX - b.x) * pull;
    b.vy += (centerY - b.y) * pull;
    b.vx *= drag;
    b.vy *= drag;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 0) b.x += canvas.width;
    if (b.x > canvas.width) b.x -= canvas.width;
    if (b.y < 0) b.y += canvas.height;
    if (b.y > canvas.height) b.y -= canvas.height;
    b.vx = Math.max(Math.min(b.vx, maxSpeed), -maxSpeed);
    b.vy = Math.max(Math.min(b.vy, maxSpeed), -maxSpeed);

    totalMass += b.m;
    comX += b.x * b.m;
    comY += b.y * b.m;
    energySum += b.vx * b.vx + b.vy * b.vy;
  }

  if (totalMass > 0) {
    const bodyAnchorX = comX / totalMass;
    const bodyAnchorY = comY / totalMass;
    const targetAnchorX = bodyAnchorX * (1 - clickInfluence) + clickAnchorX * clickInfluence;
    const targetAnchorY = bodyAnchorY * (1 - clickInfluence) + clickAnchorY * clickInfluence;
    const spring = 0.045 + couplingStrength * 0.028;
    const damping = clamp(0.84 - couplingStrength * 0.05, 0.7, 0.9);

    anchorVX = anchorVX * damping + (targetAnchorX - anchorX) * spring;
    anchorVY = anchorVY * damping + (targetAnchorY - anchorY) * spring;

    const maxAnchorSpeed = 12 + couplingStrength * 9;
    anchorVX = clamp(anchorVX, -maxAnchorSpeed, maxAnchorSpeed);
    anchorVY = clamp(anchorVY, -maxAnchorSpeed, maxAnchorSpeed);

    anchorX = clamp(anchorX + anchorVX, 0, canvas.width);
    anchorY = clamp(anchorY + anchorVY, 0, canvas.height);
  }

  clickInfluence *= clamp(0.968 - (couplingStrength - 1) * 0.012, 0.93, 0.975);
  if (clickInfluence < 0.001) clickInfluence = 0;

  bodyEnergy = energySum / Math.max(1, bodies.length);
  const energyNorm = clamp(Math.sqrt(bodyEnergy) / 3.6, 0, 1);
  const anchorMotionNorm = clamp(Math.hypot(anchorVX, anchorVY) / 14, 0, 1);
  const targetSignal = clamp((energyNorm * 0.72 + anchorMotionNorm * 0.28) * couplingStrength, 0, 1.8);
  couplingSignal += (targetSignal - couplingSignal) * 0.13;

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bi = bodies[i], bj = bodies[j];
      const dx = bj.x - bi.x, dy = bj.y - bi.y;
      if (Math.sqrt(dx * dx + dy * dy) < 5) {
        spawnFragments(bi.x, bi.y, bi.color);
        spawnFragments(bj.x, bj.y, bj.color);
        bi.color = rndColor();
        bj.color = rndColor();
      }
    }
  }
}

function updateParticles() {
  for (const p of particles) {
    p.prevX = p.x;
    p.prevY = p.y;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
  if (particles.length > PARTICLE_MAX) {
    particles.splice(0, particles.length - PARTICLE_MAX);
  }
}

function updatePendulum() {
  const dθ = pθ2 - pθ1;
  const sinDθ = Math.sin(dθ);
  const cosDθ = Math.cos(dθ);
  const denom1 = 2 * PM1 + PM2 - PM2 * Math.cos(2 * dθ);
  const α1 = (
    -PG * (2 * PM1 + PM2) * Math.sin(pθ1)
    - PM2 * PG * Math.sin(pθ1 - 2 * pθ2)
    - 2 * sinDθ * PM2 * (pω2 * pω2 * PL2 + pω1 * pω1 * PL1 * cosDθ)
  ) / (PL1 * denom1);
  const α2 = (
    2 * sinDθ * (
      pω1 * pω1 * PL1 * (PM1 + PM2)
      + PG * (PM1 + PM2) * Math.cos(pθ1)
      + pω2 * pω2 * PL2 * PM2 * cosDθ
    )
  ) / (PL2 * denom1);
  pω1 += α1 * PDT;
  pω2 += α2 * PDT;

  const anchorCoupling = (anchorVX * Math.cos(pθ1) + anchorVY * Math.sin(pθ1)) * 0.00105 * (0.75 + couplingSignal);
  const energyCoupling = clamp(bodyEnergy, 0, 40) * 0.00032 * (0.65 + couplingSignal) * Math.sin(pθ2 - pθ1);
  pω1 += anchorCoupling + energyCoupling;
  pω2 += anchorCoupling * 0.6 - energyCoupling * 0.5;

  pω1 = clamp(pω1, -12, 12);
  pω2 = clamp(pω2, -12, 12);

  if (!Number.isFinite(pω1) || !Number.isFinite(pω2) || !Number.isFinite(pθ1) || !Number.isFinite(pθ2)) {
    initPendulum();
    return;
  }

  pθ1 += pω1 * PDT;
  pθ2 += pω2 * PDT;

  const x1 = anchorX + PL1 * Math.sin(pθ1);
  const y1 = anchorY + PL1 * Math.cos(pθ1);
  const x2 = x1 + PL2 * Math.sin(pθ2);
  const y2 = y1 + PL2 * Math.cos(pθ2);
  pendulumTrail.push({ x: x2, y: y2 });
  if (pendulumTrail.length > PENDULUM_TRAIL_MAX) pendulumTrail.shift();
}

function updateEpicycles() {
  const pendulumEnergy = clamp(Math.abs(pω1) + Math.abs(pω2), 0, 25);
  const pendulumNorm = pendulumEnergy / 25;
  const anchorMotion = clamp(Math.hypot(anchorVX, anchorVY), 0, 20);
  const anchorNorm = anchorMotion / 20;
  const speedMod = clamp(
    1 + couplingSignal * 0.68 + pendulumNorm * 0.62 + anchorNorm * 0.42,
    0.55,
    2.4
  );
  for (let i = 0; i < 5; i++) {
    epAngles[i] += EP_SPEEDS[i] * speedMod;
  }
  let x = anchorX, y = anchorY;
  for (let i = 0; i < 5; i++) {
    x += EP_RADII[i] * Math.cos(epAngles[i]);
    y += EP_RADII[i] * Math.sin(epAngles[i]);
  }
  epicycleTrail.push({ x, y });
  if (epicycleTrail.length > EPICYCLE_TRAIL_MAX) epicycleTrail.shift();
}

// ── Draw (batched trails) ─────────────────────────────────────────────────────
// Groups trail points into TRAIL_BUCKETS colour buckets — one stroke per bucket
// instead of one per point, reducing Canvas API calls by ~97%.
function drawTrailBatched(trail, hueStart, hueEnd, lumStart, lumEnd, alphaMax, widthStart, widthEnd) {
  if (trail.length < 2) return;
  const len = trail.length;
  ctx.globalCompositeOperation = "lighter";
  for (let b = 0; b < TRAIL_BUCKETS; b++) {
    const t0 = b / TRAIL_BUCKETS;
    const t1 = (b + 1) / TRAIL_BUCKETS;
    const iStart = Math.floor(t0 * (len - 1));
    const iEnd = Math.floor(t1 * (len - 1));
    if (iEnd <= iStart) continue;
    const tmid = (t0 + t1) / 2;
    ctx.strokeStyle = `hsl(${hueStart + tmid * (hueEnd - hueStart)}, 100%, ${lumStart + tmid * (lumEnd - lumStart)}%)`;
    ctx.lineWidth = widthStart + tmid * (widthEnd - widthStart);
    ctx.globalAlpha = tmid * alphaMax;
    ctx.beginPath();
    ctx.moveTo(trail[iStart].x, trail[iStart].y);
    for (let i = iStart + 1; i <= iEnd; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPendulum() {
  const x1 = anchorX + PL1 * Math.sin(pθ1);
  const y1 = anchorY + PL1 * Math.cos(pθ1);
  const x2 = x1 + PL2 * Math.sin(pθ2);
  const y2 = y1 + PL2 * Math.cos(pθ2);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "hsl(40, 80%, 50%)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // amber → gold trail
  drawTrailBatched(pendulumTrail, 35, 55, 45, 70, 0.6, 0.8, 1.5);
}

function drawEpicycles() {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.07;
  ctx.lineWidth = 0.8;
  let cx = anchorX, cy = anchorY;
  const ghostHues = [270, 245, 220, 200, 185];
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `hsl(${ghostHues[i]}, 80%, 60%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, EP_RADII[i], 0, Math.PI * 2);
    ctx.stroke();
    cx += EP_RADII[i] * Math.cos(epAngles[i]);
    cy += EP_RADII[i] * Math.sin(epAngles[i]);
  }
  ctx.globalAlpha = 1;

  // teal → violet trail
  drawTrailBatched(epicycleTrail, 200, 280, 62, 62, 0.55, 0.7, 1.5);
}

function draw() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(10, 0, 20, ${trailFade})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showBodies) {
    ctx.globalCompositeOperation = "lighter";
    for (const b of bodies) {
      ctx.beginPath();
      ctx.moveTo(b.prevX, b.prevY);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = p.life / 100;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  if (showPendulum) drawPendulum();
  if (showEpicycles) drawEpicycles();
  ctx.globalCompositeOperation = "source-over";
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function loop() {
  if (!paused) {
    updateBodies();
    updateParticles();
    updatePendulum();
    updateEpicycles();
    draw();
  }
  requestAnimationFrame(loop);
}

// ── Controls ──────────────────────────────────────────────────────────────────
function setLayerBtn(id, active, labelOn, labelOff) {
  const btn = document.getElementById(id);
  btn.textContent = active ? labelOn : labelOff;
  btn.classList.toggle("layer-off", !active);
}

function wireControls() {
  document.getElementById("seed-display").textContent = String(currentSeed);

  document.getElementById("prev-seed").addEventListener("click", () => applySeed(currentSeed - 1));
  document.getElementById("next-seed").addEventListener("click", () => applySeed(currentSeed + 1));
  document.getElementById("random-seed").addEventListener("click", () =>
    applySeed(Math.floor(Math.random() * 2147483647))
  );

  document.getElementById("copy-link").addEventListener("click", async () => {
    const btn = document.getElementById("copy-link");
    try {
      await navigator.clipboard.writeText(window.location.href);
      btn.textContent = "Copied!";
    } catch {
      btn.textContent = "Failed";
    }
    setTimeout(() => { btn.textContent = "Copy Link"; }, 900);
  });

  const pauseBtn = document.getElementById("toggle-pause");
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    rng = mulberry32(currentSeed);
    resetSimulation();
  });

  document.getElementById("save-btn").addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = `3body-chaos-${currentSeed}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  });

  document.getElementById("toggle-bodies").addEventListener("click", (e) => {
    showBodies = !showBodies;
    setLayerBtn("toggle-bodies", showBodies, "Bodies: On", "Bodies: Off");
  });

  document.getElementById("toggle-pendulum").addEventListener("click", () => {
    showPendulum = !showPendulum;
    setLayerBtn("toggle-pendulum", showPendulum, "Pendulum: On", "Pendulum: Off");
  });

  document.getElementById("toggle-epicycles").addEventListener("click", () => {
    showEpicycles = !showEpicycles;
    setLayerBtn("toggle-epicycles", showEpicycles, "Epicycles: On", "Epicycles: Off");
  });

  const gSlider = document.getElementById("g-slider");
  const gValue = document.getElementById("g-value");
  gSlider.addEventListener("input", () => {
    G = parseFloat(gSlider.value);
    gValue.textContent = G.toFixed(2);
  });

  const couplingSlider = document.getElementById("coupling-slider");
  const couplingValue = document.getElementById("coupling-value");
  couplingSlider.value = couplingStrength.toFixed(2);
  couplingValue.textContent = couplingStrength.toFixed(2);
  couplingSlider.addEventListener("input", () => {
    couplingStrength = parseFloat(couplingSlider.value);
    couplingValue.textContent = couplingStrength.toFixed(2);
  });

  const fadeSlider = document.getElementById("fade-slider");
  const fadeValue = document.getElementById("fade-value");
  fadeSlider.addEventListener("input", () => {
    trailFade = parseFloat(fadeSlider.value);
    fadeValue.textContent = trailFade.toFixed(2);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("chaos-canvas");
  ctx = canvas.getContext("2d");

  applySeed(getSeedFromUrl());
  wireControls();

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, canvas.width);
    const y = clamp(e.clientY - rect.top, 0, canvas.height);
    clickAnchorX = x;
    clickAnchorY = y;
    clickInfluence = clamp(0.9 - (couplingStrength - 1) * 0.05, 0.78, 0.94);
    anchorX = x;
    anchorY = y;
    anchorVX *= 0.35;
    anchorVY *= 0.35;
    pω1 *= 0.7;
    pω2 *= 0.7;
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    anchorX = canvas.width / 2;
    anchorY = canvas.height / 2;
    clickAnchorX = anchorX;
    clickAnchorY = anchorY;
    clickInfluence = 0;
    anchorVX = 0;
    anchorVY = 0;
    clearCanvas();
  });

  loop();
});
