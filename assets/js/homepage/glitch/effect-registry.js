import { weightedPick } from './utils.js';

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

  resolve(triggerType, maxEffects = 4) {
    const sourcePipeline = this.getPipeline(triggerType);
    if (!Array.isArray(sourcePipeline) || sourcePipeline.length === 0) return [];

    const resolved = [];
    const available = sourcePipeline.slice();

    while (available.length && resolved.length < maxEffects) {
      const pick = weightedPick(available);
      if (!pick) break;
      resolved.push(pick.id);
      const index = available.findIndex((entry) => entry.id === pick.id);
      if (index >= 0) available.splice(index, 1);
      if (Math.random() < 0.38) break;
    }

    return resolved;
  }
}
