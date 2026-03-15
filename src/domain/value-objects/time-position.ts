export type TimePosition = number & { readonly __brand: 'TimePosition' };

export function createTimePosition(ms: number): TimePosition {
  const rounded = Math.round(ms);
  if (!Number.isFinite(rounded) || rounded < 0) {
    throw new Error('TimePosition must be non-negative');
  }
  return rounded as TimePosition;
}
