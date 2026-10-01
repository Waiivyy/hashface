import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { COSTUME_NAMES, LEGENDARY_COSTUMES, REGULAR_COSTUMES } from '../src/costumes/catalog.ts';
import { COSTUME_ROLL_THRESHOLD, LEGENDARY_THRESHOLD, rollCostume, selectCostumeTraits } from '../src/costumes/select.ts';
import { digest, mix32 } from '../src/hash.ts';
import { pickVariant, selectTraits } from '../src/select.ts';

// Reference picks come from an independent Python implementation of
// docs/costumes.md section 4. Critical values are chi-square table values at p = 0.001.

const CHI2_CRITICAL: Readonly<Record<number, number>> = { 2: 13.816, 5: 20.515, 7: 24.322, 36: 67.985 };

/** Two million pseudo-random words from a SplitMix-style stream, starting at 1. */
const sampledWords = function* (count = 2_000_000): Generator<number> {
  let state = 1;
  for (let i = 0; i < count; i++) {
    state = (state + 0x9e3779b9) >>> 0;
    yield mix32(state);
  }
};

const chiSquare = (counts: Map<string, number>, names: readonly string[]): number => {
  const total = names.reduce((sum, n) => sum + (counts.get(n) ?? 0), 0);
  const expected = total / names.length;
  return names.reduce((chi, n) => chi + ((counts.get(n) ?? 0) - expected) ** 2 / expected, 0);
};

test('the catalog matches the spec', () => {
  assert.deepEqual(COSTUME_NAMES, [
    'pirate', 'wizard', 'knight', 'ninja', 'viking', 'astronaut',
    'vampire', 'zombie', 'mummy', 'witch', 'skeleton', 'alien',
    'cat', 'frog', 'panda', 'fox', 'penguin', 'bunny',
    'pizza', 'donut', 'taco', 'avocado', 'cupcake',
    'pixel-hero', 'slime', 'mimic', 'final-boss', 'glitch',
    'rubber-duck', 'coffee-addict', 'merge-conflict', 'not-found', 'infinite-loop',
    'snowman', 'holiday-elf', 'birthday', 'valentine',
    'golden-mascot', 'cosmic', 'rainbow',
  ]);
  assert.deepEqual(LEGENDARY_COSTUMES, ['golden-mascot', 'cosmic', 'rainbow']);
  assert.equal(REGULAR_COSTUMES.length, 37);
  assert.ok(REGULAR_COSTUMES.every((n) => !LEGENDARY_COSTUMES.includes(n)));
  for (const list of [COSTUME_NAMES, LEGENDARY_COSTUMES, REGULAR_COSTUMES]) assert.ok(Object.isFrozen(list));
});

test('the roll uses the documented thresholds', () => {
  assert.equal(COSTUME_ROLL_THRESHOLD, 171798692);
  assert.equal(LEGENDARY_THRESHOLD, 85899346);
  assert.notEqual(rollCostume(0), 'none');
  assert.notEqual(rollCostume(171798691), 'none');
  assert.equal(rollCostume(171798692), 'none');
  assert.equal(rollCostume(0xffffffff), 'none');
});

test('selection matches the reference implementation', () => {
  const expected: [string, string][] = [
    ['party-10', 'valentine'], ['party-39', 'taco'], ['party-60', 'skeleton'], ['party-94', 'glitch'],
    ['party-98', 'fox'], ['party-145', 'vampire'], ['party-146', 'witch'], ['party-226', 'fox'],
    ['legend-3924', 'cosmic'], ['alice', 'none'], ['bob', 'none'], ['hashface', 'none'],
  ];
  for (const [seed, costume] of expected) assert.equal(selectCostumeTraits(seed).costume, costume, seed);
});

test('4% of seeds wear a costume', () => {
  let wearers = 0;
  for (let i = 0; i < 20_000; i++) if (selectCostumeTraits(`seed-${i}`).costume !== 'none') wearers++;
  assert.ok(Math.abs(wearers / 20_000 - 0.04) <= 0.005, `wearer share ${wearers / 20_000}`); // reference 800 = 4.00%
});

test('legendaries are 1 in 50 wearers and every costume gets its share', () => {
  const counts = new Map<string, number>();
  let wearers = 0;
  for (const word of sampledWords()) {
    const costume = rollCostume(word);
    if (costume === 'none') continue;
    wearers++;
    counts.set(costume, (counts.get(costume) ?? 0) + 1);
  }
  const legendary = LEGENDARY_COSTUMES.reduce((sum, n) => sum + (counts.get(n) ?? 0), 0);
  assert.ok(Math.abs(legendary / wearers - 0.02) <= 0.005, `legendary share ${legendary / wearers}`); // reference 2.024%
  const regularChi = chiSquare(counts, REGULAR_COSTUMES);
  const legendaryChi = chiSquare(counts, LEGENDARY_COSTUMES);
  assert.ok(regularChi < (CHI2_CRITICAL[36] ?? 0), `regular chi-square ${regularChi}`);
  assert.ok(legendaryChi < (CHI2_CRITICAL[2] ?? 0), `legendary chi-square ${legendaryChi}`);
});

test('wearing a costume is independent of the core traits', () => {
  const rows = Array.from({ length: 20_000 }, (_, i) => selectCostumeTraits(`seed-${i}`));
  for (const category of Object.keys(VARIANTS) as (keyof typeof VARIANTS)[]) {
    const names: readonly string[] = VARIANTS[category];
    const all = new Map<string, number>();
    const worn = new Map<string, number>();
    for (const row of rows) {
      all.set(row[category], (all.get(row[category]) ?? 0) + 1);
      if (row.costume !== 'none') worn.set(row[category], (worn.get(row[category]) ?? 0) + 1);
    }
    const share = [...worn.values()].reduce((a, b) => a + b, 0) / rows.length;
    let chi = 0;
    for (const name of names) {
      const n = all.get(name) ?? 0;
      const w = worn.get(name) ?? 0;
      chi += (w - n * share) ** 2 / (n * share) + (n - w - n * (1 - share)) ** 2 / (n * (1 - share));
    }
    const critical = CHI2_CRITICAL[names.length - 1] ?? 0;
    assert.ok(chi < critical, `${category}: chi-square ${chi.toFixed(2)} >= ${critical}`);
  }
});

test('adding a regular costume only moves the wearers it wins', () => {
  const extended = [...REGULAR_COSTUMES, 'new-costume'];
  let regularWearers = 0;
  let moved = 0;
  let movedElsewhere = 0;
  for (const word of sampledWords(400_000)) {
    if (word >= 171798692 || mix32((word ^ 0x6a09e667) >>> 0) < 85899346) continue;
    regularWearers++;
    const pickWord = mix32((word ^ 0xbb67ae85) >>> 0);
    const before = pickVariant(pickWord, REGULAR_COSTUMES);
    const after = pickVariant(pickWord, extended);
    if (before !== after) {
      moved++;
      if (after !== 'new-costume') movedElsewhere++;
    }
  }
  assert.ok(Math.abs(moved / regularWearers - 1 / 38) <= 0.01, `moved share ${moved / regularWearers}`);
  assert.equal(movedElsewhere, 0);
});

test('costume locks force, clear and combine with core locks', () => {
  assert.equal(selectCostumeTraits('alice', { costume: 'pirate' }).costume, 'pirate');
  assert.equal(selectCostumeTraits('party-10', { costume: 'none' }).costume, 'none');
  const both = selectCostumeTraits('alice', { costume: 'pirate', mouth: 'grin' });
  assert.deepEqual(both, { ...selectTraits('alice', { mouth: 'grin' }), costume: 'pirate' });
  assert.deepEqual(selectCostumeTraits('alice', { costume: undefined }), selectCostumeTraits('alice'));
  const { costume, ...core } = selectCostumeTraits('party-10');
  assert.equal(costume, 'valentine');
  assert.deepEqual(core, selectTraits('party-10'));
});

test('invalid costume locks fail like core locks', () => {
  assert.throws(() => selectCostumeTraits('a', { costume: 'Pirate' } as never), {
    name: 'RangeError',
    message: /Unknown costume "Pirate"\. Valid costume values: none, pirate, wizard/,
  });
  assert.throws(() => selectCostumeTraits('a', { costume: null } as never), { name: 'RangeError', message: /Unknown costume null\./ });
  assert.throws(() => selectCostumeTraits('a', { costume: 42 } as never), { name: 'RangeError', message: /Unknown costume number 42\./ });
  assert.throws(() => selectCostumeTraits('a', { hat: 'x' } as never), {
    name: 'RangeError',
    message: /Unknown trait category "hat"\. Valid categories: shape, eyes, mouth, accessory, palette, pattern, costume/,
  });
  assert.throws(() => selectCostumeTraits('a', { mouth: 'Grin' } as never), { name: 'RangeError', message: /Unknown mouth "Grin"/ });
  // Inherited values are not locks.
  assert.deepEqual(selectCostumeTraits('a', Object.create({ costume: 'pirate' }) as never), selectCostumeTraits('a'));
  assert.throws(() => selectCostumeTraits('a', null as never), { name: 'TypeError', message: /traits must be an object, got null/ });
});

test('non-string seeds fail before any lock check', () => {
  assert.throws(() => selectCostumeTraits(42 as never, { costume: 'Pirate' } as never), {
    name: 'TypeError',
    message: /seed must be a string, got number 42/,
  });
});

test('the roll reads digest word 6', () => {
  for (let i = 0; i < 2000; i++) {
    const seed = `word-${i}`;
    assert.equal(selectCostumeTraits(seed).costume, rollCostume(digest(seed)[6] ?? 0));
  }
});
