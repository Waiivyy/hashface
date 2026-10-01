import type { EyesName } from '../catalog.ts';
import type { Draw } from './types.ts';

const empty: Draw = () => '';

export const EYES: Readonly<Record<EyesName, Draw>> = {
  dots: empty,
  googly: empty,
  visor: empty,
  crosses: empty,
  happy: empty,
  sleepy: empty,
  wink: empty,
  cyclops: empty,
};
