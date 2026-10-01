import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const FOOD = {
  pizza: {},
  donut: {},
  taco: {},
  avocado: {},
  cupcake: {},
} satisfies Partial<Record<CostumeName, Costume>>;
