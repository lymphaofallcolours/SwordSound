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
  oneShotTracks: Track[];

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

  moveScene: (sceneId: string, direction: 'up' | 'down') => void;
  moveTrack: (sceneId: string, trackId: string, direction: 'up' | 'down') => void;

  addOneShotTrack: (track: Track) => void;
  removeOneShotTrack: (trackId: string) => void;
};

const ONESHOTS_KEY = 'swordsound-oneshots';

function loadOneShotsFromStorage(): Track[] {
  try {
    const raw = localStorage.getItem(ONESHOTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveOneShotsToStorage(tracks: Track[]): void {
  try {
    localStorage.setItem(ONESHOTS_KEY, JSON.stringify(tracks));
  } catch { /* ignore */ }
}

export function createSessionStore(persistence: PersistencePort) {
  return createStore<SessionState>((set, get) => ({
    currentSession: null,
    sessionList: [],
    isLoading: false,
    activeSceneId: null,
    oneShotTracks: loadOneShotsFromStorage(),

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

    moveScene: (sceneId, direction) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const scenes = [...currentSession.scenes];
      const index = scenes.findIndex((s) => s.id === sceneId);
      if (index === -1) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= scenes.length) return;
      [scenes[index], scenes[newIndex]] = [scenes[newIndex], scenes[index]];
      set({ currentSession: { ...currentSession, scenes, updatedAt: new Date().toISOString() } });
    },

    moveTrack: (sceneId, trackId, direction) => {
      const { currentSession } = get();
      if (!currentSession) return;
      const sceneIndex = currentSession.scenes.findIndex((s) => s.id === sceneId);
      if (sceneIndex === -1) return;
      const scene = currentSession.scenes[sceneIndex];
      const tracks = [...scene.tracks];
      const index = tracks.findIndex((t) => t.id === trackId);
      if (index === -1) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= tracks.length) return;
      [tracks[index], tracks[newIndex]] = [tracks[newIndex], tracks[index]];
      const updatedScene = { ...scene, tracks };
      const scenes = [...currentSession.scenes];
      scenes[sceneIndex] = updatedScene;
      set({ currentSession: { ...currentSession, scenes, updatedAt: new Date().toISOString() } });
    },

    addOneShotTrack: (track: Track) => {
      set((prev) => {
        const updated = [...prev.oneShotTracks, track];
        saveOneShotsToStorage(updated);
        return { oneShotTracks: updated };
      });
    },

    removeOneShotTrack: (trackId: string) => {
      set((prev) => {
        const updated = prev.oneShotTracks.filter((t) => t.id !== trackId);
        saveOneShotsToStorage(updated);
        return { oneShotTracks: updated };
      });
    },
  }));
}
