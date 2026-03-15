# Work In Progress

<!-- Claude: Read at session start. Update at session end. -->

## Current Session

**Date:** 2026-03-15
**Goal:** Feature-complete initial release

### Completed This Session (cumulative)
- 37 commits, 109 tests
- All spec features implemented
- Track groups (Music/Ambience/Effects) with colored badges
- Volume presets per scene (save/restore mix)
- Staggered track start delays (per-track configurable)
- Crossfade loop (fade out → seek → fade in, working)
- Cue loop crossfade (per-cue-loop toggle + duration)
- Fade-in on play (per-track, defaults to global duration)
- Track Editor: group, delay, alias, auto-play, fade-in, crossfade, cue loops, custom start/end
- Volume slider drag fix (no longer triggers track drag)

### Next Steps (future sessions)
1. Full undo/redo integration with session store
2. Session log export UI
3. Track group volume/mute controls (master per group)
4. CI pipeline + app packaging (.deb, .exe, .dmg)

---

## Previous Sessions
### 2026-03-15 — Full Build + Polish
- From zero to feature-complete desktop app
- 37 commits, 109 tests, ~6000+ lines
