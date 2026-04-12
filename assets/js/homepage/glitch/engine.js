import { CanvasSurface } from './canvas-surface.js';
import { EFFECT_COOLDOWNS, PIPELINE_PRESETS, QUALITY_TIERS, TIER_ORDER } from './constants.js';
import { registerDefaultEffects } from './effects.js';
import { EffectRegistry, PipelineResolver } from './effect-registry.js';
import { MotionAnalyzer } from './motion-analyzer.js';
import { MouseLocalGlitch } from './mouse-local-glitch.js';
import { now } from './utils.js';

function tierIndex(label) {
  return Math.max(0, TIER_ORDER.indexOf(label));
}

const COVERAGE_TRIGGER_ORDER = [
  'move',
  'moveSwipe',
  'moveWhip',
  'moveJitter',
  'moveSurge',
  'moveStall',
  'click',
  'scrollUp',
  'scrollDown',
  'ambient'
];

function clonePipelines(pipelines) {
  const cloned = {};
  COVERAGE_TRIGGER_ORDER.forEach((triggerType) => {
    const lane = pipelines?.[triggerType];
    cloned[triggerType] = Array.isArray(lane) ? lane.map((entry) => ({ ...entry })) : [];
  });
  return cloned;
}

function fallbackTriggerForEffect(effectId) {
  if (effectId === 'scroll-up-rake') return 'scrollUp';
  if (effectId === 'scroll-down-sink') return 'scrollDown';
  if (effectId === 'impact-fracture') return 'click';
  if (effectId.includes('swipe')) return 'moveSwipe';
  if (effectId.includes('whip')) return 'moveWhip';
  if (effectId.includes('jitter')) return 'moveJitter';
  if (effectId.includes('surge')) return 'moveSurge';
  if (effectId.includes('stall')) return 'moveStall';
  if (effectId.includes('ambient')) return 'ambient';
  return 'move';
}

function ensurePresetCoverage(pipelines, registeredEffects) {
  const covered = clonePipelines(pipelines);
  const present = new Set();

  COVERAGE_TRIGGER_ORDER.forEach((triggerType) => {
    covered[triggerType].forEach((entry) => {
      if (entry?.id) present.add(entry.id);
    });
  });

  registeredEffects.forEach((effect) => {
    if (!effect?.id || present.has(effect.id)) return;
    const triggerType = fallbackTriggerForEffect(effect.id);
    covered[triggerType].push({ id: effect.id, weight: 0.2 });
    present.add(effect.id);
  });

  return covered;
}

export class PixelGlitchEngineV2 {
  constructor({ canvasId, imageUrl, preset = 'cinematic', pixelBoardSource = null }) {
    this.surface = new CanvasSurface(canvasId, imageUrl);
    this.pixelBoardSource = pixelBoardSource;
    this.motion = new MotionAnalyzer();
    this.registry = new EffectRegistry();
    this.pipelines = new PipelineResolver();
    this.localGlitch = new MouseLocalGlitch();

    registerDefaultEffects(this.registry);
    this.setPreset(preset);

    this.mouseX = 0;
    this.mouseY = 0;
    this.isInitialized = false;
    this.isProcessing = false;
    this.pendingTrigger = null;
    this.lastTriggerAt = {};
    this.effectCooldowns = { ...EFFECT_COOLDOWNS };

    this.glitchThrottle = 80;
    this.lastGlitchTime = 0;
    this.lastTriggerContext = null;
    this.brightnessTrend = 0;
    this.fidelityStrength = 0.34;
    this.aggressiveVariation = true;
    this.lastDriftMetric = 0;
    this.activeTier = this.computeTier();
    this.autoTiering = true;
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  setPreset(presetName) {
    const preset = PIPELINE_PRESETS[presetName] || PIPELINE_PRESETS.cinematic;
    this.presetName = PIPELINE_PRESETS[presetName] ? presetName : 'cinematic';
    const coveredPreset = ensurePresetCoverage(preset, this.registry.list());
    this.pipelines.setPipelines(coveredPreset);
  }

  computeTier() {
    const reducedMotion = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) return QUALITY_TIERS.low;

    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    if (shortSide < 560) return QUALITY_TIERS.low;
    if (shortSide < 1000) return QUALITY_TIERS.balanced;
    return QUALITY_TIERS.high;
  }

  start() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init();
    return this.initPromise;
  }

  async init() {
    try {
      this.surface.resizeCanvas();

      if (this.pixelBoardSource) {
        try {
          const { fetchPixelBoardCanvas } = await import('./pixel-board-source.js');
          const boardCanvas = await fetchPixelBoardCanvas(
            this.pixelBoardSource.firebaseConfig,
            { timeoutMs: this.pixelBoardSource.timeoutMs ?? 5000 }
          );
          this.surface.setSourceCanvas(boardCanvas);
        } catch (boardError) {
          console.warn('Pixel board fetch failed, falling back to static image:', boardError);
          await this.surface.loadImage();
        }
      } else {
        await this.surface.loadImage();
      }

      this.surface.drawImage();
      this.activeTier = this.computeTier();
      window.addEventListener('resize', this.onResize);
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      this.isInitialized = true;
      console.log('Pixel Glitch Framework initialized');
    } catch (error) {
      console.error('Failed to initialize Pixel Glitch Framework:', error);
    }
  }

  onResize() {
    this.surface.resizeCanvas();
    this.surface.drawImage();
    if (this.autoTiering) this.activeTier = this.computeTier();
  }

  onMouseMove(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    const meta = this.motion.classifyMouseMotion(event);
    const currentTime = now();
    if (currentTime - this.lastGlitchTime < this.glitchThrottle) return;

    const profile = this.motion.pickMoveProfile(meta);
    this.queueTrigger(profile.type, profile.meta);
    if (Math.random() < 0.08 * this.activeTier.chanceScale) this.queueTrigger('ambient', meta);

    this.lastGlitchTime = currentTime;
  }

  trigger(effectType, meta = null) {
    this.queueTrigger(effectType, meta);
  }

  triggerMove(meta = null) {
    const profile = this.motion.pickMoveProfile(meta);
    this.queueTrigger(profile.type, profile.meta);
  }

  applyGlitch() {
    this.queueTrigger('move');
  }

  triggerScrollUp() {
    this.queueTrigger('scrollUp');
  }

  triggerScrollDown() {
    this.queueTrigger('scrollDown');
  }

  triggerClickTear() {
    this.queueTrigger('click');
  }

  queueTrigger(triggerType, meta = null) {
    if (!this.isInitialized || !this.surface.ready) return;

    const currentTime = now();
    const cooldown = this.effectCooldowns[triggerType] || 0;
    if (currentTime - (this.lastTriggerAt[triggerType] || 0) < cooldown) return;
    this.lastTriggerAt[triggerType] = currentTime;
    this.lastTriggerContext = { triggerType, meta, at: currentTime };

    if (this.isProcessing) {
      this.pendingTrigger = { type: triggerType, meta };
      return;
    }

    this.isProcessing = true;
    requestAnimationFrame(() => this.processTrigger(triggerType, meta));
  }

  processTrigger(triggerType, meta = null) {
    const frame = this.surface.getFrame();
    if (!frame) {
      this.isProcessing = false;
      return;
    }

    const context = {
      ...frame,
      quality: this.activeTier,
      triggerType,
      meta,
      variationBoost: this.aggressiveVariation ? 1.22 : 1,
      mouse: { x: this.mouseX, y: this.mouseY }
    };

    const pipeline = this.pipelines.resolve(triggerType, this.activeTier.maxEffects, {
      meta,
      balanceTrend: this.brightnessTrend
    });
    const tierFloor = tierIndex(this.activeTier.label);
    let consumedCost = 0;
    const maxCost = this.activeTier.maxCost ?? Number.POSITIVE_INFINITY;
    let frameBalance = 0;

    pipeline.forEach((effectId) => {
      const effect = this.registry.get(effectId);
      if (!effect) return;

      if (tierFloor < tierIndex(effect.minTier || 'low')) return;
      if (Math.random() > effect.chance * this.activeTier.chanceScale) return;
      if (consumedCost + (effect.cost || 1) > maxCost) return;

      try {
        effect.apply(context);
        consumedCost += effect.cost || 1;
        frameBalance += effect.balance || 0;
      } catch (error) {
        console.warn(`Glitch effect failed: ${effect.id}`, error);
      }
    });

    this.brightnessTrend = Math.max(-2, Math.min(2, this.brightnessTrend * 0.86 + frameBalance * 0.22));

    this.localGlitch.apply(context);
    this.applyPaletteStabilization(context);

    this.surface.putFrame(frame.region);
    this.isProcessing = false;

    if (this.pendingTrigger) {
      const queued = this.pendingTrigger;
      this.pendingTrigger = null;
      this.queueTrigger(queued.type, queued.meta);
    }
  }

  registerEffect(effectDefinition) {
    this.registry.register(effectDefinition);
  }

  unregisterEffect(effectId) {
    this.registry.unregister(effectId);
  }

  setPipelines(pipelines) {
    this.pipelines.setPipelines(pipelines);
  }

  setQualityTier(tierLabel) {
    this.autoTiering = false;
    this.activeTier = QUALITY_TIERS[tierLabel] || this.activeTier;
  }

  setAutoTiering(enabled) {
    this.autoTiering = !!enabled;
    if (this.autoTiering) {
      this.activeTier = this.computeTier();
    }
  }

  setGlitchThrottle(ms) {
    if (!Number.isFinite(ms)) return;
    this.glitchThrottle = Math.max(8, Math.floor(ms));
  }

  setEffectCooldown(effectType, ms) {
    if (!effectType || !Number.isFinite(ms)) return;
    this.effectCooldowns[effectType] = Math.max(0, Math.floor(ms));
  }

  setMouseLocalRadius(radiusMultiplier) {
    this.localGlitch.setRadiusMultiplier(radiusMultiplier);
  }

  setMouseLocalCooldown(ms) {
    this.localGlitch.setCooldown(ms);
  }

  setMouseLocalBudget(multiplier) {
    this.localGlitch.setBudgetMultiplier(multiplier);
  }

  setMouseLocalIntensity(multiplier) {
    this.localGlitch.setIntensityMultiplier(multiplier);
  }

  setMouseLocalEnabled(enabled) {
    this.localGlitch.setEnabled(enabled);
  }

  setFidelityStrength(value) {
    if (!Number.isFinite(value)) return;
    this.fidelityStrength = Math.max(0, Math.min(1, value));
  }

  setAggressiveVariation(enabled) {
    this.aggressiveVariation = !!enabled;
  }

  applyPaletteStabilization(context) {
    const source = context.pristineSource || context.source;
    if (!source) return;

    const { data, width, height } = context;
    const probeStride = 32;
    let totalDrift = 0;
    let samples = 0;

    for (let y = 0; y < height; y += probeStride) {
      for (let x = 0; x < width; x += probeStride) {
        const idx = (y * width + x) * 4;
        totalDrift += Math.abs(data[idx] - source[idx]);
        totalDrift += Math.abs(data[idx + 1] - source[idx + 1]);
        totalDrift += Math.abs(data[idx + 2] - source[idx + 2]);
        samples += 3;
      }
    }

    if (!samples) return;
    const drift = totalDrift / samples;
    this.lastDriftMetric = drift;

    const threshold = 24;
    if (drift < threshold || this.fidelityStrength <= 0) return;

    const tier = context.quality?.label || 'balanced';
    const tierScale = tier === 'low' ? 0.95 : tier === 'high' ? 0.82 : 0.88;
    const severity = Math.min(1, (drift - threshold) / 70);
    const blend = Math.min(0.36, (0.08 + severity * 0.26) * this.fidelityStrength * tierScale);

    const step = drift > 62 ? 2 : 3;
    const xPhase = Math.floor(Math.random() * step);
    const yPhase = Math.floor(Math.random() * step);

    for (let y = yPhase; y < height; y += step) {
      for (let x = xPhase; x < width; x += step) {
        const idx = (y * width + x) * 4;
        data[idx] = Math.floor(data[idx] * (1 - blend) + source[idx] * blend);
        data[idx + 1] = Math.floor(data[idx + 1] * (1 - blend) + source[idx + 1] * blend);
        data[idx + 2] = Math.floor(data[idx + 2] * (1 - blend) + source[idx + 2] * blend);
      }
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.isInitialized = false;
    this.pendingTrigger = null;
  }

  getDiagnostics() {
    const sinceLastTrigger = this.lastTriggerContext ? Math.max(0, now() - this.lastTriggerContext.at) : null;
    return {
      preset: this.presetName,
      qualityTier: this.activeTier.label,
      brightnessTrend: this.brightnessTrend,
      autoTiering: this.autoTiering,
      mouseLocal: this.localGlitch.getDiagnostics(),
      fidelityStrength: this.fidelityStrength,
      aggressiveVariation: this.aggressiveVariation,
      lastDriftMetric: this.lastDriftMetric,
      lastTriggerType: this.lastTriggerContext?.triggerType || null,
      millisSinceLastTrigger: sinceLastTrigger,
      registeredEffects: this.registry.list().map((effect) => effect.id),
      isInitialized: this.isInitialized
    };
  }

  getRecentTriggerContext() {
    if (!this.lastTriggerContext) return null;
    return {
      triggerType: this.lastTriggerContext.triggerType,
      meta: this.lastTriggerContext.meta,
      ageMs: Math.max(0, now() - this.lastTriggerContext.at),
      qualityTier: this.activeTier.label,
      brightnessTrend: this.brightnessTrend,
      isInitialized: this.isInitialized
    };
  }
}
