import type { CueLoop } from '@domain/models/cue-loop';
import type { SoundCloudPlayer } from './soundcloud-widget';

export type CueLoopState = {
  cueLoops: readonly CueLoop[];
  activeCueLoopIndex: number; // -1 = no active cue loop, playing freely
  broken: Set<number>; // indices of broken cue loops
  lastSeekTime: number; // timestamp of last cue-loop seek (avoid double seeks)
};

const trackCueStates = new Map<string, CueLoopState>();

export function initCueLoops(trackId: string, cueLoops: readonly CueLoop[]): void {
  trackCueStates.set(trackId, {
    cueLoops,
    activeCueLoopIndex: -1,
    broken: new Set(),
    lastSeekTime: 0,
  });
}

export function clearCueLoops(trackId: string): void {
  trackCueStates.delete(trackId);
}

/**
 * Called on every PLAY_PROGRESS event. Checks if we've hit a cue loop boundary
 * and should loop back. Returns the index of the active cue loop, or -1.
 */
export function checkCueLoopBoundary(
  trackId: string,
  positionMs: number,
  player: SoundCloudPlayer,
): number {
  const state = trackCueStates.get(trackId);
  if (!state || state.cueLoops.length === 0) return -1;

  // If track looped back to start, reset all cue loops
  if (positionMs < 2000 && state.broken.size > 0) {
    state.broken.clear();
    state.activeCueLoopIndex = -1;
  }

  const now = Date.now();

  // Find the first non-broken cue loop whose end we've reached
  for (let i = 0; i < state.cueLoops.length; i++) {
    if (state.broken.has(i)) continue;

    const cueLoop = state.cueLoops[i];

    // At or past the cue loop's end — seek back (with debounce)
    if (positionMs >= cueLoop.endPosition - 500) {
      if (now - state.lastSeekTime > 600) {
        player.seekTo(trackId, cueLoop.startPosition);
        state.lastSeekTime = now;
      }
      state.activeCueLoopIndex = i;
      return i;
    }

    // Haven't reached this cue loop's start yet — playing freely before it
    if (positionMs < cueLoop.startPosition) {
      state.activeCueLoopIndex = -1;
      return -1;
    }

    // Inside this cue loop's range but not at the end yet
    if (positionMs >= cueLoop.startPosition && positionMs < cueLoop.endPosition - 500) {
      state.activeCueLoopIndex = i;
      return i;
    }
  }

  state.activeCueLoopIndex = -1;
  return -1;
}

/**
 * Break the current active cue loop — allow playback to continue past it.
 */
export function breakCueLoop(trackId: string): number {
  const state = trackCueStates.get(trackId);
  if (!state || state.activeCueLoopIndex === -1) return -1;

  const brokenIndex = state.activeCueLoopIndex;
  state.broken.add(brokenIndex);
  state.activeCueLoopIndex = -1;
  return brokenIndex;
}

/**
 * Reset all cue loop states for a track.
 */
export function resetCueLoops(trackId: string): void {
  const state = trackCueStates.get(trackId);
  if (!state) return;
  state.activeCueLoopIndex = -1;
  state.broken.clear();
}

export function getActiveCueLoopIndex(trackId: string): number {
  return trackCueStates.get(trackId)?.activeCueLoopIndex ?? -1;
}

export function getCueLoopState(trackId: string): CueLoopState | undefined {
  return trackCueStates.get(trackId);
}

/**
 * Get count of remaining (non-broken) cue loops.
 */
export function getRemainingCueLoopCount(trackId: string): number {
  const state = trackCueStates.get(trackId);
  if (!state) return 0;
  return state.cueLoops.length - state.broken.size;
}
