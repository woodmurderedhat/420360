import { DEFAULT_IMAGE_URL } from './constants.js';
import { PixelGlitchEngineV2 } from './engine.js';

export function bootGlobalGlitchFramework(options = {}) {
  const canvasId = options.canvasId || 'glitch-bg';
  const imageUrl = options.imageUrl || DEFAULT_IMAGE_URL;
  const preset = options.preset || 'cinematic';

  if (window.glitchEngineV2) return window.glitchEngineV2;

  const engine = new PixelGlitchEngineV2({ canvasId, imageUrl, preset });
  window.glitchEngineV2 = engine;

  // Legacy bridge for current homepage integrations.
  window.glitchEngine = {
    start: () => engine.start(),
    destroy: () => engine.destroy(),
    triggerMove: (meta) => engine.triggerMove(meta),
    applyGlitch: () => engine.applyGlitch(),
    triggerScrollUp: () => engine.triggerScrollUp(),
    triggerScrollDown: () => engine.triggerScrollDown(),
    triggerClickTear: () => engine.triggerClickTear(),
    trigger: (effectType, meta) => engine.trigger(effectType, meta),
    setPreset: (name) => engine.setPreset(name),
    setQualityTier: (tier) => engine.setQualityTier(tier),
    setAutoTiering: (enabled) => engine.setAutoTiering(enabled),
    setGlitchThrottle: (ms) => engine.setGlitchThrottle(ms),
    setEffectCooldown: (effectType, ms) => engine.setEffectCooldown(effectType, ms),
    setMouseLocalRadius: (multiplier) => engine.setMouseLocalRadius(multiplier),
    setMouseLocalCooldown: (ms) => engine.setMouseLocalCooldown(ms),
    setMouseLocalBudget: (multiplier) => engine.setMouseLocalBudget(multiplier),
    setMouseLocalIntensity: (multiplier) => engine.setMouseLocalIntensity(multiplier),
    setMouseLocalEnabled: (enabled) => engine.setMouseLocalEnabled(enabled),
    setFidelityStrength: (value) => engine.setFidelityStrength(value),
    setAggressiveVariation: (enabled) => engine.setAggressiveVariation(enabled),
    registerEffect: (def) => engine.registerEffect(def),
    unregisterEffect: (id) => engine.unregisterEffect(id),
    getDiagnostics: () => engine.getDiagnostics()
  };

  engine.start();
  return engine;
}

export function setupDeferredBoot(options = {}) {
  const firstInteractionEvents = ['mousemove', 'touchstart', 'keydown', 'wheel'];
  const interactionOptions = { passive: true, once: true };

  const onFirstInteraction = () => {
    firstInteractionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, onFirstInteraction, interactionOptions);
    });
    bootGlobalGlitchFramework(options);
  };

  firstInteractionEvents.forEach((eventName) => {
    window.addEventListener(eventName, onFirstInteraction, interactionOptions);
  });

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => bootGlobalGlitchFramework(options), { timeout: 2500 });
    return;
  }
  setTimeout(() => bootGlobalGlitchFramework(options), 2500);
}
