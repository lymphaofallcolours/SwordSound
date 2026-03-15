export type Volume = number & { readonly __brand: 'Volume' };

export const MIN_VOLUME = 0;
export const MAX_VOLUME = 100;

export function createVolume(value: number): Volume {
  const rounded = Math.round(value);
  if (!Number.isFinite(rounded) || rounded < MIN_VOLUME || rounded > MAX_VOLUME) {
    throw new Error('Volume must be between 0 and 100');
  }
  return rounded as Volume;
}
