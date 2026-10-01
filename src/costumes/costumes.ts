import type { LayerOverrides } from '../compose.ts';
import type { CostumeName } from './catalog.ts';
import { ANIMALS } from './parts/animals.ts';
import { CLASSICS } from './parts/classics.ts';
import { DEV } from './parts/dev.ts';
import { FOOD } from './parts/food.ts';
import { GAMER } from './parts/gamer.ts';
import { LEGENDARY } from './parts/legendary.ts';
import { SEASONAL } from './parts/seasonal.ts';
import { SPOOKY } from './parts/spooky.ts';
import type { Costume } from './types.ts';

/** Every costume's drawings, by name. The type makes a missing costume a compile error. */
export const COSTUMES: Readonly<Record<CostumeName, Costume>> = Object.freeze({
  ...CLASSICS,
  ...SPOOKY,
  ...ANIMALS,
  ...FOOD,
  ...GAMER,
  ...DEV,
  ...SEASONAL,
  ...LEGENDARY,
});

/** The composer overrides for a costume. A back or front part replaces the whole accessory. */
export function costumeOverrides(costume: Costume): LayerOverrides {
  const { back, front } = costume;
  const accessory = back === undefined && front === undefined ? undefined : { ...(back && { back }), ...(front && { front }) };
  return {
    shape: costume.shape,
    skin: costume.skin,
    eyes: costume.eyes,
    mouth: costume.mouth,
    accessory,
    pattern: costume.pattern,
    colors: costume.colors,
  };
}
