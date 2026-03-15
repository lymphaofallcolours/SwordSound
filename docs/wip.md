# Work In Progress

<!-- Claude: Read at session start. Update at session end. -->

## Current Session

**Date:** 2026-03-15
**Goal:** Complete initial project setup — all layers implemented from domain to UI

### Completed This Session
- Domain value objects: Volume, TimePosition, FadeDuration, Color (branded types)
- Domain models: CueLoop, TrackGroup, Track, Scene, Session (immutable factories)
- Application ports: PersistencePort, AudioPlayerPort (infrastructure boundaries)
- Application use cases: session CRUD, scene management, track CRUD, export/import, panic
- Infrastructure: IPC persistence (main process file I/O), SoundCloud Widget adapter, preload API
- Zustand stores: sessionStore (session/scene/track state), uiStore (sidebar/modals)
- UI components: WelcomeScreen, SceneList, SceneHeader, TrackChannel, PanicButton, Modal, CreateSessionDialog, AddSceneDialog, AddTrackDialog
- React hooks: useSessionStore, useUiStore (Zustand connectors)
- Global styles: command-center theme, JetBrains Mono + DM Sans, scene accent color system
- All feature plans archived
- 109 tests passing across 17 test files

### In Progress
- (none)

### Blocked / Needs Attention
- SoundCloud Widget adapter needs real-world testing with actual widget iframes
- Peer dependency warnings (cosmetic): @electron/fuses v2 vs expected v1, @tailwindcss/vite expects vite ≤7

### Next Steps
1. Wire SoundCloud Widget adapter to track playback (load iframes, play/pause/stop)
2. Implement cue loop playback engine (the signature feature)
3. Add keyboard shortcuts (panic, play/pause scene, break cue loop)
4. Add scene crossfade and track fade in/out
5. Implement one-shot sounds palette
6. Add session auto-save
7. Add undo/redo for configuration changes
8. Add volume ducking for one-shots
9. Add track groups (Music/Ambience/Effects layers)
10. Add session log (optional timestamped playback log)

---

## Previous Sessions

### 2026-03-15 — Project Bootstrap
- Renamed directory RPG-soundboard → SwordSound
- Adapted all doc templates, created CLAUDE.md
- Initialized pnpm + Electron Forge + React + Tailwind CSS v4 + Vitest
- Scaffolded Electron app shell, 2 smoke tests
- Created GitHub repo (lymphaofallcolours/SwordSound), pushed
