import type { MouthName } from '../catalog.ts';
import type { Draw } from './types.ts';

const empty: Draw = () => '';

export const MOUTHS: Readonly<Record<MouthName, Draw>> = {
  smile: empty,
  flat: empty,
  open: empty,
  zigzag: empty,
  o: empty,
  grin: empty,
  smirk: empty,
  tongue: empty,
};
