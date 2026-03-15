# Changelog

All notable changes to SwordSound are documented here.
Format follows [Semantic Versioning](https://semver.org/).

---

## [0.2.0] — 2026-03-15

Feature-complete pre-release. All core spec features implemented.

### Features

#### Audio Playback
- **Multi-track simultaneous SoundCloud playback** via Widget API (iframe-based)
- **Loop mode** per track — auto-restart on finish
- **Crossfade loop** — fade out before track end, seek back, fade in (configurable duration)
- **Cue loops** — define loop regions on timeline, break to advance (the signature feature)
- **Cue loop crossfade** — per-cue-loop fade at boundaries
- **Custom start/end points** — trim track playback range, enforced during playback
- **Fade-in on play** — per-track option, uses global or custom duration
- **Scene fades** — fade in/out all tracks (configurable duration)
- **Scene crossfade** — fade out current scene while fading in next on switch
- **One-shot sounds** — persistent palette, auto volume ducking
- **Volume ducking** — automatic for one-shots, manual toggle (D key + mic button)
- **Staggered start delays** — per-track configurable delay for scene playback
- **Click-to-seek** on timeline bar with seek clamping to custom range
- **Panic button** — instant silence (Escape key)

#### Session Management
- **Create, load, delete sessions** with persistent storage
- **Auto-save** every 30 seconds
- **Session export** to `.swordsound.json` via native save dialog
- **Session import** from file via native open dialog
- **Recent sessions** list on welcome screen
- **Back-to-home** navigation (SwordSound logo)

#### Scene Management
- **Create scenes** with name, emoji, accent color
- **Rename** scenes inline via right-click context menu
- **Duplicate** and **delete** scenes
- **Drag-and-drop reorder** scenes in sidebar
- **Scene crossfade** on switch (configurable duration)
- **GM notes** per scene — inline editing in scene header
- **Volume presets** — save/restore volume mix per scene

#### Track Management
- **Add tracks** by SoundCloud URL with label, group, and quick toggles
- **Track Editor** modal — alias, group, custom start/end, cue loops, crossfade, auto-play, fade-in, delay
- **Copy/paste tracks** between scenes via clipboard
- **Duplicate tracks** within a scene
- **Drag-and-drop reorder** tracks within scene + **drag to other scenes**
- **Right-click context menu** — Copy, Duplicate, Track Editor, Remove
- **Track groups** — Music / Ambience / Effects with colored badges
- **GM alias/label** per track (amber text above title)
- **Auto-play** — tracks start automatically on scene switch

#### UI & UX
- **Dark tactical interface** — black base, scene-colored accents
- **Settings panel** — UI scale (Compact/Default/Large), fade/crossfade durations
- **Time display** — current/total (MM:SS) on every track
- **Floating hover time** — follows cursor on progress bar
- **Cue loop timeline colors** — gray (broken), green (active), cyan (upcoming)
- **Custom start/end indicators** — gray overlay on dimmed timeline regions
- **SoundCloud attribution panel** — ToS-compliant, shows active tracks
- **Keyboard shortcuts** — Space (scene play/pause), Escape (panic), D (duck toggle)

### Bug Fixes
- `fix:` Electron launch on Linux — GPU, sandbox, shared memory compatibility
- `fix:` Forge Vite plugin `index.html` at project root (not `src/`)
- `fix:` Electron in devDependencies (Forge requirement)
- `fix:` pnpm hoisted node-linker for Electron Forge
- `fix:` Main entry path `.vite/build/index.js`
- `fix:` Volume not restoring after panic (was zeroing permanently)
- `fix:` Progress bar lag during cue loop seeks (added seek cooldown)
- `fix:` Context menu position (now at cursor, closes on click outside)
- `fix:` Drag dimming stuck state (onDragEnd reset)
- `fix:` Volume slider drag conflict (stopPropagation)
- `fix:` One-shot metadata persistence on reload
- `fix:` Track Editor layout stability (checkboxes in fixed row)
- `fix:` Fade-in-on-play decoupled from crossfade loop duration

### Infrastructure
- Electron 28 + React 19 + TypeScript 5.9 + Zustand 5 + Tailwind CSS v4
- Electron Forge 7 with Vite 8 plugin
- Vitest 4 — 109 tests across 17 files
- IPC-based file persistence (sessions in `userData/sessions/`)
- Fade engine (interval-based volume ramping)
- Cue loop engine (position-based boundary detection)
- Duck engine (volume ducking with auto-restore)

---

## [0.1.0] — 2026-03-15

Initial project scaffold.

### Added
- Electron + React + TypeScript + Tailwind CSS project setup
- Domain models: Session, Scene, Track, CueLoop, TrackGroup, value objects
- Application layer: ports, use cases, export/import
- Documentation templates adapted from Claude-fu
- GitHub repository created (lymphaofallcolours/SwordSound)
