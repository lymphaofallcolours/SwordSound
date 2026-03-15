import { describe, it, expect, beforeEach } from 'vitest';

import { createFakePersistence } from '../../../tests/fixtures/fake-persistence';
import type { PersistencePort } from '@application/ports/persistence-port';
import {
  createNewSession,
  saveSession,
  loadSession,
  deleteSession,
  listSessions,
  exportSession,
  importSession,
} from './session-use-cases';
import { createSession, addSceneToSession } from '@domain/models/session';
import { createScene, addTrackToScene } from '@domain/models/scene';
import { createTrack } from '@domain/models/track';

let persistence: PersistencePort;

beforeEach(() => {
  persistence = createFakePersistence();
});

describe('createNewSession', () => {
  it('creates a session and saves it', async () => {
    const session = await createNewSession(persistence, 'My Campaign');

    expect(session.name).toBe('My Campaign');
    expect(session.scenes).toEqual([]);

    const loaded = await persistence.loadSession(session.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('My Campaign');
  });

  it('throws on empty name', async () => {
    await expect(createNewSession(persistence, '')).rejects.toThrow('Session name cannot be empty');
  });
});

describe('saveSession', () => {
  it('persists a session', async () => {
    const session = createSession({ name: 'Test' });
    await saveSession(persistence, session);

    const loaded = await persistence.loadSession(session.id);
    expect(loaded).toEqual(session);
  });
});

describe('loadSession', () => {
  it('loads an existing session', async () => {
    const session = createSession({ name: 'Test' });
    await persistence.saveSession(session);

    const loaded = await loadSession(persistence, session.id);
    expect(loaded).toEqual(session);
  });

  it('returns null for nonexistent session', async () => {
    const loaded = await loadSession(persistence, 'nonexistent');
    expect(loaded).toBeNull();
  });
});

describe('deleteSession', () => {
  it('removes a session', async () => {
    const session = createSession({ name: 'Test' });
    await persistence.saveSession(session);

    await deleteSession(persistence, session.id);

    const loaded = await persistence.loadSession(session.id);
    expect(loaded).toBeNull();
  });
});

describe('listSessions', () => {
  it('returns summaries of all sessions', async () => {
    const s1 = createSession({ name: 'Campaign A' });
    const s2 = createSession({ name: 'Campaign B' });
    await persistence.saveSession(s1);
    await persistence.saveSession(s2);

    const list = await listSessions(persistence);

    expect(list).toHaveLength(2);
    expect(list.map((s) => s.name).sort()).toEqual(['Campaign A', 'Campaign B']);
  });

  it('returns empty array when no sessions exist', async () => {
    const list = await listSessions(persistence);
    expect(list).toEqual([]);
  });
});

describe('exportSession / importSession', () => {
  it('round-trips a session through export and import', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/artist/track',
      title: 'Epic',
      artist: 'Composer',
      duration: 180000,
      volume: 80,
      loopEnabled: true,
    });
    const scene = addTrackToScene(
      createScene({ name: 'Battle', emoji: '⚔️' }),
      track,
    );
    const session = addSceneToSession(createSession({ name: 'Campaign' }), scene);

    const json = exportSession(session);
    const imported = importSession(json);

    expect(imported.name).toBe('Campaign');
    expect(imported.scenes).toHaveLength(1);
    expect(imported.scenes[0].name).toBe('Battle');
    expect(imported.scenes[0].emoji).toBe('⚔️');
    expect(imported.scenes[0].tracks).toHaveLength(1);
    expect(imported.scenes[0].tracks[0].title).toBe('Epic');
    expect(imported.scenes[0].tracks[0].volume).toBe(80);
    expect(imported.scenes[0].tracks[0].loopEnabled).toBe(true);
  });

  it('throws on invalid JSON', () => {
    expect(() => importSession('not json')).toThrow('Invalid session data');
  });

  it('throws on missing required fields', () => {
    expect(() => importSession(JSON.stringify({ foo: 'bar' }))).toThrow('Invalid session data');
  });
});
