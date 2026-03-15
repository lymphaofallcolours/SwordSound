import { describe, it, expect } from 'vitest';

import { createVolume, MAX_VOLUME, MIN_VOLUME } from './volume';

describe('Volume', () => {
  it('creates a valid volume from an integer', () => {
    const volume = createVolume(50);
    expect(volume).toBe(50);
  });

  it('accepts minimum volume (0)', () => {
    expect(createVolume(MIN_VOLUME)).toBe(0);
  });

  it('accepts maximum volume (100)', () => {
    expect(createVolume(MAX_VOLUME)).toBe(100);
  });

  it('rounds decimal values to nearest integer', () => {
    expect(createVolume(50.7)).toBe(51);
    expect(createVolume(50.3)).toBe(50);
  });

  it('throws on values below 0', () => {
    expect(() => createVolume(-1)).toThrow('Volume must be between 0 and 100');
  });

  it('throws on values above 100', () => {
    expect(() => createVolume(101)).toThrow('Volume must be between 0 and 100');
  });

  it('throws on NaN', () => {
    expect(() => createVolume(NaN)).toThrow('Volume must be between 0 and 100');
  });
});
