import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const LEGENDARY = {
  'golden-mascot': {},
  cosmic: {},
  rainbow: {},
} satisfies Partial<Record<CostumeName, Costume>>;
