/**
 * Builds every image the README shows, as a map from a path inside examples/
 * to SVG text. scripts/examples.ts writes them to disk, and
 * test/examples.test.ts checks that the committed files are current.
 *
 * Composed images (banner, trait strips) sit on an opaque cream panel so they
 * read on both light and dark GitHub themes.
 */

import { CATEGORIES, VARIANTS, type Category, type TraitLocks } from '../src/catalog.ts';
import { escapeXml } from '../src/compose.ts';
import { generateAvatar, getTraits } from '../src/index.ts';
import { INK, PALETTES } from '../src/palettes.ts';
import { EYES } from '../src/traits/eyes.ts';
import { MOUTHS } from '../src/traits/mouths.ts';
import { PATTERNS } from '../src/traits/patterns.ts';
import { SHAPES } from '../src/traits/shapes.ts';

/** The plain avatars in the README gallery, at 96px. */
export const EXAMPLE_SEEDS = ['alice', 'bob', 'carol', 'dave', 'eve', 'mallory', 'trent', 'peggy'];

/** The seed whose avatar is built up layer by layer in "Anatomy of a face". */
export const ANATOMY_SEED = 'mallory';

const BANNER_SEEDS = [
  'pancake', 'thunder', 'waffles', 'noodle', 'night-owl', 'sir-quacks-a-lot', 'tofu', 'ziggy', 'banana split',
  'hello world', 'robot@example.com', 'user-1', 'user-2', 'captain', 'pickle', 'disco', 'bean', 'moxie',
];

const PAPER = '#F4EFE3';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const svgRoot = (width: number, height: number, defs: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
  `<defs>${defs}</defs>` +
  `<rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="20" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` +
  `${body}</svg>`;

const tileClip = (size: number): string => `<clipPath id="tile"><rect width="${size}" height="${size}" rx="14"/></clipPath>`;

/** An avatar with rounded corners, an ink frame and a hard shadow, like the demo's tiles. */
const tile = (avatar: string, x: number, y: number, size: number): string =>
  `<g transform="translate(${x} ${y})">` +
  `<rect x="4" y="4" width="${size}" height="${size}" rx="14" fill="${INK}"/>` +
  `<g clip-path="url(#tile)">${avatar}</g>` +
  `<rect x="1.5" y="1.5" width="${size - 3}" height="${size - 3}" rx="13" fill="none" stroke="${INK}" stroke-width="3"/>` +
  `</g>`;

/** The hashface mascot as a framed tile, for the top of the README. */
function logo(): string {
  const size = 128;
  const box = size + 6;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" width="${box}" height="${box}">` +
    `<defs>${tileClip(size)}</defs>${tile(generateAvatar('hashface', { size }), 0, 0, size)}</svg>`
  );
}

function banner(): string {
  const size = 80;
  const gap = 14;
  const pad = 22;
  const perRow = 9;
  const rows = Math.ceil(BANNER_SEEDS.length / perRow);
  const width = pad * 2 + perRow * size + (perRow - 1) * gap;
  const height = pad * 2 + rows * size + (rows - 1) * gap;
  const tiles = BANNER_SEEDS.map((seed, i) =>
    tile(generateAvatar(seed, { size }), pad + (i % perRow) * (size + gap), pad + Math.floor(i / perRow) * (size + gap), size),
  );
  return svgRoot(width, height, tileClip(size), tiles.join(''));
}

/**
 * One strip per category: every variant locked over the mascot's other traits,
 * with its name. Patterns get a small round head with no accessory, so the
 * background shows.
 */
function traitStrip(category: Category): string {
  const size = 72;
  const gap = 18;
  const pad = 20;
  const names: readonly string[] = VARIANTS[category];
  const base: TraitLocks = category === 'pattern' ? { shape: 'circle', accessory: 'none' } : {};
  const width = pad * 2 + names.length * size + (names.length - 1) * gap;
  const height = pad + size + 40;
  const cells = names.map((name, i) => {
    const x = pad + i * (size + gap);
    const avatar = generateAvatar('hashface', { size, traits: { ...base, [category]: name } as TraitLocks });
    const label =
      `<text x="${x + size / 2}" y="${pad + size + 26}" text-anchor="middle" font-family="${MONO}" ` +
      `font-size="12" font-weight="600" fill="${INK}">${escapeXml(name)}</text>`;
    return tile(avatar, x, pad, size) + label;
  });
  return svgRoot(width, height, tileClip(size), cells.join(''));
}

/** The anatomy avatar built up layer by layer; the last frame is the finished avatar. */
function anatomyFrames(): string[] {
  const size = 96;
  const full = generateAvatar(ANATOMY_SEED, { size });
  const root = full.slice(0, full.indexOf('>') + 1);
  const t = getTraits(ANATOMY_SEED);
  const p = PALETTES[t.palette];
  const shape = SHAPES[t.shape];
  const background = `<rect width="64" height="64" fill="${p.bg}"/>` + PATTERNS[t.pattern](p);
  const head = `<g transform="translate(3 3)">${shape(INK)}</g>` + shape(p.body);
  const eyes = EYES[t.eyes](p);
  const mouth = MOUTHS[t.mouth](p);
  const close = (body: string) => `${root}${body}</svg>`;
  // The last frame is generateAvatar itself, which adds the accessory's back and front parts.
  return [close(background), close(background + head), close(background + head + eyes), close(background + head + eyes + mouth), full];
}

export const ANATOMY_STEPS = ['background', 'head', 'eyes', 'mouth', 'accessory'] as const;

export function galleryFiles(): Map<string, string> {
  const files = new Map<string, string>();
  for (const seed of EXAMPLE_SEEDS) files.set(`${seed}.svg`, generateAvatar(seed, { size: 96 }));
  files.set('logo.svg', logo());
  files.set('banner.svg', banner());
  anatomyFrames().forEach((svg, i) => files.set(`anatomy/${i + 1}-${ANATOMY_STEPS[i]}.svg`, svg));
  for (const category of CATEGORIES) files.set(`traits/${category}.svg`, traitStrip(category));
  return files;
}
