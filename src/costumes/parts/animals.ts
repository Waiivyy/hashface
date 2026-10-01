import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

// Whiskers poke out past the cheeks, below the eyes zone and beside the mouth zone.
const whiskers = (): string =>
  `<path d="M23 41.5L10.5 40.2M23 44L11 46.5" fill="none" ${ink(1.5)}/>` +
  `<path d="M41 41.5L53.5 40.2M41 44L53 46.5" fill="none" ${ink(1.5)}/>`;

export const ANIMALS = {
  cat: {
    // Pointed ears behind the head, in the head's own color.
    back: (p) =>
      `<path d="M12.5 25L14 5.5L29 16Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M15.5 19L16.3 10.5L23.5 15.5Z" fill="${p.detail}"/>` +
      `<path d="M51.5 25L50 5.5L35 16Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M48.5 19L47.7 10.5L40.5 15.5Z" fill="${p.detail}"/>`,
    front: whiskers,
    skin: () => `<path d="M29.8 37.8H34.2L32 40.4Z" fill="${INK}" ${ink(1.2)}/>`,
  },
  frog: {
    // A wide head whose eyes sit in two bumps on top.
    shape: (fill) =>
      `<path d="M9 42C9 50 18 55 32 55C46 55 55 50 55 42C55 36 52.5 32 48.5 30C48.5 23 44.5 18 39.5 18C35.5 18 33 20 32 22C31 20 28.5 18 24.5 18C19.5 18 15.5 23 15.5 30C11.5 32 9 36 9 42Z" fill="${fill}" ${ink(3)}/>`,
    // Nostrils over a wide grin.
    mouth: () =>
      `<circle cx="29.5" cy="41.3" r="0.9" fill="${INK}"/>` +
      `<circle cx="34.5" cy="41.3" r="0.9" fill="${INK}"/>` +
      `<path d="M25.5 43.5C28.3 48.5 35.7 48.5 38.5 43.5" fill="none" ${ink(3)}/>`,
    colors: { body: '#6CCB5F' },
  },
  panda: {
    back: () =>
      `<circle cx="15.5" cy="18" r="6.5" fill="${INK}" ${ink(3)}/>` + `<circle cx="48.5" cy="18" r="6.5" fill="${INK}" ${ink(3)}/>`,
    // Black eye patches and nose; the eyes shine out of the patches.
    skin: () =>
      `<path d="M19.5 27.5C22.5 24.5 28.5 26 30.5 31C32 35 30 40 26 40C21.5 40 17.5 35.5 17.5 31C17.5 29.5 18.5 28.5 19.5 27.5Z" fill="${INK}"/>` +
      `<path d="M44.5 27.5C41.5 24.5 35.5 26 33.5 31C32 35 34 40 38 40C42.5 40 46.5 35.5 46.5 31C46.5 29.5 45.5 28.5 44.5 27.5Z" fill="${INK}"/>` +
      `<ellipse cx="32" cy="40" rx="2.4" ry="1.6" fill="${INK}"/>`,
    eyes: () =>
      `<circle cx="25" cy="32.5" r="2.5" fill="${WHITE}"/>` +
      `<circle cx="25.6" cy="33" r="1.2" fill="${INK}"/>` +
      `<circle cx="39" cy="32.5" r="2.5" fill="${WHITE}"/>` +
      `<circle cx="39.6" cy="33" r="1.2" fill="${INK}"/>`,
    colors: { body: '#F7F7F2' },
  },
  fox: {
    back: (p) =>
      `<path d="M13 27L12 6L29 17Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M15.5 21L15.2 11.5L23.5 16.8Z" fill="${WHITE}"/>` +
      `<path d="M51 27L52 6L35 17Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M48.5 21L48.8 11.5L40.5 16.8Z" fill="${WHITE}"/>`,
    // A white muzzle and a black nose.
    skin: () =>
      `<path d="M17 37C21.5 39.5 27 39.5 32 42.5C37 39.5 42.5 39.5 47 37C47 45.5 40.5 51 32 51C23.5 51 17 45.5 17 37Z" fill="${WHITE}"/>` +
      `<ellipse cx="32" cy="39.2" rx="2.3" ry="1.5" fill="${INK}"/>`,
    colors: { body: '#F28C38' },
  },
  penguin: {
    // A white face on a dark head.
    skin: () =>
      `<path d="M32 24.5C27 20.5 18 22.5 17.5 31C17 40.5 22.5 49.5 32 51C41.5 49.5 47 40.5 46.5 31C46 22.5 37 20.5 32 24.5Z" fill="${WHITE}"/>`,
    eyes: () =>
      `<circle cx="25.5" cy="32" r="3" fill="${INK}"/>` +
      `<circle cx="26.4" cy="31" r="0.9" fill="${WHITE}"/>` +
      `<circle cx="38.5" cy="32" r="3" fill="${INK}"/>` +
      `<circle cx="39.4" cy="31" r="0.9" fill="${WHITE}"/>`,
    // An orange beak.
    mouth: (p) => `<path d="M27 41.5H37L32 46.5Z" fill="${p.detail}" ${ink(2)}/>`,
    colors: { body: '#2F3A4F', detail: '#FFA21F' },
  },
  bunny: {
    // Tall ears behind the head.
    back: (p) =>
      `<path d="M18.5 22C16 12 17 2.5 22.5 2C28 2.5 29 12 27.5 22Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M20.5 18C19.5 11 20 5.5 22.5 5.2C25 5.5 25.8 11 25 18Z" fill="${p.detail}"/>` +
      `<path d="M45.5 22C48 12 47 2.5 41.5 2C36 2.5 35 12 36.5 22Z" fill="${p.body}" ${ink(3)}/>` +
      `<path d="M43.5 18C44.5 11 44 5.5 41.5 5.2C39 5.5 38.2 11 39 18Z" fill="${p.detail}"/>`,
    front: whiskers,
    // A little nose over buck teeth.
    mouth: (p) =>
      `<ellipse cx="32" cy="41.9" rx="1.9" ry="1.2" fill="${p.detail}" ${ink(1.2)}/>` +
      `<path d="M28 43Q30 45 32 43Q34 45 36 43" fill="none" ${ink(2)}/>` +
      `<rect x="29.6" y="44" width="4.8" height="4.5" rx="1" fill="${WHITE}" ${ink(1.6)}/>` +
      `<path d="M32 44.3V48.2" fill="none" ${ink(1.2)}/>`,
  },
} satisfies Partial<Record<CostumeName, Costume>>;
