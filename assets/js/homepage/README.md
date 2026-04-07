# Homepage Framework Modules

This folder contains the first extraction slice from the root homepage monolith.

## Current Modules

- `config.js`
  - Exports shared constants and static datasets (`CONFIG`, `ADS`, `ICON_DATA`, `POPUP_COLOR_SCHEMES`).
- `state.js`
  - Exports the shared runtime state object used by homepage systems.
- `storage.js`
  - Exports preference persistence helpers (`loadPreference`, `savePreference`).
- `age-gate.js`
  - Exports age verification and profile persistence helpers.
- `interval-manager.js`
  - Exports a timer lifecycle controller for popup/glitch intervals and burst timers.
- `audio-system.js`
  - Exports music and SFX system factories used by the homepage orchestrator.
- `init-flow.js`
  - Exports startup gate orchestration helpers (currently age-gate access control).
- `popup-system.js`
  - Exports popup rendering, placement, lifecycle, and glitch-out behavior.
- `text-system.js`
  - Exports blurb rendering, progressive reveal, glitch effects, and sentence morphing.

## Wiring

`assets/js/homepage.js` is now the orchestrator script and imports these modules.
The root page loads it as an ES module via `type="module"` in `index.html`.

## Next Extraction Targets

1. `controls/`: split keyboard, wheel, pointer, and postMessage handlers.
2. `overlays/`: move overlay and floating-window systems out of orchestrator.

## Refactor Rule

Keep behavior parity for every extraction step: no UI/UX changes in moduleization passes.
