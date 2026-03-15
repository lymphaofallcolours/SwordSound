import { createStore } from 'zustand/vanilla';

import {
  createSoundCloudPlayer,
  type SoundCloudPlayer,
  type TrackPlaybackState,
  type TrackMetadata,
} from '@infrastructure/soundcloud/soundcloud-widget';
import { fadeTrack, cancelAllFades } from '@infrastructure/soundcloud/fade-engine';

export type TrackPlaybackInfo = {
  state: TrackPlaybackState;
  positionMs: number;
  relativePosition: number;
  metadata: TrackMetadata | null;
};

export type PlaybackState = {
  tracks: Record<string, TrackPlaybackInfo>;
  player: SoundCloudPlayer | null;
  onTrackFinish: ((trackId: string) => void) | null;
  seekCooldowns: Set<string>;

  initPlayer: () => void;
  setOnTrackFinish: (callback: (trackId: string) => void) => void;
  loadTrack: (trackId: string, soundcloudUrl: string) => Promise<TrackMetadata | null>;
  play: (trackId: string) => void;
  pause: (trackId: string) => void;
  stop: (trackId: string) => void;
  setVolume: (trackId: string, volume: number) => void;
  seekTo: (trackId: string, positionMs: number) => void;
  fadeIn: (trackId: string, targetVolume: number, durationMs: number) => void;
  fadeOut: (trackId: string, durationMs: number, pauseAfter?: boolean) => void;
  panic: () => void;
  unloadTrack: (trackId: string) => void;
  getTrackState: (trackId: string) => TrackPlaybackState;
};

export function createPlaybackStore() {
  return createStore<PlaybackState>((set, get) => ({
    tracks: {},
    player: null,
    onTrackFinish: null,
    seekCooldowns: new Set(),

    setOnTrackFinish: (callback) => set({ onTrackFinish: callback }),

    initPlayer: () => {
      if (get().player) return;

      const player = createSoundCloudPlayer({
        onStateChange: (trackId, state) => {
          set((prev) => ({
            tracks: {
              ...prev.tracks,
              [trackId]: {
                ...(prev.tracks[trackId] ?? { positionMs: 0, relativePosition: 0, metadata: null }),
                state,
              },
            },
          }));
        },
        onProgress: (trackId, positionMs, relativePosition) => {
          // Skip progress updates during seek cooldown
          if (get().seekCooldowns.has(trackId)) return;
          set((prev) => ({
            tracks: {
              ...prev.tracks,
              [trackId]: {
                ...(prev.tracks[trackId] ?? { state: 'playing' as const, metadata: null }),
                positionMs,
                relativePosition,
              },
            },
          }));
        },
        onFinish: (trackId) => {
          set((prev) => ({
            tracks: {
              ...prev.tracks,
              [trackId]: {
                ...(prev.tracks[trackId] ?? { metadata: null }),
                state: 'stopped' as const,
                positionMs: 0,
                relativePosition: 0,
              },
            },
          }));
          // Notify external handler (used for loop logic)
          get().onTrackFinish?.(trackId);
        },
        onMetadataLoaded: (trackId, metadata) => {
          set((prev) => ({
            tracks: {
              ...prev.tracks,
              [trackId]: {
                ...(prev.tracks[trackId] ?? { state: 'ready' as const, positionMs: 0, relativePosition: 0 }),
                metadata,
              },
            },
          }));
        },
        onError: (trackId) => {
          set((prev) => ({
            tracks: {
              ...prev.tracks,
              [trackId]: {
                ...(prev.tracks[trackId] ?? { positionMs: 0, relativePosition: 0, metadata: null }),
                state: 'error' as const,
              },
            },
          }));
        },
      });

      set({ player });
    },

    loadTrack: async (trackId, soundcloudUrl) => {
      const { player } = get();
      if (!player) return null;

      set((prev) => ({
        tracks: {
          ...prev.tracks,
          [trackId]: { state: 'loading', positionMs: 0, relativePosition: 0, metadata: null },
        },
      }));

      try {
        const metadata = await player.loadTrack(trackId, soundcloudUrl);
        return metadata;
      } catch {
        set((prev) => ({
          tracks: {
            ...prev.tracks,
            [trackId]: { state: 'error', positionMs: 0, relativePosition: 0, metadata: null },
          },
        }));
        return null;
      }
    },

    play: (trackId) => get().player?.play(trackId),
    pause: (trackId) => get().player?.pause(trackId),
    stop: (trackId) => get().player?.stop(trackId),
    setVolume: (trackId, volume) => get().player?.setVolume(trackId, volume),
    seekTo: (trackId, positionMs) => {
      const { player, seekCooldowns } = get();
      if (!player) return;
      player.seekTo(trackId, positionMs);
      // Immediately update position and block progress callbacks briefly
      const trackInfo = get().tracks[trackId];
      if (trackInfo?.metadata?.duration) {
        seekCooldowns.add(trackId);
        set((prev) => ({
          tracks: {
            ...prev.tracks,
            [trackId]: {
              ...prev.tracks[trackId],
              positionMs,
              relativePosition: positionMs / trackInfo.metadata!.duration,
            },
          },
        }));
        setTimeout(() => {
          get().seekCooldowns.delete(trackId);
        }, 800);
      }
    },
    unloadTrack: (trackId) => {
      get().player?.unloadTrack(trackId);
      set((prev) => {
        const { [trackId]: _, ...rest } = prev.tracks;
        return { tracks: rest };
      });
    },

    fadeIn: (trackId, targetVolume, durationMs) => {
      const { player } = get();
      if (!player) return;
      player.setVolume(trackId, 0);
      player.play(trackId);
      fadeTrack(player, { trackId, fromVolume: 0, toVolume: targetVolume, durationMs });
    },

    fadeOut: (trackId, durationMs, pauseAfter = true) => {
      const { player } = get();
      if (!player) return;
      fadeTrack(player, {
        trackId,
        fromVolume: 100,
        toVolume: 0,
        durationMs,
        onComplete: () => {
          if (pauseAfter) player.pause(trackId);
        },
      });
    },

    panic: () => {
      cancelAllFades();
      get().player?.stopAll();
    },

    getTrackState: (trackId) => get().tracks[trackId]?.state ?? 'stopped',
  }));
}
