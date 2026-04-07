# Pixel Glitch Framework

Modular glitch system for the homepage background canvas.

## Architecture

- `engine.js`: runtime orchestrator, scheduling, adaptive quality, trigger processing
- `bridge.js`: global compatibility bridge (`window.glitchEngine`) and deferred boot
- `motion-analyzer.js`: movement classification into motion profiles
- `effect-registry.js`: effect registration and weighted pipeline resolution
- `effects.js`: default effect pack built from primitive operations
- `pixel-ops.js`: reusable low-level pixel transforms
- `canvas-surface.js`: canvas and image lifecycle
- `constants.js`: presets, cooldowns, quality tiers

## Legacy Compatibility

The bridge preserves these methods:

- `triggerScrollUp()`
- `triggerScrollDown()`
- `triggerClickTear()`
- `triggerMove(meta?)`
- `applyGlitch()`

## Extended Controls

- `setPreset('cinematic' | 'chaotic' | 'subtle' | 'mobileSafe')`
- `setQualityTier('low' | 'balanced' | 'high')`
- `setAutoTiering(boolean)`
- `setGlitchThrottle(ms)`
- `setEffectCooldown(triggerType, ms)`
- `registerEffect(effectDef)`
- `unregisterEffect(effectId)`
- `getDiagnostics()`

## Registering Custom Effects

```js
window.glitchEngine.registerEffect({
  id: 'my-custom-effect',
  label: 'My Custom Effect',
  cost: 1,
  minTier: 'low',
  chance: 1,
  apply(ctx) {
    // mutate ctx.data using ctx.source / width / height
  }
});
```

## Trigger Pipelines

Pipelines are weighted lists per trigger family in `constants.js` presets:

- `move`, `moveSwipe`, `moveWhip`, `moveJitter`, `moveSurge`, `moveStall`
- `click`, `scrollUp`, `scrollDown`, `ambient`

The engine resolves weighted candidates and applies them under per-tier cost budgets.
