import { CanvasSurface } from './canvas-surface.js';
import { EFFECT_COOLDOWNS, PIPELINE_PRESETS, QUALITY_TIERS, TIER_ORDER } from './constants.js';
import { registerDefaultEffects } from './effects.js';
import { EffectRegistry, PipelineResolver } from './effect-registry.js';
import { MotionAnalyzer } from './motion-analyzer.js';
import { now } from './utils.js';

function tierIndex(label) {
  return Math.max(0, TIER_ORDER.indexOf(label));
}

export class PixelGlitchEngineV2 {
  constructor({ canvasId, imageUrl, preset = 'cinematic' }) {
    this.surface = new CanvasSurface(canvasId, imageUrl);
    this.motion = new MotionAnalyzer();
    this.registry = new EffectRegistry();
    this.pipelines = new PipelineResolver();

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
    this.activeTier = this.computeTier();
    this.autoTiering = true;
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  setPreset(presetName) {
    const preset = PIPELINE_PRESETS[presetName] || PIPELINE_PRESETS.cinematic;
    this.presetName = PIPELINE_PRESETS[presetName] ? presetName : 'cinematic';
    this.pipelines.setPipelines(preset);
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
      await this.surface.loadImage();
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
      mouse: { x: this.mouseX, y: this.mouseY }
    };

    const pipeline = this.pipelines.resolve(triggerType, this.activeTier.maxEffects);
    const tierFloor = tierIndex(this.activeTier.label);
    let consumedCost = 0;
    const maxCost = this.activeTier.maxCost ?? Number.POSITIVE_INFINITY;

    pipeline.forEach((effectId) => {
      const effect = this.registry.get(effectId);
      if (!effect) return;

      if (tierFloor < tierIndex(effect.minTier || 'low')) return;
      if (Math.random() > effect.chance * this.activeTier.chanceScale) return;
      if (consumedCost + (effect.cost || 1) > maxCost) return;

      try {
        effect.apply(context);
        consumedCost += effect.cost || 1;
      } catch (error) {
        console.warn(`Glitch effect failed: ${effect.id}`, error);
      }
    });

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

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.isInitialized = false;
    this.pendingTrigger = null;
  }

  getDiagnostics() {
    return {
      preset: this.presetName,
      qualityTier: this.activeTier.label,
      autoTiering: this.autoTiering,
      registeredEffects: this.registry.list().map((effect) => effect.id),
      isInitialized: this.isInitialized
    };
  }
}
