/**
 * The demo's special guests: fan tributes, used with permission, that belong to
 * their creators (see CREDITS.md). They are demo content only: nothing in src/
 * imports this file, so they are not in the npm package or under its MIT
 * license. Each guest uses the costume model with every part pinned, drawn by
 * the same composer as every other avatar.
 */

import { composeSvg } from '../dist/compose.js';
import { INK, WHITE } from '../dist/palettes.js';
import { PATTERNS } from '../dist/traits/patterns.js';

const ink = (width) => `stroke="${INK}" stroke-width="${width}"`;
const nothing = () => '';

// The Creeper is drawn in 5-unit pixels: its head is an 8 by 8 grid at (12, 8),
// and its neck continues the same grid below it.
const pixels = (cells, color, top = 8) => {
  const squares = cells.map(([row, col]) => {
    const [x, y] = [12 + 5 * col, top + 5 * row];
    return `M${x} ${y}H${x + 5}V${y + 5}H${x}Z`;
  });
  return `<path d="${squares.join('')}" fill="${color}"/>`;
};

export const TRIBUTES = Object.freeze({
  // Jacksepticeye's green eyeball.
  jacksepticeye: {
    shape: (fill) => `<circle cx="32" cy="35" r="20" fill="${fill}" ${ink(3)}/>`,
    back: (p) => `<path d="M43 21C46 12 52 7.5 60 8.5C56 10.5 54 13.5 54.5 17.5C51.5 16.5 48.5 18 46.5 22Z" fill="${p.body}" ${ink(2.5)}/>`,
    skin: () => `<path d="M17.5 31C18.5 25.5 22 21 27 19" fill="none" stroke="${WHITE}" stroke-width="2.4"/>`,
    eyes: (p) =>
      `<circle cx="32" cy="35" r="12.5" fill="${WHITE}" ${ink(3)}/>` +
      `<path d="M21 31.5L24 32.5L25 31M21.5 40L24.5 38.5L26 39.5M43 31L40 32.3L39 30.8M42.5 40.5L39.5 38.8" fill="none" stroke="${p.detail}" stroke-width="1.3"/>` +
      `<circle cx="33" cy="35.5" r="7" fill="${p.accent}" ${ink(2)}/>` +
      `<circle cx="33" cy="35.5" r="3.4" fill="${INK}"/>` +
      `<circle cx="35.4" cy="33.2" r="1.6" fill="${WHITE}"/>`,
    mouth: nothing,
    front: nothing,
    pattern: PATTERNS.dots,
    colors: { bg: '#DFF5D8', pattern: '#C4EBB8', body: '#55C955', accent: '#1F9E5A', detail: '#E5484D' },
  },
  // VanossGaming's owl: dark ear tufts, pale rings around big yellow eyes under
  // angry brows, a dark beak, and the black shirt with yellow straps.
  vanoss: {
    shape: (fill) =>
      `<path d="M11 30C11 20 19.5 14 32 14C44.5 14 53 20 53 30C53 45 45 56.5 32 56.5C19 56.5 11 45 11 30Z" fill="${fill}" ${ink(3)}/>`,
    back: (p) =>
      `<path d="M1 66C2 56 12 50.5 24 50H40C52 50.5 62 56 63 66Z" fill="${INK}" ${ink(3)}/>` +
      `<path d="M13 52.5L16.5 66H22.5L19 51Z" fill="${p.detail}" ${ink(2)}/>` +
      `<path d="M51 52.5L47.5 66H41.5L45 51Z" fill="${p.detail}" ${ink(2)}/>` +
      `<path d="M14 24L10 9L15.5 13.5L17 6.5L21.5 15L24 10.5L25 18Z" fill="${p.pattern}" ${ink(2)}/>` +
      `<path d="M50 24L54 9L48.5 13.5L47 6.5L42.5 15L40 10.5L39 18Z" fill="${p.pattern}" ${ink(2)}/>`,
    skin: (p) =>
      `<circle cx="24" cy="33" r="8.6" fill="${p.accent}"/>` +
      `<circle cx="40" cy="33" r="8.6" fill="${p.accent}"/>` +
      `<path d="M27.5 20L29.8 22.2L32 20L34.2 22.2L36.5 20" fill="none" stroke="${p.pattern}" stroke-width="1.4"/>`,
    eyes: (p) =>
      `<circle cx="24" cy="33.5" r="5" fill="${p.detail}" ${ink(2)}/>` +
      `<circle cx="40" cy="33.5" r="5" fill="${p.detail}" ${ink(2)}/>` +
      `<circle cx="24.6" cy="34" r="2.5" fill="${INK}"/>` +
      `<circle cx="39.4" cy="34" r="2.5" fill="${INK}"/>` +
      `<circle cx="25.4" cy="33.1" r="0.9" fill="${WHITE}"/>` +
      `<circle cx="40.2" cy="33.1" r="0.9" fill="${WHITE}"/>` +
      `<path d="M15.5 24.8L31.5 29.6L31 32.4L15.8 27.6Z" fill="${INK}"/>` +
      `<path d="M48.5 24.8L32.5 29.6L33 32.4L48.2 27.6Z" fill="${INK}"/>`,
    mouth: () => `<path d="M28.8 37.5C29.5 35.8 34.5 35.8 35.2 37.5L32.6 45.5C32.3 46.3 31.7 46.3 31.4 45.5Z" fill="${INK}"/>`,
    front: nothing,
    // A plain backdrop, as in the reference; the pattern color is the dark brown of the tufts.
    pattern: nothing,
    colors: { bg: '#7FC3D9', pattern: '#4A3322', body: '#8A6239', accent: '#E3DDCF', detail: '#F2C230' },
  },
  // Markiplier: the hair, the black shirt and the pink mustache.
  markiplier: {
    shape: (fill) => `<rect x="15" y="15" width="34" height="41" rx="15" fill="${fill}" ${ink(3)}/>`,
    back: (p) => `<path d="M3 66C4 55 13 50 24 49H40C51 50 60 55 61 66Z" fill="${p.accent}" ${ink(3)}/>`,
    skin: () => `<path d="M32.5 34.5L30.5 38.5H33.5" fill="none" ${ink(1.6)}/>`,
    eyes: () =>
      `<circle cx="25.5" cy="32.5" r="2.6" fill="${INK}"/>` +
      `<circle cx="38.5" cy="32.5" r="2.6" fill="${INK}"/>` +
      `<path d="M22 28.3L28.5 27.8M35.5 27.8L42 28.3" fill="none" ${ink(2.2)}/>`,
    mouth: (p) =>
      `<path d="M32 41.5C29.5 39.3 24.5 39.5 22 43.5C25.5 42.6 28.5 44 32 44.6C35.5 44 38.5 42.6 42 43.5C39.5 39.5 34.5 39.3 32 41.5Z" fill="${p.detail}" ${ink(2)}/>` +
      `<path d="M28.5 47.5Q32 49.8 35.5 47.5" fill="none" ${ink(2.2)}/>`,
    front: () =>
      `<path d="M15 27C13.5 17 20 9.5 31 9C41 8.5 48.5 12 50.5 20C48 18 44.5 17.3 41 18C42.5 20.5 42 23 40 24.5C38 21.5 34 20 29 20.3C24 20.6 19.5 22.5 17.5 27.5C16.6 27.8 15.7 27.6 15 27Z" fill="${INK}"/>`,
    pattern: PATTERNS.stripes,
    colors: { bg: '#E23B3B', pattern: '#CC2F2F', body: '#F3C9A8', accent: '#1C1C22', detail: '#FF4F9E' },
  },
  // A Creeper, for Minecraft: the blocky green face, square eyes and that mouth,
  // on a blocky neck.
  minecraft: {
    shape: (fill) => `<rect x="12" y="8" width="40" height="40" fill="${fill}" ${ink(3)}/>`,
    back: (p) =>
      `<path d="M17 46H47V66H17Z" fill="${p.body}" ${ink(3)}/>` +
      pixels([[0, 2], [1, 5], [2, 1], [3, 4]], p.accent, 48) +
      pixels([[0, 5], [1, 2], [2, 4], [3, 1]], p.detail, 48),
    skin: (p) =>
      pixels([[0, 1], [0, 5], [1, 3], [2, 7], [3, 0], [3, 6], [4, 1], [5, 7], [6, 0], [6, 4], [7, 2], [7, 6]], p.accent) +
      pixels([[0, 3], [0, 7], [1, 0], [2, 4], [3, 2], [4, 6], [5, 0], [6, 3], [6, 7], [7, 0], [7, 4]], p.detail),
    eyes: () => `<path d="M17 13H27V23H17ZM37 13H47V23H37Z" fill="${INK}"/>`,
    mouth: () => `<path d="M27 23H37V28H42V43H37V38H27V43H22V28H27Z" fill="${INK}"/>`,
    front: nothing,
    pattern: PATTERNS.grid,
    colors: { bg: '#86C8F0', pattern: '#74B6DE', body: '#5DBB46', accent: '#3E8E2F', detail: '#8FD96B' },
  },
});

export const TRIBUTE_NAMES = Object.freeze(Object.keys(TRIBUTES));

/** The guest a typed name summons, ignoring case and surrounding spaces, or null. */
export function matchTribute(input) {
  const name = String(input).trim().toLowerCase();
  return Object.hasOwn(TRIBUTES, name) ? name : null;
}

// Every part is pinned, so these base traits never show; the composer only needs valid names.
const BASE = { shape: 'circle', eyes: 'dots', mouth: 'smile', accessory: 'none', palette: 'cream', pattern: 'none' };

/** The guest's avatar as an SVG string, at the given size in px. */
export function tributeSvg(name, size, title) {
  const guest = TRIBUTES[name];
  const options = title === undefined ? { size } : { size, title };
  return composeSvg(BASE, options, {
    shape: guest.shape,
    skin: guest.skin,
    eyes: guest.eyes,
    mouth: guest.mouth,
    accessory: { back: guest.back, front: guest.front },
    pattern: guest.pattern,
    colors: guest.colors,
  });
}
