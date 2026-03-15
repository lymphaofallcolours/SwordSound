import { v4 as uuidv4 } from 'uuid';

import type { Scene } from './scene';

export type Session = {
  readonly id: string;
  readonly name: string;
  readonly scenes: readonly Scene[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

type CreateSessionInput = {
  name: string;
};

export function createSession(input: CreateSessionInput): Session {
  if (!input.name.trim()) {
    throw new Error('Session name cannot be empty');
  }

  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: input.name.trim(),
    scenes: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addSceneToSession(session: Session, scene: Scene): Session {
  return {
    ...session,
    scenes: [...session.scenes, scene],
    updatedAt: new Date().toISOString(),
  };
}

export function removeSceneFromSession(session: Session, sceneId: string): Session {
  const filtered = session.scenes.filter((s) => s.id !== sceneId);
  if (filtered.length === session.scenes.length) return session;
  return {
    ...session,
    scenes: filtered,
    updatedAt: new Date().toISOString(),
  };
}

export function reorderScenesInSession(session: Session, sceneIds: string[]): Session {
  if (sceneIds.length !== session.scenes.length) {
    throw new Error('Scene ID list must match session scene count');
  }

  const sceneMap = new Map(session.scenes.map((s) => [s.id, s]));
  const reordered = sceneIds.map((id) => {
    const scene = sceneMap.get(id);
    if (!scene) throw new Error(`Scene ${id} not found in session`);
    return scene;
  });

  return {
    ...session,
    scenes: reordered,
    updatedAt: new Date().toISOString(),
  };
}
