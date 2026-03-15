# SceneBoard — Product Specification

## What This Is

A desktop soundboard application for tabletop RPG Game Masters. It streams audio from SoundCloud via the Widget API (free, no API key, no subscription) and provides scene-based audio management with advanced looping, crossfading, and live session control.

This document defines what the application does. Implementation decisions are left to the developer.

---

## Platform

Electron desktop app (Windows, macOS, Linux).

## Audio Source

SoundCloud Widget API (iframe-based embedded player). No API key required. No rate limits on playback. Tracks are added by pasting SoundCloud URLs.

### Attribution Requirements

Per SoundCloud's terms, the embedded player must be present in the DOM. The app should include a collapsible panel showing the active SoundCloud widgets. Each track in the UI must display the track title, artist name, and a link back to the SoundCloud URL.

---

## Core Concepts

### Session

A session is the top-level container. It holds all scenes, track configurations, and settings for a campaign or adventure. Sessions can be exported to a file and imported on another machine or shared with other GMs.

### Scene

A scene represents a location, moment, or mood (e.g., "The Weary Traveler", "Ambush on the Road", "The Lich's Throne Room"). Each scene contains an arbitrary number of tracks. The GM switches between scenes during play.

### Track

A track is a single SoundCloud audio source within a scene. Each track has independent playback controls, volume, loop configuration, and fade settings.

### Cue Loop

A cue loop is a defined segment within a track where playback holds and repeats until the GM manually advances past it. A track can have multiple sequential cue loops. This is the core differentiating feature — it allows a single track to serve an entire narrative arc (buildup → combat loop → resolution → victory loop) controlled live by the GM.

---

## Feature Specification

### 1. Session Management

- **Create** new sessions with a name.
- **Open** existing sessions.
- **Save** sessions. All scene and track configuration is persisted automatically.
- **Export** a session to a portable file (JSON or similar). This file contains all scene definitions, track URLs, loop points, volume settings, and metadata — everything needed to reconstruct the session. It does not contain audio data (audio streams from SoundCloud at runtime).
- **Import** a session from a file. Validates that tracks are still accessible on SoundCloud and flags any that aren't.
- **Recent sessions** list for quick access.

### 2. Scene Management

- **Create** scenes with a name, optional emoji icon, and accent color.
- **Rename** and **edit** scene properties at any time.
- **Delete** scenes (with confirmation).
- **Reorder** scenes via drag-and-drop.
- **Duplicate** a scene (deep copy of all track configurations).
- **Switch** between scenes via tabs or a scene list.

### 3. Track Management

- **Add track** by pasting a SoundCloud URL. The app fetches track metadata (title, artist, artwork, duration) from the widget and displays it.
- **Remove track** from a scene (with confirmation).
- **Reorder tracks** within a scene via drag-and-drop.
- **Cut** a track from one scene (removes it) and **paste** it into another.
- **Copy** a track from one scene and **paste** it into another (duplicates configuration).
- **Arbitrary number of tracks** per scene. The UI should handle many tracks gracefully (scrolling, perhaps collapsible track panels).

### 4. Track Playback Controls

Each track has the following independent controls:

#### 4.1 Basic Transport
- **Play** / **Pause** / **Stop** (stop resets position to the track's custom start point).
- **Volume** slider (0–100).
- **Mute** toggle (preserves volume setting).

#### 4.2 Custom Start and End Points
- Define a **custom start point** within the track. Play and loop-restart begin from here instead of 0:00.
- Define a **custom end point** within the track. Playback stops or loops back when reaching this point instead of the track's natural end.
- These are set by scrubbing/dragging markers on a track timeline bar.

#### 4.3 Simple Loop Mode
- **Loop toggle**: when enabled, the track loops between its start point (or custom start) and end point (or custom end) indefinitely.
- **Crossfade loop**: when enabled alongside loop, the end of the track crossfades into the beginning of the next loop iteration. Crossfade duration is configurable per track (0–10 seconds). This avoids the hard cut at the loop boundary.

#### 4.4 Cue Loop Mode (Advanced)

This is the signature feature. A track can have an ordered sequence of **cue loops** defined along its timeline:

- Each cue loop has a **start point** and **end point** (defined as positions within the track).
- Each cue loop optionally has **crossfade looping** enabled (with configurable duration), so the loop boundary is smooth.
- Cue loops are ordered sequentially along the track's timeline.

**Playback behavior with cue loops:**

1. Track begins playing from the start (or custom start point).
2. Playback proceeds normally until it reaches the **end point of Cue Loop A**.
3. Playback loops within Cue Loop A (from its start to its end) indefinitely.
4. The GM **breaks** Cue Loop A (via a button, hotkey, or similar action).
5. Playback continues past Cue Loop A's end point, proceeding through the track normally.
6. Playback reaches the **end point of Cue Loop B** and holds there, looping.
7. The GM breaks Cue Loop B.
8. This continues for as many cue loops as are defined.
9. After the final cue loop is broken (or if there are no more cue loops), playback continues to the end point (or custom end point).
10. If the track's overall loop mode is enabled, it returns to the start and the entire cue loop sequence begins again.

**Visual representation:**

```
Track timeline:
|---[====CUE A====]-------[====CUE B====]-----[==CUE C==]---|
^                                                             ^
custom start                                           custom end

Playback: start → plays to Cue A end → LOOPS Cue A → GM breaks →
          continues → plays to Cue B end → LOOPS Cue B → GM breaks →
          continues → plays to Cue C end → LOOPS Cue C → GM breaks →
          continues → reaches custom end → (loops to start if loop enabled)
```

### 5. Scene Playback Controls

These controls affect all tracks in the active scene simultaneously:

- **Play scene**: starts all tracks in the scene that are flagged as auto-play.
- **Stop scene**: stops all tracks.
- **Fade in scene**: gradually raises all tracks from 0 to their configured volumes over a configurable duration.
- **Fade out scene**: gradually lowers all tracks to 0 over a configurable duration, then pauses them.
- **Fade in single track**: same as above but for one track.
- **Fade out single track**: same as above but for one track.
- **Scene crossfade**: transitions from the current scene to a target scene. Fades out all current tracks while fading in the target scene's tracks. Duration configurable.

### 6. Panic Button

- Immediately silences all audio across all scenes. Sets all volumes to 0 and pauses all playback.
- Must be accessible at all times (persistent button in the UI + keyboard shortcut).
- Fast. No fade. Instant silence.

### 7. Keyboard Shortcuts

The app should support configurable keyboard shortcuts for at minimum:

- Panic (stop all)
- Play/pause active scene
- Fade out active scene
- Fade in active scene
- Break current cue loop (advances the currently looping cue loop on the focused or most-recently-interacted track)
- Switch to next/previous scene

### 8. GM Notes

- Each scene can have an optional **text note** field where the GM can write reminders (e.g., "Use this when they enter the tavern", "Trigger Cue Loop B when the assassin appears").
- Notes are visible in the scene header area and included in session exports.

### 9. Track Groups (Layers)

Within a scene, tracks can optionally be assigned to **groups** (e.g., "Music", "Ambience", "SFX"). Groups allow:

- **Group volume**: a master volume slider for all tracks in the group.
- **Group mute**: mute/unmute an entire layer.
- **Group fade in/out**: fade an entire layer independently.
- Visual separation in the UI so the GM can quickly identify what's playing in each layer.

Default groups could be "Music", "Ambience", and "Effects", but the GM can create, rename, and delete groups.

### 10. One-Shot Sounds

Some sounds aren't meant to loop or persist — they're one-time triggers (a door slamming, thunder, a sword being drawn, a dragon roar). The app should support:

- Marking a track as a **one-shot**. One-shots play once when triggered, then stop.
- One-shots can have a custom start and end point (to extract just the relevant portion of a longer track).
- One-shots can play **over** any currently playing scene without interrupting it.
- One-shots might be organized in their own persistent palette that's accessible regardless of which scene is active (since a door slam is useful in any scene).

### 11. Volume Ducking

- When a one-shot fires, the app can optionally **duck** (temporarily lower) the volume of all other tracks by a configurable amount, then restore them after the one-shot finishes.
- Manual duck toggle: the GM can temporarily duck all audio (useful when making an important narrative announcement), then release.

### 12. Undo / Redo

- Configuration changes (adding/removing tracks, changing loop points, renaming scenes) should support undo/redo during the current session.
- This is for accidental changes during live play. The GM fumbles a click and deletes a track — undo gets it back.

### 13. Session Log (Nice to Have)

- The app optionally records a timestamped log of what was played during a session (scene changes, tracks played, cue loops broken).
- Useful for session recaps or for refining the soundboard after a session.
- Exportable as a text file.

---

## UI Principles

- **Dark theme** as default. Bright screens are distracting during sessions, especially in dimly lit rooms.
- **Scene-colored accents**: each scene's chosen color tints its UI elements, providing instant visual feedback on which scene is active.
- **Minimal clicks during play**: the most common live actions (play/pause, break cue loop, scene switch, fade, panic) should be one click or one keypress. Setup and configuration can be more involved.
- **Information density**: the GM needs to see the state of multiple tracks at a glance. Compact track channels with clear status indicators (playing, paused, looping, which cue loop is active).
- **The SoundCloud widget strip** should be collapsible/tucked away but accessible. It's required for ToS compliance but shouldn't dominate the interface.

---

## What This App Does NOT Do

- **Does not download, cache, or store audio**. All playback is real-time streaming from SoundCloud via their embedded widget.
- **Does not modify, remix, or re-encode audio**. Playback controls (volume, seek, loop) are exercised through the widget's public API.
- **Does not circumvent any SoundCloud restrictions**. If a track is paywalled, geo-blocked, or has app playback disabled by the uploader, it simply won't work and the app should communicate this clearly.
- **Does not require a SoundCloud account** from the GM (the Widget API works without authentication for public tracks).
- **Does not include Discord integration** in the initial release. This is a planned future feature.

---

## Constraints and Limitations to Document in the App

The following limitations stem from the SoundCloud Widget API and should be communicated to the user (e.g., in a help section or tooltip):

- **Loop precision**: loops may overshoot their boundary by ~100-250ms due to the Widget API's event frequency. This is generally imperceptible for ambient music.
- **Crossfade smoothness**: volume changes are in integer steps (0-100) and communicated across an iframe boundary. Crossfades are smooth enough for background music but not studio-grade.
- **Track availability**: not all SoundCloud tracks are available for embedded playback. The app will indicate when a track can't be played.
- **Internet required**: audio streams from SoundCloud in real time. No offline mode.
- **Resource usage**: each track uses a SoundCloud iframe (essentially a browser tab). Performance may degrade with very many simultaneous tracks. The practical limit depends on the user's machine.

---

## Future Features (Not In Initial Release)

- **Discord integration**: capture mixed audio output and stream to a Discord voice channel via a bot, similar to Kenku FM.
- **Remote control**: HTTP API allowing control from a phone, tablet, or Stream Deck.
- **SoundCloud search**: search SoundCloud's catalog from within the app (would require an API key and SoundCloud developer account).
- **Local file support**: play local audio files alongside SoundCloud tracks for sounds not available on SoundCloud.
- **YouTube support**: add tracks via YouTube URLs using the IFrame Player API (same architectural pattern, different widget).
