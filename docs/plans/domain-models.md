# Feature Plan: Domain Models & Value Objects

## Goal
Implement the core domain layer — pure TypeScript types and factory functions with zero framework imports. These are the foundation every other layer builds on.

## Affected Files/Layers
- `src/domain/models/` — entity types and factories
- `src/domain/value-objects/` — immutable value types
- `src/domain/services/` — pure business logic (if needed this phase)
- `src/ui/App.test.tsx` — existing, untouched

## Data Model

### Value Objects
- **Volume** — number 0-100, integer-only
- **TimePosition** — milliseconds, non-negative
- **FadeDuration** — seconds, 0-10 range
- **Color** — hex string for scene accent colors

### Entities
- **CueLoop** — { id, startPosition: TimePosition, endPosition: TimePosition, crossfadeEnabled: boolean, crossfadeDuration: FadeDuration }
- **Track** — { id, soundcloudUrl, title, artist, artworkUrl, duration: TimePosition, volume: Volume, muted, loopEnabled, crossfadeLoop, crossfadeDuration: FadeDuration, customStart: TimePosition, customEnd: TimePosition | null, cueLoops: CueLoop[], groupId: string | null, isOneShot, autoPlay }
- **TrackGroup** — { id, name, volume: Volume, muted }
- **Scene** — { id, name, emoji: string | null, color: Color, tracks: Track[], groups: TrackGroup[], notes: string }
- **Session** — { id, name, scenes: Scene[], createdAt: string, updatedAt: string }

## Implementation Steps (TDD)
1. Value objects: Volume, TimePosition, FadeDuration, Color — with validation
2. CueLoop — creation, validation (start < end)
3. TrackGroup — creation
4. Track — creation, cue loop ordering validation, custom start/end validation
5. Scene — creation, track management helpers (add, remove, reorder)
6. Session — creation, scene management helpers

## Test Strategy
- 100% unit tests, TDD mandatory
- Each value object: valid creation, boundary values, invalid inputs rejected
- Each entity: factory function, invariant enforcement
- Colocated test files: `{module}.test.ts`

## Acceptance Criteria
- [ ] All value objects enforce their constraints
- [ ] All entities can be created via factory functions
- [ ] Invalid states are unrepresentable (type system + runtime validation)
- [ ] Zero framework imports in domain/
- [ ] All tests pass
