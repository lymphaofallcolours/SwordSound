# Architecture Decision Records

<!-- Claude: Append new decisions during development. NEVER delete or edit past entries. -->

---

## 2026-03-15 — Electron Forge over electron-builder
**Status:** Accepted
**Context:** Need a build/packaging tool for Electron. Two main options: Electron Forge and electron-builder.
**Decision:** Electron Forge — it is the officially recommended Electron toolchain with first-class Vite support via `@electron-forge/plugin-vite`.
**Alternatives rejected:** electron-builder — more flexible for exotic packaging but adds unnecessary complexity for our needs.
**Consequences:** Use Forge CLI for dev, build, and packaging. Config in `forge.config.ts`.

---

## 2026-03-15 — Zustand over Redux Toolkit for state management
**Status:** Accepted
**Context:** Need state management for complex nested state (sessions → scenes → tracks → cue loops).
**Decision:** Zustand with Immer middleware — minimal boilerplate, stores are testable without React, handles nested immutable updates cleanly.
**Alternatives rejected:** Redux Toolkit — more ceremony/boilerplate than needed; Jotai — atomic model less suited for deeply nested state; React Context — poor performance with frequent updates (audio state changes rapidly).
**Consequences:** Stores defined in `src/ui/stores/`. Domain logic stays in `domain/` — stores only hold state and call application use cases.

---

## 2026-03-15 — Playback orchestration in renderer process
**Status:** Accepted
**Context:** SoundCloud Widget API requires iframe DOM access. Iframes can only exist in the renderer process.
**Decision:** All audio playback orchestration (play, pause, seek, volume, crossfade, cue loop management) runs in the renderer process. Only persistence (file I/O) and OS integration (global shortcuts, window management) cross the IPC boundary to the main process.
**Alternatives rejected:** Running audio logic in main process — impossible since SoundCloud widgets are DOM elements.
**Consequences:** The renderer process is heavier than typical Electron apps. Infrastructure layer's SoundCloud adapter lives in the renderer. IPC surface is minimal (persistence + OS features only).

---

## 2026-03-15 — pnpm over npm/yarn
**Status:** Accepted
**Context:** Need a Node.js package manager.
**Decision:** pnpm — faster installs, strict dependency resolution (prevents phantom dependencies), disk-efficient via content-addressable store.
**Alternatives rejected:** npm — slower, flat node_modules allows phantom deps; yarn — similar to pnpm but less strict by default.
**Consequences:** Use `pnpm` for all package operations. `pnpm-lock.yaml` committed to repo.

---

## 2026-03-15 — Tailwind CSS for styling
**Status:** Accepted
**Context:** Need a styling solution for the React renderer. UI requires dark theme, scene-colored accents, and information-dense layout.
**Decision:** Tailwind CSS — utility-first approach enables fast iteration, excellent dark mode support, works well with the frontend-design plugin.
**Alternatives rejected:** CSS Modules — slower iteration for complex layouts; styled-components — runtime overhead, less suited for utility-first; Vanilla Extract — smaller ecosystem.
**Consequences:** Tailwind config in `tailwind.config.ts`. Custom theme with scene accent color system. `@tailwindcss/vite` plugin in Vite config.

---

## 2026-03-15 — pnpm hoisted node-linker for Electron Forge
**Status:** Accepted
**Context:** Electron Forge requires flat `node_modules` for native dependency rebuilding. pnpm's default symlinked layout breaks this.
**Decision:** Add `node-linker=hoisted` to `.npmrc`. Electron stays in `devDependencies` (Forge requirement).
**Alternatives rejected:** Switching to npm (loses pnpm benefits); using `shamefully-hoist` (deprecated).
**Consequences:** `.npmrc` must be committed. `node_modules` layout is flat, losing some pnpm strictness.

---
<!-- Entries above — newest first -->
