/**
 * Costume selection. Nothing is left to chance: a seed that spells a costume's
 * name wears that costume, on the mascot; every other seed wears nothing unless
 * a lock says otherwise. See docs/costumes.md section 4.
 */

import { CATEGORIES, VARIANTS, type TraitLocks, type Traits } from '../catalog.ts';
import { describeValue } from '../describe.ts';
import { selectTraits } from '../select.ts';
import { COSTUME_NAMES, type CostumeName } from './catalog.ts';

/** The README mascot. It wears every costume summoned by name, with its crown off. */
export const MASCOT_SEED = 'hashface';

const COSTUME_VALUES: readonly string[] = Object.freeze(['none', ...COSTUME_NAMES]);
const NAMES: ReadonlySet<string> = new Set(COSTUME_NAMES);

export type CostumeTraits = Traits & { readonly costume: CostumeName | 'none' };
export type CostumeLocks = TraitLocks & { readonly costume?: CostumeName | 'none' | undefined };

/**
 * The costume a seed spells, or null. Case and surrounding spaces don't matter,
 * and spaces or underscores count as hyphens, so "Rubber Duck" is rubber-duck.
 */
export function matchCostume(seed: string): CostumeName | null {
  const name = seed.trim().toLowerCase().replace(/[\s_-]+/g, '-');
  return NAMES.has(name) ? (name as CostumeName) : null;
}

/** The six core traits plus a costume, honoring locks exactly like the core does. */
export function selectCostumeTraits(seed: string, locks?: CostumeLocks): CostumeTraits {
  if (typeof seed !== 'string') throw new TypeError(`seed must be a string, got ${describeValue(seed)}`);
  let costumeLock: CostumeName | 'none' | undefined;
  // Own keys only, each read once, into a prototype-free copy for the core.
  const coreLocks = Object.create(null) as Record<string, unknown>;
  if (locks !== undefined) {
    if (typeof locks !== 'object' || locks === null) {
      throw new TypeError(`traits must be an object, got ${describeValue(locks)}`);
    }
    for (const key of Object.keys(locks)) {
      const value: unknown = (locks as Record<string, unknown>)[key];
      if (key === 'costume') {
        if (value === undefined) continue;
        if (!COSTUME_VALUES.includes(value as string)) {
          const shown = typeof value === 'string' ? JSON.stringify(value) : describeValue(value);
          throw new RangeError(`Unknown costume ${shown}. Valid costume values: ${COSTUME_VALUES.join(', ')}`);
        }
        costumeLock = value as CostumeName | 'none';
      } else if (!Object.prototype.hasOwnProperty.call(VARIANTS, key)) {
        throw new RangeError(`Unknown trait category "${key}". Valid categories: ${[...CATEGORIES, 'costume'].join(', ')}`);
      } else {
        coreLocks[key] = value;
      }
    }
  }
  const summoned = costumeLock === undefined ? matchCostume(seed) : null;
  if (summoned !== null) {
    coreLocks.accessory ??= 'none';
    return { ...selectTraits(MASCOT_SEED, coreLocks as TraitLocks), costume: summoned };
  }
  return { ...selectTraits(seed, coreLocks as TraitLocks), costume: costumeLock ?? 'none' };
}
