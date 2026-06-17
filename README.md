# dodge-the-rocket
Dodge the Rocket is a fast-paced browser game where you control a spacecraft using your mouse to evade a barrage of rockets launched from the ground. Your mission: survive as long as possible without getting hit! Built with HTML, CSS, and JavaScript, this game combines simple mechanics with addictive gameplay.

## Running locally

No build step or dependencies required. Clone the repo and open `index.html` directly in a browser, or serve it with any static file server to avoid browser restrictions on local file access:

```bash
npx serve .
# or
python -m http.server
```

Then open `http://localhost:3000` (serve) or `http://localhost:8000` (Python) in your browser.

## Project structure

```
index.html            # HTML shell, all CSS, and the main game script
ui/rocket-launcher.js # Rocket, Collectible, and RocketLauncher classes
assets/
  images/rockets/     # Kenney.nl sprite sheets
  music/sci-fi/       # MP3 background tracks (Eric Matyas, soundimage.org)
credits.html          # Attribution page (legally required — do not remove)
```

## Contributing

1. Fork the repo and create a branch from `main`.
2. Make your changes — the game is entirely static HTML/JS/CSS with no build tooling.
3. Test by opening `index.html` in a browser (or via a local server as above). There is no automated test suite, so manually verify the affected gameplay paths.
4. Open a pull request against `main`. Merging to `main` automatically deploys to GitHub Pages via the Actions workflow in `.github/workflows/deploy.yml`.

### Key architectural notes

- Game state lives in the `window.onload` closure inside `index.html`; boss logic (`startBoss`, `startSunBoss`, etc.) is also inline there.
- `ui/rocket-launcher.js` is loaded as a plain `<script src>` before the inline script — no modules or bundler.
- Collision detection runs in a `requestAnimationFrame` loop; rocket/collectible elements are animated purely by CSS keyframes.
- Attribution for music (Eric Matyas) and sprites (Kenney.nl) is a condition of free use and **must not be removed** from `credits.html`.

