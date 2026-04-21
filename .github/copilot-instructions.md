# 420360 Copilot Instructions

## Build, test, and local run commands

This repository is a static site with no root package manager or lint setup.

### Serve locally

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

Alternative:

```bash
npx http-server -p 8080
```

### Refresh generated movie-review data

```bash
node tools/fetch-letterboxd-reviews.mjs
```

This rewrites `assets/data/movie-reviews.json`.

### Run the existing automated tests

The only verified test suite in the repo is the casino simulator harness:

```bash
cd games/classic-games/casino && npm test
```

Equivalent direct invocation:

```bash
cd games/classic-games/casino && node tests/run-tests.js
```

There is no dedicated single-test runner wired into this repo today; the existing harness lives in `games/classic-games/casino/tests/run-tests.js`.

### Build the Shared Pixel Board bundle

```bash
cd games/shared-pixel-board && bash build.sh
```

`build.sh` is present but not executable, so use `bash build.sh` instead of `./build.sh`.

There is no verified repo-wide lint command at the moment.

### Copilot cloud-agent browser automation

Playwright MCP is configured for Copilot cloud-agent sessions through `.github/workflows/copilot-setup-steps.yml`. Future cloud sessions should have Node 20, `@playwright/mcp`, and Chromium browser dependencies available without ad-hoc setup.

## High-level architecture

- `index.html` is the landing page shell. It loads `assets/js/homepage.js`, which is the main orchestrator for the modular homepage systems under `assets/js/homepage/`.
- The homepage modules split responsibility across age-gate flow, popup spawning, overlay windows, taskbar/start menu, audio, visual effects, and addon bootstrapping. Keep `assets/js/homepage.js` as the wiring layer and make behavior-preserving changes in the leaf modules when possible.
- The homepage opens most site content inside draggable iframe overlays created by `assets/js/homepage/overlay-system.js`. Nested pages such as `games/index.html` are written to work both standalone and inside those overlays.
- Overlay pages communicate back to the homepage with `window.parent.postMessage(...)`. The games index uses this to request `open-game` and `close-overlay`, so changes to embedded pages need to preserve that message contract.
- Homepage community features are lazy-loaded Firebase Realtime Database addons. `assets/js/homepage/addons/index.js` wires the panel, news ticker, shoutbox, and collective decisions after boot; `assets/js/homepage/addons/rtdb.js` creates a named Firebase app (`homepage-addons`) so it does not collide with the pixel-board Firebase app.
- `movie-reviews/` is a generated-data flow, not a hand-maintained page. `movie-reviews/main.js` fetches `/assets/data/movie-reviews.json`, while `tools/fetch-letterboxd-reviews.mjs` rebuilds that JSON from Letterboxd RSS and `.github/workflows/letterboxd-sync.yml` commits refreshed data on a schedule.
- `games/shared-pixel-board/` is the most application-like subproject. Its runtime source lives in `src/` with `app.js` wiring `core/`, `tools/`, `ui/`, and `utils/`, and it syncs board state through Firebase Realtime Database rules.
- GitHub Pages deployment is workflow-driven and currently configured in both `.github/workflows/static.yml` and `.github/workflows/deploy-pages.yml`; inspect both before changing deployment behavior.
- Copilot cloud-agent setup is separate from the site workflows. `.github/workflows/copilot-setup-steps.yml` prepares Playwright MCP for browser-driven investigation of the static pages.

## Key conventions

- Prefer plain HTML/CSS/JS and self-contained folders over introducing framework/tooling. The repo-level README explicitly treats this as a zero-build static site, and most sections follow that pattern.
- When adding a game, wire it into the games directory metadata rather than only creating files. The root README documents `games/index.html` metadata as the source of truth for surfacing games.
- Persist per-page preferences and progress in `localStorage`, and use unique keys for new games/features. This is how the games directory surfaces saved progress and how homepage micro-settings/session state are restored.
- Be careful with path style because pages run both directly and inside iframe overlays. Root pages often use root-relative fetches like `/assets/data/movie-reviews.json`, while nested pages use `../` or `../../` asset paths.
- Preserve the embedded-page messaging pattern. If a page is meant to open content in the homepage shell, prefer `window.parent.postMessage({ type: ... })` over directly navigating away.
- Firebase data contracts are strict and shared with security rules. Pixel coordinates are stored as `x_y` keys, colors are uppercase `#RRGGBB`, anonymous presence IDs use the `anon_<...>` shape, and shoutbox messages are sanitized and capped at 280 characters.
- For homepage Firebase work, reuse the existing named app from `assets/js/homepage/addons/rtdb.js` instead of initializing another default app. The pixel board already has its own Firebase initialization path.
- Some subproject docs are ahead of or behind the checked-in code. Prefer the current files and validated commands over README claims when they disagree.
