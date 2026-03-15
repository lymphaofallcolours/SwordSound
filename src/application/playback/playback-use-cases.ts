import type { AudioPlayerPort } from '@application/ports/audio-player-port';

export function panic(audioPlayer: AudioPlayerPort): void {
  audioPlayer.stopAll();
}
