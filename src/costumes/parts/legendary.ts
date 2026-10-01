import { WHITE } from '../../palettes.ts';
import { ACCESSORIES } from '../../traits/accessories.ts';
import { EYES } from '../../traits/eyes.ts';
import { MOUTHS } from '../../traits/mouths.ts';
import { PATTERNS } from '../../traits/patterns.ts';
import { SHAPES } from '../../traits/shapes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink, star } from './draw.ts';

export const LEGENDARY = {
  // The README mascot, every part pinned, cast in gold.
  'golden-mascot': {
    shape: SHAPES.arch,
    skin: () =>
      `<path d="M18 37C18 28 22.5 22 29 20.5" fill="none" stroke="${WHITE}" stroke-width="2.6"/>` +
      `<circle cx="33.5" cy="20" r="1.3" fill="${WHITE}"/>`,
    eyes: EYES.dots,
    mouth: MOUTHS.grin,
    front: (p) => ACCESSORIES.crown.front?.(p) ?? '',
    pattern: PATTERNS.dots,
    colors: { bg: '#F2A900', pattern: '#D99100', body: '#FFD23F', accent: '#FFF0A8', detail: '#FFFFFF' },
  },
  // A night sky: stars on the head and in the background, and starry eyes.
  cosmic: {
    skin: () =>
      `<polygon points="${star(22.5, 23.5, 1.8)}" fill="${WHITE}"/>` +
      `<polygon points="${star(45, 40, 1.6)}" fill="${WHITE}"/>` +
      `<circle cx="40.5" cy="22.5" r="0.9" fill="${WHITE}"/>` +
      `<circle cx="18" cy="42" r="0.9" fill="${WHITE}"/>` +
      `<circle cx="36.5" cy="50.5" r="0.8" fill="${WHITE}"/>` +
      `<circle cx="26" cy="49.5" r="0.7" fill="${WHITE}"/>`,
    eyes: () =>
      `<polygon points="${star(25, 32.8, 4.6)}" fill="${WHITE}" ${ink(1.2)}/>` +
      `<polygon points="${star(39, 32.8, 4.6)}" fill="${WHITE}" ${ink(1.2)}/>`,
    mouth: () => `<path d="M27.5 43.5C29.5 46.5 34.5 46.5 36.5 43.5" fill="none" stroke="${WHITE}" stroke-width="2.6"/>`,
    pattern: (p) =>
      `<path d="M6 8H6.01M15 4H15.01M26 6H26.01M40 4H40.01M51 9H51.01M59 4H59.01M4 21H4.01M60 19H60.01M8 34H8.01M57 33H57.01M3 48H3.01M61 47H61.01M10 59H10.01M22 61H22.01M43 61H43.01M55 58H55.01M33 2H33.01" fill="none" stroke="${p.pattern}" stroke-width="1.8"/>`,
    colors: { bg: '#2A1F5E', pattern: '#B9AEFF', body: '#151C42' },
  },
  // Rainbow stripes across the head, under a sunny sky.
  rainbow: {
    shape: (fill) => `<rect x="13" y="15" width="38" height="40" rx="10" fill="${fill}" ${ink(3)}/>`,
    skin: (p) =>
      `<path d="M14.75 25C14.75 20.44 18.44 16.75 23 16.75H41C45.56 16.75 49.25 20.44 49.25 25Z" fill="${p.accent}"/>` +
      `<rect x="14.75" y="25" width="34.5" height="6.5" fill="${p.detail}"/>` +
      `<rect x="14.75" y="31.5" width="34.5" height="6.5" fill="${p.pattern}"/>` +
      `<path d="M14.75 45H49.25C49.25 49.56 45.56 53.25 41 53.25H23C18.44 53.25 14.75 49.56 14.75 45Z" fill="${p.bg}"/>`,
    pattern: PATTERNS.sun,
    colors: { bg: '#6EC3FF', pattern: '#FFE15D', body: '#5CD08B', accent: '#FF5A5F', detail: '#FFA53B' },
  },
} satisfies Partial<Record<CostumeName, Costume>>;
