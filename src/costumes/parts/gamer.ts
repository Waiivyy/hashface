import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const GAMER = {
  'pixel-hero': {},
  slime: {},
  mimic: {},
  'final-boss': {},
  glitch: {},
} satisfies Partial<Record<CostumeName, Costume>>;
