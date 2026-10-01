/** Small drawing helpers shared by the costume files. */

import { INK } from '../../palettes.ts';

/** Ink stroke attributes of the given width. */
export const ink = (width: number): string => `stroke="${INK}" stroke-width="${width}"`;

// A five-pointed star with outer radius 1 and inner radius 0.45, point up.
// Stored as numbers so the output never depends on Math.sin rounding.
const STAR: readonly (readonly [number, number])[] = [
  [0, -1],
  [0.2645, -0.3641],
  [0.9511, -0.309],
  [0.428, 0.1391],
  [0.5878, 0.809],
  [0, 0.45],
  [-0.5878, 0.809],
  [-0.428, 0.1391],
  [-0.9511, -0.309],
  [-0.2645, -0.3641],
];

const round = (value: number): number => Math.round(value * 100) / 100;

/** The points attribute of a five-pointed star centered at (cx, cy). */
export const star = (cx: number, cy: number, r: number): string =>
  STAR.map(([x, y]) => `${round(cx + x * r)},${round(cy + y * r)}`).join(' ');
