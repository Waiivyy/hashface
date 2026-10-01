import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink, star } from './draw.ts';

// A beard in two layers: the middle sits under the mouth (skin), the tufts frame
// it and hang below the chin (front), never touching the mouth zone.
const beardMiddle = (fill: string): string =>
  `<path d="M22 40.5C22 46.5 26 51 32 51C38 51 42 46.5 42 40.5C38.5 42 35 42 32 41C29 42 25.5 42 22 40.5Z" fill="${fill}" ${ink(2.5)}/>`;

const LONG_BEARD =
  'M17 51.5C16.5 56 20 59.5 24.5 59C27 62 29.5 62.5 32 61.5C34.5 62.5 37 62 39.5 59C44 59.5 47.5 56 47 51.5C41 54 23 54 17 51.5Z';

const beardTufts = (fill: string, bottom = LONG_BEARD): string =>
  `<path d="M22.5 40.5C17.5 40.5 14 43 14.5 47.5C15 51.5 18.5 53.5 22.5 52.5Z" fill="${fill}" ${ink(2.5)}/>` +
  `<path d="M41.5 40.5C46.5 40.5 50 43 49.5 47.5C49 51.5 45.5 53.5 41.5 52.5Z" fill="${fill}" ${ink(2.5)}/>` +
  `<path d="${bottom}" fill="${fill}" ${ink(2.5)}/>`;

export const CLASSICS = {
  pirate: {
    // An eyepatch whose strap runs up under the bandana, and one fierce eye.
    eyes: () =>
      `<path d="M19.5 29C19.5 27.5 30.5 27.5 30.5 29C30.5 34.5 28.5 37.5 25 37.5C21.5 37.5 19.5 34.5 19.5 29Z" fill="${INK}"/>` +
      `<path d="M29 28.4L33 27" fill="none" ${ink(2)}/>` +
      `<circle cx="39" cy="33" r="3.5" fill="${INK}"/>` +
      `<path d="M35.5 28.8L43 27.6" fill="none" ${ink(2.5)}/>`,
    front: (p) =>
      `<path d="M52 22.5L59.5 31.5L54.5 33Z" fill="${p.detail}" ${ink(2.5)}/>` +
      `<path d="M53 21L61.5 24L59 28.5Z" fill="${p.detail}" ${ink(2.5)}/>` +
      `<path d="M11.5 24.5C11.5 14.5 20.5 9.5 32 9.5C43.5 9.5 52.5 14.5 52.5 24.5Z" fill="${p.detail}" ${ink(2.5)}/>` +
      `<circle cx="19" cy="19" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="26" cy="14" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="34.5" cy="13" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="42" cy="16.5" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="29" cy="20.5" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="38" cy="21" r="1.4" fill="${WHITE}"/>` +
      `<circle cx="50.5" cy="21.5" r="3" fill="${p.detail}" ${ink(2.5)}/>`,
  },
  wizard: {
    front: (p) =>
      `<path d="M16.5 21.5C21 15 25 9 29.5 5C32.5 2.5 37 2 42.5 4C38.5 5 36 7 35.5 10C38.5 14 43 18 47.5 21.5Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<polygon points="${star(28.5, 14.5, 3.4)}" fill="${WHITE}" ${ink(1.2)}/>` +
      `<polygon points="${star(37.5, 18, 2.2)}" fill="${WHITE}" ${ink(1.2)}/>` +
      `<polygon points="${star(33.5, 8.5, 1.6)}" fill="${WHITE}" ${ink(1)}/>` +
      `<ellipse cx="32" cy="21.5" rx="24" ry="3" fill="${p.accent}" ${ink(2.5)}/>` +
      beardTufts(WHITE),
    // The middle of the big white beard, under the mouth; the tufts hang in front.
    skin: () => beardMiddle(WHITE),
  },
  knight: {
    shape: (fill) =>
      `<path d="M13 31C13 20.5 21.5 14 32 14C42.5 14 51 20.5 51 31V52C51 55.5 48.5 58 45 58H19C15.5 58 13 55.5 13 52Z" fill="${fill}" ${ink(3)}/>`,
    // The visor: an eye slit, a center ridge and breathing holes.
    skin: (p) =>
      `<rect x="16" y="27.5" width="32" height="9.5" fill="${p.accent}" ${ink(2)}/>` +
      `<path d="M32 17V25" fill="none" ${ink(2)}/>` +
      `<circle cx="19.5" cy="43" r="1.2" fill="${INK}"/>` +
      `<circle cx="19.5" cy="47.5" r="1.2" fill="${INK}"/>` +
      `<circle cx="44.5" cy="43" r="1.2" fill="${INK}"/>` +
      `<circle cx="44.5" cy="47.5" r="1.2" fill="${INK}"/>`,
    front: (p) =>
      `<path d="M30 13C25 9 25.5 3 31 1.8C33 4.5 37 5 41 3.5C40 7.5 37 10.5 34 13Z" fill="${p.detail}" ${ink(2.5)}/>` +
      `<rect x="29" y="11.5" width="6" height="8" rx="1.5" fill="${p.accent}" ${ink(2.5)}/>`,
    colors: { body: '#D3D9E1', accent: '#8F9AAA' },
  },
  ninja: {
    shape: (fill) => `<rect x="13" y="15" width="38" height="40" rx="11" fill="${fill}" ${ink(3)}/>`,
    // A dark hood over the whole head, open around the eyes.
    skin: (p) =>
      `<rect x="14.75" y="16.75" width="34.5" height="36.5" rx="9.25" fill="${p.accent}"/>` +
      `<rect x="17" y="26" width="30" height="13" rx="6.5" fill="${p.body}"/>`,
    // The mouth stays under the mask: just a fold in the cloth.
    mouth: (p) => `<path d="M27 44.5Q32 47 37 44.5" fill="none" stroke="${p.detail}" stroke-width="2"/>`,
    colors: { accent: '#2F3346', detail: '#5A6180' },
  },
  viking: {
    front: (p) =>
      `<path d="M14.5 20.5C7.5 19.5 3.5 13.5 5 4.5C8 10 11.5 12.5 16.5 13.5Z" fill="${WHITE}" ${ink(2.5)}/>` +
      `<path d="M49.5 20.5C56.5 19.5 60.5 13.5 59 4.5C56 10 52.5 12.5 47.5 13.5Z" fill="${WHITE}" ${ink(2.5)}/>` +
      `<path d="M12 22C12 14 21 9.5 32 9.5C43 9.5 52 14 52 22Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<path d="M32 10V20" fill="none" ${ink(2)}/>` +
      `<rect x="11" y="20" width="42" height="4.5" rx="1" fill="${p.accent}" ${ink(2.5)}/>` +
      `<circle cx="17" cy="22.25" r="0.9" fill="${INK}"/>` +
      `<circle cx="32" cy="22.25" r="0.9" fill="${INK}"/>` +
      `<circle cx="47" cy="22.25" r="0.9" fill="${INK}"/>` +
      beardTufts(p.detail, 'M17 51.5C16.5 55 19.5 57.5 23.5 57C26 59 29 59.5 32 58.5C35 59.5 38 59 40.5 57C44.5 57.5 47.5 55 47 51.5C41 54 23 54 17 51.5Z') +
      `<ellipse cx="32" cy="58.8" rx="2.6" ry="1.8" fill="${p.detail}" ${ink(1.5)}/>` +
      `<ellipse cx="32" cy="61.6" rx="2.1" ry="1.5" fill="${p.detail}" ${ink(1.5)}/>`,
    // A braided ginger beard.
    skin: (p) => beardMiddle(p.detail),
    colors: { accent: '#B9C2CE', detail: '#E8833A' },
  },
  astronaut: {
    // A glass helmet, tinted with the pattern color.
    back: (p) => `<circle cx="32" cy="33" r="28" fill="${p.pattern}" ${ink(3)}/>`,
    front: () =>
      `<path d="M10.5 23.5C11.5 17 15 12 20.5 9" fill="none" stroke="${WHITE}" stroke-width="3"/>` +
      `<circle cx="24.5" cy="7.5" r="1.5" fill="${WHITE}"/>` +
      `<path d="M12 61C13 56 21 52.5 32 52.5C43 52.5 51 56 52 61Z" fill="${WHITE}" ${ink(3)}/>`,
  },
} satisfies Partial<Record<CostumeName, Costume>>;
