/**
 * hashface/costumes: the core library plus a rare costume party. About 1 in 25
 * avatars wear one of 40 costumes; every other avatar is byte-identical to the
 * core's. See docs/costumes.md.
 */

import { VARIANTS } from '../catalog.ts';
import { composeSvg } from '../compose.ts';
import { normalizeOptions } from '../options.ts';
import { COSTUME_NAMES, type CostumeName } from './catalog.ts';
import { COSTUMES, costumeOverrides } from './costumes.ts';
import { selectCostumeTraits, type CostumeLocks, type CostumeTraits } from './select.ts';
import type { Costume } from './types.ts';

export { renderToCanvas, toDataUri } from '../index.ts';
export type { CanvasDrawTarget, CanvasTarget, Category } from '../index.ts';
export type { CostumeName } from './catalog.ts';
export type { CostumeLocks, CostumeTraits } from './select.ts';

export interface CostumeAvatarOptions {
  /** Width and height in px. Defaults to 64. The viewBox is always 0 0 64 64. */
  readonly size?: number | undefined;
  /** Traits to pin by name, including `costume` (a costume name or 'none'). */
  readonly traits?: CostumeLocks | undefined;
  /** Accessible title. Adds `role="img"` and a `<title>`; the seed never appears in the output. */
  readonly title?: string | undefined;
}

/** Like the core generateAvatar, except that about 1 in 25 seeds wear a costume. */
export function generateAvatar(seed: string, options: CostumeAvatarOptions = {}): string {
  const { size, title, traits } = normalizeOptions(options);
  const selected = selectCostumeTraits(seed, traits as CostumeLocks | undefined);
  const overrides = selected.costume === 'none' ? undefined : costumeOverrides(COSTUMES[selected.costume]);
  return composeSvg(selected, { size, title }, overrides);
}

/** The six core traits plus `costume`. Core traits are reported even where a costume replaces their drawing. */
export function getTraits(seed: string, locks?: CostumeLocks): CostumeTraits {
  return selectCostumeTraits(seed, locks);
}

/** The core catalog plus `costume`: 'none' followed by the 40 costume names. Frozen. */
export const traitNames = Object.freeze({ ...VARIANTS, costume: Object.freeze(['none', ...COSTUME_NAMES] as const) });

/** A core category a costume can replace. */
export type CostumePart = 'shape' | 'eyes' | 'mouth' | 'accessory' | 'pattern' | 'palette';

const PART_ORDER: readonly CostumePart[] = ['shape', 'eyes', 'mouth', 'accessory', 'pattern', 'palette'];

const partsOf = (costume: Costume): readonly CostumePart[] =>
  Object.freeze(
    PART_ORDER.filter((part) => {
      if (part === 'accessory') return costume.back !== undefined || costume.front !== undefined;
      if (part === 'palette') return costume.colors !== undefined;
      return costume[part] !== undefined;
    }),
  );

/** Which core categories each costume replaces, for example ['eyes', 'accessory'] for the pirate. Frozen. */
export const costumeParts: Readonly<Record<CostumeName, readonly CostumePart[]>> = Object.freeze(
  Object.fromEntries(COSTUME_NAMES.map((name) => [name, partsOf(COSTUMES[name])])) as Record<CostumeName, readonly CostumePart[]>,
);
