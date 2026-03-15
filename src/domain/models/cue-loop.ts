import { v4 as uuidv4 } from 'uuid';

import type { TimePosition } from '../value-objects/time-position';
import type { FadeDuration } from '../value-objects/fade-duration';
import { createFadeDuration } from '../value-objects/fade-duration';

export type CueLoop = {
  readonly id: string;
  readonly startPosition: TimePosition;
  readonly endPosition: TimePosition;
  readonly crossfadeEnabled: boolean;
  readonly crossfadeDuration: FadeDuration;
};

type CreateCueLoopInput = {
  startPosition: TimePosition;
  endPosition: TimePosition;
  crossfadeEnabled?: boolean;
  crossfadeDuration?: FadeDuration;
};

export function createCueLoop(input: CreateCueLoopInput): CueLoop {
  if (input.startPosition >= input.endPosition) {
    throw new Error('Cue loop start must be before end');
  }

  return {
    id: uuidv4(),
    startPosition: input.startPosition,
    endPosition: input.endPosition,
    crossfadeEnabled: input.crossfadeEnabled ?? false,
    crossfadeDuration: input.crossfadeDuration ?? createFadeDuration(0),
  };
}
