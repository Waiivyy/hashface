import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

export const SPOOKY = {
  vampire: {
    shape: (fill) =>
      `<path d="M14 32C14 22.06 22.06 14 32 14C41.94 14 50 22.06 50 32V43C50 51 42 57.5 32 57.5C22 57.5 14 51 14 43Z" fill="${fill}" ${ink(3)}/>`,
    // Slicked-back hair with a widow's peak.
    skin: () =>
      `<path d="M15.75 32C15.75 23.03 23.03 15.75 32 15.75C40.97 15.75 48.25 23.03 48.25 32L45 26.5C41.5 22.5 35.5 22 32 27.5C28.5 22 22.5 22.5 19 26.5Z" fill="${INK}"/>`,
    mouth: () =>
      `<path d="M26 42C28.5 45 35.5 45 38 42" fill="none" ${ink(2.5)}/>` +
      `<path d="M28.6 43.7L29.8 47.8L31.2 44.3Z" fill="${WHITE}" ${ink(1.5)}/>` +
      `<path d="M35.4 43.7L34.2 47.8L32.8 44.3Z" fill="${WHITE}" ${ink(1.5)}/>`,
    // A high cape collar standing up behind the head.
    back: (p) =>
      `<path d="M24 50L7 56.5L4 21L22 36Z" fill="${p.accent}" ${ink(3)}/>` +
      `<path d="M20.5 39.5L9.5 50.5L8 29Z" fill="${p.detail}"/>` +
      `<path d="M40 50L57 56.5L60 21L42 36Z" fill="${p.accent}" ${ink(3)}/>` +
      `<path d="M43.5 39.5L54.5 50.5L56 29Z" fill="${p.detail}"/>`,
    colors: { body: '#ECE6F3', accent: '#3B2A57', detail: '#D7263D' },
  },
  zombie: {
    // Mismatched eyes: one wide, one droopy.
    eyes: () =>
      `<circle cx="25.5" cy="32.5" r="4.9" fill="${WHITE}" ${ink(2.5)}/>` +
      `<circle cx="26.4" cy="33.6" r="1.6" fill="${INK}"/>` +
      `<circle cx="39.5" cy="34" r="2.4" fill="${INK}"/>` +
      `<path d="M36 31L43 32.5" fill="none" ${ink(2.5)}/>`,
    // Stitched scars on the forehead and a cheek.
    skin: () =>
      `<path d="M24 24L32.5 21.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M25.6 21.9L26.4 25M28.5 21L29.3 24.1M31.2 20.2L32 23.3" fill="none" ${ink(1.5)}/>` +
      `<path d="M41.5 41.5L45 45.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M42 44L44.5 42.5" fill="none" ${ink(1.5)}/>`,
    colors: { body: '#9DBF7E' },
  },
  mummy: {
    shape: (fill) => `<rect x="14" y="13" width="36" height="44" rx="16" fill="${fill}" ${ink(3)}/>`,
    // Bandage wraps, with gaps for the eyes and the mouth.
    skin: () =>
      `<path d="M22 20.5L42 18.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M18.5 25L45 22.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M17.5 40.5L46.5 39" fill="none" ${ink(1.8)}/>` +
      `<path d="M21.5 51.5L43 49.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M17.5 46.5L22.5 45M41.5 46L46.5 44.5" fill="none" ${ink(1.8)}/>` +
      `<path d="M35 19L38.5 23.5M24.5 39.9L27.5 44" fill="none" ${ink(1.8)}/>`,
    colors: { body: '#EFE7D4' },
  },
  witch: {
    front: (p) =>
      `<path d="M20 21C23 15 26 9.5 30 5.5C33.5 2.5 39.5 2.5 45 4C40 5.5 37.5 7.5 36.5 10.5C38.5 14 41.5 17.5 44 21Z" fill="${INK}" ${ink(2.5)}/>` +
      `<path d="M22 16.5C28.5 15.3 35.5 15.3 41.2 16.5L43 19.5C36 18.3 28.5 18.3 20.6 19.5Z" fill="${p.accent}"/>` +
      `<rect x="29.5" y="15.2" width="5" height="4.6" rx="0.8" fill="none" stroke="${p.detail}" stroke-width="1.6"/>` +
      `<ellipse cx="32" cy="21.5" rx="25" ry="3" fill="${INK}" ${ink(2.5)}/>`,
  },
  skeleton: {
    eyes: () =>
      `<ellipse cx="25" cy="32.5" rx="5" ry="5.6" fill="${INK}"/>` +
      `<ellipse cx="39" cy="32.5" rx="5" ry="5.6" fill="${INK}"/>` +
      `<circle cx="25.8" cy="33.2" r="1.3" fill="${WHITE}"/>` +
      `<circle cx="39.8" cy="33.2" r="1.3" fill="${WHITE}"/>`,
    // The nose hole and a crack on the skull.
    skin: () =>
      `<path d="M32 37.5L34.3 41.3H29.7Z" fill="${INK}" ${ink(1.2)}/>` +
      `<path d="M37 19.5L35.5 22L37.5 23.5L36 26" fill="none" ${ink(1.6)}/>`,
    // Stitched teeth.
    mouth: () =>
      `<path d="M25.5 45H38.5" fill="none" ${ink(2.5)}/>` +
      `<path d="M27.5 42.5V47.5M30.5 42.5V47.5M33.5 42.5V47.5M36.5 42.5V47.5" fill="none" ${ink(2)}/>`,
    colors: { body: '#F1EDE3' },
  },
  alien: {
    // Huge black almond eyes with a glint.
    eyes: () =>
      `<path d="M19.5 28.5C22.5 26.5 29 29 30.5 34C31.5 37.5 28.5 38.8 25.5 37.8C21.5 36.5 19.5 32.5 19.5 28.5Z" fill="${INK}"/>` +
      `<path d="M44.5 28.5C41.5 26.5 35 29 33.5 34C32.5 37.5 35.5 38.8 38.5 37.8C42.5 36.5 44.5 32.5 44.5 28.5Z" fill="${INK}"/>` +
      `<circle cx="23.5" cy="31" r="1.3" fill="${WHITE}"/>` +
      `<circle cx="40.5" cy="31" r="1.3" fill="${WHITE}"/>`,
    // Antennae, growing from behind the head.
    back: (p) =>
      `<path d="M25 22L20 9.5M39 22L44 9.5" fill="none" ${ink(3)}/>` +
      `<circle cx="19.5" cy="7.5" r="3.5" fill="${p.accent}" ${ink(2.5)}/>` +
      `<circle cx="44.5" cy="7.5" r="3.5" fill="${p.accent}" ${ink(2.5)}/>`,
    colors: { body: '#7EE07A' },
  },
} satisfies Partial<Record<CostumeName, Costume>>;
