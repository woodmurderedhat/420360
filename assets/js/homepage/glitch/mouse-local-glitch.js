import { cascadingPixelSmear, colorShiftLocalRegion } from './pixel-ops.js';
import { MOUSE_LOCAL_DEFAULTS, MOUSE_LOCAL_TIER_PARAMS } from './constants.js';
import { clamp, now } from './utils.js';

const MOVE_TRIGGER_PREFIX = 'move';

function isMoveTrigger(triggerType) {
  return typeof triggerType === 'string' && triggerType.startsWith(MOVE_TRIGGER_PREFIX);
}

export class MouseLocalGlitch {
  constructor(options = {}) {
    this.enabled = options.enabled ?? MOUSE_LOCAL_DEFAULTS.enabled;
    this.cooldownMs = Number.isFinite(options.cooldownMs)
      ? Math.max(MOUSE_LOCAL_DEFAULTS.minCooldownMs, Math.floor(options.cooldownMs))
      : MOUSE_LOCAL_DEFAULTS.cooldownMs;
    this.radiusMultiplier = Number.isFinite(options.radiusMultiplier)
      ? Math.max(MOUSE_LOCAL_DEFAULTS.minRadiusMultiplier, options.radiusMultiplier)
      : MOUSE_LOCAL_DEFAULTS.radiusMultiplier;
    this.intensityMultiplier = Number.isFinite(options.intensityMultiplier)
      ? Math.max(MOUSE_LOCAL_DEFAULTS.minIntensityMultiplier, options.intensityMultiplier)
      : MOUSE_LOCAL_DEFAULTS.intensityMultiplier;
    this.budgetMultiplier = Number.isFinite(options.budgetMultiplier)
      ? Math.max(MOUSE_LOCAL_DEFAULTS.minBudgetMultiplier, options.budgetMultiplier)
      : MOUSE_LOCAL_DEFAULTS.budgetMultiplier;
    this.lastApplyAt = 0;
  }

  setRadiusMultiplier(multiplier) {
    if (!Number.isFinite(multiplier)) return;
    this.radiusMultiplier = Math.max(MOUSE_LOCAL_DEFAULTS.minRadiusMultiplier, multiplier);
  }

  setCooldown(ms) {
    if (!Number.isFinite(ms)) return;
    this.cooldownMs = Math.max(MOUSE_LOCAL_DEFAULTS.minCooldownMs, Math.floor(ms));
  }

  setBudgetMultiplier(multiplier) {
    if (!Number.isFinite(multiplier)) return;
    this.budgetMultiplier = Math.max(MOUSE_LOCAL_DEFAULTS.minBudgetMultiplier, multiplier);
  }

  setIntensityMultiplier(multiplier) {
    if (!Number.isFinite(multiplier)) return;
    this.intensityMultiplier = Math.max(MOUSE_LOCAL_DEFAULTS.minIntensityMultiplier, multiplier);
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  apply(context) {
    if (!this.enabled) return false;
    if (!isMoveTrigger(context.triggerType)) return false;

    const currentTime = now();
    if (currentTime - this.lastApplyAt < this.cooldownMs) return false;

    const { width, height, quality, mouse, meta } = context;
    if (!width || !height || !mouse) return false;

    const tier = MOUSE_LOCAL_TIER_PARAMS[quality?.label] || MOUSE_LOCAL_TIER_PARAMS.balanced;
    const cx = clamp(Math.floor(mouse.x), 0, width - 1);
    const cy = clamp(Math.floor(mouse.y), 0, height - 1);

    const speedBoost = Number.isFinite(meta?.speed)
      ? Math.min(1.45, 0.92 + meta.speed / 1600)
      : 1;
    const intensity = tier.intensity * this.intensityMultiplier * speedBoost;
    const radius = clamp(Math.floor(tier.radius * this.radiusMultiplier * speedBoost), 20, 260);
    const framePixels = width * height;
    const maxBudget = Math.floor(framePixels * tier.budgetFraction * this.budgetMultiplier);

    if (maxBudget < 40) return false;

    const colorBudget = Math.floor(maxBudget * 0.44);
    const smearBudget = maxBudget - colorBudget;

    colorShiftLocalRegion(context, cx, cy, radius, {
      maxShift: Math.max(2, Math.floor(3 + intensity * 2.1)),
      intensity,
      pixelBudget: colorBudget,
      useSource: false
    });

    cascadingPixelSmear(context, cx, cy, Math.floor(radius * 1.08), {
      cascadeCount: Math.max(2, Math.floor(tier.cascades * (0.9 + intensity * 0.2))),
      intensity,
      pixelBudget: smearBudget
    });

    this.lastApplyAt = currentTime;
    return true;
  }

  getDiagnostics() {
    return {
      enabled: this.enabled,
      cooldownMs: this.cooldownMs,
      radiusMultiplier: this.radiusMultiplier,
      intensityMultiplier: this.intensityMultiplier,
      budgetMultiplier: this.budgetMultiplier,
      lastApplyAt: this.lastApplyAt
    };
  }
}
