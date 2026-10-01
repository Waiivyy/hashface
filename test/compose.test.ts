import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS, type Traits } from '../src/catalog.ts';
import { composeSvg } from '../src/compose.ts';
import { INK, PALETTES } from '../src/palettes.ts';
import { selectTraits } from '../src/select.ts';
import { ACCESSORIES } from '../src/traits/accessories.ts';
import { EYES } from '../src/traits/eyes.ts';
import { MOUTHS } from '../src/traits/mouths.ts';
import { PATTERNS } from '../src/traits/patterns.ts';
import { SHAPES } from '../src/traits/shapes.ts';
import { assertWellFormed } from './helpers/xml.ts';

const ROOT_64 =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" stroke-linecap="round" stroke-linejoin="round">';

const FIRST_OF_EACH: Traits = {
  shape: VARIANTS.shape[0],
  eyes: VARIANTS.eyes[0],
  mouth: VARIANTS.mouth[0],
  accessory: VARIANTS.accessory[0],
  palette: VARIANTS.palette[0],
  pattern: VARIANTS.pattern[0],
};

test('composeSvg stacks the eight layers in the documented order', () => {
  for (const t of [selectTraits('alice'), selectTraits('bob'), FIRST_OF_EACH]) {
    const p = PALETTES[t.palette];
    const accessory = ACCESSORIES[t.accessory];
    const expected =
      ROOT_64 +
      `<rect width="64" height="64" fill="${p.bg}"/>` +
      PATTERNS[t.pattern](p) +
      (accessory.back?.(p) ?? '') +
      `<g transform="translate(3 3)">${SHAPES[t.shape](INK)}</g>` +
      SHAPES[t.shape](p.body) +
      EYES[t.eyes](p) +
      MOUTHS[t.mouth](p) +
      (accessory.front?.(p) ?? '') +
      '</svg>';
    assert.equal(composeSvg(t, { size: 64 }), expected);
  }
});

test('the root element carries the documented attributes', () => {
  const t = selectTraits('alice');
  assert.ok(composeSvg(t, { size: 64 }).startsWith(ROOT_64));
  assert.ok(
    composeSvg(t, { size: 128 }).startsWith(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128" stroke-linecap="round" stroke-linejoin="round">',
    ),
  );
  assert.ok(composeSvg(t, { size: 64 }).endsWith('</svg>'));
});

test('output is one line with no ids or external references', () => {
  for (let i = 0; i < 500; i++) {
    const svg = composeSvg(selectTraits(`s${i}`), { size: 64 });
    for (const banned of ['\n', ' id=', 'href', 'url(', '<script', 'NaN', 'undefined']) {
      assert.ok(!svg.includes(banned), `s${i} contains ${JSON.stringify(banned)}`);
    }
    assertWellFormed(svg);
  }
});

test('a title is escaped and marks the svg as an image', () => {
  const svg = composeSvg(selectTraits('alice'), { size: 64, title: `<script>alert("x")</script> & 'y'` });
  const titledRoot = `${ROOT_64.slice(0, -1)} role="img">`;
  assert.ok(svg.startsWith(`${titledRoot}<title>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &apos;y&apos;</title>`));
  assert.ok(!svg.includes('<script'));
  assertWellFormed(svg);
});

test('an empty title adds nothing', () => {
  const t = selectTraits('alice');
  assert.equal(composeSvg(t, { size: 64, title: '' }), composeSvg(t, { size: 64 }));
});

test('avatars stay small', (t) => {
  let total = 0;
  for (let i = 0; i < 1000; i++) total += composeSvg(selectTraits(`size-${i}`), { size: 64 }).length;
  const mean = total / 1000;
  t.diagnostic(`mean avatar size: ${Math.round(mean)} bytes`);
  assert.ok(mean <= 2000, `mean avatar size ${mean} bytes`);
});

test('assertWellFormed rejects broken markup', () => {
  assertWellFormed('<svg><rect width="1" height="1"/><title>a &amp; b</title></svg>');
  for (const bad of ['<svg><rect></svg>', '<svg><title>a & b</title></svg>', '<svg>1 < 2</svg>', 'x<svg></svg>', '<svg></svg><rect/>', '<svg>', '<rect/>']) {
    assert.throws(() => assertWellFormed(bad), Error, `${bad} should be rejected`);
  }
});
