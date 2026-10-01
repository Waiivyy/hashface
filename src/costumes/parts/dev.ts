import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const DEV = {
  'rubber-duck': {},
  'coffee-addict': {},
  'merge-conflict': {},
  'not-found': {},
  'infinite-loop': {},
} satisfies Partial<Record<CostumeName, Costume>>;
