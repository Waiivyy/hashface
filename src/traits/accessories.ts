/**
 * Accessories. Parts in `back` are drawn behind the head, which hides wherever
 * they overlap it; parts in `front` are drawn over the face layer and never
 * touch the eyes or mouth zones. Every accessory reaches down to at least
 * y 19, below the lowest head top, so it rests on any head shape.
 */

import type { AccessoryName } from '../catalog.ts';
import { INK } from '../palettes.ts';
import type { AccessoryDraw } from './types.ts';

const ink = (width: number) => `stroke="${INK}" stroke-width="${width}"`;

export const ACCESSORIES: Readonly<Record<AccessoryName, AccessoryDraw>> = {
  none: {},
  antenna: {
    back: (p) =>
      `<path d="M32 22V9" fill="none" ${ink(3)}/>` + `<circle cx="32" cy="6.5" r="3.5" fill="${p.accent}" ${ink(2.5)}/>`,
  },
  'party-hat': {
    front: (p) =>
      `<path d="M22 20L32 5L42 20Z" fill="${p.accent}" ${ink(3)}/>` +
      `<circle cx="32" cy="5" r="2.8" fill="${p.detail}" ${ink(2.5)}/>`,
  },
  bow: {
    front: (p) =>
      `<path d="M42 18L35 13.5L35.5 22.5Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<path d="M42 18L49 13.5L48.5 22.5Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<circle cx="42" cy="18" r="2.4" fill="${p.accent}" ${ink(2.5)}/>`,
  },
  headphones: {
    back: () => `<path d="M8 37C8 21.5 16.5 9 32 9C47.5 9 56 21.5 56 37" fill="none" ${ink(4)}/>`,
    front: (p) =>
      `<rect x="6" y="29" width="9" height="15" rx="3" fill="${p.accent}" ${ink(3)}/>` +
      `<rect x="49" y="29" width="9" height="15" rx="3" fill="${p.accent}" ${ink(3)}/>`,
  },
  crown: {
    front: (p) =>
      `<path d="M21 21V9L26.5 14.5L32 7L37.5 14.5L43 9V21Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<circle cx="32" cy="17" r="1.8" fill="${p.detail}"/>`,
  },
  sprout: {
    back: (p) =>
      `<path d="M32 22V10" fill="none" ${ink(3)}/>` +
      `<path d="M32 10C27 10 24 7 23 3C28 3 31 6 32 10Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<path d="M32 10C37 10 40 7 41 3C36 3 33 6 32 10Z" fill="${p.accent}" ${ink(2.5)}/>`,
  },
  horns: {
    back: (p) =>
      `<path d="M20 25C16 18 14 12 14 6C19 10 24 14 28 20Z" fill="${p.accent}" ${ink(3)}/>` +
      `<path d="M44 25C48 18 50 12 50 6C45 10 40 14 36 20Z" fill="${p.accent}" ${ink(3)}/>`,
  },
};
