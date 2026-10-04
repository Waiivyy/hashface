import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { traitNames } from '../src/costumes/index.ts';
import { INK, WHITE } from '../src/palettes.ts';
import { colorsOf, parseFragment } from './helpers/geometry.ts';
import { assertWellFormed } from './helpers/xml.ts';

// The demo's special guests (docs/costumes.md section 8). demo/tributes.js is
// plain JS that the page loads straight from ../dist, so this test needs a
// build first: npm run build.

type Colors = Readonly<Record<string, string>>;
type Part = (p: Colors) => string;

interface Guest {
  shape(fill: string): string;
  skin: Part;
  eyes: Part;
  mouth: Part;
  back: Part;
  front: Part;
  pattern: Part;
  colors: Colors;
}

interface Tributes {
  TRIBUTE_NAMES: readonly string[];
  TRIBUTES: Readonly<Record<string, Guest>>;
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
    const guest = TRIBUTES[name];
    assert.ok(guest, name);
    assert.deepEqual(Object.keys(guest).sort(), [...FIELDS].sort(), name);
    assert.deepEqual(Object.keys(guest.colors).sort(), ['accent', 'bg', 'body', 'detail', 'pattern'], name);
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

test('every guest follows the fragment rules of the costumes', () => {
  for (const name of TRIBUTE_NAMES) {
    const guest = TRIBUTES[name];
    assert.ok(guest, name);
    const p = guest.colors;
    const allowed = new Set([...Object.values(p), INK, WHITE, 'none']);
    const parts: [string, string][] = [
      ['shape', guest.shape('#ABCDEF')],
      ...(['skin', 'eyes', 'mouth', 'back', 'front'] as const).map((part): [string, string] => [part, guest[part](p)]),
    ];
    for (const [part, svg] of parts) {
      assert.doesNotThrow(() => parseFragment(svg), `${name} ${part}`);
      for (const color of colorsOf(svg)) assert.ok(allowed.has(color) || (part === 'shape' && color === '#ABCDEF'), `${name} ${part} uses ${color}`);
    }
    assert.match(guest.pattern(p), /^(<path [^<>]*\/>)?$/, `${name} pattern is one path or nothing`);
  }
});

test('the credits page names every guest and its owners', () => {
  const credits = readFileSync(new URL('../demo/CREDITS.md', import.meta.url), 'utf8');
  for (const name of TRIBUTE_NAMES) assert.ok(credits.includes(`**${name}**`), `${name} is credited`);
  for (const owner of ['Jacksepticeye', 'VanossGaming', 'Markiplier', 'Mojang Studios and Microsoft']) assert.ok(credits.includes(owner), owner);
});

test('the demo page always credits the owners and links the credits', () => {
  const page = readFileSync(new URL('../demo/index.html', import.meta.url), 'utf8');
  const footer = page.slice(page.indexOf('<footer>'), page.indexOf('</footer>'));
  assert.match(footer, /All rights to characters and assets go to their owners\./);
  assert.match(footer, /href="https:\/\/github\.com\/Waiivyy\/hashface\/blob\/main\/demo\/CREDITS\.md">Credits<\/a>/);
  assert.ok(!page.includes('guest-credit'), 'no per-guest credit line');
});
