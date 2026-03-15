import { v4 as uuidv4 } from 'uuid';

import type { Volume } from '../value-objects/volume';
import { createVolume } from '../value-objects/volume';

export type TrackGroup = {
  readonly id: string;
  readonly name: string;
  readonly volume: Volume;
  readonly muted: boolean;
};

type CreateTrackGroupInput = {
  name: string;
  volume?: number;
  muted?: boolean;
};

export const DEFAULT_GROUPS = ['Music', 'Ambience', 'Effects'] as const;

export function createTrackGroup(input: CreateTrackGroupInput): TrackGroup {
  if (!input.name.trim()) {
    throw new Error('Track group name cannot be empty');
  }

  return {
    id: uuidv4(),
    name: input.name.trim(),
    volume: createVolume(input.volume ?? 100),
    muted: input.muted ?? false,
  };
}
