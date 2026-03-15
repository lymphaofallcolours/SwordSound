import { describe, it, expect, vi } from 'vitest';

import { panic } from './playback-use-cases';
import type { AudioPlayerPort } from '@application/ports/audio-player-port';

function createFakeAudioPlayer(): AudioPlayerPort {
  return {
    loadTrack: vi.fn(),
    unloadTrack: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    seekTo: vi.fn(),
    setVolume: vi.fn(),
    getPosition: vi.fn().mockReturnValue(0),
    getState: vi.fn().mockReturnValue('stopped'),
    onPositionChange: vi.fn().mockReturnValue(() => {}),
    onStateChange: vi.fn().mockReturnValue(() => {}),
    onFinish: vi.fn().mockReturnValue(() => {}),
    stopAll: vi.fn(),
  };
}

describe('panic', () => {
  it('calls stopAll on the audio player', () => {
    const player = createFakeAudioPlayer();

    panic(player);

    expect(player.stopAll).toHaveBeenCalledOnce();
  });
});
