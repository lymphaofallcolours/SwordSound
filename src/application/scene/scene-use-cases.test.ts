import { describe, it, expect } from 'vitest';

import {
  addScene,
  removeScene,
  duplicateScene,
  updateScene,
  addTrack,
  removeTrack,
  updateTrack,
  copyTrack,
  moveTrack,
} from './scene-use-cases';
import { createSession } from '@domain/models/session';
import { createScene, addTrackToScene } from '@domain/models/scene';
import { createTrack } from '@domain/models/track';
import { createColor } from '@domain/value-objects/color';

describe('addScene', () => {
  it('adds a new scene to a session', () => {
    const session = createSession({ name: 'Campaign' });
    const updated = addScene(session, { name: 'Tavern' });

    expect(updated.scenes).toHaveLength(1);
    expect(updated.scenes[0].name).toBe('Tavern');
  });

  it('adds scene with emoji and color', () => {
    const session = createSession({ name: 'Campaign' });
    const updated = addScene(session, { name: 'Battle', emoji: '⚔️', color: '#ff0000' });

    expect(updated.scenes[0].emoji).toBe('⚔️');
    expect(updated.scenes[0].color).toBe('#ff0000');
  });
});

describe('removeScene', () => {
  it('removes a scene from a session', () => {
    const scene = createScene({ name: 'Tavern' });
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };

    const updated = removeScene(session, scene.id);
    expect(updated.scenes).toHaveLength(0);
  });
});

describe('duplicateScene', () => {
  it('creates a deep copy of a scene with new ids', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'T',
      artist: 'A',
      duration: 1000,
    });
    const scene = addTrackToScene(createScene({ name: 'Battle' }), track);
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };

    const updated = duplicateScene(session, scene.id);

    expect(updated.scenes).toHaveLength(2);
    expect(updated.scenes[1].name).toBe('Battle (copy)');
    expect(updated.scenes[1].id).not.toBe(scene.id);
    expect(updated.scenes[1].tracks).toHaveLength(1);
    expect(updated.scenes[1].tracks[0].id).not.toBe(track.id);
    expect(updated.scenes[1].tracks[0].title).toBe('T');
  });

  it('throws if scene not found', () => {
    const session = createSession({ name: 'C' });
    expect(() => duplicateScene(session, 'nonexistent')).toThrow('Scene not found');
  });
});

describe('updateScene', () => {
  it('updates scene properties', () => {
    const scene = createScene({ name: 'Old' });
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };

    const updated = updateScene(session, scene.id, { name: 'New', emoji: '🏰' });

    expect(updated.scenes[0].name).toBe('New');
    expect(updated.scenes[0].emoji).toBe('🏰');
    expect(updated.scenes[0].id).toBe(scene.id);
  });

  it('throws if scene not found', () => {
    const session = createSession({ name: 'C' });
    expect(() => updateScene(session, 'x', { name: 'N' })).toThrow('Scene not found');
  });
});

describe('addTrack', () => {
  it('adds a track to a scene within a session', () => {
    const scene = createScene({ name: 'S' });
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'T',
      artist: 'A',
      duration: 1000,
    });

    const updated = addTrack(session, scene.id, track);

    expect(updated.scenes[0].tracks).toHaveLength(1);
    expect(updated.scenes[0].tracks[0].id).toBe(track.id);
  });
});

describe('removeTrack', () => {
  it('removes a track from a scene within a session', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'T',
      artist: 'A',
      duration: 1000,
    });
    const scene = addTrackToScene(createScene({ name: 'S' }), track);
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };

    const updated = removeTrack(session, scene.id, track.id);

    expect(updated.scenes[0].tracks).toHaveLength(0);
  });
});

describe('updateTrack', () => {
  it('updates track properties within a session', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'Old',
      artist: 'A',
      duration: 1000,
    });
    const scene = addTrackToScene(createScene({ name: 'S' }), track);
    const session = { ...createSession({ name: 'C' }), scenes: [scene] };

    const updated = updateTrack(session, scene.id, track.id, { volume: 50, loopEnabled: true });

    expect(updated.scenes[0].tracks[0].volume).toBe(50);
    expect(updated.scenes[0].tracks[0].loopEnabled).toBe(true);
    expect(updated.scenes[0].tracks[0].title).toBe('Old');
  });
});

describe('copyTrack', () => {
  it('returns a copy of a track from a scene', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'T',
      artist: 'A',
      duration: 1000,
      volume: 75,
    });
    const scene = addTrackToScene(createScene({ name: 'S' }), track);

    const copy = copyTrack(scene, track.id);

    expect(copy.id).not.toBe(track.id);
    expect(copy.title).toBe('T');
    expect(copy.volume).toBe(75);
  });

  it('throws if track not found', () => {
    const scene = createScene({ name: 'S' });
    expect(() => copyTrack(scene, 'x')).toThrow('Track not found');
  });
});

describe('moveTrack', () => {
  it('removes from source and adds to target', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/a',
      title: 'T',
      artist: 'A',
      duration: 1000,
    });
    const source = addTrackToScene(createScene({ name: 'Source' }), track);
    const target = createScene({ name: 'Target' });
    const session = { ...createSession({ name: 'C' }), scenes: [source, target] };

    const updated = moveTrack(session, source.id, target.id, track.id);

    expect(updated.scenes[0].tracks).toHaveLength(0);
    expect(updated.scenes[1].tracks).toHaveLength(1);
    expect(updated.scenes[1].tracks[0].title).toBe('T');
  });
});
