import { describe, it, expect } from 'vitest';

import { createColor } from './color';

describe('Color', () => {
  it('creates a valid 6-digit hex color', () => {
    expect(createColor('#ff5733')).toBe('#ff5733');
  });

  it('accepts uppercase hex', () => {
    expect(createColor('#FF5733')).toBe('#ff5733');
  });

  it('expands 3-digit shorthand to 6 digits', () => {
    expect(createColor('#f00')).toBe('#ff0000');
  });

  it('accepts black', () => {
    expect(createColor('#000000')).toBe('#000000');
  });

  it('accepts white', () => {
    expect(createColor('#ffffff')).toBe('#ffffff');
  });

  it('throws on invalid hex string', () => {
    expect(() => createColor('not-a-color')).toThrow('Invalid hex color');
  });

  it('throws on missing hash', () => {
    expect(() => createColor('ff5733')).toThrow('Invalid hex color');
  });

  it('throws on wrong length', () => {
    expect(() => createColor('#ff57')).toThrow('Invalid hex color');
  });

  it('throws on empty string', () => {
    expect(() => createColor('')).toThrow('Invalid hex color');
  });
});
