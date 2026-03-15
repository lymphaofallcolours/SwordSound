export type Color = string & { readonly __brand: 'Color' };

const HEX_6 = /^#[0-9a-f]{6}$/;
const HEX_3 = /^#[0-9a-f]{3}$/;

export function createColor(hex: string): Color {
  const lower = hex.toLowerCase();

  if (HEX_6.test(lower)) {
    return lower as Color;
  }

  if (HEX_3.test(lower)) {
    const expanded = `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
    return expanded as Color;
  }

  throw new Error('Invalid hex color');
}
