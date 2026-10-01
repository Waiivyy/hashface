import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { test } from 'node:test';
import { composeSvg } from '../src/compose.ts';
import { selectTraits } from '../src/select.ts';

// Golden snapshots: the SHA-256 of the exact SVG for fixed seeds. Any change to
// the output for an existing seed fails here. To change the output on purpose,
// regenerate with `UPDATE_GOLDEN=1 node --test test/golden.test.ts` and ship it
// as a major release (docs/design.md section 2).

const SEEDS = [
  'alice',
  'bob',
  'carol',
  '',
  ' alice ',
  'Alice',
  'ünïcödé',
  '\u{1F98A}',
  'a'.repeat(1000),
  '1234567890',
  'user-1',
  'user-2',
];

const FIXTURE = new URL('./fixtures/golden.json', import.meta.url);

interface Golden {
  seed: string;
  sha256: string;
}

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');
const render = (seed: string): string => composeSvg(selectTraits(seed), { size: 64 });

test('golden snapshots pin the exact output', () => {
  const actual: Golden[] = SEEDS.map((seed) => ({ seed, sha256: sha256(render(seed)) }));
  if (process.env.UPDATE_GOLDEN === '1') {
    mkdirSync(new URL('./', FIXTURE), { recursive: true });
    writeFileSync(FIXTURE, `${JSON.stringify(actual, null, 2)}\n`);
    return;
  }
  const expected = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Golden[];
  assert.deepEqual(
    expected.map((g) => g.seed),
    SEEDS,
  );
  for (const [i, golden] of expected.entries()) {
    assert.equal(actual[i]?.sha256, golden.sha256, `output changed for seed ${JSON.stringify(golden.seed)}`);
  }
});
