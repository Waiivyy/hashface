/**
 * Costume selection, from digest word 6 (reserved by docs/design.md section 6,
 * so the core's traits never move). See docs/costumes.md section 4.
 */

import { CATEGORIES, VARIANTS, type TraitLocks, type Traits } from '../catalog.ts';
import { describeValue } from '../describe.ts';
import { digest, mix32 } from '../hash.ts';
import { pickVariant, selectTraits } from '../select.ts';
import { COSTUME_NAMES, LEGENDARY_COSTUMES, REGULAR_COSTUMES, type CostumeName } from './catalog.ts';

/** 2^32 / 25, rounded: exactly 4.00% of words wear a costume. */
export const COSTUME_ROLL_THRESHOLD = 171798692;
/** 2^32 / 50, rounded: 1 in 50 wearers gets a legendary costume. */
export const LEGENDARY_THRESHOLD = 85899346;

// The first two SHA-256 initial hash values: arbitrary, fixed constants.
const TIER_SALT = 0x6a09e667;
const PICK_SALT = 0xbb67ae85;

const COSTUME_VALUES: readonly string[] = Object.freeze(['none', ...COSTUME_NAMES]);

export type CostumeTraits = Traits & { readonly costume: CostumeName | 'none' };
export type CostumeLocks = TraitLocks & { readonly costume?: CostumeName | 'none' | undefined };

/** The costume a digest word rolls, or 'none' for the 96% that wear nothing. */
export function rollCostume(word: number): CostumeName | 'none' {
  if (word >>> 0 >= COSTUME_ROLL_THRESHOLD) return 'none';
  const legendary = mix32((word ^ TIER_SALT) >>> 0) < LEGENDARY_THRESHOLD;
  return pickVariant(mix32((word ^ PICK_SALT) >>> 0), legendary ? LEGENDARY_COSTUMES : REGULAR_COSTUMES);
}

/** The six core traits plus a costume, honoring locks exactly like the core does. */
export function selectCostumeTraits(seed: string, locks?: CostumeLocks): CostumeTraits {
  if (typeof seed !== 'string') throw new TypeError(`seed must be a string, got ${describeValue(seed)}`);
  let costumeLock: CostumeName | 'none' | undefined;
  let coreLocks: TraitLocks | undefined;
  if (locks !== undefined) {
    if (typeof locks !== 'object' || locks === null) {
      throw new TypeError(`traits must be an object, got ${describeValue(locks)}`);
    }
    // Own keys only, each read once, into a prototype-free copy for the core.
    const rest = Object.create(null) as Record<string, unknown>;
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
        rest[key] = value;
      }
    }
    coreLocks = rest as TraitLocks;
  }
  const traits = selectTraits(seed, coreLocks);
  return { ...traits, costume: costumeLock ?? rollCostume(digest(seed)[6] ?? 0) };
}
