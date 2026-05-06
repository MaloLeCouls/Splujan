# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # tsc type-check + Vite production build
npm run lint         # TypeScript type-check only (no ESLint configured yet)
npm test             # Vitest in watch mode
npm run test:run     # Vitest single run (CI)

# Run a single test file
npx vitest run src/engine/__tests__/buhlmann.test.ts
```

> **Note:** PowerShell execution policy blocks `npm` — use Git Bash or prefix with `cmd /c npm` when running from PowerShell.

## Architecture

### Data flow

```
DiveProfile  →  Simulator (precompute)  →  DiveState[]
                                                ↓
                                         getStateAt(t)
                                                ↓
                                    ZoopNovo (SVG skin)
```

`DiveProfile` is the single source of truth (segments + gas + events). `Simulator` precomputes a `DiveState` for every integer second at construction time — querying is then O(1). The React playback loop calls `getStateAt(currentTime)` on every animation frame.

### Engine (`src/engine/`)

Pure TypeScript, zero React dependencies. Entry point for algorithmic work.

- **`constants.ts`** — Bühlmann ZH-L16C coefficients (N2 half-times, a/b values), physical constants.
- **`buhlmann.ts`** — Core functions: `initSurfaceCompartments`, `updateCompartments` (exact Haldane formula), `computeCeilingDepth` (GF-adjusted M-values), `computeNDL` (1-min resolution, capped at 99), `computeDecoStops` (1-sec step ascent simulation, snapped to 3 m multiples).
- **`profile.ts`** — Geometry helpers: depth at time (linear interpolation across segments), segment timeline for chart rendering.
- **`simulator.ts`** — `Simulator` class. Precomputes entire `DiveState[]` array at construction; applies events via `SimContext`; back-fills `noFlyTimeMinutes`/`desaturationTimeMinutes` for post-dive states.
- **`events.ts`** — `applyEvents(ctx, events, t)` mutates a `SimContext` (SAC, tank pressure, ascent rate) when events fire.

### Key algorithmic details

- **GF simplification:** Only `gradientFactors.high` is used throughout (no depth-varying GF interpolation in V1). GF low/high follow Suunto defaults: `{ low: 30, high: 85 }`.
- **SAC:** Constant surface rate (no depth scaling) — V1 simplification.
- **Pressure convention:** `P_ambient = surfacePressure + depth / 10` (salt water, 1 m = 0.1 bar).
- **Ceiling formula:** `(P[i] - gf * a[i]) / (1 - gf + gf / b[i])`, converting to metres via `(pressure - surfacePressure) * 10`.

### State management (`src/store/useStore.ts`)

Single Zustand store with `persist` middleware (key `divesim-store`). Persists `profiles` and `activeProfileId`. On first load, falls back to `PRESET_SCENARIOS` if `localStorage` is empty.

### UI structure

- **`src/ui/pages/`** — Three route pages: `HomePage` (profile grid), `EditorPage` (wraps `ProfileEditor`), `SimulationPage` (playback loop + ZoopNovo).
- **`src/ui/computers/ZoopNovo/`** — SVG skin. `ZoopNovo.tsx` selects one of four mode components based on `DiveState` flags (`isPostDive`, `inDecompression`, `depth`). Modes are pure presentational SVG fragments.
- **`src/ui/controls/`** — `PlaybackControls` composes `Timeline` + `SpeedSelector`. Timeline is click-scrubable.
- **`src/ui/editor/`** — `ProfileEditor` manages a local draft state and calls `onSave` on submit.

### Playback loop (`SimulationPage.tsx`)

Uses `requestAnimationFrame` with wall-clock delta × speed multiplier. The `Simulator` instance is memoized on `profile` — changing the profile triggers full recomputation. Keyboard shortcuts: Space (play/pause), ←/→ (±30 s seek), Escape (exit presentation mode).

### Fonts

LCD display fonts (DSEG7Modern-Bold, DSEG14Modern-Regular) must be placed in `public/fonts/` as `.woff2` files. Until added, LCD elements fall back to `monospace`. CSS classes: `.lcd-digit` (7-segment numerics) and `.lcd-alpha` (14-segment alphanumeric).

## Tests

Only the engine has automated tests (`src/engine/__tests__/buhlmann.test.ts`). The rest is tested manually. When modifying the Bühlmann algorithm, cross-check NDL/deco values against a known-good calculator (e.g. Subsurface deco planner) — MN90 tables use a different algorithm and will not match exactly.

## Reference materials

- `docs/spec-v1-divesim.md` — Full V1 specification (algorithm details, UI/UX rules, 6-milestone delivery plan).
- `docs/MN90.pdf` — French dive tables used to sanity-check NDL output.
- `docs/Suunto_ZoopNovo_ScreenPicture.png` — Reference image for the SVG skin design.
- `docs/Clearing up the confusion about the deepstops.pdf` — Erik C. Baker paper on gradient factors.
