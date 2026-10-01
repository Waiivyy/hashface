/**
 * Trait selection. Each category reads its own digest word, so categories are
 * independent, and a future category (word 7 is reserved; word 6 belongs to
 * the costume add-on) never changes existing selections. Within a category the variant is picked by
 * rendezvous hashing, so adding a variant later only moves the avatars the new
 * variant wins. See docs/design.md section 6.
 */

import { CATEGORIES, VARIANTS, type Category, type TraitLocks, type Traits } from './catalog.ts';
import { describeValue } from './describe.ts';
import { digest, fnv1a32, mix32 } from './hash.ts';

/** The digest word each category reads. */
export const WORD_INDEX: Readonly<Record<Category, number>> = Object.freeze({
  shape: 0,
  eyes: 1,
  mouth: 2,
  accessory: 3,
  palette: 4,
  pattern: 5,
});

/** VARIANTS seen as a mapped type, so it can be indexed with a generic category. */
const NAMES: { readonly [C in Category]: readonly Traits[C][] } = VARIANTS;

const encoder = new TextEncoder();

/**
 * Rendezvous (highest random weight) pick: every name scores
 * mix32(word ^ fnv1a32(name)), and the first name with the highest score wins.
 */
export function pickVariant<T extends string>(word: number, names: readonly T[]): T {
  let best: T | undefined;
  let bestScore = -1;
  for (const name of names) {
    const score = mix32((word ^ fnv1a32(encoder.encode(name))) >>> 0);
    if (score > bestScore) {
      best = name;
      bestScore = score;
    }
  }
  if (best === undefined) throw new RangeError('pickVariant needs at least one name');
  return best;
}

/** Shared by every unlocked call. No prototype, so a polluted Object.prototype cannot pin a trait. */
const NO_LOCKS: TraitLocks = Object.freeze(Object.create(null) as TraitLocks);

/**
 * Returns a prototype-free copy holding only the caller's own, validated lock
 * values. Each value is read once, so a getter cannot change it after the check.
 */
function validateLocks(locks: unknown): TraitLocks {
  if (typeof locks !== 'object' || locks === null) {
    throw new TypeError(`traits must be an object, got ${describeValue(locks)}`);
  }
  const valid = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(locks)) {
    // An own-property check, so inherited keys like "toString" are rejected too.
    if (!Object.prototype.hasOwnProperty.call(VARIANTS, key)) {
      throw new RangeError(`Unknown trait category "${key}". Valid categories: ${CATEGORIES.join(', ')}`);
    }
    const value: unknown = (locks as Record<string, unknown>)[key];
    if (value === undefined) continue;
    const names: readonly unknown[] = VARIANTS[key as Category];
    if (!names.includes(value)) {
      const shown = typeof value === 'string' ? JSON.stringify(value) : describeValue(value);
      throw new RangeError(`Unknown ${key} ${shown}. Valid ${key} values: ${names.join(', ')}`);
    }
    valid[key] = value;
  }
  return valid as TraitLocks;
}

/** Derives one variant per category from the seed, honoring any locks. */
export function selectTraits(seed: string, locks?: TraitLocks): Traits {
  if (typeof seed !== 'string') throw new TypeError(`seed must be a string, got ${describeValue(seed)}`);
  const pinned = locks === undefined ? NO_LOCKS : validateLocks(locks);
  const words = digest(seed);
  const pick = <C extends Category>(category: C): Traits[C] =>
    pinned[category] ?? pickVariant(words[WORD_INDEX[category]] ?? 0, NAMES[category]);
  return {
    shape: pick('shape'),
    eyes: pick('eyes'),
    mouth: pick('mouth'),
    accessory: pick('accessory'),
    palette: pick('palette'),
    pattern: pick('pattern'),
  };
}
