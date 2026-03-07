# Autonomy Flux

Autonomy Flux is a static generative art website built with plain HTML/CSS/JS and p5.js.
It is designed for GitHub Pages and explores a post-postmodern visual language where
collective motion can produce turbulence, but the system gradually returns to coherence.

## Features

- Continuous generative simulation with live mouse and touch influence
- Deterministic seed system via URL query (`?seed=123456`)
- Controls for seed navigation, pause/resume, reset, and PNG export
- Reduced-motion toggle for lower animation intensity and gentler visuals
- Short manifesto panel that frames the post-postmodern anti-escalation intent
- Responsive layout for desktop and mobile
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
- The same seed recreates the same baseline field and particle initialization.
- Interactive pointer movement changes the evolving state in real time by design.

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
- Tune interaction and flow constants in `script.js`:
  - `PARTICLE_COUNT`
  - flow coefficients in `getFlowVector`
  - damping and slider ranges
- Modify statement copy in `index.html`.

## File overview

- `index.html`: layout, narrative text, controls, script includes
- `style.css`: visual direction and responsive behavior
- `script.js`: p5 sketch, seed system, interaction logic
- `.github/workflows/pages.yml`: optional automated Pages deploy
