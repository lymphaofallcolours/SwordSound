import { describe, it, expect } from 'vitest';

import { createTrackGroup, DEFAULT_GROUPS } from './track-group';

describe('TrackGroup', () => {
  it('creates a track group with a name', () => {
    const group = createTrackGroup({ name: 'Music' });

    expect(group.id).toBeTruthy();
    expect(group.name).toBe('Music');
    expect(group.volume).toBe(100);
    expect(group.muted).toBe(false);
  });

  it('generates unique ids', () => {
    const a = createTrackGroup({ name: 'A' });
    const b = createTrackGroup({ name: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  it('accepts custom volume', () => {
    const group = createTrackGroup({ name: 'SFX', volume: 80 });
    expect(group.volume).toBe(80);
  });

  it('throws on empty name', () => {
    expect(() => createTrackGroup({ name: '' })).toThrow('Track group name cannot be empty');
  });

  it('provides default group names', () => {
    expect(DEFAULT_GROUPS).toEqual(['Music', 'Ambience', 'Effects']);
  });
});
