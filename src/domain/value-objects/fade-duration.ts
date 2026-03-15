export type FadeDuration = number & { readonly __brand: 'FadeDuration' };

export const MIN_FADE_DURATION = 0;
export const MAX_FADE_DURATION = 10;

export function createFadeDuration(seconds: number): FadeDuration {
  if (!Number.isFinite(seconds) || seconds < MIN_FADE_DURATION || seconds > MAX_FADE_DURATION) {
    throw new Error('FadeDuration must be between 0 and 10 seconds');
  }
  return seconds as FadeDuration;
}
