import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATEGORIES, VARIANTS, type TraitLocks, type Traits } from '../src/catalog.ts';
import { digest } from '../src/hash.ts';
import { pickVariant, selectTraits, WORD_INDEX } from '../src/select.ts';

// Reference traits come from an independent Python implementation of
// docs/design.md section 6. Critical values are chi-square table values at p = 0.001.

const STRUCTURAL = ['shape', 'eyes', 'mouth', 'accessory'] as const;
const CHI2_CRITICAL: Readonly<Record<number, number>> = { 5: 20.515, 7: 24.322, 35: 66.619, 49: 85.351 };
const SEEDS = Array.from({ length: 20_000 }, (_, i) => `seed-${i}`);

let sample: Traits[] | undefined;
const getSample = (): Traits[] => (sample ??= SEEDS.map((seed) => selectTraits(seed)));

const tally = (values: Iterable<string>): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
};

test('catalog matches the spec', () => {
  assert.deepEqual(CATEGORIES, ['shape', 'eyes', 'mouth', 'accessory', 'palette', 'pattern']);
  assert.deepEqual(VARIANTS.shape, ['square', 'circle', 'hexagon', 'capsule', 'arch', 'octagon', 'drop', 'ghost']);
  assert.deepEqual(VARIANTS.eyes, ['dots', 'googly', 'visor', 'crosses', 'happy', 'sleepy', 'wink', 'cyclops']);
  assert.deepEqual(VARIANTS.mouth, ['smile', 'flat', 'open', 'zigzag', 'o', 'grin', 'smirk', 'tongue']);
  assert.deepEqual(VARIANTS.accessory, ['none', 'antenna', 'party-hat', 'bow', 'headphones', 'crown', 'sprout', 'horns']);
  assert.deepEqual(VARIANTS.palette, ['lemon', 'sky', 'mint', 'coral', 'grape', 'bubblegum', 'tangerine', 'cream']);
  assert.deepEqual(VARIANTS.pattern, ['none', 'dots', 'stripes', 'grid', 'waves', 'sun']);
  assert.ok(Object.isFrozen(VARIANTS));
  for (const category of CATEGORIES) {
    const names: readonly string[] = VARIANTS[category];
    assert.equal(new Set(names).size, names.length, `${category} names are unique`);
    for (const name of names) assert.match(name, /^[a-z]+(-[a-z]+)*$/);
    assert.ok(Object.isFrozen(names), `${category} list is frozen`);
  }
});

test('each category reads its own digest word', () => {
  assert.deepEqual(WORD_INDEX, { shape: 0, eyes: 1, mouth: 2, accessory: 3, palette: 4, pattern: 5 });
});

test('selectTraits matches the reference implementation', () => {
  assert.deepEqual(selectTraits('alice'), { shape: 'circle', eyes: 'wink', mouth: 'smirk', accessory: 'antenna', palette: 'grape', pattern: 'dots' });
  assert.deepEqual(selectTraits('bob'), { shape: 'drop', eyes: 'wink', mouth: 'o', accessory: 'horns', palette: 'grape', pattern: 'waves' });
  assert.deepEqual(selectTraits(''), { shape: 'capsule', eyes: 'visor', mouth: 'flat', accessory: 'sprout', palette: 'coral', pattern: 'none' });
  assert.deepEqual(selectTraits('ünïcödé'), { shape: 'arch', eyes: 'cyclops', mouth: 'flat', accessory: 'sprout', palette: 'sky', pattern: 'waves' });
  assert.deepEqual(selectTraits('\u{1F98A}'), { shape: 'capsule', eyes: 'happy', mouth: 'tongue', accessory: 'none', palette: 'lemon', pattern: 'grid' });
  assert.deepEqual(selectTraits('hashface'), { shape: 'arch', eyes: 'dots', mouth: 'grin', accessory: 'crown', palette: 'tangerine', pattern: 'dots' });
});

test('selectTraits is deterministic', () => {
  for (let i = 0; i < 1000; i++) {
    const seed = `det-${i}`;
    assert.deepEqual(selectTraits(seed), selectTraits(seed));
  }
});

test('each category is uniformly distributed', () => {
  const traits = getSample();
  for (const category of CATEGORIES) {
    const names: readonly string[] = VARIANTS[category];
    const counts = tally(traits.map((t) => t[category]));
    const expected = traits.length / names.length;
    let chi = 0;
    for (const name of names) chi += ((counts.get(name) ?? 0) - expected) ** 2 / expected;
    const critical = CHI2_CRITICAL[names.length - 1] ?? 0;
    assert.ok(chi < critical, `${category}: chi-square ${chi.toFixed(2)} >= ${critical}`);
  }
});

test('categories are independent of each other', () => {
  const traits = getSample();
  for (const [i, a] of CATEGORIES.entries()) {
    for (const b of CATEGORIES.slice(i + 1)) {
      const namesA: readonly string[] = VARIANTS[a];
      const namesB: readonly string[] = VARIANTS[b];
      const rowTotals = tally(traits.map((t) => t[a]));
      const colTotals = tally(traits.map((t) => t[b]));
      const joint = tally(traits.map((t) => `${t[a]}|${t[b]}`));
      let chi = 0;
      for (const x of namesA) {
        for (const y of namesB) {
          const expected = ((rowTotals.get(x) ?? 0) * (colTotals.get(y) ?? 0)) / traits.length;
          chi += ((joint.get(`${x}|${y}`) ?? 0) - expected) ** 2 / expected;
        }
      }
      const critical = CHI2_CRITICAL[(namesA.length - 1) * (namesB.length - 1)] ?? 0;
      assert.ok(chi < critical, `${a}/${b}: chi-square ${chi.toFixed(2)} >= ${critical}`);
    }
  }
});

test('neighboring seeds differ in structure, not just color', () => {
  const pairs = 10_000;
  let differences = 0;
  let identical = 0;
  for (let i = 0; i < pairs; i++) {
    const a = selectTraits(`user-${i}`);
    const b = selectTraits(`user-${i + 1}`);
    const d = STRUCTURAL.filter((category) => a[category] !== b[category]).length;
    differences += d;
    if (d === 0) identical++;
  }
  assert.ok(differences / pairs >= 3.3, `mean structural differences ${differences / pairs}`); // reference 3.490
  assert.ok(identical < 50, `${identical} pairs share their whole structure`); // reference 5
});

test('adding a variant only moves the seeds it wins', () => {
  const extended = [...VARIANTS.shape, 'new-variant'];
  let moved = 0;
  let movedElsewhere = 0;
  for (const seed of SEEDS) {
    const word = digest(seed)[WORD_INDEX.shape] ?? 0;
    const before = pickVariant(word, VARIANTS.shape);
    const after = pickVariant(word, extended);
    if (before !== after) {
      moved++;
      if (after !== 'new-variant') movedElsewhere++;
    }
  }
  const fraction = moved / SEEDS.length;
  assert.ok(Math.abs(fraction - 1 / 9) <= 0.01, `moved fraction ${fraction}`); // reference 0.1094
  assert.equal(movedElsewhere, 0);
});

test('a lock pins one category and leaves the others alone', () => {
  for (let i = 0; i < 200; i++) {
    const seed = `lock-${i}`;
    const free = selectTraits(seed);
    for (const category of CATEGORIES) {
      const value = VARIANTS[category][0];
      const locked = selectTraits(seed, { [category]: value } as TraitLocks);
      assert.deepEqual(locked, { ...free, [category]: value });
    }
  }
});

test('undefined lock values are ignored', () => {
  assert.deepEqual(selectTraits('alice', { mouth: undefined }), selectTraits('alice'));
});

test('invalid locks throw RangeError', () => {
  assert.throws(() => selectTraits('a', { mouth: 'Grin' } as never), {
    name: 'RangeError',
    message: /Unknown mouth "Grin"\. Valid mouth values: smile, flat, open/,
  });
  assert.throws(() => selectTraits('a', { mouth: null } as never), { name: 'RangeError', message: /Unknown mouth "null"/ });
  assert.throws(() => selectTraits('a', { hat: 'x' } as never), {
    name: 'RangeError',
    message: /Unknown trait category "hat"\. Valid categories: shape, eyes, mouth, accessory, palette, pattern/,
  });
  assert.throws(() => selectTraits('a', { toString: 'x' } as never), { name: 'RangeError', message: /Unknown trait category "toString"/ });
  assert.throws(() => selectTraits('a', { constructor: 'x' } as never), { name: 'RangeError' });
});

test('a traits value that is not an object throws TypeError', () => {
  for (const bad of [null, 'mouth', 42]) {
    assert.throws(() => selectTraits('a', bad as never), { name: 'TypeError', message: /traits must be an object/ });
  }
});

test('non-string seeds throw TypeError', () => {
  for (const bad of [42, undefined, null, {}]) {
    assert.throws(() => selectTraits(bad as never), { name: 'TypeError', message: /seed must be a string/ });
  }
});
