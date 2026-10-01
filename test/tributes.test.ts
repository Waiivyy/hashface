import assert from 'node:assert/strict';
import { test } from 'node:test';
import { traitNames } from '../src/costumes/index.ts';
import { assertWellFormed } from './helpers/xml.ts';

// The demo's special guests (docs/costumes.md section 8). demo/tributes.js is
// plain JS that the page loads straight from ../dist, so this test needs a
// build first: npm run build.

interface Tributes {
  TRIBUTE_NAMES: readonly string[];
  TRIBUTES: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  matchTribute(input: string): string | null;
  tributeSvg(name: string, size: number, title?: string): string;
}

const tributes = (await import(new URL('../demo/tributes.js', import.meta.url).href)) as Tributes;
const { TRIBUTE_NAMES, TRIBUTES, matchTribute, tributeSvg } = tributes;

test('the guests answer to their exact names, ignoring case and surrounding spaces', () => {
  assert.deepEqual(TRIBUTE_NAMES, ['jacksepticeye', 'vanoss', 'markiplier', 'minecraft']);
  for (const name of TRIBUTE_NAMES) {
    assert.equal(matchTribute(name), name);
    assert.equal(matchTribute(`  ${name.toUpperCase()}\t`), name);
  }
  for (const other of ['', 'minecraft2', 'mine craft', 'vanossgaming', 'jack', 'markiplier!', 'hashface']) {
    assert.equal(matchTribute(other), null, other);
  }
});

test('every guest is fully pinned', () => {
  const FIELDS = ['shape', 'skin', 'eyes', 'mouth', 'back', 'front', 'pattern', 'colors'];
  for (const name of TRIBUTE_NAMES) {
    const guest = TRIBUTES[name] ?? {};
    assert.deepEqual(Object.keys(guest).sort(), [...FIELDS].sort(), name);
    assert.deepEqual(Object.keys(guest.colors as object).sort(), ['accent', 'bg', 'body', 'detail', 'pattern'], name);
  }
});

test('the guests render as well-formed svg and stay out of the costume catalog', () => {
  for (const name of TRIBUTE_NAMES) {
    const svg = tributeSvg(name, 128, `Special guest: ${name}`);
    assertWellFormed(svg);
    assert.match(svg, /^<svg [^>]*width="128" height="128"/);
    assert.ok(svg.includes(`<title>Special guest: ${name}</title>`));
    assert.equal(tributeSvg(name, 128, `Special guest: ${name}`), svg, 'the same picture every time');
    assert.ok(!(traitNames.costume as readonly string[]).includes(name), `${name} is not a costume`);
  }
});
