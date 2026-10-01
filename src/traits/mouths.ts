/**
 * Mouths, drawn inside the mouth zone (x 24 to 40, y 40 to 50), centered
 * near (32, 45).
 */

import type { MouthName } from '../catalog.ts';
import { INK, WHITE } from '../palettes.ts';
import type { Draw } from './types.ts';

const line = (d: string) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/>`;

export const MOUTHS: Readonly<Record<MouthName, Draw>> = {
  smile: () => line('M25.5 41.5C27.5 47.5 36.5 47.5 38.5 41.5'),
  flat: () => line('M27 45H37'),
  open: (p) =>
    `<rect x="27" y="41" width="10" height="8" rx="3.5" fill="${INK}"/>` +
    `<ellipse cx="32" cy="46.8" rx="3" ry="1.8" fill="${p.detail}"/>`,
  zigzag: () => line('M26 46L29 43L32 46L35 43L38 46'),
  o: () => `<ellipse cx="32" cy="45" rx="3" ry="3.6" fill="${INK}"/>`,
  grin: () =>
    `<path d="M25 42H39C39 46.5 36 49 32 49C28 49 25 46.5 25 42Z" fill="${INK}" stroke="${INK}" stroke-width="2"/>` +
    `<rect x="26.5" y="43" width="11" height="2.4" rx="0.5" fill="${WHITE}"/>`,
  smirk: () => line('M27 46C30 47.5 34.5 46 38 41.5'),
  tongue: (p) =>
    line('M25.5 42C27.5 47 36.5 47 38.5 42') +
    `<path d="M29.5 45.4V47C29.5 49 34.5 49 34.5 47V45.4" fill="${p.detail}" stroke="${INK}" stroke-width="2"/>`,
};
