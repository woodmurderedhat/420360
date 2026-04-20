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
- `calendar-popup-data.js`
  - Exports reusable celebration themes plus ordered calendar rules (fixed dates, ranges, weekday patterns, and month fallbacks) for the homepage popup system.
- `calendar-popup-system.js`
  - Exports the one-shot calendar popup resolver that evaluates rule types, formats date-aware popup copy, and displays the matched celebration during homepage startup.
- `text-system.js`
  - Exports blurb rendering, progressive reveal, glitch effects, and sentence morphing.
- `overlay-system.js`
  - Exports overlays, launchers, and floating-window orchestration.
- `interaction-system.js`
  - Exports event routing and control button wiring (keyboard, pointer, click, message).
- `visual-effects.js`
  - Exports color chaos and control motion systems (including pulse behavior).
- `mode-controls.js`
  - Exports chill/popup mode state transitions and preference hydration.
- `bootstrap.js`
  - Exports startup/bootstrap flow and DOM ready wiring for homepage initialization.
- `actions.js`
  - Exports small homepage actions (video window toggle and issue launcher).

## Wiring

`assets/js/homepage.js` is now the orchestrator script and imports these modules.
The root page loads it as an ES module via `type="module"` in `index.html`.

## Next Extraction Targets

1. Optional: remove remaining minimal utility glue (`escapeHtml`) by moving to a shared utility module.
2. Optional: collapse repeated config wiring with a central dependency container if preferred.

## Creative Activation

- Previously dormant global control-chaos motion is now available as a pulse mode via keyboard shortcut `X`.
- Pulse mode runs briefly and auto-stops, keeping normal UX intact while surfacing a hidden effect.

## Orchestrator Cleanup

- Main file redundancy reduced by removing dead pass-through wrappers after module extraction.
- Main entry now uses module methods directly for intervals, popup cadence checks, and overlay presence checks.
- Interval orchestration now flows through direct `intervalManager` callbacks instead of wrapper functions.

## Refactor Rule

Keep behavior parity for every extraction step: no UI/UX changes in moduleization passes.
