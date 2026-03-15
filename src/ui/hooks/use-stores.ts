import { useStore } from 'zustand';

import { createSessionStore, type SessionState } from '@ui/stores/session-store';
import { createUiStore, type UiState } from '@ui/stores/ui-store';
import { createPlaybackStore, type PlaybackState } from '@ui/stores/playback-store';
import { createFakePersistence } from '../../../tests/fixtures/fake-persistence';
import type { PersistencePort } from '@application/ports/persistence-port';

// Singleton stores — initialized once
let sessionStoreInstance: ReturnType<typeof createSessionStore> | null = null;
let uiStoreInstance: ReturnType<typeof createUiStore> | null = null;
let playbackStoreInstance: ReturnType<typeof createPlaybackStore> | null = null;

function getSessionStore(persistence?: PersistencePort) {
  if (!sessionStoreInstance) {
    const port = persistence ?? (
      typeof window !== 'undefined' && window.swordsound?.sessions
        ? {
            saveSession: window.swordsound.sessions.save,
            loadSession: window.swordsound.sessions.load,
            deleteSession: window.swordsound.sessions.delete,
            listSessions: window.swordsound.sessions.list,
          }
        : createFakePersistence()
    );
    sessionStoreInstance = createSessionStore(port);
  }
  return sessionStoreInstance;
}

function getUiStore() {
  if (!uiStoreInstance) {
    uiStoreInstance = createUiStore();
  }
  return uiStoreInstance;
}

function getPlaybackStore() {
  if (!playbackStoreInstance) {
    playbackStoreInstance = createPlaybackStore();
  }
  return playbackStoreInstance;
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  return useStore(getSessionStore(), selector);
}

export function useUiStore<T>(selector: (state: UiState) => T): T {
  return useStore(getUiStore(), selector);
}

export function usePlaybackStore<T>(selector: (state: PlaybackState) => T): T {
  return useStore(getPlaybackStore(), selector);
}
