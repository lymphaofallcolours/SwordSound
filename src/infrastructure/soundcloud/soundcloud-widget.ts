import type { SCWidget, SCSound, SCProgressData } from './sc-types';

export type TrackPlaybackState = 'loading' | 'ready' | 'playing' | 'paused' | 'stopped' | 'error';

export type TrackMetadata = {
  title: string;
  artist: string;
  duration: number;
  artworkUrl: string | null;
  permalinkUrl: string;
};

export type PlaybackCallbacks = {
  onStateChange?: (trackId: string, state: TrackPlaybackState) => void;
  onProgress?: (trackId: string, positionMs: number, relativePosition: number) => void;
  onFinish?: (trackId: string) => void;
  onMetadataLoaded?: (trackId: string, metadata: TrackMetadata) => void;
  onError?: (trackId: string) => void;
};

type WidgetEntry = {
  iframe: HTMLIFrameElement;
  widget: SCWidget;
  state: TrackPlaybackState;
  trackId: string;
};

function getWidgetContainer(): HTMLElement {
  const el = document.getElementById('sc-widgets');
  if (!el) throw new Error('SoundCloud widget container #sc-widgets not found');
  return el;
}

function getSCWidget(): typeof window.SC {
  return window.SC;
}

function buildIframeSrc(soundcloudUrl: string): string {
  const encodedUrl = encodeURIComponent(soundcloudUrl);
  return `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=false&show_artwork=false&visual=false&single_active=false`;
}

export function createSoundCloudPlayer(callbacks: PlaybackCallbacks = {}) {
  const widgets = new Map<string, WidgetEntry>();

  function getEntry(trackId: string): WidgetEntry | undefined {
    return widgets.get(trackId);
  }

  return {
    loadTrack(trackId: string, soundcloudUrl: string): Promise<TrackMetadata> {
      return new Promise((resolve, reject) => {
        const SC = getSCWidget();
        if (!SC) {
          reject(new Error('SoundCloud Widget API not loaded'));
          return;
        }

        // Remove existing widget for this track
        const existing = widgets.get(trackId);
        if (existing) {
          existing.iframe.remove();
          widgets.delete(trackId);
        }

        const container = getWidgetContainer();
        const iframe = document.createElement('iframe');
        iframe.id = `sc-widget-${trackId}`;
        iframe.src = buildIframeSrc(soundcloudUrl);
        iframe.width = '100%';
        iframe.height = '166';
        iframe.allow = 'autoplay';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', 'no');
        container.appendChild(iframe);

        const widget = SC.Widget(iframe);

        const entry: WidgetEntry = {
          iframe,
          widget,
          state: 'loading',
          trackId,
        };
        widgets.set(trackId, entry);
        callbacks.onStateChange?.(trackId, 'loading');

        widget.bind(SC.Widget.Events.READY, () => {
          entry.state = 'ready';
          callbacks.onStateChange?.(trackId, 'ready');

          // Fetch metadata
          widget.getCurrentSound((sound: SCSound) => {
            const metadata: TrackMetadata = {
              title: sound.title,
              artist: sound.user.username,
              duration: sound.duration,
              artworkUrl: sound.artwork_url,
              permalinkUrl: sound.permalink_url,
            };
            callbacks.onMetadataLoaded?.(trackId, metadata);
            resolve(metadata);
          });

          // Bind playback events
          widget.bind(SC.Widget.Events.PLAY, () => {
            entry.state = 'playing';
            callbacks.onStateChange?.(trackId, 'playing');
          });

          widget.bind(SC.Widget.Events.PAUSE, () => {
            entry.state = 'paused';
            callbacks.onStateChange?.(trackId, 'paused');
          });

          widget.bind(SC.Widget.Events.FINISH, () => {
            entry.state = 'stopped';
            callbacks.onFinish?.(trackId);
            callbacks.onStateChange?.(trackId, 'stopped');
          });

          widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data: unknown) => {
            const progress = data as SCProgressData;
            callbacks.onProgress?.(trackId, progress.currentPosition, progress.relativePosition);
          });

          widget.bind(SC.Widget.Events.ERROR, () => {
            entry.state = 'error';
            callbacks.onError?.(trackId);
            callbacks.onStateChange?.(trackId, 'error');
          });
        });
      });
    },

    unloadTrack(trackId: string): void {
      const entry = getEntry(trackId);
      if (!entry) return;
      entry.iframe.remove();
      widgets.delete(trackId);
    },

    play(trackId: string): void {
      getEntry(trackId)?.widget.play();
    },

    pause(trackId: string): void {
      getEntry(trackId)?.widget.pause();
    },

    stop(trackId: string): void {
      const entry = getEntry(trackId);
      if (!entry) return;
      entry.widget.pause();
      entry.widget.seekTo(0);
      entry.state = 'stopped';
      callbacks.onStateChange?.(trackId, 'stopped');
    },

    seekTo(trackId: string, positionMs: number): void {
      getEntry(trackId)?.widget.seekTo(positionMs);
    },

    setVolume(trackId: string, volume: number): void {
      getEntry(trackId)?.widget.setVolume(volume);
    },

    getState(trackId: string): TrackPlaybackState {
      return getEntry(trackId)?.state ?? 'stopped';
    },

    stopAll(): void {
      for (const [, entry] of widgets) {
        entry.widget.pause();
        entry.widget.seekTo(0);
        entry.state = 'stopped';
        callbacks.onStateChange?.(entry.trackId, 'stopped');
      }
    },

    isLoaded(trackId: string): boolean {
      return widgets.has(trackId);
    },
  };
}

export type SoundCloudPlayer = ReturnType<typeof createSoundCloudPlayer>;
