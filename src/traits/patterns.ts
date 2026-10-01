/**
 * Background patterns, each a single path in the palette's pattern color so
 * the output needs no <pattern> elements or ids. The root svg clips anything
 * drawn past the canvas edge.
 */

import type { PatternName } from '../catalog.ts';
import type { Draw } from './types.ts';

const rows = (count: number, step: number, start: number, row: (y: number) => string): string =>
  Array.from({ length: count }, (_, i) => row(start + i * step)).join('');

export const PATTERNS: Readonly<Record<PatternName, Draw>> = {
  none: () => '',
  // Zero-length dashes with round caps render as dots.
  dots: (p) =>
    `<path d="${rows(8, 8, 4, (y) => `M4 ${y}H64`)}" fill="none" stroke="${p.pattern}" stroke-width="2.6" stroke-dasharray="0 8"/>`,
  stripes: (p) =>
    `<path d="${rows(8, 16, 8, (c) => `M0 ${c}L${c} 0`)}" fill="none" stroke="${p.pattern}" stroke-width="4"/>`,
  grid: (p) =>
    `<path d="${rows(7, 8, 8, (v) => `M${v} 0V64M0 ${v}H64`)}" fill="none" stroke="${p.pattern}" stroke-width="1.2"/>`,
  waves: (p) =>
    `<path d="${rows(5, 13, 6, (y) => `M-4 ${y}q4-4 8 0${'t8 0'.repeat(8)}`)}" fill="none" stroke="${p.pattern}" stroke-width="2.5"/>`,
  sun: (p) => `<path d="M42 8a14 14 0 1 0 28 0a14 14 0 1 0-28 0" fill="${p.pattern}"/>`,
};
