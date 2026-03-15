# Feature Plan: Application Layer — Ports & Use Cases

## Goal
Define the application layer: port interfaces for infrastructure boundaries and use cases for session, scene, and track management. Pure orchestration logic with no framework or I/O dependencies.

## Affected Files/Layers
- `src/application/ports/` — interfaces for persistence and audio
- `src/application/session/` — session CRUD use cases
- `src/application/scene/` — scene management use cases
- `src/application/playback/` — playback orchestration (panic, fade)

## Port Interfaces
- **PersistencePort** — save/load/delete/list sessions, recent sessions
- **AudioPlayerPort** — play/pause/stop/seek/volume/mute for a track widget, event callbacks

## Use Cases

### Session
- `createSession(name)` → Session
- `loadSession(id)` → Session (via PersistencePort)
- `saveSession(session)` → void (via PersistencePort)
- `deleteSession(id)` → void
- `listSessions()` → SessionSummary[]
- `exportSession(session)` → serialized JSON string
- `importSession(json)` → Session (with validation)

### Scene
- `addScene(session, name, emoji?, color?)` → updated Session
- `removeScene(session, sceneId)` → updated Session
- `duplicateScene(session, sceneId)` → updated Session
- `updateScene(session, sceneId, changes)` → updated Session

### Track
- `addTrack(scene, url, metadata)` → updated Scene
- `removeTrack(scene, trackId)` → updated Scene
- `updateTrack(scene, trackId, changes)` → updated Scene
- `copyTrack(sourceScene, trackId)` → Track (for paste)
- `moveTrack(sourceScene, targetScene, trackId)` → [updatedSource, updatedTarget]

### Playback
- `panic()` → stops all audio (via AudioPlayerPort)

## Test Strategy
- Unit tests with fake/stub implementations of ports
- TDD mandatory for all use cases
- Colocated test files

## Acceptance Criteria
- [ ] All ports defined as TypeScript types
- [ ] Session CRUD use cases working with fake persistence
- [ ] Scene and track management use cases tested
- [ ] Export/import session round-trips correctly
- [ ] Zero I/O in application layer (all behind ports)
