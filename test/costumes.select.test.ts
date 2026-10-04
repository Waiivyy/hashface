import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TraitLocks } from '../src/catalog.ts';
import { COSTUME_NAMES } from '../src/costumes/catalog.ts';
import { MASCOT_SEED, matchCostume, selectCostumeTraits } from '../src/costumes/select.ts';
import { selectTraits } from '../src/select.ts';

// docs/costumes.md section 4: nothing is left to chance. A seed that spells a
// costume's name wears that costume, on the mascot; every other seed wears
// nothing unless a lock says otherwise.

/** The mascot with its crown off, as it wears every summoned costume. */
const mascot = (locks: TraitLocks = {}) => selectTraits(MASCOT_SEED, { accessory: 'none', ...locks });

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
  assert.ok(Object.isFrozen(COSTUME_NAMES));
});

test('every costume name summons that costume, worn by the mascot', () => {
  assert.equal(MASCOT_SEED, 'hashface');
  for (const name of COSTUME_NAMES) assert.deepEqual(selectCostumeTraits(name), { ...mascot(), costume: name }, name);
});

test('names match ignoring case, surrounding spaces, and spaces or underscores for hyphens', () => {
  const matches: [string, string][] = [
    ['ninja', 'ninja'],
    ['Ninja', 'ninja'],
    ['  ZOMBIE\t', 'zombie'],
    ['rubber duck', 'rubber-duck'],
    ['Rubber_Duck', 'rubber-duck'],
    ['golden   mascot', 'golden-mascot'],
    ['not-found', 'not-found'],
  ];
  for (const [typed, costume] of matches) assert.equal(matchCostume(typed), costume, typed);
  for (const typed of ['', 'ni', 'ninjas', 'nin ja', 'pirate!', 'super pirate', 'hashface', '-ninja', 'ninja-']) {
    assert.equal(matchCostume(typed), null, typed);
  }
});

test('nothing is left to chance: every other seed wears no costume', () => {
  for (let i = 0; i < 20_000; i++) {
    const seed = `seed-${i}`;
    assert.deepEqual(selectCostumeTraits(seed), { ...selectTraits(seed), costume: 'none' });
  }
  // Seeds the old 1-in-25 roll dressed up.
  for (const seed of ['ni', 'party-10', 'party-39', 'legend-3924']) assert.equal(selectCostumeTraits(seed).costume, 'none', seed);
});

test('core locks apply on top of a summoned costume', () => {
  assert.deepEqual(selectCostumeTraits('ninja', { eyes: 'googly' }), { ...mascot({ eyes: 'googly' }), costume: 'ninja' });
  assert.equal(selectCostumeTraits('pirate', { accessory: 'crown' }).accessory, 'crown');
  assert.equal(selectCostumeTraits('pirate', { accessory: undefined }).accessory, 'none');
  assert.throws(() => selectCostumeTraits('ninja', { mouth: 'Grin' } as never), { name: 'RangeError', message: /Unknown mouth "Grin"/ });
});

test('a costume lock overrides the name', () => {
  assert.deepEqual(selectCostumeTraits('ninja', { costume: 'none' }), { ...selectTraits('ninja'), costume: 'none' });
  assert.deepEqual(selectCostumeTraits('ninja', { costume: 'pirate' }), { ...selectTraits('ninja'), costume: 'pirate' });
});

test('costume locks force, clear and combine with core locks', () => {
  assert.equal(selectCostumeTraits('alice', { costume: 'pirate' }).costume, 'pirate');
  const both = selectCostumeTraits('alice', { costume: 'pirate', mouth: 'grin' });
  assert.deepEqual(both, { ...selectTraits('alice', { mouth: 'grin' }), costume: 'pirate' });
  assert.deepEqual(selectCostumeTraits('alice', { costume: undefined }), selectCostumeTraits('alice'));
  assert.deepEqual(selectCostumeTraits('zombie', { costume: undefined }), selectCostumeTraits('zombie'));
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
