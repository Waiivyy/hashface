import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const SPOOKY = {
  vampire: {},
  zombie: {},
  mummy: {},
  witch: {},
  skeleton: {},
  alien: {},
} satisfies Partial<Record<CostumeName, Costume>>;
