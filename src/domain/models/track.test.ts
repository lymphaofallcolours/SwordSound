import { describe, it, expect } from 'vitest';

import { createTrack } from './track';

describe('Track', () => {
  it('creates a track with a SoundCloud URL and metadata', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/artist/track',
      title: 'Epic Battle',
      artist: 'Composer',
      duration: 180000,
    });

    expect(track.id).toBeTruthy();
    expect(track.soundcloudUrl).toBe('https://soundcloud.com/artist/track');
    expect(track.title).toBe('Epic Battle');
    expect(track.artist).toBe('Composer');
    expect(track.duration).toBe(180000);
  });

  it('sets sensible defaults', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/artist/track',
      title: 'Track',
      artist: 'Artist',
      duration: 60000,
    });

    expect(track.volume).toBe(100);
    expect(track.muted).toBe(false);
    expect(track.loopEnabled).toBe(false);
    expect(track.crossfadeLoop).toBe(false);
    expect(track.crossfadeDuration).toBe(0);
    expect(track.customStart).toBe(0);
    expect(track.customEnd).toBeNull();
    expect(track.cueLoops).toEqual([]);
    expect(track.groupId).toBeNull();
    expect(track.isOneShot).toBe(false);
    expect(track.autoPlay).toBe(false);
    expect(track.artworkUrl).toBeNull();
  });

  it('generates unique ids', () => {
    const a = createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'A', artist: 'A', duration: 1000 });
    const b = createTrack({ soundcloudUrl: 'https://soundcloud.com/b', title: 'B', artist: 'B', duration: 1000 });
    expect(a.id).not.toBe(b.id);
  });

  it('accepts optional fields', () => {
    const track = createTrack({
      soundcloudUrl: 'https://soundcloud.com/artist/track',
      title: 'Track',
      artist: 'Artist',
      duration: 120000,
      artworkUrl: 'https://example.com/art.jpg',
      volume: 75,
      loopEnabled: true,
      isOneShot: true,
      autoPlay: true,
      groupId: 'group-1',
    });

    expect(track.artworkUrl).toBe('https://example.com/art.jpg');
    expect(track.volume).toBe(75);
    expect(track.loopEnabled).toBe(true);
    expect(track.isOneShot).toBe(true);
    expect(track.autoPlay).toBe(true);
    expect(track.groupId).toBe('group-1');
  });

  it('throws on empty SoundCloud URL', () => {
    expect(() =>
      createTrack({ soundcloudUrl: '', title: 'T', artist: 'A', duration: 1000 }),
    ).toThrow('SoundCloud URL is required');
  });

  it('throws on non-positive duration', () => {
    expect(() =>
      createTrack({ soundcloudUrl: 'https://soundcloud.com/a', title: 'T', artist: 'A', duration: 0 }),
    ).toThrow('Track duration must be positive');
  });
});
