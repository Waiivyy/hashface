import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { sep } from 'node:path';
import { test } from 'node:test';
import { generateAvatar } from '../src/index.ts';
import { ANATOMY_SEED, ANATOMY_STEPS, EXAMPLE_SEEDS, galleryFiles } from '../scripts/gallery.ts';
import { assertWellFormed } from './helpers/xml.ts';

// The README shows the files in examples/, so they must match the current
// output. Regenerate them with: node scripts/examples.ts

const EXAMPLES = new URL('../examples/', import.meta.url);
const files = galleryFiles();

test('the examples folder holds exactly the generated gallery', () => {
  const onDisk = (readdirSync(EXAMPLES, { recursive: true }) as string[])
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.split(sep).join('/'))
    .sort();
  assert.deepEqual(onDisk, [...files.keys()].sort());
});

test('every gallery file matches the current output', () => {
  for (const [path, svg] of files) assert.equal(readFileSync(new URL(path, EXAMPLES), 'utf8'), svg, `${path} is stale`);
});

test('the README avatars are plain generateAvatar output', () => {
  for (const seed of ['alice', 'bob', 'carol', 'dave', 'eve', 'mallory', 'trent', 'peggy']) {
    assert.equal(files.get(`${seed}.svg`), generateAvatar(seed, { size: 96 }));
  }
  assert.deepEqual(EXAMPLE_SEEDS, ['alice', 'bob', 'carol', 'dave', 'eve', 'mallory', 'trent', 'peggy']);
  // The logo is the hashface mascot, framed like the banner tiles.
  assert.ok(files.get('logo.svg')?.includes(generateAvatar('hashface', { size: 128 })));
  assert.notEqual(files.get('logo.svg'), generateAvatar('hashface', { size: 128 }));
});

test('the anatomy ends in the finished avatar', () => {
  const last = ANATOMY_STEPS.length;
  assert.equal(files.get(`anatomy/${last}-${ANATOMY_STEPS[last - 1]}.svg`), generateAvatar(ANATOMY_SEED, { size: 96 }));
  const frames = ANATOMY_STEPS.map((step, i) => files.get(`anatomy/${i + 1}-${step}.svg`) ?? '');
  for (let i = 1; i < frames.length; i++) {
    assert.ok((frames[i]?.length ?? 0) > (frames[i - 1]?.length ?? 0), `frame ${i + 1} adds a layer`);
  }
});

test('every gallery image is well-formed svg', () => {
  for (const [path, svg] of files) {
    assert.doesNotThrow(() => assertWellFormed(svg), path);
  }
});
