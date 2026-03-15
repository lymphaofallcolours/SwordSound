# Work In Progress

<!-- Claude: Read at session start. Update at session end. -->

## Current Session

**Date:** 2026-03-15
**Goal:** Feature batch — polish, bug fixes, and new features per user feedback

### Completed This Session
- Time display (MM:SS) on every track with continuous hover-to-preview
- Cue loop timeline colors: gray (broken), green (active), cyan (upcoming)
- Cue loop seek cooldown: progress bar snaps instantly on loop boundary seek
- Cue loop editor validation: overlap warnings, out-of-range warnings
- Safe cue loop editing during playback (seek cooldown on save)
- Custom start/end point enforcement (seek to start on play, stop/loop at end)
- Custom start/end visual indicators on timeline (gray overlay)
- Seek clamped to custom range when clicking timeline
- Scene rename via right-click context menu with inline editing
- Scene drag-and-drop reordering in sidebar
- Track right-click context menu: Copy, Duplicate, Track Editor, Auto-Play, Remove
- Track alias/GM label in Track Editor (amber text above title)
- Auto-play badge (green "auto" tag) for scene-switch auto-start
- Manual duck toggle: mic button + D key for GM narration
- One-shot metadata persistence fix
- Context menu position fix (appears at cursor, closes on click outside)
- Drag dimming reset fix
- Input cursor alignment fix in editor time fields
- SoundCloud API ToS compliance rule added to memory
- 109 tests, 29 commits

### In Progress
- (none)

### Next Steps (future sessions)
1. Cue loop crossfade (fade-out → seek → fade-in at boundaries)
2. Track loop crossfade (smooth restart)
3. Track groups with group volume/mute
4. Volume presets per scene (save/restore mix)
5. Track fade-in delay (stagger starts)
6. Full undo/redo integration
7. Session log export UI
8. App packaging and distribution

---

## Previous Sessions
### 2026-03-15 — Full Build + Polish
- From zero to fully functional desktop app with live SoundCloud audio
- 29 commits, 109 tests, ~5000+ lines of code
