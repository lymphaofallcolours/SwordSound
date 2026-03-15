import { describe, it, expect } from 'vitest';

import { createFadeDuration, MAX_FADE_DURATION, MIN_FADE_DURATION } from './fade-duration';

describe('FadeDuration', () => {
  it('creates a valid fade duration in seconds', () => {
    expect(createFadeDuration(3)).toBe(3);
  });

  it('accepts minimum (0)', () => {
    expect(createFadeDuration(MIN_FADE_DURATION)).toBe(0);
  });

  it('accepts maximum (10)', () => {
    expect(createFadeDuration(MAX_FADE_DURATION)).toBe(10);
  });

  it('preserves decimal precision', () => {
    expect(createFadeDuration(2.5)).toBe(2.5);
  });

  it('throws on negative values', () => {
    expect(() => createFadeDuration(-0.1)).toThrow('FadeDuration must be between 0 and 10 seconds');
  });

  it('throws on values above 10', () => {
    expect(() => createFadeDuration(10.1)).toThrow('FadeDuration must be between 0 and 10 seconds');
  });

  it('throws on NaN', () => {
    expect(() => createFadeDuration(NaN)).toThrow('FadeDuration must be between 0 and 10 seconds');
  });
});
