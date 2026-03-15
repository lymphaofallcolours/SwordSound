import { describe, it, expect } from 'vitest';

import { createTimePosition } from './time-position';

describe('TimePosition', () => {
  it('creates a valid time position in milliseconds', () => {
    expect(createTimePosition(5000)).toBe(5000);
  });

  it('accepts zero', () => {
    expect(createTimePosition(0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(createTimePosition(1500.7)).toBe(1501);
  });

  it('throws on negative values', () => {
    expect(() => createTimePosition(-1)).toThrow('TimePosition must be non-negative');
  });

  it('throws on NaN', () => {
    expect(() => createTimePosition(NaN)).toThrow('TimePosition must be non-negative');
  });

  it('throws on Infinity', () => {
    expect(() => createTimePosition(Infinity)).toThrow('TimePosition must be non-negative');
  });
});
