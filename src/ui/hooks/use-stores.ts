import { useMemo } from 'react';
import { useStore } from 'zustand';

import { createSessionStore, type SessionState } from '@ui/stores/session-store';
import { createUiStore, type UiState } from '@ui/stores/ui-store';
import { createFakePersistence } from '../../../tests/fixtures/fake-persistence';
import type { PersistencePort } from '@application/ports/persistence-port';

// Singleton stores — initialized once
let sessionStoreInstance: ReturnType<typeof createSessionStore> | null = null;
let uiStoreInstance: ReturnType<typeof createUiStore> | null = null;

function getSessionStore(persistence?: PersistencePort) {
  if (!sessionStoreInstance) {
    // Use IPC persistence in Electron, fake for development/testing
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

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  return useStore(getSessionStore(), selector);
}

export function useUiStore<T>(selector: (state: UiState) => T): T {
  return useStore(getUiStore(), selector);
}
