# Ocong Run – Endless Runner Game

## Overview
*An HTML5/Phaser 3 endless runner featuring a **Pocong** (Indonesian ghost) that you control by jumping and double‑jumping.*

### Core Features
- **Responsive canvas** – works on desktop and mobile (portrait lock with orientation overlay).
- **Mid‑air double jump** – press SPACE / tap once for a normal jump, a second tap while airborne triggers a 360° spin.
- **Dynamic fireball (obstacle) system**:
  - Random speed multiplier (0.8‑1.4×) each spawn.
  - Random height (ground, mid‑air, high) and size variation.
  - Optional sine‑wave wobble for a subset of fireballs.
- **Ground level aligned** with the grass in the background (no instant death on landing).
- **Polished Game‑Over UI** – custom buttons with proper hit‑boxes, hover & tap animations.

## Controls
- **Desktop**: Press `SPACE` (or `UP`) to start, then jump.  Tap again in mid‑air for the second jump.
- **Mobile**: Tap anywhere on the screen for the same actions.  The orientation overlay forces landscape for the best experience.

## File Structure
```
PJBL_OcongRun/
│   index.html                # Main HTML + Phaser config & mobile layout
│   README.md                 # ← This file
│   sceneMenu.js              # Main menu scene
│   scenePlay.js              # Gameplay – physics, jumps, obstacles
│   assets/
│   ├─ images/               # Sprites (chara, bg, obstacles, UI panels)
│   └─ audio/                # Sound effects
```

## How to Play


## Development Notes
- **Ground level** is controlled by `this.bottomLimit` in `scenePlay.js` (currently set to `590`).
- **Jump logic**: `this.jumpsCount` tracks the number of jumps; resets on landing.
- **Fireball variation** is implemented in `spawnObstacle()`:
  - Random speed multiplier, height tier, size scale, and optional wobble.
- **Game‑Over buttons** now use custom graphics zones to avoid hit‑box overlap.

Enjoy playing and feel free to tweak the parameters for speed, jump power, or visual assets!
