import { createStore } from 'zustand/vanilla';

import type { Session } from '@domain/models/session';
import type { PersistencePort, SessionSummary } from '@application/ports/persistence-port';
import {
  createNewSession,
  saveSession,
  loadSession as loadSessionUseCase,
  deleteSession as deleteSessionUseCase,
  listSessions,
} from '@application/session/session-use-cases';
import {
  addScene as addSceneUseCase,
  removeScene as removeSceneUseCase,
  duplicateScene as duplicateSceneUseCase,
  updateScene as updateSceneUseCase,
  addTrack as addTrackUseCase,
  removeTrack as removeTrackUseCase,
  updateTrack as updateTrackUseCase,
} from '@application/scene/scene-use-cases';
import type { Track } from '@domain/models/track';

export type SessionState = {
  currentSession: Session | null;
  sessionList: SessionSummary[];
  isLoading: boolean;
  activeSceneId: string | null;

  createSession: (name: string) => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  saveCurrentSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  refreshSessionList: () => Promise<void>;

  addScene: (name: string, emoji?: string, color?: string) => void;
  removeScene: (sceneId: string) => void;
  duplicateScene: (sceneId: string) => void;
  updateScene: (sceneId: string, changes: { name?: string; emoji?: string | null; color?: string; notes?: string }) => void;
  setActiveScene: (sceneId: string | null) => void;

  addTrack: (sceneId: string, track: Track) => void;
  removeTrack: (sceneId: string, trackId: string) => void;
  updateTrack: (sceneId: string, trackId: string, changes: Record<string, unknown>) => void;
};

export function createSessionStore(persistence: PersistencePort) {
  return createStore<SessionState>((set, get) => ({
    currentSession: null,
    sessionList: [],
    isLoading: false,
    activeSceneId: null,

    createSession: async (name: string) => {
      set({ isLoading: true });
      const session = await createNewSession(persistence, name);
      set({ currentSession: session, isLoading: false });
    },

    loadSession: async (id: string) => {
      set({ isLoading: true });
      const session = await loadSessionUseCase(persistence, id);
      set({
        currentSession: session,
        activeSceneId: session?.scenes[0]?.id ?? null,
        isLoading: false,
      });
    },

    saveCurrentSession: async () => {
      const { currentSession } = get();
      if (!currentSession) return;
      await saveSession(persistence, currentSession);
    },

    deleteSession: async (id: string) => {
      await deleteSessionUseCase(persistence, id);
      const { currentSession } = get();
      if (currentSession?.id === id) {
        set({ currentSession: null, activeSceneId: null });
      }
    },

    refreshSessionList: async () => {
      const list = await listSessions(persistence);
      set({ sessionList: list });
    },

    addScene: (name: string, emoji?: string, color?: string) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = addSceneUseCase(currentSession, { name, emoji, color });
      const newScene = updated.scenes[updated.scenes.length - 1];
      set({ currentSession: updated, activeSceneId: newScene.id });
    },

    removeScene: (sceneId: string) => {
      const { currentSession, activeSceneId } = get();
      if (!currentSession) return;
      const updated = removeSceneUseCase(currentSession, sceneId);
      set({
        currentSession: updated,
        activeSceneId: activeSceneId === sceneId
          ? (updated.scenes[0]?.id ?? null)
          : activeSceneId,
      });
    },

    duplicateScene: (sceneId: string) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = duplicateSceneUseCase(currentSession, sceneId);
      set({ currentSession: updated });
    },

    updateScene: (sceneId, changes) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = updateSceneUseCase(currentSession, sceneId, changes);
      set({ currentSession: updated });
    },

    setActiveScene: (sceneId: string | null) => {
      set({ activeSceneId: sceneId });
    },

    addTrack: (sceneId: string, track: Track) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = addTrackUseCase(currentSession, sceneId, track);
      set({ currentSession: updated });
    },

    removeTrack: (sceneId: string, trackId: string) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = removeTrackUseCase(currentSession, sceneId, trackId);
      set({ currentSession: updated });
    },

    updateTrack: (sceneId: string, trackId: string, changes: Record<string, unknown>) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const updated = updateTrackUseCase(currentSession, sceneId, trackId, changes);
      set({ currentSession: updated });
    },
  }));
}
