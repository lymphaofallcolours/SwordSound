# Feature Plan: Zustand Stores

## Goal
Create Zustand stores that hold application state and expose actions calling application use cases. These bridge the UI to the domain/application layers.

## Stores
1. **sessionStore** — current session, session list, CRUD actions
2. **playbackStore** — per-track playback state, active cue loops, panic
3. **uiStore** — active scene ID, sidebar state, modals

## Test Strategy
- Unit tests for store actions using fake persistence
- TDD for business logic in stores
