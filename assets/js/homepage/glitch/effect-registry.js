import { weightedPick } from './utils.js';

const BRIGHT_EFFECTS = new Set([
  'edge-crawl',
  'scroll-up-rake',
  'jitter-grid',
  'surge-overdrive',
  'directional-exposure',
  'cut-horizontal-burn',
  'cut-vertical-burn'
]);

const DARK_EFFECTS = new Set([
  'edge-sink',
  'stall-dropout',
  'scroll-down-sink',
  'cut-horizontal-sink',
  'cut-vertical-sink'
]);

const HORIZONTAL_CUT_EFFECTS = new Set([
  'cut-horizontal-burn',
  'cut-horizontal-sink'
]);

const VERTICAL_CUT_EFFECTS = new Set([
  'cut-vertical-burn',
  'cut-vertical-sink'
]);

const HIGH_ENERGY_EFFECTS = new Set([
  'surge-overdrive',
  'whip-burst',
  'impact-fracture',
  'swipe-tear',
  'wave-tear',
  'channel-fracture',
  'edge-shard-jitter'
]);

const STABLE_ANCHOR_EFFECTS = new Set([
  'temporal-echo',
  'per-channel-echo',
  'drift-shear',
  'ambient-flicker',
  'directional-exposure'
]);

export class EffectRegistry {
  constructor() {
    this.effects = new Map();
  }

  register(effect) {
    if (!effect || !effect.id || typeof effect.apply !== 'function') {
      throw new Error('Effect must include id and apply(context)');
    }
    this.effects.set(effect.id, {
      id: effect.id,
      label: effect.label || effect.id,
      cost: effect.cost ?? 1,
      minTier: effect.minTier || 'low',
      chance: effect.chance ?? 1,
      balance: effect.balance ?? 0,
      apply: effect.apply
    });
  }

  unregister(effectId) {
    this.effects.delete(effectId);
  }

  get(effectId) {
    return this.effects.get(effectId) || null;
  }

  has(effectId) {
    return this.effects.has(effectId);
  }

  list() {
    return Array.from(this.effects.values());
  }
}

export class PipelineResolver {
  constructor() {
    this.pipelines = {};
  }

  setPipelines(nextPipelines) {
    this.pipelines = { ...nextPipelines };
  }

  getPipeline(triggerType) {
    return this.pipelines[triggerType] || this.pipelines.move || [];
  }

  resolve(triggerType, maxEffects = 4, options = {}) {
    const sourcePipeline = this.getPipeline(triggerType);
    if (!Array.isArray(sourcePipeline) || sourcePipeline.length === 0) return [];

    const meta = options?.meta || null;
    const balanceTrend = Number.isFinite(options?.balanceTrend) ? options.balanceTrend : 0;
    const motionEnergy = Number.isFinite(meta?.motionEnergy) ? Math.max(0, Math.min(1, meta.motionEnergy)) : null;

    const resolved = [];
    const available = sourcePipeline.slice();

    while (available.length && resolved.length < maxEffects) {
      const weighted = available.map((entry) => {
        let multiplier = 1;

        if (meta?.axis === 'x') {
          if (HORIZONTAL_CUT_EFFECTS.has(entry.id)) multiplier *= 1.4;
          if (VERTICAL_CUT_EFFECTS.has(entry.id)) multiplier *= 0.8;
          if (meta.direction === -1) {
            if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= 1.3;
            if (DARK_EFFECTS.has(entry.id)) multiplier *= 0.78;
          }
          if (meta.direction === 1) {
            if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= 0.78;
            if (DARK_EFFECTS.has(entry.id)) multiplier *= 1.3;
          }
        }

        if (meta?.axis === 'y') {
          if (VERTICAL_CUT_EFFECTS.has(entry.id)) multiplier *= 1.4;
          if (HORIZONTAL_CUT_EFFECTS.has(entry.id)) multiplier *= 0.8;
          if (meta.direction === -1) {
            if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= 1.2;
            if (DARK_EFFECTS.has(entry.id)) multiplier *= 0.86;
          }
          if (meta.direction === 1) {
            if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= 0.86;
            if (DARK_EFFECTS.has(entry.id)) multiplier *= 1.2;
          }
        }

        if (balanceTrend > 0) {
          if (DARK_EFFECTS.has(entry.id)) multiplier *= 1 + Math.min(0.7, balanceTrend * 0.9);
          if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= Math.max(0.45, 1 - Math.min(0.65, balanceTrend * 0.75));
        } else if (balanceTrend < 0) {
          const darkTrend = Math.abs(balanceTrend);
          if (BRIGHT_EFFECTS.has(entry.id)) multiplier *= 1 + Math.min(0.7, darkTrend * 0.9);
          if (DARK_EFFECTS.has(entry.id)) multiplier *= Math.max(0.45, 1 - Math.min(0.65, darkTrend * 0.75));
        }

        if (motionEnergy !== null) {
          if (HIGH_ENERGY_EFFECTS.has(entry.id)) {
            multiplier *= 0.7 + motionEnergy * 1.3;
          }
          if (STABLE_ANCHOR_EFFECTS.has(entry.id)) {
            multiplier *= 1.2 - motionEnergy * 0.35;
          }
        }

        const adjustedWeight = Math.max(0.01, (entry.weight || 0) * multiplier);
        return { ...entry, weight: adjustedWeight };
      });

      const pick = weightedPick(weighted);
      if (!pick) break;
      resolved.push(pick.id);
      const index = available.findIndex((entry) => entry.id === pick.id);
      if (index >= 0) available.splice(index, 1);
      if (Math.random() < 0.38) break;
    }

    return resolved;
  }
}
