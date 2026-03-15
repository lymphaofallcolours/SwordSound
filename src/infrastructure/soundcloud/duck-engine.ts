import type { SoundCloudPlayer } from './soundcloud-widget';
import { fadeTrack } from './fade-engine';

type DuckState = {
  originalVolumes: Map<string, number>;
  active: boolean;
};

const duckState: DuckState = {
  originalVolumes: new Map(),
  active: false,
};

export function duckAllExcept(
  player: SoundCloudPlayer,
  excludeTrackIds: string[],
  allTrackIds: string[],
  duckLevel: number = 30,
  durationMs: number = 300,
): void {
  const excludeSet = new Set(excludeTrackIds);

  for (const trackId of allTrackIds) {
    if (excludeSet.has(trackId)) continue;

    // Store original volume if not already ducked
    if (!duckState.originalVolumes.has(trackId)) {
      duckState.originalVolumes.set(trackId, 100); // Will be overridden by actual volume
    }

    fadeTrack(player, {
      trackId,
      fromVolume: duckState.originalVolumes.get(trackId) ?? 100,
      toVolume: duckLevel,
      durationMs,
    });
  }

  duckState.active = true;
}

export function unduckAll(
  player: SoundCloudPlayer,
  allTrackIds: string[],
  durationMs: number = 500,
): void {
  if (!duckState.active) return;

  for (const trackId of allTrackIds) {
    const originalVolume = duckState.originalVolumes.get(trackId);
    if (originalVolume !== undefined) {
      fadeTrack(player, {
        trackId,
        fromVolume: 30,
        toVolume: originalVolume,
        durationMs,
      });
    }
  }

  duckState.originalVolumes.clear();
  duckState.active = false;
}

export function setDuckOriginalVolume(trackId: string, volume: number): void {
  if (duckState.active) {
    duckState.originalVolumes.set(trackId, volume);
  }
}

export function isDucked(): boolean {
  return duckState.active;
}
