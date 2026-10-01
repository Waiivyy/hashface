import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { test } from 'node:test';
import { COSTUME_NAMES } from '../src/costumes/catalog.ts';
import { generateAvatar, getTraits } from '../src/costumes/index.ts';

// Golden snapshots for the add-on: every costume locked on one seed, plus the
// first seeds that roll a costume on their own. Changing an existing costume's
// drawing ships as a major release (docs/costumes.md section 9). To change one
// on purpose: `UPDATE_GOLDEN=1 node --test test/costumes.golden.test.ts`.

const FIXTURE = new URL('./fixtures/costumes-golden.json', import.meta.url);
const NATURAL_WEARERS = 8;

interface Golden {
  seed: string;
  costume: string;
  sha256: string;
}

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

const naturalWearers = (): string[] => {
  const seeds: string[] = [];
  for (let i = 0; seeds.length < NATURAL_WEARERS; i++) {
    if (getTraits(`party-${i}`).costume !== 'none') seeds.push(`party-${i}`);
  }
  return seeds;
};

const snapshots = (): Golden[] => [
  ...COSTUME_NAMES.map((costume) => ({
    seed: 'golden',
    costume,
    sha256: sha256(generateAvatar('golden', { traits: { costume } })),
  })),
  ...naturalWearers().map((seed) => ({ seed, costume: getTraits(seed).costume, sha256: sha256(generateAvatar(seed)) })),
];

test('golden snapshots pin every costume', () => {
  const actual = snapshots();
  if (process.env.UPDATE_GOLDEN === '1') {
    mkdirSync(new URL('./', FIXTURE), { recursive: true });
    writeFileSync(FIXTURE, `${JSON.stringify(actual, null, 2)}\n`);
    return;
  }
  const expected = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Golden[];
  assert.deepEqual(
    actual.map(({ seed, costume }) => `${seed} ${costume}`),
    expected.map(({ seed, costume }) => `${seed} ${costume}`),
  );
  for (const [i, golden] of expected.entries()) {
    assert.equal(actual[i]?.sha256, golden.sha256, `output changed for ${golden.costume} on ${JSON.stringify(golden.seed)}`);
  }
});
