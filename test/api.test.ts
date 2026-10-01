import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { composeSvg } from '../src/compose.ts';
import { generateAvatar, getTraits, renderToCanvas, toDataUri, traitNames, type CanvasTarget } from '../src/index.ts';
import { selectTraits } from '../src/select.ts';

test('generateAvatar matches the composer', () => {
  // The golden snapshots pin composeSvg(selectTraits(seed)), so this carries them over.
  for (let i = 0; i < 100; i++) {
    const seed = `api-${i}`;
    assert.equal(generateAvatar(seed), composeSvg(selectTraits(seed), { size: 64 }));
  }
});

test('size only changes width and height', () => {
  const at64 = generateAvatar('alice');
  const at128 = generateAvatar('alice', { size: 128 });
  assert.ok(at128.includes('viewBox="0 0 64 64"'));
  assert.equal(at128, at64.replace('width="64" height="64"', 'width="128" height="128"'));
  assert.ok(generateAvatar('alice', { size: 1.5 }).includes('width="1.5" height="1.5"'));
  assert.equal(generateAvatar('alice', { size: undefined }), at64);
});

test('invalid sizes throw RangeError', () => {
  for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '64', null, Object.create(null), ['64']]) {
    assert.throws(() => generateAvatar('alice', { size: bad as never }), {
      name: 'RangeError',
      message: /size must be a positive finite number/,
    });
  }
});

test('error messages say what was actually passed', () => {
  const sizeMessage = (size: unknown) => {
    try {
      generateAvatar('alice', { size: size as never });
    } catch (error) {
      return (error as Error).message;
    }
    return '';
  };
  assert.match(sizeMessage('64'), /got string "64"$/);
  assert.match(sizeMessage(Number.NaN), /got number NaN$/);
  assert.match(sizeMessage(null), /got null$/);
  assert.match(sizeMessage(['64']), /got array$/);
  assert.match(sizeMessage(Object.create(null)), /got object$/);
  assert.throws(() => generateAvatar(42 as never), { message: /seed must be a string, got number 42/ });
});

test('non-string seeds and titles throw TypeError', () => {
  for (const bad of [42, undefined, null, {}]) {
    assert.throws(() => generateAvatar(bad as never), { name: 'TypeError', message: /seed must be a string/ });
  }
  assert.throws(() => generateAvatar('alice', { title: 5 as never }), { name: 'TypeError', message: /title must be a string/ });
});

test('options that are not an object throw TypeError', () => {
  for (const bad of [null, 'big', 64]) {
    assert.throws(() => generateAvatar('alice', bad as never), { name: 'TypeError', message: /options must be an object/ });
  }
});

test('output never contains the seed', () => {
  const svg = generateAvatar('alice@example.com');
  assert.ok(!svg.includes('alice'));
  assert.ok(!svg.includes('example'));
});

test('locks flow through', () => {
  assert.equal(
    generateAvatar('alice', { traits: { mouth: 'grin' } }),
    composeSvg({ ...selectTraits('alice'), mouth: 'grin' }, { size: 64 }),
  );
  assert.deepEqual(getTraits('alice', { eyes: 'visor' }), selectTraits('alice', { eyes: 'visor' }));
  assert.deepEqual(getTraits('alice'), selectTraits('alice'));
  assert.throws(() => generateAvatar('alice', { traits: { mouth: 'Grin' } as never }), { name: 'RangeError' });
});

test('traitNames is the frozen catalog', () => {
  assert.deepEqual(traitNames, VARIANTS);
  assert.ok(Object.isFrozen(traitNames));
  assert.ok(Object.isFrozen(traitNames.shape));
  assert.throws(() => (traitNames.shape as unknown as string[]).push('blob'), TypeError);
});

test('toDataUri round-trips', () => {
  const svg = generateAvatar('alice', { title: 'A & "B" #1' });
  const uri = toDataUri(svg);
  const prefix = 'data:image/svg+xml;charset=utf-8,';
  assert.ok(uri.startsWith(prefix));
  const rest = uri.slice(prefix.length);
  assert.equal(decodeURIComponent(rest), svg);
  // Nothing that would end an unquoted CSS url() or an attribute value.
  assert.doesNotMatch(rest, /[#<"()']/);
  assert.throws(() => toDataUri(undefined as never), { name: 'TypeError', message: /svg must be a string/ });
});

test('toDataUri accepts any title, even a broken surrogate', () => {
  assert.doesNotThrow(() => toDataUri(generateAvatar('alice', { title: 'Fox \u{1F98A}'.slice(0, 5) })));
});

// A browser stand-in: records the image source, the decode, and the canvas calls.
const fakeBrowser = () => {
  const calls: unknown[][] = [];
  class FakeImage {
    src = '';
    decode(): Promise<void> {
      calls.push(['decode', this.src]);
      return Promise.resolve();
    }
  }
  const context = {
    clearRect: (...args: number[]) => calls.push(['clearRect', ...args]),
    drawImage: (image: unknown, ...args: number[]) => calls.push(['drawImage', image, ...args]),
  };
  const canvas = (ctx: typeof context | null): CanvasTarget => ({ width: 300, height: 150, getContext: () => ctx });
  return { calls, FakeImage, context, canvas };
};

const withImage = async (image: unknown, run: () => Promise<void>) => {
  Reflect.set(globalThis, 'Image', image);
  try {
    await run();
  } finally {
    Reflect.deleteProperty(globalThis, 'Image');
  }
};

test('renderToCanvas draws the decoded image', async () => {
  const { calls, FakeImage, context, canvas } = fakeBrowser();
  const svg = generateAvatar('alice');
  await withImage(FakeImage, () => renderToCanvas(canvas(context), svg));
  assert.deepEqual(
    calls.map((c) => c[0]),
    ['decode', 'clearRect', 'drawImage'],
  );
  assert.deepEqual(calls[0], ['decode', toDataUri(svg)]);
  assert.deepEqual(calls[1], ['clearRect', 0, 0, 300, 150]);
  const image = calls[2]?.[1];
  assert.ok(image instanceof FakeImage);
  assert.deepEqual(calls[2], ['drawImage', image, 0, 0, 300, 150]);
});

test('renderToCanvas rejects when the canvas has no 2d context', async () => {
  const { FakeImage, canvas } = fakeBrowser();
  await withImage(FakeImage, () =>
    assert.rejects(renderToCanvas(canvas(null), generateAvatar('alice')), /2d canvas context unavailable/),
  );
});

test('renderToCanvas outside a browser rejects clearly', async () => {
  const { context, canvas } = fakeBrowser();
  assert.equal(typeof Reflect.get(globalThis, 'Image'), 'undefined');
  await assert.rejects(renderToCanvas(canvas(context), generateAvatar('alice')), /needs a browser/);
});
