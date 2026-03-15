import type { Session } from '@domain/models/session';
import type { Scene } from '@domain/models/scene';
import type { Track } from '@domain/models/track';
import { createScene as createDomainScene } from '@domain/models/scene';
import { addTrackToScene, removeTrackFromScene } from '@domain/models/scene';
import { createTrack as createDomainTrack } from '@domain/models/track';
import { createColor } from '@domain/value-objects/color';

type AddSceneInput = {
  name: string;
  emoji?: string;
  color?: string;
  notes?: string;
};

export function addScene(session: Session, input: AddSceneInput): Session {
  const scene = createDomainScene({
    name: input.name,
    emoji: input.emoji,
    color: input.color ? createColor(input.color) : undefined,
    notes: input.notes,
  });

  return {
    ...session,
    scenes: [...session.scenes, scene],
    updatedAt: new Date().toISOString(),
  };
}

export function removeScene(session: Session, sceneId: string): Session {
  return {
    ...session,
    scenes: session.scenes.filter((s) => s.id !== sceneId),
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateScene(session: Session, sceneId: string): Session {
  const source = session.scenes.find((s) => s.id === sceneId);
  if (!source) throw new Error('Scene not found');

  const duplicatedTracks = source.tracks.map((track) =>
    createDomainTrack({
      soundcloudUrl: track.soundcloudUrl,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      artworkUrl: track.artworkUrl,
      volume: track.volume,
      muted: track.muted,
      loopEnabled: track.loopEnabled,
      crossfadeLoop: track.crossfadeLoop,
      crossfadeDuration: track.crossfadeDuration,
      customStart: track.customStart,
      customEnd: track.customEnd,
      cueLoops: [...track.cueLoops],
      groupId: track.groupId,
      isOneShot: track.isOneShot,
      autoPlay: track.autoPlay,
    }),
  );

  const duplicate = createDomainScene({
    name: `${source.name} (copy)`,
    emoji: source.emoji,
    color: source.color,
    notes: source.notes,
  });

  const withTracks = duplicatedTracks.reduce(
    (scene, track) => addTrackToScene(scene, track),
    duplicate,
  );

  return {
    ...session,
    scenes: [...session.scenes, withTracks],
    updatedAt: new Date().toISOString(),
  };
}

type UpdateSceneInput = {
  name?: string;
  emoji?: string | null;
  color?: string;
  notes?: string;
};

export function updateScene(
  session: Session,
  sceneId: string,
  changes: UpdateSceneInput,
): Session {
  const index = session.scenes.findIndex((s) => s.id === sceneId);
  if (index === -1) throw new Error('Scene not found');

  const scene = session.scenes[index];
  const updated: Scene = {
    ...scene,
    ...(changes.name !== undefined && { name: changes.name }),
    ...(changes.emoji !== undefined && { emoji: changes.emoji }),
    ...(changes.color !== undefined && { color: createColor(changes.color) }),
    ...(changes.notes !== undefined && { notes: changes.notes }),
  };

  const scenes = [...session.scenes];
  scenes[index] = updated;

  return { ...session, scenes, updatedAt: new Date().toISOString() };
}

export function addTrack(session: Session, sceneId: string, track: Track): Session {
  return mapScene(session, sceneId, (scene) => addTrackToScene(scene, track));
}

export function removeTrack(session: Session, sceneId: string, trackId: string): Session {
  return mapScene(session, sceneId, (scene) => removeTrackFromScene(scene, trackId));
}

type UpdateTrackInput = Partial<
  Pick<Track, 'volume' | 'muted' | 'loopEnabled' | 'crossfadeLoop' | 'crossfadeDuration' | 'customStart' | 'customEnd' | 'isOneShot' | 'autoPlay' | 'groupId'>
>;

export function updateTrack(
  session: Session,
  sceneId: string,
  trackId: string,
  changes: UpdateTrackInput,
): Session {
  return mapScene(session, sceneId, (scene) => ({
    ...scene,
    tracks: scene.tracks.map((t) => (t.id === trackId ? { ...t, ...changes } : t)),
  }));
}

export function copyTrack(scene: Scene, trackId: string): Track {
  const source = scene.tracks.find((t) => t.id === trackId);
  if (!source) throw new Error('Track not found');

  return createDomainTrack({
    soundcloudUrl: source.soundcloudUrl,
    title: source.title,
    artist: source.artist,
    duration: source.duration,
    artworkUrl: source.artworkUrl,
    volume: source.volume,
    muted: source.muted,
    loopEnabled: source.loopEnabled,
    crossfadeLoop: source.crossfadeLoop,
    crossfadeDuration: source.crossfadeDuration,
    customStart: source.customStart,
    customEnd: source.customEnd,
    cueLoops: [...source.cueLoops],
    groupId: source.groupId,
    isOneShot: source.isOneShot,
    autoPlay: source.autoPlay,
  });
}

export function moveTrack(
  session: Session,
  sourceSceneId: string,
  targetSceneId: string,
  trackId: string,
): Session {
  const sourceScene = session.scenes.find((s) => s.id === sourceSceneId);
  if (!sourceScene) throw new Error('Source scene not found');

  const track = sourceScene.tracks.find((t) => t.id === trackId);
  if (!track) throw new Error('Track not found');

  let updated = removeTrack(session, sourceSceneId, trackId);
  updated = addTrack(updated, targetSceneId, track);

  return updated;
}

function mapScene(session: Session, sceneId: string, fn: (scene: Scene) => Scene): Session {
  return {
    ...session,
    scenes: session.scenes.map((s) => (s.id === sceneId ? fn(s) : s)),
    updatedAt: new Date().toISOString(),
  };
}
