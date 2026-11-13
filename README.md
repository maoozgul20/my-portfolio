# Maooz Gul — Beyond the Digital World

An explorable 3D portfolio. One continuous world, a third-person explorer, and a
camera driven by scroll. Each section of the page is a stop on a single path.

## Stack

React + Vite · Three.js · React Three Fiber · Drei · GSAP ScrollTrigger · Motion · Tailwind CSS

## Run

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`netlify.toml` is included (build `npm run build`, publish `dist`).

## Where things live

| Path | What |
|---|---|
| `src/data/content.js` | All copy: profile, projects, skills, experience. Edit here. |
| `src/state/useScrollJourney.js` | Shared scroll-progress system (page ↔ 3D world) |
| `src/world/stations.js` | World layout: stops, camera path, atmosphere per stop |
| `src/world/CameraRig.jsx` · `Explorer.jsx` | Camera and character |
| `src/world/Terrain.jsx` · `Landmarks.jsx` · `Atmosphere.jsx` | Islands, bridges, castle, portals, sky |
| `src/world/scenes/` | Project worlds, skills core, knowledge chamber |
| `src/ui/` | Navigation, sections, case-study modal, loader, fallback |

Everything in the world is procedural: no model or texture downloads.

## Behaviour

- Scroll moves the explorer and camera along the path; scrolling up reverses it.
- Distant scenes mount only when the journey is near them.
- Phones get a lighter scene (no post-processing, fewer particles, lower pixel ratio);
  slow devices drop effects automatically.
- `prefers-reduced-motion` is respected; without WebGL the page falls back to a static backdrop.
- `?fx=0` / `?fx=1` forces post-processing off / on.

## Adding later

Project links, screenshots and a LinkedIn URL are intentionally absent until real
ones exist. Add them in `src/data/content.js`.
