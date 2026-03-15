# Work In Progress

<!-- Claude: Read at session start. Update at session end. -->

## Current Session

**Date:** 2026-03-15
**Goal:** Build SwordSound from scratch — all layers through live playback

### Completed This Session
- Full project bootstrap (Electron + React + TypeScript + Tailwind)
- Domain layer: 4 value objects, 5 entity models
- Application layer: ports, session/scene/track use cases, export/import
- Infrastructure: IPC persistence, SoundCloud Widget API adapter, fade engine
- Zustand stores: session, playback, UI state
- UI: welcome screen, scene list, track channels, panic button, modals
- Live SoundCloud playback with multi-track simultaneous audio
- Loop mode (auto-restart on finish)
- Scene crossfade (fade out current → fade in next)
- Track fade in/out (3s gradual volume transitions)
- GM notes editing (inline in scene header)
- Scene duplicate/delete via right-click context menu
- Session persistence (auto-save every 30s, survives restarts)
- Session export as .swordsound.json file
- Keyboard shortcuts: Space (toggle scene play/pause), Escape (panic)
- Back-to-home navigation (SwordSound logo)
- Professional dark palette (black base, aeroglass panels)
- 109 tests across 17 files, all passing
- 15 commits pushed to GitHub

### In Progress
- (none)

### Blocked / Needs Attention
- Peer dependency warnings (cosmetic, non-functional)

### Next Steps
1. Cue loops — the signature feature (define loop regions, break with button)
2. Custom start/end points on tracks
3. One-shot sounds palette
4. Track groups (Music/Ambience/Effects layers)
5. Volume ducking for one-shots
6. Undo/redo
7. Session import from file
8. Drag-and-drop track/scene reordering
9. Session log (timestamped playback events)

---

## Previous Sessions

### 2026-03-15 — Project Bootstrap
- Initial setup, all doc templates, GitHub repo created
