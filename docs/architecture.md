# Architecture

<!-- Claude: Update when new layers, boundaries, or major components are introduced. -->

## Overview

SwordSound is a desktop soundboard application for tabletop RPG Game Masters, built with Electron and React. It streams audio from SoundCloud via the Widget API (iframe-based embedded players) and provides scene-based audio management with advanced looping, crossfading, and live session control. The architecture follows a layered approach with strict dependency rules: domain (pure logic) → application (orchestration) → infrastructure (I/O) and ui (React renderer). The Electron main process handles OS integration while all audio orchestration runs in the renderer process (required by SoundCloud's iframe-based API).

## Layer Map

```
src/
├── main/                    # Electron main process — BrowserWindow, IPC handlers, global shortcuts, app lifecycle
│   ├── index.ts             # Entry point: creates window, registers IPC
│   └── preload.ts           # Context bridge — exposes safe API to renderer
├── domain/                  # Pure domain logic — ZERO framework imports
│   ├── models/              # Session, Scene, Track, CueLoop, TrackGroup
│   ├── value-objects/       # Volume, TimePosition, FadeDuration, Color
│   └── services/            # Pure business logic functions
├── application/             # Use cases, orchestration
│   ├── ports/               # Interfaces for infrastructure (persistence, audio, shortcuts)
│   ├── session/             # Session management use cases
│   ├── playback/            # Playback orchestration, crossfade logic
│   └── scene/               # Scene management use cases
├── infrastructure/          # I/O, external APIs, persistence
│   ├── persistence/         # Session save/load via IPC to main process
│   ├── soundcloud/          # SoundCloud Widget API adapter
│   └── shortcuts/           # Keyboard shortcut registration
└── ui/                      # React renderer
    ├── index.html           # HTML entry point
    ├── index.tsx            # React root mount
    ├── App.tsx              # Root component
    ├── stores/              # Zustand stores (session, playback, ui state)
    ├── components/          # Reusable UI components
    ├── layouts/             # Page layouts
    ├── hooks/               # Custom React hooks
    └── styles/              # Global styles, Tailwind theme
```

## Dependency Rule

```
ui/ → application/ → domain/
infrastructure/ implements interfaces defined in application/ports/
domain/ imports NOTHING from other layers.
main/ communicates with renderer ONLY via IPC (contextBridge).
```

## Key Data Flows

<!-- Document 2-3 critical flows showing how a request/action moves through layers -->

### GM adds a track to a scene
```
1. GM pastes SoundCloud URL in UI
2. ui/ dispatches to application/scene/addTrack use case
3. application/ calls infrastructure/soundcloud/ adapter to validate URL and fetch metadata
4. SoundCloud Widget API returns track info (title, artist, duration, artwork)
5. application/ creates domain/models/Track entity with metadata
6. Zustand store updated → ui/ re-renders with new track in scene
```

### GM saves a session
```
1. GM triggers save (Ctrl+S or auto-save)
2. ui/ calls application/session/saveSession use case
3. application/ serializes domain/models/Session to JSON via domain/services/
4. infrastructure/persistence/ sends serialized data via IPC to main process
5. main/ writes JSON file to disk via Node.js fs
6. ui/ shows save confirmation
```

### GM breaks a cue loop during playback
```
1. GM clicks "Break" button or presses hotkey
2. ui/ calls application/playback/breakCueLoop use case
3. application/ updates domain/models/Track — advances past current cue loop
4. infrastructure/soundcloud/ adapter continues playback past the cue loop end point
5. Playback continues to next cue loop (or track end if none remain)
6. Zustand store updated → ui/ re-renders track timeline indicator
```

## Module Boundaries

| Module | Responsibility | Key Types/Entities |
|--------|---------------|-------------------|
| domain/models | Core entities and their relationships | Session, Scene, Track, CueLoop, TrackGroup |
| domain/value-objects | Immutable value types | Volume, TimePosition, FadeDuration, Color |
| domain/services | Pure business logic | Session serialization, cue loop sequencing |
| application/ports | Infrastructure interfaces | PersistencePort, AudioPlayerPort, ShortcutPort |
| application/session | Session CRUD use cases | createSession, loadSession, exportSession |
| application/playback | Audio orchestration | playScene, fadeScene, breakCueLoop, panic |
| application/scene | Scene management | createScene, duplicateScene, reorderTracks |
| infrastructure/soundcloud | SoundCloud Widget API wrapper | Widget lifecycle, event handling, seek/volume |
| infrastructure/persistence | File I/O via IPC | Save/load sessions, recent sessions list |
| ui/stores | Zustand state management | sessionStore, playbackStore, uiStore |
| ui/components | React components | TrackChannel, SceneTab, CueLoopTimeline, PanicButton |

## Cross-Cutting Concerns

- **Theming/Config:** Tailwind CSS with dark theme default. Scene accent colors applied via CSS custom properties. Theme config in `tailwind.config.ts`.
- **Error handling:** Result pattern (`{ ok: true, value } | { ok: false, error }`) for expected failures (track unavailable, file not found). Try/catch only for unexpected errors. User-facing errors shown via toast notifications.
- **Validation:** At system boundaries — URL validation when adding tracks, schema validation when importing sessions. Domain types enforce invariants via construction (make invalid states unrepresentable).
- **Logging/Observability:** Session log feature (optional timestamped log of playback events). Console logging in development only.
- **Performance:** Each SoundCloud iframe is a browser context. Lazy-load iframes for non-playing tracks. Monitor memory usage with many tracks. Crossfade precision limited by Widget API event frequency (~100-250ms).
