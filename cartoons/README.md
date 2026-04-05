# 3 Body Chaos

A static generative art site built with plain HTML/CSS/JS (no build tooling, no external libraries).
Three gravitating bodies drive a double pendulum that steers five nested epicycles — three chaotic
systems layered into one canvas. Designed for GitHub Pages.

## Features

- Three-layer simulation: n-body gravity + double pendulum + 5-arm epicycles
- Deterministic seed system via URL query (`?seed=123456`) using mulberry32 PRNG
- Seed navigation: prev / next / random + copy-link for exact reproduction
- Pause / resume, reset to seed, PNG export
- Short video export (3s, 5s, or 8s WebM clip)
- Layer toggles: show/hide bodies, pendulum, and epicycles independently
- Physics sliders: gravity (G) and trail fade
- Responsive layout for desktop and mobile (Autonomy Flux shell)
- Click canvas to relocate the shared pendulum/epicycle anchor
- Zero build tooling, static deployment ready

## Run locally

1. Open this folder in VS Code.
2. Start any static server from the repository root.
3. Example commands:

```bash
python -m http.server 8000
# or
npx serve .
```

4. Visit `http://localhost:8000`.

## Seed reproducibility

- Seed is read from `?seed=<value>`.
- Seed controls update the URL automatically.
- The same seed recreates the same body positions, velocities, and pendulum angles at start.
- Collision timing depends on the physics trajectory and is not separately seeded.

## Deploy to GitHub Pages

### Option A: Branch-based Pages (simple)

1. Push this repository to GitHub.
2. In repository settings, open `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`.
5. Save and wait for deployment.

### Option B: Actions-based Pages

A workflow is included at `.github/workflows/pages.yml`.

1. In repository settings, open `Pages`.
2. Set source to `GitHub Actions`.
3. Push to `main`; the workflow deploys automatically.

## Customization

- Edit palette and typography in `style.css`.
- Tune simulation constants in `chaos.js`:
  - `PENDULUM_TRAIL_MAX` / `EPICYCLE_TRAIL_MAX` — trail length
  - `TRAIL_BUCKETS` — rendering batch size (higher = smoother gradients, more draw calls)
  - `EP_RADII` / `EP_SPEEDS` — epicycle arm lengths and rotation speeds
  - `PL1`, `PL2`, `PM1`, `PM2` — pendulum arm lengths and bob masses
- Edit narrative copy in `index.html`.

## File overview

- `index.html`: layout shell, narrative text, controls, links to CSS/JS
- `style.css`: visual direction, responsive grid, Autonomy Flux design tokens
- `chaos.js`: simulation (n-body, double pendulum, epicycles), seed PRNG, controls wiring
- `404.html`: not-found page, shares style.css
- `script.js`: original Autonomy Flux p5.js flow-field sketch (standalone reference)
- `.github/workflows/pages.yml`: optional automated Pages deploy

