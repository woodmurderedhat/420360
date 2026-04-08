import * as pixelOps from './pixel-ops.js';
import { MOUSE_LOCAL_DEFAULTS, MOUSE_LOCAL_TIER_PARAMS } from './constants.js';
import { clamp, now, randInt } from './utils.js';

const MOVE_TRIGGER_PREFIX = 'move';

function fallbackColorShiftLocalRegion(
  { data, source, width, height },
  centerX,
  centerY,
  radius,
  {
    maxShift = 4,
    intensity = 1,
    pixelBudget = Number.POSITIVE_INFINITY
  } = {}
) {
  const cx = clamp(Math.floor(centerX), 0, width - 1);
  const cy = clamp(Math.floor(centerY), 0, height - 1);
  const r = Math.max(4, Math.floor(radius));
  const rSq = r * r;
  const minX = Math.max(0, cx - r);
  const maxX = Math.min(width - 1, cx + r);
  const minY = Math.max(0, cy - r);
  const maxY = Math.min(height - 1, cy + r);
  let processed = 0;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (processed >= pixelBudget) return processed;

      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq > rSq) continue;

      const falloff = 1 - distSq / rSq;
      if (Math.random() > 0.32 + falloff * 0.62 * intensity) continue;

      const shift = Math.max(1, Math.floor(maxShift * (0.6 + falloff)));
      const sx = clamp(x + randInt(-shift, shift), 0, width - 1);
      const sy = clamp(y + randInt(-shift, shift), 0, height - 1);
      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (y * width + x) * 4;

      const restoreBlend = 0.3 + 0.45 * falloff;
      data[dstIdx] = clamp(
        Math.floor(data[srcIdx] * (1 - restoreBlend) + source[dstIdx] * restoreBlend) + randInt(-8, 10),
        0,
        255
      );
      data[dstIdx + 1] = clamp(
        Math.floor(data[srcIdx + 1] * (1 - restoreBlend) + source[dstIdx + 1] * restoreBlend) + randInt(-8, 10),
        0,
        255
      );
      data[dstIdx + 2] = clamp(
        Math.floor(data[srcIdx + 2] * (1 - restoreBlend) + source[dstIdx + 2] * restoreBlend) + randInt(-8, 10),
        0,
        255
      );
      data[dstIdx + 3] = 255;
      processed += 1;
    }
  }

  return processed;
}

function fallbackCascadingPixelSmear(
  context,
  centerX,
  centerY,
  baseRadius,
  {
    cascadeCount = 3,
    intensity = 1,
    pixelBudget = Number.POSITIVE_INFINITY
  } = {}
) {
  let processed = 0;
  const cascades = Math.max(1, Math.floor(cascadeCount));

  for (let pass = 0; pass < cascades; pass += 1) {
    if (processed >= pixelBudget) break;
    const radius = Math.max(6, Math.floor(baseRadius * Math.pow(0.72, pass)));
    const remaining = pixelBudget - processed;
    const passBudget = Math.max(1, Math.floor(remaining / (cascades - pass)));
    processed += fallbackColorShiftLocalRegion(
      context,
      centerX + randInt(-3 - pass, 3 + pass),
      centerY + randInt(-3 - pass, 3 + pass),
      radius,
      {
        maxShift: Math.max(2, Math.floor(2 + pass * 1.4 * intensity)),
        intensity: intensity * Math.pow(0.78, pass),
        pixelBudget: passBudget
      }
    );
  }

  return processed;
}

const colorShiftLocalRegion = pixelOps.colorShiftLocalRegion || fallbackColorShiftLocalRegion;
const cascadingPixelSmear = pixelOps.cascadingPixelSmear || fallbackCascadingPixelSmear;

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
    const pristineSource = context.pristineSource || context.source;
    const sourceContext = pristineSource === context.source
      ? context
      : { ...context, source: pristineSource };

    colorShiftLocalRegion(sourceContext, cx, cy, radius, {
      maxShift: Math.max(2, Math.floor(3 + intensity * 2.1)),
      intensity,
      pixelBudget: colorBudget,
      useSource: true
    });

    cascadingPixelSmear(sourceContext, cx, cy, Math.floor(radius * 1.08), {
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
