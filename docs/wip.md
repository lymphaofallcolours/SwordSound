# Work In Progress

<!-- Claude: Read at session start. Update at session end. -->

## Current Session

**Date:** 2026-03-15
**Goal:** Build SwordSound from scratch through live-play-ready state

### Completed This Session
- Full project bootstrap (Electron 28 + React 19 + TypeScript + Tailwind v4)
- Domain layer: 4 branded value objects, 5 entity models with immutable helpers
- Application layer: 2 ports, session/scene/track use cases, export/import
- Infrastructure: IPC persistence, SoundCloud Widget API adapter, fade engine
- Zustand stores: session, playback, UI, settings
- Live SoundCloud playback with multi-track simultaneous audio
- Loop mode (auto-restart on finish)
- Scene crossfade (configurable duration via settings)
- Track fade in/out (configurable duration via settings)
- GM notes editing (inline in scene header)
- Scene management: duplicate/delete via right-click context menu
- Session persistence (auto-save 30s, survives restarts)
- Session export/import via native file dialogs + IPC file I/O
- One-shot sounds palette (persistent, accessible from any scene)
- Settings panel: UI scale (Compact/Default/Large), fade/crossfade durations
- Keyboard shortcuts: Space (scene play/pause), Escape (panic)
- Back-to-home navigation
- Professional dark palette (black base, configurable icon sizes)
- 109 tests across 17 files, all passing
- 20 commits pushed to GitHub

### In Progress
- (none)

### Blocked / Needs Attention
- (none)

### Next Steps
1. Cue loops — the signature feature
2. Custom start/end points on tracks
3. Volume ducking for one-shots
4. Undo/redo
5. Drag-and-drop track/scene reordering
6. Session log (timestamped playback events)
7. Track groups with group volume/mute
8. SoundCloud attribution panel (ToS compliance)

---

## Previous Sessions

### 2026-03-15 — Project Bootstrap
- Initial setup, all doc templates, GitHub repo created
