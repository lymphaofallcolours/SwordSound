import { describe, it, expect } from 'vitest';

import { createCueLoop } from './cue-loop';
import { createTimePosition } from '../value-objects/time-position';
import { createFadeDuration } from '../value-objects/fade-duration';

describe('CueLoop', () => {
  it('creates a cue loop with valid start and end positions', () => {
    const cueLoop = createCueLoop({
      startPosition: createTimePosition(5000),
      endPosition: createTimePosition(15000),
    });

    expect(cueLoop.startPosition).toBe(5000);
    expect(cueLoop.endPosition).toBe(15000);
    expect(cueLoop.crossfadeEnabled).toBe(false);
    expect(cueLoop.crossfadeDuration).toBe(0);
  });

  it('generates a unique id', () => {
    const a = createCueLoop({
      startPosition: createTimePosition(0),
      endPosition: createTimePosition(1000),
    });
    const b = createCueLoop({
      startPosition: createTimePosition(0),
      endPosition: createTimePosition(1000),
    });

    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('accepts crossfade configuration', () => {
    const cueLoop = createCueLoop({
      startPosition: createTimePosition(0),
      endPosition: createTimePosition(10000),
      crossfadeEnabled: true,
      crossfadeDuration: createFadeDuration(2.5),
    });

    expect(cueLoop.crossfadeEnabled).toBe(true);
    expect(cueLoop.crossfadeDuration).toBe(2.5);
  });

  it('throws when start position is at or after end position', () => {
    expect(() =>
      createCueLoop({
        startPosition: createTimePosition(10000),
        endPosition: createTimePosition(5000),
      }),
    ).toThrow('Cue loop start must be before end');

    expect(() =>
      createCueLoop({
        startPosition: createTimePosition(5000),
        endPosition: createTimePosition(5000),
      }),
    ).toThrow('Cue loop start must be before end');
  });
});
