import { describe, it, expect } from 'vitest';

import { createScene, addTrackToScene, removeTrackFromScene, reorderTracksInScene } from './scene';
import { createTrack } from './track';
import { createColor } from '../value-objects/color';

describe('Scene', () => {
  it('creates a scene with a name and default color', () => {
    const scene = createScene({ name: 'Tavern' });

    expect(scene.id).toBeTruthy();
    expect(scene.name).toBe('Tavern');
    expect(scene.emoji).toBeNull();
    expect(scene.color).toBeTruthy();
    expect(scene.tracks).toEqual([]);
    expect(scene.groups).toEqual([]);
    expect(scene.notes).toBe('');
  });

  it('accepts optional emoji and color', () => {
    const scene = createScene({
      name: 'Battle',
      emoji: '⚔️',
      color: createColor('#ff0000'),
    });

    expect(scene.emoji).toBe('⚔️');
    expect(scene.color).toBe('#ff0000');
  });

  it('generates unique ids', () => {
    const a = createScene({ name: 'A' });
    const b = createScene({ name: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  it('throws on empty name', () => {
    expect(() => createScene({ name: '' })).toThrow('Scene name cannot be empty');
  });

  it('accepts notes', () => {
    const scene = createScene({ name: 'Ambush', notes: 'Trigger when players leave the road' });
    expect(scene.notes).toBe('Trigger when players leave the road');
  });
});

describe('addTrackToScene', () => {
  it('adds a track to the scene', () => {
    const scene = createScene({ name: 'Tavern' });
    const track = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T', artist: 'A', duration: 1000 });

    const updated = addTrackToScene(scene, track);

    expect(updated.tracks).toHaveLength(1);
    expect(updated.tracks[0].id).toBe(track.id);
  });

  it('preserves existing tracks', () => {
    const track1 = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T1', artist: 'A', duration: 1000 });
    const track2 = createTrack({ soundcloudUrl: 'https://soundcloud.com/b', title: 'T2', artist: 'A', duration: 2000 });
    const scene = createScene({ name: 'S' });

    const step1 = addTrackToScene(scene, track1);
    const step2 = addTrackToScene(step1, track2);

    expect(step2.tracks).toHaveLength(2);
    expect(step2.tracks[0].id).toBe(track1.id);
    expect(step2.tracks[1].id).toBe(track2.id);
  });

  it('does not mutate the original scene', () => {
    const scene = createScene({ name: 'S' });
    const track = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T', artist: 'A', duration: 1000 });

    addTrackToScene(scene, track);

    expect(scene.tracks).toHaveLength(0);
  });
});

describe('removeTrackFromScene', () => {
  it('removes a track by id', () => {
    const track = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T', artist: 'A', duration: 1000 });
    const scene = addTrackToScene(createScene({ name: 'S' }), track);

    const updated = removeTrackFromScene(scene, track.id);

    expect(updated.tracks).toHaveLength(0);
  });

  it('returns scene unchanged if track id not found', () => {
    const scene = createScene({ name: 'S' });
    const updated = removeTrackFromScene(scene, 'nonexistent');
    expect(updated).toEqual(scene);
  });
});

describe('reorderTracksInScene', () => {
  it('reorders tracks by id array', () => {
    const t1 = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T1', artist: 'A', duration: 1000 });
    const t2 = createTrack({ soundcloudUrl: 'https://soundcloud.com/b', title: 'T2', artist: 'A', duration: 2000 });
    const t3 = createTrack({ soundcloudUrl: 'https://soundcloud.com/c', title: 'T3', artist: 'A', duration: 3000 });

    let scene = createScene({ name: 'S' });
    scene = addTrackToScene(scene, t1);
    scene = addTrackToScene(scene, t2);
    scene = addTrackToScene(scene, t3);

    const reordered = reorderTracksInScene(scene, [t3.id, t1.id, t2.id]);

    expect(reordered.tracks.map((t) => t.id)).toEqual([t3.id, t1.id, t2.id]);
  });

  it('throws if id array length does not match track count', () => {
    const t1 = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T1', artist: 'A', duration: 1000 });
    const scene = addTrackToScene(createScene({ name: 'S' }), t1);

    expect(() => reorderTracksInScene(scene, [])).toThrow('Track ID list must match scene track count');
  });
});
