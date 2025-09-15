# 420360 — Retro Web Arcade

![420360 banner](assets/images/420360arcadebanner.png)

420360 is a lightweight, 90s-inspired web arcade: a collection of small games, glitch art, and experiments you can open in the browser. The landing page features glitchy popups, integrated overlays (About, Games index, Oracle), and a curated directory of games.

Live site: https://420360.xyz/

## What’s inside

- Games directory with classics and experiments:
	- Arcade/retro: Pong, Snake, Breakout, Space Invaders, Asteroids, Flappy Bird, Infinite Jumper
	- Puzzle/memory: Neon Simon, Memory Cards, Pixel Crush
	- Experimental: Tarot Tetromino (arcana-fused falling blocks), Glitch Maze, Generative Art, TIM • The Dialogue Oracle, Noctis Reverie
- Integrated overlays from the landing page for a seamless “windowed” feel (About, Games, Oracle)
- Local scores/progress via `localStorage` surfaced in the Games index
- Toggleable music and SFX with a tiny glitch animation
- Zero build tooling — vanilla HTML/CSS/JS

Keyboard shortcuts on the landing page:
- `A` About • `G` Games index • `O` Oracle • `B` Board (if present) • `Esc` close overlays
- `M` toggle music • `S` toggle SFX • `I` open Issues link

## Repository structure (high level)

- `index.html` — main landing page with overlays, popups, music/SFX controls
- `about/` — About page and small utilities
- `games/` — individual games and the arcade directory (`games/index.html`)
- `assets/` — images, music, and sound effects used across the site
- `testpages/` — one-off style tests and retro HTML experiments
- `null-vesper/`, `shadow-protocol/` — narrative/visual experiments
- `context.txt` — project overview/context for maintainers
- `devlog.txt` — development notes and change log (e.g., Tarot Tetromino updates)

## Run locally

Option 1 — open directly:
- Double-click `index.html` to open it in your browser. Most features work; some browsers may require an initial click to enable audio.

Option 2 — serve over HTTP (recommended for iframes/assets):

Using Python (Windows cmd):
```cmd
python -m http.server 8080
```
Then open http://localhost:8080/

Using Node (no install, via npx):
```cmd
npx http-server -p 8080
```

Open the arcade directory at `games/index.html`, or launch the landing page at `/index.html` and use `G` to open the Games overlay.

## Adding or updating a game

1) Create a new folder under `games/<your-game>/` with an `index.html` (and any assets in a nested `assets/` if needed).
2) Add your game metadata to the `GAMES` array in `games/index.html` (id, name, url, tags, blurb, optional score key/type).
3) If your game saves progress/scores, store them in `localStorage` under a unique key so the directory can surface “Best” info.

## Tech notes

- No frameworks or bundlers; everything ships as static files.
- Overlays are implemented as draggable, styled containers with an `<iframe>` inside; known external sites (e.g., YouTube) open in a new tab for CSP/X-Frame-Options reasons.
- Scores/progress shown in the Games index are read from `localStorage`; if nothing is stored yet, you’ll see “No scores yet.”

## Known quirks

- Browsers may block autoplay — press any key/click to enable audio.
- Some external content won’t embed in an overlay due to CSP; these links open in a new tab instead.

## Contributing

Issues and small PRs are welcome. Keep additions self‑contained and light on dependencies. When contributing games:
- Prefer plain HTML/CSS/JS
- Keep assets small and optimized
- Use unique `localStorage` keys
- Update `games/index.html` metadata so the game appears in the directory

## License / assets

This repository includes both code and creative assets. Unless a file or folder explicitly states otherwise, all rights are reserved by the project owner. Do not redistribute third‑party assets without permission.

