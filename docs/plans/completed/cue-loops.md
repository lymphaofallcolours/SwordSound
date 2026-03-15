# Feature Plan: Cue Loops

## Goal
Implement the signature cue loop system — define loop regions on a track's timeline that hold playback until the GM breaks them.

## How It Works
1. Track plays normally until it hits a cue loop's end point
2. Playback loops within that cue loop region indefinitely
3. GM clicks "Break" to advance past the cue loop
4. Playback continues to the next cue loop (or track end)
5. Multiple cue loops can be sequenced on a single track

## Implementation
1. Cue loop engine: monitors PLAY_PROGRESS, seeks back when hitting loop end
2. Break action: advances currentCueLoopIndex, allows playback past the end
3. UI: cue loop indicators on timeline, break button, add/remove cue loops
4. Per-track state: activeCueLoopIndex tracked in playback store

## Files
- `src/infrastructure/soundcloud/cue-loop-engine.ts` — loop monitoring logic
- `src/ui/stores/playback-store.ts` — add cue loop state
- `src/ui/components/track-channel.tsx` — add break button, cue indicators
- `src/ui/components/cue-loop-editor.tsx` — UI for defining cue loop regions
