// Type declarations for the SoundCloud Widget API (loaded via script tag)

export type SCSound = {
  title: string;
  duration: number;
  permalink_url: string;
  artwork_url: string | null;
  user: {
    username: string;
  };
};

export type SCProgressData = {
  currentPosition: number;
  relativePosition: number;
  loadProgress: number;
};

export type SCWidget = {
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(ms: number): void;
  setVolume(volume: number): void;
  getVolume(callback: (volume: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getCurrentSound(callback: (sound: SCSound) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
  load(url: string, options?: Record<string, unknown>): void;
  bind(event: string, callback: (data?: unknown) => void): void;
  unbind(event: string): void;
};

export type SCWidgetEvents = {
  READY: string;
  PLAY: string;
  PAUSE: string;
  FINISH: string;
  PLAY_PROGRESS: string;
  LOAD_PROGRESS: string;
  SEEK: string;
  ERROR: string;
};

export type SCWidgetConstructor = {
  (element: HTMLIFrameElement | string): SCWidget;
  Events: SCWidgetEvents;
};

declare global {
  interface Window {
    SC?: {
      Widget: SCWidgetConstructor;
    };
  }
}
