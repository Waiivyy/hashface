import type { PatternName } from '../catalog.ts';
import type { Draw } from './types.ts';

const empty: Draw = () => '';

export const PATTERNS: Readonly<Record<PatternName, Draw>> = {
  none: empty,
  dots: empty,
  stripes: empty,
  grid: empty,
  waves: empty,
  sun: empty,
};
