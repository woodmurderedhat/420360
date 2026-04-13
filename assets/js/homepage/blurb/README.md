# Homepage Blurb Module

This folder contains the modular blurb subsystem used by the homepage hero text stream.

## Files

- `system.js`: orchestrator and lifecycle (`start`, `stop`, `pause`, `resume`, `setSentencePool`).
- `renderer.js`: DOM-only rendering concerns for the `#blurb` mount element.
- `sentence-source.js`: sentence pool sanitization and source management.
- `glitch-service.js`: glitch behaviors (`glitchRandomWord`, `fullGlitch`, random string generator).

## Integration Contract

Use `createBlurbSystem({ state, config, sentencePool, getSentencesFallback, hooks })` and consume:

- `start()`
- `streamNextWord()`
- `glitchRandomWord()`
- `setSentencePool(pool)`

## Extension Points

Use `hooks` to extend behavior without modifying core internals:

- `onInit({ sentencePool })`
- `onPause()`
- `onResume()`
- `onStop()`
- `onDestroy()`
- `onWordStream({ sentenceIndex, wordIndex, currentSentence })`
- `onFullGlitch()`
- `onSentencePoolChange({ sentencePool })`
- `onWarning({ message, details })`

## Notes

- The active homepage wiring now injects the blurb API into interval management and addons.
