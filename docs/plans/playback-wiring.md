# Feature Plan: Wire SoundCloud Playback to UI

## Goal
Connect the SoundCloud Widget API adapter to the UI so tracks actually play audio when transport controls are clicked.

## Key Challenge
The SoundCloud Widget API works via the SC Widget JS SDK loaded in the iframe. We need to:
1. Load the SoundCloud Widget API script
2. Create hidden iframes for each track
3. Use the SC Widget SDK to control playback
4. Update UI state based on widget events

## Implementation Steps
1. Create a proper SoundCloud Widget adapter using the official Widget API
2. Create a playback store that manages per-track playback state
3. Wire track transport buttons (play/pause/stop) to the adapter
4. Wire volume/mute controls
5. Show playback progress on the timeline bar
6. Wire scene-level play/stop buttons

## Files to Modify
- `src/infrastructure/soundcloud/soundcloud-widget.ts` — rewrite to use real SC Widget API
- `src/ui/stores/` — add playback store
- `src/ui/components/track-channel.tsx` — connect to playback state
- `src/ui/App.tsx` — initialize adapter, wire scene controls
- `index.html` — load SoundCloud Widget API script

## Test Strategy
- Unit tests for playback store with mocked AudioPlayerPort
- Manual testing for actual SoundCloud playback (requires network)
