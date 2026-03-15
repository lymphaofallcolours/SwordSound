# Feature Plan: Infrastructure Layer

## Goal
Implement infrastructure adapters: file-based session persistence via Electron IPC, SoundCloud Widget API adapter, and keyboard shortcut registration.

## Affected Files/Layers
- `src/infrastructure/persistence/` — file I/O session storage
- `src/infrastructure/soundcloud/` — SoundCloud Widget API wrapper
- `src/infrastructure/shortcuts/` — keyboard shortcut registration
- `src/main/index.ts` — IPC handler registration
- `src/main/preload.ts` — context bridge API exposure

## Implementation Steps
1. Define IPC channels and preload API types
2. Implement main process IPC handlers for file persistence
3. Implement renderer-side persistence adapter (calls preload API)
4. Create SoundCloud Widget adapter (wraps iframe postMessage API)
5. Wire up keyboard shortcuts via Electron globalShortcut

## Test Strategy
- Unit tests for serialization/deserialization logic
- Integration tests for IPC round-trip (if feasible)
- SoundCloud adapter tested via port interface mocks
