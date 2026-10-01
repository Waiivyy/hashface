import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';

export const SEASONAL = {
  snowman: {},
  'holiday-elf': {},
  birthday: {},
  valentine: {},
} satisfies Partial<Record<CostumeName, Costume>>;
