# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

This is a static HTML/JS/CSS project with no build step and no dependencies. Open `index.html` directly in a browser, or serve it with any static file server:

```
npx serve .
python -m http.server
```

Deployment is automatic: every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which publishes the repo root to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

## Architecture

The game is split across two files:

- **`index.html`** — everything except the core game objects: all CSS, the HTML shell, and a large inline `<script>` block that owns game state and flow.
- **`ui/rocket-launcher.js`** — three classes (`Rocket`, `Collectible`, `RocketLauncher`) loaded as a `<script src>` before the inline script.

### Game state (inside `index.html`)

The inline script is a single `window.onload` closure. Key globals/state variables:

| Variable | Purpose |
|---|---|
| `gameActive` / `gamePaused` | Top-level flow guards checked everywhere |
| `currentMission` / `currentGalaxy` | 1-based indices into `galaxyThemes` |
| `selectedDifficulty` | `'easy'`\|`'medium'`\|`'hard'` — drives `window.rocketSpeedMultiplier` |
| `isInvincible` / `invincibilityTimeLeft` | Forcefield state; stacks on re-collection |
| `missionDuration` | Seconds for the current level, looked up from `galaxyThemes` |
| `pausedTime` / `pauseStartTime` | Accumulated pause offset so the timer stays accurate |

### Level / galaxy data

All level definitions live in the `galaxyThemes` array inside `index.html`. There are 2 galaxies × 5 missions each (10 total). Each entry has `name`, `duration` (seconds), and theming colors. The mission name drives special-case behaviour:
- `"Supernova Mission"` — no standard rockets; launches the boss star (`startBoss`)
- `"Sunset Mission"` — no standard rockets; launches the sun boss (`startSunBoss`) with a UV-beam health-drain mechanic

Persistence uses `localStorage` keys: `dtr_highestUnlockedLevel` and `dtr_highestAttemptedLevel_<difficulty>`.

### Object lifecycle (`ui/rocket-launcher.js`)

`Rocket` and `Collectible` are DOM elements (`.rocket` / `.collectible`) animated purely by CSS keyframes (`launch1` / `collectibleLaunch`) via a `--duration` CSS variable. Collision detection runs per-frame via a `requestAnimationFrame` loop in the main script that calls `rocketLauncher.checkAllCollisions()`. The collision radius for rockets is 26 px (line 86 of rocket-launcher.js); collectibles use 25 px.

`window.rocketSpeedMultiplier` is set by the main script before constructing a `Rocket`; the class reads it to scale the CSS animation duration.

### Boss fights

Both bosses are implemented entirely in the inline script in `index.html`. They expose themselves on `window` (`startBoss`, `stopBoss`, `startSunBoss`, `stopSunBoss`) so the main game loop can call them. The bosses use `requestAnimationFrame` for movement and spawn their own projectile DOM elements (`.boss-rocket`, `.sun-fireball`, `.boss-asteroid`, etc.).

The sun boss introduces `window.shipX` / `window.shipY` — a lerped position used when the UV beam is active, which causes the player ship to drift instead of snapping to the mouse.

### Mouse trail / canvas

A `<canvas id="mouseTrailCanvas">` sits over the play area. Its rendering is handled inside the inline script. `window.currentMousePosition` is the canvas-relative cursor position read by both collision detection and rocket targeting logic.

### Audio

Background music uses 20 real MP3 tracks stored in `assets/music/sci-fi/` (by Eric Matyas, soundimage.org). `startSpaceMusic` / `stopSpaceMusic` are exposed on `window` and drive playback. Explosion and celebration sounds are still generated programmatically via the Web Audio API (`AudioContext`) with no additional file dependencies.

### Credits

`credits.html` is a standalone page that lists legally required attributions for all third-party assets:
- **Music & sound effects** — Eric Matyas (soundimage.org); attribution is a condition of free use and must not be removed.
- **Rocket/missile sprites** — Kenney.nl "Space Shooter Redux" pack (`assets/images/rockets/`).
