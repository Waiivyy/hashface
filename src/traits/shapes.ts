/**
 * Head silhouettes. Each is one element with an ink outline, drawn twice by
 * the composer: once in ink as the offset shadow, once in the body color.
 *
 * Every shape contains the eyes zone (x 19 to 45, y 26 to 39) and the mouth
 * zone (x 24 to 40, y 40 to 50) with room to spare, and its top edge sits
 * between y 12 and y 18 so accessories rest on it. test/zones.test.ts checks.
 */

import type { ShapeName } from '../catalog.ts';
import { INK } from '../palettes.ts';
import type { ShapeDraw } from './types.ts';

const outline = `stroke="${INK}" stroke-width="3"`;

export const SHAPES: Readonly<Record<ShapeName, ShapeDraw>> = {
  square: (fill) => `<rect x="13" y="16" width="38" height="38" rx="9" fill="${fill}" ${outline}/>`,
  circle: (fill) => `<circle cx="32" cy="35" r="20" fill="${fill}" ${outline}/>`,
  hexagon: (fill) => `<polygon points="32,14 51,25 51,47 32,58 13,47 13,25" fill="${fill}" ${outline}/>`,
  capsule: (fill) => `<rect x="14" y="12" width="36" height="46" rx="18" fill="${fill}" ${outline}/>`,
  // Bleeds off the bottom edge, like a bust.
  arch: (fill) => `<path d="M13 67V35C13 24.51 21.51 16 32 16C42.49 16 51 24.51 51 35V67Z" fill="${fill}" ${outline}/>`,
  octagon: (fill) => `<polygon points="24,15 40,15 51,26 51,44 40,55 24,55 13,44 13,26" fill="${fill}" ${outline}/>`,
  drop: (fill) =>
    `<path d="M32 12C42 17 51 21 51 37C51 47.49 42.49 56 32 56C21.51 56 13 47.49 13 37C13 21 22 17 32 12Z" fill="${fill}" ${outline}/>`,
  ghost: (fill) =>
    `<path d="M12 60V34C12 22.95 20.95 14 32 14C43.05 14 52 22.95 52 34V60L47 55L42 60L37 55L32 60L27 55L22 60L17 55Z" fill="${fill}" ${outline}/>`,
};
