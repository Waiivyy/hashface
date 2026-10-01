import type { AccessoryName } from '../catalog.ts';
import type { AccessoryDraw } from './types.ts';

export const ACCESSORIES: Readonly<Record<AccessoryName, AccessoryDraw>> = {
  none: {},
  antenna: {},
  'party-hat': {},
  bow: {},
  headphones: {},
  crown: {},
  sprout: {},
  horns: {},
};
