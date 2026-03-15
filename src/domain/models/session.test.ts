import { describe, it, expect } from 'vitest';

import { createSession, addSceneToSession, removeSceneFromSession, reorderScenesInSession } from './session';
import { createScene } from './scene';

describe('Session', () => {
  it('creates a session with a name', () => {
    const session = createSession({ name: 'Campaign One' });

    expect(session.id).toBeTruthy();
    expect(session.name).toBe('Campaign One');
    expect(session.scenes).toEqual([]);
    expect(session.createdAt).toBeTruthy();
    expect(session.updatedAt).toBeTruthy();
  });

  it('generates unique ids', () => {
    const a = createSession({ name: 'A' });
    const b = createSession({ name: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  it('throws on empty name', () => {
    expect(() => createSession({ name: '' })).toThrow('Session name cannot be empty');
  });
});

describe('addSceneToSession', () => {
  it('adds a scene to the session', () => {
    const session = createSession({ name: 'S' });
    const scene = createScene({ name: 'Tavern' });

    const updated = addSceneToSession(session, scene);

    expect(updated.scenes).toHaveLength(1);
    expect(updated.scenes[0].id).toBe(scene.id);
  });

  it('does not mutate the original session', () => {
    const session = createSession({ name: 'S' });
    const scene = createScene({ name: 'Tavern' });

    addSceneToSession(session, scene);

    expect(session.scenes).toHaveLength(0);
  });
});

describe('removeSceneFromSession', () => {
  it('removes a scene by id', () => {
    const scene = createScene({ name: 'Tavern' });
    const session = addSceneToSession(createSession({ name: 'S' }), scene);

    const updated = removeSceneFromSession(session, scene.id);

    expect(updated.scenes).toHaveLength(0);
  });

  it('returns session unchanged if scene id not found', () => {
    const session = createSession({ name: 'S' });
    const updated = removeSceneFromSession(session, 'nonexistent');
    expect(updated).toEqual(session);
  });
});

describe('reorderScenesInSession', () => {
  it('reorders scenes by id array', () => {
    const s1 = createScene({ name: 'S1' });
    const s2 = createScene({ name: 'S2' });
    const s3 = createScene({ name: 'S3' });

    let session = createSession({ name: 'Campaign' });
    session = addSceneToSession(session, s1);
    session = addSceneToSession(session, s2);
    session = addSceneToSession(session, s3);

    const reordered = reorderScenesInSession(session, [s3.id, s1.id, s2.id]);

    expect(reordered.scenes.map((s) => s.id)).toEqual([s3.id, s1.id, s2.id]);
  });

  it('throws if id array length does not match scene count', () => {
    const session = addSceneToSession(createSession({ name: 'S' }), createScene({ name: 'X' }));

    expect(() => reorderScenesInSession(session, [])).toThrow('Scene ID list must match session scene count');
  });
});
