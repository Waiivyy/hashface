import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DIGEST_WORDS, digest, fnv1a32, mix32 } from '../src/hash.ts';

// Expected values come from an independent Python implementation of
// docs/design.md section 6, not from this code.

const utf8 = (s: string) => new TextEncoder().encode(s);

const popcount = (x: number): number => {
  let n = 0;
  for (let v = x >>> 0; v !== 0; v >>>= 1) n += v & 1;
  return n;
};

test('fnv1a32 matches the published FNV-1a vectors', () => {
  assert.equal(fnv1a32(utf8('')), 0x811c9dc5);
  assert.equal(fnv1a32(utf8('a')), 0xe40c292c);
  assert.equal(fnv1a32(utf8('foobar')), 0xbf9cf968);
});

test('mix32 is the MurmurHash3 finalizer', () => {
  assert.equal(mix32(0), 0);
  assert.equal(mix32(1), 1364076727);
  assert.ok(mix32(0xffffffff) >= 0);
});

test('digest expands the hash into eight reference words', () => {
  assert.equal(DIGEST_WORDS, 8);
  assert.deepEqual(
    [...digest('hashface')],
    [1591782710, 2436095298, 2903142050, 4248841790, 2572223135, 1820485734, 996490226, 1544477003],
  );
  assert.equal(digest('')[0], 164558732);
});

test('digest hashes UTF-8 exactly as given', () => {
  assert.equal(digest('ü')[0], 3965709055);
  // No Unicode normalization: precomposed and decomposed forms differ.
  assert.notEqual(digest('é')[0], digest('é')[0]);
  // A lone surrogate encodes as U+FFFD, so both seeds share an avatar.
  assert.deepEqual(digest('\uD800'), digest('�'));
});

test('a one-character change flips about half of the digest bits', () => {
  const pairs = 2000;
  let flipped = 0;
  for (let i = 0; i < pairs; i++) {
    const a = digest(`k${i}a`);
    const b = digest(`k${i}b`);
    for (let w = 0; w < DIGEST_WORDS; w++) flipped += popcount((a[w] ?? 0) ^ (b[w] ?? 0));
  }
  const mean = flipped / (pairs * DIGEST_WORDS * 32);
  assert.ok(mean >= 0.48 && mean <= 0.52, `mean flipped fraction ${mean}`); // reference: 0.5009
});
