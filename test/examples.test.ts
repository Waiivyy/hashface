import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { generateAvatar } from '../src/index.ts';

// The README gallery shows these files, so they must match the current output.
// Regenerate them with: node scripts/examples.ts

const EXAMPLES = new URL('../examples/', import.meta.url);
const SEEDS = ['alice', 'bob', 'carol', 'dave', 'eve', 'mallory', 'trent', 'peggy'];

test('the examples folder holds exactly the gallery seeds', () => {
  const files = readdirSync(EXAMPLES).filter((f) => f.endsWith('.svg'));
  assert.deepEqual(files.map((f) => f.slice(0, -'.svg'.length)).sort(), [...SEEDS].sort());
});

for (const seed of SEEDS) {
  test(`examples/${seed}.svg matches the current output`, () => {
    assert.equal(readFileSync(new URL(`${seed}.svg`, EXAMPLES), 'utf8'), generateAvatar(seed, { size: 96 }));
  });
}
