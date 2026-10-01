import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const ANIMALS = {
  cat: {},
  frog: {},
  panda: {},
  fox: {},
  penguin: {},
  bunny: {},
} satisfies Partial<Record<CostumeName, Costume>>;
