import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const CLASSICS = {
  pirate: {},
  wizard: {},
  knight: {},
  ninja: {},
  viking: {},
  astronaut: {},
} satisfies Partial<Record<CostumeName, Costume>>;
