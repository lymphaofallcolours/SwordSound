# Feature Plan: Live Play Features

## Goal
Add features critical for live GM sessions: scene crossfade, track fades, GM notes editing, and session export/import.

## Features
1. **Scene crossfade** — fade out current scene while fading in next scene
2. **Track fade in/out** — gradual volume transitions per track
3. **GM notes editing** — edit notes inline in scene header
4. **Session export/import** — save/load session files for sharing

## Implementation
- Fade engine: interval-based volume ramping via setVolume calls
- Scene crossfade: uses fade engine on both scenes simultaneously
- Notes: inline textarea in scene header
- Export: JSON download via IPC file dialog
- Import: JSON upload via IPC file dialog
