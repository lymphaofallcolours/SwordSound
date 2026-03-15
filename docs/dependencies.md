# Dependencies

<!-- Claude: Update whenever a dependency is added, replaced, or removed. -->

## Format

For each dependency:
- **What it does** (one line)
- **Why it was chosen** over alternatives
- **What it replaced** (if applicable)
- **Removal risk:** Low | Medium | High
- **Added:** date

---

## Production Dependencies

### electron
**Purpose:** Desktop runtime — provides BrowserWindow, IPC, file system access, global shortcuts
**Chosen over:** Tauri (requires Rust, SoundCloud iframes need Chromium), NW.js (smaller ecosystem)
**Removal risk:** High — core platform
**Added:** 2026-03-15

### react / react-dom
**Purpose:** UI framework for the renderer process
**Chosen over:** Svelte (smaller Electron ecosystem), Vue (team familiarity), vanilla (too much boilerplate for complex UI)
**Removal risk:** High — all UI components depend on it
**Added:** 2026-03-15

### zustand
**Purpose:** State management — holds session, playback, and UI state
**Chosen over:** Redux Toolkit (more boilerplate), Jotai (atomic model less suited for nested state), React Context (poor perf for frequent updates)
**Removal risk:** Medium — stores are isolated, could swap with effort
**Added:** 2026-03-15

### immer
**Purpose:** Immutable state updates for Zustand stores — enables mutative syntax for deeply nested session/scene/track state
**Chosen over:** Manual spread operators (error-prone with deep nesting)
**Removal risk:** Low — Zustand middleware, easy to remove if stores simplify
**Added:** 2026-03-15

### uuid
**Purpose:** Generate unique IDs for sessions, scenes, tracks, cue loops, track groups
**Chosen over:** crypto.randomUUID (not available in all Electron contexts), nanoid (uuid is more standard for entity IDs)
**Removal risk:** Low — utility, easily replaceable
**Added:** 2026-03-15

---

## Dev Dependencies

### typescript
**Purpose:** Type system for the entire codebase
**Removal risk:** High
**Added:** 2026-03-15

### @electron-forge/cli + plugins
**Purpose:** Electron dev server, build, and packaging toolchain with Vite integration
**Chosen over:** electron-builder (more complexity than needed)
**Removal risk:** High — handles entire build pipeline
**Added:** 2026-03-15

### vite + @vitejs/plugin-react
**Purpose:** Bundler for renderer process, HMR in development
**Chosen over:** Webpack (slower, more config), esbuild (less plugin ecosystem)
**Removal risk:** High — integrated with Electron Forge
**Added:** 2026-03-15

### tailwindcss + @tailwindcss/vite
**Purpose:** Utility-first CSS framework, dark theme, scene-colored accents
**Chosen over:** CSS Modules, styled-components, Vanilla Extract
**Removal risk:** Medium — deeply integrated into component markup
**Added:** 2026-03-15

### vitest
**Purpose:** Unit and integration test runner — Vite-native, fast, compatible with Jest API
**Chosen over:** Jest (slower, needs separate TS transform config)
**Removal risk:** Medium — all tests depend on it
**Added:** 2026-03-15

### @testing-library/react + @testing-library/jest-dom
**Purpose:** React component testing utilities — encourages testing behavior over implementation
**Removal risk:** Medium
**Added:** 2026-03-15

### playwright + @playwright/test
**Purpose:** E2E testing for Electron app — can drive Electron windows
**Chosen over:** Spectron (deprecated), Cypress (less Electron support)
**Removal risk:** Low — only E2E tests depend on it
**Added:** 2026-03-15

### eslint + @typescript-eslint/* + prettier
**Purpose:** Linting and code formatting
**Removal risk:** Low — tooling only
**Added:** 2026-03-15
