import type { SoundCloudPlayer } from './soundcloud-widget';

type FadeOptions = {
  trackId: string;
  fromVolume: number;
  toVolume: number;
  durationMs: number;
  onComplete?: () => void;
};

const activeFades = new Map<string, number>();

export function fadeTrack(player: SoundCloudPlayer, options: FadeOptions): () => void {
  const { trackId, fromVolume, toVolume, durationMs, onComplete } = options;

  // Cancel any existing fade for this track
  cancelFade(trackId);

  if (durationMs <= 0) {
    player.setVolume(trackId, toVolume);
    onComplete?.();
    return () => {};
  }

  const steps = Math.max(Math.floor(durationMs / 50), 1); // ~20fps
  const stepDuration = durationMs / steps;
  const volumeStep = (toVolume - fromVolume) / steps;
  let currentStep = 0;

  const intervalId = window.setInterval(() => {
    currentStep++;
    const newVolume = Math.round(fromVolume + volumeStep * currentStep);
    player.setVolume(trackId, Math.max(0, Math.min(100, newVolume)));

    if (currentStep >= steps) {
      player.setVolume(trackId, toVolume);
      cancelFade(trackId);
      onComplete?.();
    }
  }, stepDuration);

  activeFades.set(trackId, intervalId);

  return () => cancelFade(trackId);
}

export function cancelFade(trackId: string): void {
  const intervalId = activeFades.get(trackId);
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    activeFades.delete(trackId);
  }
}

export function cancelAllFades(): void {
  for (const [trackId] of activeFades) {
    cancelFade(trackId);
  }
}
