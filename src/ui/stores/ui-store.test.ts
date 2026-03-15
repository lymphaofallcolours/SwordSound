import { describe, it, expect } from 'vitest';

import { createUiStore } from './ui-store';

describe('uiStore', () => {
  it('starts with sidebar open and widget panel closed', () => {
    const store = createUiStore();
    const state = store.getState();

    expect(state.sidebarOpen).toBe(true);
    expect(state.widgetPanelOpen).toBe(false);
    expect(state.activeModal).toBeNull();
  });

  it('toggles sidebar', () => {
    const store = createUiStore();

    store.getState().toggleSidebar();
    expect(store.getState().sidebarOpen).toBe(false);

    store.getState().toggleSidebar();
    expect(store.getState().sidebarOpen).toBe(true);
  });

  it('opens and closes modals', () => {
    const store = createUiStore();

    store.getState().openModal('create-session');
    expect(store.getState().activeModal).toBe('create-session');

    store.getState().closeModal();
    expect(store.getState().activeModal).toBeNull();
  });

  it('passes modal data', () => {
    const store = createUiStore();

    store.getState().openModal('confirm-delete', { sceneId: '123' });
    expect(store.getState().modalData).toEqual({ sceneId: '123' });
  });
});
