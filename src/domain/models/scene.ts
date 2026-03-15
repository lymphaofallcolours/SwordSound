import { v4 as uuidv4 } from 'uuid';

import type { Color } from '../value-objects/color';
import { createColor } from '../value-objects/color';
import type { Track } from './track';
import type { TrackGroup } from './track-group';

export type Scene = {
  readonly id: string;
  readonly name: string;
  readonly emoji: string | null;
  readonly color: Color;
  readonly tracks: readonly Track[];
  readonly groups: readonly TrackGroup[];
  readonly notes: string;
  readonly volumePresets: Record<string, number>;
};

type CreateSceneInput = {
  name: string;
  emoji?: string | null;
  color?: Color;
  notes?: string;
};

const DEFAULT_SCENE_COLOR = '#6366f1';

export function createScene(input: CreateSceneInput): Scene {
  if (!input.name.trim()) {
    throw new Error('Scene name cannot be empty');
  }

  return {
    id: uuidv4(),
    name: input.name.trim(),
    emoji: input.emoji ?? null,
    color: input.color ?? createColor(DEFAULT_SCENE_COLOR),
    tracks: [],
    groups: [],
    notes: input.notes ?? '',
    volumePresets: {},
  };
}

export function addTrackToScene(scene: Scene, track: Track): Scene {
  return { ...scene, tracks: [...scene.tracks, track] };
}

export function removeTrackFromScene(scene: Scene, trackId: string): Scene {
  const filtered = scene.tracks.filter((t) => t.id !== trackId);
  if (filtered.length === scene.tracks.length) return scene;
  return { ...scene, tracks: filtered };
}

export function reorderTracksInScene(scene: Scene, trackIds: string[]): Scene {
  if (trackIds.length !== scene.tracks.length) {
    throw new Error('Track ID list must match scene track count');
  }

  const trackMap = new Map(scene.tracks.map((t) => [t.id, t]));
  const reordered = trackIds.map((id) => {
    const track = trackMap.get(id);
    if (!track) throw new Error(`Track ${id} not found in scene`);
    return track;
  });

  return { ...scene, tracks: reordered };
}
