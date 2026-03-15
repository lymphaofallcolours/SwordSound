import type { AudioPlayerPort, TrackPlaybackState } from '@application/ports/audio-player-port';
import type { Volume } from '@domain/value-objects/volume';
import type { TimePosition } from '@domain/value-objects/time-position';
import { createTimePosition } from '@domain/value-objects/time-position';

type WidgetInstance = {
  iframe: HTMLIFrameElement;
  state: TrackPlaybackState;
  position: TimePosition;
  cleanups: (() => void)[];
};

const SC_WIDGET_API_URL = 'https://w.soundcloud.com/player/';

function buildWidgetUrl(soundcloudUrl: string): string {
  const params = new URLSearchParams({
    url: soundcloudUrl,
    auto_play: 'false',
    show_artwork: 'true',
    show_user: 'true',
    visual: 'false',
  });
  return `${SC_WIDGET_API_URL}?${params.toString()}`;
}

export function createSoundCloudAdapter(container: HTMLElement): AudioPlayerPort {
  const widgets = new Map<string, WidgetInstance>();

  function getWidget(trackId: string): WidgetInstance {
    const widget = widgets.get(trackId);
    if (!widget) throw new Error(`Widget not loaded for track ${trackId}`);
    return widget;
  }

  return {
    async loadTrack(trackId: string, soundcloudUrl: string): Promise<void> {
      // Clean up existing widget if any
      const existing = widgets.get(trackId);
      if (existing) {
        existing.cleanups.forEach((fn) => fn());
        existing.iframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = `sc-widget-${trackId}`;
      iframe.src = buildWidgetUrl(soundcloudUrl);
      iframe.width = '100%';
      iframe.height = '166';
      iframe.allow = 'autoplay';
      iframe.style.display = 'none';
      container.appendChild(iframe);

      widgets.set(trackId, {
        iframe,
        state: 'loading',
        position: createTimePosition(0),
        cleanups: [],
      });

      // Wait for iframe to load
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          const widget = widgets.get(trackId);
          if (widget) widget.state = 'stopped';
          resolve();
        };
      });
    },

    unloadTrack(trackId: string): void {
      const widget = widgets.get(trackId);
      if (!widget) return;
      widget.cleanups.forEach((fn) => fn());
      widget.iframe.remove();
      widgets.delete(trackId);
    },

    play(trackId: string): void {
      const widget = getWidget(trackId);
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'play' }),
        '*',
      );
      widget.state = 'playing';
    },

    pause(trackId: string): void {
      const widget = getWidget(trackId);
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'pause' }),
        '*',
      );
      widget.state = 'paused';
    },

    stop(trackId: string): void {
      const widget = getWidget(trackId);
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'pause' }),
        '*',
      );
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'seekTo', value: 0 }),
        '*',
      );
      widget.state = 'stopped';
      widget.position = createTimePosition(0);
    },

    seekTo(trackId: string, position: TimePosition): void {
      const widget = getWidget(trackId);
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'seekTo', value: position }),
        '*',
      );
      widget.position = position;
    },

    setVolume(trackId: string, volume: Volume): void {
      const widget = getWidget(trackId);
      widget.iframe.contentWindow?.postMessage(
        JSON.stringify({ method: 'setVolume', value: volume }),
        '*',
      );
    },

    getPosition(trackId: string): TimePosition {
      return getWidget(trackId).position;
    },

    getState(trackId: string): TrackPlaybackState {
      return getWidget(trackId).state;
    },

    onPositionChange(trackId: string, callback: (position: TimePosition) => void): () => void {
      const widget = getWidget(trackId);
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.widgetId === widget.iframe.id && data.method === 'position') {
            const pos = createTimePosition(data.value);
            widget.position = pos;
            callback(pos);
          }
        } catch {
          // Ignore non-SC messages
        }
      };
      window.addEventListener('message', handler);
      const cleanup = () => window.removeEventListener('message', handler);
      widget.cleanups.push(cleanup);
      return cleanup;
    },

    onStateChange(trackId: string, callback: (state: TrackPlaybackState) => void): () => void {
      const widget = getWidget(trackId);
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.widgetId === widget.iframe.id && data.method === 'state') {
            widget.state = data.value as TrackPlaybackState;
            callback(widget.state);
          }
        } catch {
          // Ignore non-SC messages
        }
      };
      window.addEventListener('message', handler);
      const cleanup = () => window.removeEventListener('message', handler);
      widget.cleanups.push(cleanup);
      return cleanup;
    },

    onFinish(trackId: string, callback: () => void): () => void {
      const widget = getWidget(trackId);
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.widgetId === widget.iframe.id && data.method === 'finish') {
            callback();
          }
        } catch {
          // Ignore non-SC messages
        }
      };
      window.addEventListener('message', handler);
      const cleanup = () => window.removeEventListener('message', handler);
      widget.cleanups.push(cleanup);
      return cleanup;
    },

    stopAll(): void {
      for (const [trackId] of widgets) {
        const widget = widgets.get(trackId);
        if (!widget) continue;
        widget.iframe.contentWindow?.postMessage(
          JSON.stringify({ method: 'pause' }),
          '*',
        );
        widget.iframe.contentWindow?.postMessage(
          JSON.stringify({ method: 'setVolume', value: 0 }),
          '*',
        );
        widget.state = 'stopped';
        widget.position = createTimePosition(0);
      }
    },
  };
}
