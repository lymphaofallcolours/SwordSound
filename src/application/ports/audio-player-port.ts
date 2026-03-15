import type { Volume } from '@domain/value-objects/volume';
import type { TimePosition } from '@domain/value-objects/time-position';

export type TrackPlaybackState = 'playing' | 'paused' | 'stopped' | 'loading' | 'error';

export type AudioPlayerPort = {
  loadTrack(trackId: string, soundcloudUrl: string): Promise<void>;
  unloadTrack(trackId: string): void;
  play(trackId: string): void;
  pause(trackId: string): void;
  stop(trackId: string): void;
  seekTo(trackId: string, position: TimePosition): void;
  setVolume(trackId: string, volume: Volume): void;
  getPosition(trackId: string): TimePosition;
  getState(trackId: string): TrackPlaybackState;
  onPositionChange(trackId: string, callback: (position: TimePosition) => void): () => void;
  onStateChange(trackId: string, callback: (state: TrackPlaybackState) => void): () => void;
  onFinish(trackId: string, callback: () => void): () => void;
  stopAll(): void;
};
