import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { createSessionStore } from './session-store';
import { createFakePersistence } from '../../../tests/fixtures/fake-persistence';
import type { PersistencePort } from '@application/ports/persistence-port';

let persistence: PersistencePort;

beforeEach(() => {
  persistence = createFakePersistence();
});

describe('sessionStore', () => {
  it('starts with no session and empty list', () => {
    const store = createSessionStore(persistence);
    const state = store.getState();

    expect(state.currentSession).toBeNull();
    expect(state.sessionList).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('creates a new session', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('My Campaign');
    });

    const state = store.getState();
    expect(state.currentSession).not.toBeNull();
    expect(state.currentSession!.name).toBe('My Campaign');
  });

  it('saves and loads a session', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('Test');
    });

    const sessionId = store.getState().currentSession!.id;

    // Create a new store instance to simulate app restart
    const store2 = createSessionStore(persistence);

    await act(async () => {
      await store2.getState().loadSession(sessionId);
    });

    expect(store2.getState().currentSession!.name).toBe('Test');
  });

  it('refreshes the session list', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('Campaign A');
      await store.getState().createSession('Campaign B');
      await store.getState().refreshSessionList();
    });

    expect(store.getState().sessionList).toHaveLength(2);
  });

  it('deletes a session', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('To Delete');
    });

    const id = store.getState().currentSession!.id;

    await act(async () => {
      await store.getState().deleteSession(id);
    });

    expect(store.getState().currentSession).toBeNull();
  });

  it('adds a scene to the current session', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('Campaign');
      store.getState().addScene('Tavern');
    });

    expect(store.getState().currentSession!.scenes).toHaveLength(1);
    expect(store.getState().currentSession!.scenes[0].name).toBe('Tavern');
  });

  it('removes a scene from the current session', async () => {
    const store = createSessionStore(persistence);

    await act(async () => {
      await store.getState().createSession('Campaign');
      store.getState().addScene('Tavern');
    });

    const sceneId = store.getState().currentSession!.scenes[0].id;

    act(() => {
      store.getState().removeScene(sceneId);
    });

    expect(store.getState().currentSession!.scenes).toHaveLength(0);
  });
});
