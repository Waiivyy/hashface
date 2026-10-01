import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

// One spiral eye, winding in from the outside.
const spiral = (cx: number, cy: number): string =>
  `<path d="M${cx + 4.6} ${cy}C${cx + 4.6} ${cy + 3} ${cx + 2.2} ${cy + 4.8} ${cx - 0.4} ${cy + 4.6}C${cx - 3} ${cy + 4.4} ${cx - 4.6} ${cy + 2} ${cx - 4.2} ${cy - 0.6}C${cx - 3.8} ${cy - 3} ${cx - 1.2} ${cy - 4.2} ${cx + 1} ${cy - 3.4}C${cx + 3} ${cy - 2.6} ${cx + 3} ${cy + 0.4} ${cx + 1.4} ${cy + 1.6}C${cx} ${cy + 2.6} ${cx - 1.8} ${cy + 1.4} ${cx - 1.4} ${cy - 0.2}" fill="none" ${ink(2)}/>`;

export const DEV = {
  'rubber-duck': {
    shape: (fill) => `<circle cx="32" cy="35" r="20.5" fill="${fill}" ${ink(3)}/>`,
    // An orange beak.
    mouth: (p) =>
      `<path d="M25.2 43.2C25.2 41.2 38.8 41.2 38.8 43.2C38.8 46.8 35 48.8 32 48.8C29 48.8 25.2 46.8 25.2 43.2Z" fill="${p.detail}" ${ink(2)}/>` +
      `<path d="M26.6 44.4Q32 46.2 37.4 44.4" fill="none" ${ink(1.5)}/>`,
    // A tuft of hair on top.
    front: (p) =>
      `<path d="M30 20.5C27.5 14.5 29.5 10 34 8.5C32.5 11.5 33.5 13.5 36 15C35.5 17.5 34 19.5 32.5 20.5Z" fill="${p.body}" ${ink(2.5)}/>`,
    colors: { body: '#FFD93B', detail: '#FF9F1C' },
  },
  'coffee-addict': {
    eyes: () => spiral(25, 32.5) + spiral(39, 32.5),
    // Bags under the eyes.
    skin: () => `<path d="M20.5 39.5Q25 42 29.5 39.5M34.5 39.5Q39 42 43.5 39.5" fill="none" ${ink(1.6)}/>`,
    // A steaming mug, held up by the cheek.
    front: (p) =>
      `<path d="M50 39.5C48.5 37.5 51.5 36 50 33.5M54 39.5C52.5 37.5 55.5 36 54 33.5" fill="none" stroke="${WHITE}" stroke-width="1.8"/>` +
      `<path d="M56.5 45.5H58.5C61 45.5 61 51.5 58.5 51.5H56.5" fill="none" ${ink(2.5)}/>` +
      `<rect x="46" y="42" width="11" height="13.5" rx="2" fill="${p.accent}" ${ink(2.5)}/>` +
      `<path d="M47.5 44.5H55.5" fill="none" stroke="${INK}" stroke-width="2"/>`,
  },
  'merge-conflict': {
    shape: (fill) => `<rect x="13" y="15" width="38" height="40" rx="10" fill="${fill}" ${ink(3)}/>`,
    // The right half in another color, with a jagged seam down the middle.
    skin: (p) =>
      `<path d="M32 16.75H41C45.56 16.75 49.25 20.44 49.25 25V45C49.25 49.56 45.56 53.25 41 53.25H32L34 49L30 45L34 41L30 37L34 33L30 29L34 25L30 21Z" fill="${p.accent}"/>` +
      `<path d="M32 18.5L30 21L34 25L30 29L34 33L30 37L34 41L30 45L34 49L32 51.5" fill="none" ${ink(2)}/>`,
  },
  'not-found': {
    // The eyes read 4 and 4, the mouth 0.
    eyes: () =>
      `<path d="M26.5 28L20.5 34.5H29M26.5 28V37.5" fill="none" ${ink(2.6)}/>` +
      `<path d="M40.5 28L34.5 34.5H43M40.5 28V37.5" fill="none" ${ink(2.6)}/>`,
    mouth: () => `<ellipse cx="32" cy="45" rx="3.2" ry="3.6" fill="none" ${ink(2.6)}/>`,
  },
  'infinite-loop': {
    // An infinity sign for eyes, one loop each.
    eyes: () =>
      `<path d="M32 32.5C29 27.5 20.5 27.5 20.5 32.5C20.5 37.5 29 37.5 32 32.5C35 27.5 43.5 27.5 43.5 32.5C43.5 37.5 35 37.5 32 32.5Z" fill="none" ${ink(2.5)}/>` +
      `<circle cx="26" cy="32.5" r="2" fill="${INK}"/>` +
      `<circle cx="38" cy="32.5" r="2" fill="${INK}"/>`,
    // A spinning arrow on the forehead.
    skin: () =>
      `<path d="M35 23.2C35 24.9 33.7 26.2 32 26.2C30.3 26.2 29 24.9 29 23.2C29 21.5 30.3 20.2 32 20.2" fill="none" ${ink(2)}/>` +
      `<path d="M31.5 18.9L33.2 20.2L31.5 21.5" fill="none" ${ink(1.8)}/>`,
  },
} satisfies Partial<Record<CostumeName, Costume>>;
