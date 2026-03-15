import { v4 as uuidv4 } from 'uuid';

import type { Volume } from '../value-objects/volume';
import type { TimePosition } from '../value-objects/time-position';
import type { FadeDuration } from '../value-objects/fade-duration';
import { createVolume } from '../value-objects/volume';
import { createTimePosition } from '../value-objects/time-position';
import { createFadeDuration } from '../value-objects/fade-duration';
import type { CueLoop } from './cue-loop';

export type Track = {
  readonly id: string;
  readonly soundcloudUrl: string;
  readonly title: string;
  readonly artist: string;
  readonly artworkUrl: string | null;
  readonly duration: TimePosition;
  readonly volume: Volume;
  readonly muted: boolean;
  readonly loopEnabled: boolean;
  readonly crossfadeLoop: boolean;
  readonly crossfadeDuration: FadeDuration;
  readonly customStart: TimePosition;
  readonly customEnd: TimePosition | null;
  readonly cueLoops: readonly CueLoop[];
  readonly groupId: string | null;
  readonly isOneShot: boolean;
  readonly autoPlay: boolean;
};

type CreateTrackInput = {
  soundcloudUrl: string;
  title: string;
  artist: string;
  duration: number;
  artworkUrl?: string | null;
  volume?: number;
  muted?: boolean;
  loopEnabled?: boolean;
  crossfadeLoop?: boolean;
  crossfadeDuration?: number;
  customStart?: number;
  customEnd?: number | null;
  cueLoops?: CueLoop[];
  groupId?: string | null;
  isOneShot?: boolean;
  autoPlay?: boolean;
};

export function createTrack(input: CreateTrackInput): Track {
  if (!input.soundcloudUrl.trim()) {
    throw new Error('SoundCloud URL is required');
  }
  if (input.duration <= 0) {
    throw new Error('Track duration must be positive');
  }

  return {
    id: uuidv4(),
    soundcloudUrl: input.soundcloudUrl.trim(),
    title: input.title,
    artist: input.artist,
    artworkUrl: input.artworkUrl ?? null,
    duration: createTimePosition(input.duration),
    volume: createVolume(input.volume ?? 100),
    muted: input.muted ?? false,
    loopEnabled: input.loopEnabled ?? false,
    crossfadeLoop: input.crossfadeLoop ?? false,
    crossfadeDuration: createFadeDuration(input.crossfadeDuration ?? 0),
    customStart: createTimePosition(input.customStart ?? 0),
    customEnd: input.customEnd != null ? createTimePosition(input.customEnd) : null,
    cueLoops: input.cueLoops ?? [],
    groupId: input.groupId ?? null,
    isOneShot: input.isOneShot ?? false,
    autoPlay: input.autoPlay ?? false,
  };
}
