/**
 * Eyes, drawn inside the eyes zone (x 19 to 45, y 26 to 39). The left eye
 * centers near x 25 and the right one near x 39.
 */

import type { EyesName } from '../catalog.ts';
import { INK, WHITE } from '../palettes.ts';
import type { Draw } from './types.ts';

const dot = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}"/>`;
const line = (d: string) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/>`;

const googly = (cx: number, cy: number, r: number, pupil: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${WHITE}" stroke="${INK}" stroke-width="2.5"/>` +
  `<circle cx="${cx + 1.2}" cy="${cy + 1.1}" r="${pupil}" fill="${INK}"/>`;

export const EYES: Readonly<Record<EyesName, Draw>> = {
  dots: () => dot(25, 32) + dot(39, 32),
  googly: () => googly(25, 32.5, 4.6, 2.2) + googly(39, 32.5, 4.6, 2.2),
  visor: () =>
    `<rect x="20" y="28" width="24" height="8" rx="3" fill="${INK}"/>` +
    `<rect x="23" y="30" width="7" height="2.4" rx="1.2" fill="${WHITE}"/>`,
  crosses: () => line('M22 29L28 35M28 29L22 35M36 29L42 35M42 29L36 35'),
  happy: () => line('M21.5 34Q25 28.5 28.5 34M35.5 34Q39 28.5 42.5 34'),
  sleepy: () => line('M21.5 31Q25 36 28.5 31M35.5 31Q39 36 42.5 31'),
  wink: () => dot(25, 32) + line('M35.5 33.5Q39 28.5 42.5 33.5'),
  cyclops: () => googly(32, 32.5, 5.2, 2.6) + `<circle cx="32.4" cy="32.8" r="0.9" fill="${WHITE}"/>`,
};
