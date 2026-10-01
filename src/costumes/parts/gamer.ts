import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

export const GAMER = {
  'pixel-hero': {
    shape: (fill) => `<rect x="13" y="16" width="38" height="38" rx="2" fill="${fill}" ${ink(3)}/>`,
    // Blocky pixel hair.
    skin: () =>
      `<path d="M14.75 17.75H49.25V28H45.5V23.5H41V21H36V24H31V21H26.5V23.5H19V28H14.75Z" fill="${INK}"/>`,
    eyes: () =>
      `<rect x="21.5" y="29" width="5" height="6.5" fill="${INK}"/>` +
      `<rect x="22.5" y="30" width="1.8" height="1.8" fill="${WHITE}"/>` +
      `<rect x="37.5" y="29" width="5" height="6.5" fill="${INK}"/>` +
      `<rect x="38.5" y="30" width="1.8" height="1.8" fill="${WHITE}"/>`,
    // A sword strapped behind the head: the blade out top right, the hilt bottom left.
    back: (p) =>
      `<polygon points="11.56,56.56 57.56,10.56 58.8,6.2 54.44,7.44 8.44,53.44" fill="${WHITE}" ${ink(2.5)}/>` +
      `<polygon points="10.92,55.92 6.42,60.42 4.58,58.58 9.08,54.08" fill="${p.detail}" ${ink(2)}/>` +
      `<polygon points="7.17,50.05 14.95,57.83 12.83,59.95 5.05,52.17" fill="${p.accent}" ${ink(2)}/>` +
      `<circle cx="4.6" cy="60.4" r="2" fill="${p.accent}" ${ink(2)}/>`,
  },
  slime: {
    // A blob dripping at the bottom.
    shape: (fill) =>
      `<path d="M10 49C10 29 18.5 15 32 15C45.5 15 54 29 54 49C54 52.5 51.5 53.5 49.5 52C48.5 55.5 46.5 57.5 44 55.5C42.5 54.5 41.5 53.5 39.5 54C38 58.5 34 59 32.5 55.5C31 53.5 29 53.5 27 54C24 54.5 22.5 52 20 53.5C18 57 14 56.5 14 52.5C11.5 53 10 51.5 10 49Z" fill="${fill}" ${ink(3)}/>`,
    // A wet shine.
    skin: () =>
      `<path d="M18.5 33C18.5 27.5 21 23 25.5 20.5" fill="none" stroke="${WHITE}" stroke-width="2.6"/>` +
      `<circle cx="29" cy="19.6" r="1.4" fill="${WHITE}"/>`,
  },
  mimic: {
    // A treasure chest: a domed lid over a box.
    shape: (fill) => `<path d="M12 30C12 19.5 20 15 32 15C44 15 52 19.5 52 30V54H12Z" fill="${fill}" ${ink(3)}/>`,
    // Gold straps and the seam where the lid opens.
    skin: (p) =>
      `<rect x="15.5" y="26" width="4" height="25" fill="${p.accent}" ${ink(1.8)}/>` +
      `<rect x="44.5" y="26" width="4" height="25" fill="${p.accent}" ${ink(1.8)}/>` +
      `<path d="M15 41H49" fill="none" ${ink(2)}/>`,
    // The lid opens on jagged teeth.
    mouth: () =>
      `<rect x="25" y="41" width="14" height="8" rx="1" fill="${INK}"/>` +
      `<path d="M25.5 41.5H38.5L37 45L35 41.5L33 45L31 41.5L29 45L27 41.5Z" fill="${WHITE}"/>` +
      `<path d="M26.5 48.5L28.5 45.5L30.5 48.5L32.5 45.5L34.5 48.5L36.5 45.5L38 48.5Z" fill="${WHITE}"/>`,
    colors: { body: '#C07E43', accent: '#F2C14E' },
  },
  'final-boss': {
    // A dark spiked crown with gems.
    front: (p) =>
      `<path d="M14 23.5L12.5 8L19.5 14.5L25 3.5L32 12.5L39 3.5L44.5 14.5L51.5 8L50 23.5Z" fill="${INK}" ${ink(2.5)}/>` +
      `<rect x="14.5" y="18.5" width="35" height="4" fill="${p.accent}"/>` +
      `<circle cx="32" cy="17.5" r="2.2" fill="${p.detail}" ${ink(1.5)}/>` +
      `<circle cx="21.5" cy="18.5" r="1.4" fill="${p.detail}"/>` +
      `<circle cx="42.5" cy="18.5" r="1.4" fill="${p.detail}"/>`,
    // Angry brows and a stitched scar over the left eye.
    skin: () =>
      `<path d="M22 25.5L29.5 28.5M42 25.5L34.5 28.5" fill="none" ${ink(3)}/>` +
      `<path d="M21.5 27L27 42" fill="none" ${ink(2)}/>` +
      `<path d="M21.3 32.5L24.8 31.2M23 37L26.5 35.7" fill="none" ${ink(1.5)}/>`,
  },
  glitch: {
    // Shifted color bars, like a broken signal.
    skin: (p) =>
      `<rect x="27" y="22" width="14" height="2.5" fill="${p.accent}"/>` +
      `<rect x="17.5" y="40.5" width="15" height="3" fill="${p.detail}"/>` +
      `<rect x="28" y="46" width="14" height="2.5" fill="${WHITE}"/>` +
      `<rect x="19" y="27" width="8" height="2" fill="${WHITE}"/>`,
    // Mismatched eyes with a color split: a square one and a round one.
    eyes: (p) =>
      `<rect x="21" y="29.5" width="6" height="6" fill="${p.accent}"/>` +
      `<rect x="22.8" y="29.5" width="6" height="6" fill="${INK}"/>` +
      `<circle cx="37.8" cy="33" r="3.6" fill="${p.detail}"/>` +
      `<circle cx="39.6" cy="32.4" r="3.6" fill="${INK}"/>`,
  },
} satisfies Partial<Record<CostumeName, Costume>>;
